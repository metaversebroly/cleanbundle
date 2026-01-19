import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonProps } from './Button';

interface DropdownOption {
  label: string;
  icon?: string;
  onClick: () => void;
}

interface DropdownButtonProps extends Omit<ButtonProps, 'onClick'> {
  options: DropdownOption[];
  children: React.ReactNode;
}

export function DropdownButton({ options, children, ...buttonProps }: DropdownButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button {...buttonProps} onClick={() => setIsOpen(!isOpen)}>
        {children}
        <span className="ml-1">{isOpen ? '▲' : '▼'}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 animate-fade-in">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
            >
              {option.icon && <span>{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
