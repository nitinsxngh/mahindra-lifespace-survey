import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IRanking {
  serviceId: mongoose.Types.ObjectId;
  priority: number;
}

export interface ISurveyResponse extends Document {
  phone: string;
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
    phone: { type: String, required: true, unique: true, index: true },
    rankings: { type: [RankingSchema], required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SurveyResponse: Model<ISurveyResponse> =
  mongoose.models.SurveyResponse ||
  mongoose.model<ISurveyResponse>("SurveyResponse", SurveyResponseSchema);
