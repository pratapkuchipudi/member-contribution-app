create extension if not exists pgcrypto;
create table if not exists members(id uuid primary key default gen_random_uuid(),name text not null,phone text not null,proposed_amount numeric(12,2) not null default 0 check(proposed_amount>=0),proposed_date date,notes text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists payments(id uuid primary key default gen_random_uuid(),member_id uuid not null references members(id) on delete cascade,amount numeric(12,2) not null check(amount>0),payment_date date not null,payment_method text,notes text,confirmed_by uuid references auth.users(id),created_at timestamptz not null default now());
create table if not exists member_notes(id uuid primary key default gen_random_uuid(),member_id uuid not null references members(id) on delete cascade,note text not null,created_by uuid references auth.users(id),created_at timestamptz not null default now());
create table if not exists sponsors(id uuid primary key default gen_random_uuid(),member_id uuid references members(id) on delete set null,name text not null,phone text not null,expected_amount numeric(12,2) not null default 0,meeting_date date,meeting_time time,status text not null default 'New',notes text,amount_received numeric(12,2) not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create or replace view member_financial_summary as select m.id,m.name,m.phone,m.proposed_amount,m.proposed_date,m.notes,m.created_at,coalesce(sum(p.amount),0)::numeric(12,2) total_paid,greatest(m.proposed_amount-coalesce(sum(p.amount),0),0)::numeric(12,2) pending_amount,case when coalesce(sum(p.amount),0)<=0 then 'Not Paid' when coalesce(sum(p.amount),0)<m.proposed_amount then 'Partial' else 'Fully Paid' end payment_status from members m left join payments p on p.member_id=m.id group by m.id;
alter table members enable row level security; alter table payments enable row level security; alter table member_notes enable row level security; alter table sponsors enable row level security;
drop policy if exists "auth members" on members; drop policy if exists "auth payments" on payments; drop policy if exists "auth notes" on member_notes; drop policy if exists "auth sponsors" on sponsors;
drop policy if exists "anon members" on members; drop policy if exists "anon payments" on payments; drop policy if exists "anon notes" on member_notes; drop policy if exists "anon sponsors" on sponsors;
create policy "anon members" on members for all to anon, authenticated using(true) with check(true);
create policy "anon payments" on payments for all to anon, authenticated using(true) with check(true);
create policy "anon notes" on member_notes for all to anon, authenticated using(true) with check(true);
create policy "anon sponsors" on sponsors for all to anon, authenticated using(true) with check(true);
grant select on member_financial_summary to anon, authenticated;
create table if not exists app_roles(id text primary key, name text, role text not null default 'admin', created_at timestamptz not null default now());
alter table app_roles add column if not exists name text;
insert into app_roles(id,name,role) values
  ('8191','Ratnakumar','admin'),
  ('45190','Sudhakar','admin'),
  ('5795','Dr.Joe','admin'),
  ('60783','Pratap','admin'),
  ('9414','Dr.Paul','admin')
on conflict (id) do update set name=excluded.name, role=excluded.role;
alter table app_roles enable row level security;
drop policy if exists "anon roles" on app_roles;
create policy "anon roles" on app_roles for all to anon, authenticated using(true) with check(true);