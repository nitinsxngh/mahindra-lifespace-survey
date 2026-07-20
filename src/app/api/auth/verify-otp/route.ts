import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invite } from "@/models/Invite";
import { Otp } from "@/models/Otp";
import { SurveyResponse } from "@/models/SurveyResponse";
import { createSession, getSessionCookieOptions } from "@/lib/auth";
import { isValidPhone, normalizePhone } from "@/lib/otp";
import { errorResponse, successResponse } from "@/lib/api-response";
import { tokensMatch } from "@/lib/invite";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body.phone || "");
    const otp = String(body.otp || "").trim();
    const inviteToken = String(body.inviteToken || "").trim();

    if (!inviteToken) {
      return errorResponse(
        "Please open your unique survey link to continue.",
        403
      );
    }

    if (!isValidPhone(phone)) {
      return errorResponse("Invalid phone number");
    }

    if (!/^\d{6}$/.test(otp)) {
      return errorResponse("Please enter a valid 6-digit OTP");
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

    const otpRecord = await Otp.findOne({
      phone,
      code: otp,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return errorResponse("Invalid or expired OTP. Please try again.", 401);
    }

    otpRecord.verified = true;
    await otpRecord.save();
    await Otp.deleteMany({ phone, _id: { $ne: otpRecord._id } });

    const sessionToken = await createSession(phone, invite._id.toString());
    const response = successResponse(
      { phone, inviteId: invite._id.toString() },
      "Login successful"
    );

    response.cookies.set(getSessionCookieOptions(sessionToken));
    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponse("Verification failed. Please try again.", 500);
  }
}
