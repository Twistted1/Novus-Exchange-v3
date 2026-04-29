import { createServiceClient } from "../_shared/supabase.ts";
import { errorResponse, handleCors, jsonResponse } from "../_shared/cors.ts";
import { isValidEmail, normalizeEmail } from "../_shared/validators.ts";
Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  if (req.method !== "POST") {
    return errorResponse("Method not allowed.", 405);
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }
  const honeypot = String(body.website ?? "").trim();
  if (honeypot) {
    return jsonResponse({ success: true, spam: true }, { status: 202 });
  }
  const email = normalizeEmail(String(body.email ?? ""));
  const fullName = String(body.fullName ?? "").trim() || null;
  const organization = String(body.organization ?? "").trim() || null;
  const notes = String(body.notes ?? "").trim() || null;
  const solutionSlug = String(body.solutionSlug ?? "").trim() || null;
  const source = String(body.source ?? "website").trim() || "website";
  const submittedFrom =
    String(body.submittedFrom ?? "").trim() ||
    req.headers.get("origin") ||
    req.headers.get("referer") ||
    "website";
  if (!email || !isValidEmail(email)) {
    return errorResponse("A valid email address is required.", 400);
  }
  const supabase = createServiceClient();
  let solution:
    | { id: string; slug: string; name: string; waitlist_count: number }
    | null = null;
  if (solutionSlug) {
    const { data, error } = await supabase
      .from("solutions")
      .select("id, slug, name, waitlist_count")
      .eq("slug", solutionSlug)
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      return errorResponse("Failed to load solution.", 500, error.message);
    }
    if (!data) {
      return errorResponse("Solution not found.", 404);
    }
    solution = data;
  }
  let duplicateQuery = supabase
    .from("waitlist_entries")
    .select("id", { head: false })
    .eq("email", email);
  if (solution?.id) {
    duplicateQuery = duplicateQuery.eq("solution_id", solution.id);
  } else {
    duplicateQuery = duplicateQuery.is("solution_id", null);
  }
  const { data: existing, error: existingError } = await duplicateQuery.maybeSingle();
  if (existingError) {
    return errorResponse(
      "Failed to check existing waitlist entry.",
      500,
      existingError.message,
    );
  }
  if (existing) {
    return jsonResponse({
      success: true,
      duplicate: true,
      message: "You are already on the waitlist.",
      solution: solution
        ? {
            id: solution.id,
            slug: solution.slug,
            name: solution.name,
            waitlistCount: solution.waitlist_count,
          }
        : null,
    });
  }
  const { data: inserted, error: insertError } = await supabase
    .from("waitlist_entries")
    .insert({
      email,
      full_name: fullName,
      organization,
      notes,
      solution_id: solution?.id ?? null,
      source,
      submitted_from: submittedFrom,
      status: "new",
    })
    .select("id, created_at")
    .single();
  if (insertError) {
    return errorResponse("Failed to create waitlist entry.", 500, insertError.message);
  }
  let waitlistCount: number | null = null;
  if (solution?.id) {
    const { count, error: countError } = await supabase
      .from("waitlist_entries")
      .select("id", { count: "exact", head: true })
      .eq("solution_id", solution.id);
    if (!countError && typeof count === "number") {
      waitlistCount = count;
      await supabase
        .from("solutions")
        .update({ waitlist_count: count })
        .eq("id", solution.id);
    }
  }
  await supabase.from("audit_logs").insert({
    actor_user_id: null,
    action: "waitlist.submitted",
    target_table: "waitlist_entries",
    target_id: inserted.id,
    metadata: {
      email,
      solution_slug: solution?.slug ?? null,
      source,
      submitted_from: submittedFrom,
    },
  });
  return jsonResponse(
    {
      success: true,
      duplicate: false,
      waitlistEntryId: inserted.id,
      solution: solution
        ? {
            id: solution.id,
            slug: solution.slug,
            name: solution.name,
            waitlistCount,
          }
        : null,
      message: "You have been added to the waitlist.",
    },
    { status: 201 },
  );
});
