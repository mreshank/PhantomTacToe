/* ========================================
   InfiniToe - SVG Icon System
   Inline SVG icons replacing all emojis
   ======================================== */

// Helper to create consistent SVG wrapper
const svg = (inner, vb = "0 0 24 24", cls = "") =>
  `<svg class="icon ${cls}" viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

// ---- Navigation ---- //
export const iconHome = svg(
  `<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const iconPlay = svg(
  `<path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" fill="currentColor"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>`,
);

export const iconLeaderboard = svg(
  `<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const iconRewards = svg(
  `<path d="M5 3h14a1 1 0 011 1v2a3 3 0 01-3 3h-2l-3 9-3-9H7a3 3 0 01-3-3V4a1 1 0 011-1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9v12M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconSettings = svg(
  `<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>`,
);

// ---- Game Modes ---- //
export const iconRobot = svg(
  `<rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="14" r="1.5" fill="currentColor"/><circle cx="15" cy="14" r="1.5" fill="currentColor"/><path d="M8 8V6a4 4 0 018 0v2" stroke="currentColor" stroke-width="2"/><line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconGamepad = svg(
  `<rect x="2" y="6" width="20" height="12" rx="4" stroke="currentColor" stroke-width="2"/><line x1="8" y1="10" x2="8" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/>`,
);

export const iconGlobe = svg(
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" stroke-width="2"/>`,
);

// ---- Actions ---- //
export const iconArrowLeft = svg(
  `<path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const iconRefresh = svg(
  `<path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L4 7m16 10l-1.64-1.36A9 9 0 014.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const iconShare = svg(
  `<path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16 6 12 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconCopy = svg(
  `<rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>`,
);

export const iconTrash = svg(
  `<polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" stroke-width="2"/>`,
);

export const iconDice = svg(
  `<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>`,
);

export const iconRocket = svg(
  `<path d="M12 2c0 0-8 4-8 14l3 4 5-3 5 3 3-4c0-10-8-14-8-14z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2" stroke="currentColor" stroke-width="2"/>`,
);

// ---- Status/Info ---- //
export const iconTrophy = svg(
  `<path d="M6 9H4a2 2 0 01-2-2V5h4m14 4h2a2 2 0 002-2V5h-4" stroke="currentColor" stroke-width="2"/><path d="M4 5h16v4a6 6 0 01-6 6h-4a6 6 0 01-6-6V5z" stroke="currentColor" stroke-width="2"/><path d="M12 15v4m-3 2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconStar = svg(
  `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
);

export const iconCrown = svg(
  `<path d="M2 20h20L19 8l-4 5-3-7-3 7-4-5-3 12z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
);

export const iconFire = svg(
  `<path d="M12 22c-4.97 0-9-2.69-9-6 0-2.5 2.5-5 4-6.5 0 0 1 2.5 3 3.5 0-5 3-7.5 5-10 1 2.5 2 5 2 8 1.5-1 3-3.5 3-3.5 1.5 1.5 4 4 4 6.5 0 3.31-4.03 6-9 6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
);

export const iconBolt = svg(
  `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
);

export const iconCoin = svg(
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M14.5 9a2.5 2.5 0 00-5 0c0 2.5 5 2.5 5 5a2.5 2.5 0 01-5 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="5" x2="12" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconGift = svg(
  `<path d="M20 12v10H4V12" stroke="currentColor" stroke-width="2"/><path d="M2 7h20v5H2V7z" stroke="currentColor" stroke-width="2"/><line x1="12" y1="22" x2="12" y2="7" stroke="currentColor" stroke-width="2"/><path d="M12 7c-2 0-4-1-4-3s2-3 4-3c0 2 0 6 0 6z" stroke="currentColor" stroke-width="2"/><path d="M12 7c2 0 4-1 4-3s-2-3-4-3c0 2 0 6 0 6z" stroke="currentColor" stroke-width="2"/>`,
);

export const iconCheck = svg(
  `<polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const iconCheckCircle = svg(
  `<path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const iconX = svg(
  `<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconXCircle = svg(
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconAlert = svg(
  `<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/>`,
);

export const iconClock = svg(
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const iconInfinity = svg(
  `<path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const iconSparkle = svg(
  `<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
);

export const iconMuscle = svg(
  `<path d="M7 11c0-3 1.5-7 5-7s5 4 5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 22V12a2 2 0 012-2h10a2 2 0 012 2v10" stroke="currentColor" stroke-width="2"/><path d="M3 14h2m14 0h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconMedal = svg(
  `<circle cx="12" cy="8" r="6" stroke="currentColor" stroke-width="2"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const iconDiamond = svg(
  `<path d="M2.5 8.5L12 2l9.5 6.5L12 22 2.5 8.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M2.5 8.5h19" stroke="currentColor" stroke-width="2"/>`,
);

export const iconUser = svg(
  `<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M20 21a8 8 0 10-16 0" stroke="currentColor" stroke-width="2"/>`,
);

export const iconUsers = svg(
  `<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2"/>`,
);

export const iconWifi = svg(
  `<path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="20" r="1" fill="currentColor"/>`,
);

export const iconWifiOff = svg(
  `<line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="20" r="1" fill="currentColor"/>`,
);

export const iconVolume = svg(
  `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconVolumeOff = svg(
  `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconMusic = svg(
  `<path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/>`,
);

export const iconTarget = svg(
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2"/>`,
);

export const iconHeart = svg(
  `<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2"/>`,
);

export const iconShoppingBag = svg(
  `<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" stroke-width="2"/><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/><path d="M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
);

export const iconEye = svg(
  `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>`,
);

// ---- Quick reaction icons instead of emoji buttons ---- //
export const iconSmile = svg(
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
);

export const iconFrown = svg(
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M16 16s-1.5-2-4-2-4 2-4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
);

export const iconLaugh = svg(
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8 14h8a4 4 0 01-8 0z" fill="currentColor" stroke="currentColor" stroke-width="1"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
);

export const iconClap = svg(
  `<path d="M12 6V2M8 8l-3-3M16 8l3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 13l-1 7h12l-1-7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 13V9a3 3 0 016 0v4" stroke="currentColor" stroke-width="2"/>`,
);

// ---- Avatars (simple geometric icons) ---- //
const avatarSvg = (inner) => svg(inner, "0 0 24 24", "avatar-icon");

export const avatarIcons = [
  avatarSvg(
    `<circle cx="12" cy="8" r="5" stroke="currentColor" stroke-width="2"/><path d="M20 21a8 8 0 10-16 0" stroke="currentColor" stroke-width="2"/><line x1="9" y1="8" x2="9" y2="8.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="15" y1="8" x2="15" y2="8.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
  ), // Cool
  avatarSvg(
    `<circle cx="12" cy="8" r="5" stroke="currentColor" stroke-width="2"/><path d="M20 21a8 8 0 10-16 0" stroke="currentColor" stroke-width="2"/><path d="M9.5 7l3-2 3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  ), // Cowboy
  avatarSvg(
    `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 14l4 2 4-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  ), // Ninja
  avatarSvg(
    `<path d="M12 2L8 8h8l-4-6zM12 22l-4-6h8l-4 6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>`,
  ), // Alien
  avatarSvg(
    `<rect x="5" y="6" width="14" height="14" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="13" r="1.5" fill="currentColor"/><circle cx="15" cy="13" r="1.5" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  ), // Robot
  avatarSvg(
    `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" stroke="currentColor" stroke-width="1.5"/>`,
  ), // Jack-o
  avatarSvg(
    `<circle cx="12" cy="10" r="4" stroke="currentColor" stroke-width="2"/><path d="M6 20c0-4 3-6 6-6s6 2 6 6" stroke="currentColor" stroke-width="2"/><path d="M16 7l3-5M8 7L5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  ), // Fox
  avatarSvg(
    `<circle cx="12" cy="10" r="5" stroke="currentColor" stroke-width="2"/><path d="M7 5l-2-3M17 5l2-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 20c0-4 3-7 7-7s7 3 7 7" stroke="currentColor" stroke-width="2"/>`,
  ), // Cat
  avatarSvg(
    `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  ), // Star
  avatarSvg(
    `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M9 9l2 1M15 9l-2 1M8 15c1 1.5 2.5 2 4 2s3-.5 4-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  ), // Skull
  avatarSvg(
    `<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>`,
  ), // Fire
  avatarSvg(
    `<ellipse cx="12" cy="12" rx="9" ry="10" stroke="currentColor" stroke-width="2"/><path d="M7 8c1-1 3-1.5 5-1.5s4 .5 5 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 12v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="19" r="1" fill="currentColor"/>`,
  ), // Brain
];
