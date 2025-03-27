/**
 * Utility functions for testing API routes
 */

/**
 * Create a mock request object for testing API handlers
 * @param {Object} options - Configuration options
 * @returns {Object} Mock request object
 */
export const createMockRequest = (options = {}) => {
  const {
    method = 'GET',
    body = {},
    query = {},
    headers = {},
    cookies = {}
  } = options;
  
  return {
    method,
    body,
    query,
    headers,
    cookies
  };
};

/**
 * Create a mock response object for testing API handlers
 * @returns {Object} Mock response object with status, json methods and tracking
 */
export const createMockResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    json(data) {
      this.body = data;
      return this;
    },
    
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    
    getResponseData() {
      return {
        statusCode: this.statusCode,
        headers: this.headers,
        body: this.body
      };
    }
  };
  
  return res;
};

/**
 * Unified API response function
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Boolean} success - Success flag
 * @param {String} message - Message to return
 * @param {Object} data - Data to return
 */
export const apiResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
}; 