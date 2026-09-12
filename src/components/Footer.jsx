import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import "../styles/Footer.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-text">
          &copy; {currentYear} MailBridge. Made with{" "}
          <Heart size={14} style={{ color: "#ef4444", display: "inline", fill: "#ef4444", verticalAlign: "middle" }} /> by{" "}
          <a
            href="https://github.com/pateldeep04"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-author"
          >
            Deep Patel
          </a>
        </div>
        <div className="footer-links">
          <Link to="/bulk-mail" className="footer-link">Bulk Mailer</Link>
          <Link to="/docs" className="footer-link">Documentation</Link>
          <Link to="/tester" className="footer-link">API Tester</Link>
          <a href="https://github.com/pateldeep04/Email-services-SaaS" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

