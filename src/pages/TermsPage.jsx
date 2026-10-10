import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, Lock, AlertTriangle, CheckCircle2, ArrowLeft, Mail, Server } from "lucide-react";
import { useSEO } from "../hooks/useSEO.js";
import "../styles/Terms.css";

export function TermsPage() {
  const [activeTab, setActiveTab] = useState("terms");

  useSEO({
    title: activeTab === "terms" ? "Terms of Service | MailBridge" : "Privacy Policy | MailBridge",
    description: "Read the MailBridge terms of service, acceptable use policy, anti-spam guidelines, and privacy commitments for our email and SMS SaaS platform."
  });

  return (
    <div className="legal-page-container">
      <div className="legal-content-wrapper">
        <div style={{ marginBottom: "20px" }}>
          <Link
            to="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#14b8a6",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Back to Sign Up
          </Link>
        </div>

        <div className="legal-header">
          <div className="legal-badge">
            <ShieldCheck size={14} /> Official Platform Policies
          </div>
          <h1 className="legal-title">
            {activeTab === "terms" ? "Terms of Service & Acceptable Use" : "Privacy Policy & Data Security"}
          </h1>
          <p className="legal-subtitle">
            Last Updated: October 2026. Please review these binding guidelines governing your use of MailBridge email infrastructure, APIs, and SMS dispatch services.
          </p>
        </div>

        <div className="legal-nav-tabs">
          <button
            className={`legal-tab-btn ${activeTab === "terms" ? "active" : ""}`}
            onClick={() => setActiveTab("terms")}
          >
            <FileText size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
            Terms of Service
          </button>
          <button
            className={`legal-tab-btn ${activeTab === "privacy" ? "active" : ""}`}
            onClick={() => setActiveTab("privacy")}
          >
            <Lock size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
            Privacy Policy
          </button>
        </div>

        <div className="legal-card">
          {activeTab === "terms" ? (
            <>
              <div className="legal-section">
                <h2 className="legal-section-title">
                  <FileText size={20} /> 1. Acceptance & Service Scope
                </h2>
                <p className="legal-text">
                  By accessing MailBridge, creating an account, generating API credentials, or sending communications through our platform, you agree to be bound by these Terms of Service. MailBridge provides transactional email relay, bulk delivery infrastructure, SMS verification services, and deliverability monitoring tools.
                </p>
              </div>

              <div className="legal-section">
                <h2 className="legal-section-title">
                  <AlertTriangle size={20} /> 2. Anti-Spam Policy (Strict Zero-Tolerance)
                </h2>
                <p className="legal-text">
                  MailBridge enforces strict compliance with international electronic messaging standards, including the <strong>CAN-SPAM Act</strong>, <strong>GDPR</strong>, and <strong>CASL</strong>. You agree that:
                </p>
                <div className="legal-callout">
                  <strong>Critical Deliverability Requirement:</strong> Accounts discovered transmitting unsolicited commercial messages, purchased lead lists, deceptive phishing lures, or spoofed headers will be immediately terminated without prior notice.
                </div>
                <ul className="legal-list">
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span>All email recipients must have provided explicit, verifiable consent (opt-in) to receive communications from your organization.</span>
                  </li>
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span>Marketing communications and bulk campaigns must contain an accurate, functioning one-click unsubscribe mechanism and a valid physical postal address.</span>
                  </li>
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span>You shall not misrepresent the sender identity, domain origins, or routing headers in any transmitted dispatch.</span>
                  </li>
                </ul>
              </div>

              <div className="legal-section">
                <h2 className="legal-section-title">
                  <Lock size={20} /> 3. Account Verification & API Credentials
                </h2>
                <p className="legal-text">
                  To protect network reputation, all new accounts must complete mandatory email OTP verification prior to platform activation.
                </p>
                <ul className="legal-list">
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span>You are solely responsible for maintaining the confidentiality of your master account password and generated API keys (<code>mb_...</code>).</span>
                  </li>
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span>Do not expose secret API keys in client-side code, public GitHub repositories, or untrusted frontends. Use backend proxies to dispatch API requests.</span>
                  </li>
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span>In the event of suspected credential compromise, immediately rotate your API key via the MailBridge Dashboard.</span>
                  </li>
                </ul>
              </div>

              <div className="legal-section">
                <h2 className="legal-section-title">
                  <Server size={20} /> 4. Rate Limits & Fair Usage
                </h2>
                <p className="legal-text">
                  MailBridge applies automated rate limiting to protect shared infrastructure and delivery ip reputation:
                </p>
                <ul className="legal-list">
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span>API email dispatches are metered per API key and sender identity to prevent burst flooding.</span>
                  </li>
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span>Webhook endpoints must respond within 8,000 milliseconds with an HTTP 2xx status code. Failing webhooks will be automatically deactivated after repeated delivery failures.</span>
                  </li>
                </ul>
              </div>

              <div className="legal-section">
                <h2 className="legal-section-title">
                  <ShieldCheck size={20} /> 5. Limitation of Liability & SLA
                </h2>
                <p className="legal-text">
                  While MailBridge uses resilient multi-cloud infrastructure and intelligent DNS failovers, email deliverability ultimately depends on recipient mailbox providers (e.g. Gmail, Outlook, Yahoo) and your domain reputation (SPF, DKIM, DMARC). Services are provided on an "as is" and "as available" basis without warranties of uninterrupted transmission.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="legal-section">
                <h2 className="legal-section-title">
                  <Lock size={20} /> 1. Data Collected & Processing Purpose
                </h2>
                <p className="legal-text">
                  We collect only the information strictly required to provide email delivery, campaign analytics, and SMS gateway functions:
                </p>
                <ul className="legal-list">
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span><strong>Account Information:</strong> Name, verified email address, company name, and encrypted credential hashes.</span>
                  </li>
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span><strong>Delivery Metadata:</strong> Recipient address, subject line, delivery status, timestamp, provider message ID, and open/click event metrics.</span>
                  </li>
                  <li className="legal-list-item">
                    <span className="legal-list-bullet">•</span>
                    <span><strong>Configuration Data:</strong> Custom SMTP server settings and webhook destination URLs.</span>
                  </li>
                </ul>
              </div>

              <div className="legal-section">
                <h2 className="legal-section-title">
                  <ShieldCheck size={20} /> 2. Security & Encryption Standards
                </h2>
                <div className="legal-callout-info">
                  <strong>Encryption in Transit & at Rest:</strong> All web traffic and API calls are enforced over TLS 1.3/HTTPS with HSTS headers. Sensitive credentials like passwords and OTP codes are protected with one-way salted bcrypt algorithms.
                </div>
                <p className="legal-text">
                  We never sell, rent, or monetize your contact lists, recipient data, or email content to third parties or advertising networks.
                </p>
              </div>

              <div className="legal-section">
                <h2 className="legal-section-title">
                  <Mail size={20} /> 3. Data Retention & Deletion
                </h2>
                <p className="legal-text">
                  Delivery logs and campaign recipient history can be purged or reviewed at any time through your account dashboard. You may request permanent deletion of your account and all associated telemetry by contacting support or through the account settings panel.
                </p>
              </div>
            </>
          )}

          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-color, rgba(148, 163, 184, 0.2))", textAlign: "center", fontSize: "14px", color: "#94a3b8" }}>
            Questions regarding our terms or deliverability policies? Contact our compliance desk at{" "}
            <a href="mailto:compliance@mail-bridge.email" style={{ color: "#2dd4bf", textDecoration: "none", fontWeight: 600 }}>
              compliance@mail-bridge.email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
