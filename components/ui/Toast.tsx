import React, { useEffect } from 'react';
import { ToastMessage } from '@/types';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  const { id, message, type, duration } = toast;

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colors = {
    success: 'bg-green-500/90 border-green-400',
    error: 'bg-red-500/90 border-red-400',
    warning: 'bg-yellow-500/90 border-yellow-400',
    info: 'bg-blue-500/90 border-blue-400',
  };

  return (
    <div
      className={`${colors[type]} border backdrop-blur-sm rounded-lg shadow-2xl p-4 mb-3 animate-slide-in-right flex items-start gap-3 min-w-[300px] max-w-[400px]`}
    >
      <span className="text-2xl flex-shrink-0">{icons[type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm break-words">{message}</p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="text-white/80 hover:text-white flex-shrink-0 transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
