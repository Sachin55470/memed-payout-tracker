import { z } from "zod";

export const createSubmissionSchema = z.object({
  postUrl: z.url("Invalid URL"),
});

export const updateViewsSchema = z.object({
  views: z.number().int().min(0),
});
