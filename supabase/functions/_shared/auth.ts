import { errorResponse } from "./cors.ts";
import { createServiceClient, createUserClient } from "./supabase.ts";
export async function requireEditorOrAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      error: errorResponse("Missing Authorization header.", 401),
    };
  }
  const userClient = createUserClient(authHeader);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return {
      error: errorResponse("Unauthorized.", 401, userError?.message),
    };
  }
  const { data: isAllowed, error: roleError } = await userClient.rpc(
    "has_any_role",
    { requested_roles: ["admin", "editor"] },
  );
  if (roleError || !isAllowed) {
    return {
      error: errorResponse(
        "Forbidden. Editor or admin access is required.",
        403,
        roleError?.message,
      ),
    };
  }
  return {
    user,
    userClient,
    serviceClient: createServiceClient(),
  };
}
export async function requireInternalOrEditor(req: Request) {
  const internalSecret = Deno.env.get("INTERNAL_API_SECRET");
  const internalToken = req.headers.get("x-internal-token");
  if (internalSecret && internalToken && internalToken === internalSecret) {
    return {
      mode: "internal" as const,
      serviceClient: createServiceClient(),
    };
  }
  const authResult = await requireEditorOrAdmin(req);
  if ("error" in authResult) {
    return authResult;
  }
  return {
    ...authResult,
    mode: "editor" as const,
  };
}
