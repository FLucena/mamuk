import { ReactNode } from 'react';
import { IconBaseProps } from 'react-icons';

declare module 'react-icons/lib/index' {
  export type IconType = (props: IconBaseProps) => ReactNode;
} 