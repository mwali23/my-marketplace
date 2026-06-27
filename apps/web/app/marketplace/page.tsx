'use client';

import React, { useState } from 'react';

import type { MarketplaceReport } from '~/lib/marketplace';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MarketplaceReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.set('query', searchQuery.trim());
      }

      const response = await fetch(`/api/reports?${params.toString()}`);
      const data = (await response.json()) as {
        reports?: MarketplaceReport[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to search reports.');
      }

      setResults(data.reports ?? []);
    } catch (searchError) {
      setResults([]);
      setError(
        searchError instanceof Error
          ? searchError.message
          : 'Unable to search reports.',
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleBuy = async (report: MarketplaceReport) => {
    setIsRedirecting(report.id);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (response.status === 401) {
        window.location.href = `/auth/sign-in?next=${encodeURIComponent(
          '/marketplace',
        )}`;

        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? 'Checkout failed.');
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Something went wrong connecting to the payment processor.',
      );
      setIsRedirecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Inspection Report Marketplace
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Find existing inspection documents by address, property, site, or
            record identifier.
          </p>
        </div>

        <div className="mt-8 overflow-hidden border border-gray-200 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSearch} className="sm:flex">
              <div className="min-w-0 flex-1">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Enter an address, permit, or record ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 caret-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Find Reports'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 space-y-4">
          {results.map((report) => (
            <div
              key={report.id}
              className="overflow-hidden border border-gray-200 bg-white shadow sm:rounded-lg"
            >
              <div className="flex flex-col justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {report.locationIdentifier}
                  </h3>
                  <div className="mt-1 space-x-2 text-sm text-gray-500 sm:space-x-4">
                    <span className="block sm:inline">{report.category}</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="block sm:inline">
                      Listed on{' '}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between space-x-4 sm:w-auto sm:justify-end">
                  <span className="text-2xl font-bold text-gray-900">
                    {currencyFormatter.format(report.price)}
                  </span>
                  <button
                    onClick={() => handleBuy(report)}
                    disabled={isRedirecting === report.id}
                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                  >
                    {isRedirecting === report.id
                      ? 'Loading Checkout...'
                      : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {hasSearched && results.length === 0 && !isSearching && !error ? (
            <div className="border border-gray-200 bg-white py-12 text-center shadow sm:rounded-lg">
              <p className="text-sm text-gray-500">
                No reports found for {searchQuery || 'your search'}.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
