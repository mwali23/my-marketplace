'use client';

import React, { useEffect, useState, Suspense } from 'react';

function SuccessContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    // Safe client-side check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    // In a production app, we would send this sessionId to the backend to securely 
    // fetch the actual PDF URL from Supabase. For this MVP, we simulate the unlock!
    if (sessionId) {
      setTimeout(() => setStatus('success'), 1500);
    } else {
      setStatus('error');
    }
  }, []);

  const navigateToMarketplace = () => {
    window.location.href = '/marketplace';
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-pulse">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900">Verifying secure payment...</h2>
          <p className="text-gray-500 mt-2">Unlocking the vault.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900">Invalid Session</h2>
          <button onClick={navigateToMarketplace} className="mt-4 text-blue-600 hover:underline">
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-green-200">
          <div className="bg-green-50 px-4 py-5 sm:p-6 text-center border-b border-green-200">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-extrabold text-green-900">Payment Successful!</h2>
            <p className="mt-2 text-lg text-green-700">
              Your transaction is complete. The digital vault has been unlocked.
            </p>
          </div>
          
          <div className="px-4 py-8 sm:p-10 flex flex-col items-center">
            <div className="w-full max-w-md bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Asset_Report_Secure.pdf</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">1.2 MB &bull; Watermarked for your account</p>
              
              <button 
                onClick={() => alert("In production, this opens a Secure, View-Only PDF reader with the buyer's email watermarked to prevent unauthorized sharing.")} 
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Open Secure Viewer (View Only)
              </button>
            </div>
            
            <div className="mt-8">
              <button onClick={navigateToMarketplace} className="text-gray-500 hover:text-gray-800 underline">
                Browse more reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Next.js requires us to wrap anything reading URL parameters in a Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Loading your secure environment...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}