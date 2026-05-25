import express from "express";
import cors from "cors";
import sentenceRoutes from "./routes/sentence.routes.js";
const app = express();
/**
 * Middleware
 */
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
/**
 * Routes
 */
app.use("/api/sentences", sentenceRoutes);
/**
 * Health check (important for Render)
 */
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
export default app;
