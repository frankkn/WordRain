-- Migration 002: per-difficulty leaderboards.
-- Run once in the Supabase dashboard (SQL Editor) on projects created
-- from the original schema. Existing rows become 'medium'.

alter table leaderboard add column difficulty text not null default 'medium'
  check (difficulty in ('easy', 'medium', 'hard'));

create index on leaderboard (difficulty, score desc);
