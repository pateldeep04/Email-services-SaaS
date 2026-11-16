import React from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, Phone, ExternalLink, ShieldCheck, FileSpreadsheet, Terminal, BookOpen } from "lucide-react";
import "../styles/Footer.css";

function MailBridgeFooterLogo({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M 4 19 C 7 13.5, 17 13.5, 20 19" />
      <path d="M 8 16 L 8 19" opacity="0.6" />
      <path d="M 12 14.5 L 12 19" opacity="0.6" />
      <path d="M 16 16 L 16 19" opacity="0.6" />
      <rect x="6" y="4" width="12" height="8" rx="1.5" />
      <path d="M 6 4 L 12 8 L 18 4" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Multi-column Section */}
        <div className="footer-grid">
          {/* Brand & Direct Contact Column */}
          <div className="footer-col footer-col-brand">
            <Link to="/" className="footer-brand" aria-label="MailBridge Home">
              <span className="footer-logo-icon">
                <MailBridgeFooterLogo size={22} />
              </span>
              <span className="footer-brand-title">MailBridge</span>
            </Link>
            <p className="footer-tagline">
              Cold email outreach and transactional SMTP relay SaaS. Personalize CSV campaigns, track email opens in real time, and route directly via Google Workspace with 99.8% inbox placement.
            </p>
            <div className="footer-contact-list">
              <a href="mailto:support@mail-bridge.email" className="footer-contact-link" title="Send support email">
                <Mail size={15} className="contact-icon" />
                <span>support@mail-bridge.email</span>
              </a>
              <a href="tel:+18005550199" className="footer-contact-link" title="Call support line">
                <Phone size={15} className="contact-icon" />
                <span>+1 (800) 555-0199 (Support Hotline)</span>
              </a>
            </div>
          </div>

          {/* Product & Solutions Column */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Platform</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/bulk-mail" className="footer-link">
                  <FileSpreadsheet size={13} /> Bulk Mailer
                </Link>
              </li>
              <li>
                <Link to="/#spam-checker" className="footer-link">
                  <ShieldCheck size={13} /> Spam Inspector
                </Link>
              </li>
              <li>
                <Link to="/tester" className="footer-link">
                  <Terminal size={13} /> API Sandbox Tester
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="footer-link">
                  Outbound Telemetry
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers & Docs Column */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Developers</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/docs" className="footer-link">
                  <BookOpen size={13} /> API Documentation
                </Link>
              </li>
              <li>
                <Link to="/docs#send-email" className="footer-link">
                  Transactional SDK
                </Link>
              </li>
              <li>
                <Link to="/docs#sms-gateway" className="footer-link">
                  Carrier SMS Gateway
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/pateldeep04/Email-services-SaaS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  GitHub Repository <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Compliance</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link">
                  CAN-SPAM Guidelines
                </Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link">
                  DKIM &amp; SPF Verification
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Attribution Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            &copy; {currentYear} MailBridge Inc. All rights reserved. Zero vendor platform markups.
          </div>
          <div className="footer-credits">
            Crafted with{" "}
            <Heart size={14} style={{ color: "#ef233c", fill: "#ef233c", display: "inline", verticalAlign: "middle" }} /> by{" "}
            <a
              href="https://github.com/pateldeep04"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-author-link"
            >
              Deep Patel
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
