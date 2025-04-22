// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    console.log("Tournament page DOM loaded.");
    // === 02: STATE VARIABLES START ===
    let currentTournamentId = getActiveTournamentId();
    let state = null;
    let timerInterval = null;
    let realTimeInterval = null;
    let isModalOpen = false;
    let currentOpenModal = null;

    // UI Modal State
    let originalThemeBg = '';
    let originalThemeText = '';
    let originalElementLayouts = {};
    let blockSliderUpdates = false;

    // Drag and Drop State
    let isDragging = false;
    let draggedElement = null;
    let offsetX = 0; // Mouse offset within element
    let offsetY = 0;

    // Tournament Modal State
    let editBlindLevelCounter = 0;
    const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // Main page elements
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
    const headerRightControls = document.querySelector('.header-right-controls');

    // Canvas & Elements
    const liveCanvas = document.getElementById('live-canvas');
    const titleElement = document.getElementById('title-element');
    const timerElement = document.getElementById('timer-element');
    const blindsElement = document.getElementById('blinds-element');
    const logoElement = document.getElementById('logo-element');
    const infoElement = document.getElementById('info-element');
    // Array for easy iteration
    const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement];

    // Specific Display Elements
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
    // Visibility Toggles (NYE)
    const toggleTitleElement = document.getElementById('toggleTitleElement');
    const toggleTimerElement = document.getElementById('toggleTimerElement');
    const toggleBlindsElement = document.getElementById('toggleBlindsElement');
    const toggleLogoElement = document.getElementById('toggleLogoElement');
    const toggleInfoElement = document.getElementById('toggleInfoElement');
    const visibilityToggles = [toggleTitleElement, toggleTimerElement, toggleBlindsElement, toggleLogoElement, toggleInfoElement];
    // Size Controls (X/Y removed)
    const titleWidthSlider = document.getElementById('titleWidthSlider'); const titleWidthInput = document.getElementById('titleWidthInput'); const titleFontSizeSlider = document.getElementById('titleFontSizeSlider'); const titleFontSizeInput = document.getElementById('titleFontSizeInput');
    const timerWidthSlider = document.getElementById('timerWidthSlider'); const timerWidthInput = document.getElementById('timerWidthInput'); const timerFontSizeSlider = document.getElementById('timerFontSizeSlider'); const timerFontSizeInput = document.getElementById('timerFontSizeInput');
    const blindsWidthSlider = document.getElementById('blindsWidthSlider'); const blindsWidthInput = document.getElementById('blindsWidthInput'); const blindsFontSizeSlider = document.getElementById('blindsFontSizeSlider'); const blindsFontSizeInput = document.getElementById('blindsFontSizeInput');
    const logoWidthSlider = document.getElementById('logoWidthSlider'); const logoWidthInput = document.getElementById('logoWidthInput'); const logoHeightSlider = document.getElementById('logoHeightSlider'); const logoHeightInput = document.getElementById('logoHeightInput');
    const infoWidthSlider = document.getElementById('infoWidthSlider'); const infoWidthInput = document.getElementById('infoWidthInput'); const infoFontSizeSlider = document.getElementById('infoFontSizeSlider'); const infoFontSizeInput = document.getElementById('infoFontSizeInput');
    // Info Toggles
    const toggleInfoNextBlinds = document.getElementById('toggleInfoNextBlinds'); const toggleInfoNextPause = document.getElementById('toggleInfoNextPause'); const toggleInfoAvgStack = document.getElementById('toggleInfoAvgStack'); const toggleInfoPlayers = document.getElementById('toggleInfoPlayers'); const toggleInfoLateReg = document.getElementById('toggleInfoLateReg');
    const infoParagraphs = { showNextBlinds: document.getElementById('info-next-blinds'), showNextPause: infoNextPauseParagraph, showAvgStack: document.getElementById('info-avg-stack'), showPlayers: document.getElementById('info-players'), showLateReg: document.getElementById('info-late-reg') };
    // Theme Controls
    const bgRedSlider = document.getElementById('bgRedSlider'); const bgGreenSlider = document.getElementById('bgGreenSlider'); const bgBlueSlider = document.getElementById('bgBlueSlider'); const bgRedInput = document.getElementById('bgRedInput'); const bgGreenInput = document.getElementById('bgGreenInput'); const bgBlueInput = document.getElementById('bgBlueInput'); const bgColorPreview = document.getElementById('bg-color-preview');
    const textRedSlider = document.getElementById('textRedSlider'); const textGreenSlider = document.getElementById('textGreenSlider'); const textBlueSlider = document.getElementById('textBlueSlider'); const textRedInput = document.getElementById('textRedInput'); const textGreenInput = document.getElementById('textGreenInput'); const textBlueInput = document.getElementById('textBlueInput'); const textColorPreview = document.getElementById('text-color-preview');
    const bgHueSlider = document.getElementById('bgHueSlider'); const bgHueInput = document.getElementById('bgHueInput'); const bgSatSlider = document.getElementById('bgSatSlider'); const bgSatInput = document.getElementById('bgSatInput'); const bgLigSlider = document.getElementById('bgLigSlider'); const bgLigInput = document.getElementById('bgLigInput');
    const textHueSlider = document.getElementById('textHueSlider'); const textHueInput = document.getElementById('textHueInput'); const textSatSlider = document.getElementById('textSatSlider'); const textSatInput = document.getElementById('textSatInput'); const textLigSlider = document.getElementById('textLigSlider'); const textLigInput = document.getElementById('textLigInput');
    const themeFavoritesSelect = document.getElementById('themeFavoritesSelect'); const btnLoadThemeFavorite = document.getElementById('btnLoadThemeFavorite'); const newThemeFavoriteNameInput = document.getElementById('newThemeFavoriteName'); const btnSaveThemeFavorite = document.getElementById('btnSaveThemeFavorite'); const btnDeleteThemeFavorite = document.getElementById('btnDeleteThemeFavorite');
    // Modal Action Buttons
    const btnSaveUiSettings = document.getElementById('btn-save-ui-settings'); const btnCancelUiEdit = document.getElementById('btn-cancel-ui-edit'); const btnResetLayoutTheme = document.getElementById('btnResetLayoutTheme');

    // Lists of controls for easier event listener management
    const sizeSliders = [canvasHeightSlider, titleWidthSlider, titleFontSizeSlider, timerWidthSlider, timerFontSizeSlider, blindsWidthSlider, blindsFontSizeSlider, logoWidthSlider, logoHeightSlider, infoWidthSlider, infoFontSizeSlider];
    const sizeInputs = [canvasHeightInput, titleWidthInput, titleFontSizeInput, timerWidthInput, timerFontSizeInput, blindsWidthInput, blindsFontSizeInput, logoWidthInput, logoHeightInput, infoWidthInput, infoFontSizeInput];
    const colorSliders = [bgHueSlider, bgSatSlider, bgLigSlider, bgRedSlider, bgGreenSlider, bgBlueSlider, textHueSlider, textSatSlider, textLigSlider, textRedSlider, textGreenSlider, textBlueSlider];
    const colorInputs = [bgHueInput, bgSatInput, bgLigInput, bgRedInput, bgGreenInput, bgBlueInput, textHueInput, textSatInput, textLigInput, textRedInput, textGreenInput, textBlueInput];
    const internalInfoToggles = [toggleInfoNextBlinds, toggleInfoNextPause, toggleInfoAvgStack, toggleInfoPlayers, toggleInfoLateReg];
    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig turneringsdata (ID: ${currentTournamentId}).`); console.error("Invalid tournament state loaded:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    // Ensure defaults (robustness)
    state.live = state.live || {}; state.live.status = state.live.status || 'paused'; state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0; state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60 || 1200); state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.players = state.live.players || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.knockoutLog = state.live.knockoutLog || []; state.live.activityLog = state.live.activityLog || []; state.live.totalPot = state.live.totalPot ?? 0; state.live.totalEntries = state.live.totalEntries ?? 0; state.live.totalRebuys = state.live.totalRebuys ?? 0; state.live.totalAddons = state.live.totalAddons ?? 0;
    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, state);
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 04b: THEME & LAYOUT APPLICATION START ===
    function applyThemeAndLayout(bgColor, textColor, elementLayouts) {
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--live-page-bg', bgColor); rootStyle.setProperty('--live-page-text', textColor);
        try { const [r, g, b] = parseRgbString(bgColor); const brightness = (r * 299 + g * 587 + b * 114) / 1000; const borderColor = brightness < 128 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'; rootStyle.setProperty('--live-ui-border', borderColor); } catch (e) { console.error("Error setting border color:", e); rootStyle.setProperty('--live-ui-border', 'rgba(128, 128, 128, 0.15)'); }
        const defaults = DEFAULT_ELEMENT_LAYOUTS;
        rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas?.height ?? defaults.canvas.height}vh`);

        // Apply layout DIRECTLY to elements
        draggableElements.forEach(element => {
            if (!element) return; // Skip if element not found
            const elementId = element.id.replace('-element', ''); // e.g., 'title', 'timer'
            const layout = { ...defaults[elementId], ...(elementLayouts[elementId] || {}) };

             // Set visibility first
             element.classList.toggle('element-hidden', !(layout.isVisible ?? true));

             // Set position and size if visible
             if (layout.isVisible ?? true) {
                 element.style.left = `${layout.x}%`;
                 element.style.top = `${layout.y}%`;
                 element.style.width = `${layout.width}%`;
                 // Height is special (only logo uses % height, others use font-size)
                 if (elementId === 'logo') {
                     element.style.height = `${layout.height}%`;
                     element.style.fontSize = '1em'; // Reset font size
                 } else {
                     element.style.fontSize = `${layout.fontSize}em`;
                     element.style.height = 'auto';
                 }
             }
         });

        // Apply info box internal toggles
        const infoLayout = { ...defaults.info, ...(elementLayouts.info || {}) };
        for (const key in infoParagraphs) {
            if (infoParagraphs[key]) {
                infoParagraphs[key].classList.toggle('hidden', !(infoLayout[key] ?? true));
            }
        }
        // console.log(`Theme/Layout applied directly`);
    }
    // Load and apply initial theme/layout
    const initialBgColor = loadThemeBgColor(); const initialTextColor = loadThemeTextColor(); const initialElementLayouts = loadElementLayouts();
    applyThemeAndLayout(initialBgColor, initialTextColor, initialElementLayouts);
    // === 04b: THEME & LAYOUT APPLICATION END ===


    // === 04c: DRAG AND DROP LOGIC START ===
    function startDrag(event, element) {
        // Prevent drag on non-primary button click or if a modal is open
        if (event.button !== 0 || isModalOpen) return;

        event.preventDefault(); // Prevent default image dragging etc.
        draggedElement = element;
        isDragging = true;

        // Calculate mouse offset relative to element's top-left corner
        const rect = element.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        element.classList.add('dragging');

        // Add listeners to the document to track movement anywhere
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('mouseleave', endDrag); // Also end if mouse leaves window
    }

    function doDrag(event) {
        if (!isDragging || !draggedElement) return;

        event.preventDefault();

        const canvasRect = liveCanvas.getBoundingClientRect();
        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;

        // Calculate desired new top-left position in pixels, considering mouse offset
        let newXpx = event.clientX - canvasRect.left - offsetX;
        let newYpx = event.clientY - canvasRect.top - offsetY;

        // Convert pixel position to percentage relative to canvas size
        let newXPercent = (newXpx / canvasWidth) * 100;
        let newYPercent = (newYpx / canvasHeight) * 100;

        // Optional: Clamp position to stay within canvas boundaries (0% to approx 95-98%)
        const elementWidthPercent = (draggedElement.offsetWidth / canvasWidth) * 100;
        const elementHeightPercent = (draggedElement.offsetHeight / canvasHeight) * 100;
        newXPercent = Math.max(0, Math.min(newXPercent, 100 - elementWidthPercent));
        newYPercent = Math.max(0, Math.min(newYPercent, 100 - elementHeightPercent));

        // Apply the new percentage position
        draggedElement.style.left = `${newXPercent}%`;
        draggedElement.style.top = `${newYPercent}%`;
    }

    function endDrag(event) {
        if (!isDragging || !draggedElement) return;

        event.preventDefault();
        const elementId = draggedElement.id.replace('-element', '');
        console.log(`Drag ended for ${elementId}`);

        draggedElement.classList.remove('dragging');

        // Remove document listeners
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('mouseleave', endDrag);

        // Calculate final percentage position
        const canvasRect = liveCanvas.getBoundingClientRect();
        const finalLeftPx = draggedElement.offsetLeft; // Use offsetLeft/Top for final pixel pos
        const finalTopPx = draggedElement.offsetTop;
        const finalXPercent = parseFloat(((finalLeftPx / canvasRect.width) * 100).toFixed(2)); // Round to 2 decimals
        const finalYPercent = parseFloat(((finalTopPx / canvasRect.height) * 100).toFixed(2));

         // Update the position in the saved layout state
         let currentLayouts = loadElementLayouts(); // Load current full layout state
         if (currentLayouts[elementId]) {
             currentLayouts[elementId].x = finalXPercent;
             currentLayouts[elementId].y = finalYPercent;
             saveElementLayouts(currentLayouts); // Save updated state
             console.log(`Saved new position for ${elementId}: x=${finalXPercent}%, y=${finalYPercent}%`);

             // Update the 'original' state if modal is open, so 'Cancel' doesn't revert position
             if (isModalOpen && currentOpenModal === uiSettingsModal) {
                 originalElementLayouts[elementId].x = finalXPercent;
                 originalElementLayouts[elementId].y = finalYPercent;
                 // Note: Sliders in modal are NOT updated live during drag
             }
         } else {
             console.error(`Could not find layout key '${elementId}' to save position.`);
         }


        // Reset drag state
        isDragging = false;
        draggedElement = null;
    }
    // === 04c: DRAG AND DROP LOGIC END ===


    // === 05: HELPER FUNCTIONS - FORMATTING START ===
    function formatTime(seconds) { if (isNaN(seconds) || seconds < 0) return "00:00"; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }
    function formatBlindsHTML(level) { if (!level) return `<span class="value">--</span>/<span class="value">--</span><span class="label">A:</span><span class="value">--</span>`; let anteHtml = ''; if (level.ante > 0) anteHtml = `<span class="label">A:</span><span class="value">${level.ante.toLocaleString('nb-NO')}</span>`; const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO'); const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO'); return `<span class="value">${sbFormatted}</span>/<span class="value">${bbFormatted}</span>${anteHtml}`; }
    function formatNextBlindsText(level) { if (!level) return "Slutt"; const anteText = level.ante > 0 ? ` / A:${level.ante.toLocaleString('nb-NO')}` : ''; const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO'); const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO'); return `${sbFormatted}/${bbFormatted}${anteText}`; }
    function getPlayerNameById(playerId) { const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId); return player ? player.name : 'Ukjent'; }
    function roundToNearestValid(value, step = 100) { if (isNaN(value) || value <= 0) return step; const rounded = Math.round(value / step) * step; return Math.max(step, rounded); }
    // === 05: HELPER FUNCTIONS - FORMATTING END ===


    // === 06: HELPER FUNCTIONS - CALCULATIONS START ===
    function calculateTotalChips() { const startingChips = (state.live.totalEntries || 0) * (state.config.startStack || 0); const rebuyChips = (state.live.totalRebuys || 0) * (state.config.rebuyChips || 0); const addonChips = (state.live.totalAddons || 0) * (state.config.addonChips || 0); return startingChips + rebuyChips + addonChips; }
    function calculateAverageStack() { const activePlayerCount = state.live.players.length; if (activePlayerCount === 0) return 0; const totalChips = calculateTotalChips(); return Math.round(totalChips / activePlayerCount); }
    function calculatePrizes() { const prizes = []; const paidPlaces = state.config.paidPlaces || 0; const distributionPercentages = state.config.prizeDistribution || []; const totalPot = state.live.totalPot || 0; let prizePot = totalPot; if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) prizePot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0); prizePot = Math.max(0, prizePot); if (prizePot <= 0 || paidPlaces <= 0 || distributionPercentages.length !== paidPlaces) return prizes; let distributedSum = 0; for (let i = 0; i < paidPlaces; i++) { const percentage = distributionPercentages[i] || 0; let amount; if (i === paidPlaces - 1) amount = Math.max(0, prizePot - distributedSum); else amount = Math.floor((prizePot * percentage) / 100); prizes.push({ place: i + 1, amount: amount, percentage: percentage }); distributedSum += amount; } if (Math.abs(distributedSum - prizePot) > 1 && paidPlaces > 1) console.warn(`Prize calculation warning: Distributed ${distributedSum} != Pot ${prizePot}`); return prizes; }
    function findNextPauseInfo() { const currentLevelIndex = state.live.currentLevelIndex; const blindLevels = state.config.blindLevels; if (!blindLevels) return null; const searchStartIndex = state.live.isOnBreak ? currentLevelIndex + 1 : currentLevelIndex; for (let i = searchStartIndex; i < blindLevels.length; i++) { if (blindLevels[i].pauseMinutes > 0) return { level: blindLevels[i].level, duration: blindLevels[i].pauseMinutes }; } return null; }
    // === 06: HELPER FUNCTIONS - CALCULATIONS END ===


    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT START ===
    function assignTableSeat(player, excludeTableNum = null) { console.log(`Assigning seat for ${player.name}, excluding table ${excludeTableNum}`); const tables = {}; let validTables = []; state.live.players.forEach(p => { if (p.id !== player.id && p.table && p.table !== excludeTableNum) tables[p.table] = (tables[p.table] || 0) + 1; }); validTables = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).filter(t => t.tableNum !== excludeTableNum); validTables.sort((a, b) => a.count - b.count); let targetTableNum = -1; for (const tableInfo of validTables) { if (tableInfo.count < state.config.playersPerTable) { targetTableNum = tableInfo.tableNum; break; } } if (targetTableNum === -1) { const allExistingTableNumbers = [...new Set(state.live.players.map(p => p.table).filter(t => t > 0))]; let nextTable = allExistingTableNumbers.length > 0 ? Math.max(0, ...allExistingTableNumbers) + 1 : 1; if (nextTable === excludeTableNum) nextTable++; targetTableNum = nextTable; console.log(`No space on existing tables. Creating/using table: ${targetTableNum}`); } const occupiedSeats = state.live.players.filter(p => p.table === targetTableNum).map(p => p.seat); let seatNum = 1; while (occupiedSeats.includes(seatNum)) seatNum++; if (seatNum > state.config.playersPerTable && occupiedSeats.length >= state.config.playersPerTable) { console.error(`CRITICAL ERROR: No seat on table ${targetTableNum}! Assigning ${occupiedSeats.length + 1}`); seatNum = occupiedSeats.length + 1; } player.table = targetTableNum; player.seat = seatNum; console.log(`Assigned ${player.name} to T${player.table} S${player.seat}`); }
    function reassignAllSeats(targetTableNum) { logActivity(state.live.activityLog, `Finalebord (Bord ${targetTableNum})! Trekker nye seter...`); const playersToReseat = state.live.players; const numPlayers = playersToReseat.length; if (numPlayers === 0) return; const seats = Array.from({ length: numPlayers }, (_, i) => i + 1); for (let i = seats.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [seats[i], seats[j]] = [seats[j], seats[i]]; } playersToReseat.forEach((player, index) => { player.table = targetTableNum; player.seat = seats[index]; logActivity(state.live.activityLog, ` -> ${player.name} får sete ${player.seat}.`); }); state.live.players.sort((a, b) => a.seat - b.seat); console.log("Final table seats reassigned."); }
    function checkAndHandleTableBreak() { if (state.live.status === 'finished') return false; const activePlayersCount = state.live.players.length; const maxPlayersPerTable = state.config.playersPerTable; const currentTableNumbers = new Set(state.live.players.map(p => p.table).filter(t => t > 0)); const currentTableCount = currentTableNumbers.size; const targetTableCount = Math.ceil(activePlayersCount / maxPlayersPerTable); const finalTableSize = maxPlayersPerTable; console.log(`Table check: Players=${activePlayersCount}, Tables=${currentTableCount}, Target=${targetTableCount}`); let actionTaken = false; if (currentTableCount > 1 && activePlayersCount <= finalTableSize) { const targetFinalTableNum = 1; logActivity(state.live.activityLog, `Finalebord (${activePlayersCount})! Flytter til B${targetFinalTableNum}...`); alert(`Finalebord (${activePlayersCount})! Flytter til B${targetFinalTableNum}.`); state.live.players.forEach(p => p.table = targetFinalTableNum); reassignAllSeats(targetFinalTableNum); actionTaken = true; console.log("Final table merge."); } else if (currentTableCount > targetTableCount && currentTableCount > 1) { const tables = {}; state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; }); const sortedTables = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).sort((a, b) => a.count - b.count); if (sortedTables.length > 0) { const tableToBreakNum = sortedTables[0].tableNum; const msg = `Slår sammen bord! Flytter fra B${tableToBreakNum}.`; logActivity(state.live.activityLog, msg); alert(msg); const playersToMove = state.live.players.filter(p => p.table === tableToBreakNum); playersToMove.forEach(player => { const oldTable = player.table; const oldSeat = player.seat; player.table = 0; player.seat = 0; assignTableSeat(player, tableToBreakNum); logActivity(state.live.activityLog, ` -> Flyttet ${player.name} (B${oldTable}S${oldSeat}) til B${player.table}S${player.seat}.`); }); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); actionTaken = true; console.log(`Table ${tableToBreakNum} broken.`); } else { console.warn("Table break condition met, but no table found."); } } const balancingDone = balanceTables(); if (actionTaken && !balancingDone) { updateUI(); saveTournamentState(currentTournamentId, state); } else if (!actionTaken && !balancingDone) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); } return actionTaken || balancingDone; }
    function balanceTables() { if (state.live.status === 'finished' || state.live.players.length <= state.config.playersPerTable) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); return false; } let balancingPerformed = false; const maxDifference = 1; while (true) { const tables = {}; state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; }); const tableCounts = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).filter(tc => tc.count > 0); if (tableCounts.length < 2) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; } tableCounts.sort((a, b) => a.count - b.count); const minTable = tableCounts[0]; const maxTable = tableCounts[tableCounts.length - 1]; if (maxTable.count - minTable.count <= maxDifference) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; } balancingPerformed = true; if (tableBalanceInfo) tableBalanceInfo.classList.remove('hidden'); console.log(`Balancing: Max T${maxTable.tableNum}(${maxTable.count}), Min T${minTable.tableNum}(${minTable.count})`); const playersOnMaxTable = state.live.players.filter(p => p.table === maxTable.tableNum); if (playersOnMaxTable.length === 0) { console.error(`Balancing Error: No players on max table ${maxTable.tableNum}!`); if (tableBalanceInfo) tableBalanceInfo.textContent = "Balanseringsfeil!"; break; } const playerToMove = playersOnMaxTable[Math.floor(Math.random() * playersOnMaxTable.length)]; const occupiedSeatsMin = state.live.players.filter(p => p.table === minTable.tableNum).map(p => p.seat); let newSeat = 1; while(occupiedSeatsMin.includes(newSeat)) { newSeat++; } if(newSeat > state.config.playersPerTable) { console.error(`Balancing Error: No seat on target table ${minTable.tableNum}.`); alert(`Balanseringsfeil: Fant ikke sete på bord ${minTable.tableNum}.`); if (tableBalanceInfo) tableBalanceInfo.textContent = "Balanseringsfeil!"; break; } const oldTable = playerToMove.table; const oldSeat = playerToMove.seat; const message = `Balansering: ${playerToMove.name} flyttes fra B${oldTable} S${oldSeat} til B${minTable.tableNum} S${newSeat}.`; playerToMove.table = minTable.tableNum; playerToMove.seat = newSeat; logActivity(state.live.activityLog, message); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); updateUI(); saveTournamentState(currentTournamentId, state); console.log(`Player moved. Re-evaluating...`); } if (balancingPerformed) console.log("Balancing finished."); return balancingPerformed; }
    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT END ===


    // === 07b: HELPER FUNCTIONS - LOGGING START ===
    function logActivity(logArray, message) { if (!logArray) logArray = state.live.activityLog = []; const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); logArray.unshift({ timestamp, message }); const MAX_LOG_ENTRIES = 100; if (logArray.length > MAX_LOG_ENTRIES) logArray.pop(); console.log(`[Log ${timestamp}] ${message}`); }
    function renderActivityLog() { if (!activityLogUl) return; activityLogUl.innerHTML = ''; const logEntries = state?.live?.activityLog || []; if (logEntries.length === 0) { activityLogUl.innerHTML = '<li>Loggen er tom.</li>'; return; } logEntries.forEach(entry => { const li = document.createElement('li'); li.innerHTML = `<span class="log-time">[${entry.timestamp}]</span> ${entry.message}`; activityLogUl.appendChild(li); }); }
    // === 07b: HELPER FUNCTIONS - LOGGING END ===


    // === 08: UI UPDATE FUNCTIONS START ===
    function renderPlayerList() { if (!playerListUl || !eliminatedPlayerListUl || !activePlayerCountSpan || !eliminatedPlayerCountSpan) { console.error("Player list elements missing!"); return; } playerListUl.innerHTML = ''; eliminatedPlayerListUl.innerHTML = ''; const currentLevelNum = state.live.currentLevelIndex + 1; const canRebuy = state.config.type === 'rebuy' && currentLevelNum <= state.config.rebuyLevels; const canAddon = state.config.type === 'rebuy' && currentLevelNum > state.config.rebuyLevels; const canPerformActions = state.live.status !== 'finished'; const sortedActivePlayers = [...state.live.players].sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); sortedActivePlayers.forEach(p => { const li = document.createElement('li'); let info = `${p.name} <span class="player-details">(B${p.table}S${p.seat})</span>`; if (p.rebuys > 0) info += ` <span class="player-details">[${p.rebuys}R]</span>`; if (p.addon) info += ` <span class="player-details">[A]</span>`; if (state.config.type === 'knockout' && p.knockouts > 0) info += ` <span class="player-details">(KOs: ${p.knockouts})</span>`; let actions = ''; if (canPerformActions) { actions += `<button class="btn-edit-player small-button" data-player-id="${p.id}" title="Rediger Navn">✏️</button>`; if (canRebuy) actions += `<button class="btn-rebuy small-button" data-player-id="${p.id}" title="Rebuy">R</button>`; if (canAddon && !p.addon) actions += `<button class="btn-addon small-button" data-player-id="${p.id}" title="Addon">A</button>`; actions += `<button class="btn-eliminate small-button danger-button" data-player-id="${p.id}" title="Eliminer">X</button>`; } li.innerHTML = `<span class="item-name">${info}</span><div class="list-actions player-actions">${actions}</div>`; playerListUl.appendChild(li); }); const sortedEliminatedPlayers = [...state.live.eliminatedPlayers].sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity)); sortedEliminatedPlayers.forEach(p => { const li = document.createElement('li'); let info = `${p.place ?? '?'}. ${p.name}`; if (p.rebuys > 0) info += ` <span class="player-details">[${p.rebuys}R]</span>`; if (p.addon) info += ` <span class="player-details">[A]</span>`; if (state.config.type === 'knockout' && p.knockouts > 0) info += ` <span class="player-details">(KOs: ${p.knockouts})</span>`; if (p.eliminatedBy) info += ` <span class="player-details">(av ${getPlayerNameById(p.eliminatedBy)})</span>`; let actions = ''; if (canPerformActions) actions += `<button class="btn-restore small-button warning-button" data-player-id="${p.id}" title="Gjenopprett">↩️</button>`; li.innerHTML = `<span class="item-name">${info}</span><div class="list-actions player-actions">${actions}</div>`; eliminatedPlayerListUl.appendChild(li); }); activePlayerCountSpan.textContent = state.live.players.length; eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length; playerListUl.querySelectorAll('.btn-edit-player').forEach(btn => btn.onclick = handleEditPlayer); playerListUl.querySelectorAll('.btn-rebuy').forEach(btn => btn.onclick = handleRebuy); playerListUl.querySelectorAll('.btn-addon').forEach(btn => btn.onclick = handleAddon); playerListUl.querySelectorAll('.btn-eliminate').forEach(btn => btn.onclick = handleEliminate); eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(btn => btn.onclick = handleRestore); }
    function displayPrizes() { if (!prizeDisplayLive || !totalPotPrizeSpan) return; const prizeData = calculatePrizes(); const totalPotFormatted = (state.live.totalPot || 0).toLocaleString('nb-NO'); prizeDisplayLive.querySelector('h3').innerHTML = `Premiefordeling (Totalpott: <span id="total-pot">${totalPotFormatted}</span> kr)`; const existingOl = prizeDisplayLive.querySelector('ol'); const existingP = prizeDisplayLive.querySelector('p'); if(existingOl) existingOl.remove(); if(existingP) existingP.remove(); if (prizeData.length > 0) { const ol = document.createElement('ol'); prizeData.forEach(p => { const li = document.createElement('li'); li.textContent = `${p.place}. Plass: ${p.amount.toLocaleString('nb-NO')} kr (${p.percentage}%)`; ol.appendChild(li); }); prizeDisplayLive.appendChild(ol); prizeDisplayLive.classList.remove('hidden'); } else { const p = document.createElement('p'); const paidPlaces = state.config.paidPlaces || 0; const dist = state.config.prizeDistribution || []; const totalPot = state.live.totalPot || 0; let prizePot = totalPot; if (state.config.type === 'knockout') prizePot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0); if (prizePot <= 0 && totalPot > 0) p.textContent = 'Ingen premiepott å fordele (etter evt. bounty).'; else if (prizePot <= 0) p.textContent = 'Ingen premiepott å fordele.'; else if (paidPlaces <= 0) p.textContent = 'Antall betalte plasser er ikke definert.'; else if (dist.length !== paidPlaces) p.textContent = 'Antall premier matcher ikke antall betalte plasser.'; else p.textContent = 'Premiefordeling ikke tilgjengelig.'; prizeDisplayLive.appendChild(p); prizeDisplayLive.classList.add('hidden'); } }
    function updateUI() { if (!state || !state.config || !state.live) { console.error("State missing in updateUI"); if(nameDisplay) nameDisplay.textContent = "Error!"; return; } if (nameDisplay) nameDisplay.textContent = state.config.name; if(currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); const i = state.live.currentLevelIndex; const currentLvl = state.config.blindLevels?.[i]; const nextLvl = state.config.blindLevels?.[i + 1]; const nextPause = findNextPauseInfo(); if (state.live.isOnBreak) { if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak); if(blindsElement) blindsElement.classList.add('hidden'); if(breakInfo) breakInfo.classList.remove('hidden'); } else { if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); if(blindsElement) blindsElement.classList.remove('hidden'); if(breakInfo) breakInfo.classList.add('hidden'); if(currentLevelDisplay) currentLevelDisplay.textContent = `(Nivå ${currentLvl ? currentLvl.level : 'N/A'})`; if(blindsDisplay) blindsDisplay.innerHTML = formatBlindsHTML(currentLvl); } if(nextBlindsDisplay) nextBlindsDisplay.textContent = formatNextBlindsText(nextLvl); if(averageStackDisplay) averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO'); if(playersRemainingDisplay) playersRemainingDisplay.textContent = state.live.players.length; if(totalEntriesDisplay) totalEntriesDisplay.textContent = state.live.totalEntries; const lvlNumLateReg = i + 1; const lateRegOpen = lvlNumLateReg <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished'; if (lateRegStatusDisplay) { if (state.config.lateRegLevel > 0) lateRegStatusDisplay.textContent = `${lateRegOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`; else lateRegStatusDisplay.textContent = 'Ikke aktiv'; } if (infoNextPauseParagraph) { const span = infoNextPauseParagraph.querySelector('#next-pause-time'); if (span) span.textContent = nextPause ? `Etter nivå ${nextPause.level} (${nextPause.duration} min)` : 'Ingen flere'; } const isFin = state.live.status === 'finished'; if(startPauseButton) { startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke'; startPauseButton.disabled = isFin; } if(prevLevelButton) prevLevelButton.disabled = i <= 0 || isFin; if(nextLevelButton) nextLevelButton.disabled = i >= state.config.blindLevels.length - 1 || isFin; if(adjustTimeMinusButton) adjustTimeMinusButton.disabled = isFin; if(adjustTimePlusButton) adjustTimePlusButton.disabled = isFin; if(lateRegButton) lateRegButton.disabled = !lateRegOpen || isFin; if(btnEditTournamentSettings) btnEditTournamentSettings.disabled = isFin; if(endTournamentButton) endTournamentButton.disabled = isFin; renderPlayerList(); displayPrizes(); renderActivityLog(); }
    // === 08: UI UPDATE FUNCTIONS END ===


    // === 09: TIMER LOGIC START ===
    function tick() { if (state.live.status !== 'running') return; if (state.live.isOnBreak) { state.live.timeRemainingInBreak--; if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak); if (state.live.timeRemainingInBreak < 0) { state.live.isOnBreak = false; state.live.currentLevelIndex++; if (state.live.currentLevelIndex >= state.config.blindLevels.length) { logActivity(state.live.activityLog, "Pause ferdig. Blindstruktur fullført."); finishTournament(); return; } const newLvl = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = newLvl.duration * 60; logActivity(state.live.activityLog, `Pause over. Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`); updateUI(); saveTournamentState(currentTournamentId, state); } else if (state.live.timeRemainingInBreak % 15 === 0) saveTournamentState(currentTournamentId, state); } else { state.live.timeRemainingInLevel--; if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); if (state.live.timeRemainingInLevel < 0) { const currentLvl = state.config.blindLevels[state.live.currentLevelIndex]; const pause = currentLvl?.pauseMinutes || 0; if (pause > 0) { state.live.isOnBreak = true; state.live.timeRemainingInBreak = pause * 60; logActivity(state.live.activityLog, `Nivå ${currentLvl.level} ferdig. Starter ${pause} min pause.`); updateUI(); saveTournamentState(currentTournamentId, state); } else { state.live.currentLevelIndex++; if (state.live.currentLevelIndex >= state.config.blindLevels.length) { logActivity(state.live.activityLog, `Nivå ${currentLvl.level} ferdig. Blindstruktur fullført.`); finishTournament(); return; } const newLvl = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = newLvl.duration * 60; logActivity(state.live.activityLog, `Nivå ${currentLvl.level} ferdig. Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`); updateUI(); saveTournamentState(currentTournamentId, state); } } else if (state.live.timeRemainingInLevel > 0 && state.live.timeRemainingInLevel % 30 === 0) saveTournamentState(currentTournamentId, state); } }
    function startRealTimeClock() { if (realTimeInterval) clearInterval(realTimeInterval); realTimeInterval = setInterval(() => { if (currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }, 1000); }
    // === 09: TIMER LOGIC END ===


    // === 10: EVENT HANDLERS - CONTROLS START ===
    function handleStartPause() { if (state.live.status === 'finished') return; if (state.live.status === 'paused') { state.live.status = 'running'; if (!timerInterval) timerInterval = setInterval(tick, 1000); logActivity(state.live.activityLog, "Klokke startet."); } else { state.live.status = 'paused'; logActivity(state.live.activityLog, "Klokke pauset."); saveTournamentState(currentTournamentId, state); } updateUI(); }
    function handleAdjustTime(deltaSeconds) { if (state.live.status === 'finished') return; let key = state.live.isOnBreak ? 'timeRemainingInBreak' : 'timeRemainingInLevel'; let maxT = Infinity; if (!state.live.isOnBreak) { const lvl = state.config.blindLevels[state.live.currentLevelIndex]; if (lvl) maxT = lvl.duration * 60; } state.live[key] = Math.max(0, Math.min(state.live[key] + deltaSeconds, maxT)); logActivity(state.live.activityLog, `Tid justert ${deltaSeconds > 0 ? '+' : ''}${deltaSeconds / 60} min.`); updateUI(); saveTournamentState(currentTournamentId, state); }
    function handleAdjustLevel(deltaIndex) { if (state.live.status === 'finished') return; const newIdx = state.live.currentLevelIndex + deltaIndex; if (newIdx >= 0 && newIdx < state.config.blindLevels.length) { const oldLvlNum = state.config.blindLevels[state.live.currentLevelIndex]?.level || '?'; const newLvl = state.config.blindLevels[newIdx]; if (!confirm(`Endre til Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)})?\nKlokken nullstilles.`)) return; state.live.currentLevelIndex = newIdx; state.live.timeRemainingInLevel = newLvl.duration * 60; state.live.isOnBreak = false; state.live.timeRemainingInBreak = 0; logActivity(state.live.activityLog, `Nivå manuelt endret: ${oldLvlNum} -> ${newLvl.level}.`); updateUI(); saveTournamentState(currentTournamentId, state); } else alert("Kan ikke gå til nivået."); }
    function handleEndTournament() { if (state.live.status === 'finished') { alert("Turneringen er allerede fullført."); return; } if (confirm("Markere turneringen som fullført?")) finishTournament(); }
    function handleForceSave() { if (state) { if (saveTournamentState(currentTournamentId, state)) { if(btnForceSave) btnForceSave.textContent = "Lagret!"; setTimeout(() => { if(btnForceSave) btnForceSave.textContent = "Lagre Nå"; }, 1500); } else alert("Lagring feilet!"); } else console.error("State missing on force save."); }
    function handleBackToMain() { if (state && state.live.status !== 'finished') saveTournamentState(currentTournamentId, state); window.location.href = 'index.html'; }
    // === 10: EVENT HANDLERS - CONTROLS END ===


    // === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    function handleRebuy(event){ const pId=parseInt(event.target.dataset.playerId); const p=state.live.players.find(pl=>pl.id===pId); const lvl=state.live.currentLevelIndex+1; if(!p){return;} if(state.config.type!=='rebuy'||!(lvl<=state.config.rebuyLevels)){alert("Re-buy N/A.");return;} if(state.live.status==='finished'){alert("Turnering fullført.");return;} if(confirm(`Re-buy (${state.config.rebuyCost}kr/${state.config.rebuyChips}c) for ${p.name}?`)){ p.rebuys=(p.rebuys||0)+1; state.live.totalPot+=state.config.rebuyCost; state.live.totalEntries++; state.live.totalRebuys++; logActivity(state.live.activityLog,`${p.name} tok Re-buy.`); updateUI(); saveTournamentState(currentTournamentId,state);}}
    function handleAddon(event){ const pId=parseInt(event.target.dataset.playerId); const p=state.live.players.find(pl=>pl.id===pId); const lvl=state.live.currentLevelIndex+1; const isAP=lvl>state.config.rebuyLevels; if(!p){return;} if(state.config.type!=='rebuy'||!isAP||p.addon){alert("Add-on N/A.");return;} if(state.live.status==='finished'){alert("Turnering fullført.");return;} if(confirm(`Add-on (${state.config.addonCost}kr/${state.config.addonChips}c) for ${p.name}?`)){ p.addon=true; state.live.totalPot+=state.config.addonCost; state.live.totalAddons++; logActivity(state.live.activityLog,`${p.name} tok Add-on.`); updateUI(); saveTournamentState(currentTournamentId,state);}}
    function handleEliminate(event){ if(state.live.status==='finished') return; const pId=parseInt(event.target.dataset.playerId); const ap=state.live.players; const pI=ap.findIndex(p=>p.id===pId); if(pI===-1) return; if (ap.length <= 1) { alert("Kan ikke eliminere siste spiller."); return; } const p=ap[pI]; let koId = null; if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) { const assigners = ap.filter(pl=>pl.id!==pId); const overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:200;'; const box = document.createElement('div'); box.style.cssText = 'background:#fff;color:#333;padding:25px;border-radius:5px;text-align:center;max-width:400px;box-shadow:0 5px 15px rgba(0,0,0,0.3);'; box.innerHTML = `<h3 style="margin-top:0;margin-bottom:15px;color:#333;">Hvem slo ut ${p.name}?</h3><select id="ko-sel" style="padding:8px;margin:10px 0 20px 0;min-width:250px;max-width:100%;border:1px solid #ccc;border-radius:4px;font-size:1em;"><option value="">-- Velg --</option><option value="none">Ingen KO</option>${assigners.map(pl => `<option value="${pl.id}">${pl.name} (B${pl.table}S${pl.seat})</option>`).join('')}</select><div><button id="ko-ok" class="success-button" style="margin-right:10px;padding:8px 15px;font-size:0.95em;">Bekreft</button><button id="ko-cancel" style="padding:8px 15px;font-size:0.95em;">Avbryt</button></div>`; overlay.appendChild(box); document.body.appendChild(overlay); const closeKo = () => { if (document.body.contains(overlay)) document.body.removeChild(overlay); }; document.getElementById('ko-ok').onclick = () => { const selVal = document.getElementById('ko-sel').value; if (!selVal) { alert("Velg spiller/Ingen KO."); return; } koId = (selVal === "none") ? null : parseInt(selVal); closeKo(); proceed(); }; document.getElementById('ko-cancel').onclick = () => { closeKo(); console.log("KO selection cancelled."); }; } else { koId = null; proceed(); } function proceed() { let koName = null; let koObj = null; if (koId !== null) { koObj = ap.find(pl=>pl.id===koId); if (koObj) koName = koObj.name; else { console.warn("Selected KO player not found:", koId); koId = null; } } const msg = `Eliminere ${p.name}?` + (koName ? ` (KO til ${koName})` : ''); if (confirm(msg)) { p.eliminated=true; p.eliminatedBy=koId; p.place=ap.length; if (koObj) { koObj.knockouts=(koObj.knockouts||0)+1; state.live.knockoutLog.push({ eliminatedPlayerId: p.id, eliminatedByPlayerId: koObj.id, level: state.live.currentLevelIndex + 1, timestamp: new Date().toISOString() }); console.log(`KO: ${koObj.name} -> ${p.name}`); } state.live.eliminatedPlayers.push(p); ap.splice(pI,1); const logTxt = koName ? ` av ${koName}` : ''; logActivity(state.live.activityLog,`${p.name} slått ut (${p.place}.plass${logTxt}).`); const structChanged = checkAndHandleTableBreak(); if (!structChanged) { updateUI(); saveTournamentState(currentTournamentId, state); } if (state.live.players.length <= 1) finishTournament(); } else console.log("Elimination cancelled."); } }
    function handleRestore(event){ if(state.live.status==='finished'){ alert("Turnering fullført."); return; } const pId=parseInt(event.target.dataset.playerId); const pI=state.live.eliminatedPlayers.findIndex(p=>p.id===pId); if(pI===-1) return; const p=state.live.eliminatedPlayers[pI]; const oldP = p.place; if(confirm(`Gjenopprette ${p.name} (var ${oldP}.plass)?`)){ const koById = p.eliminatedBy; p.eliminated=false; p.eliminatedBy=null; p.place=null; state.live.eliminatedPlayers.splice(pI,1); state.live.players.push(p); if(state.config.type==='knockout'&&koById){ let koGetter = state.live.players.find(pl=>pl.id===koById)||state.live.eliminatedPlayers.find(pl=>pl.id===koById); if(koGetter?.knockouts>0){ koGetter.knockouts--; console.log(`KO reversed for ${koGetter.name}.`); const logI = state.live.knockoutLog.findIndex(l=>l.eliminatedPlayerId===p.id&&l.eliminatedByPlayerId===koById); if(logI>-1) state.live.knockoutLog.splice(logI,1); } } assignTableSeat(p); logActivity(state.live.activityLog,`${p.name} gjenopprettet fra ${oldP}.plass (B${p.table}S${p.seat}).`); const structChanged = checkAndHandleTableBreak(); if (!structChanged) { updateUI(); saveTournamentState(currentTournamentId, state); } } }
    function handleEditPlayer(event){ if(state.live.status === 'finished') return; const pId=parseInt(event.target.dataset.playerId); const p = state.live.players.find(pl=>pl.id===pId)||state.live.eliminatedPlayers.find(pl=>pl.id===pId); if(!p) return; const oN=p.name; const nN=prompt(`Endre navn for ${oN}:`,oN); if(nN?.trim()&&nN.trim()!==oN){p.name=nN.trim(); logActivity(state.live.activityLog,`Navn endret: ${oN} -> ${p.name}.`); renderPlayerList(); saveTournamentState(currentTournamentId,state);}else if(nN!==null&&!nN.trim())alert("Navn tomt.");}
    function handleLateRegClick() { if(state.live.status === 'finished') return; const lvl=state.live.currentLevelIndex + 1; const isOpen = lvl <= state.config.lateRegLevel && state.config.lateRegLevel > 0; if (!isOpen) { const reason = state.config.lateRegLevel > 0 ? `stengte etter nivå ${state.config.lateRegLevel}` : "ikke aktivert"; alert(`Sen registrering ${reason}.`); return; } const name = prompt("Navn (Late Reg):"); if (name?.trim()) { const p={id:generateUniqueId('p'), name:name.trim(), stack:state.config.startStack, table:0, seat:0, rebuys:0, addon:false, eliminated:false, eliminatedBy:null, place:null, knockouts:0 }; assignTableSeat(p); state.live.players.push(p); state.live.totalPot+=state.config.buyIn; state.live.totalEntries++; logActivity(state.live.activityLog,`${p.name} registrert (Late Reg, B${p.table}S${p.seat}).`); state.live.players.sort((a,b)=>a.table===b.table?a.seat-b.seat:a.table-b.table); const structChanged = checkAndHandleTableBreak(); if(!structChanged){updateUI(); saveTournamentState(currentTournamentId,state);} } else if(name !== null) alert("Navn tomt."); }
    // === 11: EVENT HANDLERS - PLAYER ACTIONS END ===


    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    function openTournamentModal() { if (state.live.status === 'finished' || isModalOpen) return; console.log("Opening T modal"); editBlindStructureBody.innerHTML = ''; editBlindLevelCounter = 0; state.config.blindLevels.forEach(l => addEditBlindLevelRow(l)); updateEditLevelNumbers(); editPaidPlacesInput.value = state.config.paidPlaces; editPrizeDistTextarea.value = state.config.prizeDistribution.join(', '); tournamentSettingsModal.classList.remove('hidden'); isModalOpen = true; currentOpenModal = tournamentSettingsModal; }
    function closeTournamentModal() { tournamentSettingsModal.classList.add('hidden'); isModalOpen = false; currentOpenModal = null; }
    function openUiModal() { if (isModalOpen) return; console.log("Opening UI modal"); originalThemeBg = loadThemeBgColor(); originalThemeText = loadThemeTextColor(); originalElementLayouts = loadElementLayouts(); blockSliderUpdates=true; const [bgR, bgG, bgB] = parseRgbString(originalThemeBg); const bgHSL = rgbToHsl(bgR, bgG, bgB); bgRedSlider.value=bgRedInput.value=bgR; bgGreenSlider.value=bgGreenInput.value=bgG; bgBlueSlider.value=bgBlueInput.value=bgB; bgHueSlider.value=bgHueInput.value=bgHSL.h; bgSatSlider.value=bgSatInput.value=bgHSL.s; bgLigSlider.value=bgLigInput.value=bgHSL.l; const [textR, textG, textB] = parseRgbString(originalThemeText); const textHSL = rgbToHsl(textR, textG, textB); textRedSlider.value=textRedInput.value=textR; textGreenSlider.value=textGreenInput.value=textG; textBlueSlider.value=textBlueInput.value=textB; textHueSlider.value=textHueInput.value=textHSL.h; textSatSlider.value=textSatInput.value=textHSL.s; textLigSlider.value=textLigInput.value=textHSL.l; canvasHeightInput.value = canvasHeightSlider.value = originalElementLayouts.canvas.height; titleWidthInput.value = titleWidthSlider.value = originalElementLayouts.title.width; titleFontSizeInput.value = titleFontSizeSlider.value = originalElementLayouts.title.fontSize; timerWidthInput.value = timerWidthSlider.value = originalElementLayouts.timer.width; timerFontSizeInput.value = timerFontSizeSlider.value = originalElementLayouts.timer.fontSize; blindsWidthInput.value = blindsWidthSlider.value = originalElementLayouts.blinds.width; blindsFontSizeInput.value = blindsFontSizeSlider.value = originalElementLayouts.blinds.fontSize; logoWidthInput.value = logoWidthSlider.value = originalElementLayouts.logo.width; logoHeightInput.value = logoHeightSlider.value = originalElementLayouts.logo.height; infoWidthInput.value = infoWidthSlider.value = originalElementLayouts.info.width; infoFontSizeInput.value = infoFontSizeSlider.value = originalElementLayouts.info.fontSize; visibilityToggles.forEach(toggle => { const elementId = toggle.dataset.elementId.replace('-element',''); toggle.checked = originalElementLayouts[elementId]?.isVisible ?? true; }); for (const key in infoParagraphs) { const checkboxId = `toggleInfo${key.substring(4)}`; const checkbox = document.getElementById(checkboxId); if (checkbox) checkbox.checked = originalElementLayouts.info[key] ?? true; } blockSliderUpdates=false; populateThemeFavorites(); updateColorAndLayoutPreviews(); addThemeAndLayoutListeners(); uiSettingsModal.classList.remove('hidden'); isModalOpen = true; currentOpenModal = uiSettingsModal; }
    function closeUiModal(revert = false) { if (revert) applyThemeAndLayout(originalThemeBg, originalThemeText, originalElementLayouts); removeThemeAndLayoutListeners(); uiSettingsModal.classList.add('hidden'); isModalOpen = false; currentOpenModal = null; }
    function addEditBlindLevelRow(levelData={}){ editBlindLevelCounter++; const row=editBlindStructureBody.insertRow(); row.dataset.levelNumber=editBlindLevelCounter; const sb=levelData.sb??''; const bb=levelData.bb??''; const ante=levelData.ante??0; const dur=levelData.duration??(state.config.blindLevels?.[0]?.duration||20); const pause=levelData.pauseMinutes??0; const past = levelData.level <= state.live.currentLevelIndex && !state.live.isOnBreak; const dis = past ? 'disabled' : ''; row.innerHTML=`<td><span class="level-number">${editBlindLevelCounter}</span> ${past?'<small>(Låst)</small>':''}</td><td><input type="number" class="sb-input" value="${sb}" min="0" step="1" ${dis}></td><td><input type="number" class="bb-input" value="${bb}" min="0" step="1" ${dis}></td><td><input type="number" class="ante-input" value="${ante}" min="0" step="1" ${dis}></td><td><input type="number" class="duration-input" value="${dur}" min="1" ${dis}></td><td><input type="number" class="pause-duration-input" value="${pause}" min="0" ${dis}></td><td><button type="button" class="btn-remove-level" title="Fjern nivå ${editBlindLevelCounter}" ${dis}>X</button></td>`; const btn=row.querySelector('.btn-remove-level'); if(!past) btn.onclick=()=>{row.remove(); updateEditLevelNumbers();}; else { row.querySelectorAll('input').forEach(inp=>inp.disabled=true); btn.disabled=true; } }
    function updateEditLevelNumbers(){ const rows=editBlindStructureBody.querySelectorAll('tr'); rows.forEach((r,i)=>{ const lvl=i+1; r.dataset.levelNumber=lvl; r.querySelector('.level-number').textContent=lvl; const btn=r.querySelector('.btn-remove-level'); if(btn)btn.title=`Fjern nivå ${lvl}`; }); editBlindLevelCounter=rows.length; }
    function generateEditPayout(){ const p=parseInt(editPaidPlacesInput.value)||0; editPrizeDistTextarea.value = (p > 0 && standardPayouts[p]) ? standardPayouts[p].join(', ') : ''; }
    function syncRgbFromHsl(prefix){ if(blockSliderUpdates) return; const h=parseInt(document.getElementById(`${prefix}HueInput`).value); const s=parseInt(document.getElementById(`${prefix}SatInput`).value); const l=parseInt(document.getElementById(`${prefix}LigInput`).value); const rgb=hslToRgb(h,s,l); const [r,g,b]=parseRgbString(rgb); blockSliderUpdates=true; document.getElementById(`${prefix}RedSlider`).value=document.getElementById(`${prefix}RedInput`).value=r; document.getElementById(`${prefix}GreenSlider`).value=document.getElementById(`${prefix}GreenInput`).value=g; document.getElementById(`${prefix}BlueSlider`).value=document.getElementById(`${prefix}BlueInput`).value=b; blockSliderUpdates=false; return rgb; }
    function syncHslFromRgb(prefix){ if(blockSliderUpdates) return; const r=parseInt(document.getElementById(`${prefix}RedInput`).value); const g=parseInt(document.getElementById(`${prefix}GreenInput`).value); const b=parseInt(document.getElementById(`${prefix}BlueInput`).value); const hsl=rgbToHsl(r,g,b); blockSliderUpdates=true; document.getElementById(`${prefix}HueSlider`).value=document.getElementById(`${prefix}HueInput`).value=hsl.h; document.getElementById(`${prefix}SatSlider`).value=document.getElementById(`${prefix}SatInput`).value=hsl.s; document.getElementById(`${prefix}LigSlider`).value=document.getElementById(`${prefix}LigInput`).value=hsl.l; blockSliderUpdates=false; return `rgb(${r}, ${g}, ${b})`; }
    function updateColorAndLayoutPreviews() { if (!isModalOpen || currentOpenModal !== uiSettingsModal) return; const bg = syncHslFromRgb('bg'); const txt = syncHslFromRgb('text'); const layouts = { canvas: { height: parseInt(canvasHeightSlider.value) }, title: { width: parseInt(titleWidthSlider.value), fontSize: parseFloat(titleFontSizeSlider.value) }, timer: { width: parseInt(timerWidthSlider.value), fontSize: parseFloat(timerFontSizeSlider.value) }, blinds: { width: parseInt(blindsWidthSlider.value), fontSize: parseFloat(blindsFontSizeSlider.value) }, logo: { width: parseInt(logoWidthSlider.value), height: parseInt(logoHeightSlider.value) }, info: { width: parseInt(infoWidthSlider.value), fontSize: parseFloat(infoFontSizeSlider.value), showNextBlinds: toggleInfoNextBlinds.checked, showNextPause: toggleInfoNextPause.checked, showAvgStack: toggleInfoAvgStack.checked, showPlayers: toggleInfoPlayers.checked, showLateReg: toggleInfoLateReg.checked } }; visibilityToggles.forEach(toggle => { const elementId = toggle.dataset.elementId.replace('-element',''); layouts[elementId] = { ...loadElementLayouts()[elementId], ...(layouts[elementId] || {}), isVisible: toggle.checked }; }); if(bgColorPreview) bgColorPreview.style.backgroundColor = bg; if(textColorPreview) { textColorPreview.style.backgroundColor = bg; textColorPreview.querySelector('span').style.color = txt; } applyThemeAndLayout(bg, txt, layouts); }
    function handleThemeLayoutControlChange(e) { if (!isModalOpen || currentOpenModal !== uiSettingsModal) return; const target = e.target; const id = target.id; const isSlider = id.includes('Slider'); const isInput = id.includes('Input'); const isVisToggle = target.type === 'checkbox' && visibilityToggles.includes(target); const isInfoToggle = target.type === 'checkbox' && internalInfoToggles.includes(target); if (isSlider || isInput) { const baseId = isSlider ? id.replace('Slider', '') : id.replace('Input', ''); const slider = document.getElementById(baseId + 'Slider'); const input = document.getElementById(baseId + 'Input'); if (target.type === 'number' && input) { let val = parseFloat(target.value); const min = parseFloat(target.min||'0'); const max = parseFloat(target.max||'100'); const step = parseFloat(target.step||'1'); if (!isNaN(val)) { val = Math.max(min, Math.min(max, val)); target.value = (step % 1 === 0) ? Math.round(val) : val.toFixed(step.toString().split('.')[1]?.length || 1); if (slider) slider.value = target.value; } } else if (isSlider && input) input.value = target.value; if (id.includes('Hue') || id.includes('Sat') || id.includes('Lig')) syncRgbFromHsl(id.startsWith('bg') ? 'bg' : 'text'); else if (id.includes('Red') || id.includes('Green') || id.includes('Blue')) syncHslFromRgb(id.startsWith('bg') ? 'bg' : 'text'); } updateColorAndLayoutPreviews(); }
    function addThemeAndLayoutListeners(){ sizeSliders.forEach(el => el?.addEventListener('input', handleThemeLayoutControlChange)); sizeInputs.forEach(el => el?.addEventListener('input', handleThemeLayoutControlChange)); colorSliders.forEach(el => el?.addEventListener('input', handleThemeLayoutControlChange)); colorInputs.forEach(el => el?.addEventListener('input', handleThemeLayoutControlChange)); visibilityToggles.forEach(el => el?.addEventListener('change', handleThemeLayoutControlChange)); internalInfoToggles.forEach(el => el?.addEventListener('change', handleThemeLayoutControlChange)); btnLoadThemeFavorite.addEventListener('click', handleLoadFavorite); btnSaveThemeFavorite.addEventListener('click', handleSaveFavorite); btnDeleteThemeFavorite.addEventListener('click', handleDeleteFavorite); themeFavoritesSelect.addEventListener('change', enableDisableDeleteButton); }
    function removeThemeAndLayoutListeners(){ sizeSliders.forEach(el => el?.removeEventListener('input', handleThemeLayoutControlChange)); sizeInputs.forEach(el => el?.removeEventListener('input', handleThemeLayoutControlChange)); colorSliders.forEach(el => el?.removeEventListener('input', handleThemeLayoutControlChange)); colorInputs.forEach(el => el?.removeEventListener('input', handleThemeLayoutControlChange)); visibilityToggles.forEach(el => el?.removeEventListener('change', handleThemeLayoutControlChange)); internalInfoToggles.forEach(el => el?.removeEventListener('change', handleThemeLayoutControlChange)); btnLoadThemeFavorite.removeEventListener('click', handleLoadFavorite); btnSaveThemeFavorite.removeEventListener('click', handleSaveFavorite); btnDeleteThemeFavorite.removeEventListener('click', handleDeleteFavorite); themeFavoritesSelect.removeEventListener('change', enableDisableDeleteButton); }
    function populateThemeFavorites() { const favs = loadThemeFavorites(); themeFavoritesSelect.innerHTML = '<option value="">Velg favoritt...</option>'; favs.forEach(f => { const opt = document.createElement('option'); opt.value = f.id; opt.textContent = f.name; themeFavoritesSelect.appendChild(opt); }); enableDisableDeleteButton(); }
    function enableDisableDeleteButton(){ btnDeleteThemeFavorite.disabled = !themeFavoritesSelect.value; }
    function handleLoadFavorite() { const id = themeFavoritesSelect.value; if (!id) return; const fav = loadThemeFavorites().find(f => f.id === id); if (fav) { console.log(`Loading theme: ${fav.name}`); const [bgR,bgG,bgB]=parseRgbString(fav.bg); const bgHSL=rgbToHsl(bgR,bgG,bgB); const [txtR,txtG,txtB]=parseRgbString(fav.text); const txtHSL=rgbToHsl(txtR,txtG,txtB); blockSliderUpdates=true; bgRedSlider.value=bgRedInput.value=bgR; bgGreenSlider.value=bgGreenInput.value=bgG; bgBlueSlider.value=bgBlueInput.value=bgB; bgHueSlider.value=bgHueInput.value=bgHSL.h; bgSatSlider.value=bgSatInput.value=bgHSL.s; bgLigSlider.value=bgLigInput.value=bgHSL.l; textRedSlider.value=textRedInput.value=txtR; textGreenSlider.value=textGreenInput.value=txtG; textBlueSlider.value=textBlueInput.value=txtB; textHueSlider.value=textHueInput.value=txtHSL.h; textSatSlider.value=textSatInput.value=txtHSL.s; textLigSlider.value=textLigInput.value=txtHSL.l; blockSliderUpdates=false; updateColorAndLayoutPreviews(); } }
    function handleSaveFavorite() { const name = newThemeFavoriteNameInput.value.trim(); if (!name) { alert("Skriv navn."); return; } const bg = `rgb(${bgRedInput.value}, ${bgGreenInput.value}, ${bgBlueInput.value})`; const txt = `rgb(${textRedInput.value}, ${textGreenInput.value}, ${textBlueInput.value})`; const saved = addThemeFavorite(name, bg, txt); newThemeFavoriteNameInput.value = ''; populateThemeFavorites(); themeFavoritesSelect.value = saved.id; enableDisableDeleteButton(); alert(`Tema '${saved.name}' lagret!`); console.log(`Theme saved: ${saved.name}`, saved); }
    function handleDeleteFavorite() { const id = themeFavoritesSelect.value; if (!id) return; const fav = loadThemeFavorites().find(f => f.id === id); if (fav && confirm(`Slette tema '${fav.name}'?`)) { deleteThemeFavorite(id); populateThemeFavorites(); console.log(`Theme deleted: ${fav.name}`); } }
    function handleSaveTournamentSettings(){ console.log("Saving T settings..."); let changes=false; let uiUpdate=false; const cLI=state.live.currentLevelIndex; let valid=true; const newLvls=[]; const rows=editBlindStructureBody.querySelectorAll('tr'); let errs=[]; if(rows.length===0){alert("Minst ett nivå kreves.");return;} rows.forEach((row,idx)=>{ const lvlNum=idx+1; let rowOk=true; const sbIn=row.querySelector('.sb-input'); const bbIn=row.querySelector('.bb-input'); const aIn=row.querySelector('.ante-input'); const dIn=row.querySelector('.duration-input'); const pIn=row.querySelector('.pause-duration-input'); const past=lvlNum<=cLI&&!state.live.isOnBreak; let sb,bb,a,d,pM; if(past){if(idx<state.config.blindLevels.length){const pastData=state.config.blindLevels[idx];sb=pastData.sb;bb=pastData.bb;a=pastData.ante;d=pastData.duration;pM=pastData.pauseMinutes;}else{rowOk=false;}}else{sb=parseInt(sbIn.value);bb=parseInt(bbIn.value);a=parseInt(aIn.value)||0;d=parseInt(dIn.value);pM=parseInt(pIn.value)||0;[sbIn,bbIn,aIn,dIn,pIn].forEach(el=>el.classList.remove('invalid')); if(isNaN(d)||d<=0){rowOk=false;dIn.classList.add('invalid');} if(isNaN(sb)||sb<0){rowOk=false;sbIn.classList.add('invalid');} if(isNaN(bb)||bb<=0){rowOk=false;bbIn.classList.add('invalid');} else if(sb>bb){rowOk=false;sbIn.classList.add('invalid');bbIn.classList.add('invalid');errs.push(`L${lvlNum}:SB>BB`);} else if(bb>0&&sb<0){rowOk=false;sbIn.classList.add('invalid');} if(isNaN(a)||a<0){rowOk=false;aIn.classList.add('invalid');} if(isNaN(pM)||pM<0){rowOk=false;pIn.classList.add('invalid');}} if(!rowOk)valid=false; newLvls.push({level:lvlNum,sb:sb,bb:bb,ante:a,duration:d,pauseMinutes:pM});}); if(!valid){let msg="Ugyldige verdier:\n- "+[...new Set(errs)].join("\n- "); if(errs.length===0)msg="Ugyldige verdier (markerte felt)."; alert(msg); return;} if(JSON.stringify(state.config.blindLevels)!==JSON.stringify(newLvls)){state.config.blindLevels=newLvls;changes=true;uiUpdate=true;logActivity(state.live.activityLog,"Blindstruktur endret.");console.log("Blinds changed",newLvls);} const places=parseInt(editPaidPlacesInput.value); const dist=editPrizeDistTextarea.value.split(',').map(p=>parseFloat(p.trim())).filter(p=>!isNaN(p)&&p>=0); let prizesOk=true; let prizeErrs=[]; if(isNaN(places)||places<=0){prizesOk=false;prizeErrs.push("Ugyldig antall betalte (> 0).");}else if(dist.length!==places){prizesOk=false;prizeErrs.push(`Premier(${dist.length}) != Betalte(${places}).`);}else{const sum=dist.reduce((a,b)=>a+b,0);if(Math.abs(sum-100)>0.1){prizesOk=false;prizeErrs.push(`Sum (${sum.toFixed(1)}%) != 100%.`);}} if(!prizesOk){alert("Feil i premier:\n- "+prizeErrs.join("\n- "));return;} if(state.config.paidPlaces!==places||JSON.stringify(state.config.prizeDistribution)!==JSON.stringify(dist)){const inMoney=state.live.eliminatedPlayers.filter(p=>p.place&&p.place<=state.config.paidPlaces).length;if(inMoney===0||confirm(`Advarsel: ${inMoney} i pengene. Endre premier?`)){state.config.paidPlaces=places;state.config.prizeDistribution=dist;changes=true;uiUpdate=true;logActivity(state.live.activityLog,"Premiestruktur endret.");console.log("Prizes changed",places,dist);}else{console.log("Prize change cancelled.");editPaidPlacesInput.value=state.config.paidPlaces;editPrizeDistTextarea.value=state.config.prizeDistribution.join(', ');return;}} if(changes){if(saveTournamentState(currentTournamentId,state)){alert("Regelendringer lagret!");if(uiUpdate)updateUI();closeTournamentModal();}else alert("Lagring feilet!");} else{alert("Ingen regelendringer å lagre.");closeTournamentModal();}}
    function handleSaveUiSettings(){ console.log("Saving UI..."); let themeCh=false; let layoutCh=false; const bg=`rgb(${bgRedInput.value}, ${bgGreenInput.value}, ${bgBlueInput.value})`; const txt=`rgb(${textRedInput.value}, ${textGreenInput.value}, ${textBlueInput.value})`; const layouts={canvas:{height:parseInt(canvasHeightInput.value)}, title:{width:parseInt(titleWidthSlider.value), fontSize:parseFloat(titleFontSizeSlider.value)}, timer:{width:parseInt(timerWidthSlider.value), fontSize:parseFloat(timerFontSizeSlider.value)}, blinds:{width:parseInt(blindsWidthSlider.value), fontSize:parseFloat(blindsFontSizeSlider.value)}, logo:{width:parseInt(logoWidthSlider.value), height:parseInt(logoHeightSlider.value)}, info:{width:parseInt(infoWidthSlider.value), fontSize:parseFloat(infoFontSizeSlider.value), showNextBlinds:toggleInfoNextBlinds.checked, showNextPause:toggleInfoNextPause.checked, showAvgStack:toggleInfoAvgStack.checked, showPlayers:toggleInfoPlayers.checked, showLateReg:toggleInfoLateReg.checked}}; const currentLayouts = loadElementLayouts(); visibilityToggles.forEach(toggle => { const elementId = toggle.dataset.elementId.replace('-element',''); layouts[elementId] = { ...(currentLayouts[elementId] || {}), ...(layouts[elementId] || {}), x: currentLayouts[elementId]?.x ?? 0, y: currentLayouts[elementId]?.y ?? 0, // Preserve dragged X/Y isVisible: toggle.checked }; }); if(bg!==originalThemeBg||txt!==originalThemeText){saveThemeBgColor(bg);saveThemeTextColor(txt);console.log("Theme saved.");themeCh=true;} if(JSON.stringify(layouts)!==JSON.stringify(originalElementLayouts)){saveElementLayouts(layouts);console.log("Layout saved.");layoutCh=true;} if(themeCh||layoutCh){applyThemeAndLayout(bg,txt,layouts);alert("Utseende lagret!");closeUiModal(false);} else{alert("Ingen endringer å lagre.");closeUiModal(false);}}
    function handleResetLayoutTheme() { if (confirm("Tilbakestille layout og farger til standard?")) { const dLayout = DEFAULT_ELEMENT_LAYOUTS; const dBg = DEFAULT_THEME_BG; const dTxt = DEFAULT_THEME_TEXT; console.log("Resetting UI."); applyThemeAndLayout(dBg, dTxt, dLayout); blockSliderUpdates=true; const [bgR,bgG,bgB]=parseRgbString(dBg); const bgHSL=rgbToHsl(bgR,bgG,bgB); bgRedSlider.value=bgRedInput.value=bgR; bgGreenSlider.value=bgGreenInput.value=bgG; bgBlueSlider.value=bgBlueInput.value=bgB; bgHueSlider.value=bgHueInput.value=bgHSL.h; bgSatSlider.value=bgSatInput.value=bgHSL.s; bgLigSlider.value=bgLigInput.value=bgHSL.l; const [txtR,txtG,txtB]=parseRgbString(dTxt); const txtHSL=rgbToHsl(txtR,txtG,txtB); textRedSlider.value=textRedInput.value=txtR; textGreenSlider.value=textGreenInput.value=txtG; textBlueSlider.value=textBlueInput.value=txtB; textHueSlider.value=textHueInput.value=txtHSL.h; textSatSlider.value=textSatInput.value=txtHSL.s; textLigSlider.value=textLigInput.value=txtHSL.l; canvasHeightInput.value=canvasHeightSlider.value=dLayout.canvas.height; titleWidthInput.value=titleWidthSlider.value=dLayout.title.width; titleFontSizeInput.value=titleFontSizeSlider.value=dLayout.title.fontSize; timerWidthInput.value=timerWidthSlider.value=dLayout.timer.width; timerFontSizeInput.value=timerFontSizeSlider.value=dLayout.timer.fontSize; blindsWidthInput.value=blindsWidthSlider.value=dLayout.blinds.width; blindsFontSizeInput.value=blindsFontSizeSlider.value=dLayout.blinds.fontSize; logoWidthInput.value=logoWidthSlider.value=dLayout.logo.width; logoHeightInput.value=logoHeightSlider.value=dLayout.logo.height; infoWidthInput.value=infoWidthSlider.value=dLayout.info.width; infoFontSizeInput.value=infoFontSizeSlider.value=dLayout.info.fontSize; visibilityToggles.forEach(t => {const elId=t.dataset.elementId.replace('-element',''); t.checked=dLayout[elId]?.isVisible??true;}); for(const k in infoParagraphs){const checkId=`toggleInfo${k.substring(4)}`; const check=document.getElementById(checkId); if(check) check.checked=dLayout.info[k]??true;} blockSliderUpdates=false; updateColorAndLayoutPreviews(); alert("Layout/farger tilbakestilt. Trykk Lagre.") } }
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===


    // === 13: TOURNAMENT FINISH LOGIC START ===
    function finishTournament() { if (state.live.status === 'finished') return; console.log("Finishing T..."); logActivity(state.live.activityLog,"Turnering fullføres."); if(timerInterval)clearInterval(timerInterval);timerInterval=null; if(realTimeInterval)clearInterval(realTimeInterval);realTimeInterval=null; state.live.status='finished'; state.live.isOnBreak=false; state.live.timeRemainingInLevel=0; state.live.timeRemainingInBreak=0; if(state.live.players.length===1){const w=state.live.players[0];w.place=1;state.live.eliminatedPlayers.push(w);state.live.players.splice(0,1);logActivity(state.live.activityLog,`Vinner: ${w.name}!`);}else if(state.live.players.length>1){logActivity(state.live.activityLog,`Fullført med ${state.live.players.length} spillere igjen.`); state.live.players.forEach(p=>{p.eliminated=true;p.place=null;state.live.eliminatedPlayers.push(p);}); state.live.players=[];}else{logActivity(state.live.activityLog,`Fullført uten aktive spillere.`);} state.live.eliminatedPlayers.sort((a,b)=>(a.place??Infinity)-(b.place??Infinity)); updateUI(); saveTournamentState(currentTournamentId,state); alert("Turneringen er fullført!"); }
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
    // Remove click listener on canvas elements for opening modal
    // if(liveCanvas) { liveCanvas.addEventListener('click', (e) => { const clickedElement = e.target.closest('.clickable-element'); if (clickedElement && !isModalOpen) { openUiModal(); } }); }
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

    // Add Drag and Drop Listeners to elements
    draggableElements.forEach(element => {
         if (element) {
             element.addEventListener('mousedown', (e) => startDrag(e, element));
         }
     });
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===


    // === 15: INITIAL UI RENDER & TIMER START ===
    console.log("Performing initial UI render...");
    updateUI(); startRealTimeClock();
    if (state.live.status === 'running') { console.log("State is 'running', starting timer."); timerInterval = setInterval(tick, 1000); }
    else if (state.live.status === 'finished') console.log("State is 'finished'.");
    else console.log(`State is '${state.live.status}'. Timer not started.`);
    console.log("Tournament page fully initialized.");
    // === 15: INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
