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
    DEFAULT_THEME_TEXT,
    parseRgbString,
    loadSoundVolume,
    saveSoundVolume,
    saveLogoBlob,
    clearLogoBlob,
    DEFAULT_ELEMENT_LAYOUTS,
    DEFAULT_THEME_BG,
    rgbToHsl,  // NY: Importer konverterere
    hslToRgb   // NY: Importer konverterere
} from './storage.js';

// --- UI & FORMATTING ---
import {
    applyThemeAndLayout,
    updateMainLogoImage,
    updateSoundToggleVisuals,
    updateUI,
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
    getPlayerNameById
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

// TODO: Importer modaler (når de er laget), sound
// import { openTournamentModal, openAddonModal } from './tournament-modals.js';
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

    // Drag & Drop State
    let isDragging = false;
    let draggedElement = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let dragElementId = null;

    // UI Modal spesifikk state
    let modalBgColor = loadThemeBgColor();
    let modalTextColor = loadThemeTextColor();
    let modalLayouts = loadElementLayouts();
    let modalSoundVolume = loadSoundVolume();
    let modalLogoBlob = null;
    let modalPreviewLogoUrl = null;
    let originalSettings = {};
    let livePreviewEnabled = true;
    let isUpdatingColorControls = false; // NY: For å hindre HSL/RGB loops

    // NY: Fargeforvalg
    const colorPresets = [
        { name: "Mørk (Standard)", bg: "rgb(65, 65, 65)", text: "rgb(235, 235, 235)" },
        { name: "Lys", bg: "rgb(248, 249, 250)", text: "rgb(33, 37, 41)" },
        { name: "Blå", bg: "rgb(13, 40, 89)", text: "rgb(210, 218, 226)" },
        { name: "Grå/Grønn", bg: "rgb(73, 80, 87)", text: "rgb(160, 210, 170)" }
    ];
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // Generelt... (som før)
    const currentTimeDisplay = document.getElementById('current-time');
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    const btnEditTournamentSettings = document.getElementById('btn-edit-tournament-settings');
    const btnEditUiSettings = document.getElementById('btn-edit-ui-settings');
    const btnBackToMainLive = document.getElementById('btn-back-to-main-live');
    const prizeDisplayLive = document.getElementById('prize-display-live');
    // const totalPotPrizeSpan = document.getElementById('total-pot'); // Hentes i displayPrizes
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

    // Canvas elementer... (som før)
    const liveCanvas = document.getElementById('live-canvas');
    const titleElement = document.getElementById('title-element');
    const timerElement = document.getElementById('timer-element');
    const blindsElement = document.getElementById('blinds-element');
    const logoElement = document.getElementById('logo-element');
    const infoElement = document.getElementById('info-element');
    const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement];

    // Display elementer... (som før)
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

    // Modaler... (som før)
    const tournamentSettingsModal = document.getElementById('tournament-settings-modal');
    const uiSettingsModal = document.getElementById('ui-settings-modal');
    const addonModal = document.getElementById('addon-modal');
    const editPlayerModal = document.getElementById('edit-player-modal');

    // Edit Player Modal elementer... (som før)
    const editPlayerModalContent = editPlayerModal?.querySelector('.modal-content');
    const editPlayerIdInput = document.getElementById('edit-player-id-input');
    const editPlayerNameDisplay = document.getElementById('edit-player-name-display');
    const editPlayerNameInput = document.getElementById('edit-player-name-input');
    const editPlayerRebuysInput = document.getElementById('edit-player-rebuys-input');
    const editPlayerAddonCheckbox = document.getElementById('edit-player-addon-checkbox');
    const btnSavePlayerChanges = document.getElementById('btn-save-player-changes');
    const btnCancelPlayerEdit = document.getElementById('btn-cancel-player-edit');
    const closeEditPlayerModalButton = document.getElementById('close-edit-player-modal-button');

    // --- UI Settings Modal Elements ---
    const uiSettingsModalContent = uiSettingsModal?.querySelector('.modal-content');
    const closeUiSettingsModalButton = document.getElementById('close-ui-settings-modal-button');
    const btnSaveUiSettings = document.getElementById('btn-save-ui-settings');
    const btnCancelUiSettings = document.getElementById('btn-cancel-ui-settings');
    const btnResetUiDefaults = document.getElementById('btn-reset-ui-defaults');

    // Theme Controls
    const themePresetSelect = document.getElementById('theme-preset-select'); // NY
    const bgColorDisplay = document.getElementById('bg-color-preview');
    const textColorDisplay = document.getElementById('text-color-preview');
    // BG RGB
    const bgColorRedSlider = document.getElementById('bg-color-red');
    const bgColorRedValue = document.getElementById('bg-color-red-value');
    const bgColorGreenSlider = document.getElementById('bg-color-green');
    const bgColorGreenValue = document.getElementById('bg-color-green-value');
    const bgColorBlueSlider = document.getElementById('bg-color-blue');
    const bgColorBlueValue = document.getElementById('bg-color-blue-value');
    // BG HSL
    const bgColorHueSlider = document.getElementById('bg-color-hue');
    const bgColorHueValue = document.getElementById('bg-color-hue-value');
    const bgColorSaturationSlider = document.getElementById('bg-color-saturation');
    const bgColorSaturationValue = document.getElementById('bg-color-saturation-value');
    const bgColorLightnessSlider = document.getElementById('bg-color-lightness');
    const bgColorLightnessValue = document.getElementById('bg-color-lightness-value');
    // TEXT RGB
    const textColorRedSlider = document.getElementById('text-color-red');
    const textColorRedValue = document.getElementById('text-color-red-value');
    const textColorGreenSlider = document.getElementById('text-color-green');
    const textColorGreenValue = document.getElementById('text-color-green-value');
    const textColorBlueSlider = document.getElementById('text-color-blue');
    const textColorBlueValue = document.getElementById('text-color-blue-value');
    // TEXT HSL
    const textColorHueSlider = document.getElementById('text-color-hue');
    const textColorHueValue = document.getElementById('text-color-hue-value');
    const textColorSaturationSlider = document.getElementById('text-color-saturation');
    const textColorSaturationValue = document.getElementById('text-color-saturation-value');
    const textColorLightnessSlider = document.getElementById('text-color-lightness');
    const textColorLightnessValue = document.getElementById('text-color-lightness-value');

    // Layout Controls
    const layoutControlContainer = document.getElementById('element-layout-grid');
    const canvasHeightSlider = document.getElementById('canvas-height-slider');
    const canvasHeightValue = document.getElementById('canvas-height-value');

    // Dynamisk henting av layout controls... (som før)
    const layoutControls = {};
    draggableElements.forEach(el => {
        if (!el) return;
        const id = el.id.replace('-element', '');
        layoutControls[id] = {
            container: document.getElementById(`${id}-layout-controls`), visible: document.getElementById(`${id}-visible-toggle`),
            x: document.getElementById(`${id}-x-slider`), xValue: document.getElementById(`${id}-x-value`),
            y: document.getElementById(`${id}-y-slider`), yValue: document.getElementById(`${id}-y-value`),
            width: document.getElementById(`${id}-width-slider`), widthValue: document.getElementById(`${id}-width-value`),
            height: document.getElementById(`${id}-height-slider`), heightValue: document.getElementById(`${id}-height-value`),
            fontSize: document.getElementById(`${id}-fontsize-slider`), fontSizeValue: document.getElementById(`${id}-fontsize-value`),
        };
        if (id === 'info') {
             layoutControls.info.showNextBlinds = document.getElementById('info-toggle-nextblinds');
             layoutControls.info.showAvgStack = document.getElementById('info-toggle-avgstack');
             layoutControls.info.showPlayers = document.getElementById('info-toggle-players');
             layoutControls.info.showLateReg = document.getElementById('info-toggle-latereg');
             layoutControls.info.showNextPause = document.getElementById('info-toggle-nextpause');
        }
    });

    // Logo Controls... (som før)
    const logoUploadInput = document.getElementById('logo-upload');
    const currentLogoPreview = document.getElementById('current-logo-preview');
    const btnClearLogo = document.getElementById('btn-clear-logo');

    // Sound Controls... (som før)
    const soundVolumeSlider = document.getElementById('sound-volume-slider');
    const soundVolumeValue = document.getElementById('sound-volume-value');
    // --- End UI Settings Modal Elements ---

    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    console.log("Tournament Main: Retrieved active tournament ID:", currentTournamentId);
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); console.error("No active tournament ID found. Redirecting."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig data (ID: ${currentTournamentId}). Sjekk konsollen.`); console.error("Invalid or incomplete state loaded:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    // Grundigere validering/default-setting... (som før)
    state.live = state.live || {}; state.live.status = state.live.status === 'running' || state.live.status === 'paused' || state.live.status === 'finished' ? state.live.status : 'paused'; state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0;
    if (state.live.currentLevelIndex >= state.config.blindLevels.length) { console.warn(`Loaded currentLevelIndex (${state.live.currentLevelIndex}) out of bounds. Resetting.`); state.live.currentLevelIndex = state.config.blindLevels.length - 1; state.live.status = 'paused'; }
    const currentLevelData = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (currentLevelData?.duration * 60 || 1200); state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.players = state.live.players || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.knockoutLog = state.live.knockoutLog || []; state.live.activityLog = state.live.activityLog || []; state.live.totalPot = state.live.totalPot ?? 0; state.live.totalEntries = state.live.totalEntries ?? 0; state.live.totalRebuys = state.live.totalRebuys ?? 0; state.live.totalAddons = state.live.totalAddons ?? 0; state.live.nextPlayerId = state.live.nextPlayerId || (Math.max(0, ...state.live.players.map(p => p.id), ...state.live.eliminatedPlayers.map(p => p.id)) + 1);
    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, JSON.parse(JSON.stringify(state)));
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 04b: INITIAL THEME, LAYOUT, LOGO APPLICATION ===
    async function applyInitialThemeLayoutAndLogo() { /* ... (som før, ingen endring nødvendig her) ... */
        console.log("applyInitialThemeLayoutAndLogo: Starting...");
        const bgColor = loadThemeBgColor();
        let textColor = loadThemeTextColor();
        if (!textColor || !textColor.startsWith('rgb(') || textColor.split(',').length !== 3) { console.warn(`Invalid textColor loaded: "${textColor}". Falling back to default.`); textColor = DEFAULT_THEME_TEXT; }
        const elementLayouts = loadElementLayouts();
        let logoDataBlob = null;
        try { logoDataBlob = await loadLogoBlob(); } catch (err) { console.error("Error loading logo blob:", err); }
        console.log("applyInitialThemeLayoutAndLogo: Data fetched. Applying theme/layout. Logo Blob:", logoDataBlob);
        applyThemeAndLayout(bgColor, textColor, elementLayouts, draggableElements);
        currentLogoBlob = logoDataBlob;
        updateMainLogoImage(currentLogoBlob, logoImg);
        console.log("applyInitialThemeLayoutAndLogo: Done.");
    }
    try { await applyInitialThemeLayoutAndLogo(); } catch (err) { console.error("CRITICAL Error during initial theme/layout/logo setup:", err); }
    // === 04b: INITIAL THEME, LAYOUT, LOGO APPLICATION END ===


    // === MIDLERTIDIGE / TODO FUNKSJONER START ===
    function handleAdjustLevel(delta) { /* ... (som før) ... */ }
    function handleAdjustTime(deltaSeconds) { /* ... (som før) ... */ }
    async function finishTournament() { /* ... (som før) ... */ }
    function handleEndTournament() { console.log("handleEndTournament called."); finishTournament(); }
    function handleForceSave() { /* ... (som før) ... */ }
    function handleBackToMain() { /* ... (som før) ... */ }
    function openTournamentModal() { console.log("TEMP openTournamentModal"); alert("Funksjon for redigering av turneringsregler er ikke implementert ennå."); }
    function openAddonModal() { console.log("TEMP openAddonModal"); alert("Funksjon for add-ons er ikke implementert ennå."); }
    // === MIDLERTIDIGE / TODO FUNKSJONER SLUTT ===


    // === DRAG AND DROP LOGIC START ===
    // ENDRET: Implementert dra-og-slipp
    function startDrag(event, element) {
        if (!element || !element.classList.contains('draggable-element')) return;
        if (event.target.closest('button, input, select, textarea, a')) return; // Ikke dra på interaktive elementer

        console.log("startDrag initiated on element:", element.id);
        isDragging = true;
        draggedElement = element;
        dragElementId = element.id.replace('-element', '');

        const rect = element.getBoundingClientRect();
        dragOffsetX = event.clientX - rect.left;
        dragOffsetY = event.clientY - rect.top;

        element.classList.add('dragging');
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('mouseleave', stopDrag);
    }

    function drag(event) {
        if (!isDragging || !draggedElement || !liveCanvas) return;
        event.preventDefault();

        const canvasRect = liveCanvas.getBoundingClientRect();
        if (canvasRect.width === 0 || canvasRect.height === 0) return;

        let newX = event.clientX - canvasRect.left - dragOffsetX;
        let newY = event.clientY - canvasRect.top - dragOffsetY;
        let newXPercent = (newX / canvasRect.width) * 100;
        let newYPercent = (newY / canvasRect.height) * 100;

        // Enkel grensesjekk (kan forbedres for å ta hensyn til elementets størrelse)
        newXPercent = Math.max(0, Math.min(newXPercent, 100));
        newYPercent = Math.max(0, Math.min(newYPercent, 100));

        // Snap to grid? (Optional)
        // newXPercent = Math.round(newXPercent / 0.5) * 0.5; // Snap to 0.5% grid
        // newYPercent = Math.round(newYPercent / 0.5) * 0.5;

        draggedElement.style.left = `${newXPercent}%`;
        draggedElement.style.top = `${newYPercent}%`;

        // Oppdater modal state hvis modalen er åpen
        if (isModalOpen && currentOpenModal === uiSettingsModal && modalLayouts[dragElementId]) {
             const xFixed = parseFloat(newXPercent.toFixed(1));
             const yFixed = parseFloat(newYPercent.toFixed(1));
             modalLayouts[dragElementId].x = xFixed;
             modalLayouts[dragElementId].y = yFixed;

             const xSlider = document.getElementById(`${dragElementId}-x-slider`);
             const xValue = document.getElementById(`${dragElementId}-x-value`);
             const ySlider = document.getElementById(`${dragElementId}-y-slider`);
             const yValue = document.getElementById(`${dragElementId}-y-value`);
             if (xSlider) xSlider.value = xFixed; if (xValue) xValue.textContent = xFixed;
             if (ySlider) ySlider.value = yFixed; if (yValue) yValue.textContent = yFixed;
        }
    }

    function stopDrag(event) {
        if (!isDragging || !draggedElement) return;
        console.log("stopDrag for element:", draggedElement.id);

        isDragging = false;
        draggedElement.classList.remove('dragging');
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('mouseleave', stopDrag);

        const finalX = parseFloat(draggedElement.style.left);
        const finalY = parseFloat(draggedElement.style.top);

        // Oppdater modal state en siste gang
        if (isModalOpen && currentOpenModal === uiSettingsModal && modalLayouts[dragElementId]) {
             modalLayouts[dragElementId].x = parseFloat(finalX.toFixed(1));
             modalLayouts[dragElementId].y = parseFloat(finalY.toFixed(1));
             console.log(`Final position for ${dragElementId} saved to modalLayouts: X=${modalLayouts[dragElementId].x}, Y=${modalLayouts[dragElementId].y}`);
             // Lagring skjer kun via "Lagre" knappen i modalen
        } else {
             // Hvis man skal kunne dra UTENOM modalen og lagre direkte:
             // const currentLayouts = loadElementLayouts();
             // if(currentLayouts[dragElementId]) {
             //     currentLayouts[dragElementId].x = parseFloat(finalX.toFixed(1));
             //     currentLayouts[dragElementId].y = parseFloat(finalY.toFixed(1));
             //     saveElementLayouts(currentLayouts);
             //     logActivity(state?.live?.activityLog, `Element ${dragElementId} flyttet.`);
             //     console.log(`Direct drag save for ${dragElementId}: X=${currentLayouts[dragElementId].x}, Y=${currentLayouts[dragElementId].y}`);
             // }
        }
        draggedElement = null; dragElementId = null;
    }
    // === DRAG AND DROP LOGIC END ===


    // === CALLBACKS ===
    const mainCallbacks = { /* ... (som før) ... */
        updateUI: () => { if (state) updateUI(state); }, saveState: () => { if (state) saveTournamentState(currentTournamentId, state); }, playSound: null, finishTournament: finishTournament, logActivity: (msg) => { if (state) logActivity(state.live.activityLog, msg); }, checkAndHandleTableBreak: () => { if (state) return checkAndHandleTableBreak(state, currentTournamentId, mainCallbacks); else return false; }, assignTableSeat: (player, excludeTableNum) => { if (state) assignTableSeat(player, state, excludeTableNum); }
    };
    // === END CALLBACKS ===


    // === UI SETTINGS MODAL LOGIC START ===

    // Hjelpefunksjon for å oppdatere ALLE fargekontroller (RGB, HSL, Preview) basert på en RGB-streng
    function updateAllColorControls(rgbString, prefix) {
        isUpdatingColorControls = true; // Sett flagg for å unngå løkker
        try {
            const [r, g, b] = parseRgbString(rgbString);
            const hsl = rgbToHsl(r, g, b); // Konverter til HSL

            // Oppdater RGB Sliders/Values
            const rSlider = document.getElementById(`${prefix}-color-red`); if (rSlider) rSlider.value = r;
            const rValue = document.getElementById(`${prefix}-color-red-value`); if (rValue) rValue.textContent = r;
            const gSlider = document.getElementById(`${prefix}-color-green`); if (gSlider) gSlider.value = g;
            const gValue = document.getElementById(`${prefix}-color-green-value`); if (gValue) gValue.textContent = g;
            const bSlider = document.getElementById(`${prefix}-color-blue`); if (bSlider) bSlider.value = b;
            const bValue = document.getElementById(`${prefix}-color-blue-value`); if (bValue) bValue.textContent = b;

            // Oppdater HSL Sliders/Values
            const hSlider = document.getElementById(`${prefix}-color-hue`); if (hSlider) hSlider.value = hsl.h;
            const hValue = document.getElementById(`${prefix}-color-hue-value`); if (hValue) hValue.textContent = hsl.h;
            const sSlider = document.getElementById(`${prefix}-color-saturation`); if (sSlider) sSlider.value = hsl.s;
            const sValue = document.getElementById(`${prefix}-color-saturation-value`); if (sValue) sValue.textContent = hsl.s;
            const lSlider = document.getElementById(`${prefix}-color-lightness`); if (lSlider) lSlider.value = hsl.l;
            const lValue = document.getElementById(`${prefix}-color-lightness-value`); if (lValue) lValue.textContent = hsl.l;

            // Oppdater Preview Box
            const previewBox = document.getElementById(`${prefix}-color-preview`);
            if (previewBox) {
                if (prefix === 'bg') previewBox.style.backgroundColor = rgbString;
                else if (prefix === 'text') (previewBox.querySelector('span') || previewBox).style.color = rgbString;
            }
        } catch (e) {
            console.error(`Error updating all color controls for ${prefix}:`, e);
        } finally {
            isUpdatingColorControls = false; // Fjern flagg
        }
    }


    // Funksjon for å laste innstillinger og populere modalen
    async function populateUiSettingsModal() {
        console.log("Populating UI Settings Modal...");
        originalSettings = {
            bgColor: loadThemeBgColor(), textColor: loadThemeTextColor(),
            layouts: JSON.parse(JSON.stringify(loadElementLayouts())),
            volume: loadSoundVolume(), logo: currentLogoBlob
        };
        modalLogoBlob = null; // Nullstill nytt logo-forsøk

        // Populate Presets Dropdown
        if (themePresetSelect) {
            themePresetSelect.innerHTML = '<option value="">-- Velg forhåndsvalg --</option>'; // Reset
            colorPresets.forEach((preset, index) => {
                const option = document.createElement('option');
                option.value = index.toString();
                option.textContent = preset.name;
                themePresetSelect.appendChild(option);
            });
        }

        // Populate Theme Colors (via helper)
        let validTextColor = DEFAULT_THEME_TEXT;
        if (originalSettings.textColor && originalSettings.textColor.startsWith('rgb(') && originalSettings.textColor.split(',').length === 3) validTextColor = originalSettings.textColor;
        else console.warn(`PopulateModal: Invalid original textColor "${originalSettings.textColor}". Using default.`);
        updateAllColorControls(originalSettings.bgColor, 'bg');
        updateAllColorControls(validTextColor, 'text');

        // Populate Layout Controls... (som før)
        const currentLayouts = originalSettings.layouts;
        if (currentLayouts.canvas && canvasHeightSlider && canvasHeightValue) { /*...*/ canvasHeightSlider.value = currentLayouts.canvas.height ?? 65; canvasHeightValue.textContent = canvasHeightSlider.value; } else { console.warn("Canvas height controls missing."); }
        for (const elementId in layoutControls) { /*...*/ } // (Resten av layout-populeringen som før)

        // Populate Logo... (som før)
        if (currentLogoPreview && logoUploadInput) { /*...*/ } else { console.warn("Logo controls missing."); }

        // Populate Sound... (som før)
         if(soundVolumeSlider && soundVolumeValue) { /*...*/ } else { console.warn("Sound volume controls missing."); }
        console.log("UI Settings Modal populated.");
    }

    // Funksjon for å åpne UI Settings Modal
    async function openUiModal() { /* ... (som før, kaller populate og add listeners) ... */
        if (!uiSettingsModal) { console.error("UI Settings Modal element not found!"); alert("Kunne ikke åpne utseende-innstillinger."); return; }
        console.log("Opening UI Settings Modal...");
        await populateUiSettingsModal(); // Populate FØR visning
        addUiModalListeners(); // Legg til listeners ETTER populering
        uiSettingsModal.classList.remove('hidden');
        currentOpenModal = uiSettingsModal; isModalOpen = true;
    }

    // Funksjon for å lukke UI Settings Modal
    function closeUiModal(revertChanges = false) { /* ... (som før, kaller remove listeners) ... */
         if (!isModalOpen || currentOpenModal !== uiSettingsModal) return;
         if (uiSettingsModal) uiSettingsModal.classList.add('hidden');
         currentOpenModal = null; isModalOpen = false;
         removeUiModalListeners();
         revokeObjectUrl(modalPreviewLogoUrl); modalPreviewLogoUrl = null; modalLogoBlob = null;
         if (revertChanges && livePreviewEnabled) {
              console.log("Reverting live preview to original settings...");
              applyThemeAndLayout(originalSettings.bgColor, originalSettings.textColor, originalSettings.layouts, draggableElements);
              updateMainLogoImage(originalSettings.logo, logoImg);
         }
         console.log("UI Settings Modal closed.");
     }

    // --- Funksjoner for å håndtere endringer i UI Modal ---
    function handleUiModalInputChange(event) {
        if (!event.target || !isModalOpen || currentOpenModal !== uiSettingsModal || isUpdatingColorControls) return; // Sjekk flagg
        const target = event.target;
        const value = (target.type === 'checkbox') ? target.checked : target.value;
        const id = target.id;

        // Håndter fargeendringer (RGB eller HSL)
        if (id.includes('-color-')) {
            const prefix = id.startsWith('bg-') ? 'bg' : 'text';
            let newRgbColor = '';
            if (id.includes('-hue') || id.includes('-saturation') || id.includes('-lightness')) {
                // HSL endret -> konverter til RGB
                const h = parseInt(document.getElementById(`${prefix}-color-hue`).value);
                const s = parseInt(document.getElementById(`${prefix}-color-saturation`).value);
                const l = parseInt(document.getElementById(`${prefix}-color-lightness`).value);
                newRgbColor = hslToRgb(h, s, l);
            } else { // RGB endret
                const r = parseInt(document.getElementById(`${prefix}-color-red`).value);
                const g = parseInt(document.getElementById(`${prefix}-color-green`).value);
                const b = parseInt(document.getElementById(`${prefix}-color-blue`).value);
                newRgbColor = `rgb(${r}, ${g}, ${b})`;
            }
            // Oppdater modal state og ALLE kontroller for denne fargen
            if (prefix === 'bg') modalBgColor = newRgbColor; else modalTextColor = newRgbColor;
            updateAllColorControls(newRgbColor, prefix); // Oppdaterer både RGB/HSL sliders/values/preview
        } else {
             // Håndter andre input-endringer (layout, lyd etc.)
            updateModalState(id, value); // Oppdater kun den spesifikke verdien i modal state
             // Oppdater tilknyttet value-span for sliders
            const valueSpanId = `${id}-value`;
            const valueSpan = document.getElementById(valueSpanId);
            if (valueSpan && target.type === 'range') {
                if (id.includes('-fontsize') || id.includes('-x') || id.includes('-y')) valueSpan.textContent = parseFloat(value).toFixed(1);
                else valueSpan.textContent = value;
            }
            if (id === 'sound-volume-slider' && soundVolumeValue) soundVolumeValue.textContent = Math.round(value * 100);
        }

        // Oppdater live preview hvis aktivert
        if (livePreviewEnabled) applyModalChangesToLiveView();
    }

    // Funksjon som KUN oppdaterer den interne modal state (uten å trigge UI-oppdateringer i modalen)
    function updateModalState(controlId, value) { /* ... (som før) ... */
         // Farger (Oppdateres nå via updateAllColorControls)

         // Lyd
         if (controlId === 'sound-volume-slider') modalSoundVolume = parseFloat(value);
         // Layout
         else if (controlId === 'canvas-height-slider') { if (!modalLayouts.canvas) modalLayouts.canvas = {}; modalLayouts.canvas.height = parseInt(value); }
         else { // Generell layout-kontroll
              const parts = controlId.split('-'); const elementId = parts[0]; const propertyOrAction = parts[1]; const controlType = parts.slice(2).join('-');
              if (!modalLayouts[elementId]) modalLayouts[elementId] = {};
              if (propertyOrAction === 'visible') modalLayouts[elementId].isVisible = value;
              else if (['x', 'y', 'width', 'height'].includes(propertyOrAction)) modalLayouts[elementId][propertyOrAction] = parseFloat(value);
              else if (propertyOrAction === 'fontsize') modalLayouts[elementId].fontSize = parseFloat(value);
              else if (elementId === 'info' && propertyOrAction === 'toggle') { const infoProp = controlType.startsWith('show') ? controlType : `show${controlType.charAt(0).toUpperCase() + controlType.slice(1)}`; if (!modalLayouts.info) modalLayouts.info = {}; modalLayouts.info[infoProp] = value; }
          }
     }


    function applyModalChangesToLiveView() { /* ... (som før) ... */
         applyThemeAndLayout(modalBgColor, modalTextColor, modalLayouts, draggableElements);
    }
    async function handleLogoUpload(event) { /* ... (som før) ... */ }
    async function handleClearLogo() { /* ... (som før) ... */ }

    // NY: Håndterer valg av forhåndsinnstilling
    function handlePresetChange(event) {
        const selectedIndex = parseInt(event.target.value);
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= colorPresets.length) {
             event.target.value = ""; // Reset dropdown hvis ugyldig valg
            return;
        }
        const preset = colorPresets[selectedIndex];
        console.log("Preset selected:", preset.name);

        // Oppdater modal state
        modalBgColor = preset.bg;
        modalTextColor = preset.text;

        // Oppdater alle kontroller i modalen
        updateAllColorControls(modalBgColor, 'bg');
        updateAllColorControls(modalTextColor, 'text');

        // Oppdater live preview
        if (livePreviewEnabled) applyModalChangesToLiveView();

         event.target.value = ""; // Reset dropdown etter bruk
    }

    async function handleSaveUiSettings() {
         console.log("--- handleSaveUiSettings CALLED ---"); // TYDELIG LOGG
         try {
             saveThemeBgColor(modalBgColor); saveThemeTextColor(modalTextColor);
             saveElementLayouts(modalLayouts); saveSoundVolume(modalSoundVolume);
             if (modalLogoBlob === null && originalSettings.logo !== null) { await clearLogoBlob(); currentLogoBlob = null; console.log("Custom logo cleared."); }
             else if (modalLogoBlob instanceof Blob) { await saveLogoBlob(modalLogoBlob); currentLogoBlob = modalLogoBlob; console.log("New custom logo saved."); }
             logActivity(state?.live?.activityLog, "Utseende-innstillinger lagret.");
             alert("Innstillinger lagret!");
             closeUiModal(false);
             // Sørg for at UI er oppdatert (selv om live var på)
             applyThemeAndLayout(modalBgColor, modalTextColor, modalLayouts, draggableElements);
             updateMainLogoImage(currentLogoBlob, logoImg);
         } catch (error) { console.error("Error saving UI settings:", error); alert(`Kunne ikke lagre innstillingene: ${error.message}`); }
    }

    function handleResetUiDefaults() { /* ... (som før) ... */ }

    // Funksjoner for å legge til/fjerne listeners for modal-kontroller
    function addUiModalListeners() {
        console.log("Adding UI modal listeners...");
        uiSettingsModalContent?.addEventListener('input', handleUiModalInputChange); // Dekker alle sliders/inputs
        logoUploadInput?.addEventListener('change', handleLogoUpload);
        btnClearLogo?.addEventListener('click', handleClearLogo);
        themePresetSelect?.addEventListener('change', handlePresetChange); // NY: Listener for presets
        // Knappene
        closeUiSettingsModalButton?.addEventListener('click', closeUiModalHelper);
        btnCancelUiSettings?.addEventListener('click', closeUiModalHelper);
        btnSaveUiSettings?.addEventListener('click', handleSaveUiSettings);
        btnResetUiDefaults?.addEventListener('click', handleResetUiDefaults);
    }
    // Hjelpefunksjon for å sikre at close kalles med 'true'
    function closeUiModalHelper() { closeUiModal(true); }

    function removeUiModalListeners() {
        console.log("Removing UI modal listeners...");
        uiSettingsModalContent?.removeEventListener('input', handleUiModalInputChange);
        logoUploadInput?.removeEventListener('change', handleLogoUpload);
        btnClearLogo?.removeEventListener('click', handleClearLogo);
        themePresetSelect?.removeEventListener('change', handlePresetChange); // NY: Fjern listener
        // Knappene (fjerning er litt mer vrien for anonyme funksjoner, men vi prøver)
         closeUiSettingsModalButton?.removeEventListener('click', closeUiModalHelper);
         btnCancelUiSettings?.removeEventListener('click', closeUiModalHelper);
         btnSaveUiSettings?.removeEventListener('click', handleSaveUiSettings);
         btnResetUiDefaults?.removeEventListener('click', handleResetUiDefaults);
    }

    // === UI SETTINGS MODAL LOGIC END ===


    // === EDIT PLAYER MODAL LOGIC START ===
    function openEditPlayerModal(playerId) { /* ... (som før) ... */ }
    function closeEditPlayerModal() { /* ... (som før) ... */ }
    function handleSavePlayerChanges() { /* ... (som før) ... */ }
    // === EDIT PLAYER MODAL LOGIC END ===


    // === EVENT LISTENER ATTACHMENT (General) ===
    startPauseButton?.addEventListener('click', () => { /* ... (som før) ... */ });
    prevLevelButton?.addEventListener('click', () => handleAdjustLevel(-1));
    nextLevelButton?.addEventListener('click', () => handleAdjustLevel(1));
    adjustTimeMinusButton?.addEventListener('click', () => handleAdjustTime(-60));
    adjustTimePlusButton?.addEventListener('click', () => handleAdjustTime(60));
    lateRegButton?.addEventListener('click', () => { if(state) handleLateRegClick(state, currentTournamentId, mainCallbacks); });
    endTournamentButton?.addEventListener('click', handleEndTournament);
    btnForceSave?.addEventListener('click', handleForceSave);
    btnBackToMainLive?.addEventListener('click', handleBackToMain);
    btnToggleSound?.addEventListener('click', () => { /* ... (som før) ... */ });
    btnEditTournamentSettings?.addEventListener('click', openTournamentModal);
    btnEditUiSettings?.addEventListener('click', openUiModal); // Kaller nå korrekt funksjon
    btnManageAddons?.addEventListener('click', openAddonModal);

    // Dra-og-slipp listener
    draggableElements.forEach(el => { if (el) { el.addEventListener('mousedown', (e) => startDrag(e, el)); } });

    window.addEventListener('click', (e) => { /* ... (som før, lukker modal ved klikk utenfor) ... */ });

    // --- Listeners for Edit Player Modal Buttons ---
    btnSavePlayerChanges?.addEventListener('click', handleSavePlayerChanges);
    btnCancelPlayerEdit?.addEventListener('click', closeEditPlayerModal);
    closeEditPlayerModalButton?.addEventListener('click', closeEditPlayerModal);
    // --- UI Settings Modal knapp-listeners legges til/fjernes dynamisk ---

    function setupPlayerActionDelegation() { /* ... (som før) ... */ }
    setupPlayerActionDelegation();
    // === EVENT LISTENER ATTACHMENT END ===


    // === INITIAL UI RENDER & TIMER START ===
    console.log("Performing final setup steps...");
    try { /* ... (som før) ... */ } catch (err) { /* ... (som før) ... */ }
    // === INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
