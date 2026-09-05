import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // ═══ Dominio raíz (thesurfsequence.com / www) — conectado a este mismo
  // proyecto de Vercel (2026-09-01). La RAÍZ sirve la página web de
  // marketing (public/web/index.html — "The Method", recreada del handoff
  // de diseño). El resto de las rutas pasan igual (p.ej. /quiz funciona
  // también en este host). app.thesurfsequence.com no entra acá.
  const host = request.headers.get('host') ?? '';
  if (
    (host === 'thesurfsequence.com' || host === 'www.thesurfsequence.com') &&
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.rewrite(new URL('/web/index.html', request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Public routes — accessible without a Supabase auth session.
  // Student portal authenticates via portal_token in the URL.
  // /activate + /lead onboard new students.
  // / is the universal entry (server component redirects authenticated
  // coaches to /dashboard; everyone else sees the entry form).
  // /manifest.webmanifest is served by next/app for PWA.
  const pathname = request.nextUrl.pathname;
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/intake') ||
    pathname.startsWith('/activate') ||
    pathname.startsWith('/lead') ||
    pathname.startsWith('/coach-portal') ||  // token-gated coach portal
    pathname.startsWith('/manager-portal') || // token-gated read-only manager view
    pathname.startsWith('/front-desk') ||     // token-gated reception check-in screen
    pathname.startsWith('/join') ||           // public class signup (QR)
    pathname.startsWith('/booking') ||        // public manage-booking (email link, 24h policy)
    pathname.startsWith('/venue-scout') ||    // standalone analysis tool (no data server-side)
    pathname.startsWith('/manual') ||          // in-app operations manual (static, per-role)
    pathname.startsWith('/venue-check') ||    // standalone simple venue tool
    pathname.startsWith('/feedback') ||       // token-gated standalone survey
    pathname.startsWith('/experience') ||     // token-gated camp experience survey
    pathname.startsWith('/equipo') ||         // token-gated specialist team portal
    pathname.startsWith('/respond') ||        // token-gated staff accept/reject
    pathname.startsWith('/quiz') ||           // public surf-level lead magnet
    pathname.startsWith('/web') ||            // marketing website (thesurfsequence.com)
    pathname.startsWith('/gift') ||           // link de regalo del libro ONE WAVE (código de un solo uso)
    pathname.startsWith('/legal') ||          // política de privacidad + términos (públicos)
    pathname === '/api/quiz-lead' ||          // public quiz lead intake (external site)
    pathname === '/find-your-level.html' ||   // public co-branded quiz (static)
    pathname === '/ratio-engine.html' ||      // Safety Canon ratio tool (static)
    pathname === '/forgot-password' ||        // password recovery (unauthenticated)
    pathname === '/my-portal' ||              // public "email me my portal link" for students
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js';

  if (isPublic) {
    return supabaseResponse;
  }

  if (pathname === '/login' || pathname === '/set-password') {
    if (user && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return supabaseResponse;
  }

  if (!user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Exclude Next internals, the API, and static asset files in /public
    // (images, fonts, etc.) — otherwise unauthenticated requests for
    // /tss-logo-white.png?v=2 get redirected to / and render as broken images.
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf|mp4|webmanifest)$).*)',
  ],
};
