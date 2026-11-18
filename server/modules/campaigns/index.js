/**
 * MailBridge Campaign Feature Module
 */

import campaignRoutes from "./campaign.routes.js";

export const campaignModule = {
  mountPath: "/api/v1/campaigns",
  router: campaignRoutes
};

export default campaignModule;
