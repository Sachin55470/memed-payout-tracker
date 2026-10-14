import { Schema, model } from "mongoose";

const submissionSchema = new Schema(
  {
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postUrl: { type: String, required: true, trim: true },
    views: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },// amt paid to the creator
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

submissionSchema.index({ campaign: 1, postUrl: 1 }, { unique: true });

export const Submission = model("Submission", submissionSchema);
