import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import crypto from "crypto";
import apiRoutes from "./routes/index.js";
import connectDB from "./config/db.js"
const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS
const allowedOrigins = process.env.CORS_ORIGINS || "http://localhost:5173";
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
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
app.get("/health", (req, res) => 
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString() 
  })
);

app.get("/ready", (req, res) => 
  res.status(200).json({ 
    status: "READY", 
    timestamp: new Date().toISOString() 
  })
);

// API routes
app.use("/api/v1", apiRoutes);
app.use("/api/auth", apiRoutes); 

app.get("/", (req, res) => {
  res.json({
    name: "HireFlow ATS API",
    version: "1.0.0",
    status: "healthy",
    docs: "/api/v1",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 HireFlow Server running at http://localhost:${PORT}`);
      console.log(`📄 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
