// Responsive breakpoints utility
// These match Tailwind CSS's default breakpoints

export const breakpoints = {
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (desktops)
  '2xl': '1536px' // 2X large devices (large desktops)
};

// Media query helpers for CSS-in-JS solutions
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  // Max-width queries
  maxSm: `@media (max-width: ${breakpoints.sm})`,
  maxMd: `@media (max-width: ${breakpoints.md})`,
  maxLg: `@media (max-width: ${breakpoints.lg})`,
  maxXl: `@media (max-width: ${breakpoints.xl})`,
  max2xl: `@media (max-width: ${breakpoints['2xl']})`,
};

// Helper function to check if we're on a mobile device
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < parseInt(breakpoints.md);
};

// Helper function to check if we're on a tablet device
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg);
};

// Helper function to check if we're on a desktop device
export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= parseInt(breakpoints.lg);
}; 