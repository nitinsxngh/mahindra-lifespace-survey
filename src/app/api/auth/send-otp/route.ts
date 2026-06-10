import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Otp } from "@/models/Otp";
import { SurveyResponse } from "@/models/SurveyResponse";
import {
  generateOTP,
  getOTPExpiryDate,
  isValidPhone,
  normalizePhone,
} from "@/lib/otp";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body.phone || "");

    if (!isValidPhone(phone)) {
      return errorResponse("Please enter a valid 10-digit Indian mobile number");
    }

    await connectDB();

    const existingSurvey = await SurveyResponse.findOne({ phone });
    if (existingSurvey) {
      return errorResponse(
        "You have already completed this survey. Thank you for your participation!",
        403
      );
    }

    const code = generateOTP();
    const expiresAt = getOTPExpiryDate();

    await Otp.deleteMany({ phone });
    await Otp.create({ phone, code, expiresAt, verified: false });

    if (process.env.DEV_MODE === "true" || process.env.NODE_ENV === "development") {
      console.log(`[DEV OTP] Phone: ${phone} | OTP: ${code}`);
    }

    return successResponse(
      { phone },
      process.env.DEV_MODE === "true"
        ? `OTP sent! (Dev mode: ${code})`
        : "OTP sent to your mobile number"
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return errorResponse("Failed to send OTP. Please try again.", 500);
  }
}
