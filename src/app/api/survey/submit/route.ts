import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { Service } from "@/models/Service";
import { SurveyResponse } from "@/models/SurveyResponse";
import { Invite } from "@/models/Invite";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
  MAX_AMENITY_SELECTIONS,
  MIN_AMENITY_SELECTIONS,
} from "@/lib/survey-config";
import { sendSurveyConfirmationEmail } from "@/lib/email";

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

    const invite = await Invite.findById(session.inviteId);
    if (!invite || invite.phone !== session.phone) {
      return errorResponse(
        "Invalid survey session. Please use your unique link again.",
        403
      );
    }

    if (invite.completed) {
      return errorResponse(
        "You have already completed this survey. Thank you!",
        403
      );
    }

    const existing = await SurveyResponse.findOne({
      inviteId: session.inviteId,
    });
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
    const serviceById = new Map(
      services.map((s) => [s._id.toString(), s] as const)
    );

    for (const ranking of rankings) {
      if (!serviceIds.has(ranking.serviceId)) {
        return errorResponse("Invalid amenity in selection.");
      }
      if (selectedIds.has(ranking.serviceId)) {
        return errorResponse("Each amenity can only be selected once.");
      }
      selectedIds.add(ranking.serviceId);
    }

    const submittedAt = new Date();

    await SurveyResponse.create({
      phone: session.phone,
      inviteId: session.inviteId,
      rankings: rankings.map((r) => ({
        serviceId: r.serviceId,
        priority: r.priority,
      })),
      submittedAt,
    });

    invite.completed = true;
    invite.completedAt = submittedAt;
    await invite.save();

    if (invite.email) {
      const choices = rankings
        .map((r) => {
          const service = serviceById.get(r.serviceId);
          if (!service) return null;
          return {
            priority: r.priority,
            name: service.name,
            rate: service.rate,
            remark: service.remark || "",
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

      try {
        await sendSurveyConfirmationEmail({
          to: invite.email,
          name: invite.name || "Resident",
          phone: invite.phone,
          unitNumber: invite.unitNumber || "",
          tower: invite.tower || "",
          choices,
          submittedAt,
        });
      } catch (emailError) {
        console.error("Confirmation email failed:", emailError);
      }
    } else {
      console.warn(
        `[EMAIL] No applicant email for invite ${invite._id.toString()}; skipped confirmation.`
      );
    }

    return successResponse(
      { submittedAt: submittedAt.toISOString() },
      "Thank you! Your survey has been submitted successfully."
    );
  } catch (error) {
    console.error("Submit survey error:", error);
    return errorResponse("Failed to submit survey. Please try again.", 500);
  }
}
