/**
 * K6 Soak Testing Script
 * Tests system stability over extended period (memory leaks, resource exhaustion)
 * 
 * Run: k6 run tests/load/soak-test.js
 * Warning: This test runs for 2+ hours
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

export const options = {
  stages: [
    // Ramp up
    { duration: '5m', target: 100 },
    // Soak for 2 hours
    { duration: '2h', target: 100 },
    // Ramp down
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

export default function () {
  // Simulate realistic user behavior
  
  // Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, { 'health check ok': (r) => r.status === 200 });
  sleep(2);
  
  // Browse profiles
  res = http.get(`${BASE_URL}/api/profile/search/all?limit=20`);
  check(res, { 'profile search ok': (r) => r.status === 200 });
  sleep(3);
  
  // View events
  res = http.get(`${BASE_URL}/api/events`);
  check(res, { 'events ok': (r) => r.status === 200 });
  sleep(5);
  
  // Random sleep to simulate reading
  sleep(Math.random() * 10 + 5);
}
