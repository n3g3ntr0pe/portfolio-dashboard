# Portfolio Dashboard

A comprehensive dashboard for analyzing investment portfolios with advanced risk and performance metrics.

## Project Overview

This is a React-based investment portfolio dashboard application built with TypeScript, Vite, and Chart.js. The dashboard provides comprehensive analysis tools for investment portfolios, including allocation visualization, performance metrics, risk analysis, and time series data.

The application is designed for financial analysts and portfolio managers who need to:
- Visualize portfolio composition and asset allocation
- Track performance against benchmarks over different time periods
- Analyze risk metrics to assess portfolio stability
- Make data-driven decisions about portfolio adjustments

## Current State (March 2025)

The application has been updated to consistently use 10 years (120 months) of data for all analyses, regardless of the selected time period. This ensures consistent risk and performance calculations across the application. Key features include:

- **Fixed 10-Year Data Period**: All components now use a consistent 10-year (120 months) dataset
- **Time Period Selection**: UI still allows selection of different time periods for analysis views
- **Detailed Calculation View**: Added a dedicated view for showing calculation steps when enabled
- **Risk Contribution Visualization**: Treemap visualization with risk contribution overlay
- **Performance Metrics**: Comprehensive performance analysis against selected benchmarks
- **Responsive Design**: Optimized for various screen sizes with appropriate layouts

## Portfolio Structure

The investment portfolio follows this hierarchical structure:

Top Level: Whole of Portfolio (WoP)
├── Public (Listed) Assets
│   ├── Equities
│   │   ├── AUD-Denominated Equities
│   │   │   ├── ASX 200 ETF
│   │   │   ├── Australian Blue Chip Fund
│   │   │   └── Australian Small Cap Fund
│   │   └── FX-Denominated Equities
│   │       ├── US Tech Fund
│   │       ├── European Equity Fund
│   │       └── Emerging Markets Fund
│   └── Fixed Income
│       ├── Sovereign FI
│       │   ├── Australian Government Bonds
│       │   ├── US Treasury Bonds
│       │   └── Global Government Bond Fund
│       └── Non-Sovereign FI
│           ├── Investment Grade Corporate Bonds
│           ├── High Yield Bond Fund
│           └── Emerging Market Debt
└── Private (Unlisted) Assets
    ├── Real Estate
    │   ├── Commercial Property Trust
    │   ├── Residential Property Fund
    │   └── Industrial REIT
    ├── Infrastructure
    │   ├── Global Infrastructure Fund
    │   ├── Renewable Energy Assets
    │   └── Transport & Utilities
    └── Private Equity
        ├── Venture Capital Fund
        ├── Growth Equity Fund
        └── Buyout Fund

## Features

- **Portfolio Allocation Visualization**: Interactive treemap for visualizing portfolio allocations
  - Hierarchical view of asset classes
  - Color-coded by asset class
  - Risk contribution visualization overlay
  
- **Performance Analysis**: Track portfolio performance against benchmarks
  - Total return calculations
  - Alpha and beta measurements
  - Rolling returns analysis
  - Benchmark comparison
  
- **Risk Analysis**: Calculate and visualize key risk metrics
  - Volatility (standard deviation)
  - Maximum drawdown
  - Value at Risk (VaR)
  - Tracking error
  - Risk contribution analysis
  
- **Time Series Analysis**: Analyze portfolio performance over different time periods
  - Fixed 10-year data period for consistent analysis
  - Performance attribution
  - Total return labels for each series
  - Integrated with Analysis Controls for time period selection

- **Detailed Calculations View**: View step-by-step calculations for risk metrics
  - Mathematical formulas with explanations
  - Contribution calculations for each asset
  - Toggle visibility with "Show Calculations" button

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.5.9
- **Styling**: TailwindCSS 3.3.3
- **Data Visualization**: Chart.js 4.4.0, D3.js 7.8.5
- **Statistical Calculations**: jStat 1.9.6
- **Utility Libraries**: Lodash 4.17.21
- **Math Rendering**: better-react-mathjax for formula display

## Architecture

The application is built with a focus on performance and scalability, using the following architectural patterns:

### 1. Memoization and Caching

- **Metrics Cache**: Implemented to avoid redundant calculations
- **Key-based Caching**: Metrics are cached based on portfolio ID, time period, and benchmark

### 2. Progressive Loading

- **Individual Loading States**: Each metric has its own loading state
- **Partial Results**: Metrics are displayed as soon as they are calculated
- **Visual Feedback**: Loading indicators show which metrics are still being calculated

### 3. Debounced User Inputs

- **Slider Debouncing**: Allocation sliders use debouncing to prevent excessive recalculations
- **Immediate UI Updates**: UI updates immediately while calculations are debounced

### 4. Optimized Data Structures

- **Hierarchical Structure**: Portfolio allocations use a hierarchical structure for efficient traversal
- **Typed Interfaces**: TypeScript interfaces ensure data consistency

### 5. State Management

- **Component-Based State**: Each component manages its own state
- **Prop Drilling**: State is passed down to child components via props
- **Callback Functions**: Child components communicate with parents via callback functions

## Project Structure

portfolio-dashboard/
├── src/
│   ├── components/
│   │   ├── AllocationControls.tsx    # Controls for adjusting portfolio allocations
│   │   ├── CalculationsView.tsx      # Detailed calculation steps with mathematical formulas
│   │   ├── DataGenerationParameters.tsx # Display data generation parameters
│   │   ├── DataGeneratorControls.tsx # Controls for generating test data
│   │   ├── LoadingIndicator.tsx      # Loading indicator component
│   │   ├── PerformanceView.tsx       # Performance metrics visualization
│   │   ├── RiskAnalysisView.tsx      # Risk metrics visualization
│   │   ├── SimpleAllocationTreemap.tsx # Simplified allocation treemap with risk visualization
│   │   ├── SimpleTimeSeriesView.tsx  # Simplified time series component with 10-year data
│   │   └── TimeSeriesView.tsx        # Time series data visualization
│   ├── data/
│   │   └── dataGenerator.ts          # Generates sample portfolio data (fixed to 10 years)
│   ├── hooks/
│   │   └── useRiskWorker.ts          # Hook for offloading risk calculations to a web worker
│   ├── services/
│   │   └── api.ts                    # API service for data fetching (mock implementation)
│   ├── store/
│   │   └── index.ts                  # State management utilities
│   ├── types/
│   │   └── index.ts                  # TypeScript type definitions
│   ├── utils/
│   │   ├── performanceCalculations.ts # Utility functions for performance calculations
│   │   └── riskCalculations.ts       # Utility functions for risk calculations
│   ├── views/
│   │   └── Dashboard.tsx             # Main dashboard view
│   ├── workers/
│   │   └── riskWorker.ts             # Web worker for risk calculations
│   ├── App.tsx                       # Root component with unified controls
│   ├── main.tsx                      # Application entry point
│   └── index.css                     # Global styles
├── index.html                        # HTML entry point
├── package.json                      # Project dependencies and scripts
├── tailwind.config.js                # Tailwind CSS configuration
└── vite.config.ts                    # Vite configuration

## Data Flow

1. Portfolio data is generated via `dataGenerator.ts` with configurable parameters
   - The application uses generated mock data with realistic financial patterns
   - Data is now fixed to 10 years (120 months) for consistency

2. The `App` component manages the main state:
   - Time periods (1M, 3M, 6M, 1Y, 3Y, 5Y, 10Y, YTD) for UI selection
   - Benchmarks (Market, S&P500, MSCI World, Custom)
   - Allocation settings for different asset classes
   - UI controls (show/hide data controls, risk contribution, calculations)

3. Child components receive data and render visualizations:
   - `SimpleAllocationTreemap`: Visualizes portfolio allocations with optional risk contribution overlay
   - `PerformanceView`: Shows performance metrics and comparisons
   - `RiskAnalysisView`: Calculates and displays risk metrics
   - `SimpleTimeSeriesView`: Shows time series data for portfolio and benchmark
   - `CalculationsView`: Displays detailed calculation steps when enabled

4. Risk contributions are calculated in the `RiskAnalysisView` component and passed to:
   - Parent `App` component via the `onUpdateRiskContributions` callback
   - `SimpleAllocationTreemap` for visualization when risk contribution overlay is enabled

5. Calculation steps are generated in the `RiskAnalysisView` component and passed to:
   - Parent `App` component via the `onUpdateCalculationSteps` callback
   - `CalculationsView` for detailed display when calculations view is enabled

## Recent Improvements (March 2025)

### 1. Fixed 10-Year Data Period

- Modified all components to consistently use 10 years (120 months) of data
- Updated `SimpleTimeSeriesView` to always process 120 months of returns
- Modified `DataGeneratorControls` to fix the timeframe to 10 years
- Updated `RiskAnalysisView` to align with the 10-year data requirement

### 2. Time Period Selection Control

- Added a time period selection dropdown in the Analysis Controls section
- Implemented state management for the selected time period
- Connected the time period selection to all relevant components

### 3. Detailed Calculations View

- Added a new `CalculationsView` component for displaying calculation steps
- Implemented mathematical formula rendering with better-react-mathjax
- Added a toggle button to show/hide the calculations view
- Connected the calculations view to the risk analysis component

### 4. Enhanced Time Series Chart

- Improved the time series chart to properly display data for the full 10-year period
- Added total return labels for each series
- Implemented better handling of null values with `spanGaps: true`
- Fixed chart width issues to ensure the chart spans the full container

### 5. Risk Contribution Visualization

- Enhanced the risk contribution visualization on the allocation treemap
- Improved color coding for better visibility
- Added detailed tooltips for risk contribution information
- Fixed ID matching issues for consistent visualization

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/n3g3ntr0pe/portfolio-dashboard.git
   ```

2. Navigate to the project directory:
   ```
   cd portfolio-dashboard
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Known Issues and Workarounds

1. **Chart.js Rendering Issues**:
   - Issue: Charts may not render properly if the canvas element is not fully loaded
   - Workaround: Added delays and proper cleanup in chart initialization

2. **Null Value Handling in Charts**:
   - Issue: Charts may display gaps when data contains null values
   - Workaround: Implemented `spanGaps: true` and proper null value handling

3. **Performance with Large Datasets**:
   - Issue: Performance degradation with very large portfolios
   - Workaround: Implemented caching strategies and progressive loading

4. **Browser Compatibility**:
   - Issue: Some features may not work in older browsers
   - Workaround: Use modern browsers (Chrome, Firefox, Edge) for best experience

## Future Enhancements

1. **Advanced Filtering**: Add more filtering options for portfolio analysis
2. **Custom Benchmarks**: Allow users to create and save custom benchmarks
3. **Export Functionality**: Add options to export data and visualizations
4. **User Authentication**: Implement user authentication for personalized dashboards
5. **Real-time Data**: Connect to real financial data sources
6. **Scenario Analysis**: Add tools for scenario testing and stress testing
7. **Mobile Optimization**: Further improve the mobile experience

## License

This project is licensed under the MIT License.