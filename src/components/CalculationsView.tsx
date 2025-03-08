import React from 'react';
import { MathJax } from 'better-react-mathjax';

interface CalculationStep {
  assetName: string;
  assetId: string;
  weight: number;
  individualVolatility: number;
  marginalContribution: number;
  contribution: number;
  contributionPercentage: number;
  portfolioVolatility: number;
}

interface CalculationsViewProps {
  calculationSteps: CalculationStep[];
}

const CalculationsView: React.FC<CalculationsViewProps> = ({ calculationSteps }) => {
  if (!calculationSteps || calculationSteps.length === 0) {
    return (
      <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
        No calculation steps available. Please generate portfolio data and calculate risk metrics first.
      </div>
    );
  }
  
  // Sort calculation steps by contribution percentage (descending)
  const sortedSteps = [...calculationSteps].sort((a, b) => b.contributionPercentage - a.contributionPercentage);
  
  // Get portfolio volatility from the first step (should be the same for all steps)
  const portfolioVolatility = sortedSteps[0]?.portfolioVolatility || 0;
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Risk Contribution Calculation Methodology</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium mb-2">Portfolio Volatility</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <MathJax>{"\\(\\sigma_P = \\sqrt{\\sum_{i=1}^{n}\\sum_{j=1}^{n} w_i w_j \\sigma_i \\sigma_j \\rho_{ij}}\\)"}</MathJax>
              <p className="text-sm text-gray-600 mt-2">Where:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>\\(\\sigma_P\\) is the portfolio volatility</li>
                <li>\\(w_i\\) is the weight of asset i</li>
                <li>\\(\\sigma_i\\) is the volatility of asset i</li>
                <li>\\(\\rho_{ij}\\) is the correlation between assets i and j</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-2">Marginal Contribution to Risk</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <MathJax>{"\\(\\text{MCR}_i = \\frac{\\partial \\sigma_P}{\\partial w_i} = \\frac{\\text{Cov}(r_i, r_P)}{\\sigma_P}\\)"}</MathJax>
              <p className="text-sm text-gray-600 mt-2">Where:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>\\(\\text{MCR}_i\\) is the marginal contribution to risk of asset i</li>
                <li>\\(\\text{Cov}(r_i, r_P)\\) is the covariance between asset i returns and portfolio returns</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-2">Risk Contribution</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <MathJax>{"\\(\\text{RC}_i = w_i \\times \\text{MCR}_i = w_i \\times \\frac{\\text{Cov}(r_i, r_P)}{\\sigma_P}\\)"}</MathJax>
              <p className="text-sm text-gray-600 mt-2">Where:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>\\(\\text{RC}_i\\) is the risk contribution of asset i</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-2">Percentage Contribution to Risk</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <MathJax>{"\\(\\text{RC}_i\\% = \\frac{\\text{RC}_i}{\\sigma_P} \\times 100\\%\\)"}</MathJax>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Portfolio Risk Calculation Steps</h3>
        
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <p className="text-sm font-medium">Portfolio Volatility: {(portfolioVolatility * 100).toFixed(2)}%</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Individual Volatility</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marginal Contribution</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Contribution</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total Risk</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSteps.map((step, index) => (
                <tr key={step.assetId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{step.assetName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(step.weight * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(step.individualVolatility * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{step.marginalContribution.toFixed(4)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(step.contribution * 100).toFixed(4)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${step.contributionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{step.contributionPercentage.toFixed(2)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium mb-2">Key Insights</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
          <li>Assets with high individual volatility don't necessarily contribute the most to portfolio risk.</li>
          <li>The correlation between assets significantly impacts their risk contribution.</li>
          <li>An asset's weight and its correlation with other assets determine its risk contribution.</li>
          <li>Diversification works by including assets with low or negative correlations.</li>
          <li>Risk parity would aim to equalize the percentage risk contributions across assets.</li>
        </ul>
      </div>
    </div>
  );
};

export default CalculationsView;