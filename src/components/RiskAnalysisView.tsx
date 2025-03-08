import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { PortfolioData, TimePeriod, Benchmark } from '../types';
import { filterPortfolioDataByTimePeriod } from '../utils/portfolioUtils';
import { calculatePortfolioReturns } from '../utils/performanceCalculations';
import { useRiskWorker } from '../hooks/useRiskWorker';
import { MathJax } from 'better-react-mathjax';

// Register Chart.js components
Chart.register(...registerables);

interface RiskAnalysisViewProps {
  portfolioData: PortfolioData;
  selectedTimePeriod: TimePeriod;
  onUpdateRiskContributions: (contributions: { id: string; name: string; contribution: number; contributionPercentage: number }[]) => void;
  onUpdateCalculationSteps: (steps: { assetName: string; assetId: string; weight: number; individualVolatility: number; marginalContribution: number; contribution: number; contributionPercentage: number; portfolioVolatility: number }[]) => void;
}

const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
  portfolioData,
  selectedTimePeriod,
  onUpdateRiskContributions,
  onUpdateCalculationSteps
}) => {
  const { results, loading, error, calculateRisk } = useRiskWorker(portfolioData, selectedTimePeriod, 'Market');
  const [showFormulas, setShowFormulas] = useState<boolean>(false);
  
  // Calculate risk metrics when portfolio data or time period changes
  useEffect(() => {
    if (portfolioData && portfolioData.wholePortfolio) {
      calculateRisk();
    }
  }, [portfolioData, selectedTimePeriod, calculateRisk]);
  
  // Update risk contributions when results change
  useEffect(() => {
    if (results && results.riskContributions) {
      onUpdateRiskContributions(results.riskContributions);
      onUpdateCalculationSteps(results.calculationSteps);
    }
  }, [results, onUpdateRiskContributions, onUpdateCalculationSteps]);
  
  // Prepare data for the radar chart
  const prepareChartData = () => {
    if (!results) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    // Normalize metrics to a 0-100 scale for better visualization
    const volatility = Math.min(results.portfolioVolatility * 100, 100);
    const maxDrawdown = Math.min(results.maxDrawdown * 100, 100);
    const valueAtRisk = Math.min(results.valueAtRisk * 100, 100);
    const trackingError = Math.min(results.trackingError * 100, 100);
    const beta = Math.min(Math.abs(results.beta) * 50, 100); // Scale beta to 0-100
    
    return {
      labels: ['Volatility', 'Max Drawdown', 'Value at Risk (95%)', 'Tracking Error', 'Beta'],
      datasets: [
        {
          label: 'Risk Metrics',
          data: [volatility, maxDrawdown, valueAtRisk, trackingError, beta],
          backgroundColor: 'rgba(66, 153, 225, 0.2)',
          borderColor: 'rgba(66, 153, 225, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(66, 153, 225, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(66, 153, 225, 1)'
        }
      ]
    };
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          callback: (value: number) => `${value}%`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${context.label}: ${value.toFixed(2)}%`;
          }
        }
      }
    }
  };
  
  // Top risk contributors
  const topContributors = results?.riskContributions
    ? [...results.riskContributions]
        .sort((a, b) => b.contributionPercentage - a.contributionPercentage)
        .slice(0, 5)
    : [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Risk Analysis</h2>
        <button
          onClick={() => setShowFormulas(!showFormulas)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showFormulas ? 'Hide Formulas' : 'Show Formulas'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded-md">
          Error calculating risk metrics: {error}
        </div>
      ) : results ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[300px]">
            <Radar data={prepareChartData()} options={options} />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Volatility</h3>
                <p className="text-xl font-semibold text-gray-900">{(results.portfolioVolatility * 100).toFixed(2)}%</p>
                {showFormulas && (
                  <div className="mt-1 text-xs text-gray-500">
                    <MathJax>{"\\(\\sigma = \\sqrt{\\frac{\\sum_{i=1}^{n}(r_i - \\bar{r})^2}{n-1}}\\)"}</MathJax>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Max Drawdown</h3>
                <p className="text-xl font-semibold text-gray-900">{(results.maxDrawdown * 100).toFixed(2)}%</p>
                {showFormulas && (
                  <div className="mt-1 text-xs text-gray-500">
                    <MathJax>{"\\(\\text{MaxDD} = \\max_t\\left(\\frac{\\text{Peak}_t - \\text{Value}_t}{\\text{Peak}_t}\\right)\\)"}</MathJax>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Value at Risk (95%)</h3>
                <p className="text-xl font-semibold text-gray-900">{(results.valueAtRisk * 100).toFixed(2)}%</p>
                {showFormulas && (
                  <div className="mt-1 text-xs text-gray-500">
                    <MathJax>{"\\(\\text{VaR}_{\\alpha} = -\\text{Percentile}(\\{r_i\\}, 1-\\alpha)\\)"}</MathJax>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Tracking Error</h3>
                <p className="text-xl font-semibold text-gray-900">{(results.trackingError * 100).toFixed(2)}%</p>
                {showFormulas && (
                  <div className="mt-1 text-xs text-gray-500">
                    <MathJax>{"\\(\\text{TE} = \\sqrt{\\frac{\\sum_{i=1}^{n}(r_i^P - r_i^B)^2}{n-1}}\\)"}</MathJax>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Beta</h3>
                <p className="text-xl font-semibold text-gray-900">{results.beta.toFixed(2)}</p>
                {showFormulas && (
                  <div className="mt-1 text-xs text-gray-500">
                    <MathJax>{"\\(\\beta = \\frac{\\text{Cov}(r_P, r_B)}{\\text{Var}(r_B)}\\)"}</MathJax>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Alpha</h3>
                <p className="text-xl font-semibold text-gray-900">{(results.alpha * 100).toFixed(2)}%</p>
                {showFormulas && (
                  <div className="mt-1 text-xs text-gray-500">
                    <MathJax>{"\\(\\alpha = r_P - [r_f + \\beta(r_B - r_f)]\\)"}</MathJax>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Top Risk Contributors</h3>
              {topContributors.length > 0 ? (
                <div className="space-y-2">
                  {topContributors.map((contributor) => (
                    <div key={contributor.id} className="flex justify-between items-center">
                      <span className="text-sm">{contributor.name}</span>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${contributor.contributionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{contributor.contributionPercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No risk contribution data available.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
          No risk metrics available. Please generate portfolio data first.
        </div>
      )}
      
      {showFormulas && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Risk Contribution Formula</h3>
          <div className="text-sm text-gray-600">
            <MathJax>{"\\(\\text{RC}_i = w_i \\times \\frac{\\text{Cov}(r_i, r_P)}{\\sigma_P}\\)"}</MathJax>
            <p className="mt-2">Where:</p>
            <ul className="list-disc list-inside text-xs mt-1">
              <li>\\(\\text{RC}_i\\) is the risk contribution of asset i</li>
              <li>\\(w_i\\) is the weight of asset i in the portfolio</li>
              <li>\\(\\text{Cov}(r_i, r_P)\\) is the covariance between asset i returns and portfolio returns</li>
              <li>\\(\\sigma_P\\) is the portfolio volatility</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysisView;