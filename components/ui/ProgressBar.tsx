import React from 'react';

export interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ progress, showPercentage = true, className = '' }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Analyzing wallets</span>
          <span className="text-sm font-semibold text-purple-400">{clampedProgress}%</span>
        </div>
      )}
      <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}
