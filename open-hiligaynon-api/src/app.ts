import express from "express";
import cors from "cors";

import sentenceRoutes from "./routes/sentence.routes.js";
import engineRoutes from "./routes/engine.routes.js";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// Compatibility API used by the current Open Hiligaynon UI.
app.use("/api/sentences", sentenceRoutes);

// Linguistic engine API for dictionary, analysis, and training-data workflows.
app.use("/api/engine", engineRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "open-hiligaynon-api",
    engine: "linguistic-data-v2",
  });
});

export default app;
