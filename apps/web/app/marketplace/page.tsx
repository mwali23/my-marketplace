'use client';

import React, { useState } from 'react';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulated database search (we'll wire this to Supabase later)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (searchQuery.length > 2) {
      setResults([{
          id: '123-mock-id',
          location: searchQuery,
          price: 45.00,
          date: new Date().toLocaleDateString(),
          category: 'Verified Asset Report'
      }]);
    } else {
      setResults([]);
    }
    
    setIsSearching(false);
  };

  const handleBuy = async (report: any) => {
    setIsRedirecting(report.id);
    try {
      // Talk to our new secure Cash Register API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          price: report.price,
          location: report.location
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect the buyer to the secure Stripe Checkout page
        window.location.href = data.url;
      } else {
        alert("Checkout failed: " + data.error);
        setIsRedirecting(null);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong connecting to the payment processor.");
      setIsRedirecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Asset Report Marketplace
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Search for an asset location or identifier to purchase existing verified reports.
          </p>
        </div>

        <div className="mt-8 bg-white overflow-hidden shadow sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSearch} className="sm:flex">
              <div className="min-w-0 flex-1">
                <label htmlFor="search" className="sr-only">Search</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Enter Address, VIN, or Asset ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <button type="submit" disabled={isSearching} className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                  {isSearching ? 'Searching...' : 'Find Reports'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-8 space-y-4">
          {results.map((report) => (
            <div key={report.id} className="bg-white shadow sm:rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {report.location}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500 space-x-2 sm:space-x-4">
                    <span className="block sm:inline">{report.category}</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="block sm:inline">Vaulted on {report.date}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4">
                  <span className="text-2xl font-bold text-gray-900">${report.price.toFixed(2)}</span>
                  <button 
                    onClick={() => handleBuy(report)}
                    disabled={isRedirecting === report.id}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isRedirecting === report.id ? 'Loading Checkout...' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {results.length === 0 && searchQuery && !isSearching && (
            <div className="text-center py-12 bg-white shadow sm:rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">No reports found for "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}