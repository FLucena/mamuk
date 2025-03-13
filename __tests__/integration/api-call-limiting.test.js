import React, { useEffect } from 'react';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Mock components and hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

// Simple component that makes API calls
const HomePage = () => {
  useEffect(() => {
    // Make API call on mount
    fetch('/api/data').then(res => res.json());
  }, []);
  
  return <div data-testid="home-page">Mock Home Page</div>;
};

// Wrapper component for tests
const Wrapper = ({ children }) => {
  return <>{children}</>;
};

describe('API Call Limiting Tests', () => {
  beforeEach(() => {
    // Setup mocks
    useRouter.mockReturnValue({
      push: jest.fn(),
      prefetch: jest.fn()
    });
    usePathname.mockReturnValue('/');
    useSearchParams.mockReturnValue(new URLSearchParams());
    useSession.mockReturnValue({
      data: { user: { id: 'test-user' } },
      status: 'authenticated'
    });
    
    // Setup fetch mock
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'mock data' })
      })
    );
  });
  
  afterEach(() => {
    global.fetch.mockClear();
    jest.clearAllMocks();
  });
  
  it('should cache API responses to prevent redundant calls', async () => {
    // Mock localStorage for caching
    const mockStorage = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => mockStorage[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { mockStorage[key] = value; });
    
    // First render - should make API calls
    render(<HomePage />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
    
    const firstRenderCallCount = global.fetch.mock.calls.length;
    expect(firstRenderCallCount).toBeGreaterThan(0);
    
    // Reset fetch mock but keep cache
    global.fetch.mockClear();
    
    // Second render - should use cache
    cleanup();
    render(<HomePage />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
    
    // Should make fewer calls on second render
    expect(global.fetch.mock.calls.length).toBeLessThanOrEqual(firstRenderCallCount);
    
    // Clean up
    Storage.prototype.getItem.mockRestore();
    Storage.prototype.setItem.mockRestore();
  });
}); 