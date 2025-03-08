import React, { useState } from 'react';

interface DataGeneratorControlsProps {
  onGenerateData: (months: number, scenario: 'normal' | 'bullish' | 'bearish', volatilityLevel: 'low' | 'medium' | 'high') => void;
}

const DataGeneratorControls: React.FC<DataGeneratorControlsProps> = ({ onGenerateData }) => {
  const [months, setMonths] = useState<number>(120);
  const [scenario, setScenario] = useState<'normal' | 'bullish' | 'bearish'>('normal');
  const [volatilityLevel, setVolatilityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateData(months, scenario, volatilityLevel);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Data Generator</h2>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Market Scenario</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as 'normal' | 'bullish' | 'bearish')}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="normal">Normal Market</option>
              <option value="bullish">Bullish Market</option>
              <option value="bearish">Bearish Market</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {scenario === 'normal' && 'Standard market conditions with moderate returns.'}
              {scenario === 'bullish' && 'Higher returns with lower volatility.'}
              {scenario === 'bearish' && 'Lower returns with higher volatility.'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Volatility Level</label>
            <select
              value={volatilityLevel}
              onChange={(e) => setVolatilityLevel(e.target.value as 'low' | 'medium' | 'high')}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low Volatility</option>
              <option value="medium">Medium Volatility</option>
              <option value="high">High Volatility</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {volatilityLevel === 'low' && 'Reduced price fluctuations, more stable returns.'}
              {volatilityLevel === 'medium' && 'Average price fluctuations.'}
              {volatilityLevel === 'high' && 'Increased price fluctuations, more extreme returns.'}
            </p>
          </div>
          
          {showAdvanced && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period (Months)</label>
              <input
                type="number"
                min={12}
                max={240}
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Number of months of historical data to generate (12-240).
              </p>
            </div>
          )}
        </div>
        
        {showAdvanced && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Scenario Details</h3>
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <h4 className="font-medium mb-1">Normal Market</h4>
              <ul className="list-disc list-inside text-xs text-gray-600 mb-2">
                <li>Return multiplier: 1.0x</li>
                <li>Volatility multiplier: 1.0x</li>
                <li>Asset correlations: Standard</li>
              </ul>
              
              <h4 className="font-medium mb-1">Bullish Market</h4>
              <ul className="list-disc list-inside text-xs text-gray-600 mb-2">
                <li>Return multiplier: 1.5x</li>
                <li>Volatility multiplier: 0.8x</li>
                <li>Asset correlations: Slightly reduced</li>
              </ul>
              
              <h4 className="font-medium mb-1">Bearish Market</h4>
              <ul className="list-disc list-inside text-xs text-gray-600 mb-2">
                <li>Return multiplier: 0.5x</li>
                <li>Volatility multiplier: 1.3x</li>
                <li>Asset correlations: Increased</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Data
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Note:</strong> This generates simulated data for demonstration purposes only.
          The data is statistically realistic but does not represent actual market performance.
        </p>
      </div>
    </div>
  );
};

export default DataGeneratorControls;