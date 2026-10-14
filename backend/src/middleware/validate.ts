import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Target = "body" | "query" | "params";

export const validate =
  (schema: ZodType, target: Target = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    res.locals[target] = result.data;
    if (target === "body") req.body = result.data;
    return next();
  };
