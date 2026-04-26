import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { generatePostSummary } from "@/lib/ai";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return apiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const { data: existingPost, error: existingError } = await getSupabaseAdmin()
    .from("posts")
    .select("id,title,body,author_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return apiError(500, existingError.message, "DB_ERROR");
  }

  if (!existingPost) {
    return apiError(404, "Post not found", "NOT_FOUND");
  }

  const isOwner = existingPost.author_id === profile.id;
  const canRegenerate =
    profile.role === "admin" || (profile.role === "author" && isOwner);

  if (!canRegenerate) {
    return apiError(403, "Forbidden", "FORBIDDEN");
  }

  const summary = await generatePostSummary(existingPost.title, existingPost.body);

  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .update({ summary, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id,summary,updated_at")
    .single();

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  return NextResponse.json({ success: true, data });
}
