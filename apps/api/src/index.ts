import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { apiRouter } from "./routes";
import { requestIdMiddleware } from "./middleware/request-id";
import { errorHandler } from "./middleware/error-handler";
import { InventoryService } from "./services/inventory.service";
import { prisma } from "./prisma";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Security & utility middleware
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://muschio.luxury",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, SSR)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost:")
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(requestIdMiddleware);
app.use(morgan("dev"));

// Health checks
app.get("/health/live", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/health/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "unready", database: "disconnected" });
  }
});

// Mount versioned API routes
app.use("/api/v1", apiRouter);

// Global error handler
app.use(errorHandler);

// Background reconciliation for expired 15-minute inventory reservations
setInterval(async () => {
  try {
    const result = await InventoryService.reconcileExpiredReservations();
    if (result.releasedCount > 0) {
      console.log(`[Inventory Reconciliation] Released ${result.releasedCount} expired reservations`);
    }
  } catch (err) {
    console.error("[Inventory Reconciliation Error]", err);
  }
}, 60 * 1000); // Check every 60 seconds

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`✨ Muschio Haute Parfumerie API running on port ${PORT}`);
    console.log(`📍 Endpoint: http://localhost:${PORT}/api/v1`);
  });
}

export default app;
