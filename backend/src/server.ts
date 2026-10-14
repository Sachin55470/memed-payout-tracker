import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";
import { connectRedis } from "./config/redis";

const PORT = process.env.PORT ?? 5000;

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL is not set");

  await connectDB(uri);
  await connectRedis();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
