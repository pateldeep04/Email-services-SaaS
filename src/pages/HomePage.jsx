import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import {
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  Mail,
  Terminal,
  Code,
  Eye,
  ArrowRight,
  Copy,
  ChevronRight,
  ChevronDown,
  Check,
  Phone,
  Cpu,
  FileSpreadsheet,
  Flame,
  Clock,
  Target,
  Users,
  Send,
  Layers,
  TrendingUp,
  FileCheck,
  X,
  HelpCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../config.js";
import { useSEO } from "../hooks/useSEO.js";

const features = [
  { 
    icon: FileSpreadsheet, 
    title: "Personalized Bulk Mailer", 
    desc: "Import CSV or Excel files with unlimited custom columns and inject dynamic {{firstname}} and {{company}} tags seamlessly." 
  },
  { 
    icon: Target, 
    title: "Real-Time Lead Qualification", 
    desc: "Automatically categorize outreach prospects into Hot Leads (clicked CTA), Warm Leads (opened), and Cold Leads (unopened)." 
  },
  { 
    icon: Zap, 
    title: "Zero Paid Vendor Overhead", 
    desc: "Use your existing Gmail SMTP credentials as your high-deliverability transactional & bulk email relay with $0 vendor markup." 
  },
  { 
    icon: Shield, 
    title: "Hardened API Authentication", 
    desc: "Generate secure, scoped API keys to authenticate transactional email and SMS requests instantly over HTTPS." 
  },
  { 
    icon: BarChart3, 
    title: "Precision Live Analytics", 
    desc: "Monitor email open rates, CTA conversion metrics, delivery throughput, and recipient latency in real-time." 
  },
  {
    icon: Phone,
    title: "Multi-Mode SMS Gateway",
    desc: "Dispatch phone OTP verifications using direct Android USB ADB debugging, local HTTP mobile relays, or carrier SMTP gateways."
  },
  {
    icon: Sparkles,
    title: "Gemini AI Copy & Styling",
    desc: "Generate high-converting cold outreach copy and brand-compliant visual color themes automatically with Google Gemini AI."
  },
  {
    icon: Cpu,
    title: "Sandbox & Emulator Mode",
    desc: "Built-in in-memory database and test suites to prototype and develop locally without consuming email or SMS quotas."
  }
];

// Interactive FAQ Data for Google Search Rich Snippets & Accordion
const FAQ_ITEMS = [
  {
    question: "Can I send personalized cold outreach campaigns using my Gmail account?",
    answer: "Yes! MailBridge allows you to upload any CSV or Excel (.xlsx) spreadsheet, map custom lead columns (such as {{firstname}}, {{company}}, or {{role}}), and dispatch personalized bulk emails directly through your secure Gmail SMTP server. Zero expensive monthly subscriptions to Apollo, Instantly, or Mailshake required."
  },
  {
    question: "How does the real-time email open and CTA link tracking work?",
    answer: "Every bulk email includes a transparent, zero-latency 1x1 tracking pixel and personalized tracked redirect URLs. When a prospect opens your email or clicks your Call-to-Action button, MailBridge logs the event instantly and tags the lead as 'Hot' (Clicked CTA), 'Warm' (Opened), or 'Cold' (Unopened) on your live pipeline dashboard."
  },
  {
    question: "Is MailBridge completely free for transactional email and SMS?",
    answer: "Yes, 100% free! Traditional providers like SendGrid or Mailgun charge $35 to $90+ per month with strict tier limits. MailBridge eliminates vendor fees by utilizing your own Gmail SMTP relay and direct Android ADB or carrier SMS relays for OTP verifications."
  },
  {
    question: "What are the sending limits when using Gmail SMTP?",
    answer: "Standard free Gmail accounts support up to 500 emails per 24-hour rolling window, while Google Workspace (custom domain) accounts support up to 2,000 emails per day. MailBridge includes built-in throttles (150ms delay between dispatches) to protect your inbox reputation and avoid spam filters."
  },
  {
    question: "What developer APIs and integration languages are supported?",
    answer: "MailBridge exposes standard RESTful JSON HTTPS endpoints for OTP verifications, password resets, welcome emails, custom notification layouts, carrier SMS, and campaign dispatches. We provide instant code snippets for cURL, Node.js (Fetch/Axios), Python (Requests), and Go."
  }
];

export function HomePage() {
  const { user, token } = useAuth();
  
  useSEO({
    title: "MailBridge | Free Transactional Email API & Bulk Cold Outreach SaaS",
    description: "MailBridge is a free, all-in-one email platform: send transactional OTPs via REST APIs, or upload spreadsheets for personalized cold email campaigns with live open tracking and lead qualification via Gmail SMTP.",
    keywords: "bulk mailer saas, cold email outreach, free email api, transactional email api, gmail smtp relay, lead tracking pipeline, csv email sender, excel mail merge, free sms gateway, otp verification, developer email service, mailbridge"
  });
  
  // Hero Visual Mode: "pipeline" (Cold Outreach) vs "metrics" (Transactional API)
  const [heroTab, setHeroTab] = useState("pipeline");

  // Interactive Lead Outreach Preview State
  const [demoLeadIndex, setDemoLeadIndex] = useState(0);
  const sampleLeads = [
    {
      firstname: "Sarah",
      lastname: "Jenkins",
      company: "Acme Corp",
      role: "VP of Growth",
      email: "sarah.j@acmecorp.com",
      status: "hot",
      opens: 4,
      clicks: 2,
      lastActive: "3 mins ago"
    },
    {
      firstname: "Michael",
      lastname: "Chang",
      company: "TechStart IO",
      role: "Founder & CEO",
      email: "m.chang@techstart.io",
      status: "warm",
      opens: 2,
      clicks: 0,
      lastActive: "18 mins ago"
    },
    {
      firstname: "Emily",
      lastname: "Rodriguez",
      company: "Global Ventures",
      role: "Head of Marketing",
      email: "emily@globalventures.com",
      status: "cold",
      opens: 0,
      clicks: 0,
      lastActive: "Dispatched"
    }
  ];

  // Interactive Services Hub Tab State
  const [activeServiceTab, setActiveServiceTab] = useState("bulk"); // "bulk" | "email" | "sms" | "ai"

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
  
  // Terminal Simulation State
  const [terminalLines, setTerminalLines] = useState([
    "// Interactive Sandbox Terminal. Click 'Execute API Request' to test."
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionDone, setExecutionDone] = useState(false);
  
  // Real sending state (for logged-in users)
  const [isSendingReal, setIsSendingReal] = useState(false);
  const [realSendResult, setRealSendResult] = useState(null);

  // FAQ Accordion Toggle State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Pre-fill recipient email if user is logged in
  useEffect(() => {
    if (user && user.email) {
      setRecipientEmail(user.email);
    } else {
      setRecipientEmail("visitor@example.com");
    }
  }, [user]);

  // Handle Dynamic Code Generation for Sandbox
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
      return `package main\n\nimport (\n\t"bytes"\n\t"encoding/json"\n\t"fmt"\n\t"net/http"\n)\n\nfunc main() {\n\turl := "${endpoint}"\n\tpayload := map[string]interface{}{\n\t\t"to": "${payload.to}",\n\t}\n\tjsonData, _ := json.Marshal(payload)\n\n\treq, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))\n\treq.Header.Set("Content-Type", "application/json")\n\treq.Header.Set("x-api-key", "mb_live_8f0a213e4b...")\n\n\tclient := &http.Client{}\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\tfmt.Println("Status Code:", resp.StatusCode)\n}`;
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
      titleText = `Welcome to ${brand}!`;
      bodyContent = `Hi John Doe,\n\nWe are absolutely thrilled to welcome you to ${brand}. Get ready to streamline your workflow and start closing more deals today.`;
      buttonHtml = `<div style="text-align: center; margin: 30px 0;"><a href="https://acme.com" target="_blank" style="background-color: ${btnBg}; color: ${textMainColor}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Explore Workspace</a></div>`;
    } else if (templateType === "forgot-password") {
      titleText = "Reset Your Password";
      bodyContent = `A request was made to reset your password. If you did not make this request, you can safely ignore this email. Otherwise, click below to update your credentials.`;
      buttonHtml = `<div style="text-align: center; margin: 30px 0;"><a href="https://acme.com/reset" target="_blank" style="background-color: ${btnBg}; color: ${textMainColor}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Set New Password</a></div>`;
    } else if (templateType === "notification") {
      titleText = `${brand} Security Alert`;
      bodyContent = `Important update regarding your account security:\n\nA new login attempt was detected from a Chrome browser on a Linux client. If this wasn't you, please secure your API keys immediately.`;
      buttonHtml = `<div style="text-align: center; margin: 30px 0;"><a href="https://acme.com/security" target="_blank" style="background-color: ${btnBg}; color: ${textMainColor}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Review Active Sessions</a></div>`;
    } else if (templateType === "custom") {
      titleText = customSubject || "Branded Email";
      bodyContent = `Hello! This is a fully customizable responsive email layout rendering dynamic template variables. Customize branding colors, headers, and Call-to-Action button links.`;
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
        `[info] Resolving recipient phone: ${recipientPhone || "+919876543210"}...`,
        `[info] Delivery Mode Detected: "USB ADB Debugging" (Free local routing)`,
      ];
      setTerminalLines(lines);

      setTimeout(() => {
        setTerminalLines(prev => [
          ...prev,
          `[info] Triggering local ADB cellular packet relay...`,
          `HTTP/1.1 201 Created`,
          `Content-Type: application/json`,
          `Response Payload:`,
          JSON.stringify({
            success: true,
            status: "delivered",
            messageId: "sms-relayed-" + Date.now(),
            note: "SMS dispatched successfully over simulated local ADB cellular gateway."
          }, null, 2)
        ]);
        setIsExecuting(false);
        setExecutionDone(true);
      }, 1200);
      return;
    }

    const lines = [
      `$ curl -X POST "${API_URL}/api/v1/emails/${templateType}" \\`,
      `    -H "x-api-key: mb_live_8f0a213e4b..." \\`,
      `    -d '${JSON.stringify(getPayload())}'`,
      `[info] Resolving recipient: ${recipientEmail || "visitor@example.com"}...`,
      `[info] Compiling HTML template payload with dynamic CSS...`,
      `[info] Authenticating Gmail SMTP TLS session...`,
    ];
    setTerminalLines(lines);

    setTimeout(() => {
      setTerminalLines(prev => [
        ...prev,
        `[info] SMTP Auth: 250-AUTH LOGIN successful`,
        `[info] Transmission: Email queued & sent via TLS relay (< 90ms)`,
        `HTTP/1.1 201 Created`,
        `Content-Type: application/json`,
        `Response Payload:`,
        JSON.stringify({
          success: true,
          status: "sent",
          messageId: "<MB_" + Math.random().toString(36).substring(2, 10) + "@mailbridge.email>",
          note: "Email delivered successfully via Gmail SMTP relay."
        }, null, 2)
      ]);
      setIsExecuting(false);
      setExecutionDone(true);
    }, 1400);
  };

  // Send real email through logged-in API Key (if authenticated)
  const sendRealEmail = async () => {
    if (!token) return;
    setIsSendingReal(true);
    setRealSendResult(null);
    setActivePane("terminal");
    setTerminalLines([`[info] Dispatching REAL API request to local server...`]);

    try {
      const activeKeyRes = await fetch(`${API_URL}/api/v1/auth/keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const keyData = await activeKeyRes.json();
      const keysList = keyData.keys || [];
      if (keysList.length === 0) {
        throw new Error("No active API Key found in your account. Please generate one in the Dashboard.");
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
      {/* Complete SEO JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://mail-bridge.email/#organization",
              "name": "MailBridge",
              "url": "https://mail-bridge.email/",
              "logo": "https://mail-bridge.email/logo.svg",
              "sameAs": ["https://github.com/pateldeep04/Email-services-SaaS"]
            },
            {
              "@type": "SoftwareApplication",
              "@id": "https://mail-bridge.email/#application",
              "name": "MailBridge",
              "applicationCategory": "BusinessApplication, MarketingApplication, DeveloperApplication",
              "operatingSystem": "All",
              "description": "All-in-one free transactional email API and cold outreach bulk mailer SaaS with live open tracking and Gmail SMTP relay.",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Personalized Bulk Email Campaigns (CSV & Excel)",
                "Real-time Email Open & CTA Click Tracking",
                "Qualified Lead Generation Pipeline (Hot/Warm/Cold Segments)",
                "Zero-Fee Gmail SMTP Relay",
                "Developer REST API for Transactional OTPs & Alerts",
                "Free Direct Carrier SMS Gateway"
              ]
            },
            {
              "@type": "FAQPage",
              "@id": "https://mail-bridge.email/#faq",
              "mainEntity": FAQ_ITEMS.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer
                }
              }))
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://mail-bridge.email/#breadcrumb",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://mail-bridge.email/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Bulk Mailer",
                  "item": "https://mail-bridge.email/bulk-mail"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Documentation",
                  "item": "https://mail-bridge.email/docs"
                }
              ]
            }
          ]
        })}
      </script>

      {/* Atmospheric Ambient Mesh Background */}
      <div className="mesh-gradient-container" aria-hidden="true">
        <div className="mesh-circle circle-1"></div>
        <div className="mesh-circle circle-2"></div>
        <div className="mesh-circle circle-3"></div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (DUAL PROPOSITION: BULK OUTREACH + TRANSACTIONAL API)     */}
      {/* ========================================================================= */}
      <header className="hero-section-new">
        <div className="hero-grid">
          <div className="hero-left-content">
            {/* Feature Announcement Badge */}
            <div className="hero-badge-pill">
              <span className="badge-spark-indicator"></span>
              <Sparkles size={14} className="badge-spark" />
              <span>NEW: Personalized Bulk Mailer &amp; Lead Tracker</span>
            </div>

            <h1 className="hero-title">
              Cold Email Outreach &amp; Developer APIs. <br />
              <span className="hero-title-highlight">Zero Vendor Fees.</span>
            </h1>

            <p className="hero-desc-text">
              Run personalized cold outreach campaigns from CSV or Excel spreadsheets with real-time open and CTA tracking — or trigger instantaneous transactional OTPs and system alerts over a unified HTTPS API. Powered by your own secure Gmail SMTP server.
            </p>
            
            <div className="hero-cta-buttons">
              <Link to="/bulk-mail" className="btn btn-hero-primary glow-btn">
                <FileSpreadsheet size={18} /> Launch Bulk Mailer
              </Link>
              {user ? (
                <Link to="/dashboard" className="btn btn-hero-secondary">
                  Open Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <Link to="/register" className="btn btn-hero-secondary">
                  Create Free Account <ArrowRight size={16} />
                </Link>
              )}
              <Link to="/docs" className="btn-hero-text-link">
                API Docs &amp; SDKs <ChevronRight size={15} />
              </Link>
            </div>

            {/* Micro Trust Stats */}
            <div className="hero-stats-row">
              <div className="stat-pill">
                <strong>$0/mo</strong> Zero Markup
              </div>
              <div className="stat-pill">
                <strong>CSV &amp; XLSX</strong> Auto-Mapped
              </div>
              <div className="stat-pill">
                <strong>Live Leads</strong> Hot/Warm/Cold
              </div>
              <div className="stat-pill">
                <strong>&lt; 90ms</strong> API Latency
              </div>
            </div>
          </div>

          {/* Hero Right: Dual-Mode Interactive Showcase Visual */}
          <div className="hero-right-dashboard">
            <div className="premium-dashboard-card">
              {/* Card Switcher Header */}
              <div className="dashboard-card-topbar">
                <div className="dashboard-view-toggle">
                  <button 
                    type="button"
                    className={`view-toggle-btn ${heroTab === "pipeline" ? "active" : ""}`}
                    onClick={() => setHeroTab("pipeline")}
                  >
                    <Target size={14} /> Cold Lead Pipeline
                  </button>
                  <button 
                    type="button"
                    className={`view-toggle-btn ${heroTab === "metrics" ? "active" : ""}`}
                    onClick={() => setHeroTab("metrics")}
                  >
                    <BarChart3 size={14} /> API Metrics
                  </button>
                </div>
                <div className="live-indicator-tag">
                  <span className="live-pulsing-dot"></span> LIVE
                </div>
              </div>

              {/* View 1: Cold Outreach & Lead Qualification Pipeline */}
              {heroTab === "pipeline" && (
                <div className="hero-pipeline-preview">
                  <div className="hero-pipeline-stats-grid">
                    <div className="h-pipe-stat">
                      <span className="h-stat-label">Total Targeted</span>
                      <strong className="h-stat-val">250 Leads</strong>
                      <span className="h-stat-sub">From CSV Import</span>
                    </div>
                    <div className="h-pipe-stat warm">
                      <span className="h-stat-label">Warm Leads</span>
                      <strong className="h-stat-val text-emerald-400">148 Opens</strong>
                      <span className="h-stat-sub">59.2% Open Rate</span>
                    </div>
                    <div className="h-pipe-stat hot">
                      <span className="h-stat-label">🔥 Hot Leads</span>
                      <strong className="h-stat-val text-orange-400">32 Clicks</strong>
                      <span className="h-stat-sub">21.6% CTA Rate</span>
                    </div>
                  </div>

                  {/* Hot Prospect Highlight Card */}
                  <div className="hot-lead-feature-box">
                    <div className="hot-lead-header">
                      <div className="lead-avatar">SJ</div>
                      <div>
                        <div className="lead-name">Sarah Jenkins</div>
                        <div className="lead-meta">VP Growth • Acme Corp</div>
                      </div>
                      <span className="badge-hot-glow">
                        <Flame size={12} /> Hot Lead (Clicked CTA)
                      </span>
                    </div>
                    <div className="lead-activity-row">
                      <span>Interactions: <strong>4 Opens, 2 CTA Clicks</strong></span>
                      <span className="text-emerald-400 font-semibold">Ready for 1-on-1 closing</span>
                    </div>
                    <div className="lead-actions-bar">
                      <span className="quick-action-pill">
                        <Mail size={12} /> Direct Follow-up
                      </span>
                      <span className="quick-action-pill">
                        <CheckCircle2 size={12} /> Verified Delivery
                      </span>
                      <span className="quick-action-pill">
                        <Clock size={12} /> 3m ago
                      </span>
                    </div>
                  </div>

                  <div className="pipeline-cta-footnote">
                    <span>Includes zero-latency tracking pixel &amp; dynamic link redirection</span>
                  </div>
                </div>
              )}

              {/* View 2: Transactional API Performance */}
              {heroTab === "metrics" && (
                <div className="hero-metrics-preview">
                  <div className="hero-metric-boxes">
                    <div className="hero-metric-card">
                      <div className="h-metric-top">
                        <span className="h-metric-label">Uptime SLA</span>
                        <span className="h-metric-pill live">99.98%</span>
                      </div>
                      <div className="h-metric-value text-emerald-400">99.98%</div>
                      <span className="h-metric-sub">Zero downtime</span>
                    </div>
                    <div className="hero-metric-card">
                      <div className="h-metric-top">
                        <span className="h-metric-label">Relay Latency</span>
                        <span className="h-metric-pill fast">&lt;100ms</span>
                      </div>
                      <div className="h-metric-value text-teal-400">78ms</div>
                      <span className="h-metric-sub">TLS 1.3 direct</span>
                    </div>
                    <div className="hero-metric-card">
                      <div className="h-metric-top">
                        <span className="h-metric-label">Delivery Rate</span>
                        <span className="h-metric-pill opt">Optimal</span>
                      </div>
                      <div className="h-metric-value text-cyan-400">99.4%</div>
                      <span className="h-metric-sub">Inbox verified</span>
                    </div>
                  </div>

                  {/* Graphic Chart Simulation */}
                  <div className="dashboard-graphic-wrapper">
                    <div className="graph-header-meta">
                      <span>Throughput &amp; Response Times</span>
                      <span className="graph-status-badge">⚡ Real-time</span>
                    </div>
                    <svg className="dashboard-svg-graph" viewBox="0 0 400 130" aria-label="API Delivery graph">
                      <defs>
                        <linearGradient id="hero-gradient-area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="20" y1="20" x2="380" y2="20" className="graph-grid-line" strokeDasharray="3 3" />
                      <line x1="20" y1="55" x2="380" y2="55" className="graph-grid-line" strokeDasharray="3 3" />
                      <line x1="20" y1="90" x2="380" y2="90" className="graph-grid-line" strokeDasharray="3 3" />
                      
                      <path d="M 20 80 Q 80 45, 140 65 T 260 25 T 380 18 L 380 100 L 20 100 Z" fill="url(#hero-gradient-area)" />
                      <path d="M 20 80 Q 80 45, 140 65 T 260 25 T 380 18" fill="none" stroke="#14b8a6" strokeWidth="3" />
                      
                      <circle cx="260" cy="25" r="5" fill="#14b8a6" stroke="#ffffff" strokeWidth="2" />
                      
                      {/* Tooltip on active point */}
                      <g className="graph-tooltip">
                        <rect x="226" y="2" width="68" height="17" rx="4" className="graph-tooltip-bg" />
                        <text x="260" y="14" className="graph-tooltip-text text-sent" fontSize="10" fontWeight="bold" textAnchor="middle">78ms • 99.4%</text>
                      </g>

                      {/* Timeline labels */}
                      <line x1="20" y1="102" x2="380" y2="102" className="graph-axis-line" strokeWidth="1" />
                      <text x="25" y="118" fill="#64748b" fontSize="9">00:00</text>
                      <text x="140" y="118" fill="#64748b" fontSize="9">08:00</text>
                      <text x="255" y="118" fill="#64748b" fontSize="9">16:00</text>
                      <text x="355" y="118" fill="#64748b" fontSize="9">Now</text>
                    </svg>
                  </div>
                  
                  <div className="api-endpoint-badge">
                    <span className="status-dot green"></span>
                    <code>POST /api/v1/emails/otp</code>
                    <span className="badge-sep">•</span>
                    <span className="status-pill success">201 Created</span>
                    <span className="badge-sep">•</span>
                    <span>TLS 1.3 Relay</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SHOWCASE: THE ALL-NEW BULK MAILER & LEAD OUTREACH ENGINE (FEATURE SPOTLIGHT) */}
      {/* ========================================================================= */}
      <section className="feature-spotlight-section">
        <div className="spotlight-container">
          <div className="section-title-wrapper text-center">
            <span className="section-eyebrow">
              <Flame size={14} className="text-orange-400" />
              High-Converting Cold Email Engine
            </span>
            <h2 className="section-main-heading">
              Turn Any CSV Spreadsheet Into High-Yield Sales Opportunities
            </h2>
            <p className="section-sub-heading">
              MailBridge bridges your contact spreadsheets with personal Gmail SMTP delivery, dynamic personalization variables, and instant lead scoring.
            </p>
          </div>

          {/* 4-Step Visual Workflow Grid */}
          <div className="spotlight-steps-grid">
            <div className="spotlight-step-card">
              <div className="step-num-badge">01</div>
              <div className="step-icon-circle">
                <FileSpreadsheet size={24} />
              </div>
              <h3>1-Click CSV/Excel Ingestion</h3>
              <p>
                Drag and drop your contact spreadsheet. MailBridge parses unlimited custom headers like <code>firstname</code>, <code>company</code>, <code>role</code>, and <code>city</code> automatically.
              </p>
            </div>

            <div className="spotlight-step-card">
              <div className="step-num-badge">02</div>
              <div className="step-icon-circle">
                <Layers size={24} />
              </div>
              <h3>Dynamic Merge Variables</h3>
              <p>
                Personalize every single dispatch with <code>&#123;&#123;firstname&#125;&#125;</code> and <code>&#123;&#123;company&#125;&#125;</code>. Every prospect receives a 100% human, customized email.
              </p>
            </div>

            <div className="spotlight-step-card">
              <div className="step-num-badge">03</div>
              <div className="step-icon-circle">
                <Target size={24} />
              </div>
              <h3>Zero-Latency Lead Tracking</h3>
              <p>
                Our built-in pixel and link tracker categorize responses instantly into <strong>Hot Leads</strong> (clicked CTA), <strong>Warm Leads</strong> (opened), and <strong>Cold</strong>.
              </p>
            </div>

            <div className="spotlight-step-card">
              <div className="step-num-badge">04</div>
              <div className="step-icon-circle">
                <TrendingUp size={24} />
              </div>
              <h3>Instant 1-on-1 Sales Follow-Up</h3>
              <p>
                Trigger personalized 1-on-1 follow-ups with 1 click directly from the lead table, or export the qualified pipeline to CSV for your sales CRM.
              </p>
            </div>
          </div>

          {/* Interactive Live Cold Outreach Lead Pipeline Simulator */}
          <div className="interactive-pipeline-demo">
            <div className="pipeline-demo-header">
              <div>
                <span className="demo-tag">INTERACTIVE PREVIEW</span>
                <h3 className="demo-title">Live Lead Pipeline &amp; Personalization Engine</h3>
              </div>
              <div className="demo-lead-pills">
                {sampleLeads.map((lead, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`demo-lead-pill ${demoLeadIndex === idx ? "active" : ""}`}
                    onClick={() => setDemoLeadIndex(idx)}
                  >
                    {lead.status === "hot" ? "🔥" : lead.status === "warm" ? "👁️" : "❄️"} {lead.firstname} ({lead.company})
                  </button>
                ))}
              </div>
            </div>

            <div className="pipeline-demo-body">
              {/* Left: Rendered Personalized Email Preview */}
              <div className="demo-email-preview">
                <div className="demo-email-bar">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                  <span className="bar-title">To: {sampleLeads[demoLeadIndex].email}</span>
                </div>
                <div className="demo-email-content">
                  <div className="email-meta-header">
                    <div><strong>Subject:</strong> Scaling outreach for {sampleLeads[demoLeadIndex].company}</div>
                    <div><strong>From:</strong> Growth Team &lt;you@gmail.com&gt;</div>
                  </div>
                  <div className="email-letter-body">
                    <p>Hi <strong>{sampleLeads[demoLeadIndex].firstname}</strong>,</p>
                    <p>
                      We noticed your team’s recent milestones at <strong>{sampleLeads[demoLeadIndex].company}</strong> and wanted to share how other {sampleLeads[demoLeadIndex].role || "leaders"} are increasing qualified lead conversion with zero paid software lock-in.
                    </p>
                    <p>Would you have 10 minutes next Tuesday for a quick walkthrough?</p>
                    <div className="demo-cta-btn-wrapper">
                      <span className="demo-cta-button">
                        Book a 15-Min Demo with {sampleLeads[demoLeadIndex].firstname} →
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Live Qualification Card */}
              <div className="demo-lead-card">
                <div className="lead-card-status-bar">
                  <span className="lead-card-label">Real-Time Qualification</span>
                  {sampleLeads[demoLeadIndex].status === "hot" && (
                    <span className="badge-status-hot">🔥 Hot Lead (CTA Clicked)</span>
                  )}
                  {sampleLeads[demoLeadIndex].status === "warm" && (
                    <span className="badge-status-warm">👁️ Warm Lead (Opened)</span>
                  )}
                  {sampleLeads[demoLeadIndex].status === "cold" && (
                    <span className="badge-status-cold">❄️ Cold Lead (Unopened)</span>
                  )}
                </div>

                <div className="lead-card-profile">
                  <h4>{sampleLeads[demoLeadIndex].firstname} {sampleLeads[demoLeadIndex].lastname}</h4>
                  <p className="lead-role">{sampleLeads[demoLeadIndex].role} • {sampleLeads[demoLeadIndex].company}</p>
                  <p className="lead-email">{sampleLeads[demoLeadIndex].email}</p>
                </div>

                <div className="lead-metrics-row">
                  <div className="lead-m-item">
                    <span>Email Opens</span>
                    <strong>{sampleLeads[demoLeadIndex].opens}</strong>
                  </div>
                  <div className="lead-m-item">
                    <span>CTA Link Clicks</span>
                    <strong className={sampleLeads[demoLeadIndex].clicks > 0 ? "text-orange-400" : ""}>
                      {sampleLeads[demoLeadIndex].clicks}
                    </strong>
                  </div>
                  <div className="lead-m-item">
                    <span>Last Activity</span>
                    <strong>{sampleLeads[demoLeadIndex].lastActive}</strong>
                  </div>
                </div>

                <div className="lead-action-buttons">
                  <Link to="/bulk-mail" className="btn btn-demo-action">
                    Launch Campaign in Bulk Mailer <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE PLATFORM SERVICES HUB (4 PILLARS)                                 */}
      {/* ========================================================================= */}
      <section className="services-hub-section">
        <div className="section-title-wrapper text-center">
          <span className="section-eyebrow">Platform Capabilities</span>
          <h2 className="section-main-heading">One Unified Infrastructure for Every Email Need</h2>
          <p className="section-sub-heading">From mass cold outreach campaigns to high-security transactional OTP relays.</p>
        </div>

        <div className="services-hub-tabs">
          <button 
            type="button"
            className={`services-tab-btn ${activeServiceTab === "bulk" ? "active" : ""}`}
            onClick={() => setActiveServiceTab("bulk")}
          >
            <FileSpreadsheet size={18} />
            <span>Bulk Mailer &amp; Leads</span>
          </button>
          <button 
            type="button"
            className={`services-tab-btn ${activeServiceTab === "email" ? "active" : ""}`}
            onClick={() => setActiveServiceTab("email")}
          >
            <Mail size={18} />
            <span>Transactional Email API</span>
          </button>
          <button 
            type="button"
            className={`services-tab-btn ${activeServiceTab === "sms" ? "active" : ""}`}
            onClick={() => setActiveServiceTab("sms")}
          >
            <Phone size={18} />
            <span>Free SMS OTP Gateway</span>
          </button>
          <button 
            type="button"
            className={`services-tab-btn ${activeServiceTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveServiceTab("ai")}
          >
            <Sparkles size={18} />
            <span>Gemini AI Copy Engine</span>
          </button>
        </div>

        <div className="services-tab-content">
          {/* Service 1: Bulk Mailer */}
          {activeServiceTab === "bulk" && (
            <div className="service-detail-grid">
              <div className="service-detail-info">
                <p className="service-tagline">Personalized Cold Outreach</p>
                <h3>Scale outbound lead generation without paying $90/mo tool subscriptions.</h3>
                <p className="service-desc">
                  Upload contact CSVs or Excel workbooks, map custom spreadsheet headers, and relay personalized cold outreach emails through your own Google Workspace or Gmail SMTP. Built-in rate limiting and anti-spam delays protect your domain reputation.
                </p>
                <div className="service-features-list">
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Dynamic Personalization Tags</h4>
                      <p>Inject <code>&#123;&#123;firstname&#125;&#125;</code>, <code>&#123;&#123;company&#125;&#125;</code>, and custom fields in subject &amp; body.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Real-Time Open &amp; Click Tracking</h4>
                      <p>Zero-latency tracking pixel and link redirection segregate hot prospects automatically.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>1-Click Follow-Up &amp; Export</h4>
                      <p>Send personalized 1-on-1 replies or download qualified lead spreadsheets instantly.</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "24px" }}>
                  <Link to="/bulk-mail" className="btn btn-hero-primary glow-btn">
                    Open Bulk Mailer <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="service-detail-graphic">
                <div className="services-visual-card">
                  <div className="services-visual-header">
                    <span className="visual-badge">CSV Outreach</span>
                    <span className="visual-title">Campaign Active</span>
                  </div>
                  <div className="visual-content">
                    <div className="visual-stat-line">
                      <span>Delivered:</span>
                      <strong className="text-emerald-400">100%</strong>
                    </div>
                    <div className="visual-stat-line">
                      <span>Unique Opens:</span>
                      <strong className="text-emerald-400">59.2%</strong>
                    </div>
                    <div className="visual-stat-line">
                      <span>CTA Clicks:</span>
                      <strong className="text-orange-400">21.6% (Hot)</strong>
                    </div>
                    <div className="visual-line accent"></div>
                    <div className="visual-line w-80"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service 2: Transactional Email */}
          {activeServiceTab === "email" && (
            <div className="service-detail-grid">
              <div className="service-detail-info">
                <p className="service-tagline">Transactional Email Gateway</p>
                <h3>Deliver beautiful, styled system emails with zero vendor lock-in.</h3>
                <p className="service-desc">
                  Route transactional system emails directly through secure Gmail SMTP servers. Use pre-built, responsive HTML email layouts for onboarding, security codes, and notification alerts.
                </p>
                <div className="service-features-list">
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Pre-Built Dynamic Templates</h4>
                      <p>Responsive designs for OTPs, welcomes, password resets, and custom layouts.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Secure HTTPS REST Endpoints</h4>
                      <p>Authenticate requests cleanly using client API keys over TLS/HTTPS.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Sub-100ms API Latency</h4>
                      <p>Queue and dispatch message packets instantly to keep user friction low.</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "24px" }}>
                  <Link to="/docs" className="btn btn-hero-secondary">
                    View Email API Docs <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="service-detail-graphic">
                <div className="services-visual-card">
                  <div className="services-visual-header">
                    <span className="visual-badge">Gmail SMTP Relay</span>
                    <span className="visual-title">Connected</span>
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

          {/* Service 3: SMS Gateway */}
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
                      <h4>Carrier Email-to-SMS Routing</h4>
                      <p>Relay SMS packets via carrier-specific Email-to-SMS domains seamlessly.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <CheckCircle2 className="feature-check-icon" size={18} />
                    <div>
                      <h4>Direct HTTP Gateway Interface</h4>
                      <p>Integrate local mobile gateway apps utilizing standard header token verification.</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "24px" }}>
                  <Link to="/tester" className="btn btn-hero-secondary">
                    Try SMS Tester <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="service-detail-graphic">
                <div className="services-visual-card">
                  <div className="services-visual-header">
                    <span className="visual-badge">ADB Relay</span>
                    <span className="visual-title">Cellular Online</span>
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

          {/* Service 4: Gemini AI Copywriting */}
          {activeServiceTab === "ai" && (
            <div className="service-detail-grid">
              <div className="service-detail-info">
                <p className="service-tagline">Gemini AI Copywriter &amp; Style Engine</p>
                <h3>Write persuasive cold emails and brand styling in one click.</h3>
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
                      <h4>Robust Fallback Heuristics</h4>
                      <p>Maintains reliable layout capabilities even without external AI keys.</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "24px" }}>
                  <Link to="/dashboard" className="btn btn-hero-secondary">
                    Try AI Generator <ArrowRight size={16} />
                  </Link>
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

      {/* ========================================================================= */}
      {/* 4. COMPARISON MATRIX: MAILBRIDGE VS EXPENSIVE TRADITIONAL SERVICES         */}
      {/* ========================================================================= */}
      <section className="comparison-section">
        <div className="section-title-wrapper text-center">
          <span className="section-eyebrow">Clear Economics</span>
          <h2 className="section-main-heading">Why Modern Builders Choose MailBridge</h2>
          <p className="section-sub-heading">Stop paying exorbitant vendor fees for basic email routing and cold outreach.</p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Capability / Feature</th>
                <th className="highlight-col">MailBridge</th>
                <th>SendGrid / Mailgun</th>
                <th>Apollo / Instantly</th>
                <th>Twilio SMS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Monthly Cost</strong></td>
                <td className="highlight-col text-emerald-400 font-bold">$0.00 / month</td>
                <td>$35 - $90 / mo</td>
                <td>$49 - $120 / mo</td>
                <td>$0.0079 per SMS</td>
              </tr>
              <tr>
                <td><strong>Personalized Bulk Mailer</strong></td>
                <td className="highlight-col text-emerald-400 font-semibold">Included (CSV &amp; Excel)</td>
                <td>Add-on / Extra fee</td>
                <td>Included</td>
                <td>Not supported</td>
              </tr>
              <tr>
                <td><strong>Real-Time Open &amp; CTA Tracking</strong></td>
                <td className="highlight-col text-emerald-400 font-semibold">Built-in (Hot/Warm/Cold)</td>
                <td>Basic webhooks</td>
                <td>Basic clicks</td>
                <td>Not supported</td>
              </tr>
              <tr>
                <td><strong>Setup Time</strong></td>
                <td className="highlight-col text-emerald-400 font-semibold">2 Minutes</td>
                <td>DNS/Domain ordeal</td>
                <td>DNS setup purgatory</td>
                <td>A2P 10DLC registration</td>
              </tr>
              <tr>
                <td><strong>Cellular SMS OTP Relay</strong></td>
                <td className="highlight-col text-emerald-400 font-semibold">Free (Direct ADB / Carrier)</td>
                <td>Not supported</td>
                <td>Not supported</td>
                <td>Paid per message</td>
              </tr>
              <tr>
                <td><strong>Vendor Lock-In</strong></td>
                <td className="highlight-col text-emerald-400 font-semibold">Zero (Your Gmail SMTP)</td>
                <td>High</td>
                <td>High</td>
                <td>High</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE DEVELOPER API SANDBOX                                      */}
      {/* ========================================================================= */}
      <section className="sandbox-playground-section">
        <div className="section-title-wrapper">
          <span className="section-eyebrow">Developer Playground</span>
          <h2 className="section-main-heading">Interactive API Sandbox</h2>
          <p className="section-sub-heading">Configure styling, modify payload properties, and test live code generation or console execution.</p>
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
                  { id: "sms-otp", label: "SMS OTP" },
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
                    <label className="control-label" htmlFor="header-bg-color">Header BG Theme</label>
                    <div className="color-picker-control">
                      <input 
                        id="header-bg-color"
                        type="color" 
                        value={headerColor}
                        onChange={(e) => setHeaderColor(e.target.value)}
                      />
                      <code>{headerColor}</code>
                    </div>
                  </div>

                  <div className="sandbox-control-group">
                    <label className="control-label" htmlFor="header-text-color">Header Text Theme</label>
                    <div className="color-picker-control">
                      <input 
                        id="header-text-color"
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

              {/* Tab 2: Code Integration */}
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

      {/* ========================================================================= */}
      {/* 6. ENTERPRISE FEATURE CARDS GRID                                         */}
      {/* ========================================================================= */}
      <section className="features-section-new">
        <div className="section-title-wrapper text-center">
          <span className="section-eyebrow">Production Ready</span>
          <h2 className="section-main-heading">Engineered for Reliability and Speed</h2>
          <p className="section-sub-heading">Built to scale seamlessly whether you send 10 emails or 10,000.</p>
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

      {/* ========================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION & SEO SCHEMA MATCH)          */}
      {/* ========================================================================= */}
      <section className="faq-section-new">
        <div className="section-title-wrapper text-center">
          <span className="section-eyebrow">
            <HelpCircle size={14} /> Got Questions?
          </span>
          <h2 className="section-main-heading">Frequently Asked Questions</h2>
          <p className="section-sub-heading">Everything you need to know about MailBridge bulk outreach and transactional APIs.</p>
        </div>

        <div className="faq-accordion-container">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className={`faq-item-card ${isOpen ? "open" : ""}`}
              >
                <button 
                  type="button" 
                  className="faq-question-btn"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{item.question}</span>
                  <ChevronDown className={`faq-chevron ${isOpen ? "rotated" : ""}`} size={18} />
                </button>
                {isOpen && (
                  <div className="faq-answer-panel">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CALL TO ACTION BANNER                                                 */}
      {/* ========================================================================= */}
      <section className="cta-banner-new">
        <div className="cta-banner-content">
          <span className="cta-eyebrow">Ready to start?</span>
          <h2>Start Sending Cold Outreach &amp; Transactional Emails for Free.</h2>
          <p>Zero credit card required. Connect your Gmail SMTP in 2 minutes and start closing leads today.</p>
          <div className="cta-buttons-row">
            <Link to="/bulk-mail" className="btn btn-hero-primary glow-btn">
              <FileSpreadsheet size={18} /> Launch Bulk Mailer Now
            </Link>
            {user ? (
              <Link to="/dashboard" className="btn btn-hero-secondary">
                Go to Dashboard <ChevronRight size={16} />
              </Link>
            ) : (
              <Link to="/register" className="btn btn-hero-secondary">
                Create Free Account <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
