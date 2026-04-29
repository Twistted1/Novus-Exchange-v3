import { requireEditorOrAdmin } from "../_shared/auth.ts";
import { errorResponse, handleCors, jsonResponse } from "../_shared/cors.ts";
import { isValidVisibility, parseBoolean } from "../_shared/validators.ts";
Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  if (req.method !== "POST") {
    return errorResponse("Method not allowed.", 405);
  }
  const authResult = await requireEditorOrAdmin(req);
  if ("error" in authResult) {
    return authResult.error;
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }
  const assetId = String(body.assetId ?? "").trim();
  const altText = String(body.altText ?? "").trim() || null;
  const caption = String(body.caption ?? "").trim() || null;
  const requestedVisibility = String(body.visibility ?? "").trim() || null;
  const forceProcessing = parseBoolean(body.forceProcessing, false);
  const requestedDerivatives = Array.isArray(body.requestedDerivatives)
    ? body.requestedDerivatives
    : [];
  if (!assetId) {
    return errorResponse("assetId is required.", 400);
  }

  if (requestedVisibility && !isValidVisibility(requestedVisibility)) {
    return errorResponse("Invalid visibility value.", 400, {
      allowedValues: ["private", "internal", "public"],
    });
  }

  const { data: asset, error: assetError } = await authResult.serviceClient
    .from("media_assets")
    .select("id, owner_user_id, bucket_name, object_path, file_name, mime_type, status, visibility, metadata")
    .eq("id", assetId)
    .maybeSingle();
  if (assetError) {
    return errorResponse("Failed to load media asset.", 500, assetError.message);
  }
  if (!asset) {
    return errorResponse("Media asset not found.", 404);
  }
  const { data: fileInfo, error: fileInfoError } = await authResult.serviceClient
    .storage
    .from(asset.bucket_name)
    .info(asset.object_path);
  if (fileInfoError) {
    return errorResponse(
      "The uploaded file could not be verified in Storage.",
      400,
      fileInfoError.message,
    );
  }
  const metadata =
    asset.metadata && typeof asset.metadata === "object" && !Array.isArray(asset.metadata)
      ? (asset.metadata as Record<string, unknown>)
      : {};
  const fileInfoRecord =
    fileInfo && typeof fileInfo === "object" && !Array.isArray(fileInfo)
      ? (fileInfo as Record<string, unknown>)
      : {};
  const fileMetadata =
    fileInfoRecord.metadata &&
      typeof fileInfoRecord.metadata === "object" &&
      !Array.isArray(fileInfoRecord.metadata)
      ? (fileInfoRecord.metadata as Record<string, unknown>)
      : {};
  const sizeBytes = Number(
    fileInfoRecord.size ?? fileMetadata.size ?? body.sizeBytes ?? 0,
  ) || null;
  const mimeType =
    String(
      fileMetadata.mimetype ?? fileInfoRecord.mimetype ?? body.contentType ?? asset.mime_type ?? "",
    ).trim() || null;
  const nextVisibility = requestedVisibility ?? asset.visibility;
  const needsProcessing = forceProcessing || asset.bucket_name === "raw-uploads";
  const nextStatus = needsProcessing ? "processing" : "ready";
  const finalizedAt = new Date().toISOString();
  const { data: updatedAsset, error: updateError } = await authResult.serviceClient
    .from("media_assets")
    .update({
      owner_user_id: asset.owner_user_id ?? authResult.user.id,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      alt_text: altText,
      caption,
      visibility: nextVisibility,
      status: nextStatus,
      metadata: {
        ...metadata,
        storage_info: fileInfoRecord,
        finalized_at: finalizedAt,
        finalized_by: authResult.user.id,
      },
    })
    .eq("id", asset.id)
    .select("id, bucket_name, object_path, mime_type, size_bytes, status, visibility, updated_at")
    .single();
  if (updateError) {
    return errorResponse("Failed to finalize media asset.", 500, updateError.message);
  }
  let uploadJob: Record<string, unknown> | null = null;
  if (needsProcessing) {
    const { data: createdJob, error: jobError } = await authResult.serviceClient
      .from("upload_jobs")
      .insert({
        asset_id: asset.id,
        requested_by: authResult.user.id,
        job_type: "process-media",
        status: "pending",
        payload: {
          asset_id: asset.id,
          bucket_name: asset.bucket_name,
          object_path: asset.object_path,
          requested_derivatives: requestedDerivatives,
          next_visibility: nextVisibility,
        },
      })
      .select("id, asset_id, job_type, status, created_at")
      .single();
    if (jobError) {
      return errorResponse("Asset was finalized but queue creation failed.", 500, jobError.message);
    }
    uploadJob = createdJob as Record<string, unknown>;
  }
  await authResult.serviceClient.from("audit_logs").insert({
    actor_user_id: authResult.user.id,
    action: needsProcessing ? "media.finalized-and-queued" : "media.finalized",
    target_table: "media_assets",
    target_id: asset.id,
    metadata: {
      asset_id: asset.id,
      bucket_name: asset.bucket_name,
      object_path: asset.object_path,
      status: nextStatus,
      requested_derivatives: requestedDerivatives,
    },
  });
  return jsonResponse({
    success: true,
    asset: updatedAsset,
    uploadJob,
    message: needsProcessing
      ? "Upload finalized and queued for processing."
      : "Upload finalized and marked ready.",
  });
});
