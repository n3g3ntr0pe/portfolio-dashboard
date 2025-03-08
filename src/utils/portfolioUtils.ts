import { PortfolioData, Asset, AssetClass, TimePeriod } from '../types';

// Filter portfolio data based on a time period
export function filterPortfolioDataByTimePeriod(portfolioData: PortfolioData, timePeriod: TimePeriod): PortfolioData {
  if (!portfolioData) {
    return portfolioData;
  }
  
  try {
    // Create a deep copy of the portfolio data
    const filteredData: PortfolioData = JSON.parse(JSON.stringify(portfolioData));
    
    // Fix date objects that were serialized to strings during JSON.stringify/parse
    if (filteredData.timeframe) {
      filteredData.timeframe.startDate = new Date(filteredData.timeframe.startDate);
      filteredData.timeframe.endDate = new Date(filteredData.timeframe.endDate);
    }
    
    // Determine the number of months to include based on the time period
    let monthsToInclude: number;
    
    switch (timePeriod) {
      case '1M':
        monthsToInclude = 1;
        break;
      case '3M':
        monthsToInclude = 3;
        break;
      case '6M':
        monthsToInclude = 6;
        break;
      case '1Y':
        monthsToInclude = 12;
        break;
      case '3Y':
        monthsToInclude = 36;
        break;
      case '5Y':
        monthsToInclude = 60;
        break;
      case '10Y':
        monthsToInclude = 120;
        break;
      case 'YTD':
        // Calculate months from the start of the year to now
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        monthsToInclude = Math.floor((now.getTime() - startOfYear.getTime()) / (30 * 24 * 60 * 60 * 1000));
        break;
      default:
        monthsToInclude = 12; // Default to 1 year
    }
    
    // Filter returns for all assets in the portfolio
    function filterAssetReturns(node: AssetClass | Asset) {
      if ('children' in node && node.children && node.children.length > 0) {
        node.children.forEach(child => filterAssetReturns(child));
      } else if ('returns' in node) {
        // Filter returns to include only the specified number of months
        node.returns = node.returns.slice(-monthsToInclude);
      }
    }
    
    filterAssetReturns(filteredData.wholePortfolio);
    
    // Filter benchmark returns
    Object.keys(filteredData.benchmarks).forEach(benchmark => {
      if (filteredData.benchmarks[benchmark] && filteredData.benchmarks[benchmark].returns) {
        filteredData.benchmarks[benchmark].returns = filteredData.benchmarks[benchmark].returns.slice(-monthsToInclude);
      }
    });
    
    // Update timeframe
    if (filteredData.timeframe) {
      const endDate = filteredData.timeframe.endDate;
      const startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - monthsToInclude);
      filteredData.timeframe.startDate = startDate;
    }
    
    return filteredData;
  } catch (error) {
    console.error('Error filtering portfolio data by time period:', error);
    return portfolioData;
  }
}

// Extract all leaf assets from the portfolio
export function extractLeafAssets(portfolioData: PortfolioData): Asset[] {
  if (!portfolioData || !portfolioData.wholePortfolio) {
    return [];
  }
  
  const assets: Asset[] = [];
  
  function extractAssets(node: AssetClass | Asset) {
    if ('children' in node && node.children && node.children.length > 0) {
      node.children.forEach(child => extractAssets(child));
    } else if (!('children' in node)) {
      assets.push(node);
    }
  }
  
  extractAssets(portfolioData.wholePortfolio);
  
  return assets;
}

// Find a node by ID in the portfolio hierarchy
export function findNodeById(portfolioData: PortfolioData, id: string): AssetClass | Asset | null {
  if (!portfolioData || !portfolioData.wholePortfolio) {
    return null;
  }
  
  function findNode(node: AssetClass | Asset): AssetClass | Asset | null {
    if (node.id === id) {
      return node;
    }
    
    if ('children' in node && node.children && node.children.length > 0) {
      for (const child of node.children) {
        const found = findNode(child);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }
  
  return findNode(portfolioData.wholePortfolio);
}