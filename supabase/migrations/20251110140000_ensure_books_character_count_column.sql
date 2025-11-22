-- Ensure the books table still exposes a reliable word_count column
alter table if exists "public"."books"
  add column if not exists "word_count" integer default 0;

