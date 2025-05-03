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
    rgbToHsl,
    hslToRgb,
    // Importer lagringsfunksjoner (skal nå være eksportert fra storage.js)
    saveThemeBgColor,
    saveThemeTextColor,
    saveElementLayouts
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
    let currentLogoBlob = null; // Hovedsidens logo blob
    let isModalOpen = false;
    let currentOpenModal = null;

    // Drag & Drop State
    let isDragging = false;
    let draggedElement = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let dragElementId = null; // ID for layout-oppdatering

    // UI Modal spesifikk state
    let modalBgColor = loadThemeBgColor();
    let modalTextColor = loadThemeTextColor();
    let modalLayouts = loadElementLayouts();
    let modalSoundVolume = loadSoundVolume();
    let modalLogoBlob = null; // Blob for preview/nytt bilde i modal
    let modalPreviewLogoUrl = null; // Object URL for modal preview
    let originalSettings = {}; // For å kunne avbryte/resette
    let livePreviewEnabled = true; // Kontroller om endringer i modal skal vises live
    let isUpdatingColorControls = false; // For å hindre HSL/RGB loops

    // Fargeforvalg
    const colorPresets = [
        { name: "Mørk (Standard)", bg: "rgb(65, 65, 65)", text: "rgb(235, 235, 235)" },
        { name: "Lys", bg: "rgb(248, 249, 250)", text: "rgb(33, 37, 41)" },
        { name: "Blå", bg: "rgb(13, 40, 89)", text: "rgb(210, 218, 226)" },
        { name: "Grå/Grønn", bg: "rgb(73, 80, 87)", text: "rgb(160, 210, 170)" }
    ];
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // Generelt
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

    // Canvas elementer
    const liveCanvas = document.getElementById('live-canvas');
    const titleElement = document.getElementById('title-element');
    const timerElement = document.getElementById('timer-element');
    const blindsElement = document.getElementById('blinds-element');
    const logoElement = document.getElementById('logo-element');
    const infoElement = document.getElementById('info-element');
    const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement];

    // Display elementer
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

    // --- UI Settings Modal Elements ---
    const uiSettingsModalContent = uiSettingsModal?.querySelector('.modal-content');
    const closeUiSettingsModalButton = document.getElementById('close-ui-settings-modal-button');
    const btnSaveUiSettings = document.getElementById('btn-save-ui-settings');
    const btnCancelUiSettings = document.getElementById('btn-cancel-ui-settings');
    const btnResetUiDefaults = document.getElementById('btn-reset-ui-defaults');
    const themePresetSelect = document.getElementById('theme-preset-select');
    const bgColorDisplay = document.getElementById('bg-color-preview');
    const textColorDisplay = document.getElementById('text-color-preview');
    const bgColorRedSlider = document.getElementById('bg-color-red');
    const bgColorRedValue = document.getElementById('bg-color-red-value');
    const bgColorGreenSlider = document.getElementById('bg-color-green');
    const bgColorGreenValue = document.getElementById('bg-color-green-value');
    const bgColorBlueSlider = document.getElementById('bg-color-blue');
    const bgColorBlueValue = document.getElementById('bg-color-blue-value');
    const bgColorHueSlider = document.getElementById('bg-color-hue');
    const bgColorHueValue = document.getElementById('bg-color-hue-value');
    const bgColorSaturationSlider = document.getElementById('bg-color-saturation');
    const bgColorSaturationValue = document.getElementById('bg-color-saturation-value');
    const bgColorLightnessSlider = document.getElementById('bg-color-lightness');
    const bgColorLightnessValue = document.getElementById('bg-color-lightness-value');
    const textColorRedSlider = document.getElementById('text-color-red');
    const textColorRedValue = document.getElementById('text-color-red-value');
    const textColorGreenSlider = document.getElementById('text-color-green');
    const textColorGreenValue = document.getElementById('text-color-green-value');
    const textColorBlueSlider = document.getElementById('text-color-blue');
    const textColorBlueValue = document.getElementById('text-color-blue-value');
    const textColorHueSlider = document.getElementById('text-color-hue');
    const textColorHueValue = document.getElementById('text-color-hue-value');
    const textColorSaturationSlider = document.getElementById('text-color-saturation');
    const textColorSaturationValue = document.getElementById('text-color-saturation-value');
    const textColorLightnessSlider = document.getElementById('text-color-lightness');
    const textColorLightnessValue = document.getElementById('text-color-lightness-value');
    const layoutControlContainer = document.getElementById('element-layout-grid');
    const canvasHeightSlider = document.getElementById('canvas-height-slider');
    const canvasHeightValue = document.getElementById('canvas-height-value');
    const layoutControls = {};
    draggableElements.forEach(el => {
        if (!el) return; const id = el.id.replace('-element', '');
        layoutControls[id] = {
            container: document.getElementById(`${id}-layout-controls`), visible: document.getElementById(`${id}-visible-toggle`),
            x: document.getElementById(`${id}-x-slider`), xValue: document.getElementById(`${id}-x-value`),
            y: document.getElementById(`${id}-y-slider`), yValue: document.getElementById(`${id}-y-value`),
            width: document.getElementById(`${id}-width-slider`), widthValue: document.getElementById(`${id}-width-value`),
            height: document.getElementById(`${id}-height-slider`), heightValue: document.getElementById(`${id}-height-value`),
            fontSize: document.getElementById(`${id}-fontsize-slider`), fontSizeValue: document.getElementById(`${id}-fontsize-value`),
        };
        if (id === 'info') { layoutControls.info.showNextBlinds = document.getElementById('info-toggle-nextblinds'); layoutControls.info.showAvgStack = document.getElementById('info-toggle-avgstack'); layoutControls.info.showPlayers = document.getElementById('info-toggle-players'); layoutControls.info.showLateReg = document.getElementById('info-toggle-latereg'); layoutControls.info.showNextPause = document.getElementById('info-toggle-nextpause'); }
    });
    const logoUploadInput = document.getElementById('logo-upload');
    const currentLogoPreview = document.getElementById('current-logo-preview');
    const btnClearLogo = document.getElementById('btn-clear-logo');
    const soundVolumeSlider = document.getElementById('sound-volume-slider');
    const soundVolumeValue = document.getElementById('sound-volume-value');
    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    console.log("Tournament Main: Retrieved active tournament ID:", currentTournamentId);
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); console.error("No active tournament ID found. Redirecting."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig data (ID: ${currentTournamentId}). Sjekk konsollen.`); console.error("Invalid or incomplete state loaded:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    state.live = state.live || {}; state.live.status = state.live.status === 'running' || state.live.status === 'paused' || state.live.status === 'finished' ? state.live.status : 'paused'; state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0;
    if (state.live.currentLevelIndex >= state.config.blindLevels.length) { console.warn(`Loaded currentLevelIndex (${state.live.currentLevelIndex}) out of bounds. Resetting.`); state.live.currentLevelIndex = state.config.blindLevels.length - 1; state.live.status = 'paused'; }
    const currentLevelData = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (currentLevelData?.duration * 60 || 1200); state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.players = state.live.players || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.knockoutLog = state.live.knockoutLog || []; state.live.activityLog = state.live.activityLog || []; state.live.totalPot = state.live.totalPot ?? 0; state.live.totalEntries = state.live.totalEntries ?? 0; state.live.totalRebuys = state.live.totalRebuys ?? 0; state.live.totalAddons = state.live.totalAddons ?? 0; state.live.nextPlayerId = state.live.nextPlayerId || (Math.max(0, ...state.live.players.map(p => p.id), ...state.live.eliminatedPlayers.map(p => p.id)) + 1);
    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, JSON.parse(JSON.stringify(state)));
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 04b: INITIAL THEME, LAYOUT, LOGO APPLICATION ===
    async function applyInitialThemeLayoutAndLogo() {
        console.log("applyInitialThemeLayoutAndLogo: Starting...");
        const bgColor = loadThemeBgColor(); let textColor = loadThemeTextColor();
        if (!textColor || !textColor.startsWith('rgb(') || textColor.split(',').length !== 3) { console.warn(`Invalid textColor loaded: "${textColor}". Falling back to default.`); textColor = DEFAULT_THEME_TEXT; }
        const elementLayouts = loadElementLayouts(); let logoDataBlob = null;
        try { logoDataBlob = await loadLogoBlob(); } catch (err) { console.error("Error loading logo blob:", err); }
        console.log("applyInitialThemeLayoutAndLogo: Data fetched. Applying theme/layout. Logo Blob:", logoDataBlob);
        applyThemeAndLayout(bgColor, textColor, elementLayouts, draggableElements);
        currentLogoBlob = logoDataBlob; updateMainLogoImage(currentLogoBlob, logoImg);
        console.log("applyInitialThemeLayoutAndLogo: Done.");
    }
    try { await applyInitialThemeLayoutAndLogo(); } catch (err) { console.error("CRITICAL Error during initial theme/layout/logo setup:", err); }
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
             winner.place = 1; state.live.eliminatedPlayers.push(winner); state.live.players.splice(0, 1);
             logActivity(state.live.activityLog, `Vinner: ${winner.name}!`);
        } else if (state.live.players.length > 1) {
             logActivity(state.live.activityLog, `Fullført med ${state.live.players.length} spillere igjen (ingen klar vinner definert).`);
             state.live.players.forEach(p => { p.eliminated = true; p.place = null; state.live.eliminatedPlayers.push(p); });
             state.live.players = [];
        } else { logActivity(state.live.activityLog, `Fullført uten aktive spillere igjen.`); }
        state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));
        updateUI(state); saveTournamentState(currentTournamentId, state); alert("Turneringen er fullført!");
    }
    function handleEndTournament() { console.log("handleEndTournament called."); finishTournament(); }
    function handleForceSave() { if(state) { console.log("handleForceSave"); saveTournamentState(currentTournamentId, state); alert('Turnering lagret!');} else {console.warn("handleForceSave: State not available.")} }
    function handleBackToMain() { console.log("handleBackToMain"); if (state && state.live.status !== 'finished') { saveTournamentState(currentTournamentId, state); } window.location.href = 'index.html'; }
    function openTournamentModal() { console.log("TEMP openTournamentModal"); alert("Funksjon for redigering av turneringsregler er ikke implementert ennå."); }
    function openAddonModal() { console.log("TEMP openAddonModal"); alert("Funksjon for add-ons er ikke implementert ennå."); }
    // === MIDLERTIDIGE / TODO FUNKSJONER SLUTT ===


    // === DRAG AND DROP LOGIC START ===
    function startDrag(event, element) {
        if (!element || !element.classList.contains('draggable-element')) return;
        if (event.target.closest('button, input, select, textarea, a')) return;

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

        newXPercent = Math.max(0, Math.min(newXPercent, 100));
        newYPercent = Math.max(0, Math.min(newYPercent, 100));

        draggedElement.style.left = `${newXPercent}%`;
        draggedElement.style.top = `${newYPercent}%`;

        if (isModalOpen && currentOpenModal === uiSettingsModal && modalLayouts[dragElementId]) {
             const xFixed = parseFloat(newXPercent.toFixed(1));
             const yFixed = parseFloat(newYPercent.toFixed(1));
             modalLayouts[dragElementId].x = xFixed;
             modalLayouts[dragElementId].y = yFixed;

             const controls = layoutControls[dragElementId];
             if(controls?.x) controls.x.value = xFixed;
             if(controls?.xValue) controls.xValue.textContent = xFixed;
             if(controls?.y) controls.y.value = yFixed;
             if(controls?.yValue) controls.yValue.textContent = yFixed;
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

        if (isModalOpen && currentOpenModal === uiSettingsModal && modalLayouts[dragElementId]) {
             modalLayouts[dragElementId].x = parseFloat(finalX.toFixed(1));
             modalLayouts[dragElementId].y = parseFloat(finalY.toFixed(1));
             console.log(`Final position for ${dragElementId} saved to modalLayouts: X=${modalLayouts[dragElementId].x}, Y=${modalLayouts[dragElementId].y}`);
        } else {
            // Consider direct save if needed
        }
        draggedElement = null; dragElementId = null;
    }
    // === DRAG AND DROP LOGIC END ===


    // === CALLBACKS ===
     const mainCallbacks = {
        updateUI: () => { if (state) updateUI(state); }, saveState: () => { if (state) saveTournamentState(currentTournamentId, state); }, playSound: null, finishTournament: finishTournament, logActivity: (msg) => { if (state) logActivity(state.live.activityLog, msg); }, checkAndHandleTableBreak: () => { if (state) return checkAndHandleTableBreak(state, currentTournamentId, mainCallbacks); else return false; }, assignTableSeat: (player, excludeTableNum) => { if (state) assignTableSeat(player, state, excludeTableNum); }
    };
    // === END CALLBACKS ===


    // === UI SETTINGS MODAL LOGIC START ===

    function updateAllColorControls(rgbString, prefix) {
        if (isUpdatingColorControls) return;
        isUpdatingColorControls = true;
        try {
            const [r, g, b] = parseRgbString(rgbString);
            const hsl = rgbToHsl(r, g, b);

            const rSlider = document.getElementById(`${prefix}-color-red`); if (rSlider) rSlider.value = r;
            const rValueInput = document.getElementById(`${prefix}-color-red-value`); if (rValueInput) rValueInput.value = r;
            const gSlider = document.getElementById(`${prefix}-color-green`); if (gSlider) gSlider.value = g;
            const gValueInput = document.getElementById(`${prefix}-color-green-value`); if (gValueInput) gValueInput.value = g;
            const bSlider = document.getElementById(`${prefix}-color-blue`); if (bSlider) bSlider.value = b;
            const bValueInput = document.getElementById(`${prefix}-color-blue-value`); if (bValueInput) bValueInput.value = b;

            const hSlider = document.getElementById(`${prefix}-color-hue`); if (hSlider) hSlider.value = hsl.h;
            const hValueInput = document.getElementById(`${prefix}-color-hue-value`); if (hValueInput) hValueInput.value = hsl.h;
            const sSlider = document.getElementById(`${prefix}-color-saturation`); if (sSlider) sSlider.value = hsl.s;
            const sValueInput = document.getElementById(`${prefix}-color-saturation-value`); if (sValueInput) sValueInput.value = hsl.s;
            const lSlider = document.getElementById(`${prefix}-color-lightness`); if (lSlider) lSlider.value = hsl.l;
            const lValueInput = document.getElementById(`${prefix}-color-lightness-value`); if (lValueInput) lValueInput.value = hsl.l;

            const previewBox = document.getElementById(`${prefix}-color-preview`);
            if (previewBox) {
                if (prefix === 'bg') previewBox.style.backgroundColor = rgbString;
                else if (prefix === 'text') (previewBox.querySelector('span') || previewBox).style.color = rgbString;
            }
        } catch (e) { console.error(`Error updating all color controls for ${prefix}:`, e); }
        finally { isUpdatingColorControls = false; }
    }


    async function populateUiSettingsModal() {
        console.log("Populating UI Settings Modal...");
        let loadedLayouts = loadElementLayouts();
        if (!loadedLayouts || typeof loadedLayouts !== 'object') { console.warn("Invalid layouts loaded, falling back to default.", loadedLayouts); loadedLayouts = JSON.parse(JSON.stringify(DEFAULT_ELEMENT_LAYOUTS)); }
        else { loadedLayouts = { ...DEFAULT_ELEMENT_LAYOUTS, ...loadedLayouts }; for(const key in DEFAULT_ELEMENT_LAYOUTS) { if(typeof DEFAULT_ELEMENT_LAYOUTS[key] === 'object' && DEFAULT_ELEMENT_LAYOUTS[key] !== null) { loadedLayouts[key] = {...DEFAULT_ELEMENT_LAYOUTS[key], ...(loadedLayouts[key] || {})}; } } }

        originalSettings = { bgColor: loadThemeBgColor(), textColor: loadThemeTextColor(), layouts: JSON.parse(JSON.stringify(loadedLayouts)), volume: loadSoundVolume(), logo: currentLogoBlob };
        modalLogoBlob = null;

        if (themePresetSelect) { themePresetSelect.innerHTML = '<option value="">-- Velg forhåndsvalg --</option>'; colorPresets.forEach((preset, index) => { const option = document.createElement('option'); option.value = index.toString(); option.textContent = preset.name; themePresetSelect.appendChild(option); }); }

        let validTextColor = DEFAULT_THEME_TEXT; if (originalSettings.textColor && originalSettings.textColor.startsWith('rgb(') && originalSettings.textColor.split(',').length === 3) validTextColor = originalSettings.textColor; else console.warn(`PopulateModal: Invalid original textColor "${originalSettings.textColor}". Using default.`);
        updateAllColorControls(originalSettings.bgColor, 'bg'); updateAllColorControls(validTextColor, 'text');

        const currentLayouts = originalSettings.layouts;
        if (currentLayouts.canvas && canvasHeightSlider && canvasHeightValue) { canvasHeightSlider.value = currentLayouts.canvas.height ?? 65; canvasHeightValue.textContent = canvasHeightSlider.value; } else { console.warn("Canvas height controls missing."); }
        for (const elementId in layoutControls) {
             const controls = layoutControls[elementId]; const layout = currentLayouts[elementId] || DEFAULT_ELEMENT_LAYOUTS[elementId] || {}; if (!controls) { console.warn(`Layout controls object for '${elementId}' missing.`); continue; }
             if (controls.visible) controls.visible.checked = layout.isVisible ?? true;
             if (controls.x && controls.xValue) { controls.x.value = layout.x ?? 0; controls.xValue.textContent = parseFloat(controls.x.value).toFixed(1); }
             if (controls.y && controls.yValue) { controls.y.value = layout.y ?? 0; controls.yValue.textContent = parseFloat(controls.y.value).toFixed(1); }
             if (controls.width && controls.widthValue) { controls.width.value = layout.width ?? 50; controls.widthValue.textContent = controls.width.value; }
             const heightParent = controls.height?.parentElement; if (elementId === 'logo' && controls.height && controls.heightValue) { if(heightParent) heightParent.style.display = ''; controls.height.value = layout.height ?? 30; controls.heightValue.textContent = controls.height.value; } else if (heightParent) { heightParent.style.display = 'none'; }
             const fontParent = controls.fontSize?.parentElement; if (elementId !== 'logo' && controls.fontSize && controls.fontSizeValue) { if(fontParent) fontParent.style.display = ''; controls.fontSize.value = layout.fontSize ?? 1; controls.fontSizeValue.textContent = parseFloat(controls.fontSize.value).toFixed(1); } else if (fontParent) { fontParent.style.display = 'none'; }
             if (elementId === 'info' && layout) { if(controls.showNextBlinds) controls.showNextBlinds.checked = layout.showNextBlinds ?? true; if(controls.showAvgStack) controls.showAvgStack.checked = layout.showAvgStack ?? true; if(controls.showPlayers) controls.showPlayers.checked = layout.showPlayers ?? true; if(controls.showLateReg) controls.showLateReg.checked = layout.showLateReg ?? true; if(controls.showNextPause) controls.showNextPause.checked = layout.showNextPause ?? true; }
         }

        if (currentLogoPreview && logoUploadInput) { revokeObjectUrl(modalPreviewLogoUrl); if (originalSettings.logo) { modalPreviewLogoUrl = URL.createObjectURL(originalSettings.logo); currentLogoPreview.src = modalPreviewLogoUrl; currentLogoPreview.style.display = 'block'; if(btnClearLogo) btnClearLogo.disabled = false; } else { currentLogoPreview.src = '#'; currentLogoPreview.style.display = 'none'; if(btnClearLogo) btnClearLogo.disabled = true; modalPreviewLogoUrl = null; } logoUploadInput.value = ''; } else { console.warn("Logo controls missing."); }
        if(soundVolumeSlider && soundVolumeValue) { soundVolumeSlider.value = originalSettings.volume; soundVolumeValue.textContent = Math.round(originalSettings.volume * 100); } else { console.warn("Sound volume controls missing."); }
        console.log("UI Settings Modal populated.");
    }

    async function openUiModal() { if (!uiSettingsModal) { console.error("UI Settings Modal element not found!"); alert("Kunne ikke åpne utseende-innstillinger."); return; } console.log("Opening UI Settings Modal..."); await populateUiSettingsModal(); addUiModalListeners(); uiSettingsModal.classList.remove('hidden'); currentOpenModal = uiSettingsModal; isModalOpen = true; }
    function closeUiModal(revertChanges = false) { if (!isModalOpen || currentOpenModal !== uiSettingsModal) return; if (uiSettingsModal) uiSettingsModal.classList.add('hidden'); currentOpenModal = null; isModalOpen = false; removeUiModalListeners(); revokeObjectUrl(modalPreviewLogoUrl); modalPreviewLogoUrl = null; modalLogoBlob = null; if (revertChanges && livePreviewEnabled) { console.log("Reverting live preview to original settings..."); applyThemeAndLayout(originalSettings.bgColor, originalSettings.textColor, originalSettings.layouts, draggableElements); updateMainLogoImage(originalSettings.logo, logoImg); } console.log("UI Settings Modal closed."); }

    function handleUiModalInputChange(event) {
        if (!event.target || !isModalOpen || currentOpenModal !== uiSettingsModal || isUpdatingColorControls) return;
        const target = event.target; const value = (target.type === 'checkbox') ? target.checked : target.value; const id = target.id;
        if (id.includes('-color-')) {
            const prefix = id.startsWith('bg-') ? 'bg' : 'text'; let newRgbColor = '';
             if (target.type === 'number' && (id.includes('-red-value') || id.includes('-green-value') || id.includes('-blue-value'))) { const r = parseInt(document.getElementById(`${prefix}-color-red-value`).value); const g = parseInt(document.getElementById(`${prefix}-color-green-value`).value); const b = parseInt(document.getElementById(`${prefix}-color-blue-value`).value); newRgbColor = `rgb(${r}, ${g}, ${b})`; }
             else if (target.type === 'number' && (id.includes('-hue-value') || id.includes('-saturation-value') || id.includes('-lightness-value'))) { const h = parseInt(document.getElementById(`${prefix}-color-hue-value`).value); const s = parseInt(document.getElementById(`${prefix}-color-saturation-value`).value); const l = parseInt(document.getElementById(`${prefix}-color-lightness-value`).value); newRgbColor = hslToRgb(h, s, l); }
             else if (id.includes('-hue') || id.includes('-saturation') || id.includes('-lightness')) { const h = parseInt(document.getElementById(`${prefix}-color-hue`).value); const s = parseInt(document.getElementById(`${prefix}-color-saturation`).value); const l = parseInt(document.getElementById(`${prefix}-color-lightness`).value); newRgbColor = hslToRgb(h, s, l); }
             else { const r = parseInt(document.getElementById(`${prefix}-color-red`).value); const g = parseInt(document.getElementById(`${prefix}-color-green`).value); const b = parseInt(document.getElementById(`${prefix}-color-blue`).value); newRgbColor = `rgb(${r}, ${g}, ${b})`; }
            if (prefix === 'bg') modalBgColor = newRgbColor; else modalTextColor = newRgbColor;
            updateAllColorControls(newRgbColor, prefix);
        } else {
            updateModalState(id, value); const valueSpanId = `${id}-value`; const valueSpan = document.getElementById(valueSpanId);
            if (valueSpan && target.type === 'range') { if (id.includes('-fontsize') || id.includes('-x') || id.includes('-y')) valueSpan.textContent = parseFloat(value).toFixed(1); else valueSpan.textContent = value; }
            if (id === 'sound-volume-slider' && soundVolumeValue) soundVolumeValue.textContent = Math.round(value * 100);
        }
        if (livePreviewEnabled) applyModalChangesToLiveView();
    }

    function updateModalState(controlId, value) { if (controlId === 'sound-volume-slider') modalSoundVolume = parseFloat(value); else if (controlId === 'canvas-height-slider') { if (!modalLayouts.canvas) modalLayouts.canvas = {}; modalLayouts.canvas.height = parseInt(value); } else { const parts = controlId.split('-'); const elementId = parts[0]; const propertyOrAction = parts[1]; const controlType = parts.slice(2).join('-'); if (!modalLayouts[elementId]) modalLayouts[elementId] = {}; if (propertyOrAction === 'visible') modalLayouts[elementId].isVisible = value; else if (['x', 'y', 'width', 'height'].includes(propertyOrAction)) modalLayouts[elementId][propertyOrAction] = parseFloat(value); else if (propertyOrAction === 'fontsize') modalLayouts[elementId].fontSize = parseFloat(value); else if (elementId === 'info' && propertyOrAction === 'toggle') { const infoProp = controlType.startsWith('show') ? controlType : `show${controlType.charAt(0).toUpperCase() + controlType.slice(1)}`; if (!modalLayouts.info) modalLayouts.info = {}; modalLayouts.info[infoProp] = value; } } }
    function applyModalChangesToLiveView() { applyThemeAndLayout(modalBgColor, modalTextColor, modalLayouts, draggableElements); }
    async function handleLogoUpload(event) { const file = event.target.files?.[0]; if (!file) return; console.log("Logo file selected:", file.name); if (!file.type.startsWith('image/')) { alert("Vennligst velg en bildefil."); return; } modalLogoBlob = file; revokeObjectUrl(modalPreviewLogoUrl); modalPreviewLogoUrl = URL.createObjectURL(modalLogoBlob); if (currentLogoPreview) { currentLogoPreview.src = modalPreviewLogoUrl; currentLogoPreview.style.display = 'block'; } if (btnClearLogo) btnClearLogo.disabled = false; if (livePreviewEnabled) updateMainLogoImage(modalLogoBlob, logoImg); }
    async function handleClearLogo() { if (!confirm("Fjerne egendefinert logo?")) return; modalLogoBlob = null; revokeObjectUrl(modalPreviewLogoUrl); modalPreviewLogoUrl = null; if (currentLogoPreview) { currentLogoPreview.src = '#'; currentLogoPreview.style.display = 'none'; } if (btnClearLogo) btnClearLogo.disabled = true; if (logoUploadInput) logoUploadInput.value = ''; if (livePreviewEnabled) updateMainLogoImage(null, logoImg); console.log("Logo marked for clearing."); }
    function handlePresetChange(event) { const selectedIndex = parseInt(event.target.value); if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= colorPresets.length) { event.target.value = ""; return; } const preset = colorPresets[selectedIndex]; console.log("Preset selected:", preset.name); modalBgColor = preset.bg; modalTextColor = preset.text; updateAllColorControls(modalBgColor, 'bg'); updateAllColorControls(modalTextColor, 'text'); if (livePreviewEnabled) applyModalChangesToLiveView(); event.target.value = ""; }

    async function handleSaveUiSettings() {
         console.log("--- handleSaveUiSettings CALLED ---");
         try {
             if(typeof saveThemeBgColor !== 'function') throw new Error("saveThemeBgColor is not available"); saveThemeBgColor(modalBgColor);
             if(typeof saveThemeTextColor !== 'function') throw new Error("saveThemeTextColor is not available"); saveThemeTextColor(modalTextColor);
             if(typeof saveElementLayouts !== 'function') throw new Error("saveElementLayouts is not available"); saveElementLayouts(modalLayouts);
             if(typeof saveSoundVolume !== 'function') throw new Error("saveSoundVolume is not available"); saveSoundVolume(modalSoundVolume);
             if (modalLogoBlob === null && originalSettings.logo !== null) { if(typeof clearLogoBlob !== 'function') throw new Error("clearLogoBlob is not available"); await clearLogoBlob(); currentLogoBlob = null; console.log("Custom logo cleared."); }
             else if (modalLogoBlob instanceof Blob) { if(typeof saveLogoBlob !== 'function') throw new Error("saveLogoBlob is not available"); await saveLogoBlob(modalLogoBlob); currentLogoBlob = modalLogoBlob; console.log("New custom logo saved."); }
             logActivity(state?.live?.activityLog, "Utseende-innstillinger lagret.");
             alert("Innstillinger lagret!");
             closeUiModal(false);
             applyThemeAndLayout(modalBgColor, modalTextColor, modalLayouts, draggableElements);
             updateMainLogoImage(currentLogoBlob, logoImg);
         } catch (error) { console.error("Error saving UI settings:", error); alert(`Kunne ikke lagre innstillingene: ${error.message}`); }
    }

    function handleResetUiDefaults() { if (!confirm("Tilbakestille alle utseende-innstillinger til standard?")) return; console.log("Resetting UI to defaults..."); modalBgColor = DEFAULT_THEME_BG; modalTextColor = DEFAULT_THEME_TEXT; modalLayouts = JSON.parse(JSON.stringify(DEFAULT_ELEMENT_LAYOUTS)); modalSoundVolume = loadSoundVolume(); modalLogoBlob = null; populateUiSettingsModal(); if (livePreviewEnabled) { applyModalChangesToLiveView(); updateMainLogoImage(null, logoImg); } console.log("Modal state reset to defaults and controls updated."); }

    const closeUiModalAndRevert = () => closeUiModal(true);
    function addUiModalListeners() { console.log("Adding UI modal listeners..."); uiSettingsModalContent?.addEventListener('input', handleUiModalInputChange); logoUploadInput?.addEventListener('change', handleLogoUpload); btnClearLogo?.addEventListener('click', handleClearLogo); themePresetSelect?.addEventListener('change', handlePresetChange); closeUiSettingsModalButton?.addEventListener('click', closeUiModalAndRevert); btnCancelUiSettings?.addEventListener('click', closeUiModalAndRevert); btnSaveUiSettings?.addEventListener('click', handleSaveUiSettings); btnResetUiDefaults?.addEventListener('click', handleResetUiDefaults); }
    function removeUiModalListeners() { console.log("Removing UI modal listeners..."); uiSettingsModalContent?.removeEventListener('input', handleUiModalInputChange); logoUploadInput?.removeEventListener('change', handleLogoUpload); btnClearLogo?.removeEventListener('click', handleClearLogo); themePresetSelect?.removeEventListener('change', handlePresetChange); closeUiSettingsModalButton?.removeEventListener('click', closeUiModalAndRevert); btnCancelUiSettings?.removeEventListener('click', closeUiModalAndRevert); btnSaveUiSettings?.removeEventListener('click', handleSaveUiSettings); btnResetUiDefaults?.removeEventListener('click', handleResetUiDefaults); }
    // === UI SETTINGS MODAL LOGIC END ===


    // === EDIT PLAYER MODAL LOGIC START ===
    function openEditPlayerModal(playerId) { if (!state) return; console.log("Attempting to open edit modal for player ID:", playerId); const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId); if (!player) { console.error("Player not found for editing:", playerId); alert("Fant ikke spilleren som skal redigeres."); return; } if (!editPlayerModal || !editPlayerIdInput || !editPlayerNameDisplay || !editPlayerNameInput || !editPlayerRebuysInput || !editPlayerAddonCheckbox) { console.error("Edit Player Modal DOM elements not found!"); alert("En feil oppstod ved åpning av redigeringsvinduet."); return; } editPlayerIdInput.value = player.id; editPlayerNameDisplay.textContent = player.name; editPlayerNameInput.value = player.name; editPlayerRebuysInput.value = player.rebuys || 0; editPlayerAddonCheckbox.checked = player.addon || false; editPlayerAddonCheckbox.disabled = state.config.type !== 'rebuy'; editPlayerAddonCheckbox.parentElement.title = state.config.type !== 'rebuy' ? "Kun for Rebuy-turneringer." : ""; editPlayerRebuysInput.disabled = (state.config.type !== 'rebuy'); editPlayerModal.classList.remove('hidden'); currentOpenModal = editPlayerModal; isModalOpen = true; console.log("Edit Player Modal opened for:", player.name); }
    function closeEditPlayerModal() { if (editPlayerModal) editPlayerModal.classList.add('hidden'); currentOpenModal = null; isModalOpen = false; console.log("Edit Player Modal closed."); }
    function handleSavePlayerChanges() { if (!state) return; const playerId = Number(editPlayerIdInput.value); const newName = editPlayerNameInput.value.trim(); const newRebuys = parseInt(editPlayerRebuysInput.value) || 0; const newAddon = editPlayerAddonCheckbox.checked; if (!playerId || !newName) { alert("Spiller-ID eller navn mangler."); return; } if (newRebuys < 0) { alert("Antall rebuys kan ikke være negativt."); return; } console.log(`Saving changes for player ID: ${playerId}. New data: Name=${newName}, Rebuys=${newRebuys}, Addon=${newAddon}`); let player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId); if (!player) { console.error("Player to save not found:", playerId); alert("En feil oppstod: Fant ikke spilleren som skulle lagres."); return; } let potAdjustment = 0; let entryAdjustment = 0; let rebuyCountAdjustment = 0; let addonCountAdjustment = 0; const oldRebuys = player.rebuys || 0; if (newRebuys !== oldRebuys && state.config.type === 'rebuy') { rebuyCountAdjustment = newRebuys - oldRebuys; potAdjustment += rebuyCountAdjustment * (state.config.rebuyCost || 0); entryAdjustment += rebuyCountAdjustment; } const oldAddon = player.addon || false; if (newAddon !== oldAddon && state.config.type === 'rebuy') { addonCountAdjustment = newAddon ? 1 : -1; potAdjustment += addonCountAdjustment * (state.config.addonCost || 0); entryAdjustment += addonCountAdjustment; } const oldName = player.name; player.name = newName; player.rebuys = newRebuys; player.addon = newAddon; state.live.totalPot += potAdjustment; state.live.totalEntries += entryAdjustment; state.live.totalRebuys += rebuyCountAdjustment; state.live.totalAddons += addonCountAdjustment; let logMessage = `Spiller ${playerId} (${oldName}) redigert: `; const changes = []; if (oldName !== newName) changes.push(`Navn -> "${newName}"`); if (rebuyCountAdjustment !== 0) changes.push(`Rebuys ${oldRebuys}->${newRebuys}`); if (addonCountAdjustment !== 0) changes.push(`Addon ${newAddon?'lagt til':'fjernet'}`); if (potAdjustment !== 0 || entryAdjustment !== 0) changes.push(`(Pott ${potAdjustment > 0 ? '+' : ''}${potAdjustment}, Entries ${entryAdjustment > 0 ? '+' : ''}${entryAdjustment})`); if (changes.length > 0) { logActivity(state.live.activityLog, logMessage + changes.join(', ') + '.'); } else { logActivity(state.live.activityLog, `Ingen endringer lagret for ${newName} (ID: ${playerId}).`); } closeEditPlayerModal(); updateUI(state); saveTournamentState(currentTournamentId, state); console.log("Player changes saved and UI updated."); }
    // === EDIT PLAYER MODAL LOGIC END ===


    // === EVENT LISTENER ATTACHMENT (General) ===
    startPauseButton?.addEventListener('click', () => { if (!state) return; console.log("Start/Pause Button Clicked. Current Status:", state.live.status); if (state.live.status === 'paused') { state.live.status = 'running'; startMainTimer(state, currentTournamentId, mainCallbacks); logActivity(state.live.activityLog, "Klokke startet."); updateUI(state); } else if (state.live.status === 'running') { state.live.status = 'paused'; stopMainTimer(); logActivity(state.live.activityLog, "Klokke pauset."); saveTournamentState(currentTournamentId, state); updateUI(state); } else { console.log("Start/Pause button ignored, status is 'finished'."); } });
    prevLevelButton?.addEventListener('click', () => handleAdjustLevel(-1));
    nextLevelButton?.addEventListener('click', () => handleAdjustLevel(1));
    adjustTimeMinusButton?.addEventListener('click', () => handleAdjustTime(-60));
    adjustTimePlusButton?.addEventListener('click', () => handleAdjustTime(60));
    lateRegButton?.addEventListener('click', () => { if(state) handleLateRegClick(state, currentTournamentId, mainCallbacks); });
    endTournamentButton?.addEventListener('click', handleEndTournament);
    btnForceSave?.addEventListener('click', handleForceSave);
    btnBackToMainLive?.addEventListener('click', handleBackToMain);
    btnToggleSound?.addEventListener('click', () => { console.log("btnToggleSound clicked."); soundsEnabled = !soundsEnabled; saveSoundPreference(soundsEnabled); updateSoundToggleVisuals(soundsEnabled); if (state) logActivity(state.live.activityLog, `Lyd ${soundsEnabled ? 'PÅ' : 'AV'}.`); });
    btnEditTournamentSettings?.addEventListener('click', openTournamentModal);
    btnEditUiSettings?.addEventListener('click', openUiModal);
    btnManageAddons?.addEventListener('click', openAddonModal);
    draggableElements.forEach(el => { if (el) { el.addEventListener('mousedown', (e) => startDrag(e, el)); } });
    window.addEventListener('click', (e) => { if (isModalOpen && currentOpenModal && e.target === currentOpenModal) { console.log("Clicked outside modal content."); if (currentOpenModal === editPlayerModal) closeEditPlayerModal(); else if (currentOpenModal === uiSettingsModal) closeUiModal(true); } });
    btnSavePlayerChanges?.addEventListener('click', handleSavePlayerChanges);
    btnCancelPlayerEdit?.addEventListener('click', closeEditPlayerModal);
    closeEditPlayerModalButton?.addEventListener('click', closeEditPlayerModal);
    // UI Modal knapp-listeners legges nå til/fjernes dynamisk

    function setupPlayerActionDelegation() { const handleActions = (event) => { if (!state) return; const button = event.target.closest('button'); if (!button) return; const action = Array.from(button.classList).find(cls => cls.startsWith('btn-')); if (!action) return; const playerId = Number(button.dataset.playerId); if (action === 'btn-edit-player') { if (!playerId || isNaN(playerId)) { console.warn("Invalid player ID for edit action", button); return; } console.log(`Delegated action: ${action} for player ID: ${playerId}`); openEditPlayerModal(playerId); } else { if (!playerId || isNaN(playerId)) { console.warn("Invalid player ID for action", action, button); return; } console.log(`Delegated action: ${action} for player ID: ${playerId}`); switch (action) { case 'btn-rebuy': handleRebuy(event, state, currentTournamentId, mainCallbacks); break; case 'btn-eliminate': handleEliminate(event, state, currentTournamentId, mainCallbacks); break; case 'btn-restore': handleRestore(event, state, currentTournamentId, mainCallbacks); break; } } }; playerListUl?.addEventListener('click', handleActions); eliminatedPlayerListUl?.addEventListener('click', handleActions); console.log("Player action delegation listeners added."); }
    setupPlayerActionDelegation();
    // === EVENT LISTENER ATTACHMENT END ===


    // === INITIAL UI RENDER & TIMER START ===
    console.log("Performing final setup steps...");
    try { if (!state) { throw new Error("State is not initialized, cannot proceed with final setup."); } updateUI(state); startRealTimeClock(currentTimeDisplay); console.log(`Final check: Current state status is '${state.live.status}'`); if (state.live.status === 'running') { console.log("State is 'running', attempting to start main timer."); startMainTimer(state, currentTournamentId, mainCallbacks); } else { console.log(`State is '${state.live.status}'. Main timer will not be started automatically.`); stopMainTimer(); } console.log("Tournament page fully initialized and ready."); } catch (err) { console.error("Error during final setup or UI update:", err); alert("En alvorlig feil oppstod under lasting av turneringssiden. Sjekk konsollen.\n" + err.message); }
    // === INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
