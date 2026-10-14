import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Campaign } from "@/models/campaign.model";
import { Submission } from "@/models/submission.model";
import { AppError } from "@/utils/AppError";
import { sendSuccess } from "@/utils/apiResponse";
import { clearLiveCampaignsCache } from "@/utils/cache";
import { calculatePayout } from "@/utils/payout";
import { isLinkForPlatform } from "@/utils/platform";

export async function createSubmission(req: Request, res: Response) {
  const { postUrl } = req.body;

  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    throw new AppError(404, "Campaign not found");
  }
  if (campaign.spent >= campaign.totalBudget) {
    throw new AppError(400, "This campaign has no budget left");
  }
  if (!isLinkForPlatform(postUrl, campaign.platform)) {
    throw new AppError(400, `This campaign only accepts ${campaign.platform} links`);
  }

  const submission = await Submission.create({
    campaign: campaign.id,
    creator: req.user!.id,
    postUrl,
  });

  sendSuccess(res, "Post submitted", { submission }, 201);
}

export async function getMySubmissions(req: Request, res: Response) {
  const submissions = await Submission.find({ creator: req.user!.id })
    .populate("campaign", "name platform")
    .sort({ createdAt: -1 });

  let totalEarnings = 0;
  for (const submission of submissions) {
    totalEarnings += submission.paidAmount;
  }

  sendSuccess(res, "Submissions fetched", { totalEarnings, submissions });
}


export async function updateViews(req: Request, res: Response) {
  const { views } = req.body;
  let payoutNow = 0;

  const submission = await mongoose.connection.transaction(async (session) => {
    const submission = await Submission.findById(req.params.id).session(session);
    if (!submission) {
      throw new AppError(404, "Submission not found");
    }
    if (views < submission.views) {
      throw new AppError(400, "Views cannot go down");
    }

    const campaign = await Campaign.findById(submission.campaign).session(session);
    if (!campaign) {
      throw new AppError(404, "Campaign not found");
    }

    const remainingBudget = campaign.totalBudget - campaign.spent;
    payoutNow = calculatePayout(views, campaign.milestones, submission.paidAmount, remainingBudget);

    submission.views = views;
    submission.paidAmount += payoutNow;
    campaign.spent += payoutNow;

    await submission.save({ session });
    await campaign.save({ session });
    return submission;
  });

  if (payoutNow > 0) {
    await clearLiveCampaignsCache();
  }

  sendSuccess(res, "Views updated", { submission, payoutNow });
}
