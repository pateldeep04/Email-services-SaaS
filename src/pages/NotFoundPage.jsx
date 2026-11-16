import React from "react";
import { Link } from "react-router-dom";
import { Home, FileSpreadsheet, BookOpen, Terminal, Mail, Phone, ArrowLeft } from "lucide-react";
import { useSEO } from "../hooks/useSEO.js";
import "../styles/NotFound.css";

export function NotFoundPage() {
  useSEO({
    title: "404 - Page Not Found | MailBridge",
    description: "The page you are looking for does not exist or has been moved. Explore MailBridge bulk mailer, API documentation, or return home.",
    noindex: true
  });

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-badge">
          <span>HTTP 404 // RESOURCE NOT FOUND</span>
        </div>

        <div className="notfound-code">404</div>

        <h1 className="notfound-title">Page Not Found</h1>

        <p className="notfound-desc">
          We couldn't locate the requested endpoint or resource on the MailBridge infrastructure. The link may be broken, or the page may have been moved or archived.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="notfound-btn-primary">
            <Home size={16} /> Return to Home
          </Link>
          <Link to="/bulk-mail" className="notfound-btn-secondary">
            <FileSpreadsheet size={16} /> Bulk Mailer
          </Link>
          <Link to="/docs" className="notfound-btn-secondary">
            <BookOpen size={16} /> API Docs
          </Link>
          <Link to="/tester" className="notfound-btn-secondary">
            <Terminal size={16} /> API Tester
          </Link>
        </div>

        <div className="notfound-support-bar">
          <span>Need assistance locating a service or documentation?</span>
          <div className="notfound-contact-links">
            <a href="mailto:support@mail-bridge.email">
              <Mail size={14} /> support@mail-bridge.email
            </a>
            <a href="tel:+18005550199">
              <Phone size={14} /> +1 (800) 555-0199
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
