import { requireEditorOrAdmin } from "../_shared/auth.ts";
import { errorResponse, handleCors, jsonResponse } from "../_shared/cors.ts";
import {
  buildUploadPath,
  isAllowedUploadBucket,
  isPublicBucket,
  parseBoolean,
  isValidVisibility,
} from "../_shared/validators.ts";

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

  const fileName = String(body.fileName ?? "").trim();
  const bucketName = String(body.bucketName ?? "raw-uploads").trim();
  const folder = String(body.folder ?? "").trim();
  const upsert = parseBoolean(body.upsert, false);
  const requestedVisibility = String(body.visibility ?? "").trim();

  if (!fileName) {
    return errorResponse("File name is required.", 400);
  }

  if (!isAllowedUploadBucket(bucketName)) {
    return errorResponse("Unsupported bucketName.", 400, {
      allowedBuckets: [
        "public-site",
        "solution-media",
        "raw-uploads",
        "research-private",
      ],
    });
  }
  if (requestedVisibility && !isValidVisibility(requestedVisibility)) {
    return errorResponse("Invalid visibility value.", 400, {
      allowedValues: ["private", "internal", "public"],
    });
  }
  const visibility = requestedVisibility || (isPublicBucket(bucketName) ? "public" : "private");

  const { user, userClient } = authResult;
  const path = buildUploadPath(user.id, fileName, folder);

  const { data, error } = await userClient.storage
    .from(bucketName)
    .createSignedUploadUrl(path);

  if (error) {
    return errorResponse("Failed to create signed upload URL.", 500, error.message);
  }

  return jsonResponse({
    success: true,
    signedUrl: data.signedUrl,
    path,
    bucketName,
    isPublic: isPublicBucket(bucketName),
  });
});
