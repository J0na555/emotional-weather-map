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
| `emotion` | text | see allowed values below |
| `stress_level` | int | 1–10 |
| `energy_level` | int | 1–10 |
| `sleep_quality` | int | 1–10 |

**Allowed emotions:** `stressed`, `calm`, `anxious`, `energized`, `lonely`, `burned_out`, `motivated`

## Lideta map constants

All check-ins are for **Lideta** in this MVP. Use one center point and jitter each marker:

```ts
const LIDETA = { lat: 9.0120, lng: 38.7480 };
const jitter = () => (Math.random() - 0.5) * 0.01; // ~±500m

// marker position
{ lat: LIDETA.lat + jitter(), lng: LIDETA.lng + jitter() }
```

## Supabase client calls

### Submit check-in

```ts
const { error } = await supabase.from('check_ins').insert({
  emotion: 'stressed',
  stress_level: 8,
  energy_level: 3,
  sleep_quality: 4,
});
```

### Load all check-ins (heatmap + charts)

```ts
const { data, error } = await supabase
  .from('check_ins')
  .select('*')
  .order('created_at', { ascending: false });
```

### Heatmap color (compute in frontend)

```ts
const stressIndex = (row) => {
  const heavy = ['stressed', 'anxious', 'burned_out', 'lonely'].includes(row.emotion);
  return row.stress_level + (heavy ? 2 : 0);
};

const avgStress = rows.reduce((s, r) => s + stressIndex(r), 0) / rows.length;
// avgStress > 7 → red, 5–7 → yellow, < 5 → green
```

### "People near you feel similarly"

```ts
const similarCount = rows.filter((r) => r.emotion === userEmotion).length;
// "You're not alone. {similarCount} people in Lideta felt similarly."
```

### Optional: last 24 hours only

```ts
const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const { data } = await supabase
  .from('check_ins')
  .select('*')
  .gte('created_at', since)
  .order('created_at', { ascending: false });
```

## AI forecast (not in backend)

Person 3 / frontend: call OpenAI with aggregated stats, or use static copy:

- avg stress > 7: "Lideta is running hot today — stress is elevated across the area."
- avg stress 5–7: "Moderate emotional strain in Lideta this afternoon."
- avg stress < 5: "Lideta feels relatively calm right now."

## Troubleshooting

| Error | Fix |
|-------|-----|
| permission denied | Re-run `backend/supabase/schema.sql` (grants + RLS policies) |
| empty map | Re-run `backend/supabase/seed.sql` |
| insert fails on emotion | Use one of the 7 allowed emotion strings exactly |
