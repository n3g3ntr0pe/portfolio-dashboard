import { useState, useEffect } from 'react';
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
  
  // State for risk contributions and calculation steps
  const [riskContributions, setRiskContributions] = useState<any[]>([]);
  const [calculationSteps, setCalculationSteps] = useState<any[]>([]);
  
  // State for allocation settings
  const [allocations, setAllocations] = useState<AllocationSettings>(defaultAllocations);
  
  // State for UI controls
  const [showDataControls, setShowDataControls] = useState<boolean>(true);
  const [showRiskContribution, setShowRiskContribution] = useState<boolean>(false);
  const [showCalculations, setShowCalculations] = useState<boolean>(false);
  
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
    setShowCalculations(prev => {
      const newValue = !prev;
      
      // If we're showing calculations, scroll to them after a short delay
      if (newValue) {
        setTimeout(() => {
          const calculationsElement = document.getElementById('calculations-section');
          if (calculationsElement) {
            calculationsElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
      
      return newValue;
    });
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
            
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* Left column - Portfolio Allocation */}
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-md p-4 h-[600px] flex flex-col">
                  <h2 className="text-lg font-semibold mb-2">Portfolio Allocation</h2>
                  <div className="flex-grow">
                    <SimpleAllocationTreemap 
                      portfolioData={portfolioData} 
                      showRiskContribution={showRiskContribution}
                      riskContributions={riskContributions}
                      allocations={allocations}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right column - Analysis Controls and Allocation Controls */}
              <div className="flex-1 flex flex-col h-[600px]">
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <h2 className="text-lg font-semibold mb-2">Analysis Controls</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                      <select 
                        value={selectedTimePeriod} 
                        onChange={handleTimePeriodChange}
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1M">1 Month</option>
                        <option value="3M">3 Months</option>
                        <option value="6M">6 Months</option>
                        <option value="1Y">1 Year</option>
                        <option value="3Y">3 Years</option>
                        <option value="5Y">5 Years</option>
                        <option value="10Y">10 Years</option>
                        <option value="YTD">Year to Date</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Benchmark</label>
                      <select 
                        value={selectedBenchmark} 
                        onChange={handleBenchmarkChange}
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Market">Market</option>
                        <option value="S&P500">S&P 500</option>
                        <option value="MSCI World">MSCI World</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-4 flex-grow">
                  <h2 className="text-lg font-semibold mb-2">Allocation Controls</h2>
                  <AllocationControls 
                    allocations={allocations} 
                    onUpdateAllocations={handleUpdateAllocations} 
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Performance Analysis */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Performance Analysis</h2>
                <PerformanceView 
                  portfolioData={portfolioData}
                  selectedTimePeriod={selectedTimePeriod}
                  selectedBenchmark={selectedBenchmark}
                  onTimePeriodChange={handleTimePeriodChange}
                  onBenchmarkChange={handleBenchmarkChange}
                />
              </div>
              
              {/* Risk Analysis */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Risk Analysis</h2>
                <RiskAnalysisView 
                  portfolioData={portfolioData}
                  selectedTimePeriod={selectedTimePeriod}
                  onRiskContributionsChange={setRiskContributions}
                  onCalculationStepsChange={setCalculationSteps}
                />
              </div>
            </div>
            
            {/* Time Series Analysis */}
            <div className="mb-6 bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-2">Time Series Analysis</h2>
              <SimpleTimeSeriesView 
                portfolioData={portfolioData}
                selectedTimePeriod={selectedTimePeriod}
                selectedBenchmark={selectedBenchmark}
              />
            </div>
            
            {showCalculations && (
              <div id="calculations-section" className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold mb-2">Risk Calculations</h2>
                <div>
                  <CalculationsView 
                    calculationSteps={calculationSteps} 
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="bg-gray-200 p-4 text-center text-gray-600 text-sm">
        Portfolio Dashboard Copyright {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;