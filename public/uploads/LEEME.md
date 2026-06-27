# 📁 Imágenes del app — subí tus archivos acá

Esta es la carpeta oficial para subir imágenes que querés usar en la app
(íconos, marcos, dibujos para botones, fotos, etc.).

## Dónde va cada cosa
- `iconos/` — íconos sueltos
- `botones/` — imágenes/dibujos para botones
- `marcos/` — marcos, bordes, decoraciones
- `fotos/` — fotos
- `otros/` — cualquier otra imagen

## Cómo se usan
1. Arrastrá la imagen a la subcarpeta que corresponda.
2. Una vez subida (y publicada), queda disponible en:
   `https://app.thesurfsequence.com/uploads/<carpeta>/<archivo>`
   Ejemplo: una imagen en `iconos/ola.png` → `/uploads/iconos/ola.png`
3. Avisale a Claude: "usá `ola.png` como ícono de tal botón/pantalla" y la
   conecta en el código + la publica (commit + push a Vercel).

## Notas
- Nombres simples, sin espacios ni acentos (ej. `ola-azul.png`, no `Ola Azul.png`).
- Formatos: `.png`, `.jpg`, `.svg`, `.webp`.
- Las imágenes solo se ven en la app live **después** de que Claude haga el
  push (las que están solo en tu Mac todavía no están publicadas).
