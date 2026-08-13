-- ============================================================
-- Rohtak Public School — Student Management System
-- Run this in Supabase: Project -> SQL Editor -> New query -> Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- Classes ----------
create table if not exists classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,          -- e.g. "9", "10"
  section text not null,       -- e.g. "A", "B"
  created_at timestamptz default now()
);

-- ---------- Students ----------
create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  roll_no text not null,
  class_id uuid references classes(id) on delete set null,
  parent_name text,
  parent_phone text,
  email text,
  address text,
  created_at timestamptz default now()
);

-- ---------- Attendance ----------
create table if not exists attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent')),
  created_at timestamptz default now(),
  unique (student_id, date)
);

-- ---------- Marks ----------
create table if not exists marks (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  subject text not null,
  exam_name text not null,
  marks_obtained numeric not null,
  max_marks numeric not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- Demo setup: any signed-in (authenticated) user — i.e. any staff
-- account you create in Authentication -> Users — can read and
-- write everything. Tighten this later with role-based policies
-- if you add student/parent logins.
-- ============================================================

alter table classes enable row level security;
alter table students enable row level security;
alter table attendance enable row level security;
alter table marks enable row level security;

create policy "Authenticated read classes" on classes for select using (auth.role() = 'authenticated');
create policy "Authenticated write classes" on classes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated read students" on students for select using (auth.role() = 'authenticated');
create policy "Authenticated write students" on students for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated read attendance" on attendance for select using (auth.role() = 'authenticated');
create policy "Authenticated write attendance" on attendance for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated read marks" on marks for select using (auth.role() = 'authenticated');
create policy "Authenticated write marks" on marks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- Seed a few classes so the demo isn't empty ----------
insert into classes (name, section) values
  ('9', 'A'), ('9', 'B'),
  ('10', 'A'), ('10', 'B'),
  ('11', 'A'), ('12', 'A')
on conflict do nothing;
