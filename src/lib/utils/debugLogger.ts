// Debug utility for logging API calls and responses
// This can be toggled on/off based on environment

const DEBUG_MODE = process.env.NODE_ENV === 'development';

interface LogOptions {
  title?: string;
  data?: any;
  error?: boolean;
  session?: any;
}

export const debugLog = (options: LogOptions) => {
  if (!DEBUG_MODE) return;
  
  const { title, data, error = false, session } = options;
  
  const styles = error 
    ? 'background: #FEE2E2; color: #DC2626; padding: 2px 4px; border-radius: 2px;'
    : 'background: #DBEAFE; color: #1E40AF; padding: 2px 4px; border-radius: 2px;';
    
  if (error) {
    console.error('Error:', data);
  }
};

export const logApiCall = async (url: string, options?: RequestInit, title?: string) => {
  if (!DEBUG_MODE) return fetch(url, options);
  
  debugLog({ title: `${title || 'API Call'} - ${options?.method || 'GET'} ${url}` });
  console.time(`Request: ${url}`);
  
  try {
    const response = await fetch(url, options);
    console.timeEnd(`Request: ${url}`);
    
    // Convert headers to a simple object in a way that's compatible with all TS configs
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    debugLog({ 
      title: `Response: ${response.status} ${response.statusText}`,
      data: { 
        url,
        status: response.status,
        statusText: response.statusText,
        headers
      }
    });
    
    return response;
  } catch (error) {
    console.timeEnd(`Request: ${url}`);
    debugLog({ 
      title: `Request Failed: ${url}`,
      data: error,
      error: true
    });
    throw error;
  }
}; 