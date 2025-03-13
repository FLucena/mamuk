import React from 'react';
import { render } from '@testing-library/react';
import NavigationTracker from '@/components/NavigationTracker';
import { trackNavigation, logNavigationStats } from '@/lib/utils/debug';
import { usePathname, useSearchParams } from 'next/navigation';
import { act } from 'react-dom/test-utils';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock the debug utility functions
jest.mock('@/lib/utils/debug', () => ({
  trackNavigation: jest.fn(),
  logNavigationStats: jest.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('NavigationTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    usePathname.mockReturnValue('/initial');
    useSearchParams.mockImplementation(() => new URLSearchParams());
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should not track navigation on first render', () => {
    render(<NavigationTracker />);
    
    expect(trackNavigation).not.toHaveBeenCalled();
    expect(logNavigationStats).not.toHaveBeenCalled();
  });

  test('should not track navigation when only search params change', () => {
    // First render
    const { rerender } = render(<NavigationTracker />);
    
    // Simulate a second render to get past isFirstRender check
    rerender(<NavigationTracker />);
    
    // Change only search params, not path
    const mockSearchParams = new URLSearchParams('query=test');
    useSearchParams.mockImplementation(() => mockSearchParams);
    rerender(<NavigationTracker />);
    
    // Advance timers
    act(() => {
      jest.advanceTimersByTime(350);
    });
    
    // trackNavigation should not be called because path didn't change
    expect(trackNavigation).not.toHaveBeenCalled();
  });
}); 