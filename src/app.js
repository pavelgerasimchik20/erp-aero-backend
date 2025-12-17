import cors from "cors";
import express, { json, urlencoded } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import fileRouter from "./routes/file.routes.js";
import dbInit from "./utils/dbInit.js";
import { errorHandler, asyncHandler } from "./utils/error.js";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(json());
app.use(urlencoded({ extended: true }));

// DB init
const { checkDatabaseConnection, initializeDatabase } = dbInit;

initializeDatabase().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("❌ Database initialization failed:", err.message);
});

// Health check
app.get(
  "/health",
  asyncHandler(async (req, res) => {
    const dbStatus = await checkDatabaseConnection();

    res.json({
      status: "OK",
      message: "ERP.AERO Backend API is running",
      database: dbStatus ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  }),
);

// Root info
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ERP.AERO API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/*",
      health: "/health",
    },
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/file", fileRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Database: ${process.env.DB_STORAGE || "./database.sqlite"}`);
});

export default app;
