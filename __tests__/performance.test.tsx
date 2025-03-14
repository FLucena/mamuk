import { render } from '@testing-library/react';
import { Analytics } from '../src/app/components/Analytics';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/test',
  useSearchParams: () => ({ toString: () => '?param=test' }),
}));

describe('Performance Monitoring', () => {
  beforeEach(() => {
    // Mock Performance API
    Object.defineProperty(window, 'performance', {
      value: {
        mark: jest.fn(),
        clearMarks: jest.fn(),
        getEntriesByType: jest.fn().mockReturnValue([
          { name: 'first-contentful-paint', startTime: 100 },
        ]),
      },
      writable: true,
    });

    // Mock PerformanceObserver
    (global as any).PerformanceObserver = class {
      constructor(callback: Function) {
        this.callback = callback;
      }
      callback: Function;
      observe() {
        // Simulate performance entries
        this.callback({
          getEntries: () => [{
            startTime: 200,
            processingStart: 250,
            hadRecentInput: false,
            value: 0.1,
          }],
        });
      }
      disconnect() {}
    };

    // Mock console.log
    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize performance monitoring', () => {
    render(<Analytics />);
    expect(window.performance.mark).toHaveBeenCalledWith('pageview-start');
  });

  it('should track First Contentful Paint', () => {
    render(<Analytics />);
    expect(console.log).toHaveBeenCalledWith(
      'Performance Metrics:',
      expect.objectContaining({
        name: 'FCP',
        value: 100,
      })
    );
  });

  it('should track Largest Contentful Paint', () => {
    render(<Analytics />);
    expect(console.log).toHaveBeenCalledWith(
      'Performance Metrics:',
      expect.objectContaining({
        name: 'LCP',
        value: 200,
      })
    );
  });

  it('should track First Input Delay', () => {
    render(<Analytics />);
    expect(console.log).toHaveBeenCalledWith(
      'Performance Metrics:',
      expect.objectContaining({
        name: 'FID',
        value: 50, // 250 - 200
      })
    );
  });

  it('should track Cumulative Layout Shift', () => {
    render(<Analytics />);
    expect(console.log).toHaveBeenCalledWith(
      'Performance Metrics:',
      expect.objectContaining({
        name: 'CLS',
        value: 0.1,
      })
    );
  });

  it('should include URL in metrics', () => {
    render(<Analytics />);
    expect(console.log).toHaveBeenCalledWith(
      'Performance Metrics:',
      expect.objectContaining({
        path: '/test?param=test',
      })
    );
  });

  it('should cleanup on unmount', () => {
    const { unmount } = render(<Analytics />);
    unmount();
    expect(window.performance.clearMarks).toHaveBeenCalled();
  });
}); 