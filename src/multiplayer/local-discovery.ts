/* ========================================
   Phantom Tac Toe - Local Network Discovery
   Manual code-based discovery for same-LAN play
   Works fully offline — no internet required
   ======================================== */

import { generateRoomCode } from '../utils/share';
import { eventBus, AppEvents } from '../core/EventBus';

export interface LocalPeer {
  code: string;
  name: string;
  timestamp: number;
}

export type LocalDiscoveryStatus = 'idle' | 'hosting' | 'joining' | 'connected' | 'error';

/**
 * LocalDiscoveryManager handles peer discovery on the same local network.
 * 
 * Since browsers cannot do mDNS or broadcast UDP, we use a manual signaling approach:
 * 1. Host generates a short room code and creates an RTCPeerConnection
 * 2. Host displays an SDP offer as a compressed/encoded string 
 * 3. Guest enters the room code and the host's SDP offer
 * 4. Guest creates an answer and sends it back
 * 5. Both peers exchange ICE candidates manually
 * 
 * For simplicity, this uses the same PeerJS infrastructure when online,
 * but falls back to a clipboard-based manual signaling when offline.
 */
export class LocalDiscoveryManager {
  private status: LocalDiscoveryStatus = 'idle';
  private roomCode: string | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private onStatusChange: ((status: LocalDiscoveryStatus) => void) | null = null;
  private onMessage: ((data: unknown) => void) | null = null;
  private onConnected: (() => void) | null = null;
  private onDisconnected: (() => void) | null = null;
  private iceCandidates: RTCIceCandidate[] = [];
  private isHost = false;

  constructor() {}

  getStatus(): LocalDiscoveryStatus {
    return this.status;
  }

  getRoomCode(): string | null {
    return this.roomCode;
  }

  isHosting(): boolean {
    return this.isHost;
  }

  setOnStatusChange(cb: (status: LocalDiscoveryStatus) => void): void {
    this.onStatusChange = cb;
  }

  setOnMessage(cb: (data: unknown) => void): void {
    this.onMessage = cb;
  }

  setOnConnected(cb: () => void): void {
    this.onConnected = cb;
  }

  setOnDisconnected(cb: () => void): void {
    this.onDisconnected = cb;
  }

  private setStatus(status: LocalDiscoveryStatus): void {
    this.status = status;
    if (this.onStatusChange) this.onStatusChange(status);
  }

  /**
   * Create a local game room (host side)
   * Returns the offer string that the guest needs to connect
   */
  async createRoom(): Promise<{ code: string; offer: string }> {
    this.isHost = true;
    this.roomCode = generateRoomCode();
    this.setStatus('hosting');

    const config: RTCConfiguration = {
      iceServers: [
        // Local-only: no STUN/TURN servers needed for same-LAN
        // But include one STUN for cases where they're on different subnets
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    };

    this.peerConnection = new RTCPeerConnection(config);
    this.iceCandidates = [];

    // Collect ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.iceCandidates.push(event.candidate);
      }
    };

    // Create data channel
    this.dataChannel = this.peerConnection.createDataChannel('game', {
      ordered: true,
    });
    this.setupDataChannel(this.dataChannel);

    // Create offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Wait for ICE gathering to complete
    await this.waitForIceGathering();

    const offerString = JSON.stringify(this.peerConnection.localDescription);
    const encodedOffer = btoa(offerString);

    return { code: this.roomCode, offer: encodedOffer };
  }

  /**
   * Accept a guest's answer (host side)
   */
  async acceptAnswer(encodedAnswer: string): Promise<void> {
    if (!this.peerConnection) throw new Error('No peer connection');

    const answerString = atob(encodedAnswer);
    const answer = JSON.parse(answerString) as RTCSessionDescriptionInit;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  /**
   * Join a local game room (guest side)
   * Returns the answer string that the host needs
   */
  async joinRoom(encodedOffer: string): Promise<string> {
    this.isHost = false;
    this.setStatus('joining');

    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    };

    this.peerConnection = new RTCPeerConnection(config);
    this.iceCandidates = [];

    // Collect ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.iceCandidates.push(event.candidate);
      }
    };

    // Listen for data channel from host
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };

    // Set remote description (host's offer)
    const offerString = atob(encodedOffer);
    const offer = JSON.parse(offerString) as RTCSessionDescriptionInit;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // Create answer
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    // Wait for ICE gathering
    await this.waitForIceGathering();

    const answerString = JSON.stringify(this.peerConnection.localDescription);
    return btoa(answerString);
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    channel.onopen = () => {
      this.setStatus('connected');
      if (this.onConnected) this.onConnected();
      eventBus.emit(AppEvents.LOCAL_PEER_DISCOVERED);
    };

    channel.onclose = () => {
      this.setStatus('idle');
      if (this.onDisconnected) this.onDisconnected();
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessage) this.onMessage(data);
      } catch {
        console.warn('Failed to parse local message:', event.data);
      }
    };

    channel.onerror = (event) => {
      console.error('DataChannel error:', event);
      this.setStatus('error');
    };
  }

  send(data: unknown): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(data));
    }
  }

  sendMove(cellIndex: number, moveNumber: number): void {
    this.send({
      type: 'move',
      cellIndex,
      moveNumber,
      timestamp: Date.now(),
    });
  }

  sendPlayerInfo(name: string, frame = 'none'): void {
    this.send({
      type: 'playerInfo',
      name,
      frame,
      timestamp: Date.now(),
    });
  }

  sendReady(): void {
    this.send({ type: 'ready' });
  }

  sendRematch(): void {
    this.send({ type: 'rematch' });
  }

  sendRematchAccept(): void {
    this.send({ type: 'rematchAccept' });
  }

  sendGameState(state: unknown): void {
    this.send({
      type: 'sync',
      state: JSON.stringify(state),
    });
  }

  sendGameOver(winner: string, winLine: number[]): void {
    this.send({
      type: 'gameOver',
      winner,
      winLine,
      timestamp: Date.now(),
    });
  }

  isConnected(): boolean {
    return this.dataChannel?.readyState === 'open';
  }

  disconnect(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.roomCode = null;
    this.iceCandidates = [];
    this.setStatus('idle');
  }

  private waitForIceGathering(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.peerConnection) {
        resolve();
        return;
      }

      if (this.peerConnection.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const checkState = () => {
        if (this.peerConnection?.iceGatheringState === 'complete') {
          this.peerConnection.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };

      this.peerConnection.addEventListener('icegatheringstatechange', checkState);

      // Timeout after 5 seconds
      setTimeout(() => {
        this.peerConnection?.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, 5000);
    });
  }
}

// Singleton
export const localDiscovery = new LocalDiscoveryManager();
