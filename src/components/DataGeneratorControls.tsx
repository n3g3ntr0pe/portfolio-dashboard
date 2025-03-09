import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DataGeneratorControlsProps {
  onGenerateData: (months: number, scenario: 'normal' | 'bullish' | 'bearish', volatilityLevel: 'low' | 'medium' | 'high') => void;
}

interface ScenarioSetpoint {
  value: 'normal' | 'bullish' | 'bearish';
  label: string;
  icon: string;
  color: string;
  textColor: string;
  description: string;
  detailedText: string;
}

interface VolatilitySetpoint {
  value: 'low' | 'medium' | 'high';
  label: string;
  icon: string;
  color: string;
  textColor: string;
  description: string;
  detailedText: string;
}

const scenarioSetpoints: ScenarioSetpoint[] = [
  {
    value: 'normal',
    label: 'Normal',
    icon: '⚖️',
    color: '#3B82F6',
    textColor: 'text-blue-600',
    description: 'Balanced market conditions',
    detailedText: 'Standard returns and volatility with typical asset correlations'
  },
  {
    value: 'bullish',
    label: 'Bullish',
    icon: '📈',
    color: '#22C55E',
    textColor: 'text-green-600',
    description: 'Optimistic market outlook',
    detailedText: 'Higher returns, lower volatility, reduced correlations'
  },
  {
    value: 'bearish',
    label: 'Bearish',
    icon: '📉',
    color: '#EF4444',
    textColor: 'text-red-600',
    description: 'Pessimistic market outlook',
    detailedText: 'Lower returns, higher volatility, increased correlations'
  }
];

const volatilitySetpoints: VolatilitySetpoint[] = [
  {
    value: 'low',
    label: 'Low',
    icon: '🛡️',
    color: '#22C55E',
    textColor: 'text-green-600',
    description: 'Minimal price fluctuations',
    detailedText: 'Stable returns with reduced uncertainty'
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: '⚡',
    color: '#F59E0B',
    textColor: 'text-yellow-600',
    description: 'Moderate price movements',
    detailedText: 'Balanced risk-return characteristics'
  },
  {
    value: 'high',
    label: 'High',
    icon: '⚠️',
    color: '#EF4444',
    textColor: 'text-red-600',
    description: 'Large price swings',
    detailedText: 'Higher potential returns with increased risk'
  }
];

const DataGeneratorControls: React.FC<DataGeneratorControlsProps> = ({ onGenerateData }) => {
  const [scenarioType, setScenarioType] = useState<'normal' | 'bullish' | 'bearish'>('normal');
  const [volatilityLevel, setVolatilityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastGenerated, setLastGenerated] = useState({
    timestamp: new Date(),
    scenario: scenarioType,
    volatility: volatilityLevel
  });

  // Handle scenario change
  const handleScenarioChange = (value: 'normal' | 'bullish' | 'bearish') => {
    setScenarioType(value);
  };

  // Handle volatility change
  const handleVolatilityChange = (value: 'low' | 'medium' | 'high') => {
    setVolatilityLevel(value);
  };

  // Format scenario text
  const formatScenario = (scenario: string): string => {
    return scenario.charAt(0).toUpperCase() + scenario.slice(1);
  };

  // Format volatility text
  const formatVolatility = (volatility: string): string => {
    return volatility.toUpperCase();
  };

  // Handle generate data
  const handleGenerateData = () => {
    setIsGenerating(true);
    
    // Always use 120 months (10 years)
    const months = 120;
    
    // Call the generate function
    onGenerateData(months, scenarioType, volatilityLevel);
    
    // Update last generated timestamp and settings
    setLastGenerated({
      timestamp: new Date(),
      scenario: scenarioType,
      volatility: volatilityLevel
    });
    
    // Reset generating state after a short delay
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Data Generator Controls</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Market Scenario</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarioSetpoints.map((setpoint) => (
                <motion.div
                  key={setpoint.value}
                  className={`p-4 rounded-lg cursor-pointer border ${
                    scenarioType === setpoint.value 
                      ? `border-2 border-${setpoint.value === 'normal' ? 'blue' : setpoint.value === 'bullish' ? 'green' : 'red'}-500 shadow-md` 
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleScenarioChange(setpoint.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: scenarioType === setpoint.value ? `${setpoint.color}10` : 'white',
                    transform: scenarioType === setpoint.value ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <div className="text-center mb-2">
                    <span className="text-xl mr-2">{setpoint.icon}</span>
                    <span className={`text-lg font-medium ${setpoint.textColor}`}>{setpoint.label}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>{setpoint.description}</p>
                    <p className="mt-1">{setpoint.detailedText}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Volatility Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {volatilitySetpoints.map((setpoint) => (
                <motion.div
                  key={setpoint.value}
                  className={`p-4 rounded-lg cursor-pointer border ${
                    volatilityLevel === setpoint.value 
                      ? `border-2 border-${setpoint.value === 'low' ? 'green' : setpoint.value === 'medium' ? 'yellow' : 'red'}-500 shadow-md` 
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleVolatilityChange(setpoint.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: volatilityLevel === setpoint.value ? `${setpoint.color}10` : 'white',
                    transform: volatilityLevel === setpoint.value ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <div className="text-center mb-2">
                    <span className="text-xl mr-2">{setpoint.icon}</span>
                    <span className={`text-lg font-medium ${setpoint.textColor}`}>{setpoint.label}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>{setpoint.description}</p>
                    <p className="mt-1">{setpoint.detailedText}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div 
            className="pt-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={handleGenerateData}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 ${
                isGenerating 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate New Portfolio Data'}
            </button>
          </motion.div>
        </div>
        
        <div className="md:w-80">
          <motion.div 
            className="bg-gray-50 p-5 rounded-xl shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-gray-800 mb-4">Current Data Parameters</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Generated</span>
                <span className="font-medium">{lastGenerated.timestamp.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Timeframe</span>
                <span className="font-medium">10 years (120 months)</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Scenario</span>
                <span className={`font-medium ${
                  lastGenerated.scenario === 'bullish' ? 'text-green-600' :
                  lastGenerated.scenario === 'bearish' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {formatScenario(lastGenerated.scenario)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Volatility</span>
                <span className={`font-medium ${
                  lastGenerated.volatility === 'low' ? 'text-green-600' :
                  lastGenerated.volatility === 'high' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {formatVolatility(lastGenerated.volatility)}
                </span>
              </div>
              
              <div className="mt-6 pt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Combined Effect</h4>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-700">
                    {lastGenerated.scenario === 'bullish' && lastGenerated.volatility === 'low' && (
                      "Strong returns with very stable price movements (typical late bull market)"
                    )}
                    {lastGenerated.scenario === 'bullish' && lastGenerated.volatility === 'medium' && (
                      "Strong returns with moderate price fluctuations (typical mid bull market)"
                    )}
                    {lastGenerated.scenario === 'bullish' && lastGenerated.volatility === 'high' && (
                      "Strong returns with high volatility (atypical - speculative bull market)"
                    )}
                    {lastGenerated.scenario === 'normal' && lastGenerated.volatility === 'low' && (
                      "Moderate returns with low volatility (stable growth period)"
                    )}
                    {lastGenerated.scenario === 'normal' && lastGenerated.volatility === 'medium' && (
                      "Balanced returns and volatility (typical market conditions)"
                    )}
                    {lastGenerated.scenario === 'normal' && lastGenerated.volatility === 'high' && (
                      "Moderate returns with high volatility (transitional or uncertain market)"
                    )}
                    {lastGenerated.scenario === 'bearish' && lastGenerated.volatility === 'low' && (
                      "Lower returns with subdued volatility (atypical - controlled decline)"
                    )}
                    {lastGenerated.scenario === 'bearish' && lastGenerated.volatility === 'medium' && (
                      "Lower returns with moderate volatility (early bear market)"
                    )}
                    {lastGenerated.scenario === 'bearish' && lastGenerated.volatility === 'high' && (
                      "Lower returns with extreme volatility (typical market crash scenario)"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DataGeneratorControls;