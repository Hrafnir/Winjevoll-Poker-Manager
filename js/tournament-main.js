// === tournament-main.js ===
// Hovedfil for turneringssiden. Initialiserer, setter opp listeners, importerer moduler.

import { getActiveTournamentId, loadTournamentState, saveTournamentState, clearActiveTournamentId, loadSoundPreference, saveSoundPreference, loadThemeBgColor, loadThemeTextColor, loadElementLayouts, loadLogoBlob } from './storage.js';
import { applyThemeAndLayout, updateMainLogoImage, updateSoundToggleVisuals, updateUI, renderPlayerList, displayPrizes, renderActivityLog } from './tournament-ui.js';
import { logActivity } from './tournament-logic.js';
// NYTT: Importer spillerhandlinger
import { handleRebuy, handleEliminate, handleRestore, handleLateRegClick } from './tournament-player-actions.js';
// Importer andre moduler etter hvert som de lages...
// import { startTimer, stopTimer, tick } from './tournament-timer.js';
// import { openTournamentModal, openUiModal, openAddonModal, openEditPlayerModal, handleEditPlayerClick } from './tournament-modals.js'; // handleEditPlayerClick flyttes hit
// import { startDrag } from './tournament-dragdrop.js'; // Hvis vi lager denne

// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Tournament MAIN DOM loaded.");

    // === 02: STATE VARIABLES START ===
    const currentTournamentId = getActiveTournamentId();
    let state = null;
    let timerInterval = null;
    let realTimeInterval = null;
    let soundsEnabled = loadSoundPreference();
    let currentLogoBlob = null;
    let isModalOpen = false;
    let currentOpenModal = null;
    let isDragging = false; let draggedElement = null; let offsetX = 0; let offsetY = 0;
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // ... (hent referanser som før) ...
    const currentTimeDisplay = document.getElementById('current-time'); const btnToggleSound = document.getElementById('btn-toggle-sound'); const btnEditTournamentSettings = document.getElementById('btn-edit-tournament-settings'); const btnEditUiSettings = document.getElementById('btn-edit-ui-settings'); const btnBackToMainLive = document.getElementById('btn-back-to-main-live'); const prizeDisplayLive = document.getElementById('prize-display-live'); const totalPotPrizeSpan = document.getElementById('total-pot'); const startPauseButton = document.getElementById('btn-start-pause'); const prevLevelButton = document.getElementById('btn-prev-level'); const nextLevelButton = document.getElementById('btn-next-level'); const adjustTimeMinusButton = document.getElementById('btn-adjust-time-minus'); const adjustTimePlusButton = document.getElementById('btn-adjust-time-plus'); const lateRegButton = document.getElementById('btn-late-reg'); const playerListUl = document.getElementById('player-list'); const eliminatedPlayerListUl = document.getElementById('eliminated-player-list'); const activePlayerCountSpan = document.getElementById('active-player-count'); const eliminatedPlayerCountSpan = document.getElementById('eliminated-player-count'); const tableBalanceInfo = document.getElementById('table-balance-info'); const btnForceSave = document.getElementById('btn-force-save'); const endTournamentButton = document.getElementById('btn-end-tournament'); const activityLogUl = document.getElementById('activity-log-list'); const headerRightControls = document.querySelector('.header-right-controls'); const liveCanvas = document.getElementById('live-canvas'); const titleElement = document.getElementById('title-element'); const timerElement = document.getElementById('timer-element'); const blindsElement = document.getElementById('blinds-element'); const logoElement = document.getElementById('logo-element'); const infoElement = document.getElementById('info-element'); const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement]; const nameDisplay = document.getElementById('tournament-name-display'); const timerDisplay = document.getElementById('timer-display'); const breakInfo = document.getElementById('break-info'); const currentLevelDisplay = document.getElementById('current-level'); const blindsDisplay = document.getElementById('blinds-display'); const logoImg = logoElement?.querySelector('.logo'); const nextBlindsDisplay = document.getElementById('next-blinds'); const infoNextPauseParagraph = document.getElementById('info-next-pause'); const averageStackDisplay = document.getElementById('average-stack'); const playersRemainingDisplay = document.getElementById('players-remaining'); const totalEntriesDisplay = document.getElementById('total-entries'); const lateRegStatusDisplay = document.getElementById('late-reg-status');
    const tournamentSettingsModal = document.getElementById('tournament-settings-modal'); const uiSettingsModal = document.getElementById('ui-settings-modal'); const addonModal = document.getElementById('addon-modal'); const editPlayerModal = document.getElementById('edit-player-modal');
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
    function handleStartPause() { console.log("handleStartPause called. Status:", state.live.status); if (!state || !state.live) return; if (state.live.status === 'finished') return; if (state.live.status === 'paused') { state.live.status = 'running'; if (!timerInterval) { timerInterval = setInterval(tick, 1000); } logActivity(state.live.activityLog, "Klokke startet."); } else if (state.live.status === 'running') { state.live.status = 'paused'; if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } logActivity(state.live.activityLog, "Klokke pauset."); saveTournamentState(currentTournamentId, state); } updateUI(state); }
    function handleAdjustLevel(delta) { console.log("handleAdjustLevel", delta); /* ... logikk ... */ updateUI(state); }
    function handleAdjustTime(delta) { console.log("handleAdjustTime", delta); /* ... logikk ... */ updateUI(state); }
    function handleEndTournament() { console.log("handleEndTournament"); /* ... logikk ... */ updateUI(state); }
    function handleForceSave() { console.log("handleForceSave"); saveTournamentState(currentTournamentId, state); }
    function handleBackToMain() { console.log("handleBackToMain"); saveTournamentState(currentTournamentId, state); window.location.href = 'index.html';}
    function openTournamentModal() { console.log("TEMP openTournamentModal"); /* ... logikk ... */ }
    function openUiModal() { console.log("TEMP openUiModal"); /* ... logikk ... */ }
    function openAddonModal() { console.log("TEMP openAddonModal"); /* ... logikk ... */ }
    function handleEditPlayerClick(event) { const pId = Number(event?.target?.dataset?.playerId); console.log("TEMP handleEditPlayerClick", pId); /* ... logikk for å åpne edit modal ... */ }
    function tick() { /* Timer logikk - skal flyttes */ if(state.live.status === 'running'){ /*...*/ } }
    function startRealTimeClock() { /* ... */ }
    function startDrag(event, element) { /* Drag logic - skal flyttes */ }
    async function finishTournament() { /* Finish logic - skal flyttes */ } // Gjort async pga logActivity
    // === Slutt Midlertidige Handlers ===


    // === EVENT LISTENER ATTACHMENT (General) ===
    startPauseButton?.addEventListener('click', handleStartPause);
    prevLevelButton?.addEventListener('click', () => handleAdjustLevel(-1));
    nextLevelButton?.addEventListener('click', () => handleAdjustLevel(1));
    adjustTimeMinusButton?.addEventListener('click', () => handleAdjustTime(-60));
    adjustTimePlusButton?.addEventListener('click', () => handleAdjustTime(60));
    // ENDRET: Sender state og id til importert funksjon
    lateRegButton?.addEventListener('click', () => handleLateRegClick(state, currentTournamentId));
    endTournamentButton?.addEventListener('click', handleEndTournament);
    btnForceSave?.addEventListener('click', handleForceSave);
    btnBackToMainLive?.addEventListener('click', handleBackToMain);
    btnToggleSound?.addEventListener('click', () => { console.log("btnToggleSound clicked."); soundsEnabled = !soundsEnabled; saveSoundPreference(soundsEnabled); updateSoundToggleVisuals(soundsEnabled); logActivity(state.live.activityLog, `Lyd ${soundsEnabled ? 'PÅ' : 'AV'}.`); });
    btnEditTournamentSettings?.addEventListener('click', openTournamentModal); // TODO: Implementer i modals.js
    btnEditUiSettings?.addEventListener('click', openUiModal); // TODO: Implementer i modals.js
    btnManageAddons?.addEventListener('click', openAddonModal); // TODO: Implementer i modals.js

    // Drag & Drop
    draggableElements.forEach(el => { if (el) { el.addEventListener('mousedown', (e) => startDrag(e, el)); } });

    // Klikk utenfor modal (trenger referanse til close-funksjoner fra modals.js)
    window.addEventListener('click', (e) => {
        if (isModalOpen && currentOpenModal && e.target === currentOpenModal) {
            console.log("Clicked outside modal content.");
            // TODO: Kall riktige close-funksjoner fra modals.js når de er laget
            // if (currentOpenModal === uiSettingsModal) { closeUiModal(true); }
            // else if (currentOpenModal === tournamentSettingsModal) { closeTournamentModal(); }
            // else if (currentOpenModal === addonModal) { closeAddonModal(); }
            // else if (currentOpenModal === editPlayerModal) { closeEditPlayerModal(); }
        }
    });

    // Listeners for knapper inne i spillerlistene (må legges til dynamisk)
    // delegering fra listene selv er et alternativ, men vi gjør det enkelt foreløpig
    function setupPlayerActionDelegation() {
        const handleActions = (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const action = Array.from(button.classList).find(cls => cls.startsWith('btn-'));
            if (!action) return;

            const playerId = Number(button.dataset.playerId);
            if (!playerId || isNaN(playerId)) {
                 console.warn("Could not get valid player ID from button", button);
                 return;
            }

            console.log(`Delegated action: ${action} for player ID: ${playerId}`);

            switch (action) {
                case 'btn-edit-player':
                    handleEditPlayerClick(event); // Bruker fortsatt event for dataset
                    break;
                case 'btn-rebuy':
                    handleRebuy(event, state, currentTournamentId); // Send state og id
                    break;
                case 'btn-eliminate':
                    handleEliminate(event, state, currentTournamentId); // Send state og id
                    break;
                case 'btn-restore':
                    handleRestore(event, state, currentTournamentId); // Send state og id
                    break;
                // Individuell add-on knapp er deaktivert, håndteres via modal
            }
        };

        playerListUl?.addEventListener('click', handleActions);
        eliminatedPlayerListUl?.addEventListener('click', handleActions);
        console.log("Player action delegation listeners added.");
    }
    setupPlayerActionDelegation(); // Sett opp delegering
    // === EVENT LISTENER ATTACHMENT END ===


    // === INITIAL UI RENDER & TIMER START ===
    console.log("Performing final setup steps...");
    try {
        // Kall updateUI for å rendre alt basert på state FØR timere starter
        updateUI(state); // Send inn state
        startRealTimeClock();
        if (state.live.status === 'running') { console.log("State is 'running', starting timer."); if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(tick, 1000); }
        else if (state.live.status === 'finished') { console.log("State is 'finished'."); }
        else { console.log(`State is '${state.live.status}'. Timer not started.`); if (timerInterval) clearInterval(timerInterval); timerInterval = null; }
        console.log("Tournament page fully initialized and ready.");
    } catch (err) { console.error("Error during final setup or UI update:", err); alert("En feil oppstod under lasting av siden. Sjekk konsollen."); }
    // === INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
