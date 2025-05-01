// === tournament-main.js ===
// Hovedfil for turneringssiden. Initialiserer, setter opp listeners, importerer moduler.

import { getActiveTournamentId, loadTournamentState, saveTournamentState, clearActiveTournamentId, loadSoundPreference, saveSoundPreference, loadThemeBgColor, loadThemeTextColor, loadElementLayouts, loadLogoBlob } from './storage.js';
import { applyThemeAndLayout, updateMainLogoImage, updateSoundToggleVisuals, updateUI, renderPlayerList, displayPrizes, renderActivityLog } from './tournament-ui.js';
import { logActivity } from './tournament-logic.js'; // Importer logActivity
// Importer andre moduler etter hvert som de lages...
// import { startTimer, stopTimer, tick } from './tournament-timer.js';
// import { handleRebuy, handleEliminate, handleRestore, handleLateRegClick } from './tournament-player-actions.js';
// import { openTournamentModal, openUiModal, openAddonModal, openEditPlayerModal } from './tournament-modals.js';
// import { startDrag } from './tournament-dragdrop.js'; // Hvis vi lager denne

// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Tournament MAIN DOM loaded.");

    // === 02: STATE VARIABLES START ===
    const currentTournamentId = getActiveTournamentId();
    let state = null; // Hele state holdes her
    let timerInterval = null; // Timer state holdes her (eller i timer-modul)
    let realTimeInterval = null;
    let soundsEnabled = loadSoundPreference(); // Lyd state holdes her
    let currentLogoBlob = null; // Logo blob holdes her
    // Modal state (kun status, ikke innhold-state)
    let isModalOpen = false;
    let currentOpenModal = null;
    // Drag state
    let isDragging = false; let draggedElement = null; let offsetX = 0; let offsetY = 0;
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // Hoved-UI og generelle elementer
    const currentTimeDisplay = document.getElementById('current-time');
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    const btnEditTournamentSettings = document.getElementById('btn-edit-tournament-settings');
    const btnEditUiSettings = document.getElementById('btn-edit-ui-settings');
    const btnBackToMainLive = document.getElementById('btn-back-to-main-live');
    const startPauseButton = document.getElementById('btn-start-pause');
    const prevLevelButton = document.getElementById('btn-prev-level');
    const nextLevelButton = document.getElementById('btn-next-level');
    const adjustTimeMinusButton = document.getElementById('btn-adjust-time-minus');
    const adjustTimePlusButton = document.getElementById('btn-adjust-time-plus');
    const lateRegButton = document.getElementById('btn-late-reg');
    const btnForceSave = document.getElementById('btn-force-save');
    const endTournamentButton = document.getElementById('btn-end-tournament');
    const draggableElements = Array.from(document.querySelectorAll('.draggable-element')); // Samle alle
    // Modal containere
    const tournamentSettingsModal = document.getElementById('tournament-settings-modal');
    const uiSettingsModal = document.getElementById('ui-settings-modal');
    const addonModal = document.getElementById('addon-modal');
    const editPlayerModal = document.getElementById('edit-player-modal');
    // Knapper som åpner modaler
    const btnManageAddons = document.getElementById('btn-manage-addons');
    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig turneringsdata (ID: ${currentTournamentId}).`); console.error("Invalid tournament state loaded:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    // Default live state values (bør kanskje ligge i en egen init-funksjon?)
    state.live = state.live || {}; state.live.status = state.live.status || 'paused'; state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0; state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60 || 1200); state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.players = state.live.players || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.knockoutLog = state.live.knockoutLog || []; state.live.activityLog = state.live.activityLog || []; state.live.totalPot = state.live.totalPot ?? 0; state.live.totalEntries = state.live.totalEntries ?? 0; state.live.totalRebuys = state.live.totalRebuys ?? 0; state.live.totalAddons = state.live.totalAddons ?? 0;
    state.live.nextPlayerId = state.live.nextPlayerId || (Math.max(0, ...state.live.players.map(p => p.id), ...state.live.eliminatedPlayers.map(p => p.id)) + 1);
    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, state);
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 04b: INITIAL THEME, LAYOUT, LOGO APPLICATION ===
    async function applyInitialThemeLayoutAndLogo() {
        console.log("applyInitialThemeLayoutAndLogo: Starting...");
        const bgColor = loadThemeBgColor(); const textColor = loadThemeTextColor(); const elementLayouts = loadElementLayouts();
        let logoDataBlob = null;
        try { logoDataBlob = await loadLogoBlob(); } catch (err) { console.error("Error loading logo blob:", err); }
        console.log("applyInitialThemeLayoutAndLogo: Data fetched. Logo Blob:", logoDataBlob);
        applyThemeAndLayout(bgColor, textColor, elementLayouts, draggableElements); // Send inn elementene
        currentLogoBlob = logoDataBlob; // Sett global state
        updateMainLogoImage(currentLogoBlob); // Oppdater hoved-img
        console.log("applyInitialThemeLayoutAndLogo: Done.");
    }
    try { await applyInitialThemeLayoutAndLogo(); }
    catch (err) { console.error("CRITICAL Error during initial theme/layout/logo:", err); /* Håndter fallback? */ }
    // === 04b: INITIAL THEME, LAYOUT, LOGO APPLICATION END ===


    // === Temporære Handlers (skal flyttes til moduler) ===
    // Disse MÅ defineres før de brukes i listeners nedenfor
    // TODO: Flytt disse til respektive moduler (player-actions, modals, timer, etc.)
    function handleStartPause() { console.log("TEMP handleStartPause"); /* ... logikk ... */ updateUI(state); }
    function handleAdjustLevel(delta) { console.log("TEMP handleAdjustLevel", delta); /* ... logikk ... */ updateUI(state); }
    function handleAdjustTime(delta) { console.log("TEMP handleAdjustTime", delta); /* ... logikk ... */ updateUI(state); }
    function handleLateRegClick() { console.log("TEMP handleLateRegClick"); /* ... logikk ... */ updateUI(state); }
    function handleEndTournament() { console.log("TEMP handleEndTournament"); /* ... logikk ... */ updateUI(state); }
    function handleForceSave() { console.log("TEMP handleForceSave"); saveTournamentState(currentTournamentId, state); }
    function handleBackToMain() { console.log("TEMP handleBackToMain"); saveTournamentState(currentTournamentId, state); window.location.href = 'index.html';}
    function openTournamentModal() { console.log("TEMP openTournamentModal"); /* ... logikk ... */ }
    function openUiModal() { console.log("TEMP openUiModal"); /* ... logikk ... */ }
    function openAddonModal() { console.log("TEMP openAddonModal"); /* ... logikk ... */ }
    function handleEditPlayerClick(event) { const pId = Number(event?.target?.dataset?.playerId); console.log("TEMP handleEditPlayerClick", pId); /* ... logikk for å åpne edit modal ... */ }
    function handleRebuy(event) { const pId = Number(event?.target?.dataset?.playerId); console.log("TEMP handleRebuy", pId); /* ... logikk ... */ updateUI(state); }
    function handleEliminate(event) { const pId = Number(event?.target?.dataset?.playerId); console.log("TEMP handleEliminate", pId); /* ... logikk ... */ updateUI(state); }
    function handleRestore(event) { const pId = Number(event?.target?.dataset?.playerId); console.log("TEMP handleRestore", pId); /* ... logikk ... */ updateUI(state); }
    function tick() { /* Timer logikk - skal flyttes */ if(state.live.status === 'running'){ /*...*/ } }
    function startRealTimeClock() { /* ... */ }
    function startDrag(event, element) { /* Drag logic - skal flyttes */ }

    // === EVENT LISTENER ATTACHMENT (General) ===
    // Kun listeners for elementer som *alltid* er i DOM-en
    startPauseButton?.addEventListener('click', handleStartPause);
    prevLevelButton?.addEventListener('click', () => handleAdjustLevel(-1));
    nextLevelButton?.addEventListener('click', () => handleAdjustLevel(1));
    adjustTimeMinusButton?.addEventListener('click', () => handleAdjustTime(-60));
    adjustTimePlusButton?.addEventListener('click', () => handleAdjustTime(60));
    lateRegButton?.addEventListener('click', handleLateRegClick);
    endTournamentButton?.addEventListener('click', handleEndTournament);
    btnForceSave?.addEventListener('click', handleForceSave);
    btnBackToMainLive?.addEventListener('click', handleBackToMain);
    btnToggleSound?.addEventListener('click', () => { console.log("btnToggleSound clicked."); soundsEnabled = !soundsEnabled; saveSoundPreference(soundsEnabled); updateSoundToggleVisuals(soundsEnabled); logActivity(state.live.activityLog, `Lyd ${soundsEnabled ? 'PÅ' : 'AV'}.`); });
    btnEditTournamentSettings?.addEventListener('click', openTournamentModal); // Må implementeres i modals.js
    btnEditUiSettings?.addEventListener('click', openUiModal); // Må implementeres i modals.js
    btnManageAddons?.addEventListener('click', openAddonModal); // Må implementeres i modals.js

    // Drag & Drop (OK her foreløpig, eller flytt til dragDrop.js)
    draggableElements.forEach(el => { if (el) { el.addEventListener('mousedown', (e) => startDrag(e, el)); } });

    // Klikk utenfor modal (OK her)
    window.addEventListener('click', (e) => {
         // Må hente referanser på nytt her, da de kun finnes når modal er åpen
         const uiModal = document.getElementById('ui-settings-modal');
         const tournamentModal = document.getElementById('tournament-settings-modal');
         const addonModal = document.getElementById('addon-modal');
         const editPlayerModal = document.getElementById('edit-player-modal');

        if (isModalOpen && currentOpenModal && e.target === currentOpenModal) {
             console.log("Clicked outside modal content.");
            // TODO: Kall riktige close-funksjoner fra modals.js
            if (currentOpenModal === uiModal) { console.log("Closing UI Modal"); /* closeUiModal(true); */ }
            else if (currentOpenModal === tournamentModal) { console.log("Closing T Modal"); /* closeTournamentModal(); */ }
            else if (currentOpenModal === addonModal) { console.log("Closing Addon Modal"); /* closeAddonModal(); */ }
            else if (currentOpenModal === editPlayerModal) { console.log("Closing Edit Player Modal"); /* closeEditPlayerModal(); */ }
        }
    });
    // === EVENT LISTENER ATTACHMENT END ===


    // === INITIAL UI RENDER & TIMER START ===
    console.log("Performing final setup steps...");
    try {
        updateUI(state); // Kall UI-oppdatering med state
        startRealTimeClock();
        if (state.live.status === 'running') { console.log("State is 'running', starting timer."); if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(tick, 1000); }
        else if (state.live.status === 'finished') { console.log("State is 'finished'."); }
        else { console.log(`State is '${state.live.status}'. Timer not started.`); if (timerInterval) clearInterval(timerInterval); timerInterval = null; }
        console.log("Tournament page fully initialized and ready.");
    } catch (err) { console.error("Error during final setup or UI update:", err); alert("En feil oppstod under lasting av siden. Sjekk konsollen."); }
    // === INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
