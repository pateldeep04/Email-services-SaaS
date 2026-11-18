/**
 * MailBridge AI Feature Module
 */

import aiRoutes from "./ai.routes.js";

export const aiModule = {
  mountPath: "/api/v1/ai",
  router: aiRoutes
};

export default aiModule;
