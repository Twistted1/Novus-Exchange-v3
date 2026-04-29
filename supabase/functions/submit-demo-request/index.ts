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
  const fullName = String(body.fullName ?? "").trim();
  const organization = String(body.organization ?? "").trim() || null;
  const roleTitle = String(body.roleTitle ?? "").trim() || null;
  const teamSize = String(body.teamSize ?? "").trim() || null;
  const message = String(body.message ?? "").trim() || null;
  const solutionSlug = String(body.solutionSlug ?? "").trim() || null;
  const source = String(body.source ?? "website").trim() || "website";
  if (!fullName) {
    return errorResponse("Full name is required.", 400);
  }
  if (!email || !isValidEmail(email)) {
    return errorResponse("A valid email address is required.", 400);
  }
  const supabase = createServiceClient();
  let solution: { id: string; slug: string; name: string } | null = null;
  if (solutionSlug) {
    const { data, error } = await supabase
      .from("solutions")
      .select("id, slug, name")
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
  const { data: inserted, error: insertError } = await supabase
    .from("demo_requests")
    .insert({
      email,
      full_name: fullName,
      organization,
      role_title: roleTitle,
      team_size: teamSize,
      message,
      solution_id: solution?.id ?? null,
      status: "new",
    })
    .select("id, created_at")
    .single();
  if (insertError) {
    return errorResponse("Failed to create demo request.", 500, insertError.message);
  }
  await supabase.from("audit_logs").insert({
    actor_user_id: null,
    action: "demo-request.submitted",
    target_table: "demo_requests",
    target_id: inserted.id,
    metadata: {
      email,
      full_name: fullName,
      organization,
      solution_slug: solution?.slug ?? null,
      source,
    },
  });
  return jsonResponse(
    {
      success: true,
      demoRequestId: inserted.id,
      solution: solution
        ? {
            id: solution.id,
            slug: solution.slug,
            name: solution.name,
          }
        : null,
      message: "Your demo request has been received.",
    },
    { status: 201 },
  );
});
