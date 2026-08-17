import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, Gauge, TrendingUp, Users, Star, CheckSquare, RefreshCw, ClipboardList } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Índice de Reportes. Coordinador ve los de su academia; platform admin, todas.
// Los reportes de dinero (ingresos, P&L, embudo) quedan fuera de coach/asistente
// vía el gate de rol de abajo + el gate propio de cada página.

const REPORTS: { href: string; title: string; desc: string; Icon: typeof DollarSign; money?: boolean }[] = [
  { href: '/reports/revenue', title: 'Ingresos por venta de asientos', desc: 'Cobrado vs pendiente por semana/mes y por tipo de servicio. Export CSV.', Icon: DollarSign, money: true },
  { href: '/reports/occupancy', title: 'Ocupación vs capacidad', desc: 'Utilización por servicio, plantilla o semana — para planear cupos.', Icon: Gauge },
  { href: '/reports/ratings', title: 'Ratings por coach', desc: 'Satisfacción promedio, distribución de estrellas y comentarios.', Icon: Star },
  { href: '/reports/closures', title: 'Cierres por coach', desc: 'Cumplimiento de cierre de sesiones (candado de pago) con historial.', Icon: CheckSquare },
  { href: '/reports/memberships', title: 'Renovaciones de membresía', desc: 'Renovaciones, pendientes por confirmar y por vencer (30 días).', Icon: RefreshCw },
  { href: '/reports/funnel', title: 'Embudo QR → pagado', desc: 'Conversión de reserva a pago por canal (QR vs mostrador).', Icon: TrendingUp, money: true },
  { href: '/reports/pnl', title: 'P&L por academia', desc: 'Ingresos menos costos (nómina real + costos de camp) por academia.', Icon: Users, money: true },
];

export default async function ReportsIndexPage() {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) {
    redirect('/dashboard');
  }

  // Adherencia de programas (Alto Rendimiento): cruza academias, así que solo
  // aparece para el admin de plataforma — la página también lo gatea.
  const visibleReports = me.is_platform_admin
    ? [
        ...REPORTS,
        {
          href: '/reports/programas',
          title: 'Programas · Adherencia',
          desc: 'Alumnos con programa de entreno: progreso, hábitos (sueño/agua) y alertas de inactividad.',
          Icon: ClipboardList,
        },
      ]
    : REPORTS;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Reportes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {me.is_platform_admin ? 'Consolidado de todas las academias (elegí una con el switcher).' : 'Reportes de tu academia.'}
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {visibleReports.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[var(--tss-cyan)] hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <r.Icon size={18} className="text-[var(--tss-navy)]" />
              <h2 className="text-sm font-semibold text-[var(--tss-navy)] group-hover:text-[var(--tss-cyan)] transition-colors">
                {r.title}
              </h2>
              {r.money && (
                <span className="ml-auto text-[9px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200" style={{ fontFamily: 'var(--font-mono)' }}>
                  $$
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-500 leading-relaxed">{r.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
