/**
 * MailBridge Bootstrap - Static Frontend Assets & SEO Metadata Server
 * Handles Vite production build delivery, favicon caching, and dynamic Open Graph tag injection.
 */

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../../dist");

export function initStaticAssets(app) {
  const hasDist = fs.existsSync(distPath);

  if (!hasDist && process.env.NODE_ENV === "production") {
    logger.warn("⚠️ Production build folder (dist) not found. Run 'npm run build' to generate frontend production assets.");
    return;
  }

  if (!hasDist) {
    return;
  }

  // Explicit favicon.ico handler with caching to ensure search engines and browsers always receive valid ICO
  app.get("/favicon.ico", (_req, res) => {
    const icoDist = path.resolve(distPath, "favicon.ico");
    const icoPublic = path.resolve(__dirname, "../../public/favicon.ico");
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

  // SPA Catch-All with Dynamic SEO and Open Graph Tag Injection
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

    const host = req.get("host") || "mail-bridge.email";
    const canonicalHost = (host.includes("mail-bridge.email")) ? "mail-bridge.email" : host;
    
    // Normalize path: strip trailing slash except for root '/'
    let cleanPath = req.path;
    if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
      cleanPath = cleanPath.slice(0, -1);
    }
    
    // Enforce HTTPS canonical URLs in production to prevent canonical mismatch
    const canonicalProtocol = (canonicalHost.includes("localhost") || canonicalHost.includes("127.0.0.1")) 
      ? (req.protocol || "http") 
      : "https";
    const canonicalUrl = `${canonicalProtocol}://${canonicalHost}${cleanPath}`;
    
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

      if (cleanPath.startsWith("/dashboard") || cleanPath.startsWith("/tester") || cleanPath === "/login" || cleanPath === "/register") {
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
}

export default initStaticAssets;
