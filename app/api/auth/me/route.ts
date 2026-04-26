import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getCurrentProfile } from "@/lib/auth";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return apiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  return NextResponse.json({ success: true, data: profile });
}
