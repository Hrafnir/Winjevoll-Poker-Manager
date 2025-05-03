// === tournament-main.js ===
// Hovedfil for turneringssiden. Initialiserer, setter opp listeners, importerer moduler.

// --- STORAGE & CORE ---
import {
    getActiveTournamentId,
    loadTournamentState,
    saveTournamentState,        // Brukes for å lagre hele state-objektet
    clearActiveTournamentId,
    loadSoundPreference,
    saveSoundPreference,
    loadThemeBgColor,
    loadThemeTextColor,
    loadElementLayouts,
    loadLogoBlob,
    DEFAULT_THEME_TEXT,         // Brukes som fallback for UI
    parseRgbString,             // Trengs for UI modal color controls
    loadSoundVolume,            // Trengs for UI modal sound control (hvis funksjon finnes)
    saveSoundVolume,            // Trengs for UI modal sound control (hvis funksjon finnes)
    loadLogoBlob,               // Trengs for UI modal logo preview
    saveLogoBlob,               // Trengs for UI modal logo save
    clearLogoBlob,              // Trengs for UI modal logo clear
    DEFAULT_ELEMENT_LAYOUTS,    // Trengs for UI modal reset
    DEFAULT_THEME_BG            // Trengs for UI modal reset
    // Ingen grunn til å importere saveObject eller storage keys her,
    // da saveTournamentState håndterer lagringsdetaljene.
} from './storage.js';

// --- UI & FORMATTING ---
import {
    applyThemeAndLayout,
    updateMainLogoImage,
    updateSoundToggleVisuals,
    updateUI, // Hoved UI-oppdaterer
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
// import { openTournamentModal, openAddonModal } from './tournament-modals.js'; // openUiModal lages her nå
// import { startDrag } from './tournament-dragdrop.js';
// import { playSound } from './tournament-sound.js';


// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Tournament MAIN DOM loaded.");

    // === 02: STATE VARIABLES START ===
    const currentTournamentId = getActiveTournamentId();
    let state = null;
    let soundsEnabled = loadSoundPreference();
    let currentLogoBlob = null; // Hovedsidens logo blob
    let isModalOpen = false;
    let currentOpenModal = null;
    let isDragging = false; let draggedElement = null; let offsetX = 0; let offsetY = 0;

    // UI Modal spesifikk state
    // Holder midlertidige endringer mens modalen er åpen
    let modalBgColor = loadThemeBgColor();
    let modalTextColor = loadThemeTextColor();
    let modalLayouts = loadElementLayouts();
    let modalSoundVolume = loadSoundVolume();
    let modalLogoBlob = null; // Blob for preview/nytt bilde i modal
    let modalPreviewLogoUrl = null; // Object URL for modal preview
    let originalSettings = {}; // For å kunne avbryte/resette
    let livePreviewEnabled = true; // Kontroller om endringer i modal skal vises live
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
    const logoImg = logoElement?.querySelector('.logo'); // Hovedsidens logo img
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

    // Edit Player Modal elementer
    const editPlayerModalContent = editPlayerModal?.querySelector('.modal-content');
    const editPlayerIdInput = document.getElementById('edit-player-id-input');
    const editPlayerNameDisplay = document.getElementById('edit-player-name-display');
    const editPlayerNameInput = document.getElementById('edit-player-name-input');
    const editPlayerRebuysInput = document.getElementById('edit-player-rebuys-input');
    const editPlayerAddonCheckbox = document.getElementById('edit-player-addon-checkbox');
    const btnSavePlayerChanges = document.getElementById('btn-save-player-changes');
    const btnCancelPlayerEdit = document.getElementById('btn-cancel-player-edit');
    const closeEditPlayerModalButton = document.getElementById('close-edit-player-modal-button');

    // --- UI Settings Modal Elements (Antatte IDer - MÅ SJEKKES/JUSTERES) ---
    const uiSettingsModalContent = uiSettingsModal?.querySelector('.modal-content');
    const closeUiSettingsModalButton = document.getElementById('close-ui-settings-modal-button');
    const btnSaveUiSettings = document.getElementById('btn-save-ui-settings');
    const btnCancelUiSettings = document.getElementById('btn-cancel-ui-settings');
    const btnResetUiDefaults = document.getElementById('btn-reset-ui-defaults');

    // Theme Controls
    const bgColorDisplay = document.getElementById('bg-color-preview');
    const textColorDisplay = document.getElementById('text-color-preview'); // Span inni denne for farge?
    const bgColorRedSlider = document.getElementById('bg-color-red');
    const bgColorRedValue = document.getElementById('bg-color-red-value');
    const bgColorGreenSlider = document.getElementById('bg-color-green');
    const bgColorGreenValue = document.getElementById('bg-color-green-value');
    const bgColorBlueSlider = document.getElementById('bg-color-blue');
    const bgColorBlueValue = document.getElementById('bg-color-blue-value');
    const textColorRedSlider = document.getElementById('text-color-red');
    const textColorRedValue = document.getElementById('text-color-red-value');
    const textColorGreenSlider = document.getElementById('text-color-green');
    const textColorGreenValue = document.getElementById('text-color-green-value');
    const textColorBlueSlider = document.getElementById('text-color-blue');
    const textColorBlueValue = document.getElementById('text-color-blue-value');
    // TODO: Trenger referanser for HSL, favoritter etc. hvis de finnes

    // Layout Controls (Eksempler - trenger flere for alle elementer/controls)
    const layoutControlContainer = document.getElementById('element-layout-grid'); // Container for alle layout-kontroller
    const canvasHeightSlider = document.getElementById('canvas-height-slider');
    const canvasHeightValue = document.getElementById('canvas-height-value');

    // Dynamisk henting av layout controls (alternativ til å liste alle manuelt)
    const layoutControls = {}; // Objekt for å holde referanser
    draggableElements.forEach(el => {
        if (!el) return;
        const id = el.id.replace('-element', '');
        layoutControls[id] = {
            container: document.getElementById(`${id}-layout-controls`), // Antatt container ID
            visible: document.getElementById(`${id}-visible-toggle`),
            x: document.getElementById(`${id}-x-slider`),
            xValue: document.getElementById(`${id}-x-value`),
            y: document.getElementById(`${id}-y-slider`),
            yValue: document.getElementById(`${id}-y-value`),
            width: document.getElementById(`${id}-width-slider`),
            widthValue: document.getElementById(`${id}-width-value`),
            height: document.getElementById(`${id}-height-slider`), // Kun for logo?
            heightValue: document.getElementById(`${id}-height-value`),
            fontSize: document.getElementById(`${id}-fontsize-slider`), // Ikke for logo
            fontSizeValue: document.getElementById(`${id}-fontsize-value`),
        };
        // Info box spesifikke toggles
        if (id === 'info') {
             layoutControls.info.showNextBlinds = document.getElementById('info-toggle-nextblinds'); // Antatt ID
             layoutControls.info.showAvgStack = document.getElementById('info-toggle-avgstack'); // Antatt ID
             layoutControls.info.showPlayers = document.getElementById('info-toggle-players'); // Antatt ID
             layoutControls.info.showLateReg = document.getElementById('info-toggle-latereg'); // Antatt ID
             layoutControls.info.showNextPause = document.getElementById('info-toggle-nextpause'); // Antatt ID
        }
    });


    // Logo Controls
    const logoUploadInput = document.getElementById('logo-upload');
    const currentLogoPreview = document.getElementById('current-logo-preview'); // img tag i modal
    const btnClearLogo = document.getElementById('btn-clear-logo');

    // Sound Controls
    const soundVolumeSlider = document.getElementById('sound-volume-slider');
    const soundVolumeValue = document.getElementById('sound-volume-value');

    // --- End UI Settings Modal Elements ---

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

        // Valider tekstfarge før bruk
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
        updateMainLogoImage(currentLogoBlob, logoImg); // Send med hovedsidens img-element
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
        if (!state || state.live.status === 'finished') return;
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
        if (!state || state.live.status === 'finished') return;
        let key = state.live.isOnBreak ? 'timeRemainingInBreak' : 'timeRemainingInLevel';
        let maxT = Infinity;
        if (!state.live.isOnBreak) {
            const lvl = state.config.blindLevels[state.live.currentLevelIndex];
            if (lvl) maxT = lvl.duration * 60;
        }
        state.live[key] = Math.max(0, Math.min(state.live[key] + deltaSeconds, maxT));
        logActivity(state.live.activityLog, `Tid justert ${deltaSeconds > 0 ? '+' : ''}${deltaSeconds / 60} min.`);
        updateUI(state);
        // Vurder lagring: saveTournamentState(currentTournamentId, state);
    }
    async function finishTournament() {
        if (!state || state.live.status === 'finished') return;
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
                 p.eliminated = true; p.place = null; state.live.eliminatedPlayers.push(p);
             });
             state.live.players = [];
        } else {
             logActivity(state.live.activityLog, `Fullført uten aktive spillere igjen.`);
        }
        state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));
        updateUI(state);
        saveTournamentState(currentTournamentId, state);
        alert("Turneringen er fullført!");
    }
    function handleEndTournament() { console.log("handleEndTournament called."); finishTournament(); }
    function handleForceSave() { if(state) { console.log("handleForceSave"); saveTournamentState(currentTournamentId, state); alert('Turnering lagret!');} else {console.warn("handleForceSave: State not available.")} }
    function handleBackToMain() { console.log("handleBackToMain"); if (state && state.live.status !== 'finished') { saveTournamentState(currentTournamentId, state); } window.location.href = 'index.html'; }
    function openTournamentModal() { console.log("TEMP openTournamentModal"); alert("Funksjon for redigering av turneringsregler er ikke implementert ennå."); }
    function openAddonModal() { console.log("TEMP openAddonModal"); alert("Funksjon for add-ons er ikke implementert ennå."); }
    function startDrag(event, element) { console.log("TEMP startDrag"); /* alert("Dra-og-slipp er ikke implementert ennå."); */ }
    // === MIDLERTIDIGE / TODO FUNKSJONER SLUTT ===


    // === CALLBACKS ===
    const mainCallbacks = {
        updateUI: () => { if (state) updateUI(state); },
        saveState: () => { if (state) saveTournamentState(currentTournamentId, state); },
        playSound: null, // TODO: playSound,
        finishTournament: finishTournament,
        logActivity: (msg) => { if (state) logActivity(state.live.activityLog, msg); },
        checkAndHandleTableBreak: () => { if (state) return checkAndHandleTableBreak(state, currentTournamentId, mainCallbacks); else return false; },
        assignTableSeat: (player, excludeTableNum) => { if (state) assignTableSeat(player, state, excludeTableNum); }
    };
    // === END CALLBACKS ===


    // === UI SETTINGS MODAL LOGIC START ===

    // Hjelpefunksjon for å oppdatere RGB farge-sliders og preview
    function updateRgbColorControls(rgbString, prefix) {
        const previewBox = document.getElementById(`${prefix}-color-preview`);
        const rSlider = document.getElementById(`${prefix}-color-red`);
        const rValue = document.getElementById(`${prefix}-color-red-value`);
        const gSlider = document.getElementById(`${prefix}-color-green`);
        const gValue = document.getElementById(`${prefix}-color-green-value`);
        const bSlider = document.getElementById(`${prefix}-color-blue`);
        const bValue = document.getElementById(`${prefix}-color-blue-value`);

        if (!previewBox || !rSlider || !rValue || !gSlider || !gValue || !bSlider || !bValue) {
            // console.warn(`RGB Color controls for prefix '${prefix}' not fully found.`);
            return; // Ikke kritisk hvis noen mangler, men greit å vite
        }

        try {
            const [r, g, b] = parseRgbString(rgbString); // Bruk parseRgbString fra storage
            rSlider.value = r;
            rValue.textContent = r;
            gSlider.value = g;
            gValue.textContent = g;
            bSlider.value = b;
            bValue.textContent = b;

            if (prefix === 'bg') {
                 previewBox.style.backgroundColor = rgbString;
            } else if (prefix === 'text') {
                 const span = previewBox.querySelector('span') || previewBox;
                 span.style.color = rgbString;
            }
        } catch (e) {
            console.error(`Error parsing/updating RGB color controls for ${prefix}:`, e);
        }
    }

    // Funksjon for å laste innstillinger og populere modalen
    async function populateUiSettingsModal() {
        console.log("Populating UI Settings Modal...");
        // --- Lagre originalinnstillinger for 'Avbryt' ---
        originalSettings = {
            bgColor: loadThemeBgColor(),
            textColor: loadThemeTextColor(),
            layouts: JSON.parse(JSON.stringify(loadElementLayouts())), // Deep copy
            volume: loadSoundVolume(),
            logo: currentLogoBlob // Lagre referanse til *hovedsidens* blob ved åpning
        };
        modalLogoBlob = null; // Nullstill modalens blob ved åpning

        // --- Populate Theme Colors ---
        let validTextColor = DEFAULT_THEME_TEXT;
        if (originalSettings.textColor && originalSettings.textColor.startsWith('rgb(') && originalSettings.textColor.split(',').length === 3) {
             validTextColor = originalSettings.textColor;
        } else {
             console.warn(`PopulateModal: Invalid original textColor "${originalSettings.textColor}". Using default.`);
        }
        updateRgbColorControls(originalSettings.bgColor, 'bg');
        updateRgbColorControls(validTextColor, 'text');
        // TODO: Populate HSL / Favorites

        // --- Populate Layout Controls ---
        const currentLayouts = originalSettings.layouts; // Bruk kopien
        if (currentLayouts.canvas && canvasHeightSlider && canvasHeightValue) {
            canvasHeightSlider.value = currentLayouts.canvas.height ?? 65;
            canvasHeightValue.textContent = canvasHeightSlider.value;
        } else { console.warn("Canvas height controls not found/populated."); }

        // Populer basert på dynamisk hentede kontroller
        for (const elementId in layoutControls) {
            const controls = layoutControls[elementId];
            const layout = currentLayouts[elementId] || DEFAULT_ELEMENT_LAYOUTS[elementId] || {}; // Bruk original, fallback til default

            if (controls.container) { // Vis/skjul hele gruppen?
                 // controls.container.style.display = ???;
            }
            if (controls.visible) controls.visible.checked = layout.isVisible ?? true;
            if (controls.x) controls.x.value = layout.x ?? 0;
            if (controls.xValue) controls.xValue.textContent = controls.x.value;
            if (controls.y) controls.y.value = layout.y ?? 0;
            if (controls.yValue) controls.yValue.textContent = controls.y.value;
            if (controls.width) controls.width.value = layout.width ?? 50;
            if (controls.widthValue) controls.widthValue.textContent = controls.width.value;
            if (controls.height) controls.height.value = layout.height ?? 30; // Gjelder mest logo
            if (controls.heightValue) controls.heightValue.textContent = controls.height.value;
            if (controls.fontSize) controls.fontSize.value = layout.fontSize ?? 1; // Gjelder ikke logo
            if (controls.fontSizeValue) controls.fontSizeValue.textContent = controls.fontSize.value;

            // Info box spesifikke
             if (elementId === 'info' && currentLayouts.info) {
                 if(controls.showNextBlinds) controls.showNextBlinds.checked = currentLayouts.info.showNextBlinds ?? true;
                 if(controls.showAvgStack) controls.showAvgStack.checked = currentLayouts.info.showAvgStack ?? true;
                 if(controls.showPlayers) controls.showPlayers.checked = currentLayouts.info.showPlayers ?? true;
                 if(controls.showLateReg) controls.showLateReg.checked = currentLayouts.info.showLateReg ?? true;
                 if(controls.showNextPause) controls.showNextPause.checked = currentLayouts.info.showNextPause ?? true;
             }
        }

        // --- Populate Logo ---
        if (currentLogoPreview && logoUploadInput) {
            revokeObjectUrl(modalPreviewLogoUrl); // Rydd opp gammel preview URL
            if (originalSettings.logo) {
                 modalPreviewLogoUrl = URL.createObjectURL(originalSettings.logo);
                 currentLogoPreview.src = modalPreviewLogoUrl;
                 currentLogoPreview.style.display = 'block';
                 if(btnClearLogo) btnClearLogo.disabled = false;
            } else {
                 currentLogoPreview.src = '#';
                 currentLogoPreview.style.display = 'none';
                 if(btnClearLogo) btnClearLogo.disabled = true;
                 modalPreviewLogoUrl = null;
            }
            logoUploadInput.value = ''; // Clear file input
        } else { console.warn("Logo controls not found/populated."); }

        // --- Populate Sound ---
         if(soundVolumeSlider && soundVolumeValue) {
             soundVolumeSlider.value = originalSettings.volume;
             soundVolumeValue.textContent = Math.round(originalSettings.volume * 100);
         } else { console.warn("Sound volume controls not found/populated."); }

        console.log("UI Settings Modal populated with original settings.");
    }

    // Funksjon for å åpne UI Settings Modal
    async function openUiModal() {
        if (!uiSettingsModal) {
            console.error("UI Settings Modal element not found!");
            alert("Kunne ikke åpne utseende-innstillinger.");
            return;
        }
        console.log("Opening UI Settings Modal...");
        // Populate med nåværende (originale) verdier FØR den vises
        await populateUiSettingsModal();

        // TODO: Legg til event listeners for controls INNE i modalen her
        // f.eks. for sliders, color inputs, toggles, save/cancel/reset/logo/favorites buttons
        addUiModalListeners(); // Kall funksjon for å legge til listeners

        uiSettingsModal.classList.remove('hidden');
        currentOpenModal = uiSettingsModal;
        isModalOpen = true;
    }

    // Funksjon for å lukke UI Settings Modal
    function closeUiModal(revertChanges = false) { // Parameter for å vite om vi skal tilbakestille
        if (uiSettingsModal) uiSettingsModal.classList.add('hidden');
        currentOpenModal = null;
        isModalOpen = false;

        // Fjern listeners
        removeUiModalListeners(); // Kall funksjon for å fjerne listeners

        revokeObjectUrl(modalPreviewLogoUrl); // Rydd opp preview URL
        modalPreviewLogoUrl = null;
        modalLogoBlob = null; // Nullstill eventuelt nytt bilde

        if (revertChanges && livePreviewEnabled) {
             console.log("Reverting live preview to original settings...");
             // Apply original settings back to the main page
             applyThemeAndLayout(originalSettings.bgColor, originalSettings.textColor, originalSettings.layouts, draggableElements);
             // Trenger ikke oppdatere logo her, siden den ikke ble endret live
        }

        console.log("UI Settings Modal closed.");
    }

    // --- Funksjoner for å håndtere endringer i UI Modal ---

    function handleUiModalInputChange(event) {
        if (!event.target) return;
        const target = event.target;
        const value = (target.type === 'checkbox') ? target.checked : target.value;
        const id = target.id;

        console.log(`UI Modal Change: Element ID=${id}, Type=${target.type}, Value=${value}`);

        // Oppdater midlertidige modal-variabler
        updateModalState(id, value);

        // Oppdater live preview hvis aktivert
        if (livePreviewEnabled) {
             applyModalChangesToLiveView();
        }

        // Oppdater eventuelle tilknyttede value-span
        const valueSpan = document.getElementById(`${id}-value`);
        if (valueSpan && target.type === 'range') {
             valueSpan.textContent = value;
        }
         if (id === 'sound-volume-slider' && soundVolumeValue) {
             soundVolumeValue.textContent = Math.round(value * 100);
         }
    }

    function updateModalState(controlId, value) {
        // Oppdater modalBgColor, modalTextColor, modalLayouts, modalSoundVolume
        // basert på controlId

        // Farger
        if (controlId.startsWith('bg-color-')) {
             const [r,g,b] = [bgColorRedSlider.value, bgColorGreenSlider.value, bgColorBlueSlider.value];
             modalBgColor = `rgb(${r}, ${g}, ${b})`;
             updateRgbColorControls(modalBgColor, 'bg'); // Oppdater preview i modal
        } else if (controlId.startsWith('text-color-')) {
             const [r,g,b] = [textColorRedSlider.value, textColorGreenSlider.value, textColorBlueSlider.value];
             modalTextColor = `rgb(${r}, ${g}, ${b})`;
             updateRgbColorControls(modalTextColor, 'text'); // Oppdater preview i modal
        }
        // Lyd
        else if (controlId === 'sound-volume-slider') {
             modalSoundVolume = parseFloat(value);
        }
        // Layout
        else if (controlId === 'canvas-height-slider') {
             if (!modalLayouts.canvas) modalLayouts.canvas = {};
             modalLayouts.canvas.height = parseInt(value);
        }
        else { // Generell layout-kontroll
             const parts = controlId.split('-'); // f.eks. ['title', 'x', 'slider'] eller ['title', 'visible', 'toggle']
             const elementId = parts[0];
             const property = parts[1]; // 'x', 'y', 'width', 'height', 'fontSize', 'visible'
             const controlType = parts[2]; // 'slider', 'toggle' etc.

             if (modalLayouts[elementId]) {
                 if (property === 'visible') {
                     modalLayouts[elementId].isVisible = value; // boolean fra checkbox
                 } else if (['x', 'y', 'width', 'height'].includes(property)) {
                     modalLayouts[elementId][property] = parseFloat(value); // Posisjon/størrelse
                 } else if (property === 'fontsize') {
                      modalLayouts[elementId].fontSize = parseFloat(value);
                 }
                 // Info box spesifikke toggles
                  else if (elementId === 'info' && property.startsWith('show')) {
                      const infoProp = property; // 'showNextBlinds' etc.
                      if (!modalLayouts.info) modalLayouts.info = {};
                      modalLayouts.info[infoProp] = value; // boolean fra checkbox
                  }
             } else {
                 console.warn(`Element layout section for '${elementId}' not found in modalLayouts.`);
             }
        }
    }

    function applyModalChangesToLiveView() {
         // Bruk modalBgColor, modalTextColor, modalLayouts for å oppdatere live view
         console.log("Applying modal changes to live view (preview)...");
         applyThemeAndLayout(modalBgColor, modalTextColor, modalLayouts, draggableElements);
         // Logo oppdateres separat via handleLogoUpload
    }

    async function handleLogoUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        console.log("Logo file selected:", file.name, file.size, file.type);
        if (!file.type.startsWith('image/')) {
             alert("Vennligst velg en bildefil (PNG, JPG, GIF, etc.).");
             return;
        }
        // Valider filstørrelse?
        // const maxSize = 2 * 1024 * 1024; // 2MB
        // if (file.size > maxSize) { alert("Bildet er for stort (maks 2MB)."); return; }

        modalLogoBlob = file; // Lagre den nye blob'en midlertidig

        // Oppdater preview i modalen
        revokeObjectUrl(modalPreviewLogoUrl);
        modalPreviewLogoUrl = URL.createObjectURL(modalLogoBlob);
        if (currentLogoPreview) {
             currentLogoPreview.src = modalPreviewLogoUrl;
             currentLogoPreview.style.display = 'block';
        }
         if (btnClearLogo) btnClearLogo.disabled = false;

        // Oppdater live preview umiddelbart? (Valgfritt)
        // if (livePreviewEnabled) {
        //      updateMainLogoImage(modalLogoBlob, logoImg);
        // }
    }

    async function handleClearLogo() {
        if (!confirm("Fjerne egendefinert logo og gå tilbake til standard?")) return;
        modalLogoBlob = null; // Marker for sletting ved lagring

        // Oppdater preview i modalen
        revokeObjectUrl(modalPreviewLogoUrl);
        modalPreviewLogoUrl = null;
        if (currentLogoPreview) {
             currentLogoPreview.src = '#';
             currentLogoPreview.style.display = 'none';
        }
         if (btnClearLogo) btnClearLogo.disabled = true;
         if (logoUploadInput) logoUploadInput.value = ''; // Clear file input

        // Oppdater live preview?
        // if (livePreviewEnabled) {
        //     updateMainLogoImage(null, logoImg); // Vis placeholder
        // }
        console.log("Logo marked for clearing.");
    }

    async function handleSaveUiSettings() {
         console.log("Saving UI Settings...");
         try {
             // Lagre farger
             saveThemeBgColor(modalBgColor);
             saveThemeTextColor(modalTextColor);
             // Lagre layout
             saveElementLayouts(modalLayouts);
             // Lagre lydvolum
             saveSoundVolume(modalSoundVolume);
             // Lagre/slett logo
             if (modalLogoBlob === null && originalSettings.logo !== null) { // Sletting markert
                 await clearLogoBlob();
                 currentLogoBlob = null; // Oppdater hovedsidens blob-referanse
                 console.log("Custom logo cleared.");
             } else if (modalLogoBlob instanceof Blob) { // Ny logo lastet opp
                 await saveLogoBlob(modalLogoBlob);
                 currentLogoBlob = modalLogoBlob; // Oppdater hovedsidens blob-referanse
                 console.log("New custom logo saved.");
             }
             // Hvis modalLogoBlob er null og originalSettings.logo var null, gjør ingenting.

             logActivity(state?.live?.activityLog, "Utseende-innstillinger lagret."); // Logg hvis state finnes
             alert("Innstillinger lagret!");
             closeUiModal(false); // Lukk uten å tilbakestille live preview
             // Oppdater hovedsidens UI med de lagrede innstillingene (selv om live preview var på)
             applyThemeAndLayout(modalBgColor, modalTextColor, modalLayouts, draggableElements);
             updateMainLogoImage(currentLogoBlob, logoImg);
         } catch (error) {
             console.error("Error saving UI settings:", error);
             alert(`Kunne ikke lagre innstillingene: ${error.message}`);
         }
    }

    function handleResetUiDefaults() {
        if (!confirm("Tilbakestille alle utseende-innstillinger til standard?")) return;
        console.log("Resetting UI to defaults...");

        // Sett modal state til defaults
        modalBgColor = DEFAULT_THEME_BG;
        modalTextColor = DEFAULT_THEME_TEXT;
        modalLayouts = JSON.parse(JSON.stringify(DEFAULT_ELEMENT_LAYOUTS)); // Deep copy
        modalSoundVolume = DEFAULT_SOUND_VOLUME; // Antatt konstant finnes
        modalLogoBlob = null; // Marker for sletting

        // Oppdater kontroller i modalen
        populateUiSettingsModal(); // Bruk denne for å sette kontrollene basert på modal state

        // Oppdater live preview
        if (livePreviewEnabled) {
             applyModalChangesToLiveView();
             updateMainLogoImage(null, logoImg); // Vis placeholder live
        }
        console.log("Modal state reset to defaults.");
    }


    // Funksjoner for å legge til/fjerne listeners for modal-kontroller
    function addUiModalListeners() {
        console.log("Adding UI modal listeners...");
        uiSettingsModalContent?.addEventListener('input', handleUiModalInputChange);
        logoUploadInput?.addEventListener('change', handleLogoUpload);
        btnClearLogo?.addEventListener('click', handleClearLogo);
        // TODO: Add listeners for theme favorites buttons etc.
    }
    function removeUiModalListeners() {
        console.log("Removing UI modal listeners...");
        uiSettingsModalContent?.removeEventListener('input', handleUiModalInputChange);
        logoUploadInput?.removeEventListener('change', handleLogoUpload);
        btnClearLogo?.removeEventListener('click', handleClearLogo);
         // TODO: Remove listeners for theme favorites buttons etc.
    }

    // === UI SETTINGS MODAL LOGIC END ===


    // === EDIT PLAYER MODAL LOGIC START ===
    function openEditPlayerModal(playerId) {
        if (!state) return;
        console.log("Attempting to open edit modal for player ID:", playerId);
        const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId);
        if (!player) { console.error("Player not found for editing:", playerId); alert("Fant ikke spilleren som skal redigeres."); return; }
        if (!editPlayerModal || !editPlayerIdInput || !editPlayerNameDisplay || !editPlayerNameInput || !editPlayerRebuysInput || !editPlayerAddonCheckbox) { console.error("Edit Player Modal DOM elements not found!"); alert("En feil oppstod ved åpning av redigeringsvinduet."); return; }

        editPlayerIdInput.value = player.id;
        editPlayerNameDisplay.textContent = player.name;
        editPlayerNameInput.value = player.name;
        editPlayerRebuysInput.value = player.rebuys || 0;
        editPlayerAddonCheckbox.checked = player.addon || false;
        editPlayerAddonCheckbox.disabled = state.config.type !== 'rebuy';
        editPlayerAddonCheckbox.parentElement.title = state.config.type !== 'rebuy' ? "Kun for Rebuy-turneringer." : "";
        editPlayerRebuysInput.disabled = (state.config.type !== 'rebuy');

        editPlayerModal.classList.remove('hidden');
        currentOpenModal = editPlayerModal;
        isModalOpen = true;
        console.log("Edit Player Modal opened for:", player.name);
    }

    function closeEditPlayerModal() {
        if (editPlayerModal) editPlayerModal.classList.add('hidden');
        currentOpenModal = null;
        isModalOpen = false;
        console.log("Edit Player Modal closed.");
    }

    function handleSavePlayerChanges() {
        if (!state) return;
        const playerId = Number(editPlayerIdInput.value);
        const newName = editPlayerNameInput.value.trim();
        const newRebuys = parseInt(editPlayerRebuysInput.value) || 0;
        const newAddon = editPlayerAddonCheckbox.checked;

        if (!playerId || !newName) { alert("Spiller-ID eller navn mangler."); return; }
        if (newRebuys < 0) { alert("Antall rebuys kan ikke være negativt."); return; }
        console.log(`Saving changes for player ID: ${playerId}. New data: Name=${newName}, Rebuys=${newRebuys}, Addon=${newAddon}`);

        let player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId);
        if (!player) { console.error("Player to save not found:", playerId); alert("En feil oppstod: Fant ikke spilleren som skulle lagres."); return; }

        let potAdjustment = 0; let entryAdjustment = 0; let rebuyCountAdjustment = 0; let addonCountAdjustment = 0;
        const oldRebuys = player.rebuys || 0;
        if (newRebuys !== oldRebuys && state.config.type === 'rebuy') {
             rebuyCountAdjustment = newRebuys - oldRebuys;
             potAdjustment += rebuyCountAdjustment * (state.config.rebuyCost || 0);
             entryAdjustment += rebuyCountAdjustment;
        }
        const oldAddon = player.addon || false;
        if (newAddon !== oldAddon && state.config.type === 'rebuy') {
             addonCountAdjustment = newAddon ? 1 : -1;
             potAdjustment += addonCountAdjustment * (state.config.addonCost || 0);
             entryAdjustment += addonCountAdjustment;
        }

        const oldName = player.name;
        player.name = newName; player.rebuys = newRebuys; player.addon = newAddon;
        state.live.totalPot += potAdjustment; state.live.totalEntries += entryAdjustment;
        state.live.totalRebuys += rebuyCountAdjustment; state.live.totalAddons += addonCountAdjustment;

        let logMessage = `Spiller ${playerId} (${oldName}) redigert: `;
        const changes = [];
        if (oldName !== newName) changes.push(`Navn -> "${newName}"`);
        if (rebuyCountAdjustment !== 0) changes.push(`Rebuys ${oldRebuys}->${newRebuys}`);
        if (addonCountAdjustment !== 0) changes.push(`Addon ${newAddon?'lagt til':'fjernet'}`);
        if (potAdjustment !== 0 || entryAdjustment !== 0) changes.push(`(Pott ${potAdjustment > 0 ? '+' : ''}${potAdjustment}, Entries ${entryAdjustment > 0 ? '+' : ''}${entryAdjustment})`);

        if (changes.length > 0) { logActivity(state.live.activityLog, logMessage + changes.join(', ') + '.'); }
        else { logActivity(state.live.activityLog, `Ingen endringer lagret for ${newName} (ID: ${playerId}).`); }

        closeEditPlayerModal(); updateUI(state); saveTournamentState(currentTournamentId, state);
        console.log("Player changes saved and UI updated.");
    }
    // === EDIT PLAYER MODAL LOGIC END ===


    // === EVENT LISTENER ATTACHMENT (General) ===
    startPauseButton?.addEventListener('click', () => {
        if (!state) return;
        console.log("Start/Pause Button Clicked. Current Status:", state.live.status);
        if (state.live.status === 'paused') {
             state.live.status = 'running'; startMainTimer(state, currentTournamentId, mainCallbacks); logActivity(state.live.activityLog, "Klokke startet."); updateUI(state);
        } else if (state.live.status === 'running') {
             state.live.status = 'paused'; stopMainTimer(); logActivity(state.live.activityLog, "Klokke pauset."); saveTournamentState(currentTournamentId, state); updateUI(state);
        } else { console.log("Start/Pause button ignored, status is 'finished'."); }
    });
    prevLevelButton?.addEventListener('click', () => handleAdjustLevel(-1));
    nextLevelButton?.addEventListener('click', () => handleAdjustLevel(1));
    adjustTimeMinusButton?.addEventListener('click', () => handleAdjustTime(-60));
    adjustTimePlusButton?.addEventListener('click', () => handleAdjustTime(60));
    lateRegButton?.addEventListener('click', () => { if(state) handleLateRegClick(state, currentTournamentId, mainCallbacks); });
    endTournamentButton?.addEventListener('click', handleEndTournament);
    btnForceSave?.addEventListener('click', handleForceSave);
    btnBackToMainLive?.addEventListener('click', handleBackToMain);
    btnToggleSound?.addEventListener('click', () => {
        console.log("btnToggleSound clicked."); soundsEnabled = !soundsEnabled; saveSoundPreference(soundsEnabled); updateSoundToggleVisuals(soundsEnabled); if (state) logActivity(state.live.activityLog, `Lyd ${soundsEnabled ? 'PÅ' : 'AV'}.`);
    });
    btnEditTournamentSettings?.addEventListener('click', openTournamentModal); // Bruker fortsatt TEMP
    btnEditUiSettings?.addEventListener('click', openUiModal); // ENDRET: Kaller ny funksjon
    btnManageAddons?.addEventListener('click', openAddonModal); // Bruker fortsatt TEMP

    draggableElements.forEach(el => { if (el) { el.addEventListener('mousedown', (e) => startDrag(e, el)); } });
    window.addEventListener('click', (e) => {
        if (isModalOpen && currentOpenModal && e.target === currentOpenModal) {
             console.log("Clicked outside modal content.");
             if (currentOpenModal === editPlayerModal) closeEditPlayerModal();
             else if (currentOpenModal === uiSettingsModal) closeUiModal(true); // Lukk OG tilbakestill live preview
             // else if (currentOpenModal === otherModal) { closeOtherModal(); }
        }
    });

    // --- Listeners for Modal Buttons ---
    // Edit Player Modal
    btnSavePlayerChanges?.addEventListener('click', handleSavePlayerChanges);
    btnCancelPlayerEdit?.addEventListener('click', closeEditPlayerModal);
    closeEditPlayerModalButton?.addEventListener('click', closeEditPlayerModal);
    // UI Settings Modal
    closeUiSettingsModalButton?.addEventListener('click', () => closeUiModal(true)); // Lukk OG tilbakestill
    btnCancelUiSettings?.addEventListener('click', () => closeUiModal(true)); // Lukk OG tilbakestill
    btnSaveUiSettings?.addEventListener('click', handleSaveUiSettings); // Kaller lagringsfunksjon
    btnResetUiDefaults?.addEventListener('click', handleResetUiDefaults); // Kaller reset-funksjon
    // --- Slutt Listeners for Modal Buttons ---

    function setupPlayerActionDelegation() {
        const handleActions = (event) => {
            if (!state) return;
            const button = event.target.closest('button'); if (!button) return;
            const action = Array.from(button.classList).find(cls => cls.startsWith('btn-')); if (!action) return;
            const playerId = Number(button.dataset.playerId);

            if (action === 'btn-edit-player') {
                 if (!playerId || isNaN(playerId)) { console.warn("Invalid player ID for edit action", button); return; }
                 console.log(`Delegated action: ${action} for player ID: ${playerId}`);
                 openEditPlayerModal(playerId);
            } else {
                 if (!playerId || isNaN(playerId)) { console.warn("Invalid player ID for action", action, button); return; }
                 console.log(`Delegated action: ${action} for player ID: ${playerId}`);
                 switch (action) {
                     case 'btn-rebuy': handleRebuy(event, state, currentTournamentId, mainCallbacks); break;
                     case 'btn-eliminate': handleEliminate(event, state, currentTournamentId, mainCallbacks); break;
                     case 'btn-restore': handleRestore(event, state, currentTournamentId, mainCallbacks); break;
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
        if (!state) { throw new Error("State is not initialized, cannot proceed with final setup."); }
        updateUI(state);
        startRealTimeClock(currentTimeDisplay);
        console.log(`Final check: Current state status is '${state.live.status}'`);
        if (state.live.status === 'running') {
             console.log("State is 'running', attempting to start main timer."); startMainTimer(state, currentTournamentId, mainCallbacks);
        } else {
             console.log(`State is '${state.live.status}'. Main timer will not be started automatically.`); stopMainTimer();
        }
        console.log("Tournament page fully initialized and ready.");
    } catch (err) {
        console.error("Error during final setup or UI update:", err);
        alert("En alvorlig feil oppstod under lasting av turneringssiden. Sjekk konsollen.\n" + err.message);
    }
    // === INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
