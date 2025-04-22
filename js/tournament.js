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

    // UI Modal State
    let originalThemeBg = '';
    let originalThemeText = '';
    let originalElementLayouts = {};
    let blockSliderUpdates = false; // Prevent infinite loops in color sliders

    // Drag and Drop State
    let isDragging = false;
    let draggedElement = null;
    let offsetX = 0; // Mouse offset within element
    let offsetY = 0;

    // Sound State & URLs (Bruk dine faktiske filnavn/stier)
    let soundsEnabled = loadSoundPreference(); // Hent fra storage
    const SOUND_URLS = {
        NEW_LEVEL: 'sounds/new_level.mp3',
        PAUSE_START: 'sounds/pause_start.wav',
        PAUSE_END: 'sounds/pause_end.mp3',
        BUBBLE: 'sounds/bubble_start.ogg',
        KNOCKOUT: 'sounds/knockout.mp3',
        FINAL_TABLE: 'sounds/final_table.mp3',
        TOURNAMENT_END: 'sounds/tournament_end.mp3',
    };

    // Tournament Modal State
    let editBlindLevelCounter = 0; // Counter for adding rows in modal
    const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // Main page elements
    const currentTimeDisplay = document.getElementById('current-time');
    const btnToggleSound = document.getElementById('btn-toggle-sound'); // Lyd-knapp
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
    const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement]; // Array for enkel iterasjon

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
    // Visibility Toggles
    const toggleTitleElement = document.getElementById('toggleTitleElement');
    const toggleTimerElement = document.getElementById('toggleTimerElement');
    const toggleBlindsElement = document.getElementById('toggleBlindsElement');
    const toggleLogoElement = document.getElementById('toggleLogoElement');
    const toggleInfoElement = document.getElementById('toggleInfoElement');
    const visibilityToggles = [toggleTitleElement, toggleTimerElement, toggleBlindsElement, toggleLogoElement, toggleInfoElement];
    // Size Controls (X/Y removed from modal, handled by drag)
    const titleWidthSlider = document.getElementById('titleWidthSlider'); const titleWidthInput = document.getElementById('titleWidthInput'); const titleFontSizeSlider = document.getElementById('titleFontSizeSlider'); const titleFontSizeInput = document.getElementById('titleFontSizeInput');
    const timerWidthSlider = document.getElementById('timerWidthSlider'); const timerWidthInput = document.getElementById('timerWidthInput'); const timerFontSizeSlider = document.getElementById('timerFontSizeSlider'); const timerFontSizeInput = document.getElementById('timerFontSizeInput');
    const blindsWidthSlider = document.getElementById('blindsWidthSlider'); const blindsWidthInput = document.getElementById('blindsWidthInput'); const blindsFontSizeSlider = document.getElementById('blindsFontSizeSlider'); const blindsFontSizeInput = document.getElementById('blindsFontSizeInput');
    const logoWidthSlider = document.getElementById('logoWidthSlider'); const logoWidthInput = document.getElementById('logoWidthInput'); const logoHeightSlider = document.getElementById('logoHeightSlider'); const logoHeightInput = document.getElementById('logoHeightInput');
    const infoWidthSlider = document.getElementById('infoWidthSlider'); const infoWidthInput = document.getElementById('infoWidthInput'); const infoFontSizeSlider = document.getElementById('infoFontSizeSlider'); const infoFontSizeInput = document.getElementById('infoFontSizeInput');
    // Info Internal Toggles
    const toggleInfoNextBlinds = document.getElementById('toggleInfoNextBlinds'); const toggleInfoNextPause = document.getElementById('toggleInfoNextPause'); const toggleInfoAvgStack = document.getElementById('toggleInfoAvgStack'); const toggleInfoPlayers = document.getElementById('toggleInfoPlayers'); const toggleInfoLateReg = document.getElementById('toggleInfoLateReg');
    const infoParagraphs = { showNextBlinds: document.getElementById('info-next-blinds'), showNextPause: infoNextPauseParagraph, showAvgStack: document.getElementById('info-avg-stack'), showPlayers: document.getElementById('info-players'), showLateReg: document.getElementById('info-late-reg') };
    // Theme Controls
    const bgRedSlider = document.getElementById('bgRedSlider'); /* ... all other theme sliders/inputs */ const bgGreenSlider = document.getElementById('bgGreenSlider'); const bgBlueSlider = document.getElementById('bgBlueSlider'); const bgRedInput = document.getElementById('bgRedInput'); const bgGreenInput = document.getElementById('bgGreenInput'); const bgBlueInput = document.getElementById('bgBlueInput'); const bgColorPreview = document.getElementById('bg-color-preview'); const textRedSlider = document.getElementById('textRedSlider'); const textGreenSlider = document.getElementById('textGreenSlider'); const textBlueSlider = document.getElementById('textBlueSlider'); const textRedInput = document.getElementById('textRedInput'); const textGreenInput = document.getElementById('textGreenInput'); const textBlueInput = document.getElementById('textBlueInput'); const textColorPreview = document.getElementById('text-color-preview'); const bgHueSlider = document.getElementById('bgHueSlider'); const bgHueInput = document.getElementById('bgHueInput'); const bgSatSlider = document.getElementById('bgSatSlider'); const bgSatInput = document.getElementById('bgSatInput'); const bgLigSlider = document.getElementById('bgLigSlider'); const bgLigInput = document.getElementById('bgLigInput'); const textHueSlider = document.getElementById('textHueSlider'); const textHueInput = document.getElementById('textHueInput'); const textSatSlider = document.getElementById('textSatSlider'); const textSatInput = document.getElementById('textSatInput'); const textLigSlider = document.getElementById('textLigSlider'); const textLigInput = document.getElementById('textLigInput'); const themeFavoritesSelect = document.getElementById('themeFavoritesSelect'); const btnLoadThemeFavorite = document.getElementById('btnLoadThemeFavorite'); const newThemeFavoriteNameInput = document.getElementById('newThemeFavoriteName'); const btnSaveThemeFavorite = document.getElementById('btnSaveThemeFavorite'); const btnDeleteThemeFavorite = document.getElementById('btnDeleteThemeFavorite');
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
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig turneringsdata (ID: ${currentTournamentId}).`); console.error("Invalid tournament state:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
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

        draggableElements.forEach(element => {
            if (!element) return;
            const elementId = element.id.replace('-element', '');
            const layout = { ...defaults[elementId], ...(elementLayouts[elementId] || {}) };
            element.classList.toggle('element-hidden', !(layout.isVisible ?? true));
            if (layout.isVisible ?? true) {
                 element.style.left = `${layout.x}%`; element.style.top = `${layout.y}%`; element.style.width = `${layout.width}%`;
                 if (elementId === 'logo') { element.style.height = `${layout.height}%`; element.style.fontSize = '1em'; }
                 else { element.style.fontSize = `${layout.fontSize}em`; element.style.height = 'auto'; }
            }
        });
        const infoLayout = { ...defaults.info, ...(elementLayouts.info || {}) };
        for (const key in infoParagraphs) { if (infoParagraphs[key]) infoParagraphs[key].classList.toggle('hidden', !(infoLayout[key] ?? true)); }
        // console.log(`Theme/Layout applied directly`);
    }
    // Load and apply initial theme/layout
    const initialBgColor = loadThemeBgColor(); const initialTextColor = loadThemeTextColor(); const initialElementLayouts = loadElementLayouts();
    applyThemeAndLayout(initialBgColor, initialTextColor, initialElementLayouts);
    // === 04b: THEME & LAYOUT APPLICATION END ===


    // === 04c: DRAG AND DROP LOGIC START ===
    function startDrag(event, element) { if (event.button !== 0 || isModalOpen) return; event.preventDefault(); draggedElement = element; isDragging = true; const rect = element.getBoundingClientRect(); offsetX = event.clientX - rect.left; offsetY = event.clientY - rect.top; element.classList.add('dragging'); document.addEventListener('mousemove', doDrag); document.addEventListener('mouseup', endDrag); document.addEventListener('mouseleave', endDrag); }
    function doDrag(event) { if (!isDragging || !draggedElement) return; event.preventDefault(); const canvasRect = liveCanvas.getBoundingClientRect(); const canvasWidth = canvasRect.width; const canvasHeight = canvasRect.height; let newXpx = event.clientX - canvasRect.left - offsetX; let newYpx = event.clientY - canvasRect.top - offsetY; let newXPercent = (newXpx / canvasWidth) * 100; let newYPercent = (newYpx / canvasHeight) * 100; const elementWidthPercent = (draggedElement.offsetWidth / canvasWidth) * 100; const elementHeightPercent = (draggedElement.offsetHeight / canvasHeight) * 100; newXPercent = Math.max(0, Math.min(newXPercent, 100 - elementWidthPercent)); newYPercent = Math.max(0, Math.min(newYPercent, 100 - elementHeightPercent)); draggedElement.style.left = `${newXPercent}%`; draggedElement.style.top = `${newYPercent}%`; }
    function endDrag(event) { if (!isDragging || !draggedElement) return; event.preventDefault(); const elementId = draggedElement.id.replace('-element', ''); console.log(`Drag ended for ${elementId}`); draggedElement.classList.remove('dragging'); document.removeEventListener('mousemove', doDrag); document.removeEventListener('mouseup', endDrag); document.removeEventListener('mouseleave', endDrag); const canvasRect = liveCanvas.getBoundingClientRect(); const finalLeftPx = draggedElement.offsetLeft; const finalTopPx = draggedElement.offsetTop; const finalXPercent = parseFloat(((finalLeftPx / canvasRect.width) * 100).toFixed(2)); const finalYPercent = parseFloat(((finalTopPx / canvasRect.height) * 100).toFixed(2)); let currentLayouts = loadElementLayouts(); if (currentLayouts[elementId]) { currentLayouts[elementId].x = finalXPercent; currentLayouts[elementId].y = finalYPercent; saveElementLayouts(currentLayouts); console.log(`Saved new pos for ${elementId}: x=${finalXPercent}%, y=${finalYPercent}%`); if (isModalOpen && currentOpenModal === uiSettingsModal) { originalElementLayouts[elementId].x = finalXPercent; originalElementLayouts[elementId].y = finalYPercent; } } else console.error(`Could not find layout key '${elementId}'`); isDragging = false; draggedElement = null; }
    // === 04c: DRAG AND DROP LOGIC END ===


    // === 05: HELPER FUNCTIONS - FORMATTING START ===
    function formatTime(seconds) { if (isNaN(seconds) || seconds < 0) return "00:00"; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }
    function formatBlindsHTML(level) { if (!level) return `<span class="value">--</span>/<span class="value">--</span><span class="label">A:</span><span class="value">--</span>`; let anteHtml = ''; if (level.ante > 0) anteHtml = `<span class="label">A:</span><span class="value">${level.ante.toLocaleString('nb-NO')}</span>`; const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO'); const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO'); return `<span class="value">${sbFormatted}</span>/<span class="value">${bbFormatted}</span>${anteHtml}`; }
    function formatNextBlindsText(level) { if (!level) return "Slutt"; const anteText = level.ante > 0 ? ` / A:${level.ante.toLocaleString('nb-NO')}` : ''; const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO'); const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO'); return `${sbFormatted}/${bbFormatted}${anteText}`; }
    function getPlayerNameById(playerId) { const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId); return player ? player.name : 'Ukjent'; }
    function roundToNearestValid(value, step = 100) { if (isNaN(value) || value <= 0) return step; const rounded = Math.round(value / step) * step; return Math.max(step, rounded); }
    // === 05: HELPER FUNCTIONS - FORMATTING END ===


    // === 06: HELPER FUNCTIONS - CALCULATIONS START ===
    function calculateTotalChips() { const sChips = (state.live.totalEntries || 0) * (state.config.startStack || 0); const rChips = (state.live.totalRebuys || 0) * (state.config.rebuyChips || 0); const aChips = (state.live.totalAddons || 0) * (state.config.addonChips || 0); return sChips + rChips + aChips; }
    function calculateAverageStack() { const ap = state.live.players.length; if (ap === 0) return 0; const tc = calculateTotalChips(); return Math.round(tc / ap); }
    function calculatePrizes() { const prizes = []; const places = state.config.paidPlaces || 0; const dist = state.config.prizeDistribution || []; const pot = state.live.totalPot || 0; let pPot = pot; if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) pPot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0); pPot = Math.max(0, pPot); if (pPot <= 0 || places <= 0 || dist.length !== places) return prizes; let sum = 0; for (let i = 0; i < places; i++) { const pct = dist[i] || 0; let amt; if (i === places - 1) amt = Math.max(0, pPot - sum); else amt = Math.floor((pPot * pct) / 100); prizes.push({ place: i + 1, amount: amt, percentage: pct }); sum += amt; } if (Math.abs(sum - pPot) > 1 && places > 1) console.warn(`Prize calc warning: Sum ${sum} != Pot ${pPot}`); return prizes; }
    function findNextPauseInfo() { const idx = state.live.currentLevelIndex; const lvls = state.config.blindLevels; if (!lvls) return null; const startIdx = state.live.isOnBreak ? idx + 1 : idx; for (let i = startIdx; i < lvls.length; i++) { if (lvls[i].pauseMinutes > 0) return { level: lvls[i].level, duration: lvls[i].pauseMinutes }; } return null; }
    // === 06: HELPER FUNCTIONS - CALCULATIONS END ===


    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT START ===
    function assignTableSeat(player, excludeTableNum = null) { const tables = {}; let validTables = []; state.live.players.forEach(p => { if (p.id !== player.id && p.table && p.table !== excludeTableNum) tables[p.table] = (tables[p.table] || 0) + 1; }); validTables = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).filter(t => t.tableNum !== excludeTableNum); validTables.sort((a, b) => a.count - b.count); let targetTable = -1; for (const t of validTables) { if (t.count < state.config.playersPerTable) { targetTable = t.tableNum; break; } } if (targetTable === -1) { const existing = [...new Set(state.live.players.map(p => p.table).filter(t => t > 0))]; let nextT = existing.length > 0 ? Math.max(0, ...existing) + 1 : 1; if (nextT === excludeTableNum) nextT++; targetTable = nextT; } const occupied = state.live.players.filter(p => p.table === targetTable).map(p => p.seat); let seat = 1; while (occupied.includes(seat)) seat++; if (seat > state.config.playersPerTable && occupied.length >= state.config.playersPerTable) { console.error(`No seat on T${targetTable}!`); seat = occupied.length + 1; } player.table = targetTable; player.seat = seat; console.log(`Assigned ${player.name} -> T${player.table}S${player.seat}`); }
    function reassignAllSeats(targetTableNum) { logActivity(state.live.activityLog, `Finalebord (B${targetTableNum})! Trekker seter...`); const players = state.live.players; const numP = players.length; if (numP === 0) return; const seats = Array.from({ length: numP }, (_, i) => i + 1); for (let i = seats.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [seats[i], seats[j]] = [seats[j], seats[i]]; } players.forEach((p, i) => { p.table = targetTableNum; p.seat = seats[i]; logActivity(state.live.activityLog, ` -> ${p.name} S${p.seat}.`); }); state.live.players.sort((a, b) => a.seat - b.seat); console.log("Final table seats assigned."); }
    function checkAndHandleTableBreak() { if (state.live.status === 'finished') return false; const pCount = state.live.players.length; const maxPPT = state.config.playersPerTable; const tablesSet = new Set(state.live.players.map(p => p.table).filter(t => t > 0)); const tableCount = tablesSet.size; const targetTCount = Math.ceil(pCount / maxPPT); const finalTSize = maxPPT; let action = false; if (tableCount > 1 && pCount <= finalTSize) { const finalTNum = 1; logActivity(state.live.activityLog, `Finalebord (${pCount})! Flytter til B${finalTNum}...`); alert(`Finalebord (${pCount})! Flytter til B${finalTNum}.`); playSound('FINAL_TABLE'); state.live.players.forEach(p => p.table = finalTNum); reassignAllSeats(finalTNum); action = true; } else if (tableCount > targetTCount && tableCount > 1) { const tables = {}; state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; }); const sortedTs = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).sort((a, b) => a.count - b.count); if (sortedTs.length > 0) { const breakTNum = sortedTs[0].tableNum; const msg = `Slår sammen! Flytter fra B${breakTNum}.`; logActivity(state.live.activityLog, msg); alert(msg); const toMove = state.live.players.filter(p => p.table === breakTNum); toMove.forEach(p => { const oT = p.table; const oS = p.seat; p.table = 0; p.seat = 0; assignTableSeat(p, breakTNum); logActivity(state.live.activityLog, ` -> ${p.name} (B${oT}S${oS}) til B${p.table}S${p.seat}.`); }); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); action = true; } } const balanced = balanceTables(); if (action && !balanced) { updateUI(); saveTournamentState(currentTournamentId, state); } else if (!action && !balanced) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); } return action || balanced; }
    function balanceTables() { if (state.live.status === 'finished' || state.live.players.length <= state.config.playersPerTable) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); return false; } let balanced = false; const maxDiff = 1; while (true) { const tables = {}; state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; }); const counts = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).filter(tc => tc.count > 0); if (counts.length < 2) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; } counts.sort((a, b) => a.count - b.count); const minT = counts[0]; const maxT = counts[counts.length - 1]; if (maxT.count - minT.count <= maxDiff) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; } balanced = true; if (tableBalanceInfo) tableBalanceInfo.classList.remove('hidden'); console.log(`Balancing: MaxT${maxT.tableNum}(${maxT.count}), MinT${minT.tableNum}(${minT.count})`); const maxPlayers = state.live.players.filter(p => p.table === maxT.tableNum); if (maxPlayers.length === 0) { console.error(`Balance Err: No players on maxT ${maxT.tableNum}`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; } const pMove = maxPlayers[Math.floor(Math.random() * maxPlayers.length)]; const minSeats = state.live.players.filter(p => p.table === minT.tableNum).map(p => p.seat); let newS = 1; while(minSeats.includes(newS)) { newS++; } if(newS > state.config.playersPerTable) { console.error(`Balance Err: No seat on minT ${minT.tableNum}.`); alert(`Feil: Fant ikke sete på B${minT.tableNum}.`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; } const oldT = pMove.table; const oldS = pMove.seat; const msg = `Balansering: ${pMove.name} fra B${oldT}S${oldS} til B${minT.tableNum}S${newS}.`; pMove.table = minT.tableNum; pMove.seat = newS; logActivity(state.live.activityLog, msg); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); updateUI(); saveTournamentState(currentTournamentId, state); } if (balanced) console.log("Balancing done."); return balanced; }
    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT END ===


    // === 07b: HELPER FUNCTIONS - LOGGING START ===
    // logActivity defined earlier
    // renderActivityLog defined earlier
    // === 07b: HELPER FUNCTIONS - LOGGING END ===


    // === 07c: HELPER FUNCTIONS - SOUND START ===
    function playSound(soundKey) { if (!soundsEnabled) return; const soundUrl = SOUND_URLS[soundKey]; if (!soundUrl) { console.warn(`Sound not found: ${soundKey}`); return; } try { const audio = new Audio(soundUrl); audio.play().catch(e => console.error(`Play fail ${soundUrl}:`, e)); console.log(`Playing: ${soundKey}`); } catch (e) { console.error(`Audio obj fail ${soundUrl}:`, e); } }
    function updateSoundToggleVisuals() { if (btnToggleSound) btnToggleSound.textContent = soundsEnabled ? '🔊 Lyd På' : '🔇 Lyd Av'; }
    // === 07c: HELPER FUNCTIONS - SOUND END ===


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
    if(startPauseButton) startPauseButton.addEventListener('click', handleStartPause);
    if(prevLevelButton) prevLevelButton.addEventListener('click', () => handleAdjustLevel(-1));
    if(nextLevelButton) nextLevelButton.addEventListener('click', () => handleAdjustLevel(1));
    if(adjustTimeMinusButton) adjustTimeMinusButton.addEventListener('click', () => handleAdjustTime(-60));
    if(adjustTimePlusButton) adjustTimePlusButton.addEventListener('click', () => handleAdjustTime(60));
    if(lateRegButton) lateRegButton.addEventListener('click', handleLateRegClick);
    if(endTournamentButton) endTournamentButton.addEventListener('click', handleEndTournament);
    if(btnForceSave) btnForceSave.addEventListener('click', handleForceSave);
    if(btnBackToMainLive) btnBackToMainLive.addEventListener('click', handleBackToMain);
    if(btnToggleSound) btnToggleSound.addEventListener('click', () => { soundsEnabled = !soundsEnabled; saveSoundPreference(soundsEnabled); updateSoundToggleVisuals(); logActivity(state.live.activityLog, `Lyd ${soundsEnabled ? 'PÅ' : 'AV'}.`); }); // Sound toggle listener
    if(btnEditTournamentSettings) btnEditTournamentSettings.addEventListener('click', openTournamentModal);
    if(btnEditUiSettings) btnEditUiSettings.addEventListener('click', openUiModal);
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
    draggableElements.forEach(el => { if (el) el.addEventListener('mousedown', (e) => startDrag(e, el)); });
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
