import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IRanking {
  serviceId: mongoose.Types.ObjectId;
  priority: number;
}

export interface ISurveyResponse extends Document {
  phone: string;
  inviteId: mongoose.Types.ObjectId;
  rankings: IRanking[];
  submittedAt: Date;
}

const RankingSchema = new Schema<IRanking>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    priority: { type: Number, required: true, min: 1, max: 4 },
  },
  { _id: false }
);

const SurveyResponseSchema = new Schema<ISurveyResponse>(
  {
    // Non-unique: same phone may submit once per invite/unit
    phone: { type: String, required: true, index: true },
    inviteId: {
      type: Schema.Types.ObjectId,
      ref: "Invite",
      required: true,
      unique: true,
      index: true,
    },
    rankings: { type: [RankingSchema], required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SurveyResponse: Model<ISurveyResponse> =
  mongoose.models.SurveyResponse ||
  mongoose.model<ISurveyResponse>("SurveyResponse", SurveyResponseSchema);

/** Drop legacy unique phone index from pre-invite schema (same phone, multiple units). */
export async function ensureSurveyResponseIndexes(): Promise<void> {
  const collection = mongoose.connection.collection("surveyresponses");
  const indexes = await collection.indexes();
  const phoneIndex = indexes.find((idx) => idx.name === "phone_1");

  if (phoneIndex?.unique) {
    await collection.dropIndex("phone_1");
    await collection.createIndex({ phone: 1 });
  }
}
