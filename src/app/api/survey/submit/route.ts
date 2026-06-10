import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { Service } from "@/models/Service";
import { SurveyResponse } from "@/models/SurveyResponse";
import { errorResponse, successResponse } from "@/lib/api-response";

const submitSchema = z.object({
  rankings: z
    .array(
      z.object({
        serviceId: z.string().min(1),
        priority: z.number().int().min(1).max(4),
      })
    )
    .length(4),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized. Please login first.", 401);
    }

    const body = await request.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid survey data. Please rank all 4 services.");
    }

    const { rankings } = parsed.data;
    const priorities = rankings.map((r) => r.priority);
    const uniquePriorities = new Set(priorities);

    if (uniquePriorities.size !== 4) {
      return errorResponse(
        "Each priority (1, 2, 3, 4) must be assigned exactly once."
      );
    }

    await connectDB();

    const existing = await SurveyResponse.findOne({ phone: session.phone });
    if (existing) {
      return errorResponse(
        "You have already completed this survey. Thank you!",
        403
      );
    }

    const services = await Service.find({ active: true }).lean();
    if (services.length !== 4) {
      return errorResponse("Survey configuration error. Contact support.", 500);
    }

    const serviceIds = new Set(services.map((s) => s._id.toString()));
    for (const ranking of rankings) {
      if (!serviceIds.has(ranking.serviceId)) {
        return errorResponse("Invalid service in rankings.");
      }
    }

    await SurveyResponse.create({
      phone: session.phone,
      rankings: rankings.map((r) => ({
        serviceId: r.serviceId,
        priority: r.priority,
      })),
      submittedAt: new Date(),
    });

    return successResponse(
      { submittedAt: new Date().toISOString() },
      "Thank you! Your survey has been submitted successfully."
    );
  } catch (error) {
    console.error("Submit survey error:", error);
    return errorResponse("Failed to submit survey. Please try again.", 500);
  }
}
