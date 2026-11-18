// Force nodemon restart to pick up new env variables
import "dotenv/config";
import https from "https";
import http from "http";

// HTTP fetch polyfill for older runtime environments
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
import { bootstrapApp, finalizeApp, bootstrapServices, setupGracefulShutdown } from "./bootstrap/index.js";
import { registerFeatureModules } from "./modules/index.js";
import { logger } from "./bootstrap/logger.js";

const app = express();
const port = process.env.PORT || 5000;

// 1. Initialize Baseline Bootstrap (CORS, Security, Session, RateLimit, Telemetry)
bootstrapApp(app);

// 2. Mount Domain Feature Modules
registerFeatureModules(app);

// 3. Finalize Frontend Static Assets & Global Error Handler
finalizeApp(app);

// 4. Start Server & Connect Asynchronous Services
async function start() {
  await bootstrapServices();

  if (process.env.NODE_ENV !== "test") {
    const server = app.listen(port, () => {
      logger.info(`MailBridge API running on http://localhost:${port}`);
    });
    setupGracefulShutdown(server);
  }
}

start();

export default app;
