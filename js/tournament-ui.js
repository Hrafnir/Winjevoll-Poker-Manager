// === tournament-ui.js ===
// Funksjoner for å oppdatere brukergrensesnittet og formatere data.

// IMPORTER nødvendige funksjoner fra storage (hvis de trengs direkte her, ellers får vi data via args)
import { loadThemeBgColor, loadThemeTextColor, loadElementLayouts, parseRgbString } from './storage.js';
import { calculateAverageStack, calculatePrizes, findNextPauseInfo, getPlayerNameById } from './tournament-logic.js'; // Antatt ny fil for logikk

// === Hjelpefunksjoner for formatering ===
export function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatBlindsHTML(level) {
    if (!level) return `<span class="value">--</span>/<span class="value">--</span><span class="label">A:</span><span class="value">--</span>`;
    let anteHtml = '';
    if (level.ante > 0) {
        anteHtml = `<span class="label">A:</span><span class="value">${level.ante.toLocaleString('nb-NO')}</span>`;
    }
    const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO');
    const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO');
    return `<span class="value">${sbFormatted}</span>/<span class="value">${bbFormatted}</span>${anteHtml}`;
}

export function formatNextBlindsText(level) {
    if (!level) return "Slutt";
    const anteText = level.ante > 0 ? ` / A:${level.ante.toLocaleString('nb-NO')}` : '';
    const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO');
    const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO');
    return `${sbFormatted}/${bbFormatted}${anteText}`;
}
// === Slutt Hjelpefunksjoner for formatering ===


// === Funksjoner for Tema og Layout ===
let currentLogoObjectUrl = null; // Holder Object URL for hovedlogoen

export function revokeObjectUrl(url) {
    if (url && url.startsWith('blob:')) {
        try { URL.revokeObjectURL(url); } catch (e) { console.warn("Error revoking Object URL:", url, e); }
    }
}

// Oppdaterer KUN hovedbilde-elementet
export function updateMainLogoImage(logoBlob, targetImgElement = document.getElementById('logo-element')?.querySelector('.logo')) {
     if (!targetImgElement) { console.warn("updateMainLogoImage: logoImg element not found"); return; }

    revokeObjectUrl(currentLogoObjectUrl); // Trekk tilbake forrige URL for hovedlogoen
    let newObjectUrl = null;
    if (logoBlob instanceof Blob && logoBlob.size > 0) {
        try {
            newObjectUrl = URL.createObjectURL(logoBlob);
            targetImgElement.src = newObjectUrl;
            targetImgElement.alt = "Egendefinert Logo";
        } catch (e) { console.error("Error creating main object URL:", e); targetImgElement.src = 'placeholder-logo.png'; targetImgElement.alt = "Feil"; }
    } else {
        targetImgElement.src = 'placeholder-logo.png';
        targetImgElement.alt = "Winjevoll Pokerklubb Logo";
    }
    currentLogoObjectUrl = newObjectUrl; // Oppdater global URL for hovedlogo
}

export function applyThemeAndLayout(bgColor, textColor, elementLayouts, draggableElements) {
    console.log("Applying theme and layout:", bgColor, textColor, elementLayouts);
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--live-page-bg', bgColor);
    rootStyle.setProperty('--live-page-text', textColor);
    try { const [r, g, b] = parseRgbString(bgColor); const brightness = (r * 299 + g * 587 + b * 114) / 1000; const borderColor = brightness < 128 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'; rootStyle.setProperty('--live-ui-border', borderColor); } catch (e) { rootStyle.setProperty('--live-ui-border', 'rgba(128, 128, 128, 0.15)'); }

    const defaults = { // Trenger defaults her også
        canvas: { height: 65 },
        title:  { x: 5,  y: 2,  width: 90, fontSize: 3.5, isVisible: true },
        timer:  { x: 5,  y: 20, width: 55, fontSize: 16,  isVisible: true },
        blinds: { x: 65, y: 40, width: 30, fontSize: 8,   isVisible: true },
        logo:   { x: 65, y: 5,  width: 30, height: 30,  isVisible: true },
        info:   { x: 65, y: 75, width: 30, fontSize: 1.2, isVisible: true, showNextBlinds: true, showAvgStack: true, showPlayers: true, showLateReg: true, showNextPause: true }
    };

    rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas?.height ?? defaults.canvas.height}vh`);

    draggableElements.forEach(element => {
        if (!element) return;
        const elementId = element.id.replace('-element', '');
        // Merge default, lagret (elementLayouts), og sørg for at alle properties finnes
        const layout = {
            ...defaults[elementId],
            ...(elementLayouts[elementId] || {})
        };
        layout.isVisible = layout.isVisible ?? true; // Sikre at isVisible alltid er satt

        element.classList.toggle('element-hidden', !layout.isVisible);
        if (layout.isVisible) {
             element.style.left = `${layout.x}%`; element.style.top = `${layout.y}%`; element.style.width = `${layout.width}%`;
             if (elementId === 'logo') { element.style.height = `${layout.height}%`; element.style.fontSize = '1em'; }
             else { element.style.fontSize = `${layout.fontSize}em`; element.style.height = 'auto'; }
        }
    });
    const infoLayout = { ...defaults.info, ...(elementLayouts.info || {}) };
    const infoParagraphs = { // Trenger referanser eller må sende dem inn
        showNextBlinds: document.getElementById('info-next-blinds'),
        showNextPause: document.getElementById('info-next-pause'),
        showAvgStack: document.getElementById('info-avg-stack'),
        showPlayers: document.getElementById('info-players'),
        showLateReg: document.getElementById('info-late-reg')
    };
    for (const key in infoParagraphs) {
        if (infoParagraphs[key]) {
            infoParagraphs[key].classList.toggle('hidden', !(infoLayout[key] ?? true));
        }
     }
    console.log("Theme and layout styles applied from tournament-ui.js.");
}
// === Slutt Funksjoner for Tema og Layout ===


// === UI Oppdateringsfunksjoner ===
export function renderPlayerList(state, handleEditPlayerClick, handleRebuy, handleEliminate, handleRestore) {
    const playerListUl = document.getElementById('player-list');
    const eliminatedPlayerListUl = document.getElementById('eliminated-player-list');
    const activePlayerCountSpan = document.getElementById('active-player-count');
    const eliminatedPlayerCountSpan = document.getElementById('eliminated-player-count');

    if (!playerListUl || !eliminatedPlayerListUl || !activePlayerCountSpan || !eliminatedPlayerCountSpan) { console.error("Player list elements missing!"); return; }
    playerListUl.innerHTML = ''; eliminatedPlayerListUl.innerHTML = '';
    const currentLevelIndex = state.live.currentLevelIndex;
    const isRebuyPeriod = state.config.type === 'rebuy' && (currentLevelIndex < state.config.rebuyLevels);
    const isAddonAvailable = state.config.type === 'rebuy' && !state.live.status !== 'finished' && ( (currentLevelIndex >= state.config.rebuyLevels) || (currentLevelIndex === state.config.rebuyLevels - 1 && state.live.isOnBreak) );
    const actionsOk = state.live.status !== 'finished';

    const activeSorted = [...state.live.players].sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
    activeSorted.forEach(p => { /* ... (Generer HTML som før) ... */ });
    const elimSorted = [...state.live.eliminatedPlayers].sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));
    elimSorted.forEach(p => { /* ... (Generer HTML som før) ... */ });

    activePlayerCountSpan.textContent = state.live.players.length;
    eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length;

    // Legg til listeners på nytt (mottar handlers som argumenter)
    playerListUl.querySelectorAll('.btn-edit-player').forEach(b => b.onclick = handleEditPlayerClick);
    playerListUl.querySelectorAll('.btn-rebuy').forEach(b => b.onclick = handleRebuy);
    playerListUl.querySelectorAll('.btn-eliminate').forEach(b => b.onclick = handleEliminate);
    eliminatedPlayerListUl.querySelectorAll('.btn-edit-player').forEach(b => b.onclick = handleEditPlayerClick);
    eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(b => b.onclick = handleRestore);
}

export function displayPrizes(state) {
    const prizeDisplayLive = document.getElementById('prize-display-live');
    const totalPotPrizeSpan = document.getElementById('total-pot');
    if (!prizeDisplayLive || !totalPotPrizeSpan) return;
    const prizeData = calculatePrizes(state); // Må kalle logikk-funksjon
    const totalPotFmt = (state.live.totalPot || 0).toLocaleString('nb-NO');
    // ... (resten av logikken som før) ...
}

export function renderActivityLog(state) {
    const activityLogUl = document.getElementById('activity-log-list');
    if (!activityLogUl) return;
    // ... (resten av logikken som før) ...
}

export function updateSoundToggleVisuals(soundsEnabled) {
     const btnToggleSound = document.getElementById('btn-toggle-sound');
     if (btnToggleSound) btnToggleSound.textContent = soundsEnabled ? '🔊 Lyd På' : '🔇 Lyd Av';
}


// Hoved UI-oppdateringsfunksjon
export function updateUI(state) {
    console.log("updateUI (from tournament-ui.js): Updating main UI elements...");
    const nameDisplay = document.getElementById('tournament-name-display');
    const currentTimeDisplay = document.getElementById('current-time');
    const timerDisplay = document.getElementById('timer-display');
    const breakInfo = document.getElementById('break-info');
    const blindsElement = document.getElementById('blinds-element');
    const currentLevelDisplay = document.getElementById('current-level');
    const blindsDisplay = document.getElementById('blinds-display');
    const nextBlindsDisplay = document.getElementById('next-blinds');
    const averageStackDisplay = document.getElementById('average-stack');
    const playersRemainingDisplay = document.getElementById('players-remaining');
    const totalEntriesDisplay = document.getElementById('total-entries');
    const lateRegStatusDisplay = document.getElementById('late-reg-status');
    const infoNextPauseParagraph = document.getElementById('info-next-pause');
    const startPauseButton = document.getElementById('btn-start-pause');
    const prevLevelButton = document.getElementById('btn-prev-level');
    const nextLevelButton = document.getElementById('btn-next-level');
    const adjustTimeMinusButton = document.getElementById('btn-adjust-time-minus');
    const adjustTimePlusButton = document.getElementById('btn-adjust-time-plus');
    const lateRegButton = document.getElementById('btn-late-reg');
    const btnEditTournamentSettings = document.getElementById('btn-edit-tournament-settings');
    const endTournamentButton = document.getElementById('btn-end-tournament');
    const btnManageAddons = document.getElementById('btn-manage-addons'); // Trenger denne også

    if (!state?.config || !state.live) { console.error("State missing in updateUI"); if(nameDisplay) nameDisplay.textContent = "Error!"; return; }

    if (nameDisplay) nameDisplay.textContent = state.config.name;
    if (currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const currentLevelIndex = state.live.currentLevelIndex;
    const cl = state.config.blindLevels?.[currentLevelIndex];
    const nl = state.config.blindLevels?.[currentLevelIndex + 1];
    const np = findNextPauseInfo(state); // Trenger state

    if (state.live.isOnBreak) {
        if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak);
        if(blindsElement) blindsElement.classList.add('hidden');
        if(breakInfo) breakInfo.classList.remove('hidden');
    } else {
        if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel);
        if(blindsElement) blindsElement.classList.remove('hidden');
        if(breakInfo) breakInfo.classList.add('hidden');
        if(currentLevelDisplay) currentLevelDisplay.textContent = `(Nivå ${cl ? cl.level : 'N/A'})`;
        if(blindsDisplay) blindsDisplay.innerHTML = formatBlindsHTML(cl);
    }

    if (nextBlindsDisplay) nextBlindsDisplay.textContent = formatNextBlindsText(nl);
    if (averageStackDisplay) averageStackDisplay.textContent = calculateAverageStack(state).toLocaleString('nb-NO'); // Trenger state
    if (playersRemainingDisplay) playersRemainingDisplay.textContent = state.live.players.length;
    if (totalEntriesDisplay) totalEntriesDisplay.textContent = state.live.totalEntries;

    const currentLevelNum = currentLevelIndex + 1;
    const lrOpen = currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished';
    if (lateRegStatusDisplay) { if (state.config.lateRegLevel > 0) lateRegStatusDisplay.textContent = `${lrOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`; else lateRegStatusDisplay.textContent = 'Ikke aktiv'; }
    if (infoNextPauseParagraph) { const span = infoNextPauseParagraph.querySelector('#next-pause-time'); if (span) span.textContent = np ? `Etter nivå ${np.level} (${np.duration} min)` : 'Ingen flere'; }

    const isFin = state.live.status === 'finished';
    if (startPauseButton) { startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke'; startPauseButton.disabled = isFin; }
    if (prevLevelButton) prevLevelButton.disabled = currentLevelIndex <= 0 || isFin;
    if (nextLevelButton) nextLevelButton.disabled = currentLevelIndex >= state.config.blindLevels.length - 1 || isFin;
    if (adjustTimeMinusButton) adjustTimeMinusButton.disabled = isFin;
    if (adjustTimePlusButton) adjustTimePlusButton.disabled = isFin;
    if (lateRegButton) lateRegButton.disabled = !lrOpen || isFin;
    if (btnEditTournamentSettings) btnEditTournamentSettings.disabled = isFin;
    if (endTournamentButton) endTournamentButton.disabled = isFin;

    const isAddonAvailable = state.config.type === 'rebuy' && !isFin && ( (currentLevelIndex >= state.config.rebuyLevels) || (currentLevelIndex === state.config.rebuyLevels - 1 && state.live.isOnBreak) );
    if (btnManageAddons) { btnManageAddons.classList.toggle('hidden', state.config.type !== 'rebuy'); btnManageAddons.disabled = !isAddonAvailable; }

    // updateSoundToggleVisuals(); // Kalles fra main? Eller trenger soundsEnabled her
    // renderPlayerList(); // Kalles fra main? Trenger handlers
    displayPrizes(state);
    renderActivityLog(state);
    console.log("updateUI (from tournament-ui.js): Main UI elements updated.");
}
// === Slutt UI Oppdateringsfunksjoner ===
