import mongoose from "mongoose";

export async function connectDB(uri: string): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;

  mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));
  mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
  return mongoose;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
