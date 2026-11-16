import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Phone, LogOut, Menu, X, Shield, FileSpreadsheet, ShieldCheck, BookOpen, Terminal, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Navbar.css";

function MailBridgeLogo({ size = 24, className }) {
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
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {/* Bridge Arch */}
      <path d="M 4 19 C 7 13.5, 17 13.5, 20 19" />
      {/* Pillars */}
      <path d="M 8 16 L 8 19" opacity="0.6" />
      <path d="M 12 14.5 L 12 19" opacity="0.6" />
      <path d="M 16 16 L 16 19" opacity="0.6" />
      {/* Floating Envelope */}
      <rect x="6" y="4" width="12" height="8" rx="1.5" />
      {/* Flap */}
      <path d="M 6 4 L 12 8 L 18 4" />
    </svg>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change & handle escape key
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleLinkClick = () => setIsMenuOpen(false);

  const handleLogoutClick = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSpamInspectorClick = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById("spam-checker");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/#spam-checker");
    }
  };

  return (
    <>
      <nav className="app-navbar">
        <div className="app-nav-container">
          {/* Clickable Brand Logo */}
          <Link to="/" className="app-nav-brand" onClick={handleLinkClick} aria-label="MailBridge Home">
            <span className="nav-logo-badge">
              <MailBridgeLogo size={22} />
            </span>
            <span className="nav-brand-title">MailBridge</span>
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Navigation Links & Action Controls */}
          <div className={`app-nav-menu-wrapper ${isMenuOpen ? "open" : ""}`}>
            <div className="nav-menu-content">
              <div className="app-nav-links">
                <Link to="/" className={`app-nav-link ${isActive("/")}`} onClick={handleLinkClick}>
                  Home
                </Link>
                <Link to="/bulk-mail" className={`app-nav-link ${isActive("/bulk-mail")}`} onClick={handleLinkClick}>
                  Bulk Mailer
                </Link>
                <a href="/#spam-checker" className="app-nav-link" onClick={handleSpamInspectorClick}>
                  Spam Inspector
                </a>
                <Link to="/docs" className={`app-nav-link ${isActive("/docs")}`} onClick={handleLinkClick}>
                  Documentation
                </Link>
                <Link to="/tester" className={`app-nav-link ${isActive("/tester")}`} onClick={handleLinkClick}>
                  API Tester
                </Link>
              </div>

              <div className="app-nav-auth">
                {user ? (
                  <>
                    <span className="user-name">{user.name}</span>
                    <Link to="/dashboard" className={`app-nav-link ${isActive("/dashboard")}`} onClick={handleLinkClick}>
                      Dashboard
                    </Link>
                    {(user.role === "admin" || user.role === "superadmin") && (
                      <Link
                        to="/admin"
                        className={`app-nav-link ${isActive("/admin")}`}
                        onClick={handleLinkClick}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontWeight: 700,
                          color: "#ef233c"
                        }}
                      >
                        <Shield size={14} /> Admin
                      </Link>
                    )}
                    <button type="button" className="logout-btn" onClick={handleLogoutClick}>
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={`app-nav-link ${isActive("/login")}`} onClick={handleLinkClick}>
                      Login
                    </Link>
                    <Link to="/register" className="app-nav-button register-btn" onClick={handleLinkClick}>
                      Create Account <ArrowRight size={14} />
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Drawer Footer Contacts */}
              <div className="mobile-drawer-contact">
                <a href="mailto:support@mail-bridge.email" className="mobile-contact-pill">
                  <Mail size={13} /> support@mail-bridge.email
                </a>
                <a href="tel:+18005550199" className="mobile-contact-pill">
                  <Phone size={13} /> +1 (800) 555-0199
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      {isMenuOpen && (
        <div
          className="app-nav-backdrop"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
