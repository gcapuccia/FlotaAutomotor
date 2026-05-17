-- ============================================================
-- MIGRACIÓN: Rediseño tabla vehicles
-- Ejecutar en SQL Editor de Supabase
-- ============================================================

-- Eliminar tabla anterior (y sus dependencias en cascada)
drop table if exists public.vehicle_files cascade;
drop table if exists public.expenses cascade;
drop table if exists public.vehicles cascade;
drop view if exists public.vehicles_with_assignment cascade;
drop view if exists public.expenses_with_vehicle cascade;

-- ============================================================
-- TABLA: vehicles (rediseñada)
-- ============================================================
create table public.vehicles (
  id              uuid primary key default uuid_generate_v4(),

  -- Identificación
  interno         text,                          -- Número interno (puede ser null)
  plate           text not null unique,          -- Patente
  vehicle_name    text not null,                 -- Vehículo (ej: "Ford Transit")
  model           text not null,                 -- Modelo (ej: "2022")

  -- Personas
  driver          text,                          -- Chofer (nombre libre, puede ser null)
  titular         text not null,                 -- Titular registral (obligatorio)

  -- Clasificación
  type            text not null check (type in (
                    'sedan', 'suv', 'pickup', 'van',
                    'truck', 'motorcycle', 'otro'
                  )),
  flota           text,                          -- Flota o grupo (puede ser null)

  -- Documentación física
  llave           text,                          -- Observación sobre llave (puede ser null)
  titulo          text,                          -- Observación sobre título (puede ser null)

  -- Estado operativo
  status          text not null default 'disponible' check (status in (
                    'activo', 'en_reparacion', 'baja', 'disponible'
                  )),

  -- Datos técnicos
  motor           text,                          -- Número de motor (puede ser null)
  chasis          text,                          -- Número de chasis (puede ser null)
  vtv             date,                          -- Fecha de vencimiento VTV (puede ser null)

  -- Auditoría
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.vehicles enable row level security;

-- Políticas RLS
create policy "Authenticated users can view vehicles" on public.vehicles
  for select using (auth.uid() is not null);

create policy "Admins can insert vehicles" on public.vehicles
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update vehicles" on public.vehicles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete vehicles" on public.vehicles
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create trigger vehicles_updated_at
  before update on public.vehicles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- RECREAR: expenses (con nueva FK)
-- ============================================================
create table public.expenses (
  id                  uuid primary key default uuid_generate_v4(),
  vehicle_id          uuid not null references public.vehicles(id) on delete cascade,
  category            text not null check (category in (
                        'combustible', 'mantenimiento', 'reparacion', 'seguro',
                        'patente', 'lavado', 'neumaticos', 'otro'
                      )),
  amount              numeric(12, 2) not null check (amount >= 0),
  date                date not null default current_date,
  description         text,
  mechanic_name       text,
  workshop_name       text,
  invoice_number      text,
  mileage_at_expense  integer,
  created_by          uuid not null references public.profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "Authenticated users can view expenses" on public.expenses
  for select using (auth.uid() is not null);

create policy "Admins can insert expenses" on public.expenses
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update expenses" on public.expenses
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete expenses" on public.expenses
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create trigger expenses_updated_at
  before update on public.expenses
  for each row execute function public.handle_updated_at();

-- ============================================================
-- RECREAR: vehicle_files (con nueva FK)
-- ============================================================
create table public.vehicle_files (
  id              uuid primary key default uuid_generate_v4(),
  vehicle_id      uuid not null references public.vehicles(id) on delete cascade,
  expense_id      uuid references public.expenses(id) on delete set null,
  file_name       text not null,
  file_key        text not null unique,
  file_url        text not null,
  file_size       bigint not null,
  file_type       text not null,
  uploaded_by     uuid not null references public.profiles(id),
  created_at      timestamptz not null default now()
);

alter table public.vehicle_files enable row level security;

create policy "Authenticated users can view files" on public.vehicle_files
  for select using (auth.uid() is not null);

create policy "Admins can insert files" on public.vehicle_files
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete files" on public.vehicle_files
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- VISTA: vehicles con días hasta vencimiento VTV
-- ============================================================
create or replace view public.vehicles_view as
select
  v.*,
  case
    when v.vtv is null then null
    when v.vtv < current_date then 'vencida'
    when v.vtv <= current_date + interval '30 days' then 'por_vencer'
    else 'vigente'
  end as vtv_status,
  (v.vtv - current_date) as vtv_dias_restantes
from public.vehicles v;
