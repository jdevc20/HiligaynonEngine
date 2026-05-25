import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

// Validate port
if (!Number.isFinite(PORT) || PORT <= 0) {
  console.error("❌ Invalid PORT:", process.env.PORT);
  process.exit(1);
}

let server: any;

async function startServer() {
  try {
    console.log("🚀 Starting server...");

    server = app.listen(PORT, HOST, () => {
      console.log(`✅ Server running at http://${HOST}:${PORT}`);
      console.log(`📡 Health check: http://${HOST}:${PORT}/health`);
    });

    // Handle server errors
    server.on("error", (err: any) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n📴 ${signal} received. Shutting down...`);

  if (server) {
    server.close(() => {
      console.log("🧹 HTTP server closed.");
      process.exit(0);
    });

    // Force shutdown after timeout (Render safety)
    setTimeout(() => {
      console.warn("⚠️ Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();