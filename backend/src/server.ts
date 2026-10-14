import "dotenv/config";
import app from "./app";
import { connectDatabases } from "./config/connect";

const PORT = process.env.PORT ?? 5000;

// used for local dev, Docker and Render. On Vercel, app.ts is used directly.
async function start() {
  await connectDatabases();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
