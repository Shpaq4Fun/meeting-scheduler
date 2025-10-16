
import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  color: string;
  checked: boolean;
  onChange: () => void;
  active?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, label, color, checked, onChange, active = true }) => {
  // Extract the color class (e.g., 'bg-blue-500' -> 'blue-500')
  const colorClass = color.replace('bg-', '');

  return (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className={`w-6 h-6 border-2 rounded border-${colorClass} ${checked ? color : 'bg-gray-800/0'}`}>
          {checked && (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className={`ml-3 font-bold text-base ${active ? 'text-gray-300' : 'text-gray-500'}`}>
        {label}
      </span>
    </label>
  );
};
