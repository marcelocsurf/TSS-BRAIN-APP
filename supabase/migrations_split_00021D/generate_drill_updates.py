#!/usr/bin/env python3
"""Generate SQL UPDATE statements for the 25 White Belt drills,
using the canonical student-voice .json from Marcelo.

Output: 2 SQL files (part_a 1-13, part_b 14-25) safe to paste in Supabase.
"""

import json
import os

INPUT = "/Users/marcelocastellanos/Desktop/1111/_TSS_WHITE_BELT_OFICIAL_v1/_FINAL_MATERIALS_v1_EN/WB_DRILLS_STUDENT_VOICE_v1_EN.json"
OUT_DIR = os.path.dirname(__file__)


def sql_escape(s: str) -> str:
    """Escape single quotes for SQL string literals."""
    return s.replace("'", "''")


def array_literal(items):
    """Build a Postgres TEXT[] literal from a list of strings."""
    if not items:
        return "ARRAY[]::TEXT[]"
    escaped = [f"'{sql_escape(x)}'" for x in items]
    return "ARRAY[" + ",\n    ".join(escaped) + "]::TEXT[]"


def build_description_md(d):
    """Compose markdown description with the 3 narrative sections."""
    parts = []
    parts.append("## What you'll train\n\n" + d["what_youll_train"])
    parts.append("## What you need before\n\n" + d["what_you_need"])
    steps_md = "\n\n".join(f"- {s}" for s in d["how_to_execute"])
    parts.append("## How to execute it\n\n" + steps_md)
    return "\n\n".join(parts)


def build_update(d):
    description = build_description_md(d)
    criteria = array_literal(d["how_you_know"])
    return f"""UPDATE drills_missions SET
  title = '{sql_escape(d["title"])}',
  time_estimate = '{sql_escape(d["time"])}',
  reps_recommended = '{sql_escape(d["reps"])}',
  description_md = '{sql_escape(description)}',
  success_criteria = {criteria},
  type = 'drill',
  active = TRUE
WHERE id = '{d["id"]}';"""


def main():
    with open(INPUT) as f:
        drills = json.load(f)

    assert len(drills) == 25, f"Expected 25 drills, got {len(drills)}"

    # Split: 1-9 (a), 10-17 (b), 18-25 (c) — keeps each part under ~12 KB
    parts = [
        ("a", drills[:9], "1/3"),
        ("b", drills[9:17], "2/3"),
        ("c", drills[17:], "3/3"),
    ]

    header = """-- 00021D PART {part_label} — Drills student-voice canon (Marcelo, 2026-05-08)
-- Source: WB_DRILLS_STUDENT_VOICE_v1_EN.json
-- Idempotent: replaces existing drill content with student-voice canon

BEGIN;
"""

    for label, items, part_label in parts:
        out_file = os.path.join(OUT_DIR, f"part_{label}.sql")
        with open(out_file, "w") as f:
            f.write(header.format(part_label=part_label))
            f.write("\n")
            for d in items:
                f.write(build_update(d))
                f.write("\n\n")
            f.write("COMMIT;\n")
            if label == "c":
                f.write("\n-- Verification — run after all 3 parts\n")
                f.write("SELECT id, title, LENGTH(description_md) AS desc_len, ARRAY_LENGTH(success_criteria, 1) AS criteria_count\n")
                f.write("FROM drills_missions WHERE type='drill' AND id LIKE 'DRL-WB-%' ORDER BY id;\n")
        size = os.path.getsize(out_file)
        print(f"Wrote {out_file} ({size:,} bytes, {len(items)} drills)")


if __name__ == "__main__":
    main()
