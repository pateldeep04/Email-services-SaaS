import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSEO } from "../hooks/useSEO.js";
import "../styles/Admin.css";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { adminLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin";

  useSEO({
    title: "Security Console | MailBridge",
    description: "Restricted administrative gateway for the MailBridge infrastructure.",
    noindex: true
  });

  // If already logged in as admin, redirect to admin panel
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "superadmin")) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please provide both administrator email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminLogin(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to authenticate administrator account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-glow" />

      <div className="admin-login-card">
        <div className="admin-badge-header">
          <Shield size={14} /> Security Gateway
        </div>

        <div className="admin-login-header">
          <h1 className="admin-login-title">Administrator Portal</h1>
          <p className="admin-login-subtitle">
            Restricted access point. Sign in with administrative credentials to manage MailBridge infrastructure.
          </p>
        </div>

        {error && (
          <div className="admin-error-box" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-input-group">
            <label className="admin-input-label" htmlFor="admin-email">
              Administrator Email
            </label>
            <div className="admin-input-container">
              <Mail size={18} className="admin-input-icon" />
              <input
                id="admin-email"
                type="email"
                className="admin-input"
                placeholder="administrator@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label" htmlFor="admin-password">
              Master Password
            </label>
            <div className="admin-input-container">
              <Lock size={18} className="admin-input-icon" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                className="admin-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
          <span>Not an admin? </span>
          <Link to="/login" style={{ color: "#2dd4bf", textDecoration: "none", fontWeight: 600 }}>
            Standard Client Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

