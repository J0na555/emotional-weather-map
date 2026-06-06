# Emotional Weather Map

Hackathon MVP — anonymous emotional check-ins for **Lideta**, visualized as a live heatmap.

## Quick start

### 1. Supabase (backend)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**
3. Paste and run `backend/supabase/setup.sql` (schema + aggregates + seed)
4. Copy **Project URL** + **anon key** from **Settings → API**

Verify:

```bash
cd backend
cp .env.example .env   # fill in credentials
pip install supabase python-dotenv
python scripts/verify.py
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # same URL + anon key as backend/.env
pnpm install   # or npm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Integrated pages:**
- `/check-in` — submits to `check_ins`, shows similar-feeling count
- `/map` — live scores from `get_area_insights` (Bole, Kazanchis, Lideta)
- `/intelligence` — forecast + trend from aggregate RPCs

Without `.env.local`, the UI falls back to demo data.

## Repo layout

```
backend/
  supabase/
    schema.sql      # table + area column + RLS
    aggregates.sql  # views + RPC for area insights
    seed.sql        # ~75 stress-skewed demo rows
    setup.sql       # all three combined
  HANDOFF.md        # API contract for frontend
  scripts/verify.py

frontend/
  lib/
    supabase.ts         # browser client
    emotional-data.ts   # types, RPC helpers, emotion/area mapping
  components/
    check-in/           # wired to Supabase insert + similar count
    map/                # wired to get_area_insights
    intelligence/       # live forecast dashboard
```

See `backend/HANDOFF.md` for RPC return shapes and query examples.
