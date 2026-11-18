/**
 * MailBridge Webhooks Feature Module
 */

import webhookRoutes from "./webhook.routes.js";

export const webhookModule = {
  mountPath: "/api/v1/webhooks",
  router: webhookRoutes
};

export default webhookModule;
