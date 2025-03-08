import React, { useState } from 'react';
import PerformanceView from '../components/PerformanceView';
import RiskAnalysisView from '../components/RiskAnalysisView';
import TimeSeriesView from '../components/TimeSeriesView';
import AllocationControls from '../components/AllocationControls';
import { PortfolioData, TimePeriod, Benchmark, AllocationSettings } from '../types';

interface DashboardProps {
  portfolioData: PortfolioData;
}

const Dashboard: React.FC<DashboardProps> = ({ portfolioData }) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('1Y');
  const [selectedBenchmark, setSelectedBenchmark] = useState<Benchmark>('Market');
  
  // Add state for allocation settings
  const [allocations, setAllocations] = useState<AllocationSettings>({
    publicVsPrivate: 70, // 70% public, 30% private
    equitiesVsFixedIncome: 60, // 60% equities, 40% fixed income within public
    audVsFx: 60, // 60% AUD, 40% FX within equities
    sovereignVsNonSovereign: 60, // 60% sovereign, 40% non-sovereign within fixed income
    privateAllocation: {
      realEstate: 40, // 40% real estate within private
      infrastructure: 30, // 30% infrastructure within private
      privateEquity: 30 // 30% private equity within private
    }
  });

  // Create a modified portfolio data with updated allocations
  const getUpdatedPortfolioData = () => {
    if (!portfolioData || !portfolioData.wholePortfolio) {
      console.error('Invalid portfolio data structure in getUpdatedPortfolioData');
      return portfolioData; // Return original data to avoid crashes
    }
    
    try {
      // Create a deep copy of the portfolio data
      const updatedData = JSON.parse(JSON.stringify(portfolioData));
      
      // Fix date objects that were serialized to strings during JSON.stringify/parse
      if (updatedData.timeframe) {
        updatedData.timeframe.startDate = new Date(updatedData.timeframe.startDate);
        updatedData.timeframe.endDate = new Date(updatedData.timeframe.endDate);
      }
      
      // Verify wholePortfolio structure
      if (!updatedData.wholePortfolio || !updatedData.wholePortfolio.children || !Array.isArray(updatedData.wholePortfolio.children)) {
        return portfolioData; // Return original data to avoid crashes
      }
      
      // Find public and private nodes
      const publicNode = updatedData.wholePortfolio.children.find((c: any) => c.name === 'Public (Listed) Assets');
      const privateNode = updatedData.wholePortfolio.children.find((c: any) => c.name === 'Private (Unlisted) Assets');
      
      if (!publicNode || !privateNode) {
        return portfolioData; // Return original data to avoid crashes
      }
      
      // Update top-level allocations
      publicNode.allocation = allocations.publicVsPrivate;
      privateNode.allocation = 100 - allocations.publicVsPrivate;
      
      // Update public allocations
      if (publicNode.children && Array.isArray(publicNode.children)) {
        const equitiesNode = publicNode.children.find((c: any) => c.name === 'Equities');
        const fixedIncomeNode = publicNode.children.find((c: any) => c.name === 'Fixed Income');
        
        if (equitiesNode && fixedIncomeNode) {
          equitiesNode.allocation = allocations.equitiesVsFixedIncome;
          fixedIncomeNode.allocation = 100 - allocations.equitiesVsFixedIncome;
          
          // Update equities allocations
          if (equitiesNode.children && Array.isArray(equitiesNode.children)) {
            const audNode = equitiesNode.children.find((c: any) => c.name === 'AUD-Denominated Equities');
            const fxNode = equitiesNode.children.find((c: any) => c.name === 'FX-Denominated Equities');
            
            if (audNode && fxNode) {
              audNode.allocation = allocations.audVsFx;
              fxNode.allocation = 100 - allocations.audVsFx;
            }
          }
          
          // Update fixed income allocations
          if (fixedIncomeNode.children && Array.isArray(fixedIncomeNode.children)) {
            const sovereignNode = fixedIncomeNode.children.find((c: any) => c.name === 'Sovereign FI');
            const nonSovereignNode = fixedIncomeNode.children.find((c: any) => c.name === 'Non-Sovereign FI');
            
            if (sovereignNode && nonSovereignNode) {
              sovereignNode.allocation = allocations.sovereignVsNonSovereign;
              nonSovereignNode.allocation = 100 - allocations.sovereignVsNonSovereign;
            }
          }
        }
      }
      
      // Update private allocations
      if (privateNode.children && Array.isArray(privateNode.children)) {
        const realEstateNode = privateNode.children.find((c: any) => c.name === 'Real Estate');
        const infrastructureNode = privateNode.children.find((c: any) => c.name === 'Infrastructure');
        const privateEquityNode = privateNode.children.find((c: any) => c.name === 'Private Equity');
        
        if (realEstateNode && infrastructureNode && privateEquityNode) {
          realEstateNode.allocation = allocations.privateAllocation.realEstate;
          infrastructureNode.allocation = allocations.privateAllocation.infrastructure;
          privateEquityNode.allocation = allocations.privateAllocation.privateEquity;
        }
      }
      
      return updatedData;
    } catch (error) {
      console.error('Error updating portfolio data:', error);
      return portfolioData; // Return original data in case of error
    }
  };

  // Simple time period selector
  const handleTimePeriodChange = (period: TimePeriod) => {
    setSelectedTimePeriod(period);
  };

  // Simple benchmark selector
  const handleBenchmarkChange = (benchmark: Benchmark) => {
    setSelectedBenchmark(benchmark);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Analysis Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select 
              value={selectedTimePeriod} 
              onChange={(e) => handleTimePeriodChange(e.target.value as TimePeriod)}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="YTD">Year to Date</option>
              <option value="1Y">1 Year</option>
              <option value="3Y">3 Years</option>
              <option value="5Y">5 Years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benchmark</label>
            <select 
              value={selectedBenchmark} 
              onChange={(e) => handleBenchmarkChange(e.target.value as Benchmark)}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Market">Market</option>
              <option value="S&P500">S&P 500</option>
              <option value="MSCI World">MSCI World</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Allocation Controls</h2>
        <AllocationControls 
          portfolioData={portfolioData}
          allocations={allocations}
          setAllocations={setAllocations}
        />
      </div>
      
      {/* Display all views simultaneously in a vertical layout */}
      <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
        <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>
        <div className="h-[550px]">
          <PerformanceView 
            portfolioData={getUpdatedPortfolioData()} 
            timePeriod={selectedTimePeriod}
            benchmark={selectedBenchmark}
            showRelative={false}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
        <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
        <div className="h-[550px]">
          <RiskAnalysisView 
            key={`risk-analysis-${JSON.stringify(allocations)}`}
            portfolioData={getUpdatedPortfolioData()} 
            timePeriod={selectedTimePeriod}
            benchmark={selectedBenchmark}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
        <h2 className="text-xl font-semibold mb-4">Time Series</h2>
        <div className="h-[550px]">
          <TimeSeriesView 
            portfolioData={getUpdatedPortfolioData()} 
            timePeriod={selectedTimePeriod}
            benchmark={selectedBenchmark}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;