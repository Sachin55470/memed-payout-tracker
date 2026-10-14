import type { Request, Response } from "express";
import { Campaign } from "../models/campaign.model";
import { Submission } from "../models/submission.model";
import { AppError } from "../utils/AppError";
import { sendSuccess } from "../utils/apiResponse";
import { clearLiveCampaignsCache, getCachedLiveCampaigns, setCachedLiveCampaigns } from "../utils/cache";

export async function createCampaign(req: Request, res: Response) {
  const { name, platform, totalBudget, milestones } = req.body;

  const campaign = await Campaign.create({
    brand: req.user!.id,
    name,
    platform,
    totalBudget,
    milestones,
  });

  await clearLiveCampaignsCache();

  sendSuccess(res, "Campaign created", { campaign }, 201);
}

export async function getMyCampaigns(req: Request, res: Response) {
  const campaigns = await Campaign.find({ brand: req.user!.id }).sort({ createdAt: -1 });

  const result = campaigns.map((campaign) => ({
    ...campaign.toObject(),
    remaining: campaign.totalBudget - campaign.spent,
  }));

  sendSuccess(res, "Campaigns fetched", { campaigns: result });
}


export async function getLiveCampaigns(_req: Request, res: Response) {
  const cached = await getCachedLiveCampaigns();
  if (cached) {
    return sendSuccess(res, "Live campaigns fetched", { campaigns: cached });
  }

  const campaigns = await Campaign.find({ $expr: { $lt: ["$spent", "$totalBudget"] } })
    .populate("brand", "name")
    .sort({ createdAt: -1 })
    .lean();

  await setCachedLiveCampaigns(campaigns);
  return sendSuccess(res, "Live campaigns fetched", { campaigns });
}

export async function getCampaignSubmissions(req: Request, res: Response) {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    throw new AppError(404, "Campaign not found");
  }
  if (campaign.brand.toString() !== req.user!.id) {
    throw new AppError(403, "This is not your campaign");
  }

  const submissions = await Submission.find({ campaign: campaign.id })
    .populate("creator", "name")
    .sort({ createdAt: -1 });

  sendSuccess(res, "Submissions fetched", { submissions });
}
