-- Host coverage mode: a per-person switch that lets a host cover
-- coordination duties on days the coordinator is away (assign coach,
-- reschedule/cancel a one-day class). Money/config stays dashboard-only.
alter table coaches add column if not exists portal_can_coordinate boolean not null default false;

-- Existing hosts start enabled (the front-desk team already covers those
-- days in practice); new hires start OFF until an admin flips the switch.
update coaches set portal_can_coordinate = true where role = 'host';
