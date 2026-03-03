/* ========================================
   InfiniToe - 3D Game Pieces (X & O)
   ======================================== */

import * as THREE from "three";

export class PieceManager {
  constructor(gameScene) {
    this.gameScene = gameScene;
    this.pieces = new Map(); // cellIndex -> piece group
    this.animations = [];

    // Register render callback for animations
    this.renderCallback = (delta, elapsed) => this.update(delta, elapsed);
    gameScene.onRender(this.renderCallback);
  }

  createX(position, animated = true) {
    const group = new THREE.Group();
    const size = 0.35;
    const thickness = 0.08;

    const material = new THREE.MeshStandardMaterial({
      color: 0xff375f,
      emissive: 0xff375f,
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.4,
    });

    // First bar of X
    const bar1Geo = new THREE.BoxGeometry(thickness, thickness, size * 2);
    const bar1 = new THREE.Mesh(bar1Geo, material);
    bar1.rotation.y = Math.PI / 4;
    group.add(bar1);

    // Second bar of X
    const bar2Geo = new THREE.BoxGeometry(thickness, thickness, size * 2);
    const bar2 = new THREE.Mesh(bar2Geo, material.clone());
    bar2.rotation.y = -Math.PI / 4;
    group.add(bar2);

    // Add glow sphere
    const glowGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff375f,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    group.position.copy(position);
    group.userData.type = "X";
    group.userData.glow = glow;

    if (animated) {
      group.scale.set(0, 0, 0);
      this.addAnimation({
        object: group,
        type: "scaleIn",
        startTime: performance.now(),
        duration: 400,
      });
    }

    return group;
  }

  createO(position, animated = true) {
    const group = new THREE.Group();

    const material = new THREE.MeshStandardMaterial({
      color: 0x64d2ff,
      emissive: 0x64d2ff,
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.4,
    });

    // Torus for O
    const torusGeo = new THREE.TorusGeometry(0.28, 0.06, 16, 32);
    const torus = new THREE.Mesh(torusGeo, material);
    torus.rotation.x = Math.PI / 2;
    group.add(torus);

    // Add glow sphere
    const glowGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x64d2ff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    group.position.copy(position);
    group.userData.type = "O";
    group.userData.glow = glow;

    if (animated) {
      group.scale.set(0, 0, 0);
      this.addAnimation({
        object: group,
        type: "scaleIn",
        startTime: performance.now(),
        duration: 400,
      });
    }

    return group;
  }

  placePiece(cellIndex, player, position) {
    // Remove existing piece at this cell
    this.removePiece(cellIndex, false);

    const piece =
      player === "X" ? this.createX(position) : this.createO(position);

    this.pieces.set(cellIndex, piece);
    this.gameScene.add(piece);

    return piece;
  }

  removePiece(cellIndex, animated = true) {
    const piece = this.pieces.get(cellIndex);
    if (!piece) return;

    if (animated) {
      this.addAnimation({
        object: piece,
        type: "scaleOut",
        startTime: performance.now(),
        duration: 350,
        onComplete: () => {
          this.gameScene.remove(piece);
          this.disposePiece(piece);
        },
      });
    } else {
      this.gameScene.remove(piece);
      this.disposePiece(piece);
    }

    this.pieces.delete(cellIndex);
  }

  setGhost(cellIndex, isGhost) {
    const piece = this.pieces.get(cellIndex);
    if (!piece) return;

    piece.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child === piece.userData.glow) return;
        if (isGhost) {
          child.material.transparent = true;
          child.material.opacity = 0.35;
        } else {
          child.material.opacity = 1.0;
        }
      }
    });

    piece.userData.isGhost = isGhost;
  }

  clearAllPieces() {
    for (const [cellIndex, piece] of this.pieces) {
      this.gameScene.remove(piece);
      this.disposePiece(piece);
    }
    this.pieces.clear();
  }

  disposePiece(piece) {
    piece.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material))
          child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
  }

  addAnimation(anim) {
    this.animations.push(anim);
  }

  update(delta, elapsed) {
    const now = performance.now();

    // Process animations
    for (let i = this.animations.length - 1; i >= 0; i--) {
      const anim = this.animations[i];
      const progress = Math.min(1, (now - anim.startTime) / anim.duration);

      switch (anim.type) {
        case "scaleIn": {
          const eased = easeOutBack(progress);
          anim.object.scale.set(eased, eased, eased);
          anim.object.rotation.y = (1 - eased) * Math.PI;
          break;
        }
        case "scaleOut": {
          const eased = 1 - easeInBack(progress);
          anim.object.scale.set(eased, eased, eased);
          anim.object.rotation.y = progress * Math.PI;
          break;
        }
      }

      if (progress >= 1) {
        if (anim.onComplete) anim.onComplete();
        this.animations.splice(i, 1);
      }
    }

    // Animate ghost pieces
    for (const [_, piece] of this.pieces) {
      if (piece.userData.isGhost) {
        const ghostOpacity = 0.2 + Math.sin(elapsed * 3) * 0.15;
        piece.traverse((child) => {
          if (child.isMesh && child.material && child !== piece.userData.glow) {
            child.material.opacity = ghostOpacity;
          }
        });
      }

      // Gentle float for all pieces
      if (piece.userData.baseY === undefined) {
        piece.userData.baseY = piece.position.y;
      }
      piece.position.y =
        piece.userData.baseY +
        Math.sin(elapsed * 1.5 + piece.position.x * 2) * 0.03;
    }
  }

  dispose() {
    this.gameScene.removeOnRender(this.renderCallback);
    this.clearAllPieces();
  }
}

// Easing functions
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
}
