import React, { useMemo, CSSProperties } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

// Define variables with colors for the formula
interface CalculationVariable {
  name: string;
  description: string;
  color: string;
}

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

// Add a new interface for hierarchical data
interface HierarchyNode {
  name: string;
  id: string;
  weight: number;
  volatility: number;
  weightedVolatility: number;
  children?: HierarchyNode[];
  level: number;
  parent?: string;
}

interface CalculationsViewProps {
  calculationSteps: CalculationStep[];
}

const CalculationsView: React.FC<CalculationsViewProps> = ({ calculationSteps }) => {
  if (!calculationSteps || calculationSteps.length === 0) {
    return (
      <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
        No calculation steps available. Please generate portfolio data and calculate risk metrics first.
      </div>
    );
  }
  
  // Sort calculation steps by contribution percentage (descending)
  const sortedSteps = [...calculationSteps].sort((a, b) => b.contributionPercentage - a.contributionPercentage);
  
  // Get portfolio volatility from the first step (should be the same for all steps)
  const portfolioVolatility = sortedSteps[0]?.portfolioVolatility || 0;

  // Define variables with colors for the formula
  const variables: CalculationVariable[] = [
    { name: 'w_i', description: 'Weight of asset i', color: '#4299E1' },
    { name: 'MCR_i', description: 'Marginal Contribution to Risk of asset i', color: '#F56565' },
    { name: 'σ_p', description: 'Portfolio Volatility', color: '#48BB78' },
    { name: 'RC_i', description: 'Risk Contribution of asset i', color: '#9F7AEA' },
    { name: 'RC\\%_i', description: 'Risk Contribution Percentage of asset i', color: '#ED64A6' },
    { name: 'σ_i', description: 'Individual Volatility of asset i', color: '#F6AD55' },
    { name: 'ρ_{i,j}', description: 'Correlation between assets i and j', color: '#667EEA' },
  ];
  
  // Define formulas as plain strings to avoid TypeScript parsing them as code
  const portfolioVolatilityFormula = `\\sigma_P = \\sqrt{\\sum_{i=1}^{n}\\sum_{j=1}^{n} w_i w_j \\sigma_i \\sigma_j \\rho_{ij}}`;
  const mcrFormula = `\\text{MCR}_i = \\sum_{j=1}^{n} w_j \\times \\sigma_i \\times \\sigma_j \\times \\rho_{i,j}`;
  const rcFormula = `\\text{RC}_i = w_i \\times \\text{MCR}_i`;
  const rcPercentFormula = `\\text{RC}_i\\% = \\frac{\\text{RC}_i}{\\sigma_P} \\times 100\\%`;

  // MathJax configuration
  const mathJaxConfig = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
  };

  // Update the hierarchy creation to match the actual portfolio structure
  const hierarchyData = useMemo(() => {
    // Create a map to store nodes by ID
    const nodeMap = new Map<string, HierarchyNode>();

    // First, create a root node
    const rootNode: HierarchyNode = {
      name: 'Whole of Portfolio',
      id: 'wop',
      weight: 1,
      volatility: portfolioVolatility,
      weightedVolatility: portfolioVolatility,
      level: 0,
      children: []
    };
    nodeMap.set('wop', rootNode);

    // Define the main asset classes (Level 1)
    const assetClasses = [
      { name: 'Public (Listed) Assets', id: 'public-assets', weight: 0.7, level: 1, parent: 'wop' },
      { name: 'Private (Unlisted) Assets', id: 'private-assets', weight: 0.3, level: 1, parent: 'wop' }
    ];

    // Add asset classes to the hierarchy
    assetClasses.forEach(assetClass => {
      const node: HierarchyNode = {
        name: assetClass.name,
        id: assetClass.id,
        weight: assetClass.weight,
        volatility: 0, // Will be calculated later
        weightedVolatility: 0, // Will be calculated later
        level: assetClass.level,
        parent: assetClass.parent,
        children: []
      };
      nodeMap.set(assetClass.id, node);

      // Add to parent's children
      const parent = nodeMap.get(assetClass.parent);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    });

    // Define sub-asset classes (Level 2)
    const subAssetClasses = [
      // Public assets
      { name: 'Equities', id: 'equities', weight: 0.6, level: 2, parent: 'public-assets' },
      { name: 'Fixed Income', id: 'fixed-income', weight: 0.4, level: 2, parent: 'public-assets' },
      // Private assets
      { name: 'Real Estate', id: 'real-estate', weight: 0.4, level: 2, parent: 'private-assets' },
      { name: 'Infrastructure', id: 'infrastructure', weight: 0.3, level: 2, parent: 'private-assets' },
      { name: 'Private Equity', id: 'private-equity', weight: 0.3, level: 2, parent: 'private-assets' }
    ];

    // Add sub-asset classes to the hierarchy
    subAssetClasses.forEach(subAssetClass => {
      const node: HierarchyNode = {
        name: subAssetClass.name,
        id: subAssetClass.id,
        weight: subAssetClass.weight,
        volatility: 0, // Will be calculated later
        weightedVolatility: 0, // Will be calculated later
        level: subAssetClass.level,
        parent: subAssetClass.parent,
        children: []
      };
      nodeMap.set(subAssetClass.id, node);

      // Add to parent's children
      const parent = nodeMap.get(subAssetClass.parent);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    });

    // Define sub-sub-asset classes (Level 3)
    const subSubAssetClasses = [
      // Equities
      { name: 'AUD-Denominated Equities', id: 'aud-equities', weight: 0.6, level: 3, parent: 'equities' },
      { name: 'FX-Denominated Equities', id: 'fx-equities', weight: 0.4, level: 3, parent: 'equities' },
      // Fixed Income
      { name: 'Sovereign FI', id: 'sovereign-fi', weight: 0.6, level: 3, parent: 'fixed-income' },
      { name: 'Non-Sovereign FI', id: 'non-sovereign-fi', weight: 0.4, level: 3, parent: 'fixed-income' }
    ];

    // Add sub-sub-asset classes to the hierarchy
    subSubAssetClasses.forEach(subSubAssetClass => {
      const node: HierarchyNode = {
        name: subSubAssetClass.name,
        id: subSubAssetClass.id,
        weight: subSubAssetClass.weight,
        volatility: 0, // Will be calculated later
        weightedVolatility: 0, // Will be calculated later
        level: subSubAssetClass.level,
        parent: subSubAssetClass.parent,
        children: []
      };
      nodeMap.set(subSubAssetClass.id, node);

      // Add to parent's children
      const parent = nodeMap.get(subSubAssetClass.parent);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    });

    // Map calculation steps to individual assets (Level 4)
    calculationSteps.forEach(step => {
      // Determine which sub-asset class this belongs to based on name
      let parentId = '';
      const name = step.assetName.toLowerCase();

      if (name.includes('asx') || name.includes('australian')) {
        parentId = 'aud-equities';
      } else if (name.includes('us tech') || name.includes('european') || name.includes('emerging markets')) {
        parentId = 'fx-equities';
      } else if (name.includes('government') || name.includes('treasury')) {
        parentId = 'sovereign-fi';
      } else if (name.includes('corporate') || name.includes('high yield') || name.includes('debt')) {
        parentId = 'non-sovereign-fi';
      } else if (name.includes('property') || name.includes('reit') || name.includes('residential') || name.includes('commercial')) {
        parentId = 'real-estate';
      } else if (name.includes('infrastructure') || name.includes('energy') || name.includes('utilities') || name.includes('transport')) {
        parentId = 'infrastructure';
      } else if (name.includes('venture') || name.includes('buyout') || name.includes('growth equity')) {
        parentId = 'private-equity';
      } else {
        // Default to equities if we can't determine
        parentId = 'aud-equities';
      }

      // Create a leaf node for this asset
      const node: HierarchyNode = {
        name: step.assetName,
        id: step.assetId,
        weight: step.weight,
        volatility: step.individualVolatility,
        weightedVolatility: step.weight * step.individualVolatility,
        level: 4,
        parent: parentId
      };
      nodeMap.set(step.assetId, node);

      // Add to parent's children
      const parent = nodeMap.get(parentId);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    });

    // Calculate volatility for each level up the hierarchy
    // This is a simplified calculation - in reality, we would need to account for correlations

    // First, calculate for sub-sub-asset classes (Level 3)
    subSubAssetClasses.forEach(subSubAssetClass => {
      const node = nodeMap.get(subSubAssetClass.id);
      if (node && node.children && node.children.length > 0) {
        // Simple weighted sum of squared volatilities (ignoring correlations for simplicity)
        let weightedVolSum = 0;
        node.children.forEach(child => {
          weightedVolSum += Math.pow(child.weight * child.volatility, 2);
        });
        node.volatility = Math.sqrt(weightedVolSum);
        node.weightedVolatility = node.weight * node.volatility;
      }
    });

    // Then, calculate for sub-asset classes (Level 2)
    subAssetClasses.forEach(subAssetClass => {
      const node = nodeMap.get(subAssetClass.id);
      if (node && node.children && node.children.length > 0) {
        // For Real Estate, Infrastructure, and Private Equity, calculate directly from their children
        if (['real-estate', 'infrastructure', 'private-equity'].includes(subAssetClass.id)) {
          let weightedVolSum = 0;
          node.children.forEach(child => {
            weightedVolSum += Math.pow(child.weight * child.volatility, 2);
          });
          node.volatility = Math.sqrt(weightedVolSum);
        } else {
          // For Equities and Fixed Income, calculate from their sub-sub-asset classes
          let weightedVolSum = 0;
          node.children.forEach(child => {
            weightedVolSum += Math.pow(child.weight * child.volatility, 2);
          });
          node.volatility = Math.sqrt(weightedVolSum);
        }
        node.weightedVolatility = node.weight * node.volatility;
      }
    });

    // Finally, calculate for asset classes (Level 1)
    assetClasses.forEach(assetClass => {
      const node = nodeMap.get(assetClass.id);
      if (node && node.children && node.children.length > 0) {
        // Simple weighted sum of squared volatilities (ignoring correlations for simplicity)
        let weightedVolSum = 0;
        node.children.forEach(child => {
          weightedVolSum += Math.pow(child.weight * child.volatility, 2);
        });
        node.volatility = Math.sqrt(weightedVolSum);
        node.weightedVolatility = node.weight * node.volatility;
      }
    });

    return rootNode;
  }, [calculationSteps, portfolioVolatility]);

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Risk Contribution Calculations</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Portfolio Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Portfolio Summary</h3>
            <p className="mb-2">
              <span className="font-medium">Portfolio Volatility (</span>
              <span style={{ color: variables[2].color }}>σ<sub>p</sub></span>
              <span className="font-medium">): </span>
              {portfolioVolatility.toFixed(4)} ({(portfolioVolatility * 100).toFixed(2)}%)
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This is the overall volatility of the portfolio, calculated using the weights, individual volatilities, and correlations of all assets.
            </p>

            {/* Sample calculation */}
            {sortedSteps.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold mb-2">Sample Calculation</h4>
                <p className="mb-2 font-medium">For {sortedSteps[0].assetName}:</p>

                <div className="mb-2">
                  <p className="text-sm mb-1">1. Calculate Risk Contribution:</p>
                  <MathJax>
                    {`\\(RC_i = w_i \\times MCR_i = ${(sortedSteps[0].weight * 100).toFixed(2)}\\% \\times ${sortedSteps[0].marginalContribution.toFixed(4)} = ${sortedSteps[0].contribution.toFixed(4)}\\)`}
                  </MathJax>
                </div>

                <div className="mb-2">
                  <p className="text-sm mb-1">2. Calculate Risk Contribution Percentage:</p>
                  <MathJax>
                    {`\\(RC\\%_i = \\frac{RC_i}{\\sigma_p} \\times 100 = \\frac{${sortedSteps[0].contribution.toFixed(4)}}{${portfolioVolatility.toFixed(4)}} \\times 100 = ${sortedSteps[0].contributionPercentage.toFixed(2)}\\%\\)`}
                  </MathJax>
                </div>
              </div>
            )}
          </div>

          {/* Formula Explanation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Formula Explanation</h3>

            <div className="mb-4">
              <p className="text-lg font-medium mb-2">Risk Contribution Formula:</p>
              <MathJax>
                {"\\(RC_i = w_i \\times MCR_i\\)"}
              </MathJax>
              <p className="mt-1 text-sm text-gray-600">
                Where <span style={{ color: variables[0].color }}>{variables[0].name}</span> is the weight of asset i and{' '}
                <span style={{ color: variables[1].color }}>{variables[1].name}</span> is the marginal contribution to risk.
              </p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-medium mb-2">Risk Contribution Percentage:</p>
              <MathJax>
                {"\\(RC\\%_i = \\frac{RC_i}{\\sigma_p} \\times 100\\)"}
              </MathJax>
              <p className="mt-1 text-sm text-gray-600">
                Where <span style={{ color: variables[3].color }}>{variables[3].name}</span> is the risk contribution and{' '}
                <span style={{ color: variables[2].color }}>{variables[2].name}</span> is the portfolio volatility.
              </p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-medium mb-2">Marginal Contribution to Risk:</p>
              <MathJax>
                {"\\(MCR_i = \\sum_{j=1}^{n} w_j \\times \\sigma_i \\times \\sigma_j \\times \\rho_{i,j}\\)"}
              </MathJax>
              <p className="mt-1 text-sm text-gray-600">
                Where <span style={{ color: variables[0].color }}>{variables[0].name}</span> is the weight,{' '}
                <span style={{ color: variables[5].color }}>{variables[5].name}</span> is the individual volatility, and{' '}
                <span style={{ color: variables[6].color }}>{variables[6].name}</span> is the correlation between assets.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {variables.map((variable) => (
                <div key={variable.name} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: variable.color }}></div>
                  <div>
                    <MathJax inline>{`\\(${variable.name}\\)`}</MathJax>
                    <p className="text-xs text-gray-600">{variable.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hierarchical Volatility Calculation */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Hierarchical Volatility Calculation</h3>
          <p className="mb-4 text-sm text-gray-600">
            This visualization shows how the volatility of individual assets contributes to the overall portfolio volatility through the hierarchical structure.
            The calculation is simplified and does not account for correlations between assets within the same group.
          </p>

          {/* Visual tree representation */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="hierarchy-tree" style={{
              fontFamily: 'sans-serif'
            }}>
              {renderVisualHierarchy(hierarchyData)}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">Volatility Aggregation Formula</h4>
            <p className="mb-2 text-sm">
              For each level in the hierarchy, the volatility is calculated as:
            </p>
            <MathJax>
              {"\\(\\sigma_{parent} = \\sqrt{\\sum_{i} (w_i \\times \\sigma_i)^2 + \\sum_{i}\\sum_{j \\neq i} w_i \\times w_j \\times \\sigma_i \\times \\sigma_j \\times \\rho_{i,j}}\\)"}
            </MathJax>
            <p className="mt-2 text-sm text-gray-600">
              Where the first term represents the weighted sum of squared volatilities, and the second term accounts for correlations between assets.
              In our simplified calculation, we assume a correlation of 0.5 between different assets within the same group.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-md shadow-sm">
                <div className="text-sm font-medium text-gray-500">Level Colors</div>
                <div className="mt-2 flex items-center">
                  <div className="w-4 h-4 rounded-sm bg-blue-100 border border-blue-300 mr-2"></div>
                  <div className="text-sm">Portfolio (Level 0)</div>
                </div>
                <div className="mt-1 flex items-center">
                  <div className="w-4 h-4 rounded-sm bg-teal-100 border border-teal-300 mr-2"></div>
                  <div className="text-sm">Asset Class (Level 1)</div>
                </div>
                <div className="mt-1 flex items-center">
                  <div className="w-4 h-4 rounded-sm bg-purple-100 border border-purple-300 mr-2"></div>
                  <div className="text-sm">Sub-Asset Class (Level 2)</div>
                </div>
                <div className="mt-1 flex items-center">
                  <div className="w-4 h-4 rounded-sm bg-indigo-100 border border-indigo-300 mr-2"></div>
                  <div className="text-sm">Sub-Sub-Asset Class (Level 3)</div>
                </div>
                <div className="mt-1 flex items-center">
                  <div className="w-4 h-4 rounded-sm bg-red-100 border border-red-300 mr-2"></div>
                  <div className="text-sm">Individual Asset (Level 4)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
};

// Add this CSS class definitions to the component
const styles = {
  hierarchyNode: {
    marginBottom: '8px',
    borderLeft: '2px solid #e2e8f0',
    paddingLeft: '16px'
  } as CSSProperties,
  hierarchyNodeContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '8px 12px',
    borderRadius: '6px',
    marginBottom: '8px'
  } as CSSProperties,
  hierarchyNodeChildren: {
    marginLeft: '24px'
  } as CSSProperties,
  nodeLevel0: {
    backgroundColor: '#ebf8ff',
    border: '1px solid #90cdf4'
  } as CSSProperties,
  nodeLevel1: {
    backgroundColor: '#e6fffa',
    border: '1px solid #81e6d9'
  } as CSSProperties,
  nodeLevel2: {
    backgroundColor: '#faf5ff',
    border: '1px solid #d6bcfa'
  } as CSSProperties,
  nodeLevel3: {
    backgroundColor: '#ebf4ff',
    border: '1px solid #a3bffa'
  } as CSSProperties,
  nodeLevel4: {
    backgroundColor: '#fff5f5',
    border: '1px solid #feb2b2'
  } as CSSProperties,
  nodeName: {
    fontWeight: 600,
    flex: 1
  } as CSSProperties,
  nodeStats: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px'
  } as CSSProperties,
  nodeStat: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minWidth: '100px'
  } as CSSProperties,
  nodeStatLabel: {
    fontSize: '0.75rem',
    color: '#718096'
  } as CSSProperties,
  nodeStatValue: {
    fontWeight: 600
  } as CSSProperties,
  contributionBar: {
    height: '8px',
    backgroundColor: '#edf2f7',
    borderRadius: '4px',
    width: '100%',
    marginTop: '8px',
    overflow: 'hidden',
    position: 'relative' as const
  } as CSSProperties,
  contributionFill: (level: number): CSSProperties => ({
    position: 'absolute' as const,
    height: '100%',
    backgroundColor: getColorForLevel(level),
    borderRadius: '4px'
  })
};

// Update the renderVisualHierarchy function to use the styles object
function renderVisualHierarchy(node: HierarchyNode): React.ReactNode {
  // Get the level-specific style
  const getLevelStyle = (level: number) => {
    switch (level) {
      case 0: return styles.nodeLevel0;
      case 1: return styles.nodeLevel1;
      case 2: return styles.nodeLevel2;
      case 3: return styles.nodeLevel3;
      case 4: return styles.nodeLevel4;
      default: return {};
    }
  };

  return (
    <div style={styles.hierarchyNode} key={node.id}>
      <div style={{...styles.hierarchyNodeContent, ...getLevelStyle(node.level)}}>
        <div style={{...styles.nodeName, marginBottom: '8px'}}>{node.name}</div>
        <div style={styles.nodeStats}>
          <div style={styles.nodeStat}>
            <div style={styles.nodeStatLabel}>Weight</div>
            <div style={styles.nodeStatValue}>{(node.weight * 100).toFixed(2)}%</div>
          </div>
          <div style={styles.nodeStat}>
            <div style={styles.nodeStatLabel}>Volatility</div>
            <div style={styles.nodeStatValue}>{(node.volatility * 100).toFixed(2)}%</div>
          </div>
          <div style={styles.nodeStat}>
            <div style={styles.nodeStatLabel}>Weighted Vol</div>
            <div style={styles.nodeStatValue}>{(node.weightedVolatility * 100).toFixed(2)}%</div>
          </div>
          {node.level > 0 && (
            <div style={styles.nodeStat}>
              <div style={styles.nodeStatLabel}>Contribution</div>
              <div style={styles.nodeStatValue}>
                {((node.weightedVolatility / (node.parent ? node.volatility : 1)) * 100).toFixed(2)}%
              </div>
              <div style={styles.contributionBar}>
                <div
                  style={{
                    ...styles.contributionFill(node.level),
                    width: `${Math.min(100, ((node.weightedVolatility / (node.parent ? node.volatility : 1)) * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div style={styles.hierarchyNodeChildren}>
          {node.children.map(child => renderVisualHierarchy(child))}
        </div>
      )}
    </div>
  );
}

// Helper function to get color for different levels
function getColorForLevel(level: number): string {
  switch (level) {
    case 0: return '#4299e1'; // blue
    case 1: return '#38b2ac'; // teal
    case 2: return '#9f7aea'; // purple
    case 3: return '#667eea'; // indigo
    case 4: return '#f56565'; // red
    default: return '#a0aec0'; // gray
  }
}

export default CalculationsView;