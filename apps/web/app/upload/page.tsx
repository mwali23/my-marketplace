'use client';

import React, { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [legalConfirmed, setLegalConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!file) {
      setError('Please select a PDF file.');

      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set('locationIdentifier', location);
      formData.set('price', price);
      formData.set('legalRightsConfirmed', String(legalConfirmed));
      formData.set('file', file);

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as {
        report?: { id: string };
        error?: string;
      };

      if (response.status === 401) {
        window.location.href = `/auth/sign-in?next=${encodeURIComponent(
          '/upload',
        )}`;

        return;
      }

      if (!response.ok || !data.report) {
        throw new Error(data.error ?? 'Upload failed.');
      }

      setMessage('Your report is vaulted and listed in the marketplace.');
      setFile(null);
      setLocation('');
      setPrice('');
      setLegalConfirmed(false);
      setFileInputKey((key) => key + 1);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Something went wrong while uploading.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Upload a Report
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Monetize your professional asset dossiers securely.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-gray-200 bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Asset Location / Identifier
              </label>
              <div className="mt-1">
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="123 Main St"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Set Price (USD)
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="45.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Document (PDF only)
              </label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 transition-colors hover:border-gray-400">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex justify-center text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                    >
                      <span>Upload a file</span>
                      <input
                        key={fileInputKey}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        required
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {file ? file.name : 'PDF up to 10MB'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="legal"
                  name="legal"
                  type="checkbox"
                  required
                  checked={legalConfirmed}
                  onChange={(e) => setLegalConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="legal" className="font-medium text-gray-700">
                  Legal Representation & Warranty
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  I represent that I own this document or have explicit
                  permission to distribute it, and I accept legal liability for
                  this upload.
                </p>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            ) : null}

            <div>
              <button
                type="submit"
                disabled={!legalConfirmed || isSubmitting}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Uploading to Vault...'
                  : 'Upload & List on Marketplace'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
