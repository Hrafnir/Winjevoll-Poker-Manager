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
        return; // Use return to stop further execution if redirecting
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
    // Make sure blindLevels array exists and has entries before accessing duration
    if (!state.config.blindLevels || state.config.blindLevels.length === 0) {
         console.error("CRITICAL: Tournament config has no blind levels defined!");
         // Handle this fatal error - maybe redirect or show permanent error message
         alert("Feil: Turneringen mangler blindstruktur!");
         // Potentially disable all controls or redirect
         return;
    }
    state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60 || 1200); // Use current level index if possible
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
        // Ensure sb and bb exist before formatting
        const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO');
        const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO');
        return `<span class="value">${sbFormatted}</span>/<span class="value">${bbFormatted}</span>${anteHtml}`;
    }


    function formatNextBlindsText(level) {
        if (!level) return "Slutt";
        const anteText = level.ante > 0 ? ` / A:${level.ante.toLocaleString('nb-NO')}` : '';
         // Ensure sb and bb exist before formatting
        const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO');
        const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO');
        return `${sbFormatted}/${bbFormatted}${anteText}`;
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
             //console.warn("Cannot calculate prizes. Invalid input:", { prizePot, paidPlaces, distributionPercentages });
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
        if (!blindLevels) return null; // No levels defined

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
    function assignTableSeat(player, excludeTableNum = null) {
        console.log(`Assigning seat for ${player.name}, excluding table ${excludeTableNum}`);
        const tables = {}; // { tableNum: count }
        let validTables = []; // [{ tableNum: number, count: number }]

        // Count players per table, excluding the excluded table
        state.live.players.forEach(p => {
            // Make sure player has a table assigned before counting
            if (p.id !== player.id && p.table && p.table !== excludeTableNum) {
                tables[p.table] = (tables[p.table] || 0) + 1;
            }
        });

        // Convert to array and filter out potentially excluded tables
        validTables = Object.entries(tables)
            .map(([num, count]) => ({ tableNum: parseInt(num), count: count }))
            .filter(t => t.tableNum !== excludeTableNum);

        // Sort tables by player count (ascending)
        validTables.sort((a, b) => a.count - b.count);

        let targetTableNum = -1;

        // Find the first table with space
        for (const tableInfo of validTables) {
            if (tableInfo.count < state.config.playersPerTable) {
                targetTableNum = tableInfo.tableNum;
                break;
            }
        }

        // If no existing table has space, find the next available table number
        if (targetTableNum === -1) {
             const allExistingTableNumbers = [...new Set(state.live.players.map(p => p.table).filter(t => t > 0))]; // Filter out 0/undefined
             let nextTable = allExistingTableNumbers.length > 0 ? Math.max(0, ...allExistingTableNumbers) + 1 : 1; // Ensure at least 1
             if (nextTable === excludeTableNum) {
                 nextTable++;
             }
             targetTableNum = nextTable;
             console.log(`No space on existing tables (excluding ${excludeTableNum}). Creating/using table: ${targetTableNum}`);
        }

        // Find the first available seat number on the target table
        const occupiedSeats = state.live.players
                                .filter(p => p.table === targetTableNum)
                                .map(p => p.seat);
        let seatNum = 1;
        while (occupiedSeats.includes(seatNum)) {
            seatNum++;
        }

        // Assign table and seat (handle unlikely case where seat > max)
        if (seatNum > state.config.playersPerTable && occupiedSeats.length >= state.config.playersPerTable) {
             console.error(`CRITICAL ERROR: No seat available on table ${targetTableNum}! Assigning seat ${occupiedSeats.length + 1}`);
              seatNum = occupiedSeats.length + 1;
        }
        player.table = targetTableNum;
        player.seat = seatNum;

        console.log(`Assigned ${player.name} to T${player.table} S${player.seat}`);
    }

    function reassignAllSeats(targetTableNum) {
        logActivity(state.live.activityLog, `Finalebord (Bord ${targetTableNum})! Trekker nye seter...`);
        const playersToReseat = state.live.players;
        const numPlayers = playersToReseat.length;
        if (numPlayers === 0) return;

        const seats = Array.from({ length: numPlayers }, (_, i) => i + 1);
        // Fisher-Yates Shuffle
        for (let i = seats.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [seats[i], seats[j]] = [seats[j], seats[i]];
        }

        playersToReseat.forEach((player, index) => {
            player.table = targetTableNum;
            player.seat = seats[index];
            logActivity(state.live.activityLog, ` -> ${player.name} får sete ${player.seat}.`);
        });
        state.live.players.sort((a, b) => a.seat - b.seat);
        console.log("Final table seats reassigned and players sorted.");
    }

    function checkAndHandleTableBreak() {
        if (state.live.status === 'finished') return false;

        const activePlayersCount = state.live.players.length;
        const maxPlayersPerTable = state.config.playersPerTable;
        const currentTableNumbers = new Set(state.live.players.map(p => p.table).filter(t => t > 0)); // Ignore players not seated yet
        const currentTableCount = currentTableNumbers.size;
        const targetTableCount = Math.ceil(activePlayersCount / maxPlayersPerTable);
        const finalTableSize = maxPlayersPerTable;

        console.log(`Table check: Players=${activePlayersCount}, Tables=${currentTableCount}, TargetTables=${targetTableCount}, FinalTableSize=${finalTableSize}`);

        let actionTaken = false;

        // 1. Check for Final Table merge
        if (currentTableCount > 1 && activePlayersCount <= finalTableSize) {
            const targetFinalTableNum = 1;
            logActivity(state.live.activityLog, `Finalebord (${activePlayersCount} spillere)! Flytter alle til Bord ${targetFinalTableNum}...`);
            alert(`Finalebord (${activePlayersCount} spillere)! Flytter alle til Bord ${targetFinalTableNum}.`);
            state.live.players.forEach(p => p.table = targetFinalTableNum); // Move all first
            reassignAllSeats(targetFinalTableNum);
            actionTaken = true;
            console.log("Final table merge executed.");
        }
        // 2. Check for regular table break
        else if (currentTableCount > targetTableCount && currentTableCount > 1) {
            const tables = {};
            state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; });
            const sortedTables = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).sort((a, b) => a.count - b.count);

            if (sortedTables.length > 0) {
                const tableToBreakNum = sortedTables[0].tableNum;
                const msg = `Slår sammen bord! Flytter spillere fra Bord ${tableToBreakNum}.`;
                logActivity(state.live.activityLog, msg);
                alert(msg);
                const playersToMove = state.live.players.filter(p => p.table === tableToBreakNum);
                playersToMove.forEach(player => {
                    const oldTable = player.table; const oldSeat = player.seat;
                    player.table = 0; player.seat = 0; // Mark as unseated temporarily
                    assignTableSeat(player, tableToBreakNum);
                    logActivity(state.live.activityLog, ` -> Flyttet ${player.name} (B${oldTable}S${oldSeat}) til B${player.table}S${player.seat}.`);
                });
                state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); // Re-sort after moves
                actionTaken = true;
                console.log(`Table ${tableToBreakNum} broken and players reassigned.`);
            } else { console.warn("Table break condition met, but couldn't identify table to break."); }
        }

        // Run balancing AFTER potential merge/break, or if no merge/break happened
        const balancingDone = balanceTables(); // balanceTables handles UI/Save internally if it balances

        // If merge/break happened but no balancing was needed after, still update UI and save
        if (actionTaken && !balancingDone) {
             updateUI();
             saveTournamentState(currentTournamentId, state);
        } else if (!actionTaken && !balancingDone) {
            // If nothing happened (no merge/break, no balancing), ensure warning is hidden
            if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden');
        }

        return actionTaken || balancingDone; // Return true if any structural change occurred
    }


    function balanceTables() {
        if (state.live.status === 'finished' || state.live.players.length <= state.config.playersPerTable) {
            if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden');
            return false;
        }

        let balancingPerformed = false;
        const maxDifference = 1;

        while (true) {
            const tables = {};
            state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; });
            const tableCounts = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).filter(tc => tc.count > 0);

            if (tableCounts.length < 2) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; }

            tableCounts.sort((a, b) => a.count - b.count);
            const minTable = tableCounts[0];
            const maxTable = tableCounts[tableCounts.length - 1];

            if (maxTable.count - minTable.count <= maxDifference) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; }

            // --- Imbalance detected ---
            balancingPerformed = true;
            if (tableBalanceInfo) tableBalanceInfo.classList.remove('hidden');
            console.log(`Balancing needed: Max T${maxTable.tableNum}(${maxTable.count}), Min T${minTable.tableNum}(${minTable.count})`);

            const playersOnMaxTable = state.live.players.filter(p => p.table === maxTable.tableNum);
            if (playersOnMaxTable.length === 0) { console.error(`Balancing Error: No players found on max table ${maxTable.tableNum}!`); if (tableBalanceInfo) tableBalanceInfo.textContent = "Balanseringsfeil!"; break; }

            // Simplest: move a random player. Could be smarter (e.g., avoid moving big blind).
            const playerToMove = playersOnMaxTable[Math.floor(Math.random() * playersOnMaxTable.length)];

            const occupiedSeatsMin = state.live.players.filter(p => p.table === minTable.tableNum).map(p => p.seat);
            let newSeat = 1;
            while(occupiedSeatsMin.includes(newSeat)) { newSeat++; }
            if(newSeat > state.config.playersPerTable) { console.error(`Balancing Error: No seat found on target table ${minTable.tableNum}.`); alert(`Balanseringsfeil: Fant ikke ledig sete på bord ${minTable.tableNum}.`); if (tableBalanceInfo) tableBalanceInfo.textContent = "Balanseringsfeil!"; break; }

            const oldTable = playerToMove.table; const oldSeat = playerToMove.seat;
            const message = `Balansering: ${playerToMove.name} flyttes fra B${oldTable} S${oldSeat} til B${minTable.tableNum} S${newSeat}.`;

            playerToMove.table = minTable.tableNum; playerToMove.seat = newSeat;
            logActivity(state.live.activityLog, message);
            state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);

            // Update UI and save state *inside the loop* for each move
            updateUI();
            saveTournamentState(currentTournamentId, state);
            console.log(`Player ${playerToMove.name} moved. Re-evaluating balance...`);
            // Loop continues

        } // End while loop

        if (balancingPerformed) console.log("Balancing process finished.");
        return balancingPerformed;
    }
    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT END ===


    // === 07b: HELPER FUNCTIONS - LOGGING START ===
    function logActivity(logArray, message) {
        if (!logArray) {
             console.warn("Activity log array was undefined, initializing.");
             logArray = state.live.activityLog = []; // Initialize in state too
        }
        const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        logArray.unshift({ timestamp, message }); // Add to the beginning
        const MAX_LOG_ENTRIES = 100;
        if (logArray.length > MAX_LOG_ENTRIES) { logArray.pop(); }
        console.log(`[Log ${timestamp}] ${message}`);
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
             console.error("Player list elements not found!"); return;
        }
        playerListUl.innerHTML = ''; eliminatedPlayerListUl.innerHTML = '';
        const currentLevelNum = state.live.currentLevelIndex + 1;
        const canRebuy = state.config.type === 'rebuy' && currentLevelNum <= state.config.rebuyLevels;
        const canAddon = state.config.type === 'rebuy' && currentLevelNum > state.config.rebuyLevels;
        const canPerformActions = state.live.status !== 'finished';

        // --- Render Active Players ---
        const sortedActivePlayers = [...state.live.players].sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
        sortedActivePlayers.forEach(p => {
            const li = document.createElement('li');
            let playerInfoHtml = `${p.name} <span class="player-details">(B${p.table}S${p.seat})</span>`;
            if (p.rebuys > 0) playerInfoHtml += ` <span class="player-details">[${p.rebuys}R]</span>`;
            if (p.addon) playerInfoHtml += ` <span class="player-details">[A]</span>`;
            if (state.config.type === 'knockout' && p.knockouts > 0) playerInfoHtml += ` <span class="player-details">(KOs: ${p.knockouts})</span>`;
            let actionsHtml = '';
            if (canPerformActions) {
                actionsHtml += `<button class="btn-edit-player small-button" data-player-id="${p.id}" title="Rediger Navn">✏️</button>`;
                if (canRebuy) actionsHtml += `<button class="btn-rebuy small-button" data-player-id="${p.id}" title="Rebuy">R</button>`;
                if (canAddon && !p.addon) actionsHtml += `<button class="btn-addon small-button" data-player-id="${p.id}" title="Addon">A</button>`;
                actionsHtml += `<button class="btn-eliminate small-button danger-button" data-player-id="${p.id}" title="Eliminer">X</button>`;
            }
            li.innerHTML = `<span class="item-name">${playerInfoHtml}</span><div class="list-actions player-actions">${actionsHtml}</div>`;
            playerListUl.appendChild(li);
        });

        // --- Render Eliminated Players ---
        const sortedEliminatedPlayers = [...state.live.eliminatedPlayers].sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));
        sortedEliminatedPlayers.forEach(p => {
            const li = document.createElement('li');
            let playerInfoHtml = `${p.place ?? '?'}. ${p.name}`;
            if (p.rebuys > 0) playerInfoHtml += ` <span class="player-details">[${p.rebuys}R]</span>`;
            if (p.addon) playerInfoHtml += ` <span class="player-details">[A]</span>`;
            if (state.config.type === 'knockout' && p.knockouts > 0) playerInfoHtml += ` <span class="player-details">(KOs: ${p.knockouts})</span>`;
            if (p.eliminatedBy) playerInfoHtml += ` <span class="player-details">(av ${getPlayerNameById(p.eliminatedBy)})</span>`;
            let actionsHtml = '';
            if (canPerformActions) actionsHtml += `<button class="btn-restore small-button warning-button" data-player-id="${p.id}" title="Gjenopprett">↩️</button>`;
            li.innerHTML = `<span class="item-name">${playerInfoHtml}</span><div class="list-actions player-actions">${actionsHtml}</div>`;
            eliminatedPlayerListUl.appendChild(li);
        });

        activePlayerCountSpan.textContent = state.live.players.length;
        eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length;
        playerListUl.querySelectorAll('.btn-edit-player').forEach(btn => btn.onclick = handleEditPlayer);
        playerListUl.querySelectorAll('.btn-rebuy').forEach(btn => btn.onclick = handleRebuy);
        playerListUl.querySelectorAll('.btn-addon').forEach(btn => btn.onclick = handleAddon);
        playerListUl.querySelectorAll('.btn-eliminate').forEach(btn => btn.onclick = handleEliminate);
        eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(btn => btn.onclick = handleRestore);
    }

    function displayPrizes() {
        if (!prizeDisplayLive || !totalPotPrizeSpan) return;
        const prizeData = calculatePrizes();
        const totalPotFormatted = (state.live.totalPot || 0).toLocaleString('nb-NO');
        prizeDisplayLive.querySelector('h3').innerHTML = `Premiefordeling (Totalpott: <span id="total-pot">${totalPotFormatted}</span> kr)`;
        const existingOl = prizeDisplayLive.querySelector('ol'); const existingP = prizeDisplayLive.querySelector('p');
        if(existingOl) existingOl.remove(); if(existingP) existingP.remove();
        if (prizeData.length > 0) {
            const ol = document.createElement('ol');
            prizeData.forEach(p => { const li = document.createElement('li'); li.textContent = `${p.place}. Plass: ${p.amount.toLocaleString('nb-NO')} kr (${p.percentage}%)`; ol.appendChild(li); });
            prizeDisplayLive.appendChild(ol); prizeDisplayLive.classList.remove('hidden');
        } else {
            const p = document.createElement('p');
            const paidPlaces = state.config.paidPlaces || 0; const distributionPercentages = state.config.prizeDistribution || []; const totalPot = state.live.totalPot || 0; let prizePot = totalPot;
            if (state.config.type === 'knockout') prizePot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0);
            if (prizePot <= 0 && totalPot > 0) p.textContent = 'Ingen premiepott å fordele (etter evt. bounty).';
            else if (prizePot <= 0) p.textContent = 'Ingen premiepott å fordele.';
            else if (paidPlaces <= 0) p.textContent = 'Antall betalte plasser er ikke definert.';
            else if (distributionPercentages.length !== paidPlaces) p.textContent = 'Antall premier i fordelingen matcher ikke antall betalte plasser.';
            else p.textContent = 'Premiefordeling ikke tilgjengelig.';
            prizeDisplayLive.appendChild(p); prizeDisplayLive.classList.add('hidden');
        }
    }

    function updateUI() {
        if (!state || !state.config || !state.live) { console.error("State missing in updateUI"); if(nameDisplay) nameDisplay.textContent = "Error!"; return; }
        if (nameDisplay) nameDisplay.textContent = state.config.name;
        if(currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const currentLevelIndex = state.live.currentLevelIndex;
        const currentLevelData = state.config.blindLevels?.[currentLevelIndex];
        const nextLevelData = state.config.blindLevels?.[currentLevelIndex + 1];
        const nextPauseInfo = findNextPauseInfo();

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

        if(nextBlindsDisplay) nextBlindsDisplay.textContent = formatNextBlindsText(nextLevelData);
        if(averageStackDisplay) averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO');
        if(playersRemainingDisplay) playersRemainingDisplay.textContent = state.live.players.length;
        if(totalEntriesDisplay) totalEntriesDisplay.textContent = state.live.totalEntries;
        const currentLevelNumForLateReg = currentLevelIndex + 1;
        const lateRegStillOpen = currentLevelNumForLateReg <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished';
        if (lateRegStatusDisplay) { if (state.config.lateRegLevel > 0) lateRegStatusDisplay.textContent = `${lateRegStillOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`; else lateRegStatusDisplay.textContent = 'Ikke aktiv'; }
        if (infoNextPauseParagraph) { const nextPauseTimeSpan = infoNextPauseParagraph.querySelector('#next-pause-time'); if (nextPauseTimeSpan) nextPauseTimeSpan.textContent = nextPauseInfo ? `Etter nivå ${nextPauseInfo.level} (${nextPauseInfo.duration} min)` : 'Ingen flere'; }

        const isFinished = state.live.status === 'finished';
        if(startPauseButton) { startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke'; startPauseButton.disabled = isFinished; }
        if(prevLevelButton) prevLevelButton.disabled = currentLevelIndex <= 0 || isFinished;
        if(nextLevelButton) nextLevelButton.disabled = currentLevelIndex >= state.config.blindLevels.length - 1 || isFinished;
        if(adjustTimeMinusButton) adjustTimeMinusButton.disabled = isFinished;
        if(adjustTimePlusButton) adjustTimePlusButton.disabled = isFinished;
        if(lateRegButton) lateRegButton.disabled = !lateRegStillOpen || isFinished;
        if(btnEditTournamentSettings) btnEditTournamentSettings.disabled = isFinished;
        if(endTournamentButton) endTournamentButton.disabled = isFinished;

        renderPlayerList(); displayPrizes(); renderActivityLog();
    }
    // === 08: UI UPDATE FUNCTIONS END ===


    // === 09: TIMER LOGIC START ===
    function tick() {
        if (state.live.status !== 'running') return;
        if (state.live.isOnBreak) {
            state.live.timeRemainingInBreak--;
            if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak);
            if (state.live.timeRemainingInBreak < 0) {
                state.live.isOnBreak = false; state.live.currentLevelIndex++;
                if (state.live.currentLevelIndex >= state.config.blindLevels.length) {
                     logActivity(state.live.activityLog, "Siste pause ferdig. Blindstruktur fullført."); finishTournament(); return;
                }
                const newLevel = state.config.blindLevels[state.live.currentLevelIndex];
                state.live.timeRemainingInLevel = newLevel.duration * 60;
                logActivity(state.live.activityLog, `Pause over. Nivå ${newLevel.level} (${formatBlindsHTML(newLevel)}) starter.`);
                updateUI(); saveTournamentState(currentTournamentId, state);
            } else if (state.live.timeRemainingInBreak % 15 === 0) { saveTournamentState(currentTournamentId, state); }
        } else {
            state.live.timeRemainingInLevel--;
             if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel);
            if (state.live.timeRemainingInLevel < 0) {
                const currentLevel = state.config.blindLevels[state.live.currentLevelIndex];
                const pauseDuration = currentLevel?.pauseMinutes || 0;
                if (pauseDuration > 0) {
                    state.live.isOnBreak = true; state.live.timeRemainingInBreak = pauseDuration * 60;
                    logActivity(state.live.activityLog, `Nivå ${currentLevel.level} ferdig. Starter ${pauseDuration} min pause.`);
                    updateUI(); saveTournamentState(currentTournamentId, state);
                } else {
                    state.live.currentLevelIndex++;
                    if (state.live.currentLevelIndex >= state.config.blindLevels.length) {
                         logActivity(state.live.activityLog, `Nivå ${currentLevel.level} ferdig. Blindstruktur fullført.`); finishTournament(); return;
                    }
                    const newLevel = state.config.blindLevels[state.live.currentLevelIndex];
                    state.live.timeRemainingInLevel = newLevel.duration * 60;
                    logActivity(state.live.activityLog, `Nivå ${currentLevel.level} ferdig. Nivå ${newLevel.level} (${formatBlindsHTML(newLevel)}) starter.`);
                    updateUI(); saveTournamentState(currentTournamentId, state);
                }
            } else if (state.live.timeRemainingInLevel > 0 && state.live.timeRemainingInLevel % 30 === 0) { saveTournamentState(currentTournamentId, state); }
        }
    }

    function startRealTimeClock() {
        if (realTimeInterval) clearInterval(realTimeInterval);
        realTimeInterval = setInterval(() => { if (currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }, 1000);
    }
    // === 09: TIMER LOGIC END ===


    // === 10: EVENT HANDLERS - CONTROLS START ===
    function handleStartPause() {
        if (state.live.status === 'finished') return;
        if (state.live.status === 'paused') {
            state.live.status = 'running';
            if (!timerInterval) timerInterval = setInterval(tick, 1000);
            logActivity(state.live.activityLog, "Klokke startet.");
        } else {
            state.live.status = 'paused';
            logActivity(state.live.activityLog, "Klokke pauset.");
            saveTournamentState(currentTournamentId, state);
        }
        updateUI();
    }

    function handleAdjustTime(deltaSeconds) {
        if (state.live.status === 'finished') return;
        let targetTimeKey = state.live.isOnBreak ? 'timeRemainingInBreak' : 'timeRemainingInLevel';
        let maxTime = Infinity;
        if (!state.live.isOnBreak) { const currentLevel = state.config.blindLevels[state.live.currentLevelIndex]; if (currentLevel) maxTime = currentLevel.duration * 60; }
        state.live[targetTimeKey] += deltaSeconds;
        state.live[targetTimeKey] = Math.max(0, Math.min(state.live[targetTimeKey], maxTime));
        const adjustmentMinutes = deltaSeconds / 60;
        logActivity(state.live.activityLog, `Tid justert ${adjustmentMinutes > 0 ? '+' : ''}${adjustmentMinutes} min.`);
        updateUI(); saveTournamentState(currentTournamentId, state);
    }

    function handleAdjustLevel(deltaIndex) {
        if (state.live.status === 'finished') return;
        const newIndex = state.live.currentLevelIndex + deltaIndex;
        if (newIndex >= 0 && newIndex < state.config.blindLevels.length) {
            const oldLevelNum = state.config.blindLevels[state.live.currentLevelIndex]?.level || '?';
            const newLevel = state.config.blindLevels[newIndex];
            if (!confirm(`Endre til Nivå ${newLevel.level} (${formatBlindsHTML(newLevel)})? \nKlokken nullstilles for nivået.`)) return;
            state.live.currentLevelIndex = newIndex; state.live.timeRemainingInLevel = newLevel.duration * 60; state.live.isOnBreak = false; state.live.timeRemainingInBreak = 0;
            logActivity(state.live.activityLog, `Nivå manuelt endret: ${oldLevelNum} -> ${newLevel.level}. Klokke nullstilt.`);
            updateUI(); saveTournamentState(currentTournamentId, state);
        } else { alert("Kan ikke gå til nivået (første eller siste nivå nådd)."); }
    }

    function handleEndTournament() {
        if (state.live.status === 'finished') { alert("Turneringen er allerede markert som fullført."); return; }
        if (confirm("Er du sikker på at du vil markere turneringen som fullført?\nDette kan ikke enkelt angres.")) finishTournament();
    }

    function handleForceSave() {
        if (state) { console.log("Forcing save..."); if (saveTournamentState(currentTournamentId, state)) { if(btnForceSave) btnForceSave.textContent = "Lagret!"; setTimeout(() => { if(btnForceSave) btnForceSave.textContent = "Lagre Nå"; }, 1500); } else alert("Lagring feilet!"); }
        else console.error("Cannot force save, state is null.");
    }

    function handleBackToMain() {
        if (state && state.live.status !== 'finished') saveTournamentState(currentTournamentId, state);
        window.location.href = 'index.html';
    }
    // === 10: EVENT HANDLERS - CONTROLS END ===


    // === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    function handleRebuy(event){
        const playerId = parseInt(event.target.dataset.playerId);
        const player = state.live.players.find(pl => pl.id === playerId);
        const currentLevelNum = state.live.currentLevelIndex + 1;
        if (!player) { console.error("Rebuy failed: Player not found", playerId); return; }
        if (state.config.type !== 'rebuy') { alert("Re-buy er ikke tilgjengelig for denne turneringstypen."); return; }
        if (!(currentLevelNum <= state.config.rebuyLevels)) { alert(`Re-buy er kun tilgjengelig t.o.m. nivå ${state.config.rebuyLevels}. Nåværende nivå: ${currentLevelNum}.`); return; }
        if (state.live.status === 'finished') { alert("Kan ikke utføre handlinger i en fullført turnering."); return; }
        if (confirm(`Re-buy (${state.config.rebuyCost} kr / ${state.config.rebuyChips} sjetonger) for ${player.name}?`)) {
            player.rebuys = (player.rebuys || 0) + 1;
            state.live.totalPot += state.config.rebuyCost; state.live.totalEntries++; state.live.totalRebuys++;
            logActivity(state.live.activityLog, `${player.name} tok Re-buy (+${state.config.rebuyChips} chips, +${state.config.rebuyCost} kr).`);
            updateUI(); saveTournamentState(currentTournamentId, state);
        }
    }

    function handleAddon(event){
        const playerId = parseInt(event.target.dataset.playerId);
        const player = state.live.players.find(pl => pl.id === playerId);
        const currentLevelNum = state.live.currentLevelIndex + 1;
        const isAddonPeriod = currentLevelNum > state.config.rebuyLevels;
        if (!player) { console.error("Addon failed: Player not found", playerId); return; }
        if (state.config.type !== 'rebuy') { alert("Add-on er ikke tilgjengelig for denne turneringstypen."); return; }
        if (!isAddonPeriod) { alert(`Add-on er vanligvis tilgjengelig ETTER re-buy perioden (etter nivå ${state.config.rebuyLevels}). Nåværende nivå: ${currentLevelNum}.`); return; }
        if (player.addon) { alert(`${player.name} har allerede tatt Add-on.`); return; }
        if (state.live.status === 'finished') { alert("Kan ikke utføre handlinger i en fullført turnering."); return; }
        if (confirm(`Add-on (${state.config.addonCost} kr / ${state.config.addonChips} sjetonger) for ${player.name}?`)) {
            player.addon = true; state.live.totalPot += state.config.addonCost; state.live.totalAddons++;
            logActivity(state.live.activityLog, `${player.name} tok Add-on (+${state.config.addonChips} chips, +${state.config.addonCost} kr).`);
            updateUI(); saveTournamentState(currentTournamentId, state);
        }
    }

    function handleEliminate(event){
        if(state.live.status==='finished') return;
        const playerIdToEliminate = parseInt(event.target.dataset.playerId);
        const activePlayers = state.live.players;
        const playerIndex = activePlayers.findIndex(p => p.id === playerIdToEliminate);
        if(playerIndex === -1) { console.error("Player to eliminate not found:", playerIdToEliminate); return; }
        if (activePlayers.length <= 1) { alert("Kan ikke eliminere siste spiller."); return; }
        const player = activePlayers[playerIndex];
        let potentialEliminatorId = null;

        if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) {
            const potentialAssigners = activePlayers.filter(p => p.id !== playerIdToEliminate);
            const dialogOverlay = document.createElement('div'); /* ... styles ... */ dialogOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:200;';
            const dialogBox = document.createElement('div'); /* ... styles ... */ dialogBox.style.cssText = 'background:#fff;color:#333;padding:25px;border-radius:5px;text-align:center;max-width:400px;box-shadow:0 5px 15px rgba(0,0,0,0.3);';
            dialogBox.innerHTML = `<h3 style="margin-top:0;margin-bottom:15px;color:#333;">Hvem slo ut ${player.name}?</h3><select id="ko-assigner-select" style="padding:8px;margin:10px 0 20px 0;min-width:250px;max-width:100%;border:1px solid #ccc;border-radius:4px;font-size:1em;"><option value="">-- Velg spiller --</option><option value="none">Ingen KO / Feil / Annet</option>${potentialAssigners.map(p => `<option value="${p.id}">${p.name} (B${p.table}S${p.seat})</option>`).join('')}</select><div><button id="ko-confirm-btn" class="success-button" style="margin-right:10px;padding:8px 15px;font-size:0.95em;">Bekreft Eliminering</button><button id="ko-cancel-btn" style="padding:8px 15px;font-size:0.95em;">Avbryt</button></div>`;
            dialogOverlay.appendChild(dialogBox); document.body.appendChild(dialogOverlay);
            const confirmBtn = document.getElementById('ko-confirm-btn'); const cancelBtn = document.getElementById('ko-cancel-btn'); const selectElement = document.getElementById('ko-assigner-select');
            const closeKoDialog = () => { if (document.body.contains(dialogOverlay)) document.body.removeChild(dialogOverlay); };
            confirmBtn.onclick = () => { const selectedValue = selectElement.value; if (!selectedValue || selectedValue === "") { alert("Vennligst velg en spiller eller 'Ingen KO'."); return; } potentialEliminatorId = (selectedValue === "none") ? null : parseInt(selectedValue); closeKoDialog(); proceedWithElimination(); };
            cancelBtn.onclick = () => { closeKoDialog(); console.log("Elimination cancelled during KO selection."); };
            dialogOverlay.onclick = (e) => { if (e.target === dialogOverlay) { /* Optional: closeKoDialog(); */ } };
        } else { potentialEliminatorId = null; proceedWithElimination(); }

        function proceedWithElimination() {
            let eliminatorName = null; let eliminatorObject = null;
            if (potentialEliminatorId !== null) { eliminatorObject = activePlayers.find(p => p.id === potentialEliminatorId); if (eliminatorObject) eliminatorName = eliminatorObject.name; else { console.warn("Selected eliminator ID not found:", potentialEliminatorId); potentialEliminatorId = null; } }
            const confirmMsg = `Eliminere ${player.name}?` + (eliminatorName ? ` (KO tildeles ${eliminatorName})` : '');
            if (confirm(confirmMsg)) {
                player.eliminated = true; player.eliminatedBy = potentialEliminatorId; player.place = activePlayers.length;
                if (eliminatorObject) { eliminatorObject.knockouts = (eliminatorObject.knockouts || 0) + 1; state.live.knockoutLog.push({ eliminatedPlayerId: player.id, eliminatedByPlayerId: eliminatorObject.id, level: state.live.currentLevelIndex + 1, timestamp: new Date().toISOString() }); console.log(`KO: ${eliminatorObject.name} eliminated ${player.name}`); }
                state.live.eliminatedPlayers.push(player); activePlayers.splice(playerIndex, 1);
                const eliminationLogText = eliminatorName ? ` av ${eliminatorName}` : ''; logActivity(state.live.activityLog, `${player.name} slått ut (${player.place}. plass${eliminationLogText}).`); console.log(`Player ${player.name} eliminated. ${activePlayers.length} remaining.`);
                const structureChanged = checkAndHandleTableBreak(); if (!structureChanged) { updateUI(); saveTournamentState(currentTournamentId, state); }
                if (state.live.players.length <= 1) finishTournament();
            } else console.log("Elimination cancelled by user confirmation.");
        }
    }

    function handleRestore(event){
        if(state.live.status==='finished'){ alert("Kan ikke gjenopprette spillere."); return; }
        const playerId = parseInt(event.target.dataset.playerId);
        const eliminatedIndex = state.live.eliminatedPlayers.findIndex(p => p.id === playerId);
        if (eliminatedIndex === -1) { console.error("Player to restore not found:", playerId); return; }
        const player = state.live.eliminatedPlayers[eliminatedIndex]; const oldPlace = player.place;
        if (confirm(`Gjenopprette ${player.name} (var ${oldPlace}. plass)?`)) {
            const eliminatorId = player.eliminatedBy; player.eliminated = false; player.eliminatedBy = null; player.place = null;
            state.live.eliminatedPlayers.splice(eliminatedIndex, 1); state.live.players.push(player);
            if (state.config.type === 'knockout' && eliminatorId) { let eliminator = state.live.players.find(p => p.id === eliminatorId) || state.live.eliminatedPlayers.find(p => p.id === eliminatorId); if (eliminator && eliminator.knockouts > 0) { eliminator.knockouts--; console.log(`KO reversed for ${eliminator.name}.`); const logIndex = state.live.knockoutLog.findIndex(log => log.eliminatedPlayerId === player.id && log.eliminatedByPlayerId === eliminatorId); if (logIndex > -1) { state.live.knockoutLog.splice(logIndex, 1); console.log("KO log entry removed."); } } else console.warn("Could not find player who got KO or KO count was 0:", eliminatorId); }
            assignTableSeat(player); logActivity(state.live.activityLog, `${player.name} gjenopprettet fra ${oldPlace}. plass (nå B${player.table}S${player.seat}).`);
            const structureChanged = checkAndHandleTableBreak(); if (!structureChanged) { updateUI(); saveTournamentState(currentTournamentId, state); }
        }
    }

    function handleEditPlayer(event){
        if(state.live.status === 'finished') { alert("Kan ikke redigere spillere."); return; }
        const playerId = parseInt(event.target.dataset.playerId);
        const player = state.live.players.find(pl => pl.id === playerId) || state.live.eliminatedPlayers.find(pl => pl.id === playerId);
        if (!player) { console.error("Player to edit not found:", playerId); return; }
        const oldName = player.name; const newName = prompt(`Endre navn for ${oldName}:`, oldName);
        if (newName && newName.trim().length > 0 && newName.trim() !== oldName) { player.name = newName.trim(); logActivity(state.live.activityLog, `Navn endret: ${oldName} -> ${player.name}.`); renderPlayerList(); saveTournamentState(currentTournamentId, state); }
        else if (newName !== null && newName.trim().length === 0) alert("Navn kan ikke være tomt."); else console.log("Player name edit cancelled.");
    }

    function handleLateRegClick() {
        if (state.live.status === 'finished') { alert("Kan ikke registrere spillere."); return; }
        const currentLevelNum = state.live.currentLevelIndex + 1; const lateRegOpen = currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0;
        if (!lateRegOpen) { const reason = state.config.lateRegLevel > 0 ? `stengte etter nivå ${state.config.lateRegLevel}` : "er ikke aktivert"; alert(`Sen registrering ${reason}.`); return; }
        const name = prompt("Navn for spiller (Late Reg):");
        if (name && name.trim().length > 0) {
            const newPlayer = { id: generateUniqueId('p'), name: name.trim(), stack: state.config.startStack, table: 0, seat: 0, rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0 };
            assignTableSeat(newPlayer); state.live.players.push(newPlayer);
            state.live.totalPot += state.config.buyIn; state.live.totalEntries++;
            logActivity(state.live.activityLog, `${newPlayer.name} registrert (Late Reg, B${newPlayer.table}S${newPlayer.seat}).`);
            state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
            const structureChanged = checkAndHandleTableBreak(); if (!structureChanged) { updateUI(); saveTournamentState(currentTournamentId, state); }
        } else if (name !== null) alert("Navn kan ikke være tomt."); else console.log("Late registration cancelled.");
    }
    // === 11: EVENT HANDLERS - PLAYER ACTIONS END ===


    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    function openTournamentModal() {
        if (state.live.status === 'finished' || isModalOpen) return;
        console.log("Opening tournament settings modal");
        editBlindStructureBody.innerHTML = ''; editBlindLevelCounter = 0;
        state.config.blindLevels.forEach(level => addEditBlindLevelRow(level)); updateEditLevelNumbers();
        editPaidPlacesInput.value = state.config.paidPlaces; editPrizeDistTextarea.value = state.config.prizeDistribution.join(', ');
        tournamentSettingsModal.classList.remove('hidden'); isModalOpen = true; currentOpenModal = tournamentSettingsModal;
    }

    function closeTournamentModal() {
        tournamentSettingsModal.classList.add('hidden'); isModalOpen = false; currentOpenModal = null;
    }

    function openUiModal() {
        if (isModalOpen) return; console.log("Opening UI settings modal");
        originalThemeBg = loadThemeBgColor(); originalThemeText = loadThemeTextColor(); originalElementLayouts = loadElementLayouts();
        blockSliderUpdates=true;
        const [bgR, bgG, bgB] = parseRgbString(originalThemeBg); const bgHSL = rgbToHsl(bgR, bgG, bgB);
        bgRedSlider.value=bgRedInput.value=bgR; bgGreenSlider.value=bgGreenInput.value=bgG; bgBlueSlider.value=bgBlueInput.value=bgB;
        bgHueSlider.value=bgHueInput.value=bgHSL.h; bgSatSlider.value=bgSatInput.value=bgHSL.s; bgLigSlider.value=bgLigInput.value=bgHSL.l;
        const [textR, textG, textB] = parseRgbString(originalThemeText); const textHSL = rgbToHsl(textR, textG, textB);
        textRedSlider.value=textRedInput.value=textR; textGreenSlider.value=textGreenInput.value=textG; textBlueSlider.value=textBlueInput.value=textB;
        textHueSlider.value=textHueInput.value=textHSL.h; textSatSlider.value=textSatInput.value=textHSL.s; textLigSlider.value=textLigInput.value=textHSL.l;
        canvasHeightInput.value = canvasHeightSlider.value = originalElementLayouts.canvas.height;
        titleXInput.value = titleXSlider.value = originalElementLayouts.title.x; titleYInput.value = titleYSlider.value = originalElementLayouts.title.y; titleWidthInput.value = titleWidthSlider.value = originalElementLayouts.title.width; titleFontSizeInput.value = titleFontSizeSlider.value = originalElementLayouts.title.fontSize;
        timerXInput.value = timerXSlider.value = originalElementLayouts.timer.x; timerYInput.value = timerYSlider.value = originalElementLayouts.timer.y; timerWidthInput.value = timerWidthSlider.value = originalElementLayouts.timer.width; timerFontSizeInput.value = timerFontSizeSlider.value = originalElementLayouts.timer.fontSize;
        blindsXInput.value = blindsXSlider.value = originalElementLayouts.blinds.x; blindsYInput.value = blindsYSlider.value = originalElementLayouts.blinds.y; blindsWidthInput.value = blindsWidthSlider.value = originalElementLayouts.blinds.width; blindsFontSizeInput.value = blindsFontSizeSlider.value = originalElementLayouts.blinds.fontSize;
        logoXInput.value = logoXSlider.value = originalElementLayouts.logo.x; logoYInput.value = logoYSlider.value = originalElementLayouts.logo.y; logoWidthInput.value = logoWidthSlider.value = originalElementLayouts.logo.width; logoHeightInput.value = logoHeightSlider.value = originalElementLayouts.logo.height;
        infoXInput.value = infoXSlider.value = originalElementLayouts.info.x; infoYInput.value = infoYSlider.value = originalElementLayouts.info.y; infoWidthInput.value = infoWidthSlider.value = originalElementLayouts.info.width; infoFontSizeInput.value = infoFontSizeSlider.value = originalElementLayouts.info.fontSize;
        for (const key in infoParagraphs) { const checkboxId = `toggleInfo${key.substring(4)}`; const checkbox = document.getElementById(checkboxId); if (checkbox) checkbox.checked = originalElementLayouts.info[key] ?? true; }
        blockSliderUpdates=false;
        populateThemeFavorites(); updateColorAndLayoutPreviews(); addThemeAndLayoutListeners();
        uiSettingsModal.classList.remove('hidden'); isModalOpen = true; currentOpenModal = uiSettingsModal;
    }

    function closeUiModal(revert = false) {
        if (revert) applyThemeAndLayout(originalThemeBg, originalThemeText, originalElementLayouts);
        removeThemeAndLayoutListeners(); uiSettingsModal.classList.add('hidden'); isModalOpen = false; currentOpenModal = null;
    }

    function addEditBlindLevelRow(levelData={}){
        editBlindLevelCounter++; const row=editBlindStructureBody.insertRow(); row.dataset.levelNumber=editBlindLevelCounter;
        const sb=levelData.sb??''; const bb=levelData.bb??''; const ante=levelData.ante??0; const duration=levelData.duration??(state.config.blindLevels?.[0]?.duration||20); const pauseMinutes=levelData.pauseMinutes??0;
        const isPastLevel = levelData.level <= state.live.currentLevelIndex && !state.live.isOnBreak; const disabledAttr = isPastLevel ? 'disabled' : '';
        row.innerHTML=`<td><span class="level-number">${editBlindLevelCounter}</span> ${isPastLevel?'<small>(Låst)</small>':''}</td><td><input type="number" class="sb-input" value="${sb}" min="0" step="1" ${disabledAttr}></td><td><input type="number" class="bb-input" value="${bb}" min="0" step="1" ${disabledAttr}></td><td><input type="number" class="ante-input" value="${ante}" min="0" step="1" ${disabledAttr}></td><td><input type="number" class="duration-input" value="${duration}" min="1" ${disabledAttr}></td><td><input type="number" class="pause-duration-input" value="${pauseMinutes}" min="0" ${disabledAttr}></td><td><button type="button" class="btn-remove-level" title="Fjern nivå ${editBlindLevelCounter}" ${disabledAttr}>X</button></td>`;
        const removeBtn=row.querySelector('.btn-remove-level');
        if(!isPastLevel){ removeBtn.onclick=()=>{row.remove(); updateEditLevelNumbers();}; }
        else { row.querySelectorAll('input').forEach(inp=>inp.disabled=true); removeBtn.disabled=true; }
    }

    function updateEditLevelNumbers(){
        const rows=editBlindStructureBody.querySelectorAll('tr');
        rows.forEach((row,index)=>{ const levelNum=index+1; row.dataset.levelNumber=levelNum; row.querySelector('.level-number').textContent=levelNum; const removeBtn = row.querySelector('.btn-remove-level'); if (removeBtn) removeBtn.title=`Fjern nivå ${levelNum}`; });
        editBlindLevelCounter=rows.length;
    }

    function generateEditPayout(){
        const places = parseInt(editPaidPlacesInput.value) || 0;
        if (places > 0 && standardPayouts[places]) editPrizeDistTextarea.value = standardPayouts[places].join(', '); else editPrizeDistTextarea.value = '';
    }

    function syncRgbFromHsl(typePrefix) {
        if(blockSliderUpdates) return; const h=parseInt(document.getElementById(`${typePrefix}HueInput`).value); const s=parseInt(document.getElementById(`${typePrefix}SatInput`).value); const l=parseInt(document.getElementById(`${typePrefix}LigInput`).value); const rgbString=hslToRgb(h,s,l); const [r,g,b]=parseRgbString(rgbString); blockSliderUpdates=true;
        document.getElementById(`${typePrefix}RedSlider`).value=document.getElementById(`${typePrefix}RedInput`).value=r; document.getElementById(`${typePrefix}GreenSlider`).value=document.getElementById(`${typePrefix}GreenInput`).value=g; document.getElementById(`${typePrefix}BlueSlider`).value=document.getElementById(`${typePrefix}BlueInput`).value=b;
        blockSliderUpdates=false; return rgbString;
    }

    function syncHslFromRgb(typePrefix) {
         if(blockSliderUpdates) return; const r=parseInt(document.getElementById(`${typePrefix}RedInput`).value); const g=parseInt(document.getElementById(`${typePrefix}GreenInput`).value); const b=parseInt(document.getElementById(`${typePrefix}BlueInput`).value); const hsl=rgbToHsl(r,g,b); blockSliderUpdates=true;
         document.getElementById(`${typePrefix}HueSlider`).value=document.getElementById(`${typePrefix}HueInput`).value=hsl.h; document.getElementById(`${typePrefix}SatSlider`).value=document.getElementById(`${typePrefix}SatInput`).value=hsl.s; document.getElementById(`${typePrefix}LigSlider`).value=document.getElementById(`${typePrefix}LigInput`).value=hsl.l;
         blockSliderUpdates=false; return `rgb(${r}, ${g}, ${b})`;
    }

     function updateColorAndLayoutPreviews() {
        if (!isModalOpen || currentOpenModal !== uiSettingsModal) return;
        const currentBgColor = syncHslFromRgb('bg'); const currentTextColor = syncHslFromRgb('text');
        const currentElementLayouts = {
            canvas: { height: parseInt(canvasHeightSlider.value) },
             title: { x: parseInt(titleXSlider.value), y: parseInt(titleYSlider.value), width: parseInt(titleWidthSlider.value), fontSize: parseFloat(titleFontSizeSlider.value) },
            timer: { x: parseInt(timerXSlider.value), y: parseInt(timerYSlider.value), width: parseInt(timerWidthSlider.value), fontSize: parseFloat(timerFontSizeSlider.value) },
            blinds: { x: parseInt(blindsXSlider.value), y: parseInt(blindsYSlider.value), width: parseInt(blindsWidthSlider.value), fontSize: parseFloat(blindsFontSizeSlider.value) },
            logo: { x: parseInt(logoXSlider.value), y: parseInt(logoYSlider.value), width: parseInt(logoWidthSlider.value), height: parseInt(logoHeightSlider.value) },
            info: { x: parseInt(infoXSlider.value), y: parseInt(infoYSlider.value), width: parseInt(infoWidthSlider.value), fontSize: parseFloat(infoFontSizeSlider.value), showNextBlinds: toggleInfoNextBlinds.checked, showNextPause: toggleInfoNextPause.checked, showAvgStack: toggleInfoAvgStack.checked, showPlayers: toggleInfoPlayers.checked, showLateReg: toggleInfoLateReg.checked }
        };
        if(bgColorPreview) bgColorPreview.style.backgroundColor = currentBgColor;
        if(textColorPreview) { textColorPreview.style.backgroundColor = currentBgColor; textColorPreview.querySelector('span').style.color = currentTextColor; }
        applyThemeAndLayout(currentBgColor, currentTextColor, currentElementLayouts);
    }

    function handleThemeLayoutControlChange(e) {
        if (!isModalOpen || currentOpenModal !== uiSettingsModal) return;
        const target = e.target; const id = target.id; const isSlider = id.includes('Slider'); const isInput = id.includes('Input'); const isCheckbox = target.type === 'checkbox' && id.startsWith('toggleInfo');
        if (isSlider || isInput) {
            const baseId = isSlider ? id.replace('Slider', '') : id.replace('Input', ''); const slider = document.getElementById(baseId + 'Slider'); const input = document.getElementById(baseId + 'Input');
            if (target.type === 'number' && input) { let value = parseFloat(target.value); const min = parseFloat(target.min || '0'); const max = parseFloat(target.max || '100'); const step = parseFloat(target.step || '1'); if (!isNaN(value)) { value = Math.max(min, Math.min(max, value)); target.value = (step % 1 === 0) ? Math.round(value) : value.toFixed(step.toString().split('.')[1]?.length || 1); if (slider) slider.value = target.value; } }
            else if (isSlider && input) input.value = target.value;
            if (id.includes('Hue') || id.includes('Sat') || id.includes('Lig')) syncRgbFromHsl(id.startsWith('bg') ? 'bg' : 'text'); else if (id.includes('Red') || id.includes('Green') || id.includes('Blue')) syncHslFromRgb(id.startsWith('bg') ? 'bg' : 'text');
        }
        updateColorAndLayoutPreviews();
    }

    function addThemeAndLayoutListeners(){
        allSliders.forEach(el => el?.addEventListener('input', handleThemeLayoutControlChange)); allInputs.forEach(el => el?.addEventListener('input', handleThemeLayoutControlChange)); allInfoToggles.forEach(el => el?.addEventListener('change', handleThemeLayoutControlChange));
        btnLoadThemeFavorite.addEventListener('click', handleLoadFavorite); btnSaveThemeFavorite.addEventListener('click', handleSaveFavorite); btnDeleteThemeFavorite.addEventListener('click', handleDeleteFavorite); themeFavoritesSelect.addEventListener('change', enableDisableDeleteButton);
    }

    function removeThemeAndLayoutListeners(){
        allSliders.forEach(el => el?.removeEventListener('input', handleThemeLayoutControlChange)); allInputs.forEach(el => el?.removeEventListener('input', handleThemeLayoutControlChange)); allInfoToggles.forEach(el => el?.removeEventListener('change', handleThemeLayoutControlChange));
        btnLoadThemeFavorite.removeEventListener('click', handleLoadFavorite); btnSaveThemeFavorite.removeEventListener('click', handleSaveFavorite); btnDeleteThemeFavorite.removeEventListener('click', handleDeleteFavorite); themeFavoritesSelect.removeEventListener('change', enableDisableDeleteButton);
    }

    function populateThemeFavorites() {
        const favorites = loadThemeFavorites(); themeFavoritesSelect.innerHTML = '<option value="">Velg favoritt...</option>';
        favorites.forEach(fav => { const option = document.createElement('option'); option.value = fav.id; option.textContent = fav.name; themeFavoritesSelect.appendChild(option); }); enableDisableDeleteButton();
    }

    function enableDisableDeleteButton(){ btnDeleteThemeFavorite.disabled = !themeFavoritesSelect.value; }

    function handleLoadFavorite() {
        const selectedId = themeFavoritesSelect.value; if (!selectedId) return; const favorites = loadThemeFavorites(); const fav = favorites.find(f => f.id === selectedId);
        if (fav) { console.log(`Loading favorite theme: ${fav.name}`); const [bgR, bgG, bgB] = parseRgbString(fav.bg); const bgHSL = rgbToHsl(bgR, bgG, bgB); const [textR, textG, textB] = parseRgbString(fav.text); const textHSL = rgbToHsl(textR, textG, textB);
             blockSliderUpdates = true; bgRedSlider.value=bgRedInput.value=bgR; bgGreenSlider.value=bgGreenInput.value=bgG; bgBlueSlider.value=bgBlueInput.value=bgB; bgHueSlider.value=bgHueInput.value=bgHSL.h; bgSatSlider.value=bgSatInput.value=bgHSL.s; bgLigSlider.value=bgLigInput.value=bgHSL.l; textRedSlider.value=textRedInput.value=textR; textGreenSlider.value=textGreenInput.value=textG; textBlueSlider.value=textBlueInput.value=textB; textHueSlider.value=textHueInput.value=textHSL.h; textSatSlider.value=textSatInput.value=textHSL.s; textLigSlider.value=textLigInput.value=textHSL.l; blockSliderUpdates = false;
             updateColorAndLayoutPreviews();
        }
    }

    function handleSaveFavorite() {
        const name = newThemeFavoriteNameInput.value.trim(); if (!name) { alert("Vennligst skriv inn et navn."); newThemeFavoriteNameInput.focus(); return; }
        const currentBgColor = `rgb(${bgRedInput.value}, ${bgGreenInput.value}, ${bgBlueInput.value})`; const currentTextColor = `rgb(${textRedInput.value}, ${textGreenInput.value}, ${textBlueInput.value})`;
        const savedFav = addThemeFavorite(name, currentBgColor, currentTextColor); newThemeFavoriteNameInput.value = ''; populateThemeFavorites(); themeFavoritesSelect.value = savedFav.id; enableDisableDeleteButton(); alert(`Tema '${savedFav.name}' lagret!`); console.log(`Theme favorite saved: ${savedFav.name}`, savedFav);
    }

    function handleDeleteFavorite() {
        const selectedId = themeFavoritesSelect.value; if (!selectedId) return; const favorites = loadThemeFavorites(); const fav = favorites.find(f => f.id === selectedId);
        if (fav && confirm(`Slette favorittema '${fav.name}'?`)) { deleteThemeFavorite(selectedId); populateThemeFavorites(); console.log(`Theme favorite deleted: ${fav.name} (${selectedId})`); }
    }

    function handleSaveTournamentSettings(){
        console.log("Saving tournament rule edits..."); let changesMade=false; let needsUIUpdate=false; const cLI=state.live.currentLevelIndex; let overallValid=true; const newBlindLevels=[]; const editBlindRows=editBlindStructureBody.querySelectorAll('tr'); let errorMessages = [];
        if(editBlindRows.length===0){ alert("Minst ett nivå kreves."); return; }
        editBlindRows.forEach((row,index)=>{
            const levelNum=index+1; let rowValid=true; const sbInput=row.querySelector('.sb-input'); const bbInput=row.querySelector('.bb-input'); const anteInput=row.querySelector('.ante-input'); const durationInput=row.querySelector('.duration-input'); const pauseInput=row.querySelector('.pause-duration-input'); const isPastLevel = levelNum <= cLI && !state.live.isOnBreak;
            let sb, bb, ante, duration, pauseMinutes;
            if (isPastLevel) { if (index < state.config.blindLevels.length) { const pastLevelData = state.config.blindLevels[index]; sb = pastLevelData.sb; bb = pastLevelData.bb; ante = pastLevelData.ante; duration = pastLevelData.duration; pauseMinutes = pastLevelData.pauseMinutes; } else { console.error(`Error accessing past level data for index ${index}`); rowValid = false; } }
            else { sb=parseInt(sbInput.value); bb=parseInt(bbInput.value); ante=parseInt(anteInput.value)||0; duration=parseInt(durationInput.value); pauseMinutes=parseInt(pauseInput.value)||0; [sbInput,bbInput,anteInput,durationInput,pauseInput].forEach(el=>el.classList.remove('invalid'));
                 if(isNaN(duration)||duration<=0){rowValid=false;durationInput.classList.add('invalid');} if(isNaN(sb)||sb<0){rowValid=false;sbInput.classList.add('invalid');} if(isNaN(bb)||bb<=0){rowValid=false;bbInput.classList.add('invalid');} else if (sb > bb) { rowValid = false; sbInput.classList.add('invalid'); bbInput.classList.add('invalid'); errorMessages.push(`Nivå ${levelNum}: SB (${sb}) > BB (${bb})`); } else if (bb > 0 && sb < 0) { rowValid = false; sbInput.classList.add('invalid'); } if(isNaN(ante)||ante<0){rowValid=false;anteInput.classList.add('invalid');} if(isNaN(pauseMinutes)||pauseMinutes<0){rowValid=false;pauseInput.classList.add('invalid');} }
            if(!rowValid) overallValid=false; newBlindLevels.push({level:levelNum,sb:sb,bb:bb,ante:ante,duration:duration,pauseMinutes:pauseMinutes});
        });
        if(!overallValid){ let alertMsg = "Ugyldige verdier i blindstruktur:\n\n- " + [...new Set(errorMessages)].join("\n- "); if (errorMessages.length === 0) alertMsg = "Ugyldige verdier (sjekk markerte felt)."; alert(alertMsg); return; }
        if(JSON.stringify(state.config.blindLevels)!==JSON.stringify(newBlindLevels)){ state.config.blindLevels=newBlindLevels; changesMade=true; needsUIUpdate=true; logActivity(state.live.activityLog,"Blindstruktur endret."); console.log("Blinds structure changed and saved.", state.config.blindLevels); }
        const newPaidPlaces=parseInt(editPaidPlacesInput.value); const newPrizeDist=editPrizeDistTextarea.value.split(',').map(p=>parseFloat(p.trim())).filter(p=>!isNaN(p)&&p>=0); let prizesValid=true; let prizeErrorMessages = [];
        if(isNaN(newPaidPlaces)||newPaidPlaces<=0){ prizesValid=false; prizeErrorMessages.push("Ugyldig antall betalte plasser (> 0)."); } else if(newPrizeDist.length!==newPaidPlaces){ prizesValid=false; prizeErrorMessages.push(`Antall premier (${newPrizeDist.length}) matcher ikke Antall Betalte (${newPaidPlaces}).`); } else { const sum=newPrizeDist.reduce((a,b)=>a+b,0); if(Math.abs(sum-100)>0.1){ prizesValid=false; prizeErrorMessages.push(`Premiesum (${sum.toFixed(1)}%) er ikke 100%.`); } }
        if (!prizesValid) { alert("Feil i premier:\n\n- " + prizeErrorMessages.join("\n- ")); return; }
        if(state.config.paidPlaces!==newPaidPlaces || JSON.stringify(state.config.prizeDistribution)!==JSON.stringify(newPrizeDist)){ const playersInMoney = state.live.eliminatedPlayers.filter(p => p.place && p.place <= state.config.paidPlaces).length; if (playersInMoney === 0 || confirm(`Advarsel: ${playersInMoney} spiller(e) er allerede i pengene. Endre premier?`)) { state.config.paidPlaces=newPaidPlaces; state.config.prizeDistribution=newPrizeDist; changesMade=true; needsUIUpdate=true; logActivity(state.live.activityLog,"Premiestruktur endret."); console.log("Prizes changed and saved", state.config.paidPlaces, state.config.prizeDistribution); } else { console.log("Prize change cancelled."); editPaidPlacesInput.value = state.config.paidPlaces; editPrizeDistTextarea.value = state.config.prizeDistribution.join(', '); return; } }
        if(changesMade){ if(saveTournamentState(currentTournamentId,state)){ alert("Regelendringer lagret!"); if(needsUIUpdate) updateUI(); closeTournamentModal(); } else alert("Lagring feilet!"); }
        else { alert("Ingen regelendringer å lagre."); closeTournamentModal(); }
    }

     function handleSaveUiSettings(){
         console.log("Saving UI settings..."); let themeChanged = false; let layoutChanged = false;
        const finalBgColor=`rgb(${bgRedInput.value}, ${bgGreenInput.value}, ${bgBlueInput.value})`; const finalTextColor=`rgb(${textRedInput.value}, ${textGreenInput.value}, ${textBlueInput.value})`;
        const finalElementLayouts={ canvas: {height: parseInt(canvasHeightInput.value)}, title: { x: parseInt(titleXInput.value), y: parseInt(titleYInput.value), width: parseInt(titleWidthInput.value), fontSize: parseFloat(titleFontSizeInput.value) }, timer: { x: parseInt(timerXInput.value), y: parseInt(timerYInput.value), width: parseInt(timerWidthInput.value), fontSize: parseFloat(timerFontSizeInput.value) }, blinds: { x: parseInt(blindsXInput.value), y: parseInt(blindsYInput.value), width: parseInt(blindsWidthInput.value), fontSize: parseFloat(blindsFontSizeInput.value) }, logo: { x: parseInt(logoXInput.value), y: parseInt(logoYInput.value), width: parseInt(logoWidthInput.value), height: parseInt(logoHeightInput.value) }, info: { x: parseInt(infoXInput.value), y: parseInt(infoYInput.value), width: parseInt(infoWidthInput.value), fontSize: parseFloat(infoFontSizeInput.value), showNextBlinds: toggleInfoNextBlinds.checked, showNextPause: toggleInfoNextPause.checked, showAvgStack: toggleInfoAvgStack.checked, showPlayers: toggleInfoPlayers.checked, showLateReg: toggleInfoLateReg.checked } };
        if(finalBgColor !== originalThemeBg || finalTextColor !== originalThemeText){ saveThemeBgColor(finalBgColor); saveThemeTextColor(finalTextColor); console.log("Theme colors saved."); themeChanged = true; }
        if(JSON.stringify(finalElementLayouts) !== JSON.stringify(originalElementLayouts)){ saveElementLayouts(finalElementLayouts); console.log("Element layouts saved."); layoutChanged = true; }
         if(themeChanged || layoutChanged){ applyThemeAndLayout(finalBgColor, finalTextColor, finalElementLayouts); alert("Utseende lagret!"); closeUiModal(false); }
         else { alert("Ingen utseendeendringer å lagre."); closeUiModal(false); }
     }

     function handleResetLayoutTheme() {
         if (confirm("Tilbakestille layout og farger til standard?\nLagrede favoritter påvirkes ikke.")) {
             const defaultLayout = DEFAULT_ELEMENT_LAYOUTS; const defaultBg = DEFAULT_THEME_BG; const defaultText = DEFAULT_THEME_TEXT; console.log("Resetting UI to defaults."); applyThemeAndLayout(defaultBg, defaultText, defaultLayout);
             blockSliderUpdates=true; const [bgR, bgG, bgB] = parseRgbString(defaultBg); const bgHSL = rgbToHsl(bgR, bgG, bgB); bgRedSlider.value=bgRedInput.value=bgR; bgGreenSlider.value=bgGreenInput.value=bgG; bgBlueSlider.value=bgBlueInput.value=bgB; bgHueSlider.value=bgHueInput.value=bgHSL.h; bgSatSlider.value=bgSatInput.value=bgHSL.s; bgLigSlider.value=bgLigInput.value=bgHSL.l; const [textR, textG, textB] = parseRgbString(defaultText); const textHSL = rgbToHsl(textR, textG, textB); textRedSlider.value=textRedInput.value=textR; textGreenSlider.value=textGreenInput.value=textG; textBlueSlider.value=textBlueInput.value=textB; textHueSlider.value=textHueInput.value=textHSL.h; textSatSlider.value=textSatInput.value=textHSL.s; textLigSlider.value=textLigInput.value=textHSL.l;
             canvasHeightInput.value = canvasHeightSlider.value = defaultLayout.canvas.height; titleXInput.value = titleXSlider.value = defaultLayout.title.x; titleYInput.value = titleYSlider.value = defaultLayout.title.y; titleWidthInput.value = titleWidthSlider.value = defaultLayout.title.width; titleFontSizeInput.value = titleFontSizeSlider.value = defaultLayout.title.fontSize; timerXInput.value = timerXSlider.value = defaultLayout.timer.x; timerYInput.value = timerYSlider.value = defaultLayout.timer.y; timerWidthInput.value = timerWidthSlider.value = defaultLayout.timer.width; timerFontSizeInput.value = timerFontSizeSlider.value = defaultLayout.timer.fontSize; blindsXInput.value = blindsXSlider.value = defaultLayout.blinds.x; blindsYInput.value = blindsYSlider.value = defaultLayout.blinds.y; blindsWidthInput.value = blindsWidthSlider.value = defaultLayout.blinds.width; blindsFontSizeInput.value = blindsFontSizeSlider.value = defaultLayout.blinds.fontSize; logoXInput.value = logoXSlider.value = defaultLayout.logo.x; logoYInput.value = logoYSlider.value = defaultLayout.logo.y; logoWidthInput.value = logoWidthSlider.value = defaultLayout.logo.width; logoHeightInput.value = logoHeightSlider.value = defaultLayout.logo.height; infoXInput.value = infoXSlider.value = defaultLayout.info.x; infoYInput.value = infoYSlider.value = defaultLayout.info.y; infoWidthInput.value = infoWidthSlider.value = defaultLayout.info.width; infoFontSizeInput.value = infoFontSizeSlider.value = defaultLayout.info.fontSize;
             for (const key in infoParagraphs) { const checkboxId = `toggleInfo${key.substring(4)}`; const checkbox = document.getElementById(checkboxId); if(checkbox) checkbox.checked = defaultLayout.info[key] ?? true; }
            blockSliderUpdates=false;
             updateColorAndLayoutPreviews(); alert("Layout og farger er tilbakestilt.\nTrykk 'Lagre Utseende' for å beholde.")
         }
     }
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===


    // === 13: TOURNAMENT FINISH LOGIC START ===
    function finishTournament() {
        if (state.live.status === 'finished') return;
        console.log("Finishing tournament..."); logActivity(state.live.activityLog, "Turnering markeres som fullført.");
        if (timerInterval) clearInterval(timerInterval); timerInterval = null; if (realTimeInterval) clearInterval(realTimeInterval); realTimeInterval = null;
        state.live.status = 'finished'; state.live.isOnBreak = false; state.live.timeRemainingInLevel = 0; state.live.timeRemainingInBreak = 0;
        if (state.live.players.length === 1) {
            const winner = state.live.players[0]; winner.place = 1; state.live.eliminatedPlayers.push(winner); state.live.players.splice(0, 1); logActivity(state.live.activityLog, `Vinner: ${winner.name}!`); console.log(`Winner declared: ${winner.name}`);
        } else if (state.live.players.length > 1) {
             logActivity(state.live.activityLog, `Turnering fullført med ${state.live.players.length} spillere igjen (Deal / Chop?).`); console.warn(`Finished with ${state.live.players.length} players remaining.`);
             state.live.players.forEach(p => { p.eliminated = true; p.place = null; state.live.eliminatedPlayers.push(p); }); state.live.players = [];
        } else { logActivity(state.live.activityLog, `Turnering fullført uten aktive spillere.`); console.warn("Finished with 0 active players."); }
        state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));
        updateUI(); saveTournamentState(currentTournamentId, state); alert("Turneringen er fullført!");
    }
    // === 13: TOURNAMENT FINISH LOGIC END ===


    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    if(startPauseButton) startPauseButton.addEventListener('click', handleStartPause);
    if(prevLevelButton) prevLevelButton.addEventListener('click', () => handleAdjustLevel(-1));
    if(nextLevelButton) nextLevelButton.addEventListener('click', () => handleAdjustLevel(1));
    if(adjustTimeMinusButton) adjustTimeMinusButton.addEventListener('click', () => handleAdjustTime(-60));
    if(adjustTimePlusButton) adjustTimePlusButton.addEventListener('click', () => handleAdjustTime(60));
    if(lateRegButton) lateRegButton.addEventListener('click', handleLateRegClick);
    if(endTournamentButton) endTournamentButton.addEventListener('click', handleEndTournament);
    if(btnForceSave) btnForceSave.addEventListener('click', handleForceSave);
    if(btnBackToMainLive) btnBackToMainLive.addEventListener('click', handleBackToMain);
    if(btnEditTournamentSettings) btnEditTournamentSettings.addEventListener('click', openTournamentModal);
    if(btnEditUiSettings) btnEditUiSettings.addEventListener('click', openUiModal);
    if(liveCanvas) { liveCanvas.addEventListener('click', (e) => { const clickedElement = e.target.closest('.clickable-element'); if (clickedElement && !isModalOpen) { openUiModal(); } }); }
    if(closeTournamentModalButton) closeTournamentModalButton.addEventListener('click', closeTournamentModal);
    if(btnCancelTournamentEdit) btnCancelTournamentEdit.addEventListener('click', closeTournamentModal);
    if(btnAddEditLevel) btnAddEditLevel.addEventListener('click', () => addEditBlindLevelRow());
    if(btnGenerateEditPayout) btnGenerateEditPayout.addEventListener('click', generateEditPayout);
    if(btnSaveTournamentSettings) btnSaveTournamentSettings.addEventListener('click', handleSaveTournamentSettings);
    if(closeUiModalButton) closeUiModalButton.addEventListener('click', () => closeUiModal(true));
    if(btnCancelUiEdit) btnCancelUiEdit.addEventListener('click', () => closeUiModal(true));
    if(btnSaveUiSettings) btnSaveUiSettings.addEventListener('click', handleSaveUiSettings);
    if(btnResetLayoutTheme) btnResetLayoutTheme.addEventListener('click', handleResetLayoutTheme);
    window.addEventListener('click', (e) => { if (isModalOpen && currentOpenModal && e.target === currentOpenModal) { if (currentOpenModal === uiSettingsModal) closeUiModal(true); else if (currentOpenModal === tournamentSettingsModal) closeTournamentModal(); } });
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===


    // === 15: INITIAL UI RENDER & TIMER START ===
    console.log("Performing initial UI render...");
    updateUI();
    startRealTimeClock();
    if (state.live.status === 'running') { console.log("Tournament state is 'running', starting timer interval."); timerInterval = setInterval(tick, 1000); }
    else if (state.live.status === 'finished') { console.log("Tournament state is 'finished'. Final UI state applied."); }
    else { console.log(`Tournament state is '${state.live.status}'. Timer not started.`); }
    console.log("Tournament page fully initialized.");
    // === 15: INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
