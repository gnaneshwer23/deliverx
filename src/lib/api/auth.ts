import { createClient } from "@/lib/supabase/server";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError("Not authenticated", 401);
  }

  return { supabase, user };
}

export async function requireProjectAccess(projectId: string) {
  const { supabase, user } = await requireAuth();

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, goal, delivery_type, timeline, status")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    throw new ApiError("Project not found", 404);
  }

  return { supabase, user, project };
}

export function apiErrorResponse(err: unknown) {
  if (err instanceof ApiError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : "Request failed";
  const status = message === "Not authenticated" ? 401 : 500;
  return Response.json({ error: message }, { status });
}
