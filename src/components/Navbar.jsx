import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import "../styles/Navbar.css";

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <Mail size={24} />
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
