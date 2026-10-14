import { redis } from "../config/redis";

const LIVE_CAMPAIGNS_KEY = "campaigns:live";

const CACHE_SECONDS = 60;

export async function getCachedLiveCampaigns() {
  try {
    const cached = await redis.get(LIVE_CAMPAIGNS_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error("Cache read failed:", err);
    return null;
  }
}

export async function setCachedLiveCampaigns(campaigns: unknown) {
  try {
    await redis.set(LIVE_CAMPAIGNS_KEY, JSON.stringify(campaigns), { EX: CACHE_SECONDS });
  } catch (err) {
    console.error("Cache write failed:", err);
  }
}

export async function clearLiveCampaignsCache() {
  try {
    await redis.del(LIVE_CAMPAIGNS_KEY);
  } catch (err) {
    console.error("Cache clear failed:", err);
  }
}
