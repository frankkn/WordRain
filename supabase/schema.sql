-- WordRain world leaderboard schema.
-- Run this once in the Supabase dashboard (SQL Editor).

create table leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 12),
  country text not null check (country ~ '^[A-Z]{2}$'),
  score int not null check (score > 0 and score <= 1000000),
  created_at timestamptz not null default now()
);

create index on leaderboard (score desc);

alter table leaderboard enable row level security;

create policy "anyone can read" on leaderboard
  for select using (true);

create policy "anyone can insert" on leaderboard
  for insert with check (true);
