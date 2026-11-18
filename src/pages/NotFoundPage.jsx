import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, Send, BookOpen, Terminal, AlertCircle, HelpCircle } from "lucide-react";
import { useSEO } from "../hooks/useSEO.js";
import "../styles/NotFound.css";

export function NotFoundPage() {
  useSEO({
    title: "404 - Page Not Found | MailBridge",
    description: "The page you are looking for does not exist or has been moved. Explore MailBridge bulk email outreach and API documentation.",
    noindex: true
  });

  return (
    <div className="notfound-container">
      <div className="notfound-radial-glow" />
      <div className="notfound-card">
        <div className="notfound-badge">
          <AlertCircle size={15} /> 404 Status Code
        </div>
        
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Lost in the Outreach Stream?</h1>
        <p className="notfound-desc">
          The page or endpoint you are looking for doesn't exist, was relocated, or the URL might have a typo.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="notfound-btn-primary">
            <Home size={16} /> Return to Homepage
          </Link>
          <Link to="/bulk-mail" className="notfound-btn-secondary">
            <Send size={16} /> Bulk Mailer
          </Link>
          <Link to="/docs" className="notfound-btn-secondary">
            <BookOpen size={16} /> API Docs
          </Link>
        </div>

        <div className="notfound-links-grid">
          <Link to="/tester" className="notfound-link-item">
            <span className="title">Interactive API Tester</span>
            <span className="desc">Test SMTP & OTP payloads live</span>
          </Link>
          <Link to="/terms" className="notfound-link-item">
            <span className="title">Platform Policies</span>
            <span className="desc">Terms of service & privacy terms</span>
          </Link>
          <Link to="/login" className="notfound-link-item">
            <span className="title">Developer Sign In</span>
            <span className="desc">Access campaign dashboard</span>
          </Link>
        </div>

        <div className="notfound-help">
          Need assistance? Email our engineering team at{" "}
          <a href="mailto:support@mail-bridge.email">support@mail-bridge.email</a> or call{" "}
          <a href="tel:+18005550199">+1 (800) 555-0199</a>.
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
