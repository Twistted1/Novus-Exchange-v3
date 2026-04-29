import React from "react";

const starterPrinciples = [
  {
    title: "Keep one database, but separate responsibilities",
    detail:
      "Use Postgres tables for structured content, Storage buckets for files, and Edge Functions for any public-facing write action. That separation is what keeps Supabase manageable.",
  },
  {
    title: "Do not let the browser write directly to everything",
    detail:
      "Public forms like waitlists, demo requests, and contact forms should go through Edge Functions. That gives you validation, deduping, rate limiting, and safer audit trails.",
  },
  {
    title: "Start small and grow in layers",
    detail:
      "You do not need twenty tables on day one. Start with identity, content, media, and waitlists. Add jobs, audit logs, organizations, and billing only when the product needs them.",
  },
];
const starterTables = [
  {
    group: "Start now",
    items: [
      "profiles",
      "roles",
      "user_roles",
      "media_assets",
      "articles",
      "article_blocks",
      "authors",
      "categories",
      "videos",
      "solutions",
      "solution_features",
      "solution_testimonials",
      "faqs",
      "waitlist_entries",
      "site_settings",
    ],
  },
  {
    group: "Add next",
    items: ["upload_jobs", "media_derivatives", "video_playlists", "video_playlist_items", "demo_requests", "audit_logs"],
  },
  {
    group: "Add later",
    items: ["organizations", "organization_memberships", "subscriptions", "feature_flags", "usage_events"],
  },
];
const sqlModules = [
  {
    title: "1) Users, roles, and helper function",
    summary:
      "Create a clean role system first. This makes your RLS policies much easier to understand than scattering role columns across lots of tables.",
    code: `create type public.content_status as enum ('draft', 'review', 'published', 'archived');
create type public.media_status as enum ('pending', 'processing', 'ready', 'failed', 'archived');
create type public.solution_stage as enum ('concept', 'private_beta', 'early_access', 'public');
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.roles (
  id bigint generated always as identity primary key,
  slug text unique not null,
  label text not null
);
create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id bigint not null references public.roles (id) on delete cascade,
  primary key (user_id, role_id)
);
insert into public.roles (slug, label)
values
  ('admin', 'Admin'),
  ('editor', 'Editor'),
  ('analyst', 'Analyst'),
  ('beta_user', 'Beta user')
on conflict (slug) do nothing;
create or replace function public.has_role(_user_id uuid, _role text)
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
    where ur.user_id = _user_id
      and r.slug = _role
  );
$$;`,
  },
  {
    title: "2) Media assets first, then editorial content",
    summary:
      "This lets your CMS attach uploaded assets safely and keeps article records clean. Files live in Storage, but their metadata lives here.",
    code: `create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  mime_type text not null,
  size_bytes bigint,
  status public.media_status not null default 'pending',
  alt_text text,
  width integer,
  height integer,
  duration_seconds numeric(10,2),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);
create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  title text,
  bio text,
  created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  color text,
  description text
);
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  hero_media_id uuid references public.media_assets (id) on delete set null,
  author_id uuid references public.authors (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.article_blocks (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  block_type text not null,
  position integer not null,
  content_json jsonb not null default '{}'::jsonb,
  unique (article_id, position)
);`,
  },
  {
    title: "3) Videos, solutions, FAQs, and waitlists",
    summary:
      "These tables support your About page, Solutions page, product proof, and your beta lead capture funnel.",
    code: `create table public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text unique not null,
  slug text unique not null,
  title text not null,
  summary text,
  duration_label text,
  category text,
  thumbnail_media_id uuid references public.media_assets (id) on delete set null,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.solutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  stage public.solution_stage not null default 'concept',
  summary text,
  relationship_to_media text,
  demo_url text,
  screenshot_media_id uuid references public.media_assets (id) on delete set null,
  waitlist_enabled boolean not null default true,
  waitlist_count integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.solution_features (
  id uuid primary key default gen_random_uuid(),
  solution_id uuid not null references public.solutions (id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0
);
create table public.solution_testimonials (
  id uuid primary key default gen_random_uuid(),
  solution_id uuid not null references public.solutions (id) on delete cascade,
  quote text not null,
  person_name text,
  role text,
  company text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  solution_id uuid references public.solutions (id) on delete cascade,
  question text not null,
  answer text not null,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  solution_id uuid references public.solutions (id) on delete set null,
  email text not null,
  name text,
  company text,
  role text,
  source text,
  use_case text,
  utm jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  unique (solution_id, email)
);`,
  },
  {
    title: "4) Add only a thin operational layer at first",
    summary:
      "This is enough to support uploads, publishing, and forms without creating a giant backend you then have to maintain.",
    code: `create table public.upload_jobs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets (id) on delete cascade,
  job_type text not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  solution_id uuid references public.solutions (id) on delete set null,
  name text not null,
  email text not null,
  company text,
  team_size text,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);`,
  },
];
const storageBlueprint = [
  {
    bucket: "public-site",
    access: "Public",
    useFor: "Published article images, author photos, logos, and approved website assets.",
    examples: ["articles/2026/hero-story/hero.webp", "authors/jane-doe/avatar.webp", "branding/logo.svg"],
  },
  {
    bucket: "solution-media",
    access: "Public or signed",
    useFor: "Product screenshots, teaser clips, and demo visuals used on the Solutions page.",
    examples: ["orbit-desk/overview.webp", "signal-stream/demo-loop.mp4", "novus-os/dashboard.png"],
  },
  {
    bucket: "raw-uploads",
    access: "Private",
    useFor: "Fresh CMS uploads before processing or editorial approval.",
    examples: ["articles/inbox/upload-123/original.jpg", "videos/inbox/upload-456/interview.mov"],
  },
  {
    bucket: "derived-media",
    access: "Usually private",
    useFor: "Thumbnails, alternate sizes, poster frames, and generated captions.",
    examples: ["thumbs/asset-1/cover.jpg", "web/asset-1/1280w.webp", "captions/asset-1/en.vtt"],
  },
  {
    bucket: "research-private",
    access: "Private",
    useFor: "Internal source material, transcripts, PDFs, and anything that must never be public.",
    examples: ["case-files/region/report.pdf", "transcripts/source-interview.txt"],
  },
];
const rlsModules = [
  {
    title: "Profiles: users can see their own record",
    summary: "Keep profile access simple. Most users only need to read and update their own profile row.",
    code: `alter table public.profiles enable row level security;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);`,
  },
  {
    title: "Articles: public reads published, editors manage drafts",
    summary: "This is the most important pattern in the whole system. Use it again for videos and solutions.",
    code: `alter table public.articles enable row level security;
create policy "Public can read published articles"
on public.articles
for select
to anon, authenticated
using (status = 'published');
create policy "Editors and admins can create articles"
on public.articles
for insert
to authenticated
with check (
  public.has_role(auth.uid(), 'editor')
  or public.has_role(auth.uid(), 'admin')
);
create policy "Editors and admins can update articles"
on public.articles
for update
to authenticated
using (
  public.has_role(auth.uid(), 'editor')
  or public.has_role(auth.uid(), 'admin')
)
with check (
  public.has_role(auth.uid(), 'editor')
  or public.has_role(auth.uid(), 'admin')
);`,
  },
  {
    title: "Waitlists: no direct public inserts",
    summary: "This is where many Supabase projects get messy. Keep public forms behind Edge Functions and let service_role handle inserts after validation.",
    code: `alter table public.waitlist_entries enable row level security;
create policy "Admins can read waitlist entries"
on public.waitlist_entries
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update waitlist entries"
on public.waitlist_entries
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));
-- Intentionally do not create an anon insert policy here.
-- submit-waitlist Edge Function validates input and inserts with service_role.`,
  },
  {
    title: "Storage: editors upload to private staging, public only reads approved buckets",
    summary: "This keeps original uploads private and stops unpublished media from leaking through predictable URLs.",
    code: `create policy "Editors can upload raw assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'raw-uploads'
  and (
    public.has_role(auth.uid(), 'editor')
    or public.has_role(auth.uid(), 'admin')
  )
);
create policy "Editors can read raw assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'raw-uploads'
  and (
    public.has_role(auth.uid(), 'editor')
    or public.has_role(auth.uid(), 'admin')
  )
);
create policy "Public can read approved site assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('public-site', 'solution-media'));`,
  },
];
const edgeFunctionPlan = [
  {
    name: "submit-waitlist",
    when: "Build first",
    receives: "solutionSlug, email, name, company, role, useCase, utm",
    writes: "waitlist_entries, optional waitlist counter update, notifications",
    reason: "Prevents spam and duplicate signups while keeping your product waitlist data clean.",
  },
  {
    name: "submit-demo-request",
    when: "Build first",
    receives: "solutionSlug, name, email, company, teamSize, notes",
    writes: "demo_requests, CRM/webhook notification",
    reason: "Separates high-intent sales conversations from general waitlist interest.",
  },
  {
    name: "create-signed-upload",
    when: "Build first",
    receives: "filename, mimeType, targetBucket, sizeHint",
    writes: "returns signed upload instructions only",
    reason: "Lets the browser upload large files directly to Storage instead of routing them through your website server.",
  },
  {
    name: "finalize-upload",
    when: "Build first",
    receives: "bucket, path, mimeType, size, width, height, duration",
    writes: "media_assets, upload_jobs",
    reason: "Creates the database record that your CMS can safely attach to content entries.",
  },
  {
    name: "sync-youtube-channel",
    when: "Build next",
    receives: "manual admin action or cron invocation",
    writes: "videos, playlist metadata, thumbnails",
    reason: "Keeps the About page and channel promotion area current without manual copy and paste.",
  },
  {
    name: "publish-scheduled-content",
    when: "Build next",
    receives: "cron trigger",
    writes: "articles, videos, solutions status transitions + audit log",
    reason: "Automates publishing when publish_at is reached.",
  },
];
const cmsCollections = [
  {
    title: "Articles collection",
    fields: [
      "title, slug, excerpt, status, seo_title, seo_description",
      "author, category, hero_media, published_at",
      "ordered blocks: paragraph, quote, image, embed, CTA",
      "homepage flags: featured, trending, editor_pick",
    ],
    mapsTo: "articles + article_blocks + authors + categories + media_assets",
  },
  {
    title: "Videos collection",
    fields: [
      "youtube_id, title, slug, summary, duration_label",
      "thumbnail_media, category, featured toggle, published_at",
      "playlist assignment if you add playlists later",
    ],
    mapsTo: "videos (+ video_playlists later if needed)",
  },
  {
    title: "Solutions collection",
    fields: [
      "name, slug, stage, summary, relationship_to_media",
      "primary screenshot, demo_url, waitlist_enabled, waitlist_count",
      "repeatable features, testimonials, metrics, FAQs",
    ],
    mapsTo: "solutions + solution_features + solution_testimonials + faqs",
  },
  {
    title: "Waitlist / leads view",
    fields: [
      "solution, email, name, company, role, source, use_case",
      "status, created_at, UTM data",
      "admin-only notes if you need manual follow-up",
    ],
    mapsTo: "waitlist_entries (+ demo_requests for sales-led flows)",
  },
  {
    title: "Site settings collection",
    fields: [
      "social links, YouTube channel URL, footer content",
      "newsletter CTA, trust bar copy, featured homepage slots",
      "global SEO defaults and contact metadata",
    ],
    mapsTo: "site_settings",
  },
];
const rolloutChecklist = [
  "Create the enum types, profiles, roles, and user_roles tables first.",
  "Add media_assets before you wire the CMS to uploads.",
  "Create articles, article_blocks, videos, solutions, faqs, and waitlist_entries.",
  "Enable RLS table by table — do not switch it on everywhere blindly.",
  "Build submit-waitlist and create-signed-upload Edge Functions before public launch.",
  "Keep raw-uploads private and expose only approved files through public-site or solution-media.",
  "Only add audit_logs, upload_jobs, and playlist tables once the core publishing flow feels stable.",
];
function CodeCard({ title, summary, code }: { title: string; summary: string; code: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
      <h4 className="text-xl md:text-2xl font-black text-white mb-3">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed mb-5">{summary}</p>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/60">
        <pre className="min-w-[680px] p-5 text-[12px] leading-6 text-gray-300 font-mono whitespace-pre-wrap">{code}</pre>
      </div>
    </div>
  );
}
export default function SupabaseBlueprintSection() {
  return (
    <section id="sql-rls-blueprint" className="relative py-24 bg-black">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_10%,rgba(220,38,38,0.16),transparent_26%),radial-gradient(circle_at_84%_16%,rgba(255,255,255,0.05),transparent_18%),radial-gradient(circle_at_62%_82%,rgba(220,38,38,0.1),transparent_30%)]" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mb-14">
          <p className="text-red-500 text-xs font-bold tracking-[0.22em] uppercase mb-4">SQL + RLS Starter Blueprint</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-5">
            A real Supabase setup you can actually build
          </h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            This section is intentionally beginner-friendly. It shows the minimum viable database shape, the bucket layout, the RLS patterns,
            the Edge Functions to build first, and how your CMS should map onto Supabase without turning into a fragile tangle.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {starterPrinciples.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-red-600/10 p-6 md:p-8 mb-16">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Recommended table order</p>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                You do not need to build everything at once
              </h3>
              <p className="text-gray-300 leading-relaxed">
                If Supabase is not your forte, the easiest win is sequencing. Build the small, stable core first, then add operational tables
                only when they solve a real problem.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {starterTables.map((group) => (
                <div key={group.group} className="rounded-2xl border border-white/10 bg-black/35 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-red-300 mb-3">{group.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-gray-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-16">
          <div className="max-w-3xl mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Starter SQL schema</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Use these as your first migrations, then adapt them to your CMS
            </h3>
            <p className="text-gray-400 leading-relaxed">
              These are not meant to be your forever schema. They are meant to give you a clean, understandable baseline you can evolve.
            </p>
          </div>
          <div className="space-y-6">
            {sqlModules.map((module) => (
              <CodeCard key={module.title} title={module.title} summary={module.summary} code={module.code} />
            ))}
          </div>
        </div>
        <div className="mb-16">
          <div className="max-w-3xl mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Storage buckets</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Keep unpublished files private and only publish approved derivatives
            </h3>
            <p className="text-gray-400 leading-relaxed">
              This is the simplest discipline that stops a media site from becoming chaotic. Raw uploads go private. Clean assets go public.
            </p>
          </div>
          <div className="grid xl:grid-cols-5 md:grid-cols-2 gap-4">
            {storageBlueprint.map((bucket) => (
              <div key={bucket.bucket} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-red-300 mb-2">{bucket.access}</p>
                  <h4 className="text-lg font-black text-white">{bucket.bucket}</h4>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{bucket.useFor}</p>
                <div className="space-y-2">
                  {bucket.examples.map((example) => (
                    <div key={example} className="rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-[11px] text-gray-300 font-mono break-all">
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-16">
          <div className="max-w-3xl mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">RLS policy templates</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Copy the pattern, not just the code
            </h3>
            <p className="text-gray-400 leading-relaxed">
              The main idea is simple: public can only read published content, editors/admins can work on drafts, and public forms should not get
              direct insert access.
            </p>
          </div>
          <div className="space-y-6">
            {rlsModules.map((module) => (
              <CodeCard key={module.title} title={module.title} summary={module.summary} code={module.code} />
            ))}
          </div>
        </div>
        <div className="mb-16 grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Edge Functions to build first</p>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-5">Let functions handle public writes and upload orchestration</h3>
            <div className="space-y-4">
              {edgeFunctionPlan.map((fn) => (
                <div key={fn.name} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="text-lg font-black text-white">{fn.name}</h4>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-red-300 rounded-full border border-red-500/30 px-2.5 py-1">
                      {fn.when}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="text-gray-500">Receives:</span> {fn.receives}</p>
                    <p><span className="text-gray-500">Writes:</span> {fn.writes}</p>
                    <p className="text-gray-400 leading-relaxed">{fn.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-red-600/10 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Beginner-safe rollout</p>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-5">The order I would personally follow</h3>
            <ul className="space-y-3 text-sm text-gray-300 leading-relaxed">
              {rolloutChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="max-w-3xl mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">CMS ↔ Supabase mapping</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Think of the CMS as the editor interface, not the database itself
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Your CMS should edit these content models, while Supabase remains the source of truth for storage, permissions, and structured data.
            </p>
          </div>
          <div className="grid xl:grid-cols-5 md:grid-cols-2 gap-4">
            {cmsCollections.map((collection) => (
              <div key={collection.title} className="rounded-2xl border border-white/10 bg-black/35 p-5">
                <h4 className="text-lg font-black text-white mb-3">{collection.title}</h4>
                <ul className="space-y-2 text-sm text-gray-300 mb-4">
                  {collection.fields.map((field) => (
                    <li key={field} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-red-300">
                  {collection.mapsTo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
