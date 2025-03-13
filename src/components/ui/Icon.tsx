'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon | string;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ 
  icon, 
  className = '', 
  size = 24 
}) => {
  // If icon is a string, it's for testing purposes
  if (typeof icon === 'string') {
    return <span data-testid={`icon-${icon}`} className={className}></span>;
  }
  
  // Otherwise, render the actual icon component
  const IconComponent = icon;
  return <IconComponent className={className} size={size} />;
};

export default Icon; 