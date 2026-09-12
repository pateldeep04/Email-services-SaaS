import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import "../styles/DeliverabilityInspector.css";

const SPAM_TRIGGER_WORDS = [
  { word: "100% free", severity: "high", reason: "Overpromising guarantee" },
  { word: "free", severity: "medium", reason: "Frequent promotional trigger" },
  { word: "guaranteed", severity: "high", reason: "Aggressive sales claim" },
  { word: "risk-free", severity: "high", reason: "Spam filter red flag" },
  { word: "risk free", severity: "high", reason: "Spam filter red flag" },
  { word: "urgent", severity: "high", reason: "False urgency manipulation" },
  { word: "act now", severity: "high", reason: "High-frequency sales trigger" },
  { word: "make money", severity: "high", reason: "Financial opportunity spam" },
  { word: "earn cash", severity: "high", reason: "Financial opportunity spam" },
  { word: "double your", severity: "high", reason: "Income exaggeration" },
  { word: "no cost", severity: "medium", reason: "Cost avoidance trigger" },
  { word: "no catch", severity: "high", reason: "Distrust signal" },
  { word: "winner", severity: "high", reason: "Lottery/contest spam" },
  { word: "congratulations", severity: "medium", reason: "Clickbait signal" },
  { word: "click here", severity: "high", reason: "Phishing pattern" },
  { word: "click below", severity: "medium", reason: "Link bait pattern" },
  { word: "exclusive deal", severity: "medium", reason: "Hard sales trigger" },
  { word: "limited time", severity: "medium", reason: "Artificial urgency" },
  { word: "special promotion", severity: "medium", reason: "Promotional tab trigger" },
  { word: "unlimited", severity: "medium", reason: "Overpromising term" },
  { word: "buy now", severity: "high", reason: "Direct commercial trigger" },
  { word: "order now", severity: "high", reason: "Commercial intent trigger" },
  { word: "apply now", severity: "medium", reason: "Loan/application spam" },
  { word: "cash bonus", severity: "high", reason: "Financial spam trigger" },
  { word: "hidden charges", severity: "medium", reason: "Distrust trigger" },
  { word: "no fees", severity: "medium", reason: "Promotional trigger" },
  { word: "miracle", severity: "high", reason: "Exaggeration trigger" },
  { word: "instant payout", severity: "high", reason: "Financial spam" }
];

const PRESET_TEMPLATES = [
  {
    name: "High-Converting Cold Pitch (98% Score)",
    subject: "Quick question regarding {{company}}'s outbound workflow",
    body: "Hi {{firstname}},\n\nNoticed {{company}}'s recent expansion in developer tooling. We helped teams scale outbound emails without vendor markups using direct Gmail SMTP relay.\n\nWould you be open to a 5-minute chat this Thursday to see if it's relevant?\n\nBest,\nDeep"
  },
  {
    name: "Spammy Email Example (Fix Me)",
    subject: "URGENT: 100% FREE GUARANTEED CASH BONUS FOR YOU!!!",
    body: "Congratulations winner! Act now to claim your risk-free exclusive deal. Click here to make money with zero cost and no catch before time runs out!"
  },
  {
    name: "Friendly Follow-Up (95% Score)",
    subject: "Any thoughts on our earlier note, {{firstname}}?",
    body: "Hi {{firstname}},\n\nWanted to check if you had a moment to review my previous email about streamlining {{company}}'s email delivery.\n\nHappy to share our quick benchmark numbers whenever convenient.\n\nRegards,\nDeep"
  }
];

export function DeliverabilityInspector() {
  const [subject, setSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [body, setBody] = useState(PRESET_TEMPLATES[0].body);
  const [previewDevice, setPreviewDevice] = useState("mobile"); // "mobile" | "desktop"
  const [activeTab, setActiveTab] = useState("inspector"); // "inspector" | "dns"
  const [copiedRecord, setCopiedRecord] = useState(null);

  // Analysis calculations
  const analysis = useMemo(() => {
    const combinedText = `${subject} ${body}`.toLowerCase();
    const detectedSpamWords = [];

    SPAM_TRIGGER_WORDS.forEach((item) => {
      const regex = new RegExp(`\\b${item.word}\\b`, "gi");
      const matches = combinedText.match(regex);
      if (matches) {
        detectedSpamWords.push({
          ...item,
          count: matches.length
        });
      }
    });

    // Check capitalization ratio in subject
    const subjectLetters = subject.replace(/[^a-zA-Z]/g, "");
    const capsLetters = subject.replace(/[^A-Z]/g, "");
    const capsRatio = subjectLetters.length > 0 ? capsLetters.length / subjectLetters.length : 0;
    const isAllCaps = capsRatio > 0.45 && subjectLetters.length > 8;

    // Check excessive punctuation (!!! or ???)
    const excessivePunctuation = /[!?]{2,}/.test(subject) || /[!?]{3,}/.test(body);

    // Subject length score (optimal: 30-50 chars for mobile visibility)
    const subjectLength = subject.length;
    const isSubjectTooLong = subjectLength > 60;
    const isSubjectTooShort = subjectLength > 0 && subjectLength < 15;

    // Has personalization merge tags?
    const hasMergeTags = /\{\{[a-zA-Z0-9_]+\}\}/.test(subject) || /\{\{[a-zA-Z0-9_]+\}\}/.test(body);

    // Calculate deliverability score out of 100
    let score = 100;
    
    // Deduct for spam words
    detectedSpamWords.forEach((item) => {
      if (item.severity === "high") score -= item.count * 15;
      else score -= item.count * 7;
    });

    if (isAllCaps) score -= 20;
    if (excessivePunctuation) score -= 15;
    if (isSubjectTooLong) score -= 10;
    if (isSubjectTooShort) score -= 8;
    if (!hasMergeTags && combinedText.length > 30) score -= 10;

    score = Math.max(12, Math.min(99, score));

    return {
      score,
      detectedSpamWords,
      isAllCaps,
      excessivePunctuation,
      subjectLength,
      isSubjectTooLong,
      isSubjectTooShort,
      hasMergeTags
    };
  }, [subject, body]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedRecord(label);
    setTimeout(() => setCopiedRecord(null), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#10b981"; // Emerald
    if (score >= 65) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Excellent (Direct to Primary Inbox)";
    if (score >= 65) return "Moderate (Risk of Promotions Tab)";
    return "Critical Risk (High Spam Filter Probability)";
  };

  return (
    <section className="deliverability-inspector-section" id="spam-checker">
      <div className="inspector-container">
        {/* Section Header */}
        <div className="inspector-header">
          <span className="inspector-badge">
            <Sparkles size={14} /> Free SEO & Deliverability Tool
          </span>
          <h2 className="inspector-title">
            Free Cold Email Spam Word & Deliverability Inspector
          </h2>
          <p className="inspector-subtitle">
            Rank in primary inboxes, avoid the spam folder, and preview how your cold emails render on mobile vs desktop before sending.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="inspector-presets-bar">
          <span className="presets-label">Quick Test Templates:</span>
          <div className="presets-buttons">
            {PRESET_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-preset-chip"
                onClick={() => {
                  setSubject(tmpl.subject);
                  setBody(tmpl.body);
                }}
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tool Navigation Tabs */}
        <div className="inspector-nav-tabs">
          <button
            type="button"
            className={`inspector-nav-tab ${activeTab === "inspector" ? "active" : ""}`}
            onClick={() => setActiveTab("inspector")}
          >
            <ShieldCheck size={18} /> Real-Time Spam Analyzer & Mobile Preview
          </button>
          <button
            type="button"
            className={`inspector-nav-tab ${activeTab === "dns" ? "active" : ""}`}
            onClick={() => setActiveTab("dns")}
          >
            <CheckCircle2 size={18} /> SPF, DKIM & DMARC DNS Checker
          </button>
        </div>

        {activeTab === "inspector" ? (
          <div className="inspector-main-grid">
            {/* Left Column: Inputs */}
            <div className="inspector-inputs-card">
              <div className="input-group">
                <div className="input-header-row">
                  <label htmlFor="subject-input" className="input-label">
                    Email Subject Line
                  </label>
                  <span className={`char-counter ${analysis.subjectLength > 55 ? "warn" : ""}`}>
                    {analysis.subjectLength} / 60 chars optimal
                  </span>
                </div>
                <input
                  id="subject-input"
                  type="text"
                  className="inspector-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Quick question regarding {{company}}'s outbound workflow"
                />
              </div>

              <div className="input-group">
                <div className="input-header-row">
                  <label htmlFor="body-input" className="input-label">
                    Email Body Content
                  </label>
                  <span className="char-counter">
                    {body.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  id="body-input"
                  rows={7}
                  className="inspector-textarea"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write or paste your cold email copy here..."
                />
              </div>

              {/* Detected Trigger Warnings */}
              <div className="analysis-summary-box">
                <h4 className="analysis-box-title">
                  <AlertTriangle size={16} /> 
                  {analysis.detectedSpamWords.length > 0 
                    ? `Detected ${analysis.detectedSpamWords.length} Spam Red Flags` 
                    : "No Harmful Spam Keywords Detected"}
                </h4>

                {analysis.detectedSpamWords.length > 0 ? (
                  <div className="spam-tags-list">
                    {analysis.detectedSpamWords.map((item, i) => (
                      <span key={i} className={`spam-tag tag-${item.severity}`}>
                        "{item.word}" ({item.reason})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="clean-status-text">
                    ✅ Your copy avoids high-risk sales triggers and phishing keywords.
                  </p>
                )}

                <div className="quick-tips-grid">
                  <div className={`tip-item ${analysis.hasMergeTags ? "good" : "warn"}`}>
                    {analysis.hasMergeTags ? "✓ Personalized ({{firstname}} tags detected)" : "⚠️ Add merge tags like {{company}} to improve reply rates"}
                  </div>
                  <div className={`tip-item ${analysis.isAllCaps ? "bad" : "good"}`}>
                    {analysis.isAllCaps ? "❌ Too many capital letters" : "✓ Clean typography"}
                  </div>
                  <div className={`tip-item ${analysis.excessivePunctuation ? "bad" : "good"}`}>
                    {analysis.excessivePunctuation ? "❌ Excessive punctuation (!!)" : "✓ Natural punctuation"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Score & Device Preview */}
            <div className="inspector-preview-card">
              {/* Deliverability Meter */}
              <div className="score-meter-panel">
                <div className="score-header">
                  <span className="score-title">Inbox Deliverability Health</span>
                  <span className="score-badge" style={{ color: getScoreColor(analysis.score), borderColor: getScoreColor(analysis.score) }}>
                    {analysis.score}% Health
                  </span>
                </div>

                <div className="meter-track">
                  <div 
                    className="meter-fill"
                    style={{ 
                      width: `${analysis.score}%`,
                      backgroundColor: getScoreColor(analysis.score)
                    }} 
                  />
                </div>
                <p className="score-verdict" style={{ color: getScoreColor(analysis.score) }}>
                  {getScoreLabel(analysis.score)}
                </p>
              </div>

              {/* Device Preview Toggle */}
              <div className="device-toggle-bar">
                <span className="preview-label">Live Preview:</span>
                <div className="device-buttons">
                  <button
                    type="button"
                    className={`device-btn ${previewDevice === "mobile" ? "active" : ""}`}
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    <Smartphone size={16} /> Mobile Notification
                  </button>
                  <button
                    type="button"
                    className={`device-btn ${previewDevice === "desktop" ? "active" : ""}`}
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    <Monitor size={16} /> Desktop Web Inbox
                  </button>
                </div>
              </div>

              {/* Live Render Simulator */}
              {previewDevice === "mobile" ? (
                <div className="mobile-phone-frame">
                  <div className="phone-notch" />
                  <div className="notification-card">
                    <div className="notif-header">
                      <div className="notif-app-icon">MB</div>
                      <span className="notif-app-name">MailBridge • Gmail</span>
                      <span className="notif-time">now</span>
                    </div>
                    <div className="notif-sender">Deep Patel</div>
                    <div className="notif-subject">
                      {subject.length > 42 ? `${subject.slice(0, 42)}...` : subject || "No subject"}
                    </div>
                    <div className="notif-snippet">
                      {body.slice(0, 75) || "No email body..."}...
                    </div>
                  </div>
                  <span className="mobile-cutoff-hint">
                    📱 Subject cuts off after ~42 chars on mobile lock screens.
                  </span>
                </div>
              ) : (
                <div className="desktop-inbox-frame">
                  <div className="desktop-inbox-header">
                    <div className="window-dots">
                      <span /><span /><span />
                    </div>
                    <span className="inbox-title">Gmail • Primary Inbox</span>
                  </div>
                  <div className="desktop-inbox-row">
                    <span className="inbox-sender">Deep Patel</span>
                    <span className="inbox-subject-line">
                      <strong>{subject || "(No subject)"}</strong>
                      <span className="inbox-body-preview"> - {body.slice(0, 80)}...</span>
                    </span>
                    <span className="inbox-time">10:42 AM</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* DNS Guidance Tab */
          <div className="inspector-dns-panel">
            <div className="dns-intro-card">
              <h3>🔑 Gmail SMTP Deliverability Checklist (SPF, DKIM, DMARC)</h3>
              <p>
                To achieve 99%+ deliverability when sending cold emails through Gmail SMTP relay, your sending domain should have authenticated DNS records:
              </p>
            </div>

            <div className="dns-records-grid">
              {/* SPF */}
              <div className="dns-record-card">
                <div className="dns-record-header">
                  <span className="record-badge">TXT Record</span>
                  <h4>SPF (Sender Policy Framework)</h4>
                </div>
                <p className="dns-desc">Authorizes Google's mail servers to dispatch emails on behalf of your custom domain.</p>
                <div className="record-code-box">
                  <code>v=spf1 include:_spf.google.com ~all</code>
                  <button 
                    type="button" 
                    className="btn-copy-code"
                    onClick={() => handleCopy("v=spf1 include:_spf.google.com ~all", "spf")}
                  >
                    {copiedRecord === "spf" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* DMARC */}
              <div className="dns-record-card">
                <div className="dns-record-header">
                  <span className="record-badge">TXT Record</span>
                  <h4>DMARC (Domain Message Authentication)</h4>
                </div>
                <p className="dns-desc">Protects your domain reputation from spoofing and guarantees primary inbox placement.</p>
                <div className="record-code-box">
                  <code>v=DMARC1; p=none; rua=mailto:dmarc-reports@mail-bridge.email</code>
                  <button 
                    type="button" 
                    className="btn-copy-code"
                    onClick={() => handleCopy("v=DMARC1; p=none; rua=mailto:dmarc-reports@mail-bridge.email", "dmarc")}
                  >
                    {copiedRecord === "dmarc" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* DKIM */}
              <div className="dns-record-card full-width">
                <div className="dns-record-header">
                  <span className="record-badge">Google Workspace / Gmail</span>
                  <h4>DKIM Signature Verification</h4>
                </div>
                <p className="dns-desc">
                  Generate your 2048-bit DKIM key inside <strong>Google Admin Console &gt; Apps &gt; Google Workspace &gt; Gmail &gt; Authenticate email</strong> to prevent cryptographic tampering.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
