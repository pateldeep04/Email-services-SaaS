import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom";
import { Send, CheckCircle, AlertCircle, Mail, Copy, Plus, Trash2 } from "lucide-react";
import "../styles/Tester.css";

export function TesterPage() {
  const { apiKey, user } = useAuth();
  const location = useLocation();
  const [hasInitializedState, setHasInitializedState] = useState(false);

  const endpoints = useMemo(() => [
    {
      id: "otp",
      title: "OTP",
      method: "POST",
      path: "/api/v1/emails/otp",
      body: { to: user?.email || "test@example.com", purpose: "login" }
    },
    {
      id: "welcome",
      title: "Welcome Email",
      method: "POST",
      path: "/api/v1/emails/welcome",
      body: { to: user?.email || "test@example.com", name: user?.name || "John", company: "Your Company" }
    },
    {
      id: "forgot-password",
      title: "Forgot Password",
      method: "POST",
      path: "/api/v1/emails/forgot-password",
      body: { to: user?.email || "test@example.com", resetUrl: "https://app.example.com/reset" }
    },
    {
      id: "notification",
      title: "Notification",
      method: "POST",
      path: "/api/v1/emails/notification",
      body: { to: user?.email || "test@example.com", title: "Order received", message: "Order #123 has been placed" }
    },
    {
      id: "custom",
      title: "Custom Email",
      method: "POST",
      path: "/api/v1/emails/custom",
      body: { to: user?.email || "test@example.com", subject: "Hello", message: "Custom message" }
    }
  ], [user?.email, user?.name]);

  const [selected, setSelected] = useState(endpoints[0]);
  const [payload, setPayload] = useState(JSON.stringify(endpoints[0].body, null, 2));
  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [responseCopied, setResponseCopied] = useState(false);

  // Template State & Persistence
  const [savedTemplates, setSavedTemplates] = useState(() => {
    const stored = localStorage.getItem("mailbridge_tester_templates");
    return stored ? JSON.parse(stored) : [];
  });
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    localStorage.setItem("mailbridge_tester_templates", JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  // Initialize state from location.state if redirected from dashboard
  useEffect(() => {
    if (location.state?.initialTemplate && !hasInitializedState) {
      const ep = endpoints.find(e => e.id === location.state.initialTemplate);
      if (ep) {
        setSelected(ep);
        setPayload(JSON.stringify(location.state.initialPayload || ep.body, null, 2));
        setHasInitializedState(true);
      }
    }
  }, [location.state, endpoints, hasInitializedState]);

  // Update payload when selected endpoint changes
  useEffect(() => {
    if (location.state?.initialTemplate && !hasInitializedState) {
      return;
    }
    const defaultEndpoint = endpoints.find(ep => ep.id === selected.id) || endpoints[0];
    setSelected(defaultEndpoint);
    setPayload(JSON.stringify(defaultEndpoint.body, null, 2));
  }, [endpoints, selected.id, hasInitializedState, location.state]);

  const curl = useMemo(
    () => `curl -X ${selected.method} http://localhost:5000${selected.path} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || "your-api-key"}" \\
  -d '${payload.replace(/\n/g, "").replace(/'/g, "\\'")}'`,
    [apiKey, payload, selected]
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function selectEndpoint(endpoint) {
    setSelected(endpoint);
    setPayload(JSON.stringify(endpoint.body, null, 2));
    setResponse("");
    setResponseStatus(null);
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert("Please enter a name for the template.");
      return;
    }
    try {
      JSON.parse(payload);
    } catch (e) {
      alert("Invalid JSON payload. Please correct the syntax before saving.");
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      endpointId: selected.id,
      payload: payload,
      createdAt: new Date().toISOString()
    };

    setSavedTemplates([newTemplate, ...savedTemplates]);
    setTemplateName("");
    setShowSaveForm(false);
  };

  const handleDeleteTemplate = (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    setSavedTemplates(savedTemplates.filter((t) => t.id !== id));
  };

  const handleSelectTemplate = (tmpl) => {
    const ep = endpoints.find((e) => e.id === tmpl.endpointId);
    if (ep) {
      setSelected(ep);
      setPayload(tmpl.payload);
      setResponse("");
      setResponseStatus(null);
    }
  };

  async function runRequest() {
    setLoading(true);
    setResponse("");
    setResponseStatus(null);
    try {
      const parsed = JSON.parse(payload);
      const res = await fetch(`http://localhost:5000${selected.path}`, {
        method: selected.method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      setResponseStatus({ code: res.status, text: res.statusText || (res.ok ? "OK" : "Error") });
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponseStatus({ code: 500, text: "Error" });
      setResponse(JSON.stringify({ error: error.message }, null, 2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tester-page">
      <div className="tester-header">
        <h1>API Tester</h1>
        <p>Test email endpoints and see live responses</p>
      </div>

      {!user ? (
        <div className="tester-auth-state">
          <div className="auth-state-icon">
            <Mail size={28} />
          </div>
          <h2>Sign in to use the API tester</h2>
          <p>
            The tester needs your MailBridge API key, which is created after you
            register or log in.
          </p>
          <div className="auth-state-actions">
            <Link to="/register" className="btn btn-primary">
              Create account
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>
      ) : (
      <div className="tester-container">
        <div className="tester-sidebar">
          <h3>Endpoints</h3>
          <div className="endpoints-list">
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                className={`endpoint-btn ${selected.id === ep.id ? "active" : ""}`}
                onClick={() => selectEndpoint(ep)}
              >
                <span className="method">{ep.method}</span>
                <span className="title">{ep.title}</span>
              </button>
            ))}
          </div>

          <div className="tester-sidebar-section" style={{ marginTop: "32px" }}>
            <h3>My Templates</h3>
            <div className="templates-list">
              {savedTemplates.length === 0 ? (
                <div className="empty-templates-text">
                  No saved templates yet. Edit the body and click "Save Template" to store one.
                </div>
              ) : (
                savedTemplates.map((tmpl) => (
                  <div key={tmpl.id} className="template-item-row">
                    <button
                      className="template-select-btn"
                      onClick={() => handleSelectTemplate(tmpl)}
                    >
                      <span className="template-badge">{tmpl.endpointId}</span>
                      <span className="template-name" title={tmpl.name}>{tmpl.name}</span>
                    </button>
                    <button
                      className="template-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(tmpl.id);
                      }}
                      title="Delete Template"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="tester-main">
          {/* Sender Info Card */}
          <div className="sender-info-card">
            <div className="info-item">
              <label>From (Sender)</label>
              <div className="sender-email">
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
            </div>
            <div className="info-item">
              <label>Sending From Account</label>
              <div className="account-name">{user?.name}</div>
            </div>
          </div>

          <div className="tester-section">
            <div className="section-header">
              <h3>Request</h3>
              <div className="endpoint-info">
                <span className="method">{selected.method}</span>
                <code>{selected.path}</code>
              </div>
            </div>

            <div className="form-section">
              <label>Headers</label>
              <div className="headers-display">
                <div>Content-Type: application/json</div>
                <div className="api-key-header">
                  x-api-key: <code>{apiKey || "your-api-key"}</code>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                <label style={{ margin: 0 }}>Request Body</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  style={{ padding: "4px 8px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <Plus size={14} /> Save Template
                </button>
              </div>

              {showSaveForm && (
                <div className="save-template-inline">
                  <input
                    type="text"
                    placeholder="Template Name (e.g. Welcome Test)"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="template-name-input"
                  />
                  <button onClick={handleSaveTemplate} className="btn btn-primary btn-sm">
                    Save
                  </button>
                  <button onClick={() => setShowSaveForm(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                </div>
              )}

              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="code-input"
              />

              <label style={{ marginTop: "20px" }}>cURL Command</label>
              <div className="code-block-container">
                <div className="code-block-header">
                  <span>Shell Command</span>
                  <button className="code-block-copy-btn" onClick={copyToClipboard} title="Copy cURL">
                    <Copy size={12} />
                    {copied ? "Copied!" : "Copy cURL"}
                  </button>
                </div>
                <div className="code-block-body overflow-x">
                  <pre>{curl}</pre>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={runRequest}
                disabled={loading}
                style={{ marginTop: "20px", width: "100%" }}
              >
                <Send size={18} /> {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>

          <div className="tester-section">
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Response</h3>
              {responseStatus && (
                <span className={`status-badge ${responseStatus.code >= 200 && responseStatus.code < 300 ? "success" : "error"}`}>
                  {responseStatus.code} {responseStatus.text}
                </span>
              )}
            </div>
            
            <div className="response-container">
              {!response ? (
                <div className="empty-state">
                  <AlertCircle size={32} />
                  <p>Send a request to see the response here</p>
                </div>
              ) : (
                <div className="code-block-container" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div className="code-block-header">
                    <span>JSON Response</span>
                    <button 
                      className="code-block-copy-btn" 
                      onClick={() => {
                        navigator.clipboard.writeText(response);
                        setResponseCopied(true);
                        setTimeout(() => setResponseCopied(false), 2000);
                      }}
                      title="Copy Response"
                    >
                      <Copy size={12} />
                      {responseCopied ? "Copied!" : "Copy Response"}
                    </button>
                  </div>
                  <div className="code-block-body" style={{ flex: 1, overflow: "auto" }}>
                    <pre>{response}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
