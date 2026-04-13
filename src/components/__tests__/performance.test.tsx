import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

global.performance = mockPerformance as any;

describe('Performance Optimization Tests', () => {
  describe('React Query Caching', () => {
    it('should cache API responses and prevent unnecessary refetches', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            retryDelay: 1000,
          },
        },
      });

      const fetchUserData = vi.fn(() => 
        Promise.resolve({ id: 1, name: 'John Doe' })
      );

      function TestComponent() {
        const { data } = useQuery(['user', 1], fetchUserData);
        return <div>{data?.name}</div>;
      }

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(fetchUserData).toHaveBeenCalledTimes(1);

      // Rerender component - should use cache
      rerender(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      // Should not trigger another fetch
      expect(fetchUserData).toHaveBeenCalledTimes(1);
    });

    it('should implement proper cache invalidation strategies', async () => {
      const queryClient = new QueryClient();
      const fetchUserData = vi.fn(() => 
        Promise.resolve({ id: 1, name: 'John Doe' })
      );

      // Initial fetch
      await queryClient.fetchQuery(['user', 1], fetchUserData);
      expect(fetchUserData).toHaveBeenCalledTimes(1);

      // Invalidate and refetch
      queryClient.invalidateQueries(['user', 1]);
      await queryClient.fetchQuery(['user', 1], fetchUserData);
      
      expect(fetchUserData).toHaveBeenCalledTimes(2);
    });
  });

  describe('Component Performance', () => {
    it('should implement proper memoization for expensive components', () => {
      const expensiveCalculation = vi.fn((n: number) => {
        // Simulate expensive calculation
        let result = 0;
        for (let i = 0; i < n; i++) {
          result += i;
        }
        return result;
      });

      function ExpensiveComponent({ value }: { value: number }) {
        const memoizedValue = React.useMemo(() => {
          return expensiveCalculation(value);
        }, [value]);

        return <div>Result: {memoizedValue}</div>;
      }

      const { rerender } = render(<ExpensiveComponent value={100} />);
      
      expect(expensiveCalculation).toHaveBeenCalledTimes(1);
      expect(expensiveCalculation).toHaveBeenCalledWith(100);

      // Rerender with same props - should not recalculate
      rerender(<ExpensiveComponent value={100} />);
      expect(expensiveCalculation).toHaveBeenCalledTimes(1);

      // Rerender with different props - should recalculate
      rerender(<ExpensiveComponent value={200} />);
      expect(expensiveCalculation).toHaveBeenCalledTimes(2);
      expect(expensiveCalculation).toHaveBeenCalledWith(200);
    });

    it('should optimize re-renders with React.memo', () => {
      const renderCount = vi.fn();

      const MemoizedComponent = React.memo(({ name }: { name: string }) => {
        renderCount();
        return <div>Hello {name}</div>;
      });

      function ParentComponent() {
        const [count, setCount] = React.useState(0);
        return (
          <div>
            <MemoizedComponent name="John" />
            <button onClick={() => setCount(count + 1)}>Count: {count}</button>
          </div>
        );
      }

      const { getByRole } = render(<ParentComponent />);
      
      expect(renderCount).toHaveBeenCalledTimes(1);

      // Click button to trigger parent re-render
      const button = getByRole('button');
      button.click();

      // Memoized component should not re-render
      expect(renderCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('Image Optimization', () => {
    it('should implement lazy loading for images', () => {
      function ImageGallery({ images }: { images: string[] }) {
        return (
          <div>
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Image ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        );
      }

      const images = Array.from({ length: 20 }, (_, i) => `image${i}.jpg`);
      
      render(<ImageGallery images={images} />);
      
      const imgs = screen.getAllByRole('img');
      expect(imgs).toHaveLength(20);
      
      imgs.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
        expect(img).toHaveAttribute('decoding', 'async');
      });
    });

    it('should implement responsive images with srcSet', () => {
      function ResponsiveImage() {
        return (
          <img
            src="image-800w.jpg"
            srcSet="image-320w.jpg 320w, image-640w.jpg 640w, image-800w.jpg 800w"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt="Responsive example"
          />
        );
      }

      render(<ResponsiveImage />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('srcSet');
      expect(img).toHaveAttribute('sizes');
    });
  });

  describe('Bundle Optimization', () => {
    it('should implement code splitting for large components', () => {
      const LazyComponent = React.lazy(() => 
        Promise.resolve({ 
          default: () => <div>Lazy loaded component</div> 
        })
      );

      function App() {
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
          </React.Suspense>
        );
      }

      render(<App />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should implement dynamic imports for utilities', async () => {
      const mockDynamicImport = vi.fn(() => 
        Promise.resolve({ 
          default: () => 'Dynamic utility function' 
        })
      );

      const utility = await mockDynamicImport();
      expect(utility.default()).toBe('Dynamic utility function');
      expect(mockDynamicImport).toHaveBeenCalledTimes(1);
    });
  });

  describe('Network Performance', () => {
    it('should implement request debouncing', () => {
      const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func(...args), delay);
        };
      };

      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      // Call multiple times in quick succession
      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      // Should only be called once after debounce delay
      expect(mockFn).not.toHaveBeenCalled();
      
      // Wait for debounce to complete
      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('third');
      }, 400);
    });

    it('should implement request throttling', () => {
      const throttle = (func: (...args: any[]) => void, limit: number) => {
        let inThrottle: boolean;
        return (...args: any[]) => {
          if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
          }
        };
      };

      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 300);

      // Call multiple times
      throttledFn('first');
      throttledFn('second');
      throttledFn('third');

      // Should only be called once within the throttle period
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      function ComponentWithEventListener() {
        React.useEffect(() => {
          const handleResize = () => {
            console.log('Window resized');
          };

          window.addEventListener('resize', handleResize);

          return () => {
            window.removeEventListener('resize', handleResize);
          };
        }, []);

        return <div>Component with event listener</div>;
      }

      const { unmount } = render(<ComponentWithEventListener />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should clean up timers on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      function ComponentWithTimer() {
        React.useEffect(() => {
          const interval = setInterval(() => {
            console.log('Timer tick');
          }, 1000);

          return () => {
            clearInterval(interval);
          };
        }, []);

        return <div>Component with timer</div>;
      }

      const { unmount } = render(<ComponentWithTimer />);
      
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Performance Monitoring', () => {
    it('should measure component render performance', () => {
      const performanceMarkSpy = vi.spyOn(performance, 'mark');
      const performanceMeasureSpy = vi.spyOn(performance, 'measure');

      function MeasuredComponent() {
        React.useEffect(() => {
          performance.mark('MeasuredComponent-render-start');
          
          // Simulate some work
          const startTime = performance.now();
          while (performance.now() - startTime < 10) {
            // Busy wait for 10ms
          }
          
          performance.mark('MeasuredComponent-render-end');
          performance.measure(
            'MeasuredComponent-render',
            'MeasuredComponent-render-start',
            'MeasuredComponent-render-end'
          );
        }, []);

        return <div>Measured component</div>;
      }

      render(<MeasuredComponent />);
      
      expect(performanceMarkSpy).toHaveBeenCalledWith('MeasuredComponent-render-start');
      expect(performanceMarkSpy).toHaveBeenCalledWith('MeasuredComponent-render-end');
      expect(performanceMeasureSpy).toHaveBeenCalledWith(
        'MeasuredComponent-render',
        'MeasuredComponent-render-start',
        'MeasuredComponent-render-end'
      );
      
      performanceMarkSpy.mockRestore();
      performanceMeasureSpy.mockRestore();
    });

    it('should implement performance budgets', () => {
      const PERFORMANCE_BUDGET = {
        componentRender: 16, // 60fps = 16.67ms per frame
        apiResponse: 1000, // 1 second
        imageLoad: 3000, // 3 seconds
      };

      function checkPerformanceBudget(measurement: string, actualTime: number) {
        const budget = PERFORMANCE_BUDGET[measurement as keyof typeof PERFORMANCE_BUDGET];
        if (budget && actualTime > budget) {
          console.warn(`Performance budget exceeded for ${measurement}: ${actualTime}ms > ${budget}ms`);
          return false;
        }
        return true;
      }

      // Test within budget
      expect(checkPerformanceBudget('componentRender', 10)).toBe(true);
      expect(checkPerformanceBudget('apiResponse', 800)).toBe(true);
      expect(checkPerformanceBudget('imageLoad', 2000)).toBe(true);

      // Test exceeding budget
      expect(checkPerformanceBudget('componentRender', 20)).toBe(false);
      expect(checkPerformanceBudget('apiResponse', 1200)).toBe(false);
      expect(checkPerformanceBudget('imageLoad', 4000)).toBe(false);
    });
  });
});
