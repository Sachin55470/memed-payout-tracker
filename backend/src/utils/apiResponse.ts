import type { Response } from "express";

export function sendSuccess(res: Response, message: string, data?: unknown, statusCode = 200) {
  return res.status(statusCode).json({ success: true, statusCode, message, data });
}

export function sendError(res: Response, statusCode: number, message: string, errors?: unknown) {
  return res.status(statusCode).json({ success: false, statusCode, message, errors });
}
