/**
 * MailBridge Auth Feature Module
 */

import authRoutes from "./auth.routes.js";

export const authModule = {
  mountPath: "/api/v1/auth",
  router: authRoutes
};

export default authModule;
