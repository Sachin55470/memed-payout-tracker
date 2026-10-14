import { Schema, model } from "mongoose";
import { PLATFORMS } from "../constants";

const milestoneSchema = new Schema(
  {
    views: { type: Number, required: true },
    payout: { type: Number, required: true },
  },
  { _id: false }
);

const campaignSchema = new Schema(
  {
    brand: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    platform: { type: String, enum: PLATFORMS, required: true },
    totalBudget: { type: Number, required: true },
    spent: { type: Number, default: 0 },//total amt payed till now 
    milestones: { type: [milestoneSchema], required: true },
  },
  { timestamps: true }
);

export const Campaign = model("Campaign", campaignSchema);
