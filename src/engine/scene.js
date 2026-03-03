/* ========================================
   InfiniToe - Three.js Scene Setup
   ======================================== */

import * as THREE from "three";

export class GameScene {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animationId = null;
    this.clock = new THREE.Clock();
    this.objects = [];
    this.particles = [];
    this.onRenderCallbacks = [];

    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    const aspect = 1; // Square aspect
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 5.5, 5.5);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.updateSize();
    this.container.appendChild(this.renderer.domElement);

    // Lights
    this.setupLights();

    // Background particles
    this.createBackgroundParticles();

    // Handle resize
    this.resizeObserver = new ResizeObserver(() => this.updateSize());
    this.resizeObserver.observe(this.container);

    // Start animation loop
    this.animate();
  }

  setupLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x222244, 0.5);
    this.scene.add(ambient);

    // Key light (purple tint)
    const keyLight = new THREE.DirectionalLight(0xbf5af2, 0.6);
    keyLight.position.set(3, 5, 3);
    this.scene.add(keyLight);

    // Fill light (cyan tint)
    const fillLight = new THREE.DirectionalLight(0x64d2ff, 0.4);
    fillLight.position.set(-3, 3, -2);
    this.scene.add(fillLight);

    // Rim light (pink)
    const rimLight = new THREE.PointLight(0xff375f, 0.5, 15);
    rimLight.position.set(0, -2, 4);
    this.scene.add(rimLight);

    // Center glow
    const centerLight = new THREE.PointLight(0xbf5af2, 0.3, 10);
    centerLight.position.set(0, 1, 0);
    this.scene.add(centerLight);
    this.centerLight = centerLight;
  }

  createBackgroundParticles() {
    const geometry = new THREE.BufferGeometry();
    const count = 80;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const neonColors = [
      new THREE.Color(0xbf5af2), // purple
      new THREE.Color(0x64d2ff), // cyan
      new THREE.Color(0xff375f), // pink
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const color = neonColors[Math.floor(Math.random() * neonColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  updateSize() {
    const rect = this.container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    this.renderer.setSize(size, size);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Rotate background particles slowly
    if (this.particleSystem) {
      this.particleSystem.rotation.y = elapsed * 0.05;
      this.particleSystem.rotation.x = Math.sin(elapsed * 0.03) * 0.1;
    }

    // Pulse center light
    if (this.centerLight) {
      this.centerLight.intensity = 0.3 + Math.sin(elapsed * 2) * 0.1;
    }

    // Run registered callbacks
    for (const cb of this.onRenderCallbacks) {
      cb(delta, elapsed);
    }

    this.renderer.render(this.scene, this.camera);
  }

  onRender(callback) {
    this.onRenderCallbacks.push(callback);
  }

  removeOnRender(callback) {
    const idx = this.onRenderCallbacks.indexOf(callback);
    if (idx !== -1) this.onRenderCallbacks.splice(idx, 1);
  }

  add(object) {
    this.scene.add(object);
    this.objects.push(object);
  }

  remove(object) {
    this.scene.remove(object);
    const idx = this.objects.indexOf(object);
    if (idx !== -1) this.objects.splice(idx, 1);
  }

  dispose() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.resizeObserver) this.resizeObserver.disconnect();

    this.objects.forEach((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material))
          obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });

    if (this.particleSystem) {
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
    }

    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
