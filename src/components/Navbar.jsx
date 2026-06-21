import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, LogOut, Sun, Moon } from "lucide-react";
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

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <MailBridgeLogo size={24} />
          <span>MailBridge</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/")}`}>Home</Link>
          <Link to="/docs" className={`nav-link ${isActive("/docs")}`}>Documentation</Link>
          <Link to="/tester" className={`nav-link ${isActive("/tester")}`}>API Tester</Link>
        </div>

        <div className="nav-auth">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <>
              <span className="user-name">{user.name}</span>
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard")}`}>Dashboard</Link>
              <button className="logout-btn" onClick={logout}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive("/login")}`}>Login</Link>
              <Link to="/register" className="nav-button register-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
