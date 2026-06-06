#!/usr/bin/env python3
"""Quick check that Supabase is reachable and check_ins + aggregates work."""

import os
import sys

try:
    from supabase import create_client
except ImportError:
    print("Install: pip install supabase python-dotenv")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = lambda *_: None


def main() -> int:
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    url = (os.environ.get("SUPABASE_URL") or "").strip()
    key = (os.environ.get("SUPABASE_ANON_KEY") or "").strip()
    if not url or not key:
        print("Copy backend/.env.example to backend/.env and fill in credentials.")
        return 1

    if url.startswith("sb_publishable_") or url.startswith("eyJ"):
        print("SUPABASE_URL looks like an API key, not a URL.")
        print("Fix backend/.env:")
        print("  SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co")
        print("  SUPABASE_ANON_KEY=sb_publishable_... (or legacy anon key)")
        return 1

    if not url.startswith("https://") or ".supabase.co" not in url:
        print("SUPABASE_URL must look like: https://abcdefghijklmnop.supabase.co")
        print(f"Got: {url[:60]}...")
        return 1

    client = create_client(url, key)

    result = client.table("check_ins").select("id", count="exact").limit(1).execute()
    count = result.count if result.count is not None else len(result.data or [])
    print(f"OK — check_ins reachable ({count} row(s) in sample query)")

    insert_payload = {
        "emotion": "calm",
        "stress_level": 3,
        "energy_level": 7,
        "sleep_quality": 8,
    }
    try:
        insert = client.table("check_ins").insert({
            **insert_payload,
            "area": "lideta",
        }).execute()
    except Exception as exc:
        err = str(exc)
        if "area" in err and "schema cache" in err:
            print("Schema not migrated — run backend/supabase/schema.sql in Supabase SQL Editor.")
            return 1
        raise

    if not insert.data:
        print("Insert test failed:", insert)
        return 1

    print(f"OK — insert test passed (id={insert.data[0]['id']})")

    try:
        stats = client.table("area_stats_24h").select("*").eq("area", "lideta").execute()
    except Exception:
        print("Aggregates missing — run backend/supabase/aggregates.sql in Supabase SQL Editor.")
        return 1
    if stats.data is None:
        print("area_stats_24h view missing — run backend/supabase/aggregates.sql")
        return 1
    print(f"OK — area_stats_24h view ({len(stats.data)} area row(s))")

    similar = client.rpc(
        "get_similar_feeling_count",
        {"p_area": "lideta", "p_emotion": "stressed"},
    ).execute()
    if similar.data is None:
        print("get_similar_feeling_count RPC missing — run aggregates.sql")
        return 1
    print(f"OK — get_similar_feeling_count → {similar.data}")

    insights = client.rpc("get_area_insights", {"p_area": "lideta"}).execute()
    if not insights.data:
        print("get_area_insights RPC missing or empty — run aggregates.sql + seed.sql")
        return 1

    last_24h = insights.data.get("last_24h") or {}
    trend = insights.data.get("trend") or {}
    print(
        "OK — get_area_insights:",
        f"24h count={last_24h.get('check_in_count')},",
        f"avg_stress={last_24h.get('avg_stress')},",
        f"trend_delta={trend.get('delta_pct')}%",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
