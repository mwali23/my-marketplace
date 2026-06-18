'use client';

import React, { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [legalConfirmed, setLegalConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");
    
    setIsSubmitting(true);

    try {
      // Simulated secure vault upload and database entry
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success! Clean up the form.
      alert('Success! Your report is safely vaulted and ready for the marketplace.');
      setFile(null);
      setLocation('');
      setPrice('');
      setLegalConfirmed(false);

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Upload a Report
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Monetize your professional asset dossiers securely.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Location Identifier */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Asset Location / Identifier (e.g., Address or VIN)
              </label>
              <div className="mt-1">
                <input id="location" name="location" type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="123 Main St..." />
              </div>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Set Price (USD)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input type="number" name="price" id="price" required min="1" value={price} onChange={(e) => setPrice(e.target.value)} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="0.00" />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Document (PDF only)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">{file ? file.name : "PDF up to 10MB"}</p>
                </div>
              </div>
            </div>

            {/* The Legal Shield */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="legal" name="legal" type="checkbox" required checked={legalConfirmed} onChange={(e) => setLegalConfirmed(e.target.checked)} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="legal" className="font-medium text-gray-700">Legal Representation & Warranty</label>
                <p className="text-gray-500 text-xs mt-1">By checking this box, I legally represent that I am the copyright owner of this document or have explicit permission to distribute it. I accept full legal liability for this upload.</p>
              </div>
            </div>

            <div>
              <button type="submit" disabled={!legalConfirmed || isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Uploading to Vault...' : 'Upload & List on Marketplace'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}