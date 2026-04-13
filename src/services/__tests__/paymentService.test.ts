import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '../paymentService';

// Mock crypto for signature verification
const crypto = {
  createHmac: (_algorithm: string, _key: string) => ({
    update: (data: string) => ({
      digest: (_encoding: string) => {
        // Simulated signature for testing
        return data === 'order_123|payment_123' ? 'valid_signature' : 'invalid_signature';
      }
    })
  })
};

global.crypto = crypto as any;

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyPaymentSignature', () => {
    it('should verify valid payment signature', () => {
      const isValid = PaymentService.verifyPaymentSignature(
        'order_123',
        'payment_123',
        'valid_signature'
      );
      expect(isValid).toBe(true);
    });

    it('should reject invalid payment signature', () => {
      const isValid = PaymentService.verifyPaymentSignature(
        'order_123',
        'payment_123',
        'invalid_signature'
      );
      expect(isValid).toBe(false);
    });

    it('should handle missing parameters', () => {
      const isValid = PaymentService.verifyPaymentSignature('', '', '');
      expect(isValid).toBe(false);
    });
  });

  describe('PAYMENT_PLANS', () => {
    it('should have defined payment plans', () => {
      expect(PaymentService.PAYMENT_PLANS).toBeDefined();
      expect(Array.isArray(PaymentService.PAYMENT_PLANS)).toBe(true);
      expect(PaymentService.PAYMENT_PLANS.length).toBeGreaterThan(0);
    });

    it('should have valid plan structure', () => {
      PaymentService.PAYMENT_PLANS.forEach(plan => {
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('price');
        expect(plan).toHaveProperty('features');
        expect(typeof plan.price).toBe('number');
        expect(Array.isArray(plan.features)).toBe(true);
      });
    });
  });
});
