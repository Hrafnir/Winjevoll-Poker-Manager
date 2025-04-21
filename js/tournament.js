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
    // logActivity defined earlier
    // renderActivityLog defined earlier
    // === 07b: HELPER FUNCTIONS - LOGGING END ===


    // === 08: UI UPDATE FUNCTIONS START ===
    // renderPlayerList defined earlier
    // displayPrizes defined earlier
    // updateUI defined earlier
    // === 08: UI UPDATE FUNCTIONS END ===


    // === 09: TIMER LOGIC START ===
    // tick defined earlier
    // startRealTimeClock defined earlier
    // === 09: TIMER LOGIC END ===


    // === 10: EVENT HANDLERS - CONTROLS START ===
    // handleStartPause defined earlier
    // handleAdjustTime defined earlier
    // handleAdjustLevel defined earlier
    // handleEndTournament defined earlier
    // handleForceSave defined earlier
    // handleBackToMain defined earlier
    // === 10: EVENT HANDLERS - CONTROLS END ===


    // === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    // handleRebuy defined earlier
    // handleAddon defined earlier
    // handleEliminate defined earlier
    // handleRestore defined earlier
    // handleEditPlayer defined earlier
    // handleLateRegClick defined earlier
    // === 11: EVENT HANDLERS - PLAYER ACTIONS END ===


    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    // openTournamentModal defined earlier
    // closeTournamentModal defined earlier
    // openUiModal defined earlier
    // closeUiModal defined earlier
    // addEditBlindLevelRow defined earlier
    // updateEditLevelNumbers defined earlier
    // generateEditPayout defined earlier
    // syncRgbFromHsl defined earlier
    // syncHslFromRgb defined earlier
    // updateColorAndLayoutPreviews defined earlier
    // handleThemeLayoutControlChange defined earlier
    // addThemeAndLayoutListeners defined earlier
    // removeThemeAndLayoutListeners defined earlier
    // populateThemeFavorites defined earlier
    // enableDisableDeleteButton defined earlier
    // handleLoadFavorite defined earlier
    // handleSaveFavorite defined earlier
    // handleDeleteFavorite defined earlier
    // handleSaveTournamentSettings defined earlier
    // handleSaveUiSettings defined earlier
    // handleResetLayoutTheme defined earlier
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===


    // === 13: TOURNAMENT FINISH LOGIC START ===
    // finishTournament defined earlier
    // === 13: TOURNAMENT FINISH LOGIC END ===


    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    // Add listeners (ensure all elements exist)
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
    updateUI(); // Initial render based on loaded state
    startRealTimeClock(); // Start the wall clock

    if (state.live.status === 'running') {
        console.log("Tournament state is 'running', starting timer interval.");
        timerInterval = setInterval(tick, 1000); // Start level/break timer if already running
    } else if (state.live.status === 'finished') {
        console.log("Tournament state is 'finished'. Final UI state applied.");
    } else {
         console.log(`Tournament state is '${state.live.status}'. Timer not started.`);
    }
    console.log("Tournament page fully initialized.");
    // === 15: INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
