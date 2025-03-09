import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PortfolioData, TimePeriod, Benchmark, Asset, AssetClass } from '../types';
import { filterPortfolioDataByTimePeriod } from '../utils/portfolioUtils';
import { calculatePortfolioReturns } from '../utils/performanceCalculations';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js components
Chart.register(...registerables, annotationPlugin);

// Define data category types
type DataCategory = 'Benchmarks' | 'Asset Classes' | 'Individual Assets';

interface SimpleTimeSeriesViewProps {
  portfolioData: PortfolioData;
  selectedTimePeriod: TimePeriod;
  selectedBenchmark: Benchmark;
}

const SimpleTimeSeriesView: React.FC<SimpleTimeSeriesViewProps> = ({
  portfolioData,
  selectedTimePeriod,
  selectedBenchmark
}) => {
  const chartRef = useRef<Chart | null>(null);
  const [dataCategory, setDataCategory] = useState<DataCategory>('Benchmarks');
  const [selectedSeries, setSelectedSeries] = useState<Record<string, boolean>>({
    'Portfolio': true,
    [selectedBenchmark]: true
  });
  
  // Update selected series when benchmark changes
  useEffect(() => {
    if (dataCategory === 'Benchmarks') {
      setSelectedSeries(prev => ({
        'Portfolio': prev['Portfolio'] || true,
        'Market': selectedBenchmark === 'Market',
        'S&P500': selectedBenchmark === 'S&P500',
        'MSCI World': selectedBenchmark === 'MSCI World'
      }));
    }
  }, [selectedBenchmark, dataCategory]);
  
  // Get all asset classes
  const getAssetClasses = (): AssetClass[] => {
    if (!portfolioData || !portfolioData.wholePortfolio) return [];
    
    const result: AssetClass[] = [];
    const queue: AssetClass[] = [portfolioData.wholePortfolio];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.id !== 'wholePortfolio') {
        result.push(current);
      }
      
      for (const child of current.children) {
        if ('children' in child) {
          queue.push(child as AssetClass);
        }
      }
    }
    
    return result;
  };
  
  // Get all individual assets
  const getIndividualAssets = (): Asset[] => {
    if (!portfolioData || !portfolioData.wholePortfolio) return [];
    
    const result: Asset[] = [];
    const queue: (AssetClass | Asset)[] = [portfolioData.wholePortfolio];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if ('children' in current) {
        for (const child of current.children) {
          queue.push(child);
        }
      } else {
        result.push(current as Asset);
      }
    }
    
    return result;
  };
  
  // Initialize selected series based on data category
  useEffect(() => {
    let newSelectedSeries: Record<string, boolean> = {};
    
    switch (dataCategory) {
      case 'Benchmarks':
        newSelectedSeries = {
          'Portfolio': true,
          'Market': selectedBenchmark === 'Market',
          'S&P500': selectedBenchmark === 'S&P500',
          'MSCI World': selectedBenchmark === 'MSCI World'
        };
        break;
        
      case 'Asset Classes':
        const assetClasses = getAssetClasses();
        newSelectedSeries = { 'Portfolio': true };
        // Select the first 4 asset classes by default (to avoid too many series)
        assetClasses.slice(0, 4).forEach(ac => {
          newSelectedSeries[ac.name] = true;
        });
        break;
        
      case 'Individual Assets':
        const assets = getIndividualAssets();
        newSelectedSeries = { 'Portfolio': true };
        // Select the first 4 assets by default (to avoid too many series)
        assets.slice(0, 4).forEach(asset => {
          newSelectedSeries[asset.name] = true;
        });
        break;
    }
    
    setSelectedSeries(newSelectedSeries);
  }, [dataCategory, portfolioData, selectedBenchmark]);
  
  useEffect(() => {
    // Clean up chart on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);
  
  // Toggle a series on/off
  const toggleSeries = (seriesName: string) => {
    setSelectedSeries(prev => ({
      ...prev,
      [seriesName]: !prev[seriesName]
    }));
  };
  
  // Get series data for the selected category
  const getSeriesData = () => {
    if (!portfolioData || !portfolioData.wholePortfolio) {
      return [];
    }
    
    // Filter portfolio data by time period
    const filteredData = filterPortfolioDataByTimePeriod(portfolioData, selectedTimePeriod);
    
    // Calculate portfolio returns
    const portfolioReturns = calculatePortfolioReturns(filteredData);
    
    // Convert portfolio returns to cumulative returns
    const portfolioCumulative = portfolioReturns.reduce((acc, ret, i) => {
      if (i === 0) {
        acc.push(100 * (1 + ret));
      } else {
        acc.push(acc[i - 1] * (1 + ret));
      }
      return acc;
    }, [] as number[]);
    
    const datasets = [];
    
    // Add portfolio dataset if selected
    if (selectedSeries['Portfolio']) {
      datasets.push({
        label: 'Portfolio',
        data: portfolioCumulative,
        borderColor: '#4299E1',
        backgroundColor: 'rgba(66, 153, 225, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      });
    }
    
    switch (dataCategory) {
      case 'Benchmarks':
        // Add benchmark datasets
        const benchmarks: Benchmark[] = ['Market', 'S&P500', 'MSCI World'];
        const benchmarkColors = {
          'Market': '#F6AD55',
          'S&P500': '#48BB78',
          'MSCI World': '#9F7AEA'
        };
        
        benchmarks.forEach(benchmark => {
          if (selectedSeries[benchmark]) {
            const benchmarkReturns = filteredData.benchmarks[benchmark]?.returns || [];
            const benchmarkCumulative = benchmarkReturns.reduce((acc, ret, i) => {
              if (i === 0) {
                acc.push(100 * (1 + ret));
              } else {
                acc.push(acc[i - 1] * (1 + ret));
              }
              return acc;
            }, [] as number[]);
            
            datasets.push({
              label: benchmark,
              data: benchmarkCumulative,
              borderColor: benchmarkColors[benchmark],
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderWidth: 2,
              fill: false,
              tension: 0.1
            });
          }
        });
        break;
        
      case 'Asset Classes':
        // Add asset class datasets
        const assetClasses = getAssetClasses();
        const assetClassColors = [
          '#F6AD55', '#48BB78', '#9F7AEA', '#F56565', 
          '#ED8936', '#38B2AC', '#667EEA', '#FC8181'
        ];
        
        assetClasses.forEach((assetClass, index) => {
          if (selectedSeries[assetClass.name]) {
            // For simplicity, we'll use the portfolio returns scaled by a factor
            // In a real app, you would calculate actual returns for each asset class
            const scaleFactor = 0.8 + (index * 0.1);
            const assetClassCumulative = portfolioReturns.map((ret, i) => {
              const adjustedReturn = ret * scaleFactor;
              if (i === 0) {
                return 100 * (1 + adjustedReturn);
              } else {
                return portfolioCumulative[i - 1] * (1 + adjustedReturn) / (1 + portfolioReturns[i - 1]);
              }
            });
            
            datasets.push({
              label: assetClass.name,
              data: assetClassCumulative,
              borderColor: assetClassColors[index % assetClassColors.length],
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderWidth: 2,
              fill: false,
              tension: 0.1
            });
          }
        });
        break;
        
      case 'Individual Assets':
        // Add individual asset datasets
        const assets = getIndividualAssets();
        const assetColors = [
          '#F6AD55', '#48BB78', '#9F7AEA', '#F56565', 
          '#ED8936', '#38B2AC', '#667EEA', '#FC8181',
          '#F6E05E', '#68D391', '#B794F4', '#FC8181'
        ];
        
        assets.forEach((asset, index) => {
          if (selectedSeries[asset.name]) {
            // For simplicity, we'll use the portfolio returns scaled by a factor
            // In a real app, you would use actual returns for each asset
            const scaleFactor = 0.7 + (index * 0.05);
            const assetCumulative = portfolioReturns.map((ret, i) => {
              const adjustedReturn = ret * scaleFactor;
              if (i === 0) {
                return 100 * (1 + adjustedReturn);
              } else {
                return portfolioCumulative[i - 1] * (1 + adjustedReturn) / (1 + portfolioReturns[i - 1]);
              }
            });
            
            datasets.push({
              label: asset.name,
              data: assetCumulative,
              borderColor: assetColors[index % assetColors.length],
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderWidth: 2,
              fill: false,
              tension: 0.1
            });
          }
        });
        break;
    }
    
    return datasets;
  };
  
  // Prepare data for the chart
  const prepareChartData = () => {
    if (!portfolioData || !portfolioData.wholePortfolio) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    try {
      // Filter portfolio data by time period
      const filteredData = filterPortfolioDataByTimePeriod(portfolioData, selectedTimePeriod);
      
      // Generate labels (dates)
      const endDate = filteredData.timeframe.endDate;
      const months = filteredData.benchmarks[selectedBenchmark]?.returns.length || 0;
      const labels = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      }
      
      // Get datasets based on selected category and series
      const datasets = getSeriesData();
      
      return {
        labels,
        datasets
      };
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return {
        labels: [],
        datasets: []
      };
    }
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the legend since we're using custom buttons
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toFixed(2)}`;
          }
        }
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line' as const,
            yMin: 100,
            yMax: 100,
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1,
            borderDash: [5, 5]
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Cumulative Return'
        },
        ticks: {
          callback: (value: number) => `${value.toFixed(0)}`
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    }
  };
  
  // Render series toggle buttons based on data category
  const renderSeriesButtons = () => {
    switch (dataCategory) {
      case 'Benchmarks':
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              className={`px-2 py-1 text-xs rounded-full ${selectedSeries['Portfolio'] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => toggleSeries('Portfolio')}
            >
              Portfolio
            </button>
            <button
              className={`px-2 py-1 text-xs rounded-full ${selectedSeries['Market'] ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => toggleSeries('Market')}
            >
              Market
            </button>
            <button
              className={`px-2 py-1 text-xs rounded-full ${selectedSeries['S&P500'] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => toggleSeries('S&P500')}
            >
              S&P 500
            </button>
            <button
              className={`px-2 py-1 text-xs rounded-full ${selectedSeries['MSCI World'] ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => toggleSeries('MSCI World')}
            >
              MSCI World
            </button>
          </div>
        );
        
      case 'Asset Classes':
        const assetClasses = getAssetClasses();
        const assetClassColors = [
          'bg-orange-400', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
          'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-400'
        ];
        
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              className={`px-2 py-1 text-xs rounded-full ${selectedSeries['Portfolio'] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => toggleSeries('Portfolio')}
            >
              Portfolio
            </button>
            {assetClasses.map((assetClass, index) => (
              <button
                key={assetClass.id}
                className={`px-2 py-1 text-xs rounded-full ${selectedSeries[assetClass.name] ? assetClassColors[index % assetClassColors.length] + ' text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => toggleSeries(assetClass.name)}
              >
                {assetClass.name}
              </button>
            ))}
          </div>
        );
        
      case 'Individual Assets':
        const assets = getIndividualAssets();
        const assetColors = [
          'bg-orange-400', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
          'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-400',
          'bg-yellow-400', 'bg-green-400', 'bg-purple-400', 'bg-red-400'
        ];
        
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              className={`px-2 py-1 text-xs rounded-full ${selectedSeries['Portfolio'] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => toggleSeries('Portfolio')}
            >
              Portfolio
            </button>
            {assets.map((asset, index) => (
              <button
                key={asset.id}
                className={`px-2 py-1 text-xs rounded-full ${selectedSeries[asset.name] ? assetColors[index % assetColors.length] + ' text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => toggleSeries(asset.name)}
              >
                {asset.name}
              </button>
            ))}
          </div>
        );
    }
  };
  
  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Time Series (10 Year)</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Category</label>
          <select
            value={dataCategory}
            onChange={(e) => setDataCategory(e.target.value as DataCategory)}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Benchmarks">Benchmarks</option>
            <option value="Asset Classes">Asset Classes</option>
            <option value="Individual Assets">Individual Assets</option>
          </select>
        </div>
        {renderSeriesButtons()}
      </div>
      
      <div className="h-[400px]">
        <Line
          data={prepareChartData()}
          options={options}
          ref={(ref) => {
            if (ref) {
              chartRef.current = ref.chartInstance;
            }
          }}
        />
      </div>
    </div>
  );
};

export default SimpleTimeSeriesView;