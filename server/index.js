// Force nodemon restart to pick up new env variables
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      process.env.CLIENT_URL
    ].filter(Boolean);

    if (
      !origin ||
      origin === "null" ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".onrender.com") ||
      origin.includes("loca.lt") ||
      origin.endsWith(".devtunnels.ms")
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  }
}));

app.use((req, res, next) => {
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  session({
    secret: process.env.JWT_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isHttps,
      httpOnly: true,
      sameSite: isHttps ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })(req, res, next);
});

app.use(express.json({ limit: "1mb" }));


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

  app.listen(port, () => {
    console.log(`MailBridge API running on http://localhost:${port}`);
  });
}

start();
