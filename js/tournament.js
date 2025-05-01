// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', async () => {
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
    let originalSoundVolume = 0.7;
    let currentLogoBlob = null;     // Den faktiske Blob lagret i DB / som skal vises
    let logoBlobInModal = null;   // Midlertidig Blob-referanse mens modal er åpen
    let currentLogoObjectUrl = null; // Aktiv Object URL for hovedlogoen
    let previewLogoObjectUrl = null; // Aktiv Object URL for modal preview
    let blockSliderUpdates = false;

    // Drag and Drop State... (som før)
    let isDragging = false; let draggedElement = null; let offsetX = 0; let offsetY = 0;
    // Sound State & URLs... (som før)
    let soundsEnabled = loadSoundPreference(); let currentVolume = loadSoundVolume(); const SOUND_URLS = { NEW_LEVEL: 'sounds/new_level.wav', PAUSE_START: 'sounds/pause_start.wav', PAUSE_END: 'sounds/pause_end.wav', BUBBLE: 'sounds/bubble_start.wav', KNOCKOUT: 'sounds/knockout.wav', FINAL_TABLE: 'sounds/final_table.wav', TOURNAMENT_END: 'sounds/tournament_end.wav', TEST: 'sounds/new_level.wav' };
    // Predefined Themes... (som før)
    const PREDEFINED_THEMES = [ { name: "Elegant & Moderne", bg: "rgb(28, 28, 30)", text: "rgb(245, 245, 245)" }, { name: "Lys & Frisk", bg: "rgb(232, 245, 252)", text: "rgb(33, 53, 71)" }, { name: "Retro & Kreativ", bg: "rgb(255, 235, 148)", text: "rgb(43, 43, 43)" }, { name: "Dramatisk & Stilren", bg: "rgb(34, 0, 51)", text: "rgb(255, 255, 255)" }, { name: "Naturell & Harmonisk", bg: "rgb(223, 228, 212)", text: "rgb(61, 64, 54)" }, ];
    // Tournament Modal State... (som før)
    let editBlindLevelCounter = 0; const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // ... (alle referanser som før) ...
    const currentTimeDisplay = document.getElementById('current-time'); const btnToggleSound = document.getElementById('btn-toggle-sound'); const btnEditTournamentSettings = document.getElementById('btn-edit-tournament-settings'); const btnEditUiSettings = document.getElementById('btn-edit-ui-settings'); const btnBackToMainLive = document.getElementById('btn-back-to-main-live'); const prizeDisplayLive = document.getElementById('prize-display-live'); const totalPotPrizeSpan = document.getElementById('total-pot'); const startPauseButton = document.getElementById('btn-start-pause'); const prevLevelButton = document.getElementById('btn-prev-level'); const nextLevelButton = document.getElementById('btn-next-level'); const adjustTimeMinusButton = document.getElementById('btn-adjust-time-minus'); const adjustTimePlusButton = document.getElementById('btn-adjust-time-plus'); const lateRegButton = document.getElementById('btn-late-reg'); const playerListUl = document.getElementById('player-list'); const eliminatedPlayerListUl = document.getElementById('eliminated-player-list'); const activePlayerCountSpan = document.getElementById('active-player-count'); const eliminatedPlayerCountSpan = document.getElementById('eliminated-player-count'); const tableBalanceInfo = document.getElementById('table-balance-info'); const btnForceSave = document.getElementById('btn-force-save'); const endTournamentButton = document.getElementById('btn-end-tournament'); const activityLogUl = document.getElementById('activity-log-list'); const headerRightControls = document.querySelector('.header-right-controls'); const liveCanvas = document.getElementById('live-canvas'); const titleElement = document.getElementById('title-element'); const timerElement = document.getElementById('timer-element'); const blindsElement = document.getElementById('blinds-element'); const logoElement = document.getElementById('logo-element'); const infoElement = document.getElementById('info-element'); const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement]; const nameDisplay = document.getElementById('tournament-name-display'); const timerDisplay = document.getElementById('timer-display'); const breakInfo = document.getElementById('break-info'); const currentLevelDisplay = document.getElementById('current-level'); const blindsDisplay = document.getElementById('blinds-display'); const logoImg = logoElement?.querySelector('.logo'); const nextBlindsDisplay = document.getElementById('next-blinds'); const infoNextPauseParagraph = document.getElementById('info-next-pause'); const averageStackDisplay = document.getElementById('average-stack'); const playersRemainingDisplay = document.getElementById('players-remaining'); const totalEntriesDisplay = document.getElementById('total-entries'); const lateRegStatusDisplay = document.getElementById('late-reg-status'); const tournamentSettingsModal = document.getElementById('tournament-settings-modal'); const closeTournamentModalButton = document.getElementById('close-tournament-modal-button'); const editBlindStructureBody = document.getElementById('edit-blind-structure-body'); const btnAddEditLevel = document.getElementById('btn-add-edit-level'); const editPaidPlacesInput = document.getElementById('edit-paid-places'); const editPrizeDistTextarea = document.getElementById('edit-prize-distribution'); const btnGenerateEditPayout = document.getElementById('btn-generate-edit-payout'); const btnSaveTournamentSettings = document.getElementById('btn-save-tournament-settings'); const btnCancelTournamentEdit = document.getElementById('btn-cancel-tournament-edit'); const uiSettingsModal = document.getElementById('ui-settings-modal'); const closeUiModalButton = document.getElementById('close-ui-modal-button'); const canvasHeightSlider = document.getElementById('canvasHeightSlider'); const canvasHeightInput = document.getElementById('canvasHeightInput'); const toggleTitleElement = document.getElementById('toggleTitleElement'); const toggleTimerElement = document.getElementById('toggleTimerElement'); const toggleBlindsElement = document.getElementById('toggleBlindsElement'); const toggleLogoElement = document.getElementById('toggleLogoElement'); const toggleInfoElement = document.getElementById('toggleInfoElement'); const visibilityToggles = [toggleTitleElement, toggleTimerElement, toggleBlindsElement, toggleLogoElement, toggleInfoElement]; const titleWidthSlider = document.getElementById('titleWidthSlider'); const titleWidthInput = document.getElementById('titleWidthInput'); const titleFontSizeSlider = document.getElementById('titleFontSizeSlider'); const titleFontSizeInput = document.getElementById('titleFontSizeInput'); const timerWidthSlider = document.getElementById('timerWidthSlider'); const timerWidthInput = document.getElementById('timerWidthInput'); const timerFontSizeSlider = document.getElementById('timerFontSizeSlider'); const timerFontSizeInput = document.getElementById('timerFontSizeInput'); const blindsWidthSlider = document.getElementById('blindsWidthSlider'); const blindsWidthInput = document.getElementById('blindsWidthInput'); const blindsFontSizeSlider = document.getElementById('blindsFontSizeSlider'); const blindsFontSizeInput = document.getElementById('blindsFontSizeInput'); const logoWidthSlider = document.getElementById('logoWidthSlider'); const logoWidthInput = document.getElementById('logoWidthInput'); const logoHeightSlider = document.getElementById('logoHeightSlider'); const logoHeightInput = document.getElementById('logoHeightInput'); const infoWidthSlider = document.getElementById('infoWidthSlider'); const infoWidthInput = document.getElementById('infoWidthInput'); const infoFontSizeSlider = document.getElementById('infoFontSizeSlider'); const infoFontSizeInput = document.getElementById('infoFontSizeInput'); const toggleInfoNextBlinds = document.getElementById('toggleInfoNextBlinds'); const toggleInfoNextPause = document.getElementById('toggleInfoNextPause'); const toggleInfoAvgStack = document.getElementById('toggleInfoAvgStack'); const toggleInfoPlayers = document.getElementById('toggleInfoPlayers'); const toggleInfoLateReg = document.getElementById('toggleInfoLateReg'); const infoParagraphs = { showNextBlinds: document.getElementById('info-next-blinds'), showNextPause: infoNextPauseParagraph, showAvgStack: document.getElementById('info-avg-stack'), showPlayers: document.getElementById('info-players'), showLateReg: document.getElementById('info-late-reg') }; const customLogoInput = document.getElementById('customLogoInput'); const logoPreview = document.getElementById('logoPreview'); const btnRemoveCustomLogo = document.getElementById('btnRemoveCustomLogo'); const bgRedSlider = document.getElementById('bgRedSlider'); const bgGreenSlider = document.getElementById('bgGreenSlider'); const bgBlueSlider = document.getElementById('bgBlueSlider'); const bgRedInput = document.getElementById('bgRedInput'); const bgGreenInput = document.getElementById('bgGreenInput'); const bgBlueInput = document.getElementById('bgBlueInput'); const bgColorPreview = document.getElementById('bg-color-preview'); const textRedSlider = document.getElementById('textRedSlider'); const textGreenSlider = document.getElementById('textGreenSlider'); const textBlueSlider = document.getElementById('textBlueSlider'); const textRedInput = document.getElementById('textRedInput'); const textGreenInput = document.getElementById('textGreenInput'); const textBlueInput = document.getElementById('textBlueInput'); const textColorPreview = document.getElementById('text-color-preview'); const bgHueSlider = document.getElementById('bgHueSlider'); const bgHueInput = document.getElementById('bgHueInput'); const bgSatSlider = document.getElementById('bgSatSlider'); const bgSatInput = document.getElementById('bgSatInput'); const bgLigSlider = document.getElementById('bgLigSlider'); const bgLigInput = document.getElementById('bgLigInput'); const textHueSlider = document.getElementById('textHueSlider'); const textHueInput = document.getElementById('textHueInput'); const textSatSlider = document.getElementById('textSatSlider'); const textSatInput = document.getElementById('textSatInput'); const textLigSlider = document.getElementById('textLigSlider'); const textLigInput = document.getElementById('textLigInput'); const predefinedThemeSelect = document.getElementById('predefinedThemeSelect'); const btnLoadPredefinedTheme = document.getElementById('btnLoadPredefinedTheme'); const themeFavoritesSelect = document.getElementById('themeFavoritesSelect'); const btnLoadThemeFavorite = document.getElementById('btnLoadThemeFavorite'); const newThemeFavoriteNameInput = document.getElementById('newThemeFavoriteName'); const btnSaveThemeFavorite = document.getElementById('btnSaveThemeFavorite'); const btnDeleteThemeFavorite = document.getElementById('btnDeleteThemeFavorite'); const volumeSlider = document.getElementById('volumeSlider'); const volumeInput = document.getElementById('volumeInput'); const btnTestSound = document.getElementById('btn-test-sound'); const btnSaveUiSettings = document.getElementById('btn-save-ui-settings'); const btnCancelUiEdit = document.getElementById('btn-cancel-ui-edit'); const btnResetLayoutTheme = document.getElementById('btnResetLayoutTheme'); const sizeSliders = [canvasHeightSlider, titleWidthSlider, titleFontSizeSlider, timerWidthSlider, timerFontSizeSlider, blindsWidthSlider, blindsFontSizeSlider, logoWidthSlider, logoHeightSlider, infoWidthSlider, infoFontSizeSlider]; const sizeInputs = [canvasHeightInput, titleWidthInput, titleFontSizeInput, timerWidthInput, timerFontSizeInput, blindsWidthInput, blindsFontSizeInput, logoWidthInput, logoHeightInput, infoWidthInput, infoFontSizeInput]; const colorSliders = [bgHueSlider, bgSatSlider, bgLigSlider, bgRedSlider, bgGreenSlider, bgBlueSlider, textHueSlider, textSatSlider, textLigSlider, textRedSlider, textGreenSlider, textBlueSlider]; const colorInputs = [bgHueInput, bgSatInput, bgLigInput, bgRedInput, bgGreenInput, bgBlueInput, textHueInput, textSatInput, textLigInput, textRedInput, textGreenInput, textBlueInput]; const internalInfoToggles = [toggleInfoNextBlinds, toggleInfoNextPause, toggleInfoAvgStack, toggleInfoPlayers, toggleInfoLateReg];
    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    // ... (som før) ...
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig turneringsdata (ID: ${currentTournamentId}).`); console.error("Invalid tournament state loaded:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    state.live = state.live || {}; state.live.status = state.live.status || 'paused'; state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0; state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60 || 1200); state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.players = state.live.players || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.knockoutLog = state.live.knockoutLog || []; state.live.activityLog = state.live.activityLog || []; state.live.totalPot = state.live.totalPot ?? 0; state.live.totalEntries = state.live.totalEntries ?? 0; state.live.totalRebuys = state.live.totalRebuys ?? 0; state.live.totalAddons = state.live.totalAddons ?? 0;
    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, state);
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 04b: THEME & LAYOUT APPLICATION START ===
    function revokeObjectUrl(url) {
        if (url && url.startsWith('blob:')) {
            try { // Legg til try/catch for sikkerhets skyld
                URL.revokeObjectURL(url);
                 // console.log("Revoked Object URL:", url);
            } catch (e) {
                console.warn("Error revoking Object URL:", url, e);
            }
        }
    }

    // ENDRET: Forenklet applyLogo, lager og fjerner URL her.
    function applyLogo(logoBlob, targetImgElement = logoImg, isPreview = false) {
        if (!targetImgElement) return;

        const currentObjectUrl = isPreview ? previewLogoObjectUrl : currentLogoObjectUrl;
        revokeObjectUrl(currentObjectUrl); // Trekk tilbake forrige URL for dette elementet

        let newObjectUrl = null;
        if (logoBlob instanceof Blob) {
            try {
                newObjectUrl = URL.createObjectURL(logoBlob);
                targetImgElement.src = newObjectUrl;
                targetImgElement.alt = "Egendefinert Logo";
                 // console.log(`Applying logo to ${isPreview ? 'preview' : 'main'}:`, newObjectUrl);
            } catch (e) {
                console.error("Error creating object URL:", e);
                targetImgElement.src = 'placeholder-logo.png'; // Fallback
                targetImgElement.alt = "Feil ved lasting av logo";
            }
        } else {
            targetImgElement.src = 'placeholder-logo.png';
            targetImgElement.alt = isPreview ? "Logo Forhåndsvisning" : "Winjevoll Pokerklubb Logo";
             // console.log(`Applying default logo to ${isPreview ? 'preview' : 'main'}`);
        }

        // Oppdater state-variabelen for URL
        if (isPreview) {
            previewLogoObjectUrl = newObjectUrl;
        } else {
            currentLogoObjectUrl = newObjectUrl;
             // Oppdater også den globale blob-referansen KUN for hovedlogoen
             currentLogoBlob = logoBlob;
        }
    }


    async function applyThemeLayoutAndLogo() {
        console.log("applyThemeLayoutAndLogo: Starting initial load...");
        const bgColor = loadThemeBgColor();
        const textColor = loadThemeTextColor();
        const elementLayouts = loadElementLayouts();
        const logoDataBlob = await loadLogoBlob(); // Hent den lagrede logoen
        console.log("applyThemeLayoutAndLogo: Fetched initial data. Logo Blob:", logoDataBlob);

        applyThemeAndLayout(bgColor, textColor, elementLayouts); // Sett tema/layout (synkront)
        applyLogo(logoDataBlob, logoImg, false); // Sett hovedlogoen (lager URL, oppdaterer currentLogoBlob)
        console.log("applyThemeLayoutAndLogo: Initial theme, layout, and logo applied.");
    }

    function applyThemeAndLayout(bgColor, textColor, elementLayouts) { /* ... (som før) ... */ }

    try {
        await applyThemeLayoutAndLogo(); // Kall ved oppstart
    } catch (err) {
        console.error("Error during initial theme/layout/logo application:", err);
        // Sett fallback hvis noe feiler katastrofalt
        applyThemeAndLayout(DEFAULT_THEME_BG, DEFAULT_THEME_TEXT, DEFAULT_ELEMENT_LAYOUTS);
        applyLogo(null, logoImg, false);
    }
    // === 04b: THEME & LAYOUT APPLICATION END ===


    // === 04c: DRAG AND DROP LOGIC START ===
    function startDrag(event, element) { /* ... (som før) ... */ }
    function doDrag(event) { /* ... (som før) ... */ }
    function endDrag(event) { /* ... (som før) ... */ }
    // === 04c: DRAG AND DROP LOGIC END ===

    // === 05 - 11: HELPER FUNCTIONS, CALCULATIONS, TABLE MGMT, LOGGING, SOUND, UI UPDATES, TIMER, CONTROLS, PLAYER ACTIONS ===
    // INGEN ENDRINGER HER - KOPIER INN SOM FØR
    function formatTime(seconds) { if (isNaN(seconds) || seconds < 0) return "00:00"; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }
    function formatBlindsHTML(level) { if (!level) return `<span class="value">--</span>/<span class="value">--</span><span class="label">A:</span><span class="value">--</span>`; let anteHtml = ''; if (level.ante > 0) anteHtml = `<span class="label">A:</span><span class="value">${level.ante.toLocaleString('nb-NO')}</span>`; const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO'); const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO'); return `<span class="value">${sbFormatted}</span>/<span class="value">${bbFormatted}</span>${anteHtml}`; }
    function formatNextBlindsText(level) { if (!level) return "Slutt"; const anteText = level.ante > 0 ? ` / A:${level.ante.toLocaleString('nb-NO')}` : ''; const sbFormatted = (level.sb ?? '--').toLocaleString('nb-NO'); const bbFormatted = (level.bb ?? '--').toLocaleString('nb-NO'); return `${sbFormatted}/${bbFormatted}${anteText}`; }
    function getPlayerNameById(playerId) { const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId); return player ? player.name : 'Ukjent'; }
    function roundToNearestValid(value, step = 100) { if (isNaN(value) || value <= 0) return step; const rounded = Math.round(value / step) * step; return Math.max(step, rounded); }
    function calculateTotalChips() { const sChips = (state.live.totalEntries || 0) * (state.config.startStack || 0); const rChips = (state.live.totalRebuys || 0) * (state.config.rebuyChips || 0); const aChips = (state.live.totalAddons || 0) * (state.config.addonChips || 0); return sChips + rChips + aChips; }
    function calculateAverageStack() { const ap = state.live.players.length; if (ap === 0) return 0; const tc = calculateTotalChips(); return Math.round(tc / ap); }
    function calculatePrizes() { const prizes = []; const places = state.config.paidPlaces || 0; const dist = state.config.prizeDistribution || []; const pot = state.live.totalPot || 0; let pPot = pot; if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) pPot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0); pPot = Math.max(0, pPot); if (pPot <= 0 || places <= 0 || dist.length !== places) return prizes; let sum = 0; for (let i = 0; i < places; i++) { const pct = dist[i] || 0; let amt; if (i === places - 1) amt = Math.max(0, pPot - sum); else amt = Math.floor((pPot * pct) / 100); prizes.push({ place: i + 1, amount: amt, percentage: pct }); sum += amt; } if (Math.abs(sum - pPot) > 1 && places > 1) console.warn(`Prize calc warning: Sum ${sum} != Pot ${pPot}`); return prizes; }
    function findNextPauseInfo() { const idx = state.live.currentLevelIndex; const lvls = state.config.blindLevels; if (!lvls) return null; const startIdx = state.live.isOnBreak ? idx + 1 : idx; for (let i = startIdx; i < lvls.length; i++) { if (lvls[i].pauseMinutes > 0) return { level: lvls[i].level, duration: lvls[i].pauseMinutes }; } return null; }
    function assignTableSeat(player, excludeTableNum = null) { const tables = {}; let validTables = []; state.live.players.forEach(p => { if (p.id !== player.id && p.table && p.table !== excludeTableNum) tables[p.table] = (tables[p.table] || 0) + 1; }); validTables = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).filter(t => t.tableNum !== excludeTableNum); validTables.sort((a, b) => a.count - b.count); let targetTable = -1; for (const t of validTables) { if (t.count < state.config.playersPerTable) { targetTable = t.tableNum; break; } } if (targetTable === -1) { const existing = [...new Set(state.live.players.map(p => p.table).filter(t => t > 0))]; let nextT = existing.length > 0 ? Math.max(0, ...existing) + 1 : 1; if (nextT === excludeTableNum) nextT++; targetTable = nextT; } const occupied = state.live.players.filter(p => p.table === targetTable).map(p => p.seat); let seat = 1; while (occupied.includes(seat)) seat++; if (seat > state.config.playersPerTable && occupied.length >= state.config.playersPerTable) { console.error(`No seat on T${targetTable}!`); seat = occupied.length + 1; } player.table = targetTable; player.seat = seat; console.log(`Assigned ${player.name} -> T${player.table}S${player.seat}`); }
    function reassignAllSeats(targetTableNum) { logActivity(state.live.activityLog, `Finalebord (B${targetTableNum})! Trekker seter...`); const players = state.live.players; const numP = players.length; if (numP === 0) return; const seats = Array.from({ length: numP }, (_, i) => i + 1); for (let i = seats.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [seats[i], seats[j]] = [seats[j], seats[i]]; } players.forEach((p, i) => { p.table = targetTableNum; p.seat = seats[i]; logActivity(state.live.activityLog, ` -> ${p.name} S${p.seat}.`); }); state.live.players.sort((a, b) => a.seat - b.seat); console.log("Final table seats assigned."); }
    function checkAndHandleTableBreak() { if (state.live.status === 'finished') return false; const pCount = state.live.players.length; const maxPPT = state.config.playersPerTable; const tablesSet = new Set(state.live.players.map(p => p.table).filter(t => t > 0)); const tableCount = tablesSet.size; const targetTCount = Math.ceil(pCount / maxPPT); const finalTSize = maxPPT; console.log(`Table check: Players=${pCount}, Tables=${tableCount}, Target=${targetTCount}`); let action = false; if (tableCount > 1 && pCount <= finalTSize) { const finalTNum = 1; logActivity(state.live.activityLog, `Finalebord (${pCount})! Flytter til B${finalTNum}...`); alert(`Finalebord (${pCount})! Flytter til B${finalTNum}.`); playSound('FINAL_TABLE'); state.live.players.forEach(p => p.table = finalTNum); reassignAllSeats(finalTNum); action = true; } else if (tableCount > targetTCount && tableCount > 1) { const tables = {}; state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; }); const sortedTs = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).sort((a, b) => a.count - b.count); if (sortedTs.length > 0) { const breakTNum = sortedTs[0].tableNum; const msg = `Slår sammen! Flytter fra B${breakTNum}.`; logActivity(state.live.activityLog, msg); alert(msg); const toMove = state.live.players.filter(p => p.table === breakTNum); toMove.forEach(p => { const oT = p.table; const oS = p.seat; p.table = 0; p.seat = 0; assignTableSeat(p, breakTNum); logActivity(state.live.activityLog, ` -> ${p.name} (B${oT}S${oS}) til B${p.table}S${p.seat}.`); }); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); action = true; } } const balanced = balanceTables(); if (action && !balanced) { updateUI(); saveTournamentState(currentTournamentId, state); } else if (!action && !balanced) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); } return action || balanced; }
    function balanceTables() { if (state.live.status === 'finished' || state.live.players.length <= state.config.playersPerTable) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); return false; } let balanced = false; const maxDiff = 1; while (true) { const tables = {}; state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; }); const tableCounts = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).filter(tc => tc.count > 0); if (tableCounts.length < 2) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; } tableCounts.sort((a, b) => a.count - b.count); const minT = tableCounts[0]; const maxT = tableCounts[tableCounts.length - 1]; if (maxT.count - minT.count <= maxDiff) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; } balanced = true; if (tableBalanceInfo) tableBalanceInfo.classList.remove('hidden'); console.log(`Balancing: MaxT${maxT.tableNum}(${maxT.count}), MinT${minT.tableNum}(${minT.count})`); const maxPlayers = state.live.players.filter(p => p.table === maxT.tableNum); if (maxPlayers.length === 0) { console.error(`Balance Err: No players on maxT ${maxT.tableNum}`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; } const pMove = maxPlayers[Math.floor(Math.random() * maxPlayers.length)]; const minSeats = state.live.players.filter(p => p.table === minT.tableNum).map(p => p.seat); let newS = 1; while(minSeats.includes(newS)) { newS++; } if(newS > state.config.playersPerTable) { console.error(`Balance Err: No seat on minT ${minT.tableNum}.`); alert(`Feil: Fant ikke sete på B${minT.tableNum}.`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; } const oldT = pMove.table; const oldS = pMove.seat; const msg = `Balansering: ${pMove.name} fra B${oldT}S${oldS} til B${minT.tableNum}S${newS}.`; pMove.table = minT.tableNum; pMove.seat = newS; logActivity(state.live.activityLog, msg); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); updateUI(); saveTournamentState(currentTournamentId, state); } if (balanced) console.log("Balancing done."); return balanced; }
    function logActivity(logArray, message) { if (!logArray) logArray = state.live.activityLog = []; const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); logArray.unshift({ timestamp, message }); const MAX_LOG_ENTRIES = 100; if (logArray.length > MAX_LOG_ENTRIES) logArray.pop(); console.log(`[Log ${timestamp}] ${message}`); }
    function renderActivityLog() { if (!activityLogUl) return; activityLogUl.innerHTML = ''; const logEntries = state?.live?.activityLog || []; if (logEntries.length === 0) { activityLogUl.innerHTML = '<li>Loggen er tom.</li>'; return; } logEntries.forEach(entry => { const li = document.createElement('li'); li.innerHTML = `<span class="log-time">[${entry.timestamp}]</span> ${entry.message}`; activityLogUl.appendChild(li); }); }
    function playSound(soundKey) { if (!soundsEnabled) return; const soundUrl = SOUND_URLS[soundKey]; if (!soundUrl) { console.warn(`Sound not found: ${soundKey}`); return; } try { const audio = new Audio(soundUrl); audio.volume = currentVolume; audio.play().catch(e => console.error(`Play fail ${soundUrl}:`, e)); console.log(`Playing: ${soundKey} at volume ${currentVolume}`); } catch (e) { console.error(`Audio obj fail ${soundUrl}:`, e); } }
    function updateSoundToggleVisuals() { if (btnToggleSound) btnToggleSound.textContent = soundsEnabled ? '🔊 Lyd På' : '🔇 Lyd Av'; }
    function renderPlayerList() { if (!playerListUl || !eliminatedPlayerListUl || !activePlayerCountSpan || !eliminatedPlayerCountSpan) { console.error("Player list elements missing!"); return; } playerListUl.innerHTML = ''; eliminatedPlayerListUl.innerHTML = ''; const lvl = state.live.currentLevelIndex + 1; const rebuyOk = state.config.type === 'rebuy' && lvl <= state.config.rebuyLevels; const addonOk = state.config.type === 'rebuy' && lvl > state.config.rebuyLevels; const actionsOk = state.live.status !== 'finished'; const activeSorted = [...state.live.players].sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); activeSorted.forEach(p => { const li = document.createElement('li'); let info = `${p.name} <span class="player-details">(B${p.table}S${p.seat})</span>`; if (p.rebuys > 0) info += ` <span class="player-details">[${p.rebuys}R]</span>`; if (p.addon) info += ` <span class="player-details">[A]</span>`; if (state.config.type === 'knockout' && p.knockouts > 0) info += ` <span class="player-details">(KOs: ${p.knockouts})</span>`; let acts = ''; if (actionsOk) { acts += `<button class="btn-edit-player small-button" data-player-id="${p.id}" title="Rediger Navn">✏️</button>`; if (rebuyOk) acts += `<button class="btn-rebuy small-button" data-player-id="${p.id}" title="Rebuy">R</button>`; if (addonOk && !p.addon) acts += `<button class="btn-addon small-button" data-player-id="${p.id}" title="Addon">A</button>`; acts += `<button class="btn-eliminate small-button danger-button" data-player-id="${p.id}" title="Eliminer">X</button>`; } li.innerHTML = `<span class="item-name">${info}</span><div class="list-actions player-actions">${acts}</div>`; playerListUl.appendChild(li); }); const elimSorted = [...state.live.eliminatedPlayers].sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity)); elimSorted.forEach(p => { const li = document.createElement('li'); let info = `${p.place ?? '?'}. ${p.name}`; if (p.rebuys > 0) info += ` <span class="player-details">[${p.rebuys}R]</span>`; if (p.addon) info += ` <span class="player-details">[A]</span>`; if (state.config.type === 'knockout' && p.knockouts > 0) info += ` <span class="player-details">(KOs: ${p.knockouts})</span>`; if (p.eliminatedBy) info += ` <span class="player-details">(av ${getPlayerNameById(p.eliminatedBy)})</span>`; let acts = ''; if (actionsOk) acts += `<button class="btn-restore small-button warning-button" data-player-id="${p.id}" title="Gjenopprett">↩️</button>`; li.innerHTML = `<span class="item-name">${info}</span><div class="list-actions player-actions">${acts}</div>`; eliminatedPlayerListUl.appendChild(li); }); activePlayerCountSpan.textContent = state.live.players.length; eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length; playerListUl.querySelectorAll('.btn-edit-player').forEach(b => b.onclick = handleEditPlayer); playerListUl.querySelectorAll('.btn-rebuy').forEach(b => b.onclick = handleRebuy); playerListUl.querySelectorAll('.btn-addon').forEach(b => b.onclick = handleAddon); playerListUl.querySelectorAll('.btn-eliminate').forEach(b => b.onclick = handleEliminate); eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(b => b.onclick = handleRestore); }
    function displayPrizes() { if (!prizeDisplayLive || !totalPotPrizeSpan) return; const prizeData = calculatePrizes(); const totalPotFmt = (state.live.totalPot || 0).toLocaleString('nb-NO'); prizeDisplayLive.querySelector('h3').innerHTML = `Premiefordeling (Totalpott: <span id="total-pot">${totalPotFmt}</span> kr)`; const ol = prizeDisplayLive.querySelector('ol'); const p = prizeDisplayLive.querySelector('p'); if(ol) ol.remove(); if(p) p.remove(); if (prizeData.length > 0) { const list = document.createElement('ol'); prizeData.forEach(pr => { const item = document.createElement('li'); item.textContent = `${pr.place}.: ${pr.amount.toLocaleString('nb-NO')} kr (${pr.percentage}%)`; list.appendChild(item); }); prizeDisplayLive.appendChild(list); prizeDisplayLive.classList.remove('hidden'); } else { const msgP = document.createElement('p'); const places = state.config.paidPlaces || 0; const dist = state.config.prizeDistribution || []; const totPot = state.live.totalPot || 0; let pPot = totPot; if (state.config.type === 'knockout') pPot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0); if (pPot <= 0 && totPot > 0) msgP.textContent = 'Ingen pott å fordele (etter bounty).'; else if (pPot <= 0) msgP.textContent = 'Ingen pott å fordele.'; else if (places <= 0) msgP.textContent = 'Antall betalte ikke definert.'; else if (dist.length !== places) msgP.textContent = 'Premier matcher ikke betalte plasser.'; else msgP.textContent = 'Premiefordeling N/A.'; prizeDisplayLive.appendChild(msgP); prizeDisplayLive.classList.add('hidden'); } }
    function updateUI() { if (!state?.config || !state.live) { console.error("State missing in updateUI"); if(nameDisplay) nameDisplay.textContent = "Error!"; return; } if (nameDisplay) nameDisplay.textContent = state.config.name; if(currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); const i = state.live.currentLevelIndex; const cl = state.config.blindLevels?.[i]; const nl = state.config.blindLevels?.[i + 1]; const np = findNextPauseInfo(); if (state.live.isOnBreak) { if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak); if(blindsElement) blindsElement.classList.add('hidden'); if(breakInfo) breakInfo.classList.remove('hidden'); } else { if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); if(blindsElement) blindsElement.classList.remove('hidden'); if(breakInfo) breakInfo.classList.add('hidden'); if(currentLevelDisplay) currentLevelDisplay.textContent = `(Nivå ${cl ? cl.level : 'N/A'})`; if(blindsDisplay) blindsDisplay.innerHTML = formatBlindsHTML(cl); } if(nextBlindsDisplay) nextBlindsDisplay.textContent = formatNextBlindsText(nl); if(averageStackDisplay) averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO'); if(playersRemainingDisplay) playersRemainingDisplay.textContent = state.live.players.length; if(totalEntriesDisplay) totalEntriesDisplay.textContent = state.live.totalEntries; const lvlLR = i + 1; const lrOpen = lvlLR <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished'; if (lateRegStatusDisplay) { if (state.config.lateRegLevel > 0) lateRegStatusDisplay.textContent = `${lrOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`; else lateRegStatusDisplay.textContent = 'Ikke aktiv'; } if (infoNextPauseParagraph) { const span = infoNextPauseParagraph.querySelector('#next-pause-time'); if (span) span.textContent = np ? `Etter nivå ${np.level} (${np.duration} min)` : 'Ingen flere'; } const isFin = state.live.status === 'finished'; if(startPauseButton) { startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke'; startPauseButton.disabled = isFin; } if(prevLevelButton) prevLevelButton.disabled = i <= 0 || isFin; if(nextLevelButton) nextLevelButton.disabled = i >= state.config.blindLevels.length - 1 || isFin; if(adjustTimeMinusButton) adjustTimeMinusButton.disabled = isFin; if(adjustTimePlusButton) adjustTimePlusButton.disabled = isFin; if(lateRegButton) lateRegButton.disabled = !lrOpen || isFin; if(btnEditTournamentSettings) btnEditTournamentSettings.disabled = isFin; if(endTournamentButton) endTournamentButton.disabled = isFin; updateSoundToggleVisuals(); renderPlayerList(); displayPrizes(); renderActivityLog(); }
    function tick() { if (state.live.status !== 'running') return; if (state.live.isOnBreak) { state.live.timeRemainingInBreak--; if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak); if (state.live.timeRemainingInBreak < 0) { state.live.isOnBreak = false; state.live.currentLevelIndex++; if (state.live.currentLevelIndex >= state.config.blindLevels.length) { logActivity(state.live.activityLog, "Pause ferdig. Blindstruktur fullført."); playSound('PAUSE_END'); finishTournament(); return; } const newLvl = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = newLvl.duration * 60; logActivity(state.live.activityLog, `Pause over. Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`); playSound('PAUSE_END'); setTimeout(() => playSound('NEW_LEVEL'), 500); updateUI(); saveTournamentState(currentTournamentId, state); } else if (state.live.timeRemainingInBreak % 15 === 0) saveTournamentState(currentTournamentId, state); } else { state.live.timeRemainingInLevel--; if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); if (state.live.timeRemainingInLevel < 0) { const currentLvl = state.config.blindLevels[state.live.currentLevelIndex]; const pause = currentLvl?.pauseMinutes || 0; if (pause > 0) { state.live.isOnBreak = true; state.live.timeRemainingInBreak = pause * 60; logActivity(state.live.activityLog, `Nivå ${currentLvl.level} ferdig. Starter ${pause} min pause.`); playSound('PAUSE_START'); updateUI(); saveTournamentState(currentTournamentId, state); } else { state.live.currentLevelIndex++; if (state.live.currentLevelIndex >= state.config.blindLevels.length) { logActivity(state.live.activityLog, `Nivå ${currentLvl.level} ferdig. Blindstruktur fullført.`); playSound('NEW_LEVEL'); finishTournament(); return; } const newLvl = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = newLvl.duration * 60; logActivity(state.live.activityLog, `Nivå ${currentLvl.level} ferdig. Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`); playSound('NEW_LEVEL'); updateUI(); saveTournamentState(currentTournamentId, state); } } else if (state.live.timeRemainingInLevel > 0 && state.live.timeRemainingInLevel % 30 === 0) saveTournamentState(currentTournamentId, state); } }
    function startRealTimeClock() { if (realTimeInterval) clearInterval(realTimeInterval); realTimeInterval = setInterval(() => { if (currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }, 1000); }
    function handleStartPause() { if (state.live.status === 'finished') return; if (state.live.status === 'paused') { state.live.status = 'running'; if (!timerInterval) timerInterval = setInterval(tick, 1000); logActivity(state.live.activityLog, "Klokke startet."); } else { state.live.status = 'paused'; logActivity(state.live.activityLog, "Klokke pauset."); saveTournamentState(currentTournamentId, state); } updateUI(); }
    function handleAdjustTime(deltaSeconds) { if (state.live.status === 'finished') return; let key = state.live.isOnBreak ? 'timeRemainingInBreak' : 'timeRemainingInLevel'; let maxT = Infinity; if (!state.live.isOnBreak) { const lvl = state.config.blindLevels[state.live.currentLevelIndex]; if (lvl) maxT = lvl.duration * 60; } state.live[key] = Math.max(0, Math.min(state.live[key] + deltaSeconds, maxT)); logActivity(state.live.activityLog, `Tid justert ${deltaSeconds > 0 ? '+' : ''}${deltaSeconds / 60} min.`); updateUI(); saveTournamentState(currentTournamentId, state); }
    function handleAdjustLevel(deltaIndex) { if (state.live.status === 'finished') return; const newIdx = state.live.currentLevelIndex + deltaIndex; if (newIdx >= 0 && newIdx < state.config.blindLevels.length) { const oldLvlNum = state.config.blindLevels[state.live.currentLevelIndex]?.level || '?'; const newLvl = state.config.blindLevels[newIdx]; if (!confirm(`Endre til Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)})?\nKlokken nullstilles.`)) return; state.live.currentLevelIndex = newIdx; state.live.timeRemainingInLevel = newLvl.duration * 60; state.live.isOnBreak = false; state.live.timeRemainingInBreak = 0; logActivity(state.live.activityLog, `Nivå manuelt endret: ${oldLvlNum} -> ${newLvl.level}.`); playSound('NEW_LEVEL'); updateUI(); saveTournamentState(currentTournamentId, state); } else alert("Kan ikke gå til nivået."); }
    function handleEndTournament() { if (state.live.status === 'finished') { alert("Turneringen er allerede fullført."); return; } if (confirm("Markere turneringen som fullført?")) finishTournament(); }
    function handleForceSave() { if (state) { console.log("Forcing save..."); if (saveTournamentState(currentTournamentId, state)) { if(btnForceSave) btnForceSave.textContent = "Lagret!"; setTimeout(() => { if(btnForceSave) btnForceSave.textContent = "Lagre Nå"; }, 1500); } else alert("Lagring feilet!"); } else console.error("State missing on force save."); }
    function handleBackToMain() { if (state && state.live.status !== 'finished') saveTournamentState(currentTournamentId, state); window.location.href = 'index.html'; }
    function handleRebuy(event){ const pId=parseInt(event.target.dataset.playerId); const p=state.live.players.find(pl=>pl.id===pId); const lvl=state.live.currentLevelIndex+1; if(!p){return;} if(state.config.type!=='rebuy'||!(lvl<=state.config.rebuyLevels)){alert("Re-buy N/A.");return;} if(state.live.status==='finished'){alert("Turnering fullført.");return;} if(confirm(`Re-buy (${state.config.rebuyCost}kr/${state.config.rebuyChips}c) for ${p.name}?`)){ p.rebuys=(p.rebuys||0)+1; state.live.totalPot+=state.config.rebuyCost; state.live.totalEntries++; state.live.totalRebuys++; logActivity(state.live.activityLog,`${p.name} tok Re-buy.`); updateUI(); saveTournamentState(currentTournamentId,state);}}
    function handleAddon(event){ const pId=parseInt(event.target.dataset.playerId); const p=state.live.players.find(pl=>pl.id===pId); const lvl=state.live.currentLevelIndex+1; const isAP=lvl>state.config.rebuyLevels; if(!p){return;} if(state.config.type!=='rebuy'||!isAP||p.addon){alert("Add-on N/A.");return;} if(state.live.status==='finished'){alert("Turnering fullført.");return;} if(confirm(`Add-on (${state.config.addonCost}kr/${state.config.addonChips}c) for ${p.name}?`)){ p.addon=true; state.live.totalPot+=state.config.addonCost; state.live.totalAddons++; logActivity(state.live.activityLog,`${p.name} tok Add-on.`); updateUI(); saveTournamentState(currentTournamentId,state);}}
    function handleEliminate(event){ if(state.live.status==='finished') return; const pId=parseInt(event.target.dataset.playerId); const ap=state.live.players; const pI=ap.findIndex(p=>p.id===pId); if(pI===-1) return; if (ap.length <= 1) { alert("Kan ikke eliminere siste spiller."); return; } const p=ap[pI]; let koId = null; if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) { const assigners = ap.filter(pl=>pl.id!==pId); const overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:200;'; const box = document.createElement('div'); box.style.cssText = 'background:#fff;color:#333;padding:25px;border-radius:5px;text-align:center;max-width:400px;box-shadow:0 5px 15px rgba(0,0,0,0.3);'; box.innerHTML = `<h3 style="margin-top:0;margin-bottom:15px;color:#333;">Hvem slo ut ${p.name}?</h3><select id="ko-sel" style="padding:8px;margin:10px 0 20px 0;min-width:250px;max-width:100%;border:1px solid #ccc;border-radius:4px;font-size:1em;"><option value="">-- Velg --</option><option value="none">Ingen KO</option>${assigners.map(pl => `<option value="${pl.id}">${pl.name} (B${pl.table}S${pl.seat})</option>`).join('')}</select><div><button id="ko-ok" class="success-button" style="margin-right:10px;padding:8px 15px;font-size:0.95em;">Bekreft</button><button id="ko-cancel" style="padding:8px 15px;font-size:0.95em;">Avbryt</button></div>`; overlay.appendChild(box); document.body.appendChild(overlay); const closeKo = () => { if (document.body.contains(overlay)) document.body.removeChild(overlay); }; document.getElementById('ko-ok').onclick = () => { const selVal = document.getElementById('ko-sel').value; if (!selVal) { alert("Velg spiller/Ingen KO."); return; } koId = (selVal === "none") ? null : parseInt(selVal); closeKo(); proceed(); }; document.getElementById('ko-cancel').onclick = () => { closeKo(); console.log("KO selection cancelled."); }; } else { koId = null; proceed(); } function proceed() { let koName = null; let koObj = null; if (koId !== null) { koObj = ap.find(pl=>pl.id===koId); if (koObj) koName = koObj.name; else { console.warn("Selected KO player not found:", koId); koId = null; } } const confirmMsg = `Eliminere ${p.name}?` + (koName ? ` (KO til ${koName})` : ''); if (confirm(confirmMsg)) { playSound('KNOCKOUT'); p.eliminated=true; p.eliminatedBy=koId; const playersRemainingBefore = ap.length; p.place=playersRemainingBefore; if (koObj) { koObj.knockouts=(koObj.knockouts||0)+1; state.live.knockoutLog.push({ eliminatedPlayerId: p.id, eliminatedByPlayerId: koObj.id, level: state.live.currentLevelIndex + 1, timestamp: new Date().toISOString() }); console.log(`KO: ${koObj.name} -> ${p.name}`); } state.live.eliminatedPlayers.push(p); ap.splice(pI,1); const logTxt = koName ? ` av ${koName}` : ''; logActivity(state.live.activityLog,`${p.name} slått ut (${p.place}.plass${logTxt}).`); console.log(`Player ${p.name} eliminated. ${ap.length} remaining.`); if (state.config.paidPlaces > 0 && ap.length === state.config.paidPlaces) { logActivity(state.live.activityLog, `Boblen sprakk! ${ap.length} spillere igjen (i pengene).`); playSound('BUBBLE'); } const structChanged = checkAndHandleTableBreak(); if (!structChanged) { updateUI(); saveTournamentState(currentTournamentId, state); } if (state.live.players.length <= 1) finishTournament(); } else console.log("Elimination cancelled."); } }
    function handleRestore(event){ if(state.live.status==='finished'){ alert("Turnering fullført."); return; } const pId=parseInt(event.target.dataset.playerId); const pI=state.live.eliminatedPlayers.findIndex(p=>p.id===pId); if(pI===-1) return; const p=state.live.eliminatedPlayers[pI]; const oldP = p.place; if(confirm(`Gjenopprette ${p.name} (var ${oldP}.plass)?`)){ const koById = p.eliminatedBy; p.eliminated=false; p.eliminatedBy=null; p.place=null; state.live.eliminatedPlayers.splice(pI,1); state.live.players.push(p); if(state.config.type==='knockout'&&koById){ let koGetter = state.live.players.find(pl=>pl.id===koById)||state.live.eliminatedPlayers.find(pl=>pl.id===koById); if(koGetter?.knockouts>0){ koGetter.knockouts--; console.log(`KO reversed for ${koGetter.name}.`); const logI = state.live.knockoutLog.findIndex(l=>l.eliminatedPlayerId===p.id&&l.eliminatedByPlayerId===koById); if(logI>-1) state.live.knockoutLog.splice(logI,1); } } assignTableSeat(p); logActivity(state.live.activityLog,`${p.name} gjenopprettet fra ${oldP}.plass (B${p.table}S${p.seat}).`); const structChanged = checkAndHandleTableBreak(); if (!structChanged) { updateUI(); saveTournamentState(currentTournamentId, state); } } }
    function handleEditPlayer(event){ if(state.live.status === 'finished') return; const pId=parseInt(event.target.dataset.playerId); const p = state.live.players.find(pl=>pl.id===pId)||state.live.eliminatedPlayers.find(pl=>pl.id===pId); if(!p) return; const oN=p.name; const nN=prompt(`Endre navn for ${oN}:`,oN); if(nN?.trim()&&nN.trim()!==oN){p.name=nN.trim(); logActivity(state.live.activityLog,`Navn endret: ${oN} -> ${p.name}.`); renderPlayerList(); saveTournamentState(currentTournamentId,state);}else if(nN!==null&&!nN.trim())alert("Navn tomt.");}
    function handleLateRegClick() { if(state.live.status === 'finished') return; const lvl=state.live.currentLevelIndex + 1; const isOpen = lvl <= state.config.lateRegLevel && state.config.lateRegLevel > 0; if (!isOpen) { const reason = state.config.lateRegLevel > 0 ? `stengte etter nivå ${state.config.lateRegLevel}` : "ikke aktivert"; alert(`Sen registrering ${reason}.`); return; } const name = prompt("Navn (Late Reg):"); if (name?.trim()) { const p={id:generateUniqueId('p'), name:name.trim(), stack:state.config.startStack, table:0, seat:0, rebuys:0, addon:false, eliminated:false, eliminatedBy:null, place:null, knockouts:0 }; assignTableSeat(p); state.live.players.push(p); state.live.totalPot+=state.config.buyIn; state.live.totalEntries++; logActivity(state.live.activityLog,`${p.name} registrert (Late Reg, B${p.table}S${p.seat}).`); state.live.players.sort((a,b)=>a.table===b.table?a.seat-b.seat:a.table-b.table); const structChanged = checkAndHandleTableBreak(); if(!structChanged){updateUI(); saveTournamentState(currentTournamentId,state);} } else if(name !== null) alert("Navn tomt."); }
    // === 11: EVENT HANDLERS - PLAYER ACTIONS END ===


    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    function openTournamentModal() { /* ... (som før) ... */ }
    function closeTournamentModal() { /* ... (som før) ... */ }

    async function openUiModal() {
        if (isModalOpen) return;
        console.log("Opening UI modal");
        // Store original values
        originalThemeBg = loadThemeBgColor();
        originalThemeText = loadThemeTextColor();
        originalElementLayouts = loadElementLayouts(); // Last inn layout FØR logo
        originalSoundVolume = loadSoundVolume();
        // logoBlobInModal settes fra currentLogoBlob som lastes under
        console.log("Opening UI modal: Fetching logo blob...");
        logoBlobInModal = await loadLogoBlob(); // Hent den lagrede logoen
        currentLogoBlob = logoBlobInModal; // Synkroniser current med det vi fant
        console.log("Opening UI modal: Logo blob fetched:", logoBlobInModal);

        blockSliderUpdates=true;
        // Populate Colors, Layout, Toggles, Sound (som før)
        /* ... */
        // Populate Logo Preview
        console.log("Opening UI modal: Updating preview...");
        revokeObjectUrl(previewLogoObjectUrl); // Rydd opp gammel URL
        previewLogoObjectUrl = logoBlobInModal ? URL.createObjectURL(logoBlobInModal) : null;
        logoPreview.src = previewLogoObjectUrl || 'placeholder-logo.png';
        customLogoInput.value = '';
        console.log("Opening UI modal: Preview updated. URL:", previewLogoObjectUrl);
        /* ... */
        blockSliderUpdates=false;

        // Populate Dropdowns
        populatePredefinedThemes();
        populateThemeFavorites();

        updateColorAndLayoutPreviews(); // Oppdaterer alt, inkl. hovedlogo-visning
        addThemeAndLayoutListeners();

        uiSettingsModal.classList.remove('hidden'); isModalOpen = true; currentOpenModal = uiSettingsModal;
        console.log("Opening UI modal: Modal is now open.");
    }

    async function closeUiModal(revert = false) {
        console.log(`Closing UI modal. Revert: ${revert}`);
        // Revoke preview URL uansett når modalen lukkes
        console.log("Closing UI modal: Revoking preview URL:", previewLogoObjectUrl);
        revokeObjectUrl(previewLogoObjectUrl);
        previewLogoObjectUrl = null;

        if (revert) {
            console.log("Closing UI modal: Reverting changes...");
            // Revert Theme, Layout, Volume (synkront)
            applyThemeAndLayout(originalThemeBg, originalThemeText, originalElementLayouts);
            currentVolume = originalSoundVolume;

            // Revert Logo til den *faktisk lagrede* tilstanden (ikke nødvendigvis original da modalen åpnet)
            const storedBlob = await loadLogoBlob(); // Hent den lagrede blobben
            console.log("Closing UI modal: Applying stored logo blob:", storedBlob);
            applyLogo(storedBlob, logoImg, false); // Oppdater hovedvisning

            console.log("Closing UI modal: Revert complete.");
        } else {
            // Hvis vi IKKE reverterer (dvs. lagret eller reset),
            // er logoen i hovedvisningen (currentLogoBlob / currentLogoObjectUrl)
            // allerede satt korrekt av handleSaveUiSettings eller handleResetLayoutTheme.
             console.log("Closing UI modal: No revert needed.");
             // Vi må likevel sikre at currentLogoBlob er oppdatert etter Save/Reset
             applyLogo(currentLogoBlob, logoImg, false);
        }
        removeThemeAndLayoutListeners();
        uiSettingsModal.classList.add('hidden');
        isModalOpen = false;
        currentOpenModal = null;
        console.log("Closing UI modal: Modal closed.");
    }

    function addEditBlindLevelRow(levelData={}){ /* ... (som før) ... */ }
    function updateEditLevelNumbers(){ /* ... (som før) ... */ }
    function generateEditPayout(){ /* ... (som før) ... */ }
    function syncRgbFromHsl(prefix){ /* ... (som før) ... */ }
    function syncHslFromRgb(prefix){ /* ... (som før) ... */ }

    // ENDRET: Oppdaterer nå logo live basert på logoBlobInModal
    function updateColorAndLayoutPreviews() {
        if (!isModalOpen || currentOpenModal !== uiSettingsModal) return;
        console.log("updateColorAndLayoutPreviews: Updating...");
        const bg = syncHslFromRgb('bg');
        const txt = syncHslFromRgb('text');
        // Hent layout-innstillinger fra modal...
        const layouts = { canvas:{height:parseInt(canvasHeightInput.value)} };
        const currentFullLayouts = loadElementLayouts(); // For å få X/Y etc.
        visibilityToggles.forEach(toggle => {
            const elementId = toggle.dataset.elementId.replace('-element','');
            layouts[elementId] = {
                 ...(currentFullLayouts[elementId] || DEFAULT_ELEMENT_LAYOUTS[elementId]), // Start med lagret/default
                 // Overskriv med verdier fra modalens kontroller
                 width: parseInt(document.getElementById(`${elementId}WidthSlider`)?.value ?? (currentFullLayouts[elementId]?.width || DEFAULT_ELEMENT_LAYOUTS[elementId].width)),
                 fontSize: parseFloat(document.getElementById(`${elementId}FontSizeSlider`)?.value ?? (currentFullLayouts[elementId]?.fontSize || DEFAULT_ELEMENT_LAYOUTS[elementId].fontSize)),
                 height: parseInt(document.getElementById(`${elementId}HeightSlider`)?.value ?? (currentFullLayouts[elementId]?.height || DEFAULT_ELEMENT_LAYOUTS[elementId].height)), // For logo
                 isVisible: toggle.checked,
                 // Bruk X/Y fra da modalen åpnet (originalElementLayouts) for å ikke resette drag&drop
                 x: originalElementLayouts[elementId]?.x ?? DEFAULT_ELEMENT_LAYOUTS[elementId].x,
                 y: originalElementLayouts[elementId]?.y ?? DEFAULT_ELEMENT_LAYOUTS[elementId].y,
            };
            if (elementId === 'info') {
                 layouts.info.showNextBlinds = toggleInfoNextBlinds.checked;
                 layouts.info.showNextPause = toggleInfoNextPause.checked;
                 layouts.info.showAvgStack = toggleInfoAvgStack.checked;
                 layouts.info.showPlayers = toggleInfoPlayers.checked;
                 layouts.info.showLateReg = toggleInfoLateReg.checked;
             }
        });

        // Preview farger (som før)
        if(bgColorPreview) bgColorPreview.style.backgroundColor = bg;
        if(textColorPreview) { textColorPreview.style.backgroundColor = bg; textColorPreview.querySelector('span').style.color = txt; }

        // Apply changes live (Theme, Layout)
        applyThemeAndLayout(bg, txt, layouts);

        // Apply logo preview basert på modalens state
        // Dette kaller applyLogo med logoBlobInModal, som oppdaterer hovedlogoen også.
        applyLogo(logoBlobInModal, logoImg, false);
        console.log("updateColorAndLayoutPreviews: Live preview updated.");
    }

    function handleThemeLayoutControlChange(e) {
         // console.log("handleThemeLayoutControlChange triggered by:", e.target.id);
        // ... (resten av koden som før, synkroniserer inputs/sliders) ...
        // Kall oppdatering til slutt
        updateColorAndLayoutPreviews();
    }

    function addThemeAndLayoutListeners(){ /* ... (som før) ... */ }
    function removeThemeAndLayoutListeners(){ /* ... (som før) ... */ }
    function populatePredefinedThemes() { /* ... (som før) ... */ }
    function handleLoadPredefinedTheme() { /* ... (som før) ... */ }
    function populateThemeFavorites() { /* ... (som før) ... */ }
    function enableDisableDeleteButton(){ /* ... (som før) ... */ }
    function handleLoadFavorite() { /* ... (som før) ... */ }
    function handleSaveFavorite() { /* ... (som før) ... */ }
    function handleDeleteFavorite() { /* ... (som før) ... */ }
    function handleSaveTournamentSettings(){ /* ... (som før) ... */ }

    async function handleSaveUiSettings(){
        console.log("handleSaveUiSettings: Attempting to save...");
        let themeCh=false; let layoutCh=false; let volumeCh = false; let logoCh = false;
        let success = true;

        // Theme...
        const bg=`rgb(${bgRedInput.value}, ${bgGreenInput.value}, ${bgBlueInput.value})`;
        const txt=`rgb(${textRedInput.value}, ${textGreenInput.value}, ${textBlueInput.value})`;
        if(bg!==originalThemeBg||txt!==originalThemeText){ saveThemeBgColor(bg); saveThemeTextColor(txt); console.log("Theme saved."); themeCh=true; originalThemeBg = bg; originalThemeText = txt;} // Oppdater original

        // Layout...
        // Hent layout fra modal controls, men bruk original X/Y
        const finalLayouts = { canvas:{height:parseInt(canvasHeightInput.value)} };
        draggableElements.forEach(element => {
             if (!element) return;
             const elementId = element.id.replace('-element', '');
             const visibilityToggle = document.getElementById(`toggle${elementId.charAt(0).toUpperCase() + elementId.slice(1)}Element`);
             finalLayouts[elementId] = { // Start med tom, fyll fra modal controls
                 width: parseInt(document.getElementById(`${elementId}WidthSlider`)?.value ?? DEFAULT_ELEMENT_LAYOUTS[elementId].width),
                 fontSize: parseFloat(document.getElementById(`${elementId}FontSizeSlider`)?.value ?? DEFAULT_ELEMENT_LAYOUTS[elementId].fontSize),
                 height: parseInt(document.getElementById(`${elementId}HeightSlider`)?.value ?? DEFAULT_ELEMENT_LAYOUTS[elementId].height),
                 isVisible: visibilityToggle.checked,
                 x: originalElementLayouts[elementId]?.x ?? DEFAULT_ELEMENT_LAYOUTS[elementId].x, // Behold X fra modal open
                 y: originalElementLayouts[elementId]?.y ?? DEFAULT_ELEMENT_LAYOUTS[elementId].y, // Behold Y fra modal open
             };
              if (elementId === 'info') {
                  finalLayouts.info.showNextBlinds = toggleInfoNextBlinds.checked;
                  finalLayouts.info.showNextPause = toggleInfoNextPause.checked;
                  finalLayouts.info.showAvgStack = toggleInfoAvgStack.checked;
                  finalLayouts.info.showPlayers = toggleInfoPlayers.checked;
                  finalLayouts.info.showLateReg = toggleInfoLateReg.checked;
              }
         });
        if(JSON.stringify(finalLayouts)!==JSON.stringify(originalElementLayouts)){ saveElementLayouts(finalLayouts); console.log("Layout saved."); layoutCh=true; originalElementLayouts = finalLayouts; } // Oppdater original

        // Sound Volume...
        const finalVolume = parseFloat(volumeInput.value);
        if (finalVolume !== originalSoundVolume) { saveSoundVolume(finalVolume); currentVolume = finalVolume; console.log("Volume saved."); volumeCh = true; originalSoundVolume = finalVolume; } // Oppdater original

        // Logo
        console.log("handleSaveUiSettings: Comparing logo blobs. Modal:", logoBlobInModal, "Current:", currentLogoBlob);
        if (logoBlobInModal !== currentLogoBlob) {
            console.log("handleSaveUiSettings: Logo has changed.");
            if (logoBlobInModal === null) {
                console.log("handleSaveUiSettings: Clearing logo blob...");
                if (!await clearLogoBlob()) { success = false; }
                else { console.log("Custom logo cleared from storage."); }
            } else {
                console.log("handleSaveUiSettings: Saving new logo blob...");
                if (!await saveLogoBlob(logoBlobInModal)) { success = false; }
                else { console.log("Custom logo saved to storage."); }
            }
            if (success) {
                logoCh = true;
                currentLogoBlob = logoBlobInModal; // VIKTIG: Oppdater currentLogoBlob NÅ
                 console.log("handleSaveUiSettings: currentLogoBlob updated.");
            } else {
                console.error("handleSaveUiSettings: Failed to save/clear logo.");
                return; // Stopp lagring
            }
        } else {
            console.log("handleSaveUiSettings: Logo unchanged.");
        }

        // Close modal if changes were made and saved successfully
        if (success && (themeCh || layoutCh || volumeCh || logoCh)) {
            console.log("handleSaveUiSettings: Changes detected and saved. Closing modal.");
            // Visuell oppdatering skjer via updateColorAndLayoutPreviews + applyLogo
            // Sørg for at den *endelige* lagrede logoen vises
            applyLogo(currentLogoBlob, logoImg, false);
            alert("Utseende & Lyd lagret!");
            closeUiModal(false); // Ikke revert
        } else if (success) {
            console.log("handleSaveUiSettings: No changes detected. Closing modal.");
            alert("Ingen endringer å lagre.");
            closeUiModal(false); // Ikke revert
        }
         // Hvis !success, er feilmelding vist og modalen forblir åpen
    }

    async function handleResetLayoutTheme() {
        if (confirm("Tilbakestille layout, farger, logo og lyd til standard?")) {
             console.log("handleResetLayoutTheme: Resetting...");
            const dLayout = DEFAULT_ELEMENT_LAYOUTS; const dBg = DEFAULT_THEME_BG; const dTxt = DEFAULT_THEME_TEXT; const dVol = DEFAULT_SOUND_VOLUME;

            // Lag reset layout basert på defaults, men behold X/Y fra *før* modal åpnet
             const resetLayouts = {};
             for (const key in dLayout) {
                 resetLayouts[key] = {
                     ...dLayout[key],
                     x: originalElementLayouts[key]?.x ?? dLayout[key].x,
                     y: originalElementLayouts[key]?.y ?? dLayout[key].y
                 };
             }
             resetLayouts.info = { ...resetLayouts.info, ...dLayout.info };

            // Apply visual reset for theme, layout, sound
            applyThemeAndLayout(dBg, dTxt, resetLayouts);
            currentVolume = dVol;
            volumeInput.value = volumeSlider.value = dVol;

            // Reset logo state in modal
            logoBlobInModal = null; // VIKTIG: Sett modal-state til null
            revokeObjectUrl(previewLogoObjectUrl); previewLogoObjectUrl = null; // Rydd opp preview
            logoPreview.src = 'placeholder-logo.png';
            customLogoInput.value = '';
            applyLogo(null, logoImg, false); // Vis standardlogo live

            // Update modal controls... (som før)
            blockSliderUpdates=true; /* ... */ blockSliderUpdates=false;

            alert("Layout/farger/lyd/logo tilbakestilt i modalen. Trykk Lagre for å bruke endringene (inkludert fjerning av lagret logo).")
            console.log("handleResetLayoutTheme: Reset applied visually. Pending save.");
        }
    }

    function handleLogoUpload(event) {
        const file = event.target.files[0];
        console.log("handleLogoUpload: File selected:", file);
        if (!file) return;
        const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (!validTypes.includes(file.type)) { alert('Ugyldig filtype.'); customLogoInput.value = ''; return; }
        // const maxSizeMB = 4; if (file.size > maxSizeMB * 1024 * 1024) { alert(`Filen er stor (over ${maxSizeMB}MB), men vi prøver å lagre.`); }

        // Oppdater modal state
        logoBlobInModal = file; // Referer direkte til fil-objektet
         console.log("handleLogoUpload: logoBlobInModal set to file object:", logoBlobInModal);

        // Oppdater preview
        console.log("handleLogoUpload: Updating preview...");
        applyLogo(logoBlobInModal, logoPreview, true); // Bruk applyLogo for preview

        // Oppdater hovedvisning live
        console.log("handleLogoUpload: Updating main view...");
        applyLogo(logoBlobInModal, logoImg, false); // Bruk applyLogo for main

        console.log(`handleLogoUpload: Logo selected: ${file.name}. Ready to be saved.`);
    }

    function handleRemoveLogo() {
        if (confirm("Fjerne egendefinert logo og gå tilbake til standard (krever Lagre)?")) {
            console.log("handleRemoveLogo: Removing logo in modal...");
            logoBlobInModal = null; // Fjern blob fra modal-state
            customLogoInput.value = ''; // Reset file input

            // Oppdater preview
            console.log("handleRemoveLogo: Updating preview...");
            applyLogo(null, logoPreview, true);

            // Oppdater hovedvisning live
            console.log("handleRemoveLogo: Updating main view...");
            applyLogo(null, logoImg, false);

            console.log("handleRemoveLogo: Custom logo removed visually (pending save).");
        }
    }
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===


    // === 13: TOURNAMENT FINISH LOGIC START ===
    async function finishTournament() { /* ... (som før) ... */ }
    // === 13: TOURNAMENT FINISH LOGIC END ===


    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    // ... (som før) ...
    if(btnEditUiSettings) btnEditUiSettings.addEventListener('click', openUiModal); // async
    if(closeUiModalButton) closeUiModalButton.addEventListener('click', () => closeUiModal(true)); // async
    if(btnCancelUiEdit) btnCancelUiEdit.addEventListener('click', () => closeUiModal(true)); // async
    if(btnSaveUiSettings) btnSaveUiSettings.addEventListener('click', handleSaveUiSettings); // async
    if(btnResetLayoutTheme) btnResetLayoutTheme.addEventListener('click', handleResetLayoutTheme); // async
    // ... (resten som før) ...
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===


    // === 15: INITIAL UI RENDER & TIMER START ===
    console.log("Performing final setup steps...");
    // applyThemeLayoutAndLogo() ble kalt (og awaited) tidligere
    updateUI(); // Render resten av UI (synkront)
    startRealTimeClock(); // Start klokke (synkront)
    // Start hovedtimer hvis nødvendig (synkront)
    if (state.live.status === 'running') { console.log("State is 'running', starting timer."); timerInterval = setInterval(tick, 1000); }
    else if (state.live.status === 'finished') console.log("State is 'finished'.");
    else console.log(`State is '${state.live.status}'. Timer not started.`);
    console.log("Tournament page fully initialized and ready.");
    // === 15: INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
