-- ═══ EL MÉTODO — seed de la guía (idempotente) ═══
-- La mitad del feature es el checklist sembrado: sin esto, un entorno
-- fresco crea las tablas vacías y /metodo no guía nada. Producción ya
-- tiene estas filas (aplicadas vía MCP el 2026-08-30): los docs entran
-- por ON CONFLICT (id) y las tareas solo si NUNCA hubo seed (cualquier
-- fila seeded=true corta el insert — así no se duplican ni se "reparan"
-- borrados deliberados del dueño).

insert into method_docs (id, area, title, kind, url, resource_id, notes) values
 ('a1000000-0000-4000-8000-000000000001','doctrina','One Wave — el libro (final, inglés)','resource',null,'f50677a2-72b1-4abd-9335-fe0c99c80333','Edición final 2026. En la biblioteca, listo para otorgar.'),
 ('a1000000-0000-4000-8000-000000000002','doctrina','One Wave — The System (deck)','resource',null,'e0fbb834-7e74-4579-bd12-99e37fa4aae5','18 slides pedagógicos. Notas del presentador en español.'),
 ('a1000000-0000-4000-8000-000000000003','doctrina','Manual de quotes de One Wave','link','https://claude.ai/code/artifact/7b401b7e-3fcc-40de-85f0-68ef60b86279',null,'Todas las citas verbatim, con capítulo y página.'),
 ('a1000000-0000-4000-8000-000000000004','doctrina','Manual master — Novice (inglés)','resource',null,'2e5fa049-27f8-4310-979a-13a643c25c4c',null),
 ('a1000000-0000-4000-8000-000000000005','negocio','Reportes del negocio (P&L, ocupación, embudo)','link','/reports',null,'La superficie de reportes del app.'),
 ('a1000000-0000-4000-8000-000000000006','mercadeo','NPS y experiencia del camp','link','/reports/experiencia',null,'La encuesta de experiencia alimenta este reporte.')
on conflict (id) do nothing;

insert into method_tasks (area, title, detail, status, doc_id, sort_order, seeded)
select v.* from (values
 ('doctrina','Canon Oficial del método (versión vigente)','El documento madre. Subir el PDF vigente a la bóveda.','pending',null::uuid,1,true),
 ('doctrina','One Wave — el libro (edición final, solo inglés)','En la biblioteca del app, listo para otorgar.','done','a1000000-0000-4000-8000-000000000001'::uuid,2,true),
 ('doctrina','One Wave — The System (deck pedagógico)','Para que instructores apliquen y alumnos entiendan.','done','a1000000-0000-4000-8000-000000000002'::uuid,3,true),
 ('doctrina','Manual de quotes del libro',null,'done','a1000000-0000-4000-8000-000000000003'::uuid,4,true),
 ('doctrina','Manuales master por cinta','Novice listo. Falta consolidar White (vive como curso) y Blue en adelante.','in_progress','a1000000-0000-4000-8000-000000000004'::uuid,5,true),
 ('doctrina','Documento de Learning Blocks y las 13 secuencias','Los 8 bloques y el círculo infinito, como documento presentable.','pending',null,6,true),
 ('doctrina','Escalera del agua (niveles L1–L5)','La propuesta existe — falta decidirla y documentarla.','pending',null,7,true),
 ('marca','Manual de marca v10 (PDF oficial)','Vive aplicado en el app; subir el PDF como referencia única.','pending',null,1,true),
 ('marca','Pack de logos (SVG/PNG, fondo claro y oscuro)',null,'pending',null,2,true),
 ('marca','Tipografías y licencias (Archivo, IBM Plex Mono, Lora)',null,'pending',null,3,true),
 ('marca','Plantilla oficial de presentaciones',null,'pending',null,4,true),
 ('marca','Banco de fotos oficial',null,'pending',null,5,true),
 ('marca','Guía de voz','De cara al alumno: inglés, "The Surf Sequence" nunca la sigla; vocabulario prohibido del manual.','pending',null,6,true),
 ('certificacion','Documento del sistema de certificación L1–L5',null,'pending',null,1,true),
 ('certificacion','Safety Canon (curso L1 con examen final)','Vive en el app — cursos del portal del coach.','done',null,2,true),
 ('certificacion','Foundations (el método, curso del coach)','Vive en el app — cursos del portal del coach.','done',null,3,true),
 ('certificacion','Rúbricas de evaluación del coach por nivel',null,'pending',null,4,true),
 ('certificacion','Credenciales / insignias por nivel',null,'pending',null,5,true),
 ('certificacion','Contrato o acuerdo de certificación',null,'pending',null,6,true),
 ('negocio','Plan de negocios (documento vigente)',null,'pending',null,1,true),
 ('negocio','Modelo de licenciamiento','Existe el Blueprint — subir la versión vigente.','pending',null,2,true),
 ('negocio','Pricing oficial de servicios','Vive en Services del app; documentar la política para licencias.','done',null,3,true),
 ('negocio','Reportes del negocio (P&L, ocupación, membresías)',null,'done','a1000000-0000-4000-8000-000000000005'::uuid,4,true),
 ('negocio','Proyecciones financieras',null,'pending',null,5,true),
 ('negocio','Acuerdo con Puro Surf',null,'pending',null,6,true),
 ('mercadeo','Estrategia de mercadeo (documento)',null,'pending',null,1,true),
 ('mercadeo','Calendario de contenido',null,'pending',null,2,true),
 ('mercadeo','Pitch deck comercial',null,'pending',null,3,true),
 ('mercadeo','Hoja de disponibilidad para vender','Vive en el app — DISPONIBILIDAD del portal del host.','done',null,4,true),
 ('mercadeo','NPS y testimonios del camp',null,'done','a1000000-0000-4000-8000-000000000006'::uuid,5,true),
 ('mercadeo','Presencia digital (IG / TikTok / YouTube)',null,'pending',null,6,true),
 ('operaciones','Manual de proveedores','Quién provee qué: contactos, condiciones, tiempos.','pending',null,1,true),
 ('operaciones','Catálogo de merch',null,'pending',null,2,true),
 ('operaciones','Protocolo de resolución de problemas','El PDF oficial vive en HOY del portal del host.','done',null,3,true),
 ('operaciones','Contratos tipo de staff',null,'pending',null,4,true),
 ('operaciones','Onboarding de staff (guías por rol)','Las guías viven integradas en cada portal.','done',null,5,true),
 ('operaciones','Inventario y rentas de tablas','Vive en el app, con waiver y firma.','done',null,6,true),
 ('legal','Registro de marca The Surf Sequence®',null,'pending',null,1,true),
 ('legal','Contrato tipo de licencia de academia',null,'pending',null,2,true),
 ('legal','Waivers (alumno y staff)','Viven en el app, con firma digital.','done',null,3,true),
 ('legal','Seguros (póliza vigente)',null,'pending',null,4,true),
 ('legal','Términos y privacidad del portal',null,'pending',null,5,true)
) as v(area, title, detail, status, doc_id, sort_order, seeded)
where not exists (select 1 from method_tasks where seeded = true);
