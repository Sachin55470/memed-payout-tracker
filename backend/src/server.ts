import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db";

const app = express();
const PORT = process.env.PORT ?? 5000;

// Render/Vercel sit behind a proxy; needed so rate limiting sees the real client IP
app.set("trust proxy", 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await connectDB(uri);
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
