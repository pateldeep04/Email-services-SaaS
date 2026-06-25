import React from "react";
import { Heart } from "lucide-react";

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
          <a href="/docs" className="footer-link">Documentation</a>
          <a href="/tester" className="footer-link">API Tester</a>
          <a href="https://github.com/pateldeep04/Email-services-SaaS" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
