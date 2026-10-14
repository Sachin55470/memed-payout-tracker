import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { sendError } from "@/utils/apiResponse";

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return sendError(res, 400, errors[0]?.message ?? "Invalid input", errors);
    }
    req.body = result.data;
    return next();
  };
}
