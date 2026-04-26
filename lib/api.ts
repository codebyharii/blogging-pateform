import { NextResponse } from "next/server";
import type { ApiErrorShape } from "@/lib/types";

export function apiError(
  status: number,
  message: string,
  code: string,
): NextResponse<ApiErrorShape> {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
    },
    { status },
  );
}
