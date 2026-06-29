import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { Service } from "@/models/Service";
import { SurveyResponse } from "@/models/SurveyResponse";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
  MAX_AMENITY_SELECTIONS,
  MIN_AMENITY_SELECTIONS,
} from "@/lib/survey-config";

const submitSchema = z.object({
  rankings: z
    .array(
      z.object({
        serviceId: z.string().min(1),
        priority: z.number().int().min(1).max(MAX_AMENITY_SELECTIONS),
      })
    )
    .min(MIN_AMENITY_SELECTIONS)
    .max(MAX_AMENITY_SELECTIONS),
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
      return errorResponse(
        `Please select exactly ${MAX_AMENITY_SELECTIONS} amenities.`
      );
    }

    const { rankings } = parsed.data;

    if (rankings.length !== MAX_AMENITY_SELECTIONS) {
      return errorResponse(
        `Please select exactly ${MAX_AMENITY_SELECTIONS} amenities.`
      );
    }

    const priorities = rankings.map((r) => r.priority);
    const uniquePriorities = new Set(priorities);

    if (uniquePriorities.size !== MAX_AMENITY_SELECTIONS) {
      return errorResponse(
        `Please assign priority 1 and ${MAX_AMENITY_SELECTIONS} to your selected amenities.`
      );
    }

    const expectedPriorities = Array.from(
      { length: MAX_AMENITY_SELECTIONS },
      (_, i) => i + 1
    );
    if (!expectedPriorities.every((p) => uniquePriorities.has(p))) {
      return errorResponse(
        `Please assign priority 1 and ${MAX_AMENITY_SELECTIONS} to your selected amenities.`
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
    if (services.length < MAX_AMENITY_SELECTIONS) {
      return errorResponse("Survey configuration error. Contact support.", 500);
    }

    const serviceIds = new Set(services.map((s) => s._id.toString()));
    const selectedIds = new Set<string>();

    for (const ranking of rankings) {
      if (!serviceIds.has(ranking.serviceId)) {
        return errorResponse("Invalid amenity in selection.");
      }
      if (selectedIds.has(ranking.serviceId)) {
        return errorResponse("Each amenity can only be selected once.");
      }
      selectedIds.add(ranking.serviceId);
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
