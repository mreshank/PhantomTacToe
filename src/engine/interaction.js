/* ========================================
   Phantom Tac Toe - Input / Interaction Handler
   Raycasting for mouse/touch -> board cell
   ======================================== */

import * as THREE from "three";

export class InteractionHandler {
  constructor(gameScene, board, onCellClick, onCellHover) {
    this.gameScene = gameScene;
    this.board = board;
    this.onCellClick = onCellClick;
    this.onCellHover = onCellHover;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.enabled = true;
    this.hoveredCell = null;

    this.canvas = gameScene.renderer.domElement;

    // Bind events
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);

    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointerleave", this.handlePointerLeave);
  }

  getPointerPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  getCellAtPointer() {
    this.raycaster.setFromCamera(this.pointer, this.gameScene.camera);
    const zones = this.board.getCellZones();
    const intersects = this.raycaster.intersectObjects(zones);

    if (intersects.length > 0) {
      return intersects[0].object.userData.cellIndex;
    }
    return null;
  }

  handlePointerMove(event) {
    if (!this.enabled) return;
    event.preventDefault();

    this.getPointerPosition(event);
    const cellIndex = this.getCellAtPointer();

    if (cellIndex !== this.hoveredCell) {
      this.hoveredCell = cellIndex;
      if (this.onCellHover) {
        this.onCellHover(cellIndex);
      }
    }
  }

  handlePointerDown(event) {
    if (!this.enabled) return;
    event.preventDefault();

    this.getPointerPosition(event);
    const cellIndex = this.getCellAtPointer();

    if (cellIndex !== null && this.onCellClick) {
      this.onCellClick(cellIndex);
    }
  }

  handlePointerLeave() {
    this.hoveredCell = null;
    if (this.onCellHover) {
      this.onCellHover(null);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.canvas.style.cursor = enabled ? "pointer" : "default";
  }

  dispose() {
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointerleave", this.handlePointerLeave);
  }
}
