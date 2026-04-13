/**
 * K6 Stress Testing Script
 * Pushes the system beyond normal capacity to find breaking points
 * 
 * Run: k6 run tests/load/stress-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

export const options = {
  stages: [
    // Ramp up to normal load
    { duration: '2m', target: 100 },
    // Stay at normal load
    { duration: '5m', target: 100 },
    // Ramp up to stress level
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    // Push to breaking point
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    // Beyond breaking point
    { duration: '2m', target: 400 },
    { duration: '5m', target: 400 },
    // Ramp down
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    // We expect some failures in stress test
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    errors: ['rate<0.05'], // Allow up to 5% errors
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

export default function () {
  // Mix of different endpoints
  const endpoints = [
    '/health',
    '/api/profile/search/all?limit=20',
    '/api/events',
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${endpoint}`);
  
  const success = check(res, {
    'status is 200 or 503': (r) => r.status === 200 || r.status === 503,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(!success);
  apiDuration.add(res.timings.duration);
  
  // Minimal sleep to maximize stress
  sleep(0.1);
}

export function handleSummary(data) {
  return {
    'stress-test-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n' + indent + '=== Stress Test Summary ===\n\n';
  
  // Metrics
  const metrics = data.metrics;
  
  if (metrics.http_reqs) {
    summary += indent + `Total Requests: ${metrics.http_reqs.values.count}\n`;
  }
  
  if (metrics.http_req_duration) {
    summary += indent + `Avg Response Time: ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += indent + `P95 Response Time: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += indent + `P99 Response Time: ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  }
  
  if (metrics.http_req_failed) {
    const failRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += indent + `Failed Requests: ${failRate}%\n`;
  }
  
  if (metrics.errors) {
    const errRate = (metrics.errors.values.rate * 100).toFixed(2);
    summary += indent + `Error Rate: ${errRate}%\n`;
  }
  
  summary += '\n';
  
  return summary;
}
