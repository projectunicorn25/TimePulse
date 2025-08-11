-- Enhanced Supabase schema with security fixes and improvements
create extension if not exists "pgcrypto";

-- Profiles table with roles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('contractor','manager')),
  timezone text default 'UTC',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'contractor')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean default true,
  created_at timestamptz not null default now()
);

-- Time entries with enhanced constraints
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id),
  work_date date not null,
  hours numeric(4,2) not null check (hours >= 0 and hours <= 24),
  note text,
  status text not null default 'draft' check (status in ('draft','submitted','approved','rejected')),
  manager_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hours_quarter check (((hours*4)::int)::numeric = hours*4)
);

-- Timesheet periods for bi-weekly submissions
create table if not exists public.timesheet_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'open' check (status in ('open','submitted','approved','rejected')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint valid_period check (end_date >= start_date),
  unique(user_id, start_date, end_date)
);

-- Audit trail for time entries
create table if not exists public.time_entry_events (
  id uuid primary key default gen_random_uuid(),
  time_entry_id uuid not null references public.time_entries(id) on delete cascade,
  actor uuid not null references public.profiles(id),
  action text not null check (action in ('create','submit','approve','reject','edit','delete')),
  at timestamptz not null default now(),
  note text,
  old_values jsonb,
  new_values jsonb
);

-- Helper function to check if user is manager
create or replace function public.is_manager(uid uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles p where p.id = uid and p.role = 'manager'
  );
$$;

-- Updated_at trigger function
create or replace function set_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_te_updated on public.time_entries;
create trigger trg_te_updated 
before update on public.time_entries 
for each row execute function set_updated_at();

-- Performance indexes
create index if not exists idx_te_user_date on public.time_entries(user_id, work_date desc);
create index if not exists idx_te_status_created on public.time_entries(status, created_at desc);
create index if not exists idx_te_project on public.time_entries(project_id);
create index if not exists idx_tp_user_start on public.timesheet_periods(user_id, start_date desc);
create index if not exists idx_tee_entry on public.time_entry_events(time_entry_id, at desc);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;
alter table public.timesheet_periods enable row level security;
alter table public.time_entry_events enable row level security;

-- Profiles policies
create policy "read own profile or any if manager" on public.profiles
for select using (auth.uid() = id or public.is_manager(auth.uid()));

create policy "update own profile" on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- Projects policies
create policy "everyone can read projects" on public.projects
for select using (true);

create policy "only managers can manage projects" on public.projects
for all using (public.is_manager(auth.uid()));

-- Time entries policies - FIXED with proper role separation
create policy "insert own entries" on public.time_entries
for insert with check (auth.uid() = user_id);

create policy "select own or manager" on public.time_entries
for select using (auth.uid() = user_id or public.is_manager(auth.uid()));

-- Split update policies by role and status
create policy "contractor_update_own_draft_or_submitted" on public.time_entries
for update using (auth.uid() = user_id and status in ('draft','submitted'))
with check (auth.uid() = user_id and status in ('draft','submitted'));

create policy "manager_update_any" on public.time_entries
for update using (public.is_manager(auth.uid()))
with check (true);

create policy "delete own draft or manager any" on public.time_entries
for delete using ((auth.uid() = user_id and status in ('draft','submitted')) or public.is_manager(auth.uid()));

-- Timesheet periods policies
create policy "read own periods or manager all" on public.timesheet_periods
for select using (auth.uid() = user_id or public.is_manager(auth.uid()));

create policy "create own periods" on public.timesheet_periods
for insert with check (auth.uid() = user_id);

create policy "update own open periods or manager any" on public.timesheet_periods
for update using ((auth.uid() = user_id and status = 'open') or public.is_manager(auth.uid()));

-- Time entry events policies
create policy "read events for own entries or manager" on public.time_entry_events
for select using (
  exists (
    select 1 from public.time_entries te 
    where te.id = time_entry_id 
    and (te.user_id = auth.uid() or public.is_manager(auth.uid()))
  )
);

create policy "create events for accessible entries" on public.time_entry_events
for insert with check (
  auth.uid() = actor and
  exists (
    select 1 from public.time_entries te 
    where te.id = time_entry_id 
    and (te.user_id = auth.uid() or public.is_manager(auth.uid()))
  )
);

-- Function to log time entry changes
create or replace function log_time_entry_event()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.time_entry_events (time_entry_id, actor, action, new_values)
    values (NEW.id, auth.uid(), 'create', to_jsonb(NEW));
  elsif TG_OP = 'UPDATE' then
    if OLD.status != NEW.status then
      insert into public.time_entry_events (time_entry_id, actor, action, old_values, new_values)
      values (NEW.id, auth.uid(), 
        case 
          when NEW.status = 'submitted' then 'submit'
          when NEW.status = 'approved' then 'approve'
          when NEW.status = 'rejected' then 'reject'
          else 'edit'
        end,
        to_jsonb(OLD), to_jsonb(NEW));
    else
      insert into public.time_entry_events (time_entry_id, actor, action, old_values, new_values)
      values (NEW.id, auth.uid(), 'edit', to_jsonb(OLD), to_jsonb(NEW));
    end if;
  elsif TG_OP = 'DELETE' then
    insert into public.time_entry_events (time_entry_id, actor, action, old_values)
    values (OLD.id, auth.uid(), 'delete', to_jsonb(OLD));
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

drop trigger if exists log_time_entry_changes on public.time_entries;
create trigger log_time_entry_changes
after insert or update or delete on public.time_entries
for each row execute function log_time_entry_event();

-- Views for easier querying
create or replace view public.time_entries_with_user as
select 
  te.*,
  p.email as user_email,
  pr.name as project_name
from public.time_entries te
left join public.profiles p on te.user_id = p.id
left join public.projects pr on te.project_id = pr.id;

-- Sample data (optional - comment out in production)
insert into public.projects (name) values 
  ('Website Redesign'),
  ('Mobile App Development'),
  ('API Integration'),
  ('Database Migration')
on conflict do nothing;