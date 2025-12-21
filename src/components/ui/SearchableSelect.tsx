'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Option {
  id: number;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected option
  const selectedOption = options.find(opt => opt.id === value);

  // Filter options based on search query
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update dropdown position when open
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionId: number) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Display value in input
  const inputDisplayValue = isOpen ? searchQuery : (selectedOption?.name || '');

  // Dropdown content rendered via portal
  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
      }}
      className="
        bg-white border border-gray-200
        rounded-xl shadow-xl
        max-h-60 overflow-y-auto
        animate-in fade-in slide-in-from-top-2 duration-300
      "
      role="listbox"
    >
      {filteredOptions.length === 0 ? (
        <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
      ) : (
        filteredOptions.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            className={`
              w-full text-left px-4 py-3
              bg-white text-gray-900
              hover:bg-indigo-50 hover:text-indigo-700
              transition-all duration-300
              cursor-pointer
              ${option.id === value ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}
              ${index === 0 ? 'rounded-t-lg' : ''}
              ${index === filteredOptions.length - 1 ? 'rounded-b-lg' : ''}
              focus:outline-none focus:bg-indigo-100 focus:ring-2 focus:ring-inset focus:ring-indigo-500
            `}
            role="option"
            aria-selected={option.id === value}
          >
            <div className="flex items-center justify-between">
              <span>{option.name}</span>
              {option.id === value && (
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
        ))
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputDisplayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full appearance-none border border-gray-300 rounded-xl px-4 py-3
            bg-gray-50 hover:bg-white focus:bg-white
            text-gray-900 focus:border-indigo-500
            focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
            transition-all duration-300
            pr-10
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            ${!inputDisplayValue && !isOpen ? 'text-gray-500' : ''}
          `}
        />
        
        {/* Dropdown arrow button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`
              w-4 h-4 text-gray-400
              transition-transform duration-300
              ${isOpen ? 'rotate-180' : ''}
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu - rendered via portal to escape modal overflow */}
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
};
