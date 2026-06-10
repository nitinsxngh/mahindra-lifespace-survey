import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IService extends Document {
  name: string;
  description: string;
  rate: number;
  remark: string;
  image: string;
  order: number;
  active: boolean;
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    rate: { type: Number, required: true },
    remark: { type: String, required: true },
    image: { type: String, required: true },
    order: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service: Model<IService> =
  mongoose.models.Service ||
  mongoose.model<IService>("Service", ServiceSchema);
