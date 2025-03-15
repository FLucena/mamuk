'use client';

import React from 'react';
import PageLoading from './PageLoading';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  centered?: boolean;
  label?: string;
}

// This component is now a wrapper around PageLoading for backward compatibility
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  fullScreen = false,
  centered = false,
  label = 'Cargando...'
}) => {
  // Convert size to number for PageLoading
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 40
  };
  
  return (
    <PageLoading 
      size={sizeMap[size]} 
      label={label} 
      className={className}
    />
  );
};

export default LoadingSpinner; 