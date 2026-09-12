import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { 
  UploadCloud, 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Mail, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Flame,
  Target,
  Lock,
  X,
  LogIn,
  Copy
} from "lucide-react";
import { API_URL } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSEO } from "../hooks/useSEO.js";
import "../styles/BulkMailer.css";

export function BulkMailerPage() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("composer"); // "composer" | "tracking"

  useSEO({
    title: "Bulk Mailer & Cold Email Lead Generation SaaS | Free Gmail Relay | MailBridge",
    description: "Send personalized bulk emails via CSV or Excel with free Gmail SMTP relay. Track real-time email opens, qualify hot sales leads, and manage outreach campaigns with zero vendor fees.",
    keywords: "bulk mailer saas, free bulk email sender, csv email sender, excel mail merge, gmail smtp bulk email, cold outreach tool, email campaign tracker, lead qualification pipeline, personalized bulk email, mailbridge",
    canonical: "https://mail-bridge.email/bulk-mail",
    ogTitle: "Bulk Mailer & Cold Email Lead Generation SaaS | MailBridge",
    ogDescription: "Send personalized bulk emails via CSV/Excel with Gmail SMTP relay. Track real-time email opens and qualify hot sales leads with zero vendor fees.",
    noindex: false
  });

  // ==========================================
  // COMPOSER STATES
  // ==========================================
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("Hello {{firstname}}, updates from {{company}}");
  const [body, setBody] = useState(
`Hi {{firstname}} {{lastname}},

We are excited to share our latest product updates with you at {{company}}!

Feel free to reply to this email if you have any questions.

Best regards,
The Team`
  );

  const [fileName, setFileName] = useState("");
  const [recipientsData, setRecipientsData] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [emailColumnKey, setEmailColumnKey] = useState("");
  const [previewRowIndex, setPreviewRowIndex] = useState(0);

  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0, failed: 0 });
  const [composerFeedback, setComposerFeedback] = useState({ type: "", message: "" });
  const [customTrackingUrl, setCustomTrackingUrl] = useState("");
  const [showAdvancedTracking, setShowAdvancedTracking] = useState(false);
  const [ctaEnabled, setCtaEnabled] = useState(true);
  const [ctaButtonText, setCtaButtonText] = useState("Book a Free 15-Min Demo");
  const [ctaTargetUrl, setCtaTargetUrl] = useState("https://mail-bridge.email");

  // Auth & Login Popup Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  async function handlePopupLogin(e) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter your email and password.");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    try {
      await login(loginEmail.trim(), loginPassword);
      setShowLoginModal(false);
      setComposerFeedback({
        type: "success",
        message: "Logged in successfully! You can now click 'Send Bulk Campaign' to dispatch."
      });
    } catch (err) {
      setLoginError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  const fileInputRef = useRef(null);
  const bodyTextareaRef = useRef(null);

  // ==========================================
  // TRACKING INDEX STATES
  // ==========================================
  const [campaignsList, setCampaignsList] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [openFilter, setOpenFilter] = useState("all"); // "all" | "opened" | "unopened"
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLeadEmail, setCopiedLeadEmail] = useState(null);

  // Load campaigns list when switching to tracking tab
  useEffect(() => {
    if (activeTab === "tracking" && token) {
      fetchCampaigns();
    }
  }, [activeTab, token]);

  // Live polling for real-time open status updates while on tracking tab
  useEffect(() => {
    if (activeTab === "tracking" && selectedCampaignId && token) {
      const timer = setInterval(() => {
        fetchCampaignDetails(selectedCampaignId, true);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeTab, selectedCampaignId, token]);

  async function fetchCampaigns() {
    if (!token) return;
    setLoadingCampaigns(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.campaigns) {
          setCampaignsList(data.campaigns);
          if (data.campaigns.length > 0 && !selectedCampaignId) {
            setSelectedCampaignId(data.campaigns[0]._id);
            fetchCampaignDetails(data.campaigns[0]._id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setLoadingCampaigns(false);
    }
  }

  async function fetchCampaignDetails(campaignId, silent = false) {
    if (!campaignId || !token) return;
    if (!silent) setLoadingDetails(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.campaign) {
          setSelectedCampaignDetails(data.campaign);
        }
      }
    } catch (err) {
      console.error("Failed to fetch campaign details:", err);
    } finally {
      if (!silent) setLoadingDetails(false);
    }
  }


  // ==========================================
  // FILE PARSING (CSV / XLSX / XLS)
  // ==========================================
  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function processFile(file) {
    setFileName(file.name);
    setComposerFeedback({ type: "", message: "" });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          setComposerFeedback({ type: "danger", message: "The uploaded file contains no data rows." });
          return;
        }

        const columns = Object.keys(rawJson[0]);
        setAvailableColumns(columns);

        // Detect email column automatically
        const detectedEmailCol = columns.find(c => /email|e-mail|mail/i.test(c)) || columns[0];
        setEmailColumnKey(detectedEmailCol);

        // Format recipients
        const formatted = rawJson.map((row) => {
          const emailVal = String(row[detectedEmailCol] || "").trim();
          return {
            ...row,
            email: emailVal
          };
        });

        setRecipientsData(formatted);
        setPreviewRowIndex(0);
        if (!campaignName) {
          setCampaignName(file.name.replace(/\.[^/.]+$/, ""));
        }
      } catch (err) {
        console.error("File parsing error:", err);
        setComposerFeedback({ type: "danger", message: "Failed to parse file. Please upload a valid CSV or XLSX." });
      }
    };
    reader.readAsBinaryString(file);
  }

  function handleDownloadSample() {
    const sampleRows = [
      { firstname: "Deep", lastname: "Patel", email: "patelpte12xx@gmail.com", company: "MailBridge" },
      { firstname: "Sarah", lastname: "Connor", email: "sarah@example.com", company: "Cyberdyne" },
      { firstname: "Alex", lastname: "Morgan", email: "alex@example.com", company: "TechCorp" }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recipients");
    XLSX.writeFile(wb, "mailbridge_sample_recipients.csv");
  }

  // Insert variable tag into body at cursor
  function insertVariable(tagName) {
    const tag = `{{${tagName}}}`;
    const textarea = bodyTextareaRef.current;
    if (!textarea) {
      setBody(prev => prev + " " + tag);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextBody = body.substring(0, start) + tag + body.substring(end);
    setBody(nextBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 10);
  }

  // Real-time interpolation preview helper
  function previewInterpolate(text, row) {
    if (!text) return "";
    if (!row) return text;
    return text.replace(/\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}/gi, (_, key) => {
      const cleanKey = key.trim();
      const match = Object.keys(row).find(k => k.toLowerCase() === cleanKey.toLowerCase());
      return match !== undefined && row[match] !== undefined && row[match] !== null
        ? String(row[match])
        : `[${cleanKey}]`;
    });
  }

  // Send campaign
  async function handleSendCampaign(e) {
    e.preventDefault();

    // Check if user is authenticated before sending
    if (!token || !user) {
      setShowLoginModal(true);
      return;
    }

    if (!campaignName.trim()) {
      setComposerFeedback({ type: "danger", message: "Please enter a campaign name." });
      return;
    }
    if (recipientsData.length === 0) {
      setComposerFeedback({ type: "danger", message: "Please upload a CSV or XLSX file with recipients." });
      return;
    }

    const validRecipients = recipientsData.filter(r => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));
    if (validRecipients.length === 0) {
      setComposerFeedback({ type: "danger", message: "No valid email addresses found in the selected file." });
      return;
    }

    if (!confirm(`Are you sure you want to send this personalized campaign to ${validRecipients.length} recipients?`)) {
      return;
    }

    setIsSending(true);
    setComposerFeedback({ type: "info", message: `Dispatching emails to ${validRecipients.length} recipients...` });
    setSendProgress({ sent: 0, total: validRecipients.length, failed: 0 });

    try {
      const res = await fetch(`${API_URL}/api/v1/campaigns/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: campaignName,
          subject,
          body,
          recipients: validRecipients,
          ctaButtonText: ctaEnabled ? ctaButtonText.trim() : "",
          ctaTargetUrl: ctaEnabled ? ctaTargetUrl.trim() : "",
          trackingBaseUrl: customTrackingUrl.trim() || undefined
        })
      });

      let data = {};
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        if (!res.ok) {
          if (res.status === 401) {
            setShowLoginModal(true);
            throw new Error("Authentication session expired. Please log in to dispatch campaigns.");
          }
          throw new Error(`Server returned error (${res.status}).`);
        }
      }

      if (!res.ok) {
        if (res.status === 401) {
          setShowLoginModal(true);
        }
        throw new Error(data.error || "Failed to process campaign dispatch.");
      }

      setComposerFeedback({
        type: "success",
        message: `Campaign "${campaignName}" sent successfully! ${data.campaign.sentCount} delivered, ${data.campaign.failedCount} failed.`
      });

      // Switch to tracking tab to see the newly sent campaign
      setTimeout(() => {
        setActiveTab("tracking");
        fetchCampaigns();
        if (data.campaign._id) {
          setSelectedCampaignId(data.campaign._id);
          fetchCampaignDetails(data.campaign._id);
        }
      }, 1500);
    } catch (err) {
      setComposerFeedback({ type: "danger", message: err.message });
    } finally {
      setIsSending(false);
    }
  }

  // Export Qualified Leads Report to CSV (CRM Ready)
  function handleExportTrackingCsv() {
    if (!selectedCampaignDetails || !selectedCampaignDetails.recipients) return;
    const reportData = selectedCampaignDetails.recipients.map((r, i) => {
      const leadStatus = r.clicked ? "Hot Lead (Clicked CTA)" : r.opened ? "Warm Lead (Opened)" : "Cold Lead (Unopened)";
      return {
        Index: i + 1,
        Email: r.email,
        Name: `${r.recipientData?.firstname || ""} ${r.recipientData?.lastname || ""}`.trim() || "-",
        Company: r.recipientData?.company || "-",
        DeliveryStatus: r.status,
        LeadStatus: leadStatus,
        ClickedCTA: r.clicked ? "Yes" : "No",
        OpenedEmail: r.opened ? "Yes" : "No",
        TotalOpens: r.openCount || 0,
        TotalClicks: r.clickCount || 0,
        FirstOpenedAt: r.openedAt ? new Date(r.openedAt).toLocaleString() : "-",
        FirstClickedAt: r.clickedAt ? new Date(r.clickedAt).toLocaleString() : "-",
        SentAt: r.sentAt ? new Date(r.sentAt).toLocaleString() : "-"
      };
    });

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Qualified Leads");
    XLSX.writeFile(wb, `${selectedCampaignDetails.name}_qualified_leads.csv`);
  }

  const totalRecipients = selectedCampaignDetails?.totalRecipients || selectedCampaignDetails?.recipients?.length || 0;
  const totalClicked = selectedCampaignDetails?.recipients?.filter(r => r.clicked).length || 0;
  const totalOpened = selectedCampaignDetails?.recipients?.filter(r => r.opened).length || 0;
  const totalUnopened = Math.max(0, totalRecipients - totalOpened);
  const openRate = totalRecipients ? Math.round((totalOpened / totalRecipients) * 100) : 0;
  const conversionRate = totalRecipients ? Math.round((totalClicked / totalRecipients) * 100) : 0;

  // Filter recipients in Lead Pipeline
  const filteredRecipients = (selectedCampaignDetails?.recipients || []).filter((r) => {
    if (openFilter === "hot" && !r.clicked) return false;
    if (openFilter === "warm" && (!r.opened || r.clicked)) return false;
    if (openFilter === "opened" && !r.opened) return false;
    if (openFilter === "unopened" && r.opened) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const emailMatch = r.email.toLowerCase().includes(q);
      const nameMatch = `${r.recipientData?.firstname || ""} ${r.recipientData?.lastname || ""}`.toLowerCase().includes(q);
      const companyMatch = (r.recipientData?.company || "").toLowerCase().includes(q);
      return emailMatch || nameMatch || companyMatch;
    }
    return true;
  });

  return (
    <div className="bulk-mailer-page">
      <div className="bulk-mailer-container">
        
        {/* Page Header */}
        <div className="bulk-header">
          <div className="bulk-header-text">
            <h1><Mail className="text-teal-600" size={32} /> Bulk Mailer &amp; Lead Outreach</h1>
            <p>Upload recipient lists from CSV or Excel, personalize email templates, and track real-time open status and sales conversions.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-bulk-secondary" onClick={handleDownloadSample}>
              <Download size={16} /> Download Sample CSV
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bulk-tabs">
          <button 
            className={`bulk-tab-btn ${activeTab === "composer" ? "active" : ""}`}
            onClick={() => setActiveTab("composer")}
          >
            <Send size={16} /> Compose & Send Bulk Email
          </button>
          <button 
            className={`bulk-tab-btn ${activeTab === "tracking" ? "active" : ""}`}
            onClick={() => setActiveTab("tracking")}
          >
            <Eye size={16} /> Campaign Tracking Index {campaignsList.length > 0 && `(${campaignsList.length})`}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: COMPOSE & SEND BULK EMAIL                                          */}
        {/* ========================================================================= */}
        {activeTab === "composer" && (
          <div className="bulk-grid">
            
            {/* Left Column: File Upload & Configuration */}
            <div>
              {/* File Upload Box */}
              <div className="bulk-card">
                <h3 className="bulk-card-title"><UploadCloud size={20} /> 1. Upload Recipient List</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>
                  Upload a <strong>.csv</strong> or <strong>.xlsx</strong> spreadsheet containing recipient columns like <code>email</code>, <code>firstname</code>, <code>lastname</code>.
                </p>

                <div 
                  className="dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                    onChange={handleFileUpload} 
                  />
                  <UploadCloud className="dropzone-icon" />
                  <div className="dropzone-title">Click or drag & drop file here</div>
                  <div className="dropzone-subtitle">Supports CSV, XLSX, XLS</div>
                </div>

                {fileName && (
                  <div className="file-badge">
                    <span className="flex items-center gap-2">
                      <FileText size={16} /> <strong>{fileName}</strong> ({recipientsData.length} recipients found)
                    </span>
                    <button 
                      className="text-red-500 hover:text-red-700 p-1 border-0 bg-transparent cursor-pointer"
                      onClick={() => {
                        setFileName("");
                        setRecipientsData([]);
                        setAvailableColumns([]);
                      }}
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                {/* Column Selector */}
                {availableColumns.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <div className="bulk-form-group">
                      <label>Email Address Column:</label>
                      <select 
                        className="bulk-select" 
                        value={emailColumnKey} 
                        onChange={(e) => setEmailColumnKey(e.target.value)}
                      >
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Detected Merge Variables:
                    </div>
                    <div className="tags-container" style={{ marginTop: "6px" }}>
                      {availableColumns.map(col => (
                        <button 
                          key={col} 
                          type="button" 
                          className="tag-btn"
                          onClick={() => insertVariable(col)}
                          title={`Insert {{${col}}} into template`}
                        >
                          + {`{{${col}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Data Preview Table */}
              {recipientsData.length > 0 && (
                <div className="bulk-card">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="bulk-card-title mb-0"><Users size={18} /> Recipient Data Preview (First 5)</h3>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Showing 5 of {recipientsData.length}
                    </span>
                  </div>
                  <div className="bulk-table-wrapper">
                    <table className="bulk-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Email</th>
                          {availableColumns.filter(c => c !== emailColumnKey).map(c => (
                            <th key={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recipientsData.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>
                              <strong>{row[emailColumnKey]}</strong>
                              {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row[emailColumnKey]) ? (
                                <span className="badge-opened ml-1" style={{ fontSize: "10px", padding: "1px 5px" }}>valid</span>
                              ) : (
                                <span className="badge-failed ml-1" style={{ fontSize: "10px", padding: "1px 5px" }}>invalid</span>
                              )}
                            </td>
                            {availableColumns.filter(c => c !== emailColumnKey).map(c => (
                              <td key={c}>{String(row[c] || "-")}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Template Composer & Live Preview */}
            <div>
              <form onSubmit={handleSendCampaign} className="bulk-card">
                <h3 className="bulk-card-title"><Send size={20} /> 2. Customize & Personalize Email</h3>

                {composerFeedback.message && (
                  <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                    composerFeedback.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                    composerFeedback.type === "danger" ? "bg-red-50 text-red-800 border border-red-200" :
                    "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}>
                    {composerFeedback.message}
                  </div>
                )}

                <div className="bulk-form-group">
                  <label>Campaign Name</label>
                  <input 
                    type="text" 
                    className="bulk-input" 
                    placeholder="e.g. Community Announcement Oct"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    required
                  />
                </div>

                <div className="bulk-form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="mb-0">Subject Line (Personalized)</label>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Supports &#123;&#123;tags&#125;&#125;</span>
                  </div>
                  <input 
                    type="text" 
                    className="bulk-input" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="bulk-form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="mb-0">Message Body</label>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Insert &#123;&#123;tags&#125;&#125; anywhere</span>
                  </div>
                  <textarea 
                    ref={bodyTextareaRef}
                    className="bulk-textarea" 
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                </div>

                {/* Lead Generation CTA Card */}
                <div className="lead-cta-card">
                  <div className="lead-cta-header">
                    <div className="lead-cta-title-group">
                      <Target size={18} style={{ color: "#0f766e" }} />
                      <span className="lead-cta-title">Lead Generation Call-to-Action (CTA)</span>
                    </div>
                    <label className="lead-cta-toggle-label">
                      <input
                        type="checkbox"
                        checked={ctaEnabled}
                        onChange={(e) => setCtaEnabled(e.target.checked)}
                      />
                      <span>Enable Lead CTA Button</span>
                    </label>
                  </div>

                  {ctaEnabled ? (
                    <div className="lead-cta-grid">
                      <div className="lead-cta-field">
                        <label>Button Text / Offer:</label>
                        <input
                          type="text"
                          className="bulk-input"
                          placeholder="e.g. Book a Free 15-Min Demo"
                          value={ctaButtonText}
                          onChange={(e) => setCtaButtonText(e.target.value)}
                        />
                      </div>
                      <div className="lead-cta-field">
                        <label>Target Landing Page / Booking URL:</label>
                        <input
                          type="url"
                          className="bulk-input"
                          placeholder="e.g. https://yourcompany.com/demo or Calendly link"
                          value={ctaTargetUrl}
                          onChange={(e) => setCtaTargetUrl(e.target.value)}
                        />
                      </div>
                      <div className="lead-cta-tip">
                        💡 When prospects click this CTA button in your email, they are immediately qualified as a <strong>🔥 Hot Lead</strong> in your Lead Pipeline and redirected to your landing page.
                      </div>
                    </div>
                  ) : (
                    <p className="lead-cta-disabled-note">
                      CTA button disabled. Emails will be tracked for opens only.
                    </p>
                  )}
                </div>

                {/* Optional Tracking Server Setting */}
                <div style={{ marginBottom: "16px" }}>
                  <button
                    type="button"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--primary)",
                      fontSize: "12px",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 600
                    }}
                    onClick={() => setShowAdvancedTracking(!showAdvancedTracking)}
                  >
                    ⚙ {showAdvancedTracking ? "Hide" : "Configure"} Custom Public Tracking URL (Optional)
                  </button>
                  {showAdvancedTracking && (
                    <div className="advanced-tracking-box">
                      <label>Public Tracking Server URL:</label>
                      <input
                        type="url"
                        className="bulk-input"
                        placeholder="e.g. https://xxxx.trycloudflare.com or https://mail-bridge.email"
                        value={customTrackingUrl}
                        onChange={(e) => setCustomTrackingUrl(e.target.value)}
                        style={{ fontSize: "13px" }}
                      />
                      <p>
                        Leave blank to auto-detect. When testing locally with real Gmail, Gmail's proxy cannot reach <code>localhost:5000</code>. You can paste a public tunnel URL here or use the email&apos;s receipt link / ⚡ Test Open button.
                      </p>
                    </div>
                  )}
                </div>

                {/* Email Client Live Preview Mockup */}
                {recipientsData.length > 0 && (
                  <div className="email-mockup-frame">
                    {/* Window Title Bar with Dots and Stepper */}
                    <div className="email-mockup-titlebar">
                      <div className="window-dots">
                        <span className="window-dot red" />
                        <span className="window-dot yellow" />
                        <span className="window-dot green" />
                      </div>
                      <div className="email-mockup-title">
                        <Eye size={13} /> Live Personalized Preview
                      </div>
                      <div className="recipient-stepper">
                        <button 
                          type="button"
                          className="stepper-btn"
                          disabled={previewRowIndex === 0}
                          onClick={() => setPreviewRowIndex(prev => Math.max(0, prev - 1))}
                          title="Previous recipient"
                        >
                          ‹
                        </button>
                        <select 
                          className="recipient-select-sleek"
                          value={previewRowIndex}
                          onChange={(e) => setPreviewRowIndex(Number(e.target.value))}
                        >
                          {recipientsData.slice(0, 50).map((r, i) => (
                            <option key={i} value={i}>
                              #{i + 1}: {r[emailColumnKey]}
                            </option>
                          ))}
                        </select>
                        <button 
                          type="button"
                          className="stepper-btn"
                          disabled={previewRowIndex >= recipientsData.length - 1}
                          onClick={() => setPreviewRowIndex(prev => Math.min(recipientsData.length - 1, prev + 1))}
                          title="Next recipient"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    {/* Email Headers Section */}
                    <div className="email-mockup-headers">
                      <div className="email-header-row">
                        <div className="email-avatar">
                          {(user?.companyName || user?.senderName || "MB").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="email-header-meta">
                          <div className="email-sender-line">
                            <div>
                              <span className="email-sender-name">{user?.senderName || user?.companyName || "MailBridge"}</span>
                              <span className="email-sender-address">&lt;{user?.senderEmail || "notifications@mail-bridge.email"}&gt;</span>
                            </div>
                            <span className="email-time-badge">Just now</span>
                          </div>
                          <div className="email-recipient-line">
                            To: <strong>{recipientsData[previewRowIndex]?.[emailColumnKey]}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="email-subject-line">
                        {previewInterpolate(subject, recipientsData[previewRowIndex]) || "(No subject)"}
                      </div>
                    </div>

                    {/* Email Body Card */}
                    <div className="email-mockup-body">
                      <div className="email-card-shell">
                        <div className="email-card-banner">
                          <h4>{user?.senderName || user?.companyName || "MailBridge"}</h4>
                        </div>
                        <div className="email-card-content">
                          {previewInterpolate(body, recipientsData[previewRowIndex])
                            .split(/\n\n+/)
                            .map((para, pIdx) => (
                              <p key={pIdx} className="email-card-paragraph">
                                {para.split("\n").map((line, lIdx) => (
                                  <React.Fragment key={lIdx}>
                                    {line}
                                    {lIdx < para.split("\n").length - 1 && <br />}
                                  </React.Fragment>
                                ))}
                              </p>
                            ))}

                          {/* Lead Call-to-Action Button Preview */}
                          {ctaEnabled && (
                            <div style={{
                              marginTop: "24px",
                              marginBottom: "12px",
                              textAlign: "center"
                            }}>
                              <a
                                href="#preview"
                                onClick={(e) => e.preventDefault()}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
                                  color: "#ffffff",
                                  fontSize: "14px",
                                  fontWeight: 700,
                                  padding: "12px 28px",
                                  borderRadius: "8px",
                                  textDecoration: "none",
                                  boxShadow: "0 4px 14px rgba(15, 118, 110, 0.35)",
                                  pointerEvents: "none"
                                }}
                              >
                                {ctaButtonText || "Book a Demo"} →
                              </a>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                                🎯 Destination URL: <code>{ctaTargetUrl || "https://..."}</code>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="email-card-footer">
                          Sent via {user?.senderName || user?.companyName || "MailBridge"} • Powered by MailBridge
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div style={{ marginTop: "24px" }}>
                  <button 
                    type="submit" 
                    className="btn-bulk-primary w-full justify-center"
                    style={{ fontSize: "15px", padding: "12px 24px", boxShadow: "0 4px 14px rgba(15, 118, 110, 0.35)" }}
                    disabled={isSending || recipientsData.length === 0}
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} /> 
                        Sending Campaign ({sendProgress.sent}/{sendProgress.total})...
                      </>
                    ) : !token ? (
                      <>
                        <Lock size={18} /> 
                        Send Bulk Campaign {recipientsData.length > 0 && `(${recipientsData.length} emails)`}
                      </>
                    ) : (
                      <>
                        <Send size={18} /> 
                        Send Bulk Campaign {recipientsData.length > 0 && `(${recipientsData.length} emails)`}
                      </>
                    )}
                  </button>
                  {!token && (
                    <div style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                      🔒 You will be prompted to log in or create an account when clicking send.
                    </div>
                  )}
                </div>
              </form>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LEAD PIPELINE & CAMPAIGN CONVERSION TRACKER                        */}
        {/* ========================================================================= */}
        {activeTab === "tracking" && (
          <div>
            {!token ? (
              <div className="bulk-card text-center" style={{ padding: "48px 24px", maxWidth: "560px", margin: "40px auto" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(15, 118, 110, 0.1)",
                  color: "#0f766e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px"
                }}>
                  <Lock size={28} />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                  Log In to View Lead Pipeline & Open Tracking
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
                  Campaign tracking data, open acknowledgments, and qualified hot leads are saved securely to your account.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button 
                    type="button" 
                    className="btn-bulk-primary"
                    onClick={() => setShowLoginModal(true)}
                  >
                    <LogIn size={16} /> Log In to View Pipeline
                  </button>
                  <button 
                    type="button" 
                    className="btn-bulk-secondary"
                    onClick={() => navigate("/register")}
                  >
                    Create Free Account
                  </button>
                </div>
              </div>
            ) : campaignsList.length === 0 ? (
              <div className="bulk-card text-center" style={{ padding: "48px 24px", maxWidth: "600px", margin: "30px auto" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(15, 118, 110, 0.12)",
                  color: "#0f766e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px"
                }}>
                  <Target size={28} />
                </div>
                <h3 style={{ fontSize: "19px", fontWeight: 700, marginBottom: "8px" }}>
                  No Campaigns Dispatched Yet
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
                  You haven&apos;t sent any campaigns yet on this account to track. Compose and dispatch an outreach campaign in Tab 1 to track email delivery, open rates, and CTA clicks in real time.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button 
                    type="button" 
                    className="btn-bulk-primary"
                    onClick={() => setActiveTab("composer")}
                    style={{ padding: "10px 20px" }}
                  >
                    <Send size={16} /> Compose & Send Campaign
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Top Stat Cards for Lead Generation Pipeline */}
                <div className="stats-cards-grid">
              <div className="stat-card">
                <div className="stat-card-title">Total Leads Targeted</div>
                <div className="stat-card-value">{totalRecipients}</div>
                <div className="stat-card-sub">{campaignsList.length} total campaigns dispatched</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Warm Leads (Opened)</div>
                <div className="stat-card-value text-emerald-600 font-bold">{totalOpened}</div>
                <div className="stat-card-sub">{openRate}% email open rate</div>
              </div>
              <div className="stat-card" style={{ borderColor: "#f97316" }}>
                <div className="stat-card-title" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Flame size={15} style={{ color: "#f97316" }} /> Hot Qualified Leads
                </div>
                <div className="stat-card-value" style={{ color: "#ea580c", fontWeight: 800 }}>{totalClicked}</div>
                <div className="stat-card-sub">{conversionRate}% CTA conversion rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Cold Leads (Unopened)</div>
                <div className="stat-card-value text-gray-500 font-bold">{totalUnopened}</div>
                <div className="stat-card-sub">Ready for follow-up</div>
              </div>
            </div>

            {/* Campaign Selection & Actions */}
            <div className="bulk-card">
              <div className="campaign-selection-header flex justify-between items-center flex-wrap gap-3">
                <div className="campaign-select-wrapper flex items-center gap-3">
                  <label className="text-sm font-semibold mb-0" style={{ whiteSpace: "nowrap" }}>Select Campaign:</label>
                  <select 
                    className="bulk-select campaign-select-dropdown" 
                    value={selectedCampaignId}
                    onChange={(e) => {
                      setSelectedCampaignId(e.target.value);
                      fetchCampaignDetails(e.target.value);
                    }}
                  >
                    {campaignsList.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({new Date(c.createdAt).toLocaleDateString()}) - {c.openedCount || 0} opened, {c.clickedCount || 0} clicked
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campaign-actions-btns flex items-center gap-2 flex-wrap">
                  <button 
                    className="btn-bulk-secondary"
                    onClick={() => fetchCampaignDetails(selectedCampaignId)}
                    disabled={loadingDetails}
                    title="Refresh live pipeline stats"
                  >
                    <RefreshCw className={loadingDetails ? "animate-spin" : ""} size={15} /> 
                    Refresh Stats
                  </button>
                  <button 
                    className="btn-bulk-secondary"
                    onClick={handleExportTrackingCsv}
                    disabled={!selectedCampaignDetails}
                    title="Export CRM-ready qualified leads CSV"
                  >
                    <Download size={15} /> Export Leads CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Lead Generation Pipeline Info Banner */}
            <div className="lead-pipeline-banner">
              <div style={{
                background: "#059669",
                color: "#ffffff",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px",
                fontWeight: "bold",
                fontSize: "15px"
              }}>
                🎯
              </div>
              <div className="lead-pipeline-banner-text">
                <span className="lead-pipeline-banner-title">Lead Generation & Qualification Pipeline</span><br />
                Every prospect who receives your campaign is automatically segmented in real-time based on their engagement:
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "8px" }}>
                  <div className="lead-pipeline-pill-hot">
                    <strong style={{ color: "#ea580c" }}>🔥 Hot Qualified Lead:</strong>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>Prospect clicked your Call-to-Action button (e.g. booked demo/visited landing page). Ready for immediate sales closing!</div>
                  </div>
                  <div className="lead-pipeline-pill-warm">
                    <strong style={{ color: "#059669" }}>👁️ Warm Lead:</strong>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>Prospect opened your email. High interest, prime for a targeted follow-up sequence.</div>
                  </div>
                  <div className="lead-pipeline-pill-cold">
                    <strong style={{ color: "#64748b" }}>❄️ Cold Prospect:</strong>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>Delivered but unopened. Send a reminder with a revised subject line.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipient Lead Pipeline Index Table */}
            <div className="bulk-card">
              <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                <div>
                  <h3 className="bulk-card-title mb-1">
                    <Target size={20} className="text-teal-600" /> Lead Pipeline & Engagement Index
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                    Real-time status of each prospect indicating lead qualification, open activity, and CTA conversion.
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="pipeline-filter-controls flex items-center gap-3 flex-wrap">
                  {/* Search */}
                  <div className="pipeline-search-wrapper relative">
                    <input 
                      type="text" 
                      className="bulk-input pipeline-search-input" 
                      placeholder="Search leads..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                  </div>

                  {/* Filter Pills */}
                  <div className="bulk-tabs pipeline-filter-pills mb-0">
                    <button 
                      className={`bulk-tab-btn ${openFilter === "all" ? "active" : ""}`}
                      onClick={() => setOpenFilter("all")}
                    >
                      All ({totalRecipients})
                    </button>
                    <button 
                      className={`bulk-tab-btn ${openFilter === "hot" ? "active" : ""}`}
                      onClick={() => setOpenFilter("hot")}
                      style={{ color: openFilter === "hot" ? "#ea580c" : undefined }}
                    >
                      🔥 Hot Leads ({totalClicked})
                    </button>
                    <button 
                      className={`bulk-tab-btn ${openFilter === "warm" ? "active" : ""}`}
                      onClick={() => setOpenFilter("warm")}
                    >
                      👁️ Warm Leads ({totalOpened})
                    </button>
                    <button 
                      className={`bulk-tab-btn ${openFilter === "unopened" ? "active" : ""}`}
                      onClick={() => setOpenFilter("unopened")}
                    >
                      ❄️ Cold ({totalUnopened})
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              {loadingDetails ? (
                <div className="py-12 text-center text-gray-500">
                  <RefreshCw className="animate-spin inline-block mr-2" size={20} />
                  Loading lead pipeline data...
                </div>
              ) : filteredRecipients.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <AlertCircle className="inline-block mr-2" size={24} />
                  No leads found matching the filter.
                </div>
              ) : (
                <div className="bulk-table-wrapper">
                  <table className="bulk-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Lead Email</th>
                        <th>Name / Company</th>
                        <th>Delivery</th>
                        <th>Lead Qualification</th>
                        <th>First Engaged At</th>
                        <th>Interactions</th>
                        <th style={{ textAlign: "center", minWidth: "160px" }}>
                          Lead Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecipients.map((recipient, idx) => (
                        <tr key={recipient.trackingId || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <strong>{recipient.email}</strong>
                          </td>
                          <td>
                            {recipient.recipientData?.firstname || recipient.recipientData?.lastname ? (
                              <div>
                                <div style={{ fontWeight: 600 }}>
                                  {`${recipient.recipientData?.firstname || ""} ${recipient.recipientData?.lastname || ""}`.trim()}
                                </div>
                                {recipient.recipientData?.company && (
                                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                    {recipient.recipientData.company}
                                  </div>
                                )}
                              </div>
                            ) : recipient.recipientData?.company ? (
                              <span>{recipient.recipientData.company}</span>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>-</span>
                            )}
                          </td>
                          <td>
                            {recipient.status === "sent" ? (
                              <span className="badge-sent">Sent</span>
                            ) : recipient.status === "failed" ? (
                              <span className="badge-failed">Failed</span>
                            ) : (
                              <span className="badge-unopened">Pending</span>
                            )}
                          </td>
                          <td>
                            {recipient.clicked ? (
                              <span className="badge-hot-lead">
                                <Flame size={12} /> Hot Lead (Clicked CTA)
                              </span>
                            ) : recipient.opened ? (
                              <span className="badge-warm-lead">
                                <CheckCircle size={12} /> Warm Lead (Opened)
                              </span>
                            ) : (
                              <span className="badge-cold-lead">
                                <Clock size={12} /> Cold (Unopened)
                              </span>
                            )}
                          </td>
                          <td>
                            {recipient.clickedAt ? (
                              <div>
                                <span style={{ color: "#ea580c", fontWeight: 600 }}>🔥 {new Date(recipient.clickedAt).toLocaleTimeString()}</span>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(recipient.clickedAt).toLocaleDateString()}</div>
                              </div>
                            ) : recipient.openedAt ? (
                              <div>
                                <span>👁️ {new Date(recipient.openedAt).toLocaleTimeString()}</span>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(recipient.openedAt).toLocaleDateString()}</div>
                              </div>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>-</span>
                            )}
                          </td>
                          <td>
                            {recipient.clicked ? (
                              <div>
                                <span style={{ color: "#ea580c", fontWeight: 700 }}>{recipient.clickCount || 1} CTA click{recipient.clickCount === 1 ? "" : "s"}</span>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{recipient.openCount || 1} open{recipient.openCount === 1 ? "" : "s"}</div>
                              </div>
                            ) : recipient.opened ? (
                              <span className="font-semibold text-teal-700">
                                {recipient.openCount} {recipient.openCount === 1 ? "open" : "opens"}
                              </span>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>0</span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                              {/* Production Action 1: Direct Personalized Follow-Up Mailto */}
                              <a
                                href={`mailto:${recipient.email}?subject=${encodeURIComponent("Following up: " + (selectedCampaignDetails?.name || "Updates"))}&body=${encodeURIComponent("Hi " + (recipient.recipientData?.firstname || "there") + ",\n\nI wanted to follow up on my previous note to see if you had a chance to review.\n\nBest regards,\n" + (user?.name || "The Team"))}`}
                                className="btn-bulk-secondary"
                                style={{
                                  padding: "5px 11px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                  textDecoration: "none",
                                  color: "#0f766e",
                                  borderColor: "#14b8a6",
                                  background: "rgba(20, 184, 166, 0.07)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px"
                                }}
                                title="Open default email client to send a direct 1-on-1 follow-up"
                              >
                                <Mail size={13} /> Follow-up
                              </a>

                              {/* Production Action 2: 1-Click Copy Lead Email */}
                              <button
                                type="button"
                                className="btn-bulk-secondary"
                                style={{
                                  padding: "5px 9px",
                                  fontSize: "12px",
                                  borderRadius: "6px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px"
                                }}
                                onClick={() => {
                                  if (navigator.clipboard) {
                                    navigator.clipboard.writeText(recipient.email);
                                    setCopiedLeadEmail(recipient.email);
                                    setTimeout(() => setCopiedLeadEmail(null), 2000);
                                  }
                                }}
                                title="Copy prospect email address"
                              >
                                {copiedLeadEmail === recipient.email ? (
                                  <span style={{ color: "#059669", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    <CheckCircle size={13} /> Copied!
                                  </span>
                                ) : (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    <Copy size={13} /> Copy
                                  </span>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
              </>
            )}

          </div>
        )}

      </div>

      {/* Login Required Popup Modal */}
      {showLoginModal && (
        <div className="login-popup-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="login-popup-header">
              <div className="login-popup-title-group">
                <div className="login-popup-icon">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="login-popup-title">Account Login Required</h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>MailBridge Campaign Dispatch</div>
                </div>
              </div>
              <button 
                type="button" 
                className="login-popup-close-btn"
                onClick={() => setShowLoginModal(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="login-popup-body">
              <p className="login-popup-desc">
                Please log in to your account to dispatch this campaign and track real-time leads. Your uploaded recipients and customized template are safely preserved!
              </p>

              {loginError && (
                <div style={{
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  color: "#b91c1c",
                  fontSize: "13px",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handlePopupLogin}>
                <div className="login-popup-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="bulk-input"
                    placeholder="name@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="login-popup-field">
                  <label>Password</label>
                  <input
                    type="password"
                    className="bulk-input"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="login-popup-btn"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} /> Logging In...
                    </>
                  ) : (
                    <>
                      <LogIn size={16} /> Log In & Continue Sending
                    </>
                  )}
                </button>
              </form>

              <div className="login-popup-footer">
                Don&apos;t have an account? 
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate("/register");
                  }}
                  className="login-popup-link"
                  style={{ background: "none", border: "none", padding: 0, font: "inherit" }}
                >
                  Create Free Account →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
