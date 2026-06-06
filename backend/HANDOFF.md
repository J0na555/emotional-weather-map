# Frontend handoff — Emotional Weather Map (Lideta MVP)

## Supabase credentials

From **Project Settings → API**:

- `SUPABASE_URL` — Project URL
- `SUPABASE_ANON_KEY` — anon public key (never use service_role in the browser)

## Table: `check_ins`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | auto |
| `created_at` | timestamptz | auto |
| `area` | text | `lideta` (default), `bole`, `kazanchis` |
| `emotion` | text | see allowed values below |
| `stress_level` | int | 1–10 |
| `energy_level` | int | 1–10 |
| `sleep_quality` | int | 1–10 |
| `client_token` | uuid | optional — anonymous browser token for 1-hour check-in cooldown |

**Allowed emotions:** `stressed`, `calm`, `anxious`, `energized`, `lonely`, `burned_out`, `motivated`

**Allowed areas:** `lideta`, `bole`, `kazanchis` — omit `area` on insert to default to `lideta`.

## Lideta map constants

All check-ins are for **Lideta** in this MVP. Use one center point and jitter each marker:

```ts
const LIDETA = { lat: 9.0120, lng: 38.7480 };
const jitter = () => (Math.random() - 0.5) * 0.01; // ~±500m

// marker position
{ lat: LIDETA.lat + jitter(), lng: LIDETA.lng + jitter() }
```

## What to call when

| UI need | Call this |
|---------|-----------|
| Submit check-in | `check_ins` insert |
| Map markers (raw rows) | `check_ins` select |
| Heatmap color / headline stats | `get_area_insights` RPC or `area_stats_24h` view |
| Emotion pie/bar chart | `emotion_breakdown_24h` view or `get_area_insights` |
| Trend alert (“+15% stress”) | `get_area_insights` → `trend.delta_pct` |
| “People like you” count | `get_similar_feeling_count` RPC |

Prefer **RPC/views** for dashboards — do not scan all rows for stats.

## Supabase client calls

### Submit check-in

Include a random `client_token` (stored in `localStorage`) so the abuse guard can limit one check-in per hour per browser.

```ts
const clientToken = crypto.randomUUID() // persist in localStorage after first visit

const { error } = await supabase.from('check_ins').insert({
  area: 'lideta', // optional — defaults to lideta in DB
  emotion: 'stressed',
  stress_level: 8,
  energy_level: 3,
  sleep_quality: 4,
  client_token: clientToken,
});
```

If the same `client_token` checks in again within one hour, Postgres raises `CHECK_IN_COOLDOWN`.

### Check-in cooldown (before submit)

```ts
const { data: seconds } = await supabase.rpc('get_check_in_cooldown', {
  p_client_token: clientToken,
});
// 0 = allowed; otherwise seconds until next check-in
```

### Load all check-ins (heatmap markers)

```ts
const { data, error } = await supabase
  .from('check_ins')
  .select('*')
  .eq('area', 'lideta')
  .order('created_at', { ascending: false });
```

### Area insights (map color, charts, forecast copy)

One payload with 24h/7d stats, emotion breakdown, and trend:

```ts
const { data, error } = await supabase.rpc('get_area_insights', {
  p_area: 'lideta',
});
```

**Return shape:**

```json
{
  "area": "lideta",
  "last_24h": {
    "check_in_count": 11,
    "avg_stress": 7.45,
    "avg_stress_index": 9.18,
    "avg_energy": 2.82,
    "avg_sleep": 4.09
  },
  "last_7d": {
    "check_in_count": 72,
    "avg_stress": 6.89,
    "avg_stress_index": 8.42,
    "avg_energy": 3.51,
    "avg_sleep": 4.67
  },
  "emotion_breakdown_24h": {
    "stressed": { "count": 5, "pct": 45.5 },
    "anxious": { "count": 3, "pct": 27.3 }
  },
  "emotion_breakdown_7d": { "...": "..." },
  "trend": {
    "today_avg_stress": 7.5,
    "yesterday_avg_stress": 6.2,
    "delta_pct": 21.0
  }
}
```

`avg_stress_index` matches frontend heatmap weighting (heavy emotions +2).

### Similar-feeling count (post check-in)

```ts
const { data: similarCount } = await supabase.rpc('get_similar_feeling_count', {
  p_area: 'lideta',
  p_emotion: userEmotion,
});
// "You're not alone. {similarCount} people in Lideta felt similarly."
```

### Views (alternative to RPC)

```ts
// Per-area 24h snapshot
const { data } = await supabase.from('area_stats_24h').select('*').eq('area', 'lideta');

// Emotion % for charts
const { data } = await supabase
  .from('emotion_breakdown_24h')
  .select('*')
  .eq('area', 'lideta');
```

### Heatmap color (from aggregates)

```ts
const { data } = await supabase.rpc('get_area_insights', { p_area: 'lideta' });
const avgStress = data?.last_24h?.avg_stress_index ?? data?.last_24h?.avg_stress;
// avgStress > 7 → red, 5–7 → yellow, < 5 → green
```

### Trend alert copy

```ts
const delta = data?.trend?.delta_pct;
if (delta != null && delta > 0) {
  // `Stress in Lideta is up ${delta}% compared to yesterday.`
}
```

### Optional: last 24 hours only (raw rows)

```ts
const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const { data } = await supabase
  .from('check_ins')
  .select('*')
  .eq('area', 'lideta')
  .gte('created_at', since)
  .order('created_at', { ascending: false });
```

## Forecast copy (from aggregates)

Frontend uses `forecastCopy()` in `lib/emotional-data.ts` with `get_area_insights` data:

- avg stress > 7: "Addis is running hot today — stress is elevated across the area."
- avg stress 5–7: "Moderate emotional strain across Addis this afternoon."
- avg stress < 5: "Addis feels relatively calm right now."

## SQL setup order

1. `backend/supabase/schema.sql`
2. `backend/supabase/aggregates.sql`
3. `backend/supabase/abuse-guard.sql`
4. `backend/supabase/seed.sql`

Or paste `backend/supabase/setup.sql` (schema + aggregates + seed + abuse guard combined).

## Troubleshooting

| Error | Fix |
|-------|-----|
| permission denied | Re-run `schema.sql` + `aggregates.sql` (grants + RLS policies) |
| empty map | Re-run `seed.sql` |
| insert fails on emotion | Use one of the 7 allowed emotion strings exactly |
| RPC not found | Run `aggregates.sql` in Supabase SQL Editor |
| missing `area` column | Re-run `schema.sql` (includes upgrade for existing tables) |
| `CHECK_IN_COOLDOWN` on insert | Expected — same browser checked in within the last hour |
| `get_check_in_cooldown` not found | Run `abuse-guard.sql` in Supabase SQL Editor |
