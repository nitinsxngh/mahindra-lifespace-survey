import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function successResponse<T>(
  data?: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function errorResponse(
  message: string,
  status = 400
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status });
}
