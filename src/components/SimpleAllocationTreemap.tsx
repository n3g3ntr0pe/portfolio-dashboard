import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PortfolioData, AssetClass, Asset, AllocationSettings } from '../types';

interface SimpleAllocationTreemapProps {
  portfolioData: PortfolioData;
  showRiskContribution?: boolean;
  riskContributions?: {
    id: string;
    name: string;
    contribution: number;
    contributionPercentage: number;
  }[];
  allocations?: AllocationSettings;
}

const SimpleAllocationTreemap: React.FC<SimpleAllocationTreemapProps> = ({
  portfolioData,
  showRiskContribution = false,
  riskContributions = [],
  allocations
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Get the parent container dimensions
  useEffect(() => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.parentElement?.getBoundingClientRect() || { width: 800, height: 600 };
      setDimensions({ width, height });
    }
  }, [portfolioData]);
  
  // Create the treemap
  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current || !portfolioData || !portfolioData.wholePortfolio || dimensions.width === 0) {
      return;
    }
    
    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10');
    
    // Create hierarchy
    const root = d3.hierarchy(portfolioData.wholePortfolio)
      .sum(d => {
        // For leaf nodes (assets), use their allocation
        if (!('children' in d) || !d.children || d.children.length === 0) {
          return d.allocation;
        }
        // For non-leaf nodes (asset classes), sum will be calculated from children
        return 0;
      });
    
    // Create treemap layout
    const treemap = d3.treemap<AssetClass | Asset>()
      .size([dimensions.width, dimensions.height])
      .paddingOuter(4)
      .paddingTop(20)
      .paddingInner(1)
      .round(true);
    
    // Apply treemap layout
    treemap(root);
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);
    
    // Color scale based on depth
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['0', '1', '2', '3', '4'])
      .range(['#4299E1', '#48BB78', '#F6AD55', '#F56565', '#9F7AEA']);
    
    // Risk contribution color scale (red to green)
    const riskColorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([30, 0]); // Higher risk contribution is red, lower is green
    
    // Create cell groups
    const cell = svg.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);
    
    // Add rectangles
    cell.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => {
        // If showing risk contribution and this is a leaf node, color by risk
        if (showRiskContribution && d.children === undefined) {
          const riskData = riskContributions.find(r => r.id === d.data.id);
          if (riskData) {
            return riskColorScale(riskData.contributionPercentage);
          }
        }
        // Otherwise, color by depth
        return colorScale(d.depth.toString());
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', (event, d) => {
        // Show tooltip
        tooltip.style('visibility', 'visible');
        
        // Tooltip content
        let content = `<strong>${d.data.name}</strong><br>Allocation: ${d.data.allocation.toFixed(1)}%`;
        
        // Add risk contribution if available
        if (showRiskContribution && d.children === undefined) {
          const riskData = riskContributions.find(r => r.id === d.data.id);
          if (riskData) {
            content += `<br>Risk Contribution: ${riskData.contributionPercentage.toFixed(1)}%`;
          }
        }
        
        tooltip.html(content);
        
        // Position tooltip
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mousemove', (event) => {
        // Update tooltip position
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', () => {
        // Hide tooltip
        tooltip.style('visibility', 'hidden');
      });
    
    // Add labels for non-leaf nodes
    cell.filter(d => d.depth < 3)
      .append('text')
      .attr('x', 4)
      .attr('y', 14)
      .attr('fill', '#333')
      .attr('font-weight', d => d.depth === 0 ? 'bold' : 'normal')
      .attr('font-size', d => d.depth === 0 ? '14px' : '12px')
      .text(d => d.data.name);
    
    // Add allocation percentages for leaf nodes with enough space
    cell.filter(d => d.depth >= 3 && (d.x1 - d.x0) > 40 && (d.y1 - d.y0) > 20)
      .append('text')
      .attr('x', 4)
      .attr('y', 14)
      .attr('fill', '#333')
      .attr('font-size', '10px')
      .text(d => d.data.name);
    
    // Add legend
    if (showRiskContribution) {
      const legendWidth = 200;
      const legendHeight = 20;
      const legendX = dimensions.width - legendWidth - 20;
      const legendY = dimensions.height - legendHeight - 20;
      
      // Create gradient
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'risk-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', riskColorScale(30));
      
      gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', riskColorScale(15));
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', riskColorScale(0));
      
      // Add legend rectangle
      svg.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'url(#risk-gradient)');
      
      // Add legend labels
      svg.append('text')
        .attr('x', legendX)
        .attr('y', legendY - 5)
        .attr('font-size', '10px')
        .attr('text-anchor', 'start')
        .text('Higher Risk');
      
      svg.append('text')
        .attr('x', legendX + legendWidth)
        .attr('y', legendY - 5)
        .attr('font-size', '10px')
        .attr('text-anchor', 'end')
        .text('Lower Risk');
    }
    
  }, [portfolioData, dimensions, showRiskContribution, riskContributions, allocations]);
  
  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div ref={tooltipRef} className="absolute top-0 left-0 pointer-events-none"></div>
    </div>
  );
};

export default SimpleAllocationTreemap;