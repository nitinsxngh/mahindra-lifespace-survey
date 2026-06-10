import mongoose from "mongoose";
import { AMENITIES } from "../src/data/amenities";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/algoqube-survey";

const ServiceSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    rate: Number,
    remark: String,
    image: String,
    order: Number,
    active: Boolean,
  },
  { timestamps: true }
);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const Service =
    mongoose.models.Service || mongoose.model("Service", ServiceSchema);

  await Service.deleteMany({});
  await Service.insertMany(
    AMENITIES.map((amenity) => ({ ...amenity, active: true }))
  );

  console.log("✓ Seeded 4 amenities successfully");
  AMENITIES.forEach((a) => {
    console.log(`  ${a.order}. ${a.name} — ₹${a.rate} ${a.remark}`);
  });
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
