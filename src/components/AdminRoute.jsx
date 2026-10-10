import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

export function AdminRoute({ children }) {
  const { user, token, logout } = useAuth();
  const location = useLocation();

  if (!token && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user && user.role !== "admin" && user.role !== "superadmin") {
    return (
      <div style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          maxWidth: "480px",
          width: "100%",
          background: "var(--card-bg, #ffffff)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          borderRadius: "16px",
          padding: "36px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "rgba(239, 68, 68, 0.12)",
            color: "#dc2626",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
            Admin Privileges Required
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
            The account <strong>{user.email}</strong> is registered as a <em>Client</em> account and does not have administrative access to the MailBridge control portal.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link
              to="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "#0f766e",
                color: "#ffffff",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              <ArrowLeft size={16} /> Go to Dashboard
            </Link>
            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "#0f766e",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              Sign In as Admin
            </button>
            <button
              onClick={logout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                color: "#374151",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              <LogOut size={16} /> Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
