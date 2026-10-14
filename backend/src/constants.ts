export const USER_ROLES = ["brand", "creator"] as const;
export const PLATFORMS = ["instagram", "youtube"] as const;

export type UserRole = "brand" | "creator";
export type Platform = "instagram" | "youtube";
