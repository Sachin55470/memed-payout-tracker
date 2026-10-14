import { z } from "zod";
import { PLATFORMS } from "@/constants";

const milestoneSchema = z.object({
  views: z.number().int().positive(),
  payout: z.number().int().positive(),
});

function isLadderValid(milestones: { views: number; payout: number }[]) {
  for (let i = 1; i < milestones.length; i++) {
    const prev = milestones[i - 1]!;
    const curr = milestones[i]!;
    if (curr.views <= prev.views || curr.payout <= prev.payout) {
      return false;
    }
  }
  return true;
}

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  platform: z.enum(PLATFORMS),
  totalBudget: z.number().int().positive(),
  milestones: z
    .array(milestoneSchema)
    .min(1, "Add at least one milestone")
    .refine(isLadderValid, "Milestones must increase in both views and payout"),
});
