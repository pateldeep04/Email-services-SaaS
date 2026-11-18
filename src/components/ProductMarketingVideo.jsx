import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  FileSpreadsheet,
  Send,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Flame,
  Zap,
  Check,
  Server,
  Terminal,
  Smartphone
} from "lucide-react";
import "../styles/ProductMarketingVideo.css";

const CHAPTERS = [
  {
    id: 1,
    tag: "01 // SPREADSHEET INGESTION & AUTO-MAPPING",
    shortLabel: "1. Import",
    headline: "Automated CSV & XLSX Parsing with Instant Variable Tagging",
    duration: 4.5
  },
  {
    id: 2,
    tag: "02 // DYNAMIC 1-ON-1 COLD OUTREACH",
    shortLabel: "2. Outreach",
    headline: "Personalized Dynamic Copy with 100% Unique Fingerprint",
    duration: 4.5
  },
  {
    id: 3,
    tag: "03 // DIRECT GMAIL SMTP TLS 1.3 RELAY",
    shortLabel: "3. SMTP Relay",
    headline: "Zero-Markup Direct Handshake with Sub-74ms Wire Latency",
    duration: 4.5
  },
  {
    id: 4,
    tag: "04 // REAL-TIME TELEMETRY & EDGE TRACKING",
    shortLabel: "4. Telemetry",
    headline: "Zero-Latency Open & Click Tracking Pixel with Live Event Stream",
    duration: 4.5
  },
  {
    id: 5,
    tag: "05 // COLD LEAD PIPELINE QUALIFIER",
    shortLabel: "5. Lead Score",
    headline: "Automated Prospect Scoring for Instant High-Value Sales Closing",
    duration: 4.5
  },
  {
    id: 6,
    tag: "06 // DELIVERABILITY & SPAM SHIELD",
    shortLabel: "6. Spam Shield",
    headline: "SPF, DKIM & DMARC Authentication with 99.8% Inbox Placement",
    duration: 4.5
  },
  {
    id: 7,
    tag: "07 // DEVELOPER SUITE & CELLULAR SMS OTP",
    shortLabel: "7. API & SMS",
    headline: "Multi-Language REST APIs & Free Cellular Gateway SMS Relay",
    duration: 4.5
  }
];

const TOTAL_DURATION = CHAPTERS.reduce((sum, ch) => sum + ch.duration, 0); // 31.5s

export function ProductMarketingVideo() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animationFrameRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  // Timeline loop
  useEffect(() => {
    if (!isPlaying) return;

    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setCurrentTime(prevTime => {
        let newTime = prevTime + delta;
        if (newTime >= TOTAL_DURATION) {
          newTime = 0; // Loop seamlessly
        }

        // Calculate which chapter this corresponds to
        let accumulated = 0;
        let foundIndex = 0;
        for (let i = 0; i < CHAPTERS.length; i++) {
          if (newTime >= accumulated && newTime < accumulated + CHAPTERS[i].duration) {
            foundIndex = i;
            break;
          }
          accumulated += CHAPTERS[i].duration;
        }

        setActiveChapterIndex(foundIndex);
        return newTime;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeChapter = CHAPTERS[activeChapterIndex];

  // Helper to jump directly to a chapter
  const jumpToChapter = (index) => {
    let accumulated = 0;
    for (let i = 0; i < index; i++) {
      accumulated += CHAPTERS[i].duration;
    }
    setCurrentTime(accumulated);
    setActiveChapterIndex(index);
  };

  const handleNext = () => {
    const nextIdx = (activeChapterIndex + 1) % CHAPTERS.length;
    jumpToChapter(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (activeChapterIndex - 1 + CHAPTERS.length) % CHAPTERS.length;
    jumpToChapter(prevIdx);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setActiveChapterIndex(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Format time as 00:SS
  const formatTime = (secs) => {
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  const progressPercent = (currentTime / TOTAL_DURATION) * 100;

  return (
    <div className="mkt-video-card">
      {/* Player Topbar */}
      <div className="mkt-video-header">
        <div className="mkt-header-left">
          <span className="mkt-live-dot" />
          <span className="mkt-title-text">PRODUCT FEATURES VIDEO SHOWCASE</span>
        </div>

        <div className="mkt-header-right">
          {isPlaying && (
            <div className="mkt-audio-wave" title="Audio / Stream Active">
              <span className="mkt-audio-bar" />
              <span className="mkt-audio-bar" />
              <span className="mkt-audio-bar" />
              <span className="mkt-audio-bar" />
            </div>
          )}
          <span className="mkt-timecode">
            {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
          </span>
          <span className="mkt-quality-badge">4K ULTRA-HD</span>
        </div>
      </div>

      {/* Main Animated Cinema Screen */}
      <div className="mkt-video-stage" onClick={togglePlay}>
        <div className="mkt-scene-container" key={activeChapter.id}>
          {/* Chapter header */}
          <div className="mkt-scene-header">
            <span className="mkt-chapter-tag">{activeChapter.tag}</span>
            <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
              STEP {activeChapter.id} OF {CHAPTERS.length}
            </span>
          </div>

          <div className="mkt-feature-headline">{activeChapter.headline}</div>

          {/* Dynamic Scene Visuals */}
          {activeChapter.id === 1 && (
            <div className="mkt-sheet-card">
              <div className="mkt-sheet-filebar">
                <span className="mkt-file-title">
                  <FileSpreadsheet size={15} style={{ color: "#2563eb" }} /> enterprise_q4_leads.xlsx
                </span>
                <span className="mkt-count-badge">250 Leads Detected</span>
              </div>
              <div className="mkt-bar-track">
                <div className="mkt-bar-fill" />
              </div>
              <div className="mkt-tags-row">
                <span className="mkt-tag-chip blue">{"{{firstname}}"} &rarr; Sarah</span>
                <span className="mkt-tag-chip red">{"{{company}}"} &rarr; Acme Corp</span>
                <span className="mkt-tag-chip emerald">{"{{role}}"} &rarr; VP Growth</span>
                <span className="mkt-tag-chip">{"{{email}}"} &rarr; Verified</span>
              </div>
            </div>
          )}

          {activeChapter.id === 2 && (
            <div className="mkt-email-preview-card">
              <div className="mkt-email-recipient">
                To: <span style={{ color: "#ffffff" }}>sarah.jenkins@acmecorp.com</span> &bull; Status: Queued
              </div>
              <div className="mkt-email-subject">
                Subject: Question regarding <span className="mkt-highlight-red">Acme Corp</span> outbound pipeline
              </div>
              <div className="mkt-email-body">
                Hi <span className="mkt-highlight-blue">Sarah</span>, noticed your growth team is scaling outreach. MailBridge bypasses vendor markups with direct Gmail SMTP and 99.8% deliverability...
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontSize: "11px", fontWeight: 600 }}>
                <Check size={12} /> 100% Unique Merged Copy &bull; Zero Spam Triggers
              </div>
            </div>
          )}

          {activeChapter.id === 3 && (
            <div className="mkt-relay-diagram">
              <div className="mkt-wire-nodes">
                <span className="mkt-node-pill">
                  <Server size={13} style={{ color: "#60a5fa" }} /> Your App
                </span>
                <div className="mkt-wire-line">
                  <div className="mkt-wire-packet" />
                </div>
                <span className="mkt-node-pill" style={{ borderColor: "#2563eb", background: "rgba(37,99,235,0.2)" }}>
                  <Lock size={13} style={{ color: "#38bdf8" }} /> TLS 1.3
                </span>
                <div className="mkt-wire-line">
                  <div className="mkt-wire-packet" style={{ animationDelay: "0.7s" }} />
                </div>
                <span className="mkt-node-pill" style={{ borderColor: "#10b981" }}>
                  <Mail size={13} style={{ color: "#10b981" }} /> Gmail SMTP
                </span>
              </div>
              <div className="mkt-relay-footer">
                <span>DKIM 2048-bit RSA Signed</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}><Zap size={11} style={{ display: "inline" }} /> Sub-74ms Dispatch</span>
                <span style={{ color: "#ef233c", fontWeight: 700 }}>$0/mo Relay Markup</span>
              </div>
            </div>
          )}

          {activeChapter.id === 4 && (
            <div>
              <div className="mkt-telemetry-grid">
                <div className="mkt-telemetry-box">
                  <div className="mkt-telemetry-val green">148 Opens</div>
                  <div className="mkt-telemetry-sub">59.2% Open Rate (Live Pixel)</div>
                </div>
                <div className="mkt-telemetry-box">
                  <div className="mkt-telemetry-val blue">32 Clicks</div>
                  <div className="mkt-telemetry-sub">21.6% CTA Link Rate</div>
                </div>
              </div>
              <div className="mkt-live-toast">
                <Activity size={13} style={{ color: "#10b981" }} />
                <span><strong>Sarah Jenkins (Acme Corp)</strong> opened cold outreach email &bull; 3m ago</span>
              </div>
            </div>
          )}

          {activeChapter.id === 5 && (
            <div className="mkt-lead-card">
              <div className="mkt-lead-header">
                <div className="mkt-lead-user">
                  <div className="mkt-lead-avatar">SJ</div>
                  <div>
                    <div className="mkt-lead-name">Sarah Jenkins</div>
                    <div className="mkt-lead-org">VP Growth &bull; Acme Corp</div>
                  </div>
                </div>
                <span className="mkt-hot-badge">
                  <Flame size={12} /> HOT LEAD (CLICKED CTA)
                </span>
              </div>
              <div className="mkt-lead-details">
                <span>Interactions: <strong>4 Opens, 2 CTA Clicks</strong></span>
                <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={12} /> Ready for 1-on-1 closing
                </span>
              </div>
            </div>
          )}

          {activeChapter.id === 6 && (
            <div>
              <div className="mkt-dns-grid">
                <div className="mkt-dns-card">
                  <div className="mkt-dns-name">SPF Record</div>
                  <div className="mkt-dns-status"><Check size={11} /> PASS (Valid)</div>
                </div>
                <div className="mkt-dns-card">
                  <div className="mkt-dns-name">DKIM 2048-bit</div>
                  <div className="mkt-dns-status"><Check size={11} /> PASS (Signed)</div>
                </div>
                <div className="mkt-dns-card">
                  <div className="mkt-dns-name">DMARC Policy</div>
                  <div className="mkt-dns-status"><Check size={11} /> PASS (Enforced)</div>
                </div>
              </div>
              <div className="mkt-spam-meter-card">
                <span><ShieldCheck size={13} style={{ color: "#10b981", display: "inline", verticalAlign: "middle" }} /> Spam Trigger Score: <strong>0.0 / 100</strong></span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>99.8% Inbox Placement</span>
              </div>
            </div>
          )}

          {activeChapter.id === 7 && (
            <div className="mkt-dev-split">
              <div className="mkt-dev-terminal">
                <div style={{ color: "#60a5fa", marginBottom: "4px" }}>$ curl -X POST /api/v1/emails/otp</div>
                <div style={{ color: "#10b981" }}>HTTP/1.1 201 Created</div>
                <div style={{ color: "#94a3b8" }}>Latency: 64ms &bull; Direct Relay</div>
              </div>
              <div className="mkt-dev-sms">
                <div className="mkt-sms-phone-bubble">
                  <div style={{ color: "#ef233c", fontWeight: 700, fontSize: "9px", textTransform: "uppercase" }}>Cellular Gateway</div>
                  <span>Your Acme Corp OTP is: <strong>549301</strong> (exp: 10m)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Big play overlay if paused */}
        {!isPlaying && (
          <div className="mkt-play-overlay">
            <div className="mkt-play-btn-circle">
              <Play size={20} fill="currentColor" />
            </div>
            <span className="mkt-play-text">Click Anywhere to Resume Marketing Video</span>
          </div>
        )}
      </div>

      {/* Progress Timeline Scrubber */}
      <div 
        className="mkt-scrubber-track"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          const targetTime = ratio * TOTAL_DURATION;
          setCurrentTime(targetTime);
        }}
      >
        <div className="mkt-scrubber-progress" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Bottom Controls Bar */}
      <div className="mkt-video-footer">
        <div className="mkt-playback-controls">
          <button type="button" className="mkt-ctrl-btn" onClick={handlePrev} title="Previous feature">
            <SkipBack size={13} />
          </button>
          <button 
            type="button" 
            className={`mkt-ctrl-btn ${isPlaying ? "play-active" : ""}`} 
            onClick={togglePlay} 
            title={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
          </button>
          <button type="button" className="mkt-ctrl-btn" onClick={handleNext} title="Next feature">
            <SkipForward size={13} />
          </button>
          <button type="button" className="mkt-ctrl-btn" onClick={handleRestart} title="Replay from start">
            <RotateCcw size={13} />
          </button>
        </div>

        {/* 7 Chapter Selection Chips */}
        <div className="mkt-chapter-chips-row">
          {CHAPTERS.map((ch, idx) => (
            <button
              key={ch.id}
              type="button"
              className={`mkt-chip ${activeChapterIndex === idx ? "active" : ""}`}
              onClick={() => jumpToChapter(idx)}
            >
              {ch.shortLabel}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductMarketingVideo;
