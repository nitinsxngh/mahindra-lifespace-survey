import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { SurveyResponse } from "@/models/SurveyResponse";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized. Please login first.", 401);
    }

    await connectDB();

    const existing = await SurveyResponse.findOne({
      phone: session.phone,
    }).lean();

    return successResponse({
      phone: session.phone,
      completed: !!existing,
      submittedAt: existing?.submittedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Survey status error:", error);
    return errorResponse("Failed to check survey status", 500);
  }
}
