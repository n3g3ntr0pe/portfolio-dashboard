import { PortfolioData, Asset, AssetClass } from '../types';
import jStat from 'jstat';

// Calculate the cumulative return from a series of period returns
export function calculateCumulativeReturn(returns: number[]): number {
  if (!returns || returns.length === 0) {
    return 0;
  }
  
  try {
    // Calculate cumulative return using the formula: (1 + r1) * (1 + r2) * ... * (1 + rn) - 1
    const cumulativeReturn = returns.reduce((acc, ret) => acc * (1 + ret), 1) - 1;
    return cumulativeReturn;
  } catch (error) {
    console.error('Error calculating cumulative return:', error);
    return 0;
  }
}

// Calculate the annualized return from a series of monthly returns
export function calculateAnnualizedReturn(monthlyReturns: number[]): number {
  if (!monthlyReturns || monthlyReturns.length === 0) {
    return 0;
  }
  
  try {
    const cumulativeReturn = calculateCumulativeReturn(monthlyReturns);
    const years = monthlyReturns.length / 12;
    
    // Calculate annualized return using the formula: (1 + cumulative_return)^(1/years) - 1
    const annualizedReturn = Math.pow(1 + cumulativeReturn, 1 / years) - 1;
    return annualizedReturn;
  } catch (error) {
    console.error('Error calculating annualized return:', error);
    return 0;
  }
}

// Calculate the average monthly return
export function calculateAverageReturn(returns: number[]): number {
  if (!returns || returns.length === 0) {
    return 0;
  }
  
  try {
    return jStat.mean(returns);
  } catch (error) {
    console.error('Error calculating average return:', error);
    return 0;
  }
}

// Calculate the portfolio returns based on asset allocations and returns
export function calculatePortfolioReturns(portfolioData: PortfolioData): number[] {
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
    
    if (assets.length === 0 || assets[0].returns.length === 0) {
      return [];
    }
    
    // Calculate portfolio returns (weighted average of asset returns)
    const portfolioReturns: number[] = [];
    
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
    
    return portfolioReturns;
  } catch (error) {
    console.error('Error calculating portfolio returns:', error);
    return [];
  }
}

// Calculate the benchmark returns for a specific benchmark
export function getBenchmarkReturns(portfolioData: PortfolioData, benchmark: string): number[] {
  if (!portfolioData || !portfolioData.benchmarks || !portfolioData.benchmarks[benchmark]) {
    return [];
  }
  
  return portfolioData.benchmarks[benchmark].returns;
}

// Calculate the excess returns (portfolio returns - benchmark returns)
export function calculateExcessReturns(portfolioReturns: number[], benchmarkReturns: number[]): number[] {
  if (!portfolioReturns || !benchmarkReturns || portfolioReturns.length === 0 || benchmarkReturns.length === 0) {
    return [];
  }
  
  // Ensure both arrays have the same length
  const minLength = Math.min(portfolioReturns.length, benchmarkReturns.length);
  
  return portfolioReturns.slice(0, minLength).map((r, i) => r - benchmarkReturns[i]);
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