import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, LogOut, Sun, Moon, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
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
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path ? "active" : "";

  const handleLinkClick = () => setIsMenuOpen(false);
  const handleLogoutClick = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="app-navbar">
      <div className="app-nav-container">
        <Link to="/" className="app-nav-brand" onClick={handleLinkClick}>
          <MailBridgeLogo size={24} />
          <span>MailBridge</span>
        </Link>
        
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`app-nav-menu-wrapper ${isMenuOpen ? "open" : ""}`}>
          <div className="nav-menu-content">
            <div className="app-nav-links">
              <Link to="/" className={`app-nav-link ${isActive("/")}`} onClick={handleLinkClick}>Home</Link>
              <Link to="/docs" className={`app-nav-link ${isActive("/docs")}`} onClick={handleLinkClick}>Documentation</Link>
              <Link to="/tester" className={`app-nav-link ${isActive("/tester")}`} onClick={handleLinkClick}>API Tester</Link>
            </div>

            <div className="app-nav-auth">
              <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {user ? (
                <>
                  <span className="user-name">{user.name}</span>
                  <Link to="/dashboard" className={`app-nav-link ${isActive("/dashboard")}`} onClick={handleLinkClick}>Dashboard</Link>
                  <button className="logout-btn" onClick={handleLogoutClick}>
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={`app-nav-link ${isActive("/login")}`} onClick={handleLinkClick}>Login</Link>
                  <Link to="/register" className="app-nav-button register-btn" onClick={handleLinkClick}>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
