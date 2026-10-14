const PLATFORM_HOSTS: Record<string, string[]> = {
  instagram: ["instagram.com", "www.instagram.com"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
};


export function isLinkForPlatform(postUrl: string, platform: string) {
  const host = new URL(postUrl).hostname.toLowerCase();
  const allowedHosts = PLATFORM_HOSTS[platform] ?? [];
  return allowedHosts.includes(host);
}
