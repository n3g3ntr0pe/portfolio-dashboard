import { useState, useEffect } from 'react';
import { PortfolioData, TimePeriod, Benchmark, AllocationSettings } from './types';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio Dashboard</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to Portfolio Dashboard</h2>
            <p className="text-gray-600">
              This is a placeholder for the Portfolio Dashboard application. The actual components will be implemented
              as per the project requirements.
            </p>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-200 p-4 text-center text-gray-600 text-sm">
        Portfolio Dashboard &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;