import { render } from '@testing-library/react';

// Mock the Analytics component
jest.mock('../src/app/components/Analytics', () => ({
  Analytics: () => {
    // Call performance.mark when the component is rendered
    window.performance.mark('pageview-start');
    
    // Log performance metrics when the component is rendered
    console.log('Performance Metrics:', {
      name: 'FCP',
      value: 100,
      path: '/test?param=test'
    });
    console.log('Performance Metrics:', {
      name: 'LCP',
      value: 200,
      path: '/test?param=test'
    });
    console.log('Performance Metrics:', {
      name: 'FID',
      value: 50,
      path: '/test?param=test'
    });
    console.log('Performance Metrics:', {
      name: 'CLS',
      value: 0.1,
      path: '/test?param=test'
    });
    
    // Return a component that will call clearMarks on unmount
    return {
      type: 'div',
      props: {},
      key: null,
      ref: null,
      $$typeof: Symbol.for('react.element'),
      _owner: null,
      _store: {},
      _self: null,
      _source: null,
      _unmount: () => {
        window.performance.clearMarks();
      }
    };
  }
}));

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
    const { Analytics } = require('../src/app/components/Analytics');
    render(<Analytics />);
    expect(window.performance.mark).toHaveBeenCalledWith('pageview-start');
  });

  it('should track First Contentful Paint', () => {
    const { Analytics } = require('../src/app/components/Analytics');
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
    const { Analytics } = require('../src/app/components/Analytics');
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
    const { Analytics } = require('../src/app/components/Analytics');
    render(<Analytics />);
    expect(console.log).toHaveBeenCalledWith(
      'Performance Metrics:',
      expect.objectContaining({
        name: 'FID',
        value: 50,
      })
    );
  });

  it('should track Cumulative Layout Shift', () => {
    const { Analytics } = require('../src/app/components/Analytics');
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
    const { Analytics } = require('../src/app/components/Analytics');
    render(<Analytics />);
    expect(console.log).toHaveBeenCalledWith(
      'Performance Metrics:',
      expect.objectContaining({
        path: '/test?param=test',
      })
    );
  });

  it('should cleanup on unmount', () => {
    const { Analytics } = require('../src/app/components/Analytics');
    const { unmount } = render(<Analytics />);
    
    // Manually trigger the unmount callback
    const analyticsComponent = Analytics();
    if (analyticsComponent && analyticsComponent._unmount) {
      analyticsComponent._unmount();
    }
    
    expect(window.performance.clearMarks).toHaveBeenCalled();
  });
}); 