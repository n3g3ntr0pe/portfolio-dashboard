import React, { useEffect, useState } from 'react';
import { PortfolioData, TimePeriod } from '../types';
import { useRiskWorker } from '../hooks/useRiskWorker';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface RiskAnalysisViewProps {
  portfolioData: PortfolioData;
  selectedTimePeriod: TimePeriod;
  onRiskContributionsChange: (contributions: any[]) => void;
  onCalculationStepsChange: (steps: any[]) => void;
}

const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({ 
  portfolioData, 
  selectedTimePeriod, 
  onRiskContributionsChange,
  onCalculationStepsChange
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
      console.log('Sending risk contributions to parent:', results.riskContributions);
      onRiskContributionsChange(results.riskContributions);
    }
  }, [results, onRiskContributionsChange]);
  
  // Create calculation steps and pass to parent component when results change
  useEffect(() => {
    if (results && results.riskContributions && results.riskContributions.length > 0) {
      // Create calculation steps to pass to parent component
      const calculationSteps = results.riskContributions.map((contribution, index) => {
        return {
          assetId: contribution.id,
          assetName: contribution.name,
          weight: contribution.weight || 0,
          individualVolatility: contribution.individualVolatility || 0,
          marginalContribution: contribution.marginalContribution || 0,
          contribution: contribution.contribution,
          contributionPercentage: contribution.contributionPercentage,
          portfolioVolatility: results.portfolioVolatility
        };
      });
      
      onCalculationStepsChange(calculationSteps);
    }
  }, [results, onCalculationStepsChange]);
  
  // Define formulas as plain strings to avoid TypeScript parsing them as code
  const portfolioVolatilityFormula = `\\sigma_P = \\sqrt{\\sum_{i=1}^{n}\\sum_{j=1}^{n} w_i w_j \\sigma_i \\sigma_j \\rho_{ij}}`;
  
  // These formulas are used in the risk contribution details section
  const riskContributionFormula = `RC_i = w_i \\times \\frac{\\text{Cov}(r_i, r_P)}{\\sigma_P}`;
  
  // MathJax configuration
  const mathJaxConfig = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
  };
  
  // Render risk contribution details table
  const renderRiskContributionDetails = () => {
    if (!results || !results.riskContributions || results.riskContributions.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-6 bg-white p-4 rounded-md shadow-sm">
        <h3 className="text-md font-medium mb-3">Risk Contribution Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Covariance
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contribution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.riskContributions.map((contribution: any, index: number) => (
                <tr key={contribution.id || contribution.name || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{contribution.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{contribution.weight !== undefined ? (contribution.weight * 100).toFixed(2) : 'N/A'}%</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{contribution.covariance !== undefined ? contribution.covariance.toFixed(4) : 'N/A'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{(contribution.contribution * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <MathJaxContext config={mathJaxConfig}>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Volatility</h3>
              <p className="text-xl font-semibold text-gray-900">{results.portfolioVolatility !== undefined ? (results.portfolioVolatility * 100).toFixed(2) : 'N/A'}%</p>
              {showFormulas && (
                <div className="mt-1 text-xs text-gray-500">
                  <MathJax>{`\\(${portfolioVolatilityFormula}\\)`}</MathJax>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Max Drawdown</h3>
              <p className="text-xl font-semibold text-gray-900">{results.maxDrawdown !== undefined ? (results.maxDrawdown * 100).toFixed(2) : 'N/A'}%</p>
              {showFormulas && (
                <div className="mt-1 text-xs text-gray-500">
                  <MathJax>{"\\(\\text{MaxDD} = \\max_t\\left(\\frac{\\text{Peak}_t - \\text{Value}_t}{\\text{Peak}_t}\\right)\\)"}</MathJax>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Value at Risk (95%)</h3>
              <p className="text-xl font-semibold text-gray-900">{results.valueAtRisk !== undefined ? (results.valueAtRisk * 100).toFixed(2) : 'N/A'}%</p>
              {showFormulas && (
                <div className="mt-1 text-xs text-gray-500">
                  <MathJax>{"\\(\\text{VaR}_{\\alpha} = -\\text{Percentile}(\\{r_i\\}, 1-\\alpha)\\)"}</MathJax>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Tracking Error</h3>
              <p className="text-xl font-semibold text-gray-900">{results.trackingError !== undefined ? (results.trackingError * 100).toFixed(2) : 'N/A'}%</p>
              {showFormulas && (
                <div className="mt-1 text-xs text-gray-500">
                  <MathJax>{"\\(\\text{TE} = \\sqrt{\\frac{\\sum_{i=1}^{n}(r_i^P - r_i^B)^2}{n-1}}\\)"}</MathJax>
                </div>
              )}
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
              <MathJax>{`\\(${riskContributionFormula}\\)`}</MathJax>
              <p className="mt-2">Where:</p>
              <ul className="list-disc list-inside text-xs mt-1">
                <li>The term "RC" with subscript represents the risk contribution of asset i</li>
                <li>\\(w_i\\) is the weight of asset i in the portfolio</li>
                <li>The term "Cov" represents the covariance between asset returns and portfolio returns</li>
                <li>\\(\\sigma_P\\) is the portfolio volatility</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
};

export default RiskAnalysisView;