import React, { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { AllocationSettings } from '../types';
import './AllocationControls.css';

interface AllocationControlsProps {
  allocations: AllocationSettings;
  onUpdateAllocations: (newAllocations: AllocationSettings) => void;
}

// Custom component for a three-part slider
const ThreePartSlider: React.FC<{
  values: [number, number, number]; // [realEstate, infrastructure, privateEquity]
  onChange: (values: [number, number, number]) => void;
}> = ({ values, onChange }) => {
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate divider positions
  const firstDividerPos = values[0];
  const secondDividerPos = values[0] + values[1];
  
  // Handle mouse down on dividers
  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(index);
  };
  
  // Handle mouse move to update positions
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging === null || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const offsetX = e.clientX - rect.left;
      
      // Calculate percentage (0-100)
      let percentage = Math.max(0, Math.min(100, (offsetX / containerWidth) * 100));
      
      // Round to nearest integer
      percentage = Math.round(percentage);
      
      // Update values based on which divider is being dragged
      if (isDragging === 0) { // First divider (between realEstate and infrastructure)
        // Ensure minimum sizes (5%)
        const maxAllowed = 95 - values[2]; // Leave at least 5% for infrastructure
        percentage = Math.min(percentage, maxAllowed);
        
        const newInfrastructure = secondDividerPos - percentage;
        onChange([percentage, newInfrastructure, values[2]]);
      } else { // Second divider (between infrastructure and privateEquity)
        // Ensure minimum sizes (5%)
        const minAllowed = values[0] + 5; // At least 5% for infrastructure
        percentage = Math.max(percentage, minAllowed);
        
        const newInfrastructure = percentage - values[0];
        const newPrivateEquity = 100 - percentage;
        onChange([values[0], newInfrastructure, newPrivateEquity]);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(null);
    };
    
    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, values, onChange]);
  
  return (
    <div className="relative pt-1 mb-4" ref={containerRef}>
      {/* Track */}
      <div className="h-8 bg-gray-200 rounded-md">
        {/* Active track for first section */}
        <div 
          className="absolute top-0 h-8 bg-blue-500 rounded-l-md"
          style={{ width: `${firstDividerPos}%`, left: '0%' }}
        />
        
        {/* Active track for second section */}
        <div 
          className="absolute top-0 h-8 bg-gray-300"
          style={{ 
            width: `${secondDividerPos - firstDividerPos}%`, 
            left: `${firstDividerPos}%` 
          }}
        />
      </div>
      
      {/* Handles */}
      <div 
        className="absolute top-0 h-8 w-4 mt-0 -ml-2 flex items-center justify-center cursor-ew-resize z-10"
        style={{ left: `${firstDividerPos}%` }}
        onMouseDown={handleMouseDown(0)}
      >
        <div className="h-4 w-4 bg-blue-500 rounded-full shadow"></div>
      </div>
      
      <div 
        className="absolute top-0 h-8 w-4 mt-0 -ml-2 flex items-center justify-center cursor-ew-resize z-10"
        style={{ left: `${secondDividerPos}%` }}
        onMouseDown={handleMouseDown(1)}
      >
        <div className="h-4 w-4 bg-blue-500 rounded-full shadow"></div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0% Real Estate</span>
        <span>100% Private Equity</span>
      </div>
    </div>
  );
};

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
  
  // Handle private asset allocation change with three-part slider
  const handlePrivateAssetAllocationChange = (values: [number, number, number]) => {
    const newAllocations = {
      ...localAllocations,
      privateAllocation: {
        realEstate: values[0],
        infrastructure: values[1],
        privateEquity: values[2]
      }
    };
    
    setLocalAllocations(newAllocations);
    onUpdateAllocations(newAllocations);
  };
  
  // Format percentage for display
  const formatPercentage = (value: number) => `${value}%`;
  
  // Get the three values for the three-part slider
  const privateAllocationValues: [number, number, number] = [
    localAllocations.privateAllocation.realEstate,
    localAllocations.privateAllocation.infrastructure,
    localAllocations.privateAllocation.privateEquity
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
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">Private Assets Allocation</label>
          <span className="text-sm text-gray-600">
            RE: {localAllocations.privateAllocation.realEstate}% / 
            IN: {localAllocations.privateAllocation.infrastructure}% / 
            PE: {localAllocations.privateAllocation.privateEquity}%
          </span>
        </div>
        
        {/* Custom three-part slider */}
        <ThreePartSlider 
          values={privateAllocationValues}
          onChange={handlePrivateAssetAllocationChange}
        />
      </div>
    </div>
  );
};

export default AllocationControls;