// Pings the Supabase REST endpoint so the free-tier project stays active
// and doesn't get auto-paused after 7 days without API traffic.
// Run: node scripts/keep-alive.mjs
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars');
  process.exit(1);
}

// A real table query (not the /rest/v1/ root) is what resets Supabase's
// 7-day inactivity timer — it has to actually touch the database.
const res = await fetch(`${url}/rest/v1/leaderboard?select=id&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});

if (!res.ok) {
  console.error(`Ping failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}

console.log(`Ping OK (${res.status}) at ${new Date().toISOString()}`);
