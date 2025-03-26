import React from 'react';
import IconWrapper from './IconWrapper';

interface NavIconProps {
  icon: React.ElementType;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const NavIcon: React.FC<NavIconProps> = ({ 
  icon, 
  className,
  size = 'sm'
}) => {
  return (
    <IconWrapper
      icon={icon}
      size={size}
      className={className}
    />
  );
};

export default NavIcon; 