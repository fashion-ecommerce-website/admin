'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  
  // Customization props
  bgColor?: string;
  hoverBgColor?: string;
  focusBgColor?: string;
  textColor?: string;
  borderColor?: string;
  focusBorderColor?: string;
  borderRadius?: string;
  padding?: string;
  
  // Dropdown menu customization
  dropdownBgColor?: string;
  dropdownBorderColor?: string;
  dropdownItemBgColor?: string;
  dropdownItemHoverBgColor?: string;
  dropdownItemTextColor?: string;
  dropdownItemHoverTextColor?: string;
  dropdownItemBorderRadius?: string;
  dropdownMaxHeight?: string;
  dropdownShadow?: string;
  
  // Icon customization
  iconColor?: string;
  iconSize?: string;
  
  // Animation
  animationDuration?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  
  // Default customization
  bgColor = 'bg-gray-50',
  hoverBgColor = 'hover:bg-white',
  focusBgColor = 'focus:bg-white',
  textColor = 'text-gray-900',
  borderColor = 'border-gray-300',
  focusBorderColor = 'focus:border-indigo-500',
  borderRadius = 'rounded-xl',
  padding = 'px-4 py-3',
  
  // Dropdown menu defaults
  dropdownBgColor = 'bg-white',
  dropdownBorderColor = 'border-gray-200',
  dropdownItemBgColor = 'bg-white',
  dropdownItemHoverBgColor = 'hover:bg-indigo-50',
  dropdownItemTextColor = 'text-gray-900',
  dropdownItemHoverTextColor = 'hover:text-indigo-700',
  dropdownItemBorderRadius = 'rounded-lg',
  dropdownMaxHeight = 'max-h-60',
  dropdownShadow = 'shadow-xl',
  
  // Icon defaults
  iconColor = 'text-gray-400',
  iconSize = 'w-4 h-4',
  
  // Animation
  animationDuration = 'duration-300',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      onChange(options[nextIndex].value);
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      onChange(options[prevIndex].value);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full appearance-none border ${borderColor} ${borderRadius} ${padding}
          ${bgColor} ${hoverBgColor} ${focusBgColor}
          ${textColor} ${focusBorderColor}
          focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
          transition-all ${animationDuration}
          flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          group
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? '' : 'opacity-50'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {/* Chevron Icon */}
        <svg
          className={`
            ${iconSize} ${iconColor}
            transition-transform ${animationDuration}
            ${isOpen ? 'rotate-180' : ''}
            group-focus:text-indigo-500
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 w-full mt-2
            ${dropdownBgColor} border ${dropdownBorderColor}
            ${borderRadius} ${dropdownShadow}
            ${dropdownMaxHeight} overflow-y-auto
            animate-in fade-in slide-in-from-top-2 ${animationDuration}
          `}
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
              className={`
                w-full text-left px-4 py-3
                ${dropdownItemBgColor} ${dropdownItemTextColor}
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : `${dropdownItemHoverBgColor} ${dropdownItemHoverTextColor} cursor-pointer`}
                transition-all ${animationDuration}
                ${option.value === value ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}
                first:${dropdownItemBorderRadius.replace('rounded-', 'rounded-t-')}
                last:${dropdownItemBorderRadius.replace('rounded-', 'rounded-b-')}
                focus:outline-none focus:bg-indigo-100 focus:ring-2 focus:ring-inset focus:ring-indigo-500
              `}
              role="option"
              aria-selected={option.value === value}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {option.value === value && (
                  <svg
                    className="w-4 h-4 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
