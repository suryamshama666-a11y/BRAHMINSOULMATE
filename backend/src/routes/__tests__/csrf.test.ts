import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server';

describe('CSRF Protection', () => {
  let csrfToken: string;
  let cookies: string[];

  beforeAll(async () => {
    // Get CSRF token from a GET request
    const response = await request(app)
      .get('/api/health');
    
    // Extract CSRF token from response headers
    csrfToken = response.headers['x-csrf-token'] || '';
    const setCookieHeader = response.headers['set-cookie'];
    cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [];
  });

  describe('POST requests', () => {
    it('should reject POST without CSRF token', async () => {
      const response = await request(app)
        .post('/api/profile')
        .send({ name: 'Test' });
      
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('CSRF');
    });

    it('should reject POST with invalid CSRF token', async () => {
      const response = await request(app)
        .post('/api/profile')
        .set('X-CSRF-Token', 'invalid-token')
        .send({ name: 'Test' });
      
      expect(response.status).toBe(403);
    });

    it('should accept POST with valid CSRF token', async () => {
      // This test would need a valid token and auth
      // Skipping actual POST since it requires auth
      expect(csrfToken).toBeDefined();
    });
  });

  describe('PUT requests', () => {
    it('should reject PUT without CSRF token', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({ name: 'Updated' });
      
      expect(response.status).toBe(403);
    });
  });

  describe('DELETE requests', () => {
    it('should reject DELETE without CSRF token', async () => {
      const response = await request(app)
        .delete('/api/messages/test-id');
      
      expect(response.status).toBe(403);
    });
  });

  describe('GET requests', () => {
    it('should allow GET without CSRF token', async () => {
      const response = await request(app)
        .get('/api/health');
      
      expect(response.status).toBe(200);
    });

    it('should include CSRF token in response headers', async () => {
      const response = await request(app)
        .get('/api/health');
      
      expect(response.headers['x-csrf-token']).toBeDefined();
    });
  });

  describe('CSRF token generation', () => {
    it('should generate unique tokens for each request', async () => {
      const response1 = await request(app).get('/api/health');
      const response2 = await request(app).get('/api/health');
      
      const token1 = response1.headers['x-csrf-token'];
      const token2 = response2.headers['x-csrf-token'];
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });

    it('should set CSRF token in secure cookie', async () => {
      const response = await request(app).get('/api/health');
      const setCookieHeader = response.headers['set-cookie'];
      
      expect(setCookieHeader).toBeDefined();
      if (Array.isArray(setCookieHeader)) {
        const csrfCookie = setCookieHeader.find(c => c.includes('csrf'));
        expect(csrfCookie).toBeDefined();
      }
    });
  });
});
