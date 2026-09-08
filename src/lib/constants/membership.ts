// ═══ La herramienta de entrenamiento = UNA membresía, UN plan ═══
// Regla de empaque (Marcelo 2026-09-09): cada curso incluye 1 año (valor $99)
// y después se renueva a $99/año. Un solo plan para que el precio que ve el
// alumno sea siempre el mismo. Seguro para importar desde el cliente.
export const MEMBERSHIP_MONTHS = 12;
export const MEMBERSHIP_PRICE_CENTS = 9900;
export const MEMBERSHIP_PRICE_LABEL = '$99/year';
export const MEMBERSHIP_PLANS = [
  { months: MEMBERSHIP_MONTHS, cents: MEMBERSHIP_PRICE_CENTS, label: '1 year', price: '99' },
] as const;
export const isValidMembershipMonths = (m: number) => MEMBERSHIP_PLANS.some((p) => p.months === m);
