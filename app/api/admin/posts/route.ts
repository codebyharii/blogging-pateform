import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return apiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  if (profile.role !== "admin") {
    return apiError(403, "Forbidden", "FORBIDDEN");
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") ?? "").trim();

  let query = getSupabaseAdmin()
    .from("posts")
    .select("id,title,image_url,author_id,summary,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

