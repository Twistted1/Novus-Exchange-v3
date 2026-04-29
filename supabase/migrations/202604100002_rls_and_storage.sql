begin;
-- =========================================================
-- ROLE HELPERS
-- =========================================================
create or replace function public.has_role(requested_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.slug = requested_role
  );
$$;
create or replace function public.has_any_role(requested_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.slug = any(requested_roles)
  );
$$;
grant execute on function public.has_role(text) to anon, authenticated;
grant execute on function public.has_any_role(text[]) to anon, authenticated;
-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'public-site',
    'public-site',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
  ),
  (
    'solution-media',
    'solution-media',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
  ),
  (
    'raw-uploads',
    'raw-uploads',
    false,
    5368709120,
    array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'text/plain']
  ),
  (
    'derived-media',
    'derived-media',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'application/json', 'text/plain']
  ),
  (
    'research-private',
    'research-private',
    false,
    1073741824,
    array['application/pdf', 'text/plain', 'application/json', 'image/jpeg', 'image/png']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
-- =========================================================
-- ENABLE RLS
-- =========================================================
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_derivatives enable row level security;
alter table public.upload_jobs enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_blocks enable row level security;
alter table public.article_tags enable row level security;
alter table public.videos enable row level security;
alter table public.video_playlists enable row level security;
alter table public.video_playlist_items enable row level security;
alter table public.solutions enable row level security;
alter table public.solution_features enable row level security;
alter table public.solution_testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.demo_requests enable row level security;
alter table public.audit_logs enable row level security;
-- =========================================================
-- PROFILES
-- =========================================================
drop policy if exists "Profiles: own or editorial read" on public.profiles;
create policy "Profiles: own or editorial read"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.has_any_role(array['admin', 'editor'])
);
drop policy if exists "Profiles: own update" on public.profiles;
create policy "Profiles: own update"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.has_role('admin'))
with check (id = auth.uid() or public.has_role('admin'));
drop policy if exists "Profiles: admin insert" on public.profiles;
create policy "Profiles: admin insert"
on public.profiles
for insert
to authenticated
with check (public.has_role('admin'));
-- =========================================================
-- ROLES / USER ROLES
-- =========================================================
drop policy if exists "Roles: authenticated read" on public.roles;
create policy "Roles: authenticated read"
on public.roles
for select
to authenticated
using (true);
drop policy if exists "Roles: admin manage" on public.roles;
create policy "Roles: admin manage"
on public.roles
for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));
drop policy if exists "User roles: own read or admin" on public.user_roles;
create policy "User roles: own read or admin"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid() or public.has_role('admin'));
drop policy if exists "User roles: admin manage" on public.user_roles;
create policy "User roles: admin manage"
on public.user_roles
for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));
-- =========================================================
-- PUBLIC SETTINGS
-- =========================================================
drop policy if exists "Site settings: public read public rows" on public.site_settings;
create policy "Site settings: public read public rows"
on public.site_settings
for select
to public
using (is_public = true);
drop policy if exists "Site settings: editorial read all" on public.site_settings;
create policy "Site settings: editorial read all"
on public.site_settings
for select
to authenticated
using (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Site settings: editorial manage" on public.site_settings;
create policy "Site settings: editorial manage"
on public.site_settings
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
-- =========================================================
-- MEDIA / UPLOADS
-- =========================================================
drop policy if exists "Media assets: public read approved" on public.media_assets;
create policy "Media assets: public read approved"
on public.media_assets
for select
to public
using (status = 'ready' and visibility = 'public');
drop policy if exists "Media assets: editorial manage" on public.media_assets;
create policy "Media assets: editorial manage"
on public.media_assets
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Media derivatives: public read from public parents" on public.media_derivatives;
create policy "Media derivatives: public read from public parents"
on public.media_derivatives
for select
to public
using (
  exists (
    select 1
    from public.media_assets ma
    where ma.id = parent_asset_id
      and ma.status = 'ready'
      and ma.visibility = 'public'
  )
);
drop policy if exists "Media derivatives: editorial manage" on public.media_derivatives;
create policy "Media derivatives: editorial manage"
on public.media_derivatives
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Upload jobs: editorial manage" on public.upload_jobs;
create policy "Upload jobs: editorial manage"
on public.upload_jobs
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
-- =========================================================
-- AUTHORS / TAXONOMY
-- =========================================================
drop policy if exists "Authors: public read" on public.authors;
create policy "Authors: public read"
on public.authors
for select
to public
using (true);
drop policy if exists "Authors: editorial manage" on public.authors;
create policy "Authors: editorial manage"
on public.authors
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Categories: public read" on public.categories;
create policy "Categories: public read"
on public.categories
for select
to public
using (true);
drop policy if exists "Categories: editorial manage" on public.categories;
create policy "Categories: editorial manage"
on public.categories
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Tags: public read" on public.tags;
create policy "Tags: public read"
on public.tags
for select
to public
using (true);
drop policy if exists "Tags: editorial manage" on public.tags;
create policy "Tags: editorial manage"
on public.tags
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
-- =========================================================
-- ARTICLES
-- =========================================================
drop policy if exists "Articles: public read published" on public.articles;
create policy "Articles: public read published"
on public.articles
for select
to public
using (
  status = 'published'
  and (published_at is null or published_at <= now())
);
drop policy if exists "Articles: editorial manage" on public.articles;
create policy "Articles: editorial manage"
on public.articles
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Article blocks: public read published article" on public.article_blocks;
create policy "Article blocks: public read published article"
on public.article_blocks
for select
to public
using (
  exists (
    select 1
    from public.articles a
    where a.id = article_id
      and a.status = 'published'
      and (a.published_at is null or a.published_at <= now())
  )
);
drop policy if exists "Article blocks: editorial manage" on public.article_blocks;
create policy "Article blocks: editorial manage"
on public.article_blocks
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Article tags: public read published article" on public.article_tags;
create policy "Article tags: public read published article"
on public.article_tags
for select
to public
using (
  exists (
    select 1
    from public.articles a
    where a.id = article_id
      and a.status = 'published'
      and (a.published_at is null or a.published_at <= now())
  )
);
drop policy if exists "Article tags: editorial manage" on public.article_tags;
create policy "Article tags: editorial manage"
on public.article_tags
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
-- =========================================================
-- VIDEOS
-- =========================================================
drop policy if exists "Videos: public read published" on public.videos;
create policy "Videos: public read published"
on public.videos
for select
to public
using (
  status = 'published'
  and (published_at is null or published_at <= now())
);
drop policy if exists "Videos: editorial manage" on public.videos;
create policy "Videos: editorial manage"
on public.videos
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Video playlists: public read" on public.video_playlists;
create policy "Video playlists: public read"
on public.video_playlists
for select
to public
using (true);
drop policy if exists "Video playlists: editorial manage" on public.video_playlists;
create policy "Video playlists: editorial manage"
on public.video_playlists
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Video playlist items: public read published video" on public.video_playlist_items;
create policy "Video playlist items: public read published video"
on public.video_playlist_items
for select
to public
using (
  exists (
    select 1
    from public.videos v
    where v.id = video_id
      and v.status = 'published'
      and (v.published_at is null or v.published_at <= now())
  )
);
drop policy if exists "Video playlist items: editorial manage" on public.video_playlist_items;
create policy "Video playlist items: editorial manage"
on public.video_playlist_items
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
-- =========================================================
-- SOLUTIONS / FAQS / TESTIMONIALS
-- =========================================================
drop policy if exists "Solutions: public read published" on public.solutions;
create policy "Solutions: public read published"
on public.solutions
for select
to public
using (
  status = 'published'
  and (published_at is null or published_at <= now())
);
drop policy if exists "Solutions: editorial manage" on public.solutions;
create policy "Solutions: editorial manage"
on public.solutions
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Solution features: public read published solution" on public.solution_features;
create policy "Solution features: public read published solution"
on public.solution_features
for select
to public
using (
  exists (
    select 1
    from public.solutions s
    where s.id = solution_id
      and s.status = 'published'
      and (s.published_at is null or s.published_at <= now())
  )
);
drop policy if exists "Solution features: editorial manage" on public.solution_features;
create policy "Solution features: editorial manage"
on public.solution_features
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Solution testimonials: public read published solution" on public.solution_testimonials;
create policy "Solution testimonials: public read published solution"
on public.solution_testimonials
for select
to public
using (
  solution_id is null
  or exists (
    select 1
    from public.solutions s
    where s.id = solution_id
      and s.status = 'published'
      and (s.published_at is null or s.published_at <= now())
  )
);
drop policy if exists "Solution testimonials: editorial manage" on public.solution_testimonials;
create policy "Solution testimonials: editorial manage"
on public.solution_testimonials
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "FAQs: public read published" on public.faqs;
create policy "FAQs: public read published"
on public.faqs
for select
to public
using (
  status = 'published'
  and (published_at is null or published_at <= now())
);
drop policy if exists "FAQs: editorial manage" on public.faqs;
create policy "FAQs: editorial manage"
on public.faqs
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
-- =========================================================
-- WAITLIST / DEMO REQUESTS / AUDIT
-- Public writes should go through Edge Functions using service_role.
-- So these tables stay hidden from anon/authenticated clients.
-- =========================================================
drop policy if exists "Waitlist: editorial manage" on public.waitlist_entries;
create policy "Waitlist: editorial manage"
on public.waitlist_entries
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Demo requests: editorial manage" on public.demo_requests;
create policy "Demo requests: editorial manage"
on public.demo_requests
for all
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Audit logs: admin only" on public.audit_logs;
create policy "Audit logs: admin only"
on public.audit_logs
for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));
-- =========================================================
-- STORAGE OBJECT POLICIES
-- =========================================================
drop policy if exists "Storage: public read public buckets" on storage.objects;
create policy "Storage: public read public buckets"
on storage.objects
for select
to public
using (bucket_id in ('public-site', 'solution-media', 'derived-media'));
drop policy if exists "Storage: editorial insert" on storage.objects;
create policy "Storage: editorial insert"
on storage.objects
for insert
to authenticated
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Storage: editorial update" on storage.objects;
create policy "Storage: editorial update"
on storage.objects
for update
to authenticated
using (public.has_any_role(array['admin', 'editor']))
with check (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Storage: editorial delete" on storage.objects;
create policy "Storage: editorial delete"
on storage.objects
for delete
to authenticated
using (public.has_any_role(array['admin', 'editor']));
drop policy if exists "Storage: editorial read private buckets" on storage.objects;
create policy "Storage: editorial read private buckets"
on storage.objects
for select
to authenticated
using (public.has_any_role(array['admin', 'editor']));
commit;
