#!/bin/bash

# Run All Load Tests Script
# This script runs all load tests in sequence and generates reports

echo "========================================="
echo "Starting Load Test Suite"
echo "========================================="
echo ""

# Set API URL (change this to your deployed API)
export API_URL="${API_URL:-http://localhost:3001}"

echo "Testing API: $API_URL"
echo ""

# Create results directory
mkdir -p tests/load/results

# Test 1: Basic Load Test
echo "========================================="
echo "Test 1: Basic Load Test"
echo "Duration: ~20 minutes"
echo "========================================="
k6 run --out json=tests/load/results/load-test.json tests/load/k6-load-test.js
echo ""

# Test 2: Stress Test
echo "========================================="
echo "Test 2: Stress Test"
echo "Duration: ~30 minutes"
echo "========================================="
k6 run --out json=tests/load/results/stress-test.json tests/load/stress-test.js
echo ""

# Test 3: Spike Test
echo "========================================="
echo "Test 3: Spike Test"
echo "Duration: ~15 minutes"
echo "========================================="
k6 run --out json=tests/load/results/spike-test.json tests/load/spike-test.js
echo ""

# Test 4: Artillery Test (if installed)
if command -v artillery &> /dev/null; then
    echo "========================================="
    echo "Test 4: Artillery Load Test"
    echo "Duration: ~10 minutes"
    echo "========================================="
    artillery run --output tests/load/results/artillery-report.json tests/load/artillery-config.yml
    artillery report tests/load/results/artillery-report.json --output tests/load/results/artillery-report.html
    echo ""
fi

echo "========================================="
echo "All Load Tests Complete!"
echo "========================================="
echo ""
echo "Results saved in: tests/load/results/"
echo ""
echo "Summary:"
echo "- Basic Load Test: tests/load/results/load-test.json"
echo "- Stress Test: tests/load/results/stress-test.json"
echo "- Spike Test: tests/load/results/spike-test.json"
if command -v artillery &> /dev/null; then
    echo "- Artillery Report: tests/load/results/artillery-report.html"
fi
echo ""
echo "To view detailed results, open the JSON files or HTML report"
