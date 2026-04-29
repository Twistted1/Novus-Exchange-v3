import { createClient } from "npm:@supabase/supabase-js@2";
function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
export function createServiceClient() {
  return createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
export function createUserClient(authHeader?: string | null) {
  const headers: Record<string, string> = {};
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"), {
    global: { headers },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
