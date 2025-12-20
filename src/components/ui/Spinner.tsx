import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerColor = 'black' | 'white' | 'gray';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
};

const colorClasses: Record<SpinnerColor, string> = {
  black: 'border-black',
  white: 'border-white',
  gray: 'border-gray-500',
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'black',
  className = '' 
}) => {
  return (
    <div 
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  title?: string;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  title = 'Loading...', 
  message 
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <Spinner size="xl" color="black" />
        <div className="text-center">
          <p className="text-lg font-semibold text-black">{title}</p>
          {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Spinner;
