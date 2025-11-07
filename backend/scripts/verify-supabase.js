/* Verify Supabase connectivity and presence of expected tables.
   Usage:
     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/verify-supabase.js
   Optional:
     STRICT=1  # exit non-zero if any table check fails
*/
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const strict = process.env.STRICT === '1';

if (!url || !key) {
  console.error('[verify-supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(strict ? 1 : 0);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const expectedTables = [
  'profiles',
  'payment_orders',
  'subscriptions',
  'notifications',
  'events',
  'vdates',
];

async function checkTable(name) {
  try {
    const { error } = await supabase.from(name).select('*', { count: 'exact', head: true }).limit(1);
    if (error) throw error;
    return { name, ok: true };
  } catch (e) {
    return { name, ok: false, error: e.message };
  }
}

(async () => {
  const results = await Promise.all(expectedTables.map(checkTable));
  let failures = 0;
  for (const r of results) {
    if (r.ok) {
      console.log(`[OK] ${r.name}`);
    } else {
      failures++;
      console.log(`[MISS] ${r.name} -> ${r.error}`);
    }
  }
  if (strict && failures > 0) {
    console.error(`Missing ${failures} required table(s)`);
    process.exit(1);
  }
  console.log('Supabase verification completed');
})();

