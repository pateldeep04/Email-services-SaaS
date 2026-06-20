// Force nodemon restart to pick up new env variables
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { createRateLimiter } from "./middleware/rateLimiter.js";

const app = express();
const port = process.env.PORT || 5000;

function isAllowedCorsOrigin(origin) {
  if (!origin || origin === "null") {
    return true;
  }

  const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);

    return (
      protocol === "file:" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".onrender.com") ||
      hostname.endsWith(".loca.lt") ||
      hostname.endsWith(".devtunnels.ms")
    );
  } catch {
    return false;
  }
}

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (isAllowedCorsOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }
}));

app.set("trust proxy", 1);

app.use(session({
  secret: process.env.JWT_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json({ limit: "1mb" }));

const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many requests to the API, please try again later."
});

app.use("/api/v1", globalRateLimiter);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "MailBridge Email API",
    database: mongoose.connection.readyState === 1 ? "mongodb" : "memory",
    smtpConfigured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/emails", emailRoutes);
app.use("/api/v1/sms", smsRoutes);
app.use("/api/v1/ai", aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong",
    details: err.details
  });
});

async function start() {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected");
    } catch (error) {
      console.warn("MongoDB unavailable. Using in-memory demo store.");
      console.warn(error.message);
    }
  }

  if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => {
      console.log(`MailBridge API running on http://localhost:${port}`);
    });
  }
}

start();

export default app;
