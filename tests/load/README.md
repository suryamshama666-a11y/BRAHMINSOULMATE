# Load Testing Suite

Comprehensive load testing for Brahmin Soulmate Connect API.

## Tools Used

1. **K6** - Modern load testing tool (recommended)
2. **Artillery** - Alternative load testing tool

## Installation

### K6 (Recommended)
```bash
# macOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Artillery (Optional)
```bash
npm install -g artillery
```

## Test Types

### 1. Load Test (`k6-load-test.js`)
Tests normal and peak load conditions.
- Duration: ~20 minutes
- Max users: 200 concurrent
- Tests: Health, Search, Auth, Messaging

```bash
k6 run tests/load/k6-load-test.js
```

### 2. Stress Test (`stress-test.js`)
Pushes system beyond normal capacity.
- Duration: ~30 minutes
- Max users: 400 concurrent
- Goal: Find breaking point

```bash
k6 run tests/load/stress-test.js
```

### 3. Spike Test (`spike-test.js`)
Tests sudden traffic spikes.
- Duration: ~15 minutes
- Spikes: 50 → 500 → 1000 users
- Goal: Test auto-scaling

```bash
k6 run tests/load/spike-test.js
```

### 4. Soak Test (`soak-test.js`)
Tests stability over extended period.
- Duration: 2+ hours
- Users: 100 concurrent
- Goal: Find memory leaks

```bash
k6 run tests/load/soak-test.js
```

## Running Tests

### Quick Start
```bash
# Run basic load test
k6 run tests/load/k6-load-test.js

# Run with custom API URL
API_URL=https://api.yourdomain.com k6 run tests/load/k6-load-test.js

# Run all tests
chmod +x tests/load/run-all-tests.sh
./tests/load/run-all-tests.sh
```

### Artillery Tests
```bash
# Run Artillery test
artillery run tests/load/artillery-config.yml

# Generate HTML report
artillery run --output report.json tests/load/artillery-config.yml
artillery report report.json --output report.html
```

## Interpreting Results

### K6 Metrics
- `http_req_duration`: Response time
- `http_req_failed`: Failed requests rate
- `http_reqs`: Total requests
- `vus`: Virtual users
- `iterations`: Completed iterations

### Success Criteria
✅ P95 response time < 500ms
✅ P99 response time < 1000ms
✅ Error rate < 1%
✅ No memory leaks (soak test)
✅ System recovers from spikes

### Warning Signs
⚠️ Response time increasing over time
⚠️ Error rate > 1%
⚠️ Memory usage growing (soak test)
⚠️ System doesn't recover from spikes

## Test Scenarios

### Anonymous User
1. Health check
2. Browse profiles
3. View events
4. Search profiles

### Authenticated User
1. Login
2. Get recommendations
3. View profiles
4. Send messages
5. Check notifications

## Results

Results are saved in `tests/load/results/`:
- `load-test.json` - Basic load test
- `stress-test.json` - Stress test
- `spike-test.json` - Spike test
- `artillery-report.html` - Artillery report

## Troubleshooting

### High Error Rates
- Check server logs
- Verify database connections
- Check rate limiting
- Monitor memory usage

### Slow Response Times
- Check database queries
- Review API caching
- Check network latency
- Monitor CPU usage

### System Crashes
- Check memory limits
- Review error logs
- Check database connections
- Monitor resource usage

## Best Practices

1. **Start Small**: Begin with low load
2. **Monitor**: Watch server metrics during tests
3. **Baseline**: Run tests before changes
4. **Compare**: Compare results after changes
5. **Document**: Record findings and improvements

## Next Steps

After load testing:
1. Optimize slow endpoints
2. Add caching where needed
3. Scale infrastructure
4. Set up monitoring alerts
5. Create runbooks for incidents
