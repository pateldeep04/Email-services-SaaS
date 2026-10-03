import React, { useState, useEffect, useCallback } from "react";
import {
  Webhook,
  Plus,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Code2,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { API_URL } from "../config.js";
import "../styles/WebhookManager.css";

const EVENT_DEFINITIONS = [
  { id: "email.sent", label: "email.sent", desc: "Triggered whenever any transactional or campaign email is delivered" },
  { id: "email.opened", label: "email.opened", desc: "Real-time trigger when a recipient opens an email (tracking pixel)" },
  { id: "email.clicked", label: "email.clicked", desc: "Real-time trigger when a recipient clicks a tracked CTA or link" },
  { id: "email.failed", label: "email.failed", desc: "Triggered when an email delivery attempt fails or bounces" },
  { id: "sms.sent", label: "sms.sent", desc: "Triggered when an SMS OTP or notification is dispatched" }
];

export function WebhookManager({ token }) {
  const [activeSubTab, setActiveSubTab] = useState("endpoints"); // "endpoints" | "logs" | "docs"
  const [endpoints, setEndpoints] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [formUrl, setFormUrl] = useState("");
  const [formDesc, setFormDesc] = useState("Production Webhook");
  const [formEvents, setFormEvents] = useState(["email.sent", "email.opened", "email.clicked", "email.failed", "sms.sent"]);
  const [savingEndpoint, setSavingEndpoint] = useState(false);

  // Secret visibility & copy state
  const [revealedSecrets, setRevealedSecrets] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Test Ping states
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({}); // { [endpointId]: { success, statusCode, durationMs, error } }

  // Log Detail modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Verification Code snippet tab
  const [codeLang, setCodeLang] = useState("node"); // "node" | "python"

  const fetchEndpoints = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/webhooks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEndpoints(data.endpoints || []);
      } else {
        setError(data.error || "Failed to load webhooks.");
      }
    } catch (err) {
      setError(err.message || "Network error loading webhooks.");
    }
  }, [token]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/webhooks/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load webhook logs:", err);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEndpoints(), fetchLogs()]).finally(() => setLoading(false));
  }, [fetchEndpoints, fetchLogs]);

  const handleOpenCreateModal = () => {
    setEditingEndpoint(null);
    setFormUrl("");
    setFormDesc("Production Webhook");
    setFormEvents(["email.sent", "email.opened", "email.clicked", "email.failed", "sms.sent"]);
    setShowModal(true);
  };

  const handleOpenEditModal = (ep) => {
    setEditingEndpoint(ep);
    setFormUrl(ep.url);
    setFormDesc(ep.description || "");
    setFormEvents(ep.events || []);
    setShowModal(true);
  };

  const handleSaveEndpoint = async (e) => {
    e.preventDefault();
    if (!formUrl.trim()) return;

    setSavingEndpoint(true);
    setError("");

    try {
      const method = editingEndpoint ? "PUT" : "POST";
      const url = editingEndpoint
        ? `${API_URL}/api/v1/webhooks/${editingEndpoint._id}`
        : `${API_URL}/api/v1/webhooks`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          url: formUrl.trim(),
          description: formDesc.trim(),
          events: formEvents
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchEndpoints();
      } else {
        setError(data.error || "Failed to save webhook endpoint.");
      }
    } catch (err) {
      setError(err.message || "Network error saving webhook.");
    } finally {
      setSavingEndpoint(false);
    }
  };

  const handleToggleActive = async (ep) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/webhooks/${ep._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !ep.isActive })
      });
      if (res.ok) {
        fetchEndpoints();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteEndpoint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this webhook endpoint?")) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/webhooks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEndpoints();
      }
    } catch (err) {
      console.error("Failed to delete webhook:", err);
    }
  };

  const handleRotateSecret = async (id) => {
    if (!window.confirm("Rotating the signing secret will invalidate the current secret immediately. Continue?")) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/webhooks/${id}/rotate-secret`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        fetchEndpoints();
        setRevealedSecrets(prev => ({ ...prev, [id]: true }));
      } else {
        alert(data.error || "Failed to rotate secret");
      }
    } catch (err) {
      alert(err.message || "Failed to rotate secret");
    }
  };

  const handleTestPing = async (id) => {
    setTestingId(id);
    setTestResults(prev => ({ ...prev, [id]: null }));

    try {
      const res = await fetch(`${API_URL}/api/v1/webhooks/${id}/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setTestResults(prev => ({ ...prev, [id]: data.result }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [id]: { success: false, statusCode: 0, error: data.error || "Delivery failed" }
        }));
      }
      fetchLogs(); // refresh logs
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [id]: { success: false, statusCode: 0, error: err.message || "Network test ping failed" }
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Clear all webhook delivery history?")) return;
    try {
      await fetch(`${API_URL}/api/v1/webhooks/logs`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleEventSelection = (eventId) => {
    setFormEvents(prev =>
      prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]
    );
  };

  // Metrics calculations
  const totalDeliveries = logs.length;
  const successfulDeliveries = logs.filter(l => l.status === "success").length;
  const successRate = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 100;
  const activeCount = endpoints.filter(e => e.isActive).length;

  return (
    <div className="webhook-manager-container">
      {/* Header Banner */}
      <div className="webhook-header-card">
        <div className="webhook-header-info">
          <h2>
            <Webhook size={24} style={{ color: "var(--primary-color, #0f766e)" }} />
            Webhooks & Event Streams
          </h2>
          <p>
            Receive real-time HTTP POST notifications on your server when emails are delivered, opened, clicked, or when SMS OTPs are dispatched. Signed securely with HMAC SHA-256.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenCreateModal}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={16} /> Register Endpoint
        </button>
      </div>

      {/* Metrics Ribbon */}
      <div className="webhook-metrics-grid">
        <div className="webhook-metric-card">
          <div className="webhook-metric-icon">
            <Webhook size={20} />
          </div>
          <div className="webhook-metric-info">
            <label>Endpoints</label>
            <h3>{endpoints.length} <span style={{ fontSize: "13px", fontWeight: "normal", color: "#10b981" }}>({activeCount} active)</span></h3>
          </div>
        </div>

        <div className="webhook-metric-card">
          <div className="webhook-metric-icon purple">
            <Send size={20} />
          </div>
          <div className="webhook-metric-info">
            <label>Total Events Dispatched</label>
            <h3>{totalDeliveries}</h3>
          </div>
        </div>

        <div className="webhook-metric-card">
          <div className="webhook-metric-icon success">
            <ShieldCheck size={20} />
          </div>
          <div className="webhook-metric-info">
            <label>Delivery Success Rate</label>
            <h3>{successRate}%</h3>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="webhook-subnav">
        <button
          className={`webhook-subnav-btn ${activeSubTab === "endpoints" ? "active" : ""}`}
          onClick={() => setActiveSubTab("endpoints")}
        >
          <Webhook size={16} /> Configured Endpoints ({endpoints.length})
        </button>
        <button
          className={`webhook-subnav-btn ${activeSubTab === "logs" ? "active" : ""}`}
          onClick={() => {
            setActiveSubTab("logs");
            fetchLogs();
          }}
        >
          <Clock size={16} /> Delivery History ({logs.length})
        </button>
        <button
          className={`webhook-subnav-btn ${activeSubTab === "docs" ? "active" : ""}`}
          onClick={() => setActiveSubTab("docs")}
        >
          <Code2 size={16} /> Signature Verification Guide
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tab 1: Endpoints List */}
      {activeSubTab === "endpoints" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <RefreshCw className="loading-spinner" size={24} style={{ margin: "0 auto 12px" }} />
              <p>Loading webhook configurations...</p>
            </div>
          ) : endpoints.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <Webhook size={40} style={{ color: "#94a3b8", margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", margin: "0 0 8px" }}>No Webhooks Configured Yet</h3>
              <p style={{ color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto 20px", fontSize: "14px" }}>
                Add your server's endpoint URL to start receiving real-time event updates whenever emails are delivered, opened, or clicked.
              </p>
              <button type="button" className="btn btn-primary" onClick={handleOpenCreateModal}>
                <Plus size={16} /> Register First Webhook
              </button>
            </div>
          ) : (
            endpoints.map((ep) => {
              const isRevealed = revealedSecrets[ep._id];
              const testResult = testResults[ep._id];
              const isTesting = testingId === ep._id;

              return (
                <div key={ep._id} className="webhook-endpoint-card">
                  <div className="webhook-endpoint-top">
                    <div className="webhook-endpoint-title-group">
                      <h4>
                        {ep.description || "Production Webhook"}
                        <span
                          className={`badge ${ep.isActive ? "badge-sent" : "badge-failed"}`}
                          style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}
                        >
                          {ep.isActive ? "Active" : "Disabled"}
                        </span>
                      </h4>
                      <code className="webhook-endpoint-url">{ep.url}</code>
                    </div>

                    <div className="webhook-endpoint-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        disabled={isTesting}
                        onClick={() => handleTestPing(ep._id)}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <Send size={13} /> {isTesting ? "Pinging..." : "Test Ping"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleToggleActive(ep)}
                      >
                        {ep.isActive ? "Disable" : "Enable"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleOpenEditModal(ep)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteEndpoint(ep._id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Secret widget */}
                  <div className="webhook-secret-box">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span className="webhook-secret-label">Signing Secret:</span>
                      <code className="webhook-secret-value">
                        {isRevealed ? ep.secret : `${ep.secret.substring(0, 10)}••••••••••••••••••••`}
                      </code>
                    </div>

                    <div className="webhook-secret-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => setRevealedSecrets(prev => ({ ...prev, [ep._id]: !isRevealed }))}
                        title={isRevealed ? "Hide Secret" : "Reveal Secret"}
                      >
                        {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => copyToClipboard(ep.secret, ep._id)}
                        title="Copy Secret"
                      >
                        {copiedId === ep._id ? <Check size={13} style={{ color: "#10b981" }} /> : <Copy size={13} />}
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleRotateSecret(ep._id)}
                        title="Rotate Secret"
                        style={{ display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <RotateCcw size={12} /> Rotate
                      </button>
                    </div>
                  </div>

                  {/* Subscribed Events */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Subscribed to:</span>
                    <div className="webhook-events-list">
                      {ep.events?.map(ev => {
                        let extraClass = "";
                        if (ev === "email.opened") extraClass = "opened";
                        if (ev === "email.clicked") extraClass = "clicked";
                        if (ev === "email.failed") extraClass = "failed";
                        return (
                          <span key={ev} className={`webhook-event-chip ${extraClass}`}>
                            {ev}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Test Ping Live Result Banner */}
                  {testResult && (
                    <div className={`webhook-test-result ${testResult.status === "success" ? "success" : "failed"}`}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {testResult.status === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>
                          <strong>{testResult.status === "success" ? "Delivery Succeeded" : "Delivery Attempt Failed"}</strong>:
                          {" "}HTTP Status <code>{testResult.statusCode || "No Response"}</code> in <strong>{testResult.durationMs}ms</strong>
                          {testResult.error && ` — ${testResult.error}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTestResults(prev => ({ ...prev, [ep._id]: null }))}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Delivery History Logs */}
      {activeSubTab === "logs" && (
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "16px", margin: "0 0 4px 0" }}>Recent Webhook Dispatches</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                Audit trail of outgoing HTTP requests sent to your configured endpoints.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="btn btn-sm btn-secondary" onClick={fetchLogs}>
                <RefreshCw size={13} /> Refresh
              </button>
              {logs.length > 0 && (
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleClearLogs}>
                  <Trash2 size={13} /> Clear History
                </button>
              )}
            </div>
          </div>

          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <Clock size={32} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: "14px" }}>No delivery attempts logged yet.</p>
              <p style={{ fontSize: "12px", marginTop: "4px" }}>Send an email or click "Test Ping" on an endpoint to trigger one!</p>
            </div>
          ) : (
            <div className="webhook-logs-table-wrapper">
              <table className="webhook-logs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Event</th>
                    <th>Destination URL</th>
                    <th>HTTP Status</th>
                    <th>Latency</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    let statusClass = "badge-status sfail";
                    if (log.statusCode >= 200 && log.statusCode < 300) statusClass = "badge-status s2xx";
                    else if (log.statusCode >= 400 && log.statusCode < 500) statusClass = "badge-status s4xx";
                    else if (log.statusCode >= 500) statusClass = "badge-status s5xx";

                    return (
                      <tr key={log._id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                        <td>
                          <span className="webhook-event-chip" style={{ fontSize: "11px" }}>
                            {log.event}
                          </span>
                        </td>
                        <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <code>{log.url}</code>
                        </td>
                        <td>
                          <span className={statusClass}>
                            {log.statusCode ? `${log.statusCode}` : log.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {log.durationMs}ms
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedLog(log)}
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Integration & Verification Guide */}
      {activeSubTab === "docs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "18px", margin: "0 0 8px 0" }}>Verifying Webhook Signatures</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              To ensure requests are genuine and prevent replay attacks, MailBridge signs every webhook request with an <strong>HMAC SHA-256</strong> signature passed in the <code>X-MailBridge-Signature</code> header.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
                <strong>Header Format:</strong> <code>X-MailBridge-Signature: t=1728000000,v1=9f8a...</code>
              </div>
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
                <strong>Signature Payload:</strong> <code>timestamp + "." + rawRequestBody</code>
              </div>
            </div>

            <div className="webhook-code-card">
              <div className="webhook-code-header">
                <div className="webhook-code-tabs">
                  <button
                    className={`webhook-code-tab-btn ${codeLang === "node" ? "active" : ""}`}
                    onClick={() => setCodeLang("node")}
                  >
                    Node.js (Express)
                  </button>
                  <button
                    className={`webhook-code-tab-btn ${codeLang === "python" ? "active" : ""}`}
                    onClick={() => setCodeLang("python")}
                  >
                    Python (Flask)
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    const snippet = codeLang === "node" ? NODE_SNIPPET : PYTHON_SNIPPET;
                    copyToClipboard(snippet, "code");
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {copiedId === "code" ? <Check size={12} style={{ color: "#10b981" }} /> : <Copy size={12} />}
                  <span>{copiedId === "code" ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <pre className="webhook-code-block">
                {codeLang === "node" ? NODE_SNIPPET : PYTHON_SNIPPET}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Webhook Endpoint */}
      {showModal && (
        <div className="webhook-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="webhook-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="webhook-modal-header">
              <h3>{editingEndpoint ? "Edit Webhook Endpoint" : "Register Webhook Endpoint"}</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEndpoint}>
              <div className="webhook-modal-body">
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px", display: "block" }}>
                    Destination URL <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://api.yourdomain.com/webhooks/mailbridge"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px" }}
                  />
                  <small style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    Must be an accessible HTTP/HTTPS endpoint on your server or tunnel (e.g. ngrok / cloudflared).
                  </small>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px", display: "block" }}>
                    Endpoint Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Production CRM & Lead Sync"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px" }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px", display: "block" }}>
                    Subscribed Events
                  </label>
                  <div className="webhook-events-selector">
                    {EVENT_DEFINITIONS.map((ev) => (
                      <label key={ev.id} className="webhook-event-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formEvents.includes(ev.id)}
                          onChange={() => toggleEventSelection(ev.id)}
                        />
                        <div>
                          <strong>{ev.label}</strong>
                          <span style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {ev.desc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="webhook-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={savingEndpoint}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingEndpoint || !formUrl.trim()}
                >
                  {savingEndpoint ? "Saving..." : editingEndpoint ? "Update Endpoint" : "Create Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspect Log Payload */}
      {selectedLog && (
        <div className="webhook-modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="webhook-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="webhook-modal-header">
              <h3>Delivery Details • {selectedLog.event}</h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="webhook-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <label style={{ color: "var(--text-muted)", fontWeight: 600 }}>Destination URL</label>
                  <p style={{ margin: "2px 0 0", wordBreak: "break-all" }}><code>{selectedLog.url}</code></p>
                </div>
                <div>
                  <label style={{ color: "var(--text-muted)", fontWeight: 600 }}>HTTP Response</label>
                  <p style={{ margin: "2px 0 0" }}>
                    <strong>{selectedLog.statusCode || "No response"}</strong> ({selectedLog.durationMs}ms)
                  </p>
                </div>
              </div>

              {selectedLog.error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "8px", color: "#b91c1c", fontSize: "13px" }}>
                  <strong>Error:</strong> {selectedLog.error}
                </div>
              )}

              {/* JSON Payload */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Event Payload Dispatched</label>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedLog.payload, null, 2));
                      setCopiedPayload(true);
                      setTimeout(() => setCopiedPayload(false), 2000);
                    }}
                    style={{ padding: "2px 8px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {copiedPayload ? <Check size={11} style={{ color: "#10b981" }} /> : <Copy size={11} />}
                    {copiedPayload ? "Copied" : "Copy Payload"}
                  </button>
                </div>
                <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "14px", borderRadius: "8px", fontSize: "12px", overflowX: "auto", margin: 0, fontFamily: "monospace" }}>
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              {/* Response Body if available */}
              {selectedLog.responseBody && (
                <div>
                  <label style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px", display: "block" }}>
                    Server Response Body
                  </label>
                  <pre style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "8px", fontSize: "12px", overflowX: "auto", margin: 0, color: "#334155" }}>
                    {selectedLog.responseBody}
                  </pre>
                </div>
              )}
            </div>

            <div className="webhook-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const NODE_SNIPPET = `// Express.js Webhook Receiver with HMAC Signature Verification
import express from "express";
import crypto from "crypto";

const app = express();
// Make sure to capture raw body buffer for verification
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString("utf8");
  }
}));

const WEBHOOK_SECRET = "whsec_your_signing_secret_here";

function verifyMailBridgeSignature(signatureHeader, rawBody, secret) {
  if (!signatureHeader) return false;
  
  // Format: t=1728000000,v1=9f8a...
  const parts = Object.fromEntries(
    signatureHeader.split(",").map(p => p.split("="))
  );
  
  const timestamp = parts.t;
  const expectedSig = parts.v1;
  if (!timestamp || !expectedSig) return false;

  const payload = \`\${timestamp}.\${rawBody}\`;
  const computedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(computedSig));
}

app.post("/api/webhooks/mailbridge", (req, res) => {
  const signature = req.headers["x-mailbridge-signature"];
  
  if (!verifyMailBridgeSignature(signature, req.rawBody, WEBHOOK_SECRET)) {
    return res.status(401).send("Invalid signature");
  }

  const { event, data } = req.body;
  console.log(\`Received MailBridge event: \${event}\`, data);

  switch (event) {
    case "email.opened":
      console.log(\`Lead \${data.recipientEmail} opened campaign: \${data.campaignName}\`);
      break;
    case "email.clicked":
      console.log(\`Lead clicked link: \${data.targetUrl}\`);
      break;
  }

  res.status(200).send("OK");
});

app.listen(3000, () => console.log("Webhook receiver listening on port 3000"));`;

const PYTHON_SNIPPET = `# Flask Webhook Receiver with HMAC Signature Verification
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)
WEBHOOK_SECRET = "whsec_your_signing_secret_here"

def verify_signature(signature_header, raw_body, secret):
    if not signature_header:
        return False
    
    parts = dict(item.split("=") for item in signature_header.split(","))
    timestamp = parts.get("t")
    expected_sig = parts.get("v1")
    if not timestamp or not expected_sig:
        return False

    payload = f"{timestamp}.{raw_body.decode('utf-8')}".encode('utf-8')
    computed_sig = hmac.new(secret.encode('utf-8'), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_sig, computed_sig)

@app.route("/api/webhooks/mailbridge", methods=["POST"])
def mailbridge_webhook():
    signature = request.headers.get("X-MailBridge-Signature")
    raw_body = request.get_data()

    if not verify_signature(signature, raw_body, WEBHOOK_SECRET):
        return "Unauthorized", 401

    payload = request.json
    event = payload.get("event")
    data = payload.get("data")
    print(f"Received MailBridge Event: {event}", data)

    return jsonify({"received": True}), 200

if __name__ == "__main__":
    app.run(port=3000)`;
