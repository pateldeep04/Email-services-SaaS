/**
 * MailBridge Email Feature Module
 */

import emailRoutes from "./email.routes.js";

export const emailModule = {
  mountPath: "/api/v1/emails",
  router: emailRoutes
};

export default emailModule;
