import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invite } from "@/models/Invite";
import { Otp } from "@/models/Otp";
import { SurveyResponse } from "@/models/SurveyResponse";
import {
  generateOTP,
  getOTPExpiryDate,
  isValidPhone,
  normalizePhone,
} from "@/lib/otp";
import { sendOtpSms } from "@/lib/sms";
import { errorResponse, successResponse } from "@/lib/api-response";
import { tokensMatch } from "@/lib/invite";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body.phone || "");
    const inviteToken = String(body.inviteToken || "").trim();

    if (!inviteToken) {
      return errorResponse(
        "Please open your unique survey link to continue.",
        403
      );
    }

    if (!isValidPhone(phone)) {
      return errorResponse("Please enter a valid 10-digit Indian mobile number");
    }

    await connectDB();

    const invite = await Invite.findOne({ token: inviteToken });
    if (!invite || !tokensMatch(invite.token, inviteToken)) {
      return errorResponse("Invalid survey link.", 404);
    }

    if (invite.phone !== phone) {
      return errorResponse(
        "This link is linked to a different mobile number.",
        403
      );
    }

    if (invite.completed) {
      return errorResponse(
        "You have already completed this survey. Thank you for your participation!",
        403
      );
    }

    const existingSurvey = await SurveyResponse.findOne({
      inviteId: invite._id,
    });
    if (existingSurvey) {
      return errorResponse(
        "You have already completed this survey. Thank you for your participation!",
        403
      );
    }

    const code = generateOTP();
    await Otp.deleteMany({ phone });
    await Otp.create({
      phone,
      code,
      expiresAt: getOTPExpiryDate(),
      verified: false,
    });

    await sendOtpSms(phone, code);

    return successResponse({ phone }, "OTP sent successfully");
  } catch (error) {
    console.error("Send OTP error:", error);
    return errorResponse("Failed to send OTP. Please try again.", 500);
  }
}
