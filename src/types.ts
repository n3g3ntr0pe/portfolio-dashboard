// Time periods for analysis
export type TimePeriod = '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | '10Y' | 'YTD';

// Benchmark options
export type Benchmark = 'Market' | 'S&P500' | 'MSCI World' | 'Custom';

// Asset data structure
export interface Asset {
  id: string;
  name: string;
  allocation: number; // Percentage allocation
  returns: number[]; // Monthly returns for 60 months
  parent?: string; // Parent asset class ID
}

// Asset class structure
export interface AssetClass {
  id: string;
  name: string;
  allocation: number; // Percentage allocation
  children: (AssetClass | Asset)[]; // Sub-asset classes or individual assets
  parent?: string; // Parent asset class ID
}

// Portfolio data structure
export interface PortfolioData {
  id?: string; // Portfolio identifier for caching and API calls
  wholePortfolio: AssetClass; // Top level: Whole of Portfolio
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
  benchmarks: {
    [key in Benchmark]: {
      returns: number[]; // Monthly returns for 60 months
    };
  };
}

// Performance metrics
export interface PerformanceMetrics {
  returns: {
    absolute: number;
    relative: number;
  };
  sharpeRatio: number;
  informationRatio: number;
  alpha: number;
  beta: number;
}

// Risk metrics
export interface RiskMetrics {
  volatility: number;
  maxDrawdown: number;
  valueAtRisk: number; // 95% VaR
  trackingError: number;
  riskContribution: number;
  [key: string]: number; // Allow for additional metrics
}

// Allocation settings
export interface AllocationSettings {
  publicVsPrivate: number; // 0-100% public
  equitiesVsFixedIncome: number; // 0-100% equities within public
  audVsFx: number; // 0-100% AUD within equities
  sovereignVsNonSovereign: number; // 0-100% sovereign within fixed income
  privateAllocation: {
    realEstate: number; // 0-100%
    infrastructure: number; // 0-100%
    privateEquity: number; // 0-100%
  }; // Must sum to 100%
}