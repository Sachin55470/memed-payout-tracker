import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/apiResponse";

export function notFound(_req: Request, res: Response) {
  sendError(res, 404, "Route not found");
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message);
  }

  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, 400, "Invalid id");
  }

  if (err.code === 11000) {
    return sendError(res, 409, "This already exists");
  }

  console.error(err);
  return sendError(res, 500, "Something went wrong");
}
