import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Otp } from "@/models/Otp";
import { SurveyResponse } from "@/models/SurveyResponse";
import { createSession, getSessionCookieOptions } from "@/lib/auth";
import { isValidPhone, normalizePhone } from "@/lib/otp";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body.phone || "");
    const code = (body.otp || "").toString().trim();

    if (!isValidPhone(phone)) {
      return errorResponse("Invalid phone number");
    }

    if (!code || code.length !== 6) {
      return errorResponse("Please enter a valid 6-digit OTP");
    }

    await connectDB();

    const existingSurvey = await SurveyResponse.findOne({ phone });
    if (existingSurvey) {
      return errorResponse(
        "You have already completed this survey. Thank you for your participation!",
        403
      );
    }

    const otpRecord = await Otp.findOne({
      phone,
      code,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return errorResponse("Invalid or expired OTP. Please request a new one.");
    }

    otpRecord.verified = true;
    await otpRecord.save();

    const token = await createSession(phone);
    const response = successResponse({ phone }, "Login successful");

    response.cookies.set(getSessionCookieOptions(token));
    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponse("Verification failed. Please try again.", 500);
  }
}
