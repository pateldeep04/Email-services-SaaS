import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, Heart, ExternalLink, ShieldCheck, Github } from "lucide-react";
import "../styles/Footer.css";

function MailBridgeFooterLogo({ size = 22 }) {
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
      style={{ display: "inline-block", verticalAlign: "middle", color: "#ef233c" }}
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
        {/* Brand & Mission Column */}
        <div className="footer-col footer-col-brand">
          <Link to="/" className="footer-brand" title="MailBridge Home">
            <MailBridgeFooterLogo size={24} />
            <span className="footer-brand-name">MailBridge</span>
          </Link>
          <p className="footer-tagline">
            High-converting cold email outreach engine and developer Gmail SMTP transactional relay. Zero monthly vendor fees.
          </p>
          <div className="footer-contacts">
            <a href="mailto:support@mail-bridge.email" className="footer-contact-item" title="Send email to MailBridge support">
              <Mail size={14} className="footer-contact-icon" />
              <span>support@mail-bridge.email</span>
            </a>
            <a href="tel:+18005550199" className="footer-contact-item" title="Call MailBridge customer helpline">
              <Phone size={14} className="footer-contact-icon" />
              <span>+1 (800) 555-0199</span>
            </a>
          </div>
        </div>

        {/* Product Navigation */}
        <div className="footer-col footer-col-platform">
          <h4 className="footer-heading">Platform</h4>
          <ul className="footer-nav-list">
            <li><Link to="/" className="footer-link">Home</Link></li>
            <li><Link to="/bulk-mail" className="footer-link">Bulk Mailer</Link></li>
            <li><a href="/#spam-checker" className="footer-link">Spam Inspector</a></li>
            <li><Link to="/tester" className="footer-link">API Live Tester</Link></li>
            <li><Link to="/dashboard" className="footer-link">Campaign Dashboard</Link></li>
          </ul>
        </div>

        {/* Resources & Docs */}
        <div className="footer-col footer-col-developers">
          <h4 className="footer-heading">Developers</h4>
          <ul className="footer-nav-list">
            <li><Link to="/docs" className="footer-link">API Documentation</Link></li>
            <li><a href="https://github.com/pateldeep04/Email-services-SaaS" target="_blank" rel="noopener noreferrer" className="footer-link footer-ext-link">
              GitHub Repository <ExternalLink size={12} />
            </a></li>
            <li><Link to="/docs#smtp" className="footer-link">Gmail SMTP Relay</Link></li>
            <li><Link to="/docs#webhook" className="footer-link">Event Webhooks</Link></li>
          </ul>
        </div>

        {/* Legal & Trust */}
        <div className="footer-col footer-col-legal">
          <h4 className="footer-heading">Legal & Trust</h4>
          <ul className="footer-nav-list">
            <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
            <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
            <li><span className="footer-compliance-badge"><ShieldCheck size={13} /> CAN-SPAM Compliant</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="footer-copyright">
            &copy; {currentYear} MailBridge Platform. All rights reserved.
          </div>
          <div className="footer-credit">
            Engineered with <Heart size={13} className="footer-heart-icon" /> by{" "}
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

export default Footer;
