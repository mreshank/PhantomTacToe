/* ========================================
   InfiniToe - Visual Effects
   Particles, confetti, sparkles
   ======================================== */

import * as THREE from "three";

export class EffectsManager {
  constructor(gameScene) {
    this.gameScene = gameScene;
    this.activeEffects = [];

    this.renderCallback = (delta, elapsed) => this.update(delta, elapsed);
    gameScene.onRender(this.renderCallback);
  }

  createWinExplosion(position) {
    const count = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const colors = new Float32Array(count * 3);

    const neonColors = [
      new THREE.Color(0xff375f),
      new THREE.Color(0x64d2ff),
      new THREE.Color(0xbf5af2),
      new THREE.Color(0xffd60a),
      new THREE.Color(0x30d158),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      velocities.push({
        x: (Math.random() - 0.5) * 6,
        y: Math.random() * 5 + 2,
        z: (Math.random() - 0.5) * 6,
      });

      const color = neonColors[Math.floor(Math.random() * neonColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    this.gameScene.add(particles);

    this.activeEffects.push({
      type: "explosion",
      object: particles,
      velocities,
      startTime: performance.now(),
      duration: 1500,
      gravity: -9.8,
    });
  }

  createPlaceSparkle(position, color = 0xbf5af2) {
    const count = 12;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      const angle = (i / count) * Math.PI * 2;
      const speed = 1.5 + Math.random();
      velocities.push({
        x: Math.cos(angle) * speed,
        y: Math.random() * 2 + 1,
        z: Math.sin(angle) * speed,
      });
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.06,
      color,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    this.gameScene.add(particles);

    this.activeEffects.push({
      type: "sparkle",
      object: particles,
      velocities,
      startTime: performance.now(),
      duration: 800,
      gravity: -4,
    });
  }

  createRemoveEffect(position) {
    const count = 8;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.3;

      velocities.push({
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 3 + 1,
        z: (Math.random() - 0.5) * 2,
      });
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x666688,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    this.gameScene.add(particles);

    this.activeEffects.push({
      type: "sparkle",
      object: particles,
      velocities,
      startTime: performance.now(),
      duration: 600,
      gravity: -5,
    });
  }

  update(delta, elapsed) {
    const now = performance.now();

    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      const age = (now - effect.startTime) / 1000;
      const progress = Math.min(1, (now - effect.startTime) / effect.duration);

      const positions = effect.object.geometry.attributes.position.array;

      for (let j = 0; j < effect.velocities.length; j++) {
        const v = effect.velocities[j];
        positions[j * 3] += v.x * delta;
        positions[j * 3 + 1] += (v.y + effect.gravity * age) * delta;
        positions[j * 3 + 2] += v.z * delta;
      }

      effect.object.geometry.attributes.position.needsUpdate = true;
      effect.object.material.opacity = 1 - progress;

      if (progress >= 1) {
        this.gameScene.remove(effect.object);
        effect.object.geometry.dispose();
        effect.object.material.dispose();
        this.activeEffects.splice(i, 1);
      }
    }
  }

  dispose() {
    this.gameScene.removeOnRender(this.renderCallback);
    for (const effect of this.activeEffects) {
      this.gameScene.remove(effect.object);
      effect.object.geometry.dispose();
      effect.object.material.dispose();
    }
    this.activeEffects = [];
  }
}
