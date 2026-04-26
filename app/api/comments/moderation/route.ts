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
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Number.parseInt(searchParams.get("limit") ?? "10", 10);
  const search = (searchParams.get("search") ?? "").trim();

  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 || limit > 100 ? 10 : limit;
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = getSupabaseAdmin()
    .from("comments")
    .select("id,post_id,user_id,comment_text,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("comment_text", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  const total = count ?? 0;
  return NextResponse.json({
    success: true,
    data: {
      items: data ?? [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    },
  });
}

