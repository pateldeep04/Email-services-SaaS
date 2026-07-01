import crypto from "crypto";

const emailLogs = [];
const otpTokens = [];
const users = [];
const apiKeys = [];

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
  }
};
