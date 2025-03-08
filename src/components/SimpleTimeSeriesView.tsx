import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PortfolioData, TimePeriod, Benchmark } from '../types';
import { filterPortfolioDataByTimePeriod } from '../utils/portfolioUtils';
import { calculatePortfolioReturns } from '../utils/performanceCalculations';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js components
Chart.register(...registerables, annotationPlugin);

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
  
  useEffect(() => {
    // Clean up chart on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);
  
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
      
      // Calculate portfolio returns
      const portfolioReturns = calculatePortfolioReturns(filteredData);
      
      // Get benchmark returns
      const benchmarkReturns = filteredData.benchmarks[selectedBenchmark]?.returns || [];
      
      // Convert returns to cumulative returns
      const portfolioCumulative = portfolioReturns.reduce((acc, ret, i) => {
        if (i === 0) {
          acc.push(1 + ret);
        } else {
          acc.push(acc[i - 1] * (1 + ret));
        }
        return acc;
      }, [] as number[]);
      
      const benchmarkCumulative = benchmarkReturns.reduce((acc, ret, i) => {
        if (i === 0) {
          acc.push(1 + ret);
        } else {
          acc.push(acc[i - 1] * (1 + ret));
        }
        return acc;
      }, [] as number[]);
      
      // Generate labels (dates)
      const endDate = filteredData.timeframe.endDate;
      const labels = [];
      
      for (let i = portfolioCumulative.length - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      }
      
      // Create datasets
      return {
        labels,
        datasets: [
          {
            label: 'Portfolio',
            data: portfolioCumulative,
            borderColor: '#4299E1',
            backgroundColor: 'rgba(66, 153, 225, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1
          },
          {
            label: selectedBenchmark,
            data: benchmarkCumulative,
            borderColor: '#F6AD55',
            backgroundColor: 'rgba(246, 173, 85, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1
          }
        ]
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
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${(value * 100).toFixed(2)}%`;
          }
        }
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line' as const,
            yMin: 1,
            yMax: 1,
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
          callback: (value: number) => `${(value * 100).toFixed(0)}%`
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    }
  };
  
  return (
    <div className="w-full h-full">
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
  );
};

export default SimpleTimeSeriesView;