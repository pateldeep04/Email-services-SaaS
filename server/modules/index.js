/**
 * MailBridge Modules - Feature Registry & Route Loader
 * Mounts modular, domain-driven feature routers onto Express.
 */

import { authModule } from "./auth/index.js";
import { emailModule } from "./email/index.js";
import { smsModule } from "./sms/index.js";
import { campaignModule } from "./campaigns/index.js";
import { webhookModule } from "./webhooks/index.js";
import { adminModule } from "./admin/index.js";
import { aiModule } from "./ai/index.js";

export const featureModules = [
  authModule,
  emailModule,
  smsModule,
  campaignModule,
  webhookModule,
  adminModule,
  aiModule
];

/**
 * Automatically registers all domain modules onto the Express app
 * @param {import("express").Application} app
 */
export function registerFeatureModules(app) {
  featureModules.forEach((mod) => {
    app.use(mod.mountPath, mod.router);
  });
}

export default registerFeatureModules;
