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
      className="w-full p-2 border rounded-md"
      disabled={isLoading}
    >
      {isLoading ? (
        <option disabled>Loading...</option>
      ) : (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      )}
    </select>
  );
} 