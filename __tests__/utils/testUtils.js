/**
 * Utilidades para tests
 */

// Silencia los mensajes de consola durante los tests
export const silenceConsoleErrors = () => {
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });
};

// Silencia los mensajes de consola para un test específico
export const silenceConsoleForTest = (testFn) => {
  const originalError = console.error;
  console.error = jest.fn();
  
  try {
    return testFn();
  } finally {
    console.error = originalError;
  }
};

// Espera a que una condición se cumpla
export const waitForCondition = async (condition, timeout = 5000, interval = 100) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
};

// Crea un mock para fetch que simula respuestas de API
export const mockFetch = (responses = {}) => {
  const defaultResponse = {
    ok: true,
    json: () => Promise.resolve({ success: true })
  };
  
  return jest.fn((url, options) => {
    // Busca una respuesta específica para la URL
    for (const [urlPattern, response] of Object.entries(responses)) {
      if (url.includes(urlPattern)) {
        if (response instanceof Error) {
          return Promise.reject(response);
        }
        
        return Promise.resolve(
          typeof response === 'function'
            ? response(url, options)
            : response
        );
      }
    }
    
    // Si no hay respuesta específica, devuelve la respuesta por defecto
    return Promise.resolve(defaultResponse);
  });
};

// Test dummy para evitar el error de 'Your test suite must contain at least one test'
describe('Test Utils', () => {
  it('should have this dummy test to avoid jest error', () => {
    expect(true).toBe(true);
  });
}); 