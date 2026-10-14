import crypto from "crypto";
import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import { redis } from "@/config/redis";

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_DAYS = 7;
const REFRESH_TOKEN_SECONDS = REFRESH_TOKEN_DAYS * 24 * 60 * 60;

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";
export const ROLE_COOKIE = "role";

export function createAccessToken(userId: string, role: string) {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_SECONDS });
}

export async function createRefreshToken(userId: string) {
  const token = crypto.randomBytes(40).toString("hex");
  await redis.set(`refresh:${token}`, userId, { EX: REFRESH_TOKEN_SECONDS });
  return token;
}

export async function getUserIdFromRefreshToken(token: string) {
  return redis.get(`refresh:${token}`);
}

export async function deleteRefreshToken(token: string) {
  await redis.del(`refresh:${token}`);
}

function baseCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };
}


export function accessCookieOptions(): CookieOptions {
  return { ...baseCookieOptions(), path: "/", maxAge: ACCESS_TOKEN_SECONDS * 1000 };
}

export function refreshCookieOptions(): CookieOptions {
  return { ...baseCookieOptions(), path: "/api/auth", maxAge: REFRESH_TOKEN_SECONDS * 1000 };
}

// Not a secret. The frontend proxy reads it to decide which page to show.
// It lives as long as the refresh token. The API never trusts it.
export function roleCookieOptions(): CookieOptions {
  return { ...baseCookieOptions(), path: "/", maxAge: REFRESH_TOKEN_SECONDS * 1000 };
}
