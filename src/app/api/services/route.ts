import { AMENITIES } from "@/data/amenities";
import { connectDB } from "@/lib/mongodb";
import { Service } from "@/models/Service";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    await connectDB();

    let services = await Service.find({ active: true }).sort({ order: 1 }).lean();

    const expectedKey = AMENITIES.map((a) => a.name).sort().join("|");
    const currentKey = services.map((s) => s.name).sort().join("|");
    const needsSync =
      services.length !== AMENITIES.length ||
      expectedKey !== currentKey ||
      services.some((s) => !s.remark);

    if (needsSync) {
      await Service.deleteMany({});
      await Service.insertMany(
        AMENITIES.map((amenity) => ({ ...amenity, active: true }))
      );
      services = await Service.find({ active: true }).sort({ order: 1 }).lean();
    }

    const formatted = services.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      description: s.description,
      rate: s.rate,
      remark: s.remark ?? "Per Hour",
      image: s.image,
      order: s.order,
    }));

    return successResponse(formatted);
  } catch (error) {
    console.error("Fetch services error:", error);
    return errorResponse("Failed to load services", 500);
  }
}
