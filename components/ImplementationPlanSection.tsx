import { useState } from "react";

const foundationPillars = [
  {
    title: "Keep Supabase as the core",
    detail:
      "Use Supabase Postgres, Auth, Storage, and Edge Functions as the shared backend for both the website and your CMS. The goal is structure, not a rebuild.",
  },
  {
    title: "Use Edge Functions as the gatekeeper",
    detail:
      "Public forms, waitlists, demo requests, and signed upload creation should go through server-side functions rather than direct anonymous database writes.",
  },
  {
    title: "Treat media as a pipeline",
    detail:
      "Upload files to Storage, track them in Postgres, process them, then let the CMS publish only assets that are marked ready.",
  },
];
const tableDomains = [
  {
    domain: "Editorial content",
    guidance: "Start here. These tables power the public site and CMS publishing workflow.",
    tables: [
      {
        name: "articles",
        phase: "Now",
        purpose: "Core article record with status, SEO metadata, hero media, and publish timing.",
        fields: ["id", "slug", "title", "excerpt", "status", "hero_media_id", "author_id", "published_at"],
      },
      {
        name: "article_blocks",
        phase: "Now",
        purpose: "Flexible long-form body content for paragraph, quote, image, embed, pull-stat, and CTA blocks.",
        fields: ["id", "article_id", "block_type", "position", "content_json"],
      },
      {
        name: "authors",
        phase: "Now",
        purpose: "Author profile, role, bio, headshot, and social links for bylines and author pages.",
        fields: ["id", "name", "slug", "title", "bio", "avatar_media_id"],
      },
      {
        name: "categories",
        phase: "Now",
        purpose: "Top-level content grouping for sections like Geopolitics, Intelligence, Markets, and Analysis.",
        fields: ["id", "name", "slug", "color", "description"],
      },
      {
        name: "tags",
        phase: "Now",
        purpose: "Fine-grained article labels used for search, recommendations, and archives.",
        fields: ["id", "name", "slug"],
      },
      {
        name: "article_tags",
        phase: "Now",
        purpose: "Join table connecting articles and tags.",
        fields: ["article_id", "tag_id"],
      },
    ],
  },
  {
    domain: "Video and channel promotion",
    guidance: "Useful for your About page and YouTube-led discovery funnel.",
    tables: [
      {
        name: "videos",
        phase: "Now",
        purpose: "Stores YouTube video metadata, featured flags, categories, summaries, and ordering.",
        fields: ["id", "youtube_id", "title", "slug", "summary", "thumbnail_media_id", "is_featured", "published_at"],
      },
      {
        name: "video_playlists",
        phase: "Now",
        purpose: "CMS-controlled collections like Featured Investigations, Weekly Breakdown, or Trending Now.",
        fields: ["id", "name", "slug", "description"],
      },
      {
        name: "video_playlist_items",
        phase: "Now",
        purpose: "Ordered relation between videos and playlists.",
        fields: ["playlist_id", "video_id", "position"],
      },
    ],
  },
  {
    domain: "Solutions and conversion",
    guidance: "These tables support the SaaS ecosystem pages, social proof, FAQs, and beta funnels.",
    tables: [
      {
        name: "solutions",
        phase: "Now",
        purpose: "Main SaaS product record with stage, summary, demo URL, waitlist settings, and primary screenshot.",
        fields: ["id", "name", "slug", "stage", "summary", "demo_url", "screenshot_media_id", "waitlist_count"],
      },
      {
        name: "solution_features",
        phase: "Now",
        purpose: "Structured feature bullets or modules displayed on each solution card or detail page.",
        fields: ["id", "solution_id", "title", "description", "position"],
      },
      {
        name: "solution_testimonials",
        phase: "Now",
        purpose: "Early user feedback, beta quotes, names, roles, companies, and trust indicators.",
        fields: ["id", "solution_id", "quote", "person_name", "role", "company", "is_featured"],
      },
      {
        name: "faqs",
        phase: "Now",
        purpose: "Reusable FAQs for the ecosystem, products, platform relationship, and onboarding questions.",
        fields: ["id", "scope", "question", "answer", "position", "is_published"],
      },
      {
        name: "waitlist_entries",
        phase: "Now",
        purpose: "Captures public beta interest for each solution and stores source attribution.",
        fields: ["id", "solution_id", "email", "name", "company", "role", "source", "status"],
      },
      {
        name: "demo_requests",
        phase: "Next",
        purpose: "Higher-intent product leads where a team wants a walkthrough, pricing, or enterprise follow-up.",
        fields: ["id", "solution_id", "name", "email", "company", "team_size", "notes", "status"],
      },
    ],
  },
  {
    domain: "Media operations and uploads",
    guidance: "These tables let you scale uploads without letting the CMS become messy.",
    tables: [
      {
        name: "media_assets",
        phase: "Now",
        purpose: "Single source of truth for any file in Storage, including bucket, path, mime type, owner, and processing state.",
        fields: ["id", "bucket", "path", "mime_type", "size_bytes", "status", "width", "height", "duration_seconds"],
      },
      {
        name: "media_derivatives",
        phase: "Next",
        purpose: "Tracks generated thumbnails, compressed variants, poster frames, and alternate sizes.",
        fields: ["id", "asset_id", "kind", "bucket", "path", "status"],
      },
      {
        name: "upload_jobs",
        phase: "Now",
        purpose: "Job tracking for file ingestion, processing, retries, and human review states.",
        fields: ["id", "asset_id", "job_type", "status", "attempts", "last_error", "started_at", "completed_at"],
      },
      {
        name: "site_settings",
        phase: "Now",
        purpose: "Global CMS-driven settings such as social links, YouTube channel URL, trust statements, and footer content.",
        fields: ["id", "key", "value_json", "updated_at"],
      },
      {
        name: "audit_logs",
        phase: "Next",
        purpose: "Records who changed what in the CMS, especially for publishing, asset replacement, and product updates.",
        fields: ["id", "actor_user_id", "entity_type", "entity_id", "action", "payload_json", "created_at"],
      },
    ],
  },
  {
    domain: "Access and future SaaS accounts",
    guidance: "You may not need all of this immediately, but this is the clean path when products mature.",
    tables: [
      {
        name: "profiles",
        phase: "Now",
        purpose: "One row per authenticated user, synced to auth.users with display name and internal metadata.",
        fields: ["id", "email", "full_name", "avatar_media_id", "is_active"],
      },
      {
        name: "roles",
        phase: "Now",
        purpose: "List of app roles such as admin, editor, analyst, moderator, and beta_user.",
        fields: ["id", "slug", "label"],
      },
      {
        name: "user_roles",
        phase: "Now",
        purpose: "Maps users to one or more roles instead of overloading a single role column.",
        fields: ["user_id", "role_id"],
      },
      {
        name: "organizations",
        phase: "Later",
        purpose: "Needed once SaaS products support team accounts, agency clients, or enterprise workspaces.",
        fields: ["id", "name", "slug", "plan", "status"],
      },
      {
        name: "organization_memberships",
        phase: "Later",
        purpose: "Connects users to organizations with product-specific permissions.",
        fields: ["organization_id", "user_id", "role", "joined_at"],
      },
      {
        name: "subscriptions",
        phase: "Later",
        purpose: "Tracks plan, billing status, trial period, and entitlements when the products go commercial.",
        fields: ["id", "organization_id", "provider", "plan", "status", "current_period_end"],
      },
    ],
  },
];
const storageBuckets = [
  {
    name: "public-site",
    access: "Public read",
    purpose: "Published website images and optimized assets that can safely be cached at the edge.",
    paths: ["articles/2026/04/slug/hero.webp", "authors/jane-doe/avatar.webp", "branding/logo-mark.svg"],
  },
  {
    name: "solution-media",
    access: "Public read or signed read",
    purpose: "Screenshots, teaser clips, and product demo images used on the Solutions page.",
    paths: ["orbit-desk/hero-shot.webp", "signal-stream/demo-loop.mp4", "novus-os/cards/dashboard.png"],
  },
  {
    name: "raw-uploads",
    access: "Private",
    purpose: "Original editor uploads before they are reviewed, processed, and moved into publishable paths.",
    paths: ["articles/inbox/upload-uuid/original.jpg", "videos/inbox/upload-uuid/interview.mov"],
  },
  {
    name: "research-private",
    access: "Private",
    purpose: "Sensitive documents, interview notes, transcripts, or reference materials that should never be public.",
    paths: ["case-files/region/report.pdf", "transcripts/source-interview.txt"],
  },
  {
    name: "derived-media",
    access: "Private or public by path",
    purpose: "Generated thumbnails, poster frames, compressed image sizes, and processing outputs.",
    paths: ["thumbs/asset-id/cover.jpg", "web/asset-id/1280w.webp", "captions/asset-id/en.vtt"],
  },
];
const roleBlueprint = [
  {
    role: "public",
    access: "Can read only published articles, published videos, published solutions, public FAQs, and public assets.",
  },
  {
    role: "authenticated",
    access: "Base logged-in state. Should not automatically grant editorial access. Use it only as a starting point for internal users or product users.",
  },
  {
    role: "editor",
    access: "Can create and update drafts, upload media, manage blocks, and edit product copy — but should not have full destructive access everywhere.",
  },
  {
    role: "admin",
    access: "Can publish, unpublish, manage roles, view all waitlists, review private uploads, and access audit logs.",
  },
  {
    role: "service_role",
    access: "Reserved for Edge Functions, cron jobs, and trusted backend automation. Never expose this in the browser.",
  },
];
const policyRules = [
  {
    title: "Never allow anonymous direct inserts into sensitive tables",
    detail:
      "Waitlists, demo requests, contact forms, and upload job records should be written through Edge Functions. This avoids spam, makes rate-limiting easier, and lets you enrich the data safely.",
  },
  {
    title: "Public reads should always filter by published state",
    detail:
      "RLS for articles, videos, solutions, and FAQs should only expose rows where status is published or is_published is true. Drafts stay invisible by default.",
  },
  {
    title: "Editors should update only what they are responsible for",
    detail:
      "At minimum, allow editors to manage draft content. If you want stronger control later, add owner_id or assigned_editor_id and scope edits to that user.",
  },
  {
    title: "Storage should mirror database policy",
    detail:
      "Editors can upload into private staging buckets. Public visitors should only read assets from explicitly public buckets or signed URLs created server-side.",
  },
  {
    title: "Use helper functions for role checks",
    detail:
      "Create a Postgres helper like has_role(auth.uid(), 'admin') so your policies stay readable and consistent across tables.",
  },
];
const edgeFunctions = [
  {
    name: "submit-waitlist",
    stage: "Build now",
    trigger: "Public form submit",
    purpose: "Validate payload, deduplicate by email + solution, write to waitlist_entries, increment summary counters, and send notifications.",
  },
  {
    name: "submit-demo-request",
    stage: "Build now",
    trigger: "Solutions CTA or enterprise form",
    purpose: "Capture high-intent leads, attach source metadata, and route the request to CRM, email, or Slack.",
  },
  {
    name: "create-signed-upload",
    stage: "Build now",
    trigger: "CMS upload action",
    purpose: "Returns a signed upload target so the browser can send large files directly to Storage without passing through the website server.",
  },
  {
    name: "finalize-upload",
    stage: "Build now",
    trigger: "Upload complete callback",
    purpose: "Creates media_assets and upload_jobs rows, validates mime type and size, and marks the asset as pending review or processing.",
  },
  {
    name: "process-media",
    stage: "Build next",
    trigger: "Storage event or job queue",
    purpose: "Generates thumbnails, derived versions, poster frames, or metadata extraction results and updates media_derivatives.",
  },
  {
    name: "publish-scheduled-content",
    stage: "Build next",
    trigger: "Cron schedule",
    purpose: "Moves scheduled articles, videos, or solution announcements from ready to published when publish_at is reached.",
  },
  {
    name: "sync-youtube-channel",
    stage: "Build next",
    trigger: "Manual admin action or scheduled sync",
    purpose: "Pulls your latest YouTube metadata into the videos table so the About page playlist stays fresh without manual copy-paste.",
  },
  {
    name: "notify-team",
    stage: "Build next",
    trigger: "Publish event, waitlist threshold, failed upload",
    purpose: "Sends Slack, email, or webhook alerts when something important happens inside the CMS or product funnel.",
  },
];
const cmsModels = [
  {
    title: "Article model",
    description: "Use a modular article editor instead of one giant HTML field.",
    fields: [
      "title, slug, excerpt, status, seo_title, seo_description",
      "hero_media_id, category_id, author_id, published_at",
      "article_blocks[] with ordered content sections",
      "featured flags for homepage, trending, or editor's pick",
    ],
  },
  {
    title: "Video model",
    description: "Treat videos as CMS entries with YouTube as the delivery layer.",
    fields: [
      "youtube_id, title, slug, summary, duration_label",
      "thumbnail_media_id, playlist membership, is_featured",
      "published_at, category, source channel metadata",
    ],
  },
  {
    title: "Solution model",
    description: "Each product should be editable like a launch page, not just a small card.",
    fields: [
      "name, slug, stage, summary, relationship_to_media",
      "primary screenshot, demo_url, CTA labels, waitlist_enabled",
      "feature modules, metrics, testimonials, FAQs",
      "seo fields and product-specific social proof counts",
    ],
  },
  {
    title: "Waitlist model",
    description: "Keep lead capture structured so it can feed onboarding later.",
    fields: [
      "solution_id, name, email, company, role",
      "use_case, source, consent_version, status",
      "utm params and created_at for attribution",
    ],
  },
  {
    title: "FAQ model",
    description: "One reusable FAQ table can power product pages, architecture pages, and the footer help area.",
    fields: [
      "scope (global, solution, architecture)",
      "question, answer, position, is_published",
    ],
  },
  {
    title: "Site settings model",
    description: "Keep global website content in CMS instead of hardcoding it into components.",
    fields: [
      "youtube_channel_url, social links, trust bar text",
      "featured article slot, newsletter CTA, footer columns",
      "default SEO image and contact metadata",
    ],
  },
];
const implementationChecklist = [
  {
    label: "Week 1",
    items: [
      "Create or confirm the core tables: articles, article_blocks, videos, solutions, faqs, waitlist_entries, media_assets, profiles, roles, user_roles.",
      "Split Storage into public-site, solution-media, raw-uploads, and research-private buckets.",
      "Add basic RLS: public can read published rows; admins and editors can manage drafts according to role.",
    ],
  },
  {
    label: "Week 2",
    items: [
      "Build Edge Functions for submit-waitlist, submit-demo-request, create-signed-upload, and finalize-upload.",
      "Move public forms away from direct browser inserts and through server-side validation.",
      "Update the CMS so uploaded assets create media_assets records before editors can attach them to content.",
    ],
  },
  {
    label: "Weeks 3–4",
    items: [
      "Add upload_jobs and processing states: pending, processing, ready, failed.",
      "Add scheduled publishing and YouTube sync if the About page should stay current automatically.",
      "Create dashboards for waitlist growth, failed uploads, and most-viewed content.",
    ],
  },
];
export default function ImplementationPlanSection() {
  return (
    <section id="implementation-plan" className="relative py-24 bg-black">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_8%,rgba(220,38,38,0.12),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.05),transparent_20%),radial-gradient(circle_at_65%_78%,rgba(220,38,38,0.08),transparent_30%)]" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mb-14">
          <p className="text-red-500 text-xs font-bold tracking-[0.22em] uppercase mb-4">Supabase Implementation Plan</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-5">
            The practical blueprint behind the platform
          </h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            This is the real-world version of the roadmap: what tables to create, how Storage should be structured, where RLS belongs,
            which Edge Functions to build, and how your CMS should model content for articles, videos, solutions, and waitlists.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {foundationPillars.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mb-16">
          <div className="max-w-3xl mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Suggested database tables</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Think in domains, even if you keep everything in the public schema at first
            </h3>
            <p className="text-gray-400 leading-relaxed">
              To keep the project manageable, you can start with clear table names inside the default public schema. If the system grows,
              you can later separate domains into dedicated schemas without changing the overall model.
            </p>
          </div>
          <div className="space-y-6">
            {tableDomains.map((domain) => (
              <div key={domain.domain} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                <div className="mb-6 max-w-3xl">
                  <p className="text-xs uppercase tracking-[0.18em] text-red-300 mb-2">{domain.domain}</p>
                  <p className="text-gray-400 leading-relaxed">{domain.guidance}</p>
                </div>
                <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-4">
                  {domain.tables.map((table) => (
                    <div key={table.name} className="rounded-2xl border border-white/10 bg-black/40 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="text-lg font-black text-white">{table.name}</h4>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mt-1">Suggested table</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-red-300 rounded-full border border-red-500/30 px-2.5 py-1">
                          {table.phase}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4">{table.purpose}</p>
                      <div className="flex flex-wrap gap-2">
                        {table.fields.map((field) => (
                          <span
                            key={field}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-gray-300"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-16">
          <div className="max-w-3xl mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Storage bucket structure</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Keep raw uploads private. Publish only approved derivatives.
            </h3>
            <p className="text-gray-400 leading-relaxed">
              This is the simplest way to avoid a cluttered asset library. Raw files go into private staging. Approved website assets live in
              a clean public bucket. Anything sensitive stays private forever.
            </p>
          </div>
          <div className="grid xl:grid-cols-5 md:grid-cols-2 gap-4">
            {storageBuckets.map((bucket) => (
              <div key={bucket.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-red-300 mb-2">{bucket.access}</p>
                  <h4 className="text-lg font-black text-white">{bucket.name}</h4>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{bucket.purpose}</p>
                <div className="space-y-2">
                  {bucket.paths.map((path) => (
                    <div key={path} className="rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-[11px] text-gray-300 font-mono break-all">
                      {path}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 mb-16">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Recommended roles</p>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-5">RLS starts with role discipline</h3>
            <div className="space-y-4">
              {roleBlueprint.map((role) => (
                <div key={role.role} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-red-300 mb-2">{role.role}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{role.access}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-red-600/10 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Policy recommendations</p>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-5">The guardrails I would put in place immediately</h3>
            <div className="space-y-4">
              {policyRules.map((rule) => (
                <div key={rule.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <h4 className="text-white font-bold mb-2">{rule.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{rule.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-16">
          <div className="max-w-3xl mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Edge Function list</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Start with the functions that remove risk and manual work
            </h3>
            <p className="text-gray-400 leading-relaxed">
              These functions let you keep the frontend simple and stop sensitive workflows from relying on direct client access.
            </p>
          </div>
          <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4">
            {edgeFunctions.map((fn) => (
              <div key={fn.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="text-lg font-black text-white">{fn.name}</h4>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-red-300 rounded-full border border-red-500/30 px-2.5 py-1">
                    {fn.stage}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">{fn.trigger}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{fn.purpose}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-16">
          <div className="max-w-3xl mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">CMS content model</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Model content so the website can be driven by data instead of hardcoded copy
            </h3>
            <p className="text-gray-400 leading-relaxed">
              If these models exist in the CMS, the frontend can gradually shift from static arrays to live queries without redesigning the site.
            </p>
          </div>
          <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-4">
            {cmsModels.map((model) => (
              <div key={model.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h4 className="text-xl font-black text-white mb-2">{model.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{model.description}</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  {model.fields.map((field) => (
                    <li key={field} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-red-600/10 p-6 md:p-8">
          <div className="max-w-3xl mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Immediate action plan</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              What I would do over the next four weeks
            </h3>
            <p className="text-gray-300 leading-relaxed">
              If you follow this order, you will end up with a cleaner content system, safer public forms, a better upload pipeline, and a
              backend that is ready for both media publishing and early-stage SaaS products.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {implementationChecklist.map((phase) => (
              <div key={phase.label} className="rounded-2xl border border-white/10 bg-black/35 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-red-300 mb-3">{phase.label}</p>
                <ul className="space-y-3 text-sm text-gray-300 leading-relaxed">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
