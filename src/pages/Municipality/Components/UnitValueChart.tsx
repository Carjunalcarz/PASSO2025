    

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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
  ResponsiveContainer
} from 'recharts';
import UnitCostCategoryFilter from './UnitCostCategoryFilter';

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
  
  // If category is selected, group by struct_class_type, otherwise by category
  const groupBy = selectedCategory && selectedCategory !== 'all' ? 'struct_class_type' : 'category';
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
    return yearData;
  });
};

function UnitValueChart({ unitCostCategoryFilter }: UnitValueChartProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [showPercentage, setShowPercentage] = useState(false);
  const token = localStorage.getItem('token');
  
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

  // Get all available categories
  const allCategories = [...new Set(apiData.map((item: any) => item.category))];
  
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
    : [];

  const chartData = processChartData(apiData, unitCostCategoryFilter);
  const groups = unitCostCategoryFilter !== 'all' ? structClassTypes : allCategories;

  return (
    <div className="panel md:w-[920px] xl:w-full">
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-black rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {unitCostCategoryFilter !== 'all' 
                ? `${selectedCategoryValue} - Struct Class Comparison by Year`
                : 'Yearly Unit Cost Comparison'
              }
            </h3>
            <div className="flex gap-2">
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
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPercentage}
                onChange={(e) => setShowPercentage(e.target.checked)}
                className="form-checkbox"
              />
              <span className="text-sm font-medium">Show Percentage Increase</span>
            </label>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Years</h4>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{chartData.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                {unitCostCategoryFilter !== 'all' ? 'Struct Classes' : 'Categories'}
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
            <div className="mb-6">
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
                  />
                  <Legend />
                  {groups.map((group, index) => (
                    <Bar 
                      key={group as string}
                      dataKey={showPercentage ? `${group as string}_increase` : group as string} 
                      fill={`hsl(${index * 60}, 70%, 50%)`}
                      name={showPercentage ? `${group as string} (%)` : group as string}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
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
                    {groups.map(group => (
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
                      {groups.map(group => {
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