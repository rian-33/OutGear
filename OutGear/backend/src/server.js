import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import productRoutes from "./routes/productRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Terlalu banyak permintaan, silakan coba lagi nanti.",
});
app.use("/api", limiter);

// ===== ROUTES =====
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

// ===== KONEKSI DATABASE =====
let server;

async function startServer() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("✅ Connected to MongoDB");

    await new Promise((resolve, reject) => {
      server = app.listen(env.port, () => {
        console.log(`🚀 Server running on http://localhost:${env.port}`);
        resolve();
      });
      server.once("error", reject);
    });
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.error(
        `❌ Port ${env.port} is already in use. Stop the existing backend process or set another PORT in .env.`,
      );
    } else {
      console.error("❌ Server startup failed:", error);
    }
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

function shutdown(signal) {
  console.log(`\n${signal} received. Closing server gracefully...`);
  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close();
        console.log("Database connection closed. Bye!");
        process.exit(0);
      } catch (error) {
        console.error("Error closing DB:", error);
        process.exit(1);
      }
    });
  } else {
    mongoose.connection.close().finally(() => process.exit(0));
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();

export default app;
