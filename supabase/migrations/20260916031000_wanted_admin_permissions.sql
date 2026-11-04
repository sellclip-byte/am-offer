-- WANTED admin permissions
drop policy if exists "wanted admin read all" on public.wanted_posts;
create policy "wanted admin read all" on public.wanted_posts for select
using (exists (select 1 from public.admin_users a where a.user_id=auth.uid()));

drop policy if exists "wanted admin update" on public.wanted_posts;
create policy "wanted admin update" on public.wanted_posts for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id=auth.uid()));

drop policy if exists "wanted admin delete" on public.wanted_posts;
create policy "wanted admin delete" on public.wanted_posts for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=auth.uid()));
