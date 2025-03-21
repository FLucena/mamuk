'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SimpleDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function SimpleDropdown({
  label,
  value,
  options,
  onChange,
  disabled = false
}: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
      >
        <span>{value || label}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-2" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full px-4 py-2 text-left text-sm ${
                option === value
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 