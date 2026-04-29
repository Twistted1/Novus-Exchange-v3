# Supabase Edge Functions for Novus Exchange
These functions cover the first real backend flows for your CMS + website stack:
- `submit-waitlist`
- `submit-demo-request`
- `create-signed-upload`
- `finalize-upload`
- `process-media`
## What each function does
### `submit-waitlist`
Public-facing form handler.
- validates payload
- blocks simple bot submissions with a honeypot field
- inserts into `waitlist_entries`
- updates `solutions.waitlist_count`
- writes an audit log
### `submit-demo-request`
Public-facing demo request handler.
- validates payload
- optionally links the request to a published solution
- inserts into `demo_requests`
- writes an audit log
### `create-signed-upload`
Editorial-only upload starter.
- requires logged-in editor/admin
- creates a signed upload URL for Storage
- creates a `media_assets` row in `pending`
- returns the upload token/path for the frontend
### `finalize-upload`
Editorial-only upload finisher.
- verifies the uploaded object exists
- updates the `media_assets` row with file info
- marks the asset `ready` or queues it as `processing`
- creates an `upload_jobs` row when processing is needed
### `process-media`
Internal/editor worker scaffold.
- consumes pending `upload_jobs`
- verifies Storage objects exist
- marks assets `ready`
- writes audit logs
- can later be extended for thumbnails/transcoding/OCR
## Folder structure
```txt
supabase/functions/
  _shared/
    auth.ts
    cors.ts
    supabase.ts
    validators.ts
  submit-waitlist/index.ts
  submit-demo-request/index.ts
  create-signed-upload/index.ts
  finalize-upload/index.ts
  process-media/index.ts
```
## Local setup
If you do not already have a Supabase config in this repository, initialize it once:
```bash
supabase init
```
Copy the example env file and fill in your values:
```bash
cp supabase/functions/.env.example supabase/functions/.env
```
Then serve the functions locally:
```bash
supabase start
supabase functions serve --env-file supabase/functions/.env
```
## Deploy
Deploy all functions:
```bash
supabase functions deploy submit-waitlist
supabase functions deploy submit-demo-request
supabase functions deploy create-signed-upload
supabase functions deploy finalize-upload
supabase functions deploy process-media
```
Or deploy everything at once:
```bash
supabase functions deploy
```
## Auth model
### Public functions
These should be called from the website with your anon/publishable key in the Authorization header:
- `submit-waitlist`
- `submit-demo-request`
### Editorial functions
These require a logged-in Supabase user with the `editor` or `admin` role:
- `create-signed-upload`
- `finalize-upload`
### Internal worker
`process-media` can be called in either of two ways:
- with a logged-in editor/admin JWT
- with `x-internal-token` matching `INTERNAL_API_SECRET`
## Example payloads
### Waitlist
```json
{
  "email": "hello@example.com",
  "fullName": "Alex Founder",
  "organization": "Novus Labs",
  "solutionSlug": "orbit-desk",
  "source": "solutions-page"
}
```
### Demo request
```json
{
  "email": "alex@example.com",
  "fullName": "Alex Founder",
  "organization": "Novus Labs",
  "roleTitle": "Editor in Chief",
  "teamSize": "11-50",
  "message": "We want to test this with our editorial team.",
  "solutionSlug": "signal-stream"
}
```
### Create signed upload
```json
{
  "fileName": "hero-shot.png",
  "contentType": "image/png",
  "bucketName": "raw-uploads",
  "folder": "solutions/orbit-desk",
  "visibility": "private",
  "altText": "Platform dashboard screenshot"
}
```
### Finalize upload
```json
{
  "assetId": "YOUR-ASSET-UUID",
  "altText": "Platform dashboard screenshot",
  "caption": "Orbit Desk analyst overview",
  "forceProcessing": true,
  "requestedDerivatives": ["thumbnail", "webp"]
}
```
### Process media
```json
{
  "limit": 10
}
```
## Recommended next step after this
Once these are deployed, the next useful move is wiring your React frontend/CMS to:
1. submit real waitlist/demo forms to these functions
2. use `create-signed-upload` + `finalize-upload` inside your CMS media flow
3. trigger `process-media` on a schedule or via webhook
