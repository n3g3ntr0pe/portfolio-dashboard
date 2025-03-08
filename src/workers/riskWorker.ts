import { PortfolioData, Asset, AssetClass } from '../types';
import * as riskCalc from '../utils/riskCalculations';

// Define the worker context
const ctx: Worker = self as any;

// Handle messages from the main thread
ctx.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  if (type === 'calculate_risk') {
    try {
      const { portfolioData, benchmark } = data;
      
      // Calculate risk metrics
      const results = calculateRiskMetrics(portfolioData, benchmark);
      
      // Send results back to the main thread
      ctx.postMessage({
        type: 'risk_calculation_results',
        data: results
      });
    } catch (error) {
      // Send error back to the main thread
      ctx.postMessage({
        type: 'error',
        error: `Error in risk calculation: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
});

// Calculate all risk metrics for the portfolio
function calculateRiskMetrics(portfolioData: PortfolioData, benchmark: string = 'Market') {
  // Extract all leaf assets from the portfolio
  const assets: Asset[] = [];
  
  function extractAssets(node: AssetClass | Asset) {
    if ('children' in node && node.children && node.children.length > 0) {
      node.children.forEach(child => extractAssets(child));
    } else if (!('children' in node)) {
      assets.push(node);
    }
  }
  
  extractAssets(portfolioData.wholePortfolio);
  
  // Calculate portfolio returns (weighted average of asset returns)
  const portfolioReturns: number[] = [];
  
  if (assets.length === 0 || assets[0].returns.length === 0) {
    throw new Error('No asset returns data available');
  }
  
  for (let i = 0; i < assets[0].returns.length; i++) {
    let weightedReturn = 0;
    let totalWeight = 0;
    
    assets.forEach(asset => {
      // Calculate the absolute weight of the asset in the portfolio
      let weight = asset.allocation / 100;
      let parent = asset.parent;
      
      // Traverse up the hierarchy to calculate the absolute weight
      while (parent) {
        const parentNode = findNodeById(portfolioData.wholePortfolio, parent);
        if (parentNode && 'allocation' in parentNode) {
          weight *= parentNode.allocation / 100;
          parent = parentNode.parent;
        } else {
          break;
        }
      }
      
      if (i < asset.returns.length) {
        weightedReturn += weight * asset.returns[i];
        totalWeight += weight;
      }
    });
    
    if (totalWeight > 0) {
      portfolioReturns.push(weightedReturn / totalWeight);
    } else {
      portfolioReturns.push(0);
    }
  }
  
  // Get benchmark returns
  const benchmarkReturns = portfolioData.benchmarks[benchmark]?.returns || [];
  
  // Calculate risk metrics
  const portfolioVolatility = riskCalc.calculateVolatility(portfolioReturns);
  const benchmarkVolatility = riskCalc.calculateVolatility(benchmarkReturns);
  const maxDrawdown = riskCalc.calculateMaxDrawdown(portfolioReturns);
  const valueAtRisk = riskCalc.calculateValueAtRisk(portfolioReturns, 0.95);
  const trackingError = riskCalc.calculateTrackingError(portfolioReturns, benchmarkReturns);
  const beta = riskCalc.calculateBeta(portfolioReturns, benchmarkReturns);
  const alpha = riskCalc.calculateAlpha(portfolioReturns, benchmarkReturns, 0.001); // Assuming 0.1% risk-free rate
  const sharpeRatio = riskCalc.calculateSharpeRatio(portfolioReturns, 0.001);
  const informationRatio = riskCalc.calculateInformationRatio(portfolioReturns, benchmarkReturns);
  
  // Calculate risk contributions
  const riskContributions = riskCalc.calculateRiskContributions(portfolioData);
  
  // Generate calculation steps for educational purposes
  const calculationSteps = assets.map(asset => {
    // Calculate absolute weight
    let weight = asset.allocation / 100;
    let parent = asset.parent;
    
    while (parent) {
      const parentNode = findNodeById(portfolioData.wholePortfolio, parent);
      if (parentNode && 'allocation' in parentNode) {
        weight *= parentNode.allocation / 100;
        parent = parentNode.parent;
      } else {
        break;
      }
    }
    
    const individualVolatility = riskCalc.calculateVolatility(asset.returns);
    const marginalContribution = riskCalc.calculateCovariance(asset.returns, portfolioReturns) / portfolioVolatility;
    const contribution = weight * marginalContribution;
    
    return {
      assetName: asset.name,
      assetId: asset.id,
      weight,
      individualVolatility,
      marginalContribution,
      contribution,
      contributionPercentage: 0, // Will be calculated after summing all contributions
      portfolioVolatility
    };
  });
  
  // Calculate contribution percentages
  const totalContribution = calculationSteps.reduce((sum, step) => sum + step.contribution, 0);
  
  if (totalContribution > 0) {
    calculationSteps.forEach(step => {
      step.contributionPercentage = (step.contribution / totalContribution) * 100;
    });
  }
  
  return {
    portfolioVolatility,
    benchmarkVolatility,
    maxDrawdown,
    valueAtRisk,
    trackingError,
    beta,
    alpha,
    sharpeRatio,
    informationRatio,
    riskContributions,
    calculationSteps
  };
}

// Helper function to find a node by ID in the portfolio hierarchy
function findNodeById(node: AssetClass | Asset, id: string): AssetClass | Asset | null {
  if (node.id === id) {
    return node;
  }
  
  if ('children' in node && node.children && node.children.length > 0) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
}