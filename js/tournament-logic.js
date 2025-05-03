// === tournament-logic.js ===
// Kalkuleringer og spill-logikk

// === 01: PLAYER LOOKUP START ===
// -----------------------------------------------------------------------
export function getPlayerNameById(playerId, state) {
    const targetId = Number(playerId);
    if (!state || !state.live) return 'Ukjent (feil)';
    // Søk i både aktive og eliminerte spillere
    const player = state.live.players.find(p => p.id === targetId) || state.live.eliminatedPlayers.find(p => p.id === targetId);
    return player ? player.name : 'Ukjent Spiller';
}
// -----------------------------------------------------------------------
// === 01: PLAYER LOOKUP END ===


// === 02: CHIP AND STACK CALCULATIONS START ===
// -----------------------------------------------------------------------
export function calculateTotalChips(state) {
    if (!state || !state.config || !state.live) return 0;
    const sChips = (state.live.totalEntries || 0) * (state.config.startStack || 0);
    const rChips = (state.live.totalRebuys || 0) * (state.config.rebuyChips || 0);
    const aChips = (state.live.totalAddons || 0) * (state.config.addonChips || 0);
    return sChips + rChips + aChips;
}

export function calculateAverageStack(state) {
    if (!state || !state.live) return 0;
    const ap = state.live.players.length; // Kun aktive spillere
    if (ap === 0) return 0;
    const tc = calculateTotalChips(state);
    return Math.round(tc / ap);
}
// -----------------------------------------------------------------------
// === 02: CHIP AND STACK CALCULATIONS END ===


// === 03: PRIZE CALCULATIONS START ===
// -----------------------------------------------------------------------
export function calculatePrizes(state) {
    if (!state || !state.config || !state.live) return [];
    const prizes = [];
    const places = state.config.paidPlaces || 0;
    const dist = state.config.prizeDistribution || [];
    const pot = state.live.totalPot || 0;
    let pPot = pot; // Start med total pott

    // Trekk fra bounty hvis knockout
    if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) {
        pPot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0);
    }
    pPot = Math.max(0, pPot); // Sørg for at premiepotten ikke er negativ

    // Sjekk om vi har nok data til å beregne premier
    if (pPot <= 0 || places <= 0 || dist.length !== places) return prizes;

    let sum = 0;
    for (let i = 0; i < places; i++) {
        const pct = dist[i] || 0;
        let amt;
        // Gi resten til sisteplass for å håndtere avrundingsfeil
        if (i === places - 1) {
            amt = Math.max(0, pPot - sum);
        } else {
            // Rund ned for å unngå å gå over potten for tidlig
            amt = Math.floor((pPot * pct) / 100);
        }
        prizes.push({ place: i + 1, amount: amt, percentage: pct });
        sum += amt;
    }

    // Juster siste premie hvis summen ikke stemmer helt pga. avrunding
    if (Math.abs(sum - pPot) > 1 && prizes.length > 0 && places > 1) {
        console.warn(`Prize calc warning: Sum ${sum} != Prize Pot ${pPot}. Adjusting last prize.`);
        const diff = pPot - sum;
        prizes[prizes.length - 1].amount += diff; // Legg til/trekk fra differansen
    }
    return prizes;
}
// -----------------------------------------------------------------------
// === 03: PRIZE CALCULATIONS END ===


// === 04: BLIND LEVEL / PAUSE INFO START ===
// -----------------------------------------------------------------------
export function findNextPauseInfo(state) {
    if (!state || !state.config || !state.live) return null;
    const idx = state.live.currentLevelIndex;
    const lvls = state.config.blindLevels;
    if (!lvls) return null;

    // Start søket fra neste nivå hvis vi er i pause, ellers fra gjeldende nivå
    const startIdx = state.live.isOnBreak ? idx + 1 : idx;

    for (let i = startIdx; i < lvls.length; i++) {
        // Se på *slutten* av nivå 'i' for pause
        if (lvls[i] && lvls[i].pauseMinutes > 0) {
            return { level: lvls[i].level, duration: lvls[i].pauseMinutes };
        }
    }
    return null; // Ingen flere pauser funnet
}
// -----------------------------------------------------------------------
// === 04: BLIND LEVEL / PAUSE INFO END ===


// === 05: ACTIVITY LOGGING START ===
// -----------------------------------------------------------------------
export function logActivity(logArray, message) {
    if (!logArray) {
        console.warn("logActivity called without a valid logArray! Message was:", message);
        return; // Ikke fortsett hvis logArray mangler
    }
    const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    logArray.unshift({ timestamp, message }); // Legg til øverst

    const MAX_LOG_ENTRIES = 100; // Begrens logglengde
    if (logArray.length > MAX_LOG_ENTRIES) {
        logArray.pop(); // Fjern eldste
    }
    console.log(`[Log ${timestamp}] ${message}`);
}
// -----------------------------------------------------------------------
// === 05: ACTIVITY LOGGING END ===
