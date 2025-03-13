import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { act } from '@testing-library/react';

// Configure testing library
configure({
  asyncUtilTimeout: 2000,
  testIdAttribute: 'data-testid',
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {
    // Mock implementation
    return Promise.resolve();
  }
  unobserve() {
    // Mock implementation
    return Promise.resolve();
  }
  disconnect() {
    // Mock implementation
    return Promise.resolve();
  }
}

// Mock IntersectionObserver
class IntersectionObserver {
  observe() {
    // Mock implementation
    return Promise.resolve();
  }
  unobserve() {
    // Mock implementation
    return Promise.resolve();
  }
  disconnect() {
    // Mock implementation
    return Promise.resolve();
  }
}

// Add to global
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Helper to wait for animations
export const waitForAnimations = () => act(async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
});

// Mock dialog functions
window.HTMLDialogElement.prototype.show = jest.fn();
window.HTMLDialogElement.prototype.showModal = jest.fn();
window.HTMLDialogElement.prototype.close = jest.fn();

// Mock fetch if not using MSW
if (!global.fetch) {
  global.fetch = jest.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
      headers: new Headers(),
      status: 200,
      statusText: 'OK',
    })
  );
}

// Mock HTMLFormElement.prototype.requestSubmit
HTMLFormElement.prototype.requestSubmit = jest.fn().mockImplementation(function(this: HTMLFormElement, submitter?: HTMLElement) {
  if (submitter) {
    submitter.click();
  } else {
    this.submit();
  }
});

// Suppress specific console warnings
const originalError = console.error;
console.error = (...args) => {
  if (
    /Warning: An update to.*inside a test was not wrapped in act/.test(args[0]) ||
    /Warning: Cannot update a component/.test(args[0]) ||
    /Warning: React has detected a change in the order of Hooks/.test(args[0]) ||
    /Not implemented: HTMLFormElement.prototype.requestSubmit/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
}; 