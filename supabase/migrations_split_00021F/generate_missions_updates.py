#!/usr/bin/env python3
"""Parse WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md to extract the 25 missions
(MIS-WB-01..25) and generate UPDATE statements for drills_missions table.

Note: canon uses MIS-WB-01 (2 digits) but DB has MIS-WB-001 (3 digits).
We zero-pad on output.

Output: 2 SQL files (a: missions 1-13, b: missions 14-25).
"""

import re
import os

INPUT = "/Users/marcelocastellanos/Desktop/1111/_TSS_WHITE_BELT_OFICIAL_v1/_FINAL_MATERIALS_v1_EN/WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md"
OUT_DIR = os.path.dirname(__file__)


def sql(s: str) -> str:
    return s.replace("'", "''")


def parse_missions(content: str):
    """Extract 25 mission records from the canon markdown."""
    # Find the missions section, then split by '## MIS-WB-' headers
    mission_blocks = re.split(r"\n## MIS-WB-(\d{2}) — ", content)
    # The first chunk is everything before MIS-WB-01; skip it
    missions = []
    # mission_blocks now alternates: prefix, num, body, num, body, ...
    for i in range(1, len(mission_blocks), 2):
        num_str = mission_blocks[i]
        body = mission_blocks[i + 1]
        # Title is the first line of body
        title_end = body.index("\n")
        title = body[:title_end].strip()
        rest = body[title_end + 1 :]

        def extract_field(name):
            m = re.search(rf"\*\*{re.escape(name)}:\*\*\s*(.+)", rest)
            return m.group(1).strip() if m else None

        time = extract_field("Time")
        reps = extract_field("Reps")
        where = extract_field("Where")
        linked_step_match = re.search(r"\*\*Linked Step:\*\*\s*`([^`]+)`", rest)
        linked_step = linked_step_match.group(1) if linked_step_match else None

        # Extract sections
        def extract_section(header):
            pattern = rf"### {re.escape(header)}\s*\n+(.+?)(?=\n###|\n---|\Z)"
            m = re.search(pattern, rest, re.DOTALL)
            return m.group(1).strip() if m else ""

        what_to_do = extract_section("What to do")
        how_you_know = extract_section("How you know you got it")

        missions.append(
            {
                "id_db": f"MIS-WB-{int(num_str):03d}",  # zero-pad to 3 digits
                "step_id": linked_step,
                "title": title,
                "time": time,
                "reps": reps,
                "where": where,
                "what_to_do": what_to_do,
                "how_you_know": how_you_know,
            }
        )

    return missions


def build_description(m):
    parts = []
    parts.append(f"## What to do\n\n{m['what_to_do']}")
    if m["where"]:
        parts.append(f"## Where\n\n{m['where']}")
    return "\n\n".join(parts)


def update_sql(m):
    description = build_description(m)
    # success criteria is the "How you know you got it" sentence(s) as one array element
    criterion = m["how_you_know"]
    return f"""UPDATE drills_missions SET
  title = '{sql(m["title"])}',
  time_estimate = '{sql(m["time"]) if m["time"] else ""}',
  reps_recommended = '{sql(m["reps"]) if m["reps"] else ""}',
  description_md = '{sql(description)}',
  success_criteria = ARRAY['{sql(criterion)}']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = '{m["id_db"]}';"""


def main():
    with open(INPUT) as f:
        content = f.read()

    missions = parse_missions(content)
    assert len(missions) == 25, f"Expected 25 missions, got {len(missions)}"
    for m in missions:
        assert m["title"], f"Missing title for {m['id_db']}"
        assert m["what_to_do"], f"Missing what_to_do for {m['id_db']}"

    # Split: 1-13, 14-25
    parts = [
        ("a", missions[:13], "1/2"),
        ("b", missions[13:], "2/2"),
    ]

    for label, items, part_label in parts:
        out = os.path.join(OUT_DIR, f"part_{label}.sql")
        with open(out, "w") as f:
            f.write(
                f"-- 00021F PART {part_label} — Missions student-voice canon (Marcelo, 2026-05-08)\n"
            )
            f.write("-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (parsed)\n")
            f.write("-- Idempotent: replaces mission descriptions with student-voice canon\n\n")
            f.write("BEGIN;\n\n")
            for m in items:
                f.write(update_sql(m))
                f.write("\n\n")
            f.write("COMMIT;\n")
            if label == "b":
                f.write("\n-- Verification\n")
                f.write(
                    "SELECT id, title, LENGTH(description_md) AS desc_len\n"
                    "FROM drills_missions WHERE type='mission' AND id LIKE 'MIS-WB-%' ORDER BY id;\n"
                )
        size = os.path.getsize(out)
        print(f"Wrote {out} ({size:,} bytes, {len(items)} missions)")


if __name__ == "__main__":
    main()
