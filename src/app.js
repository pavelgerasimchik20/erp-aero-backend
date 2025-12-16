import cors from "cors";
import express, { json, urlencoded } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));

// db init
import dbInit from "./utils/dbInit.js";
const { checkDatabaseConnection, initializeDatabase } = dbInit;

let dbInitialized = false;

initializeDatabase()
  .then(() => {
    dbInitialized = true;
    console.log("✅ Database initialized successfully");
  })
  .catch((err) => {
    console.error("❌ Database initialization failed:", err.message);
  });

// Health check
app.get("/health", async (req, res) => {
  const dbStatus = await checkDatabaseConnection();

  res.json({
    status: "OK",
    message: "ERP.AERO Backend API is running",
    database: dbStatus ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ERP.AERO API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/*",
      files: "/api/files/*",
      health: "/health",
    },
  });
});

// routes
// app.use("/api/auth", authRoutes);
// app.use("/api/files", fileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Something went wrong";

  res.status(statusCode).json({
    error: "Internal Server Error",
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Database: ${process.env.DB_STORAGE || "./database.sqlite"}`);
});

export default app;
