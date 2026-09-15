-- Cobertura de coordinación (Marcelo 2026-09-15, Kat): un host con este flag entra al
-- dashboard con las herramientas de PLANEACIÓN del coordinador (servicios, camps,
-- horarios, coaches y staff), sin costos, reportes, nómina ni ventas.
alter table coaches add column if not exists ops_coordination boolean not null default false;
