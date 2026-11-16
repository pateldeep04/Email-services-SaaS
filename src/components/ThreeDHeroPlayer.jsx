import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Play, Pause, RotateCw, Maximize2, ShieldCheck, FileSpreadsheet, Send, Activity, Eye, Check } from "lucide-react";

export function ThreeDHeroPlayer() {
  const [activeTab, setActiveTab] = useState("3d-engine"); // "3d-engine" | "video-walkthrough"
  
  // 3D Isometric Engine Canvas State
  const threeCanvasRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [active3dNode, setActive3dNode] = useState("relay");
  
  // 4K Walkthrough Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoStep, setVideoStep] = useState(1);

  // Auto-advance walkthrough video chapters
  useEffect(() => {
    if (!isVideoPlaying || activeTab !== "video-walkthrough") return;
    const interval = setInterval(() => {
      setVideoStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 3800);
    return () => clearInterval(interval);
  }, [isVideoPlaying, activeTab]);

  // -------------------------------------------------------------
  // THREE.JS INTERACTIVE 3D ISOMETRIC ENGINE (CANVAS MOCKUP)
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== "3d-engine") return;
    const container = threeCanvasRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    const width = container.clientWidth || 460;
    const height = 240;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 10, 16);
    camera.lookAt(0, 0, 0);

    // Isometric Main Platform
    const platformGeom = new THREE.CylinderGeometry(8, 8.5, 0.6, 6);
    const platformMat = new THREE.MeshBasicMaterial({
      color: 0x181b22,
      wireframe: isWireframe
    });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    scene.add(platform);

    // Platform Border Glow Ring
    const borderRingGeom = new THREE.RingGeometry(8, 8.2, 6);
    const borderRingMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      side: THREE.DoubleSide
    });
    const borderRing = new THREE.Mesh(borderRingGeom, borderRingMat);
    borderRing.rotation.x = Math.PI / 2;
    borderRing.position.y = 0.31;
    scene.add(borderRing);

    // Central MailBridge Relay Tower (Octahedron)
    const towerGeom = new THREE.OctahedronGeometry(2.4, 0);
    const towerMat = new THREE.MeshBasicMaterial({
      color: 0xef233c,
      wireframe: true
    });
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.y = 3.2;
    scene.add(tower);

    // Orbiting Satellites (Input Node, Security Node, Telemetry Node)
    const satelliteGroup = new THREE.Group();
    
    // Node 1: CSV Ingestion (Blue)
    const sat1Geom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const sat1Mat = new THREE.MeshBasicMaterial({ color: 0x2563eb, wireframe: isWireframe });
    const sat1 = new THREE.Mesh(sat1Geom, sat1Mat);
    sat1.position.set(-5, 1.5, 0);
    satelliteGroup.add(sat1);

    // Node 2: Gmail SMTP Handshake (Red)
    const sat2Geom = new THREE.DodecahedronGeometry(1.1);
    const sat2Mat = new THREE.MeshBasicMaterial({ color: 0xef233c, wireframe: isWireframe });
    const sat2 = new THREE.Mesh(sat2Geom, sat2Mat);
    sat2.position.set(5, 1.8, 1);
    satelliteGroup.add(sat2);

    // Node 3: Edge Telemetry (White)
    const sat3Geom = new THREE.IcosahedronGeometry(1, 0);
    const sat3Mat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: isWireframe });
    const sat3 = new THREE.Mesh(sat3Geom, sat3Mat);
    sat3.position.set(0, 2.2, 5);
    satelliteGroup.add(sat3);

    scene.add(satelliteGroup);

    // Conduit Laser Lines connecting satellites to central tower
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.5
    });

    const createConduit = (p1, p2) => {
      const points = [p1, p2];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geom, lineMat);
    };

    const line1 = createConduit(new THREE.Vector3(-5, 1.5, 0), tower.position);
    const line2 = createConduit(new THREE.Vector3(5, 1.8, 1), tower.position);
    const line3 = createConduit(new THREE.Vector3(0, 2.2, 5), tower.position);
    scene.add(line1, line2, line3);

    // Orbit Particles
    const orbitCount = 80;
    const orbitPos = new Float32Array(orbitCount * 3);
    for (let i = 0; i < orbitCount; i++) {
      const angle = (i / orbitCount) * Math.PI * 2;
      const rad = 6.2 + (Math.random() - 0.5) * 0.8;
      orbitPos[i * 3] = Math.cos(angle) * rad;
      orbitPos[i * 3 + 1] = 0.5 + Math.random() * 2;
      orbitPos[i * 3 + 2] = Math.sin(angle) * rad;
    }
    const orbitGeom = new THREE.BufferGeometry();
    orbitGeom.setAttribute("position", new THREE.BufferAttribute(orbitPos, 3));
    const orbitMat = new THREE.PointsMaterial({
      size: 0.25,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.8
    });
    const orbitParticles = new THREE.Points(orbitGeom, orbitMat);
    scene.add(orbitParticles);

    // Mouse Drag Rotation Logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      scene.rotation.y += deltaX * 0.008;
      scene.rotation.x = Math.max(-0.4, Math.min(0.6, scene.rotation.x + deltaY * 0.005));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const elapsed = clock.getElapsedTime();

      if (isRotating && !isDragging) {
        scene.rotation.y += 0.007;
      }

      tower.rotation.y = elapsed * 0.8;
      tower.rotation.z = Math.sin(elapsed) * 0.2;
      tower.position.y = 3.2 + Math.sin(elapsed * 2) * 0.25;

      sat1.rotation.x = elapsed * 0.5;
      sat2.rotation.y = elapsed * 0.6;
      sat3.rotation.z = elapsed * 0.7;

      satelliteGroup.rotation.y = -elapsed * 0.25;
      orbitParticles.rotation.y = elapsed * 0.4;

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      platformGeom.dispose();
      platformMat.dispose();
      towerGeom.dispose();
      towerMat.dispose();
      sat1Geom.dispose();
      sat1Mat.dispose();
      sat2Geom.dispose();
      sat2Mat.dispose();
      sat3Geom.dispose();
      sat3Mat.dispose();
      orbitGeom.dispose();
      orbitMat.dispose();
      renderer.dispose();
    };
  }, [activeTab, isRotating, isWireframe]);

  return (
    <div className="hero-3d-interactive-card">
      {/* 3D Showcase Header & View Mode Switcher */}
      <div className="hero-3d-header">
        <div className="hero-3d-title-group">
          <span className="threed-radar-dot"></span>
          <span className="threed-card-label">INTERACTIVE 3D PLATFORM SHOWCASE</span>
        </div>
        <div className="hero-3d-mode-tabs">
          <button
            type="button"
            className={`threed-mode-tab ${activeTab === "3d-engine" ? "active" : ""}`}
            onClick={() => setActiveTab("3d-engine")}
          >
            3D Isometric Engine
          </button>
          <button
            type="button"
            className={`threed-mode-tab ${activeTab === "video-walkthrough" ? "active" : ""}`}
            onClick={() => setActiveTab("video-walkthrough")}
          >
            4K Product Video
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <div className="hero-3d-viewport">
        {/* VIEW 1: INTERACTIVE 3D ISOMETRIC ENGINE */}
        {activeTab === "3d-engine" && (
          <div className="threed-engine-wrapper">
            <div className="threed-engine-canvas" ref={threeCanvasRef}></div>

            {/* Overlaid 3D Node Telemetry Badges */}
            <div className="threed-telemetry-hud">
              <button
                type="button"
                className={`hud-node-chip ${active3dNode === "relay" ? "active" : ""}`}
                onClick={() => setActive3dNode("relay")}
              >
                <span className="hud-indicator-dot dot-red"></span>
                <span>Gmail SMTP Core</span>
              </button>
              <button
                type="button"
                className={`hud-node-chip ${active3dNode === "csv" ? "active" : ""}`}
                onClick={() => setActive3dNode("csv")}
              >
                <span className="hud-indicator-dot dot-blue"></span>
                <span>Excel/CSV Ingest</span>
              </button>
              <button
                type="button"
                className={`hud-node-chip ${active3dNode === "edge" ? "active" : ""}`}
                onClick={() => setActive3dNode("edge")}
              >
                <span className="hud-indicator-dot dot-white"></span>
                <span>Sub-50ms Edge Telemetry</span>
              </button>
            </div>

            <div className="threed-interaction-hint">
              <span>&#8634; Click &amp; drag in 3D to orbit</span>
            </div>
          </div>
        )}

        {/* VIEW 2: 4K HIGH-DENSITY VIDEO WALKTHROUGH */}
        {activeTab === "video-walkthrough" && (
          <div className="threed-video-scene-wrapper" onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
            <div className="threed-scene-display">
              {videoStep === 1 && (
                <div className="threed-scene-card">
                  <div className="scene-step-header">
                    <span className="scene-step-tag">Step 1 // Automated Spreadsheet Parsing</span>
                    <span className="scene-status-badge text-emerald-400">250 Leads Detected</span>
                  </div>
                  <div className="scene-metric-row">
                    <span>Target Workbook: <strong>leads.xlsx</strong></span>
                    <span className="scene-latency-badge">&lt; 14ms parsed</span>
                  </div>
                  <div className="scene-progress-bar">
                    <div className="scene-progress-fill" style={{ width: "100%" }}></div>
                  </div>
                  <div className="scene-columns-chips">
                    <span>&#123;&#123;firstname&#125;&#125;</span>
                    <span>&#123;&#123;company&#125;&#125;</span>
                    <span>&#123;&#123;email&#125;&#125;</span>
                    <span>&#123;&#123;role&#125;&#125;</span>
                  </div>
                </div>
              )}

              {videoStep === 2 && (
                <div className="threed-scene-card">
                  <div className="scene-step-header">
                    <span className="scene-step-tag">Step 2 // 1-to-1 Dynamic Personalization</span>
                    <span className="scene-status-badge text-blue-400">Template Compiled</span>
                  </div>
                  <div className="scene-preview-snippet">
                    <div className="snippet-to">To: <strong>sarah.jenkins@acmecorp.com</strong></div>
                    <div className="snippet-subject">
                      Hi <span className="highlight-blue">Sarah</span>, quick question about <span className="highlight-red">Acme Corp</span> outbound
                    </div>
                  </div>
                  <div className="scene-tags-verified">
                    <Check size={11} className="text-emerald-400" />
                    <span>Merge tags injected dynamically without manual copy-paste</span>
                  </div>
                </div>
              )}

              {videoStep === 3 && (
                <div className="threed-scene-card">
                  <div className="scene-step-header">
                    <span className="scene-step-tag">Step 3 // Direct Gmail SMTP Handshake</span>
                    <span className="scene-status-badge text-emerald-400">TLS 1.3 Active</span>
                  </div>
                  <div className="scene-smtp-specs">
                    <div className="spec-item">
                      <span className="spec-lbl">Host</span>
                      <strong className="spec-val">smtp.gmail.com:587</strong>
                    </div>
                    <div className="spec-item">
                      <span className="spec-lbl">Signature</span>
                      <strong className="spec-val">DKIM 2048-bit RSA</strong>
                    </div>
                    <div className="spec-item">
                      <span className="spec-lbl">Dispatch</span>
                      <strong className="spec-val text-emerald-400">Sub-74ms</strong>
                    </div>
                  </div>
                </div>
              )}

              {videoStep === 4 && (
                <div className="threed-scene-card">
                  <div className="scene-step-header">
                    <span className="scene-step-tag">Step 4 // Live Telemetry &amp; Lead Qualification</span>
                    <span className="scene-status-badge badge-red-hot">HOT LEAD DETECTED</span>
                  </div>
                  <div className="scene-telemetry-lead">
                    <div className="telemetry-lead-name">Sarah Jenkins • VP Growth @ Acme Corp</div>
                    <div className="telemetry-lead-stats">
                      <span className="telemetry-pill hot">4 Opens</span>
                      <span className="telemetry-pill hot">2 CTA Link Clicks</span>
                      <span className="telemetry-pill verified">Ready for Closing</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isVideoPlaying && (
              <div className="threed-play-overlay">
                <div className="threed-play-btn">
                  <Play size={20} fill="currentColor" />
                </div>
                <span>Click to Resume Walkthrough</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="hero-3d-footer">
        {activeTab === "3d-engine" ? (
          <div className="threed-controls-row">
            <button
              type="button"
              className="threed-ctrl-btn"
              onClick={() => setIsRotating(!isRotating)}
              title="Toggle automatic 3D rotation"
            >
              {isRotating ? <Pause size={11} /> : <Play size={11} fill="currentColor" />}
              <span>{isRotating ? "Pause 360°" : "Auto-Rotate"}</span>
            </button>
            <button
              type="button"
              className={`threed-ctrl-btn ${isWireframe ? "active" : ""}`}
              onClick={() => setIsWireframe(!isWireframe)}
              title="Toggle Cyber Wireframe Mesh"
            >
              <span>{isWireframe ? "Solid Mesh" : "Wireframe 3D"}</span>
            </button>
          </div>
        ) : (
          <div className="threed-video-nav-row">
            <div className="threed-steps-pills">
              {[
                { num: 1, label: "Import" },
                { num: 2, label: "Merge" },
                { num: 3, label: "Relay" },
                { num: 4, label: "Telemetry" }
              ].map((step) => (
                <button
                  key={step.num}
                  type="button"
                  className={`threed-step-chip ${videoStep === step.num ? "active" : ""}`}
                  onClick={() => setVideoStep(step.num)}
                >
                  {step.num}. {step.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="threed-ctrl-btn toggle-play"
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
            >
              {isVideoPlaying ? <Pause size={11} /> : <Play size={11} fill="currentColor" />}
              <span>{isVideoPlaying ? "Pause" : "Play"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
