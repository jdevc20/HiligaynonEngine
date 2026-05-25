import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Optional: validate port
if (Number.isNaN(PORT)) {
  throw new Error("Invalid PORT value in environment variables");
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});

// Graceful shutdown handling (important for Render / production)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});