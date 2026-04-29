# Frontend Audit & Launch Checklist (Headless CMS Focus)

This checklist prepares the frontend to integrate with the Supabase headless CMS and Edge Functions, ensuring a production-ready launch.

## 1. Data Fetching & CMS Integration (The "Headless" Shift)
- [ ] **Create a Supabase Client:** Initialize the Supabase JS client in a `lib/supabase.ts` file to connect the frontend to the database.
- [ ] **Replace Hardcoded Articles:** Update `Articles.tsx` (and related components) to fetch from the `articles` and `authors` tables.
- [ ] **Replace Hardcoded Solutions/Products:** Update `SolutionsSection.tsx` to fetch from the `solutions` and `solution_features` tables.
- [ ] **Replace Hardcoded FAQs:** Update the FAQ sections to pull from the `faqs` table.
- [ ] **Implement Loading States:** Add "skeleton loaders" or spinners so the site doesn't look broken while fetching data.
- [ ] **Implement Error Handling:** Add fallback UI in case the CMS is unreachable or a query fails.

## 2. Dynamic Routing (Pages for CMS Content)
- [ ] **Setup React Router:** Ensure `react-router-dom` is fully configured for dynamic pages.
- [ ] **Dynamic Article Pages (`/articles/:slug`):** Create a page template that reads the URL slug, fetches the specific article and its `article_blocks` from the CMS, and renders the full post.
- [ ] **Dynamic Solution Pages (`/solutions/:slug`):** Create a page template for individual SaaS products or solutions.
- [ ] **404 / Not Found Page:** Create a graceful fallback page for when a user navigates to a CMS slug that doesn't exist or was unpublished.

## 3. Wiring Up Interactive Forms (Connecting to Edge Functions)
- [ ] **Waitlist Form:** Wire the email input to call the `submit-waitlist` Edge Function.
- [ ] **Contact / Demo Form:** Wire `Contact.tsx` to call the `submit-demo-request` Edge Function.
- [ ] **Form State UI:** Add visual feedback for the user (disable submit while loading, show success/error messages).

## 4. Media & Asset Management
- [ ] **Update Image Sources:** Change frontend `<img>` tags to use the public URLs from the Supabase `public-site` and `solution-media` buckets.
- [ ] **Image Optimization:** Ensure we are using the `width` and `height` properties returned by the CMS to prevent layout shift (Cumulative Layout Shift) as images load.

## 5. SEO & Metadata (Crucial for CMS Sites)
- [ ] **Dynamic Meta Tags:** Implement a library like `react-helmet-async` so that when a user clicks an article, the `<title>` and `<meta name="description">` tags update in the browser's `<head>` to match the CMS data.

## 6. UI Refinements
- [ ] **Pending UI Updates:** Review and refine UI elements that need adjustment (as noted at the end of the previous session).
