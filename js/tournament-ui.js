// === tournament-ui.js ===
// Funksjoner for å oppdatere brukergrensesnittet og formatere data.

// --- IMPORTS ---
import { loadThemeBgColor, loadThemeTextColor, parseRgbString, DEFAULT_ELEMENT_LAYOUTS } from './storage.js'; // Importer DEFAULT_ELEMENT_LAYOUTS
import { calculateAverageStack, calculatePrizes, findNextPauseInfo, getPlayerNameById } from './tournament-logic.js';
// -----------------------------------------------------------------------

// === 01: FORMATTING HELPER FUNCTIONS START ===
// -----------------------------------------------------------------------
export function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) return "--:--";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
export function formatBlindsHTML(level) {
    if (!level) return '--/--';
    const sb = level.sb ?? '--'; const bb = level.bb ?? '--'; const ante = level.ante ?? 0;
    return `<span class="value">${sb}</span>/<span class="value">${bb}</span>${ante > 0 ? `<span class="label">A:</span><span class="value">${ante}</span>` : ''}`;
}
export function formatNextBlindsText(level) {
    if (!level) return "-- / --";
    return `${level.sb ?? '--'}/${level.bb ?? '--'}${level.ante > 0 ? ` (A: ${level.ante})` : ''}`;
}
// -----------------------------------------------------------------------
// === 01: FORMATTING HELPER FUNCTIONS END ===


// === 02: THEME AND LAYOUT FUNCTIONS START ===
// -----------------------------------------------------------------------
let currentLogoObjectUrl = null;
export function revokeObjectUrl(url) { if (url && url.startsWith('blob:')) { URL.revokeObjectURL(url); } }

export function updateMainLogoImage(logoBlob, targetImgElement) {
    if (!targetImgElement) { console.warn("updateMainLogoImage: Target image element not found."); return; }
    revokeObjectUrl(currentLogoObjectUrl); // Frigi gammel URL
    if (logoBlob instanceof Blob && logoBlob.size > 0) {
        currentLogoObjectUrl = URL.createObjectURL(logoBlob);
        targetImgElement.src = currentLogoObjectUrl;
        targetImgElement.style.display = ''; // Sørg for at den vises
    } else {
        currentLogoObjectUrl = null;
        targetImgElement.src = 'placeholder-logo.png'; // Bruk placeholder
        targetImgElement.style.display = ''; // Vis placeholder
    }
}

export function applyThemeAndLayout(bgColor, textColor, elementLayouts, draggableElements) {
    console.log("Applying theme and layout...");
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--live-page-bg', bgColor);
    rootStyle.setProperty('--live-page-text', textColor);
    try { const [r, g, b] = parseRgbString(bgColor); const brightness = (r * 299 + g * 587 + b * 114) / 1000; const borderColor = brightness < 128 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'; rootStyle.setProperty('--live-ui-border', borderColor); } catch (e) { rootStyle.setProperty('--live-ui-border', 'rgba(128, 128, 128, 0.15)'); }

    const defaults = DEFAULT_ELEMENT_LAYOUTS; // Bruk importert default

    if (!elementLayouts || typeof elementLayouts !== 'object') {
        console.error("applyThemeAndLayout: elementLayouts argument missing or invalid! Using defaults.", elementLayouts);
        elementLayouts = JSON.parse(JSON.stringify(defaults)); // Bruk kopi av default
    }

    // Sørg for at alle default-nøkler finnes i elementLayouts
    for (const key in defaults) {
        if (!elementLayouts[key]) {
            elementLayouts[key] = JSON.parse(JSON.stringify(defaults[key])); // Legg til manglende element fra default
        } else if (typeof defaults[key] === 'object' && defaults[key] !== null) {
            // Sørg for at alle sub-nøkler finnes
            elementLayouts[key] = { ...defaults[key], ...elementLayouts[key] };
        }
    }


    rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas?.height ?? defaults.canvas.height}vh`);

    if (!draggableElements || !Array.isArray(draggableElements)) {
         console.error("applyThemeAndLayout: draggableElements argument missing or not an array!");
         draggableElements = [];
    }

    draggableElements.forEach(element => {
        if (!element || !element.id) return; // Ekstra sjekk
        const elementId = element.id.replace('-element', '');
        const layout = elementLayouts[elementId]; // Skal nå alltid finnes pga. merging over

        if (!layout) {
             console.warn(`Layout for element ${elementId} still not found after merge! Skipping.`);
             return;
        }

        const isVisible = layout.isVisible ?? true;
        element.classList.toggle('element-hidden', !isVisible);

        if (isVisible) {
             element.style.left = `${layout.x ?? 0}%`;
             element.style.top = `${layout.y ?? 0}%`;
             element.style.width = `${layout.width ?? 50}%`;
             if (elementId === 'logo') {
                 element.style.height = `${layout.height ?? 30}%`;
                 element.style.fontSize = '1em';
             } else {
                 element.style.fontSize = `${layout.fontSize ?? 1}em`;
                 element.style.height = 'auto';
             }
        }
    });

    // Info toggles
    const infoLayout = elementLayouts.info || defaults.info;
    const infoParagraphs = { showNextBlinds: document.getElementById('info-next-blinds'), showNextPause: document.getElementById('info-next-pause'), showAvgStack: document.getElementById('info-avg-stack'), showPlayers: document.getElementById('info-players'), showLateReg: document.getElementById('info-late-reg') };
    for (const key in infoParagraphs) { if (infoParagraphs[key]) { infoParagraphs[key].classList.toggle('hidden', !(infoLayout[key] ?? true)); } }
    console.log("Theme and layout styles applied.");
}
// -----------------------------------------------------------------------
// === 02: THEME AND LAYOUT FUNCTIONS END ===


// === 03: CORE UI UPDATE FUNCTIONS START ===
// -----------------------------------------------------------------------

// Funksjon for å lage spiller-HTML (brukes i renderPlayerList)
function createPlayerHTML(player, config, state, isEliminated) {
    const li = document.createElement('li');
    li.dataset.playerId = player.id;
    let details = '';
    if (!isEliminated) {
         details = ` (B${player.table}S${player.seat || '?'})`;
         if (player.rebuys > 0) details += ` [R:${player.rebuys}]`;
         if (player.addon) details += ` [A]`;
         if (config.type === 'knockout') details += ` (KO:${player.knockouts || 0})`;
    } else {
         details = ` (${player.place || '?'}. pl.)`;
         if (player.eliminatedBy) { details += ` av ${getPlayerNameById(player.eliminatedBy, state)}`; }
    }

    li.innerHTML = `
        <span class="player-name">${player.name || 'Ukjent'}</span>
        <span class="player-details">${details}</span>
        <div class="player-actions">
            ${isEliminated ? `
                <button class="btn-restore small-button" data-player-id="${player.id}" title="Gjenopprett ${player.name}">↩️</button>
                <button class="btn-edit-player small-button" data-player-id="${player.id}" title="Rediger ${player.name}">✏️</button>
            ` : `
                ${config.type === 'rebuy' ? `<button class="btn-rebuy small-button" data-player-id="${player.id}" title="Rebuy for ${player.name}" ${state.live.currentLevelIndex + 1 > config.rebuyLevels ? 'disabled' : ''}>R</button>` : ''}
                <button class="btn-eliminate small-button" data-player-id="${player.id}" title="Eliminer ${player.name}">❌</button>
                <button class="btn-edit-player small-button" data-player-id="${player.id}" title="Rediger ${player.name}">✏️</button>
            `}
        </div>
    `;
    return li;
}


export function renderPlayerList(state) {
     if (!state || !state.live || !state.config) { console.warn("renderPlayerList: Invalid state provided."); return; }
    const activeList = document.getElementById('player-list'); const eliminatedList = document.getElementById('eliminated-player-list'); const activeCount = document.getElementById('active-player-count'); const elimCount = document.getElementById('eliminated-player-count');
    if (!activeList || !eliminatedList || !activeCount || !elimCount) { console.error("Player list elements not found!"); return; }

    activeList.innerHTML = ''; eliminatedList.innerHTML = '';
    state.live.players.sort((a, b) => { if (a.table !== b.table) return (a.table || 0) - (b.table || 0); return (a.seat || 0) - (b.seat || 0); });
    state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));

    if (state.live.players.length === 0) { activeList.innerHTML = '<li>Ingen aktive spillere.</li>'; } else { state.live.players.forEach(p => activeList.appendChild(createPlayerHTML(p, state.config, state, false))); }
    if (state.live.eliminatedPlayers.length === 0) { eliminatedList.innerHTML = '<li>Ingen eliminerte spillere.</li>'; } else { state.live.eliminatedPlayers.forEach(p => eliminatedList.appendChild(createPlayerHTML(p, state.config, state, true))); }
    activeCount.textContent = state.live.players.length; elimCount.textContent = state.live.eliminatedPlayers.length;
}

export function displayPrizes(state) {
     if (!state || !state.config || !state.live) { console.warn("displayPrizes: Invalid state provided."); return; }
    const prizeDisplay = document.getElementById('prize-display-live');
    if (!prizeDisplay) { console.error("Prize display ERROR: Container element '#prize-display-live' not found!"); return; }

    const prizes = calculatePrizes(state);
    const totalPrizePot = prizes.reduce((sum, p) => sum + p.amount, 0);
    const totalPotValue = state.live.totalPot || 0;

    // Bygg H3-innhold
    const h3Content = `Premiefordeling (Premiepott: ${totalPrizePot} kr)<br>(Total pott: <span id="total-pot">${totalPotValue}</span> kr)`;

    // Tøm kun innhold ETTER H3 (hvis den finnes)
    let h3 = prizeDisplay.querySelector('h3');
    if (h3) {
        h3.innerHTML = h3Content; // Oppdater eksisterende H3
        while (h3.nextSibling) {
            prizeDisplay.removeChild(h3.nextSibling);
        }
    } else {
        prizeDisplay.innerHTML = ''; // Tøm alt hvis H3 manglet
        h3 = document.createElement('h3');
        h3.innerHTML = h3Content;
        prizeDisplay.appendChild(h3);
    }

    // Legg til premieliste eller melding
    if (prizes.length > 0) {
        const ol = document.createElement('ol');
        prizes.forEach(p => { const li = document.createElement('li'); li.textContent = `${p.place}. plass: ${p.amount} kr (${p.percentage}%)`; ol.appendChild(li); });
        prizeDisplay.appendChild(ol);
    } else {
        const p = document.createElement('p'); p.textContent = 'Ingen premiefordeling definert eller pott er 0.';
        prizeDisplay.appendChild(p);
    }

    // Legg til knockout-info
     if (state.config.type === 'knockout' && state.config.bountyAmount > 0) {
         const pKO = document.createElement('p');
         pKO.innerHTML = `<small>(${state.config.bountyAmount} kr per knockout ikke inkludert i premiepotten ovenfor)</small>`;
         prizeDisplay.appendChild(pKO);
     }
     prizeDisplay.classList.remove('hidden'); // Sørg for at den vises
}


export function renderActivityLog(state) {
     if (!state || !state.live) { console.warn("renderActivityLog: Invalid state provided."); return; }
    const logUl = document.getElementById('activity-log-list'); if (!logUl) { console.error("Activity log UL element not found!"); return; }
    logUl.innerHTML = ''; if (!state.live.activityLog || state.live.activityLog.length === 0) { logUl.innerHTML = '<li>Loggen er tom.</li>'; return; }
    state.live.activityLog.forEach(entry => { const li = document.createElement('li'); li.innerHTML = `<span class="log-time">${entry.timestamp || '--:--:--'}</span> ${entry.message}`; logUl.appendChild(li); });
}

export function updateSoundToggleVisuals(soundsEnabled) {
    const btn = document.getElementById('btn-toggle-sound'); if (btn) { btn.textContent = soundsEnabled ? '🔊 Lyd På' : '🔇 Lyd Av'; btn.title = soundsEnabled ? 'Slå av lyd' : 'Slå på lyd'; }
}

// Hovedfunksjon for å oppdatere hele UI basert på state
export function updateUI(state) {
    console.log("updateUI() called. Status:", state?.live?.status);
     if (!state || !state.config || !state.live) { console.error("updateUI called with invalid state:", state); return; }
     try {
         // --- Oppdater enkle tekstfelter ---
         const nameDisplay = document.getElementById('tournament-name-display'); if (nameDisplay) nameDisplay.textContent = state.config.name || 'Ukjent Turnering';
         const averageStackDisplay = document.getElementById('average-stack'); if (averageStackDisplay) averageStackDisplay.textContent = calculateAverageStack(state);
         const playersRemainingDisplay = document.getElementById('players-remaining'); if (playersRemainingDisplay) playersRemainingDisplay.textContent = state.live.players.length;
         const totalEntriesDisplay = document.getElementById('total-entries'); if (totalEntriesDisplay) totalEntriesDisplay.textContent = state.live.totalEntries || 0;

         // --- Timer og Pause ---
         const timerDisplay = document.getElementById('timer-display'); const breakInfo = document.getElementById('break-info');
         if (timerDisplay && breakInfo) { if (state.live.isOnBreak) { timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak); breakInfo.classList.remove('hidden'); } else { timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); breakInfo.classList.add('hidden'); } }
         else { console.warn("Timer display elements not found."); }

         // --- Blinds og Nivå ---
         const currentLevelDisplay = document.getElementById('current-level'); const blindsDisplayEl = document.getElementById('blinds-display'); const currentLevelIndex = state.live.currentLevelIndex; const currentLevelData = state.config.blindLevels?.[currentLevelIndex];
         if (currentLevelDisplay && blindsDisplayEl && currentLevelData) { currentLevelDisplay.textContent = `Nivå ${currentLevelData.level}`; blindsDisplayEl.innerHTML = formatBlindsHTML(currentLevelData); }
         else { if (currentLevelDisplay) currentLevelDisplay.textContent = 'Nivå ?'; if (blindsDisplayEl) blindsDisplayEl.innerHTML = formatBlindsHTML(null); if (!currentLevelData) console.warn(`No blind data found for index ${currentLevelIndex}`); }

         // --- Info Boks Detaljer ---
         const nextBlindsDisplay = document.getElementById('next-blinds'); const nextLevelData = state.config.blindLevels?.[currentLevelIndex + 1];
         if (nextBlindsDisplay) { nextBlindsDisplay.textContent = nextLevelData ? formatNextBlindsText(nextLevelData) : 'Ingen flere'; nextBlindsDisplay.parentElement.classList.toggle('hidden', !nextLevelData); }
         const infoNextPauseParagraph = document.getElementById('info-next-pause'); const nextPauseInfo = findNextPauseInfo(state);
         if (infoNextPauseParagraph) { const nextPauseTimeSpan = document.getElementById('next-pause-time'); if (nextPauseInfo && nextPauseTimeSpan) { nextPauseTimeSpan.textContent = `etter Nivå ${nextPauseInfo.level} (${nextPauseInfo.duration} min)`; infoNextPauseParagraph.classList.remove('hidden'); } else { infoNextPauseParagraph.classList.add('hidden'); } }

         // --- Late Reg ---
         const lateRegStatusDisplay = document.getElementById('late-reg-status'); const lateRegButton = document.getElementById('btn-late-reg');
         if (lateRegStatusDisplay && lateRegButton) { const currentLevelNum = currentLevelData?.level ?? 0; const lateRegAllowed = state.config.lateRegLevel > 0 && currentLevelNum <= state.config.lateRegLevel; const lateRegStatusText = state.config.lateRegLevel > 0 ? (lateRegAllowed ? `Åpen t.o.m. Nivå ${state.config.lateRegLevel}` : `Stengt (etter Nivå ${state.config.lateRegLevel})`) : 'Ikke tilgjengelig'; lateRegStatusDisplay.textContent = lateRegStatusText; lateRegButton.disabled = !lateRegAllowed || state.live.status === 'finished'; }

         // --- Render Lister og Visning ---
         renderPlayerList(state);
         displayPrizes(state);
         renderActivityLog(state);

         // --- Knappestatus ---
         const startPauseButton = document.getElementById('btn-start-pause'); const endTournamentButton = document.getElementById('btn-end-tournament'); const levelButtons = document.querySelectorAll('#btn-prev-level, #btn-next-level, #btn-adjust-time-minus, #btn-adjust-time-plus');
         if (startPauseButton) { if (state.live.status === 'running') { startPauseButton.textContent = 'Pause Klokke'; startPauseButton.classList.remove('success-button'); startPauseButton.classList.add('warning-button'); startPauseButton.disabled = false; } else if (state.live.status === 'paused') { startPauseButton.textContent = 'Start Klokke'; startPauseButton.classList.remove('warning-button'); startPauseButton.classList.add('success-button'); startPauseButton.disabled = false; } else { startPauseButton.textContent = 'Turnering Fullført'; startPauseButton.disabled = true; } }
         if (endTournamentButton) { endTournamentButton.disabled = state.live.status === 'finished'; }
         levelButtons.forEach(btn => { btn.disabled = state.live.status === 'finished'; });

         // --- Add-on Knapp ---
         const btnManageAddons = document.getElementById('btn-manage-addons'); if (btnManageAddons) { const showAddonButton = state.config.type === 'rebuy' && state.config.addonCost > 0 && state.config.addonChips > 0 && state.live.status !== 'finished'; btnManageAddons.classList.toggle('hidden', !showAddonButton); }

         // --- Tab Tittel ---
         document.title = `${state.config.name} - Live`;

     } catch (error) {
         console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
         console.error("Error caught inside updateUI function:", error);
         console.error("State at time of error:", JSON.parse(JSON.stringify(state)));
         console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
         const errorDiv = document.getElementById('ui-error-message');
         if(errorDiv) { errorDiv.textContent = `UI Oppdateringsfeil: ${error.message}. Sjekk konsollen.`; errorDiv.classList.remove('hidden'); }
     }
}
// -----------------------------------------------------------------------
// === 03: CORE UI UPDATE FUNCTIONS END ===
