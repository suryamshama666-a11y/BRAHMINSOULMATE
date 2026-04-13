/**
 * K6 Spike Testing Script
 * Tests system behavior under sudden traffic spikes
 * 
 * Run: k6 run tests/load/spike-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

export const options = {
  stages: [
    // Normal load
    { duration: '2m', target: 50 },
    // Sudden spike
    { duration: '30s', target: 500 },
    // Stay at spike
    { duration: '3m', target: 500 },
    // Drop back to normal
    { duration: '30s', target: 50 },
    // Stay at normal
    { duration: '2m', target: 50 },
    // Another spike
    { duration: '30s', target: 1000 },
    // Stay at higher spike
    { duration: '2m', target: 1000 },
    // Ramp down
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    errors: ['rate<0.1'], // Allow 10% errors during spikes
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  errorRate.add(!success);
  apiDuration.add(res.timings.duration);
  
  sleep(0.5);
}
