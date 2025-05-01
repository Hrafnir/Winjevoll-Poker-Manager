// === tournament-logic.js ===
// Kalkuleringer og spill-logikk

// Fjernet: import { getPlayerNameById } from './tournament-ui.js'; // Feil import

// === Eksporterte funksjoner ===

export function getPlayerNameById(playerId, state) { // NY DEFINISJON + EKSPORT
    const targetId = Number(playerId); // Sikre at vi sammenligner tall
    if (!state || !state.live) return 'Ukjent (feil)';
    const player = state.live.players.find(p => p.id === targetId) || state.live.eliminatedPlayers.find(p => p.id === targetId);
    return player ? player.name : 'Ukjent Spiller';
}

export function calculateTotalChips(state) {
    if (!state || !state.config || !state.live) return 0;
    const sChips = (state.live.totalEntries || 0) * (state.config.startStack || 0);
    const rChips = (state.live.totalRebuys || 0) * (state.config.rebuyChips || 0);
    const aChips = (state.live.totalAddons || 0) * (state.config.addonChips || 0);
    return sChips + rChips + aChips;
}

export function calculateAverageStack(state) {
    if (!state || !state.live) return 0;
    const ap = state.live.players.length;
    if (ap === 0) return 0;
    const tc = calculateTotalChips(state);
    return Math.round(tc / ap);
}

export function calculatePrizes(state) {
    if (!state || !state.config || !state.live) return [];
    const prizes = [];
    const places = state.config.paidPlaces || 0;
    const dist = state.config.prizeDistribution || [];
    const pot = state.live.totalPot || 0;
    let pPot = pot;
    if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) {
        pPot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0);
    }
    pPot = Math.max(0, pPot);
    if (pPot <= 0 || places <= 0 || dist.length !== places) return prizes;

    let sum = 0;
    for (let i = 0; i < places; i++) {
        const pct = dist[i] || 0;
        let amt;
        if (i === places - 1) { amt = Math.max(0, pPot - sum); }
        else { amt = Math.floor((pPot * pct) / 100); }
        prizes.push({ place: i + 1, amount: amt, percentage: pct });
        sum += amt;
    }
    if (Math.abs(sum - pPot) > 1 && places > 1) {
        console.warn(`Prize calc warning: Sum ${sum} != Pot ${pPot}`);
        if (prizes.length > 0) {
             const diff = pPot - sum;
             prizes[prizes.length - 1].amount += diff;
             console.log(`Adjusting last prize by ${diff}`);
        }
    }
    return prizes;
}

export function findNextPauseInfo(state) {
    if (!state || !state.config || !state.live) return null;
    const idx = state.live.currentLevelIndex;
    const lvls = state.config.blindLevels;
    if (!lvls) return null;
    const startIdx = state.live.isOnBreak ? idx + 1 : idx;
    for (let i = startIdx; i < lvls.length; i++) {
        if (lvls[i].pauseMinutes > 0) {
            return { level: lvls[i].level, duration: lvls[i].pauseMinutes };
        }
    }
    return null;
}

export function logActivity(logArray, message) {
    if (!logArray) {
        console.warn("logActivity called without a valid logArray!");
        logArray = []; // Forsøk å initialisere, men dette bør skje i main state
    }
    const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    logArray.unshift({ timestamp, message });
    const MAX_LOG_ENTRIES = 100;
    if (logArray.length > MAX_LOG_ENTRIES) logArray.pop();
    console.log(`[Log ${timestamp}] ${message}`);
}
