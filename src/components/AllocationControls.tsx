import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { AllocationSettings } from '../types';

interface AllocationControlsProps {
  allocations: AllocationSettings;
  onUpdateAllocations: (newAllocations: AllocationSettings) => void;
}

const AllocationControls: React.FC<AllocationControlsProps> = ({
  allocations,
  onUpdateAllocations
}) => {
  const [localAllocations, setLocalAllocations] = useState<AllocationSettings>(allocations);
  const [privateTotal, setPrivateTotal] = useState<number>(100);
  
  // Update local allocations when props change
  useEffect(() => {
    setLocalAllocations(allocations);
  }, [allocations]);
  
  // Update private total when private allocations change
  useEffect(() => {
    const total = localAllocations.privateAllocation.realEstate +
                 localAllocations.privateAllocation.infrastructure +
                 localAllocations.privateAllocation.privateEquity;
    setPrivateTotal(total);
  }, [localAllocations.privateAllocation]);
  
  // Handle public vs private allocation change
  const handlePublicPrivateChange = (value: number) => {
    const newAllocations = {
      ...localAllocations,
      publicVsPrivate: value
    };
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Handle equities vs fixed income allocation change
  const handleEquitiesFixedIncomeChange = (value: number) => {
    const newAllocations = {
      ...localAllocations,
      equitiesVsFixedIncome: value
    };
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Handle AUD vs FX allocation change
  const handleAudFxChange = (value: number) => {
    const newAllocations = {
      ...localAllocations,
      audVsFx: value
    };
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Handle sovereign vs non-sovereign allocation change
  const handleSovereignNonSovereignChange = (value: number) => {
    const newAllocations = {
      ...localAllocations,
      sovereignVsNonSovereign: value
    };
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Handle real estate allocation change
  const handleRealEstateChange = (value: number) => {
    // Calculate remaining allocation for other private assets
    const remaining = 100 - value;
    
    // Distribute remaining allocation proportionally between infrastructure and private equity
    const currentInfrastructure = localAllocations.privateAllocation.infrastructure;
    const currentPrivateEquity = localAllocations.privateAllocation.privateEquity;
    const currentTotal = currentInfrastructure + currentPrivateEquity;
    
    let newInfrastructure = currentInfrastructure;
    let newPrivateEquity = currentPrivateEquity;
    
    if (currentTotal > 0) {
      newInfrastructure = Math.round((currentInfrastructure / currentTotal) * remaining);
      newPrivateEquity = remaining - newInfrastructure;
    } else {
      newInfrastructure = Math.round(remaining / 2);
      newPrivateEquity = remaining - newInfrastructure;
    }
    
    const newAllocations = {
      ...localAllocations,
      privateAllocation: {
        realEstate: value,
        infrastructure: newInfrastructure,
        privateEquity: newPrivateEquity
      }
    };
    
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Handle infrastructure allocation change
  const handleInfrastructureChange = (value: number) => {
    // Calculate remaining allocation for other private assets
    const realEstate = localAllocations.privateAllocation.realEstate;
    const remaining = 100 - realEstate - value;
    
    const newAllocations = {
      ...localAllocations,
      privateAllocation: {
        realEstate,
        infrastructure: value,
        privateEquity: remaining
      }
    };
    
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Format percentage for display
  const formatPercentage = (value: number) => `${value}%`;
  
  return (
    <div className="space-y-6">
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
        
        <div className="h-6 flex rounded-md overflow-hidden">
          <div 
            className="bg-blue-400 flex items-center justify-center text-xs text-white"
            style={{ width: `${localAllocations.privateAllocation.realEstate}%` }}
          >
            RE
          </div>
          <div 
            className="bg-green-400 flex items-center justify-center text-xs text-white"
            style={{ width: `${localAllocations.privateAllocation.infrastructure}%` }}
          >
            IN
          </div>
          <div 
            className="bg-purple-400 flex items-center justify-center text-xs text-white"
            style={{ width: `${localAllocations.privateAllocation.privateEquity}%` }}
          >
            PE
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default AllocationControls;