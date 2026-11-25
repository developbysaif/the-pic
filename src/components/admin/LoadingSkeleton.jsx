'use client';
import React from 'react';

export function MetricSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft animate-pulse">
      <div className="h-3 w-24 bg-sage-soft/40 rounded-full mb-3" />
      <div className="h-8 w-32 bg-sage-soft/60 rounded-xl mb-2" />
      <div className="h-3 w-28 bg-sage-soft/30 rounded-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft animate-pulse space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 w-40 bg-sage-soft/50 rounded-lg" />
        <div className="h-8 w-32 bg-sage-soft/40 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center space-x-4 py-2 border-b border-sage-soft/20">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-sage-soft/30 rounded-md flex-1"
                style={{ maxWidth: c === 0 ? '60px' : '100%' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
