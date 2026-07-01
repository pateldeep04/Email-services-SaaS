import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useSEO } from "../hooks/useSEO.js";
import "../styles/Auth.css";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");
  const { register, loginWithGoogle, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useSEO({
    title: "Create Account | MailBridge",
    description: "Sign up for MailBridge to start sending transactional emails and SMS verifications via Gmail SMTP with zero platform fees.",
    keywords: "register mailbridge, create mailbridge account, email api signup"
  });

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "google-client-id-placeholder";

  async function handleGoogleCallback(response) {
    // Guard: if Google returns no credential (e.g. origin_mismatch error), abort silently
    if (!response || !response.credential) {
      console.warn("Google Sign-In: No credential received (possible origin_mismatch error).");
      return;
    }
    setError("");
    try {
      await loginWithGoogle(response.credential);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google Sign-In failed. Please try email login instead.");
    }
  }

  useEffect(() => {
    if (!isGoogleConfigured) {
      console.warn("Google OAuth Client ID is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.");
      return;
    }

    if (typeof window !== "undefined" && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          {
            theme: theme === "dark" ? "filled_black" : "outline",
            size: "large",
            width: "340",
            shape: "rectangular",
          }
        );
      } catch (err) {
        console.error("Google Sign-In initialization failed:", err);
      }
    }
  }, [theme, isGoogleConfigured]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setEmailError("");
    setNameError("");
    setCompanyNameError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let isValid = true;

    if (!email) {
      setEmailError("Please fill in this field.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!name.trim()) {
      setNameError("Please fill in this field.");
      isValid = false;
    }

    if (!companyName.trim()) {
      setCompanyNameError("Please fill in this field.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Please fill in this field.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please fill in this field.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (!isValid) return;

    try {
      await register(email, name, password, companyName);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-subtitle">Join MailBridge to send transactional emails</p>
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="you@example.com"
              className={emailError ? "is-invalid" : email ? "is-valid" : ""}
            />
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="Your name"
              className={nameError ? "is-invalid" : name ? "is-valid" : ""}
            />
            {nameError && <div className="invalid-feedback">{nameError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company name</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (companyNameError) setCompanyNameError("");
              }}
              placeholder="Your company / brand name"
              className={companyNameError ? "is-invalid" : companyName ? "is-valid" : ""}
            />
            {companyNameError && <div className="invalid-feedback">{companyNameError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              placeholder="••••••••"
              className={passwordError ? "is-invalid" : password ? "is-valid" : ""}
            />
            {passwordError && <div className="invalid-feedback">{passwordError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError("");
              }}
              placeholder="••••••••"
              className={confirmPasswordError ? "is-invalid" : confirmPassword ? "is-valid" : ""}
            />
            {confirmPasswordError && <div className="invalid-feedback">{confirmPasswordError}</div>}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <div className="google-btn-container">
          {isGoogleConfigured ? (
            <div id="googleBtn"></div>
          ) : (
            <button className="btn btn-secondary google-placeholder-btn" disabled title="Configure VITE_GOOGLE_CLIENT_ID in your .env file to enable Google authentication">
              <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '8px' }} xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          )}
        </div>

        <p className="auth-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
