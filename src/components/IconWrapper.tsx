import React from 'react';
import clsx from 'clsx';

/**
 * Component to display SVG icons with consistent styling
 * It accepts an icon component from libraries like heroicons or lucide
 */

type IconSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg';

interface IconWrapperProps {
  iconName?: string; // Kept for backward compatibility
  icon?: React.ElementType; // Icon component from @heroicons/react or lucide-react
  size?: IconSize;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
  fixedWidth?: boolean;
}

const sizeClasses = {
  '2xs': 'w-3.5 h-3.5', // 14px - extra extra small
  'xs': 'w-4 h-4',      // 16px - extra small
  'sm': 'w-5 h-5',      // 20px - small
  'md': 'w-6 h-6',      // 24px - medium
  'lg': 'w-7 h-7'       // 28px - large
};

const IconWrapper: React.FC<IconWrapperProps> = ({
  iconName,
  icon: Icon,
  size = 'md',
  className,
  onClick,
  ariaLabel,
  fixedWidth = false
}) => {
  // If no icon is provided, use a text placeholder
  if (!Icon) {
    // Get abbreviation from iconName or default to "IC"
    const abbr = iconName ? iconName.substring(0, 2).toUpperCase() : 'IC';
    
    return (
      <span 
        className={clsx(
          'inline-flex items-center justify-center font-bold',
          sizeClasses[size],
          fixedWidth && 'w-5',
          className
        )}
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        {abbr}
      </span>
    );
  }

  // Render the actual icon component
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center',
        fixedWidth && 'w-5',
        className
      )}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <Icon className={clsx(sizeClasses[size])} />
    </span>
  );
};

export default IconWrapper; 