import { useState, useEffect, useCallback } from 'react';
import { PortfolioData, TimePeriod } from '../types';
import { filterPortfolioDataByTimePeriod } from '../utils/portfolioUtils';

// Interface for risk calculation results
interface RiskCalculationResults {
  portfolioVolatility: number;
  benchmarkVolatility: number;
  maxDrawdown: number;
  valueAtRisk: number;
  trackingError: number;
  beta: number;
  alpha: number;
  sharpeRatio: number;
  informationRatio: number;
  riskContributions: {
    id: string;
    name: string;
    contribution: number;
    contributionPercentage: number;
  }[];
  calculationSteps: {
    assetName: string;
    assetId: string;
    weight: number;
    individualVolatility: number;
    marginalContribution: number;
    contribution: number;
    contributionPercentage: number;
    portfolioVolatility: number;
  }[];
}

// Hook for risk calculations using a web worker
export function useRiskWorker(
  portfolioData: PortfolioData | null,
  timePeriod: TimePeriod,
  benchmark: string = 'Market'
): {
  results: RiskCalculationResults | null;
  loading: boolean;
  error: string | null;
  calculateRisk: () => void;
} {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [results, setResults] = useState<RiskCalculationResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the worker
  useEffect(() => {
    // Create a new worker
    const riskWorker = new Worker(new URL('../workers/riskWorker.ts', import.meta.url), { type: 'module' });
    
    // Set up message handler
    riskWorker.onmessage = (event) => {
      const { type, data, error } = event.data;
      
      if (type === 'risk_calculation_results') {
        setResults(data);
        setLoading(false);
      } else if (type === 'error') {
        setError(error);
        setLoading(false);
      }
    };
    
    // Set up error handler
    riskWorker.onerror = (err) => {
      setError(`Worker error: ${err.message}`);
      setLoading(false);
    };
    
    setWorker(riskWorker);
    
    // Clean up the worker when the component unmounts
    return () => {
      riskWorker.terminate();
    };
  }, []);

  // Function to trigger risk calculations
  const calculateRisk = useCallback(() => {
    if (!worker || !portfolioData) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Filter portfolio data by time period
      const filteredData = filterPortfolioDataByTimePeriod(portfolioData, timePeriod);
      
      // Send data to the worker
      worker.postMessage({
        type: 'calculate_risk',
        data: {
          portfolioData: filteredData,
          benchmark
        }
      });
    } catch (err) {
      setError(`Error starting risk calculation: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  }, [worker, portfolioData, timePeriod, benchmark]);

  return { results, loading, error, calculateRisk };
}