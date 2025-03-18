/**
 * Session utility functions for handling authentication in client components
 */

/**
 * Validates the current session and returns whether it is valid
 * Can be used before making API requests to protected endpoints
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    // Simple validation by calling a protected endpoint
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      return !!data.user; // Session is valid if we have a user
    }
    
    return false;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};

/**
 * Redirects to login page if the session is invalid
 */
export const ensureValidSession = async (): Promise<boolean> => {
  const isValid = await validateSession();
  
  if (!isValid) {
    // Redirect to login page
    window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  
  return true;
};

/**
 * Attempts to refresh the session token if needed
 * @returns true if session is valid (either already valid or successfully refreshed)
 */
export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  try {
    // First check if session is already valid
    const isValid = await validateSession();
    if (isValid) return true;
    
    // Try to refresh the token
    const response = await fetch('/api/auth/session/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      return true;
    }
    
    // If refresh failed, redirect to login
    window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname);
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

/**
 * Create a fetch function that includes credentials and handles session validation
 * @param input Request info (URL)
 * @param init Request init options
 * @returns Fetch response or throws an error
 */
export const authorizedFetch = async (
  input: RequestInfo | URL, 
  init?: RequestInit
): Promise<Response> => {
  // Ensure we have valid credentials before making the request
  const isValid = await refreshTokenIfNeeded();
  if (!isValid) {
    throw new Error('Unauthorized: Please sign in again');
  }
  
  // Add credentials and proper headers to the request
  const requestInit: RequestInit = {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(init?.headers || {})
    }
  };
  
  // Make the fetch request
  const response = await fetch(input, requestInit);
  
  // Handle 401 Unauthorized responses
  if (response.status === 401) {
    // Redirect to login page
    window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname);
    throw new Error('Session expired. Please sign in again.');
  }
  
  return response;
}; 