#!/usr/bin/env python3
"""Parse WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md to extract the 25 STP step
descriptions and generate UPDATE statements for the lessons table.

For each STP we extract:
  - Title (from header)
  - Sequence
  - 5 KEY WORDS
  - What you'll learn
  - Why it matters
  - What your body does
  - Common errors to watch for
  - How you know you've got it

The composed description_md keeps these as labelled markdown sections, so the
LessonViewer renders them naturally.

Output: 3 SQL files (a: STP-001..009, b: STP-010..017, c: STP-018..025).
"""

import re
import os

INPUT = "/Users/marcelocastellanos/Desktop/1111/_TSS_WHITE_BELT_OFICIAL_v1/_FINAL_MATERIALS_v1_EN/WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md"
OUT_DIR = os.path.dirname(__file__)


def sql(s: str) -> str:
    return s.replace("'", "''")


def parse_stps(content: str):
    """Extract STP records from the canon markdown."""
    # STP headers look like: '### STP-001 — Venue Analysis'
    blocks = re.split(r"\n### STP-(\d{3}) — ", content)
    stps = []
    for i in range(1, len(blocks), 2):
        num_str = blocks[i]
        body = blocks[i + 1]
        # Title is first line
        title = body.split("\n", 1)[0].strip()
        rest = body.split("\n", 1)[1]

        # Sequence
        seq_m = re.search(r"\*\*Sequence:\*\*\s*(.+)", rest)
        sequence = seq_m.group(1).strip() if seq_m else None

        # 5 KEY WORDS (between backticks)
        kw_m = re.search(r"\*\*5 KEY WORDS:\*\*\s*`([^`]+)`", rest)
        five_kw = kw_m.group(1).strip() if kw_m else None

        def section(header):
            pat = rf"#### {re.escape(header)}\s*\n+(.+?)(?=\n#### |\n---|\Z)"
            m = re.search(pat, rest, re.DOTALL)
            return m.group(1).strip() if m else ""

        what_youll_learn = section("What you'll learn")
        why_it_matters = section("Why it matters")
        what_body_does = section("What your body does")
        common_errors = section("Common errors to watch for")
        how_you_know = section("How you know you've got it")

        stps.append(
            {
                "id": f"STP-{num_str}",
                "title": title,
                "sequence": sequence,
                "five_kw": five_kw,
                "what_youll_learn": what_youll_learn,
                "why_it_matters": why_it_matters,
                "what_body_does": what_body_does,
                "common_errors": common_errors,
                "how_you_know": how_you_know,
            }
        )
    return stps


def build_description(s):
    parts = []
    parts.append(f"## What you'll learn\n\n{s['what_youll_learn']}")
    parts.append(f"## Why it matters\n\n{s['why_it_matters']}")
    if s["five_kw"]:
        parts.append(f"## 5 Key Words\n\n`{s['five_kw']}`")
    parts.append(f"## What your body does\n\n{s['what_body_does']}")
    parts.append(f"## How you know you've got it\n\n{s['how_you_know']}")
    return "\n\n".join(parts)


def update_sql(s):
    description = build_description(s)
    errors = s["common_errors"]
    return f"""UPDATE lessons SET
  title = '{sql(s["title"])}',
  description_md = '{sql(description)}',
  errors_md = '{sql(errors)}',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = '{s["id"]}';"""


def main():
    with open(INPUT) as f:
        content = f.read()

    stps = parse_stps(content)
    assert len(stps) == 25, f"Expected 25 STPs, got {len(stps)}"
    for s in stps:
        assert s["title"], f"Missing title for {s['id']}"
        assert s["what_youll_learn"], f"Missing what_youll_learn for {s['id']}"

    parts = [
        ("a", stps[:9], "1/3"),
        ("b", stps[9:17], "2/3"),
        ("c", stps[17:], "3/3"),
    ]

    for label, items, part_label in parts:
        out = os.path.join(OUT_DIR, f"part_{label}.sql")
        with open(out, "w") as f:
            f.write(
                f"-- 00021C PART {part_label} — STP descriptions student-voice (Marcelo, 2026-05-08)\n"
            )
            f.write("-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (parsed)\n")
            f.write("-- Idempotent: replaces description_md and errors_md for the 25 STPs\n\n")
            f.write("BEGIN;\n\n")
            for s in items:
                f.write(update_sql(s))
                f.write("\n\n")
            f.write("COMMIT;\n")
            if label == "c":
                f.write(
                    "\n-- Verification\n"
                    "SELECT id, title, LENGTH(description_md) AS desc_len, LENGTH(errors_md) AS errors_len\n"
                    "FROM lessons WHERE id LIKE 'STP-%' AND active=TRUE ORDER BY id;\n"
                )
        size = os.path.getsize(out)
        print(f"Wrote {out} ({size:,} bytes, {len(items)} STPs)")


if __name__ == "__main__":
    main()
