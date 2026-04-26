import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const updatePostSchema = z.object({
  title: z.string().trim().min(3).max(180),
  body: z.string().trim().min(20),
  image_url: z.string().url().optional().or(z.literal("")),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const { data: post, error } = await getSupabaseAdmin()
    .from("posts")
    .select("id,title,body,image_url,author_id,summary,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  if (!post) {
    return apiError(404, "Post not found", "NOT_FOUND");
  }

  const { data: comments, error: commentsError } = await getSupabaseAdmin()
    .from("comments")
    .select("id,post_id,user_id,comment_text,created_at")
    .eq("post_id", id)
    .order("created_at", { ascending: false });

  if (commentsError) {
    return apiError(500, commentsError.message, "DB_ERROR");
  }

  return NextResponse.json({
    success: true,
    data: {
      post,
      comments: comments ?? [],
    },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return apiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const { data: existingPost, error: existingError } = await getSupabaseAdmin()
    .from("posts")
    .select("id,author_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return apiError(500, existingError.message, "DB_ERROR");
  }

  if (!existingPost) {
    return apiError(404, "Post not found", "NOT_FOUND");
  }

  const isOwner = existingPost.author_id === profile.id;
  const canEdit = profile.role === "admin" || (profile.role === "author" && isOwner);

  if (!canEdit) {
    return apiError(403, "Forbidden", "FORBIDDEN");
  }

  const parsed = updatePostSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiError(400, "Invalid payload", "VALIDATION_ERROR");
  }

  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .update({
      title: parsed.data.title,
      body: parsed.data.body,
      image_url: parsed.data.image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id,title,body,image_url,author_id,summary,created_at,updated_at")
    .single();

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  return NextResponse.json({ success: true, data });
}
