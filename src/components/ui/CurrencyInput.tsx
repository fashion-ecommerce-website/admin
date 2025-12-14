"use client";

import React, { useState, useEffect } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showFormattedBelow?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "Enter amount",
  min = 0,
  max,
  disabled = false,
  label,
  showFormattedBelow = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>("");

  // Format number with commas
  const formatNumber = (num: number): string => {
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Remove commas and parse to number
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Remove all non-digit characters except the first occurrence of a decimal point
    const cleaned = inputValue.replace(/[^\d]/g, "");

    // Parse the number
    const numValue = parseNumber(cleaned);

    // Apply min/max constraints
    let finalValue = numValue;
    if (min !== undefined && finalValue < min) {
      finalValue = min;
    }
    if (max !== undefined && finalValue > max) {
      finalValue = max;
    }

    // Update display and call onChange
    setDisplayValue(formatNumber(finalValue));
    onChange(finalValue);
  };

  const handleBlur = () => {
    // Ensure proper formatting on blur
    if (displayValue === "" || value === 0) {
      setDisplayValue(formatNumber(0));
    } else {
      setDisplayValue(formatNumber(value));
    }
  };

  return (
    <div className="w-full text-black">
      {label && (
        <label className="block text-sm font-medium text-black mb-2">
          {label}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        } ${className}`}
        placeholder={placeholder}
        disabled={disabled}
      />
      {showFormattedBelow && (
        <div className="mt-1 text-sm text-gray-500">
          Formatted: {formatNumber(value)} VND
        </div>
      )}
    </div>
  );
};

export default CurrencyInput;
