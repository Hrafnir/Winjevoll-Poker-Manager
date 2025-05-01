// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Tournament page DOM loaded.");
    // === 02: STATE VARIABLES START ===
    let currentTournamentId = getActiveTournamentId();
    let state = null; let timerInterval = null; let realTimeInterval = null; let isModalOpen = false; let currentOpenModal = null;
    let originalThemeBg = '', originalThemeText = '', originalElementLayouts = {}, originalSoundVolume = 0.7;
    let currentLogoBlob = null, logoBlobInModal = null, currentLogoObjectUrl = null, previewLogoObjectUrl = null;
    let blockSliderUpdates = false; let isDragging = false, draggedElement = null, offsetX = 0, offsetY = 0;
    let soundsEnabled = loadSoundPreference(); let currentVolume = loadSoundVolume(); const SOUND_URLS = { NEW_LEVEL: 'sounds/new_level.wav', PAUSE_START: 'sounds/pause_start.wav', PAUSE_END: 'sounds/pause_end.wav', BUBBLE: 'sounds/bubble_start.wav', KNOCKOUT: 'sounds/knockout.wav', FINAL_TABLE: 'sounds/final_table.wav', TOURNAMENT_END: 'sounds/tournament_end.wav', TEST: 'sounds/new_level.wav' };
    const PREDEFINED_THEMES = [ { name: "Elegant & Moderne", bg: "rgb(28, 28, 30)", text: "rgb(245, 245, 245)" }, { name: "Lys & Frisk", bg: "rgb(232, 245, 252)", text: "rgb(33, 53, 71)" }, { name: "Retro & Kreativ", bg: "rgb(255, 235, 148)", text: "rgb(43, 43, 43)" }, { name: "Dramatisk & Stilren", bg: "rgb(34, 0, 51)", text: "rgb(255, 255, 255)" }, { name: "Naturell & Harmonisk", bg: "rgb(223, 228, 212)", text: "rgb(61, 64, 54)" }, ];
    let editBlindLevelCounter = 0; const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    // === 02: STATE VARIABLES END ===

    // === 03: DOM REFERENCES START ===
    const currentTimeDisplay = document.getElementById('current-time'); const btnToggleSound = document.getElementById('btn-toggle-sound'); const btnEditTournamentSettings = document.getElementById('btn-edit-tournament-settings'); const btnEditUiSettings = document.getElementById('btn-edit-ui-settings'); const btnBackToMainLive = document.getElementById('btn-back-to-main-live'); const prizeDisplayLive = document.getElementById('prize-display-live'); const totalPotPrizeSpan = document.getElementById('total-pot'); const startPauseButton = document.getElementById('btn-start-pause'); const prevLevelButton = document.getElementById('btn-prev-level'); const nextLevelButton = document.getElementById('btn-next-level'); const adjustTimeMinusButton = document.getElementById('btn-adjust-time-minus'); const adjustTimePlusButton = document.getElementById('btn-adjust-time-plus'); const lateRegButton = document.getElementById('btn-late-reg'); const playerListUl = document.getElementById('player-list'); const eliminatedPlayerListUl = document.getElementById('eliminated-player-list'); const activePlayerCountSpan = document.getElementById('active-player-count'); const eliminatedPlayerCountSpan = document.getElementById('eliminated-player-count'); const tableBalanceInfo = document.getElementById('table-balance-info'); const btnForceSave = document.getElementById('btn-force-save'); const endTournamentButton = document.getElementById('btn-end-tournament'); const activityLogUl = document.getElementById('activity-log-list'); const headerRightControls = document.querySelector('.header-right-controls'); const liveCanvas = document.getElementById('live-canvas'); const titleElement = document.getElementById('title-element'); const timerElement = document.getElementById('timer-element'); const blindsElement = document.getElementById('blinds-element'); const logoElement = document.getElementById('logo-element'); const infoElement = document.getElementById('info-element'); const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement]; const nameDisplay = document.getElementById('tournament-name-display'); const timerDisplay = document.getElementById('timer-display'); const breakInfo = document.getElementById('break-info'); const currentLevelDisplay = document.getElementById('current-level'); const blindsDisplay = document.getElementById('blinds-display'); const logoImg = logoElement?.querySelector('.logo'); const nextBlindsDisplay = document.getElementById('next-blinds'); const infoNextPauseParagraph = document.getElementById('info-next-pause'); const averageStackDisplay = document.getElementById('average-stack'); const playersRemainingDisplay = document.getElementById('players-remaining'); const totalEntriesDisplay = document.getElementById('total-entries'); const lateRegStatusDisplay = document.getElementById('late-reg-status'); const tournamentSettingsModal = document.getElementById('tournament-settings-modal'); const closeTournamentModalButton = document.getElementById('close-tournament-modal-button'); const editBlindStructureBody = document.getElementById('edit-blind-structure-body'); const btnAddEditLevel = document.getElementById('btn-add-edit-level'); const editPaidPlacesInput = document.getElementById('edit-paid-places'); const editPrizeDistTextarea = document.getElementById('edit-prize-distribution'); const btnGenerateEditPayout = document.getElementById('btn-generate-edit-payout'); const btnSaveTournamentSettings = document.getElementById('btn-save-tournament-settings'); const btnCancelTournamentEdit = document.getElementById('btn-cancel-tournament-edit'); const uiSettingsModal = document.getElementById('ui-settings-modal'); const closeUiModalButton = document.getElementById('close-ui-modal-button'); const canvasHeightSlider = document.getElementById('canvasHeightSlider'); const canvasHeightInput = document.getElementById('canvasHeightInput'); const toggleTitleElement = document.getElementById('toggleTitleElement'); const toggleTimerElement = document.getElementById('toggleTimerElement'); const toggleBlindsElement = document.getElementById('toggleBlindsElement'); const toggleLogoElement = document.getElementById('toggleLogoElement'); const toggleInfoElement = document.getElementById('toggleInfoElement'); const visibilityToggles = [toggleTitleElement, toggleTimerElement, toggleBlindsElement, toggleLogoElement, toggleInfoElement]; const titleWidthSlider = document.getElementById('titleWidthSlider'); const titleWidthInput = document.getElementById('titleWidthInput'); const titleFontSizeSlider = document.getElementById('titleFontSizeSlider'); const titleFontSizeInput = document.getElementById('titleFontSizeInput'); const timerWidthSlider = document.getElementById('timerWidthSlider'); const timerWidthInput = document.getElementById('timerWidthInput'); const timerFontSizeSlider = document.getElementById('timerFontSizeSlider'); const timerFontSizeInput = document.getElementById('timerFontSizeInput'); const blindsWidthSlider = document.getElementById('blindsWidthSlider'); const blindsWidthInput = document.getElementById('blindsWidthInput'); const blindsFontSizeSlider = document.getElementById('blindsFontSizeSlider'); const blindsFontSizeInput = document.getElementById('blindsFontSizeInput'); const logoWidthSlider = document.getElementById('logoWidthSlider'); const logoWidthInput = document.getElementById('logoWidthInput'); const logoHeightSlider = document.getElementById('logoHeightSlider'); const logoHeightInput = document.getElementById('logoHeightInput'); const infoWidthSlider = document.getElementById('infoWidthSlider'); const infoWidthInput = document.getElementById('infoWidthInput'); const infoFontSizeSlider = document.getElementById('infoFontSizeSlider'); const infoFontSizeInput = document.getElementById('infoFontSizeInput'); const toggleInfoNextBlinds = document.getElementById('toggleInfoNextBlinds'); const toggleInfoNextPause = document.getElementById('toggleInfoNextPause'); const toggleInfoAvgStack = document.getElementById('toggleInfoAvgStack'); const toggleInfoPlayers = document.getElementById('toggleInfoPlayers'); const toggleInfoLateReg = document.getElementById('toggleInfoLateReg'); const infoParagraphs = { showNextBlinds: document.getElementById('info-next-blinds'), showNextPause: infoNextPauseParagraph, showAvgStack: document.getElementById('info-avg-stack'), showPlayers: document.getElementById('info-players'), showLateReg: document.getElementById('info-late-reg') }; const customLogoInput = document.getElementById('customLogoInput'); const logoPreview = document.getElementById('logoPreview'); const btnRemoveCustomLogo = document.getElementById('btnRemoveCustomLogo'); const bgRedSlider = document.getElementById('bgRedSlider'); const bgGreenSlider = document.getElementById('bgGreenSlider'); const bgBlueSlider = document.getElementById('bgBlueSlider'); const bgRedInput = document.getElementById('bgRedInput'); const bgGreenInput = document.getElementById('bgGreenInput'); const bgBlueInput = document.getElementById('bgBlueInput'); const bgColorPreview = document.getElementById('bg-color-preview'); const textRedSlider = document.getElementById('textRedSlider'); const textGreenSlider = document.getElementById('textGreenSlider'); const textBlueSlider = document.getElementById('textBlueSlider'); const textRedInput = document.getElementById('textRedInput'); const textGreenInput = document.getElementById('textGreenInput'); const textBlueInput = document.getElementById('textBlueInput'); const textColorPreview = document.getElementById('text-color-preview'); const bgHueSlider = document.getElementById('bgHueSlider'); const bgHueInput = document.getElementById('bgHueInput'); const bgSatSlider = document.getElementById('bgSatSlider'); const bgSatInput = document.getElementById('bgSatInput'); const bgLigSlider = document.getElementById('bgLigSlider'); const bgLigInput = document.getElementById('bgLigInput'); const textHueSlider = document.getElementById('textHueSlider'); const textHueInput = document.getElementById('textHueInput'); const textSatSlider = document.getElementById('textSatSlider'); const textSatInput = document.getElementById('textSatInput'); const textLigSlider = document.getElementById('textLigSlider'); const textLigInput = document.getElementById('textLigInput'); const predefinedThemeSelect = document.getElementById('predefinedThemeSelect'); const btnLoadPredefinedTheme = document.getElementById('btnLoadPredefinedTheme'); const themeFavoritesSelect = document.getElementById('themeFavoritesSelect'); const btnLoadThemeFavorite = document.getElementById('btnLoadThemeFavorite'); const newThemeFavoriteNameInput = document.getElementById('newThemeFavoriteName'); const btnSaveThemeFavorite = document.getElementById('btnSaveThemeFavorite'); const btnDeleteThemeFavorite = document.getElementById('btnDeleteThemeFavorite'); const volumeSlider = document.getElementById('volumeSlider'); const volumeInput = document.getElementById('volumeInput'); const btnTestSound = document.getElementById('btn-test-sound'); const btnSaveUiSettings = document.getElementById('btn-save-ui-settings'); const btnCancelUiEdit = document.getElementById('btn-cancel-ui-edit'); const btnResetLayoutTheme = document.getElementById('btnResetLayoutTheme');
    const btnManageAddons = document.getElementById('btn-manage-addons'); const addonModal = document.getElementById('addon-modal'); const closeAddonModalButton = document.getElementById('close-addon-modal-button'); const addonPlayerListUl = document.getElementById('addon-player-list'); const btnConfirmAddons = document.getElementById('btn-confirm-addons'); const btnCancelAddons = document.getElementById('btn-cancel-addons');
    const editPlayerModal = document.getElementById('edit-player-modal'); const closeEditPlayerModalButton = document.getElementById('close-edit-player-modal-button'); const editPlayerIdInput = document.getElementById('edit-player-id-input'); const editPlayerNameDisplay = document.getElementById('edit-player-name-display'); const editPlayerNameInput = document.getElementById('edit-player-name-input'); const editPlayerRebuysInput = document.getElementById('edit-player-rebuys-input'); const editPlayerAddonCheckbox = document.getElementById('edit-player-addon-checkbox'); const btnSavePlayerChanges = document.getElementById('btn-save-player-changes'); const btnCancelPlayerEdit = document.getElementById('btn-cancel-player-edit');
    const sizeSliders = [canvasHeightSlider, titleWidthSlider, titleFontSizeSlider, timerWidthSlider, timerFontSizeSlider, blindsWidthSlider, blindsFontSizeSlider, logoWidthSlider, logoHeightSlider, infoWidthSlider, infoFontSizeSlider]; const sizeInputs = [canvasHeightInput, titleWidthInput, titleFontSizeInput, timerWidthInput, timerFontSizeInput, blindsWidthInput, blindsFontSizeInput, logoWidthInput, logoHeightInput, infoWidthInput, infoFontSizeInput]; const colorSliders = [bgHueSlider, bgSatSlider, bgLigSlider, bgRedSlider, bgGreenSlider, bgBlueSlider, textHueSlider, textSatSlider, textLigSlider, textRedSlider, textGreenSlider, textBlueSlider]; const colorInputs = [bgHueInput, bgSatInput, bgLigInput, bgRedInput, bgGreenInput, bgBlueInput, textHueInput, textSatInput, textLigInput, textRedInput, textGreenInput, textBlueInput]; const internalInfoToggles = [toggleInfoNextBlinds, toggleInfoNextPause, toggleInfoAvgStack, toggleInfoPlayers, toggleInfoLateReg];
    // === 03: DOM REFERENCES END ===

    // === 04: INITIALIZATION & VALIDATION START ===
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig turneringsdata (ID: ${currentTournamentId}).`); console.error("Invalid tournament state loaded:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    state.live = state.live || {}; state.live.status = state.live.status || 'paused'; state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0; state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60 || 1200); state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.players = state.live.players || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.knockoutLog = state.live.knockoutLog || []; state.live.activityLog = state.live.activityLog || []; state.live.totalPot = state.live.totalPot ?? 0; state.live.totalEntries = state.live.totalEntries ?? 0; state.live.totalRebuys = state.live.totalRebuys ?? 0; state.live.totalAddons = state.live.totalAddons ?? 0;
    state.live.nextPlayerId = state.live.nextPlayerId || (Math.max(0, ...state.live.players.map(p => p.id), ...state.live.eliminatedPlayers.map(p => p.id)) + 1); // Sikre at nextPlayerId er satt
    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, state);
    // === 04: INITIALIZATION & VALIDATION END ===

    // === 04b: THEME & LAYOUT APPLICATION START ===
    function revokeObjectUrl(url) { if (url && url.startsWith('blob:')) { try { URL.revokeObjectURL(url); } catch (e) { console.warn("Error revoking Object URL:", url, e); } } }
    function updateImageSrc(logoBlob, targetImgElement, isPreview = false) { if (!targetImgElement) { console.warn("updateImageSrc called with no targetImgElement"); return; } const currentObjectUrlRef = isPreview ? previewLogoObjectUrl : currentLogoObjectUrl; revokeObjectUrl(currentObjectUrlRef); let newObjectUrl = null; if (logoBlob instanceof Blob && logoBlob.size > 0) { try { newObjectUrl = URL.createObjectURL(logoBlob); targetImgElement.src = newObjectUrl; targetImgElement.alt = "Egendefinert Logo"; } catch (e) { console.error("Error creating object URL:", e); targetImgElement.src = 'placeholder-logo.png'; targetImgElement.alt = "Feil ved lasting"; } } else { targetImgElement.src = 'placeholder-logo.png'; targetImgElement.alt = isPreview ? "Logo Forhåndsvisning" : "Winjevoll Pokerklubb Logo"; } if (isPreview) { previewLogoObjectUrl = newObjectUrl; } else { currentLogoObjectUrl = newObjectUrl; } }
    function setGlobalLogoState(logoBlob) { currentLogoBlob = logoBlob; updateImageSrc(logoBlob, logoImg, false); }
    async function applyThemeLayoutAndLogo() { console.log("applyThemeLayoutAndLogo: Starting initial load..."); const bgColor = loadThemeBgColor(); const textColor = loadThemeTextColor(); const elementLayouts = loadElementLayouts(); let logoDataBlob = null; try { logoDataBlob = await loadLogoBlob(); } catch (err) { console.error("Error loading logo blob initially:", err); } console.log("applyThemeLayoutAndLogo: Fetched initial data. Logo Blob:", logoDataBlob); applyThemeAndLayout(bgColor, textColor, elementLayouts); setGlobalLogoState(logoDataBlob); console.log("applyThemeLayoutAndLogo: Initial theme, layout, and logo applied."); }
    function applyThemeAndLayout(bgColor, textColor, elementLayouts) { console.log("Applying theme and layout:", bgColor, textColor, elementLayouts); const rootStyle = document.documentElement.style; rootStyle.setProperty('--live-page-bg', bgColor); rootStyle.setProperty('--live-page-text', textColor); try { const [r, g, b] = parseRgbString(bgColor); const brightness = (r * 299 + g * 587 + b * 114) / 1000; const borderColor = brightness < 128 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'; rootStyle.setProperty('--live-ui-border', borderColor); } catch (e) { rootStyle.setProperty('--live-ui-border', 'rgba(128, 128, 128, 0.15)'); } const defaults = DEFAULT_ELEMENT_LAYOUTS; rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas?.height ?? defaults.canvas.height}vh`); draggableElements.forEach(element => { if (!element) return; const elementId = element.id.replace('-element', ''); const layout = { ...defaults[elementId], ...(elementLayouts[elementId] || {}) }; element.classList.toggle('element-hidden', !(layout.isVisible ?? true)); if (layout.isVisible ?? true) { element.style.left = `${layout.x}%`; element.style.top = `${layout.y}%`; element.style.width = `${layout.width}%`; if (elementId === 'logo') { element.style.height = `${layout.height}%`; element.style.fontSize = '1em'; } else { element.style.fontSize = `${layout.fontSize}em`; element.style.height = 'auto'; } } }); const infoLayout = { ...defaults.info, ...(elementLayouts.info || {}) }; for (const key in infoParagraphs) { if (infoParagraphs[key]) infoParagraphs[key].classList.toggle('hidden', !(infoLayout[key] ?? true)); } console.log("Theme and layout styles applied."); }
    try { await applyThemeLayoutAndLogo(); } catch (err) { console.error("Error during initial theme/layout/logo application:", err); applyThemeAndLayout(DEFAULT_THEME_BG, DEFAULT_THEME_TEXT, DEFAULT_ELEMENT_LAYOUTS); setGlobalLogoState(null); }
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
    function getPlayerNameById(playerId) { // ENDRET: Sikrer at ID er et tall for sammenligning
        const targetId = Number(playerId);
        const player = state.live.players.find(p => p.id === targetId) || state.live.eliminatedPlayers.find(p => p.id === targetId);
        return player ? player.name : 'Ukjent';
    }
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
    function checkAndHandleTableBreak() { if (state.live.status === 'finished') return false; const pCount = state.live.players.length; const maxPPT = state.config.playersPerTable; const tablesSet = new Set(state.live.players.map(p => p.table).filter(t => t > 0)); const tableCount = tablesSet.size; const targetTCount = Math.ceil(pCount / maxPPT); const finalTSize = maxPPT; console.log(`Table check: Players=${pCount}, Tables=${tableCount}, Target=${targetTCount}`); let action = false; if (tableCount > 1 && pCount <= finalTSize) { const finalTNum = 1; logActivity(state.live.activityLog, `Finalebord (${pCount})! Flytter til B${finalTNum}...`); alert(`Finalebord (${pCount})! Flytter til B${finalTNum}.`); playSound('FINAL_TABLE'); state.live.players.forEach(p => p.table = finalTNum); reassignAllSeats(finalTNum); action = true; } else if (tableCount > targetTCount && tableCount > 1) { const tables = {}; state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; }); const sortedTs = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).sort((a, b) => a.count - b.count); if (sortedTs.length > 0) { const breakTNum = sortedTs[0].tableNum; const msg = `Slår sammen! Flytter fra B${breakTNum}.`; logActivity(state.live.activityLog, msg); alert(msg); const toMove = state.live.players.filter(p => p.table === breakTNum); toMove.forEach(p => { const oT = p.table; const oS = p.seat; p.table = 0; p.seat = 0; assignTableSeat(p, breakTNum); logActivity(state.live.activityLog, ` -> ${p.name} (B${oT}S${oS}) til B${p.table}S${p.seat}.`); }); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); action = true; } } const balanced = balanceTables(); if (action && !balanced) { updateUI(); saveTournamentState(currentTournamentId, state); } else if (!action && !balanced) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); } return action || balanced; }
    function balanceTables() { if (state.live.status === 'finished' || state.live.players.length <= state.config.playersPerTable) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); return false; } let balanced = false; const maxDiff = 1; while (true) { const tables = {}; state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; }); const tableCounts = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).filter(tc => tc.count > 0); if (tableCounts.length < 2) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; } tableCounts.sort((a, b) => a.count - b.count); const minT = tableCounts[0]; const maxT = tableCounts[tableCounts.length - 1]; if (maxT.count - minT.count <= maxDiff) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; } balanced = true; if (tableBalanceInfo) tableBalanceInfo.classList.remove('hidden'); console.log(`Balancing: MaxT${maxT.tableNum}(${maxT.count}), MinT${minT.tableNum}(${minT.count})`); const maxPlayers = state.live.players.filter(p => p.table === maxT.tableNum); if (maxPlayers.length === 0) { console.error(`Balance Err: No players on maxT ${maxT.tableNum}`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; } const pMove = maxPlayers[Math.floor(Math.random() * maxPlayers.length)]; const minSeats = state.live.players.filter(p => p.table === minT.tableNum).map(p => p.seat); let newS = 1; while(minSeats.includes(newS)) { newS++; } if(newS > state.config.playersPerTable) { console.error(`Balance Err: No seat on minT ${minT.tableNum}.`); alert(`Feil: Fant ikke sete på B${minT.tableNum}.`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; } const oldT = pMove.table; const oldS = pMove.seat; const msg = `Balansering: ${pMove.name} fra B${oldT}S${oldS} til B${minT.tableNum}S${newS}.`; pMove.table = minT.tableNum; pMove.seat = newS; logActivity(state.live.activityLog, msg); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); updateUI(); saveTournamentState(currentTournamentId, state); } if (balanced) console.log("Balancing done."); return balanced; }
    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT END ===

    // === 07b: HELPER FUNCTIONS - LOGGING START ===
    function logActivity(logArray, message) { if (!logArray) logArray = state.live.activityLog = []; const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); logArray.unshift({ timestamp, message }); const MAX_LOG_ENTRIES = 100; if (logArray.length > MAX_LOG_ENTRIES) logArray.pop(); console.log(`[Log ${timestamp}] ${message}`); }
    function renderActivityLog() { if (!activityLogUl) return; activityLogUl.innerHTML = ''; const logEntries = state?.live?.activityLog || []; if (logEntries.length === 0) { activityLogUl.innerHTML = '<li>Loggen er tom.</li>'; return; } logEntries.forEach(entry => { const li = document.createElement('li'); li.innerHTML = `<span class="log-time">[${entry.timestamp}]</span> ${entry.message}`; activityLogUl.appendChild(li); }); }
    // === 07b: HELPER FUNCTIONS - LOGGING END ===

    // === 07c: HELPER FUNCTIONS - SOUND START ===
    function playSound(soundKey) { if (!soundsEnabled) return; const soundUrl = SOUND_URLS[soundKey]; if (!soundUrl) { console.warn(`Sound not found: ${soundKey}`); return; } try { const audio = new Audio(soundUrl); audio.volume = currentVolume; audio.play().catch(e => console.error(`Play fail ${soundUrl}:`, e)); console.log(`Playing: ${soundKey} at volume ${currentVolume}`); } catch (e) { console.error(`Audio obj fail ${soundUrl}:`, e); } }
    function updateSoundToggleVisuals() { if (btnToggleSound) btnToggleSound.textContent = soundsEnabled ? '🔊 Lyd På' : '🔇 Lyd Av'; }
    // === 07c: HELPER FUNCTIONS - SOUND END ===

    // === 08: UI UPDATE FUNCTIONS START ===
    function renderPlayerList() {
        if (!playerListUl || !eliminatedPlayerListUl || !activePlayerCountSpan || !eliminatedPlayerCountSpan) { console.error("Player list elements missing!"); return; }
        playerListUl.innerHTML = ''; eliminatedPlayerListUl.innerHTML = '';
        const currentLevelIndex = state.live.currentLevelIndex; // Bruk 0-basert index for logikk
        const isRebuyPeriod = state.config.type === 'rebuy' && (currentLevelIndex < state.config.rebuyLevels); // Rebuy til og med nivå N (index N-1)
        // ENDRET: Korrekt logikk for når Add-on knappen/modalen skal være aktiv
        const isAddonAvailable = state.config.type === 'rebuy' &&
                                 !state.live.status !== 'finished' &&
                                 ( (currentLevelIndex >= state.config.rebuyLevels) || // Fra og med nivået *etter* siste rebuy-nivå
                                   (currentLevelIndex === state.config.rebuyLevels - 1 && state.live.isOnBreak) ); // Eller i pausen *etter* siste rebuy-nivå

        const actionsOk = state.live.status !== 'finished';

        const activeSorted = [...state.live.players].sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
        activeSorted.forEach(p => {
            const li = document.createElement('li');
            let info = `${p.name} <span class="player-details">(B${p.table}S${p.seat})</span>`;
            if (p.rebuys > 0) info += ` <span class="player-details">[${p.rebuys}R]</span>`;
            if (p.addon) info += ` <span class="player-details">[A]</span>`;
            if (state.config.type === 'knockout' && p.knockouts > 0) info += ` <span class="player-details">(KOs: ${p.knockouts})</span>`;
            let acts = '';
            if (actionsOk) {
                 acts += `<button class="btn-edit-player small-button" data-player-id="${p.id}" title="Rediger Spiller">✏️</button>`;
                 if (isRebuyPeriod) acts += `<button class="btn-rebuy small-button" data-player-id="${p.id}" title="Rebuy">R</button>`;
                 if(state.config.type === 'rebuy' && !p.addon) {
                     // Deaktiver individuell knapp hvis add-on perioden er aktiv (bruk modal)
                     const addonButtonDisabled = isAddonAvailable;
                     const addonButtonTitle = isAddonAvailable ? "Bruk 'Administrer Add-ons'" : "Add-on (ikke aktiv)";
                     acts += `<button class="btn-addon small-button" data-player-id="${p.id}" title="${addonButtonTitle}" ${addonButtonDisabled ? 'disabled style="opacity: 0.3;"' : ''}>A</button>`;
                 }
                 acts += `<button class="btn-eliminate small-button danger-button" data-player-id="${p.id}" title="Eliminer">X</button>`;
            }
            li.innerHTML = `<span class="item-name">${info}</span><div class="list-actions player-actions">${acts}</div>`;
            playerListUl.appendChild(li);
        });

        const elimSorted = [...state.live.eliminatedPlayers].sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));
        elimSorted.forEach(p => {
            const li = document.createElement('li');
            let info = `${p.place ?? '?'}. ${p.name}`;
            if (p.rebuys > 0) info += ` <span class="player-details">[${p.rebuys}R]</span>`; if (p.addon) info += ` <span class="player-details">[A]</span>`; if (state.config.type === 'knockout' && p.knockouts > 0) info += ` <span class="player-details">(KOs: ${p.knockouts})</span>`; if (p.eliminatedBy) info += ` <span class="player-details">(av ${getPlayerNameById(p.eliminatedBy)})</span>`;
            let acts = '';
            if (actionsOk) { acts += `<button class="btn-edit-player small-button" data-player-id="${p.id}" title="Rediger Spiller">✏️</button>`; acts += `<button class="btn-restore small-button warning-button" data-player-id="${p.id}" title="Gjenopprett">↩️</button>`; }
            li.innerHTML = `<span class="item-name">${info}</span><div class="list-actions player-actions">${acts}</div>`;
            eliminatedPlayerListUl.appendChild(li);
        });

        activePlayerCountSpan.textContent = state.live.players.length;
        eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length;

        playerListUl.querySelectorAll('.btn-edit-player').forEach(b => b.onclick = handleEditPlayerClick);
        playerListUl.querySelectorAll('.btn-rebuy').forEach(b => b.onclick = handleRebuy);
        playerListUl.querySelectorAll('.btn-eliminate').forEach(b => b.onclick = handleEliminate);
        eliminatedPlayerListUl.querySelectorAll('.btn-edit-player').forEach(b => b.onclick = handleEditPlayerClick);
        eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(b => b.onclick = handleRestore);
    }
    function displayPrizes() { if (!prizeDisplayLive || !totalPotPrizeSpan) return; const prizeData = calculatePrizes(); const totalPotFmt = (state.live.totalPot || 0).toLocaleString('nb-NO'); prizeDisplayLive.querySelector('h3').innerHTML = `Premiefordeling (Totalpott: <span id="total-pot">${totalPotFmt}</span> kr)`; const ol = prizeDisplayLive.querySelector('ol'); const p = prizeDisplayLive.querySelector('p'); if(ol) ol.remove(); if(p) p.remove(); if (prizeData.length > 0) { const list = document.createElement('ol'); prizeData.forEach(pr => { const item = document.createElement('li'); item.textContent = `${pr.place}.: ${pr.amount.toLocaleString('nb-NO')} kr (${pr.percentage}%)`; list.appendChild(item); }); prizeDisplayLive.appendChild(list); prizeDisplayLive.classList.remove('hidden'); } else { const msgP = document.createElement('p'); const places = state.config.paidPlaces || 0; const dist = state.config.prizeDistribution || []; const totPot = state.live.totalPot || 0; let pPot = totPot; if (state.config.type === 'knockout') pPot -= (state.live.totalEntries || 0) * (state.config.bountyAmount || 0); if (pPot <= 0 && totPot > 0) msgP.textContent = 'Ingen pott å fordele (etter bounty).'; else if (pPot <= 0) msgP.textContent = 'Ingen pott å fordele.'; else if (places <= 0) msgP.textContent = 'Antall betalte ikke definert.'; else if (dist.length !== places) msgP.textContent = 'Premier matcher ikke betalte plasser.'; else msgP.textContent = 'Premiefordeling N/A.'; prizeDisplayLive.appendChild(msgP); prizeDisplayLive.classList.add('hidden'); } }
    function updateUI() {
        console.log("updateUI: Updating main UI elements...");
        if (!state?.config || !state.live) { console.error("State missing in updateUI"); if(nameDisplay) nameDisplay.textContent = "Error!"; return; }
        if (nameDisplay) nameDisplay.textContent = state.config.name;
        if (currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const i = state.live.currentLevelIndex; const cl = state.config.blindLevels?.[i]; const nl = state.config.blindLevels?.[i + 1]; const np = findNextPauseInfo();
        if (state.live.isOnBreak) { if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak); if(blindsElement) blindsElement.classList.add('hidden'); if(breakInfo) breakInfo.classList.remove('hidden'); }
        else { if(timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); if(blindsElement) blindsElement.classList.remove('hidden'); if(breakInfo) breakInfo.classList.add('hidden'); if(currentLevelDisplay) currentLevelDisplay.textContent = `(Nivå ${cl ? cl.level : 'N/A'})`; if(blindsDisplay) blindsDisplay.innerHTML = formatBlindsHTML(cl); }
        if (nextBlindsDisplay) nextBlindsDisplay.textContent = formatNextBlindsText(nl);
        if (averageStackDisplay) averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO');
        if (playersRemainingDisplay) playersRemainingDisplay.textContent = state.live.players.length;
        if (totalEntriesDisplay) totalEntriesDisplay.textContent = state.live.totalEntries;
        const currentLevelNum = i + 1; const lrOpen = currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished';
        if (lateRegStatusDisplay) { if (state.config.lateRegLevel > 0) lateRegStatusDisplay.textContent = `${lrOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`; else lateRegStatusDisplay.textContent = 'Ikke aktiv'; }
        if (infoNextPauseParagraph) { const span = infoNextPauseParagraph.querySelector('#next-pause-time'); if (span) span.textContent = np ? `Etter nivå ${np.level} (${np.duration} min)` : 'Ingen flere'; }
        const isFin = state.live.status === 'finished';
        if (startPauseButton) { startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke'; startPauseButton.disabled = isFin; }
        if (prevLevelButton) prevLevelButton.disabled = i <= 0 || isFin;
        if (nextLevelButton) nextLevelButton.disabled = i >= state.config.blindLevels.length - 1 || isFin;
        if (adjustTimeMinusButton) adjustTimeMinusButton.disabled = isFin;
        if (adjustTimePlusButton) adjustTimePlusButton.disabled = isFin;
        if (lateRegButton) lateRegButton.disabled = !lrOpen || isFin;
        if (btnEditTournamentSettings) btnEditTournamentSettings.disabled = isFin;
        if (endTournamentButton) endTournamentButton.disabled = isFin;
        // ENDRET: Oppdatert logikk for Add-on knapp
        const isAddonAvailable = state.config.type === 'rebuy' &&
                                 !isFin &&
                                 ( (currentLevelIndex >= state.config.rebuyLevels) || // Fra og med nivået *etter* siste rebuy-nivå
                                   (currentLevelIndex === state.config.rebuyLevels - 1 && state.live.isOnBreak) ); // ELLER i pausen *etter* siste rebuy-nivå
        if (btnManageAddons) { btnManageAddons.classList.toggle('hidden', state.config.type !== 'rebuy'); btnManageAddons.disabled = !isAddonAvailable; }
        updateSoundToggleVisuals(); renderPlayerList(); displayPrizes(); renderActivityLog();
        console.log("updateUI: Main UI elements updated.");
    }
    // === 08: UI UPDATE FUNCTIONS END ===

    // === 09: TIMER LOGIC START ===
    function tick() { if (state.live.status !== 'running') return; if (state.live.isOnBreak) { state.live.timeRemainingInBreak--; if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak); if (state.live.timeRemainingInBreak < 0) { state.live.isOnBreak = false; state.live.currentLevelIndex++; if (state.live.currentLevelIndex >= state.config.blindLevels.length) { logActivity(state.live.activityLog, "Pause ferdig. Blindstruktur fullført."); playSound('PAUSE_END'); finishTournament(); return; } const newLvl = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = newLvl.duration * 60; logActivity(state.live.activityLog, `Pause over. Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`); playSound('PAUSE_END'); setTimeout(() => playSound('NEW_LEVEL'), 500); updateUI(); saveTournamentState(currentTournamentId, state); } else if (state.live.timeRemainingInBreak % 15 === 0) saveTournamentState(currentTournamentId, state); } else { state.live.timeRemainingInLevel--; if (timerDisplay) timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); if (state.live.timeRemainingInLevel < 0) { const currentLvl = state.config.blindLevels[state.live.currentLevelIndex]; const pause = currentLvl?.pauseMinutes || 0; if (pause > 0) { state.live.isOnBreak = true; state.live.timeRemainingInBreak = pause * 60; logActivity(state.live.activityLog, `Nivå ${currentLvl.level} ferdig. Starter ${pause} min pause.`); playSound('PAUSE_START'); updateUI(); saveTournamentState(currentTournamentId, state); } else { state.live.currentLevelIndex++; if (state.live.currentLevelIndex >= state.config.blindLevels.length) { logActivity(state.live.activityLog, `Nivå ${currentLvl.level} ferdig. Blindstruktur fullført.`); playSound('NEW_LEVEL'); finishTournament(); return; } const newLvl = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = newLvl.duration * 60; logActivity(state.live.activityLog, `Nivå ${currentLvl.level} ferdig. Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`); playSound('NEW_LEVEL'); updateUI(); saveTournamentState(currentTournamentId, state); } } else if (state.live.timeRemainingInLevel > 0 && state.live.timeRemainingInLevel % 30 === 0) saveTournamentState(currentTournamentId, state); } }
    function startRealTimeClock() { if (realTimeInterval) clearInterval(realTimeInterval); realTimeInterval = setInterval(() => { if (currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }, 1000); }
    // === 09: TIMER LOGIC END ===

    // === 10: EVENT HANDLERS - CONTROLS START ===
    function handleStartPause() { console.log("handleStartPause called. Current status:", state.live.status); if (!state || !state.live) { console.error("State not ready in handleStartPause"); return; } if (state.live.status === 'finished') { console.log("handleStartPause: Tournament finished, doing nothing."); return; } if (state.live.status === 'paused') { state.live.status = 'running'; if (!timerInterval) { timerInterval = setInterval(tick, 1000); console.log("handleStartPause: Timer interval started."); } logActivity(state.live.activityLog, "Klokke startet."); } else if (state.live.status === 'running') { state.live.status = 'paused'; if (timerInterval) { clearInterval(timerInterval); timerInterval = null; console.log("handleStartPause: Timer interval cleared."); } logActivity(state.live.activityLog, "Klokke pauset."); saveTournamentState(currentTournamentId, state); } else { console.warn("handleStartPause called with unexpected status:", state.live.status); } updateUI(); }
    function handleAdjustTime(deltaSeconds) { console.log("handleAdjustTime called."); if (state.live.status === 'finished') return; let key = state.live.isOnBreak ? 'timeRemainingInBreak' : 'timeRemainingInLevel'; let maxT = Infinity; if (!state.live.isOnBreak) { const lvl = state.config.blindLevels[state.live.currentLevelIndex]; if (lvl) maxT = lvl.duration * 60; } state.live[key] = Math.max(0, Math.min(state.live[key] + deltaSeconds, maxT)); logActivity(state.live.activityLog, `Tid justert ${deltaSeconds > 0 ? '+' : ''}${deltaSeconds / 60} min.`); updateUI(); saveTournamentState(currentTournamentId, state); }
    function handleAdjustLevel(deltaIndex) { console.log("handleAdjustLevel called."); if (state.live.status === 'finished') return; const newIdx = state.live.currentLevelIndex + deltaIndex; if (newIdx >= 0 && newIdx < state.config.blindLevels.length) { const oldLvlNum = state.config.blindLevels[state.live.currentLevelIndex]?.level || '?'; const newLvl = state.config.blindLevels[newIdx]; if (!confirm(`Endre til Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)})?\nKlokken nullstilles.`)) return; state.live.currentLevelIndex = newIdx; state.live.timeRemainingInLevel = newLvl.duration * 60; state.live.isOnBreak = false; state.live.timeRemainingInBreak = 0; logActivity(state.live.activityLog, `Nivå manuelt endret: ${oldLvlNum} -> ${newLvl.level}.`); playSound('NEW_LEVEL'); updateUI(); saveTournamentState(currentTournamentId, state); } else alert("Kan ikke gå til nivået."); }
    function handleEndTournament() { console.log("handleEndTournament called."); if (state.live.status === 'finished') { alert("Turneringen er allerede fullført."); return; } if (confirm("Markere turneringen som fullført?")) finishTournament(); }
    function handleForceSave() { console.log("handleForceSave called."); if (state) { console.log("Forcing save..."); if (saveTournamentState(currentTournamentId, state)) { if(btnForceSave) btnForceSave.textContent = "Lagret!"; setTimeout(() => { if(btnForceSave) btnForceSave.textContent = "Lagre Nå"; }, 1500); } else alert("Lagring feilet!"); } else console.error("State missing on force save."); }
    function handleBackToMain() { console.log("handleBackToMain called."); if (state && state.live.status !== 'finished') saveTournamentState(currentTournamentId, state); window.location.href = 'index.html'; }
    // === 10: EVENT HANDLERS - CONTROLS END ===

    // === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    // ENDRET: Bruker Number() for ID, legger til logging
    function handleRebuy(event){
        console.log("handleRebuy raw dataset ID:", event?.target?.dataset?.playerId); // DEBUG
        const playerId = Number(event?.target?.dataset?.playerId); // ENDRET: Bruk Number()
        console.log("handleRebuy called for player ID:", playerId);
        if (!playerId || isNaN(playerId)) { console.error("Rebuy: Invalid player ID from button."); return; }
        const p=state.live.players.find(pl=>pl.id===playerId);
        const lvl=state.live.currentLevelIndex+1;
        if(!p){ console.warn(`Rebuy: Player ${playerId} not found in active list.`); return; }
        if(state.config.type!=='rebuy'||!(lvl<=state.config.rebuyLevels)){alert("Re-buy er ikke tilgjengelig nå.");return;}
        if(state.live.status==='finished'){alert("Turnering er fullført.");return;}
        if(confirm(`Re-buy (${state.config.rebuyCost}kr/${state.config.rebuyChips}c) for ${p.name}?`)){ p.rebuys=(p.rebuys||0)+1; state.live.totalPot+=state.config.rebuyCost; state.live.totalEntries++; state.live.totalRebuys++; logActivity(state.live.activityLog,`${p.name} tok Re-buy.`); updateUI(); saveTournamentState(currentTournamentId,state);}
    }

    // ENDRET: Bruker Number() for ID, legger til logging
    function handleEliminate(event){
        console.log("handleEliminate raw dataset ID:", event?.target?.dataset?.playerId); // DEBUG
        const playerId = Number(event?.target?.dataset?.playerId); // ENDRET: Bruk Number()
        console.log("handleEliminate called for player ID:", playerId);
        if (!playerId || isNaN(playerId)) { console.error("Eliminate: Invalid player ID from button."); return; }
        if(state.live.status === 'finished') return;

        const ap = state.live.players;
        const pI = ap.findIndex(p=>p.id===playerId); // Sammenlign number med number
        if(pI === -1) {
            console.warn(`Eliminate: Player ${playerId} not found in active list.`);
            const alreadyEliminated = state.live.eliminatedPlayers.find(p => p.id === playerId);
            if (alreadyEliminated) { console.warn(`Player ${playerId} is already eliminated.`); alert(`${alreadyEliminated.name} er allerede slått ut.`); }
            else { alert(`Fant ikke spiller med ID ${playerId} i listen over aktive spillere.`); }
            return;
        }
        if (ap.length <= 1 && state.live.status !== 'finished') { alert("Kan ikke eliminere siste spiller før turneringen er fullført."); return; }

        const p = ap[pI];
        let koId = null;

        // Håndter KO-valg... (som før, men bruker Number() internt)
        if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) {
            const assigners = ap.filter(pl => pl.id !== playerId);
            // ... (resten av KO-popup logikk) ...
             document.getElementById('ko-ok').onclick = () => {
                 const selVal = document.getElementById('ko-sel').value;
                 if (!selVal) { alert("Velg spiller eller 'Ingen KO'."); return; }
                 koId = (selVal === "none") ? null : Number(selVal); // ENDRET: Bruk Number()
                 closeKo();
                 proceed();
             };
            // ...
        } else { koId = null; proceed(); }

        function proceed() {
            let koName = null; let koObj = null;
            if (koId !== null && !isNaN(koId)) { // Sjekk at koId er et gyldig tall
                koObj = ap.find(pl => pl.id === koId); // Sammenlign number med number
                if (koObj) { koName = koObj.name; }
                else { console.warn("Selected KO player not found in active list:", koId); koId = null; }
            }
            const confirmMsg = `Eliminere ${p.name}?` + (koName ? ` (KO til ${koName})` : '');
            if (confirm(confirmMsg)) { // Start av bekreftet blokk
                playSound('KNOCKOUT'); p.eliminated = true; p.eliminatedBy = koId;
                const playersRemainingBefore = ap.length; p.place = playersRemainingBefore;
                if (koObj) { koObj.knockouts = (koObj.knockouts || 0) + 1; state.live.knockoutLog.push({ eliminatedPlayerId: p.id, eliminatedByPlayerId: koObj.id, level: state.live.currentLevelIndex + 1, timestamp: new Date().toISOString() }); console.log(`KO: ${koObj.name} took out ${p.name}`); }
                state.live.eliminatedPlayers.push(p); ap.splice(pI, 1);
                const logTxt = koName ? ` av ${koName}` : ''; logActivity(state.live.activityLog, `${p.name} slått ut (${p.place}. plass${logTxt}).`); console.log(`Player ${p.name} eliminated. ${ap.length} remaining.`);
                if (state.config.paidPlaces > 0 && ap.length === state.config.paidPlaces) { logActivity(state.live.activityLog, `Boblen sprakk! ${ap.length} spillere igjen (i pengene).`); playSound('BUBBLE'); }
                const structChanged = checkAndHandleTableBreak(); if (!structChanged) { updateUI(); saveTournamentState(currentTournamentId, state); }
                if (state.live.players.length <= 1 && state.live.status !== 'finished') { finishTournament(); }
            } else { console.log("Elimination cancelled."); } // Slutt på bekreftet blokk
        } // End proceed
    } // End handleEliminate

    // ENDRET: Bruker Number() for ID
    function handleRestore(event){
        console.log("handleRestore raw dataset ID:", event?.target?.dataset?.playerId); // DEBUG
        const playerId = Number(event?.target?.dataset?.playerId); // ENDRET: Bruk Number()
        console.log("handleRestore called for player ID:", playerId);
        if (!playerId || isNaN(playerId)) { console.error("Restore: Invalid player ID from button."); return; }
        if(state.live.status === 'finished'){ alert("Turnering fullført."); return; }

        const pI=state.live.eliminatedPlayers.findIndex(p=>p.id===playerId);
        if(pI===-1) { console.warn(`Restore: Player ${playerId} not found in eliminated list.`); return; }
        const p=state.live.eliminatedPlayers[pI]; const oldP = p.place;
        if(confirm(`Gjenopprette ${p.name} (var ${oldP}.plass)?`)){
            const koById = p.eliminatedBy;
            p.eliminated = false; p.eliminatedBy = null; p.place = null;
            state.live.eliminatedPlayers.splice(pI, 1); state.live.players.push(p);
            if(state.config.type === 'knockout' && koById){
                let koGetter = state.live.players.find(pl => pl.id === koById) || state.live.eliminatedPlayers.find(pl => pl.id === koById);
                if(koGetter?.knockouts > 0){ koGetter.knockouts--; console.log(`KO reversed for ${koGetter.name}.`); const logI = state.live.knockoutLog.findIndex(l => l.eliminatedPlayerId === p.id && l.eliminatedByPlayerId === koById); if(logI > -1) { state.live.knockoutLog.splice(logI, 1); } }
                else if (koGetter) { console.warn(`Restore: KO getter ${koGetter.name} found, but had ${koGetter.knockouts} KOs.`); }
            }
            assignTableSeat(p); logActivity(state.live.activityLog, `${p.name} gjenopprettet fra ${oldP}.plass (nå B${p.table}S${p.seat}).`);
            const structChanged = checkAndHandleTableBreak(); if (!structChanged) { updateUI(); saveTournamentState(currentTournamentId, state); }
        }
    }

    // ENDRET: Bruker Number() for ID
    function handleEditPlayerClick(event) {
        console.log("handleEditPlayerClick raw dataset ID:", event?.target?.dataset?.playerId); // DEBUG
        const playerId = Number(event?.target?.dataset?.playerId); // ENDRET: Bruk Number()
        console.log("handleEditPlayerClick called for player ID:", playerId);
        if (!playerId || isNaN(playerId)) { console.error("handleEditPlayerClick: Invalid or missing player ID."); return; }
        if (state.live.status === 'finished') return;
        openEditPlayerModal(playerId);
    }

    // ENDRET: Bruker state.live.nextPlayerId
    function handleLateRegClick() {
        console.log("handleLateRegClick called.");
        if(state.live.status === 'finished') return;
        const lvl=state.live.currentLevelIndex + 1;
        const isOpen = lvl <= state.config.lateRegLevel && state.config.lateRegLevel > 0;
        if (!isOpen) { const reason = state.config.lateRegLevel > 0 ? `stengte etter nivå ${state.config.lateRegLevel}` : "ikke aktivert"; alert(`Sen registrering ${reason}.`); return; }
        const name = prompt("Navn (Late Reg):");
        if (name?.trim()) {
            const newPlayerId = state.live.nextPlayerId++; // Hent og øk neste ID
            const p={ id: newPlayerId, // Bruk numerisk ID
                      name:name.trim(), stack:state.config.startStack, table:0, seat:0, rebuys:0, addon:false, eliminated:false, eliminatedBy:null, place:null, knockouts:0 };
            assignTableSeat(p); state.live.players.push(p); state.live.totalPot+=state.config.buyIn; state.live.totalEntries++;
            logActivity(state.live.activityLog,`${p.name} (ID: ${p.id}) registrert (Late Reg, B${p.table}S${p.seat}).`);
            state.live.players.sort((a,b)=>a.table===b.table?a.seat-b.seat:a.table-b.table);
            const structChanged = checkAndHandleTableBreak();
            if(!structChanged){updateUI(); saveTournamentState(currentTournamentId,state);}
        } else if(name !== null) { alert("Navn kan ikke være tomt."); }
    }
    // === 11: EVENT HANDLERS - PLAYER ACTIONS END ===

    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    function openTournamentModal() { /* ... (som før) ... */ }
    function closeTournamentModal() { /* ... (som før) ... */ }
    async function openUiModal() { /* ... (som før) ... */ }
    async function closeUiModal(revert = false) { /* ... (som før) ... */ }
    function addEditBlindLevelRow(levelData={}){ /* ... (som før) ... */ }
    function updateEditLevelNumbers(){ /* ... (som før) ... */ }
    function generateEditPayout(){ /* ... (som før) ... */ }
    function syncRgbFromHsl(prefix){ /* ... (som før) ... */ }
    function syncHslFromRgb(prefix){ /* ... (som før) ... */ }
    function updateColorAndLayoutPreviews() { /* ... (som før) ... */ }
    function handleThemeLayoutControlChange(e) { /* ... (som før) ... */ }
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
    async function handleSaveUiSettings(){ /* ... (som før) ... */ }
    async function handleResetLayoutTheme() { /* ... (som før) ... */ }
    function handleLogoUpload(event) { /* ... (som før) ... */ }
    function handleRemoveLogo() { /* ... (som før) ... */ }
    function openAddonModal() { if (!addonModal || isModalOpen) return; console.log("Opening Addon Modal..."); addonPlayerListUl.innerHTML = ''; const activePlayers = state.live.players; if (activePlayers.length === 0) { addonPlayerListUl.innerHTML = '<li>Ingen aktive spillere.</li>'; } else { activePlayers.forEach(player => { const li = document.createElement('li'); li.style.display = 'flex'; li.style.alignItems = 'center'; li.style.justifyContent = 'space-between'; li.style.padding = '5px 0'; const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `addon-chk-${player.id}`; checkbox.dataset.playerId = player.id; checkbox.checked = player.addon; checkbox.disabled = player.addon; checkbox.style.marginRight = '10px'; const label = document.createElement('label'); label.htmlFor = `addon-chk-${player.id}`; label.textContent = player.name; label.style.flexGrow = '1'; if (player.addon) { label.style.opacity = '0.6'; } li.appendChild(checkbox); li.appendChild(label); addonPlayerListUl.appendChild(li); }); } addonModal.classList.remove('hidden'); isModalOpen = true; currentOpenModal = addonModal; }
    function closeAddonModal() { if (!addonModal) return; addonModal.classList.add('hidden'); isModalOpen = false; currentOpenModal = null; }
    function handleConfirmAddons() { console.log("Confirming Addons..."); const checkboxes = addonPlayerListUl.querySelectorAll('input[type="checkbox"]:not(:disabled)'); let addonsGiven = 0; let costTotal = 0; checkboxes.forEach(chk => { if (chk.checked) { const playerId = Number(chk.dataset.playerId); const player = state.live.players.find(p => p.id === playerId); if (player && !player.addon) { player.addon = true; state.live.totalAddons++; costTotal += state.config.addonCost || 0; logActivity(state.live.activityLog, `${player.name} tok Add-on.`); addonsGiven++; } } }); if (addonsGiven > 0) { state.live.totalPot += costTotal; console.log(`${addonsGiven} add-ons confirmed. Total cost added: ${costTotal}`); updateUI(); saveTournamentState(currentTournamentId, state); } else { console.log("No new add-ons selected."); } closeAddonModal(); }
    function openEditPlayerModal(playerId) { // playerId er nå et tall
        if (!editPlayerModal || isModalOpen) return;
        console.log(`Opening Edit Player Modal for ID: ${playerId}`);
        let player = state.live.players.find(p => p.id === playerId);
        const isEliminated = !player;
        if (isEliminated) { player = state.live.eliminatedPlayers.find(p => p.id === playerId); }
        if (!player) { console.error(`Player with ID ${playerId} not found.`); alert(`Feil: Fant ikke spiller med ID ${playerId}.`); return; }
        console.log("Player data:", player);
        editPlayerIdInput.value = player.id; // Lagre den numeriske IDen
        editPlayerNameDisplay.textContent = player.name + (isEliminated ? ' (Eliminert)' : ` (B${player.table}S${player.seat})`);
        editPlayerNameInput.value = player.name;
        editPlayerRebuysInput.value = player.rebuys || 0;
        editPlayerAddonCheckbox.checked = player.addon || false;
        editPlayerModal.classList.remove('hidden'); isModalOpen = true; currentOpenModal = editPlayerModal;
    }
    function closeEditPlayerModal() { if (!editPlayerModal) return; editPlayerModal.classList.add('hidden'); isModalOpen = false; currentOpenModal = null; }
    function handleSaveChangesEditPlayer() {
        const playerId = Number(editPlayerIdInput.value); // Hent som tall
        if (!playerId || isNaN(playerId)) { console.error("Save Player Changes: Invalid ID in modal."); return; }
        let player = state.live.players.find(p => p.id === playerId);
        if (!player) { player = state.live.eliminatedPlayers.find(p => p.id === playerId); }
        if (!player) { console.error(`Save Player Changes: Player with ID ${playerId} not found.`); alert(`Feil: Fant ikke spiller med ID ${playerId} ved lagring.`); closeEditPlayerModal(); return; }
        const newName = editPlayerNameInput.value.trim(); const newRebuys = parseInt(editPlayerRebuysInput.value); const newAddon = editPlayerAddonCheckbox.checked;
        if (!newName) { alert("Navn kan ikke være tomt."); return; } if (isNaN(newRebuys) || newRebuys < 0) { alert("Ugyldig antall rebuys."); return; }
        let logMessages = []; let potAdjustment = 0; let rebuyCountAdjustment = 0; let addonCountAdjustment = 0;
        const oldName = player.name; const oldRebuys = player.rebuys || 0; const oldAddon = player.addon || false;
        if (newName !== oldName) { logMessages.push(`Navn endret fra "${oldName}" til "${newName}".`); player.name = newName; }
        if (newRebuys !== oldRebuys) { const rebuyDiff = newRebuys - oldRebuys; rebuyCountAdjustment = rebuyDiff; potAdjustment += rebuyDiff * (state.config.rebuyCost || 0); player.rebuys = newRebuys; logMessages.push(`Rebuys justert fra ${oldRebuys} til ${newRebuys} (${rebuyDiff > 0 ? '+' : ''}${rebuyDiff}).`); }
        if (newAddon !== oldAddon) { if (newAddon) { addonCountAdjustment = 1; potAdjustment += state.config.addonCost || 0; logMessages.push(`Add-on manuelt lagt til.`); } else { addonCountAdjustment = -1; potAdjustment -= state.config.addonCost || 0; logMessages.push(`Add-on manuelt fjernet.`); } player.addon = newAddon; }
        if (logMessages.length > 0) { state.live.totalRebuys = (state.live.totalRebuys || 0) + rebuyCountAdjustment; state.live.totalAddons = (state.live.totalAddons || 0) + addonCountAdjustment; state.live.totalPot = (state.live.totalPot || 0) + potAdjustment; const fullLogMsg = `Manuell justering for ${newName}: ${logMessages.join(' ')} Pott justert med ${potAdjustment} kr.`; logActivity(state.live.activityLog, fullLogMsg); console.log(fullLogMsg); updateUI(); saveTournamentState(currentTournamentId, state); }
        else { console.log("Ingen endringer å lagre for spiller."); }
        closeEditPlayerModal();
    }
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===

    // === 13: TOURNAMENT FINISH LOGIC START ===
    async function finishTournament() { if (state.live.status === 'finished') return; console.log("Finishing T..."); logActivity(state.live.activityLog,"Turnering fullføres."); playSound('TOURNAMENT_END'); if(timerInterval)clearInterval(timerInterval);timerInterval=null; if(realTimeInterval)clearInterval(realTimeInterval);realTimeInterval=null; state.live.status='finished'; state.live.isOnBreak=false; state.live.timeRemainingInLevel=0; state.live.timeRemainingInBreak=0; if(state.live.players.length===1){const w=state.live.players[0];w.place=1;state.live.eliminatedPlayers.push(w);state.live.players.splice(0,1);logActivity(state.live.activityLog,`Vinner: ${w.name}!`);}else if(state.live.players.length>1){logActivity(state.live.activityLog,`Fullført med ${state.live.players.length} spillere igjen.`); state.live.players.forEach(p=>{p.eliminated=true;p.place=null;state.live.eliminatedPlayers.push(p);}); state.live.players=[];}else{logActivity(state.live.activityLog,`Fullført uten aktive spillere.`);} state.live.eliminatedPlayers.sort((a,b)=>(a.place??Infinity)-(b.place??Infinity)); updateUI(); saveTournamentState(currentTournamentId,state); alert("Turneringen er fullført!"); }
    // === 13: TOURNAMENT FINISH LOGIC END ===

    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    function addClickListener(element, handler) { if (element) { element.addEventListener('click', handler); /* console.log(`Listener added for: ${element.id || element.tagName}`); */ } else { console.warn(`Element not found for listener: ${handler.name}`); } } // Fjernet logging herfra for mindre støy
    addClickListener(startPauseButton, handleStartPause); addClickListener(prevLevelButton, () => handleAdjustLevel(-1)); addClickListener(nextLevelButton, () => handleAdjustLevel(1)); addClickListener(adjustTimeMinusButton, () => handleAdjustTime(-60)); addClickListener(adjustTimePlusButton, () => handleAdjustTime(60)); addClickListener(lateRegButton, handleLateRegClick); addClickListener(endTournamentButton, handleEndTournament); addClickListener(btnForceSave, handleForceSave); addClickListener(btnBackToMainLive, handleBackToMain);
    addClickListener(btnToggleSound, () => { console.log("btnToggleSound clicked."); soundsEnabled = !soundsEnabled; saveSoundPreference(soundsEnabled); updateSoundToggleVisuals(); logActivity(state.live.activityLog, `Lyd ${soundsEnabled ? 'PÅ' : 'AV'}.`); });
    addClickListener(btnEditTournamentSettings, openTournamentModal); addClickListener(btnEditUiSettings, openUiModal); addClickListener(closeTournamentModalButton, closeTournamentModal); addClickListener(btnCancelTournamentEdit, closeTournamentModal); addClickListener(btnAddEditLevel, () => addEditBlindLevelRow()); addClickListener(btnGenerateEditPayout, generateEditPayout); addClickListener(btnSaveTournamentSettings, handleSaveTournamentSettings); addClickListener(closeUiModalButton, () => closeUiModal(true)); addClickListener(btnCancelUiEdit, () => closeUiModal(true)); addClickListener(btnSaveUiSettings, handleSaveUiSettings); addClickListener(btnResetLayoutTheme, handleResetLayoutTheme);
    addClickListener(btnManageAddons, openAddonModal); addClickListener(closeAddonModalButton, closeAddonModal); addClickListener(btnCancelAddons, closeAddonModal); addClickListener(btnConfirmAddons, handleConfirmAddons);
    addClickListener(closeEditPlayerModalButton, closeEditPlayerModal); addClickListener(btnCancelPlayerEdit, closeEditPlayerModal); addClickListener(btnSavePlayerChanges, handleSaveChangesEditPlayer);
    draggableElements.forEach(el => { if (el) { el.addEventListener('mousedown', (e) => startDrag(e, el)); } });
    window.addEventListener('click', (e) => { if (isModalOpen && currentOpenModal && e.target === currentOpenModal) { console.log("Clicked outside modal content."); if (currentOpenModal === uiSettingsModal) { closeUiModal(true); } else if (currentOpenModal === tournamentSettingsModal) { closeTournamentModal(); } else if (currentOpenModal === addonModal) { closeAddonModal(); } else if (currentOpenModal === editPlayerModal) { closeEditPlayerModal(); } } });
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===

    // === 15: INITIAL UI RENDER & TIMER START ===
    console.log("Performing final setup steps...");
    try {
        updateUI(); startRealTimeClock();
        if (state.live.status === 'running') { console.log("State is 'running', starting timer."); if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(tick, 1000); }
        else if (state.live.status === 'finished') { console.log("State is 'finished'."); }
        else { console.log(`State is '${state.live.status}'. Timer not started.`); if (timerInterval) clearInterval(timerInterval); timerInterval = null; }
        console.log("Tournament page fully initialized and ready.");
    } catch (err) { console.error("Error during final setup or UI update:", err); alert("En feil oppstod under lasting av siden. Sjekk konsollen."); }
    // === 15: INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
