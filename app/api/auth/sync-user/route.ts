import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/database.types";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !user.email) {
    return apiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return apiError(400, "Invalid payload", "VALIDATION_ERROR");
  }

  const payload: Database["public"]["Tables"]["users"]["Insert"] = {
    id: user.id,
    name: parsed.data.name,
    email: user.email,
    role: "viewer",
  };

  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select("id,name,email,role,created_at")
    .single();

  if (error) {
    return apiError(500, error.message, "DB_ERROR");
  }

  return NextResponse.json({ success: true, data });
}

