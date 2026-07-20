import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { SurveyResponse } from "@/models/SurveyResponse";
import { Invite } from "@/models/Invite";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized. Please login first.", 401);
    }

    await connectDB();

    const existing = await SurveyResponse.findOne({
      inviteId: session.inviteId,
    }).lean();

    const invite = await Invite.findById(session.inviteId).lean();
    const completed = !!existing || !!invite?.completed;

    return successResponse({
      phone: session.phone,
      inviteId: session.inviteId,
      completed,
      submittedAt: existing?.submittedAt?.toISOString() ?? null,
      name: invite?.name ?? "",
      unitNumber: invite?.unitNumber ?? "",
    });
  } catch (error) {
    console.error("Survey status error:", error);
    return errorResponse("Failed to check survey status", 500);
  }
}
