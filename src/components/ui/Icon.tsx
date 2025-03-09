import React from 'react';
import * as FiIcons from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';

// Type for the icon names
export type IconName = keyof typeof FiIcons;

interface IconProps {
  icon: IconName;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ icon, className }) => {
  // Dynamically access the icon component from FiIcons
  // Use type assertion to tell TypeScript this is safe
  const IconComponent = FiIcons[icon] as React.ComponentType<IconBaseProps>;
  
  // Safely render the icon with a fallback
  if (!IconComponent) {
    console.warn(`Icon ${icon} not found`);
    return null;
  }
  
  // Use a wrapper span to apply the className
  return (
    <span className={className}>
      {/* @ts-ignore - Ignoring TypeScript error for now */}
      <IconComponent />
    </span>
  );
};

export default Icon; 