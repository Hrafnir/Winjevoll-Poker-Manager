// === tournament-logic.js ===
// Kalkuleringer og spill-logikk

import { getPlayerNameById } from './tournament-ui.js'; // Importer formateringshjelper

export function calculateTotalChips(state) {
    const sChips = (state.live.totalEntries || 0) * (state.config.startStack || 0);
    const rChips = (state.live.totalRebuys || 0) * (state.config.rebuyChips || 0);
    const aChips = (state.live.totalAddons || 0) * (state.config.addonChips || 0);
    return sChips + rChips + aChips;
}

export function calculateAverageStack(state) {
    const ap = state.live.players.length;
    if (ap === 0) return 0;
    const tc = calculateTotalChips(state);
    return Math.round(tc / ap);
}

export function calculatePrizes(state) {
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
        // Juster siste premie for å matche?
        if (prizes.length > 0) {
             const diff = pPot - sum;
             prizes[prizes.length - 1].amount += diff;
             console.log(`Adjusting last prize by ${diff}`);
        }
    }
    return prizes;
}

export function findNextPauseInfo(state) {
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

// Loggfunksjon (kan evt. flyttes til egen logg-modul senere)
export function logActivity(logArray, message) {
    if (!logArray) logArray = []; // Bør håndteres der state opprettes
    const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    logArray.unshift({ timestamp, message });
    const MAX_LOG_ENTRIES = 100; // Definer konstant
    if (logArray.length > MAX_LOG_ENTRIES) logArray.pop();
    console.log(`[Log ${timestamp}] ${message}`);
}
