import { getClearSessionCookieOptions } from "@/lib/auth";
import { successResponse } from "@/lib/api-response";

export async function POST() {
  const response = successResponse(undefined, "Logged out successfully");
  response.cookies.set(getClearSessionCookieOptions());
  return response;
}
