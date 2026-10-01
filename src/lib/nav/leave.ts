// ═══ Salir a la pantalla de origen sin duplicarla en el historial ═══
// Si la página anterior del navegador ES el origen (llegó por un link desde
// ahí), se vuelve atrás: el atrás del teléfono queda limpio y la página vuelve
// como estaba (su pestaña ya está en la URL). Si no (link de WhatsApp, recarga),
// se reemplaza esta entrada por el origen. `steps` = cuántas entradas propias
// se apilaron encima de la de llegada en este documento (lecciones del Course).
export function leaveTo(href: string, steps = 1): void {
  try {
    const target = new URL(href, window.location.href);
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === window.location.origin && ref.pathname === target.pathname && window.history.length > steps) {
      window.history.go(-steps);
      return;
    }
  } catch { /* cae al reemplazo */ }
  window.location.replace(href);
}
