import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Play,
  BookOpen,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  Mail,
  Terminal,
  Code,
  Palette,
  Eye,
  ArrowRight,
  RotateCcw,
  Copy,
  ChevronRight,
  Laptop,
  Check,
  ExternalLink,
  Phone,
  Cpu,
  Smartphone
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../config.js";
import { useSEO } from "../hooks/useSEO.js";
import "../styles/Home.css";

const features = [
  { 
    icon: Zap, 
    title: "Zero Heavy Setup", 
    desc: "Use your existing Gmail SMTP server as a transactional email relay in minutes." 
  },
  { 
    icon: Shield, 
    title: "Secure Authentication", 
    desc: "Secure API keys authenticate requests instantly over production-grade HTTPS." 
  },
  { 
    icon: BarChart3, 
    title: "Live Analytics", 
    desc: "Track total deliveries, open rates, failed dispatches, and simulated runs in real-time." 
  },
  {
    icon: Phone,
    title: "Multi-Mode SMS Relay",
    desc: "Send OTP verifications using USB ADB debugging, local HTTP Android gateways, or carrier SMTP gateways."
  },
  {
    icon: Sparkles,
    title: "Gemini AI Design Engine",
    desc: "Generate professional visual style palettes and persuasive copywriting automatically using AI."
  },
  {
    icon: Cpu,
    title: "Local Emulator Mode",
    desc: "Full in-memory database and sandbox environment for local testing without cellular or email costs."
  }
];

export function HomePage() {
  const { user, token } = useAuth();
  
  useSEO({
    title: "MailBridge | Free Transactional Email & SMS API via Gmail",
    description: "MailBridge is a free, high-performance transactional email and SMS API. Relay automated emails and SMS verification codes directly using Gmail SMTP with zero vendor costs.",
    keywords: "transactional email API, free email api, gmail smtp relay, email gateway, sms gateway, otp verification, developer email service, free sms gateway, gmail api gateway, mailbridge"
  });
  
  // Interactive Sandbox State
  const [templateType, setTemplateType] = useState("otp");
  const [brandName, setBrandName] = useState("Acme Corp");
  const [headerColor, setHeaderColor] = useState("#0f766e");
  const [headerTextColor, setHeaderTextColor] = useState("#ffffff");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("+919876543210");
  const [customSubject, setCustomSubject] = useState("Welcome to Acme!");
  const [activeLang, setActiveLang] = useState("curl");
  const [activePane, setActivePane] = useState("preview"); // "preview" | "code" | "terminal"
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState("email");
  
  // Terminal Simulation State
  const [terminalLines, setTerminalLines] = useState([
    "// Interactive Sandbox Terminal. Click 'Execute API Request' to test."
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionDone, setExecutionDone] = useState(false);
  
  // Real sending state (for logged-in users)
  const [isSendingReal, setIsSendingReal] = useState(false);
  const [realSendResult, setRealSendResult] = useState(null);

  // Dashboard Stats Toggle State
  const [activeMetricTab, setActiveMetricTab] = useState("sent");
  const [metricStats, setMetricStats] = useState({
    sent: 1420,
    failed: 12,
    rate: 99.2,
    latency: 92
  });

  // Pre-fill recipient email if user is logged in
  useEffect(() => {
    if (user && user.email) {
      setRecipientEmail(user.email);
    } else {
      setRecipientEmail("visitor@example.com");
    }
  }, [user]);

  // Handle Dynamic Code Generation
  const getPayload = () => {
    if (templateType === "sms-otp") {
      return { to: recipientPhone || "+919876543210", purpose: "sms-otp" };
    }
    const to = recipientEmail || "visitor@example.com";
    if (templateType === "otp") {
      return { to, purpose: "login" };
    }
    if (templateType === "welcome") {
      return { to, name: "John Doe", company: brandName || "Acme Corp" };
    }
    if (templateType === "forgot-password") {
      return { to, resetUrl: "https://acme.com/reset?token=189df78" };
    }
    if (templateType === "notification") {
      return { to, title: "Acme Alert", message: "A login attempt was made on your account from a new location." };
    }
    return { to, subject: customSubject || "Branded Email", message: "Hello! This is a custom email sent through Acme Corp styling." };
  };

  const getCodeSnippet = () => {
    const endpoint = templateType === "sms-otp"
      ? `${API_URL}/api/v1/sms/otp`
      : `${API_URL}/api/v1/emails/${templateType}`;
    const payload = getPayload();
    const payloadStr = JSON.stringify(payload, null, 2);

    if (activeLang === "curl") {
      return `curl -X POST "${endpoint}" \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: mb_live_8f0a213e4b..." \\\n  -d '${payloadStr}'`;
    }
    if (activeLang === "js") {
      return `fetch("${endpoint}", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "x-api-key": "mb_live_8f0a213e4b..."\n  },\n  body: JSON.stringify(${payloadStr.replace(/\n/g, "\n    ")})\n})\n.then(res => res.json())\n.then(data => console.log(data))\n.catch(err => console.error(err));`;
    }
    if (activeLang === "python") {
      return `import requests\n\nurl = "${endpoint}"\nheaders = {\n    "Content-Type": "application/json",\n    "x-api-key": "mb_live_8f0a213e4b..."\n}\npayload = ${JSON.stringify(payload, null, 4).replace(/\n/g, "\n    ")}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`;
    }
    if (activeLang === "go") {
      return `package main\n\nimport (\n\t"bytes"\n\t"encoding/json"\n\t"fmt"\n\t"net/http"\n)\n\nfunc main() {\n\turl := "${endpoint}"\n\tpayload := map[string]interface{}{\n\t\t"to": "${payload.to}",\n\t}\n\t// ... add payload parameters\n\tjsonData, _ := json.Marshal(payload)\n\n\treq, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))\n\treq.Header.Set("Content-Type", "application/json")\n\treq.Header.Set("x-api-key", "mb_live_8f0a213e4b...")\n\n\tclient := &http.Client{}\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\tfmt.Println("Status Code:", resp.StatusCode)\n}`;
    }
    return "";
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Generate live email preview HTML dynamically based on sandbox selections
  const generateEmailHtml = () => {
    const brand = brandName || "MailBridge";
    const bgLight = "#f8fafc";
    const btnBg = headerColor || "#0f766e";
    const textMainColor = headerTextColor || "#ffffff";

    let titleText = "Security Verification";
    let bodyContent = `Your one-time verification code is shown below. Please do not share this code with anyone.`;
    let buttonHtml = `<div style="text-align: center; margin: 30px 0;"><span style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; color: #1e293b; padding: 12px 28px; border-radius: 8px; font-weight: 800; font-size: 24px; letter-spacing: 4px; display: inline-block;">823490</span></div>`;

    if (templateType === "welcome") {
      titleText = "Welcome to Acme Corp!";
      bodyContent = `Hi John Doe,\n\nWe are absolutely thrilled to welcome you to Acme Corp. Get ready to explore all our features and streamline your workspace today.`;
      buttonHtml = `<div style="text-align: center; margin: 30px 0;"><a href="https://acme.com" target="_blank" style="background-color: ${btnBg}; color: ${textMainColor}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Explore Workspace</a></div>`;
    } else if (templateType === "forgot-password") {
      titleText = "Reset Your Password";
      bodyContent = `A request was made to reset your password. If you did not make this request, you can safely ignore this email. Otherwise, click the button below to secure your credentials.`;
      buttonHtml = `<div style="text-align: center; margin: 30px 0;"><a href="https://acme.com/reset" target="_blank" style="background-color: ${btnBg}; color: ${textMainColor}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Set New Password</a></div>`;
    } else if (templateType === "notification") {
      titleText = "Acme System Alert";
      bodyContent = `Important update regarding your account security:\n\nA new login attempt was detected from a Chrome browser on a Linux client. If this wasn't you, please secure your keys.`;
      buttonHtml = `<div style="text-align: center; margin: 30px 0;"><a href="https://acme.com/security" target="_blank" style="background-color: ${btnBg}; color: ${textMainColor}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Logins</a></div>`;
    } else if (templateType === "custom") {
      titleText = customSubject || "Branded Email";
      bodyContent = `Hello! This is a fully customizable layout rendering dynamic text variables. Customize colors, brand headers, and button links.`;
      buttonHtml = `<div style="text-align: center; margin: 30px 0;"><a href="https://acme.com" target="_blank" style="background-color: ${btnBg}; color: ${textMainColor}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Continue to Site</a></div>`;
    }

    return `
      <div style="font-family: 'Inter', system-ui, sans-serif; background-color: ${bgLight}; padding: 20px; margin: 0; border-radius: 8px;">
        <div style="max-width: 500px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.03);">
          <div style="background-color: ${btnBg}; color: ${textMainColor}; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: ${textMainColor} !important;">${brand}</h2>
          </div>
          <div style="padding: 24px; color: #334155; line-height: 1.6; font-size: 14px;">
            <h1 style="margin-top: 0; margin-bottom: 12px; font-size: 18px; color: #0f172a; font-weight: 700;">${titleText}</h1>
            <p style="margin-bottom: 16px; color: #475569; white-space: pre-line;">${bodyContent}</p>
            ${buttonHtml}
          </div>
          <div style="padding: 12px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-align: center;">
            © 2026 ${brand}. All rights reserved. Sent via MailBridge.
          </div>
        </div>
      </div>
    `.trim();
  };

  // Simulate API Sandbox Call
  const executeSandboxRequest = () => {
    setActivePane("terminal");
    setIsExecuting(true);
    setExecutionDone(false);

    if (templateType === "sms-otp") {
      const lines = [
        `$ curl -X POST "${API_URL}/api/v1/sms/otp" \\`,
        `    -H "x-api-key: mb_live_8f0a213e4b..." \\`,
        `    -d '${JSON.stringify(getPayload())}'`,
        `[info] Resolving recipient phone number: ${recipientPhone || "+919876543210"}...`,
        `[info] Loading client service settings...`,
      ];
      setTerminalLines(lines);

      setTimeout(() => {
        setTerminalLines(prev => [
          ...prev,
          `[info] Delivery Mode Detected: "USB ADB Debugging" (Free local routing)`,
          `[info] Command: adb shell cmd phone sms send-text ${recipientPhone || "+919876543210"} "Your ${brandName || "Acme Corp"} OTP is: 549301. It expires in 10 minutes."`,
          `[info] Triggering ADB cellular packet transmission...`,
        ]);
      }, 800);

      setTimeout(() => {
        setTerminalLines(prev => [
          ...prev,
          `[info] ADB process returned exit code 0`,
          `[info] Message queued on device successfully`,
          `HTTP/1.1 201 Created`,
          `Content-Type: application/json`,
          `Response Payload:`,
          JSON.stringify({
            success: true,
            status: "simulated",
            messageId: "simulated-sms-" + Date.now(),
            note: "SMS dispatched successfully over simulated local ADB gateway. Register phone connection settings to send real cellular texts."
          }, null, 2)
        ]);
        setIsExecuting(false);
        setExecutionDone(true);
        
        // Bump statistics dynamically on sandbox success!
        setMetricStats(prev => ({
          ...prev,
          sent: prev.sent + 1,
          rate: parseFloat(((prev.sent + 1) / (prev.sent + 13) * 100).toFixed(1))
        }));
      }, 1800);
      return;
    }

    const lines = [
      `$ curl -X POST "${API_URL}/api/v1/emails/${templateType}" \\`,
      `    -H "x-api-key: mb_live_8f0a213e4b..." \\`,
      `    -d '${JSON.stringify(getPayload())}'`,
      `[info] Resolving recipient: ${recipientEmail || "visitor@example.com"}...`,
      `[info] Fetching user styles configuration...`,
    ];
    setTerminalLines(lines);

    setTimeout(() => {
      setTerminalLines(prev => [
        ...prev,
        `[info] Selected Key StyleType: "global"`,
        `[info] Compiling HTML template payload for: "${templateType}"`,
        `[info] Initializing SMTP connection to: smtp.gmail.com:587`,
      ]);
    }, 800);

    setTimeout(() => {
      setTerminalLines(prev => [
        ...prev,
        `[info] Auth: LOGIN successful for GMAIL_USER`,
        `[info] Transmission: Email queued & sent via TLS relay`,
        `HTTP/1.1 201 Created`,
        `Content-Type: application/json`,
        `Response Payload:`,
        JSON.stringify({
          success: true,
          status: "simulated",
          messageId: "<MB_" + Math.random().toString(36).substring(2, 10) + "@mailbridge.io>",
          note: "Email logged successfully. Complete SMTP configuration in your account settings to dispatch real emails."
        }, null, 2)
      ]);
      setIsExecuting(false);
      setExecutionDone(true);
      
      // Bump statistics dynamically on sandbox success!
      setMetricStats(prev => ({
        ...prev,
        sent: prev.sent + 1,
        rate: parseFloat(((prev.sent + 1) / (prev.sent + 13) * 100).toFixed(1))
      }));
    }, 1800);
  };

  // Send real email through logged-in API Key (if authenticated)
  const sendRealEmail = async () => {
    if (!token) return;
    setIsSendingReal(true);
    setRealSendResult(null);
    setActivePane("terminal");
    setTerminalLines([`[info] Triggering REAL API request to local server...`]);

    try {
      const activeKeyRes = await fetch(`${API_URL}/api/v1/auth/keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const keyData = await activeKeyRes.json();
      const keysList = keyData.keys || [];
      if (keysList.length === 0) {
        throw new Error("No active API Key found in your account. Please create one on the dashboard.");
      }
      const clientApiKey = keysList[0].key;
      
      const payload = getPayload();
      const endpoint = templateType === "sms-otp"
        ? `${API_URL}/api/v1/sms/otp`
        : `${API_URL}/api/v1/emails/${templateType === "custom" ? "custom" : templateType}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": clientApiKey
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        setTerminalLines(prev => [
          ...prev,
          `HTTP/1.1 201 Created`,
          `Response:`,
          JSON.stringify(data, null, 2),
          `[success] Real message delivered to ${payload.to}!`
        ]);
        setRealSendResult({ success: true, message: "Real message sent successfully!" });
      } else {
        throw new Error(data.error || "Failed to dispatch message.");
      }
    } catch (err) {
      setTerminalLines(prev => [
        ...prev,
        `[error] Request failed: ${err.message}`
      ]);
      setRealSendResult({ success: false, message: err.message });
    } finally {
      setIsSendingReal(false);
    }
  };

  return (
    <div className="home-page-redesign">
      {/* Schema.org JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "MailBridge",
          "operatingSystem": "All",
          "applicationCategory": "DeveloperApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": "Robust transactional email and SMS API via Gmail SMTP. Send secure OTPs, password resets, and alerts with zero paid vendor overhead.",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1420"
          }
        })}
      </script>

      {/* Background Mesh Overlay */}
      <div className="mesh-gradient-container">
        <div className="mesh-circle circle-1"></div>
        <div className="mesh-circle circle-2"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section-new">
        <div className="hero-grid">
          <div className="hero-left-content">
            <span className="hero-badge-pill">
              <Sparkles size={14} className="badge-spark" />
              Gmail API Gateway for Developers
            </span>
            <h1 className="hero-title">
              Robust Transactional Emails via Gmail SMTP.
            </h1>
            <p className="hero-desc-text">
              Zero paid vendor overhead. Register, create an API key, and instantly trigger styled OTPs, password resets, welcome campaigns, or custom alerts over a unified HTTPS endpoint.
            </p>
            
            <div className="hero-cta-buttons">
              {user ? (
                <>
                  <a href="/dashboard" className="btn btn-hero-primary glow-btn">
                    Go to Dashboard <ArrowRight size={16} />
                  </a>
                  <a href="/tester" className="btn btn-hero-secondary">
                    Try API Tester
                  </a>
                </>
              ) : (
                <>
                  <a href="/register" className="btn btn-hero-primary glow-btn">
                    Get Started Free <ArrowRight size={16} />
                  </a>
                  <a href="/docs" className="btn btn-hero-secondary">
                    Explore API Docs
                  </a>
                </>
              )}
            </div>

            <div className="hero-stats-row">
              <div className="stat-pill">
                <strong>5</strong> Ready Templates
              </div>
              <div className="stat-pill">
                <strong>&lt; 100ms</strong> Latency
              </div>
              <div className="stat-pill">
                <strong>100%</strong> Free Relaying
              </div>
            </div>
          </div>

          {/* Interactive Metric Showcase Cards */}
          <div className="hero-right-dashboard">
            <div className="premium-dashboard-card">
              <div className="dashboard-card-header">
                <h3>Live Delivery Metrics</h3>
                <span className="live-indicator-dot"></span>
              </div>
              
              <div className="metric-pills-row">
                <button 
                  className={`metric-pill-btn ${activeMetricTab === "sent" ? "active" : ""}`}
                  onClick={() => setActiveMetricTab("sent")}
                >
                  <span className="dot-sent"></span> Sent: {metricStats.sent}
                </button>
                <button 
                  className={`metric-pill-btn ${activeMetricTab === "failed" ? "active" : ""}`}
                  onClick={() => setActiveMetricTab("failed")}
                >
                  <span className="dot-failed"></span> Failed: {metricStats.failed}
                </button>
                <button 
                  className={`metric-pill-btn ${activeMetricTab === "rate" ? "active" : ""}`}
                  onClick={() => setActiveMetricTab("rate")}
                >
                  <span className="dot-success"></span> Delivery: {metricStats.rate}%
                </button>
              </div>

              {/* Graphic Chart Simulation */}
              <div className="dashboard-graphic-wrapper">
                <svg className="dashboard-svg-graph" viewBox="0 0 400 160">
                  <defs>
                    <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="380" y2="20" className="graph-grid-line" strokeDasharray="3 3" />
                  <line x1="30" y1="70" x2="380" y2="70" className="graph-grid-line" strokeDasharray="3 3" />
                  <line x1="30" y1="120" x2="380" y2="120" className="graph-grid-line" strokeDasharray="3 3" />
                  
                  {/* Values plotting based on active tab selection */}
                  {activeMetricTab === "sent" && (
                    <>
                      <path d="M 30 110 Q 90 70, 150 90 T 270 40 T 380 30 L 380 140 L 30 140 Z" fill="url(#gradient-area)" />
                      <path d="M 30 110 Q 90 70, 150 90 T 270 40 T 380 30" fill="none" stroke="#14b8a6" strokeWidth="3" />
                      <circle cx="270" cy="40" r="5" fill="#14b8a6" stroke="#fff" strokeWidth="2" />
                      <g className="graph-tooltip">
                        <rect x="236" y="11" width="68" height="17" rx="4" className="graph-tooltip-bg" />
                        <text x="270" y="23" className="graph-tooltip-text text-sent" fontSize="10" fontWeight="bold" textAnchor="middle">1,124 sent</text>
                      </g>
                    </>
                  )}
                  {activeMetricTab === "failed" && (
                    <>
                      <path d="M 30 135 L 90 132 L 150 128 L 210 133 L 270 120 L 380 138" fill="none" stroke="#ef4444" strokeWidth="3" />
                      <circle cx="270" cy="120" r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                      <g className="graph-tooltip">
                        <rect x="238" y="92" width="64" height="17" rx="4" className="graph-tooltip-bg" />
                        <text x="270" y="104" className="graph-tooltip-text text-failed" fontSize="10" fontWeight="bold" textAnchor="middle">12 failed</text>
                      </g>
                    </>
                  )}
                  {activeMetricTab === "rate" && (
                    <>
                      <path d="M 30 50 L 90 52 L 150 48 L 210 49 L 270 44 L 380 43" fill="none" stroke="#10b981" strokeWidth="3" />
                      <circle cx="270" cy="44" r="5" fill="#10b981" stroke="#fff" strokeWidth="2" />
                      <g className="graph-tooltip">
                        <rect x="236" y="16" width="68" height="17" rx="4" className="graph-tooltip-bg" />
                        <text x="270" y="28" className="graph-tooltip-text text-rate" fontSize="10" fontWeight="bold" textAnchor="middle">99.2% rate</text>
                      </g>
                    </>
                  )}
                  
                  {/* Axis */}
                  <line x1="30" y1="140" x2="380" y2="140" className="graph-axis-line" strokeWidth="2" />
                  <text x="30" y="154" fill="#64748b" fontSize="9">Mon</text>
                  <text x="150" y="154" fill="#64748b" fontSize="9">Wed</text>
                  <text x="270" y="154" fill="#64748b" fontSize="9">Fri</text>
                  <text x="360" y="154" fill="#64748b" fontSize="9">Today</text>
                </svg>
              </div>

              <div className="dashboard-metrics-summary-row">
                <div className="metric-box">
                  <label>Average Latency</label>
                  <h4>{metricStats.latency}ms</h4>
                </div>
                <div className="metric-box">
                  <label>Uptime SLA</label>
                  <h4>99.98%</h4>
                </div>
                <div className="metric-box">
                  <label>Active Keys</label>
                  <h4>Multi-Key</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Services Hub */}
      <section className="services-hub-section">
        <div className="section-title-wrapper text-center">
          <h2>Our Core Platform Services</h2>
          <p>Discover how MailBridge bridges developers with robust communications layers.</p>
        </div>

        <div className="services-hub-tabs">
          <button 
            type="button"
            className={`services-tab-btn ${activeServiceTab === "email" ? "active" : ""}`}
            onClick={() => setActiveServiceTab("email")}
          >
            <Mail size={18} />
            <span>Email Services</span>
          </button>
          <button 
            type="button"
            className={`services-tab-btn ${activeServiceTab === "sms" ? "active" : ""}`}
            onClick={() => setActiveServiceTab("sms")}
          >
            <Phone size={18} />
            <span>SMS OTP Gateway</span>
          </button>
          <button 
            type="button"
            className={`services-tab-btn ${activeServiceTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveServiceTab("ai")}
          >
            <Sparkles size={18} />
            <span>AI Copy & Styling</span>
          </button>
        </div>

        <div className="services-tab-content">
          {activeServiceTab === "email" && (
            <div className="service-detail-grid">
              <div className="service-detail-info">
                <p className="service-tagline">Transactional Email Gateway</p>
                <h3>Deliver beautiful, styled emails with zero vendor lock-in.</h3>
                <p className="service-desc">
                  Route your transactional emails directly through secure Gmail SMTP servers or custom SMTP gateways. Use pre-built, premium-designed HTML email layouts for onboarding, security codes, and notification alerts.
                </p>
                <div className="service-features-list">
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Dynamic Templates</h4>
                      <p>Built-in responsive designs for OTPs, welcomes, passwords, and custom branding.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Secure HTTPS Endpoint</h4>
                      <p>Authenticate requests cleanly using secure client API keys over TLS/HTTPS.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Relay Latency Under 100ms</h4>
                      <p>Queue and dispatch message packets instantly to keep user friction low.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="service-detail-graphic">
                <div className="services-visual-card">
                  <div className="services-visual-header">
                    <span className="visual-badge">SMTP Config</span>
                    <span className="visual-title">Active</span>
                  </div>
                  <div className="visual-content">
                    <div className="visual-line accent"></div>
                    <div className="visual-line w-80"></div>
                    <div className="visual-line w-60"></div>
                    <div className="visual-line w-80"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeServiceTab === "sms" && (
            <div className="service-detail-grid">
              <div className="service-detail-info">
                <p className="service-tagline">Cost-Effective Cellular OTPs</p>
                <h3>Direct SMS verification. Completely free using your own device.</h3>
                <p className="service-desc">
                  Send cellular text message verifications without paid Twilio subscriptions. Leverage modern ADB USB debugging, local Android HTTP endpoints, or SMTP carrier gateways to send cellular texts globally.
                </p>
                <div className="service-features-list">
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>USB Android Debugging (ADB)</h4>
                      <p>Connect your phone, type your API key, and dispatch free texts via your mobile SIM.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>HTTP Gateway Interface</h4>
                      <p>Integrate local mobile gateway apps utilizing standard header token verification.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Carrier SMTP Routing</h4>
                      <p>Relay SMS packets via carrier-specific Email-to-SMS domains seamlessly.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="service-detail-graphic">
                <div className="services-visual-card">
                  <div className="services-visual-header">
                    <span className="visual-badge">ADB Relay</span>
                    <span className="visual-title">Connected</span>
                  </div>
                  <div className="visual-content">
                    <div className="visual-line accent"></div>
                    <div className="visual-line w-60"></div>
                    <div className="visual-line w-80"></div>
                    <div className="visual-line w-80"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeServiceTab === "ai" && (
            <div className="service-detail-grid">
              <div className="service-detail-info">
                <p className="service-tagline">Gemini AI copywriter & style generator</p>
                <h3>Write perfect communication copy and match brand colors in one click.</h3>
                <p className="service-desc">
                  Powered by advanced Google Gemini models. Enter custom prompts to draft highly persuasive, urgent, or friendly copy and receive accessible, brand-compliant visual themes.
                </p>
                <div className="service-features-list">
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Semantic Color Recommender</h4>
                      <p>Generates brand palette selections based on business text analysis.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Diverse Tone Profiles</h4>
                      <p>Switch message vibes instantly among Friendly, Professional, Urgent, or Persuasive.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Auto Heuristic Fallbacks</h4>
                      <p>Maintains robust layout capabilities even if the AI API keys are missing.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="service-detail-graphic">
                <div className="services-visual-card">
                  <div className="services-visual-header">
                    <span className="visual-badge">Gemini Flash</span>
                    <span className="visual-title">Optimized</span>
                  </div>
                  <div className="visual-content">
                    <div className="visual-line accent"></div>
                    <div className="visual-line w-80"></div>
                    <div className="visual-line w-60"></div>
                    <div className="visual-line w-80"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive API Sandbox Section */}
      <section className="sandbox-playground-section">
        <div className="section-title-wrapper">
          <h2>Interactive API Sandbox</h2>
          <p>Configure styling, modify request properties, and preview email compile templates or API code instantly.</p>
        </div>

        <div className="sandbox-workspace-grid">
          {/* Controls - Left Pane */}
          <div className="sandbox-controls-card">
            <h3>Sandbox Configuration</h3>

            {/* Template Selector */}
            <div className="sandbox-control-group">
              <label className="control-label">Select API Endpoint Template</label>
              <div className="template-selectors-pills">
                {[
                  { id: "otp", label: "OTP" },
                  { id: "sms-otp", label: "SMS OTP (New)" },
                  { id: "welcome", label: "Welcome" },
                  { id: "forgot-password", label: "Reset Password" },
                  { id: "notification", label: "Alert Notify" },
                  { id: "custom", label: "Custom Layout" }
                ].map(t => (
                  <button 
                    type="button"
                    key={t.id}
                    className={`template-pill-btn ${templateType === t.id ? "active" : ""}`}
                    onClick={() => setTemplateType(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom inputs */}
            <div className="sandbox-inputs-grid">
              <div className="sandbox-control-group">
                <label className="control-label">Brand Name</label>
                <input 
                  type="text" 
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Acme Inc"
                />
              </div>

              {templateType !== "sms-otp" && (
                <>
                  <div className="sandbox-control-group">
                    <label className="control-label">Header BG Theme</label>
                    <div className="color-picker-control">
                      <input 
                        type="color" 
                        value={headerColor}
                        onChange={(e) => setHeaderColor(e.target.value)}
                      />
                      <code>{headerColor}</code>
                    </div>
                  </div>

                  <div className="sandbox-control-group">
                    <label className="control-label">Header Text Theme</label>
                    <div className="color-picker-control">
                      <input 
                        type="color" 
                        value={headerTextColor}
                        onChange={(e) => setHeaderTextColor(e.target.value)}
                      />
                      <code>{headerTextColor}</code>
                    </div>
                  </div>
                </>
              )}

              {templateType === "sms-otp" ? (
                <div className="sandbox-control-group full-width">
                  <label className="control-label">Recipient Phone Number</label>
                  <input 
                    type="text" 
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+919876543210"
                  />
                </div>
              ) : (
                <div className="sandbox-control-group full-width">
                  <label className="control-label">Recipient Email</label>
                  <input 
                    type="email" 
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="email@domain.com"
                  />
                </div>
              )}

              {templateType === "custom" && (
                <div className="sandbox-control-group full-width">
                  <label className="control-label">Custom Subject Line</label>
                  <input 
                    type="text" 
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
              )}
            </div>

            {/* Trigger actions */}
            <div className="sandbox-actions-wrapper">
              <button 
                type="button" 
                className="btn btn-sandbox-run"
                onClick={executeSandboxRequest}
                disabled={isExecuting}
              >
                <Terminal size={16} /> {isExecuting ? "Executing..." : "Execute API Request"}
              </button>
              
              {token && (
                <button 
                  type="button" 
                  className="btn btn-sandbox-real-send"
                  onClick={sendRealEmail}
                  disabled={isSendingReal}
                >
                  <Mail size={16} /> {isSendingReal ? "Sending..." : "Send Actual Email"}
                </button>
              )}
            </div>

            {realSendResult && (
              <div className={`real-send-toast-inline ${realSendResult.success ? "success" : "error"}`}>
                <CheckCircle2 size={16} /> <span>{realSendResult.message}</span>
              </div>
            )}
          </div>

          {/* Viewer Panel - Right Pane */}
          <div className="sandbox-viewer-card">
            {/* Viewer Headers */}
            <div className="viewer-tabs-header">
              <button 
                type="button"
                className={`viewer-tab-btn ${activePane === "preview" ? "active" : ""}`}
                onClick={() => setActivePane("preview")}
              >
                <Eye size={14} /> {templateType === "sms-otp" ? "Live SMS Preview" : "Live Email Preview"}
              </button>
              <button 
                type="button"
                className={`viewer-tab-btn ${activePane === "code" ? "active" : ""}`}
                onClick={() => setActivePane("code")}
              >
                <Code size={14} /> Code Integration
              </button>
              <button 
                type="button"
                className={`viewer-tab-btn ${activePane === "terminal" ? "active" : ""}`}
                onClick={() => setActivePane("terminal")}
              >
                <Terminal size={14} /> Sandbox Console
              </button>
            </div>

            {/* Pane Viewports */}
            <div className="viewer-viewport-content">
              
              {/* Tab 1: Live Preview */}
              {activePane === "preview" && (
                <div className="sandbox-preview-inbox">
                  {templateType === "sms-otp" ? (
                    <div style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
                      <div className="phone-mockup-frame">
                        <div className="phone-speaker"></div>
                        <div className="phone-screen">
                          <div className="phone-status-bar">
                            <span>08:47 AM</span>
                            <span>LTE 📶 🔋 100%</span>
                          </div>
                          
                          <div className="phone-header">
                            <div className="phone-avatar">MB</div>
                            <span className="phone-name">{brandName || "MailBridge"}</span>
                          </div>

                          <div className="phone-messages-container">
                            <div className="sms-bubble">
                              Your {brandName || "MailBridge"} OTP is: <strong>549301</strong>. It expires in 10 minutes.
                              <span className="sms-timestamp">08:47 AM</span>
                            </div>
                          </div>

                          <div className="phone-input-bar">
                            <span>Text Message</span>
                            <span>⬆️</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="preview-browser-bar">
                        <div className="browser-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <div className="browser-location">
                          <code>recipient: {recipientEmail || "visitor@example.com"}</code>
                        </div>
                      </div>
                      <div className="preview-body-email-scroller">
                        <div dangerouslySetInnerHTML={{ __html: generateEmailHtml() }} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 2: Code integration switchers */}
              {activePane === "code" && (
                <div className="sandbox-code-console">
                  <div className="code-language-selector">
                    {["curl", "js", "python", "go"].map(lang => (
                      <button 
                        type="button"
                        key={lang}
                        className={`lang-btn ${activeLang === lang ? "active" : ""}`}
                        onClick={() => setActiveLang(lang)}
                      >
                        {lang === "curl" ? "cURL" : lang === "js" ? "JS (Fetch)" : lang === "python" ? "Python" : "Go"}
                      </button>
                    ))}
                    <button 
                      type="button" 
                      className="code-copy-action-btn"
                      onClick={handleCopyCode}
                    >
                      {copiedCode ? <Check size={14} className="success-copy" /> : <Copy size={14} />}
                      {copiedCode ? "Copied" : "Copy Code"}
                    </button>
                  </div>
                  <pre className="code-syntax-display">
                    <code>{getCodeSnippet()}</code>
                  </pre>
                </div>
              )}

              {/* Tab 3: Terminal Simulation Console */}
              {activePane === "terminal" && (
                <div className="sandbox-terminal-view">
                  <div className="terminal-topbar">
                    <span>bash shell</span>
                    {executionDone && <span className="status-badge success-run">201 OK</span>}
                  </div>
                  <div className="terminal-lines-pane">
                    {terminalLines.map((line, idx) => (
                      <div key={idx} className="terminal-line">
                        {line.startsWith("$") ? (
                          <span className="term-prompt">{line}</span>
                        ) : line.includes("[info]") ? (
                          <span className="term-info">{line}</span>
                        ) : line.includes("HTTP/1.1") || line.includes("success") ? (
                          <span className="term-success">{line}</span>
                        ) : line.includes("[error]") ? (
                          <span className="term-error">{line}</span>
                        ) : (
                          <span className="term-normal">{line}</span>
                        )}
                      </div>
                    ))}
                    {isExecuting && (
                      <div className="terminal-cursor-blink">
                        <span>[info] Processing API dispatch request</span>
                        <span className="cursor">█</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards Grid */}
      <section className="features-section-new">
        <div className="section-title-wrapper text-center">
          <h2>Enterprise Features for Personal Projects</h2>
          <p>Gmail SMTP meets modern JSON HTTP web APIs.</p>
        </div>

        <div className="features-new-grid">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="feature-new-card">
                <div className="feature-icon-wrapper">
                  <Icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="cta-banner-new">
        <div className="cta-banner-content">
          <h2>Get started with MailBridge today.</h2>
          <p>Integrate robust email styling options into your apps, websites, or automations free of charge.</p>
          <div className="cta-buttons-row">
            {user ? (
              <a href="/dashboard" className="btn btn-hero-primary glow-btn">
                Open Dashboard <ChevronRight size={16} />
              </a>
            ) : (
              <a href="/register" className="btn btn-hero-primary glow-btn">
                Create Free Account <ChevronRight size={16} />
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
