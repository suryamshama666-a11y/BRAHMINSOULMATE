/* Minimal backend smoke check */
const http = require('http');

const BASE = process.env.SMOKE_BASE || 'http://localhost:3001';

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(BASE + path, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('Timeout'));
    });
  });
}

(async () => {
  try {
    const health = await get('/health');
    const ready = await get('/ready');
    const ok = health.status === 200 && ready.status === 200;
    if (!ok) {
      console.error('Smoke check failed:', { health: health.status, ready: ready.status });
      process.exit(1);
    }
    console.log('Smoke check passed');
  } catch (e) {
    console.error('Smoke check error:', e.message);
    process.exit(1);
  }
})();

