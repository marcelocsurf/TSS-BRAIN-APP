// ═══ TEXTOS DEL QUIZ V2 (espejo de const QS en public/quiz-v2.html) ═══
// Solo para MOSTRAR las respuestas del alumno en la ficha (dashboard/coach).
// El puntaje lo calcula surf-level-v2.ts; si cambian las escenas del HTML,
// regenerar este archivo con el mismo extractor.
export const V2_SCENES: { track: string; phase: string; scene: string; prompt: string; options: { t: string; s: number }[] }[] = [
  {
    "track": "THE OCEAN",
    "phase": "Reading the day",
    "scene": "You arrive at the beach, board under your arm. You stop and look at the water for a moment.",
    "prompt": "What do you actually see?",
    "options": [
      {
        "t": "Water and waves — I couldn't tell you much more",
        "s": 0
      },
      {
        "t": "I can tell if it looks fun or too big for me, more feeling than reading",
        "s": 3
      },
      {
        "t": "Where it's breaking and which direction the waves peel — I pick my spot to paddle out",
        "s": 7
      },
      {
        "t": "Banks, currents, sets and tide — I know where to sit and what the session will offer before getting wet",
        "s": 10
      }
    ]
  },
  {
    "track": "THE OCEAN",
    "phase": "Getting out",
    "scene": "You paddle out. A line of broken whitewater comes straight at you.",
    "prompt": "What happens — with YOUR board?",
    "options": [
      {
        "t": "It usually drags me back — sometimes I lose the board",
        "s": 0
      },
      {
        "t": "I get through small ones, but bigger ones push me back or rip the board from me",
        "s": 3
      },
      {
        "t": "I keep my board with me and get through — duck dive, turtle roll or punching through, whatever my board needs",
        "s": 7
      },
      {
        "t": "I read the sets and time my paddle-out so I barely get caught — and when I do, I pass clean",
        "s": 10
      }
    ]
  },
  {
    "track": "THE OCEAN",
    "phase": "The lineup",
    "scene": "You reach the lineup. There are other surfers around, and a wave comes that two of you could go for.",
    "prompt": "How do you handle it?",
    "options": [
      {
        "t": "I don't really know the rules yet — I try to stay out of the way",
        "s": 0
      },
      {
        "t": "I know dropping in is wrong, but I'm not always sure who has priority",
        "s": 3
      },
      {
        "t": "I know who has priority, I respect the rotation, and I position without blocking anyone",
        "s": 7
      },
      {
        "t": "I read the lineup and the locals, communicate, and earn my waves wherever I paddle out",
        "s": 10
      }
    ]
  },
  {
    "track": "THE OCEAN",
    "phase": "Choosing your wave",
    "scene": "Sets are coming through. Some waves are better than others.",
    "prompt": "How do you pick and position?",
    "options": [
      {
        "t": "I take whatever comes to me — mostly whitewater or waves someone points me to",
        "s": 0
      },
      {
        "t": "I can tell a good wave, but I'm usually out of position or too late for it",
        "s": 3
      },
      {
        "t": "I choose my wave, move to the spot, and catch green waves by myself regularly",
        "s": 7
      },
      {
        "t": "I anticipate where the peak will be, paddle early, and get the best waves of the session",
        "s": 10
      }
    ]
  },
  {
    "track": "THE OCEAN",
    "phase": "On your own",
    "scene": "You lose your board mid-session. You're past where you can stand, a current is moving you down the beach, and you're tired.",
    "prompt": "What's your honest plan?",
    "options": [
      {
        "t": "I'd be in real trouble — I count on someone being close",
        "s": 0
      },
      {
        "t": "In small, familiar conditions I manage — with someone keeping an eye on me",
        "s": 3
      },
      {
        "t": "I stay calm, read the current, and swim myself back in at spots I know",
        "s": 7
      },
      {
        "t": "I self-rescue comfortably even when it's solid — I plan for it before I paddle out",
        "s": 10
      }
    ]
  },
  {
    "track": "THE WAVE",
    "phase": "The take-off",
    "scene": "Your wave arrives. You turn and paddle to catch it.",
    "prompt": "When you go to catch a wave — what typically happens?",
    "options": [
      {
        "t": "It passes under me — or I catch it but can't get to my feet in time",
        "s": 0
      },
      {
        "t": "On whitewater I'm up; on green waves it works sometimes, fails often",
        "s": 3
      },
      {
        "t": "I catch green waves regularly and get to my feet in one clean motion",
        "s": 7
      },
      {
        "t": "I take off early, in the pocket, steep or fat — the take-off is automatic",
        "s": 10
      }
    ]
  },
  {
    "track": "THE WAVE",
    "phase": "Connection with your board",
    "scene": "You're up and riding.",
    "prompt": "How does your board respond to you?",
    "options": [
      {
        "t": "I'm trying to keep my balance, but out of control — the board goes where it wants",
        "s": 0
      },
      {
        "t": "I can angle and turn left and right — but the board still doesn't respond the way I want",
        "s": 3
      },
      {
        "t": "The board answers: I turn where I decide, both directions, and it feels connected",
        "s": 7
      },
      {
        "t": "The board is an extension of my body — precise even in critical sections",
        "s": 10
      }
    ]
  },
  {
    "track": "THE WAVE",
    "phase": "Speed",
    "scene": "The section ahead slows down and the wave goes flat — no speed there.",
    "prompt": "What happens to your speed?",
    "options": [
      {
        "t": "The ride is over — I can't keep speed",
        "s": 0
      },
      {
        "t": "I try to generate speed, but something isn't working yet",
        "s": 3
      },
      {
        "t": "I generate speed and stay in the pocket — speed from the wave and from my body",
        "s": 7
      },
      {
        "t": "I read the wave and anticipate — generating speed before the section ever slows me",
        "s": 10
      }
    ]
  },
  {
    "track": "THE WAVE",
    "phase": "Drawing your lines",
    "scene": "A long wall opens up in front of you — all yours.",
    "prompt": "What do you draw on it?",
    "options": [
      {
        "t": "A straight line to the beach",
        "s": 0
      },
      {
        "t": "One angle across the face — a single line",
        "s": 3
      },
      {
        "t": "Up and down the face, linking sections — I draw real lines",
        "s": 7
      },
      {
        "t": "Whatever I want: radical or stylish, my lines, my way — that's my expression",
        "s": 10
      }
    ]
  },
  {
    "track": "THE WAVE",
    "phase": "Conditions",
    "scene": "The forecast changes all week: small and clean, then bigger, then windy and shifty.",
    "prompt": "Which days are YOUR days?",
    "options": [
      {
        "t": "Only small, gentle days — and with someone guiding me",
        "s": 0
      },
      {
        "t": "Clean, manageable days at spots I know — when the ocean cooperates, I'm fine",
        "s": 3
      },
      {
        "t": "A real range of sizes and conditions — I adapt what I do to the day",
        "s": 7
      },
      {
        "t": "Almost any day — and I know exactly when NOT to paddle out. That's part of the level",
        "s": 10
      }
    ]
  }
];

export const V2_BOARD_LABEL: Record<string, string> = { longboard: 'Longboard', mid: 'Mid-length', short: 'Shortboard', varias: 'A bit of everything' };
export const V2_NEEDS: string[] = ['everything, from zero', 'catching waves — on your own, more of them, better positioned', 'the riding — control, speed, drawing your lines on the face', 'the edge — performance with a system behind it'];
