/**
 * K6 Load Testing Script
 * Tests API endpoints under various load conditions
 * 
 * Install: brew install k6 (Mac) or choco install k6 (Windows)
 * Run: k6 run tests/load/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  stages: [
    // Ramp-up: 0 to 50 users over 2 minutes
    { duration: '2m', target: 50 },
    // Stay at 50 users for 5 minutes
    { duration: '5m', target: 50 },
    // Ramp-up: 50 to 100 users over 2 minutes
    { duration: '2m', target: 100 },
    // Stay at 100 users for 5 minutes
    { duration: '5m', target: 100 },
    // Spike test: 100 to 200 users over 1 minute
    { duration: '1m', target: 200 },
    // Stay at 200 users for 3 minutes
    { duration: '3m', target: 200 },
    // Ramp-down: 200 to 0 users over 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // 95% of requests should be below 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate should be below 1%
    errors: ['rate<0.01'],
    // 99% of requests should succeed
    http_req_failed: ['rate<0.01'],
  },
};

// Base URL - change this to your API URL
const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'Test123!@#' },
  { email: 'test2@example.com', password: 'Test123!@#' },
  { email: 'test3@example.com', password: 'Test123!@#' },
];

/**
 * Setup function - runs once per VU
 */
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  return { startTime: Date.now() };
}

/**
 * Main test function - runs for each VU iteration
 */
export default function (data) {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Test 1: Health Check
  testHealthCheck();
  sleep(1);
  
  // Test 2: Profile Search
  testProfileSearch();
  sleep(1);
  
  // Test 3: Get Profile
  testGetProfile();
  sleep(1);
  
  // Test 4: Authentication Flow
  const token = testAuthentication(user);
  if (token) {
    sleep(1);
    
    // Test 5: Get Matches (authenticated)
    testGetMatches(token);
    sleep(1);
    
    // Test 6: Send Message (authenticated)
    testSendMessage(token);
    sleep(1);
  }
  
  // Random sleep between 1-3 seconds to simulate real user behavior
  sleep(Math.random() * 2 + 1);
}

/**
 * Test health check endpoint
 */
function testHealthCheck() {
  const res = http.get(`${BASE_URL}/health`);
  
  const success = check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check has status OK': (r) => r.json('status') === 'OK',
  });
  
  errorRate.add(!success);
  apiDuration.add(res.timings.duration);
  
  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
  }
}

/**
 * Test profile search endpoint
 */
function testProfileSearch() {
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const res = http.get(
    `${BASE_URL}/api/profile/search/all?gender=female&limit=20`,
    params
  );
  
  const success = check(res, {
    'profile search status is 200': (r) => r.status === 200,
    'profile search returns profiles': (r) => {
      try {
        const body = r.json();
        return body.success === true;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  apiDuration.add(res.timings.duration);
  
  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
  }
}

/**
 * Test get profile endpoint
 */
function testGetProfile() {
  // Use a test profile ID
  const profileId = '00000000-0000-0000-0000-000000000001';
  
  const res = http.get(`${BASE_URL}/api/profile/${profileId}`);
  
  const success = check(res, {
    'get profile status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });
  
  errorRate.add(!success);
  apiDuration.add(res.timings.duration);
  
  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
  }
}

/**
 * Test authentication flow
 */
function testAuthentication(user) {
  const payload = JSON.stringify({
    email: user.email,
    password: user.password,
  });
  
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  
  const success = check(res, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });
  
  errorRate.add(!success);
  apiDuration.add(res.timings.duration);
  
  if (success) {
    successfulRequests.add(1);
    
    if (res.status === 200) {
      try {
        const body = res.json();
        return body.token || body.access_token;
      } catch {
        return null;
      }
    }
  } else {
    failedRequests.add(1);
  }
  
  return null;
}

/**
 * Test get matches endpoint (authenticated)
 */
function testGetMatches(token) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
  
  const res = http.get(`${BASE_URL}/api/matching/recommendations`, params);
  
  const success = check(res, {
    'get matches status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });
  
  errorRate.add(!success);
  apiDuration.add(res.timings.duration);
  
  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
  }
}

/**
 * Test send message endpoint (authenticated)
 */
function testSendMessage(token) {
  const payload = JSON.stringify({
    receiver_id: '00000000-0000-0000-0000-000000000002',
    content: 'Load test message',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
  
  const res = http.post(`${BASE_URL}/api/messages`, payload, params);
  
  const success = check(res, {
    'send message status is 200 or 401': (r) => r.status === 200 || r.status === 401 || r.status === 400,
  });
  
  errorRate.add(!success);
  apiDuration.add(res.timings.duration);
  
  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
  }
}

/**
 * Teardown function - runs once after all VUs finish
 */
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration} seconds`);
}
