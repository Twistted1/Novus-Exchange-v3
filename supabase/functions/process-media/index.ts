import { requireInternalOrEditor } from "../_shared/auth.ts";
import { errorResponse, handleCors, jsonResponse } from "../_shared/cors.ts";
import { isPublicBucket } from "../_shared/validators.ts";
Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  if (req.method !== "POST") {
    return errorResponse("Method not allowed.", 405);
  }
  const authResult = await requireInternalOrEditor(req);
  if ("error" in authResult) {
    return authResult.error;
  }
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const assetId = String(body.assetId ?? "").trim() || null;
  const limit = Math.min(Math.max(Number(body.limit ?? 5) || 5, 1), 25);
  const supabase = authResult.serviceClient;
  let jobsQuery = supabase
    .from("upload_jobs")
    .select("id, asset_id, job_type, status, attempt_count, payload, created_at")
    .eq("job_type", "process-media")
    .eq("status", "pending")
    .lte("run_after", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);
  if (assetId) {
    jobsQuery = jobsQuery.eq("asset_id", assetId);
  }
  const { data: jobs, error: jobsError } = await jobsQuery;
  if (jobsError) {
    return errorResponse("Failed to load pending jobs.", 500, jobsError.message);
  }
  if (!jobs?.length) {
    return jsonResponse({
      success: true,
      processed: 0,
      jobs: [],
      message: "No pending media jobs were found.",
    });
  }
  const results: Array<Record<string, unknown>> = [];
  for (const job of jobs) {
    try {
      await supabase
        .from("upload_jobs")
        .update({
          status: "processing",
          attempt_count: job.attempt_count + 1,
          error_message: null,
        })
        .eq("id", job.id);
      const { data: asset, error: assetError } = await supabase
        .from("media_assets")
        .select("id, bucket_name, object_path, mime_type, visibility, metadata")
        .eq("id", job.asset_id)
        .single();
      if (assetError || !asset) {
        throw new Error(assetError?.message || "Asset not found for upload job.");
      }
      const { data: fileInfo, error: fileInfoError } = await supabase
        .storage
        .from(asset.bucket_name)
        .info(asset.object_path);
      if (fileInfoError) {
        throw new Error(fileInfoError.message);
      }
      const existingMetadata =
        asset.metadata && typeof asset.metadata === "object" && !Array.isArray(asset.metadata)
          ? (asset.metadata as Record<string, unknown>)
          : {};
      const publicUrl = isPublicBucket(asset.bucket_name)
        ? supabase.storage.from(asset.bucket_name).getPublicUrl(asset.object_path).data.publicUrl
        : null;
      const processedAt = new Date().toISOString();
      await supabase
        .from("media_assets")
        .update({
          status: "ready",
          metadata: {
            ...existingMetadata,
            processed_at: processedAt,
            processed_by: "process-media-edge-function",
            public_url: publicUrl,
            latest_storage_info: fileInfo,
          },
        })
        .eq("id", asset.id);
      await supabase
        .from("upload_jobs")
        .update({
          status: "ready",
          completed_at: processedAt,
          error_message: null,
        })
        .eq("id", job.id);
      await supabase.from("audit_logs").insert({
        actor_user_id: "user" in authResult ? authResult.user.id : null,
        action: "media.processed",
        target_table: "media_assets",
        target_id: asset.id,
        metadata: {
          upload_job_id: job.id,
          bucket_name: asset.bucket_name,
          object_path: asset.object_path,
          public_url: publicUrl,
        },
      });
      results.push({
        jobId: job.id,
        assetId: asset.id,
        status: "ready",
        publicUrl,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown processing error.";
      await supabase
        .from("upload_jobs")
        .update({
          status: "failed",
          error_message: message,
        })
        .eq("id", job.id);
      await supabase
        .from("media_assets")
        .update({ status: "failed" })
        .eq("id", job.asset_id);
      results.push({
        jobId: job.id,
        assetId: job.asset_id,
        status: "failed",
        error: message,
      });
    }
  }
  return jsonResponse({
    success: true,
    processed: results.length,
    jobs: results,
  });
});
