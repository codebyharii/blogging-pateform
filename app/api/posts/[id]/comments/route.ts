import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const addCommentSchema = z.object({
  comment_text: z.string().trim().min(1).max(1000),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const { data, error } = await getSupabaseAdmin()
    .from("comments")
    .select("id,post_id,user_id,comment_text,created_at")
    .eq("post_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return apiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const parsed = addCommentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiError(400, "Invalid payload", "VALIDATION_ERROR");
  }

  const { data, error } = await getSupabaseAdmin()
    .from("comments")
    .insert({
      post_id: id,
      user_id: profile.id,
      comment_text: parsed.data.comment_text,
    })
    .select("id,post_id,user_id,comment_text,created_at")
    .single();

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
