/* ========================================
   InfiniToe - Multiplayer (PeerJS WebRTC)
   ======================================== */

import Peer from "peerjs";
import { generateRoomCode } from "../utils/share.js";

export class MultiplayerManager {
  constructor() {
    this.peer = null;
    this.connection = null;
    this.roomCode = null;
    this.isHost = false;
    this.connected = false;
    this.onMessage = null;
    this.onConnected = null;
    this.onDisconnected = null;
    this.onError = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  async createRoom() {
    this.roomCode = generateRoomCode();
    this.isHost = true;

    return new Promise((resolve, reject) => {
      const peerId = `infinitoe-${this.roomCode}`;

      this.peer = new Peer(peerId, {
        debug: 0,
      });

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
    });
  }

  async joinRoom(code) {
    this.roomCode = code;
    this.isHost = false;

    return new Promise((resolve, reject) => {
      this.peer = new Peer(undefined, {
        debug: 0,
      });

      this.peer.on("open", () => {
        const peerId = `infinitoe-${code}`;
        const conn = this.peer.connect(peerId, { reliable: true });
        this.connection = conn;
        this.setupConnection(conn);

        conn.on("open", () => {
          resolve(code);
        });
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

  sendEmoji(emoji) {
    this.send({
      type: "emoji",
      emoji,
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

  disconnect() {
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
  }

  getShareURL() {
    return `${window.location.origin}${window.location.pathname}#/join/${this.roomCode}`;
  }
}

// Singleton
export const multiplayer = new MultiplayerManager();
