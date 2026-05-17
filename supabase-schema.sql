-- ============================================================
-- FLEET MANAGER - SUPABASE SCHEMA
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: profiles (extiende auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Los admins pueden ver todos los profiles
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Cada usuario puede ver su propio profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Solo admins pueden crear profiles (además del trigger)
create policy "Admins can insert profiles" on public.profiles
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Solo admins pueden actualizar profiles
create policy "Admins can update profiles" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Trigger para crear profile automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'viewer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger para actualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TABLA: vehicles
-- ============================================================
create table public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  plate text not null unique,
  brand text not null,
  model text not null,
  year integer not null check (year >= 1900 and year <= 2100),
  type text not null check (type in ('sedan', 'suv', 'pickup', 'van', 'truck', 'motorcycle', 'otro')),
  fuel_type text not null default 'nafta' check (fuel_type in ('nafta', 'diesel', 'gnc', 'electrico', 'hibrido')),
  color text,
  vin text unique,
  status text not null default 'disponible' check (status in ('activo', 'en_reparacion', 'baja', 'disponible')),
  assigned_to uuid references public.profiles(id) on delete set null,
  mileage integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

-- Todos los usuarios autenticados pueden ver vehículos
create policy "Authenticated users can view vehicles" on public.vehicles
  for select using (auth.uid() is not null);

-- Solo admins pueden crear/editar/eliminar vehículos
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
-- TABLA: expenses (gastos / mecánico)
-- ============================================================
create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  category text not null check (category in (
    'combustible', 'mantenimiento', 'reparacion', 'seguro',
    'patente', 'lavado', 'neumaticos', 'otro'
  )),
  amount numeric(12, 2) not null check (amount >= 0),
  date date not null default current_date,
  description text,
  mechanic_name text,
  workshop_name text,
  invoice_number text,
  mileage_at_expense integer,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
-- TABLA: vehicle_files (archivos en R2)
-- ============================================================
create table public.vehicle_files (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  expense_id uuid references public.expenses(id) on delete set null,
  file_name text not null,
  file_key text not null unique,
  file_url text not null,
  file_size bigint not null,
  file_type text not null,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
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
-- FUNCIÓN: create_admin_user (usar desde service_role)
-- ============================================================
create or replace function public.create_user_with_role(
  p_email text,
  p_password text,
  p_full_name text,
  p_role text default 'viewer'
)
returns uuid as $$
declare
  new_user_id uuid;
begin
  -- Solo admins pueden llamar esto
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Unauthorized: only admins can create users';
  end if;

  -- Insertar en auth.users via admin API (esto se hace desde el backend con service_role)
  raise exception 'Use the API route /api/admin/create-user instead';
  return null;
end;
$$ language plpgsql security definer;

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: vehículos con datos del asignado
create or replace view public.vehicles_with_assignment as
select
  v.*,
  p.full_name as assigned_full_name,
  p.email as assigned_email
from public.vehicles v
left join public.profiles p on v.assigned_to = p.id;

-- Vista: gastos con datos del vehículo
create or replace view public.expenses_with_vehicle as
select
  e.*,
  v.plate,
  v.brand,
  v.model,
  v.year,
  p.full_name as created_by_name
from public.expenses e
join public.vehicles v on e.vehicle_id = v.id
join public.profiles p on e.created_by = p.id;
