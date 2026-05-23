import React from "react";
import { Code2, Copy, CheckCircle } from "lucide-react";
import "../styles/Documentation.css";

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/emails/otp",
    title: "Send OTP",
    description: "Generate and send a 6-digit OTP code",
    request: {
      to: "user@example.com",
      purpose: "login"
    },
    response: {
      success: true,
      status: "sent",
      messageId: "...",
      logId: "...",
      expiresInMinutes: 10
    }
  },
  {
    method: "POST",
    path: "/api/v1/emails/verify-otp",
    title: "Verify OTP",
    description: "Verify a 6-digit OTP code sent to a recipient",
    request: {
      to: "user@example.com",
      code: "123456",
      purpose: "login"
    },
    response: {
      verified: true,
      message: "OTP verified successfully."
    }
  },
  {
    method: "POST",
    path: "/api/v1/emails/welcome",
    title: "Welcome Email",
    description: "Send onboarding email to new users",
    request: {
      to: "user@example.com",
      name: "John",
      company: "Acme Inc"
    },
    response: {
      success: true,
      status: "sent",
      messageId: "..."
    }
  },
  {
    method: "POST",
    path: "/api/v1/emails/forgot-password",
    title: "Password Reset",
    description: "Send password reset link",
    request: {
      to: "user@example.com",
      resetUrl: "https://app.example.com/reset?token=abc"
    },
    response: {
      success: true,
      status: "sent",
      messageId: "..."
    }
  },
  {
    method: "POST",
    path: "/api/v1/emails/notification",
    title: "Notification",
    description: "Send transactional notifications",
    request: {
      to: "user@example.com",
      title: "Order received",
      message: "Your order #123 has been placed"
    },
    response: {
      success: true,
      status: "sent",
      messageId: "..."
    }
  },
  {
    method: "POST",
    path: "/api/v1/emails/custom",
    title: "Custom Email",
    description: "Send custom branded emails",
    request: {
      to: "user@example.com",
      subject: "Custom message",
      message: "Your custom email content here"
    },
    response: {
      success: true,
      status: "sent",
      messageId: "..."
    }
  }
];

export function DocumentationPage() {
  const [copied, setCopied] = React.useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="docs-page">
      <section className="docs-header">
        <h1>API Documentation</h1>
        <p>Complete reference for MailBridge email endpoints</p>
      </section>

      <section className="docs-content">
        <div className="docs-nav">
          <div className="nav-section">
            <h3>Getting Started</h3>
            <a href="#auth">Authentication</a>
            <a href="#headers">Headers</a>
            <a href="#errors">Errors</a>
          </div>
          <div className="nav-section">
            <h3>Endpoints</h3>
            {endpoints.map((ep) => (
              <a key={ep.path} href={`#${ep.path}`}>{ep.title}</a>
            ))}
          </div>
        </div>

        <div className="docs-main">
          <div className="doc-section" id="auth">
            <h2>Authentication</h2>
            <p>All API requests require an API key passed in the headers:</p>
            <div className="code-block">
              <pre>x-api-key: your_api_key_here</pre>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard("x-api-key: your_api_key_here", "auth")}
              >
                {copied === "auth" ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="doc-section" id="headers">
            <h2>Request Headers</h2>
            <table className="headers-table">
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Content-Type</td>
                  <td>application/json</td>
                </tr>
                <tr>
                  <td>x-api-key</td>
                  <td>Your API key</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="doc-section" id="errors">
            <h2>Error Responses</h2>
            <p>The API returns standard HTTP status codes:</p>
            <table className="errors-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>200</td>
                  <td>Success</td>
                </tr>
                <tr>
                  <td>400</td>
                  <td>Bad request (invalid parameters)</td>
                </tr>
                <tr>
                  <td>401</td>
                  <td>Unauthorized (missing or invalid API key)</td>
                </tr>
                <tr>
                  <td>500</td>
                  <td>Server error</td>
                </tr>
              </tbody>
            </table>
          </div>

          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className="doc-section" id={endpoint.path}>
              <h2>{endpoint.title}</h2>
              <div className="endpoint-header">
                <span className="method">{endpoint.method}</span>
                <span className="path">{endpoint.path}</span>
              </div>
              <p>{endpoint.description}</p>

              <h3>Request</h3>
              <div className="code-block">
                <pre>{JSON.stringify(endpoint.request, null, 2)}</pre>
                <button
                  className="copy-btn"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(endpoint.request, null, 2), endpoint.path)
                  }
                >
                  {copied === endpoint.path ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <h3>Response</h3>
              <div className="code-block">
                <pre>{JSON.stringify(endpoint.response, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
