// === tournament-main.js ===
// Hovedfil for turneringssiden. Initialiserer, setter opp listeners, importerer moduler.

import { getActiveTournamentId, loadTournamentState, saveTournamentState, clearActiveTournamentId, loadSoundPreference, saveSoundPreference, loadThemeBgColor, loadThemeTextColor, loadElementLayouts, loadLogoBlob } from './storage.js';
import { applyThemeAndLayout, updateMainLogoImage, updateSoundToggleVisuals, updateUI, renderPlayerList, displayPrizes, renderActivityLog, formatBlindsHTML, formatTime, formatNextBlindsText, revokeObjectUrl } from './tournament-ui.js';
import { logActivity, calculateAverageStack, calculatePrizes, findNextPauseInfo } from './tournament-logic.js';
import { startMainTimer, stopMainTimer, startRealTimeClock, stopRealTimeClock } from './tournament-timer.js';
import { handleRebuy, handleEliminate, handleRestore, handleLateRegClick } from './tournament-player-actions.js';
// NYTT: Importer table-funksjoner
import { assignTableSeat, reassignAllSeats, checkAndHandleTableBreak, balanceTables } from './tournament-tables.js';
// TODO: Importer modaler, sound, dragdrop når de er laget
// import { openTournamentModal, openUiModal, openAddonModal, openEditPlayerModal, handleEditPlayerClick } from './tournament-modals.js';
// import { startDrag } from './tournament-dragdrop.js';
// import { playSound } from './tournament-sound.js';


// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Tournament MAIN DOM loaded.");

    // === 02: STATE VARIABLES START ===
    const currentTournamentId = getActiveTournamentId();
    let state = null;
    let soundsEnabled = loadSoundPreference();
    let currentLogoBlob = null; // Holder den globale logo-blobben
    let isModalOpen = false;
    let currentOpenModal = null;
    let isDragging = false; let draggedElement = null; let offsetX = 0; let offsetY = 0;
    // UI Modal spesifikk state (kun relevant når modal er åpen)
    let originalThemeBg = '', originalThemeText = '', originalElementLayouts = {}, originalSoundVolume = 0.7;
    let logoBlobInModal = null;
    let previewLogoObjectUrl = null;
    let blockSliderUpdates = false;
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    const currentTimeDisplay = document.getElementById('current-time');
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    const btnEditTournamentSettings = document.getElementById('btn-edit-tournament-settings');
    const btnEditUiSettings = document.getElementById('btn-edit-ui-settings');
    const btnBackToMainLive = document.getElementById('btn-back-to-main-live');
    const prizeDisplayLive = document.getElementById('prize-display-live');
    const totalPotPrizeSpan = document.getElementById('total-pot');
    const startPauseButton = document.getElementById('btn-start-pause');
    const prevLevelButton = document.getElementById('btn-prev-level');
    const nextLevelButton = document.getElementById('btn-next-level');
    const adjustTimeMinusButton = document.getElementById('btn-adjust-time-minus');
    const adjustTimePlusButton = document.getElementById('btn-adjust-time-plus');
    const lateRegButton = document.getElementById('btn-late-reg');
    const playerListUl = document.getElementById('player-list');
    const eliminatedPlayerListUl = document.getElementById('eliminated-player-list');
    const activePlayerCountSpan = document.getElementById('active-player-count');
    const eliminatedPlayerCountSpan = document.getElementById('eliminated-player-count');
    const tableBalanceInfo = document.getElementById('table-balance-info');
    const btnForceSave = document.getElementById('btn-force-save');
    const endTournamentButton = document.getElementById('btn-end-tournament');
    const activityLogUl = document.getElementById('activity-log-list');
    const headerRightControls = document.querySelector('.header-right-controls');
    const liveCanvas = document.getElementById('live-canvas');
    const titleElement = document.getElementById('title-element');
    const timerElement = document.getElementById('timer-element');
    const blindsElement = document.getElementById('blinds-element');
    const logoElement = document.getElementById('logo-element');
    const infoElement = document.getElementById('info-element');
    const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement];
    const nameDisplay = document.getElementById('tournament-name-display');
    const timerDisplay = document.getElementById('timer-display');
    const breakInfo = document.getElementById('break-info');
    const currentLevelDisplay = document.getElementById('current-level');
    const blindsDisplay = document.getElementById('blinds-display');
    const logoImg = logoElement?.querySelector('.logo');
    const nextBlindsDisplay = document.getElementById('next-blinds');
    const infoNextPauseParagraph = document.getElementById('info-next-pause');
    const averageStackDisplay = document.getElementById('average-stack');
    const playersRemainingDisplay = document.getElementById('players-remaining');
    const totalEntriesDisplay = document.getElementById('total-entries');
    const lateRegStatusDisplay = document.getElementById('late-reg-status');
    const tournamentSettingsModal = document.getElementById('tournament-settings-modal');
    const uiSettingsModal = document.getElementById('ui-settings-modal');
    const addonModal = document.getElementById('addon-modal');
    const editPlayerModal = document.getElementById('edit-player-modal');
    const btnManageAddons = document.getElementById('btn-manage-addons');
    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig turneringsdata (ID: ${currentTournamentId}).`); console.error("Invalid tournament state loaded:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    state.live = state.live || {}; state.live.status = state.live.status || 'paused'; state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0; state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60 || 1200); state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.players = state.live.players || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.knockoutLog = state.live.knockoutLog || []; state.live.activityLog = state.live.activityLog || []; state.live.totalPot = state.live.totalPot ?? 0; state.live.totalEntries = state.live.totalEntries ?? 0; state.live.totalRebuys = state.live.totalRebuys ?? 0; state.live.totalAddons = state.live.totalAddons ?? 0;
    state.live.nextPlayerId = state.live.nextPlayerId || (Math.max(0, ...state.live.players.map(p => p.id), ...state.live.eliminatedPlayers.map(p => p.id)) + 1);
    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, state);
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 04b: INITIAL THEME, LAYOUT, LOGO APPLICATION ===
    async function applyInitialThemeLayoutAndLogo() { console.log("applyInitialThemeLayoutAndLogo: Starting..."); const bgColor = loadThemeBgColor(); const textColor = loadThemeTextColor(); const elementLayouts = loadElementLayouts(); let logoDataBlob = null; try { logoDataBlob = await loadLogoBlob(); } catch (err) { console.error("Error loading logo blob:", err); } console.log("applyInitialThemeLayoutAndLogo: Data fetched. Logo Blob:", logoDataBlob); applyThemeAndLayout(bgColor, textColor, elementLayouts, draggableElements); currentLogoBlob = logoDataBlob; updateMainLogoImage(currentLogoBlob); console.log("applyInitialThemeLayoutAndLogo: Done."); }
    try { await applyInitialThemeLayoutAndLogo(); } catch (err) { console.error("CRITICAL Error during initial setup:", err); /* Fallback? */ }
    // === 04b: INITIAL THEME, LAYOUT, LOGO APPLICATION END ===


    // === Midlertidige Handlers / Funksjoner som ennå ikke er flyttet ===
    // TODO: Flytt disse til respektive moduler
    function handleAdjustLevel(delta) {
         console.log("TEMP handleAdjustLevel", delta);
         if (state.live.status === 'finished') return;
         const newIdx = state.live.currentLevelIndex + delta;
         if (newIdx >= 0 && newIdx < state.config.blindLevels.length) {
             const oldLvlNum = state.config.blindLevels[state.live.currentLevelIndex]?.level || '?';
             const newLvl = state.config.blindLevels[newIdx];
             if (!confirm(`Endre til Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)})?\nKlokken nullstilles.`)) return;
             state.live.currentLevelIndex = newIdx;
             state.live.timeRemainingInLevel = newLvl.duration * 60;
             state.live.isOnBreak = false;
             state.live.timeRemainingInBreak = 0;
             logActivity(state.live.activityLog, `Nivå manuelt endret: ${oldLvlNum} -> ${newLvl.level}.`);
             // playSound('NEW_LEVEL'); // TODO: Kall via callback
             updateUI(state);
             saveTournamentState(currentTournamentId, state);
         } else {
             alert("Kan ikke gå til nivået.");
         }
     }
    function handleAdjustTime(deltaSeconds) {
         console.log("TEMP handleAdjustTime", deltaSeconds);
         if (state.live.status === 'finished') return;
         let key = state.live.isOnBreak ? 'timeRemainingInBreak' : 'timeRemainingInLevel';
         let maxT = Infinity;
         if (!state.live.isOnBreak) { const lvl = state.config.blindLevels[state.live.currentLevelIndex]; if (lvl) maxT = lvl.duration * 60; }
         state.live[key] = Math.max(0, Math.min(state.live[key] + deltaSeconds, maxT));
         logActivity(state.live.activityLog, `Tid justert ${deltaSeconds > 0 ? '+' : ''}${deltaSeconds / 60} min.`);
         updateUI(state);
         saveTournamentState(currentTournamentId, state);
    }
    async function finishTournament(_state = state, _tournamentId = currentTournamentId) { if (_state.live.status === 'finished') return; console.log("Finishing T..."); logActivity(_state.live.activityLog,"Turnering fullføres."); /* playSound('TOURNAMENT_END'); */ stopMainTimer(); stopRealTimeClock(); _state.live.status='finished'; _state.live.isOnBreak=false; _state.live.timeRemainingInLevel=0; _state.live.timeRemainingInBreak=0; if(_state.live.players.length===1){const w=_state.live.players[0];w.place=1;_state.live.eliminatedPlayers.push(w);_state.live.players.splice(0,1);logActivity(_state.live.activityLog,`Vinner: ${w.name}!`);} else if(_state.live.players.length>1){logActivity(_state.live.activityLog,`Fullført med ${_state.live.players.length} spillere igjen.`); _state.live.players.forEach(p=>{p.eliminated=true;p.place=null;_state.live.eliminatedPlayers.push(p);}); _state.live.players=[];} else{logActivity(_state.live.activityLog,`Fullført uten aktive spillere.`);} _state.live.eliminatedPlayers.sort((a,b)=>(a.place??Infinity)-(b.place??Infinity)); updateUI(_state); saveTournamentState(_tournamentId,_state); alert("Turneringen er fullført!"); }
    function handleEndTournament() { console.log("handleEndTournament called."); finishTournament(state, currentTournamentId); }
    function handleForceSave() { console.log("handleForceSave"); saveTournamentState(currentTournamentId, state); }
    function handleBackToMain() { console.log("handleBackToMain"); if (state && state.live.status !== 'finished') {saveTournamentState(currentTournamentId, state);} window.location.href = 'index.html';}
    function openTournamentModal() { console.log("TEMP openTournamentModal"); /* ... logikk ... */ }
    function openUiModal() { console.log("TEMP openUiModal"); /* ... logikk ... */ }
    function openAddonModal() { console.log("TEMP openAddonModal"); /* ... logikk ... */ }
    function handleEditPlayerClick(event) { const pId = Number(event?.target?.dataset?.playerId); console.log("TEMP handleEditPlayerClick", pId); /* ... logikk for å åpne edit modal ... */ }
    function startDrag(event, element) { console.log("TEMP startDrag"); /* Drag logic - skal flyttes */ }
    // === Slutt Midlertidige Handlers ===


    // === CALLBACKS ===
    const mainCallbacks = {
        updateUI: () => updateUI(state),
        saveState: () => saveTournamentState(currentTournamentId, state),
        playSound: null, // TODO: playSound,
        finishTournament: () => finishTournament(state, currentTournamentId),
        logActivity: (msg) => logActivity(state.live.activityLog, msg),
        checkAndHandleTableBreak: () => checkAndHandleTableBreak(state, currentTournamentId, mainCallbacks),
        assignTableSeat: (player, excludeTableNum) => assignTableSeat(player, state, excludeTableNum)
    };
    // === END CALLBACKS ===


    // === EVENT LISTENER ATTACHMENT (General) ===
    startPauseButton?.addEventListener('click', () => { console.log("Start/Pause Button Clicked. Current Status:", state.live.status); if (state.live.status === 'paused') { state.live.status = 'running'; startMainTimer(state, currentTournamentId, mainCallbacks); logActivity(state.live.activityLog, "Klokke startet."); updateUI(state); } else if (state.live.status === 'running') { state.live.status = 'paused'; stopMainTimer(); logActivity(state.live.activityLog, "Klokke pauset."); saveTournamentState(currentTournamentId, state); updateUI(state); } });
    prevLevelButton?.addEventListener('click', () => handleAdjustLevel(-1)); // Bruker TEMP
    nextLevelButton?.addEventListener('click', () => handleAdjustLevel(1)); // Bruker TEMP
    adjustTimeMinusButton?.addEventListener('click', () => handleAdjustTime(-60)); // Bruker TEMP
    adjustTimePlusButton?.addEventListener('click', () => handleAdjustTime(60)); // Bruker TEMP
    lateRegButton?.addEventListener('click', () => handleLateRegClick(state, currentTournamentId)); // Bruker importert
    endTournamentButton?.addEventListener('click', handleEndTournament); // Bruker lokal
    btnForceSave?.addEventListener('click', handleForceSave); // Bruker lokal
    btnBackToMainLive?.addEventListener('click', handleBackToMain); // Bruker lokal
    btnToggleSound?.addEventListener('click', () => { console.log("btnToggleSound clicked."); soundsEnabled = !soundsEnabled; saveSoundPreference(soundsEnabled); updateSoundToggleVisuals(soundsEnabled); logActivity(state.live.activityLog, `Lyd ${soundsEnabled ? 'PÅ' : 'AV'}.`); });
    btnEditTournamentSettings?.addEventListener('click', openTournamentModal); // Bruker TEMP
    btnEditUiSettings?.addEventListener('click', openUiModal); // Bruker TEMP
    btnManageAddons?.addEventListener('click', openAddonModal); // Bruker TEMP

    draggableElements.forEach(el => { if (el) { el.addEventListener('mousedown', (e) => startDrag(e, el)); } }); // Bruker TEMP startDrag
    window.addEventListener('click', (e) => { if (isModalOpen && currentOpenModal && e.target === currentOpenModal) { console.log("Clicked outside modal content."); /* TODO: Kall riktige close-funksjoner */ } });

    function setupPlayerActionDelegation() {
        const handleActions = (event) => {
            const button = event.target.closest('button'); if (!button) return;
            const action = Array.from(button.classList).find(cls => cls.startsWith('btn-')); if (!action) return;
            const playerId = Number(button.dataset.playerId); if (!playerId || isNaN(playerId)) { console.warn("Could not get valid player ID", button); return; }
            console.log(`Delegated action: ${action} for player ID: ${playerId}`);
            // Send med callbacks til action handlers
            switch (action) {
                case 'btn-edit-player': handleEditPlayerClick(event); break; // Bruker TEMP
                case 'btn-rebuy': handleRebuy(event, state, currentTournamentId, mainCallbacks); break; // Bruker importert
                case 'btn-eliminate': handleEliminate(event, state, currentTournamentId, mainCallbacks); break; // Bruker importert
                case 'btn-restore': handleRestore(event, state, currentTournamentId, mainCallbacks); break; // Bruker importert
            }
        };
        playerListUl?.addEventListener('click', handleActions);
        eliminatedPlayerListUl?.addEventListener('click', handleActions);
        console.log("Player action delegation listeners added.");
    }
    setupPlayerActionDelegation();
    // === EVENT LISTENER ATTACHMENT END ===


    // === INITIAL UI RENDER & TIMER START ===
    console.log("Performing final setup steps...");
    try {
        updateUI(state); // Første UI render
        startRealTimeClock(currentTimeDisplay);
        if (state.live.status === 'running') { console.log("State is 'running', starting main timer."); startMainTimer(state, currentTournamentId, mainCallbacks); }
        else { console.log(`State is '${state.live.status}'. Main timer not started.`); stopMainTimer(); }
        console.log("Tournament page fully initialized and ready.");
    } catch (err) { console.error("Error during final setup or UI update:", err); alert("En feil oppstod under lasting av siden. Sjekk konsollen."); }
    // === INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
