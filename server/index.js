// Force nodemon restart to pick up new env variables
import "dotenv/config";
import https from "https";
import http from "http";

if (!global.fetch) {
  global.fetch = function (url, options = {}) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith("https") ? https : http;
      const headers = { ...options.headers };
      let bodyData = options.body || "";
      
      if (typeof bodyData === "object") {
        bodyData = JSON.stringify(bodyData);
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
      }
      
      if (bodyData) {
        headers["Content-Length"] = Buffer.byteLength(bodyData);
      }

      const reqOptions = {
        method: options.method || "GET",
        headers: headers
      };

      const req = client.request(url, reqOptions, (res) => {
        let rawData = "";
        res.on("data", (chunk) => { rawData += chunk; });
        res.on("end", () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: {
              get: (headerName) => res.headers[headerName.toLowerCase()]
            },
            text: () => Promise.resolve(rawData),
            json: () => {
              try {
                return Promise.resolve(JSON.parse(rawData));
              } catch (_e) {
                return Promise.reject(new Error("Invalid JSON: " + rawData));
              }
            }
          });
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      if (bodyData) {
        req.write(bodyData);
      }
      req.end();
    });
  };
}

import express from "express";
import fs from "fs";
import cors from "cors";
import mongoose from "mongoose";
import dns from "dns";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import { createRateLimiter } from "./middleware/rateLimiter.js";

const app = express();
const port = process.env.PORT || 5000;

// Production Security Headers
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Canonical 301 redirect: consolidate www to apex domain for clean Google indexing
app.use((req, res, next) => {
  const host = req.get("host") || "";
  if (host.startsWith("www.mail-bridge.email")) {
    return res.redirect(301, `https://mail-bridge.email${req.originalUrl || req.url}`);
  }
  next();
});

function isAllowedCorsOrigin(origin) {
  if (!origin || origin === "null") {
    return true;
  }

  const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://mail-bridge.email",
    "https://www.mail-bridge.email"
  ].filter(Boolean);

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
      hostname === "mail-bridge.email" ||
      hostname.endsWith(".mail-bridge.email") ||
      hostname.endsWith(".onrender.com") ||
      hostname.endsWith(".loca.lt") ||
      hostname.endsWith(".devtunnels.ms") ||
      hostname.endsWith(".trycloudflare.com")
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

class SafeSessionStore extends session.Store {
  constructor() {
    super();
    this.sessions = new Map();
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [sid, sess] of this.sessions.entries()) {
        if (sess.expires && sess.expires <= now) {
          this.sessions.delete(sid);
        }
      }
    }, 15 * 60 * 1000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  get(sid, cb) {
    const sess = this.sessions.get(sid);
    if (!sess) return cb(null, null);
    if (sess.expires && sess.expires <= Date.now()) {
      this.sessions.delete(sid);
      return cb(null, null);
    }
    return cb(null, sess.data);
  }

  set(sid, sess, cb) {
    const expires = sess.cookie?.expires
      ? new Date(sess.cookie.expires).getTime()
      : Date.now() + (sess.cookie?.maxAge || 86400000);
    this.sessions.set(sid, { data: sess, expires });
    if (cb) cb(null);
  }

  destroy(sid, cb) {
    this.sessions.delete(sid);
    if (cb) cb(null);
  }

  touch(sid, sess, cb) {
    const existing = this.sessions.get(sid);
    if (existing) {
      const expires = sess.cookie?.expires
        ? new Date(sess.cookie.expires).getTime()
        : Date.now() + (sess.cookie?.maxAge || 86400000);
      existing.expires = expires;
    }
    if (cb) cb(null);
  }
}

const sessionConfig = {
  store: new SafeSessionStore(),
  secret: process.env.JWT_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

app.use(session(sessionConfig));

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
app.use("/api/v1/campaigns", campaignRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "../dist");
const hasDist = fs.existsSync(distPath);

if (process.env.NODE_ENV === "production" || hasDist) {
  // Explicit favicon.ico handler with caching to ensure search engines and browsers always receive valid ICO
  app.get("/favicon.ico", (_req, res) => {
    const icoDist = path.resolve(distPath, "favicon.ico");
    const icoPublic = path.resolve(__dirname, "../public/favicon.ico");
    const targetPath = fs.existsSync(icoDist) ? icoDist : icoPublic;
    if (fs.existsSync(targetPath)) {
      res.setHeader("Content-Type", "image/x-icon");
      res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      return res.sendFile(targetPath);
    }
    return res.status(404).end();
  });

  // Serve static assets with high-performance immutable caching
  app.use(express.static(distPath, {
    index: false,
    maxAge: "1d",
    setHeaders: (res, filePath) => {
      if (filePath.includes(path.sep + "assets" + path.sep)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    }
  }));

  // Prevent catch-all route from returning index.html for missing static assets (.css, .js, images, etc.)
  app.use((req, res, next) => {
    if (req.path.startsWith("/assets/") || path.extname(req.path)) {
      return res.status(404).send("Asset not found");
    }
    next();
  });

  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return next();
    }

    let responseHtml;
    try {
      responseHtml = fs.readFileSync(indexPath, "utf8");
    } catch (err) {
      return next(err);
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host") || "mail-bridge.email";
    const canonicalHost = (host.includes("mail-bridge.email")) ? "mail-bridge.email" : host;
    
    // Normalize path: strip trailing slash except for root '/'
    let cleanPath = req.path;
    if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
      cleanPath = cleanPath.slice(0, -1);
    }
    const canonicalUrl = `${protocol}://${canonicalHost}${cleanPath}`;
    
    const ROUTE_METADATA = {
      "/": {
        title: "MailBridge | Free Cold Email Outreach Platform & Gmail SMTP Relay API",
        description: "MailBridge is an open-source, free cold email outreach tool and developer transactional email API. Send personalized bulk email campaigns via Gmail SMTP, qualify hot leads in real-time, test email spam score, and trigger carrier SMS with zero vendor fees.",
        keywords: "cold email outreach tool, free bulk mailer, gmail smtp relay, email spam checker, cold lead pipeline saas, transactional email api, email gateway, sms gateway, otp verification, excel mail merge, developer email service, lead tracking pipeline, mailbridge"
      },
      "/bulk-mail": {
        title: "Bulk Mailer & Cold Email Lead Generation SaaS | Free Gmail Relay | MailBridge",
        description: "Send personalized bulk emails via CSV or Excel with free Gmail SMTP relay. Track real-time email opens, qualify hot sales leads, and manage outreach campaigns with zero vendor fees.",
        keywords: "bulk mailer saas, free bulk email sender, csv email sender, excel mail merge, gmail smtp bulk email, cold outreach tool, email campaign tracker, lead qualification pipeline, personalized bulk email, mailbridge"
      },
      "/docs": {
        title: "API Documentation & Developer Quickstart | MailBridge",
        description: "Comprehensive MailBridge developer documentation for transactional email and SMS APIs. Includes cURL, Node.js, Python, and Go code snippets.",
        keywords: "mailbridge docs, email api documentation, sms api docs, verify otp endpoint, free email relay docs, developer email gateway"
      },
      "/register": {
        title: "Create Free Account | MailBridge Email & Bulk Mailer SaaS",
        description: "Sign up for MailBridge to get instant API keys, connect Gmail SMTP relay, and start sending transactional emails and bulk campaigns for free.",
        keywords: "mailbridge sign up, create free email api account, free gmail smtp relay account"
      },
      "/login": {
        title: "Login | MailBridge Developer & Bulk Mailer Portal",
        description: "Sign in to your MailBridge account to manage API keys, view transactional logs, track bulk email campaigns, and monitor lead pipelines.",
        keywords: "mailbridge login, email api dashboard login, developer portal"
      }
    };

    const meta = ROUTE_METADATA[cleanPath] || ROUTE_METADATA["/"];
    if (meta) {
      responseHtml = responseHtml.replace(/<title>[^<]*<\/title>/i, `<title>${meta.title}</title>`);
      responseHtml = responseHtml.replace(
        /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta name="description" content="${meta.description}" />`
      );
      responseHtml = responseHtml.replace(
        /<meta\s+name=["']keywords["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta name="keywords" content="${meta.keywords}" />`
      );
      responseHtml = responseHtml.replace(
        /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta property="og:title" content="${meta.title}" />`
      );
      responseHtml = responseHtml.replace(
        /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta name="twitter:title" content="${meta.title}" />`
      );
      responseHtml = responseHtml.replace(
        /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta property="og:description" content="${meta.description}" />`
      );
      responseHtml = responseHtml.replace(
        /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta name="twitter:description" content="${meta.description}" />`
      );
      responseHtml = responseHtml.replace(
        /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      );
      responseHtml = responseHtml.replace(
        /<meta\s+name=["']twitter:url["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta name="twitter:url" content="${canonicalUrl}" />`
      );

      if (cleanPath.startsWith("/dashboard") || cleanPath.startsWith("/tester")) {
        responseHtml = responseHtml.replace(
          /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>/i,
          `<meta name="robots" content="noindex, nofollow" />`
        );
      }
    }

    const canonicalRegex = /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i;
    const replacement = `<link rel="canonical" href="${canonicalUrl}" />`;
    
    if (canonicalRegex.test(responseHtml)) {
      responseHtml = responseHtml.replace(canonicalRegex, replacement);
    } else {
      responseHtml = responseHtml.replace("</head>", `  ${replacement}\n  </head>`);
    }
    
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(responseHtml);
  });
} else {
  console.warn("⚠️ Production build folder (dist) not found. Run 'npm run build' to generate frontend production assets.");
}

app.use((err, _req, res, _next) => {
  if (!err.status || err.status >= 500) {
    console.error(err);
  }

  let errorMessage = err.message || "Something went wrong";
  if (errorMessage.toLowerCase().includes("bad auth") || errorMessage.toLowerCase().includes("authentication failed")) {
    errorMessage = "Database authentication failed. Please check your MongoDB username and password in .env.";
  }

  res.status(err.status || 500).json({
    error: errorMessage,
    details: err.details
  });
});

async function start() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log("MongoDB connected");
    } catch (error) {
      let connected = false;
      if (
        error.message.includes("querySrv") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED")
      ) {
        try {
          dns.setServers(["8.8.8.8", "1.1.1.1"]);
          await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
          console.log("MongoDB connected (via public DNS fallback)");
          connected = true;
        } catch (_retryError) {
          // DNS retry failed
        }
      }

      if (!connected) {
        await mongoose.disconnect().catch(() => {});
        console.warn(`MongoDB unavailable (${error.message}). Using safe in-memory store.`);
      }
    }
  } else {
    console.warn("No MongoDB URI configured. Using safe in-memory store.");
  }

  if (process.env.NODE_ENV !== "test") {
    const server = app.listen(port, () => {
      console.log(`MailBridge API running on http://localhost:${port}`);
    });

    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        try {
          if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
          }
        } catch (_closeErr) {
          // Ignore connection close errors on shutdown
        }
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 5000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  }
}

start();

export default app;

