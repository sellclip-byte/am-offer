-- am-Offer WANTED v1
create table if not exists public.wanted_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 1 and 4000),
  image_urls text[] not null default '{}',
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.wanted_posts enable row level security;
drop policy if exists "wanted public read" on public.wanted_posts;
create policy "wanted public read" on public.wanted_posts for select using (status='published' or auth.uid()=user_id);
drop policy if exists "wanted owner insert" on public.wanted_posts;
create policy "wanted owner insert" on public.wanted_posts for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "wanted owner update" on public.wanted_posts;
create policy "wanted owner update" on public.wanted_posts for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "wanted owner delete" on public.wanted_posts;
create policy "wanted owner delete" on public.wanted_posts for delete to authenticated using (auth.uid()=user_id);
