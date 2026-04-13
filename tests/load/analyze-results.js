/**
 * Load Test Results Analyzer
 * Analyzes K6 JSON output and generates insights
 * 
 * Usage: node tests/load/analyze-results.js tests/load/results/load-test.json
 */

const fs = require('fs');
const path = require('path');

function analyzeResults(filePath) {
  console.log('========================================');
  console.log('Load Test Results Analysis');
  console.log('========================================\n');

  // Read results file
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const metrics = data.metrics;

  // Extract key metrics
  const totalRequests = metrics.http_reqs?.values?.count || 0;
  const failedRequests = metrics.http_req_failed?.values?.passes || 0;
  const avgDuration = metrics.http_req_duration?.values?.avg || 0;
  const p95Duration = metrics.http_req_duration?.values?.['p(95)'] || 0;
  const p99Duration = metrics.http_req_duration?.values?.['p(99)'] || 0;
  const maxDuration = metrics.http_req_duration?.values?.max || 0;
  const minDuration = metrics.http_req_duration?.values?.min || 0;

  // Calculate derived metrics
  const successRate = ((totalRequests - failedRequests) / totalRequests * 100).toFixed(2);
  const failureRate = (failedRequests / totalRequests * 100).toFixed(2);

  // Print summary
  console.log('📊 Summary');
  console.log('─'.repeat(50));
  console.log(`Total Requests:     ${totalRequests.toLocaleString()}`);
  console.log(`Successful:         ${(totalRequests - failedRequests).toLocaleString()} (${successRate}%)`);
  console.log(`Failed:             ${failedRequests.toLocaleString()} (${failureRate}%)`);
  console.log('');

  console.log('⏱️  Response Times');
  console.log('─'.repeat(50));
  console.log(`Average:            ${avgDuration.toFixed(2)}ms`);
  console.log(`Minimum:            ${minDuration.toFixed(2)}ms`);
  console.log(`Maximum:            ${maxDuration.toFixed(2)}ms`);
  console.log(`P95:                ${p95Duration.toFixed(2)}ms`);
  console.log(`P99:                ${p99Duration.toFixed(2)}ms`);
  console.log('');

  // Performance assessment
  console.log('✅ Performance Assessment');
  console.log('─'.repeat(50));

  const assessments = [];

  if (p95Duration < 500) {
    assessments.push('✅ P95 response time is excellent (< 500ms)');
  } else if (p95Duration < 1000) {
    assessments.push('⚠️  P95 response time is acceptable (< 1000ms)');
  } else {
    assessments.push('❌ P95 response time needs improvement (> 1000ms)');
  }

  if (failureRate < 1) {
    assessments.push('✅ Error rate is excellent (< 1%)');
  } else if (failureRate < 5) {
    assessments.push('⚠️  Error rate is acceptable (< 5%)');
  } else {
    assessments.push('❌ Error rate is too high (> 5%)');
  }

  if (avgDuration < 200) {
    assessments.push('✅ Average response time is excellent (< 200ms)');
  } else if (avgDuration < 500) {
    assessments.push('⚠️  Average response time is acceptable (< 500ms)');
  } else {
    assessments.push('❌ Average response time needs improvement (> 500ms)');
  }

  assessments.forEach(a => console.log(a));
  console.log('');

  // Recommendations
  console.log('💡 Recommendations');
  console.log('─'.repeat(50));

  const recommendations = [];

  if (p95Duration > 500) {
    recommendations.push('- Optimize slow endpoints');
    recommendations.push('- Add caching layer');
    recommendations.push('- Review database queries');
  }

  if (failureRate > 1) {
    recommendations.push('- Investigate error logs');
    recommendations.push('- Check rate limiting configuration');
    recommendations.push('- Review error handling');
  }

  if (maxDuration > 5000) {
    recommendations.push('- Add request timeouts');
    recommendations.push('- Implement circuit breakers');
    recommendations.push('- Review long-running operations');
  }

  if (recommendations.length === 0) {
    console.log('✅ No immediate recommendations - system performing well!');
  } else {
    recommendations.forEach(r => console.log(r));
  }

  console.log('');
  console.log('========================================\n');
}

// Run analysis
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node analyze-results.js <path-to-results.json>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

analyzeResults(filePath);
