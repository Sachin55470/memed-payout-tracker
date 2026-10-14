import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@/constants";
import { AppError } from "@/utils/AppError";
import { ACCESS_COOKIE } from "@/utils/tokens";

export function protect(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies[ACCESS_COOKIE];
  if (!token) {
    throw new AppError(401, "Please log in");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: UserRole };
    req.user = { id: payload.id, role: payload.role };
  } catch {
    throw new AppError(401, "Session expired, please log in again");
  }
  next();
}

export function allowRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, "You are not allowed to do this");
    }
    next();
  };
}
