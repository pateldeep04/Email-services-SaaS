/**
 * MailBridge SMS Feature Module
 */

import smsRoutes from "./sms.routes.js";

export const smsModule = {
  mountPath: "/api/v1/sms",
  router: smsRoutes
};

export default smsModule;
