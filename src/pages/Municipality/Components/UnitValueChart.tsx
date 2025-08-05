    

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface UnitValueChartProps {
  unitCostCategoryFilter: string;
}

// Function to calculate percentage increase
const calculatePercentageIncrease = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

// Function to process API data for chart
const processChartData = (apiData: any, selectedCategory?: string) => {
  let filteredData = apiData;
  
  // Filter by category if selected
  if (selectedCategory && selectedCategory !== 'all') {
    const categoryMap: { [key: string]: string } = {
      'residential': 'Residential',
      'commercial': 'Commercial',
      'industrial': 'Industrial',
      'building': 'Building',
    };
    
    const categoryValue = categoryMap[selectedCategory];
    if (categoryValue) {
      filteredData = apiData.filter((item: any) => item.category === categoryValue);
    }
  }
  
  const years = [...new Set(filteredData.map((item: any) => item.smv_year))].sort();
  
  // When "all" is selected, group by struct_class_type to show all structure classes
  // When a specific category is selected, also group by struct_class_type
  const groupBy = 'struct_class_type';
  const groups = [...new Set(filteredData.map((item: any) => item[groupBy]))];
  
  return years.map((year, index) => {
    const yearData: any = { year };
    groups.forEach(group => {
      const groupData = filteredData.find((item: any) => 
        item.smv_year === year && item[groupBy] === group
      );
      yearData[group as string] = groupData ? groupData.unit_cost : 0;
      
      // Calculate percentage increase from previous year
      if (index > 0) {
        const previousYear = years[index - 1];
        const previousGroupData = filteredData.find((item: any) => 
          item.smv_year === previousYear && item[groupBy] === group
        );
        const previousValue = previousGroupData ? previousGroupData.unit_cost : 0;
        const currentValue = groupData ? groupData.unit_cost : 0;
        yearData[`${group as string}_increase`] = calculatePercentageIncrease(currentValue, previousValue);
      } else {
        yearData[`${group as string}_increase`] = 0;
      }
    });
    
    // Calculate average percentage increase when "all" is selected
    if (selectedCategory === 'all') {
      const increases = groups.map(group => yearData[`${group as string}_increase`]).filter(val => val !== 0);
      yearData['average_increase'] = increases.length > 0 ? increases.reduce((sum, val) => sum + val, 0) / increases.length : 0;
    }
    
    return yearData;
  });
};

function UnitValueChart({ unitCostCategoryFilter }: UnitValueChartProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [showPercentage, setShowPercentage] = useState(false);
  const [showAverage, setShowAverage] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [sortBy, setSortBy] = useState<'name' | 'value'>('name');
  const chartRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');
  
  // Print to PDF function with chart capture
  const printToPDF = async () => {
    try {
      // Wait for chart to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the chart container
      const chartContainer = chartRef.current;
      if (!chartContainer) {
        alert('Chart not found. Please try again.');
        return;
      }

      // Capture the entire chart container as image
      const chartCanvas = await html2canvas(chartContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: chartContainer.scrollWidth,
        height: chartContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      const chartImage = chartCanvas.toDataURL('image/png');

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print the chart');
        return;
      }

      // Create the content for the new window
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unit Value Chart Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-card { padding: 15px; border-radius: 8px; text-align: center; }
            .summary-card h4 { margin: 0 0 5px 0; font-size: 14px; }
            .summary-card p { margin: 0; font-size: 24px; font-weight: bold; }
            .blue { background: #dbeafe; color: #1e40af; }
            .green { background: #dcfce7; color: #166534; }
            .purple { background: #f3e8ff; color: #7c3aed; }
            .chart-container { margin-top: 30px; text-align: center; }
            .chart-image { max-width: 100%; height: auto; border: 1px solid #ddd; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; font-weight: bold; }
            tr:nth-child(even) { background: #f9fafb; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .chart-image { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${unitCostCategoryFilter !== 'all' 
              ? `${selectedCategoryValue} - Struct Class Comparison by Year`
              : 'All Structure Classes - Yearly Unit Cost Comparison'
            }</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} | Filter: ${unitCostCategoryFilter.toUpperCase()}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card blue">
              <h4>Total Years</h4>
              <p>${chartData.length}</p>
            </div>
            <div class="summary-card green">
              <h4>Structure Classes</h4>
              <p>${sortedGroups.length}</p>
            </div>
            <div class="summary-card purple">
              <h4>Total Records</h4>
              <p>${unitCostCategoryFilter !== 'all' && selectedCategoryValue
                ? apiData.filter((item: any) => item.category === selectedCategoryValue).length
                : apiData.length
              }</p>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>Chart Visualization</h3>
            <img src="${chartImage}" alt="Unit Value Chart" class="chart-image" />
          </div>
          
          <div style="margin-top: 30px;">
            <h3>Detailed Data Table</h3>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  ${sortedGroups.map(group => `<th>${group}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${chartData.map((yearData, index) => `
                  <tr>
                    <td><strong>${yearData.year}</strong></td>
                    ${sortedGroups.map(group => 
                      `<td>₱${(yearData[group as string] || 0).toLocaleString()}</td>`
                    ).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Report
            </button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Generate Excel report
  const generateReport = () => {
    // Create Excel-like CSV content
    const csvContent = [
      // Header row
      ['Unit Value Chart Report'],
      [''],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [`Filter: ${unitCostCategoryFilter.toUpperCase()}`],
      [''],
      // Summary section
      ['Summary Statistics'],
      ['Total Years', chartData.length],
      ['Total Structure Classes', sortedGroups.length],
      ['Total Records', unitCostCategoryFilter !== 'all' && selectedCategoryValue
        ? apiData.filter((item: any) => item.category === selectedCategoryValue).length
        : apiData.length
      ],
      [''],
      // Chart data section
      ['Chart Data'],
      ['Year', ...sortedGroups.map(group => group as string)],
      // Data rows
      ...chartData.map(yearData => [
        yearData.year,
        ...sortedGroups.map(group => yearData[group as string] || 0)
      ]),
      [''],
      // Additional statistics
      ['Statistics'],
      ['Highest Value', Math.max(...chartData.flatMap(yearData => 
        sortedGroups.map(group => yearData[group as string] || 0)
      ))],
      ['Lowest Value', Math.min(...chartData.flatMap(yearData => 
        sortedGroups.map(group => yearData[group as string] || 0)
      ))],
      ['Average Value', (chartData.reduce((sum, yearData) => 
        sum + sortedGroups.reduce((yearSum, group) => 
          yearSum + (yearData[group as string] || 0), 0
        ), 0
      ) / (chartData.length * sortedGroups.length)).toFixed(2)]
    ].map(row => row.join(',')).join('\n');

    // Create and download Excel file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unit-cost-report-${unitCostCategoryFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Use the same data fetching logic as in unit_value.tsx
  const fetchUnitValue = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/unit-costs?skip=0&limit=300000`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  };

  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['unit_value', 'unit_value'],
    queryFn: fetchUnitValue,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!apiData || apiData.length === 0) return <div>No data available</div>;

  // Get all available struct_class_types (for both "all" and specific categories)
  const allStructClassTypes = [...new Set(apiData.map((item: any) => item.struct_class_type))];
  
  // Get struct_class_types for selected category
  const categoryMap: { [key: string]: string } = {
    'residential': 'Residential',
    'commercial': 'Commercial',
    'industrial': 'Industrial',
    'building': 'Building',
  };
  
  const selectedCategoryValue = categoryMap[unitCostCategoryFilter];
  const structClassTypes = selectedCategoryValue 
    ? [...new Set(apiData.filter((item: any) => item.category === selectedCategoryValue).map((item: any) => item.struct_class_type))]
    : allStructClassTypes; // Use all struct class types when "all" is selected

  const chartData = processChartData(apiData, unitCostCategoryFilter);
  const groups = structClassTypes; // Always use struct class types

  // Sort groups based on current sort criteria
  const sortedGroups = [...groups].sort((a, b) => {
    if (sortBy === 'name') {
      return (a as string).localeCompare(b as string);
    } else {
      // Sort by average value across all years
      const aAvg = chartData.reduce((sum, yearData) => sum + (yearData[a as string] || 0), 0) / chartData.length;
      const bAvg = chartData.reduce((sum, yearData) => sum + (yearData[b as string] || 0), 0) / chartData.length;
      return bAvg - aAvg; // Descending order
    }
  });

  return (
    <div className="panel md:w-[920px] xl:w-full">
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-black rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {unitCostCategoryFilter !== 'all' 
                ? `${selectedCategoryValue} - Struct Class Comparison by Year`
                : 'All Structure Classes - Yearly Unit Cost Comparison'
              }
            </h3>
            <div className="flex gap-2">
              <button
                onClick={generateReport}
                className="px-3 py-1 rounded text-sm bg-purple-500 text-white hover:bg-purple-600 transition-colors cursor-pointer"
              >
                Generate Report
              </button>
              <button
                onClick={printToPDF}
                className="px-3 py-1 rounded text-sm bg-green-500 text-white hover:bg-green-600 transition-colors cursor-pointer"
              >
                Export PDF
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'chart' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Chart
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'table' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Table
              </button>
            </div>
          </div>

          {/* Toggle for Percentage View */}
          <div className="mb-4 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPercentage}
                onChange={(e) => setShowPercentage(e.target.checked)}
                className="form-checkbox"
              />
              <span className="text-sm font-medium">Show Percentage Increase</span>
            </label>
            
            {/* Show Average toggle only when "all" is selected */}
            {unitCostCategoryFilter === 'all' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAverage}
                  onChange={(e) => setShowAverage(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm font-medium">Show Average % Increase</span>
              </label>
            )}

            {/* Chart Type Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Chart Type:</span>
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    chartType === 'bar' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    chartType === 'line' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Line
                </button>
              </div>
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort By:</span>
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    sortBy === 'name' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy('value')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    sortBy === 'value' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Value
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Years</h4>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{chartData.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                Structure Classes
              </h4>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{groups.length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Records</h4>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {unitCostCategoryFilter !== 'all' && selectedCategoryValue
                  ? apiData.filter((item: any) => item.category === selectedCategoryValue).length
                  : apiData.length
                }
              </p>
            </div>
          </div>

          {/* Chart View */}
          {viewMode === 'chart' && (
            <div className="mb-6" ref={chartRef}>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ed" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e6ed' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e6ed' }}
                    label={{ 
                      value: showPercentage ? 'Percentage Increase (%)' : 'Unit Cost (₱)', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => {
                      if (showPercentage) {
                        return [`${value.toFixed(2)}%`, name.replace('_increase', '')];
                      }
                      return [`₱${value.toLocaleString()}`, name];
                    }}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{
                      outline: 'none',
                      border: 'none'
                    }}
                  />
                  <Legend />
                  
                  {/* Show average line when "all" is selected and showAverage is true */}s
                  {unitCostCategoryFilter === 'all' && showAverage && showPercentage && (
                    <Line 
                      type="monotone"
                      dataKey="average_increase"
                      stroke="#ff6b6b"
                      strokeWidth={3}
                      name="Average % Increase"
                      dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
                    />
                  )}
                  
                  {/* Show individual categories or struct classes */}
                  {(!showAverage || unitCostCategoryFilter !== 'all') && sortedGroups.map((group, index) => {
                    const dataKey = showPercentage ? `${group as string}_increase` : group as string;
                    const name = showPercentage ? `${group as string} (%)` : group as string;
                    const color = `hsl(${index * 60}, 70%, 50%)`;
                    
                    if (chartType === 'bar') {
                      return (
                        <Bar 
                          key={group as string}
                          dataKey={dataKey}
                          fill={color}
                          name={name}
                          radius={[4, 4, 0, 0]}
                          style={{ outline: 'none' }}
                        >
                          <LabelList 
                            dataKey={dataKey}
                            position="top" 
                            formatter={(value: any) => {
                              return group as string;
                            }}
                            style={{ 
                              fontSize: unitCostCategoryFilter === 'all' ? '10px' : '14px', 
                              fontWeight: 'bold',
                              fill: '#333',
                              outline: 'none'
                            }}
                          />
                        </Bar>
                      );
                    } else {
                      return (
                        <Line 
                          key={group as string}
                          type="monotone"
                          dataKey={dataKey}
                          stroke={color}
                          strokeWidth={2}
                          name={name}
                          dot={{ fill: color, strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      );
                    }
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Year</th>
                    {unitCostCategoryFilter === 'all' && showAverage && showPercentage && (
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Average % Increase
                      </th>
                    )}
                    {(!showAverage || unitCostCategoryFilter !== 'all') && sortedGroups.map(group => (
                      <th key={group as string} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        {group as string}
                        {showPercentage && <br />}
                        {showPercentage && <span className="text-xs text-gray-500">(% Increase)</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((yearData, index) => (
                    <tr key={yearData.year} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                        {yearData.year}
                      </td>
                      
                      {/* Show average column when "all" is selected */}
                      {unitCostCategoryFilter === 'all' && showAverage && showPercentage && (
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-semibold text-red-600">
                          {yearData.average_increase ? `${yearData.average_increase.toFixed(2)}%` : '-'}
                        </td>
                      )}
                      
                      {/* Show individual categories or struct classes */}
                      {(!showAverage || unitCostCategoryFilter !== 'all') && sortedGroups.map(group => {
                        const value = showPercentage 
                          ? yearData[`${group as string}_increase`] 
                          : yearData[group as string];
                        
                        return (
                          <td key={group as string} className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {showPercentage 
                              ? `${value ? value.toFixed(2) : '0'}%`
                              : value ? `₱${value.toLocaleString()}` : '-'
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnitValueChart;