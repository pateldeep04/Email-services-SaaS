/**
 * MailBridge Admin Feature Module
 */

import adminRoutes from "./admin.routes.js";

export const adminModule = {
  mountPath: "/api/v1/admin",
  router: adminRoutes
};

export default adminModule;
