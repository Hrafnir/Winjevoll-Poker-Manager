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
    let originalThemeBg = '', originalThemeText = '', originalElementLayouts = {}, originalSoundVolume = 0.7;
    let currentLogoBlob = null, logoBlobInModal = null, currentLogoObjectUrl = null, previewLogoObjectUrl = null;
    let blockSliderUpdates = false;
    let isDragging = false, draggedElement = null, offsetX = 0, offsetY = 0;
    let soundsEnabled = loadSoundPreference(); let currentVolume = loadSoundVolume(); const SOUND_URLS = { NEW_LEVEL: 'sounds/new_level.wav', PAUSE_START: 'sounds/pause_start.wav', PAUSE_END: 'sounds/pause_end.wav', BUBBLE: 'sounds/bubble_start.wav', KNOCKOUT: 'sounds/knockout.wav', FINAL_TABLE: 'sounds/final_table.wav', TOURNAMENT_END: 'sounds/tournament_end.wav', TEST: 'sounds/new_level.wav' };
    const PREDEFINED_THEMES = [ { name: "Elegant & Moderne", bg: "rgb(28, 28, 30)", text: "rgb(245, 245, 245)" }, { name: "Lys & Frisk", bg: "rgb(232, 245, 252)", text: "rgb(33, 53, 71)" }, { name: "Retro & Kreativ", bg: "rgb(255, 235, 148)", text: "rgb(43, 43, 43)" }, { name: "Dramatisk & Stilren", bg: "rgb(34, 0, 51)", text: "rgb(255, 255, 255)" }, { name: "Naturell & Harmonisk", bg: "rgb(223, 228, 212)", text: "rgb(61, 64, 54)" }, ];
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
    state.live = state.live || {}; state.live.status = state.live.status || 'paused'; // VIKTIG: Standard er 'paused'
    state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0; state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60 || 1200); state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.players = state.live.players || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.knockoutLog = state.live.knockoutLog || []; state.live.activityLog = state.live.activityLog || []; state.live.totalPot = state.live.totalPot ?? 0; state.live.totalEntries = state.live.totalEntries ?? 0; state.live.totalRebuys = state.live.totalRebuys ?? 0; state.live.totalAddons = state.live.totalAddons ?? 0;
    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, state);
    // === 04: INITIALIZATION & VALIDATION END ===

    // === 04b: THEME & LAYOUT APPLICATION START ===
    function revokeObjectUrl(url) { if (url && url.startsWith('blob:')) { try { URL.revokeObjectURL(url); } catch (e) { console.warn("Error revoking Object URL:", url, e); } } }

    function applyLogo(logoBlob, targetImgElement = logoImg, isPreview = false) {
        if (!targetImgElement) { console.warn("applyLogo called with no targetImgElement"); return; }
        const currentObjectUrl = isPreview ? previewLogoObjectUrl : currentLogoObjectUrl;
        revokeObjectUrl(currentObjectUrl); // Trekk tilbake forrige URL for dette elementet

        let newObjectUrl = null;
        if (logoBlob instanceof Blob && logoBlob.size > 0) { // Sjekk også size > 0
            try {
                newObjectUrl = URL.createObjectURL(logoBlob);
                targetImgElement.src = newObjectUrl;
                targetImgElement.alt = "Egendefinert Logo";
            } catch (e) { console.error("Error creating object URL:", e); targetImgElement.src = 'placeholder-logo.png'; targetImgElement.alt = "Feil ved lasting av logo"; }
        } else {
            targetImgElement.src = 'placeholder-logo.png';
            targetImgElement.alt = isPreview ? "Logo Forhåndsvisning" : "Winjevoll Pokerklubb Logo";
        }

        if (isPreview) { previewLogoObjectUrl = newObjectUrl; }
        else { currentLogoObjectUrl = newObjectUrl; currentLogoBlob = logoBlob; } // Oppdater global state KUN for hovedlogo
    }

    async function applyThemeLayoutAndLogo() {
        console.log("applyThemeLayoutAndLogo: Starting initial load...");
        const bgColor = loadThemeBgColor(); const textColor = loadThemeTextColor(); const elementLayouts = loadElementLayouts();
        let logoDataBlob = null;
        try { logoDataBlob = await loadLogoBlob(); } catch (err) { console.error("Error loading logo blob initially:", err); }
        console.log("applyThemeLayoutAndLogo: Fetched initial data. Logo Blob:", logoDataBlob);
        applyThemeAndLayout(bgColor, textColor, elementLayouts);
        applyLogo(logoDataBlob, logoImg, false);
        console.log("applyThemeLayoutAndLogo: Initial theme, layout, and logo applied.");
    }

    function applyThemeAndLayout(bgColor, textColor, elementLayouts) {
        console.log("Applying theme and layout:", bgColor, textColor, elementLayouts);
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--live-page-bg', bgColor); rootStyle.setProperty('--live-page-text', textColor);
        try { const [r, g, b] = parseRgbString(bgColor); const brightness = (r * 299 + g * 587 + b * 114) / 1000; const borderColor = brightness < 128 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'; rootStyle.setProperty('--live-ui-border', borderColor); } catch (e) { rootStyle.setProperty('--live-ui-border', 'rgba(128, 128, 128, 0.15)'); }
        const defaults = DEFAULT_ELEMENT_LAYOUTS;
        rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas?.height ?? defaults.canvas.height}vh`);
        draggableElements.forEach(element => {
            if (!element) return;
            const elementId = element.id.replace('-element', '');
            const layout = { ...defaults[elementId], ...(elementLayouts[elementId] || {}) };
            // console.log(`Layout for ${elementId}:`, layout); // DEBUG
            element.classList.toggle('element-hidden', !(layout.isVisible ?? true));
            if (layout.isVisible ?? true) {
                 element.style.left = `${layout.x}%`; element.style.top = `${layout.y}%`; element.style.width = `${layout.width}%`;
                 if (elementId === 'logo') {
                     element.style.height = `${layout.height}%`; element.style.fontSize = '1em';
                     // console.log(`Applying logo layout styles: H=${layout.height}% W=${layout.width}%`); // DEBUG
                 } else { element.style.fontSize = `${layout.fontSize}em`; element.style.height = 'auto'; }
            }
        });
        const infoLayout = { ...defaults.info, ...(elementLayouts.info || {}) };
        for (const key in infoParagraphs) { if (infoParagraphs[key]) infoParagraphs[key].classList.toggle('hidden', !(infoLayout[key] ?? true)); }
         console.log("Theme and layout styles applied.");
    }

    try { await applyThemeLayoutAndLogo(); }
    catch (err) { console.error("Error during initial theme/layout/logo application:", err); applyThemeAndLayout(DEFAULT_THEME_BG, DEFAULT_THEME_TEXT, DEFAULT_ELEMENT_LAYOUTS); applyLogo(null, logoImg, false); }
    // === 04b: THEME & LAYOUT APPLICATION END ===

    // === 04c: DRAG AND DROP LOGIC START ===
    function startDrag(event, element) { if (event.button !== 0 || isModalOpen) return; event.preventDefault(); draggedElement = element; isDragging = true; const rect = element.getBoundingClientRect(); offsetX = event.clientX - rect.left; offsetY = event.clientY - rect.top; element.classList.add('dragging'); document.addEventListener('mousemove', doDrag); document.addEventListener('mouseup', endDrag); document.addEventListener('mouseleave', endDrag); }
    function doDrag(event) { if (!isDragging || !draggedElement) return; event.preventDefault(); const canvasRect = liveCanvas.getBoundingClientRect(); const canvasWidth = canvasRect.width; const canvasHeight = canvasRect.height; let newXpx = event.clientX - canvasRect.left - offsetX; let newYpx = event.clientY - canvasRect.top - offsetY; let newXPercent = (newXpx / canvasWidth) * 100; let newYPercent = (newYpx / canvasHeight) * 100; const elementWidthPercent = (draggedElement.offsetWidth / canvasWidth) * 100; const elementHeightPercent = (draggedElement.offsetHeight / canvasHeight) * 100; newXPercent = Math.max(0, Math.min(newXPercent, 100 - elementWidthPercent)); newYPercent = Math.max(0, Math.min(newYPercent, 100 - elementHeightPercent)); draggedElement.style.left = `${newXPercent}%`; draggedElement.style.top = `${newYPercent}%`; }
    function endDrag(event) { if (!isDragging || !draggedElement) return; event.preventDefault(); const elementId = draggedElement.id.replace('-element', ''); console.log(`Drag ended for ${elementId}`); draggedElement.classList.remove('dragging'); document.removeEventListener('mousemove', doDrag); document.removeEventListener('mouseup', endDrag); document.removeEventListener('mouseleave', endDrag); const canvasRect = liveCanvas.getBoundingClientRect(); const finalLeftPx = draggedElement.offsetLeft; const finalTopPx = draggedElement.offsetTop; const finalXPercent = parseFloat(((finalLeftPx / canvasRect.width) * 100).toFixed(2)); const finalYPercent = parseFloat(((finalTopPx / canvasRect.height) * 100).toFixed(2)); let currentLayouts = loadElementLayouts(); if (currentLayouts[elementId]) { currentLayouts[elementId].x = finalXPercent; currentLayouts[elementId].y = finalYPercent; saveElementLayouts(currentLayouts); console.log(`Saved new pos for ${elementId}: x=${finalXPercent}%, y=${finalYPercent}%`); if (isModalOpen && currentOpenModal === uiSettingsModal) { originalElementLayouts[elementId].x = finalXPercent; originalElementLayouts[elementId].y = finalYPercent; } } else console.error(`Could not find layout key '${elementId}'`); isDragging = false; draggedElement = null; }
    // === 04c: DRAG AND DROP LOGIC END ===

    // === 05 - 07c: HELPER FUNCTIONS, CALCS, TABLE MGMT, LOGGING, SOUND ===
    // ... (Ingen endringer her, kopier inn som før) ...
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
    // === 07c: HELPER FUNCTIONS - SOUND END ===

    // === 08: UI UPDATE FUNCTIONS START ===
    function renderPlayerList() { /* ... (som før) ... */ }
    function displayPrizes() { /* ... (som før) ... */ }
    function updateUI() {
        console.log("updateUI: Updating main UI elements..."); // DEBUG
        if (!state?.config || !state.live) { console.error("State missing in updateUI"); if(nameDisplay) nameDisplay.textContent = "Error!"; return; }
        if (nameDisplay) nameDisplay.textContent = state.config.name;
        if (currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const i = state.live.currentLevelIndex;
        const cl = state.config.blindLevels?.[i];
        const nl = state.config.blindLevels?.[i + 1];
        const np = findNextPauseInfo();
        if (state.live.isOnBreak) { /* ... */ } else { /* ... */ }
        if (nextBlindsDisplay) nextBlindsDisplay.textContent = formatNextBlindsText(nl);
        if (averageStackDisplay) averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO');
        if (playersRemainingDisplay) playersRemainingDisplay.textContent = state.live.players.length;
        if (totalEntriesDisplay) totalEntriesDisplay.textContent = state.live.totalEntries;
        const lvlLR = i + 1; const lrOpen = lvlLR <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished';
        if (lateRegStatusDisplay) { /* ... */ }
        if (infoNextPauseParagraph) { /* ... */ }
        const isFin = state.live.status === 'finished';
        if (startPauseButton) { startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke'; startPauseButton.disabled = isFin; }
        if (prevLevelButton) prevLevelButton.disabled = i <= 0 || isFin;
        if (nextLevelButton) nextLevelButton.disabled = i >= state.config.blindLevels.length - 1 || isFin;
        if (adjustTimeMinusButton) adjustTimeMinusButton.disabled = isFin;
        if (adjustTimePlusButton) adjustTimePlusButton.disabled = isFin;
        if (lateRegButton) lateRegButton.disabled = !lrOpen || isFin;
        if (btnEditTournamentSettings) btnEditTournamentSettings.disabled = isFin;
        if (endTournamentButton) endTournamentButton.disabled = isFin;
        updateSoundToggleVisuals();
        renderPlayerList();
        displayPrizes();
        renderActivityLog();
        console.log("updateUI: Main UI elements updated."); // DEBUG
    }
    // === 08: UI UPDATE FUNCTIONS END ===

    // === 09: TIMER LOGIC START ===
    function tick() { /* ... (som før) ... */ }
    function startRealTimeClock() { /* ... (som før) ... */ }
    // === 09: TIMER LOGIC END ===

    // === 10: EVENT HANDLERS - CONTROLS START ===
    // DEBUG lagt til
    function handleStartPause() {
        console.log("handleStartPause called. Current status:", state.live.status); // DEBUG
        if (state.live.status === 'finished') { console.log("handleStartPause: Tournament finished, doing nothing."); return; }
        if (state.live.status === 'paused') {
            state.live.status = 'running';
            if (!timerInterval) {
                timerInterval = setInterval(tick, 1000);
                console.log("handleStartPause: Timer interval started.");
            }
            logActivity(state.live.activityLog, "Klokke startet.");
        } else if (state.live.status === 'running') { // ENDRET: La til 'running' sjekk
            state.live.status = 'paused';
            if (timerInterval) { // Rydd opp intervallet når vi pauser
                clearInterval(timerInterval);
                timerInterval = null;
                console.log("handleStartPause: Timer interval cleared.");
            }
            logActivity(state.live.activityLog, "Klokke pauset.");
            saveTournamentState(currentTournamentId, state);
        } else {
             console.warn("handleStartPause called with unexpected status:", state.live.status);
        }
        updateUI();
    }
    function handleAdjustTime(deltaSeconds) { console.log("handleAdjustTime called."); /* ... (som før) ... */ }
    function handleAdjustLevel(deltaIndex) { console.log("handleAdjustLevel called."); /* ... (som før) ... */ }
    function handleEndTournament() { console.log("handleEndTournament called."); /* ... (som før) ... */ }
    function handleForceSave() { console.log("handleForceSave called."); /* ... (som før) ... */ }
    function handleBackToMain() { console.log("handleBackToMain called."); /* ... (som før) ... */ }
    // === 10: EVENT HANDLERS - CONTROLS END ===

    // === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    // ... (Ingen endringer her, kopier inn som før) ...
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
    async function openUiModal() { /* ... (som før) ... */ }
    async function closeUiModal(revert = false) { /* ... (som før, med logging) ... */ }
    function addEditBlindLevelRow(levelData={}){ /* ... (som før) ... */ }
    function updateEditLevelNumbers(){ /* ... (som før) ... */ }
    function generateEditPayout(){ /* ... (som før) ... */ }
    function syncRgbFromHsl(prefix){ /* ... (som før) ... */ }
    function syncHslFromRgb(prefix){ /* ... (som før) ... */ }
    function updateColorAndLayoutPreviews() { /* ... (som før, med logging) ... */ }
    // Funksjon for å håndtere endringer i modalen
    function handleThemeLayoutControlChange(e) {
        console.log("handleThemeLayoutControlChange triggered by:", e.target.id); // DEBUG
        if (!isModalOpen || currentOpenModal !== uiSettingsModal) return;
        const target = e.target; const id = target.id; const isSlider = id.includes('Slider'); const isInput = id.includes('Input');

        if (target === volumeSlider || target === volumeInput) { /* ... (som før) ... */ }
        else if (target === toggleLogoElement) { // DEBUG: Sjekk spesifikt logo toggle
             console.log("Logo visibility toggle changed:", target.checked);
        }
        else if (isSlider || isInput) { /* ... (synkronisering som før) ... */ }
        updateColorAndLayoutPreviews(); // Kall oppdatering til slutt
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
    async function handleSaveUiSettings(){ /* ... (som før, med logging) ... */ }
    async function handleResetLayoutTheme() { /* ... (som før, med logging) ... */ }
    function handleLogoUpload(event) { /* ... (som før, med logging) ... */ }
    function handleRemoveLogo() { /* ... (som før, med logging) ... */ }
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===

    // === 13: TOURNAMENT FINISH LOGIC START ===
    async function finishTournament() { /* ... (som før) ... */ }
    // === 13: TOURNAMENT FINISH LOGIC END ===

    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    // DEBUG: Legg til sjekk for å se om elementene finnes før listener legges til
    function addClickListener(element, handler) {
        if (element) {
             element.addEventListener('click', handler);
             console.log(`Listener added for: ${element.id || element.tagName}`); // DEBUG
        } else {
            console.warn(`Element not found for listener: ${handler.name}`); // DEBUG
        }
    }

    // Bruk hjelpefunksjonen
    addClickListener(startPauseButton, handleStartPause);
    addClickListener(prevLevelButton, () => handleAdjustLevel(-1));
    addClickListener(nextLevelButton, () => handleAdjustLevel(1));
    addClickListener(adjustTimeMinusButton, () => handleAdjustTime(-60));
    addClickListener(adjustTimePlusButton, () => handleAdjustTime(60));
    addClickListener(lateRegButton, handleLateRegClick);
    addClickListener(endTournamentButton, handleEndTournament);
    addClickListener(btnForceSave, handleForceSave);
    addClickListener(btnBackToMainLive, handleBackToMain);
    addClickListener(btnToggleSound, () => {
         console.log("btnToggleSound clicked."); // DEBUG
        soundsEnabled = !soundsEnabled;
        saveSoundPreference(soundsEnabled);
        updateSoundToggleVisuals();
        logActivity(state.live.activityLog, `Lyd ${soundsEnabled ? 'PÅ' : 'AV'}.`);
    });
    addClickListener(btnEditTournamentSettings, openTournamentModal);
    addClickListener(btnEditUiSettings, openUiModal); // async
    addClickListener(closeTournamentModalButton, closeTournamentModal);
    addClickListener(btnCancelTournamentEdit, closeTournamentModal);
    addClickListener(btnAddEditLevel, () => addEditBlindLevelRow());
    addClickListener(btnGenerateEditPayout, generateEditPayout);
    addClickListener(btnSaveTournamentSettings, handleSaveTournamentSettings);
    addClickListener(closeUiModalButton, () => closeUiModal(true)); // async
    addClickListener(btnCancelUiEdit, () => closeUiModal(true)); // async
    addClickListener(btnSaveUiSettings, handleSaveUiSettings); // async
    addClickListener(btnResetLayoutTheme, handleResetLayoutTheme); // async

    // Mousedown for drag beholder vi som før
    draggableElements.forEach(el => { if (el) { el.addEventListener('mousedown', (e) => startDrag(e, el)); } });

    // Klikk utenfor modal for å lukke
    window.addEventListener('click', (e) => {
        if (isModalOpen && currentOpenModal && e.target === currentOpenModal) {
             console.log("Clicked outside modal content."); // DEBUG
            if (currentOpenModal === uiSettingsModal) { closeUiModal(true); } // Revert UI changes
            else if (currentOpenModal === tournamentSettingsModal) { closeTournamentModal(); } // Just close T settings
        }
    });
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===

    // === 15: INITIAL UI RENDER & TIMER START ===
    console.log("Performing final setup steps...");
    try {
        updateUI(); // Initial render av UI basert på state
        startRealTimeClock();
        if (state.live.status === 'running') {
            console.log("State is 'running', starting timer.");
            if (timerInterval) clearInterval(timerInterval); // Clear old interval just in case
            timerInterval = setInterval(tick, 1000);
        } else if (state.live.status === 'finished') {
            console.log("State is 'finished'.");
        } else { // Inkluderer 'paused'
            console.log(`State is '${state.live.status}'. Timer not started.`);
             if (timerInterval) clearInterval(timerInterval); // Sørg for at timer er stoppet hvis paused
             timerInterval = null;
        }
        console.log("Tournament page fully initialized and ready.");
    } catch (err) {
        console.error("Error during final setup or UI update:", err);
        alert("En feil oppstod under lasting av siden. Sjekk konsollen.");
    }
    // === 15: INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
