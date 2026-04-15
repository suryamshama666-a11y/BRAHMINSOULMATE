import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker } from '../circuitBreaker';

describe('Circuit Breaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 100,
      monitoringWindow: 5000
    });
  });

  describe('Initial State', () => {
    it('should start in CLOSED state', () => {
      const state = breaker.getState();
      expect(state.state).toBe('CLOSED');
    });

    it('should have zero failures initially', () => {
      const state = breaker.getState();
      expect(state.failures).toBe(0);
    });

    it('should have zero last attempt time initially', () => {
      const state = breaker.getState();
      expect(state.lastAttemptTime).toBe(0);
    });
  });

  describe('Successful Execution', () => {
    it('should execute successful function', async () => {
      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
    });

    it('should reset failure count on success', async () => {
      await breaker.execute(() => Promise.resolve('success'));
      const state = breaker.getState();
      expect(state.failures).toBe(0);
    });

    it('should handle multiple successful executions', async () => {
      for (let i = 0; i < 5; i++) {
        await breaker.execute(() => Promise.resolve(`success-${i}`));
      }
      const state = breaker.getState();
      expect(state.state).toBe('CLOSED');
    });
  });

  describe('Failed Execution', () => {
    it('should handle failed function', async () => {
      try {
        await breaker.execute(() => Promise.reject(new Error('Test error')));
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).toBe('Test error');
      }
    });

    it('should increment failure count', async () => {
      try {
        await breaker.execute(() => Promise.reject(new Error('Test error')));
      } catch {
        // Expected
      }
      const state = breaker.getState();
      expect(state.failures).toBe(1);
    });

    it('should open after threshold failures', async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Test error')));
        } catch {
          // Expected
        }
      }
      const state = breaker.getState();
      expect(state.state).toBe('OPEN');
    });
  });

  describe('OPEN State', () => {
    it('should reject calls when OPEN', async () => {
      // Trigger OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Test error')));
        } catch {
          // Expected
        }
      }

      // Try to execute when OPEN
      try {
        await breaker.execute(() => Promise.resolve('success'));
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).toContain('Circuit breaker is OPEN');
      }
    });
  });

  describe('HALF_OPEN State', () => {
    it('should transition to HALF_OPEN after reset timeout', async () => {
      // Trigger OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Test error')));
        } catch {
          // Expected
        }
      }

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      const state = breaker.getState();
      expect(state.state).toBe('HALF_OPEN');
    });

    it('should close on successful execution in HALF_OPEN', async () => {
      // Trigger OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Test error')));
        } catch {
          // Expected
        }
      }

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Execute successfully
      await breaker.execute(() => Promise.resolve('success'));

      const state = breaker.getState();
      expect(state.state).toBe('CLOSED');
    });

    it('should reopen on failure in HALF_OPEN', async () => {
      // Trigger OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Test error')));
        } catch {
          // Expected
        }
      }

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Execute with failure
      try {
        await breaker.execute(() => Promise.reject(new Error('Test error')));
      } catch {
        // Expected
      }

      const state = breaker.getState();
      expect(state.state).toBe('OPEN');
    });
  });

  describe('State Transitions', () => {
    it('should follow correct state machine', async () => {
      // Start: CLOSED
      expect(breaker.getState().state).toBe('CLOSED');

      // Fail 3 times: CLOSED -> OPEN
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Test')));
        } catch {
          // Expected
        }
      }
      expect(breaker.getState().state).toBe('OPEN');

      // Wait: OPEN -> HALF_OPEN
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(breaker.getState().state).toBe('HALF_OPEN');

      // Success: HALF_OPEN -> CLOSED
      await breaker.execute(() => Promise.resolve('success'));
      expect(breaker.getState().state).toBe('CLOSED');
    });
  });

  describe('Monitoring', () => {
    it('should track last failure time', async () => {
      try {
        await breaker.execute(() => Promise.reject(new Error('Test')));
      } catch {
        // Expected
      }

      const state = breaker.getState();
      expect(state.lastFailureTime).toBeGreaterThan(0);
    });

    it('should track last attempt time', async () => {
      await breaker.execute(() => Promise.resolve('success'));

      const state = breaker.getState();
      expect(state.lastAttemptTime).toBeGreaterThan(0);
    });
  });
});
