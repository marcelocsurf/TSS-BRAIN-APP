# RECUPERACIÓN — TSS BRAIN
Qué existe, dónde está y cómo se levanta de nuevo si algo se rompe. Una página. Actualizada 2026-09-05.

## 1. Las piezas

| Pieza | Dónde vive | Cuenta | Si desaparece |
|---|---|---|---|
| Código | GitHub `marcelocsurf/TSS-BRAIN-APP` (privado) + copia en la Mac de Marcelo | GitHub de Marcelo | Se recupera de la otra copia |
| App en vivo | Vercel, proyecto `tss-brain-app` (dominios app.thesurfsequence.com y thesurfsequence.com) | Vercel de Marcelo | Se vuelve a desplegar desde GitHub en ~1 h (paso 4) |
| Base de datos + archivos + login | Supabase, proyecto `TSS BRAIN APP` ref `cssewjefhnamconoyuso`, región us-east-1, Postgres 17 | Supabase de Marcelo | **Solo se recupera desde un backup** (paso 3) |
| Correos | Resend (dominio thesurfsequence.com) | Resend de Marcelo | Crear API key nueva y ponerla en Vercel |
| Pagos del libro | Wompi (webhook `/api/book-purchase?k=…`) | Wompi de Enkrateia | Volver a registrar el webhook |
| Backups | GitHub Actions → artifacts del workflow "Backup semanal", 90 días | GitHub | — |

## 2. Secretos (nunca en el código)
Están en Vercel → Settings → Environment Variables y en `.env.local` de la Mac. Guardar copia en el gestor de contraseñas:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, `STUDENT_SESSION_SECRET`, `BOOK_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`.
Las de Supabase se regeneran en Supabase → Settings → API. La de Resend en Resend → API Keys. `CRON_SECRET`, `STUDENT_SESSION_SECRET` y `BOOK_WEBHOOK_SECRET` son cadenas largas al azar: si se pierden se inventan nuevas (los alumnos con sesión por PIN tendrán que volver a entrar; el webhook de Wompi hay que actualizarlo).

## 3. Restaurar la base desde un backup
1. GitHub → Actions → "Backup semanal" → el run más reciente → descargar el artifact `tss-backup-…`.
2. Si está cifrado (`.enc`): `openssl enc -d -aes-256-cbc -pbkdf2 -in tss-backup-FECHA.tar.gz.enc -out tss-backup-FECHA.tar.gz` (pide la passphrase `BACKUP_PASSPHRASE`).
3. `tar -xzf tss-backup-FECHA.tar.gz`. Adentro: `db/*.json` (una por tabla), `db/_schema.json`, `storage/<bucket>/…`, `MANIFEST.json`, y `pg_dump.sql.gz` si el secreto `SUPABASE_DB_URL` estaba configurado.
4. **Con pg_dump** (camino completo): crear proyecto nuevo en Supabase → `gunzip -c pg_dump.sql.gz | psql "<connection string del proyecto nuevo>"`.
5. **Sin pg_dump** (solo JSON): crear proyecto nuevo → aplicar las migraciones del repo en orden (`supabase/migrations/*.sql`, o Supabase → SQL Editor) → insertar cada `db/<tabla>.json` con un script (`scripts/restore-json.mjs`, a escribir el día que haga falta: es un `insert` por tabla en orden de dependencias).
6. Subir `storage/<bucket>/…` a los buckets del mismo nombre (Supabase → Storage → Upload, o con el service key).
7. Usuarios de login (coaches): viven en `auth.users`, que el pg_dump incluye y el JSON no. Sin pg_dump, cada coach usa "Forgot password" para volver a entrar.
8. Cambiar los secretos de Supabase en Vercel por los del proyecto nuevo y redesplegar.

## 4. Volver a desplegar el app desde cero
1. Vercel → Add New Project → importar `marcelocsurf/TSS-BRAIN-APP` (framework Next.js, sin configuración extra).
2. Pegar todas las variables de la sección 2.
3. Dominios: agregar `app.thesurfsequence.com`, `thesurfsequence.com` y `www` (los DNS apuntan a Vercel; el sitio de marketing lo sirve el middleware por host).
4. Los crons (`vercel.json`) se registran solos.

## 5. Chequeos de salud rápidos
- `https://app.thesurfsequence.com/login` responde 200.
- `https://thesurfsequence.com` muestra la landing.
- Supabase → Project → estado `ACTIVE_HEALTHY`.
- GitHub → Actions → el último "Backup semanal" en verde y con `MANIFEST.json` mostrando ~120 tablas y filas > 0.

## 6. Contactos y cuentas críticas
Todo está bajo el Gmail de Marcelo. Activar verificación en dos pasos en Google, GitHub, Vercel y Supabase, y un correo de recuperación distinto. Si esa cuenta se pierde, se pierde el acceso a todo lo de arriba, aunque los datos sigan existiendo.
