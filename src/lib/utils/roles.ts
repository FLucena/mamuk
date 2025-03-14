// Role priority order (higher index = higher priority)
export const ROLE_PRIORITY = ['customer', 'coach', 'admin'];

/**
 * Sorts roles by priority: admin, coach, customer
 * @param roles Array of roles to sort
 * @returns Sorted array of roles
 */
export function sortRoles(roles: string[]): string[] {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return [];
  }
  
  // Create a copy to avoid mutating the original array
  return [...roles].sort((a, b) => {
    const priorityA = ROLE_PRIORITY.indexOf(a);
    const priorityB = ROLE_PRIORITY.indexOf(b);
    
    // If role is not in priority list, put it at the end
    if (priorityA === -1) return 1;
    if (priorityB === -1) return -1;
    
    // Sort by priority (higher index first)
    return priorityB - priorityA;
  });
} 