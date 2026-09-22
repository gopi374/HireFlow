import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import crypto from "crypto";
import apiRoutes from "./routes/index.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["http://localhost:3000", "http://localhost:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true); // Dev fallback
      }
    },
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests, please try again later." } },
});
app.use("/api", limiter);

// Request ID & Body Parsing
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads serving
app.use("/uploads", express.static(path.resolve("uploads")));

// Health & Readiness checks
app.get("/health", (req, res) => res.status(200).json({ status: "OK", timestamp: new Date().toISOString() }));
app.get("/ready", (req, res) => res.status(200).json({ status: "READY", timestamp: new Date().toISOString() }));

// API routes
app.use("/api/v1", apiRoutes);
app.use("/api/auth", apiRoutes); // Backwards compatibility for /api/auth

app.get("/", (req, res) => {
  res.json({
    name: "HireFlow ATS API",
    version: "1.0.0",
    status: "healthy",
    docs: "/api/v1",
  });
});

// Centralized error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
