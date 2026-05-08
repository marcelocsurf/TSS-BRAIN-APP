#!/usr/bin/env python3
"""Replace lesson_quizzes with content-focused student quizzes from canon.

Source: WB_QUIZZES_STUDENT_v1_EN.json (39 quizzes, 133 questions total)
Target: lesson_quizzes table

Notes:
- Canon uses OB-WB-XX for Onboarding; DB uses ONB-XX → mapping applied.
- Canon options are simple strings + correct index. DB schema is JSONB
  array of {text, correct: bool}. Transformed accordingly.
- DELETE existing quizzes for the 39 lesson IDs before INSERT, so there
  is no duplication or stale content.

Output: 3 SQL files (a, b, c) safe to paste in Supabase SQL Editor.
"""

import json
import os

INPUT = "/Users/marcelocastellanos/Desktop/1111/_TSS_WHITE_BELT_OFICIAL_v1/_FINAL_MATERIALS_v1_EN/WB_QUIZZES_STUDENT_v1_EN.json"
OUT_DIR = os.path.dirname(__file__)


def sql(s: str) -> str:
    return s.replace("'", "''")


def map_item_id(canon_id: str) -> str:
    """Map canon ID to DB lesson ID."""
    if canon_id.startswith("OB-WB-"):
        # OB-WB-01 → ONB-01
        num = canon_id.split("-")[-1]
        return f"ONB-{num}"
    return canon_id  # PC-PRE-XX and STP-XXX unchanged


def options_jsonb(options: list, correct_idx: int) -> str:
    """Transform [str] + correct idx → JSONB literal of [{text, correct}]."""
    items = []
    for i, opt in enumerate(options):
        items.append(f'{{"text": "{sql(opt).replace(chr(34), chr(92) + chr(34))}", "correct": {"true" if i == correct_idx else "false"}}}')
    return "[" + ", ".join(items) + "]"


def build_inserts(quizzes):
    """Return SQL for DELETE + INSERTs for the given quizzes."""
    db_ids = [map_item_id(q["item_id"]) for q in quizzes]
    delete_sql = (
        "DELETE FROM lesson_quizzes WHERE lesson_id IN ("
        + ", ".join(f"'{i}'" for i in db_ids)
        + ");\n\n"
    )

    inserts = []
    for q in quizzes:
        lesson_id = map_item_id(q["item_id"])
        for idx, question in enumerate(q["questions"]):
            options_json = options_jsonb(question["options"], question["correct"])
            inserts.append(
                f"INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (\n"
                f"  gen_random_uuid(),\n"
                f"  '{lesson_id}',\n"
                f"  '{sql(question['q'])}',\n"
                f"  '{options_json}'::jsonb,\n"
                f"  {idx + 1}\n"
                f");"
            )
    return delete_sql + "\n".join(inserts)


def main():
    with open(INPUT) as f:
        quizzes = json.load(f)

    assert len(quizzes) == 39, f"Expected 39 quizzes, got {len(quizzes)}"
    total_q = sum(len(q["questions"]) for q in quizzes)
    print(f"Loaded {len(quizzes)} quizzes, {total_q} questions total")

    # Split into 5 smaller chunks (~10 KB each) — safer paste
    parts = [
        ("a", quizzes[:8], "1/5 — Pre-Course (PC-PRE-01..08)"),
        ("b", quizzes[8:14], "2/5 — Onboarding (ONB-01..06)"),
        ("c", quizzes[14:23], "3/5 — STP-001..009 (Sequence #1)"),
        ("d", quizzes[23:31], "4/5 — STP-010..017 (Sequence #2 + #3 start)"),
        ("e", quizzes[31:], "5/5 — STP-018..025 (Sequence #3 end + #4 + #5)"),
    ]

    for label, items, desc in parts:
        out = os.path.join(OUT_DIR, f"part_{label}.sql")
        with open(out, "w") as f:
            f.write(f"-- 00023 PART {desc}\n")
            f.write("-- Source: WB_QUIZZES_STUDENT_v1_EN.json (Marcelo, 2026-05-08)\n")
            f.write("-- Replaces existing lesson_quizzes for these items with content-focused quizzes.\n\n")
            f.write("BEGIN;\n\n")
            f.write(build_inserts(items))
            f.write("\n\nCOMMIT;\n")
            if label == "e":
                f.write(
                    "\n-- Verification: total quizzes should be 133 across 39 lessons\n"
                    "SELECT lesson_id, COUNT(*) AS qcount\n"
                    "FROM lesson_quizzes\n"
                    "WHERE lesson_id LIKE 'PC-PRE-%' OR lesson_id LIKE 'ONB-%' OR lesson_id LIKE 'STP-%'\n"
                    "GROUP BY lesson_id\n"
                    "ORDER BY lesson_id;\n"
                )
        size = os.path.getsize(out)
        n_q = sum(len(q["questions"]) for q in items)
        print(f"Wrote {out} ({size:,} bytes, {len(items)} lessons, {n_q} questions)")


if __name__ == "__main__":
    main()
