import { redirect } from 'next/navigation';

// #14 — Consolidación de quizzes (decisión 2026-07-29): la ÚNICA puerta
// pública de nivel es el quiz co-brandeado original (find-your-level.html).
// El motor React (surf-level.ts) sigue vivo dentro del intake, donde
// corresponde. Este redirect es reversible en una línea si algún día se
// necesita la versión por-academia (?a=slug) como página propia.
export default function QuizRedirect() {
  redirect('/find-your-level.html');
}
