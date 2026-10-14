import { connectDB } from "./db";
import { connectRedis } from "./redis";

let connecting: Promise<void> | null = null;

// Connects to MongoDB and Redis once and reuses that for every request after.
// On Vercel there is no server.ts start(), so this runs on the first request.
// If several requests arrive together they all wait for the same connection.
export function connectDatabases() {
  if (!connecting) {
    connecting = (async () => {
      const uri = process.env.MONGODB_URI;
      if (!uri) throw new Error("MONGODB_URI is not set");
      if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
      if (!process.env.REDIS_URL) throw new Error("REDIS_URL is not set");

      await connectDB(uri);
      await connectRedis();
    })();

    // if it failed, let the next request try again
    connecting.catch(() => {
      connecting = null;
    });
  }
  return connecting;
}
