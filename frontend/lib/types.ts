export type Role = "brand" | "creator";
export type Platform = "instagram" | "youtube";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Milestone {
  views: number;
  payout: number;
}

export interface Campaign {
  _id: string;
  name: string;
  platform: Platform;
  totalBudget: number;
  spent: number;
  milestones: Milestone[];
  createdAt: string;
}


export interface BrandCampaign extends Campaign {
  remaining: number;
}

export interface LiveCampaign extends Campaign {
  brand: { _id: string; name: string };
}

export interface Submission {
  _id: string;
  postUrl: string;
  views: number;
  paidAmount: number;
  flagged: boolean;
  createdAt: string;
}

 
export interface CreatorSubmission extends Submission {
  campaign: { _id: string; name: string; platform: Platform };
}


export interface CampaignSubmission extends Submission {
  creator: { _id: string; name: string };
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
