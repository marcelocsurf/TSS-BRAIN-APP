import { PayrollBoard } from './PayrollBoard';

// 💵 Pagos al equipo — semana por semana, persona por persona.
// Regla: sesión sin cierre = pago retenido (el cierre es requisito).

export const dynamic = 'force-dynamic';

export default function PayrollPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>Pagos al equipo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Qué dio cada persona, cuánto se le paga, y quién debe cierres — sin cierre no se emite pago.
        </p>
      </div>
      <PayrollBoard />
    </div>
  );
}
