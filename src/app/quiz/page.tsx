import { redirect } from 'next/navigation';

// #14 — Consolidación de quizzes (2026-07-29) y RELEVO (2026-09-01, decisión
// de Marcelo): el quiz V2 — la película de la sesión, co-brandeado Puro Surf,
// con captura de lead y camino con token — sustituye al v1 como LA puerta
// pública de nivel. El v1 (find-your-level.html) queda en el repo como
// archivo histórico; este redirect es reversible en una línea.
export default function QuizRedirect() {
  redirect('/quiz-v2.html');
}
