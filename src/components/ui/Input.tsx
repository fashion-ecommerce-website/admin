"use client";

import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  variant?: 'white' | 'black' | 'ghost';
}

export const Input: React.FC<InputProps> = ({ className, variant = 'white', ...props }) => {
  const variants = {
    white:
      'bg-white text-black placeholder-gray-500 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:opacity-50',
    black:
      'bg-black text-white placeholder-gray-400 border border-black rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:opacity-50',
    ghost:
      'bg-transparent text-black placeholder-gray-500 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:opacity-50',
  } as const;
  return <input {...props} className={twMerge(variants[variant], className)} />;
};

export default Input;