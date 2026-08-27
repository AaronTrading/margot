create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  phone text,
  email text,
  goals text,
  status text not null default 'active' check (status in ('active', 'paused', 'done')),
  short_note text,
  weight_kg numeric(5, 2),
  height_cm numeric(5, 2),
  allergies text,
  intolerances text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  note_date date not null default current_date,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'done')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'other' check (type in ('advice', 'recipe', 'shopping', 'other')),
  content text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_client_notes_updated_at on public.client_notes;
create trigger set_client_notes_updated_at
before update on public.client_notes
for each row execute function public.set_updated_at();

drop trigger if exists set_reminders_updated_at on public.reminders;
create trigger set_reminders_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.client_notes enable row level security;
alter table public.reminders enable row level security;
alter table public.resources enable row level security;

create index if not exists clients_status_idx on public.clients(status);
create index if not exists client_notes_client_id_idx on public.client_notes(client_id);
create index if not exists reminders_status_due_date_idx on public.reminders(status, due_date);
create index if not exists reminders_client_id_idx on public.reminders(client_id);
create index if not exists resources_type_idx on public.resources(type);
