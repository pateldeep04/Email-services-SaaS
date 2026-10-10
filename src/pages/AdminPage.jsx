import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Users,
  Mail,
  Send,
  Activity,
  Server,
  Key,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  UserPlus,
  Trash2,
  UserCheck,
  UserX,
  ExternalLink,
  Cpu,
  Clock,
  Layers,
  Check,
  X,
  Eye,
  EyeOff,
  Info,
  Smartphone,
  Webhook,
  Copy,
  Plus,
  Zap,
  RotateCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSEO } from "../hooks/useSEO.js";
import { API_URL } from "../config.js";
import "../styles/Admin.css";

export function AdminPage() {
  const { token, user: currentAdmin } = useAuth();

  useSEO({
    title: "System Admin Console | MailBridge",
    description: "Manage users, monitor platform delivery logs, review global email campaigns, and inspect system health.",
    noindex: true
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Users tab state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userLoading, setUserLoading] = useState(false);

  // Email Logs tab state
  const [logs, setLogs] = useState([]);
  const [logSearch, setLogSearch] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState("all");
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logLoading, setLogLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Campaigns tab state
  const [campaigns, setCampaigns] = useState([]);
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);
  const [campaignLoading, setCampaignLoading] = useState(false);

  // System tab state
  const [systemInfo, setSystemInfo] = useState(null);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpResult, setSmtpResult] = useState(null);

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    role: "client"
  });
  const [addUserError, setAddUserError] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [viewUserKeysModal, setViewUserKeysModal] = useState(null);
  const [viewUserServicesModal, setViewUserServicesModal] = useState(null);

  // API Key Management & Controls States
  const [userKeysList, setUserKeysList] = useState([]);
  const [userKeysLoading, setUserKeysLoading] = useState(false);
  const [showUnmaskedKeys, setShowUnmaskedKeys] = useState({});
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [newAdminKeyName, setNewAdminKeyName] = useState("");
  const [creatingKeyForUser, setCreatingKeyForUser] = useState(false);
  const [cacheFlushing, setCacheFlushing] = useState(false);

  // Global notification banner
  const [alertMessage, setAlertMessage] = useState(null);

  const showAlert = (text, type = "success") => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4500);
  };

  // Fetch detailed API keys for inspected user
  const fetchUserKeys = useCallback(async (userId) => {
    if (!userId) return;
    setUserKeysLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${userId}/keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserKeysList(data.keys || []);
      }
    } catch (err) {
      console.error("Failed to fetch user API keys:", err);
    } finally {
      setUserKeysLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (viewUserKeysModal?._id) {
      fetchUserKeys(viewUserKeysModal._id);
    } else {
      setUserKeysList([]);
    }
  }, [viewUserKeysModal, fetchUserKeys]);

  // Toggle API Key Active/Revoked Status
  async function handleToggleKey(keyId, currentActive) {
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/keys/${keyId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentActive })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update API key status.");
      showAlert(data.message || "API key updated successfully.");
      if (viewUserKeysModal?._id) fetchUserKeys(viewUserKeysModal._id);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showAlert(err.message, "danger");
    }
  }

  // Rotate API Key
  async function handleRotateKey(keyId) {
    if (!window.confirm("Rotate this API key? A new key value will be generated and the existing key will be immediately revoked.")) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/keys/${keyId}/rotate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rotate API key.");
      showAlert(data.message || "API key rotated successfully.");
      if (viewUserKeysModal?._id) fetchUserKeys(viewUserKeysModal._id);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showAlert(err.message, "danger");
    }
  }

  // Permanently Delete API Key
  async function handleDeleteKey(keyId) {
    if (!window.confirm("Permanently delete this API key? This cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete API key.");
      showAlert(data.message || "API key deleted successfully.");
      if (viewUserKeysModal?._id) fetchUserKeys(viewUserKeysModal._id);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showAlert(err.message, "danger");
    }
  }

  // Admin Generate New API Key for User
  async function handleCreateKeyForUser(e) {
    e.preventDefault();
    if (!viewUserKeysModal?._id) return;
    setCreatingKeyForUser(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${viewUserKeysModal._id}/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newAdminKeyName || "Admin Provisioned Key" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate API key.");
      showAlert(data.message || "New API key provisioned successfully.");
      setNewAdminKeyName("");
      fetchUserKeys(viewUserKeysModal._id);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showAlert(err.message, "danger");
    } finally {
      setCreatingKeyForUser(false);
    }
  }

  // Purge / Flush Cache
  async function handleFlushCache() {
    setCacheFlushing(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/cache/flush`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to purge cache.");
      showAlert(data.message || "High-performance cache purged successfully.");
      fetchStats();
    } catch (err) {
      showAlert(err.message, "danger");
    } finally {
      setCacheFlushing(false);
    }
  }

  function handleCopyKey(keyId, keyValue) {
    navigator.clipboard.writeText(keyValue);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2500);
  }

  function toggleShowKey(keyId) {
    setShowUnmaskedKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  }

  // 1. Fetch Overview Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    }
  }, [token]);

  // 2. Fetch Users
  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: userPage,
        limit: 10,
        search: userSearch,
        role: userRoleFilter
      });
      const res = await fetch(`${API_URL}/api/v1/admin/users?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setUserTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUserLoading(false);
    }
  }, [token, userPage, userSearch, userRoleFilter]);

  // 3. Fetch Global Email Logs
  const fetchLogs = useCallback(async () => {
    setLogLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: logPage,
        limit: 15,
        search: logSearch,
        status: logStatusFilter,
        type: logTypeFilter
      });
      const res = await fetch(`${API_URL}/api/v1/admin/emails?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setLogTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLogLoading(false);
    }
  }, [token, logPage, logSearch, logStatusFilter, logTypeFilter]);

  // 4. Fetch Global Campaigns
  const fetchCampaigns = useCallback(async () => {
    setCampaignLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/campaigns?page=${campaignPage}&limit=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setCampaignTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setCampaignLoading(false);
    }
  }, [token, campaignPage]);

  // 5. Fetch System Info
  const fetchSystemInfo = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/system`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSystemInfo(data);
      }
    } catch (err) {
      console.error("Failed to fetch system info:", err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchStats(), fetchSystemInfo()]);
      setLoading(false);
    }
    loadData();
  }, [fetchStats, fetchSystemInfo]);

  // Switch tabs
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "emails") {
      fetchLogs();
    } else if (activeTab === "campaigns") {
      fetchCampaigns();
    } else if (activeTab === "system") {
      fetchSystemInfo();
    }
  }, [activeTab, fetchUsers, fetchLogs, fetchCampaigns, fetchSystemInfo]);

  // Toggle user role
  async function handleToggleRole(userItem) {
    const newRole = userItem.role === "admin" ? "client" : "admin";
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${userItem._id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      showAlert(`User role updated to ${newRole}.`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showAlert(err.message, "danger");
    }
  }

  // Delete user
  async function handleDeleteUser() {
    if (!deleteCandidate) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${deleteCandidate._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      showAlert("User account permanently deleted.");
      setDeleteCandidate(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showAlert(err.message, "danger");
    }
  }

  // Create new user form submit
  async function handleCreateUserSubmit(e) {
    e.preventDefault();
    setAddUserError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUserForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      showAlert(`User ${data.user.email} successfully created.`);
      setShowAddUserModal(false);
      setNewUserForm({
        name: "",
        email: "",
        password: "",
        companyName: "",
        role: "client"
      });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setAddUserError(err.message);
    }
  }

  // Run SMTP connection test
  async function handleTestSmtp() {
    setSmtpTesting(true);
    setSmtpResult(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/test-smtp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSmtpResult({
        success: data.success,
        message: data.message || data.error
      });
    } catch (err) {
      setSmtpResult({
        success: false,
        message: err.message || "Failed to connect to SMTP server."
      });
    } finally {
      setSmtpTesting(false);
    }
  }

  const formatUptime = (seconds) => {
    if (!seconds) return "0m";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? d + "d " : ""}${h > 0 ? h + "h " : ""}${m}m`;
  };

  return (
    <div className="admin-page-container">
      {/* Top Banner */}
      <div className="admin-hero-banner">
        <div className="admin-hero-left">
          <h1>
            <Shield size={28} color="#0f766e" />
            <span>MailBridge Console</span>
            <span className="admin-hero-badge">Admin</span>
          </h1>
          <p>
            Logged in as <strong>{currentAdmin?.name || currentAdmin?.email}</strong>. Full platform supervision, user management, and delivery analytics.
          </p>
        </div>

        <div className="admin-hero-actions">
          <div className="admin-live-pulse">
            <span className="pulse-dot" />
            <span>
              {stats?.system?.database === "mongodb" ? "MongoDB Atlas Live" : "In-Memory Active"}
            </span>
          </div>

          <button
            className="admin-btn admin-btn-outline"
            onClick={() => {
              fetchStats();
              if (activeTab === "users") fetchUsers();
              if (activeTab === "emails") fetchLogs();
              if (activeTab === "campaigns") fetchCampaigns();
              if (activeTab === "system") fetchSystemInfo();
              showAlert("Dashboard data refreshed!");
            }}
            title="Refresh All Data"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`badge badge-${alertMessage.type}`}
          style={{
            padding: "12px 18px",
            borderRadius: "10px",
            width: "100%",
            marginBottom: "20px",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {alertMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Activity size={17} /> Overview & Analytics
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={17} /> User Management ({stats?.users?.total || 0})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "emails" ? "active" : ""}`}
          onClick={() => setActiveTab("emails")}
        >
          <Mail size={17} /> Global Email Logs ({stats?.emails?.total || 0})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "campaigns" ? "active" : ""}`}
          onClick={() => setActiveTab("campaigns")}
        >
          <Send size={17} /> Campaigns ({stats?.campaigns?.total || 0})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          <Server size={17} /> System & Diagnostics
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">Total Users</span>
                <div className="admin-stat-icon-wrapper" style={{ background: "rgba(15, 118, 110, 0.12)", color: "#0f766e" }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.users?.total ?? "..."}</div>
              <div className="admin-stat-sub">
                <span style={{ color: "#38bdf8", fontWeight: 600 }}>{stats?.users?.regularClients ?? stats?.users?.clients ?? 0} Regular Clients</span>
                <span>•</span>
                <span style={{ color: "#a855f7", fontWeight: 600 }}>{stats?.users?.admins || 0} Admins</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">Total Emails Sent</span>
                <div className="admin-stat-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }}>
                  <Mail size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.emails?.total ?? "..."}</div>
              <div className="admin-stat-sub">
                <span>{stats?.emails?.last24Hours || 0} sent in last 24h</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">Deliverability Rate</span>
                <div className="admin-stat-icon-wrapper" style={{ background: "rgba(34, 197, 94, 0.12)", color: "#16a34a" }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.emails?.deliverabilityRate ?? 100}%</div>
              <div className="admin-stat-sub">
                <span>{stats?.emails?.failed || 0} total failed deliveries</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">Active API Keys</span>
                <div className="admin-stat-icon-wrapper" style={{ background: "rgba(234, 179, 8, 0.12)", color: "#ca8a04" }}>
                  <Key size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.apiKeys?.total ?? "..."}</div>
              <div className="admin-stat-sub">
                <span>Across all client accounts</span>
              </div>
            </div>
          </div>

          {/* Delivery Breakdown & Health Tile */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "30px" }}>
            <div className="admin-card-section" style={{ margin: 0 }}>
              <h3 className="admin-section-title" style={{ marginBottom: "16px" }}>
                <Activity size={18} color="#0f766e" /> Delivery Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <span>Live Dispatches</span>
                    <strong>{stats?.emails?.sent || 0}</strong>
                  </div>
                  <div style={{ height: "8px", background: "rgba(148, 163, 184, 0.2)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        background: "#16a34a",
                        width: `${stats?.emails?.total ? Math.round((stats.emails.sent / stats.emails.total) * 100) : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <span>Simulated / Sandbox</span>
                    <strong>{stats?.emails?.simulated || 0}</strong>
                  </div>
                  <div style={{ height: "8px", background: "rgba(148, 163, 184, 0.2)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        background: "#3b82f6",
                        width: `${stats?.emails?.total ? Math.round((stats.emails.simulated / stats.emails.total) * 100) : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <span>Failed Deliveries</span>
                    <strong style={{ color: "#ef4444" }}>{stats?.emails?.failed || 0}</strong>
                  </div>
                  <div style={{ height: "8px", background: "rgba(148, 163, 184, 0.2)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        background: "#ef4444",
                        width: `${stats?.emails?.total ? Math.round((stats.emails.failed / stats.emails.total) * 100) : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card-section" style={{ margin: 0 }}>
              <h3 className="admin-section-title" style={{ marginBottom: "16px" }}>
                <Server size={18} color="#0f766e" /> System Health Status
              </h3>
              <div className="admin-key-value-list">
                <div className="admin-kv-row">
                  <span className="admin-kv-label">Database Engine</span>
                  <span className="badge badge-success">
                    {stats?.system?.database === "mongodb" ? "MongoDB Atlas Cloud" : "In-Memory Fallback"}
                  </span>
                </div>
                <div className="admin-kv-row">
                  <span className="admin-kv-label">Server Uptime</span>
                  <span className="admin-kv-val">{formatUptime(stats?.system?.uptimeSeconds)}</span>
                </div>
                <div className="admin-kv-row">
                  <span className="admin-kv-label">Node Runtime</span>
                  <span className="admin-kv-val">{stats?.system?.nodeVersion || "Node.js"}</span>
                </div>
                <div className="admin-kv-row">
                  <span className="admin-kv-label">Memory Heap Used</span>
                  <span className="admin-kv-val">{stats?.system?.memoryHeapMB || 0} MB</span>
                </div>
                <div className="admin-kv-row">
                  <span className="admin-kv-label">Cache Engine</span>
                  <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Zap size={11} /> High-Speed TTL Cache
                  </span>
                </div>
                <div className="admin-kv-row">
                  <span className="admin-kv-label">Cache Performance</span>
                  <span className="admin-kv-val">
                    {stats?.cache?.hitRatioPercent ?? 0}% Hit Rate ({stats?.cache?.hits ?? 0} hits, {stats?.cache?.keysCount ?? 0} keys)
                  </span>
                </div>
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    style={{ fontSize: "11px", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    onClick={handleFlushCache}
                    disabled={cacheFlushing}
                    title="Purge cached stats and API key authentication lookup cache"
                  >
                    <Zap size={12} color="#0f766e" /> {cacheFlushing ? "Purging..." : "Flush Cache"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* USER CLASSIFICATION & API KEY DISTRIBUTION SECTION */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "30px" }}>
            {/* Box 1: Regular vs Admin User Breakdown */}
            <div className="admin-card-section" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="admin-section-title" style={{ margin: 0 }}>
                  <Users size={18} color="#0f766e" /> User Type Breakdown
                </h3>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Total: {stats?.users?.total || 0}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Regular Users (Clients) */}
                <div style={{ padding: "14px", background: "rgba(14, 165, 233, 0.08)", border: "1px solid rgba(14, 165, 233, 0.2)", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#0ea5e9" }} />
                      <strong style={{ fontSize: "14px" }}>Regular Client Users</strong>
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#0ea5e9" }}>
                      {stats?.users?.regularClients ?? stats?.users?.clients ?? 0}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    Standard registered customers who send emails, create API keys, and manage their personal mail relay.
                  </p>
                </div>

                {/* Administrators */}
                <div style={{ padding: "14px", background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.2)", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#a855f7" }} />
                      <strong style={{ fontSize: "14px" }}>Platform Administrators</strong>
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#a855f7" }}>
                      {stats?.users?.admins || 0}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    Privileged operator accounts with access to the hidden security portal, logs, and system metrics.
                  </p>
                </div>
              </div>
            </div>

            {/* Box 2: API Keys Created Per User */}
            <div className="admin-card-section" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="admin-section-title" style={{ margin: 0 }}>
                  <Key size={18} color="#ca8a04" /> API Keys Created Per User
                </h3>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Total Keys: {stats?.apiKeys?.total || 0}</span>
              </div>

              {(!stats?.apiKeys?.topCreators || stats?.apiKeys?.topCreators.length === 0) ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                  No API keys registered yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {stats?.apiKeys?.topCreators.map((creator, idx) => (
                    <div
                      key={creator.userId || idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: "rgba(148, 163, 184, 0.06)",
                        border: "1px solid rgba(148, 163, 184, 0.12)",
                        borderRadius: "8px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: creator.role === "admin" ? "rgba(168, 85, 247, 0.15)" : "rgba(14, 165, 233, 0.15)",
                            color: creator.role === "admin" ? "#a855f7" : "#0ea5e9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700
                          }}
                        >
                          {creator.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>{creator.name}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{creator.email}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          className={`badge badge-${creator.role === "admin" ? "admin" : "client"}`}
                          style={{ fontSize: "10px", padding: "2px 8px" }}
                        >
                          {creator.role === "admin" ? "Admin" : "Regular"}
                        </span>
                        <span
                          style={{
                            background: "rgba(234, 179, 8, 0.15)",
                            color: "#ca8a04",
                            padding: "4px 10px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: 700
                          }}
                        >
                          {creator.apiKeyCount} {creator.apiKeyCount === 1 ? "Key" : "Keys"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Box 3: Platform Services Matrix */}
          <div className="admin-card-section" style={{ marginTop: 0, marginBottom: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="admin-section-title" style={{ margin: 0 }}>
                <Layers size={18} color="#0f766e" /> Platform Multi-Service Architecture
              </h3>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>6 Core SaaS Services Available</span>
            </div>

            <div className="admin-services-grid">
              <div className="admin-service-card is-active">
                <div className="admin-service-card-header">
                  <div className="admin-service-title"><Mail size={16} color="#0f766e" /> Transactional Email Relay</div>
                  <span className="badge badge-success">Core Service</span>
                </div>
                <div className="admin-service-metric"><span>Global Dispatches:</span><strong>{stats?.emails?.total || 0}</strong></div>
                <div className="admin-service-metric"><span>Deliverability:</span><strong>{stats?.emails?.deliverabilityRate ?? 100}%</strong></div>
              </div>

              <div className="admin-service-card is-active">
                <div className="admin-service-card-header">
                  <div className="admin-service-title"><Key size={16} color="#ca8a04" /> API Keys Provisioning</div>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="admin-service-metric"><span>Keys Issued:</span><strong>{stats?.apiKeys?.total || 0}</strong></div>
                <div className="admin-service-metric"><span>Auth Type:</span><span>Header Bearer / x-api-key</span></div>
              </div>

              <div className="admin-service-card is-active">
                <div className="admin-service-card-header">
                  <div className="admin-service-title"><Send size={16} color="#3b82f6" /> Bulk Cold Outreach</div>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="admin-service-metric"><span>Campaigns Launched:</span><strong>{stats?.campaigns?.total || 0}</strong></div>
                <div className="admin-service-metric"><span>Lead Ingestion:</span><span>CSV / Excel (.xlsx)</span></div>
              </div>

              <div className="admin-service-card is-active">
                <div className="admin-service-card-header">
                  <div className="admin-service-title"><Server size={16} color="#8b5cf6" /> Custom SMTP Integration</div>
                  <span className="badge badge-info">Relay Engine</span>
                </div>
                <div className="admin-service-metric"><span>Relay Support:</span><span>Gmail, SES, SendGrid, Postmark</span></div>
                <div className="admin-service-metric"><span>Fallback:</span><span>System Gmail Relay Pool</span></div>
              </div>

              <div className="admin-service-card is-active">
                <div className="admin-service-card-header">
                  <div className="admin-service-title"><Smartphone size={16} color="#10b981" /> SMS OTP Gateway</div>
                  <span className="badge badge-info">Multi-Channel</span>
                </div>
                <div className="admin-service-metric"><span>Protocols:</span><span>SMS Delivery & OTP Verification</span></div>
                <div className="admin-service-metric"><span>Simulation Mode:</span><span>Supported for Zero-Cost QA</span></div>
              </div>

              <div className="admin-service-card is-active">
                <div className="admin-service-card-header">
                  <div className="admin-service-title"><Webhook size={16} color="#ec4899" /> Webhooks & Event Streams</div>
                  <span className="badge badge-info">Real-time</span>
                </div>
                <div className="admin-service-metric"><span>Events:</span><span>email.sent, email.failed, otp.verified</span></div>
                <div className="admin-service-metric"><span>Security:</span><span>HMAC Signature Verification</span></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === "users" && (
        <div className="admin-card-section">
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <Search size={16} />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search users by name, email, or company..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
              />
            </div>

            <div className="admin-filter-group">
              <select
                className="admin-select"
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
              >
                <option value="all">All Accounts ({stats?.users?.total || 0})</option>
                <option value="client">Regular Clients Only ({stats?.users?.regularClients ?? stats?.users?.clients ?? 0})</option>
                <option value="admin">Administrators Only ({stats?.users?.admins || 0})</option>
              </select>

              <button
                className="admin-btn admin-btn-primary"
                onClick={() => setShowAddUserModal(true)}
              >
                <UserPlus size={16} /> Add User
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company</th>
                  <th>Account Type</th>
                  <th>Services Consumed</th>
                  <th>API Keys Created</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      Loading users directory...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No users found matching current filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelf = String(u._id) === String(currentAdmin?.id || currentAdmin?._id);
                    const isAdmin = u.role === "admin" || u.role === "superadmin";
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="admin-user-cell">
                            <div
                              className="admin-avatar"
                              style={{
                                background: isAdmin ? "rgba(168, 85, 247, 0.15)" : "rgba(14, 165, 233, 0.15)",
                                color: isAdmin ? "#a855f7" : "#0ea5e9"
                              }}
                            >
                              {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <div className="admin-user-info-name">
                                {u.name} {isSelf && <span style={{ fontSize: "11px", color: "#0f766e" }}>(You)</span>}
                              </div>
                              <div className="admin-user-info-sub">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{u.companyName || "—"}</td>
                        <td>
                          <span
                            className={`badge badge-${isAdmin ? "admin" : "client"}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                          >
                            {isAdmin && <Shield size={11} />}
                            {isAdmin ? "Administrator" : "Regular Client"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span
                                style={{
                                  background: (u.services?.activeCount ?? 0) > 0 ? "rgba(15, 118, 110, 0.15)" : "rgba(148, 163, 184, 0.15)",
                                  color: (u.services?.activeCount ?? 0) > 0 ? "#0f766e" : "#64748b",
                                  padding: "2px 8px",
                                  borderRadius: "9999px",
                                  fontSize: "11px",
                                  fontWeight: 700
                                }}
                              >
                                {u.services?.activeCount ?? ((u.emailCount > 0 ? 1 : 0) + (u.apiKeyCount > 0 ? 1 : 0))} Services Active
                              </span>
                              <button
                                type="button"
                                className="admin-btn admin-btn-outline"
                                style={{ padding: "2px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                onClick={() => setViewUserServicesModal(u)}
                                title="Inspect detailed service consumption"
                              >
                                <Eye size={11} /> Details
                              </button>
                            </div>
                            <div className="admin-service-chips">
                              <span
                                className={`admin-service-chip ${(u.services?.emails?.total ?? u.emailCount ?? 0) > 0 ? "active" : ""}`}
                                title={`Transactional Emails: ${u.services?.emails?.total ?? u.emailCount ?? 0}`}
                              >
                                <Mail size={11} /> {u.services?.emails?.total ?? u.emailCount ?? 0}
                              </span>
                              <span
                                className={`admin-service-chip ${(u.apiKeyCount ?? 0) > 0 ? "active" : ""}`}
                                title={`API Keys: ${u.apiKeyCount ?? 0}`}
                              >
                                <Key size={11} /> {u.apiKeyCount ?? 0}
                              </span>
                              <span
                                className={`admin-service-chip ${(u.services?.campaigns?.count ?? u.campaignCount ?? 0) > 0 ? "active" : ""}`}
                                title={`Campaigns: ${u.services?.campaigns?.count ?? u.campaignCount ?? 0}`}
                              >
                                <Send size={11} /> {u.services?.campaigns?.count ?? u.campaignCount ?? 0}
                              </span>
                              <span
                                className={`admin-service-chip ${u.services?.smtp?.enabled ? "active" : ""}`}
                                title={u.services?.smtp?.enabled ? `Custom SMTP (${u.services?.smtp?.host})` : "Default Relay"}
                              >
                                <Server size={11} /> {u.services?.smtp?.enabled ? "SMTP" : "Relay"}
                              </span>
                              <span
                                className={`admin-service-chip ${u.services?.sms?.enabled ? "active" : ""}`}
                                title={u.services?.sms?.enabled ? `SMS: ${u.services?.sms?.phoneNumber}` : "No SMS"}
                              >
                                <Smartphone size={11} /> {u.services?.sms?.enabled ? "SMS" : "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            style={{
                              padding: "4px 10px",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              cursor: "pointer"
                            }}
                            onClick={() => setViewUserKeysModal(u)}
                            title="Click to view all API keys created by this user"
                          >
                            <Key size={13} color="#ca8a04" />
                            <strong>{u.apiKeyCount ?? 0}</strong> {u.apiKeyCount === 1 ? "Key" : "Keys"}
                          </button>
                        </td>
                        <td style={{ fontSize: "12px", color: "#64748b" }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              className="admin-btn admin-btn-outline"
                              style={{ padding: "6px 10px", fontSize: "12px" }}
                              onClick={() => handleToggleRole(u)}
                              disabled={isSelf}
                              title={isSelf ? "Cannot change your own role" : `Change role to ${u.role === "admin" ? "client" : "admin"}`}
                            >
                              {u.role === "admin" ? (
                                <>
                                  <UserX size={14} /> Demote
                                </>
                              ) : (
                                <>
                                  <UserCheck size={14} /> Make Admin
                                </>
                              )}
                            </button>

                            <button
                              className="admin-btn admin-btn-danger"
                              style={{ padding: "6px 10px", fontSize: "12px" }}
                              onClick={() => setDeleteCandidate(u)}
                              disabled={isSelf}
                              title={isSelf ? "Cannot delete your own account" : "Delete user"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* User Pagination */}
          <div className="admin-pagination">
            <span>
              Page {userPage} of {userTotalPages}
            </span>
            <div className="admin-pagination-btns">
              <button
                className="admin-page-btn"
                disabled={userPage <= 1}
                onClick={() => setUserPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="admin-page-btn"
                disabled={userPage >= userTotalPages}
                onClick={() => setUserPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL EMAIL LOGS */}
      {activeTab === "emails" && (
        <div className="admin-card-section">
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <Search size={16} />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search recipient, subject, or API key..."
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  setLogPage(1);
                }}
              />
            </div>

            <div className="admin-filter-group">
              <select
                className="admin-select"
                value={logStatusFilter}
                onChange={(e) => {
                  setLogStatusFilter(e.target.value);
                  setLogPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent (Delivered)</option>
                <option value="simulated">Simulated</option>
                <option value="failed">Failed</option>
              </select>

              <select
                className="admin-select"
                value={logTypeFilter}
                onChange={(e) => {
                  setLogTypeFilter(e.target.value);
                  setLogPage(1);
                }}
              >
                <option value="all">All Types</option>
                <option value="welcome">Welcome</option>
                <option value="otp">OTP</option>
                <option value="notification">Notification</option>
                <option value="custom">Custom</option>
                <option value="sms-otp">SMS-OTP</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Sender/Account</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: "right" }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {logLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      Loading email logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No email delivery logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const statusClass =
                      log.status === "sent"
                        ? "success"
                        : log.status === "failed"
                        ? "danger"
                        : "info";
                    return (
                      <tr key={log._id}>
                        <td>
                          <span className={`badge badge-${statusClass}`}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{log.to}</td>
                        <td style={{ maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.subject}
                        </td>
                        <td>
                          <span className="badge badge-client">{log.type}</span>
                        </td>
                        <td style={{ fontSize: "13px" }}>
                          {log.userId?.email || log.userId?.name || (log.apiKey ? `${log.apiKey.slice(0, 10)}...` : "System")}
                        </td>
                        <td style={{ fontSize: "12px", color: "#64748b" }}>
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="admin-btn admin-btn-outline"
                            style={{ padding: "6px 10px", fontSize: "12px" }}
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <span>
              Page {logPage} of {logTotalPages}
            </span>
            <div className="admin-pagination-btns">
              <button
                className="admin-page-btn"
                disabled={logPage <= 1}
                onClick={() => setLogPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="admin-page-btn"
                disabled={logPage >= logTotalPages}
                onClick={() => setLogPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAMPAIGNS MONITOR */}
      {activeTab === "campaigns" && (
        <div className="admin-card-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">
              <Send size={18} color="#0f766e" /> Global Platform Campaigns
            </h3>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Creator / Account</th>
                  <th>Recipients</th>
                  <th>Sent / Failed</th>
                  <th>Opens</th>
                  <th>Clicks</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {campaignLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      Loading platform campaigns...
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No campaigns have been created on the platform yet.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td>
                        <div>{c.userId?.name || c.creatorName || "Unknown"}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {c.userId?.email || c.creatorEmail || ""}
                        </div>
                      </td>
                      <td>{c.totalRecipients || 0}</td>
                      <td>
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>{c.sentCount || 0}</span> /{" "}
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>{c.failedCount || 0}</span>
                      </td>
                      <td>{c.openedCount || 0}</td>
                      <td>{c.clickedCount || 0}</td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <span>
              Page {campaignPage} of {campaignTotalPages}
            </span>
            <div className="admin-pagination-btns">
              <button
                className="admin-page-btn"
                disabled={campaignPage <= 1}
                onClick={() => setCampaignPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="admin-page-btn"
                disabled={campaignPage >= campaignTotalPages}
                onClick={() => setCampaignPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM & DIAGNOSTICS */}
      {activeTab === "system" && (
        <div className="admin-system-grid">
          {/* SMTP Live Diagnostics */}
          <div className="admin-system-tile">
            <div className="admin-system-tile-title">
              <Mail size={17} /> SMTP Transport Diagnostics
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
              Verify platform SMTP sender configuration (Gmail / Custom SMTP Relay).
            </p>
            <div className="admin-key-value-list" style={{ marginBottom: "18px" }}>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Configured Account</span>
                <span className="admin-kv-val">{systemInfo?.smtp?.user || "Not configured"}</span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">From Name</span>
                <span className="admin-kv-val">{systemInfo?.smtp?.fromName || "MailBridge"}</span>
              </div>
            </div>

            <button
              className="admin-btn admin-btn-primary"
              style={{ width: "100%" }}
              onClick={handleTestSmtp}
              disabled={smtpTesting}
            >
              {smtpTesting ? "Testing Transport..." : "Run Live SMTP Test"}
            </button>

            {smtpResult && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: smtpResult.success ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                  color: smtpResult.success ? "#16a34a" : "#ef4444",
                  border: `1px solid ${smtpResult.success ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                }}
              >
                <strong>{smtpResult.success ? "Passed:" : "Error:"}</strong> {smtpResult.message}
              </div>
            )}
          </div>

          {/* Database & Runtime */}
          <div className="admin-system-tile">
            <div className="admin-system-tile-title">
              <Server size={17} /> Database & Storage
            </div>
            <div className="admin-key-value-list">
              <div className="admin-kv-row">
                <span className="admin-kv-label">Database Type</span>
                <span className="admin-kv-val">{systemInfo?.database?.type || "MongoDB Atlas"}</span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">State</span>
                <span className="badge badge-success">{systemInfo?.database?.state || "Connected"}</span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Host</span>
                <span className="admin-kv-val" style={{ fontSize: "12px" }}>
                  {systemInfo?.database?.host || "cluster0.mongodb.net"}
                </span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Database Name</span>
                <span className="admin-kv-val">{systemInfo?.database?.name || "mailbridge"}</span>
              </div>
            </div>
          </div>

          {/* Machine & Memory */}
          <div className="admin-system-tile">
            <div className="admin-system-tile-title">
              <Cpu size={17} /> Machine & Memory
            </div>
            <div className="admin-key-value-list">
              <div className="admin-kv-row">
                <span className="admin-kv-label">OS Platform</span>
                <span className="admin-kv-val">
                  {systemInfo?.environment?.platform} ({systemInfo?.environment?.arch})
                </span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">System Memory</span>
                <span className="admin-kv-val">
                  {systemInfo?.environment?.freeSystemMemoryGB}GB / {systemInfo?.environment?.totalSystemMemoryGB}GB Free
                </span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Node Process Heap</span>
                <span className="admin-kv-val">{systemInfo?.environment?.processMemoryHeapUsedMB} MB</span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Environment</span>
                <span className="badge badge-info">{systemInfo?.environment?.nodeEnv || "development"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD USER MODAL */}
      {showAddUserModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Create User Account</h3>
              <button className="admin-modal-close" onClick={() => setShowAddUserModal(false)}>
                <X size={20} />
              </button>
            </div>

            {addUserError && (
              <div className="admin-error-box" style={{ marginBottom: "16px" }}>
                <AlertTriangle size={16} />
                <span>{addUserError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="admin-modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ paddingLeft: "14px" }}
                  placeholder="e.g. Sarah Jenkins"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="admin-input"
                  style={{ paddingLeft: "14px" }}
                  placeholder="user@example.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ paddingLeft: "14px" }}
                  placeholder="e.g. Acme Corp"
                  value={newUserForm.companyName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, companyName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  className="admin-input"
                  style={{ paddingLeft: "14px" }}
                  placeholder="Minimum 6 characters"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Assigned Role</label>
                <select
                  className="admin-select"
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                >
                  <option value="client">Client User</option>
                  <option value="admin">Administrator (Superuser)</option>
                </select>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="admin-modal-overlay" onClick={() => setDeleteCandidate(null)}>
          <div className="admin-modal" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={20} /> Delete User
              </h3>
              <button className="admin-modal-close" onClick={() => setDeleteCandidate(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#64748b" }}>
              Are you sure you want to permanently delete user <strong>{deleteCandidate.email}</strong>?
              This will remove all their API keys, delivery logs, and campaigns. This action cannot be undone.
            </p>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-danger" onClick={handleDeleteUser}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LOG INSPECTION MODAL */}
      {selectedLog && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Info size={18} color="#0f766e" /> Email Delivery Inspection
              </h3>
              <button className="admin-modal-close" onClick={() => setSelectedLog(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-key-value-list">
              <div className="admin-kv-row">
                <span className="admin-kv-label">Log ID</span>
                <span className="admin-kv-val" style={{ fontSize: "12px" }}>{selectedLog._id}</span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Recipient</span>
                <span className="admin-kv-val">{selectedLog.to}</span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Subject</span>
                <span className="admin-kv-val">{selectedLog.subject}</span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Status</span>
                <span className={`badge badge-${selectedLog.status === "sent" ? "success" : selectedLog.status === "failed" ? "danger" : "info"}`}>
                  {selectedLog.status}
                </span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Type</span>
                <span className="badge badge-client">{selectedLog.type}</span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Provider Message ID</span>
                <span className="admin-kv-val" style={{ fontSize: "12px" }}>
                  {selectedLog.providerMessageId || "N/A"}
                </span>
              </div>
              <div className="admin-kv-row">
                <span className="admin-kv-label">Timestamp</span>
                <span className="admin-kv-val">
                  {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : "N/A"}
                </span>
              </div>
              {selectedLog.error && (
                <div style={{ marginTop: "10px", padding: "12px", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", borderRadius: "8px", fontSize: "13px" }}>
                  <strong>Error Trace:</strong> {selectedLog.error}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: USER API KEYS MANAGEMENT & CONTROL MODAL */}
      {viewUserKeysModal && (
        <div className="admin-modal-overlay" onClick={() => setViewUserKeysModal(null)}>
          <div className="admin-modal" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Key size={20} color="#ca8a04" /> API Key Control Center: {viewUserKeysModal.name}
              </h3>
              <button className="admin-modal-close" onClick={() => setViewUserKeysModal(null)}>
                <X size={20} />
              </button>
            </div>

            {/* User Meta Information Banner */}
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                background: "rgba(148, 163, 184, 0.08)",
                borderRadius: "10px",
                fontSize: "13px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px"
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{viewUserKeysModal.email}</span>
                <span style={{ color: "#64748b", marginLeft: "8px" }}>
                  • {viewUserKeysModal.role === "admin" || viewUserKeysModal.role === "superadmin" ? "Administrator" : "Client User"}
                </span>
              </div>
              <span
                style={{
                  background: "rgba(202, 138, 4, 0.15)",
                  color: "#ca8a04",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700
                }}
              >
                {userKeysList.length} Total Keys
              </span>
            </div>

            {/* Provision New Key for User Toolbar */}
            <form onSubmit={handleCreateKeyForUser} style={{ marginBottom: "18px", display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="admin-input"
                style={{ padding: "8px 12px", fontSize: "13px", flex: 1 }}
                placeholder="New key name (e.g. Production Mobile Backend)..."
                value={newAdminKeyName}
                onChange={(e) => setNewAdminKeyName(e.target.value)}
              />
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                disabled={creatingKeyForUser}
              >
                <Plus size={14} /> {creatingKeyForUser ? "Generating..." : "Generate Key"}
              </button>
            </form>

            {/* List of Keys with Full Visibility & Admin Controls */}
            {userKeysLoading ? (
              <div style={{ padding: "28px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                Loading user API keys...
              </div>
            ) : userKeysList.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: "14px", border: "1px dashed rgba(148, 163, 184, 0.2)", borderRadius: "10px" }}>
                <Key size={32} style={{ color: "#94a3b8", margin: "0 auto 10px" }} />
                <div>This user currently has no API keys provisioned.</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                  Use the field above to generate their initial key.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
                {userKeysList.map((k, i) => {
                  const isUnmasked = Boolean(showUnmaskedKeys[k._id]);
                  const isCopied = copiedKeyId === k._id;
                  const isActive = k.isActive !== false;

                  return (
                    <div key={k._id || i} className={`admin-key-card ${!isActive ? "disabled" : ""}`}>
                      <div className="admin-key-card-top">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 600, fontSize: "14px", color: "#f8fafc" }}>
                            {k.name || `API Key #${i + 1}`}
                          </span>
                          <span className={`badge badge-${isActive ? "success" : "danger"}`} style={{ fontSize: "10px", padding: "2px 8px" }}>
                            {isActive ? "Active" : "Revoked"}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          Created: {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "Active"}
                          {k.lastUsedAt && ` • Last used: ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                        </div>
                      </div>

                      {/* Monospace Key Display with Unmask & Copy Controls */}
                      <div className="admin-key-display-box">
                        <span className="admin-key-code">
                          {isUnmasked ? k.key : (k.maskedKey || `${k.key?.slice(0, 8)}...${k.key?.slice(-4)}`)}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            style={{ padding: "3px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            onClick={() => toggleShowKey(k._id)}
                            title={isUnmasked ? "Mask API key" : "View unmasked API key"}
                          >
                            {isUnmasked ? <EyeOff size={12} /> : <Eye size={12} />}
                            {isUnmasked ? "Hide" : "Reveal"}
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            style={{ padding: "3px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            onClick={() => handleCopyKey(k._id, k.key)}
                            title="Copy full unmasked API key to clipboard"
                          >
                            {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                            {isCopied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>

                      {/* Administrative Action Controls */}
                      <div className="admin-key-actions-bar">
                        <button
                          type="button"
                          className={`admin-btn ${isActive ? "admin-btn-outline" : "admin-btn-primary"}`}
                          style={{
                            padding: "4px 10px",
                            fontSize: "11px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            borderColor: isActive ? "rgba(239, 68, 68, 0.4)" : undefined,
                            color: isActive ? "#ef4444" : undefined
                          }}
                          onClick={() => handleToggleKey(k._id, isActive)}
                          title={isActive ? "Disable this key immediately to block all incoming requests" : "Re-activate this API key"}
                        >
                          {isActive ? "Deactivate / Revoke" : "Re-activate Key"}
                        </button>

                        <button
                          type="button"
                          className="admin-btn admin-btn-outline"
                          style={{ padding: "4px 10px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                          onClick={() => handleRotateKey(k._id)}
                          title="Generate a new key string and revoke this one"
                        >
                          <RotateCw size={12} /> Rotate Key
                        </button>

                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                          onClick={() => handleDeleteKey(k._id)}
                          title="Permanently delete this key"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setViewUserKeysModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: USER SERVICES INSPECTION MODAL */}
      {viewUserServicesModal && (
        <div className="admin-modal-overlay" onClick={() => setViewUserServicesModal(null)}>
          <div className="admin-modal" style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={20} color="#0f766e" /> Platform Services Consumed by {viewUserServicesModal.name}
              </h3>
              <button className="admin-modal-close" onClick={() => setViewUserServicesModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                marginBottom: "16px",
                padding: "14px 18px",
                background: "rgba(148, 163, 184, 0.08)",
                borderRadius: "10px",
                fontSize: "13px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)" }}>
                  {viewUserServicesModal.name}
                </div>
                <div style={{ color: "#64748b", marginTop: "2px" }}>
                  {viewUserServicesModal.email} • {viewUserServicesModal.companyName || "Personal Workspace"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className={`badge badge-${viewUserServicesModal.role === "admin" ? "admin" : "client"}`}>
                  {viewUserServicesModal.role === "admin" ? "Administrator" : "Regular Client"}
                </span>
                <span
                  style={{
                    background: "rgba(15, 118, 110, 0.15)",
                    color: "#0f766e",
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 700
                  }}
                >
                  {viewUserServicesModal.services?.activeCount ?? 0} of 6 Services Active
                </span>
              </div>
            </div>

            <div className="admin-services-grid">
              {/* Service 1: Email API Relay */}
              <div className={`admin-service-card ${(viewUserServicesModal.services?.emails?.total || 0) > 0 ? "is-active" : ""}`}>
                <div className="admin-service-card-header">
                  <div className="admin-service-title">
                    <Mail size={16} color="#0f766e" /> Transactional Email Relay
                  </div>
                  <span className={`badge badge-${(viewUserServicesModal.services?.emails?.total || 0) > 0 ? "success" : "client"}`}>
                    {(viewUserServicesModal.services?.emails?.total || 0) > 0 ? "Active" : "Idle"}
                  </span>
                </div>
                <div className="admin-service-metric">
                  <span>Total Dispatches:</span>
                  <strong>{viewUserServicesModal.services?.emails?.total ?? viewUserServicesModal.emailCount ?? 0}</strong>
                </div>
                <div className="admin-service-metric">
                  <span>Delivered / Sent:</span>
                  <strong style={{ color: "#16a34a" }}>{viewUserServicesModal.services?.emails?.sent ?? 0}</strong>
                </div>
                <div className="admin-service-metric">
                  <span>Simulated:</span>
                  <strong style={{ color: "#3b82f6" }}>{viewUserServicesModal.services?.emails?.simulated ?? 0}</strong>
                </div>
                <div className="admin-service-metric">
                  <span>Failed:</span>
                  <strong style={{ color: "#ef4444" }}>{viewUserServicesModal.services?.emails?.failed ?? 0}</strong>
                </div>
              </div>

              {/* Service 2: API Keys & Dev Access */}
              <div className={`admin-service-card ${(viewUserServicesModal.apiKeyCount || 0) > 0 ? "is-active" : ""}`}>
                <div className="admin-service-card-header">
                  <div className="admin-service-title">
                    <Key size={16} color="#ca8a04" /> API Keys Provisioning
                  </div>
                  <span className={`badge badge-${(viewUserServicesModal.apiKeyCount || 0) > 0 ? "success" : "client"}`}>
                    {(viewUserServicesModal.apiKeyCount || 0) > 0 ? "Active" : "None"}
                  </span>
                </div>
                <div className="admin-service-metric">
                  <span>Active Keys Generated:</span>
                  <strong style={{ color: "#ca8a04" }}>{viewUserServicesModal.apiKeyCount ?? 0}</strong>
                </div>
                <div className="admin-service-metric">
                  <span>Primary API Key:</span>
                  <span style={{ fontFamily: "monospace", fontSize: "11px" }}>{viewUserServicesModal.apiKey || "None"}</span>
                </div>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  style={{ width: "100%", marginTop: "8px", fontSize: "11px", padding: "5px" }}
                  onClick={() => {
                    const target = viewUserServicesModal;
                    setViewUserServicesModal(null);
                    setViewUserKeysModal(target);
                  }}
                >
                  Inspect API Keys ({viewUserServicesModal.apiKeyCount ?? 0})
                </button>
              </div>

              {/* Service 3: Cold Outreach Campaigns */}
              <div className={`admin-service-card ${(viewUserServicesModal.services?.campaigns?.count || 0) > 0 ? "is-active" : ""}`}>
                <div className="admin-service-card-header">
                  <div className="admin-service-title">
                    <Send size={16} color="#3b82f6" /> Bulk Outreach Campaigns
                  </div>
                  <span className={`badge badge-${(viewUserServicesModal.services?.campaigns?.count || 0) > 0 ? "success" : "client"}`}>
                    {(viewUserServicesModal.services?.campaigns?.count || 0) > 0 ? "Active" : "Idle"}
                  </span>
                </div>
                <div className="admin-service-metric">
                  <span>Total Campaigns:</span>
                  <strong>{viewUserServicesModal.services?.campaigns?.count ?? viewUserServicesModal.campaignCount ?? 0}</strong>
                </div>
                <div className="admin-service-metric">
                  <span>Outreach Engine:</span>
                  <span>CSV/Excel Multi-Lead Dispatches</span>
                </div>
              </div>

              {/* Service 4: Custom SMTP Relay */}
              <div className={`admin-service-card ${viewUserServicesModal.services?.smtp?.enabled ? "is-active" : ""}`}>
                <div className="admin-service-card-header">
                  <div className="admin-service-title">
                    <Server size={16} color="#8b5cf6" /> Custom SMTP Relay
                  </div>
                  <span className={`badge badge-${viewUserServicesModal.services?.smtp?.enabled ? "success" : "client"}`}>
                    {viewUserServicesModal.services?.smtp?.enabled ? "Custom Host" : "Default"}
                  </span>
                </div>
                <div className="admin-service-metric">
                  <span>Host:</span>
                  <span style={{ fontSize: "11px" }}>{viewUserServicesModal.services?.smtp?.host || "System Default (Gmail Relay)"}</span>
                </div>
                <div className="admin-service-metric">
                  <span>Port:</span>
                  <span>{viewUserServicesModal.services?.smtp?.port || 587}</span>
                </div>
                <div className="admin-service-metric">
                  <span>Sender Email:</span>
                  <span style={{ fontSize: "11px" }}>{viewUserServicesModal.services?.smtp?.fromEmail || viewUserServicesModal.email}</span>
                </div>
              </div>

              {/* Service 5: SMS OTP Gateway */}
              <div className={`admin-service-card ${viewUserServicesModal.services?.sms?.enabled ? "is-active" : ""}`}>
                <div className="admin-service-card-header">
                  <div className="admin-service-title">
                    <Smartphone size={16} color="#10b981" /> SMS OTP Gateway
                  </div>
                  <span className={`badge badge-${viewUserServicesModal.services?.sms?.enabled ? "success" : "client"}`}>
                    {viewUserServicesModal.services?.sms?.enabled ? "Configured" : "Off"}
                  </span>
                </div>
                <div className="admin-service-metric">
                  <span>Phone Number:</span>
                  <span style={{ fontSize: "11px" }}>{viewUserServicesModal.services?.sms?.phoneNumber || "Not configured"}</span>
                </div>
                <div className="admin-service-metric">
                  <span>Operating Mode:</span>
                  <span>{viewUserServicesModal.services?.sms?.mode || "Simulation Mode"}</span>
                </div>
              </div>

              {/* Service 6: Webhooks & Event Streams */}
              <div className={`admin-service-card ${(viewUserServicesModal.services?.webhooks?.count || 0) > 0 ? "is-active" : ""}`}>
                <div className="admin-service-card-header">
                  <div className="admin-service-title">
                    <Webhook size={16} color="#ec4899" /> Webhooks & Event Streams
                  </div>
                  <span className={`badge badge-${(viewUserServicesModal.services?.webhooks?.count || 0) > 0 ? "success" : "client"}`}>
                    {(viewUserServicesModal.services?.webhooks?.count || 0) > 0 ? "Active" : "Idle"}
                  </span>
                </div>
                <div className="admin-service-metric">
                  <span>Configured Endpoints:</span>
                  <strong>{viewUserServicesModal.services?.webhooks?.count ?? 0}</strong>
                </div>
                <div className="admin-service-metric">
                  <span>Event Signatures:</span>
                  <span>HMAC-SHA256 Protected</span>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setViewUserServicesModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
