/* ========================================
   Phantom Tac Toe - Local Multiplayer Lobby
   Offline WebRTC peer discovery UI
   ======================================== */

import { localDiscovery } from '../multiplayer/local-discovery';
import { loadData } from '../data/storage';
import { audio } from '../utils/audio';
import { showToast } from '../components/toast';
import { router } from '../core/Router';
import {
  iconArrowLeft,
  iconWifi,
  iconShare,
  iconRocket,
  iconUser,
  iconCheckCircle,
  iconAlert,
} from '../utils/icons';

export function renderLocalNetworkLobby(container: HTMLElement): () => void {
  const data = loadData();

  container.innerHTML = `
    <div class="page local-lobby-page" id="local-lobby">
      <button class="btn btn-ghost btn-icon" id="btn-back-lan" aria-label="Back" style="margin-bottom: var(--space-lg)">${iconArrowLeft}</button>
      
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); text-align: center; margin-bottom: var(--space-sm); display: flex; align-items: center; justify-content: center; gap: var(--space-sm)">
        <span class="icon-header" style="color: var(--neon-green)">${iconWifi}</span> Local Multiplayer
      </h1>
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--space-xs)">
        Play with someone on the same WiFi — no internet required!
      </p>
      <div class="badge badge-green" style="display: block; text-align: center; margin: 0 auto var(--space-2xl); width: fit-content">
        FULLY OFFLINE
      </div>

      <div style="max-width: 500px; margin: 0 auto;">

        <!-- Create Local Game -->
        <div class="card" id="card-create" style="margin-bottom: var(--space-lg); text-align: center; border: 1px solid var(--neon-green)">
          <h3 style="margin-bottom: var(--space-sm); display: flex; align-items: center; justify-content: center; gap: var(--space-xs); color: var(--neon-green)">
            ${iconWifi} Host a Game
          </h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md)">
            Create a room and share the connection data with your friend
          </p>
          <button class="btn btn-lg btn-block" id="btn-create-lan" style="background: linear-gradient(135deg, var(--neon-green), #1aab48); color: #000; font-weight: 700; box-shadow: 0 0 20px rgba(48, 209, 88, 0.3)">
            ${iconWifi} Create Local Game
          </button>
        </div>

        <!-- Host Waiting State (hidden initially) -->
        <div class="card" id="card-hosting" style="display: none; text-align: center; margin-bottom: var(--space-lg); border: 1px solid var(--neon-green)">
          <h3 style="margin-bottom: var(--space-md); color: var(--neon-green)">Room Created!</h3>
          
          <div class="room-code" id="lan-room-code"></div>
          
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin: var(--space-md) 0">
            Share the data below with your friend to connect:
          </p>
          
          <div style="position: relative; margin-bottom: var(--space-md)">
            <textarea id="lan-offer-text" readonly rows="3" 
              style="width: 100%; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-sm); font-size: var(--text-xs); color: var(--text-secondary); resize: none; font-family: monospace"
            ></textarea>
            <button class="btn btn-sm btn-secondary" id="btn-copy-offer" style="position: absolute; top: 4px; right: 4px">
              ${iconShare} Copy
            </button>
          </div>

          <div class="loader-dots" style="margin-bottom: var(--space-md)">
            <span style="color: var(--neon-green); animation: pulse-glow 1.5s infinite">●</span>
            <span style="color: var(--neon-cyan); animation: pulse-glow 1.5s 0.3s infinite">●</span>
            <span style="color: var(--neon-green); animation: pulse-glow 1.5s 0.6s infinite">●</span>
          </div>

          <p style="color: var(--text-tertiary); font-size: var(--text-xs); margin-bottom: var(--space-md)">
            Waiting for your friend to paste their answer below:
          </p>

          <textarea id="lan-answer-input" rows="3" placeholder="Paste your friend's answer here..."
            style="width: 100%; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-sm); font-size: var(--text-xs); color: var(--text-primary); resize: none; font-family: monospace; margin-bottom: var(--space-md)"
          ></textarea>

          <button class="btn btn-primary btn-block" id="btn-accept-answer">
            ${iconCheckCircle} Connect
          </button>
        </div>

        <div style="text-align: center; color: var(--text-tertiary); margin: var(--space-lg) 0">— or —</div>

        <!-- Join Local Game -->
        <div class="card" style="text-align: center; margin-bottom: var(--space-lg)">
          <h3 style="margin-bottom: var(--space-md)">${iconUser} Join a Game</h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md)">
            Paste the connection data from the host
          </p>
          <textarea id="lan-join-offer" rows="3" placeholder="Paste host's connection data here..."
            style="width: 100%; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-sm); font-size: var(--text-xs); color: var(--text-primary); resize: none; font-family: monospace; margin-bottom: var(--space-md)"
          ></textarea>
          <button class="btn btn-primary btn-lg btn-block" id="btn-join-lan">
            ${iconRocket} Join Game
          </button>
        </div>

        <!-- Guest Answer Display (hidden initially) -->
        <div class="card" id="card-guest-answer" style="display: none; text-align: center; margin-bottom: var(--space-lg); border: 1px solid var(--neon-cyan)">
          <h3 style="margin-bottom: var(--space-md); color: var(--neon-cyan)">Almost there!</h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md)">
            Copy this answer and send it back to the host:
          </p>
          <div style="position: relative; margin-bottom: var(--space-md)">
            <textarea id="lan-answer-text" readonly rows="3"
              style="width: 100%; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-sm); font-size: var(--text-xs); color: var(--text-secondary); resize: none; font-family: monospace"
            ></textarea>
            <button class="btn btn-sm btn-secondary" id="btn-copy-answer" style="position: absolute; top: 4px; right: 4px">
              ${iconShare} Copy
            </button>
          </div>
          <p style="color: var(--text-tertiary); font-size: var(--text-xs)">
            Once the host clicks Connect, the game will start automatically!
          </p>
        </div>

        <!-- How it works -->
        <div class="card" style="margin-top: var(--space-lg); border-color: rgba(48, 209, 88, 0.15)">
          <h3 style="font-family: var(--font-display); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); color: var(--neon-green)">
            ${iconWifi} How Local Multiplayer works
          </h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.8">
            <strong style="color: var(--text-primary)">1.</strong> Host creates a game and gets connection data<br>
            <strong style="color: var(--text-primary)">2.</strong> Share the data with your friend (AirDrop, text, etc.)<br>
            <strong style="color: var(--text-primary)">3.</strong> Friend joins and sends back their answer<br>
            <strong style="color: var(--text-primary)">4.</strong> Host connects and the game starts!<br>
            <em style="color: var(--neon-green)">Works completely offline on the same WiFi!</em>
          </p>
        </div>

      </div>
    </div>
  `;

  addLanLobbyStyles();

  // Back button
  document.getElementById('btn-back-lan')?.addEventListener('click', () => {
    audio.playClick();
    localDiscovery.disconnect();
    router.navigate('/');
  });

  // Create local game (host)
  document.getElementById('btn-create-lan')?.addEventListener('click', async () => {
    audio.playClick();
    const btn = document.getElementById('btn-create-lan') as HTMLButtonElement;
    btn.innerHTML = 'Creating...';
    btn.disabled = true;

    try {
      const { code, offer } = await localDiscovery.createRoom();
      
      // Show hosting state
      (document.getElementById('card-create') as HTMLElement).style.display = 'none';
      (document.getElementById('card-hosting') as HTMLElement).style.display = 'block';

      // Display room code
      const codeDisplay = document.getElementById('lan-room-code')!;
      codeDisplay.innerHTML = code.split('').map(c => `<div class="room-code-char">${c}</div>`).join('');

      // Display offer
      (document.getElementById('lan-offer-text') as HTMLTextAreaElement).value = offer;

      showToast('Room created! Share the connection data.', 'check', 3000);
    } catch (err) {
      showToast('Failed to create local game', 'alert', 3000);
      btn.innerHTML = `${iconWifi} Create Local Game`;
      btn.disabled = false;
    }
  });

  // Copy offer
  document.getElementById('btn-copy-offer')?.addEventListener('click', () => {
    const text = (document.getElementById('lan-offer-text') as HTMLTextAreaElement).value;
    navigator.clipboard.writeText(text);
    showToast('Connection data copied!', 'check', 2000);
    audio.playClick();
  });

  // Accept answer (host side)
  document.getElementById('btn-accept-answer')?.addEventListener('click', async () => {
    const answerInput = document.getElementById('lan-answer-input') as HTMLTextAreaElement;
    const answer = answerInput.value.trim();
    
    if (!answer) {
      showToast('Paste your friend\'s answer first', 'alert', 2000);
      return;
    }

    audio.playClick();
    const btn = document.getElementById('btn-accept-answer') as HTMLButtonElement;
    btn.innerHTML = 'Connecting...';
    btn.disabled = true;

    try {
      await localDiscovery.acceptAnswer(answer);
      showToast('Connected! Starting game...', 'check', 2000);
      setTimeout(() => router.navigate('/play/local-network'), 1000);
    } catch (err) {
      showToast('Connection failed. Check the answer data.', 'alert', 3000);
      btn.innerHTML = `${iconCheckCircle} Connect`;
      btn.disabled = false;
    }
  });

  // Join local game (guest)
  document.getElementById('btn-join-lan')?.addEventListener('click', async () => {
    const offerInput = document.getElementById('lan-join-offer') as HTMLTextAreaElement;
    const offer = offerInput.value.trim();

    if (!offer) {
      showToast('Paste the host\'s connection data first', 'alert', 2000);
      return;
    }

    audio.playClick();
    const btn = document.getElementById('btn-join-lan') as HTMLButtonElement;
    btn.innerHTML = 'Joining...';
    btn.disabled = true;

    try {
      const answerData = await localDiscovery.joinRoom(offer);

      // Show answer display
      (document.getElementById('card-guest-answer') as HTMLElement).style.display = 'block';
      (document.getElementById('lan-answer-text') as HTMLTextAreaElement).value = answerData;

      showToast('Connected! Send the answer back to the host.', 'check', 3000);

      // Set up auto-navigate when connection completes
      localDiscovery.setOnConnected(() => {
        showToast('Game starting!', 'check', 2000);
        setTimeout(() => router.navigate('/play/local-network'), 1000);
      });
    } catch (err) {
      showToast('Failed to join. Check the connection data.', 'alert', 3000);
      btn.innerHTML = `${iconRocket} Join Game`;
      btn.disabled = false;
    }
  });

  // Copy answer
  document.getElementById('btn-copy-answer')?.addEventListener('click', () => {
    const text = (document.getElementById('lan-answer-text') as HTMLTextAreaElement).value;
    navigator.clipboard.writeText(text);
    showToast('Answer copied! Send it to the host.', 'check', 2000);
    audio.playClick();
  });

  // Cleanup on unmount
  return () => {
    localDiscovery.disconnect();
  };
}

function addLanLobbyStyles(): void {
  if (document.getElementById('lan-lobby-styles')) return;
  const style = document.createElement('style');
  style.id = 'lan-lobby-styles';
  style.textContent = `
    .local-lobby-page textarea:focus {
      outline: none;
      border-color: var(--neon-green);
      box-shadow: 0 0 8px rgba(48, 209, 88, 0.2);
    }
    .local-lobby-page .room-code-char {
      border-color: var(--neon-green);
      color: var(--neon-green);
      text-shadow: 0 0 10px rgba(48, 209, 88, 0.5);
    }
  `;
  document.head.appendChild(style);
}
