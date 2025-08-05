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
import { toast } from 'react-toastify';
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
        
        const chartContainer = chartRef.current;
        if (!chartContainer) {
            toast.error('Chart not found. Please try again.');
            return;
        }

        // Capture the chart with better quality
        const chartCanvas = await html2canvas(chartContainer, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: chartContainer.scrollWidth,
            height: chartContainer.scrollHeight,
            logging: false, // Disable logging
            imageTimeout: 0, // No timeout
        });

        const chartImage = chartCanvas.toDataURL('image/png', 1.0); // Maximum quality

        // Create a new window for printing with enhanced styling
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to print the chart');
            return;
        }

        // Enhanced print content with better styling
        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Unit Value Chart Report - ${new Date().toLocaleDateString()}</title>
            <style>
                @page { size: landscape; margin: 20mm; }
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px;
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 15px;
                }
                .header h1 {
                    color: #1e40af;
                    margin: 0 0 10px 0;
                    font-size: 24px;
                }
                .header p {
                    color: #666;
                    margin: 5px 0;
                    font-size: 14px;
                }
                .meta-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    font-size: 12px;
                    color: #666;
                }
                .summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .summary-card {
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .summary-card h4 {
                    margin: 0 0 10px 0;
                    font-size: 14px;
                    color: #666;
                }
                .summary-card p {
                    margin: 0;
                    font-size: 24px;
                    font-weight: bold;
                    color: #2563eb;
                }
                .chart-container {
                    margin: 30px 0;
                    text-align: center;
                }
                .chart-image {
                    max-width: 100%;
                    height: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 30px;
                    font-size: 12px;
                }
                th {
                    background: #f3f4f6;
                    padding: 12px;
                    text-align: left;
                    font-weight: bold;
                    color: #1e40af;
                    border: 1px solid #e5e7eb;
                }
                td {
                    padding: 10px;
                    border: 1px solid #e5e7eb;
                }
                tr:nth-child(even) {
                    background: #f9fafb;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 20px;
                }
                @media print {
                    .no-print { display: none; }
                    .chart-image { page-break-inside: avoid; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; }
                    thead { display: table-header-group; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${unitCostCategoryFilter !== 'all' 
                    ? `${selectedCategoryValue} - Struct Class Comparison by Year`
                    : 'All Structure Classes - Yearly Unit Cost Comparison'
                }</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Category Filter: ${unitCostCategoryFilter.toUpperCase()}</p>
            </div>

            <div class="meta-info">
                <span>Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                <span>Generated by: ${localStorage.getItem('username') || 'System User'}</span>
            </div>

            <div class="summary">
                <div class="summary-card">
                    <h4>Total Years</h4>
                    <p>${chartData.length}</p>
                </div>
                <div class="summary-card">
                    <h4>Structure Classes</h4>
                    <p>${sortedGroups.length}</p>
                </div>
                <div class="summary-card">
                    <h4>Total Records</h4>
                    <p>${unitCostCategoryFilter !== 'all' && selectedCategoryValue
                        ? apiData.filter((item: any) => item.category === selectedCategoryValue).length
                        : apiData.length
                    }</p>
                </div>
            </div>

            <div class="chart-container">
                <img src="${chartImage}" alt="Unit Value Chart" class="chart-image" />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Year</th>
                        ${sortedGroups.map(group => `
                            <th>${group}${showPercentage ? ' (%)' : ''}</th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${chartData.map(yearData => `
                        <tr>
                            <td><strong>${yearData.year}</strong></td>
                            ${sortedGroups.map(group => `
                                <td>${showPercentage 
                                    ? `${(yearData[`${group}_increase`] || 0).toFixed(2)}%`
                                    : `₱${(yearData[group as string] || 0).toLocaleString()}`
                                }</td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                <p>This report is system generated by PASSO System</p>
                <p>© ${new Date().getFullYear()} All Rights Reserved</p>
            </div>
        </body>
        </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Error generating PDF. Please try again.');
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
    if (unitCostCategoryFilter === 'all') {
      // Define the category order exactly as shown in data
      const categoryOrder = {
        // Roman numerals (Building) first
        'I': 1,
        'II-A': 2,
        'II-B': 3,
        'III-A': 4,
        'III-B': 5,
        'IV-A': 6,
        'IV-B': 7,
        'V-A': 8,
        'V-B': 9,
        // Industrial next
        'I-1': 10,
        'I-2': 11,
        'I-3': 12,
        'I-4': 13,
        // Commercial next
        'C-1': 14,
        'C-2': 15,
        'C-3': 16,
        'C-4': 17,
        // Residential last
        'R-1': 18,
        'R-2': 19,
        'R-3': 20,
        'R-4': 21
      };

      // Direct comparison using the categoryOrder object
      const orderA = categoryOrder[a as keyof typeof categoryOrder] || 999;
      const orderB = categoryOrder[b as keyof typeof categoryOrder] || 999;
      return orderA - orderB;
    } else {
      // For specific categories, keep existing sort logic
      if (sortBy === 'name') {
        return (a as string).localeCompare(b as string);
      } else {
        const aAvg = chartData.reduce((sum, yearData) => sum + (yearData[a as string] || 0), 0) / chartData.length;
        const bAvg = chartData.reduce((sum, yearData) => sum + (yearData[b as string] || 0), 0) / chartData.length;
        return bAvg - aAvg;
      }
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
                <ComposedChart 
                  data={chartData}
                  // Reduce the gaps slightly
                  barGap={4}                  // Smaller gap between bars in the same year group
                  barCategoryGap={30}         // Smaller gap between different year groups
                  barSize={unitCostCategoryFilter === 'all' ? 12 : 25}
                >
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
                    // Calculate max value and add 10% padding
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                    // Add a specific height range
                    height={300}
                    // Format the ticks to show proper values
                    tickFormatter={(value) => showPercentage ? `${value}%` : `₱${value.toLocaleString()}`}
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
                    // Custom color palette with lighter, vibrant colors
                    const colors = [
                      '#60A5FA', // Light Blue
                      '#34D399', // Light Green
                      '#F87171', // Light Red
                      '#818CF8', // Light Indigo
                      '#FCD34D', // Light Yellow
                      '#F472B6', // Light Pink
                      '#A78BFA', // Light Purple
                      '#2DD4BF', // Light Teal
                      '#FB923C', // Light Orange
                      '#38BDF8', // Sky Blue
                      '#4ADE80', // Emerald
                      '#C084FC', // Light Violet
                      '#FB7185', // Light Rose
                      '#FBBF24', // Light Amber
                      '#67E8F9', // Cyan
                      '#94A3B8', // Light Slate
                      '#A5B4FC', // Lighter Indigo
                      '#86EFAC', // Lighter Green
                      '#FCA5A5', // Lighter Red
                      '#E879F9'  // Light Fuchsia
                    ];
                    const color = colors[index % colors.length];
                    
                    if (chartType === 'bar') {
                      return (
                        <Bar 
                          key={group as string}
                          dataKey={dataKey}
                          fill={color}
                          name={name}
                          radius={[4, 4, 0, 0]}
                          style={{ outline: 'none' }}
                          maxBarSize={unitCostCategoryFilter === 'all' ? 12 : 25}
                        >
                          <LabelList 
                            dataKey={dataKey}
                            position="top"
                            formatter={(value: any) => {
                              return group as string;
                            }}
                            style={{ 
                              fontSize: unitCostCategoryFilter === 'all' ? '9px' : '12px',
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