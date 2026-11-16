import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Home.css";
import {
  Shield,
  ShieldCheck,
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
  Smartphone,
  Radio,
  FileSpreadsheet,
  Clock,
  Users,
  Send,
  Code2,
  RotateCw,
  MessageSquare,
  ArrowUp,
  Play,
  Pause,
  Layout,
  Activity
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../config.js";
import { useSEO } from "../hooks/useSEO.js";
import { DeliverabilityInspector } from "../components/DeliverabilityInspector.jsx";
import { ThreeDBackground } from "../components/ThreeDBackground.jsx";
import { ThreeDHeroPlayer } from "../components/ThreeDHeroPlayer.jsx";

const features = [
  { 
    icon: FileSpreadsheet, 
    title: "Personalized Bulk Mailer", 
    desc: "Import CSV or Excel files with unlimited custom columns and inject dynamic {{firstname}} and {{company}} tags seamlessly." 
  },
  { 
    icon: BarChart3, 
    title: "Real-Time Lead Qualification", 
    desc: "Automatically categorize outreach prospects into Hot Leads (clicked CTA), Warm Leads (opened), and Cold Leads (unopened)." 
  },
  { 
    icon: ShieldCheck, 
    title: "Zero Monthly Subscriptions", 
    desc: "Send through your existing Gmail or Google Workspace SMTP account with zero monthly vendor fees." 
  },
  { 
    icon: Shield, 
    title: "Secure API Keys", 
    desc: "Generate scoped API keys to send transactional emails and SMS OTPs securely over HTTPS." 
  },
  { 
    icon: Activity, 
    title: "Live Open & Click Telemetry", 
    desc: "Monitor email open rates, CTA link clicks, and delivery status in real-time." 
  },
  {
    icon: Smartphone,
    title: "Cellular SMS Gateway",
    desc: "Send phone OTP verification codes via direct Android phone USB connection, local relay, or carrier gateway."
  },
  {
    icon: Layout,
    title: "Responsive Email Templates",
    desc: "Pre-built, mobile-friendly HTML email layouts for login OTPs, welcome messages, and cold outreach."
  },
  {
    icon: Code2,
    title: "Local Testing Sandbox",
    desc: "Test and preview your email templates and API requests in the browser without sending real emails."
  }
];

// Interactive FAQ Data for Google Search Rich Snippets & Accordion
const FAQ_ITEMS = [
  {
    category: "Deliverability & Protocols",
    question: "How does MailBridge achieve 99.8% in-box placement without vendor markups?",
    answer: "MailBridge routes outbound emails directly through your own Google Workspace or Gmail SMTP credentials using authenticated TLS 1.3 encryption. Your emails carry genuine 2048-bit RSA DKIM signatures (google._domainkey) and SPF alignment directly from Google's certified IP infrastructure, avoiding shared spam blacklists."
  },
  {
    category: "Telemetry Engine",
    question: "How does the zero-latency email open and click telemetry operate?",
    answer: "Each outbound message injects a transparent 1x1 edge pixel and zero-latency HTTP 302 link redirect engine. When a recipient opens your email or triggers a CTA, MailBridge processes the webhook at the edge in sub-50ms and instantly classifies prospects into Hot (Clicked CTA), Warm (Opened), or Queued on your live telemetry pipeline."
  },
  {
    category: "Cost Architecture",
    question: "Why are there zero monthly platform or per-contact fees?",
    answer: "Commercial vendors mark up email delivery by 1,000% to cover managed servers. MailBridge runs as a self-directed client bridging your own Google Workspace allowance (up to 2,000 emails/day per mailbox). You pay $0 platform fees and maintain 100% ownership of your contact lists and deliverability reputation."
  },
  {
    category: "Rate Limits & Throttling",
    question: "How does MailBridge prevent account suspension and rate limiting?",
    answer: "MailBridge enforces smart human jitter and automated queue throttling (configurable 100ms–2500ms intervals between dispatches). It respects Google's rolling 24-hour dispatch ceilings and implements automatic backoff on HTTP 429 response codes to safeguard your domain health."
  },
  {
    category: "Developer SDK & Integration",
    question: "Can I integrate MailBridge into production backend applications?",
    answer: "Yes. In addition to the spreadsheet Bulk Mailer, MailBridge provides RESTful HTTPS endpoints with production-ready SDK snippets in Node.js, Python, cURL, and Go for transactional OTP verification, account authentication, and campaign triggers."
  }
];

export function HomePage() {
  const { user, token } = useAuth();
  const location = useLocation();

  // Smoothly scroll to target hash section (e.g. #spam-checker) when navigating from another page or on direct hash link
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const attemptScroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      };

      if (!attemptScroll()) {
        const t1 = setTimeout(attemptScroll, 100);
        const t2 = setTimeout(attemptScroll, 300);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }
  }, [location.hash, location.pathname]);
  
  useSEO({
    title: "MailBridge | Free Cold Email Outreach & Gmail SMTP Relay API",
    description: "Send personalized bulk cold email campaigns through your Gmail SMTP with live open and click tracking. Free transactional email and carrier SMS API.",
    keywords: "cold email outreach software, free bulk mailer, gmail smtp relay, email spam checker, cold lead pipeline, transactional email api, excel mail merge, developer email service, mailbridge"
  });
  
  // Hero Studio Window Mode: "code" (Developer SDK) | "table" (Outbound Queue) | "preview" (Delivered Mail)
  const [heroMode, setHeroMode] = useState("code");
  const [heroCodeLang, setHeroCodeLang] = useState("nodejs");
  const [copiedHeroCode, setCopiedHeroCode] = useState(false);
  const [isExecutingHero, setIsExecutingHero] = useState(false);
  const [heroExecutionDone, setHeroExecutionDone] = useState(false);



  const HERO_CODE_SNIPPETS = {
    nodejs: `import { MailBridge } from '@mailbridge/sdk';

const mb = new MailBridge({ apiKey: 'mb_live_8f0a...' });

// Ingest CSV workbook & relay via personal Gmail SMTP
const campaign = await mb.campaigns.dispatch({
  file: 'enterprise_q4_leads.csv',
  relay: 'smtp.gmail.com:587',
  template: 'scaling_outbound_v1',
  tracking: { opens: true, clicks: true }
});

console.log(\`Relayed \${campaign.total} emails via Gmail SMTP\`);`,

    python: `from mailbridge import MailBridge

mb = MailBridge(api_key="mb_live_8f0a...")

# Ingest CSV workbook & relay via personal Gmail SMTP
campaign = mb.campaigns.dispatch(
    file="enterprise_q4_leads.csv",
    relay="smtp.gmail.com:587",
    template="scaling_outbound_v1",
    tracking={"opens": True, "clicks": True}
)

print(f"Relayed {campaign.total} emails via Gmail SMTP")`,

    curl: `curl -X POST https://api.mailbridge.email/v1/campaigns/dispatch \\
  -H "Authorization: Bearer mb_live_8f0a..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "file": "enterprise_q4_leads.csv",
    "relay": "smtp.gmail.com:587",
    "template": "scaling_outbound_v1",
    "track_clicks": true
  }'`
  };

  const handleCopyHeroCode = () => {
    navigator.clipboard.writeText(HERO_CODE_SNIPPETS[heroCodeLang]);
    setCopiedHeroCode(true);
    setTimeout(() => setCopiedHeroCode(false), 2000);
  };

  const handleRunHeroTest = () => {
    setIsExecutingHero(true);
    setHeroExecutionDone(false);
    setTimeout(() => {
      setIsExecutingHero(false);
      setHeroExecutionDone(true);
    }, 600);
  };

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
  const [activeServiceTab, setActiveServiceTab] = useState("bulk"); // "bulk" | "email" | "sms" | "templates"

  // Interactive Sandbox State
  const [templateType, setTemplateType] = useState("otp");
  const [brandName, setBrandName] = useState("Acme Corp");
  const [headerColor, setHeaderColor] = useState("#0c0d12");
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
    const brand = brandName || "Acme Corp";
    const accent = headerColor || "#0c0d12";

    let titleText = "Your Security Verification Code";
    let bodyContent = `Enter this 6-digit verification code to complete your sign-in to ${brand}. This code is confidential and will expire in 10 minutes.`;
    let visualComponent = `
      <div style="margin: 24px 0; text-align: center;">
        <div style="display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 32px;">
          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #09090b; display: block;">823490</span>
          <span style="display: block; font-size: 10.5px; font-weight: 600; color: #64748b; margin-top: 4px; letter-spacing: 0.05em; text-transform: uppercase;">Valid for 10 minutes</span>
        </div>
      </div>
    `;

    if (templateType === "welcome") {
      titleText = `Welcome to ${brand}!`;
      bodyContent = `Hi Alex,\n\nWe're thrilled to have you on board with ${brand}. Your developer workspace is provisioned and ready for your first outbound outreach campaign.`;
      visualComponent = `
        <div style="margin: 24px 0; text-align: center;">
          <a href="#" style="display: inline-block; background: ${accent}; color: #ffffff; padding: 11px 26px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-decoration: none;">
            Launch Workspace →
          </a>
        </div>
      `;
    } else if (templateType === "forgot-password") {
      titleText = "Reset Your Password";
      bodyContent = `We received a request to reset the password for your ${brand} account. Click below to securely choose a new password:`;
      visualComponent = `
        <div style="margin: 24px 0; text-align: center;">
          <a href="#" style="display: inline-block; background: ${accent}; color: #ffffff; padding: 11px 26px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-decoration: none;">
            Reset Password
          </a>
        </div>
      `;
    } else if (templateType === "notification") {
      titleText = `${brand} Security Alert`;
      bodyContent = `A new sign-in was detected on your account from Chrome on macOS (IP: 192.0.2.1). If this was you, no action is needed.`;
      visualComponent = `
        <div style="margin: 20px 0; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px; font-size: 12.5px; color: #9f1239;">
          <strong>Security Notice:</strong> If you did not authorize this login, revoke your API tokens immediately.
        </div>
      `;
    } else if (templateType === "custom") {
      titleText = customSubject || "Personalized Outreach";
      bodyContent = `Hi {{firstname}},\n\nNoticed {{company}}'s recent expansion in outbound infrastructure. We built MailBridge to give your engineering team full relay independence with zero monthly subscription markups.`;
      visualComponent = `
        <div style="margin: 22px 0; text-align: center;">
          <a href="#" style="display: inline-block; background: ${accent}; color: #ffffff; padding: 11px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none;">
            Book a 10-Minute Walkthrough →
          </a>
        </div>
      `;
    }

    return `
      <div style="background-color: #f8fafc; padding: 20px 14px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 460px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
          <!-- Top Brand Bar -->
          <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 26px; height: 26px; border-radius: 6px; background-color: ${accent}; color: #ffffff; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center;">
                ${brand.charAt(0).toUpperCase()}
              </div>
              <span style="font-size: 13.5px; font-weight: 800; color: #09090b; letter-spacing: -0.01em;">${brand}</span>
            </div>
            <span style="font-size: 10.5px; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Official Notice</span>
          </div>

          <!-- Body Content -->
          <div style="padding: 24px 20px;">
            <h3 style="margin: 0 0 10px; font-size: 17px; font-weight: 800; color: #09090b; letter-spacing: -0.01em;">${titleText}</h3>
            <p style="margin: 0; font-size: 13px; line-height: 1.55; color: #475569; white-space: pre-line;">${bodyContent}</p>
            ${visualComponent}
            <p style="margin: 16px 0 0; font-size: 11.5px; line-height: 1.5; color: #94a3b8;">
              Dispatched via <strong>MailBridge</strong> Gmail SMTP secure TLS relay.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 12px 20px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 10.5px; color: #94a3b8; text-align: center;">
            © 2026 ${brand}. All rights reserved. • <a href="#" style="color: #64748b; text-decoration: underline;">Security Center</a>
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
      {/* 3D WebGL Background Scene (AnimMaster / Vengeance / Skiper UI Architecture) */}
      <ThreeDBackground />

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

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (DUAL PROPOSITION: BULK OUTREACH + TRANSACTIONAL API)     */}
      {/* ========================================================================= */}
      <header className="hero-section-new">
        <div className="hero-grid">
          <div className="hero-left-content">
            {/* Masthead Eyebrow */}
            <div className="hero-badge-pill">
              <span className="hero-badge-pulse-dot"></span>
              <span>GMAIL SMTP RELAY &amp; COLD OUTREACH</span>
            </div>

            <h1 className="hero-title">
              Cold Email Outreach &amp; Transactional API. <br />
              <em className="hero-red-accent">Zero Monthly Fees.</em>
            </h1>

            <p className="hero-desc-text">
              Import contacts from CSV or Excel, personalize fields with dynamic tags, and track email opens and clicks live. Send cold outreach and developer verification emails directly through your own Gmail SMTP with 99.8% deliverability.
            </p>
            
            <div className="hero-cta-buttons">
              <Link to="/bulk-mail" className="btn btn-hero-primary">
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
                API Docs &amp; Specifications <ChevronRight size={15} />
              </Link>
            </div>

            {/* Micro Trust Stats */}
            <div className="hero-stats-row">
              <div className="stat-pill">
                <span className="stat-dot dot-red"></span>
                <strong>$0/mo</strong> Platform Fee
              </div>
              <div className="stat-pill">
                <span className="stat-dot dot-blue"></span>
                <strong>CSV &amp; XLSX</strong> Auto-Mapped
              </div>
              <div className="stat-pill">
                <span className="stat-dot dot-emerald"></span>
                <strong>Live Telemetry</strong> Opens &amp; Clicks
              </div>
              <div className="stat-pill">
                <span className="stat-dot dot-white"></span>
                <strong>&lt; 74ms</strong> Direct SMTP
              </div>
            </div>

            {/* Interactive 3D Isometric Engine & 4K Walkthrough Video Player (AnimMaster / Vengeance / Skiper UI Architecture) */}
            <ThreeDHeroPlayer />
          </div>

          {/* Hero Right: Studio Obsidian Developer Terminal & Relay Engine */}
          <div className="hero-right-dashboard">
            <div className="hero-studio-window">
              {/* Window Titlebar */}
              <div className="hero-window-titlebar">
                <div className="hero-window-dots">
                  <span className="dot dot-1"></span>
                  <span className="dot dot-2"></span>
                  <span className="dot dot-3"></span>
                </div>

                <div className="hero-window-tabs">
                  <button
                    type="button"
                    className={`hero-tab-pill ${heroMode === "code" ? "active" : ""}`}
                    onClick={() => setHeroMode("code")}
                  >
                    <Code2 size={13} />
                    <span>SDK Relay</span>
                  </button>
                  <button
                    type="button"
                    className={`hero-tab-pill ${heroMode === "table" ? "active" : ""}`}
                    onClick={() => setHeroMode("table")}
                  >
                    <FileSpreadsheet size={13} />
                    <span>Outbound Queue</span>
                  </button>
                  <button
                    type="button"
                    className={`hero-tab-pill ${heroMode === "preview" ? "active" : ""}`}
                    onClick={() => setHeroMode("preview")}
                  >
                    <Mail size={13} />
                    <span>Delivered Mail</span>
                  </button>
                </div>

                <div className="hero-relay-badge">
                  <span className="relay-pulse-dot"></span>
                  <span>TLS 1.3 Active</span>
                </div>
              </div>

              {/* View 1: Real Code & Interactive Terminal */}
              {heroMode === "code" && (
                <div className="hero-code-view">
                  <div className="hero-code-subbar">
                    <div className="hero-lang-chips">
                      {["nodejs", "python", "curl"].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className={`hero-lang-btn ${heroCodeLang === lang ? "active" : ""}`}
                          onClick={() => setHeroCodeLang(lang)}
                        >
                          {lang === "nodejs" ? "Node.js" : lang === "python" ? "Python" : "cURL"}
                        </button>
                      ))}
                    </div>

                    <div className="hero-code-actions">
                      <button
                        type="button"
                        className="hero-copy-btn"
                        onClick={handleCopyHeroCode}
                        title="Copy code snippet"
                      >
                        {copiedHeroCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedHeroCode ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        className="hero-run-btn"
                        onClick={handleRunHeroTest}
                        disabled={isExecutingHero}
                      >
                        {isExecutingHero ? <RotateCw size={12} className="animate-spin" /> : <Send size={12} />}
                        <span>{isExecutingHero ? "Relaying..." : "Execute Relay"}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="hero-code-block">
                    <code>{HERO_CODE_SNIPPETS[heroCodeLang]}</code>
                  </pre>

                  {heroExecutionDone && (
                    <div className="hero-output-console">
                      <div className="hero-output-header">
                        <span className="text-xs font-mono text-zinc-400">Response Payload</span>
                        <span className="text-xs font-mono text-emerald-400">HTTP 200 OK • 74ms</span>
                      </div>
                      <pre className="hero-output-json">
{`{
  "status": "delivered",
  "recipients": 250,
  "relay": "smtp.gmail.com:587",
  "tls": "TLS 1.3 (ChaCha20-Poly1305)",
  "dkim": "google._domainkey (2048-bit RSA) PASS",
  "spf": "v=spf1 include:_spf.google.com ~all PASS",
  "tracking": { "pixel": "active", "redirect": "zero-latency" }
}`}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: High-Density Verified Outbound Table */}
              {heroMode === "table" && (
                <div className="hero-table-view">
                  <div className="hero-table-subbar">
                    <div className="hero-campaign-info">
                      <strong>Q4 Enterprise Outreach</strong>
                      <span className="hero-campaign-meta">250 Prospects • Ingested from leads.xlsx</span>
                    </div>
                    <span className="hero-verified-tag">
                      <span className="hero-pulse-emerald"></span> 100% In-Box Delivery
                    </span>
                  </div>

                  <div className="hero-table-scroll">
                    <table className="hero-live-table">
                      <thead>
                        <tr>
                          <th>Recipient</th>
                          <th>Company</th>
                          <th>Delivery Status</th>
                          <th>Telemetry</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>sarah.jenkins@acmecorp.com</strong></td>
                          <td>Acme Corp</td>
                          <td><span className="hero-pill-verified"><Check size={11} /> Delivered (250 OK)</span></td>
                          <td><span className="hero-badge-signal hot">4 Opens • 2 Clicks</span></td>
                        </tr>
                        <tr>
                          <td><strong>michael.c@techstart.io</strong></td>
                          <td>TechStart IO</td>
                          <td><span className="hero-pill-verified"><Check size={11} /> Delivered (250 OK)</span></td>
                          <td><span className="hero-badge-signal warm">2 Opens</span></td>
                        </tr>
                        <tr>
                          <td><strong>emily.w@globalventures.com</strong></td>
                          <td>Global Ventures</td>
                          <td><span className="hero-pill-verified"><Check size={11} /> Delivered (250 OK)</span></td>
                          <td><span className="hero-badge-signal neutral">Delivered</span></td>
                        </tr>
                        <tr>
                          <td><strong>david.kim@hypercloud.dev</strong></td>
                          <td>HyperCloud</td>
                          <td><span className="hero-pill-verified"><Check size={11} /> Delivered (250 OK)</span></td>
                          <td><span className="hero-badge-signal warm">1 Open</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="hero-table-footer">
                    <span>Direct Google Workspace SMTP relay diagnostics</span>
                    <span className="text-zinc-400 font-mono text-xs">Sub-80ms dispatch</span>
                  </div>
                </div>
              )}

              {/* View 3: Rendered Delivered Email Preview in Gmail Format */}
              {heroMode === "preview" && (
                <div className="hero-preview-view">
                  <div className="hero-preview-subbar">
                    <span className="hero-inbox-tag">Recipient Inbox Preview</span>
                    <span className="text-zinc-400 text-xs font-mono">Gmail Client (Desktop)</span>
                  </div>
                  <div className="hero-rendered-mail-card">
                    <div className="hero-mail-header-row">
                      <div>
                        <div className="hero-mail-from">
                          <strong>Alex Miller</strong> &lt;alex@mailbridge.email&gt;
                        </div>
                        <div className="hero-mail-to">to sarah.jenkins@acmecorp.com</div>
                      </div>
                      <span className="hero-mail-time">Just now</span>
                    </div>
                    <div className="hero-mail-subject">
                      Quick question regarding Acme Corp&apos;s outbound workflow
                    </div>
                    <div className="hero-mail-body">
                      Hi Sarah, noticed your team&apos;s recent expansion in growth tooling. We built MailBridge to give sales and engineering teams zero-markup email relay through your existing Google credentials.
                    </div>
                    <div className="hero-mail-cta-row">
                      <span className="hero-mail-btn">View 10-Minute Walkthrough →</span>
                    </div>
                    <div className="hero-mail-footer-meta">
                      <Shield size={11} className="text-emerald-400 inline mr-1" /> Signed by mailbridge.email with 2048-bit RSA DKIM key
                    </div>
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
              High-Converting Cold Email Engine
            </span>
            <div className="section-eyebrow-red-marker"></div>
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
              <div className="step-card-topbar">
                <span className="step-num-badge">01</span>
                <FileSpreadsheet size={18} className="step-top-icon" />
              </div>
              <h3>Upload CSV or Excel Spreadsheet</h3>
              <p>
                Drag and drop your spreadsheet. MailBridge automatically recognizes your columns like <code>firstname</code>, <code>company</code>, <code>role</code>, and <code>email</code>.
              </p>
            </div>

            <div className="spotlight-step-card">
              <div className="step-card-topbar">
                <span className="step-num-badge">02</span>
                <Code2 size={18} className="step-top-icon" />
              </div>
              <h3>Personalize Every Email</h3>
              <p>
                Insert tags like <code>&#123;&#123;firstname&#125;&#125;</code> and <code>&#123;&#123;company&#125;&#125;</code> in your message. Every recipient gets an email tailored to them.
              </p>
            </div>

            <div className="spotlight-step-card">
              <div className="step-card-topbar">
                <span className="step-num-badge">03</span>
                <Activity size={18} className="step-top-icon" />
              </div>
              <h3>Live Open &amp; Click Tracking</h3>
              <p>
                Track engagement in real time. Prospects are automatically sorted into <strong>Hot Leads</strong> (clicked links), <strong>Warm Leads</strong> (opened email), and <strong>Cold</strong>.
              </p>
            </div>

            <div className="spotlight-step-card">
              <div className="step-card-topbar">
                <span className="step-num-badge">04</span>
                <Users size={18} className="step-top-icon" />
              </div>
              <h3>Export Leads &amp; Close Deals</h3>
              <p>
                Follow up directly with hot prospects or export your qualified lead data to CSV for your CRM in one click.
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
                    <span className={`lead-status-dot ${lead.status}`}></span>{lead.firstname} ({lead.company})
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
                    <span className="badge-status-hot">Hot Lead (CTA Clicked)</span>
                  )}
                  {sampleLeads[demoLeadIndex].status === "warm" && (
                    <span className="badge-status-warm">Warm Lead (Opened)</span>
                  )}
                  {sampleLeads[demoLeadIndex].status === "cold" && (
                    <span className="badge-status-cold">Cold Lead (Unopened)</span>
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
            <Smartphone size={18} />
            <span>Cellular SMS OTP Gateway</span>
          </button>
          <button 
            type="button"
            className={`services-tab-btn ${activeServiceTab === "templates" ? "active" : ""}`}
            onClick={() => setActiveServiceTab("templates")}
          >
            <Layout size={18} />
            <span>Responsive Email Templates</span>
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
                    <span className="feature-icon-badge"><FileSpreadsheet size={15} /></span>
                    <div>
                      <h4>Dynamic Personalization Tags</h4>
                      <p>Inject <code>&#123;&#123;firstname&#125;&#125;</code>, <code>&#123;&#123;company&#125;&#125;</code>, and custom fields in subject &amp; body.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <span className="feature-icon-badge"><Activity size={15} /></span>
                    <div>
                      <h4>Real-Time Open &amp; Click Tracking</h4>
                      <p>Zero-latency tracking pixel and link redirection segregate hot prospects automatically.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <span className="feature-icon-badge"><Send size={15} /></span>
                    <div>
                      <h4>1-Click Follow-Up &amp; Export</h4>
                      <p>Send personalized 1-on-1 replies or download qualified lead spreadsheets instantly.</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "24px" }}>
                  <Link to="/bulk-mail" className="btn btn-hero-primary">
                    Open Bulk Mailer <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="service-detail-graphic">
                <div className="services-visual-card">
                  <div className="services-visual-header">
                    <div className="svc-header-left">
                      <span className="visual-badge-live">
                        <span className="pulse-dot"></span> Campaign Active
                      </span>
                      <span className="visual-title">Q4_Enterprise_Outreach.csv</span>
                    </div>
                    <span className="visual-time-badge">Just now</span>
                  </div>
                  
                  <div className="services-visual-body">
                    <div className="svc-metrics-trio">
                      <div className="svc-m-box">
                        <span className="svc-m-lbl">Delivered</span>
                        <strong className="svc-m-val text-emerald-500">250 / 250</strong>
                        <span className="svc-m-sub">100% Inbox Rate</span>
                      </div>
                      <div className="svc-m-box">
                        <span className="svc-m-lbl">Unique Opens</span>
                        <strong className="svc-m-val text-emerald-500">148</strong>
                        <span className="svc-m-sub">59.2% Open Rate</span>
                      </div>
                      <div className="svc-m-box">
                        <span className="svc-m-lbl">CTA Engagement</span>
                        <strong className="svc-m-val text-zinc-100">54</strong>
                        <span className="svc-m-sub">21.6% Conversion</span>
                      </div>
                    </div>

                    <div className="svc-lead-snapshot-table">
                      <div className="svc-lead-row">
                        <div className="svc-lead-info">
                          <span className="svc-name">sarah.jenkins@acmecorp.com</span>
                          <span className="svc-org">Acme Corp • VP Growth</span>
                        </div>
                        <span className="svc-status-pill hot">4 Opens • 2 Clicks</span>
                      </div>
                      <div className="svc-lead-row">
                        <div className="svc-lead-info">
                          <span className="svc-name">michael.chen@techstart.io</span>
                          <span className="svc-org">TechStart IO • CTO</span>
                        </div>
                        <span className="svc-status-pill warm">2 Opens</span>
                      </div>
                    </div>

                    <div className="svc-visual-footer">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>Gmail SMTP Relay Protected • Human-like 3-7s delay active</span>
                    </div>
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
                    <span className="feature-icon-badge"><Layout size={15} /></span>
                    <div>
                      <h4>Pre-Built Dynamic Templates</h4>
                      <p>Responsive designs for OTPs, welcomes, password resets, and custom layouts.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <span className="feature-icon-badge"><Shield size={15} /></span>
                    <div>
                      <h4>Secure HTTPS REST Endpoints</h4>
                      <p>Authenticate requests cleanly using client API keys over TLS/HTTPS.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <span className="feature-icon-badge"><Clock size={15} /></span>
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
                    <div className="svc-header-left">
                      <span className="visual-badge-method">POST</span>
                      <span className="visual-title">/api/v1/emails/otp</span>
                    </div>
                    <span className="visual-status-code">200 OK (38ms)</span>
                  </div>
                  
                  <div className="services-visual-body">
                    <div className="svc-api-snippet">
                      <div className="svc-json-row"><span className="json-key">"status":</span> <span className="json-str">"success"</span>,</div>
                      <div className="svc-json-row"><span className="json-key">"messageId":</span> <span className="json-str">"msg_9f81a7d2e3"</span>,</div>
                      <div className="svc-json-row"><span className="json-key">"recipient":</span> <span className="json-str">"alex@acme.com"</span>,</div>
                      <div className="svc-json-row"><span className="json-key">"relay":</span> <span className="json-str">"smtp.gmail.com:587 (TLS)"</span>,</div>
                      <div className="svc-json-row"><span className="json-key">"latency":</span> <span className="json-num">38</span></div>
                    </div>

                    <div className="svc-email-render-card">
                      <div className="svc-email-header">
                        <div className="svc-brand-mini">Acme Corp Security</div>
                        <span className="svc-time-mini">Just now</span>
                      </div>
                      <div className="svc-otp-preview-code">
                        <span>Your Login Code:</span>
                        <strong>849 — 201</strong>
                      </div>
                    </div>

                    <div className="svc-visual-footer">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>Zero vendor fee markup • Direct Google Workspace TLS relay</span>
                    </div>
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
                    <span className="feature-icon-badge"><Smartphone size={15} /></span>
                    <div>
                      <h4>USB Android Debugging (ADB)</h4>
                      <p>Connect your phone, type your API key, and dispatch free texts via your mobile SIM.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <span className="feature-icon-badge"><Radio size={15} /></span>
                    <div>
                      <h4>Carrier Email-to-SMS Routing</h4>
                      <p>Relay SMS packets via carrier-specific Email-to-SMS domains seamlessly.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <span className="feature-icon-badge"><Code2 size={15} /></span>
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
                    <div className="svc-header-left">
                      <span className="visual-badge-live">
                        <span className="pulse-dot"></span> SIM Relay Active
                      </span>
                      <span className="visual-title">Android ADB Gateway</span>
                    </div>
                    <span className="visual-time-badge">Device Connected</span>
                  </div>
                  
                  <div className="services-visual-body">
                    <div className="svc-sms-phone-mockup">
                      <div className="svc-sms-bubble-header">
                        <span className="svc-sms-sender">Messages • Today 10:42 AM</span>
                      </div>
                      <div className="svc-sms-bubble">
                        <p><strong>MailBridge Verification:</strong> Your one-time login code is <strong>492018</strong>. Valid for 5 minutes. Never share this pin with anyone.</p>
                      </div>
                    </div>

                    <div className="svc-metrics-trio compact">
                      <div className="svc-m-box">
                        <span className="svc-m-lbl">Device</span>
                        <strong className="svc-m-val">Pixel 8</strong>
                      </div>
                      <div className="svc-m-box">
                        <span className="svc-m-lbl">Carrier Cost</span>
                        <strong className="svc-m-val text-emerald-500">$0.00 / SMS</strong>
                      </div>
                      <div className="svc-m-box">
                        <span className="svc-m-lbl">Delivery Rate</span>
                        <strong className="svc-m-val text-emerald-500">100%</strong>
                      </div>
                    </div>

                    <div className="svc-visual-footer">
                      <Check size={14} className="text-emerald-500" />
                      <span>Bypasses costly $0.07/SMS Twilio fees using your local SIM card</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service 4: Responsive Email Templates */}
          {activeServiceTab === "templates" && (
            <div className="service-detail-grid">
              <div className="service-detail-info">
                <p className="service-tagline">Responsive Email Templates</p>
                <h3>Clean HTML email layouts tested across all inboxes.</h3>
                <p className="service-desc">
                  Deliver lightweight, responsive emails that look great on iPhones, Android devices, and desktop clients without getting flagged or dumped into spam tabs.
                </p>
                <div className="service-features-list">
                  <div className="service-feature-item">
                    <span className="feature-icon-badge"><Layout size={15} /></span>
                    <div>
                      <h4>Mobile-First Responsive Layouts</h4>
                      <p>Clean table-based HTML designed for Gmail, Apple Mail, and Outlook.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <span className="feature-icon-badge"><Code2 size={15} /></span>
                    <div>
                      <h4>Dynamic Personalization Tags</h4>
                      <p>Easily insert names, custom links, and order details with curly tags.</p>
                    </div>
                  </div>
                  <div className="service-feature-item">
                    <span className="feature-icon-badge"><ShieldCheck size={15} /></span>
                    <div>
                      <h4>Spam Filter Protection</h4>
                      <p>Clean markup and standard headers to maintain high sender reputation.</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "24px" }}>
                  <Link to="/dashboard" className="btn btn-hero-secondary">
                    Open Template Studio <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="service-detail-graphic">
                <div className="services-visual-card">
                  <div className="services-visual-header">
                    <div className="svc-header-left">
                      <span className="visual-badge">HTML5 Spec</span>
                      <span className="visual-title">Responsive Email Layout</span>
                    </div>
                    <span className="visual-status-code">Tested 100%</span>
                  </div>
                  
                  <div className="services-visual-body">
                    <div className="svc-template-card-preview">
                      <div className="svc-template-top">
                        <div className="svc-template-logo">MailBridge</div>
                        <span className="svc-template-tag">Transactional</span>
                      </div>
                      <div className="svc-template-body-text">
                        <h4>Welcome to the platform, Alex!</h4>
                        <p>Your team workspace is ready. Click the button below to confirm your setup and start sending.</p>
                        <div className="svc-template-btn">Confirm Email Address →</div>
                      </div>
                    </div>

                    <div className="svc-client-badges">
                      <span className="svc-client-pill">Gmail</span>
                      <span className="svc-client-pill">Apple Mail</span>
                      <span className="svc-client-pill">Outlook</span>
                      <span className="svc-client-pill">iOS / Android</span>
                    </div>

                    <div className="svc-visual-footer">
                      <Check size={14} className="text-emerald-500" />
                      <span>Table-based inline CSS guarantees zero layout shifts across inboxes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.5 FREE ORGANIC SEO TOOL: COLD EMAIL SPAM WORD & DELIVERABILITY INSPECTOR */}
      {/* ========================================================================= */}
      <DeliverabilityInspector />

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
                <td className="highlight-col"><span className="comp-value-hero">$0.00</span> <span className="comp-unit">/ month</span></td>
                <td>$35 - $90 / mo</td>
                <td>$49 - $120 / mo</td>
                <td>$0.0079 per SMS</td>
              </tr>
              <tr>
                <td><strong>Personalized Bulk Mailer</strong></td>
                <td className="highlight-col"><span className="comp-highlight-badge">Included</span> <span className="comp-subtext">CSV &amp; Excel</span></td>
                <td>Add-on / Extra fee</td>
                <td>Included</td>
                <td>Not supported</td>
              </tr>
              <tr>
                <td><strong>Real-Time Open &amp; CTA Tracking</strong></td>
                <td className="highlight-col"><span className="comp-highlight-badge">Built-in</span> <span className="comp-subtext">Hot / Warm / Cold</span></td>
                <td>Basic webhooks</td>
                <td>Basic clicks</td>
                <td>Not supported</td>
              </tr>
              <tr>
                <td><strong>Setup Time</strong></td>
                <td className="highlight-col"><span className="comp-highlight-badge">2 Minutes</span> <span className="comp-subtext">Instant Connect</span></td>
                <td>DNS/Domain ordeal</td>
                <td>DNS setup purgatory</td>
                <td>A2P 10DLC registration</td>
              </tr>
              <tr>
                <td><strong>Cellular SMS OTP Relay</strong></td>
                <td className="highlight-col"><span className="comp-highlight-badge">Included</span> <span className="comp-subtext">Direct ADB / Carrier</span></td>
                <td>Not supported</td>
                <td>Not supported</td>
                <td>Paid per message</td>
              </tr>
              <tr>
                <td><strong>Vendor Lock-In</strong></td>
                <td className="highlight-col"><span className="comp-highlight-badge">Zero</span> <span className="comp-subtext">Your Gmail SMTP</span></td>
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
        <div className="section-title-wrapper text-center">
          <span className="section-eyebrow">Developer Playground</span>
          <h2 className="section-main-heading">Interactive API Sandbox</h2>
          <p className="section-sub-heading">Configure styling, test live code generation, and preview responsive email templates in real time.</p>
        </div>

        <div className="sandbox-workspace-grid">
          {/* Controls - Left Pane */}
          <div className="sandbox-controls-card">
            <div className="sandbox-card-header">
              <h3>Sandbox Configuration</h3>
              <span className="sandbox-mode-badge">Live Emulation</span>
            </div>

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
                  className="sandbox-input-field"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>

              {templateType !== "sms-otp" && (
                <div className="sandbox-control-group">
                  <label className="control-label">Brand Color Accent</label>
                  <div className="color-swatches-row">
                    {[
                      { color: "#ffffff", name: "Titanium White" },
                      { color: "#0c0d12", name: "Obsidian Slate" },
                      { color: "#4f46e5", name: "Indigo" },
                      { color: "#059669", name: "Emerald" },
                      { color: "#0284c7", name: "Sky" },
                      { color: "#7c3aed", name: "Purple" }
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        className={`color-swatch-dot ${headerColor.toLowerCase() === c.color.toLowerCase() ? "active" : ""}`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                        onClick={() => setHeaderColor(c.color)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {templateType === "sms-otp" ? (
                <div className="sandbox-control-group full-width">
                  <label className="control-label">Recipient Phone Number</label>
                  <input 
                    type="text" 
                    className="sandbox-input-field"
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
                    className="sandbox-input-field"
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
                    className="sandbox-input-field"
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
                <Terminal size={15} /> {isExecuting ? "Executing..." : "Execute API Request"}
              </button>
              
              {token && (
                <button 
                  type="button" 
                  className="btn btn-sandbox-real-send"
                  onClick={sendRealEmail}
                  disabled={isSendingReal}
                >
                  <Mail size={15} /> {isSendingReal ? "Sending..." : "Send Actual Email"}
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
              <div className="viewer-tabs-pill-container">
                <button 
                  type="button"
                  className={`viewer-tab-btn ${activePane === "preview" ? "active" : ""}`}
                  onClick={() => setActivePane("preview")}
                >
                  <Eye size={13} /> {templateType === "sms-otp" ? "Live SMS Preview" : "Live Email Preview"}
                </button>
                <button 
                  type="button"
                  className={`viewer-tab-btn ${activePane === "code" ? "active" : ""}`}
                  onClick={() => setActivePane("code")}
                >
                  <Code size={13} /> Code Integration
                </button>
                <button 
                  type="button"
                  className={`viewer-tab-btn ${activePane === "terminal" ? "active" : ""}`}
                  onClick={() => setActivePane("terminal")}
                >
                  <Terminal size={13} /> Sandbox Console
                </button>
              </div>
            </div>

            {/* Pane Viewports */}
            <div className="viewer-viewport-content">
              {/* Tab 1: Live Preview */}
              {activePane === "preview" && (
                <div className="sandbox-preview-inbox">
                  {templateType === "sms-otp" ? (
                    <div className="phone-preview-wrapper">
                      <div className="phone-mockup-frame">
                        <div className="phone-dynamic-island">
                          <span className="island-camera"></span>
                          <span className="island-sensor"></span>
                        </div>
                        <div className="phone-screen">
                          <div className="phone-status-bar">
                            <span className="status-time">9:41</span>
                            <div className="status-icons">
                              <span className="status-net">5G</span>
                              <span className="status-battery"><span className="battery-level"></span></span>
                            </div>
                          </div>
                          <div className="phone-header">
                            <div className="phone-avatar-circle">
                              <MessageSquare size={16} />
                            </div>
                            <div className="phone-contact-info">
                              <span className="phone-name">{brandName || "Acme Corp"}</span>
                              <span className="phone-sub">Direct Carrier SMS Gateway</span>
                            </div>
                          </div>
                          <div className="phone-messages-container">
                            <div className="sms-date-divider">Today 9:41 AM</div>
                            <div className="sms-bubble">
                              <div className="sms-sender-tag">{brandName || "Acme Corp"} Verification</div>
                              <p className="sms-text">
                                Your security code is <strong className="sms-otp-highlight">549301</strong>. Valid for 10 minutes. Never share this code with anyone.
                              </p>
                              <span className="sms-timestamp">9:41 AM • Delivered via Gateway</span>
                            </div>
                          </div>
                          <div className="phone-input-bar">
                            <span className="input-placeholder">Text Message</span>
                            <span className="sms-send-btn"><ArrowUp size={13} /></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="preview-browser-bar">
                        <div className="browser-dots">
                          <span className="dot red"></span>
                          <span className="dot yellow"></span>
                          <span className="dot green"></span>
                        </div>
                        <div className="browser-location">
                          <span className="envelope-to-label">To:</span>
                          <span className="envelope-to-val">{recipientEmail || "visitor@example.com"}</span>
                        </div>
                        <span className="preview-live-badge">Live Render</span>
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
                    <div className="code-lang-chips-group">
                      {["curl", "js", "python", "go"].map(lang => (
                        <button 
                          type="button"
                          key={lang}
                          className={`lang-btn ${activeLang === lang ? "active" : ""}`}
                          onClick={() => setActiveLang(lang)}
                        >
                          {lang === "curl" ? "cURL" : lang === "js" ? "JavaScript" : lang === "python" ? "Python" : "Go"}
                        </button>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      className="code-copy-action-btn"
                      onClick={handleCopyCode}
                      title="Copy code snippet"
                    >
                      {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                    </button>
                  </div>
                  <div className="code-block-wrapper">
                    <pre className="code-syntax-display">
                      <code>{getCodeSnippet()}</code>
                    </pre>
                  </div>
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
            KNOWLEDGE BASE &amp; ARCHITECTURE
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
                  <div className="faq-q-left">
                    <span className="faq-category-badge">{item.category}</span>
                    <span className="faq-q-text">{item.question}</span>
                  </div>
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
            <Link to="/bulk-mail" className="btn btn-hero-primary">
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
