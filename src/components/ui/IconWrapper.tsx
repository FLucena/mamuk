'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

type IconProps = {
  icon: LucideIcon;
  className?: string;
};

/**
 * IconWrapper - Un componente que maneja iconos de Lucide React
 * 
 * Este componente acepta cualquier icono de Lucide React y lo renderiza
 * correctamente, asegurando un tipado correcto y una experiencia consistente.
 */
export function IconWrapper({ icon: Icon, className = '' }: IconProps) {
  return <Icon className={className} />;
}

/**
 * Función auxiliar para crear un componente de icono tipado correctamente
 * 
 * @param icon - El componente de icono a envolver
 * @returns Un componente React que renderiza el icono
 */
export function createSafeIcon(icon: LucideIcon) {
  return function SafeIcon(props: { className?: string }) {
    return <IconWrapper icon={icon} className={props.className} />;
  };
} 