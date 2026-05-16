# 🏄 TSS ECOSYSTEM OS — HANDOFF MAESTRO

> **Propósito**: Documento único para retomar el proyecto TSS Ecosystem en cualquier conversación futura con Claude. Pegá este archivo como primer mensaje y Claude tendrá todo el contexto estratégico y operativo.

**Versión**: v1.0
**Última actualización**: 2026-04-17
**Owner**: Marcelo Castellanos (marcelocsurf@gmail.com)
**Entidad IP**: Enkrateia SA de CV

---

## 🎯 PROMPT DE REANUDACIÓN

Al abrir una nueva conversación con Claude, pegá esto:

```
Soy Marcelo Castellanos. Creador de The Surf Sequence (TSS).
Te adjunto el documento TSS_Ecosystem_OS_MasterDoc_v1.0.docx y este
handoff markdown con todo el contexto del proyecto. Leelo completo.

Hoy quiero trabajar en: [DECÍ AQUÍ QUÉ QUERÉS HACER]

Mis preferencias operativas están activas (Marcelo OS): clarity, systems,
no fluff, build assets not tasks, máximo 3 strategic fronts a la vez.
```

---

## 🎯 QUIÉN SOY

- ISA Olympic Expert Coach (Paris 2024)
- ISA Certified Coach Educator
- 30+ años de surf
- Founder Puro Surf Academy (El Salvador)
- Creador de The Surf Sequence®
- Systems architect construyendo el "PADI del surf"

---

## 🏗️ QUÉ ES TSS

**No es escuela ni lifestyle brand. Es una metodología estructurada con ecosistema digital para licenciamiento global.**

Tres pilares interconectados:
1. **Methodology** — sistema belt-based con doctrina canónica (Canon v6.0)
2. **TSS Brain App** — plataforma digital mandatoria
3. **Physical Academy Operations** — anclada en Puro Surf

**Objetivo final**: Ser el PADI / CrossFit / Gracie JJ del surf.

### Estructura de propiedad
- **TSS IP** = 100% Enkrateia SA de CV
- **Puro Surf** = flagship operator donde TSS se testea/valida
- **Compartiendo Olas** = brazo de impacto social
- **Personal brand Marcelo** = capa de autoridad

---

## 📜 DOCTRINA CORE (no negociable)

- Nombre: **"The Surf Sequence"** — NUNCA "Total Surf System"
- Plataforma: **"TSS Brain"** — NUNCA variaciones
- **P·R·C·H**: Posture, Rotation, Compression, Hold
- **Belts**: White → Yellow → Blue → Purple → Brown → Black
- **4 Holistic Pillars**: Physical, Technical, Tactical, Mental
- **Safety = cross-system layer**, NO quinto pilar
- **Canon v6.0** = doctrina vigente

---

## 🔥 DECISIÓN ESTRATÉGICA QUE BLOQUEA TODO

> **Soy el operador de Puro Surf o el arquitecto del sistema TSS?**

No puedo ser ambos a máxima capacidad. PADI no opera dive centers — eso es precisamente lo que hace funcionar su modelo.

**Hasta que esto se resuelva, todo lo demás es teórico.**

---

## 💰 MODELO ECONÓMICO (espejo PADI adaptado)

### Tier Surfista (B2C)
- Belt Pak (White/Yellow/Blue/etc.): **$89-$149 USD** por belt
- Physical cert card: **$25-$35** por cert
- TSS Club membership: **$39-$49/año**
- TSS Adventures: comisión 10-15%
- Merchandise: $15-$85

### Tier Coach (B2B individual)
- Coach Development Course: **$1,800-$3,500** (one-time)
- Crew Pack / Materials: **$400-$700**
- **TSS Coach Membership: $150-$300/año (mandatorio)**
- Tier upgrades: $500-$1,500 por upgrade

### Tier Academy (B2B institucional)
- Academy License setup: **$5,000-$15,000** (one-time)
- **Annual Membership: $1,800-$4,800** (tier-based)
- Royalty por cert emitida: $15-$30
- Re-certification audit: $500-$2,000 bi-anual

### Proyección conservadora a 5 años
**~$1.4M USD/año de recurring revenue** con 20 academias activas.

---

## 🏛️ ARQUITECTURA TARGET — 7 SISTEMAS

```
┌────────────────────────────────────────────────────────────────┐
│                     TSS ECOSYSTEM OS                             │
├────────────────────────────────────────────────────────────────┤
│ 🌊 1. thesurfsequence.com      → Marketing público + booking    │
│ 🎓 2. learn.thesurfsequence.com → LMS eLearning por belt        │
│ 💼 3. pros.thesurfsequence.com  → TSS Brain rebrandeado         │
│ 💳 4. pay.thesurfsequence.com   → Pagos unificados (Stripe)     │
│ 📱 5. TSS App (iOS/Android)     → Consumer: eCards, QR, log     │
│ 📦 6. TSS Belt Paks             → Bundle: material + cert       │
│ 🏄 7. TSS Adventures            → Marketplace inter-academia    │
└────────────────────────────────────────────────────────────────┘
     │
     └─> Todo sobre misma base: Supabase + Vercel + Stripe + Resend
```

---

## 📊 ESTADO ACTUAL (2026-04-17)

### ✅ Producido / Completo
- Canon v6.0 (7 secciones A-G + Constitutional Declaration)
- IPM v1.0 (DOCX + HTML + PDF)
- Brand Manual v4.0 (HTML + PDF)
- 5 Student Manuals (White, Yellow, Blue, Purple + templates)
- Yellow Belt Coach Manual
- ONE WAVE Mental Modules (6 de 7, falta Nutrición)
- TSS Brain App 40% productivo (cascade 22 steps funciona)
- **TSS Quick Check v1.0 completo** (DOCX + XLSX + Coach Script)
- Condition Matrix C1-C5 (lógica definida, falta documento formal)

### 🔴 Gaps críticos (no existen)
- LMS eLearning platform
- Payment system
- Certification codes system (el move ganador)
- eCards / QR verification
- Licensed academies ≠ Puro Surf (zero)
- Contrato licensing formalizado Puro Surf ↔ Enkrateia

### ⚠️ Issues pendientes TSS Brain
- Supabase pausa tras 7 días inactividad → manual unpause
- Resend domain thesurfsequence.com no verificado
- sequence_part vs pilar_part mismatch (37 unique White Belt, solo 8 match)
- get_drills_for_belt() muy amplio para Blue Belt
- P3 Student CRUD incompleto

---

## 🛠️ STACK TÉCNICO ACTUAL

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Deploy**: Vercel (auto-deploy desde main)
- **Email**: Resend API
- **Storage**: Supabase avatars bucket

### Links & Credenciales
- **App Producción**: https://tss-brain-app.vercel.app
- **GitHub**: marcelocsurf/TSS-BRAIN-APP (branch: main)
- **Supabase Project ID**: cssewjefhnamconoyuso (São Paulo)
- **Admin**: marcelocsurf@gmail.com
- **Local dir**: /Users/marcelocastellanos/Desktop/Copia de CONSOLIDADO DE TSS VERSION FINAL

---

## 🎯 LAS 12 IDEAS GODMODE

1. **Rebrand TSS Brain como TSS Pros** — es el Pros' Site de PADI, no la app del consumidor
2. **Belt Pak como bundle forzado** — material + certificación + eCard en 1 SKU
3. **Pre-Assigned Codes System** ⭐ — inventario prepago, cashflow prospectivo
4. **eCards con QR verificables globalmente** — 2 segundos para verificar en cualquier academia del mundo
5. **Legacy Import Puro Surf** — 2,550 alumnos se vuelven la base fundacional
6. **TSS Adventures Marketplace** — cross-selling entre academias, comisión 10-15%
7. **The Trojan Horse** — regalar el TSS App al consumidor, funnel automático (modelo Strava)
8. **Global Leaderboards** — competencia = loop viral
9. **Safety Override como barrera** — clean record = valor, crea escasez
10. **The Data Moat** ⭐ — única surf analytics database del mundo, vale millones mid-term
11. **Distributed Reselling** — cada academia es fuerza de ventas
12. **Anti-piracy Kill Switch** — material solo en LMS con login + código

---

## 🗓️ ROADMAP 12 MESES

### Q1 — Solidificar base (meses 1-3)
1. Arreglar pending issues TSS Brain (Supabase pause, Resend, emails)
2. Pilotar Quick Check v1.0 con 10 alumnos Puro Surf
3. Definir TSS Belt Pak White Belt como producto
4. Implementar code inventory básico en Supabase
5. Formalizar Condition Matrix v1.0 como Tier 2
6. Contrato Puro Surf ↔ Enkrateia

### Q2 — Lanzar LMS (meses 4-6)
1. learn.thesurfsequence.com con White + Yellow
2. Stripe integration para Belt Paks
3. eCards digitales post-certificación
4. QR verification básico
5. Legacy import 2,550 alumnos Puro Surf
6. TSS Club beta

### Q3 — Escalar a academias (meses 7-9)
1. Licensing model formal (Resort/Standard/Elite tiers)
2. 2-3 academias externas piloto (Costa Rica, México candidatos)
3. Sistema bulk de códigos
4. Reseller program
5. Primera verificación cross-academia en vivo

### Q4 — Capa consumidor (meses 10-12)
1. TSS Mobile App v1.0 (iOS primero)
2. TSS Club B2C abierto
3. TSS Leaderboards básico
4. TSS Adventures marketplace piloto
5. Blue + Purple Belt eLearning

---

## 📋 DOCUMENTOS PENDIENTES DE PRODUCIR

- [ ] TSS Licensing Model v1.0 (Tier 2)
- [ ] TSS Economic Model v1.0 (Tier 2)
- [ ] TSS Condition Matrix v1.0 (Tier 2)
- [ ] TSS Belt Pak White Belt — Product Spec
- [ ] TSS Code Inventory System — Technical Spec
- [ ] TSS Academy Tier Definitions (Resort/Standard/Elite)
- [ ] Contrato Puro Surf ↔ Enkrateia (legal)
- [ ] TSS Ecosystem OS — Technical Architecture Doc
- [ ] ONE WAVE Módulo 7 Nutrition
- [ ] Puro Surf Academy Operations Manual

---

## ⚙️ PREFERENCIAS OPERATIVAS (Marcelo OS)

- **Build assets, not tasks** — si no escala o no fortalece IP, es secundario
- **Decision filter**: ¿construye asset? ¿escala sin mí? ¿fortalece positioning? ¿integra a TSS? ¿es real o dopamina estratégica?
- **Focus law**: máximo 3 strategic fronts simultáneamente (Core / Scaling / Impact)
- **ADHD rule**: ideas NO se ejecutan cuando aparecen — se capturan, analizan, agendan
- **Response format**: diagnóstico real / variable crítica / qué eliminar / prioridad ahora / plan paso a paso / apalancamiento / métricas / riesgos / pregunta incómoda / recomendación final
- **Extreme clarity, no filler, visual structure**
- **Si algo es mala idea, decilo y proponé algo mejor**

---

## 🧠 DECISIONES DOCTRINALES REGISTRADAS

### Quick Check v1.0 aprobado (abril 2026)
- Estructura 3×3: Paddle + Read + Water = 15 pts
- Regla 1: ningún score 0 o 1 → cap en White Belt
- Regla 2: Safety Override → anula evaluación, re-test 30 días

### Condition Matrix aprobada (abril 2026)
- 5 niveles: C1 Controlled, C2 Easy, C3 Standard, C4 Demanding, C5 Extreme
- 3 zonas de capacidad: AUTÓNOMO / ASISTIDO / NO APTO
- Inferencia hacia abajo SÍ, hacia arriba NO
- Testing máximo +1 nivel sobre autonomía confirmada
- Expiración: 12 meses sin actividad en esa C

### PADI Revenue Model (análizado, abril 2026)
- 7 revenue streams identificados
- Estimado $150M-$250M USD/año
- Moats: brand, standards globales, network effect, forced compliance, proprietary materials
- Blueprint adaptado a TSS producido

---

## 🚨 WARNINGS LEGALES

- **NO asumir** que el acuerdo Marcelo ↔ Puro Surf / Orlando es seguro hasta que IP, licensing, economics y separación estén formalizados por contrato
- **NO avanzar licenciamiento externo** hasta contrato Puro Surf firmado
- **Memoria crítica**: TSS IP ≠ Puro Surf en ningún documento o comunicación

---

## 📚 APPENDIX — CANON QUICK REFERENCE

### Belt Progression
White (Beginner) → Yellow (Novice) → Blue (Foundation) → Purple (Emerging) → Brown (Pre-Elite) → Black (Elite)

### Kids / Junior / Adult Programs
- Kids (7-10): ceiling Purple Belt
- Junior (11-14): ceiling Purple Belt
- Adult (15+): acceso a Brown y Black
- Regla de protección desarrollo, no limitación capacidad

### Three Circles of Power
- **Surfer version**: P·R·C·H + Feet Position + Wave Dynamic
- **Coach version**: Surfer Level + Environment + Task

### Block System
Blocks 0–7 + Infinite Circle loop (Blocks 4–7) — transversal en Core Canon

### Sequence numbering
- White Belt: #1–5
- Yellow Belt: #6–7
- Blue Belt: #8–13

### Coach Certification Structure
- 3 external prerequisites: Lifeguard + ISA L1 + ISA L2
- 5 internal TSS Levels
- Public tiers: Foundation / Practitioner / Master

### IPM — Integrated Process Map ("Full Wave")
- 2 transversal rings: Safety (amber) + Four Holistic Pillars
- 4 sequential layers: Preparation / Entry & Capture / Foundations in Motion / Execution
- 4 Safety domains: Ocean Safety + Surf Etiquette + Equipment Safety + Physical Safety

### Document Hierarchy
- **Tier 1 Constitutional**: Canon v6.0
- **Tier 2 Architectural**: IPM, Economic Model, Licensing Model, Condition Matrix
- **Tier 3 Operational**: Belt Manuals, Coach Manuals, Quick Check
- **Tier 4 Tools**: spreadsheets, forms, templates

---

## 🎬 CÓMO RETOMAR EL TRABAJO

1. Abrir nueva conversación con Claude
2. Adjuntar `TSS_Ecosystem_OS_MasterDoc_v1.0.docx` Y este `.md`
3. Decir qué querés trabajar hoy
4. Claude tendrá todo el contexto necesario

### Ejemplos de arranque:

**Si querés trabajar estrategia:**
> "Trabajemos en la sección 9.2 — decisión Puro Surf. Ayudame a estructurar las opciones."

**Si querés producir documento:**
> "Necesito producir el Belt Pak White Belt Product Spec. Usá Section 6 como base."

**Si querés trabajar código:**
> "Continuemos con TSS Brain. Hoy necesito resolver el naming mismatch sequence_part/pilar_part en White Belt."

**Si querés analizar algo nuevo:**
> "Analicemos cómo CrossFit gestiona su modelo de afiliados. Usalo para contrastar con el blueprint TSS que ya tenemos."

---

**FIN DEL HANDOFF MAESTRO**

*Este documento es living — actualizalo con Claude al final de sesiones clave*
