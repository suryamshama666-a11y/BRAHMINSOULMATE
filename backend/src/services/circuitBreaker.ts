/**
 * Circuit Breaker Pattern for External API Calls
 * Prevents cascading failures when external services are down
 */
import { Request, Response, NextFunction } from 'express';
import { CircuitBreakerStatus } from '../types/domain';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringWindow: number;
}

export interface CircuitState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  lastAttemptTime: number;
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState;
  private fallbackResponse?: unknown;

  constructor(config: CircuitBreakerConfig, fallbackResponse?: unknown) {
    this.config = config;
    this.fallbackResponse = fallbackResponse;
    this.state = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED',
      lastAttemptTime: 0
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Check if circuit should be reset
    this.checkState(now);

    switch (this.state.state) {
      case 'OPEN':
        // Circuit is open, check if it's time to try again
        if (now - this.state.lastFailureTime > this.config.resetTimeout) {
          this.state.state = 'HALF_OPEN';
          this.state.lastAttemptTime = now;
        } else {
          throw new Error('Circuit breaker is OPEN - service unavailable');
        }
        break;

      case 'HALF_OPEN':
        // Only allow one request in half-open state
        if (now - this.state.lastAttemptTime < 1000) {
          throw new Error('Circuit breaker is HALF_OPEN - waiting for response');
        }
        this.state.lastAttemptTime = now;
        break;

      case 'CLOSED':
        // Circuit is closed, allow request
        break;
    }

    try {
      const result = await fn();
      this.onSuccess(now);
      return result;
    } catch (error) {
      this.onFailure(now);
      throw error;
    }
  }

  /**
   * Record a successful request
   */
  private onSuccess(now: number): void {
    this.state.failures = 0;
    this.state.state = 'CLOSED';
  }

  /**
   * Record a failed request
   */
  private onFailure(now: number): void {
    this.state.failures++;
    this.state.lastFailureTime = now;

    if (this.state.failures >= this.config.failureThreshold) {
      this.state.state = 'OPEN';
    }
  }

  /**
   * Check if circuit should be reset to CLOSED
   */
  private checkState(now: number): void {
    if (this.state.state === 'OPEN' && 
        now - this.state.lastFailureTime > this.config.resetTimeout) {
      this.state.state = 'HALF_OPEN';
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return { ...this.state };
  }

  /**
   * Get circuit breaker status for monitoring
   */
  getStatus(): CircuitBreakerStatus {
    const now = Date.now();
    const timeSinceLastFailure = now - this.state.lastFailureTime;
    
    return {
      state: this.state.state,
      failures: this.state.failures,
      lastFailureTime: this.state.lastFailureTime,
      timeSinceLastFailure,
      isHealthy: this.state.state === 'CLOSED' && timeSinceLastFailure < this.config.resetTimeout
    };
  }
}

// Pre-configured circuit breakers for different services
export const paymentCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringWindow: 300000 // 5 minutes
});

export const externalApiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000, // 30 seconds
  monitoringWindow: 180000 // 3 minutes
});

export const notificationCircuitBreaker = new CircuitBreaker({
  failureThreshold: 10,
  resetTimeout: 120000, // 2 minutes
  monitoringWindow: 600000 // 10 minutes
});

/**
 * Middleware to protect routes with circuit breaker
 */
export function circuitBreakerMiddleware(circuitBreaker: CircuitBreaker) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const status = circuitBreaker.getStatus();
    
    if (!status.isHealthy) {
      res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable',
        status: 'CIRCUIT_OPEN',
        retryAfter: Math.ceil(status.timeSinceLastFailure / 1000)
      });
      return;
    }
    
    next();
  };
}

/**
 * Circuit breaker service for monitoring
 */
export class CircuitBreakerService {
  private breakers: Map<string, CircuitBreaker> = new Map();

  register(name: string, circuitBreaker: CircuitBreaker): void {
    this.breakers.set(name, circuitBreaker);
  }

  getStatus(): Record<string, CircuitBreakerStatus> {
    const status: Record<string, CircuitBreakerStatus> = {};
    
    this.breakers.forEach((breaker, name) => {
      status[name] = breaker.getStatus();
    });
    
    return status;
  }

  getSummary(): {
    healthy: number;
    unhealthy: number;
    total: number;
    services: Record<string, string>;
  } {
    let healthy = 0;
    let unhealthy = 0;
    const services: Record<string, string> = {};
    
    this.breakers.forEach((breaker, name) => {
      const status = breaker.getStatus();
      services[name] = status.state;
      
      if (status.isHealthy) {
        healthy++;
      } else {
        unhealthy++;
      }
    });
    
    return {
      healthy,
      unhealthy,
      total: healthy + unhealthy,
      services
    };
  }
}

export const circuitBreakerService = new CircuitBreakerService();

// Register default circuit breakers
circuitBreakerService.register('payment', paymentCircuitBreaker);
circuitBreakerService.register('externalApi', externalApiCircuitBreaker);
circuitBreakerService.register('notification', notificationCircuitBreaker);