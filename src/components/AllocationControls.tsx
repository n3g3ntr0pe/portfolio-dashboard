import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import Range from 'rc-slider';
import 'rc-slider/assets/index.css';
import { AllocationSettings } from '../types';
import './AllocationControls.css';

interface AllocationControlsProps {
  allocations: AllocationSettings;
  onUpdateAllocations: (newAllocations: AllocationSettings) => void;
}

const AllocationControls: React.FC<AllocationControlsProps> = ({ allocations, onUpdateAllocations }) => {
  const [localAllocations, setLocalAllocations] = useState<AllocationSettings>(allocations);
  
  // Update local allocations when props change
  useEffect(() => {
    setLocalAllocations(allocations);
  }, [allocations]);
  
  // Verify private allocation sums to 100%
  useEffect(() => {
    const total = localAllocations.privateAllocation.realEstate + 
                  localAllocations.privateAllocation.infrastructure + 
                  localAllocations.privateAllocation.privateEquity;
    
    if (Math.abs(total - 100) > 0.01) {
      console.warn(`Private allocation does not sum to 100%: ${total}%`);
    }
  }, [localAllocations.privateAllocation]);
  
  // Handle public vs private allocation change
  const handlePublicPrivateChange = (value: number | number[]) => {
    if (Array.isArray(value)) return; // Ignore array values
    const newAllocations = {
      ...localAllocations,
      publicVsPrivate: value
    };
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Handle equities vs fixed income allocation change
  const handleEquitiesFixedIncomeChange = (value: number | number[]) => {
    if (Array.isArray(value)) return; // Ignore array values
    const newAllocations = {
      ...localAllocations,
      equitiesVsFixedIncome: value
    };
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Handle AUD vs FX allocation change
  const handleAudFxChange = (value: number | number[]) => {
    if (Array.isArray(value)) return; // Ignore array values
    const newAllocations = {
      ...localAllocations,
      audVsFx: value
    };
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Handle sovereign vs non-sovereign allocation change
  const handleSovereignNonSovereignChange = (value: number | number[]) => {
    if (Array.isArray(value)) return; // Ignore array values
    const newAllocations = {
      ...localAllocations,
      sovereignVsNonSovereign: value
    };
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Handle private asset allocation change with multi-handle slider
  const handlePrivateAssetAllocationChange = (values: number[]) => {
    if (!Array.isArray(values) || values.length !== 2) return;
    
    // Calculate the three sections based on the two handle positions
    const realEstate = values[0];
    const infrastructure = values[1] - values[0];
    const privateEquity = 100 - values[1];
    
    const newAllocations = {
      ...localAllocations,
      privateAllocation: {
        realEstate,
        infrastructure,
        privateEquity
      }
    };
    
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Format percentage for display
  const formatPercentage = (value: number) => `${value}%`;
  
  // Calculate the values for the Range slider
  const privateRangeValues = [
    localAllocations.privateAllocation.realEstate,
    localAllocations.privateAllocation.realEstate + localAllocations.privateAllocation.infrastructure
  ];
  
  return (
    <div className="allocation-controls space-y-6">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">Public vs Private</label>
          <span className="text-sm text-gray-600">{localAllocations.publicVsPrivate}% / {100 - localAllocations.publicVsPrivate}%</span>
        </div>
        <div className="relative pt-1">
          <Slider
            min={0}
            max={100}
            value={localAllocations.publicVsPrivate}
            onChange={handlePublicPrivateChange}
            trackStyle={{ backgroundColor: '#3B82F6', height: 8 }}
            railStyle={{ backgroundColor: '#E5E7EB', height: 8 }}
            handleStyle={{ 
              borderColor: '#3B82F6', 
              backgroundColor: '#3B82F6', 
              height: 16, 
              width: 16, 
              marginTop: -4,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% Public</span>
            <span>100% Public</span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">Equities vs Fixed Income</label>
          <span className="text-sm text-gray-600">{localAllocations.equitiesVsFixedIncome}% / {100 - localAllocations.equitiesVsFixedIncome}%</span>
        </div>
        <div className="relative pt-1">
          <Slider
            min={0}
            max={100}
            value={localAllocations.equitiesVsFixedIncome}
            onChange={handleEquitiesFixedIncomeChange}
            trackStyle={{ backgroundColor: '#3B82F6', height: 8 }}
            railStyle={{ backgroundColor: '#E5E7EB', height: 8 }}
            handleStyle={{ 
              borderColor: '#3B82F6', 
              backgroundColor: '#3B82F6', 
              height: 16, 
              width: 16, 
              marginTop: -4,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% Equities</span>
            <span>100% Equities</span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">AUD vs FX Equities</label>
          <span className="text-sm text-gray-600">{localAllocations.audVsFx}% / {100 - localAllocations.audVsFx}%</span>
        </div>
        <div className="relative pt-1">
          <Slider
            min={0}
            max={100}
            value={localAllocations.audVsFx}
            onChange={handleAudFxChange}
            trackStyle={{ backgroundColor: '#3B82F6', height: 8 }}
            railStyle={{ backgroundColor: '#E5E7EB', height: 8 }}
            handleStyle={{ 
              borderColor: '#3B82F6', 
              backgroundColor: '#3B82F6', 
              height: 16, 
              width: 16, 
              marginTop: -4,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% AUD</span>
            <span>100% AUD</span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">Sovereign vs Non-Sovereign FI</label>
          <span className="text-sm text-gray-600">{localAllocations.sovereignVsNonSovereign}% / {100 - localAllocations.sovereignVsNonSovereign}%</span>
        </div>
        <div className="relative pt-1">
          <Slider
            min={0}
            max={100}
            value={localAllocations.sovereignVsNonSovereign}
            onChange={handleSovereignNonSovereignChange}
            trackStyle={{ backgroundColor: '#3B82F6', height: 8 }}
            railStyle={{ backgroundColor: '#E5E7EB', height: 8 }}
            handleStyle={{ 
              borderColor: '#3B82F6', 
              backgroundColor: '#3B82F6', 
              height: 16, 
              width: 16, 
              marginTop: -4,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% Sovereign</span>
            <span>100% Sovereign</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Private Assets Allocation</h3>
        
        {/* Display the current allocation percentages */}
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div>
            <span className="text-sm text-gray-600">Real Estate:</span>
            <span className="text-sm font-medium ml-1">{localAllocations.privateAllocation.realEstate}%</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Infrastructure:</span>
            <span className="text-sm font-medium ml-1">{localAllocations.privateAllocation.infrastructure}%</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Private Equity:</span>
            <span className="text-sm font-medium ml-1">{localAllocations.privateAllocation.privateEquity}%</span>
          </div>
        </div>
        
        {/* Visualization of the three sections */}
        <div className="h-8 flex rounded-md overflow-hidden mb-4">
          <div 
            className="bg-blue-400 flex items-center justify-center text-xs text-white"
            style={{ width: `${localAllocations.privateAllocation.realEstate}%` }}
          >
            {localAllocations.privateAllocation.realEstate >= 10 && 'RE'}
          </div>
          <div 
            className="bg-green-400 flex items-center justify-center text-xs text-white"
            style={{ width: `${localAllocations.privateAllocation.infrastructure}%` }}
          >
            {localAllocations.privateAllocation.infrastructure >= 10 && 'IN'}
          </div>
          <div 
            className="bg-purple-400 flex items-center justify-center text-xs text-white"
            style={{ width: `${localAllocations.privateAllocation.privateEquity}%` }}
          >
            {localAllocations.privateAllocation.privateEquity >= 10 && 'PE'}
          </div>
        </div>
        
        {/* Range slider with two handles */}
        <div className="relative pt-1 mb-4">
          <Range
            min={0}
            max={100}
            value={privateRangeValues}
            onChange={handlePrivateAssetAllocationChange}
            pushable={5} // Minimum 5% for each section
            trackStyle={[
              { backgroundColor: '#3B82F6', height: 8 }, // Real Estate (blue)
              { backgroundColor: '#10B981', height: 8 }  // Infrastructure (green)
            ]}
            railStyle={{ backgroundColor: '#A855F7', height: 8 }} // Private Equity (purple)
            handleStyle={[
              { // First handle (Real Estate/Infrastructure boundary)
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F6',
                height: 16,
                width: 16,
                marginTop: -4,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              },
              { // Second handle (Infrastructure/Private Equity boundary)
                borderColor: '#10B981',
                backgroundColor: '#10B981',
                height: 16,
                width: 16,
                marginTop: -4,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }
            ]}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-between text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-sm mr-1"></div>
            <span>Real Estate</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-sm mr-1"></div>
            <span>Infrastructure</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-400 rounded-sm mr-1"></div>
            <span>Private Equity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationControls;