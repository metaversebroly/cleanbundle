import React, { useEffect, useState } from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  color?: string;
  highlight?: boolean;
  animate?: boolean;
}

export function StatsCard({ label, value, color = 'text-white', highlight = false, animate = true }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 800; // 800ms animation
    const steps = 20;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, animate]);

  return (
    <div 
      className={`bg-gray-700/30 rounded-lg p-4 transition-all duration-300 hover:bg-gray-700/50 hover:scale-105 ${
        highlight ? 'ring-2 ring-red-500/50 animate-pulse-glow' : ''
      }`}
    >
      <div className="text-gray-400 text-sm">{label}</div>
      <div className={`text-2xl font-bold ${color} transition-all duration-300`}>
        {displayValue}
      </div>
    </div>
  );
}
