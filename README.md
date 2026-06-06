# Emotional Weather Map

Hackathon MVP — anonymous emotional check-ins for **Lideta**, visualized as a live heatmap.

## Backend (Supabase)

Database lives in Supabase. SQL files are in `backend/supabase/`.

### First-time setup (Supabase Dashboard)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**
3. Paste and run `backend/supabase/schema.sql`
4. Paste and run `backend/supabase/aggregates.sql`
5. Paste and run `backend/supabase/seed.sql`

   Or run `backend/supabase/setup.sql` once (all three combined).
6. Copy **Project URL** + **anon key** from **Settings → API**

### Verify locally (optional)

```bash
cd backend
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_ANON_KEY
pip install supabase python-dotenv
python scripts/verify.py
```

### Frontend integration

See `backend/HANDOFF.md` for table shape, Supabase queries, and Lideta map constants.

## Repo layout

```
backend/
  supabase/
    schema.sql      # table + area column + RLS + grants
    aggregates.sql  # views + RPC for area insights
    seed.sql        # demo data (~75 rows, stress-skewed)
    setup.sql       # schema + aggregates + seed (one paste)
  HANDOFF.md        # frontend contract
  scripts/
    verify.py       # connection + aggregate smoke test
```
