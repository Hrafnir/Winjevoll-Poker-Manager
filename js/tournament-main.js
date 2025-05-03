// === tournament-main.js ===
// Hovedfil for turneringssiden. Initialiserer, setter opp listeners, importerer moduler.

// --- STORAGE & CORE ---
import {
    getActiveTournamentId,
    loadTournamentState,
    saveTournamentState,
    clearActiveTournamentId,
    loadSoundPreference,
    saveSoundPreference,
    loadThemeBgColor,
    loadThemeTextColor,
    loadElementLayouts,
    loadLogoBlob,
    DEFAULT_THEME_TEXT, // Importer default tekstfarge
    saveObject, // Trengs for å lagre endringer fra edit player
    TOURNAMENT_COLLECTION_KEY // Trengs for å lagre endringer fra edit player
} from './storage.js';

// --- UI & FORMATTING ---
import {
    applyThemeAndLayout,
    updateMainLogoImage,
    updateSoundToggleVisuals,
    updateUI, // Hoved UI-oppdaterer
    // renderPlayerList, // updateUI kaller denne internt
    // displayPrizes, // updateUI kaller denne internt
    // renderActivityLog, // updateUI kaller denne internt
    formatBlindsHTML,
    formatTime,
    formatNextBlindsText,
    revokeObjectUrl
} from './tournament-ui.js';

// --- LOGIC ---
import {
    logActivity,
    calculateAverageStack,
    calculatePrizes,
    findNextPauseInfo,
    getPlayerNameById // Trengs for edit player modal display
} from './tournament-logic.js';

// --- TIMER ---
import {
    startMainTimer,
    stopMainTimer,
    startRealTimeClock,
    stopRealTimeClock
} from './tournament-timer.js';

// --- PLAYER ACTIONS ---
import {
    handleRebuy,
    handleEliminate,
    handleRestore,
    handleLateRegClick
} from './tournament-player-actions.js';

// --- TABLES ---
import {
    assignTableSeat,
    reassignAllSeats,
    checkAndHandleTableBreak,
    balanceTables
} from './tournament-tables.js';

// TODO: Importer modaler (når de er laget), sound, dragdrop
// import { openTournamentModal, openUiModal, openAddonModal } from './tournament-modals.js';
// import { startDrag } from './tournament-dragdrop.js';
// import { playSound } from './tournament-sound.js';


// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Tournament MAIN DOM loaded.");

    // === 02: STATE VARIABLES START ===
    const currentTournamentId = getActiveTournamentId();
    let state = null;
    let soundsEnabled = loadSoundPreference();
    let currentLogoBlob = null;
    let isModalOpen = false;
    let currentOpenModal = null;
    let isDragging = false; let draggedElement = null; let offsetX = 0; let offsetY = 0;
    let originalThemeBg = '', originalThemeText = '', originalElementLayouts = {}, originalSoundVolume = 0.7;
    let logoBlobInModal = null;
    let previewLogoObjectUrl = null;
    let blockSliderUpdates = false;
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // Generelt
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
    const btnManageAddons = document.getElementById('btn-manage-addons');

    // Canvas elementer
    const liveCanvas = document.getElementById('live-canvas');
    const titleElement = document.getElementById('title-element');
    const timerElement = document.getElementById('timer-element');
    const blindsElement = document.getElementById('blinds-element');
    const logoElement = document.getElementById('logo-element');
    const infoElement = document.getElementById('info-element');
    const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement];

    // Display elementer (inni canvas elementer)
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

    // Modaler
    const tournamentSettingsModal = document.getElementById('tournament-settings-modal');
    const uiSettingsModal = document.getElementById('ui-settings-modal');
    const addonModal = document.getElementById('addon-modal');
    const editPlayerModal = document.getElementById('edit-player-modal');

    // **NYTT:** Edit Player Modal elementer
    const editPlayerModalContent = editPlayerModal?.querySelector('.modal-content');
    const editPlayerIdInput = document.getElementById('edit-player-id-input');
    const editPlayerNameDisplay = document.getElementById('edit-player-name-display');
    const editPlayerNameInput = document.getElementById('edit-player-name-input');
    const editPlayerRebuysInput = document.getElementById('edit-player-rebuys-input');
    const editPlayerAddonCheckbox = document.getElementById('edit-player-addon-checkbox');
    const btnSavePlayerChanges = document.getElementById('btn-save-player-changes');
    const btnCancelPlayerEdit = document.getElementById('btn-cancel-player-edit');
    const closeEditPlayerModalButton = document.getElementById('close-edit-player-modal-button');

    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    console.log("Tournament Main: Retrieved active tournament ID:", currentTournamentId);
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); console.error("No active tournament ID found. Redirecting."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig data (ID: ${currentTournamentId}). Sjekk konsollen.`); console.error("Invalid or incomplete state loaded:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }

    // Grundigere validering/default-setting for live state
    state.live = state.live || {};
    state.live.status = state.live.status === 'running' || state.live.status === 'paused' || state.live.status === 'finished' ? state.live.status : 'paused'; // Sørg for gyldig status
    state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0;
    // Sikre at index er innenfor grensene
    if (state.live.currentLevelIndex >= state.config.blindLevels.length) {
        console.warn(`Loaded currentLevelIndex (${state.live.currentLevelIndex}) is out of bounds. Resetting to last level.`);
        state.live.currentLevelIndex = state.config.blindLevels.length - 1;
        state.live.status = 'paused'; // Paus hvis vi måtte resette index
    }
    const currentLevelData = state.config.blindLevels[state.live.currentLevelIndex];
    state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (currentLevelData?.duration * 60 || 1200);
    state.live.isOnBreak = state.live.isOnBreak ?? false;
    state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0;
    state.live.players = state.live.players || [];
    state.live.eliminatedPlayers = state.live.eliminatedPlayers || [];
    state.live.knockoutLog = state.live.knockoutLog || [];
    state.live.activityLog = state.live.activityLog || [];
    state.live.totalPot = state.live.totalPot ?? 0;
    state.live.totalEntries = state.live.totalEntries ?? 0;
    state.live.totalRebuys = state.live.totalRebuys ?? 0;
    state.live.totalAddons = state.live.totalAddons ?? 0;
    state.live.nextPlayerId = state.live.nextPlayerId || (Math.max(0, ...state.live.players.map(p => p.id), ...state.live.eliminatedPlayers.map(p => p.id)) + 1);

    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, JSON.parse(JSON.stringify(state))); // Log copy to avoid mutation issues in console view
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 04b: INITIAL THEME, LAYOUT, LOGO APPLICATION ===
    async function applyInitialThemeLayoutAndLogo() {
        console.log("applyInitialThemeLayoutAndLogo: Starting...");
        const bgColor = loadThemeBgColor();
        let textColor = loadThemeTextColor();

        // **NYTT:** Valider tekstfarge før bruk
        if (!textColor || !textColor.startsWith('rgb(') || textColor.split(',').length !== 3) {
             console.warn(`Invalid textColor loaded: "${textColor}". Falling back to default.`);
             textColor = DEFAULT_THEME_TEXT; // Bruk importert default
        }

        const elementLayouts = loadElementLayouts();
        let logoDataBlob = null;
        try {
             logoDataBlob = await loadLogoBlob();
        } catch (err) {
             console.error("Error loading logo blob:", err);
        }
        console.log("applyInitialThemeLayoutAndLogo: Data fetched. Applying theme/layout. Logo Blob:", logoDataBlob);
        // Send inn de validerte/hentede verdiene
        applyThemeAndLayout(bgColor, textColor, elementLayouts, draggableElements);
        currentLogoBlob = logoDataBlob;
        updateMainLogoImage(currentLogoBlob, logoImg); // Send med img-elementet
        console.log("applyInitialThemeLayoutAndLogo: Done.");
    }
    try {
        await applyInitialThemeLayoutAndLogo();
    } catch (err) {
        console.error("CRITICAL Error during initial theme/layout/logo setup:", err);
    }
    // === 04b: INITIAL THEME, LAYOUT, LOGO APPLICATION END ===


    // === MIDLERTIDIGE / TODO FUNKSJONER START ===
    function handleAdjustLevel(delta) {
        console.log("handleAdjustLevel", delta);
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
            // playSound('NEW_LEVEL'); // TODO
            updateUI(state);
            saveTournamentState(currentTournamentId, state);
        } else {
            alert("Kan ikke gå til nivået.");
        }
    }
    function handleAdjustTime(deltaSeconds) {
        console.log("handleAdjustTime", deltaSeconds);
        if (state.live.status === 'finished') return;
        let key = state.live.isOnBreak ? 'timeRemainingInBreak' : 'timeRemainingInLevel';
        let maxT = Infinity;
        if (!state.live.isOnBreak) {
            const lvl = state.config.blindLevels[state.live.currentLevelIndex];
            if (lvl) maxT = lvl.duration * 60;
        }
        state.live[key] = Math.max(0, Math.min(state.live[key] + deltaSeconds, maxT));
        logActivity(state.live.activityLog, `Tid justert ${deltaSeconds > 0 ? '+' : ''}${deltaSeconds / 60} min.`);
        updateUI(state);
        // Ingen save her? Burde kanskje være det for persistens ved refresh.
        // saveTournamentState(currentTournamentId, state); // Vurder å legge til
    }
    async function finishTournament() {
        if (!state || state.live.status === 'finished') return; // Bruker global state
        console.log("Finishing Tournament...");
        logActivity(state.live.activityLog, "Turnering fullføres.");
        // playSound('TOURNAMENT_END'); // TODO
        stopMainTimer();
        stopRealTimeClock();
        state.live.status = 'finished';
        state.live.isOnBreak = false;
        state.live.timeRemainingInLevel = 0;
        state.live.timeRemainingInBreak = 0;

        if (state.live.players.length === 1) {
             const winner = state.live.players[0];
             winner.place = 1;
             state.live.eliminatedPlayers.push(winner);
             state.live.players.splice(0, 1);
             logActivity(state.live.activityLog, `Vinner: ${winner.name}!`);
        } else if (state.live.players.length > 1) {
             logActivity(state.live.activityLog, `Fullført med ${state.live.players.length} spillere igjen (ingen klar vinner definert).`);
             state.live.players.forEach(p => {
                 p.eliminated = true;
                 p.place = null; // Eller en delt plassering?
                 state.live.eliminatedPlayers.push(p);
             });
             state.live.players = [];
        } else {
             logActivity(state.live.activityLog, `Fullført uten aktive spillere igjen.`);
        }

        state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));
        updateUI(state);
        saveTournamentState(currentTournamentId, state); // Bruker global currentTournamentId
        alert("Turneringen er fullført!");
    }
    function handleEndTournament() { console.log("handleEndTournament called."); finishTournament(); }
    function handleForceSave() { if(state) { console.log("handleForceSave"); saveTournamentState(currentTournamentId, state); alert('Turnering lagret!');} else {console.warn("handleForceSave: State not available.")} }
    function handleBackToMain() { console.log("handleBackToMain"); if (state && state.live.status !== 'finished') { saveTournamentState(currentTournamentId, state); } window.location.href = 'index.html'; }
    function openTournamentModal() { console.log("TEMP openTournamentModal"); /* ... logikk ... */ alert("Funksjon for redigering av turneringsregler er ikke implementert ennå."); }
    function openUiModal() { console.log("TEMP openUiModal"); /* ... logikk ... */ alert("Funksjon for redigering av utseende er ikke implementert ennå."); }
    function openAddonModal() { console.log("TEMP openAddonModal"); /* ... logikk ... */ alert("Funksjon for add-ons er ikke implementert ennå."); }
    function startDrag(event, element) { console.log("TEMP startDrag"); /* ... logikk ... */ /* alert("Dra-og-slipp er ikke implementert ennå."); */ }
    // === MIDLERTIDIGE / TODO FUNKSJONER SLUTT ===


    // === CALLBACKS ===
    // Definer callbacks som trengs av andre moduler
    const mainCallbacks = {
        updateUI: () => { if (state) updateUI(state); }, // Legg til sjekk for state
        saveState: () => { if (state) saveTournamentState(currentTournamentId, state); }, // Legg til sjekk for state
        playSound: null, // TODO: playSound,
        finishTournament: finishTournament, // Send inn referanse til lokal finishTournament
        logActivity: (msg) => { if (state) logActivity(state.live.activityLog, msg); }, // Legg til sjekk for state
        // Funksjoner som trenger state og id sendes via lambda for å sikre riktig kontekst
        checkAndHandleTableBreak: () => { if (state) return checkAndHandleTableBreak(state, currentTournamentId, mainCallbacks); else return false; },
        assignTableSeat: (player, excludeTableNum) => { if (state) assignTableSeat(player, state, excludeTableNum); }
    };
    // === END CALLBACKS ===


    // === EDIT PLAYER MODAL LOGIC START ===
    function openEditPlayerModal(playerId) {
        if (!state) return;
        console.log("Attempting to open edit modal for player ID:", playerId);
        const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId);

        if (!player) {
             console.error("Player not found for editing:", playerId);
             alert("Fant ikke spilleren som skal redigeres.");
             return;
        }

        if (!editPlayerModal || !editPlayerIdInput || !editPlayerNameDisplay || !editPlayerNameInput || !editPlayerRebuysInput || !editPlayerAddonCheckbox) {
             console.error("Edit Player Modal DOM elements not found!");
             alert("En feil oppstod ved åpning av redigeringsvinduet.");
             return;
        }

        // Populate modal fields
        editPlayerIdInput.value = player.id;
        editPlayerNameDisplay.textContent = player.name; // Vis originalt navn
        editPlayerNameInput.value = player.name;
        editPlayerRebuysInput.value = player.rebuys || 0;
        editPlayerAddonCheckbox.checked = player.addon || false;

        // Disable Addon checkbox if tournament type is not rebuy
        if (state.config.type !== 'rebuy') {
             editPlayerAddonCheckbox.disabled = true;
             editPlayerAddonCheckbox.parentElement.title = "Add-on er kun tilgjengelig for Rebuy-turneringer.";
        } else {
             editPlayerAddonCheckbox.disabled = false;
             editPlayerAddonCheckbox.parentElement.title = "";
        }
        // Disable Rebuy input if tournament type is not rebuy (eller hvis spiller er eliminert?)
         editPlayerRebuysInput.disabled = (state.config.type !== 'rebuy');

        // Show modal
        editPlayerModal.classList.remove('hidden');
        currentOpenModal = editPlayerModal;
        isModalOpen = true;
        console.log("Edit Player Modal opened for:", player.name);
    }

    function closeEditPlayerModal() {
        if (editPlayerModal) editPlayerModal.classList.add('hidden');
        currentOpenModal = null;
        isModalOpen = false;
        // Clear fields? Maybe not necessary if populated on open
        // editPlayerIdInput.value = '';
        // editPlayerNameInput.value = '';
        // ... etc ...
        console.log("Edit Player Modal closed.");
    }

    function handleSavePlayerChanges() {
        if (!state) return;
        const playerId = Number(editPlayerIdInput.value);
        const newName = editPlayerNameInput.value.trim();
        const newRebuys = parseInt(editPlayerRebuysInput.value) || 0;
        const newAddon = editPlayerAddonCheckbox.checked;

        if (!playerId || !newName) {
             alert("Spiller-ID eller navn mangler.");
             return;
        }
        if (newRebuys < 0) {
             alert("Antall rebuys kan ikke være negativt.");
             return;
        }

        console.log(`Saving changes for player ID: ${playerId}. New data: Name=${newName}, Rebuys=${newRebuys}, Addon=${newAddon}`);

        // Find the player in the correct list (active or eliminated)
        let player = state.live.players.find(p => p.id === playerId);
        let playerListSource = 'players';
        if (!player) {
            player = state.live.eliminatedPlayers.find(p => p.id === playerId);
            playerListSource = 'eliminatedPlayers';
        }

        if (!player) {
            console.error("Player to save not found:", playerId);
            alert("En feil oppstod: Fant ikke spilleren som skulle lagres.");
            return;
        }

        // --- Calculate changes for pot/counters ---
        let potAdjustment = 0;
        let entryAdjustment = 0; // For rebuys/addons
        let rebuyCountAdjustment = 0;
        let addonCountAdjustment = 0;

        // Rebuy changes
        const oldRebuys = player.rebuys || 0;
        if (newRebuys !== oldRebuys && state.config.type === 'rebuy') {
             rebuyCountAdjustment = newRebuys - oldRebuys;
             potAdjustment += rebuyCountAdjustment * (state.config.rebuyCost || 0);
             entryAdjustment += rebuyCountAdjustment; // Rebuys count as entries for prize calculation
             console.log(`Rebuy change detected: ${oldRebuys} -> ${newRebuys}. Adjustment: Pot=${potAdjustment}, Entries=${entryAdjustment}, Count=${rebuyCountAdjustment}`);
        }

        // Addon changes
        const oldAddon = player.addon || false;
        if (newAddon !== oldAddon && state.config.type === 'rebuy') {
             if (newAddon) { // Addon added
                 addonCountAdjustment = 1;
                 potAdjustment += state.config.addonCost || 0;
                 entryAdjustment += 1; // Addons count as entries
             } else { // Addon removed
                 addonCountAdjustment = -1;
                 potAdjustment -= state.config.addonCost || 0;
                 entryAdjustment -= 1;
             }
             console.log(`Addon change detected: ${oldAddon} -> ${newAddon}. Adjustment: Pot=${potAdjustment}, Entries=${entryAdjustment}, Count=${addonCountAdjustment}`);
        }

        // --- Apply changes ---
        const oldName = player.name;
        player.name = newName;
        player.rebuys = newRebuys;
        player.addon = newAddon;

        state.live.totalPot += potAdjustment;
        state.live.totalEntries += entryAdjustment;
        state.live.totalRebuys += rebuyCountAdjustment;
        state.live.totalAddons += addonCountAdjustment;

        // --- Log changes ---
        let logMessage = `Spiller ${playerId} (${oldName}) redigert: `;
        const changes = [];
        if (oldName !== newName) changes.push(`Navn endret til "${newName}"`);
        if (oldRebuys !== newRebuys) changes.push(`Rebuys ${oldRebuys} -> ${newRebuys}`);
        if (oldAddon !== newAddon) changes.push(`Addon ${newAddon ? 'lagt til' : 'fjernet'}`);
        if (potAdjustment !== 0 || entryAdjustment !== 0) changes.push(`(Pott justert: ${potAdjustment}, Entries: ${entryAdjustment})`);

        if (changes.length > 0) {
             logMessage += changes.join(', ') + '.';
             logActivity(state.live.activityLog, logMessage);
        } else {
             logActivity(state.live.activityLog, `Ingen endringer lagret for ${newName} (ID: ${playerId}).`);
        }

        // --- Update UI and Save ---
        closeEditPlayerModal();
        updateUI(state);
        saveTournamentState(currentTournamentId, state);
        console.log("Player changes saved and UI updated.");
    }

    // Add listeners for modal buttons
    btnSavePlayerChanges?.addEventListener('click', handleSavePlayerChanges);
    btnCancelPlayerEdit?.addEventListener('click', closeEditPlayerModal);
    closeEditPlayerModalButton?.addEventListener('click', closeEditPlayerModal);
    // === EDIT PLAYER MODAL LOGIC END ===


    // === EVENT LISTENER ATTACHMENT (General) ===
    startPauseButton?.addEventListener('click', () => {
        if (!state) return;
        console.log("Start/Pause Button Clicked. Current Status:", state.live.status);
        if (state.live.status === 'paused') {
             state.live.status = 'running';
             startMainTimer(state, currentTournamentId, mainCallbacks); // Send callbacks
             logActivity(state.live.activityLog, "Klokke startet.");
             updateUI(state);
             // Save state when starting? Optional, timer saves periodically.
             // saveTournamentState(currentTournamentId, state);
        } else if (state.live.status === 'running') {
             state.live.status = 'paused';
             stopMainTimer();
             logActivity(state.live.activityLog, "Klokke pauset.");
             saveTournamentState(currentTournamentId, state); // Save when pausing
             updateUI(state);
        } else {
             console.log("Start/Pause button ignored, status is 'finished'.");
        }
    });
    prevLevelButton?.addEventListener('click', () => handleAdjustLevel(-1));
    nextLevelButton?.addEventListener('click', () => handleAdjustLevel(1));
    adjustTimeMinusButton?.addEventListener('click', () => handleAdjustTime(-60));
    adjustTimePlusButton?.addEventListener('click', () => handleAdjustTime(60));
    lateRegButton?.addEventListener('click', () => { if(state) handleLateRegClick(state, currentTournamentId, mainCallbacks); }); // Send callbacks
    endTournamentButton?.addEventListener('click', handleEndTournament);
    btnForceSave?.addEventListener('click', handleForceSave);
    btnBackToMainLive?.addEventListener('click', handleBackToMain);
    btnToggleSound?.addEventListener('click', () => {
        console.log("btnToggleSound clicked.");
        soundsEnabled = !soundsEnabled;
        saveSoundPreference(soundsEnabled);
        updateSoundToggleVisuals(soundsEnabled);
        if (state) logActivity(state.live.activityLog, `Lyd ${soundsEnabled ? 'PÅ' : 'AV'}.`);
    });
    btnEditTournamentSettings?.addEventListener('click', openTournamentModal); // Bruker TEMP
    btnEditUiSettings?.addEventListener('click', openUiModal); // Bruker TEMP
    btnManageAddons?.addEventListener('click', openAddonModal); // Bruker TEMP

    draggableElements.forEach(el => { if (el) { el.addEventListener('mousedown', (e) => startDrag(e, el)); } }); // Bruker TEMP startDrag
    window.addEventListener('click', (e) => {
        if (isModalOpen && currentOpenModal && e.target === currentOpenModal) {
             console.log("Clicked outside modal content.");
             // Determine which modal is open and call its close function
             if (currentOpenModal === editPlayerModal) {
                 closeEditPlayerModal();
             }
             // else if (currentOpenModal === otherModal) { closeOtherModal(); }
             // ... etc ...
        }
    });

    function setupPlayerActionDelegation() {
        const handleActions = (event) => {
            if (!state) return; // Need state to perform actions
            const button = event.target.closest('button');
            if (!button) return;
            const action = Array.from(button.classList).find(cls => cls.startsWith('btn-'));
            if (!action) return;

            // Handle edit action specifically, others use player ID from dataset
            if (action === 'btn-edit-player') {
                 const playerId = Number(button.dataset.playerId);
                 if (!playerId || isNaN(playerId)) {
                     console.warn("Could not get valid player ID for edit action", button);
                     return;
                 }
                 console.log(`Delegated action: ${action} for player ID: ${playerId}`);
                 openEditPlayerModal(playerId); // Call the modal opening function
            } else {
                 const playerId = Number(button.dataset.playerId);
                 if (!playerId || isNaN(playerId)) {
                     console.warn("Could not get valid player ID for action", action, button);
                     return;
                 }
                 console.log(`Delegated action: ${action} for player ID: ${playerId}`);
                 // Send med mainCallbacks til alle andre actions
                 switch (action) {
                     case 'btn-rebuy': handleRebuy(event, state, currentTournamentId, mainCallbacks); break;
                     case 'btn-eliminate': handleEliminate(event, state, currentTournamentId, mainCallbacks); break;
                     case 'btn-restore': handleRestore(event, state, currentTournamentId, mainCallbacks); break;
                     // Addon button might need its own logic if not handled by a dataset action
                 }
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
        if (!state) {
             throw new Error("State is not initialized, cannot proceed with final setup.");
        }
        updateUI(state); // Første UI render
        startRealTimeClock(currentTimeDisplay);

        // Re-check status *just before* potentially starting timer
        console.log(`Final check: Current state status is '${state.live.status}'`);
        if (state.live.status === 'running') {
             console.log("State is 'running', attempting to start main timer.");
             startMainTimer(state, currentTournamentId, mainCallbacks);
        } else {
             console.log(`State is '${state.live.status}'. Main timer will not be started automatically.`);
             stopMainTimer(); // Ensure it's stopped if not running
        }
        console.log("Tournament page fully initialized and ready.");
    } catch (err) {
        console.error("Error during final setup or UI update:", err);
        alert("En alvorlig feil oppstod under lasting av turneringssiden. Sjekk konsollen for detaljer.\n" + err.message);
        // Optionally redirect back or show a more prominent error message
        // window.location.href = 'index.html';
    }
    // === INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
