import { useState, useEffect, useCallback } from 'react';
import Dashboard from './views/Dashboard';
import DataGeneratorControls from './components/DataGeneratorControls';
import SimpleAllocationTreemap from './components/SimpleAllocationTreemap';
import RiskAnalysisView from './components/RiskAnalysisView';
import SimpleTimeSeriesView from './components/SimpleTimeSeriesView';
import PerformanceView from './components/PerformanceView';
import CalculationsView from './components/CalculationsView';
import { generatePortfolioData } from './data/dataGenerator';
import { PortfolioData, TimePeriod, Benchmark, AllocationSettings } from './types';
import AllocationControls from './components/AllocationControls';

// Define the RiskContribution interface
interface RiskContribution {
  id: string;
  name: string;
  contribution: number;
  contributionPercentage: number;
}

// Define the CalculationStep interface
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

// Extended PortfolioData interface to include data generation parameters
interface ExtendedPortfolioData extends PortfolioData {
  scenario?: 'normal' | 'bullish' | 'bearish';
  volatilityLevel?: 'low' | 'medium' | 'high';
  months?: number;
}

function App() {
  console.log('App component rendering');
  
  useEffect(() => {
    console.log('App component mounted');
    
    // Log any errors that might be occurring
    const originalError = console.error;
    console.error = (...args) => {
      console.log('Error caught:', ...args);
      originalError(...args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);
  
  // Default allocation settings
  const defaultAllocations: AllocationSettings = {
    publicVsPrivate: 70, // 70% public, 30% private
    equitiesVsFixedIncome: 60, // 60% equities, 40% fixed income within public
    audVsFx: 60, // 60% AUD, 40% FX within equities
    sovereignVsNonSovereign: 60, // 60% sovereign, 40% non-sovereign within fixed income
    privateAllocation: {
      realEstate: 40, // 40% real estate within private
      infrastructure: 30, // 30% infrastructure within private
      privateEquity: 30 // 30% private equity within private
    }
  };
  
  // State for portfolio data
  const [portfolioData, setPortfolioData] = useState<ExtendedPortfolioData>(() => {
    // Generate initial portfolio data
    const initialData = generatePortfolioData(120, 'normal', 'medium', defaultAllocations) as ExtendedPortfolioData;
    
    // Add data generation parameters to the portfolio data
    initialData.scenario = 'normal';
    initialData.volatilityLevel = 'medium';
    initialData.months = 120;
    
    return initialData;
  });
  
  // State for time period selection
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('10Y');
  
  // State for benchmark selection
  const [selectedBenchmark, setSelectedBenchmark] = useState<Benchmark>('Market');
  
  // State for risk contributions
  const [riskContributions, setRiskContributions] = useState<RiskContribution[]>([]);
  
  // State for calculation steps
  const [calculationSteps, setCalculationSteps] = useState<CalculationStep[]>([]);
  
  // State for allocation settings
  const [allocations, setAllocations] = useState<AllocationSettings>(defaultAllocations);
  
  // State for UI controls
  const [showDataControls, setShowDataControls] = useState<boolean>(true);
  const [showRiskContribution, setShowRiskContribution] = useState<boolean>(false);
  const [showCalculations, setShowCalculations] = useState<boolean>(false);
  
  // Handle portfolio data update
  const handleUpdatePortfolioData = (newData: PortfolioData) => {
    console.log('Updating portfolio data:', newData);
    
    // Preserve data generation parameters if they exist in the current portfolio data
    const extendedData = newData as ExtendedPortfolioData;
    if (portfolioData.scenario) extendedData.scenario = portfolioData.scenario;
    if (portfolioData.volatilityLevel) extendedData.volatilityLevel = portfolioData.volatilityLevel;
    if (portfolioData.months) extendedData.months = portfolioData.months;
    
    setPortfolioData(extendedData);
    setRiskContributions([]);
  };
  
  // Handle allocation settings update
  const handleUpdateAllocations = (newAllocations: AllocationSettings) => {
    console.log('Updating allocations:', newAllocations);
    setAllocations(newAllocations);
    
    // Generate new portfolio data with updated allocations
    const newData = generatePortfolioData(120, 'normal', 'medium', newAllocations) as ExtendedPortfolioData;
    newData.scenario = 'normal';
    newData.volatilityLevel = 'medium';
    newData.months = 120;
    
    setPortfolioData(newData);
    setRiskContributions([]);
  };
  
  // Handle benchmark change
  const handleBenchmarkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBenchmark(e.target.value as Benchmark);
  };
  
  // Handle time period change
  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimePeriod(e.target.value as TimePeriod);
  };
  
  // Handle risk contribution update
  const handleUpdateRiskContributions = (contributions: RiskContribution[]) => {
    console.log('Updating risk contributions:', contributions);
    setRiskContributions(contributions);
  };
  
  // Handle calculation steps update
  const handleUpdateCalculationSteps = (steps: CalculationStep[]) => {
    console.log('Updating calculation steps:', steps);
    setCalculationSteps(steps);
  };
  
  // Toggle data controls
  const toggleDataControls = () => {
    setShowDataControls(prev => !prev);
  };
  
  // Toggle risk contribution
  const toggleRiskContribution = () => {
    setShowRiskContribution(prev => !prev);
  };
  
  // Toggle calculations
  const toggleCalculations = () => {
    setShowCalculations(prev => !prev);
  };
  
  // Handle data generation with parameters
  const handleGenerateData = (months: number, scenario: 'normal' | 'bullish' | 'bearish', volatilityLevel: 'low' | 'medium' | 'high') => {
    console.log('Generating new data with params:', { months, scenario, volatilityLevel });
    
    // Always use 120 months (10 years) regardless of what's passed
    const actualMonths = 120;
    
    // Generate new portfolio data with the specified parameters
    const newData = generatePortfolioData(actualMonths, scenario, volatilityLevel, allocations) as ExtendedPortfolioData;
    
    // Add data generation parameters to the portfolio data
    newData.scenario = scenario;
    newData.volatilityLevel = volatilityLevel;
    newData.months = actualMonths;
    
    setPortfolioData(newData);
    setRiskContributions([]);
  };

  console.log('Rendering App component JSX');
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio Dashboard</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button 
              onClick={toggleDataControls}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showDataControls ? 'Hide Data Controls' : 'Show Data Controls'}
            </button>
            
            <button 
              onClick={toggleRiskContribution}
              className={`px-4 py-2 rounded-md transition-colors ${
                showRiskContribution 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {showRiskContribution ? 'Hide Risk Contribution' : 'Show Risk Contribution'}
            </button>
            
            <button 
              onClick={toggleCalculations}
              className={`px-4 py-2 rounded-md transition-colors ${
                showCalculations 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
            </button>
          </div>
        </div>
        
        {portfolioData && (
          <>
            {showDataControls && (
              <div className="mb-6">
                <DataGeneratorControls onGenerateData={handleGenerateData} />
              </div>
            )}
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Portfolio Allocation</h2>
                <div className="h-[500px]">
                  <SimpleAllocationTreemap 
                    portfolioData={portfolioData} 
                    showRiskContribution={showRiskContribution}
                    riskContributions={riskContributions}
                    allocations={allocations}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Allocation Controls</h2>
                <AllocationControls 
                  allocations={allocations} 
                  onUpdateAllocations={handleUpdateAllocations} 
                />
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Performance Analysis</h2>
                <div className="h-[400px]">
                  <PerformanceView 
                    portfolioData={portfolioData} 
                    selectedTimePeriod={selectedTimePeriod}
                    selectedBenchmark={selectedBenchmark}
                    onTimePeriodChange={handleTimePeriodChange}
                    onBenchmarkChange={handleBenchmarkChange}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Risk Analysis</h2>
                <div className="h-[400px]">
                  <RiskAnalysisView 
                    portfolioData={portfolioData} 
                    selectedTimePeriod={selectedTimePeriod}
                    onUpdateRiskContributions={handleUpdateRiskContributions}
                    onUpdateCalculationSteps={handleUpdateCalculationSteps}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6 bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-2">Historical Performance</h2>
              <div className="h-[400px]">
                <SimpleTimeSeriesView 
                  portfolioData={portfolioData} 
                  selectedTimePeriod={selectedTimePeriod}
                  selectedBenchmark={selectedBenchmark}
                />
              </div>
            </div>
            
            {showCalculations && (
              <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Risk Calculations</h2>
                <div className="h-[400px] overflow-auto">
                  <CalculationsView 
                    calculationSteps={calculationSteps} 
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;