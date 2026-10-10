import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useSEO } from "../hooks/useSEO.js";
import { Mail, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, Lock } from "lucide-react";
import "../styles/Auth.css";

export function RegisterPage() {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Field validation errors
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [error, setError] = useState("");
  const [otpNotice, setOtpNotice] = useState("");

  const { register, sendRegisterOtp, loginWithGoogle, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  useSEO({
    title: "Create Account | MailBridge",
    description: "Sign up for MailBridge with verified email OTP. Transmit emails and SMS with high deliverability and zero platform fees.",
    keywords: "register mailbridge, create mailbridge account, email api signup",
    noindex: true
  });

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "google-client-id-placeholder";

  // Resend OTP countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleGoogleCallback(response) {
    if (!response || !response.credential) {
      console.warn("Google Sign-In: No credential received.");
      return;
    }
    setError("");
    try {
      await loginWithGoogle(response.credential);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Google Sign-In failed. Please try email login instead.");
    }
  }

  useEffect(() => {
    if (!isGoogleConfigured || step !== "form") return;

    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const initGoogle = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
          });

          const btn = document.getElementById("googleBtn");
          if (btn) {
            window.google.accounts.id.renderButton(btn, {
              theme: theme === "dark" ? "filled_black" : "outline",
              size: "large",
              width: "340",
              shape: "rectangular",
            });
          }
        } catch (err) {
          console.error("Google Sign-In initialization failed:", err);
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      if (window.google) {
        initGoogle();
      } else {
        script.addEventListener("load", initGoogle);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener("load", initGoogle);
      }
    };
  }, [theme, isGoogleConfigured, step]);

  // Step 1: Validate initial form and send OTP
  async function handleInitiateRegister(e) {
    e.preventDefault();
    setError("");
    setEmailError("");
    setNameError("");
    setCompanyNameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");

    let isValid = true;

    if (!email) {
      setEmailError("Please enter your email address.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!name.trim()) {
      setNameError("Please enter your full name.");
      isValid = false;
    }

    if (!companyName.trim()) {
      setCompanyNameError("Please enter your company or brand name.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Please create a password.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (!termsAccepted) {
      setTermsError("You must agree to the Terms of Service & Privacy Policy to create an account.");
      isValid = false;
    }

    if (!isValid) return;

    try {
      const res = await sendRegisterOtp(email, name, companyName);
      setStep("otp");
      setResendCooldown(60);
      if (res.debugOtp) {
        setOtpNotice(`Demo Sandbox Mode: OTP is ${res.debugOtp}`);
      } else {
        setOtpNotice("");
      }
    } catch (err) {
      setError(err.message || "Failed to initiate registration.");
    }
  }

  // Resend verification OTP
  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const res = await sendRegisterOtp(email, name, companyName);
      setResendCooldown(60);
      if (res.debugOtp) {
        setOtpNotice(`Demo Sandbox Mode: OTP is ${res.debugOtp}`);
      }
    } catch (err) {
      setError(err.message || "Failed to resend verification code.");
    }
  }

  // Step 2: Verify OTP and finalize registration
  async function handleVerifyAndRegister(e) {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    try {
      await register(email, name, password, companyName, otp.trim());
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Verification failed. Please check your code and try again.");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: step === "otp" ? "440px" : "480px" }}>
        {step === "form" ? (
          <>
            <h1>Create Account</h1>
            <p className="auth-subtitle">Verify your identity and start sending emails with MailBridge</p>

            <form onSubmit={handleInitiateRegister} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder="e.g. Sarah Jenkins"
                  className={nameError ? "is-invalid" : name ? "is-valid" : ""}
                />
                {nameError && <div className="invalid-feedback">{nameError}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Work Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="you@company.com"
                  className={emailError ? "is-invalid" : email ? "is-valid" : ""}
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="companyName">Company / Brand Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (companyNameError) setCompanyNameError("");
                  }}
                  placeholder="e.g. Acme Corp"
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
                  placeholder="Minimum 6 characters"
                  className={passwordError ? "is-invalid" : password ? "is-valid" : ""}
                />
                {passwordError && <div className="invalid-feedback">{passwordError}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
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

              {/* Terms and Conditions Checkbox */}
              <div style={{ marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "var(--text-main, #4b5563)", cursor: "pointer", lineHeight: "1.5" }}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (termsError) setTermsError("");
                    }}
                    style={{ marginTop: "3px", accentColor: "#0f766e", width: "16px", height: "16px" }}
                  />
                  <span>
                    I agree to the{" "}
                    <Link to="/terms" target="_blank" style={{ color: "#0f766e", fontWeight: 600, textDecoration: "underline" }}>
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" target="_blank" style={{ color: "#0f766e", fontWeight: 600, textDecoration: "underline" }}>
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
                {termsError && <div className="invalid-feedback" style={{ display: "block", marginTop: "4px" }}>{termsError}</div>}
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Sending verification code..." : "Verify Email & Continue →"}
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
              Already have an account? <Link to="/login" state={{ from }}>Login</Link>
            </p>
          </>
        ) : (
          /* Step 2: Email OTP Verification Card */
          <>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                background: "rgba(15, 118, 110, 0.12)",
                color: "#0f766e",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px"
              }}>
                <Mail size={28} />
              </div>
              <h1 style={{ fontSize: "24px", marginBottom: "6px" }}>Verify Your Email</h1>
              <p className="auth-subtitle" style={{ marginBottom: "8px" }}>
                We've sent a 6-digit confirmation code to:
              </p>
              <div style={{
                display: "inline-block",
                background: "rgba(15, 118, 110, 0.08)",
                padding: "4px 12px",
                borderRadius: "6px",
                fontWeight: 700,
                color: "#0f766e",
                fontSize: "14px"
              }}>
                {email}
              </div>
            </div>

            {otpNotice && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "#2563eb",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "16px",
                textAlign: "center"
              }}>
                {otpNotice}
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister} className="auth-form">
              <div className="form-group">
                <label htmlFor="otp" style={{ textAlign: "center" }}>Enter 6-Digit OTP Code</label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  style={{
                    fontSize: "24px",
                    letterSpacing: "6px",
                    textAlign: "center",
                    fontWeight: 700,
                    padding: "12px",
                    fontFamily: "monospace"
                  }}
                  autoFocus
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying & Creating..." : "Complete Registration ✓"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "13px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: 0
                  }}
                >
                  <ArrowLeft size={14} /> Back to details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendCooldown > 0 ? "#9ca3af" : "#0f766e",
                    cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: 0
                  }}
                >
                  <RefreshCw size={14} />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
