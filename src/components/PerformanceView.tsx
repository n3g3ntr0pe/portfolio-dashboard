import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PortfolioData, TimePeriod, Benchmark } from '../types';
import { filterPortfolioDataByTimePeriod } from '../utils/portfolioUtils';
import { calculatePortfolioReturns, calculateCumulativeReturn, calculateAnnualizedReturn } from '../utils/performanceCalculations';
import { calculateSharpeRatio, calculateInformationRatio, calculateAlpha, calculateBeta } from '../utils/riskCalculations';

// Register Chart.js components
Chart.register(...registerables);

interface PerformanceViewProps {
  portfolioData: PortfolioData;
  selectedTimePeriod: TimePeriod;
  selectedBenchmark: Benchmark;
  onTimePeriodChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBenchmarkChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const PerformanceView: React.FC<PerformanceViewProps> = ({
  portfolioData,
  selectedTimePeriod,
  selectedBenchmark,
  onTimePeriodChange,
  onBenchmarkChange
}) => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    absoluteReturn: 0,
    annualizedReturn: 0,
    benchmarkReturn: 0,
    excessReturn: 0,
    sharpeRatio: 0,
    informationRatio: 0,
    alpha: 0,
    beta: 0
  });
  
  // Calculate performance metrics
  useEffect(() => {
    if (!portfolioData || !portfolioData.wholePortfolio) {
      return;
    }
    
    try {
      // Filter portfolio data by time period
      const filteredData = filterPortfolioDataByTimePeriod(portfolioData, selectedTimePeriod);
      
      // Calculate portfolio returns
      const portfolioReturns = calculatePortfolioReturns(filteredData);
      
      // Get benchmark returns
      const benchmarkReturns = filteredData.benchmarks[selectedBenchmark]?.returns || [];
      
      // Calculate performance metrics
      const absoluteReturn = calculateCumulativeReturn(portfolioReturns);
      const annualizedReturn = calculateAnnualizedReturn(portfolioReturns);
      const benchmarkReturn = calculateCumulativeReturn(benchmarkReturns);
      const excessReturn = absoluteReturn - benchmarkReturn;
      const sharpeRatio = calculateSharpeRatio(portfolioReturns, 0.001); // Assuming 0.1% risk-free rate
      const informationRatio = calculateInformationRatio(portfolioReturns, benchmarkReturns);
      const alpha = calculateAlpha(portfolioReturns, benchmarkReturns, 0.001);
      const beta = calculateBeta(portfolioReturns, benchmarkReturns);
      
      setPerformanceMetrics({
        absoluteReturn,
        annualizedReturn,
        benchmarkReturn,
        excessReturn,
        sharpeRatio,
        informationRatio,
        alpha,
        beta
      });
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
    }
  }, [portfolioData, selectedTimePeriod, selectedBenchmark]);
  
  // Prepare data for the chart
  const chartData = {
    labels: ['Portfolio', selectedBenchmark, 'Excess'],
    datasets: [
      {
        label: 'Returns',
        data: [
          performanceMetrics.absoluteReturn * 100,
          performanceMetrics.benchmarkReturn * 100,
          performanceMetrics.excessReturn * 100
        ],
        backgroundColor: [
          'rgba(66, 153, 225, 0.6)',
          'rgba(246, 173, 85, 0.6)',
          performanceMetrics.excessReturn >= 0 ? 'rgba(72, 187, 120, 0.6)' : 'rgba(245, 101, 101, 0.6)'
        ],
        borderColor: [
          'rgba(66, 153, 225, 1)',
          'rgba(246, 173, 85, 1)',
          performanceMetrics.excessReturn >= 0 ? 'rgba(72, 187, 120, 1)' : 'rgba(245, 101, 101, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `${context.label}: ${value.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Return (%)'
        },
        ticks: {
          callback: (value: number) => `${value.toFixed(1)}%`
        }
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
          <select 
            value={selectedTimePeriod} 
            onChange={onTimePeriodChange}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
            <option value="3Y">3 Years</option>
            <option value="5Y">5 Years</option>
            <option value="10Y">10 Years</option>
            <option value="YTD">Year to Date</option>
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Benchmark</label>
          <select 
            value={selectedBenchmark} 
            onChange={onBenchmarkChange}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Market">Market</option>
            <option value="S&P500">S&P 500</option>
            <option value="MSCI World">MSCI World</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-[200px]">
          <Bar data={chartData} options={options} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Absolute Return</h3>
            <p className="text-xl font-semibold text-gray-900">{(performanceMetrics.absoluteReturn * 100).toFixed(2)}%</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Annualized Return</h3>
            <p className="text-xl font-semibold text-gray-900">{(performanceMetrics.annualizedReturn * 100).toFixed(2)}%</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Sharpe Ratio</h3>
            <p className="text-xl font-semibold text-gray-900">{performanceMetrics.sharpeRatio.toFixed(2)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Information Ratio</h3>
            <p className="text-xl font-semibold text-gray-900">{performanceMetrics.informationRatio.toFixed(2)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Alpha</h3>
            <p className="text-xl font-semibold text-gray-900">{(performanceMetrics.alpha * 100).toFixed(2)}%</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Beta</h3>
            <p className="text-xl font-semibold text-gray-900">{performanceMetrics.beta.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;