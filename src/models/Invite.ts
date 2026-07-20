import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IInvite extends Document {
  token: string;
  phone: string;
  name: string;
  email: string;
  tower: string;
  unitNumber: string;
  sapCustomerCode: string;
  bookingDate: Date | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema<IInvite>(
  {
    token: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, index: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    tower: { type: String, default: "" },
    unitNumber: { type: String, required: true, index: true },
    sapCustomerCode: { type: String, default: "", index: true },
    bookingDate: { type: Date, default: null },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

InviteSchema.index(
  { sapCustomerCode: 1, unitNumber: 1, phone: 1 },
  { unique: true }
);

export const Invite: Model<IInvite> =
  mongoose.models.Invite || mongoose.model<IInvite>("Invite", InviteSchema);
