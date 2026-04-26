import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const updateSchema = z.object({
  title: z.string().trim().min(3).max(180),
  body: z.string().trim().min(20),
  image_url: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return apiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  if (profile.role !== "admin") {
    return apiError(403, "Forbidden", "FORBIDDEN");
  }

  const parsed = updateSchema.safeParse(await request.json());
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
