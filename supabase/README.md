# Supabase setup guide for Novus Exchange
This folder contains a beginner-friendly starter schema for your CMS + website stack.
## Files
- `migrations/202604100001_core_schema.sql`
  - creates enums, tables, indexes, triggers
  - creates a profile automatically when a new auth user is created
- `migrations/202604100002_rls_and_storage.sql`
  - creates Storage buckets
  - enables Row Level Security
  - adds starter policies for public content, editors, and admins
## Recommended order
Run the SQL files in this exact order:
1. `202604100001_core_schema.sql`
2. `202604100002_rls_and_storage.sql`
You can do this in either of two ways:
### Option 1: Supabase SQL Editor
Paste each file into the SQL Editor and run them one at a time.
### Option 2: Supabase CLI
If you use the CLI later, place these in your Supabase project and run your migrations normally.
## First admin setup
After you create your own login in Supabase Auth, find your user id:
```sql
select id, email, created_at
from auth.users
order by created_at desc;
```
Then assign yourself the `admin` role:
```sql
insert into public.user_roles (user_id, role_id)
select 'YOUR-USER-UUID', id
from public.roles
where slug = 'admin'
on conflict do nothing;
```
To assign an editor instead:
```sql
insert into public.user_roles (user_id, role_id)
select 'YOUR-USER-UUID', id
from public.roles
where slug = 'editor'
on conflict do nothing;
```
## How this is intended to work
### Public website
The public site should only read:
- published articles
- published videos
- published solutions
- published FAQs
- public-ready media assets
- public site settings
### CMS / editorial users
Editors and admins can:
- create drafts
- upload media
- manage solutions
- review waitlist/demo requests
- edit FAQs and videos
### Public form submissions
Do **not** insert waitlist/demo requests directly from the browser with the anon key.
Use an **Edge Function** instead:
- validate payload
- rate limit if needed
- write with the service role
- optionally notify Slack/email
## Suggested next implementation order
### Week 1
- run both SQL files
- create your first admin user
- confirm you can log in and query your own profile
- add one test article, one test solution, one FAQ
### Week 2
- connect your CMS collections to these tables
- switch public reads to `published` rows only
- move website images into the new buckets
### Week 3
- add Edge Functions:
  - `submit-waitlist`
  - `submit-demo-request`
  - `create-signed-upload`
  - `finalize-upload`
### Week 4
- add audit logging
- add scheduled publishing
- add YouTube sync if needed
## Important notes
- Keep secrets out of `site_settings`
- Keep raw uploads private
- Only expose approved, ready assets publicly
- Start simple: you do **not** need extra infrastructure yet
- If you hit search or media-processing bottlenecks later, that is when you add more service
