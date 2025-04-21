// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    console.log("Tournament page DOM loaded.");
    // === 02: STATE VARIABLES START ===
    let currentTournamentId = getActiveTournamentId();
    let state = null; // Holds the entire tournament state { config, live }
    let timerInterval = null; // For the main level/break timer
    let realTimeInterval = null; // For the wall clock
    let isModalOpen = false;
    let currentOpenModal = null; // Track which modal is open ('ui' or 'tournament')

    // For UI Modal Revert/Cancel
    let originalThemeBg = '';
    let originalThemeText = '';
    let originalElementLayouts = {};
    let blockSliderUpdates = false; // Prevent infinite loops in color sliders

    // For Tournament Modal Edit
    let editBlindLevelCounter = 0; // Counter for adding rows in modal

    // Standard Payouts (Used in Modals)
    const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // Main page elements (outside canvas, outside modals)
    const currentTimeDisplay = document.getElementById('current-time');
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
    const headerRightControls = document.querySelector('.header-right-controls'); // Controls moved below canvas

    // Canvas Elements (Containers)
    const liveCanvas = document.getElementById('live-canvas');
    const titleElement = document.getElementById('title-element'); // Container for title
    const timerElement = document.getElementById('timer-element');
    const blindsElement = document.getElementById('blinds-element');
    const logoElement = document.getElementById('logo-element');
    const infoElement = document.getElementById('info-element');

    // Specific Display Elements within Canvas Elements
    const nameDisplay = document.getElementById('tournament-name-display'); // The H1 itself
    const timerDisplay = document.getElementById('timer-display');
    const breakInfo = document.getElementById('break-info');
    const currentLevelDisplay = document.getElementById('current-level');
    const blindsDisplay = document.getElementById('blinds-display');
    const logoImg = logoElement?.querySelector('.logo');
    const nextBlindsDisplay = document.getElementById('next-blinds');
    const infoNextPauseParagraph = document.getElementById('info-next-pause'); // The <p> tag
    const averageStackDisplay = document.getElementById('average-stack');
    const playersRemainingDisplay = document.getElementById('players-remaining');
    const totalEntriesDisplay = document.getElementById('total-entries');
    const lateRegStatusDisplay = document.getElementById('late-reg-status');

    // Tournament Settings Modal Refs
    const tournamentSettingsModal = document.getElementById('tournament-settings-modal');
    const closeTournamentModalButton = document.getElementById('close-tournament-modal-button');
    const editBlindStructureBody = document.getElementById('edit-blind-structure-body');
    const btnAddEditLevel = document.getElementById('btn-add-edit-level');
    const editPaidPlacesInput = document.getElementById('edit-paid-places');
    const editPrizeDistTextarea = document.getElementById('edit-prize-distribution');
    const btnGenerateEditPayout = document.getElementById('btn-generate-edit-payout');
    const btnSaveTournamentSettings = document.getElementById('btn-save-tournament-settings');
    const btnCancelTournamentEdit = document.getElementById('btn-cancel-tournament-edit');

    // UI Settings Modal Refs
    const uiSettingsModal = document.getElementById('ui-settings-modal');
    const closeUiModalButton = document.getElementById('close-ui-modal-button');
    // Layout Controls
    const canvasHeightSlider = document.getElementById('canvasHeightSlider'); const canvasHeightInput = document.getElementById('canvasHeightInput');
    const titleXSlider = document.getElementById('titleXSlider'); const titleXInput = document.getElementById('titleXInput');
    const titleYSlider = document.getElementById('titleYSlider'); const titleYInput = document.getElementById('titleYInput');
    const titleWidthSlider = document.getElementById('titleWidthSlider'); const titleWidthInput = document.getElementById('titleWidthInput');
    const titleFontSizeSlider = document.getElementById('titleFontSizeSlider'); const titleFontSizeInput = document.getElementById('titleFontSizeInput');
    const timerXSlider = document.getElementById('timerXSlider'); const timerXInput = document.getElementById('timerXInput');
    const timerYSlider = document.getElementById('timerYSlider'); const timerYInput = document.getElementById('timerYInput');
    const timerWidthSlider = document.getElementById('timerWidthSlider'); const timerWidthInput = document.getElementById('timerWidthInput');
    const timerFontSizeSlider = document.getElementById('timerFontSizeSlider'); const timerFontSizeInput = document.getElementById('timerFontSizeInput');
    const blindsXSlider = document.getElementById('blindsXSlider'); const blindsXInput = document.getElementById('blindsXInput');
    const blindsYSlider = document.getElementById('blindsYSlider'); const blindsYInput = document.getElementById('blindsYInput');
    const blindsWidthSlider = document.getElementById('blindsWidthSlider'); const blindsWidthInput = document.getElementById('blindsWidthInput');
    const blindsFontSizeSlider = document.getElementById('blindsFontSizeSlider'); const blindsFontSizeInput = document.getElementById('blindsFontSizeInput');
    const logoXSlider = document.getElementById('logoXSlider'); const logoXInput = document.getElementById('logoXInput');
    const logoYSlider = document.getElementById('logoYSlider'); const logoYInput = document.getElementById('logoYInput');
    const logoWidthSlider = document.getElementById('logoWidthSlider'); const logoWidthInput = document.getElementById('logoWidthInput');
    const logoHeightSlider = document.getElementById('logoHeightSlider'); const logoHeightInput = document.getElementById('logoHeightInput');
    const infoXSlider = document.getElementById('infoXSlider'); const infoXInput = document.getElementById('infoXInput');
    const infoYSlider = document.getElementById('infoYSlider'); const infoYInput = document.getElementById('infoYInput');
    const infoWidthSlider = document.getElementById('infoWidthSlider'); const infoWidthInput = document.getElementById('infoWidthInput');
    const infoFontSizeSlider = document.getElementById('infoFontSizeSlider'); const infoFontSizeInput = document.getElementById('infoFontSizeInput');
    // Info Toggles
    const toggleInfoNextBlinds = document.getElementById('toggleInfoNextBlinds'); const toggleInfoNextPause = document.getElementById('toggleInfoNextPause'); const toggleInfoAvgStack = document.getElementById('toggleInfoAvgStack'); const toggleInfoPlayers = document.getElementById('toggleInfoPlayers'); const toggleInfoLateReg = document.getElementById('toggleInfoLateReg');
    // Map toggle keys (from layout object) to the actual <p> elements they control
    const infoParagraphs = {
        showNextBlinds: document.getElementById('info-next-blinds'),
        showNextPause: infoNextPauseParagraph, // Use ref defined earlier
        showAvgStack: document.getElementById('info-avg-stack'),
        showPlayers: document.getElementById('info-players'),
        showLateReg: document.getElementById('info-late-reg')
    };
    // Theme Controls
    const bgRedSlider = document.getElementById('bgRedSlider'); const bgGreenSlider = document.getElementById('bgGreenSlider'); const bgBlueSlider = document.getElementById('bgBlueSlider');
    const bgRedInput = document.getElementById('bgRedInput'); const bgGreenInput = document.getElementById('bgGreenInput'); const bgBlueInput = document.getElementById('bgBlueInput');
    const bgColorPreview = document.getElementById('bg-color-preview');
    const textRedSlider = document.getElementById('textRedSlider'); const textGreenSlider = document.getElementById('textGreenSlider'); const textBlueSlider = document.getElementById('textBlueSlider');
    const textRedInput = document.getElementById('textRedInput'); const textGreenInput = document.getElementById('textGreenInput'); const textBlueInput = document.getElementById('textBlueInput');
    const textColorPreview = document.getElementById('text-color-preview');
    const bgHueSlider = document.getElementById('bgHueSlider'); const bgHueInput = document.getElementById('bgHueInput');
    const bgSatSlider = document.getElementById('bgSatSlider'); const bgSatInput = document.getElementById('bgSatInput');
    const bgLigSlider = document.getElementById('bgLigSlider'); const bgLigInput = document.getElementById('bgLigInput');
    const textHueSlider = document.getElementById('textHueSlider'); const textHueInput = document.getElementById('textHueInput');
    const textSatSlider = document.getElementById('textSatSlider'); const textSatInput = document.getElementById('textSatInput');
    const textLigSlider = document.getElementById('textLigSlider'); const textLigInput = document.getElementById('textLigInput');
    const themeFavoritesSelect = document.getElementById('themeFavoritesSelect');
    const btnLoadThemeFavorite = document.getElementById('btnLoadThemeFavorite');
    const newThemeFavoriteNameInput = document.getElementById('newThemeFavoriteName');
    const btnSaveThemeFavorite = document.getElementById('btnSaveThemeFavorite');
    const btnDeleteThemeFavorite = document.getElementById('btnDeleteThemeFavorite');
    // Modal Action Buttons
    const btnSaveUiSettings = document.getElementById('btn-save-ui-settings');
    const btnCancelUiEdit = document.getElementById('btn-cancel-ui-edit');
    const btnResetLayoutTheme = document.getElementById('btnResetLayoutTheme');

    // List of all sliders/inputs/toggles for easy event listener management in UI modal
    const allSliders = [ canvasHeightSlider, titleXSlider, titleYSlider, titleWidthSlider, titleFontSizeSlider, timerXSlider, timerYSlider, timerWidthSlider, timerFontSizeSlider, blindsXSlider, blindsYSlider, blindsWidthSlider, blindsFontSizeSlider, logoXSlider, logoYSlider, logoWidthSlider, logoHeightSlider, infoXSlider, infoYSlider, infoWidthSlider, infoFontSizeSlider, bgHueSlider, bgSatSlider, bgLigSlider, bgRedSlider, bgGreenSlider, bgBlueSlider, textHueSlider, textSatSlider, textLigSlider, textRedSlider, textGreenSlider, textBlueSlider ];
    const allInputs = [ canvasHeightInput, titleXInput, titleYInput, titleWidthInput, titleFontSizeInput, timerXInput, timerYInput, timerWidthInput, timerFontSizeInput, blindsXInput, blindsYInput, blindsWidthInput, blindsFontSizeInput, logoXInput, logoYInput, logoWidthInput, logoHeightInput, infoXInput, infoYInput, infoWidthInput, infoFontSizeInput, bgHueInput, bgSatInput, bgLigInput, bgRedInput, bgGreenInput, bgBlueInput, textHueInput, textSatInput, textLigInput, textRedInput, textGreenInput, textBlueInput ];
    const allInfoToggles = [toggleInfoNextBlinds, toggleInfoNextPause, toggleInfoAvgStack, toggleInfoPlayers, toggleInfoLateReg];
    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    if (!currentTournamentId) {
        alert("Ingen aktiv turnering valgt. Går tilbake til startsiden.");
        window.location.href = 'index.html';
        // Use return to stop further execution if redirecting
        return;
    }

    state = loadTournamentState(currentTournamentId); // Load from storage.js

    if (!state || !state.config || !state.live) {
        alert(`Kunne ikke laste turneringsdata for ID: ${currentTournamentId}. Går tilbake til startsiden.`);
        console.error("Failed to load valid tournament state for ID:", currentTournamentId, state);
        clearActiveTournamentId(); // Clear the invalid ID
        window.location.href = 'index.html';
        return; // Stop execution
    }

    // Ensure essential live properties exist (backward compatibility / robustness)
    state.live = state.live || {};
    state.live.status = state.live.status || 'paused';
    state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0;
    state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (state.config.blindLevels?.[0]?.duration * 60 || 1200);
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

    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, state);
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 04b: THEME & LAYOUT APPLICATION START ===
    function applyThemeAndLayout(bgColor, textColor, elementLayouts) {
        const rootStyle = document.documentElement.style;

        // Apply Theme Colors
        rootStyle.setProperty('--live-page-bg', bgColor);
        rootStyle.setProperty('--live-page-text', textColor);

        // Determine border color based on background brightness
        try {
            const [r, g, b] = parseRgbString(bgColor);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const borderColor = brightness < 128 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
            rootStyle.setProperty('--live-ui-border', borderColor);
        } catch (e) {
            console.error("Error setting border color based on BG:", e);
            rootStyle.setProperty('--live-ui-border', 'rgba(128, 128, 128, 0.15)'); // Fallback
        }

        // Apply Element Layouts from the provided object
        // Use fallback values from DEFAULT_ELEMENT_LAYOUTS if a key is missing
        const defaults = DEFAULT_ELEMENT_LAYOUTS; // Defined in storage.js

        // Canvas Height
        rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas?.height ?? defaults.canvas.height}vh`);

        // Title Element
        const titleLayout = { ...defaults.title, ...(elementLayouts.title || {}) };
        if(titleElement) { // Apply CSS variables directly to the element for positioning/sizing
             titleElement.style.setProperty('--x-pos', `${titleLayout.x}%`);
             titleElement.style.setProperty('--y-pos', `${titleLayout.y}%`);
             titleElement.style.setProperty('--width', `${titleLayout.width}%`);
             titleElement.style.setProperty('--font-size', `${titleLayout.fontSize}em`);
             // Height is auto for title
        }

        // Timer Element
        const timerLayout = { ...defaults.timer, ...(elementLayouts.timer || {}) };
         if(timerElement) {
             timerElement.style.setProperty('--x-pos', `${timerLayout.x}%`);
             timerElement.style.setProperty('--y-pos', `${timerLayout.y}%`);
             timerElement.style.setProperty('--width', `${timerLayout.width}%`);
             timerElement.style.setProperty('--font-size', `${timerLayout.fontSize}em`);
        }

        // Blinds Element
        const blindsLayout = { ...defaults.blinds, ...(elementLayouts.blinds || {}) };
         if(blindsElement) {
             blindsElement.style.setProperty('--x-pos', `${blindsLayout.x}%`);
             blindsElement.style.setProperty('--y-pos', `${blindsLayout.y}%`);
             blindsElement.style.setProperty('--width', `${blindsLayout.width}%`);
             blindsElement.style.setProperty('--font-size', `${blindsLayout.fontSize}em`);
         }

        // Logo Element
        const logoLayout = { ...defaults.logo, ...(elementLayouts.logo || {}) };
         if(logoElement) {
             logoElement.style.setProperty('--x-pos', `${logoLayout.x}%`);
             logoElement.style.setProperty('--y-pos', `${logoLayout.y}%`);
             logoElement.style.setProperty('--width', `${logoLayout.width}%`);
             logoElement.style.setProperty('--height', `${logoLayout.height}%`); // Use height for logo
             logoElement.style.setProperty('--font-size', `1em`); // Reset font-size
        }

        // Info Element
        const infoLayout = { ...defaults.info, ...(elementLayouts.info || {}) };
         if(infoElement) {
             infoElement.style.setProperty('--x-pos', `${infoLayout.x}%`);
             infoElement.style.setProperty('--y-pos', `${infoLayout.y}%`);
             infoElement.style.setProperty('--width', `${infoLayout.width}%`);
             infoElement.style.setProperty('--font-size', `${infoLayout.fontSize}em`);
         }

        // Apply info box visibility toggles based on the layout object
        for (const key in infoParagraphs) {
            if (infoParagraphs[key]) {
                // Use value from layout, fallback to default (true)
                infoParagraphs[key].classList.toggle('hidden', !(infoLayout[key] ?? true));
            }
        }
        // console.log(`Theme/Layout applied: BG=${bgColor}, Text=${textColor}`, elementLayouts);
    }
    // Load and apply initial theme/layout on page load
    const initialBgColor = loadThemeBgColor();
    const initialTextColor = loadThemeTextColor();
    const initialElementLayouts = loadElementLayouts(); // This loads defaults merged with saved data
    applyThemeAndLayout(initialBgColor, initialTextColor, initialElementLayouts);
    // === 04b: THEME & LAYOUT APPLICATION END ===


    // === 05: HELPER FUNCTIONS - FORMATTING START ===
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function formatBlindsHTML(level) {
        if (!level) return `<span class="value">--</span>/<span class="value">--</span><span class="label">A:</span><span class="value">--</span>`;
        let anteHtml = '';
        if (level.ante > 0) {
            anteHtml = `<span class="label">A:</span><span class="value">${level.ante.toLocaleString('nb-NO')}</span>`;
        }
        return `<span class="value">${level.sb.toLocaleString('nb-NO')}</span>/<span class="value">${level.bb.toLocaleString('nb-NO')}</span>${anteHtml}`;
    }

    function formatNextBlindsText(level) {
        if (!level) return "Slutt";
        const anteText = level.ante > 0 ? ` / A:${level.ante.toLocaleString('nb-NO')}` : '';
        return `${level.sb.toLocaleString('nb-NO')}/${level.bb.toLocaleString('nb-NO')}${anteText}`;
    }

    function getPlayerNameById(playerId) {
        const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId);
        return player ? player.name : 'Ukjent';
    }

    // This seems unused now, but keep for potential future use
    function roundToNearestValid(value, step = 100) {
        if (isNaN(value) || value <= 0) return step;
        const rounded = Math.round(value / step) * step;
        return Math.max(step, rounded); // Ensure minimum value
    }
    // === 05: HELPER FUNCTIONS - FORMATTING END ===


    // === 06: HELPER FUNCTIONS - CALCULATIONS START ===
    function calculateTotalChips() {
        const startingChips = (state.live.totalEntries || 0) * (state.config.startStack || 0);
        const rebuyChips = (state.live.totalRebuys || 0) * (state.config.rebuyChips || 0);
        const addonChips = (state.live.totalAddons || 0) * (state.config.addonChips || 0);
        return startingChips + rebuyChips + addonChips;
    }

    function calculateAverageStack() {
        const activePlayerCount = state.live.players.length;
        if (activePlayerCount === 0) return 0;
        const totalChips = calculateTotalChips();
        return Math.round(totalChips / activePlayerCount);
    }

    function calculatePrizes() {
        const prizes = [];
        const paidPlaces = state.config.paidPlaces || 0;
        const distributionPercentages = state.config.prizeDistribution || [];
        const totalPot = state.live.totalPot || 0;

        // Calculate pot available for placement prizes (excluding bounties)
        let prizePot = totalPot;
        if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) {
            prizePot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0);
        }
        prizePot = Math.max(0, prizePot); // Ensure pot is not negative

        if (prizePot <= 0 || paidPlaces <= 0 || distributionPercentages.length !== paidPlaces) {
             console.warn("Cannot calculate prizes. Invalid input:", { prizePot, paidPlaces, distributionPercentages });
            return prizes; // Return empty array if invalid input
        }

        let distributedSum = 0;
        for (let i = 0; i < paidPlaces; i++) {
            const percentage = distributionPercentages[i] || 0;
            let amount;
            // Last place gets the remainder to ensure 100% distribution
            if (i === paidPlaces - 1) {
                amount = Math.max(0, prizePot - distributedSum);
            } else {
                // Round down to avoid exceeding total pot due to rounding errors
                amount = Math.floor((prizePot * percentage) / 100);
            }

            prizes.push({
                place: i + 1,
                amount: amount,
                percentage: percentage
            });
            distributedSum += amount;
        }

         // Optional: Check if rounding caused issues (shouldn't with floor/remainder)
         if (Math.abs(distributedSum - prizePot) > 1 && paidPlaces > 1) { // Allow small tolerance
             console.warn(`Prize calculation warning: Distributed sum (${distributedSum}) doesn't match prize pot (${prizePot}) perfectly.`);
         }

        return prizes;
    }


    function findNextPauseInfo() {
        const currentLevelIndex = state.live.currentLevelIndex;
        const blindLevels = state.config.blindLevels;

        // Start searching from the level *after* the current one
        const searchStartIndex = state.live.isOnBreak ? currentLevelIndex + 1 : currentLevelIndex;

        for (let i = searchStartIndex; i < blindLevels.length; i++) {
            if (blindLevels[i].pauseMinutes > 0) {
                // Found the next pause
                return {
                    level: blindLevels[i].level, // Level *after* which the pause occurs
                    duration: blindLevels[i].pauseMinutes
                };
            }
        }
        return null; // No more pauses found
    }
    // === 06: HELPER FUNCTIONS - CALCULATIONS END ===


    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT START ===
    function assignTableSeat(player, excludeTableNum = null) { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function reassignAllSeats(targetTableNum) { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function checkAndHandleTableBreak() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function balanceTables() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT END ===


    // === 07b: HELPER FUNCTIONS - LOGGING START ===
    function logActivity(logArray, message) {
        // Ensure logArray is initialized if it wasn't
        if (!logArray) {
             console.warn("Activity log array was undefined, initializing.");
             logArray = state.live.activityLog = []; // Initialize in state too
        }
        const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        logArray.unshift({ timestamp, message }); // Add to the beginning

        // Limit log size
        const MAX_LOG_ENTRIES = 100; // Increased limit
        if (logArray.length > MAX_LOG_ENTRIES) {
            logArray.pop(); // Remove the oldest entry
        }
        console.log(`[Log ${timestamp}] ${message}`);
        // Re-rendering happens in updateUI or specific calls
    }

    function renderActivityLog() {
        if (!activityLogUl) return;
        activityLogUl.innerHTML = ''; // Clear existing logs
        const logEntries = state?.live?.activityLog || [];

        if (logEntries.length === 0) {
            activityLogUl.innerHTML = '<li>Loggen er tom.</li>';
            return;
        }

        logEntries.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="log-time">[${entry.timestamp}]</span> ${entry.message}`;
            activityLogUl.appendChild(li);
        });
    }
    // === 07b: HELPER FUNCTIONS - LOGGING END ===


    // === 08: UI UPDATE FUNCTIONS START ===
    function renderPlayerList() {
        if (!playerListUl || !eliminatedPlayerListUl || !activePlayerCountSpan || !eliminatedPlayerCountSpan) {
             console.error("Player list elements not found!");
             return;
        }

        playerListUl.innerHTML = ''; // Clear active list
        eliminatedPlayerListUl.innerHTML = ''; // Clear eliminated list

        const currentLevelNum = state.live.currentLevelIndex + 1;
        const canRebuy = state.config.type === 'rebuy' && currentLevelNum <= state.config.rebuyLevels;
        const canAddon = state.config.type === 'rebuy' && currentLevelNum > state.config.rebuyLevels;
        const canPerformActions = state.live.status !== 'finished';

        // --- Render Active Players ---
        const sortedActivePlayers = [...state.live.players].sort((a, b) =>
            a.table === b.table ? a.seat - b.seat : a.table - b.table
        );

        sortedActivePlayers.forEach(p => {
            const li = document.createElement('li');
            let playerInfoHtml = `${p.name} <span class="player-details">(B${p.table}S${p.seat})</span>`;
            if (p.rebuys > 0) playerInfoHtml += ` <span class="player-details">[${p.rebuys}R]</span>`;
            if (p.addon) playerInfoHtml += ` <span class="player-details">[A]</span>`;
            if (state.config.type === 'knockout' && p.knockouts > 0) playerInfoHtml += ` <span class="player-details">(KOs: ${p.knockouts})</span>`;

            let actionsHtml = '';
            if (canPerformActions) {
                actionsHtml += `<button class="btn-edit-player small-button" data-player-id="${p.id}" title="Rediger Navn">✏️</button>`;
                if (canRebuy) {
                    actionsHtml += `<button class="btn-rebuy small-button" data-player-id="${p.id}" title="Rebuy">R</button>`;
                }
                if (canAddon && !p.addon) { // Only show Addon if available and not yet taken
                    actionsHtml += `<button class="btn-addon small-button" data-player-id="${p.id}" title="Addon">A</button>`;
                }
                actionsHtml += `<button class="btn-eliminate small-button danger-button" data-player-id="${p.id}" title="Eliminer">X</button>`;
            }

            li.innerHTML = `<span class="item-name">${playerInfoHtml}</span><div class="list-actions player-actions">${actionsHtml}</div>`;
            playerListUl.appendChild(li);
        });

        // --- Render Eliminated Players ---
        const sortedEliminatedPlayers = [...state.live.eliminatedPlayers].sort((a, b) =>
            (a.place ?? Infinity) - (b.place ?? Infinity) // Sort by place ascending
        );

        sortedEliminatedPlayers.forEach(p => {
            const li = document.createElement('li');
            let playerInfoHtml = `${p.place ?? '?'}. ${p.name}`;
            if (p.rebuys > 0) playerInfoHtml += ` <span class="player-details">[${p.rebuys}R]</span>`;
            if (p.addon) playerInfoHtml += ` <span class="player-details">[A]</span>`;
            if (state.config.type === 'knockout' && p.knockouts > 0) playerInfoHtml += ` <span class="player-details">(KOs: ${p.knockouts})</span>`;
            if (p.eliminatedBy) playerInfoHtml += ` <span class="player-details">(av ${getPlayerNameById(p.eliminatedBy)})</span>`;

            let actionsHtml = '';
            if (canPerformActions) {
                actionsHtml += `<button class="btn-restore small-button warning-button" data-player-id="${p.id}" title="Gjenopprett">↩️</button>`;
            }

            li.innerHTML = `<span class="item-name">${playerInfoHtml}</span><div class="list-actions player-actions">${actionsHtml}</div>`;
            eliminatedPlayerListUl.appendChild(li);
        });

        // Update counts
        activePlayerCountSpan.textContent = state.live.players.length;
        eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length;

        // Add event listeners to newly created buttons
        playerListUl.querySelectorAll('.btn-edit-player').forEach(btn => btn.onclick = handleEditPlayer);
        playerListUl.querySelectorAll('.btn-rebuy').forEach(btn => btn.onclick = handleRebuy);
        playerListUl.querySelectorAll('.btn-addon').forEach(btn => btn.onclick = handleAddon);
        playerListUl.querySelectorAll('.btn-eliminate').forEach(btn => btn.onclick = handleEliminate);
        eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(btn => btn.onclick = handleRestore);
    }

    function displayPrizes() {
        if (!prizeDisplayLive || !totalPotPrizeSpan) return;

        const prizeData = calculatePrizes(); // Get calculated prize amounts/places
        const totalPotFormatted = (state.live.totalPot || 0).toLocaleString('nb-NO');
        prizeDisplayLive.querySelector('h3').innerHTML = `Premiefordeling (Totalpott: <span id="total-pot">${totalPotFormatted}</span> kr)`; // Update total pot in heading

        // Clear previous prize list/message
        const existingOl = prizeDisplayLive.querySelector('ol');
        const existingP = prizeDisplayLive.querySelector('p');
        if(existingOl) existingOl.remove();
        if(existingP) existingP.remove();

        if (prizeData.length > 0) {
            const ol = document.createElement('ol');
            prizeData.forEach(p => {
                const li = document.createElement('li');
                li.textContent = `${p.place}. Plass: ${p.amount.toLocaleString('nb-NO')} kr (${p.percentage}%)`;
                ol.appendChild(li);
            });
            prizeDisplayLive.appendChild(ol);
            prizeDisplayLive.classList.remove('hidden'); // Show prize section
        } else {
            // Show message if no prizes calculated
            const p = document.createElement('p');
            // Determine why no prizes are shown
             const paidPlaces = state.config.paidPlaces || 0;
             const distributionPercentages = state.config.prizeDistribution || [];
             const totalPot = state.live.totalPot || 0;
             let prizePot = totalPot;
             if (state.config.type === 'knockout') prizePot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0);

             if (prizePot <= 0) {
                 p.textContent = 'Ingen premiepott å fordele (etter evt. bounty).';
             } else if (paidPlaces <= 0) {
                 p.textContent = 'Antall betalte plasser er ikke definert.';
             } else if (distributionPercentages.length !== paidPlaces) {
                 p.textContent = 'Antall premier i fordelingen matcher ikke antall betalte plasser.';
             } else {
                  p.textContent = 'Premiefordeling ikke tilgjengelig (ukjent årsak).';
             }
            prizeDisplayLive.appendChild(p);
            prizeDisplayLive.classList.add('hidden'); // Hide prize section if no prizes
        }
    }

    function updateUI() {
        if (!state || !state.config || !state.live) {
            console.error("State is missing or invalid in updateUI");
            if(nameDisplay) nameDisplay.textContent = "Error: State Missing!";
            return;
        }

        // Update Title (inside titleElement)
        if (nameDisplay) {
             nameDisplay.textContent = state.config.name;
        }

        // Update Real Time Clock
        if(currentTimeDisplay) {
            currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }

        const currentLevelIndex = state.live.currentLevelIndex;
        const currentLevelData = state.config.blindLevels?.[currentLevelIndex];
        const nextLevelData = state.config.blindLevels?.[currentLevelIndex + 1];
        const nextPauseInfo = findNextPauseInfo();

        // Update Timer and Blinds display
        if (state.live.isOnBreak) {
            if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak);
            if(blindsElement) blindsElement.classList.add('hidden');
            if(breakInfo) breakInfo.classList.remove('hidden');
        } else {
            if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel);
            if(blindsElement) blindsElement.classList.remove('hidden');
            if(breakInfo) breakInfo.classList.add('hidden');
            if(currentLevelDisplay) currentLevelDisplay.textContent = `(Nivå ${currentLevelData ? currentLevelData.level : 'N/A'})`;
             if(blindsDisplay) blindsDisplay.innerHTML = formatBlindsHTML(currentLevelData);
        }

        // Update Info Box content (visibility handled by applyThemeAndLayout)
        if(nextBlindsDisplay) nextBlindsDisplay.textContent = formatNextBlindsText(nextLevelData);
        if(averageStackDisplay) averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO');
        if(playersRemainingDisplay) playersRemainingDisplay.textContent = state.live.players.length;
        if(totalEntriesDisplay) totalEntriesDisplay.textContent = state.live.totalEntries;

        const currentLevelNumForLateReg = currentLevelIndex + 1;
        const lateRegStillOpen = currentLevelNumForLateReg <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished';
        if (lateRegStatusDisplay) {
            if (state.config.lateRegLevel > 0) {
                lateRegStatusDisplay.textContent = `${lateRegStillOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`;
            } else { lateRegStatusDisplay.textContent = 'Ikke aktiv'; }
        }
        if (infoNextPauseParagraph) {
            const nextPauseTimeSpan = infoNextPauseParagraph.querySelector('#next-pause-time');
            if (nextPauseTimeSpan) {
                 nextPauseTimeSpan.textContent = nextPauseInfo ? `Etter nivå ${nextPauseInfo.level} (${nextPauseInfo.duration} min)` : 'Ingen flere';
            }
        }

        // Update Button States
        const isFinished = state.live.status === 'finished';
        if(startPauseButton) { startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke'; startPauseButton.disabled = isFinished; }
        if(prevLevelButton) prevLevelButton.disabled = currentLevelIndex <= 0 || isFinished;
        if(nextLevelButton) nextLevelButton.disabled = currentLevelIndex >= state.config.blindLevels.length - 1 || isFinished;
        if(adjustTimeMinusButton) adjustTimeMinusButton.disabled = isFinished;
        if(adjustTimePlusButton) adjustTimePlusButton.disabled = isFinished;
        if(lateRegButton) lateRegButton.disabled = !lateRegStillOpen || isFinished; // || state.live.status === 'paused'; // Keep enabled even if paused?
        if(btnEditTournamentSettings) btnEditTournamentSettings.disabled = isFinished;
        if(endTournamentButton) endTournamentButton.disabled = isFinished;

        // Re-render dynamic lists and displays
        renderPlayerList();
        displayPrizes();
        renderActivityLog();
    }
// === 08: UI UPDATE FUNCTIONS END ===


    // === 09: TIMER LOGIC START ===
    function tick() {
        if (state.live.status !== 'running') return; // Only tick if running

        if (state.live.isOnBreak) {
            // --- Break Timer ---
            state.live.timeRemainingInBreak--;
            if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak);

            if (state.live.timeRemainingInBreak < 0) {
                // Break finished, move to next level
                state.live.isOnBreak = false;
                state.live.currentLevelIndex++;

                if (state.live.currentLevelIndex >= state.config.blindLevels.length) {
                    // End of blind structure
                    logActivity(state.live.activityLog, "Siste pause ferdig. Turneringens blindstruktur er fullført.");
                    finishTournament(); // Or maybe just pause clock? Decide behavior. For now, finish.
                    return;
                }

                const newLevel = state.config.blindLevels[state.live.currentLevelIndex];
                state.live.timeRemainingInLevel = newLevel.duration * 60;
                logActivity(state.live.activityLog, `Pause over. Nivå ${newLevel.level} (${formatBlindsHTML(newLevel)}) starter.`);
                updateUI();
                saveTournamentState(currentTournamentId, state); // Save state change
            } else if (state.live.timeRemainingInBreak % 15 === 0) {
                 // Save periodically during break
                 saveTournamentState(currentTournamentId, state);
            }

        } else {
            // --- Level Timer ---
            state.live.timeRemainingInLevel--;
             if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel);

            if (state.live.timeRemainingInLevel < 0) {
                // Level finished, check for break or next level
                const currentLevel = state.config.blindLevels[state.live.currentLevelIndex];
                const pauseDuration = currentLevel?.pauseMinutes || 0;

                if (pauseDuration > 0) {
                    // Start break
                    state.live.isOnBreak = true;
                    state.live.timeRemainingInBreak = pauseDuration * 60;
                    logActivity(state.live.activityLog, `Nivå ${currentLevel.level} ferdig. Starter ${pauseDuration} min pause.`);
                    updateUI();
                    saveTournamentState(currentTournamentId, state);
                } else {
                    // No break, move directly to next level
                    state.live.currentLevelIndex++;

                    if (state.live.currentLevelIndex >= state.config.blindLevels.length) {
                         logActivity(state.live.activityLog, `Nivå ${currentLevel.level} ferdig. Turneringens blindstruktur er fullført.`);
                        finishTournament(); // End of structure
                        return;
                    }

                    const newLevel = state.config.blindLevels[state.live.currentLevelIndex];
                    state.live.timeRemainingInLevel = newLevel.duration * 60;
                    logActivity(state.live.activityLog, `Nivå ${currentLevel.level} ferdig. Nivå ${newLevel.level} (${formatBlindsHTML(newLevel)}) starter.`);
                    updateUI();
                    saveTournamentState(currentTournamentId, state);
                }
            } else if (state.live.timeRemainingInLevel > 0 && state.live.timeRemainingInLevel % 30 === 0) {
                // Save periodically during level
                saveTournamentState(currentTournamentId, state);
            }
        }
    }

    function startRealTimeClock() {
        if (realTimeInterval) clearInterval(realTimeInterval); // Clear existing if any
        realTimeInterval = setInterval(() => {
            if (currentTimeDisplay) {
                currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
        }, 1000);
    }
    // === 09: TIMER LOGIC END ===


    // === 10: EVENT HANDLERS - CONTROLS START ===
    function handleStartPause() {
        if (state.live.status === 'finished') return;

        if (state.live.status === 'paused') {
            // --- Start Timer ---
            state.live.status = 'running';
            if (!timerInterval) { // Start interval only if not already running
                timerInterval = setInterval(tick, 1000);
            }
            logActivity(state.live.activityLog, "Klokke startet.");
        } else {
            // --- Pause Timer ---
            state.live.status = 'paused';
             // Interval will stop checking status internally, no need to clear here
            logActivity(state.live.activityLog, "Klokke pauset.");
            saveTournamentState(currentTournamentId, state); // Save paused state
        }
        updateUI(); // Update button text etc.
    }

    function handleAdjustTime(deltaSeconds) {
        if (state.live.status === 'finished') return;

        let targetTimeKey = state.live.isOnBreak ? 'timeRemainingInBreak' : 'timeRemainingInLevel';
        let maxTime = Infinity;

        // Set max time if adjusting level time (prevent exceeding level duration)
        if (!state.live.isOnBreak) {
             const currentLevel = state.config.blindLevels[state.live.currentLevelIndex];
             if (currentLevel) {
                 maxTime = currentLevel.duration * 60;
             }
        }

        state.live[targetTimeKey] += deltaSeconds;
        // Clamp between 0 and maxTime
        state.live[targetTimeKey] = Math.max(0, Math.min(state.live[targetTimeKey], maxTime));

        const adjustmentMinutes = deltaSeconds / 60;
        logActivity(state.live.activityLog, `Tid justert ${adjustmentMinutes > 0 ? '+' : ''}${adjustmentMinutes} min.`);

        updateUI(); // Update display immediately
        saveTournamentState(currentTournamentId, state); // Save the change
    }

    function handleAdjustLevel(deltaIndex) {
        if (state.live.status === 'finished') return;

        const newIndex = state.live.currentLevelIndex + deltaIndex;

        // Check if new index is valid
        if (newIndex >= 0 && newIndex < state.config.blindLevels.length) {
            const oldLevelNum = state.config.blindLevels[state.live.currentLevelIndex]?.level || '?';
            const newLevel = state.config.blindLevels[newIndex];

            // Confirmation before changing level
            if (!confirm(`Endre til Nivå ${newLevel.level} (${formatBlindsHTML(newLevel)})? \nKlokken nullstilles for nivået.`)) {
                 return; // User cancelled
            }

            state.live.currentLevelIndex = newIndex;
            state.live.timeRemainingInLevel = newLevel.duration * 60; // Reset time for new level
            state.live.isOnBreak = false; // Ensure not on break
            state.live.timeRemainingInBreak = 0;

            logActivity(state.live.activityLog, `Nivå manuelt endret: ${oldLevelNum} -> ${newLevel.level}. Klokke nullstilt.`);
            updateUI();
            saveTournamentState(currentTournamentId, state);
        } else {
            console.warn("Cannot adjust level: Index out of bounds.", newIndex);
            alert("Kan ikke gå til nivået (første eller siste nivå nådd).");
        }
    }

    function handleEndTournament() {
        if (state.live.status === 'finished') {
            alert("Turneringen er allerede markert som fullført.");
            return;
        }
        if (confirm("Er du sikker på at du vil markere turneringen som fullført?\nDette kan ikke enkelt angres.")) {
            finishTournament();
        }
    }

    function handleForceSave() {
        if (state) {
            console.log("Forcing save...");
            if (saveTournamentState(currentTournamentId, state)) {
                 if(btnForceSave) btnForceSave.textContent = "Lagret!";
                 // Optional: Disable button briefly?
                 setTimeout(() => { if(btnForceSave) btnForceSave.textContent = "Lagre Nå"; }, 1500);
            } else {
                 alert("Lagring feilet!");
            }
        } else {
             console.error("Cannot force save, state is null.");
        }
    }

    function handleBackToMain() {
        // Save current state before leaving, unless finished
        if (state && state.live.status !== 'finished') {
            saveTournamentState(currentTournamentId, state);
            console.log("State saved before returning to main.");
        }
        window.location.href = 'index.html';
    }
    // === 10: EVENT HANDLERS - CONTROLS END ===


    // === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    function handleRebuy(event){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleAddon(event){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleEliminate(event){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleRestore(event){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleEditPlayer(event){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleLateRegClick() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    // === 11: EVENT HANDLERS - PLAYER ACTIONS END ===


    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    function openTournamentModal() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function closeTournamentModal() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function openUiModal() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function closeUiModal(revert = false) { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function addEditBlindLevelRow(levelData={}){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function updateEditLevelNumbers(){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function generateEditPayout(){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function syncRgbFromHsl(typePrefix) { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function syncHslFromRgb(typePrefix) { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function updateColorAndLayoutPreviews() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleThemeLayoutControlChange(e) { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function addThemeAndLayoutListeners(){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function removeThemeAndLayoutListeners(){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function populateThemeFavorites() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function enableDisableDeleteButton(){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleLoadFavorite() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleSaveFavorite() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleDeleteFavorite() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleSaveTournamentSettings(){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleSaveUiSettings(){ /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    function handleResetLayoutTheme() { /* ... (Behold eksisterende funksjon fra forrige svar) ... */ }
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===


    // === 13: TOURNAMENT FINISH LOGIC START ===
    function finishTournament() {
        if (state.live.status === 'finished') return; // Already finished

        console.log("Finishing tournament...");
        logActivity(state.live.activityLog, "Turnering markeres som fullført.");

        // Stop timers
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        if (realTimeInterval) clearInterval(realTimeInterval); // Stop wall clock too? Or let it run? Stop for now.
        realTimeInterval = null;

        // Update state
        state.live.status = 'finished';
        state.live.isOnBreak = false; // Ensure break status is off
        state.live.timeRemainingInLevel = 0; // Reset timers
        state.live.timeRemainingInBreak = 0;

        // Assign final place to the winner if exactly one player remains
        if (state.live.players.length === 1) {
            const winner = state.live.players[0];
            winner.place = 1; // Assign 1st place
            state.live.eliminatedPlayers.push(winner); // Move winner to eliminated list
            state.live.players.splice(0, 1); // Remove from active list
            logActivity(state.live.activityLog, `Vinner: ${winner.name}!`);
            console.log(`Winner declared: ${winner.name}`);
        } else if (state.live.players.length > 1) {
             // Multiple players left - log as potential chop or undecided outcome
             logActivity(state.live.activityLog, `Turnering fullført med ${state.live.players.length} spillere igjen (Deal / Chop?).`);
             console.warn(`Tournament finished with ${state.live.players.length} players remaining.`);
             // Move remaining players to eliminated list without assigning place? Or assign joint place?
             // For simplicity, move them without place for now.
             state.live.players.forEach(p => {
                p.eliminated = true; // Mark as eliminated conceptually
                p.place = null; // No specific place assigned if > 1 left
                state.live.eliminatedPlayers.push(p);
             });
             state.live.players = []; // Clear active players
        } else {
             // No players left active? Log it.
             logActivity(state.live.activityLog, `Turnering fullført uten aktive spillere.`);
             console.warn("Tournament finished with 0 active players.");
        }

        // Sort eliminated list finally by place
        state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));

        // Update UI to reflect finished state (buttons disabled etc.)
        updateUI();
        // Final save
        saveTournamentState(currentTournamentId, state);

        alert("Turneringen er fullført!");
    }
    // === 13: TOURNAMENT FINISH LOGIC END ===


    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    // Ensure all elements exist before adding listeners
    if(startPauseButton) startPauseButton.addEventListener('click', handleStartPause);
    if(prevLevelButton) prevLevelButton.addEventListener('click', () => handleAdjustLevel(-1));
    if(nextLevelButton) nextLevelButton.addEventListener('click', () => handleAdjustLevel(1));
    if(adjustTimeMinusButton) adjustTimeMinusButton.addEventListener('click', () => handleAdjustTime(-60));
    if(adjustTimePlusButton) adjustTimePlusButton.addEventListener('click', () => handleAdjustTime(60));
    if(lateRegButton) lateRegButton.addEventListener('click', handleLateRegClick);
    if(endTournamentButton) endTournamentButton.addEventListener('click', handleEndTournament);
    if(btnForceSave) btnForceSave.addEventListener('click', handleForceSave);
    if(btnBackToMainLive) btnBackToMainLive.addEventListener('click', handleBackToMain);

    // Modal Triggers
    if(btnEditTournamentSettings) btnEditTournamentSettings.addEventListener('click', openTournamentModal);
    if(btnEditUiSettings) btnEditUiSettings.addEventListener('click', openUiModal);

    // Canvas Element Click Triggers (Timer, Blinds, Logo, Info, Title)
    if(liveCanvas) {
        liveCanvas.addEventListener('click', (e) => {
            const clickedElement = e.target.closest('.clickable-element');
            if (clickedElement && isModalOpen === false) { // Only open if no modal is already open
                 console.log("Clicked on canvas element:", clickedElement.id, "Opening UI modal.");
                openUiModal();
                // Optionally scroll/focus the relevant controls in the modal here
                // e.g., const elementId = clickedElement.dataset.elementId; focusElementControls(elementId);
            }
        });
    }

    // Tournament Modal Buttons
    if(closeTournamentModalButton) closeTournamentModalButton.addEventListener('click', closeTournamentModal);
    if(btnCancelTournamentEdit) btnCancelTournamentEdit.addEventListener('click', closeTournamentModal);
    if(btnAddEditLevel) btnAddEditLevel.addEventListener('click', () => addEditBlindLevelRow()); // Add empty row
    if(btnGenerateEditPayout) btnGenerateEditPayout.addEventListener('click', generateEditPayout);
    if(btnSaveTournamentSettings) btnSaveTournamentSettings.addEventListener('click', handleSaveTournamentSettings);

    // UI Modal Buttons
    if(closeUiModalButton) closeUiModalButton.addEventListener('click', () => closeUiModal(true)); // Revert on X click
    if(btnCancelUiEdit) btnCancelUiEdit.addEventListener('click', () => closeUiModal(true)); // Revert on Cancel
    if(btnSaveUiSettings) btnSaveUiSettings.addEventListener('click', handleSaveUiSettings);
    if(btnResetLayoutTheme) btnResetLayoutTheme.addEventListener('click', handleResetLayoutTheme);

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (isModalOpen && currentOpenModal && e.target === currentOpenModal) {
            console.log("Clicked outside modal content.");
            if (currentOpenModal === uiSettingsModal) {
                closeUiModal(true); // Revert UI changes on outside click
            } else if (currentOpenModal === tournamentSettingsModal) {
                closeTournamentModal(); // Just close tournament modal
            }
        }
    });
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===


    // === 15: INITIAL UI RENDER & TIMER START ===
    console.log("Performing initial UI render...");
    updateUI(); // Initial render based on loaded state
    startRealTimeClock(); // Start the wall clock

    if (state.live.status === 'running') {
        console.log("Tournament state is 'running', starting timer interval.");
        timerInterval = setInterval(tick, 1000); // Start level/break timer if already running
    } else if (state.live.status === 'finished') {
        console.log("Tournament state is 'finished'. Final UI state applied.");
        // No timer needed, UI update already handled disabled states.
    } else {
         console.log(`Tournament state is '${state.live.status}'. Timer not started.`);
    }
    console.log("Tournament page fully initialized.");
    // === 15: INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
