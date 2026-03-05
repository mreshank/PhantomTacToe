/* ========================================
   Phantom Tac Toe - Multiplayer (PeerJS WebRTC)
   ======================================== */

import Peer from "peerjs";
import { generateRoomCode } from "../utils/share";

const PEERJS_CONFIG = {
  debug: 0,
  // Use env or defaults
  host: import.meta.env?.VITE_PEERJS_HOST || "0.peerjs.com",
  port: parseInt(import.meta.env?.VITE_PEERJS_PORT || "443"),
  secure: true,
};

export class MultiplayerManager {
  constructor() {
    this.peer = null;
    this.connection = null;
    this.roomCode = null;
    this.isHost = false;
    this.connected = false;
    this.opponentName = null;
    this.opponentFrame = "none";
    this.onMessage = null;
    this.onConnected = null;
    this.onDisconnected = null;
    this.onError = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this._connectionTimeout = null;
  }

  async createRoom() {
    this.roomCode = generateRoomCode();
    this.isHost = true;

    return new Promise((resolve, reject) => {
      const peerId = `phantomtactoe-${this.roomCode}`;

      this.peer = new Peer(peerId, PEERJS_CONFIG);

      this.peer.on("open", (id) => {
        console.log("Room created:", this.roomCode);
        resolve(this.roomCode);
      });

      this.peer.on("connection", (conn) => {
        this.connection = conn;
        this.setupConnection(conn);
      });

      this.peer.on("error", (err) => {
        console.error("Peer error:", err);
        if (err.type === "unavailable-id") {
          // Room code already taken, generate new one
          this.roomCode = generateRoomCode();
          this.peer.destroy();
          this.createRoom().then(resolve).catch(reject);
        } else {
          if (this.onError) this.onError(err);
          reject(err);
        }
      });

      // Timeout for peer open
      this._connectionTimeout = setTimeout(() => {
        if (!this.peer?.open) {
          reject(new Error("Connection timeout"));
          this.disconnect();
        }
      }, 15000);
    });
  }

  async joinRoom(code) {
    this.roomCode = code;
    this.isHost = false;

    return new Promise((resolve, reject) => {
      this.peer = new Peer(undefined, PEERJS_CONFIG);

      this.peer.on("open", () => {
        const peerId = `phantomtactoe-${code}`;
        const conn = this.peer.connect(peerId, { reliable: true });
        this.connection = conn;
        this.setupConnection(conn);

        conn.on("open", () => {
          resolve(code);
        });

        // Timeout for connection
        this._connectionTimeout = setTimeout(() => {
          if (!this.connected) {
            reject(new Error("Connection timeout - room not found"));
            this.disconnect();
          }
        }, 15000);
      });

      this.peer.on("error", (err) => {
        console.error("Join error:", err);
        if (this.onError) this.onError(err);
        reject(err);
      });
    });
  }

  setupConnection(conn) {
    conn.on("open", () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      clearTimeout(this._connectionTimeout);
      console.log("Connected to peer");
      if (this.onConnected) this.onConnected();
    });

    conn.on("data", (data) => {
      if (this.onMessage) this.onMessage(data);
    });

    conn.on("close", () => {
      this.connected = false;
      console.log("Peer disconnected");
      if (this.onDisconnected) this.onDisconnected();
    });

    conn.on("error", (err) => {
      console.error("Connection error:", err);
      if (this.onError) this.onError(err);
    });
  }

  send(data) {
    if (this.connection && this.connected) {
      this.connection.send(data);
    }
  }

  sendMove(cellIndex, moveNumber) {
    this.send({
      type: "move",
      cellIndex,
      moveNumber,
      timestamp: Date.now(),
    });
  }

  sendReaction(reaction) {
    this.send({
      type: "reaction",
      reaction,
      timestamp: Date.now(),
    });
  }

  sendPlayerInfo(name, frame = "none") {
    this.send({
      type: "playerInfo",
      name,
      frame,
      timestamp: Date.now(),
    });
  }

  sendReady() {
    this.send({ type: "ready" });
  }

  sendRematch() {
    this.send({ type: "rematch" });
  }

  sendGameState(state) {
    this.send({
      type: "sync",
      state: JSON.stringify(state),
    });
  }

  sendGameOver(winner, winLine) {
    this.send({
      type: "gameOver",
      winner,
      winLine,
      timestamp: Date.now(),
    });
  }

  sendRematchAccept() {
    this.send({ type: "rematchAccept" });
  }

  disconnect() {
    clearTimeout(this._connectionTimeout);
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connected = false;
    this.roomCode = null;
    this.opponentName = null;
    this.reconnectAttempts = 0;
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached");
      if (this.onError) this.onError(new Error("Reconnection failed"));
      return;
    }
    this.reconnectAttempts++;
    console.log(
      `Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
    );

    // Brief delay before retry
    setTimeout(() => {
      if (this.roomCode && !this.connected) {
        if (this.isHost) {
          // Host recreates the room
          this.createRoom().catch(() => {
            this.attemptReconnect();
          });
        } else {
          // Guest tries to rejoin
          this.joinRoom(this.roomCode).catch(() => {
            this.attemptReconnect();
          });
        }
      }
    }, 2000 * this.reconnectAttempts);
  }

  getShareURL() {
    const base = import.meta.env?.VITE_SITE_URL || window.location.origin;
    return `${base}${window.location.pathname}#/join/${this.roomCode}`;
  }
}

// Singleton
export const multiplayer = new MultiplayerManager();
