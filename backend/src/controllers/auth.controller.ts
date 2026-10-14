import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "@/models/user.model";
import { AppError } from "@/utils/AppError";
import { sendSuccess } from "@/utils/apiResponse";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ROLE_COOKIE,
  accessCookieOptions,
  createAccessToken,
  createRefreshToken,
  deleteRefreshToken,
  getUserIdFromRefreshToken,
  refreshCookieOptions,
  roleCookieOptions,
} from "@/utils/tokens";

type UserInfo = { id: string; name: string; email: string; role: string };


async function sendTokens(res: Response, user: UserInfo, message: string, statusCode = 200) {
  const accessToken = createAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions());
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  res.cookie(ROLE_COOKIE, user.role, roleCookieOptions());
  const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
  sendSuccess(res, message, { user: userData }, statusCode);
}

function clearTokens(res: Response) {
  res.clearCookie(ACCESS_COOKIE, accessCookieOptions());
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
  res.clearCookie(ROLE_COOKIE, roleCookieOptions());
}

export async function signup(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, "Email is already registered");
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });

  await sendTokens(res, user, "Account created", 201);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, "Invalid email or password");
  }

  await sendTokens(res, user, "Logged in");
}


export async function refresh(req: Request, res: Response) {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) {
    // also clears the role cookie, so the frontend stops treating the user as logged in
    clearTokens(res);
    throw new AppError(401, "Please log in");
  }

  const userId = await getUserIdFromRefreshToken(token);
  if (!userId) {
    clearTokens(res);
    throw new AppError(401, "Session expired, please log in again");
  }

  await deleteRefreshToken(token);

  const user = await User.findById(userId);
  if (!user) {
    clearTokens(res);
    throw new AppError(401, "Please log in");
  }

  await sendTokens(res, user, "Session refreshed");
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies[REFRESH_COOKIE];
  if (token) {
    await deleteRefreshToken(token);
  }

  clearTokens(res);
  sendSuccess(res, "Logged out");
}

export async function getMe(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
  sendSuccess(res, "User fetched", { user: userData });
}
