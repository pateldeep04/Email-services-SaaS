import crypto from "crypto";

const emailLogs = [];
const otpTokens = [];
const users = [];
const apiKeys = [];
const campaigns = [];
const webhookEndpoints = [];
const webhookDeliveryLogs = [];

export const memoryStore = {
  async createLog(log) {
    const item = {
      _id: crypto.randomUUID(),
      ...log,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    emailLogs.unshift(item);
    return item;
  },

  async listLogs(limit = 20, userId = null) {
    if (userId) {
      return emailLogs.filter(log => String(log.userId) === String(userId)).slice(0, limit);
    }
    return emailLogs.slice(0, limit);
  },

  async getPaginatedLogs(userId, { page = 1, limit = 10, search = "", status = "all", type = "all" }) {
    let filtered = emailLogs.filter(log => String(log.userId) === String(userId));
    if (status !== "all") {
      filtered = filtered.filter(log => log.status === status);
    }
    if (type !== "all") {
      filtered = filtered.filter(log => log.type === type);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(log => 
        log.to.toLowerCase().includes(lowerSearch) || 
        (log.subject && log.subject.toLowerCase().includes(lowerSearch))
      );
    }
    const totalLogs = filtered.length;
    const totalPages = Math.ceil(totalLogs / limit) || 1;
    const logs = filtered.slice((page - 1) * limit, page * limit);
    return { logs, totalLogs, totalPages };
  },

  async createOtp(token) {
    otpTokens.unshift({
      _id: crypto.randomUUID(),
      ...token,
      used: false,
      createdAt: new Date().toISOString()
    });
  },

  async findLatestOtp(email, purpose, userId = null, apiKey = null) {
    return otpTokens.find(
      (token) =>
        token.email === email &&
        token.purpose === purpose &&
        !token.used &&
        (userId ? String(token.userId) === String(userId) : (apiKey ? token.apiKey === apiKey : true))
    );
  },

  async markOtpUsed(token) {
    token.used = true;
  },

  async createUser(user) {
    const item = {
      _id: crypto.randomUUID(),
      useGlobalTemplateSettings: true,
      templateSettings: {
        brandName: "My Brand",
        logoUrl: "",
        colorHeaderBg: "#0f766e",
        colorHeaderText: "#ffffff",
        colorButtonBg: "#0f766e",
        colorBgLight: "#f1f5f9",
        emailFooter: "© 2026 MailBridge. All rights reserved.",
        emailActionText: "Get Started",
        emailActionUrl: "https://mail-bridge.email",
        showButton: true
      },
      senderName: "",
      senderEmail: "",
      smtpSettings: {
        enabled: false,
        host: "",
        port: 587,
        secure: false,
        user: "",
        pass: "",
        fromEmail: "",
        fromName: ""
      },
      smsSettings: {
        enabled: false,
        phoneNumber: "",
        carrierGateway: "",
        simulationMode: true,
        gatewayUrl: "https://api.sms-gate.app/3rdparty/v1/messages",
        gatewayUser: "",
        gatewayPass: ""
      },
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.unshift(item);
    
    // Auto-create a default API key in the apiKeys array too
    if (item.apiKey) {
      apiKeys.push({
        _id: crypto.randomUUID(),
        name: "Default Key",
        key: item.apiKey,
        userId: item._id,
        styleType: "global",
        templateSettings: { ...item.templateSettings },
        createdAt: new Date().toISOString()
      });
    }
    
    return item;
  },

  async findUserByEmail(email) {
    return users.find((user) => user.email === email);
  },

  async findUserById(id) {
    return users.find((user) => user._id === id);
  },

  async findUserByApiKey(providedKey) {
    // 1. Search in the new apiKeys collection
    const keyDoc = apiKeys.find((k) => k.key === providedKey);
    if (keyDoc) {
      keyDoc.lastUsedAt = new Date().toISOString();
      return users.find((u) => u._id === keyDoc.userId);
    }
    // 2. Search in legacy user.apiKey field
    return users.find((user) => user.apiKey === providedKey);
  },

  async updateUserApiKey(user, apiKey) {
    const existing = users.find((entry) => entry._id === user._id);
    if (existing) {
      existing.apiKey = apiKey;
      existing.updatedAt = new Date().toISOString();
      
      // Update or add in apiKeys array
      const existingKeyIdx = apiKeys.findIndex(k => k.userId === user._id && k.name === "Default Key");
      if (existingKeyIdx !== -1) {
        apiKeys[existingKeyIdx].key = apiKey;
      } else {
        apiKeys.push({
          _id: crypto.randomUUID(),
          name: "Default Key",
          key: apiKey,
          userId: user._id,
          styleType: "global",
          templateSettings: { ...existing.templateSettings },
          createdAt: new Date().toISOString()
        });
      }
      return existing;
    }
    return null;
  },

  // API Key Management Methods
  findApiKey(providedKey) {
    return apiKeys.find((k) => k.key === providedKey);
  },

  findApiKeyByIdAndUser(keyId, userId) {
    return apiKeys.find(k => String(k._id) === String(keyId) && String(k.userId) === String(userId));
  },

  async createApiKey(userId, name, key) {
    const item = {
      _id: crypto.randomUUID(),
      name,
      key,
      userId,
      styleType: "global",
      templateSettings: {
        brandName: "My Brand",
        logoUrl: "",
        colorHeaderBg: "#0f766e",
        colorHeaderText: "#ffffff",
        colorButtonBg: "#0f766e",
        colorBgLight: "#f1f5f9",
        emailFooter: "© 2026 MailBridge. All rights reserved.",
        emailActionText: "Get Started",
        emailActionUrl: "https://mail-bridge.email",
        showButton: true
      },
      createdAt: new Date().toISOString()
    };
    apiKeys.push(item);
    return item;
  },

  async createApiKeyWithSettings(userId, name, key, templateSettings, styleType = "global") {
    const item = {
      _id: crypto.randomUUID(),
      name,
      key,
      userId,
      styleType,
      templateSettings,
      createdAt: new Date().toISOString()
    };
    apiKeys.push(item);
    return item;
  },

  async listApiKeys(userId) {
    return apiKeys.filter(k => String(k.userId) === String(userId));
  },

  async deleteApiKey(userId, keyId) {
    const idx = apiKeys.findIndex(k => String(k._id) === String(keyId) && String(k.userId) === String(userId));
    if (idx !== -1) {
      apiKeys.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Email Analytics Stats helper
  async getEmailStats(userId) {
    const userLogs = emailLogs.filter(log => String(log.userId) === String(userId));
    const total = userLogs.length;
    const sent = userLogs.filter(log => log.status === "sent").length;
    const simulated = userLogs.filter(log => log.status === "simulated").length;
    const failed = userLogs.filter(log => log.status === "failed").length;
    
    // Group by type
    const byType = {
      welcome: userLogs.filter(log => log.type === "welcome").length,
      otp: userLogs.filter(log => log.type === "otp").length,
      "forgot-password": userLogs.filter(log => log.type === "forgot-password").length,
      notification: userLogs.filter(log => log.type === "notification").length,
      custom: userLogs.filter(log => log.type === "custom").length,
      "sms-otp": userLogs.filter(log => log.type === "sms-otp").length
    };

    return {
      total,
      sent,
      simulated,
      failed,
      byType
    };
  },

  // Bulk Campaign Methods
  async createCampaign(campaignData) {
    const item = {
      _id: crypto.randomUUID(),
      userId: campaignData.userId,
      name: campaignData.name,
      subject: campaignData.subject,
      body: campaignData.body,
      senderName: campaignData.senderName || "",
      senderEmail: campaignData.senderEmail || "",
      ctaButtonText: campaignData.ctaButtonText || "",
      ctaTargetUrl: campaignData.ctaTargetUrl || "",
      totalRecipients: campaignData.totalRecipients || (campaignData.recipients ? campaignData.recipients.length : 0),
      sentCount: campaignData.sentCount || 0,
      failedCount: campaignData.failedCount || 0,
      openedCount: campaignData.openedCount || 0,
      clickedCount: campaignData.clickedCount || 0,
      recipients: (campaignData.recipients || []).map(r => ({
        ...r,
        opened: r.opened || false,
        openCount: r.openCount || 0,
        openedAt: r.openedAt || null,
        lastOpenedAt: r.lastOpenedAt || null,
        clicked: r.clicked || false,
        clickedAt: r.clickedAt || null,
        clickCount: r.clickCount || 0
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    campaigns.unshift(item);
    return item;
  },

  async listCampaigns(userId) {
    return campaigns
      .filter(c => !userId || String(c.userId) === String(userId))
      .map(c => {
        const opened = c.recipients.filter(r => r.opened).length;
        const clicked = c.recipients.filter(r => r.clicked).length;
        return {
          ...c,
          openedCount: opened,
          clickedCount: clicked
        };
      });
  },

  async getCampaignById(id, userId) {
    return campaigns.find(c => String(c._id) === String(id) && (!userId || String(c.userId) === String(userId))) || null;
  },

  async updateCampaignRecipient(campaignId, trackingId, updates) {
    const campaign = campaigns.find(c => String(c._id) === String(campaignId));
    if (!campaign) return null;
    const recipient = campaign.recipients.find(r => r.trackingId === trackingId);
    if (!recipient) return null;
    Object.assign(recipient, updates);
    campaign.updatedAt = new Date().toISOString();
    return recipient;
  },

  async trackCampaignOpen(trackingId, clientInfo = {}) {
    for (const campaign of campaigns) {
      const recipient = campaign.recipients.find(r => r.trackingId === trackingId);
      if (recipient) {
        const now = new Date().toISOString();
        if (!recipient.opened) {
          recipient.opened = true;
          recipient.openedAt = now;
        }
        recipient.openCount = (recipient.openCount || 0) + 1;
        recipient.lastOpenedAt = now;
        if (clientInfo.ip) recipient.ip = clientInfo.ip;
        if (clientInfo.userAgent) recipient.userAgent = clientInfo.userAgent;
        campaign.openedCount = campaign.recipients.filter(r => r.opened).length;
        campaign.updatedAt = now;
        return { campaign, recipient };
      }
    }
    return null;
  },

  async trackCampaignClick(trackingId, clientInfo = {}) {
    for (const campaign of campaigns) {
      const recipient = campaign.recipients.find(r => r.trackingId === trackingId);
      if (recipient) {
        const now = new Date().toISOString();
        if (!recipient.opened) {
          recipient.opened = true;
          recipient.openedAt = now;
        }
        recipient.openCount = Math.max(1, (recipient.openCount || 0) + 1);
        recipient.lastOpenedAt = now;

        if (!recipient.clicked) {
          recipient.clicked = true;
          recipient.clickedAt = now;
        }
        recipient.clickCount = (recipient.clickCount || 0) + 1;
        if (clientInfo.ip) recipient.ip = clientInfo.ip;
        if (clientInfo.userAgent) recipient.userAgent = clientInfo.userAgent;
        campaign.openedCount = campaign.recipients.filter(r => r.opened).length;
        campaign.clickedCount = campaign.recipients.filter(r => r.clicked).length;
        campaign.updatedAt = now;
        return { campaign, recipient };
      }
    }
    return null;
  },

  async deleteCampaign(id, userId) {
    const idx = campaigns.findIndex(c => String(c._id) === String(id) && (!userId || String(c.userId) === String(userId)));
    if (idx !== -1) {
      campaigns.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Webhook Endpoints
  async createWebhookEndpoint(data) {
    const item = {
      _id: crypto.randomUUID(),
      events: ["email.sent", "email.opened", "email.clicked", "email.failed", "sms.sent"],
      isActive: true,
      description: "Production Webhook",
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    webhookEndpoints.unshift(item);
    return item;
  },

  async listWebhookEndpoints(userId) {
    return webhookEndpoints.filter(e => String(e.userId) === String(userId));
  },

  async getWebhookEndpointById(id, userId) {
    return webhookEndpoints.find(e => String(e._id) === String(id) && (!userId || String(e.userId) === String(userId))) || null;
  },

  async updateWebhookEndpoint(id, userId, updates) {
    const endpoint = webhookEndpoints.find(e => String(e._id) === String(id) && (!userId || String(e.userId) === String(userId)));
    if (!endpoint) return null;
    Object.assign(endpoint, updates, { updatedAt: new Date().toISOString() });
    return endpoint;
  },

  async deleteWebhookEndpoint(id, userId) {
    const idx = webhookEndpoints.findIndex(e => String(e._id) === String(id) && (!userId || String(e.userId) === String(userId)));
    if (idx !== -1) {
      webhookEndpoints.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Webhook Delivery Logs
  async createWebhookDeliveryLog(log) {
    const item = {
      _id: crypto.randomUUID(),
      ...log,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    webhookDeliveryLogs.unshift(item);
    if (webhookDeliveryLogs.length > 200) {
      webhookDeliveryLogs.pop();
    }
    return item;
  },

  async listWebhookDeliveryLogs(userId, limit = 50) {
    return webhookDeliveryLogs
      .filter(l => String(l.userId) === String(userId))
      .slice(0, limit);
  },

  async clearWebhookDeliveryLogs(userId) {
    const remaining = webhookDeliveryLogs.filter(l => String(l.userId) !== String(userId));
    webhookDeliveryLogs.length = 0;
    webhookDeliveryLogs.push(...remaining);
    return true;
  },

  // Admin Operations (Memory Store Fallback)
  async listAllUsers({ page = 1, limit = 10, search = "", role = "all" } = {}) {
    let filtered = [...users];
    if (role && role !== "all") {
      filtered = filtered.filter(u => (u.role || "client") === role);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.companyName && u.companyName.toLowerCase().includes(q))
      );
    }
    const totalUsers = filtered.length;
    const totalPages = Math.ceil(totalUsers / limit) || 1;
    const pagedUsers = filtered.slice((page - 1) * limit, page * limit).map(u => {
      const uKeys = apiKeys.filter(k => String(k.userId) === String(u._id));
      const uLogs = emailLogs.filter(l => String(l.userId) === String(u._id));
      const uCampaigns = campaigns.filter(c => String(c.userId) === String(u._id));
      const uWebhooks = webhookEndpoints.filter(w => String(w.userId) === String(u._id));

      const emailTotal = uLogs.length;
      const sentCount = uLogs.filter(l => l.status === "sent").length;
      const failedCount = uLogs.filter(l => l.status === "failed").length;
      const simCount = uLogs.filter(l => l.status === "simulated").length;

      const hasCustomSmtp = Boolean(u.smtpSettings && u.smtpSettings.enabled && u.smtpSettings.host);
      const hasSms = Boolean(u.smsSettings && u.smsSettings.phoneNumber);

      const services = {
        emails: {
          total: emailTotal,
          sent: sentCount,
          failed: failedCount,
          simulated: simCount
        },
        apiKeys: {
          count: uKeys.length,
          list: uKeys.map(k => ({
            _id: k._id,
            name: k.name || "Default Key",
            maskedKey: k.key ? `${k.key.slice(0, 8)}...${k.key.slice(-4)}` : "—",
            createdAt: k.createdAt
          }))
        },
        campaigns: {
          count: uCampaigns.length
        },
        smtp: {
          enabled: hasCustomSmtp,
          host: u.smtpSettings?.host || "System Default (Gmail Relay)",
          port: u.smtpSettings?.port || 587,
          fromEmail: u.smtpSettings?.fromEmail || u.email
        },
        sms: {
          enabled: hasSms,
          phoneNumber: u.smsSettings?.phoneNumber || "Not configured",
          mode: u.smsSettings?.simulationMode ? "Simulated" : "Live SMS Gateway"
        },
        webhooks: {
          count: uWebhooks.length
        },
        activeCount: (emailTotal > 0 ? 1 : 0) + (uKeys.length > 0 ? 1 : 0) + (uCampaigns.length > 0 ? 1 : 0) + (hasCustomSmtp ? 1 : 0) + (hasSms ? 1 : 0) + (uWebhooks.length > 0 ? 1 : 0)
      };

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        companyName: u.companyName || "",
        role: u.role || "client",
        isRegular: u.role !== "admin" && u.role !== "superadmin",
        apiKeyCount: uKeys.length,
        apiKeys: services.apiKeys.list,
        emailCount: emailTotal,
        campaignCount: uCampaigns.length,
        services,
        createdAt: u.createdAt
      };
    });
    return { users: pagedUsers, totalUsers, totalPages, currentPage: page };
  },

  async updateUserRole(userId, newRole) {
    const u = users.find(user => String(user._id) === String(userId));
    if (!u) return null;
    u.role = newRole;
    u.updatedAt = new Date().toISOString();
    return u;
  },

  async deleteUser(userId) {
    const idx = users.findIndex(u => String(u._id) === String(userId));
    if (idx === -1) return false;
    users.splice(idx, 1);
    // Cleanup user apiKeys, logs, campaigns
    for (let i = apiKeys.length - 1; i >= 0; i--) {
      if (String(apiKeys[i].userId) === String(userId)) apiKeys.splice(i, 1);
    }
    for (let i = emailLogs.length - 1; i >= 0; i--) {
      if (String(emailLogs[i].userId) === String(userId)) emailLogs.splice(i, 1);
    }
    for (let i = campaigns.length - 1; i >= 0; i--) {
      if (String(campaigns[i].userId) === String(userId)) campaigns.splice(i, 1);
    }
    return true;
  },

  async listAllEmailLogs({ page = 1, limit = 20, search = "", status = "all", type = "all" } = {}) {
    let filtered = [...emailLogs];
    if (status && status !== "all") {
      filtered = filtered.filter(l => l.status === status);
    }
    if (type && type !== "all") {
      filtered = filtered.filter(l => l.type === type);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(l =>
        (l.to && l.to.toLowerCase().includes(q)) ||
        (l.subject && l.subject.toLowerCase().includes(q)) ||
        (l.apiKey && l.apiKey.toLowerCase().includes(q))
      );
    }
    const totalLogs = filtered.length;
    const totalPages = Math.ceil(totalLogs / limit) || 1;
    const logs = filtered.slice((page - 1) * limit, page * limit);
    return { logs, totalLogs, totalPages, currentPage: page };
  },

  async listAllCampaigns({ page = 1, limit = 15 } = {}) {
    const totalCampaigns = campaigns.length;
    const totalPages = Math.ceil(totalCampaigns / limit) || 1;
    const pagedCampaigns = campaigns.slice((page - 1) * limit, page * limit).map(c => {
      const creator = users.find(u => String(u._id) === String(c.userId));
      return {
        ...c,
        creatorName: creator ? creator.name : "Unknown",
        creatorEmail: creator ? creator.email : "Unknown"
      };
    });
    return { campaigns: pagedCampaigns, totalCampaigns, totalPages, currentPage: page };
  },

  async getGlobalStats() {
    const totalUsers = users.length;
    const totalEmails = emailLogs.length;
    const sentEmails = emailLogs.filter(l => l.status === "sent").length;
    const simulatedEmails = emailLogs.filter(l => l.status === "simulated").length;
    const failedEmails = emailLogs.filter(l => l.status === "failed").length;
    const totalCampaigns = campaigns.length;
    const totalApiKeys = apiKeys.length;
    
    // Calculate 24h count
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const emailsLast24h = emailLogs.filter(l => new Date(l.createdAt).getTime() > oneDayAgo).length;

    const deliverabilityRate = totalEmails > 0 
      ? Math.round(((sentEmails + simulatedEmails) / totalEmails) * 100) 
      : 100;

    return {
      totalUsers,
      totalEmails,
      sentEmails,
      simulatedEmails,
      failedEmails,
      emailsLast24h,
      deliverabilityRate,
      totalCampaigns,
      totalApiKeys
    };
  }
};
