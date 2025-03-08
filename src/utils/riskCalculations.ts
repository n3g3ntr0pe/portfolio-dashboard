import { PortfolioData, Asset, AssetClass } from '../types';
import jStat from 'jstat';

// Calculate the volatility (standard deviation) of returns
export function calculateVolatility(returns: number[]): number {
  if (!returns || returns.length === 0) {
    return 0;
  }
  
  try {
    return jStat.stdev(returns, true);
  } catch (error) {
    console.error('Error calculating volatility:', error);
    return 0;
  }
}

// Calculate the annualized volatility from monthly returns
export function calculateAnnualizedVolatility(monthlyReturns: number[]): number {
  const monthlyVol = calculateVolatility(monthlyReturns);
  return monthlyVol * Math.sqrt(12); // Annualize by multiplying by sqrt(12)
}

// Calculate the maximum drawdown from a series of returns
export function calculateMaxDrawdown(returns: number[]): number {
  if (!returns || returns.length === 0) {
    return 0;
  }
  
  try {
    // Convert returns to cumulative returns
    const cumulativeReturns = returns.reduce((acc, ret, i) => {
      if (i === 0) {
        acc.push(1 + ret);
      } else {
        acc.push(acc[i - 1] * (1 + ret));
      }
      return acc;
    }, [] as number[]);
    
    let maxDrawdown = 0;
    let peak = cumulativeReturns[0];
    
    for (let i = 1; i < cumulativeReturns.length; i++) {
      if (cumulativeReturns[i] > peak) {
        peak = cumulativeReturns[i];
      } else {
        const drawdown = (peak - cumulativeReturns[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown;
  } catch (error) {
    console.error('Error calculating max drawdown:', error);
    return 0;
  }
}

// Calculate Value at Risk (VaR) at a given confidence level
export function calculateValueAtRisk(returns: number[], confidenceLevel: number = 0.95): number {
  if (!returns || returns.length === 0) {
    return 0;
  }
  
  try {
    // Sort returns in ascending order
    const sortedReturns = [...returns].sort((a, b) => a - b);
    
    // Find the index corresponding to the confidence level
    const index = Math.floor(sortedReturns.length * (1 - confidenceLevel));
    
    // Return the negative of the return at that index (VaR is typically positive)
    return -sortedReturns[index];
  } catch (error) {
    console.error('Error calculating Value at Risk:', error);
    return 0;
  }
}

// Calculate tracking error (standard deviation of excess returns)
export function calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
  if (!portfolioReturns || !benchmarkReturns || portfolioReturns.length === 0 || benchmarkReturns.length === 0 || portfolioReturns.length !== benchmarkReturns.length) {
    return 0;
  }
  
  try {
    // Calculate excess returns
    const excessReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
    
    // Calculate standard deviation of excess returns
    return calculateVolatility(excessReturns);
  } catch (error) {
    console.error('Error calculating tracking error:', error);
    return 0;
  }
}

// Calculate covariance between two return series
export function calculateCovariance(returns1: number[], returns2: number[]): number {
  if (!returns1 || !returns2 || returns1.length === 0 || returns2.length === 0 || returns1.length !== returns2.length) {
    return 0;
  }
  
  try {
    const mean1 = jStat.mean(returns1);
    const mean2 = jStat.mean(returns2);
    let sum = 0;
    
    for (let i = 0; i < returns1.length; i++) {
      sum += (returns1[i] - mean1) * (returns2[i] - mean2);
    }
    
    return sum / (returns1.length - 1);
  } catch (error) {
    console.error('Error calculating covariance:', error);
    return 0;
  }
}

// Calculate correlation between two return series
export function calculateCorrelation(returns1: number[], returns2: number[]): number {
  if (!returns1 || !returns2 || returns1.length === 0 || returns2.length === 0 || returns1.length !== returns2.length) {
    return 0;
  }
  
  try {
    const vol1 = calculateVolatility(returns1);
    const vol2 = calculateVolatility(returns2);
    
    if (vol1 === 0 || vol2 === 0) {
      return 0;
    }
    
    const cov = calculateCovariance(returns1, returns2);
    return cov / (vol1 * vol2);
  } catch (error) {
    console.error('Error calculating correlation:', error);
    return 0;
  }
}

// Calculate beta of a portfolio relative to a benchmark
export function calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
  if (!portfolioReturns || !benchmarkReturns || portfolioReturns.length === 0 || benchmarkReturns.length === 0 || portfolioReturns.length !== benchmarkReturns.length) {
    return 0;
  }
  
  try {
    const cov = calculateCovariance(portfolioReturns, benchmarkReturns);
    const benchmarkVar = jStat.variance(benchmarkReturns, true);
    
    if (benchmarkVar === 0) {
      return 0;
    }
    
    return cov / benchmarkVar;
  } catch (error) {
    console.error('Error calculating beta:', error);
    return 0;
  }
}

// Calculate alpha of a portfolio relative to a benchmark
export function calculateAlpha(portfolioReturns: number[], benchmarkReturns: number[], riskFreeRate: number = 0.0): number {
  if (!portfolioReturns || !benchmarkReturns || portfolioReturns.length === 0 || benchmarkReturns.length === 0 || portfolioReturns.length !== benchmarkReturns.length) {
    return 0;
  }
  
  try {
    const portfolioMean = jStat.mean(portfolioReturns);
    const benchmarkMean = jStat.mean(benchmarkReturns);
    const beta = calculateBeta(portfolioReturns, benchmarkReturns);
    
    // Alpha = Portfolio Return - [Risk-Free Rate + Beta * (Benchmark Return - Risk-Free Rate)]
    return portfolioMean - (riskFreeRate + beta * (benchmarkMean - riskFreeRate));
  } catch (error) {
    console.error('Error calculating alpha:', error);
    return 0;
  }
}

// Calculate the Sharpe ratio
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.0): number {
  if (!returns || returns.length === 0) {
    return 0;
  }
  
  try {
    const meanReturn = jStat.mean(returns);
    const volatility = calculateVolatility(returns);
    
    if (volatility === 0) {
      return 0;
    }
    
    return (meanReturn - riskFreeRate) / volatility;
  } catch (error) {
    console.error('Error calculating Sharpe ratio:', error);
    return 0;
  }
}

// Calculate the Information ratio
export function calculateInformationRatio(portfolioReturns: number[], benchmarkReturns: number[]): number {
  if (!portfolioReturns || !benchmarkReturns || portfolioReturns.length === 0 || benchmarkReturns.length === 0 || portfolioReturns.length !== benchmarkReturns.length) {
    return 0;
  }
  
  try {
    // Calculate excess returns
    const excessReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
    
    // Calculate mean excess return
    const meanExcessReturn = jStat.mean(excessReturns);
    
    // Calculate tracking error
    const trackingError = calculateTrackingError(portfolioReturns, benchmarkReturns);
    
    if (trackingError === 0) {
      return 0;
    }
    
    return meanExcessReturn / trackingError;
  } catch (error) {
    console.error('Error calculating Information ratio:', error);
    return 0;
  }
}

// Calculate the Sortino ratio (using downside deviation instead of standard deviation)
export function calculateSortinoRatio(returns: number[], targetReturn: number = 0.0): number {
  if (!returns || returns.length === 0) {
    return 0;
  }
  
  try {
    const meanReturn = jStat.mean(returns);
    
    // Calculate downside deviation
    const downsideReturns = returns.filter(r => r < targetReturn);
    
    if (downsideReturns.length === 0) {
      return Infinity; // No downside returns, infinite Sortino ratio
    }
    
    const downsideDeviation = Math.sqrt(
      downsideReturns.reduce((sum, r) => sum + Math.pow(r - targetReturn, 2), 0) / downsideReturns.length
    );
    
    if (downsideDeviation === 0) {
      return 0;
    }
    
    return (meanReturn - targetReturn) / downsideDeviation;
  } catch (error) {
    console.error('Error calculating Sortino ratio:', error);
    return 0;
  }
}

// Calculate the Treynor ratio
export function calculateTreynorRatio(returns: number[], benchmarkReturns: number[], riskFreeRate: number = 0.0): number {
  if (!returns || !benchmarkReturns || returns.length === 0 || benchmarkReturns.length === 0 || returns.length !== benchmarkReturns.length) {
    return 0;
  }
  
  try {
    const meanReturn = jStat.mean(returns);
    const beta = calculateBeta(returns, benchmarkReturns);
    
    if (beta === 0) {
      return 0;
    }
    
    return (meanReturn - riskFreeRate) / beta;
  } catch (error) {
    console.error('Error calculating Treynor ratio:', error);
    return 0;
  }
}

// Calculate the risk contribution of each asset to the portfolio
export function calculateRiskContributions(portfolioData: PortfolioData): { id: string; name: string; contribution: number; contributionPercentage: number }[] {
  try {
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
    
    if (assets.length === 0) {
      return [];
    }
    
    // Calculate portfolio returns (weighted average of asset returns)
    const portfolioReturns: number[] = [];
    
    if (assets[0].returns.length === 0) {
      return [];
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
    
    // Calculate portfolio volatility
    const portfolioVol = calculateVolatility(portfolioReturns);
    
    if (portfolioVol === 0) {
      return [];
    }
    
    // Calculate marginal risk contributions
    const riskContributions = assets.map(asset => {
      // Calculate covariance with portfolio
      const cov = calculateCovariance(asset.returns, portfolioReturns);
      
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
      
      // Marginal contribution = weight * cov / portfolio_vol
      const contribution = weight * cov / portfolioVol;
      
      return {
        id: asset.id,
        name: asset.name,
        contribution,
        contributionPercentage: 0 // Will be calculated after summing all contributions
      };
    });
    
    // Calculate total contribution
    const totalContribution = riskContributions.reduce((sum, item) => sum + item.contribution, 0);
    
    // Calculate contribution percentages
    if (totalContribution > 0) {
      riskContributions.forEach(item => {
        item.contributionPercentage = (item.contribution / totalContribution) * 100;
      });
    }
    
    return riskContributions;
  } catch (error) {
    console.error('Error calculating risk contributions:', error);
    return [];
  }
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