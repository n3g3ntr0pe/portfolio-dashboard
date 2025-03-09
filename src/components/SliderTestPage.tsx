import React, { useState, useEffect, useRef } from 'react';

// Helper function for pie chart arc
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y,
    "Z"
  ].join(" ");
};

const SliderTestPage: React.FC = () => {
  // State for the allocation values
  const [realEstate, setRealEstate] = useState<number>(35);
  const [infrastructure, setInfrastructure] = useState<number>(35);
  const [privateEquity, setPrivateEquity] = useState<number>(30);
  
  // State for active section in stacked bar chart
  const [activeSection, setActiveSection] = useState<string>('realEstate');
  
  // Refs for SVG elements
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Ensure the three values always sum to 100%
  useEffect(() => {
    const total = realEstate + infrastructure + privateEquity;
    if (Math.abs(total - 100) > 0.01) {
      // Adjust privateEquity to make the total 100%
      setPrivateEquity(100 - realEstate - infrastructure);
    }
  }, [realEstate, infrastructure]);
  
  // Handle changes to the custom slider
  const handleCustomSliderChange = (values: [number, number]) => {
    const newRealEstate = values[0];
    const newInfrastructure = values[1] - values[0];
    const newPrivateEquity = 100 - values[1];
    
    setRealEstate(newRealEstate);
    setInfrastructure(newInfrastructure);
    setPrivateEquity(newPrivateEquity);
  };
  
  // Handle changes to the active slider in stacked bar chart
  const handleActiveSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    
    if (activeSection === 'realEstate') {
      // Adjust infrastructure to maintain the total
      const newInfrastructure = Math.max(5, infrastructure - (value - realEstate));
      setRealEstate(value);
      setInfrastructure(newInfrastructure);
    } else if (activeSection === 'infrastructure') {
      setInfrastructure(value);
    } else {
      // Adjust infrastructure to maintain the total
      const newInfrastructure = Math.max(5, 100 - value - realEstate);
      setInfrastructure(newInfrastructure);
      setPrivateEquity(value);
    }
  };
  
  // Handle direct input changes
  const handleRealEstateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(90, Math.max(5, parseInt(e.target.value, 10) || 0));
    setRealEstate(value);
    
    // Adjust infrastructure to maintain the total
    const remaining = 100 - value;
    const ratio = infrastructure / (infrastructure + privateEquity);
    const newInfrastructure = Math.round(remaining * ratio);
    setInfrastructure(newInfrastructure);
  };
  
  const handleInfrastructureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(90, Math.max(5, parseInt(e.target.value, 10) || 0));
    setInfrastructure(value);
    
    // Adjust privateEquity to maintain the total
    setPrivateEquity(100 - realEstate - value);
  };
  
  const handlePrivateEquityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(90, Math.max(5, parseInt(e.target.value, 10) || 0));
    setPrivateEquity(value);
    
    // Adjust infrastructure to maintain the total
    setInfrastructure(100 - realEstate - value);
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Slider Paradigms Test Page</h1>
      
      <div className="space-y-12">
        {/* 1. Custom Slider (Current Implementation) */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">1. Custom Slider (Current Implementation)</h2>
          <div className="mb-2 flex justify-between">
            <span>RE: {realEstate}%</span>
            <span>IN: {infrastructure}%</span>
            <span>PE: {privateEquity}%</span>
          </div>
          <div className="relative h-8">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-200 rounded-md">
              <div 
                className="absolute top-0 h-8 bg-blue-500 rounded-l-md"
                style={{ width: `${realEstate}%`, left: '0%' }}
              />
              <div 
                className="absolute top-0 h-8 bg-green-500"
                style={{ width: `${infrastructure}%`, left: `${realEstate}%` }}
              />
              <div 
                className="absolute top-0 h-8 bg-purple-500 rounded-r-md"
                style={{ width: `${privateEquity}%`, left: `${realEstate + infrastructure}%` }}
              />
            </div>
            
            {/* Handles */}
            <div 
              className="absolute top-0 h-8 w-4 mt-0 -ml-2 flex items-center justify-center cursor-ew-resize z-10"
              style={{ left: `${realEstate}%` }}
            >
              <div className="h-4 w-4 bg-blue-500 rounded-full shadow"></div>
            </div>
            <div 
              className="absolute top-0 h-8 w-4 mt-0 -ml-2 flex items-center justify-center cursor-ew-resize z-10"
              style={{ left: `${realEstate + infrastructure}%` }}
            >
              <div className="h-4 w-4 bg-green-500 rounded-full shadow"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% Real Estate</span>
            <span>100% Private Equity</span>
          </div>
        </div>
        
        {/* 2. SVG-Based Gradient Slider */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">2. SVG-Based Gradient Slider</h2>
          <div className="mb-2 flex justify-between">
            <span>RE: {realEstate}%</span>
            <span>IN: {infrastructure}%</span>
            <span>PE: {privateEquity}%</span>
          </div>
          <div className="relative h-12">
            <svg width="100%" height="40" className="w-full">
              <defs>
                <linearGradient id="allocation-gradient" x1="0%" y1="0%" x2="100%" y1="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset={`${realEstate}%`} stopColor="#3B82F6" />
                  <stop offset={`${realEstate}%`} stopColor="#10B981" />
                  <stop offset={`${realEstate + infrastructure}%`} stopColor="#10B981" />
                  <stop offset={`${realEstate + infrastructure}%`} stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
              <rect x="0" y="8" width="100%" height="16" rx="8" fill="url(#allocation-gradient)" />
              
              {/* Handles */}
              <circle 
                cx={`${realEstate}%`} 
                cy="16" 
                r="8" 
                fill="white" 
                stroke="#3B82F6" 
                strokeWidth="2"
                className="cursor-ew-resize"
              />
              <circle 
                cx={`${realEstate + infrastructure}%`} 
                cy="16" 
                r="8" 
                fill="white" 
                stroke="#10B981" 
                strokeWidth="2"
                className="cursor-ew-resize"
              />
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% Real Estate</span>
            <span>100% Private Equity</span>
          </div>
        </div>
        
        {/* 3. Segmented Control with Draggable Dividers */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">3. Segmented Control with Draggable Dividers</h2>
          <div className="mb-2 flex justify-between">
            <span>RE: {realEstate}%</span>
            <span>IN: {infrastructure}%</span>
            <span>PE: {privateEquity}%</span>
          </div>
          <div className="relative h-10 flex rounded-md overflow-hidden">
            <div 
              className="bg-blue-500 flex items-center justify-center text-white text-sm font-medium"
              style={{ width: `${realEstate}%` }}
            >
              {realEstate >= 15 && 'Real Estate'}
            </div>
            <div className="w-1 bg-white h-full cursor-ew-resize z-10"></div>
            <div 
              className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
              style={{ width: `${infrastructure}%` }}
            >
              {infrastructure >= 15 && 'Infrastructure'}
            </div>
            <div className="w-1 bg-white h-full cursor-ew-resize z-10"></div>
            <div 
              className="bg-purple-500 flex items-center justify-center text-white text-sm font-medium"
              style={{ width: `${privateEquity}%` }}
            >
              {privateEquity >= 15 && 'Private Equity'}
            </div>
          </div>
        </div>
        
        {/* 4. Stacked Bar Chart with Interactive Resizing */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">4. Stacked Bar Chart with Interactive Resizing</h2>
          <div className="mb-2 flex justify-between">
            <span>RE: {realEstate}%</span>
            <span>IN: {infrastructure}%</span>
            <span>PE: {privateEquity}%</span>
          </div>
          <div className="flex h-10 rounded-md overflow-hidden mb-4">
            <div 
              className="bg-blue-500 flex items-center justify-center text-white text-sm font-medium cursor-pointer"
              style={{ width: `${realEstate}%` }}
              onClick={() => setActiveSection('realEstate')}
            >
              {realEstate >= 15 && 'RE'}
            </div>
            <div 
              className="bg-green-500 flex items-center justify-center text-white text-sm font-medium cursor-pointer"
              style={{ width: `${infrastructure}%` }}
              onClick={() => setActiveSection('infrastructure')}
            >
              {infrastructure >= 15 && 'IN'}
            </div>
            <div 
              className="bg-purple-500 flex items-center justify-center text-white text-sm font-medium cursor-pointer"
              style={{ width: `${privateEquity}%` }}
              onClick={() => setActiveSection('privateEquity')}
            >
              {privateEquity >= 15 && 'PE'}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">{activeSection === 'realEstate' ? 'Real Estate' : activeSection === 'infrastructure' ? 'Infrastructure' : 'Private Equity'}</span>
            <input 
              type="range" 
              min="5" 
              max="90" 
              value={activeSection === 'realEstate' ? realEstate : activeSection === 'infrastructure' ? infrastructure : privateEquity} 
              onChange={handleActiveSliderChange}
              className="flex-grow"
            />
            <span className="text-sm font-medium">{activeSection === 'realEstate' ? realEstate : activeSection === 'infrastructure' ? infrastructure : privateEquity}%</span>
          </div>
        </div>
        
        {/* 5. Pie Chart with Draggable Segments */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">5. Pie Chart with Draggable Segments</h2>
          <div className="mb-2 flex justify-between">
            <span>RE: {realEstate}%</span>
            <span>IN: {infrastructure}%</span>
            <span>PE: {privateEquity}%</span>
          </div>
          <div className="flex justify-center">
            <svg width="200" height="200" viewBox="-100 -100 200 200" ref={svgRef}>
              <path 
                d={describeArc(0, 0, 80, 0, realEstate * 3.6)} 
                fill="#3B82F6" 
                stroke="#fff"
                strokeWidth="1"
                className="cursor-pointer"
              />
              <path 
                d={describeArc(0, 0, 80, realEstate * 3.6, (realEstate + infrastructure) * 3.6)} 
                fill="#10B981" 
                stroke="#fff"
                strokeWidth="1"
                className="cursor-pointer"
              />
              <path 
                d={describeArc(0, 0, 80, (realEstate + infrastructure) * 3.6, 360)} 
                fill="#A855F7" 
                stroke="#fff"
                strokeWidth="1"
                className="cursor-pointer"
              />
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="14" fontWeight="bold">
                Allocation
              </text>
            </svg>
          </div>
          <div className="flex justify-center mt-4 space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
              <span>Real Estate</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
              <span>Infrastructure</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-sm mr-1"></div>
              <span>Private Equity</span>
            </div>
          </div>
        </div>
        
        {/* 6. Numeric Input with Visual Feedback */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">6. Numeric Input with Visual Feedback</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="w-32 text-sm font-medium">Real Estate</label>
              <input 
                type="number" 
                min="5" 
                max="90" 
                value={realEstate} 
                onChange={handleRealEstateChange}
                className="w-16 p-1 border rounded"
              />
              <div className="flex-grow h-6 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${realEstate}%` }}></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-32 text-sm font-medium">Infrastructure</label>
              <input 
                type="number" 
                min="5" 
                max="90" 
                value={infrastructure} 
                onChange={handleInfrastructureChange}
                className="w-16 p-1 border rounded"
              />
              <div className="flex-grow h-6 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${infrastructure}%` }}></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-32 text-sm font-medium">Private Equity</label>
              <input 
                type="number" 
                min="5" 
                max="90" 
                value={privateEquity} 
                onChange={handlePrivateEquityChange}
                className="w-16 p-1 border rounded"
              />
              <div className="flex-grow h-6 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${privateEquity}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 7. Circular Slider */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">7. Circular Slider</h2>
          <div className="mb-2 flex justify-between">
            <span>RE: {realEstate}%</span>
            <span>IN: {infrastructure}%</span>
            <span>PE: {privateEquity}%</span>
          </div>
          <div className="flex justify-center">
            <svg width="200" height="200" viewBox="-100 -100 200 200">
              {/* Background circle */}
              <circle cx="0" cy="0" r="80" fill="none" stroke="#E5E7EB" strokeWidth="16" />
              
              {/* Real Estate segment */}
              <circle 
                cx="0" 
                cy="0" 
                r="80" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="16" 
                strokeDasharray={`${realEstate * 5.024} ${502.4 - realEstate * 5.024}`} 
                transform="rotate(-90)" 
              />
              
              {/* Infrastructure segment */}
              <circle 
                cx="0" 
                cy="0" 
                r="80" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="16" 
                strokeDasharray={`${infrastructure * 5.024} ${502.4 - infrastructure * 5.024}`} 
                strokeDashoffset={-realEstate * 5.024} 
                transform="rotate(-90)" 
              />
              
              {/* Private Equity segment (remaining) */}
              <circle 
                cx="0" 
                cy="0" 
                r="80" 
                fill="none" 
                stroke="#A855F7" 
                strokeWidth="16" 
                strokeDasharray={`${privateEquity * 5.024} ${502.4 - privateEquity * 5.024}`} 
                strokeDashoffset={-(realEstate + infrastructure) * 5.024} 
                transform="rotate(-90)" 
              />
              
              {/* Center text */}
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">
                Allocation
              </text>
              
              {/* Handles (simplified for demo) */}
              <circle 
                cx={80 * Math.cos(Math.PI * 2 * realEstate / 100 - Math.PI / 2)} 
                cy={80 * Math.sin(Math.PI * 2 * realEstate / 100 - Math.PI / 2)} 
                r="6" 
                fill="white" 
                stroke="#3B82F6" 
                strokeWidth="2"
              />
              <circle 
                cx={80 * Math.cos(Math.PI * 2 * (realEstate + infrastructure) / 100 - Math.PI / 2)} 
                cy={80 * Math.sin(Math.PI * 2 * (realEstate + infrastructure) / 100 - Math.PI / 2)} 
                r="6" 
                fill="white" 
                stroke="#10B981" 
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex justify-center mt-4 space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
              <span>Real Estate</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
              <span>Infrastructure</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-sm mr-1"></div>
              <span>Private Equity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderTestPage; 