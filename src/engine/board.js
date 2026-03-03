/* ========================================
   Phantom Tac Toe - 3D Game Board
   Neon grid with cell interaction zones
   ======================================== */

import * as THREE from "three";

export class GameBoard {
  constructor(scene) {
    this.gameScene = scene;
    this.group = new THREE.Group();
    this.cellPositions = [];
    this.hoverHighlight = null;
    this.winLineObject = null;

    this.buildGrid();
    this.buildCellZones();
    this.buildHoverHighlight();

    scene.add(this.group);
  }

  buildGrid() {
    const gridSize = 3;
    const cellSize = 1.2;
    const offset = ((gridSize - 1) * cellSize) / 2;

    // Grid lines material with neon glow
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0x64d2ff,
      transparent: true,
      opacity: 0.6,
    });

    const lineThickness = 0.04;
    const lineLength = gridSize * cellSize;

    // Vertical lines (2)
    for (let i = 1; i < gridSize; i++) {
      const x = i * cellSize - offset - cellSize / 2;
      const geometry = new THREE.BoxGeometry(
        lineThickness,
        lineThickness,
        lineLength,
      );
      const line = new THREE.Mesh(geometry, lineMaterial.clone());
      line.position.set(x, 0, 0);
      this.group.add(line);
    }

    // Horizontal lines (2)
    for (let i = 1; i < gridSize; i++) {
      const z = i * cellSize - offset - cellSize / 2;
      const geometry = new THREE.BoxGeometry(
        lineLength,
        lineThickness,
        lineThickness,
      );
      const line = new THREE.Mesh(geometry, lineMaterial.clone());
      line.position.set(0, 0, z);
      this.group.add(line);
    }

    // Base plane (subtle)
    const planeGeometry = new THREE.PlaneGeometry(
      lineLength + 0.2,
      lineLength + 0.2,
    );
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a0a1a,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    this.group.add(plane);

    // Neon border glow
    const borderGeometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(lineLength + 0.1, 0.01, lineLength + 0.1),
    );
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0xbf5af2,
      transparent: true,
      opacity: 0.4,
    });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    border.position.y = -0.01;
    this.group.add(border);
  }

  buildCellZones() {
    const cellSize = 1.2;
    const offset = cellSize; // Center offset for 3x3

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = (col - 1) * cellSize;
        const z = (row - 1) * cellSize;

        // Invisible interaction plane
        const geometry = new THREE.PlaneGeometry(
          cellSize * 0.85,
          cellSize * 0.85,
        );
        const material = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        });
        const zone = new THREE.Mesh(geometry, material);
        zone.rotation.x = -Math.PI / 2;
        zone.position.set(x, 0.01, z);
        zone.userData.cellIndex = row * 3 + col;
        zone.userData.isCell = true;

        this.group.add(zone);
        this.cellPositions.push({ x, z, index: row * 3 + col });
      }
    }
  }

  buildHoverHighlight() {
    const size = 1.0;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({
      color: 0xbf5af2,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.hoverHighlight = new THREE.Mesh(geometry, material);
    this.hoverHighlight.rotation.x = -Math.PI / 2;
    this.hoverHighlight.position.y = 0.005;
    this.group.add(this.hoverHighlight);
  }

  showHover(cellIndex, player) {
    if (cellIndex === null || cellIndex === undefined) {
      this.hoverHighlight.material.opacity = 0;
      return;
    }

    const pos = this.cellPositions[cellIndex];
    if (!pos) return;

    this.hoverHighlight.position.set(pos.x, 0.005, pos.z);
    this.hoverHighlight.material.color.setHex(
      player === "X" ? 0xff375f : 0x64d2ff,
    );
    this.hoverHighlight.material.opacity = 0.08;
  }

  hideHover() {
    this.hoverHighlight.material.opacity = 0;
  }

  getCellPosition(cellIndex) {
    const pos = this.cellPositions[cellIndex];
    return pos ? new THREE.Vector3(pos.x, 0.3, pos.z) : null;
  }

  getCellZones() {
    return this.group.children.filter((c) => c.userData.isCell);
  }

  showWinLine(winLine) {
    if (this.winLineObject) {
      this.group.remove(this.winLineObject);
    }

    const start = this.getCellPosition(winLine[0]);
    const end = this.getCellPosition(winLine[2]);

    if (!start || !end) return;

    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length() + 0.5;
    const center = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);

    const geometry = new THREE.CylinderGeometry(0.06, 0.06, length, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffd60a,
      transparent: true,
      opacity: 0.9,
    });

    this.winLineObject = new THREE.Mesh(geometry, material);
    this.winLineObject.position.copy(center);
    this.winLineObject.position.y = 0.3;

    // Rotate to align with direction
    const axis = new THREE.Vector3(0, 1, 0);
    const angle = Math.atan2(direction.x, direction.z);
    this.winLineObject.rotation.z = Math.PI / 2;
    this.winLineObject.rotation.x =
      -Math.atan2(direction.z, direction.x) + Math.PI / 2;

    // Simple approach: look-at based rotation
    const quaternion = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const dir = direction.normalize();

    // Create rotation matrix
    const rotMatrix = new THREE.Matrix4();
    rotMatrix.lookAt(start, end, up);
    quaternion.setFromRotationMatrix(rotMatrix);

    this.winLineObject.quaternion.copy(quaternion);
    this.winLineObject.rotateX(Math.PI / 2);

    this.group.add(this.winLineObject);
  }

  clearWinLine() {
    if (this.winLineObject) {
      this.group.remove(this.winLineObject);
      if (this.winLineObject.geometry) this.winLineObject.geometry.dispose();
      if (this.winLineObject.material) this.winLineObject.material.dispose();
      this.winLineObject = null;
    }
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.gameScene.remove(this.group);
  }
}
