import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/api.routes.js";
import { securityHeaders } from "./middleware/authMiddleware.js";
import { connectDB, isDbConnected } from "./config/db.js";
import { syncFromMongo } from "./data/dataStore.js";
import { startCronJobs } from "./services/cronService.js";
import { startKeepAlive } from "./services/keepAliveService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Allowed origins for CORS (blocks cross-site script request from unauthorized third-party domains)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

if (CLIENT_URL && CLIENT_URL !== "*") {
  CLIENT_URL.split(",").forEach((u) => {
    const trimmed = u.trim().replace(/\/$/, "");
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

// Security Headers Middleware (Clickjacking, MIME Sniffing, XSS protection)
app.use(securityHeaders);

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");

      // Allow wildcard, registered origins, and all onrender / vercel deployment subdomains
      if (
        CLIENT_URL === "*" ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith(".onrender.com") ||
        cleanOrigin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      console.warn(`Blocked by CORS: ${cleanOrigin}`);
      callback(new Error(`Blocked by CORS policy: Origin ${cleanOrigin} is not authorized`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded PDFs & documents statically
const UPLOAD_DIR = path.resolve(__dirname, "../uploads");
app.use("/uploads", express.static(UPLOAD_DIR));

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to GuruKripa API Server",
    documentation: "/api/health",
    healthCheck: "/api/health"
  });
});

// API Routes
app.use("/api", apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

app.listen(PORT, async () => {
  await connectDB();
  if (isDbConnected()) {
    await syncFromMongo();
  }
  startCronJobs();
  startKeepAlive();
  console.log(`===============================================`);
  console.log(`🚀 GuruKripa Secure Server running on http://localhost:${PORT}`);
  console.log(`🛡️  Security Headers & Auth Guard active`);
  console.log(`🍃 Database mode: ${isDbConnected() ? "MongoDB Atlas (Online)" : "Fallback JSON Datastore"}`);
  console.log(`📡 CORS restricted to: ${allowedOrigins.join(", ")}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
