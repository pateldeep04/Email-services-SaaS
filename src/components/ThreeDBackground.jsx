import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeDBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch {
      return; // Graceful degradation
    }

    const width = container.offsetWidth || window.innerWidth;
    const height = Math.min(window.innerHeight * 1.15, 960);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = "threed-canvas-webgl";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 38;

    // -------------------------------------------------------------
    // 1. 3D CYBERNETIC PARTICLE TORUS / CLUSTER (BLUE & RED NODES)
    // -------------------------------------------------------------
    const particleCount = 1400;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    const blueColor = new THREE.Color("#2563eb");
    const redColor = new THREE.Color("#ef233c");
    const whiteColor = new THREE.Color("#ffffff");

    for (let i = 0; i < particleCount; i++) {
      // Create a double torus / warped galaxy distribution
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const radius = 18 + (Math.random() - 0.5) * 8;
      const tube = 5 + (Math.random() - 0.5) * 4;

      const x = (radius + tube * Math.cos(v)) * Math.cos(u) + (Math.random() - 0.5) * 2;
      const y = (radius + tube * Math.cos(v)) * Math.sin(u) + (Math.random() - 0.5) * 2;
      const z = tube * Math.sin(v) + (Math.random() - 0.5) * 8;

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;

      // Color mapping: majority Electric Blue, Vibrant Red bursts, White accents
      const r = Math.random();
      const nodeColor = r > 0.45 ? blueColor : r > 0.12 ? redColor : whiteColor;
      colorArray[i * 3] = nodeColor.r;
      colorArray[i * 3 + 1] = nodeColor.g;
      colorArray[i * 3 + 2] = nodeColor.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

    // Custom circular soft glow texture for particles
    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.75)");
      gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.15)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      map: createParticleTexture(),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // -------------------------------------------------------------
    // 2. CENTRAL 3D WIREFRAME RELAY CORE (ISOMETRIC ICOSAHEDRON)
    // -------------------------------------------------------------
    const coreGroup = new THREE.Group();

    // Inner wireframe sphere/icosahedron
    const coreGeom = new THREE.IcosahedronGeometry(7.5, 1);
    const coreWireMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreWireMat);
    coreGroup.add(coreMesh);

    // Outer orbital concentric ring (Vibrant Red)
    const ringGeom1 = new THREE.TorusGeometry(12, 0.06, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xef233c,
      transparent: true,
      opacity: 0.45
    });
    const ring1 = new THREE.Mesh(ringGeom1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    coreGroup.add(ring1);

    // Second orbital ring (Electric Blue)
    const ringGeom2 = new THREE.TorusGeometry(15, 0.05, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.35
    });
    const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    coreGroup.add(ring2);

    // Position group slightly toward the right-center to frame hero layout
    coreGroup.position.set(10, 0, -5);
    scene.add(coreGroup);

    // -------------------------------------------------------------
    // 3. CURSOR GRAVITATIONAL PHYSICS (SPRING LERP)
    // -------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.offsetWidth || window.innerWidth;
      const newH = Math.min(window.innerHeight * 1.15, 960);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // -------------------------------------------------------------
    // 4. ANIMATION LOOP (60FPS WITH TAB VISIBILITY AWARENESS)
    // -------------------------------------------------------------
    let animationFrameId;
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth cursor lerp
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotate particle cloud
      particles.rotation.y = elapsedTime * 0.04 + targetX * 1.8;
      particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.15 + targetY * 1.2;
      particles.rotation.z = elapsedTime * 0.015;

      // Rotate central 3D core & orbital rings
      coreMesh.rotation.y = elapsedTime * 0.12;
      coreMesh.rotation.x = elapsedTime * 0.08;

      ring1.rotation.z = elapsedTime * 0.2;
      ring1.rotation.y = elapsedTime * 0.15;

      ring2.rotation.x = -elapsedTime * 0.18;
      ring2.rotation.z = -elapsedTime * 0.12;

      // Subtle breathing scale
      const pulse = 1 + Math.sin(elapsedTime * 1.2) * 0.03;
      coreGroup.scale.set(pulse, pulse, pulse);

      // Camera parallax
      camera.position.x = targetX * 6;
      camera.position.y = -targetY * 6;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      coreGeom.dispose();
      coreWireMat.dispose();
      ringGeom1.dispose();
      ringMat1.dispose();
      ringGeom2.dispose();
      ringMat2.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="threed-background-viewport" ref={containerRef} aria-hidden="true">
      {/* Radial fade mask to seamlessly blend the 3D scene into Charcoal Black #111318 */}
      <div className="threed-vignette-mask"></div>
    </div>
  );
}
