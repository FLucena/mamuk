import React from 'react';

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  isLoading = false,
  children
}: MultiSelectProps) {
  return (
    <select 
      multiple
      value={selectedValues}
      onChange={(e) => onChange(Array.from(e.target.selectedOptions, option => option.value))}
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                bg-white dark:bg-gray-700 
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      style={{
        // Override browser default styling for options
        colorScheme: 'auto'
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <option disabled className="text-gray-500 dark:text-gray-400">Loading...</option>
      ) : (
        options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="py-2 px-2"
          >
            {option.label}
          </option>
        ))
      )}
    </select>
  );
} 