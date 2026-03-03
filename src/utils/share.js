/* ========================================
   Phantom Tac Toe - Share Utility
   Web Share API + clipboard fallback
   ======================================== */

export async function shareResult(result) {
  const text = generateShareText(result);

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Phantom Tac Toe -- I just won!",
        text,
        url: window.location.origin,
      });
      return true;
    } catch (e) {
      if (e.name !== "AbortError") {
        return copyToClipboard(text);
      }
    }
  } else {
    return copyToClipboard(text);
  }
}

export async function shareChallenge(roomCode) {
  const url = `${window.location.origin}/#/join/${roomCode}`;
  const text = `Challenge me in Phantom Tac Toe!\n\nInfinite 3D Tic-Tac-Toe -- no draws, just vibes!\n\nJoin my room: ${url}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Phantom Tac Toe Challenge!",
        text,
        url,
      });
      return true;
    } catch (e) {
      if (e.name !== "AbortError") {
        return copyToClipboard(url);
      }
    }
  } else {
    return copyToClipboard(url);
  }
}

function generateShareText(result) {
  const statusIcon = result.won ? "[W]" : "[L]";
  const streakText = result.streak > 1 ? `\n${result.streak} win streak!` : "";

  return (
    `${statusIcon} Phantom Tac Toe Result:\n\n` +
    `${result.won ? "Won" : "Lost"} vs ${result.opponent}` +
    `${streakText}\n` +
    `Level ${result.level}\n\n` +
    `Play infinite 3D Tic-Tac-Toe -> ${window.location.origin}`
  );
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
