import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invite } from "@/models/Invite";
import { SurveyResponse } from "@/models/SurveyResponse";
import { errorResponse, successResponse } from "@/lib/api-response";
import { tokensMatch } from "@/lib/invite";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token || token.length < 20) {
      return errorResponse("Invalid survey link.", 400);
    }

    await connectDB();

    const invite = await Invite.findOne({ token }).lean();
    if (!invite || !tokensMatch(invite.token, token)) {
      return errorResponse(
        "This survey link is invalid or has expired. Please use the link shared with you.",
        404
      );
    }

    const existing = await SurveyResponse.findOne({
      inviteId: invite._id,
    }).lean();

    if (existing || invite.completed) {
      return errorResponse(
        "You have already completed this survey. Thank you for your participation!",
        403
      );
    }

    return successResponse({
      inviteId: invite._id.toString(),
      phone: invite.phone,
      name: invite.name,
      unitNumber: invite.unitNumber,
      tower: invite.tower,
    });
  } catch (error) {
    console.error("Invite validate error:", error);
    return errorResponse("Failed to validate survey link.", 500);
  }
}
