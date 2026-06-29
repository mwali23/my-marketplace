'use client';

import React, { Suspense, useEffect, useState } from 'react';

type VerificationState =
  | {
      status: 'verifying';
    }
  | {
      status: 'success';
      report: {
        id: string;
        locationIdentifier: string;
        price: number;
        downloadUrl: string;
      };
    }
  | {
      status: 'error';
      message: string;
    };

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function SuccessContent() {
  const [state, setState] = useState<VerificationState>({
    status: 'verifying',
  });

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      'session_id',
    );

    if (!sessionId) {
      setState({
        status: 'error',
        message: 'The checkout session is missing.',
      });

      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`,
        );
        const data = (await response.json()) as {
          report?: VerificationState extends { report: infer Report }
            ? Report
            : never;
          error?: string;
        };

        if (response.status === 401) {
          window.location.href = `/auth/sign-in?next=${encodeURIComponent(
            `/success?session_id=${sessionId}`,
          )}`;

          return;
        }

        if (!response.ok || !data.report) {
          throw new Error(data.error ?? 'Payment could not be verified.');
        }

        setState({
          status: 'success',
          report: data.report,
        });
      } catch (error) {
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Payment could not be verified.',
        });
      }
    };

    void verifyPayment();
  }, []);

  const navigateToMarketplace = () => {
    window.location.href = '/marketplace';
  };

  if (state.status === 'verifying') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Verifying secure payment...
          </h2>
          <p className="mt-2 text-gray-500">Preparing your report.</p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Unable to verify payment
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            {state.message}
          </p>
          <button
            onClick={navigateToMarketplace}
            className="mt-4 text-blue-600 hover:underline"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden border border-green-200 bg-white shadow sm:rounded-lg">
          <div className="border-b border-green-200 bg-green-50 px-4 py-5 text-center sm:p-6">
            <h2 className="text-3xl font-extrabold text-green-900">
              Payment Successful
            </h2>
            <p className="mt-2 text-lg text-green-700">
              Your transaction is complete and your report is ready.
            </p>
          </div>

          <div className="flex flex-col items-center px-4 py-8 sm:p-10">
            <div className="w-full max-w-md rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-6 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                {state.report.locationIdentifier}
              </h3>
              <p className="mb-6 mt-1 text-sm text-gray-500">
                Purchased for {currencyFormatter.format(state.report.price)}
              </p>

              <a
                href={state.report.downloadUrl}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Download Secure PDF
              </a>
            </div>

            <div className="mt-8">
              <button
                onClick={navigateToMarketplace}
                className="text-gray-500 underline hover:text-gray-800"
              >
                Find another report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
          <p className="text-xl text-gray-600">
            Loading your secure environment...
          </p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
