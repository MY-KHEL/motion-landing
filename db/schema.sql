-- Run this once in the Neon SQL editor.
-- Neon provides gen_random_uuid(), so no extension is required.

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  blob_url text not null,
  blob_pathname text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint videos_category_check check (
    category in ('social', 'product', 'explainers', 'logos', 'launch')
  )
);
