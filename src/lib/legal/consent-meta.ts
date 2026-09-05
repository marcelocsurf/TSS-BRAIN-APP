import 'server-only';
import { headers } from 'next/headers';

// Evidencia de una aceptación (waiver, términos, consentimientos): IP y
// navegador de quien la dio. Se guarda junto a la fecha y la versión.
export async function consentMeta(): Promise<{ consent_ip: string | null; consent_user_agent: string | null }> {
  try {
    const h = await headers();
    const fwd = h.get('x-forwarded-for') || h.get('x-real-ip') || '';
    const ip = fwd.split(',')[0]?.trim() || null;
    const ua = (h.get('user-agent') || '').slice(0, 300) || null;
    return { consent_ip: ip, consent_user_agent: ua };
  } catch {
    return { consent_ip: null, consent_user_agent: null };
  }
}
