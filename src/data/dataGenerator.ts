import { PortfolioData, Asset, AssetClass, AllocationSettings } from '../types';
import jStat from 'jstat';

// Correlation matrix between asset classes
const correlationMatrix = {
  // Public assets
  'AUD-Denominated Equities': {
    'AUD-Denominated Equities': 1.0,
    'FX-Denominated Equities': 0.8,
    'Sovereign FI': 0.2,
    'Non-Sovereign FI': 0.3,
    'Real Estate': 0.5,
    'Infrastructure': 0.4,
    'Private Equity': 0.6
  },
  'FX-Denominated Equities': {
    'AUD-Denominated Equities': 0.8,
    'FX-Denominated Equities': 1.0,
    'Sovereign FI': 0.1,
    'Non-Sovereign FI': 0.2,
    'Real Estate': 0.4,
    'Infrastructure': 0.3,
    'Private Equity': 0.7
  },
  'Sovereign FI': {
    'AUD-Denominated Equities': 0.2,
    'FX-Denominated Equities': 0.1,
    'Sovereign FI': 1.0,
    'Non-Sovereign FI': 0.7,
    'Real Estate': 0.3,
    'Infrastructure': 0.4,
    'Private Equity': 0.1
  },
  'Non-Sovereign FI': {
    'AUD-Denominated Equities': 0.3,
    'FX-Denominated Equities': 0.2,
    'Sovereign FI': 0.7,
    'Non-Sovereign FI': 1.0,
    'Real Estate': 0.4,
    'Infrastructure': 0.5,
    'Private Equity': 0.2
  },
  // Private assets
  'Real Estate': {
    'AUD-Denominated Equities': 0.5,
    'FX-Denominated Equities': 0.4,
    'Sovereign FI': 0.3,
    'Non-Sovereign FI': 0.4,
    'Real Estate': 1.0,
    'Infrastructure': 0.6,
    'Private Equity': 0.4
  },
  'Infrastructure': {
    'AUD-Denominated Equities': 0.4,
    'FX-Denominated Equities': 0.3,
    'Sovereign FI': 0.4,
    'Non-Sovereign FI': 0.5,
    'Real Estate': 0.6,
    'Infrastructure': 1.0,
    'Private Equity': 0.3
  },
  'Private Equity': {
    'AUD-Denominated Equities': 0.6,
    'FX-Denominated Equities': 0.7,
    'Sovereign FI': 0.1,
    'Non-Sovereign FI': 0.2,
    'Real Estate': 0.4,
    'Infrastructure': 0.3,
    'Private Equity': 1.0
  }
};

// Base expected returns and volatility for each asset class (normal market scenario, medium volatility)
const baseAssetClassParams = {
  'AUD-Denominated Equities': { meanReturn: 0.008, volatility: 0.045 },
  'FX-Denominated Equities': { meanReturn: 0.009, volatility: 0.05 },
  'Sovereign FI': { meanReturn: 0.003, volatility: 0.02 },
  'Non-Sovereign FI': { meanReturn: 0.004, volatility: 0.025 },
  'Real Estate': { meanReturn: 0.006, volatility: 0.03 },
  'Infrastructure': { meanReturn: 0.007, volatility: 0.025 },
  'Private Equity': { meanReturn: 0.01, volatility: 0.06 }
};

// Market scenario adjustments
const scenarioAdjustments = {
  normal: {
    returnMultiplier: 1.0,
    volatilityMultiplier: 1.0
  },
  bullish: {
    returnMultiplier: 1.5,
    volatilityMultiplier: 0.8
  },
  bearish: {
    returnMultiplier: 0.5,
    volatilityMultiplier: 1.3
  }
};

// Volatility level adjustments
const volatilityAdjustments = {
  low: 0.7,
  medium: 1.0,
  high: 1.5
};

// Get adjusted asset class parameters based on scenario and volatility level
function getAdjustedAssetClassParams(
  scenario: 'normal' | 'bullish' | 'bearish' = 'normal',
  volatilityLevel: 'low' | 'medium' | 'high' = 'medium'
) {
  const scenarioAdj = scenarioAdjustments[scenario];
  const volatilityAdj = volatilityAdjustments[volatilityLevel];
  
  const adjustedParams: typeof baseAssetClassParams = {} as any;
  
  Object.entries(baseAssetClassParams).forEach(([assetClass, params]) => {
    adjustedParams[assetClass] = {
      meanReturn: params.meanReturn * scenarioAdj.returnMultiplier,
      volatility: params.volatility * scenarioAdj.volatilityMultiplier * volatilityAdj
    };
  });
  
  return adjustedParams;
}

// Generate correlated returns for asset classes
function generateCorrelatedReturns(
  months: number = 60,
  scenario: 'normal' | 'bullish' | 'bearish' = 'normal',
  volatilityLevel: 'low' | 'medium' | 'high' = 'medium'
): Record<string, number[]> {
  const assetClassParams = getAdjustedAssetClassParams(scenario, volatilityLevel);
  const assetClasses = Object.keys(assetClassParams);
  const numAssets = assetClasses.length;
  
  // Create covariance matrix from correlation matrix and volatilities
  const covMatrix: number[][] = [];
  for (let i = 0; i < numAssets; i++) {
    covMatrix[i] = [];
    for (let j = 0; j < numAssets; j++) {
      const assetI = assetClasses[i];
      const assetJ = assetClasses[j];
      const corr = correlationMatrix[assetI][assetJ];
      const volI = assetClassParams[assetI].volatility;
      const volJ = assetClassParams[assetJ].volatility;
      covMatrix[i][j] = corr * volI * volJ;
    }
  }
  
  // Generate correlated random returns
  const returns: Record<string, number[]> = {};
  assetClasses.forEach(assetClass => {
    returns[assetClass] = [];
  });
  
  for (let m = 0; m < months; m++) {
    // Generate uncorrelated standard normal random variables
    const z = Array(numAssets).fill(0).map(() => jStat.normal.sample(0, 1));
    
    // Apply Cholesky decomposition to get correlated random variables
    const choleskyMatrix = choleskyDecomposition(covMatrix);
    const correlatedZ = multiplyMatrixVector(choleskyMatrix, z);
    
    // Convert to returns with appropriate mean and volatility
    for (let i = 0; i < numAssets; i++) {
      const assetClass = assetClasses[i];
      const mean = assetClassParams[assetClass].meanReturn;
      returns[assetClass].push(mean + correlatedZ[i]);
    }
  }
  
  return returns;
}

// Cholesky decomposition for generating correlated random variables
function choleskyDecomposition(matrix: number[][]): number[][] {
  const n = matrix.length;
  const L: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      
      if (j === i) {
        for (let k = 0; k < j; k++) {
          sum += L[j][k] * L[j][k];
        }
        L[j][j] = Math.sqrt(matrix[j][j] - sum);
      } else {
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k];
        }
        L[i][j] = (matrix[i][j] - sum) / L[j][j];
      }
    }
  }
  
  return L;
}

// Matrix-vector multiplication
function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
  const result: number[] = [];
  const n = matrix.length;
  
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += matrix[i][j] * vector[j];
    }
    result.push(sum);
  }
  
  return result;
}

// Generate individual asset returns based on parent asset class returns
function generateAssetReturns(
  assetClassName: string, 
  baseReturns: number[], 
  volatilityFactor: number = 0.3,
  scenario: 'normal' | 'bullish' | 'bearish' = 'normal',
  volatilityLevel: 'low' | 'medium' | 'high' = 'medium'
): number[] {
  // Get adjusted parameters
  const assetClassParams = getAdjustedAssetClassParams(scenario, volatilityLevel);
  
  // Add some idiosyncratic risk to the base asset class returns
  return baseReturns.map(r => {
    const idiosyncraticReturn = jStat.normal.sample(0, assetClassParams[assetClassName].volatility * volatilityFactor);
    return r + idiosyncraticReturn;
  });
}

// Generate benchmark returns
function generateBenchmarkReturns(
  months: number = 60,
  scenario: 'normal' | 'bullish' | 'bearish' = 'normal',
  volatilityLevel: 'low' | 'medium' | 'high' = 'medium'
): Record<string, { returns: number[] }> {
  console.log('Generating benchmark returns with params:', { months, scenario, volatilityLevel });
  
  // Adjust benchmark parameters based on scenario and volatility
  const scenarioAdj = scenarioAdjustments[scenario];
  const volatilityAdj = volatilityAdjustments[volatilityLevel];
  
  try {
    const benchmarks = {
      'Market': {
        meanReturn: 0.007 * scenarioAdj.returnMultiplier,
        volatility: 0.04 * scenarioAdj.volatilityMultiplier * volatilityAdj
      },
      'S&P500': {
        meanReturn: 0.008 * scenarioAdj.returnMultiplier,
        volatility: 0.045 * scenarioAdj.volatilityMultiplier * volatilityAdj
      },
      'MSCI World': {
        meanReturn: 0.0075 * scenarioAdj.returnMultiplier,
        volatility: 0.042 * scenarioAdj.volatilityMultiplier * volatilityAdj
      }
    };
    
    const result: Record<string, { returns: number[] }> = {};
    
    Object.entries(benchmarks).forEach(([name, params]) => {
      const returns: number[] = [];
      
      for (let m = 0; m < months; m++) {
        returns.push(jStat.normal.sample(params.meanReturn, params.volatility));
      }
      
      result[name] = { returns };
    });
    
    return result;
  } catch (error) {
    console.error('Error generating benchmark returns:', error);
    
    // Return empty benchmark data in case of error
    return {
      'Market': { returns: Array(months).fill(0) },
      'S&P500': { returns: Array(months).fill(0) },
      'MSCI World': { returns: Array(months).fill(0) }
    };
  }
}

// Generate a hierarchical portfolio structure with realistic allocations
export function generatePortfolioData(
  months: number = 60,
  scenario: 'normal' | 'bullish' | 'bearish' = 'normal',
  volatilityLevel: 'low' | 'medium' | 'high' = 'medium',
  allocations: AllocationSettings = {
    publicVsPrivate: 70,
    equitiesVsFixedIncome: 60,
    audVsFx: 60,
    sovereignVsNonSovereign: 60,
    privateAllocation: {
      realEstate: 40,
      infrastructure: 30,
      privateEquity: 30
    }
  }
): PortfolioData {
  console.log('Generating portfolio data with params:', { months, scenario, volatilityLevel, allocations });
  
  try {
    // Generate correlated returns for asset classes
    const assetClassReturns = generateCorrelatedReturns(months, scenario, volatilityLevel);
    
    // Generate benchmark returns
    const benchmarkReturns = generateBenchmarkReturns(months, scenario, volatilityLevel);
    
    // Calculate timeframe
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // Create portfolio structure
    const portfolioData: PortfolioData = {
      id: `portfolio-${Date.now()}`,
      wholePortfolio: {
        id: 'whole-portfolio',
        name: 'Whole of Portfolio',
        allocation: 100,
        children: [
          // Public (Listed) Assets
          {
            id: 'public-assets',
            name: 'Public (Listed) Assets',
            allocation: allocations.publicVsPrivate,
            children: [
              // Equities
              {
                id: 'equities',
                name: 'Equities',
                allocation: allocations.equitiesVsFixedIncome,
                parent: 'public-assets',
                children: [
                  // AUD-Denominated Equities
                  {
                    id: 'aud-equities',
                    name: 'AUD-Denominated Equities',
                    allocation: allocations.audVsFx,
                    parent: 'equities',
                    children: [
                      // Individual AUD equities
                      {
                        id: 'aud-equity-1',
                        name: 'ASX 200 ETF',
                        allocation: 40,
                        returns: generateAssetReturns('AUD-Denominated Equities', assetClassReturns['AUD-Denominated Equities'], 0.2, scenario, volatilityLevel),
                        parent: 'aud-equities'
                      },
                      {
                        id: 'aud-equity-2',
                        name: 'Australian Banks ETF',
                        allocation: 30,
                        returns: generateAssetReturns('AUD-Denominated Equities', assetClassReturns['AUD-Denominated Equities'], 0.3, scenario, volatilityLevel),
                        parent: 'aud-equities'
                      },
                      {
                        id: 'aud-equity-3',
                        name: 'Australian Resources ETF',
                        allocation: 30,
                        returns: generateAssetReturns('AUD-Denominated Equities', assetClassReturns['AUD-Denominated Equities'], 0.4, scenario, volatilityLevel),
                        parent: 'aud-equities'
                      }
                    ]
                  },
                  // FX-Denominated Equities
                  {
                    id: 'fx-equities',
                    name: 'FX-Denominated Equities',
                    allocation: 100 - allocations.audVsFx,
                    parent: 'equities',
                    children: [
                      // Individual FX equities
                      {
                        id: 'fx-equity-1',
                        name: 'S&P 500 ETF',
                        allocation: 50,
                        returns: generateAssetReturns('FX-Denominated Equities', assetClassReturns['FX-Denominated Equities'], 0.2, scenario, volatilityLevel),
                        parent: 'fx-equities'
                      },
                      {
                        id: 'fx-equity-2',
                        name: 'NASDAQ 100 ETF',
                        allocation: 30,
                        returns: generateAssetReturns('FX-Denominated Equities', assetClassReturns['FX-Denominated Equities'], 0.3, scenario, volatilityLevel),
                        parent: 'fx-equities'
                      },
                      {
                        id: 'fx-equity-3',
                        name: 'MSCI World ETF',
                        allocation: 20,
                        returns: generateAssetReturns('FX-Denominated Equities', assetClassReturns['FX-Denominated Equities'], 0.25, scenario, volatilityLevel),
                        parent: 'fx-equities'
                      }
                    ]
                  }
                ]
              },
              // Fixed Income
              {
                id: 'fixed-income',
                name: 'Fixed Income',
                allocation: 100 - allocations.equitiesVsFixedIncome,
                parent: 'public-assets',
                children: [
                  // Sovereign Fixed Income
                  {
                    id: 'sovereign-fi',
                    name: 'Sovereign FI',
                    allocation: allocations.sovereignVsNonSovereign,
                    parent: 'fixed-income',
                    children: [
                      // Individual sovereign bonds
                      {
                        id: 'sovereign-1',
                        name: 'Australian Government Bonds',
                        allocation: 60,
                        returns: generateAssetReturns('Sovereign FI', assetClassReturns['Sovereign FI'], 0.15, scenario, volatilityLevel),
                        parent: 'sovereign-fi'
                      },
                      {
                        id: 'sovereign-2',
                        name: 'US Treasury Bonds',
                        allocation: 40,
                        returns: generateAssetReturns('Sovereign FI', assetClassReturns['Sovereign FI'], 0.1, scenario, volatilityLevel),
                        parent: 'sovereign-fi'
                      }
                    ]
                  },
                  // Non-Sovereign Fixed Income
                  {
                    id: 'non-sovereign-fi',
                    name: 'Non-Sovereign FI',
                    allocation: 100 - allocations.sovereignVsNonSovereign,
                    parent: 'fixed-income',
                    children: [
                      // Individual corporate bonds
                      {
                        id: 'non-sovereign-1',
                        name: 'Investment Grade Corporate Bonds',
                        allocation: 70,
                        returns: generateAssetReturns('Non-Sovereign FI', assetClassReturns['Non-Sovereign FI'], 0.2, scenario, volatilityLevel),
                        parent: 'non-sovereign-fi'
                      },
                      {
                        id: 'non-sovereign-2',
                        name: 'High Yield Corporate Bonds',
                        allocation: 30,
                        returns: generateAssetReturns('Non-Sovereign FI', assetClassReturns['Non-Sovereign FI'], 0.4, scenario, volatilityLevel),
                        parent: 'non-sovereign-fi'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          // Private (Unlisted) Assets
          {
            id: 'private-assets',
            name: 'Private (Unlisted) Assets',
            allocation: 100 - allocations.publicVsPrivate,
            children: [
              // Real Estate
              {
                id: 'real-estate',
                name: 'Real Estate',
                allocation: allocations.privateAllocation.realEstate,
                parent: 'private-assets',
                children: [
                  // Individual real estate investments
                  {
                    id: 'real-estate-1',
                    name: 'Commercial Real Estate',
                    allocation: 60,
                    returns: generateAssetReturns('Real Estate', assetClassReturns['Real Estate'], 0.25, scenario, volatilityLevel),
                    parent: 'real-estate'
                  },
                  {
                    id: 'real-estate-2',
                    name: 'Residential Real Estate',
                    allocation: 40,
                    returns: generateAssetReturns('Real Estate', assetClassReturns['Real Estate'], 0.2, scenario, volatilityLevel),
                    parent: 'real-estate'
                  }
                ]
              },
              // Infrastructure
              {
                id: 'infrastructure',
                name: 'Infrastructure',
                allocation: allocations.privateAllocation.infrastructure,
                parent: 'private-assets',
                children: [
                  // Individual infrastructure investments
                  {
                    id: 'infrastructure-1',
                    name: 'Energy Infrastructure',
                    allocation: 50,
                    returns: generateAssetReturns('Infrastructure', assetClassReturns['Infrastructure'], 0.3, scenario, volatilityLevel),
                    parent: 'infrastructure'
                  },
                  {
                    id: 'infrastructure-2',
                    name: 'Transport Infrastructure',
                    allocation: 50,
                    returns: generateAssetReturns('Infrastructure', assetClassReturns['Infrastructure'], 0.25, scenario, volatilityLevel),
                    parent: 'infrastructure'
                  }
                ]
              },
              // Private Equity
              {
                id: 'private-equity',
                name: 'Private Equity',
                allocation: allocations.privateAllocation.privateEquity,
                parent: 'private-assets',
                children: [
                  // Individual private equity investments
                  {
                    id: 'private-equity-1',
                    name: 'Venture Capital',
                    allocation: 40,
                    returns: generateAssetReturns('Private Equity', assetClassReturns['Private Equity'], 0.5, scenario, volatilityLevel),
                    parent: 'private-equity'
                  },
                  {
                    id: 'private-equity-2',
                    name: 'Buyout Funds',
                    allocation: 60,
                    returns: generateAssetReturns('Private Equity', assetClassReturns['Private Equity'], 0.4, scenario, volatilityLevel),
                    parent: 'private-equity'
                  }
                ]
              }
            ]
          }
        ]
      },
      timeframe: {
        startDate,
        endDate
      },
      benchmarks: benchmarkReturns
    };
    
    return portfolioData;
  } catch (error) {
    console.error('Error generating portfolio data:', error);
    
    // Return a minimal portfolio structure in case of error
    return {
      id: `portfolio-error-${Date.now()}`,
      wholePortfolio: {
        id: 'whole-portfolio',
        name: 'Whole of Portfolio',
        allocation: 100,
        children: []
      },
      timeframe: {
        startDate: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      benchmarks: {
        'Market': { returns: [] },
        'S&P500': { returns: [] },
        'MSCI World': { returns: [] }
      }
    };
  }
}