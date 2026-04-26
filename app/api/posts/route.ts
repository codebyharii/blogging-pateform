import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { generatePostSummary } from "@/lib/ai";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const createPostSchema = z.object({
  title: z.string().trim().min(3).max(180),
  body: z.string().trim().min(20),
  image_url: z.string().url().optional().or(z.literal("")),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Number.parseInt(searchParams.get("limit") ?? "10", 10);
  const search = (searchParams.get("search") ?? "").trim();

  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 || limit > 50 ? 10 : limit;
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = getSupabaseAdmin()
    .from("posts")
    .select("id,title,image_url,author_id,summary,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    const normalizedSearch = search
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (normalizedSearch) {
      query = query.or(
        `title.ilike.%${normalizedSearch}%,body.ilike.%${normalizedSearch}%,summary.ilike.%${normalizedSearch}%`,
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return NextResponse.json({
    success: true,
    data: {
      items: data ?? [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
      },
    },
  });
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return apiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  if (profile.role !== "author" && profile.role !== "admin") {
    return apiError(403, "Forbidden", "FORBIDDEN");
  }

  const parsed = createPostSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiError(400, "Invalid payload", "VALIDATION_ERROR");
  }

  const summary = await generatePostSummary(parsed.data.title, parsed.data.body);

  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .insert({
      title: parsed.data.title,
      body: parsed.data.body,
      image_url: parsed.data.image_url || null,
      author_id: profile.id,
      summary,
    })
    .select("id,title,body,image_url,author_id,summary,created_at,updated_at")
    .single();

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}

