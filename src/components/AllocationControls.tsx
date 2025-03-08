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
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Public vs Private</span>
          <span className="text-sm text-gray-500">{formatPercentage(localAllocations.publicVsPrivate)} Public</span>
        </div>
        <Slider
          min={0}
          max={100}
          value={localAllocations.publicVsPrivate}
          onChange={handlePublicPrivateChange}
          trackStyle={{ backgroundColor: '#4299E1' }}
          handleStyle={{ borderColor: '#4299E1' }}
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0% Public</span>
          <span>100% Public</span>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Public Assets Allocation</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Equities vs Fixed Income</span>
              <span className="text-sm text-gray-500">{formatPercentage(localAllocations.equitiesVsFixedIncome)} Equities</span>
            </div>
            <Slider
              min={0}
              max={100}
              value={localAllocations.equitiesVsFixedIncome}
              onChange={handleEquitiesFixedIncomeChange}
              trackStyle={{ backgroundColor: '#48BB78' }}
              handleStyle={{ borderColor: '#48BB78' }}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0% Equities</span>
              <span>100% Equities</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">AUD vs FX (Equities)</span>
              <span className="text-sm text-gray-500">{formatPercentage(localAllocations.audVsFx)} AUD</span>
            </div>
            <Slider
              min={0}
              max={100}
              value={localAllocations.audVsFx}
              onChange={handleAudFxChange}
              trackStyle={{ backgroundColor: '#48BB78' }}
              handleStyle={{ borderColor: '#48BB78' }}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0% AUD</span>
              <span>100% AUD</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Sovereign vs Non-Sovereign (Fixed Income)</span>
              <span className="text-sm text-gray-500">{formatPercentage(localAllocations.sovereignVsNonSovereign)} Sovereign</span>
            </div>
            <Slider
              min={0}
              max={100}
              value={localAllocations.sovereignVsNonSovereign}
              onChange={handleSovereignNonSovereignChange}
              trackStyle={{ backgroundColor: '#48BB78' }}
              handleStyle={{ borderColor: '#48BB78' }}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0% Sovereign</span>
              <span>100% Sovereign</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Private Assets Allocation</h3>
          <span className={`text-xs ${privateTotal === 100 ? 'text-green-500' : 'text-red-500'}`}>
            Total: {privateTotal}%
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Real Estate</span>
              <span className="text-sm text-gray-500">{formatPercentage(localAllocations.privateAllocation.realEstate)}</span>
            </div>
            <Slider
              min={0}
              max={100}
              value={localAllocations.privateAllocation.realEstate}
              onChange={handleRealEstateChange}
              trackStyle={{ backgroundColor: '#F6AD55' }}
              handleStyle={{ borderColor: '#F6AD55' }}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Infrastructure</span>
              <span className="text-sm text-gray-500">{formatPercentage(localAllocations.privateAllocation.infrastructure)}</span>
            </div>
            <Slider
              min={0}
              max={100 - localAllocations.privateAllocation.realEstate}
              value={localAllocations.privateAllocation.infrastructure}
              onChange={handleInfrastructureChange}
              trackStyle={{ backgroundColor: '#F6AD55' }}
              handleStyle={{ borderColor: '#F6AD55' }}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Private Equity</span>
              <span className="text-sm text-gray-500">{formatPercentage(localAllocations.privateAllocation.privateEquity)}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${localAllocations.privateAllocation.privateEquity}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Automatically calculated: 100% - Real Estate - Infrastructure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationControls;