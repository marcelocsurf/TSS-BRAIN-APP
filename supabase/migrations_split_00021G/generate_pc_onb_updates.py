#!/usr/bin/env python3
"""Generate SQL UPDATE statements for the 8 Pre-Course (PC-PRE-XX)
and 6 Onboarding (ONB-XX) items, in student voice.

Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (canonical, Marcelo-approved)
Output: 2 SQL files (pc_pre.sql, onb.sql)
"""

import os

OUT_DIR = os.path.dirname(__file__)


def sql(s: str) -> str:
    return s.replace("'", "''")


def md(item):
    """Compose the description_md from the 4 narrative sections."""
    parts = []
    parts.append(f"## What you'll learn\n\n{item['what_youll_learn']}")
    parts.append(f"## Why it matters\n\n{item['why_it_matters']}")
    bullets = "\n".join(f"- {b}" for b in item["what_to_know"])
    parts.append(f"## What you need to know\n\n{bullets}")
    success = "\n".join(f"- {s}" for s in item["how_you_know"])
    parts.append(f"## How you know you've got it\n\n{success}")
    return "\n\n".join(parts)


def update_sql(item):
    description = md(item)
    return f"""UPDATE lessons SET
  title = '{sql(item["title"])}',
  description_md = '{sql(description)}',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = '{item["id"]}';"""


# ─── 8 PRE-COURSE ITEMS (canon Marcelo-approved) ───
PC_PRE = [
    {
        "id": "PC-PRE-01",
        "title": "Safety Rules",
        "what_youll_learn": "You learn the foundation of every water session: the 3 safety signals, the star-fall protocol, leash discipline, and how to keep your board from hurting other surfers.",
        "why_it_matters": "Surfing without safety knowledge is dangerous to you and dangerous to others. Before any technique, before any wave, you need this. The ocean does not negotiate with surfers who skip safety.",
        "what_to_know": [
            "The 3 safety signals you must recognize and respond to (your coach demonstrates).",
            "The star-fall protocol: arms extended, body flat, face up. Never dive head-first.",
            "Your board is always under your control. Never let it hit another surfer.",
            "Your leash is always attached and in good condition. Check before every session.",
            "Communication is non-negotiable: signal early when in trouble, signal clearly when you have priority.",
        ],
        "how_you_know": [
            "You can recognize and respond to the 3 safety signals correctly.",
            "You execute the star-fall protocol on command.",
            "You explain the leash protocol and why it is non-negotiable.",
        ],
    },
    {
        "id": "PC-PRE-02",
        "title": "Etiquette Rules",
        "what_youll_learn": "You learn how to coexist in the water with respect. Without etiquette there are accidents and fights — both ruin your sessions and others'.",
        "why_it_matters": "Surfing is a community. Without etiquette, you become a hazard or an aggressor. The lineup follows rules. You learn them now or you learn them the hard way.",
        "what_to_know": [
            "Priority rule: the surfer closest to the peak (where the wave breaks first) has priority over the wave.",
            "No drop-in: never take a wave already being surfed by someone else. This is the most serious offense.",
            "No snaking: don't paddle around someone to \"steal\" their priority.",
            "Paddle around the lineup, never through the middle.",
            "Respect the locals. When you arrive somewhere new, observe before paddling to the peak.",
            "Communicate. A look, a word, a gesture. Silence creates confusion.",
        ],
        "how_you_know": [
            "You state the priority rule from memory.",
            "You explain the 5 non-negotiable lineup rules.",
            "You demonstrate proper paddle path around the lineup.",
        ],
    },
    {
        "id": "PC-PRE-03",
        "title": "Wave Parts and Types (Left/Right)",
        "what_youll_learn": "You learn to identify the parts of a wave and the difference between a left, a right, and an A-frame. This is the foundation of every other ocean reading skill.",
        "why_it_matters": "You cannot read what you cannot name. Knowing the parts of a wave lets you communicate with your coach, position yourself correctly, and choose your direction intentionally.",
        "what_to_know": [
            "Peak — the highest point of the wave, where it breaks first.",
            "Shoulder — the unbroken face extending from the peak.",
            "Pocket — the most powerful zone next to the peak.",
            "Lip — the top edge of the wave that throws over.",
            "Wall — the steep face of the wave.",
            "Whitewater (foam) — the broken portion behind the breaking line. White Belt territory.",
            "Trough — the bottom flat zone before the wave reforms.",
            "Wave types: Left (breaks toward your left), Right (breaks toward your right), A-frame (breaks both ways from a single peak).",
        ],
        "how_you_know": [
            "You name and point to all 7 wave parts in a real wave.",
            "You correctly identify a left vs a right from the beach.",
            "You recognize an A-frame.",
        ],
    },
    {
        "id": "PC-PRE-04",
        "title": "Stages of the Wave (1-4)",
        "what_youll_learn": "You learn the 4 stages every wave passes through, from the swell to the shore. Understanding the stages tells you where you should be at each moment.",
        "why_it_matters": "You can't catch a wave if you don't know which stage it's in. White Belt operates primarily in Stage 4 (whitewater). Higher belts progressively access stages 2 and 3.",
        "what_to_know": [
            "Stage 1 — Swell: the wave is still in deep water, traveling toward shore. Not yet breaking. You read it from the lineup.",
            "Stage 2 — Approach: the wave starts feeling the bottom and rises in height. This is when you decide: is this wave for me?",
            "Stage 3 — Break: the wave breaks. The peak collapses, the lip throws over, foam forms. The pop-up window opens here.",
            "Stage 4 — Reform / Whitewater: the broken wave continues toward shore as foam. White Belt rides Stage 4.",
        ],
        "how_you_know": [
            "You name the 4 stages in order without prompting.",
            "You identify which stage a wave is in by visual observation.",
            "You explain which stage corresponds to White Belt training.",
        ],
    },
    {
        "id": "PC-PRE-05",
        "title": "What to Do If You Lose the Board",
        "what_youll_learn": "You learn the emergency board loss protocol. The leash is your first line of defense, but you need a backup plan for when things go wrong.",
        "why_it_matters": "In a real emergency, you do not have time to think. You execute the protocol you trained. This is what trained surfers do automatically.",
        "what_to_know": [
            "The leash is your first defense — never surf without one.",
            "If the board separates from you: do NOT panic. Float in star-fall position.",
            "Track the board visually. If it's downstream from you, swim to it. If upstream, the wave will bring it back — do NOT swim against the current.",
            "If the board is far away or the current is strong, signal for help (arm up, waving). Conserve energy.",
            "Do NOT chase the board if it puts you in danger (rocks, strong rip, shore break).",
            "Never grab someone else's board. Never let your board hit another surfer.",
        ],
        "how_you_know": [
            "You explain the leash protocol clearly.",
            "You state the board recovery sequence in order.",
            "You identify when chasing the board is dangerous and what to do instead.",
        ],
    },
    {
        "id": "PC-PRE-06",
        "title": "If in Doubt, Don't Go Out",
        "what_youll_learn": "You learn how to make an honest go/no-go decision before entering the water. This is the most important decision of every session.",
        "why_it_matters": "Every session begins with a choice. If conditions feel beyond your level, they probably are. The ocean does not negotiate. A bad call about your readiness costs more than missing one session.",
        "what_to_know": [
            "Before every session, check 6 risk factors: wave size, current, crowd, your body, the forecast, your local knowledge.",
            "If 2 or more answers come back negative, the call is no-go.",
            "Wait. Watch. Learn. The next session will be better.",
            "The best surfers are the ones who survived the most no-go calls.",
        ],
        "how_you_know": [
            "You list the 6 risk factors from memory.",
            "You make a go/no-go decision honestly, not based on ego.",
            "You verbalize the doctrine \"if in doubt, don't go out\" before entering.",
        ],
    },
    {
        "id": "PC-PRE-07",
        "title": "Timing to Go Out and Come In",
        "what_youll_learn": "You learn that the ocean has rhythm — sets and lulls — and how to time your entry and exit for safety and efficiency.",
        "why_it_matters": "Bad timing exhausts you, ruins your session, and can put you in danger. Good timing makes you efficient and safe.",
        "what_to_know": [
            "Watch the lineup for at least 5 minutes before paddling out. Identify the set pattern: how many waves per set, how long the lulls last.",
            "Time your paddle out at the start of a lull. You typically have 2-4 minutes before the next set arrives.",
            "If a set catches you mid-paddle, use turtle roll (Block 6) or duck dive (advanced) to pass through.",
            "Same logic for coming in: wait for a lull, paddle to the inside, use the last whitewater of a set as a free ride to the beach.",
            "Never come in while a set is breaking on the inside — the foam can throw you against rocks or the bottom.",
        ],
        "how_you_know": [
            "You observe a lineup for 5 minutes and identify the set pattern.",
            "You time your paddle out at the start of a lull.",
            "You state the rule \"never come in during a set\" and follow it.",
        ],
    },
    {
        "id": "PC-PRE-08",
        "title": "How to Learn to Train — TSS Method",
        "what_youll_learn": "You learn the methodological foundation of TSS. Before you train, you understand HOW TSS teaches and how YOU learn within the system.",
        "why_it_matters": "The TSS vocabulary is the bridge between you and your coach. Without the shared language, instructions don't land. The One Wave principle is what makes you progress fast — quality over quantity.",
        "what_to_know": [
            "TSS vocabulary: Step (STP) is a canonical movement. Drill (DRL) is how you train it. Mission (MIS) is how you apply it. Sequence (SEQ) is a chain of steps. Belt is your level. Value is the central virtue of your belt. Block is a pedagogical group of steps.",
            "The One Wave Framework: mastery does not come from how many waves you took — it comes from how many you extracted as learning.",
            "Quality over quantity. Reflection is part of the ride.",
            "The protocol per wave: (1) Intention before paddling, (2) Execution with focus, (3) Observation of what happened, (4) Adjustment for the next wave, (5) Five canonical post-wave questions.",
            "The 5 questions: What did I want to do? What did I actually do? What worked? What didn't work? What do I adjust for the next?",
            "Doctrinal Principle: Sequences define WHAT is learned. Drills define HOW to train it. Missions define HOW the learning is applied.",
        ],
        "how_you_know": [
            "You define Step, Drill, Mission, Sequence, Belt, Value, Block in your own words.",
            "You execute the One Wave Protocol live in a session — saying the 5 questions before and after waves.",
            "You explain why TSS prioritizes quality over quantity.",
        ],
    },
]


# ─── 6 ONBOARDING ITEMS (existing rows have ID 'ONB-01' through 'ONB-06') ───
ONB = [
    {
        "id": "ONB-01",
        "title": "Goofy or Regular",
        "what_youll_learn": "You learn to identify your natural surfing stance. This is determined by your body, not by choice. It affects everything that comes next: which foot is your back foot for the pop-up, which side is your frontside, how you read waves.",
        "why_it_matters": "A wrong stance ruins every step that follows. You learn this once, on land, before you waste time on the wrong foot.",
        "what_to_know": [
            "Regular stance: left foot forward, right foot back. Your back foot drives.",
            "Goofy stance: right foot forward, left foot back. Your back foot drives.",
            "How to identify: (1) Push test — stand still, get pushed gently from behind. The foot you step forward to catch yourself is your back foot. (2) Skateboard or snowboard test — your natural stance there is the same on the surfboard. (3) Slide test — run on a smooth floor in socks and slide. The leading foot is your front foot.",
            "Once identified, your stance is fixed for life. Train accordingly.",
        ],
        "how_you_know": [
            "You know your stance — Regular or Goofy.",
            "You can articulate which foot goes forward and which goes back.",
        ],
    },
    {
        "id": "ONB-02",
        "title": "What is Surf?",
        "what_youll_learn": "You learn what surfing actually is — beyond the cliché. Surfing is a relationship with the ocean, not just a sport.",
        "why_it_matters": "If you treat surfing as just athletics, you miss the depth. TSS does not train athletes who use the ocean. TSS trains surfers who know they are part of the ocean.",
        "what_to_know": [
            "Surfing is the practice of riding breaking waves using a board, governed by the interaction between three elements: wave, surfer, and ocean.",
            "The fundamental triangle: Wave (the master, irreproducible) + Surfer (the body that adapts) + Ocean (the environment that imposes the rules).",
            "You don't dominate the wave. You read it. You respect it. You respond in real time.",
            "This is dialogue, not conquest.",
        ],
        "how_you_know": [
            "You define surfing in your own words.",
            "You explain the wave/surfer/ocean triangle as a relationship of dialogue, not domination.",
        ],
    },
    {
        "id": "ONB-03",
        "title": "History of Surf",
        "what_youll_learn": "You learn that surfing did not begin in California. It originated in Polynesia centuries ago, has deep cultural roots, and almost disappeared before being revived.",
        "why_it_matters": "You are not surfing a \"modern sport.\" You are participating in an ancestral discipline. Respect the tradition. Know the lineage.",
        "what_to_know": [
            "Polynesia (ancient): He'e nalu — \"wave sliding\" — was practiced for centuries. Surfing was tied to ritual, status, and community.",
            "Hawaii (~1000 CE): surfing became central to Hawaiian culture. Different boards for different classes, different waves for different social ranks.",
            "19th century: surfing nearly disappeared due to colonization and missionary suppression.",
            "Early 20th century: Duke Kahanamoku, Hawaiian Olympic swimmer, brought surfing back to the world. Tom Blake invented the hollow surfboard, fins, and many essential designs.",
            "1950s-1960s: surf culture exploded worldwide. Boards evolved from heavy wood to lighter foam.",
            "Tokyo 2020: surfing officially debuts as an Olympic sport.",
        ],
        "how_you_know": [
            "You state surfing's Polynesian origin.",
            "You name at least one foundational figure (Duke Kahanamoku).",
            "You understand surfing as ancient discipline, not recent invention.",
        ],
    },
    {
        "id": "ONB-04",
        "title": "Four Pillars of Holistic Growth",
        "what_youll_learn": "You learn that TSS does not just train technique. TSS trains 4 dimensions of you, in parallel.",
        "why_it_matters": "Most surf training only develops technique. That makes you fragile. TSS develops you in 4 interconnected pillars so you become a complete surfer, not just a wave-rider.",
        "what_to_know": [
            "Pillar 1 — Physical: body mechanics, conditioning, balance, mobility, endurance, swim/apnea. Without physical capacity, technique cannot be expressed.",
            "Pillar 2 — Mental: focus, fear management, patience, presence, environmental reading. Surfing rewards the cool head.",
            "Pillar 3 — Technical: biomechanics, board control, maneuver execution. The visible part — but only one of four.",
            "Pillar 4 — Social-Ethical: lineup etiquette, respect for locals, communication, surfer ethics. Without this, you are a hazard.",
            "Interdependence: the 4 pillars are not independent. You can't have elite technique with paralyzing fear. You're not a complete surfer until all 4 work together.",
        ],
        "how_you_know": [
            "You name the 4 pillars in order.",
            "You explain what each pillar develops.",
            "You identify your own weakest pillar today — that's where you'll grow most in White Belt.",
        ],
    },
    {
        "id": "ONB-05",
        "title": "Surf Equipment — Parts & Types",
        "what_youll_learn": "You learn the parts of a surfboard, the main types, and which one is yours during White Belt.",
        "why_it_matters": "You can't use a tool you don't know. The wrong board makes everything harder. The right board makes the mechanics learnable.",
        "what_to_know": [
            "The 9 main parts of a board: nose (front tip), tail (back end), rails (side edges — what enters water in turns), deck (top surface where you stand), bottom (underside), rocker (curve from nose to tail), fins (directional control), leash (cord to your foot — never surf without it), stringer (central rigid line for strength).",
            "The 5 main board types: Softboard (foam, soft, safe — your White Belt board), Longboard (9 ft+, stable), Funboard (7-8 ft, transition), Fish (short, wide, fast in small waves), Shortboard (advanced, fast maneuvers).",
            "TSS rule: White Belt = softboard. No exceptions. Hardboard access requires Yellow Belt certification.",
        ],
        "how_you_know": [
            "You name the 9 main parts of the board without checking the manual.",
            "You identify the 5 main board types.",
            "You explain why softboard is the White Belt standard.",
        ],
    },
    {
        "id": "ONB-06",
        "title": "Venue Analysis + Set Goal",
        "what_youll_learn": "You learn the two things that happen on the beach before every session: you read the venue (VCA-6 framework), and you set your session goal.",
        "why_it_matters": "Without venue reading, you enter blind. Without a goal, you drift. TSS rejects \"have fun\" as a session goal because it produces zero measurable progress. Specificity creates growth.",
        "what_to_know": [
            "VCA-6 Framework — evaluate 6 elements before paddling out: (1) Break type — beach break, point break, or reef break. (2) Wave direction — right, left, or A-frame. (3) Entry/exit zones — identified BEFORE entering, not during. (4) Hazards — rocks, currents, surfers, marine life, shallow bottom. (5) Tide/wind — tide changes hourly, offshore wind = quality, onshore = ruined. (6) Level fit — are TODAY's conditions appropriate for MY level?",
            "After venue analysis, set ONE specific goal for the session. Not \"have fun.\" Specific examples: \"Catch 3 clean foam waves and execute the pop-up sequence on each.\" \"Apply the One Wave Protocol on every wave I attempt.\" \"Practice my paddle technique — focus on elbow-over-ear for 20 strokes.\"",
            "No goal, no entry. The surfer who enters without intention drifts. The surfer with intention learns.",
        ],
        "how_you_know": [
            "You execute a verbal venue analysis at any spot using all 6 VCA elements.",
            "You set a specific, achievable session goal that fits your belt level.",
            "You explain why \"have fun\" is not a valid TSS goal.",
        ],
    },
]


def write_file(name, items, header_text):
    out = os.path.join(OUT_DIR, name)
    with open(out, "w") as f:
        f.write(f"-- {header_text}\n")
        f.write("-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (Marcelo, 2026-05-08)\n")
        f.write("-- Idempotent: replaces description_md with student-voice canon\n\n")
        f.write("BEGIN;\n\n")
        for item in items:
            f.write(update_sql(item))
            f.write("\n\n")
        f.write("COMMIT;\n")
    size = os.path.getsize(out)
    print(f"Wrote {out} ({size:,} bytes, {len(items)} items)")


def main():
    write_file(
        "pc_pre.sql",
        PC_PRE,
        "00021G — Pre-Course 8 items in student voice",
    )
    write_file(
        "onb.sql",
        ONB,
        "00021H — WB Onboarding 6 items in student voice",
    )


if __name__ == "__main__":
    main()
