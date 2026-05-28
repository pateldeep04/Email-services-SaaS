import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  Copy, 
  CheckCircle, 
  RotateCcw, 
  LogOut, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Key, 
  ShieldAlert, 
  Mail, 
  BarChart2, 
  ShieldCheck,
  ExternalLink,
  XCircle,
  Eye,
  EyeOff,
  X,
  Search,
  Settings,
  Sparkles
} from "lucide-react";
import "../styles/Dashboard.css";

export function DashboardPage() {
  const { user, token, apiKey, setApiKey, logout, updateUserSettings, updateApiKeySettings } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  
  const [newKeyName, setNewKeyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingKey, setCreatingKey] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [visibleKeyId, setVisibleKeyId] = useState(null);
  
  // Advanced Logs Filtering & Detail Modal States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Email Template Customizer States
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "customizer"
  
  // Styling States
  const [brandName, setBrandName] = useState("My Brand");
  const [colorHeaderBg, setColorHeaderBg] = useState("#0f766e");
  const [colorHeaderText, setColorHeaderText] = useState("#ffffff");
  const [colorButtonBg, setColorButtonBg] = useState("#0f766e");
  const [colorBgLight, setColorBgLight] = useState("#f1f5f9");
  
  // Content States
  const [emailTitle, setEmailTitle] = useState("Welcome to MailBridge");
  const [emailMessage, setEmailMessage] = useState(
    "We are thrilled to have you here! Customize this message to greet your users."
  );
  const [emailActionText, setEmailActionText] = useState("Get Started");
  const [emailActionUrl, setEmailActionUrl] = useState("https://mailbridge.io");
  const [emailFooter, setEmailFooter] = useState("© 2026 MailBridge. All rights reserved.");
  
  // Testing States
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { success: boolean, message: string }
  
  // Customizer styling persistence states
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { success: boolean, message: string }

  // Target styling design selection state
  const [selectedTarget, setSelectedTarget] = useState("global");
  
  // API Key creation configuration options
  const [inheritStyle, setInheritStyle] = useState(true);

  // Custom Sender Profile Settings state
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [savingSender, setSavingSender] = useState(false);
  const [senderSaveResult, setSenderSaveResult] = useState(null); // { success: boolean, message: string }

  // Custom SMTP Settings states
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [hasSmtpPassSaved, setHasSmtpPassSaved] = useState(false);
  
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpSaveResult, setSmtpSaveResult] = useState(null);

  // AI assistant states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiType, setAiType] = useState("custom");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [showAiCard, setShowAiCard] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("custom");

  // Auto-fill test recipient when user loads
  useEffect(() => {
    if (user && !testRecipient) {
      setTestRecipient(user.email);
    }
  }, [user]);

  // Synchronize SMTP settings and Sender Profile form values from context user profile state
  useEffect(() => {
    if (user) {
      setSenderName(user.senderName || "");
      setSenderEmail(user.senderEmail || "");
      
      if (user.smtpSettings) {
        setSmtpEnabled(user.smtpSettings.enabled || false);
        setSmtpHost(user.smtpSettings.host || "");
        setSmtpPort(user.smtpSettings.port || 587);
        setSmtpSecure(user.smtpSettings.secure || false);
        setSmtpUser(user.smtpSettings.user || "");
        setSmtpFromEmail(user.smtpSettings.fromEmail || "");
        setSmtpFromName(user.smtpSettings.fromName || "");
        setHasSmtpPassSaved(user.smtpSettings.hasPassword || false);
        setSmtpPass(""); // Clear password field for typing new password
      }
    }
  }, [user]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter]);
  
  // Synchronize customizer states with currently selected styling target
  useEffect(() => {
    let settings = null;
    if (selectedTarget === "global") {
      if (user && user.templateSettings) {
        settings = user.templateSettings;
      }
    } else {
      const selectedKey = apiKeys.find(k => k._id === selectedTarget);
      if (selectedKey && selectedKey.templateSettings) {
        settings = selectedKey.templateSettings;
      }
    }

    if (settings) {
      if (settings.brandName !== undefined) setBrandName(settings.brandName);
      if (settings.colorHeaderBg !== undefined) setColorHeaderBg(settings.colorHeaderBg);
      if (settings.colorHeaderText !== undefined) setColorHeaderText(settings.colorHeaderText);
      if (settings.colorButtonBg !== undefined) setColorButtonBg(settings.colorButtonBg);
      if (settings.colorBgLight !== undefined) setColorBgLight(settings.colorBgLight);
      if (settings.emailFooter !== undefined) setEmailFooter(settings.emailFooter);
    }
  }, [selectedTarget, user, apiKeys]);

  // Safety check: reset selectedTarget to global if target API key is revoked/deleted
  useEffect(() => {
    if (selectedTarget !== "global" && !apiKeys.some(k => k._id === selectedTarget)) {
      setSelectedTarget("global");
    }
  }, [apiKeys, selectedTarget]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSaveStatus(null);
    try {
      const payload = {
        brandName,
        colorHeaderBg,
        colorHeaderText,
        colorButtonBg,
        colorBgLight,
        emailFooter
      };
      if (selectedTarget === "global") {
        await updateUserSettings({ templateSettings: payload });
        setSaveStatus({ success: true, message: "Global styles saved successfully!" });
      } else {
        const updatedKey = await updateApiKeySettings(selectedTarget, payload);
        setApiKeys(prevKeys => prevKeys.map(k => k._id === selectedTarget ? updatedKey : k));
        setSaveStatus({ success: true, message: "API key styles saved successfully!" });
      }
      setTimeout(() => setSaveStatus(null), 3000);
      fetchDashboardData();
    } catch (error) {
      setSaveStatus({ success: false, message: error.message || "Failed to save settings." });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveSenderProfile = async (e) => {
    if (e) e.preventDefault();
    setSavingSender(true);
    setSenderSaveResult(null);
    try {
      const payload = {
        senderName,
        senderEmail
      };
      
      const success = await updateUserSettings(payload);
      if (success) {
        setSenderSaveResult({ success: true, message: "Sender Profile saved successfully!" });
        setTimeout(() => setSenderSaveResult(null), 4000);
      } else {
        setSenderSaveResult({ success: false, message: "Failed to save Sender Profile." });
      }
      fetchDashboardData();
    } catch (error) {
      setSenderSaveResult({ success: false, message: error.message || "Failed to save Sender Profile settings." });
    } finally {
      setSavingSender(false);
    }
  };
  
  const handleTestSmtpConnection = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/smtp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          host: smtpHost,
          port: Number(smtpPort),
          secure: smtpSecure,
          user: smtpUser,
          pass: smtpPass,
          fromEmail: smtpFromEmail,
          fromName: smtpFromName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSmtpTestResult({ success: true, message: "SMTP connection verified successfully!" });
      } else {
        setSmtpTestResult({ success: false, message: data.error || "Failed to test SMTP connection." });
      }
    } catch (error) {
      setSmtpTestResult({ success: false, message: error.message || "Error testing connection." });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSaveSmtpSettings = async (e) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpSaveResult(null);
    try {
      const payload = {
        smtpSettings: {
          enabled: smtpEnabled,
          host: smtpHost,
          port: Number(smtpPort),
          secure: smtpSecure,
          user: smtpUser,
          pass: smtpPass,
          fromEmail: smtpFromEmail,
          fromName: smtpFromName
        }
      };
      const success = await updateUserSettings(payload);
      if (success) {
        setSmtpSaveResult({ success: true, message: "SMTP settings saved successfully!" });
        setSmtpPass(""); // Clear password field on save
        setTimeout(() => setSmtpSaveResult(null), 3000);
      } else {
        setSmtpSaveResult({ success: false, message: "Failed to save SMTP settings." });
      }
      fetchDashboardData();
    } catch (error) {
      setSmtpSaveResult({ success: false, message: error.message || "Failed to save SMTP settings." });
    } finally {
      setSavingSmtp(false);
    }
  };
  
  const fetchLogs = async (pageVal = currentPage, limitVal = pageSize, searchVal = searchQuery, statusVal = statusFilter, typeVal = typeFilter) => {
    try {
      setLoadingLogs(true);
      const params = new URLSearchParams({
        page: pageVal,
        limit: limitVal,
        search: searchVal,
        status: statusVal,
        type: typeVal
      });
      const res = await fetch(`http://localhost:5000/api/v1/auth/logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRecentLogs(data.logs || []);
        setTotalLogs(data.totalLogs || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch stats
      const statsRes = await fetch("http://localhost:5000/api/v1/auth/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData.stats);
        setSmtpStatus(statsData.smtpStatus);
      }

      // Also fetch the first page of logs
      await fetchLogs(currentPage, pageSize, searchQuery, statusFilter, typeFilter);

      // 2. Fetch api keys
      const keysRes = await fetch("http://localhost:5000/api/v1/auth/keys", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const keysData = await keysRes.json();
      if (keysRes.ok) {
        const fetchedKeys = keysData.keys || [];
        setApiKeys(fetchedKeys);

        // Auto-sync active API key with fetched keys list
        const keyExists = fetchedKeys.some(k => k.key === apiKey);
        if (!keyExists) {
          const nextKey = fetchedKeys[0]?.key || "";
          setApiKey(nextKey);
          localStorage.setItem("mailbridge_api_key", nextKey);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDashboardData();
  }, [token]);

  // Reset currentPage to 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, pageSize]);

  // Fetch logs when pagination parameters change (debounced for search query)
  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      fetchLogs(currentPage, pageSize, searchQuery, statusFilter, typeFilter);
    }, 150);
    return () => clearTimeout(timer);
  }, [token, currentPage, pageSize, searchQuery, statusFilter, typeFilter]);

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newKeyName, inheritStyle })
      });
      const data = await res.json();
      if (res.ok) {
        setApiKeys([data.key, ...apiKeys]);
        setNewKeyName("");
        setInheritStyle(true);

        // If current key is empty/invalid, automatically make this new key the active key!
        if (!apiKey) {
          setApiKey(data.key.key);
          localStorage.setItem("mailbridge_api_key", data.key.key);
        }
      } else {
        alert(data.error || "Failed to generate API Key");
      }
    } catch (error) {
      alert("Error generating key: " + error.message);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will lose access immediately.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/auth/keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const deletedKeyDoc = apiKeys.find((k) => k._id === keyId);
        const updatedKeys = apiKeys.filter((k) => k._id !== keyId);
        setApiKeys(updatedKeys);

        // If the deleted key is the one currently in use, update it!
        if (deletedKeyDoc && deletedKeyDoc.key === apiKey) {
          const nextKey = updatedKeys[0]?.key || "";
          setApiKey(nextKey);
          localStorage.setItem("mailbridge_api_key", nextKey);
        }
      } else {
        alert(data.error || "Failed to delete API Key");
      }
    } catch (error) {
      alert("Error deleting key: " + error.message);
    }
  };

  const copyKeyText = (keyVal, keyId) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const total = stats?.total || 0;
  const sent = stats?.sent || 0;
  const simulated = stats?.simulated || 0;
  const failed = stats?.failed || 0;
  const successRate = total > 0 ? Math.round(((sent + simulated) / total) * 100) : 0;

  const renderSmtpBanner = () => {
    if (user && user.smtpSettings && user.smtpSettings.enabled) {
      return (
        <div className="smtp-banner success">
          <div className="smtp-banner-icon">
            <ShieldCheck size={28} />
          </div>
          <div className="smtp-banner-content">
            <h4>Custom SMTP Connection Enabled</h4>
            <p>
              Emails are being delivered via your custom SMTP server (<code>{user.smtpSettings.host}</code>) on behalf of <strong>{user.smtpSettings.fromName || "MailBridge"}</strong> &lt;<code>{user.smtpSettings.fromEmail || user.smtpSettings.user}</code>&gt;.
            </p>
          </div>
        </div>
      );
    }

    if (user && (user.senderName || user.senderEmail)) {
      return (
        <div className="smtp-banner success">
          <div className="smtp-banner-icon">
            <ShieldCheck size={28} />
          </div>
          <div className="smtp-banner-content">
            <h4>Custom Sender Identity Configured</h4>
            <p>
              Emails will be sent on behalf of <strong>{user.senderName || "No Name"}</strong> &lt;<code>{user.senderEmail || "no-email"}</code>&gt; utilizing the system's email server.
            </p>
          </div>
        </div>
      );
    }

    if (!smtpStatus) return null;

    if (smtpStatus.status === "invalid") {
      return (
        <div className="smtp-banner error">
          <div className="smtp-banner-icon">
            <ShieldAlert size={28} />
          </div>
          <div className="smtp-banner-content">
            <h4>Gmail SMTP Authentication Failed</h4>
            <p>
              Your Gmail login credentials in your <code>.env</code> file are invalid. Google rejects connections that do not use a dedicated <strong>16-character App Password</strong> (NOT your normal account password).
            </p>
            <div className="smtp-banner-actions">
              <a 
                href="https://myaccount.google.com/apppasswords" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-danger"
              >
                Create App Password <ExternalLink size={14} />
              </a>
              <span className="divider">or</span>
              <span className="simulation-note">
                API requests will fallback to <strong>Simulation Mode</strong>.
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (smtpStatus.status === "unconfigured") {
      return (
        <div className="smtp-banner warning">
          <div className="smtp-banner-icon">
            <AlertCircle size={28} />
          </div>
          <div className="smtp-banner-content">
            <h4>SMTP is Unconfigured</h4>
            <p>
              To send real emails, please specify <code>GMAIL_USER</code> and <code>GMAIL_APP_PASSWORD</code> in your <code>.env</code> file.
            </p>
            <div className="smtp-banner-actions">
              <span className="simulation-note">
                Currently running in <strong>Simulation Mode</strong>. Emails will be logged locally but not sent.
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="smtp-banner success">
        <div className="smtp-banner-icon">
          <ShieldCheck size={28} />
        </div>
        <div className="smtp-banner-content">
          <h4>System Active</h4>
          <p>
            System is ready to deliver emails.
          </p>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    const chartData = [
      { name: "OTP", value: stats?.byType?.otp || 0, color: "#3b82f6" },
      { name: "Welcome", value: stats?.byType?.welcome || 0, color: "#10b981" },
      { name: "Forgot Pw", value: stats?.byType?.["forgot-password"] || 0, color: "#f59e0b" },
      { name: "Notification", value: stats?.byType?.notification || 0, color: "#8b5cf6" },
      { name: "Custom", value: stats?.byType?.custom || 0, color: "#ec4899" }
    ];

    const maxValue = Math.max(...chartData.map((d) => d.value), 5);

    return (
      <div className="card chart-card">
        <h3>Emails by Template Type</h3>
        <div className="svg-chart-wrapper">
          <svg viewBox="0 0 500 200" className="svg-chart">
            {/* Draw Y-axis grid lines */}
            <line x1="40" y1="20" x2="480" y2="20" stroke="#f3f4f6" strokeDasharray="4 4" />
            <line x1="40" y1="70" x2="480" y2="70" stroke="#f3f4f6" strokeDasharray="4 4" />
            <line x1="40" y1="120" x2="480" y2="120" stroke="#f3f4f6" strokeDasharray="4 4" />
            <line x1="40" y1="170" x2="480" y2="170" stroke="#e5e7eb" strokeWidth="2" />

            {/* Grid line labels */}
            <text x="15" y="24" className="chart-label-y">{Math.round(maxValue)}</text>
            <text x="15" y="74" className="chart-label-y">{Math.round(maxValue / 2)}</text>
            <text x="15" y="124" className="chart-label-y">{Math.round(maxValue / 4)}</text>
            <text x="15" y="174" className="chart-label-y">0</text>

            {/* Draw Bars */}
            {chartData.map((d, index) => {
              const x = 50 + index * 85;
              const barHeight = (d.value / maxValue) * 140;
              const y = 170 - barHeight;

              return (
                <g key={d.name} className="chart-bar-group">
                  {/* Tooltip background & text on hover */}
                  <rect 
                    x={x + 5} 
                    y={y - 25} 
                    width="40" 
                    height="18" 
                    rx="3" 
                    fill="#1f2937" 
                    className="chart-tooltip-bg" 
                  />
                  <text 
                    x={x + 25} 
                    y={y - 13} 
                    textAnchor="middle" 
                    fill="#ffffff" 
                    fontSize="10" 
                    fontWeight="bold"
                    className="chart-tooltip-text"
                  >
                    {d.value}
                  </text>
                  
                  {/* The Bar */}
                  <rect
                    x={x + 10}
                    y={y}
                    width="30"
                    height={barHeight}
                    fill={d.color}
                    rx="4"
                    className="chart-bar"
                  />

                  {/* Label */}
                  <text
                    x={x + 25}
                    y="190"
                    textAnchor="middle"
                    className="chart-label-x"
                  >
                    {d.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderApiKeyTable = () => {
    return (
      <div className="card full keys-card">
        <div className="section-header-inline align-start-responsive">
          <h2>API Keys Management</h2>
          <form onSubmit={handleGenerateKey} className="generate-key-form-container">
            <div className="generate-key-inputs-row">
              <input
                type="text"
                placeholder="e.g. Production Backend"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
                disabled={creatingKey}
                className="generate-key-input-text"
              />
              <button type="submit" className="btn btn-primary" disabled={creatingKey}>
                <Plus size={16} /> {creatingKey ? "Generating..." : "Generate Key"}
              </button>
            </div>
            <div className="generate-key-options-row">
              <span className="options-label">Key Style:</span>
              <label className="radio-label">
                <input
                  type="radio"
                  name="inheritStyle"
                  checked={inheritStyle === true}
                  onChange={() => setInheritStyle(true)}
                  disabled={creatingKey}
                />
                Use current global style (Old Design)
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="inheritStyle"
                  checked={inheritStyle === false}
                  onChange={() => setInheritStyle(false)}
                  disabled={creatingKey}
                />
                Create a new style design (New Design)
              </label>
            </div>
          </form>
        </div>
        <p className="api-key-info">Create named API keys to separate your integration environments. Deleting a key revokes it immediately.</p>

        <div className="table-responsive">
          <table className="api-keys-table">
            <thead>
              <tr>
                <th>Key Name / Style</th>
                <th>API Key</th>
                <th>Created</th>
                <th>Last Used</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    No API keys found. Generate a key to authenticate email requests.
                  </td>
                </tr>
              ) : (
                apiKeys.map((key) => {
                  const isVisible = visibleKeyId === key._id;
                  const maskedKey = isVisible 
                    ? key.key 
                    : `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 4)}`;

                  return (
                    <tr key={key._id}>
                      <td className="key-name-cell">
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{key.name}</span>
                          <div>
                            <span className={`log-style-badge ${key.styleType === "custom" ? "key-specific" : "global"}`} style={{ fontSize: "10px", padding: "2px 6px" }}>
                              {key.styleType === "custom" ? "Custom Style" : "Global Style"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="key-value-cell">
                        <code>{maskedKey}</code>
                        <button
                          type="button"
                          className="icon-btn-inline"
                          onClick={() => setVisibleKeyId(isVisible ? null : key._id)}
                          title={isVisible ? "Hide API key" : "Show API key"}
                        >
                          {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </td>
                      <td>{new Date(key.createdAt).toLocaleDateString()}</td>
                      <td>
                        {key.lastUsedAt 
                          ? new Date(key.lastUsedAt).toLocaleDateString() + " " + new Date(key.lastUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "Never"}
                      </td>
                      <td className="actions-col">
                        <button
                          className="btn btn-sm btn-outline btn-icon"
                          onClick={() => copyKeyText(key.key, key._id)}
                          title="Copy API key"
                        >
                          {copiedKeyId === key._id ? (
                            <CheckCircle size={14} className="success" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-danger-outline btn-icon"
                          onClick={() => handleDeleteKey(key._id)}
                          title="Delete/Revoke API key"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLogsTable = () => {
    const countAll = stats?.total || 0;
    const countSent = stats?.sent || 0;
    const countSimulated = stats?.simulated || 0;
    const countFailed = stats?.failed || 0;

    const totalFilteredLogs = totalLogs;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + recentLogs.length, totalFilteredLogs);
    const paginatedLogs = recentLogs;

    return (
      <div className="card full logs-card">
        <div className="section-header-inline">
          <h2>Recent Delivery Logs</h2>
          <span className="logs-meta-desc">
            Showing {totalFilteredLogs === 0 ? 0 : startIndex + 1}–{endIndex} of {totalFilteredLogs} entries
          </span>
        </div>

        {/* Logs Filter Controls */}
        <div className="logs-filters">
          <div className="logs-search-wrapper">
            <Search size={16} className="search-icon-inside" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search by recipient or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>

          <div className="logs-select-filter">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Templates</option>
              <option value="otp">OTP Verification</option>
              <option value="welcome">Welcome Email</option>
              <option value="forgot-password">Password Reset</option>
              <option value="notification">Notification</option>
              <option value="custom">Custom Email</option>
            </select>
          </div>

          <div className="logs-status-tabs">
            <button 
              type="button" 
              className={`status-tab-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All <span className="status-tab-count">{countAll}</span>
            </button>
            <button 
              type="button" 
              className={`status-tab-btn ${statusFilter === "sent" ? "active" : ""}`}
              onClick={() => setStatusFilter("sent")}
            >
              Sent <span className="status-tab-count">{countSent}</span>
            </button>
            <button 
              type="button" 
              className={`status-tab-btn ${statusFilter === "simulated" ? "active" : ""}`}
              onClick={() => setStatusFilter("simulated")}
            >
              Simulated <span className="status-tab-count">{countSimulated}</span>
            </button>
            <button 
              type="button" 
              className={`status-tab-btn ${statusFilter === "failed" ? "active" : ""}`}
              onClick={() => setStatusFilter("failed")}
            >
              Failed <span className="status-tab-count">{countFailed}</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Recipient</th>
                <th>Template Type</th>
                <th>Key / Style</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table-cell">
                    {recentLogs.length === 0 
                      ? "No email logs found. Run some API requests to see details here."
                      : "No delivery logs match your filter criteria."}
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  let badgeClass = "badge-simulated";
                  if (log.status === "sent") badgeClass = "badge-sent";
                  if (log.status === "failed") badgeClass = "badge-failed";

                  return (
                    <tr key={log._id} onClick={() => setSelectedLog(log)} title="Click to view details">
                      <td>
                        {new Date(log.createdAt).toLocaleDateString()} <span className="time-sub">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>{log.to}</td>
                      <td>
                        <span className="log-type-tag">{log.type}</span>
                      </td>
                      <td>
                        <span className={`log-style-badge ${log.keyStyle === "Global Style" || !log.keyStyle ? "global" : "key-specific"}`}>
                          {log.keyStyle || (apiKeys.find(k => k.key === log.apiKey)?.name) || "Global Style"}
                        </span>
                      </td>
                      <td className="log-subject">{log.subject}</td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{log.status}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="logs-pagination-footer">
          <div className="logs-page-size-selector">
            <span>Rows per page:</span>
            <select value={pageSize} onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="logs-page-nav">
            <button 
              type="button" 
              className="pagination-btn nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              if (totalPages > 5) {
                if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
                  if (pageNum === 2 && currentPage > 3) return <span key="ellipsis-start" className="pagination-ellipsis">...</span>;
                  if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key="ellipsis-end" className="pagination-ellipsis">...</span>;
                  return null;
                }
              }
              
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`pagination-btn num-btn ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              type="button" 
              className="pagination-btn nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleCopyPayload = (payload) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const renderLogDetailModal = () => {
    if (!selectedLog) return null;
    
    let statusClass = "badge-simulated";
    if (selectedLog.status === "sent") statusClass = "badge-sent";
    if (selectedLog.status === "failed") statusClass = "badge-failed";

    return (
      <div className="log-modal-overlay" onClick={() => setSelectedLog(null)}>
        <div className="log-modal" onClick={(e) => e.stopPropagation()}>
          <div className="log-modal-header">
            <h3>Delivery Log Details</h3>
            <button className="log-close-btn" onClick={() => setSelectedLog(null)}>
              <X size={18} />
            </button>
          </div>
          
          <div className="log-modal-body">
            {selectedLog.status === "failed" && selectedLog.error && (
              <div className="log-error-box">
                <AlertCircle size={20} />
                <div>
                  <h5>Delivery Attempt Failed</h5>
                  <p>{selectedLog.error}</p>
                </div>
              </div>
            )}
            
            <div className="log-details-grid">
              <div className="log-detail-item">
                <label>Recipient Email</label>
                <p>{selectedLog.to}</p>
              </div>
              <div className="log-detail-item">
                <label>Status</label>
                <p style={{ margin: 0 }}>
                  <span className={`badge ${statusClass}`} style={{ display: "inline-block", marginTop: "2px" }}>
                    {selectedLog.status}
                  </span>
                </p>
              </div>
              <div className="log-detail-item">
                <label>Template Type</label>
                <p>
                  <span className="log-type-tag" style={{ textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>
                    {selectedLog.type}
                  </span>
                </p>
              </div>
              <div className="log-detail-item">
                <label>Key / Style Used</label>
                <p>
                  <span className={`log-style-badge ${selectedLog.keyStyle === "Global Style" || !selectedLog.keyStyle ? "global" : "key-specific"}`} style={{ textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>
                    {selectedLog.keyStyle || (apiKeys.find(k => k.key === selectedLog.apiKey)?.name) || "Global Style"}
                  </span>
                </p>
              </div>
              <div className="log-detail-item">
                <label>Date & Time</label>
                <p>
                  {new Date(selectedLog.createdAt).toLocaleDateString()} at{" "}
                  {new Date(selectedLog.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="log-detail-item">
                <label>Sender Identity</label>
                <p>
                  {selectedLog.metadata?.hasCustomSender ? (
                    <span style={{ fontSize: "13px" }}>
                      <strong>{selectedLog.metadata.senderName}</strong> &lt;<code>{selectedLog.metadata.senderEmail}</code>&gt;
                    </span>
                  ) : (
                    <span className="log-style-badge global" style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                      System Default
                    </span>
                  )}
                </p>
              </div>
              <div className="log-detail-item">
                <label>SMTP Gateway</label>
                <p>
                  <span className={`log-style-badge ${selectedLog.metadata?.smtpType === "custom" ? "key-specific" : "global"}`} style={{ textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>
                    {selectedLog.metadata?.smtpType === "custom" ? "Custom SMTP" : "System SMTP"}
                  </span>
                </p>
              </div>
              <div className="log-detail-item full">
                <label>Email Subject</label>
                <p style={{ fontWeight: "600", color: "var(--text-main)" }}>{selectedLog.subject}</p>
              </div>
              {selectedLog.providerMessageId && (
                <div className="log-detail-item full">
                  <label>Provider Message ID</label>
                  <code>{selectedLog.providerMessageId}</code>
                </div>
              )}
              {selectedLog.apiKey && (
                <div className="log-detail-item full">
                  <label>API Key Identifier</label>
                  <code>{selectedLog.apiKey.substring(0, 12)}...</code>
                </div>
              )}
            </div>
            
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div className="log-payload-box">
                <div className="log-payload-header">
                  <label>Request Body Payload</label>
                  <button 
                    type="button" 
                    className="log-payload-copy-btn"
                    onClick={() => handleCopyPayload(selectedLog.metadata)}
                  >
                    {copiedPayload ? (
                      <>
                        <CheckCircle size={12} className="success" style={{ color: "#10b981" }} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="log-payload-code">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="log-modal-footer">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                const type = selectedLog.type;
                const metadata = selectedLog.metadata || {};
                setSelectedLog(null);
                navigate("/tester", { 
                  state: { 
                    initialTemplate: type, 
                    initialPayload: metadata 
                  } 
                });
              }}
            >
              Test in API Tester
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setSelectedLog(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const generateEmailHtml = () => {
    let titleText = emailTitle;
    let bodyHtml = `<p style="margin-bottom: 24px; color: #4b5563; white-space: pre-line;">${emailMessage}</p>`;
    let actionHtml = "";

    if (activeTemplate === "welcome") {
      titleText = "Welcome aboard";
      bodyHtml = `
        <p>Hi <strong>John Doe</strong>,</p>
        <p>Your account is ready. We are happy to have you with ${brandName}.</p>
        <p style="margin-top: 16px; color: #4b5563; font-style: italic; font-size: 13px;">Note: This is a preview of the Welcome Email template. You can trigger this template via the API.</p>
      `;
    } else if (activeTemplate === "otp") {
      titleText = "Verification code";
      bodyHtml = `
        <p>Use this OTP for verification:</p>
        <p style="font-size: 32px; letter-spacing: 6px; font-weight: 700; margin: 24px 0; text-align: center; color: ${colorButtonBg}; font-family: monospace;">482931</p>
        <p>This code expires in 10 minutes.</p>
      `;
    } else if (activeTemplate === "forgot-password") {
      titleText = "Password reset";
      bodyHtml = `<p style="margin-bottom: 20px;">We received a request to reset your password for your account.</p>`;
      actionHtml = `
        <div style="text-align: center; margin: 24px 0 16px 0;">
          <a href="https://app.example.com/reset" target="_blank" style="background-color: ${colorButtonBg}; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reset password</a>
        </div>
      `;
    } else if (activeTemplate === "notification") {
      titleText = emailTitle || "Notification Alert";
      bodyHtml = `<p style="color: #374151; white-space: pre-line;">${emailMessage}</p>`;
      actionHtml = "";
    } else {
      titleText = emailTitle;
      bodyHtml = `<p style="margin-bottom: 24px; color: #4b5563; white-space: pre-line;">${emailMessage}</p>`;
      if (emailActionText) {
        actionHtml = `
          <div style="text-align: center; margin: 32px 0 16px 0;">
            <a href="${emailActionUrl}" target="_blank" style="background-color: ${colorButtonBg}; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${emailActionText}</a>
          </div>
        `;
      }
    }

    return `
<div style="font-family: Arial, sans-serif; background-color: ${colorBgLight}; padding: 30px; margin: 0; border-radius: 8px;">
  <div style="max-width: 580px; margin: auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: ${colorHeaderBg}; color: ${colorHeaderText}; padding: 24px; text-align: center;">
      <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px; color: ${colorHeaderText} !important;">${brandName}</h2>
    </div>
    <div style="padding: 30px; color: #374151; line-height: 1.6; font-size: 15px;">
      <h1 style="margin-top: 0; margin-bottom: 16px; font-size: 22px; color: #111827; font-weight: bold;">${titleText}</h1>
      ${bodyHtml}
      ${actionHtml}
    </div>
    <div style="padding: 16px 30px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px; text-align: center;">
      ${emailFooter}
    </div>
  </div>
</div>`.trim();
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingAi(true);
    setAiNote("");
    try {
      const res = await fetch("http://localhost:5000/api/v1/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          tone: aiTone,
          type: aiType,
          brandName: brandName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEmailTitle(data.subject);
        setEmailMessage(data.message);
        setActiveTemplate(aiType);
        if (data.isMock) {
          setAiNote(data.note + ` (applied to ${aiType} preview)`);
        } else {
          setAiNote(`✨ AI generated and applied to the ${aiType} template successfully!`);
        }
      } else {
        alert(data.error || "Failed to generate AI content");
      }
    } catch (error) {
      alert("Error generating content: " + error.message);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testRecipient.trim()) {
      setTestStatus({ success: false, message: "Please enter a valid recipient email address." });
      return;
    }
    setSendingTest(true);
    setTestStatus(null);

    try {
      const html = generateEmailHtml();
      const res = await fetch("http://localhost:5000/api/v1/emails/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          to: testRecipient,
          subject: activeTemplate === "welcome" ? `Welcome to ${brandName}`
                   : activeTemplate === "otp" ? "Your verification OTP"
                   : activeTemplate === "forgot-password" ? "Reset your password"
                   : emailTitle,
          html: html
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTestStatus({ success: true, message: "Custom styled email sent successfully!" });
        fetchDashboardData();
      } else {
        setTestStatus({ success: false, message: data.error || "Failed to send email." });
      }
    } catch (error) {
      setTestStatus({ success: false, message: "Error: " + error.message });
    } finally {
      setSendingTest(false);
    }
  };

  const renderSmtpSettings = () => {
    return (
      <div className="smtp-settings-container card">
        <div className="smtp-settings-header">
          <h2>Custom SMTP Configuration</h2>
          <p className="smtp-settings-subtitle">
            Configure your own custom SMTP servers (like Gmail, SendGrid, Amazon SES, etc.) to send emails through your own domain.
          </p>
        </div>

        <form onSubmit={handleSaveSmtpSettings} className="smtp-settings-form">
          {/* Toggle Switch */}
          <div className="smtp-toggle-section">
            <div className="smtp-toggle-info">
              <h4>Enable Custom SMTP</h4>
              <p>When enabled, all emails sent via your API keys will use these SMTP settings instead of global defaults.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={smtpEnabled} 
                onChange={(e) => setSmtpEnabled(e.target.checked)} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className={`smtp-fields-grid ${smtpEnabled ? "active" : "disabled"}`}>
            <div className="form-group">
              <label>SMTP Host</label>
              <input 
                type="text" 
                placeholder="e.g. smtp.gmail.com" 
                value={smtpHost} 
                onChange={(e) => setSmtpHost(e.target.value)}
                disabled={!smtpEnabled}
                required={smtpEnabled}
              />
            </div>

            <div className="form-group">
              <label>SMTP Port</label>
              <input 
                type="number" 
                placeholder="e.g. 587" 
                value={smtpPort} 
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                disabled={!smtpEnabled}
                required={smtpEnabled}
              />
            </div>

            <div className="form-group smtp-secure-checkbox">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={smtpSecure} 
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                  disabled={!smtpEnabled}
                />
                Use Secure Connection (SSL/TLS for Port 465)
              </label>
            </div>

            <div className="form-group">
              <label>SMTP Username / User Email</label>
              <input 
                type="text" 
                placeholder="e.g. user@domain.com" 
                value={smtpUser} 
                onChange={(e) => setSmtpUser(e.target.value)}
                disabled={!smtpEnabled}
                required={smtpEnabled}
              />
            </div>

            <div className="form-group">
              <label>SMTP Password</label>
              <input 
                type="password" 
                placeholder={hasSmtpPassSaved ? "••••••••" : "Enter password or App password"} 
                value={smtpPass} 
                onChange={(e) => setSmtpPass(e.target.value)}
                disabled={!smtpEnabled}
                required={smtpEnabled && !hasSmtpPassSaved}
              />
            </div>

            <div className="form-group">
              <label>Default Sender Email (From Address)</label>
              <input 
                type="email" 
                placeholder="e.g. no-reply@yourcompany.com" 
                value={smtpFromEmail} 
                onChange={(e) => setSmtpFromEmail(e.target.value)}
                disabled={!smtpEnabled}
                required={smtpEnabled}
              />
            </div>

            <div className="form-group">
              <label>Default Sender Name (From Name)</label>
              <input 
                type="text" 
                placeholder="e.g. Acme Support" 
                value={smtpFromName} 
                onChange={(e) => setSmtpFromName(e.target.value)}
                disabled={!smtpEnabled}
                required={smtpEnabled}
              />
            </div>
          </div>

          {smtpTestResult && (
            <div className={`smtp-result-banner ${smtpTestResult.success ? "success" : "error"}`}>
              {smtpTestResult.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{smtpTestResult.message}</span>
            </div>
          )}

          {smtpSaveResult && (
            <div className={`smtp-result-banner ${smtpSaveResult.success ? "success" : "error"}`}>
              {smtpSaveResult.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{smtpSaveResult.message}</span>
            </div>
          )}

          <div className="smtp-actions-bar">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleTestSmtpConnection}
              disabled={!smtpEnabled || testingSmtp}
            >
              {testingSmtp ? "Testing Connection..." : "Test Connection"}
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={savingSmtp || !smtpEnabled}
            >
              {savingSmtp ? "Saving Configuration..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderCustomizer = () => {
    const html = generateEmailHtml();

    return (
      <div className="customizer-container">
        {/* Left column: Editor */}
        <div className="card customizer-editor-card">
          <h2>Template Configuration</h2>
          <p className="customizer-desc">
            Customize the look and feel of your transactional emails. Styles will be compiled to responsive, inline HTML.
          </p>

          {!showAiCard ? (
            <div style={{ marginBottom: "20px" }}>
              <button 
                type="button" 
                className="btn-ai-trigger-inline"
                onClick={() => setShowAiCard(true)}
              >
                <Sparkles size={13} /> Write with AI Assistant
              </button>
            </div>
          ) : (
            <div className="ai-assistant-card">
              <div className="ai-header-row">
                <span className="ai-title">
                  <Sparkles size={16} /> AI Email Writer
                </span>
                <button 
                  type="button" 
                  className="ai-close-btn"
                  onClick={() => setShowAiCard(false)}
                  title="Close AI Assistant"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="ai-form-group">
                <label>What should this email be about?</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Welcome users and offer them a 10% discount on their first purchase"
                  className="ai-prompt-textarea"
                />
              </div>

              <div className="ai-row">
                <div className="ai-form-group">
                  <label>Email Type</label>
                  <select 
                    value={aiType} 
                    onChange={(e) => setAiType(e.target.value)}
                    className="ai-select"
                  >
                    <option value="custom">Custom/Marketing</option>
                    <option value="welcome">Welcome Email</option>
                    <option value="otp">OTP / Verification</option>
                    <option value="forgot-password">Password Reset</option>
                    <option value="notification">Notification</option>
                  </select>
                </div>

                <div className="ai-form-group">
                  <label>Tone</label>
                  <select 
                    value={aiTone} 
                    onChange={(e) => setAiTone(e.target.value)}
                    className="ai-select"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Casual">Casual</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Persuasive">Persuasive</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="btn-ai-generate"
                onClick={handleAiGenerate}
                disabled={generatingAi || !aiPrompt.trim()}
              >
                {generatingAi ? "Generating content..." : "✨ Generate & Apply Content"}
              </button>

              {aiNote && (
                <div className="ai-banner-info">
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{aiNote}</span>
                </div>
              )}
            </div>
          )}

          <div className="global-toggle-wrapper">
            <div className="global-toggle-label-group">
              <span className="global-toggle-title">Apply one design to all API keys</span>
              <p className="global-toggle-desc">When enabled, all API keys will use the global template design. When disabled, you can customize each key's styling individually.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={user.useGlobalTemplateSettings !== false} 
                onChange={async (e) => {
                  const newValue = e.target.checked;
                  try {
                    await updateUserSettings({ useGlobalTemplateSettings: newValue });
                    if (newValue) {
                      setSelectedTarget("global");
                    }
                  } catch (err) {
                    alert("Failed to update settings: " + err.message);
                  }
                }} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          {user.useGlobalTemplateSettings === false && (
            <div className="form-group target-selector-group" style={{ marginBottom: "20px" }}>
              <label className="customizer-field-label">Edit Design For</label>
              <select 
                value={selectedTarget} 
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="target-design-select"
              >
                <option value="global">Global Default Style</option>
                {apiKeys.map(key => (
                  <option key={key._id} value={key._id}>
                    {key.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="customizer-form">
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="customizer-field-label">Preview/Edit Template</label>
              <select 
                value={activeTemplate} 
                onChange={(e) => setActiveTemplate(e.target.value)}
                className="target-design-select"
                style={{ width: "100%" }}
              >
                <option value="custom">Custom / Marketing Email</option>
                <option value="welcome">Welcome Email</option>
                <option value="otp">OTP / Verification Code</option>
                <option value="forgot-password">Password Reset Flow</option>
                <option value="notification">Notification / Alert</option>
              </select>
            </div>

            <div className="form-group">
              <label>Brand Name</label>
              <input 
                type="text" 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)} 
                placeholder="e.g. My Brand"
              />
            </div>

            <div className="colors-grid">
              <div className="form-group color-picker-group">
                <label>Header BG</label>
                <div className="color-picker-wrapper">
                  <input 
                    type="color" 
                    value={colorHeaderBg} 
                    onChange={(e) => setColorHeaderBg(e.target.value)} 
                  />
                  <code>{colorHeaderBg}</code>
                </div>
              </div>

              <div className="form-group color-picker-group">
                <label>Header Text</label>
                <div className="color-picker-wrapper">
                  <input 
                    type="color" 
                    value={colorHeaderText} 
                    onChange={(e) => setColorHeaderText(e.target.value)} 
                  />
                  <code>{colorHeaderText}</code>
                </div>
              </div>

              <div className="form-group color-picker-group">
                <label>Button BG</label>
                <div className="color-picker-wrapper">
                  <input 
                    type="color" 
                    value={colorButtonBg} 
                    onChange={(e) => setColorButtonBg(e.target.value)} 
                  />
                  <code>{colorButtonBg}</code>
                </div>
              </div>

              <div className="form-group color-picker-group">
                <label>Canvas BG</label>
                <div className="color-picker-wrapper">
                  <input 
                    type="color" 
                    value={colorBgLight} 
                    onChange={(e) => setColorBgLight(e.target.value)} 
                  />
                  <code>{colorBgLight}</code>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Title / Subject</label>
              <input 
                type="text" 
                value={emailTitle} 
                onChange={(e) => setEmailTitle(e.target.value)} 
                placeholder="e.g. Welcome to MailBridge"
              />
            </div>

            <div className="form-group">
              <label>Email Message</label>
              <textarea 
                value={emailMessage} 
                onChange={(e) => setEmailMessage(e.target.value)} 
                placeholder="Enter email message here..."
                rows={4}
              />
            </div>

            <div className="row-inputs">
              <div className="form-group">
                <label>Action Button Text</label>
                <input 
                  type="text" 
                  value={emailActionText} 
                  onChange={(e) => setEmailActionText(e.target.value)} 
                  placeholder="e.g. Verify Email"
                />
              </div>

              <div className="form-group">
                <label>Action Button URL</label>
                <input 
                  type="text" 
                  value={emailActionUrl} 
                  onChange={(e) => setEmailActionUrl(e.target.value)} 
                  placeholder="e.g. https://domain.com/verify"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Footer Text</label>
              <input 
                type="text" 
                value={emailFooter} 
                onChange={(e) => setEmailFooter(e.target.value)} 
                placeholder="Footer details, copyright, unsubscribe..."
              />
            </div>

            <div className="save-settings-box" style={{ marginTop: "16px", marginBottom: "8px" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "8px" }}
              >
                {savingSettings 
                  ? (selectedTarget === "global" ? "Saving Global Style..." : "Saving Key Style...") 
                  : (selectedTarget === "global" ? "Save Global Style" : "Save Key Style")}
              </button>
              {saveStatus && (
                <div className={`test-status-banner ${saveStatus.success ? "success" : "failed"}`} style={{ marginTop: "12px" }}>
                  {saveStatus.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span>{saveStatus.message}</span>
                </div>
              )}
            </div>

            <hr className="customizer-divider" />

            <div className="test-send-box">
              <h3>Send Test Email</h3>
              <p className="test-desc">
                Send this compiled HTML layout directly to your inbox using the active API key.
              </p>
              
              {!apiKey && (
                <div className="alert-message warning">
                  <AlertCircle size={16} />
                  <span>No active API key. Please generate a key in the Overview tab to send tests.</span>
                </div>
              )}

              <form onSubmit={handleSendTestEmail} className="test-send-form">
                <input 
                  type="email" 
                  value={testRecipient} 
                  onChange={(e) => setTestRecipient(e.target.value)} 
                  placeholder="your-email@domain.com"
                  required
                  disabled={!apiKey || sendingTest}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!apiKey || sendingTest}
                >
                  {sendingTest ? "Sending..." : "Send Test"}
                </button>
              </form>

              {testStatus && (
                <div className={`test-status-banner ${testStatus.success ? "success" : "failed"}`}>
                  {testStatus.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Live Preview */}
        <div className="card customizer-preview-card">
          <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Eye size={20} /> Live Preview
            {aiNote && aiNote.includes("applied") && (
              <span className="log-style-badge" style={{ fontSize: "11px", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.3)", marginLeft: "auto", textTransform: "none", letterSpacing: "normal" }}>
                ✨ AI Generated
              </span>
            )}
          </h2>

          <div className="live-preview-workspace">
            <div className="inbox-header">
              <div className="inbox-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="inbox-subject">
                <span className="subject-label">Subject:</span>
                <span className="subject-text">
                  {activeTemplate === "welcome" ? `Welcome to ${brandName}`
                    : activeTemplate === "otp" ? "Your verification OTP"
                    : activeTemplate === "forgot-password" ? "Reset your password"
                    : activeTemplate === "notification" ? (emailTitle || "Notification Alert")
                    : emailTitle || "(No Subject)"}
                </span>
              </div>
            </div>
            <div className="email-preview-scroll-wrapper">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RotateCcw size={40} className="loading-spinner" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user.name}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => fetchDashboardData()}>
            <RotateCcw size={16} /> Refresh
          </button>
          <button className="btn btn-danger-outline" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`dashboard-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BarChart2 size={18} /> Overview & Analytics
        </button>
        <button 
          className={`dashboard-tab-btn ${activeTab === "customizer" ? "active" : ""}`}
          onClick={() => setActiveTab("customizer")}
        >
          <SparklesIcon size={18} /> Email Template Builder
        </button>
        <button 
          className={`dashboard-tab-btn ${activeTab === "smtp" ? "active" : ""}`}
          onClick={() => setActiveTab("smtp")}
        >
          <Settings size={18} /> SMTP Configuration
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {renderSmtpBanner()}

          {/* Metrics Summary Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon sent">
                <Mail size={22} />
              </div>
              <div className="metric-info">
                <label>Total Emails</label>
                <h3>{total}</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon success">
                <ShieldCheck size={22} />
              </div>
              <div className="metric-info">
                <label>Success Rate</label>
                <h3>{successRate}%</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon simulated">
                <SparklesIcon size={22} />
              </div>
              <div className="metric-info">
                <label>Simulated</label>
                <h3>{simulated}</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon failed">
                <XCircle size={22} />
              </div>
              <div className="metric-info">
                <label>Failed</label>
                <h3>{failed}</h3>
              </div>
            </div>
          </div>

          {/* Analytics Visualization and Account Cards */}
          <div className="dashboard-grid">
            {renderChart()}

            <div className="card account-card">
              <h2>Account Details</h2>
              <div className="info-group">
                <label>Full Name</label>
                <p className="info-value">{user.name}</p>
              </div>
              <div className="info-group">
                <label>Email Address</label>
                <p className="info-value">{user.email}</p>
              </div>
              <div className="info-group">
                <label>Active Keys Count</label>
                <p className="info-value">{apiKeys.length}</p>
              </div>
              <div className="dashboard-shortcuts">
                <a href="/tester" className="btn btn-primary">Try API Tester</a>
                <a href="/docs" className="btn btn-secondary">Read Docs</a>
              </div>
            </div>

            {renderApiKeyTable()}
            {renderLogsTable()}
          </div>
        </>
      )}

      {activeTab === "customizer" && renderCustomizer()}

      {activeTab === "smtp" && renderSmtpSettings()}

      {selectedLog && renderLogDetailModal()}
    </div>
  );
}

// Sparkles icon local definition to handle icon compatibility cleanly
function SparklesIcon({ size }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="lucide lucide-sparkles"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"/>
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
    </svg>
  );
}
