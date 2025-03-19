import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Global {
      fetch: typeof global.fetch;
    }
  }
} 