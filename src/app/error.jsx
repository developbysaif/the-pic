'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Safely log the error
    try {
      console.error('App Runtime Error:', error);
    } catch (_) {}
  }, [error]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : error?.message || 'A temporary unexpected issue occurred.';

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-sage-ivory px-4 py-16 text-sage-dark">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-sage-soft/60 shadow-float text-center">
        <div className="w-14 h-14 rounded-full bg-sage-soft/30 flex items-center justify-center text-sage-primary mx-auto mb-4 border border-sage-soft/50">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h2 className="font-serif text-2xl font-normal text-sage-dark mb-2">
          Something went wrong
        </h2>

        <p className="text-xs text-sage-muted mb-6 leading-relaxed">
          {errorMessage === '[object Event]'
            ? 'A connection or script refresh occurred. Please refresh to continue.'
            : errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sage-primary hover:bg-sage-accent text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sage-soft/30 hover:bg-sage-soft text-sage-dark text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
