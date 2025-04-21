// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    // === 02: STATE VARIABLES START ===
    let currentTournamentId = getActiveTournamentId(); let state = null; let timerInterval = null; let realTimeInterval = null; let isModalOpen = false; let currentOpenModal = null; // Track which modal is open
    let editBlindLevelCounter = 0; const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    let originalThemeBg = ''; let originalThemeText = ''; let originalElementLayouts = {};
    let blockSliderUpdates = false;
    // === 02: STATE VARIABLES END ===

// === 03: DOM REFERENCES START ===
    const nameDisplay = document.getElementById('tournament-name-display');
    const currentTimeDisplay = document.getElementById('current-time');
    const btnEditTournamentSettings = document.getElementById('btn-edit-tournament-settings');
    const btnEditUiSettings = document.getElementById('btn-edit-ui-settings');
    const btnBackToMainLive = document.getElementById('btn-back-to-main-live');
    const liveCanvas = document.getElementById('live-canvas'); // Canvas container
    const timerElement = document.getElementById('timer-element');
    const timerDisplay = document.getElementById('timer-display');
    const breakInfo = document.getElementById('break-info');
    const blindsElement = document.getElementById('blinds-element');
    const currentLevelDisplay = document.getElementById('current-level');
    const blindsDisplay = document.getElementById('blinds-display');
    const logoElement = document.getElementById('logo-element');
    const logoImg = logoElement?.querySelector('.logo');
    const infoElement = document.getElementById('info-element');
    const nextBlindsDisplay = document.getElementById('next-blinds');
    // Referanse til 'info-next-pause' <p> element
    const infoNextPauseParagraph = document.getElementById('info-next-pause');
    const averageStackDisplay = document.getElementById('average-stack');
    const playersRemainingDisplay = document.getElementById('players-remaining');
    const totalEntriesDisplay = document.getElementById('total-entries');
    const lateRegStatusDisplay = document.getElementById('late-reg-status');
    const prizeDisplayLive = document.getElementById('prize-display-live');
    const totalPotPrizeSpan = document.getElementById('total-pot');
    // ----- VIKTIG: Legg til startPauseButton her -----
    const startPauseButton = document.getElementById('btn-start-pause');
    // --------------------------------------------------
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

    // Tournament Modal Refs (Bruk korrekte navn)
    const tournamentSettingsModal = document.getElementById('tournament-settings-modal'); // Korrekt navn
    const closeTournamentModalButton = document.getElementById('close-tournament-modal-button');
    const editBlindStructureBody = document.getElementById('edit-blind-structure-body');
    const btnAddEditLevel = document.getElementById('btn-add-edit-level');
    const editPaidPlacesInput = document.getElementById('edit-paid-places');
    const editPrizeDistTextarea = document.getElementById('edit-prize-distribution');
    const btnGenerateEditPayout = document.getElementById('btn-generate-edit-payout');
    const btnSaveTournamentSettings = document.getElementById('btn-save-tournament-settings');
    const btnCancelTournamentEdit = document.getElementById('btn-cancel-tournament-edit');

    // UI Modal Refs (Bruk korrekte navn)
    const uiSettingsModal = document.getElementById('ui-settings-modal'); // Korrekt navn
    const closeUiModalButton = document.getElementById('close-ui-modal-button');
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
    const canvasHeightSlider = document.getElementById('canvasHeightSlider'); const canvasHeightInput = document.getElementById('canvasHeightInput');
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
    const btnSaveUiSettings = document.getElementById('btn-save-ui-settings');
    const btnCancelUiEdit = document.getElementById('btn-cancel-ui-edit');
    const btnResetLayoutTheme = document.getElementById('btnResetLayoutTheme');
    // Info Box Toggles
    const toggleInfoNextBlinds = document.getElementById('toggleInfoNextBlinds'); const toggleInfoNextPause = document.getElementById('toggleInfoNextPause'); const toggleInfoAvgStack = document.getElementById('toggleInfoAvgStack'); const toggleInfoPlayers = document.getElementById('toggleInfoPlayers'); const toggleInfoLateReg = document.getElementById('toggleInfoLateReg');
    const infoParagraphs = {
        showNextBlinds: document.getElementById('info-next-blinds'),
        showNextPause: infoNextPauseParagraph, // Bruker referansen definert lenger oppe
        showAvgStack: document.getElementById('info-avg-stack'),
        showPlayers: document.getElementById('info-players'),
        showLateReg: document.getElementById('info-late-reg')
    };
// === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId); if (!state) { alert(`Kunne ikke laste T ID: ${currentTournamentId}.`); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    console.log(`Loaded T: ${state.config.name} (ID: ${currentTournamentId})`, state); state.live = state.live || {}; state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.knockoutLog = state.live.knockoutLog || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.players = state.live.players || []; state.live.activityLog = state.live.activityLog || [];
    // === 04: INITIALIZATION & VALIDATION END ===

    // === 04b: THEME & LAYOUT APPLICATION START ===
    function applyThemeAndLayout(bgColor, textColor, elementLayouts) {
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--live-page-bg', bgColor); rootStyle.setProperty('--live-page-text', textColor);
        const [r, g, b] = parseRgbString(bgColor); const brightness = (r * 299 + g * 587 + b * 114) / 1000; const borderColor = brightness < 128 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'; rootStyle.setProperty('--live-ui-border', borderColor);
        // Apply Element Layouts
        if (elementLayouts.canvas) { rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas.height}vh`); }
        if (elementLayouts.timer) { rootStyle.setProperty('--timer-x', `${elementLayouts.timer.x}%`); rootStyle.setProperty('--timer-y', `${elementLayouts.timer.y}%`); rootStyle.setProperty('--timer-width', `${elementLayouts.timer.width}%`); rootStyle.setProperty('--timer-font-size', `${elementLayouts.timer.fontSize}em`); }
        if (elementLayouts.blinds) { rootStyle.setProperty('--blinds-x', `${elementLayouts.blinds.x}%`); rootStyle.setProperty('--blinds-y', `${elementLayouts.blinds.y}%`); rootStyle.setProperty('--blinds-width', `${elementLayouts.blinds.width}%`); rootStyle.setProperty('--blinds-font-size', `${elementLayouts.blinds.fontSize}em`); }
        if (elementLayouts.logo) { rootStyle.setProperty('--logo-x', `${elementLayouts.logo.x}%`); rootStyle.setProperty('--logo-y', `${elementLayouts.logo.y}%`); rootStyle.setProperty('--logo-width', `${elementLayouts.logo.width}%`); rootStyle.setProperty('--logo-height', `${elementLayouts.logo.height}%`); }
        if (elementLayouts.info) { rootStyle.setProperty('--info-x', `${elementLayouts.info.x}%`); rootStyle.setProperty('--info-y', `${elementLayouts.info.y}%`); rootStyle.setProperty('--info-width', `${elementLayouts.info.width}%`); rootStyle.setProperty('--info-font-size', `${elementLayouts.info.fontSize}em`); }
        // Apply info box visibility toggles
        for (const key in infoParagraphs) {
            if (infoParagraphs[key]) {
                infoParagraphs[key].classList.toggle('hidden', !(elementLayouts.info?.[key] ?? true)); // Show by default if key missing
            }
        }
        console.log(`Theme/Layout applied`);
    }
    const initialBgColor = loadThemeBgColor(); const initialTextColor = loadThemeTextColor(); const initialElementLayouts = loadElementLayouts();
    applyThemeAndLayout(initialBgColor, initialTextColor, initialElementLayouts);
    // === 04b: THEME & LAYOUT APPLICATION END ===

    // === 05: HELPER FUNCTIONS - FORMATTING START ===
    function formatTime(seconds) { if (isNaN(seconds) || seconds < 0) return "00:00"; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }
    function formatBlindsHTML(level) { if (!level) return `<span class="value">--</span>/<span class="value">--</span><span class="label">A:</span><span class="value">--</span>`; let a = ''; if (level.ante > 0) a = `<span class="label">A:</span><span class="value">${level.ante}</span>`; return `<span class="value">${level.sb}</span>/<span class="value">${level.bb}</span>${a}`; }
    function formatNextBlindsText(level) { if (!level) return "Slutt"; const a = level.ante > 0 ? `(${level.ante})` : ''; return `${level.sb}/${level.bb}${a}`; }
    function getPlayerNameById(playerId) { const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId); return player ? player.name : 'Ukjent'; }
    function roundToNearestValid(value, step = 100) { if (isNaN(value) || value <= 0) return step; const rounded = Math.round(value / step) * step; return Math.max(step, rounded); }
    // === 05: HELPER FUNCTIONS - FORMATTING END ===

    // === 06: HELPER FUNCTIONS - CALCULATIONS START ===
    function calculateTotalChips() { const b = state.live.totalEntries * state.config.startStack; const r = state.live.totalRebuys * (state.config.rebuyChips || 0); const a = state.live.totalAddons * (state.config.addonChips || 0); return b + r + a; }
    function calculateAverageStack() { const ap = state.live.players.length; if (ap === 0) return 0; const tc = calculateTotalChips(); return Math.round(tc / ap); }
    function calculatePrizes() { const p = []; const pfp = state.live.totalPot - (state.config.type === 'knockout' ? state.live.totalEntries * (state.config.bountyAmount || 0) : 0); if (pfp <= 0 || !state.config.prizeDistribution || state.config.prizeDistribution.length !== state.config.paidPlaces) return p; let sum = 0; for (let i = 0; i < state.config.paidPlaces; i++) { const pct = state.config.prizeDistribution[i] || 0; let amt; if (i === state.config.paidPlaces - 1) { amt = Math.max(0, pfp - sum); } else { amt = Math.floor((pfp * pct) / 100); } if (amt > 0 || (p.length === 0 && state.config.paidPlaces === 1)) { p.push({ place: i + 1, amount: amt, percentage: pct }); sum += amt; } else if (p.length > 0) { p.push({ place: i + 1, amount: 0, percentage: pct }); } else break; if(p.length >= state.config.paidPlaces) break; } return p; }
    function findNextPauseInfo() {
        const currentLevelIndex = state.live.currentLevelIndex;
        if(state.live.isOnBreak) { // If currently on break, find next break AFTER this one completes
             for (let i = currentLevelIndex + 1; i < state.config.blindLevels.length; i++) {
                if (state.config.blindLevels[i].pauseMinutes > 0) {
                    return { level: state.config.blindLevels[i].level, duration: state.config.blindLevels[i].pauseMinutes };
                }
            }
        } else { // If not on break, find the next break from current level onwards
            for (let i = currentLevelIndex; i < state.config.blindLevels.length; i++) {
                if (state.config.blindLevels[i].pauseMinutes > 0) {
                    return { level: state.config.blindLevels[i].level, duration: state.config.blindLevels[i].pauseMinutes };
                }
            }
        }
        return null; // No more pauses found
    }
    // === 06: HELPER FUNCTIONS - CALCULATIONS END ===

    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT START ===
    function assignTableSeat(player, excludeTableNum = null) { /* ... */ const tables = {}; let minTableNum = -1; state.live.players.forEach(p => { if (p.id !== player.id && p.table !== excludeTableNum) { tables[p.table] = (tables[p.table] || 0) + 1; } }); const sortedTables = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).sort((a, b) => a.count - b.count); for (const tableInfo of sortedTables) { if (tableInfo.tableNum !== excludeTableNum && tableInfo.count < state.config.playersPerTable) { minTableNum = tableInfo.tableNum; break; } } if (minTableNum === -1) { const existingTableNumbers = Object.keys(tables).map(Number); let nextTable = existingTableNumbers.length > 0 ? Math.max(...existingTableNumbers) + 1 : 1; if(nextTable === excludeTableNum) nextTable++; minTableNum = nextTable; player.table = minTableNum; player.seat = 1; } else { const occupiedSeats = state.live.players.filter(p => p.table === minTableNum).map(p => p.seat); let seatNum = 1; while (occupiedSeats.includes(seatNum)) { seatNum++; } if (seatNum > state.config.playersPerTable) { console.error(`ERROR: No seat on table ${minTableNum}`); seatNum = occupiedSeats.length + 1; } player.table = minTableNum; player.seat = seatNum; } console.log(`Assigned ${player.name} to T${player.table} S${player.seat} (Excluded T${excludeTableNum})`); }
    function reassignAllSeats(targetTableNum) { /* ... */ logActivity(state.live.activityLog, `Finalebord (Bord ${targetTableNum})! Trekker nye seter...`); const playersToReseat = state.live.players; const numPlayers = playersToReseat.length; const seats = Array.from({ length: numPlayers }, (_, i) => i + 1); for (let i = seats.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [seats[i], seats[j]] = [seats[j], seats[i]]; } playersToReseat.forEach((player, index) => { player.table = targetTableNum; player.seat = seats[index]; logActivity(state.live.activityLog, ` -> ${player.name} får sete ${player.seat}.`); }); state.live.players.sort((a, b) => a.seat - b.seat); console.log("Final table seats reassigned."); }
    function checkAndHandleTableBreak() { /* ... */ const apc = state.live.players.length; const ppt = state.config.playersPerTable; const cTS = new Set(state.live.players.map(p => p.table)); const cTC = cTS.size; const tT = Math.ceil(apc / ppt); const fTS = ppt; let actionTaken = false; if (apc <= fTS && cTC > 1) { const tFTN = 1; logActivity(state.live.activityLog, `Finalebord! Flytter til B${tFTN}...`); alert(`Finalebord! Flytter til B${tFTN}.`); state.live.players.forEach(p => p.table = tFTN); reassignAllSeats(tFTN); actionTaken = true; } else if (cTC > tT && cTC > 1) { const tables = {}; state.live.players.forEach(p => { tables[p.table] = (tables[p.table] || 0) + 1; }); const sortedTables = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).sort((a, b) => a.count - b.count); const tTB = sortedTables[0].tableNum; const msg = `Slår sammen bord! Flytter fra B${tTB}.`; logActivity(state.live.activityLog, msg); alert(msg); const ptm = state.live.players.filter(p => p.table === tTB); ptm.forEach(p => { const oT = p.table; const oS = p.seat; p.table = 0; assignTableSeat(p, tTB); logActivity(state.live.activityLog, ` -> Flyttet ${p.name} (B${oT}S${oS}) til B${p.table}S${p.seat}.`); }); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); actionTaken = true; } if (actionTaken) { updateUI(); saveTournamentState(currentTournamentId, state); } return actionTaken; }
    function balanceTables() { /* ... */ if(state.live.status==='finished'||state.live.players.length<=state.config.playersPerTable){tableBalanceInfo.classList.add('hidden');return false;} let balancingPerformed=false; while(true){const tables={}; state.live.players.forEach(p=>{tables[p.table]=(tables[p.table]||0)+1;}); const tableCounts=Object.entries(tables).map(([num,count])=>({tableNum:parseInt(num),count:count})).filter(tc=>tc.count>0); if(tableCounts.length<2){tableBalanceInfo.classList.add('hidden');break;} tableCounts.sort((a,b)=>a.count-b.count); const minTable=tableCounts[0]; const maxTable=tableCounts[tableCounts.length-1]; if(maxTable.count-minTable.count<2){tableBalanceInfo.classList.add('hidden');break;} balancingPerformed=true; tableBalanceInfo.classList.remove('hidden'); console.log(`Balancing: Max T${maxTable.tableNum}(${maxTable.count}), Min T${minTable.tableNum}(${minTable.count})`); const playersOnMaxTable=state.live.players.filter(p=>p.table===maxTable.tableNum); if(playersOnMaxTable.length===0){console.error("Balancing Error!");break;} const playerToMove=playersOnMaxTable[Math.floor(Math.random()*playersOnMaxTable.length)]; const occupiedSeatsMin=state.live.players.filter(p=>p.table===minTable.tableNum).map(p=>p.seat); let newSeat=1; while(occupiedSeatsMin.includes(newSeat)){newSeat++;} if(newSeat>state.config.playersPerTable){console.error(`Balancing Error: No seat on table ${minTable.tableNum}.`); alert(`Balanseringsfeil bord ${minTable.tableNum}.`);break;} const oldTable=playerToMove.table; const oldSeat=playerToMove.seat; const message=`Balansering: ${playerToMove.name} flyttes fra B${oldTable} S${oldSeat} til B${minTable.tableNum} S${newSeat}.`; playerToMove.table=minTable.tableNum; playerToMove.seat=newSeat; logActivity(state.live.activityLog,message); state.live.players.sort((a,b)=>a.table===b.table?a.seat-b.seat:a.table-b.table); saveTournamentState(currentTournamentId,state); updateUI(); alert(message);} if(balancingPerformed){console.log("Balancing done.");return true;} return false;}
    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT END ===

    // === 07b: HELPER FUNCTIONS - LOGGING START ===
    function logActivity(logArray, message) { if (!logArray) logArray = []; const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit'}); logArray.unshift({ timestamp, message }); const MAX_LOG_ENTRIES = 50; if (logArray.length > MAX_LOG_ENTRIES) { logArray.pop(); } renderActivityLog(); }
    function renderActivityLog() { if (!activityLogUl) return; activityLogUl.innerHTML = ''; if (!state?.live?.activityLog || state.live.activityLog.length === 0) { activityLogUl.innerHTML = '<li>Loggen er tom.</li>'; return; } state.live.activityLog.forEach(entry => { const li = document.createElement('li'); li.innerHTML = `<span class="log-time">[${entry.timestamp}]</span> ${entry.message}`; activityLogUl.appendChild(li); }); }
    // === 07b: HELPER FUNCTIONS - LOGGING END ===

    // === 08: UI UPDATE FUNCTIONS START ===
    function renderPlayerList() { /* ... */ playerListUl.innerHTML = ''; eliminatedPlayerListUl.innerHTML = ''; const cln = state.live.currentLevelIndex + 1; const rbA = state.config.type === 'rebuy' && cln <= state.config.rebuyLevels; const adA = state.config.type === 'rebuy' && cln > state.config.rebuyLevels; const canEdit = state.live.status !== 'finished'; state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table).forEach(p => { const li = document.createElement('li'); let i = `${p.name} <span class="player-details">(B${p.table} S${p.seat})</span>`; if (p.rebuys > 0) i += ` <span class="player-details">[${p.rebuys}R]</span>`; if (p.addon) i += ` <span class="player-details">[A]</span>`; if (state.config.type === 'knockout' && p.knockouts > 0) i += ` <span class="player-details">(KOs: ${p.knockouts})</span>`; let a = ''; if (canEdit) { a += `<button class="btn-edit-player small-button" data-player-id="${p.id}" title="Rediger Navn">✏️</button>`; if (rbA) a += `<button class="btn-rebuy small-button" data-player-id="${p.id}" title="Rebuy">R</button>`; if (adA && !p.addon) a += `<button class="btn-addon small-button" data-player-id="${p.id}" title="Addon">A</button>`; a += `<button class="btn-eliminate small-button danger-button" data-player-id="${p.id}" title="Eliminer">X</button>`; } li.innerHTML = `<span class="item-name">${i}</span><div class="list-actions player-actions">${a}</div>`; playerListUl.appendChild(li); }); state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity)).forEach(p => { const li = document.createElement('li'); let e = `${p.place ?? '?'}. ${p.name}`; if (p.rebuys > 0) e += ` <span class="player-details">[${p.rebuys}R]</span>`; if (p.addon) e += ` <span class="player-details">[A]</span>`; if (state.config.type === 'knockout' && p.knockouts > 0) e += ` <span class="player-details">(KOs: ${p.knockouts})</span>`; if (p.eliminatedBy) e += ` <span class="player-details">(av ${getPlayerNameById(p.eliminatedBy)})</span>`; li.innerHTML = `<span class="item-name">${e}</span><div class="list-actions player-actions">${canEdit ? `<button class="btn-restore small-button warning-button" data-player-id="${p.id}" title="Gjenopprett">↩️</button>` : ''}</div>`; eliminatedPlayerListUl.appendChild(li); }); activePlayerCountSpan.textContent = state.live.players.length; eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length; playerListUl.querySelectorAll('.btn-edit-player').forEach(btn => btn.onclick = handleEditPlayer); playerListUl.querySelectorAll('.btn-rebuy').forEach(btn => btn.onclick = handleRebuy); playerListUl.querySelectorAll('.btn-addon').forEach(btn => btn.onclick = handleAddon); playerListUl.querySelectorAll('.btn-eliminate').forEach(btn => btn.onclick = handleEliminate); eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(btn => btn.onclick = handleRestore); }
    function displayPrizes() { /* ... */ if (!prizeDisplayLive || !totalPotPrizeSpan) return; const prizeData = calculatePrizes(); prizeDisplayLive.querySelector('h3').textContent = `Premiefordeling (Totalpott: ${state.live.totalPot.toLocaleString('nb-NO')} kr)`; const existingOl = prizeDisplayLive.querySelector('ol'); if(existingOl) existingOl.remove(); const existingP = prizeDisplayLive.querySelector('p'); if(existingP) existingP.remove(); if (prizeData.length > 0) { const ol = document.createElement('ol'); prizeData.forEach(p => { const li = document.createElement('li'); li.textContent = `${p.place}. Plass: ${p.amount.toLocaleString('nb-NO')} kr (${p.percentage}%)`; ol.appendChild(li); }); prizeDisplayLive.appendChild(ol); prizeDisplayLive.classList.remove('hidden'); } else { const p = document.createElement('p'); const pfp = state.live.totalPot - (state.config.type === 'knockout' ? state.live.totalEntries * (state.config.bountyAmount || 0) : 0); if (pfp > 0 && (!state.config.prizeDistribution || state.config.prizeDistribution.length !== state.config.paidPlaces)) { p.textContent = 'Premiefordeling ikke (korrekt) definert.'; } else { p.textContent = 'Ingen premiepott å fordele ennå.'; } prizeDisplayLive.appendChild(p); prizeDisplayLive.classList.add('hidden'); } }
    function updateUI() {
        if (!state || !state.config || !state.live) { console.error("State is missing or invalid in updateUI"); return; } // Early exit if state invalid
        nameDisplay.textContent = state.config.name; currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const cLI = state.live.currentLevelIndex; const cL = state.config.blindLevels?.[cLI];
        let nextBlindLevel = state.config.blindLevels?.[cLI + 1];
        const nextPauseInfo = findNextPauseInfo(); // Find info about the next pause

        currentLevelDisplay.textContent = `(Nivå ${cL ? cL.level : 'N/A'})`;
        nextBlindsDisplay.textContent = formatNextBlindsText(nextBlindLevel); // Always show next level

        if (state.live.isOnBreak) { timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak); blindsElement.classList.add('hidden'); breakInfo.classList.remove('hidden'); }
        else { timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); blindsElement.classList.remove('hidden'); breakInfo.classList.add('hidden'); blindsDisplay.innerHTML = formatBlindsHTML(cL); }

        // Update Info Box content visibility based on saved layout settings
        const layouts = loadElementLayouts(); // Load layout including info toggles
        for (const key in infoParagraphs) {
            if (infoParagraphs[key]) {
                 infoParagraphs[key].classList.toggle('hidden', !(layouts.info?.[key] ?? true));
            }
        }
        // Update Info Box dynamic content
        averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO');
        playersRemainingDisplay.textContent = state.live.players.length;
        totalEntriesDisplay.textContent = state.live.totalEntries;
        const cLN = cLI + 1; const lRO = cLN <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished';
        if (state.config.lateRegLevel > 0) { lateRegStatusDisplay.textContent = `${lRO ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`; } else { lateRegStatusDisplay.textContent = 'N/A'; }
        if (infoParagraphs.showNextPause) { // Update next pause info
            const nextPauseTimeSpan = document.getElementById('next-pause-time');
            if (nextPauseTimeSpan) {
                if (nextPauseInfo) {
                    nextPauseTimeSpan.textContent = `Etter nivå ${nextPauseInfo.level} (${nextPauseInfo.duration} min)`;
                    infoParagraphs.showNextPause.classList.remove('hidden'); // Make sure the <p> is visible if toggled on
                } else {
                     nextPauseTimeSpan.textContent = 'Ingen flere';
                      // Optionally hide the entire "Neste Pause" line if toggled on but no pauses left
                     // infoParagraphs.showNextPause.classList.add('hidden');
                }
            }
        }


        lateRegButton.disabled = !lRO || state.live.status !== 'running';
        startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke'; startPauseButton.disabled = state.live.status === 'finished';
        prevLevelButton.disabled = cLI <= 0 || state.live.status === 'finished'; nextLevelButton.disabled = cLI >= state.config.blindLevels.length - 1 || state.live.status === 'finished';
        adjustTimeMinusButton.disabled = state.live.status === 'finished'; adjustTimePlusButton.disabled = state.live.status === 'finished';
        btnEditTournamentSettings.disabled = state.live.status === 'finished'; btnEditUiSettings.disabled = false; /* Always allow UI edit? */ endTournamentButton.disabled = state.live.status === 'finished';
        renderPlayerList(); displayPrizes(); renderActivityLog();
     }
    // === 08: UI UPDATE FUNCTIONS END ===

    // === 09: TIMER LOGIC START ===
    function tick() { /* ... */ if(state.live.status!=='running')return; if(state.live.isOnBreak){state.live.timeRemainingInBreak--; timerDisplay.textContent=formatTime(state.live.timeRemainingInBreak); if(state.live.timeRemainingInBreak<0){state.live.isOnBreak=false; state.live.currentLevelIndex++; if(state.live.currentLevelIndex>=state.config.blindLevels.length){finishTournament();return;} const nl=state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel=nl.duration*60; logActivity(state.live.activityLog,`Pause over. Nivå ${nl.level} starter.`); updateUI(); saveTournamentState(currentTournamentId,state);} else if(state.live.timeRemainingInBreak%15===0){saveTournamentState(currentTournamentId,state);}} else{state.live.timeRemainingInLevel--; timerDisplay.textContent=formatTime(state.live.timeRemainingInLevel); if(state.live.timeRemainingInLevel<0){const cl=state.config.blindLevels[state.live.currentLevelIndex]; const pm=cl?.pauseMinutes||0; if(pm>0){state.live.isOnBreak=true; state.live.timeRemainingInBreak=pm*60; logActivity(state.live.activityLog,`Nivå ${cl.level} ferdig. Starter ${pm} min pause.`); updateUI(); saveTournamentState(currentTournamentId,state);} else{state.live.currentLevelIndex++; if(state.live.currentLevelIndex>=state.config.blindLevels.length){finishTournament();return;} const nl=state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel=nl.duration*60; logActivity(state.live.activityLog,`Nivå ${nl.level} starter.`); updateUI(); saveTournamentState(currentTournamentId,state);}} else if(state.live.timeRemainingInLevel>0&&state.live.timeRemainingInLevel%30===0){saveTournamentState(currentTournamentId,state);}}}
    function startRealTimeClock() { /* ... */ if (realTimeInterval) clearInterval(realTimeInterval); realTimeInterval = setInterval(() => { if(currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }, 1000); }
    // === 09: TIMER LOGIC END ===

    // === 10: EVENT HANDLERS - CONTROLS START ===
    function handleStartPause() { /* ... */ if(state.live.status==='finished')return; if(state.live.status==='paused'){state.live.status='running'; if(!timerInterval)timerInterval=setInterval(tick,1000); logActivity(state.live.activityLog,"Klokke startet.");} else{state.live.status='paused'; logActivity(state.live.activityLog,"Klokke pauset."); saveTournamentState(currentTournamentId,state);} updateUI();}
    function handleAdjustTime(deltaSeconds) { /* ... */ if(state.live.status==='finished')return; let target=state.live.isOnBreak?'timeRemainingInBreak':'timeRemainingInLevel'; let limit=state.live.isOnBreak?Infinity:(state.config.blindLevels[state.live.currentLevelIndex]?.duration*60); state.live[target]+=deltaSeconds; state.live[target]=Math.max(0,state.live[target]); if(limit!==undefined)state.live[target]=Math.min(limit,state.live[target]); logActivity(state.live.activityLog,`Tid justert ${deltaSeconds>0?'+':''}${deltaSeconds/60} min.`); updateUI(); saveTournamentState(currentTournamentId,state);}
    function handleAdjustLevel(deltaIndex) { /* ... */ if(state.live.status==='finished')return; const newIndex=state.live.currentLevelIndex+deltaIndex; if(newIndex>=0&&newIndex<state.config.blindLevels.length){const oldLevelNum=state.config.blindLevels[state.live.currentLevelIndex]?.level||'?'; const newLevel=state.config.blindLevels[newIndex]; state.live.currentLevelIndex=newIndex; state.live.timeRemainingInLevel=newLevel.duration*60; state.live.isOnBreak=false; state.live.timeRemainingInBreak=0; logActivity(state.live.activityLog,`Nivå manuelt endret: ${oldLevelNum} -> ${newLevel.level}.`); updateUI(); saveTournamentState(currentTournamentId,state);} else{console.warn("Cannot adjust level.");}}
    function handleEndTournament() { /* ... */ if(state.live.status==='finished'){alert("Turneringen er allerede fullført.");return;} if(confirm("Markere turneringen som fullført?"))finishTournament();}
    function handleForceSave() { /* ... */ if(state){if(saveTournamentState(currentTournamentId,state)){btnForceSave.textContent="Lagret!"; setTimeout(()=>{btnForceSave.textContent="Lagre Nå";},1500);}else{alert("Lagring feilet!");}}}
    function handleBackToMain() { /* ... */ if(state&&state.live.status!=='finished')saveTournamentState(currentTournamentId,state); window.location.href='index.html';}
    // === 10: EVENT HANDLERS - CONTROLS END ===

// === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    function handleRebuy(event){
        const playerId = parseInt(event.target.dataset.playerId);
        const player = state.live.players.find(pl => pl.id === playerId);
        const currentLevelNum = state.live.currentLevelIndex + 1;

        // Validation
        if (!player) { console.error("Rebuy failed: Player not found", playerId); return; }
        if (state.config.type !== 'rebuy') { alert("Re-buy er ikke tilgjengelig for denne turneringstypen."); return; }
        if (!(currentLevelNum <= state.config.rebuyLevels)) { alert(`Re-buy er kun tilgjengelig t.o.m. nivå ${state.config.rebuyLevels}. Nåværende nivå: ${currentLevelNum}.`); return; }
        if (state.live.status === 'finished') { alert("Kan ikke utføre handlinger i en fullført turnering."); return; }

        // Confirmation
        if (confirm(`Re-buy (${state.config.rebuyCost} kr / ${state.config.rebuyChips} sjetonger) for ${player.name}?`)) {
            player.rebuys = (player.rebuys || 0) + 1;
            state.live.totalPot += state.config.rebuyCost;
            state.live.totalEntries++; // Rebuy counts as an entry for prize pool calculation
            state.live.totalRebuys++;
            logActivity(state.live.activityLog, `${player.name} tok Re-buy (+${state.config.rebuyChips} chips, +${state.config.rebuyCost} kr).`);
            updateUI(); // Update counts, pot, avg stack etc.
            saveTournamentState(currentTournamentId, state);
        }
    }

    function handleAddon(event){
        const playerId = parseInt(event.target.dataset.playerId);
        const player = state.live.players.find(pl => pl.id === playerId);
        const currentLevelNum = state.live.currentLevelIndex + 1;
        const isAddonPeriod = currentLevelNum > state.config.rebuyLevels; // Addon typically after rebuy period

        // Validation
        if (!player) { console.error("Addon failed: Player not found", playerId); return; }
        if (state.config.type !== 'rebuy') { alert("Add-on er ikke tilgjengelig for denne turneringstypen."); return; }
        if (!isAddonPeriod) { alert(`Add-on er vanligvis tilgjengelig ETTER re-buy perioden (etter nivå ${state.config.rebuyLevels}). Nåværende nivå: ${currentLevelNum}.`); return; }
        if (player.addon) { alert(`${player.name} har allerede tatt Add-on.`); return; }
        if (state.live.status === 'finished') { alert("Kan ikke utføre handlinger i en fullført turnering."); return; }
        // Optional: Add check if tournament clock must be paused for addon? Usually done during first break after rebuy period.

        // Confirmation
        if (confirm(`Add-on (${state.config.addonCost} kr / ${state.config.addonChips} sjetonger) for ${player.name}?`)) {
            player.addon = true;
            state.live.totalPot += state.config.addonCost;
            state.live.totalAddons++;
            // Note: Addon does NOT usually increase totalEntries count, only totalPot and chips
            logActivity(state.live.activityLog, `${player.name} tok Add-on (+${state.config.addonChips} chips, +${state.config.addonCost} kr).`);
            updateUI(); // Update counts, pot, avg stack etc.
            saveTournamentState(currentTournamentId, state);
        }
    }

    function handleEliminate(event){
        if(state.live.status==='finished') return;

        const playerIdToEliminate = parseInt(event.target.dataset.playerId);
        const activePlayers = state.live.players;
        const playerIndex = activePlayers.findIndex(p => p.id === playerIdToEliminate);

        if(playerIndex === -1) {
            console.error("Player to eliminate not found in active list:", playerIdToEliminate);
            return; // Player not found
        }

        // Check if trying to eliminate the last player
        if (activePlayers.length <= 1) {
            alert("Kan ikke eliminere siste spiller. Fullfør turneringen for å kåre vinner.");
            console.warn("Attempted to eliminate the last remaining player.");
            return; // Prevent elimination
        }

        const player = activePlayers[playerIndex]; // The player to be eliminated

        // --- Knockout Logic ---
        let potentialEliminatorId = null; // Store selected KO player ID here

        // Check if it's a KO tournament with a bounty and more than one player left
        if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) {
            const potentialAssigners = activePlayers.filter(p => p.id !== playerIdToEliminate);

            // --- Create Temporary Dialog ---
            const dialogOverlay = document.createElement('div');
            dialogOverlay.style.position = 'fixed';
            dialogOverlay.style.top = '0';
            dialogOverlay.style.left = '0';
            dialogOverlay.style.width = '100%';
            dialogOverlay.style.height = '100%';
            dialogOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            dialogOverlay.style.display = 'flex';
            dialogOverlay.style.justifyContent = 'center';
            dialogOverlay.style.alignItems = 'center';
            dialogOverlay.style.zIndex = '200'; // Above modals

            const dialogBox = document.createElement('div');
            dialogBox.style.background = '#fff';
            dialogBox.style.color = '#333';
            dialogBox.style.padding = '25px';
            dialogBox.style.borderRadius = '5px';
            dialogBox.style.textAlign = 'center';
            dialogBox.style.maxWidth = '400px';
            dialogBox.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';

            dialogBox.innerHTML = `
                <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">Hvem slo ut ${player.name}?</h3>
                <select id="ko-assigner-select" style="padding: 8px; margin: 10px 0 20px 0; min-width: 250px; max-width: 100%; border: 1px solid #ccc; border-radius: 4px; font-size: 1em;">
                    <option value="">-- Velg spiller --</option>
                    <option value="none">Ingen KO / Feil / Annet</option>
                    ${potentialAssigners.map(p =>
                        `<option value="${p.id}">${p.name} (B${p.table}S${p.seat})</option>`
                    ).join('')}
                </select>
                <div>
                    <button id="ko-confirm-btn" class="success-button" style="margin-right: 10px; padding: 8px 15px; font-size: 0.95em;">Bekreft Eliminering</button>
                    <button id="ko-cancel-btn" style="padding: 8px 15px; font-size: 0.95em;">Avbryt</button>
                </div>
            `;

            dialogOverlay.appendChild(dialogBox);
            document.body.appendChild(dialogOverlay);

            // --- Dialog Button Handlers ---
            const confirmBtn = document.getElementById('ko-confirm-btn');
            const cancelBtn = document.getElementById('ko-cancel-btn');
            const selectElement = document.getElementById('ko-assigner-select');

            // Function to close the dialog
            const closeKoDialog = () => {
                if (document.body.contains(dialogOverlay)) {
                    document.body.removeChild(dialogOverlay);
                }
            }

            confirmBtn.onclick = () => {
                const selectedValue = selectElement.value;
                if (!selectedValue || selectedValue === "") {
                     alert("Vennligst velg en spiller eller 'Ingen KO'.");
                     return; // Don't close dialog yet
                }
                if (selectedValue === "none") {
                    potentialEliminatorId = null; // Explicitly null if "Ingen KO"
                } else {
                    potentialEliminatorId = parseInt(selectedValue);
                }
                closeKoDialog();
                proceedWithElimination(); // Call the next step
            };

            cancelBtn.onclick = () => {
                closeKoDialog();
                console.log("Elimination cancelled by user during KO selection.");
                // Do not proceed
            };

            // Close on overlay click (optional)
            dialogOverlay.onclick = (e) => {
                 if (e.target === dialogOverlay) {
                      //closeKoDialog(); // Allow closing on overlay click
                      //console.log("Elimination cancelled by clicking overlay.");
                 }
            };
            // --- End Temporary Dialog ---

        } else {
            // Not a KO tournament (or no bounty), proceed directly
            potentialEliminatorId = null; // Ensure it's null if not KO
            proceedWithElimination();
        }

        // --- Function to handle the actual elimination after KO is decided ---
        function proceedWithElimination() {
            let eliminatorName = null;
            let eliminatorObject = null;

            // Find eliminator object if an ID was selected
            if (potentialEliminatorId !== null) {
                 eliminatorObject = activePlayers.find(p => p.id === potentialEliminatorId);
                 if (eliminatorObject) {
                     eliminatorName = eliminatorObject.name;
                 } else {
                      console.warn("Selected eliminator ID not found in active players:", potentialEliminatorId, " Maybe eliminated during dialog?");
                      potentialEliminatorId = null; // Reset if object not found
                 }
            }

            // Final confirmation before state change
            const confirmMsg = `Eliminere ${player.name}?` + (eliminatorName ? ` (KO tildeles ${eliminatorName})` : '');

            if (confirm(confirmMsg)) {
                // Update the player being eliminated
                player.eliminated = true;
                player.eliminatedBy = potentialEliminatorId; // Use the stored ID (null if none)
                player.place = activePlayers.length; // Place is current number of active players

                // Update the eliminator player (if one was selected and found)
                if (eliminatorObject) {
                    eliminatorObject.knockouts = (eliminatorObject.knockouts || 0) + 1;
                    state.live.knockoutLog.push({
                         eliminatedPlayerId: player.id,
                         eliminatedByPlayerId: eliminatorObject.id,
                         level: state.live.currentLevelIndex + 1,
                         timestamp: new Date().toISOString()
                    });
                     console.log(`Knockout recorded: ${eliminatorObject.name} eliminated ${player.name}`);
                }

                // Move player from active to eliminated list
                state.live.eliminatedPlayers.push(player);
                activePlayers.splice(playerIndex, 1); // Remove from active list

                // Log the activity
                const eliminationLogText = eliminatorName ? ` av ${eliminatorName}` : '';
                logActivity(state.live.activityLog, `${player.name} slått ut (${player.place}. plass${eliminationLogText}).`);
                console.log(`Player ${player.name} eliminated. ${activePlayers.length} players remaining.`);

                // Check for table breaks/balancing and update UI/save
                // checkAndHandleTableBreak now handles balancing and saving internally if needed
                const structureChanged = checkAndHandleTableBreak();

                // If structure didn't change (no break/balance), we still need to update UI and save
                if (!structureChanged) {
                    updateUI();
                    saveTournamentState(currentTournamentId, state);
                }

                // Check if tournament is finished (last player standing)
                if (state.live.players.length <= 1) {
                     console.log("Only one player remaining, finishing tournament...");
                    finishTournament();
                }
            } else {
                 console.log("Elimination cancelled by user confirmation.");
            }
        } // --- End proceedWithElimination ---
    } // --- End handleEliminate ---


    function handleRestore(event){
        if(state.live.status==='finished'){ alert("Kan ikke gjenopprette spillere i en fullført turnering."); return; }

        const playerId = parseInt(event.target.dataset.playerId);
        const eliminatedIndex = state.live.eliminatedPlayers.findIndex(p => p.id === playerId);

        if (eliminatedIndex === -1) {
            console.error("Player to restore not found in eliminated list:", playerId);
            return;
        }

        const player = state.live.eliminatedPlayers[eliminatedIndex];
        const oldPlace = player.place; // Store old place for logging

        if (confirm(`Gjenopprette ${player.name} (var ${oldPlace}. plass)?`)) {
            const eliminatorId = player.eliminatedBy; // ID of player who got the KO bounty

            // Reset player state
            player.eliminated = false;
            player.eliminatedBy = null;
            player.place = null;

            // Move player back to active list
            state.live.eliminatedPlayers.splice(eliminatedIndex, 1);
            state.live.players.push(player);

            // Reverse Knockout (if applicable)
            if (state.config.type === 'knockout' && eliminatorId) {
                 // Find the player who got the KO (could be active or already eliminated now)
                let eliminator = state.live.players.find(p => p.id === eliminatorId) || state.live.eliminatedPlayers.find(p => p.id === eliminatorId);
                if (eliminator && eliminator.knockouts > 0) {
                    eliminator.knockouts--;
                    console.log(`Knockout reversed for ${eliminator.name}.`);
                    // Remove the corresponding entry from knockoutLog
                    const logIndex = state.live.knockoutLog.findIndex(log => log.eliminatedPlayerId === player.id && log.eliminatedByPlayerId === eliminatorId);
                    if (logIndex > -1) {
                        state.live.knockoutLog.splice(logIndex, 1);
                        console.log("Knockout log entry removed.");
                    }
                } else {
                     console.warn("Could not find player who got KO or their KO count was already 0:", eliminatorId);
                }
            }

            // Assign a new table and seat
            assignTableSeat(player); // Let the function find the best spot

            logActivity(state.live.activityLog, `${player.name} gjenopprettet fra ${oldPlace}. plass (nå B${player.table}S${player.seat}).`);

            // Check for table breaks/balancing
             const structureChanged = checkAndHandleTableBreak();
             if (!structureChanged) {
                 updateUI();
                 saveTournamentState(currentTournamentId, state);
             }
        }
    }

    function handleEditPlayer(event){
        if(state.live.status === 'finished') { alert("Kan ikke redigere spillere i en fullført turnering."); return; }

        const playerId = parseInt(event.target.dataset.playerId);
        // Look for player in active list first, then eliminated (though usually only active are editable this way)
        const player = state.live.players.find(pl => pl.id === playerId) || state.live.eliminatedPlayers.find(pl => pl.id === playerId);

        if (!player) {
            console.error("Player to edit not found:", playerId);
            return;
        }

        const oldName = player.name;
        const newName = prompt(`Endre navn for ${oldName}:`, oldName);

        if (newName && newName.trim().length > 0 && newName.trim() !== oldName) {
            player.name = newName.trim();
            logActivity(state.live.activityLog, `Navn endret: ${oldName} -> ${player.name}.`);
            renderPlayerList(); // Only need to re-render player lists for name change
            saveTournamentState(currentTournamentId, state); // Save the change
        } else if (newName !== null && newName.trim().length === 0) {
            alert("Navn kan ikke være tomt.");
        } else {
             console.log("Player name edit cancelled or no change made.");
        }
    }

    function handleLateRegClick() {
        if (state.live.status === 'finished') { alert("Kan ikke registrere spillere i en fullført turnering."); return; }

        const currentLevelNum = state.live.currentLevelIndex + 1;
        const lateRegOpen = currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0;

        if (!lateRegOpen) {
             const reason = state.config.lateRegLevel > 0 ? `stengte etter nivå ${state.config.lateRegLevel}` : "er ikke aktivert for denne turneringen";
            alert(`Sen registrering ${reason}. Nåværende nivå: ${currentLevelNum}.`);
            return;
        }

        // Optional: Check if clock is running? Some TDs prefer paused clock for new entries.
        // if (state.live.status !== 'running') { alert("Start klokken før du legger til spillere via Late Reg."); return; }

        const name = prompt("Navn for spiller (Late Reg):");

        if (name && name.trim().length > 0) {
            const newPlayer = {
                id: generateUniqueId('p'), // Ensure unique ID from storage.js
                name: name.trim(),
                stack: state.config.startStack, // Give starting stack
                table: 0, // Will be assigned
                seat: 0,  // Will be assigned
                rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0
            };

            // Assign table and seat
            assignTableSeat(newPlayer);

            // Add player to active list
            state.live.players.push(newPlayer);

            // Update tournament state
            state.live.totalPot += state.config.buyIn;
            state.live.totalEntries++;

            logActivity(state.live.activityLog, `${newPlayer.name} registrert (Late Reg, B${newPlayer.table}S${newPlayer.seat}).`);

            // Sort player list after adding
            state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);

            // Check for table breaks/balancing
            const structureChanged = checkAndHandleTableBreak();
            if (!structureChanged) {
                updateUI();
                saveTournamentState(currentTournamentId, state);
            }
        } else if (name !== null) {
            alert("Navn kan ikke være tomt.");
        } else {
             console.log("Late registration cancelled.");
        }
    }
// === 11: EVENT HANDLERS - PLAYER ACTIONS END ===

// === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    function openTournamentModal() {
        if (state.live.status === 'finished' || isModalOpen) return;
        console.log("Opening tournament settings modal");

        // Populate Blinds Table
        editBlindStructureBody.innerHTML = '';
        editBlindLevelCounter = 0; // Reset counter
        state.config.blindLevels.forEach(level => addEditBlindLevelRow(level)); // Add rows based on current state
        updateEditLevelNumbers(); // Ensure numbers are sequential

        // Populate Prizes
        editPaidPlacesInput.value = state.config.paidPlaces;
        editPrizeDistTextarea.value = state.config.prizeDistribution.join(', ');

        tournamentSettingsModal.classList.remove('hidden');
        isModalOpen = true;
        currentOpenModal = tournamentSettingsModal; // Track open modal
    }

    function closeTournamentModal() {
        tournamentSettingsModal.classList.add('hidden');
        isModalOpen = false;
        currentOpenModal = null;
        // Optional: Revert any temporary visual changes if needed, though save handles persistence
    }

    function openUiModal() {
        if (isModalOpen) return; // Don't open if another modal is already open
        console.log("Opening UI settings modal");

        // Store original settings to revert on cancel
        originalThemeBg = loadThemeBgColor();
        originalThemeText = loadThemeTextColor();
        originalElementLayouts = loadElementLayouts();

        // --- Populate Color Pickers (RGB & HSL) ---
        const [bgR, bgG, bgB] = parseRgbString(originalThemeBg);
        const bgHSL = rgbToHsl(bgR, bgG, bgB);
        blockSliderUpdates=true; // Prevent infinite loops during setup
        // BG RGB
        bgRedSlider.value = bgRedInput.value = bgR;
        bgGreenSlider.value = bgGreenInput.value = bgG;
        bgBlueSlider.value = bgBlueInput.value = bgB;
        // BG HSL
        bgHueSlider.value = bgHueInput.value = bgHSL.h;
        bgSatSlider.value = bgSatInput.value = bgHSL.s;
        bgLigSlider.value = bgLigInput.value = bgHSL.l;

        const [textR, textG, textB] = parseRgbString(originalThemeText);
        const textHSL = rgbToHsl(textR, textG, textB);
        // Text RGB
        textRedSlider.value = textRedInput.value = textR;
        textGreenSlider.value = textGreenInput.value = textG;
        textBlueSlider.value = textBlueInput.value = textB;
        // Text HSL
        textHueSlider.value = textHueInput.value = textHSL.h;
        textSatSlider.value = textSatInput.value = textHSL.s;
        textLigSlider.value = textLigInput.value = textHSL.l;
        blockSliderUpdates=false; // Enable updates again

        // --- Populate Layout Controls ---
        // Ensure originalElementLayouts has defaults merged in loadElementLayouts()
        canvasHeightInput.value = canvasHeightSlider.value = originalElementLayouts.canvas.height;
        timerXInput.value = timerXSlider.value = originalElementLayouts.timer.x;
        timerYInput.value = timerYSlider.value = originalElementLayouts.timer.y;
        timerWidthInput.value = timerWidthSlider.value = originalElementLayouts.timer.width;
        timerFontSizeInput.value = timerFontSizeSlider.value = originalElementLayouts.timer.fontSize;
        blindsXInput.value = blindsXSlider.value = originalElementLayouts.blinds.x;
        blindsYInput.value = blindsYSlider.value = originalElementLayouts.blinds.y;
        blindsWidthInput.value = blindsWidthSlider.value = originalElementLayouts.blinds.width;
        blindsFontSizeInput.value = blindsFontSizeSlider.value = originalElementLayouts.blinds.fontSize;
        logoXInput.value = logoXSlider.value = originalElementLayouts.logo.x;
        logoYInput.value = logoYSlider.value = originalElementLayouts.logo.y;
        logoWidthInput.value = logoWidthSlider.value = originalElementLayouts.logo.width;
        logoHeightInput.value = logoHeightSlider.value = originalElementLayouts.logo.height;
        infoXInput.value = infoXSlider.value = originalElementLayouts.info.x;
        infoYInput.value = infoYSlider.value = originalElementLayouts.info.y;
        infoWidthInput.value = infoWidthSlider.value = originalElementLayouts.info.width;
        infoFontSizeInput.value = infoFontSizeSlider.value = originalElementLayouts.info.fontSize;

        // --- Populate Info Toggles ---
        for (const key in infoParagraphs) {
            const checkboxId = `toggleInfo${key.substring(4)}`; // e.g., toggleInfoNextBlinds
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                 // Use value from loaded layout, fallback to default (true) if missing
                 checkbox.checked = originalElementLayouts.info[key] ?? true;
             } else {
                  console.warn(`Checkbox with ID ${checkboxId} not found for info toggle.`);
             }
        }


        // --- Populate Theme Favorites ---
        populateThemeFavorites();

        // --- Update Previews & Add Listeners ---
        updateColorAndLayoutPreviews(); // Show initial state based on loaded values
        addThemeAndLayoutListeners(); // Add listeners for interactive controls

        uiSettingsModal.classList.remove('hidden');
        isModalOpen = true;
        currentOpenModal = uiSettingsModal; // Track open modal
    }

    function closeUiModal(revert = false) {
        if (revert) {
            // Revert to original values if cancelled
             console.log("Reverting UI changes on cancel.");
            applyThemeAndLayout(originalThemeBg, originalThemeText, originalElementLayouts);
        }
        removeThemeAndLayoutListeners(); // Remove listeners to prevent updates when closed
        uiSettingsModal.classList.add('hidden');
        isModalOpen = false;
        currentOpenModal = null;
    }

    function addEditBlindLevelRow(levelData={}){
        editBlindLevelCounter++;
        const row=editBlindStructureBody.insertRow();
        row.dataset.levelNumber=editBlindLevelCounter;
        const sb=levelData.sb??'';
        const bb=levelData.bb??'';
        const ante=levelData.ante??0;
        const duration=levelData.duration??(state.config.blindLevels?.[0]?.duration||20);
        const pauseMinutes=levelData.pauseMinutes??0;
        // Check if this level is in the past (cannot be edited)
        // Level index is 0-based, levelData.level is 1-based
        const isPastLevel = levelData.level <= state.live.currentLevelIndex && !state.live.isOnBreak;

        const disabledAttr = isPastLevel ? 'disabled' : '';
        // ENDRET: step="1" for sb, bb, ante
        row.innerHTML=`
            <td><span class="level-number">${editBlindLevelCounter}</span> ${isPastLevel?'<small>(Låst)</small>':''}</td>
            <td><input type="number" class="sb-input" value="${sb}" min="0" step="1" ${disabledAttr}></td>
            <td><input type="number" class="bb-input" value="${bb}" min="0" step="1" ${disabledAttr}></td>
            <td><input type="number" class="ante-input" value="${ante}" min="0" step="1" ${disabledAttr}></td>
            <td><input type="number" class="duration-input" value="${duration}" min="1" ${disabledAttr}></td>
            <td><input type="number" class="pause-duration-input" value="${pauseMinutes}" min="0" ${disabledAttr}></td>
            <td><button type="button" class="btn-remove-level" title="Fjern nivå ${editBlindLevelCounter}" ${disabledAttr}>X</button></td>`;

        const removeBtn=row.querySelector('.btn-remove-level');

        if(!isPastLevel){
            removeBtn.onclick=()=>{row.remove(); updateEditLevelNumbers();};
        } else {
            row.querySelectorAll('input').forEach(inp=>inp.disabled=true);
            removeBtn.disabled=true;
        }
    }

    function updateEditLevelNumbers(){
        const rows=editBlindStructureBody.querySelectorAll('tr');
        rows.forEach((row,index)=>{
            const levelNum=index+1;
            row.dataset.levelNumber=levelNum;
            row.querySelector('.level-number').textContent=levelNum;
            const removeBtn = row.querySelector('.btn-remove-level');
            if (removeBtn) removeBtn.title=`Fjern nivå ${levelNum}`;
        });
        editBlindLevelCounter=rows.length;
    }

    function generateEditPayout(){
        const places = parseInt(editPaidPlacesInput.value) || 0;
        if (places > 0 && standardPayouts[places]) {
            editPrizeDistTextarea.value = standardPayouts[places].join(', ');
        } else {
            editPrizeDistTextarea.value = ''; // Clear if invalid places or no standard payout
        }
    }

    // --- Color Conversion/Sync ---
    function syncRgbFromHsl(typePrefix) {
        if(blockSliderUpdates) return; // Prevent loops
        const h=parseInt(document.getElementById(`${typePrefix}HueInput`).value);
        const s=parseInt(document.getElementById(`${typePrefix}SatInput`).value);
        const l=parseInt(document.getElementById(`${typePrefix}LigInput`).value);
        const rgbString=hslToRgb(h,s,l);
        const [r,g,b]=parseRgbString(rgbString);
        blockSliderUpdates=true; // Prevent HSL sync from re-triggering RGB sync
        document.getElementById(`${typePrefix}RedSlider`).value=document.getElementById(`${typePrefix}RedInput`).value=r;
        document.getElementById(`${typePrefix}GreenSlider`).value=document.getElementById(`${typePrefix}GreenInput`).value=g;
        document.getElementById(`${typePrefix}BlueSlider`).value=document.getElementById(`${typePrefix}BlueInput`).value=b;
        blockSliderUpdates=false;
        return rgbString; // Return the calculated RGB string
    }

    function syncHslFromRgb(typePrefix) {
         if(blockSliderUpdates) return; // Prevent loops
        const r=parseInt(document.getElementById(`${typePrefix}RedInput`).value);
        const g=parseInt(document.getElementById(`${typePrefix}GreenInput`).value);
        const b=parseInt(document.getElementById(`${typePrefix}BlueInput`).value);
        const hsl=rgbToHsl(r,g,b);
        blockSliderUpdates=true; // Prevent RGB sync from re-triggering HSL sync
        document.getElementById(`${typePrefix}HueSlider`).value=document.getElementById(`${typePrefix}HueInput`).value=hsl.h;
        document.getElementById(`${typePrefix}SatSlider`).value=document.getElementById(`${typePrefix}SatInput`).value=hsl.s;
        document.getElementById(`${typePrefix}LigSlider`).value=document.getElementById(`${typePrefix}LigInput`).value=hsl.l;
        blockSliderUpdates=false;
        return `rgb(${r}, ${g}, ${b})`; // Return the original RGB string
    }

    // --- Live Preview Update ---
     function updateColorAndLayoutPreviews() {
        if (!isModalOpen || currentOpenModal !== uiSettingsModal) return; // Only update if UI modal is open

        // Sync colors first
        const currentBgColor = syncHslFromRgb('bg');
        const currentTextColor = syncHslFromRgb('text');

        // Read layout values AFTER potential color sync
        const currentElementLayouts = {
            canvas: { height: parseInt(canvasHeightSlider.value) },
            timer: { x: parseInt(timerXSlider.value), y: parseInt(timerYSlider.value), width: parseInt(timerWidthSlider.value), fontSize: parseFloat(timerFontSizeSlider.value) },
            blinds: { x: parseInt(blindsXSlider.value), y: parseInt(blindsYSlider.value), width: parseInt(blindsWidthSlider.value), fontSize: parseFloat(blindsFontSizeSlider.value) },
            logo: { x: parseInt(logoXSlider.value), y: parseInt(logoYSlider.value), width: parseInt(logoWidthSlider.value), height: parseInt(logoHeightSlider.value) },
            info: { x: parseInt(infoXSlider.value), y: parseInt(infoYSlider.value), width: parseInt(infoWidthSlider.value), fontSize: parseFloat(infoFontSizeSlider.value),
                // Read toggle states directly
                showNextBlinds: toggleInfoNextBlinds.checked, showNextPause: toggleInfoNextPause.checked, showAvgStack: toggleInfoAvgStack.checked, showPlayers: toggleInfoPlayers.checked, showLateReg: toggleInfoLateReg.checked }
        };

        // Update visual previews within the modal
        if(bgColorPreview) bgColorPreview.style.backgroundColor = currentBgColor;
        if(textColorPreview) {
             textColorPreview.style.backgroundColor = currentBgColor;
             textColorPreview.querySelector('span').style.color = currentTextColor;
        }
        // Apply changes to the main page elements behind the modal
        applyThemeAndLayout(currentBgColor, currentTextColor, currentElementLayouts);
    }

    // --- Event Handlers for Sliders/Inputs/Toggles ---
    function handleThemeLayoutControlChange(e) {
        if (!isModalOpen || currentOpenModal !== uiSettingsModal) return; // Prevent updates if modal closed

        const target = e.target;
        const id = target.id;
        const isSlider = id.includes('Slider');
        const isInput = id.includes('Input');
        const isCheckbox = target.type === 'checkbox' && id.startsWith('toggleInfo');

        if (isSlider || isInput) {
            const baseId = isSlider ? id.replace('Slider', '') : id.replace('Input', '');
            const slider = document.getElementById(baseId + 'Slider');
            const input = document.getElementById(baseId + 'Input');

            // Validate and sync Slider/Input for numbers
            if (target.type === 'number' && input) {
                 let value = parseFloat(target.value);
                 const min = parseFloat(target.min || '0');
                 const max = parseFloat(target.max || '100'); // Adjust max as needed per control
                 const step = parseFloat(target.step || '1');
                 if (!isNaN(value)) {
                     value = Math.max(min, Math.min(max, value));
                     // Round to step if step is integer, otherwise allow decimals
                     target.value = (step % 1 === 0) ? Math.round(value) : value.toFixed(step.toString().split('.')[1]?.length || 1);
                     if (slider) slider.value = target.value;
                 } else {
                     // Handle non-numeric input? Maybe reset to min or previous valid?
                     // For now, just don't update slider if input is invalid
                 }
            } else if (isSlider && input) {
                 input.value = target.value; // Directly sync slider to input
            }

            // Handle color sync (HSL vs RGB) after updating value
            if (id.includes('Hue') || id.includes('Sat') || id.includes('Lig')) {
               syncRgbFromHsl(id.startsWith('bg') ? 'bg' : 'text');
            } else if (id.includes('Red') || id.includes('Green') || id.includes('Blue')) {
                syncHslFromRgb(id.startsWith('bg') ? 'bg' : 'text');
            }
        }
        // Update the main view based on the latest control states
        updateColorAndLayoutPreviews();
    }

    // References to ALL controls that trigger live updates
    const allSliders = [ canvasHeightSlider, timerXSlider, timerYSlider, timerWidthSlider, timerFontSizeSlider, blindsXSlider, blindsYSlider, blindsWidthSlider, blindsFontSizeSlider, logoXSlider, logoYSlider, logoWidthSlider, logoHeightSlider, infoXSlider, infoYSlider, infoWidthSlider, infoFontSizeSlider, bgHueSlider, bgSatSlider, bgLigSlider, bgRedSlider, bgGreenSlider, bgBlueSlider, textHueSlider, textSatSlider, textLigSlider, textRedSlider, textGreenSlider, textBlueSlider ];
    const allInputs = [ canvasHeightInput, timerXInput, timerYInput, timerWidthInput, timerFontSizeInput, blindsXInput, blindsYInput, blindsWidthInput, blindsFontSizeInput, logoXInput, logoYInput, logoWidthInput, logoHeightInput, infoXInput, infoYInput, infoWidthInput, infoFontSizeInput, bgHueInput, bgSatInput, bgLigInput, bgRedInput, bgGreenInput, bgBlueInput, textHueInput, textSatInput, textLigInput, textRedInput, textGreenInput, textBlueInput ];
    const infoToggles = [toggleInfoNextBlinds, toggleInfoNextPause, toggleInfoAvgStack, toggleInfoPlayers, toggleInfoLateReg];

    function addThemeAndLayoutListeners(){
        allSliders.forEach(el => el?.addEventListener('input', handleThemeLayoutControlChange));
        allInputs.forEach(el => el?.addEventListener('input', handleThemeLayoutControlChange)); // Use 'input' for live number updates
        infoToggles.forEach(el => el?.addEventListener('change', handleThemeLayoutControlChange));
        btnLoadThemeFavorite.addEventListener('click', handleLoadFavorite);
        btnSaveThemeFavorite.addEventListener('click', handleSaveFavorite);
        btnDeleteThemeFavorite.addEventListener('click', handleDeleteFavorite);
        themeFavoritesSelect.addEventListener('change', enableDisableDeleteButton);
    }

    function removeThemeAndLayoutListeners(){
        allSliders.forEach(el => el?.removeEventListener('input', handleThemeLayoutControlChange));
        allInputs.forEach(el => el?.removeEventListener('input', handleThemeLayoutControlChange));
        infoToggles.forEach(el => el?.removeEventListener('change', handleThemeLayoutControlChange));
        btnLoadThemeFavorite.removeEventListener('click', handleLoadFavorite);
        btnSaveThemeFavorite.removeEventListener('click', handleSaveFavorite);
        btnDeleteThemeFavorite.removeEventListener('click', handleDeleteFavorite);
        themeFavoritesSelect.removeEventListener('change', enableDisableDeleteButton);
    }

    // --- Theme Favorites Logic ---
    function populateThemeFavorites() {
        const favorites = loadThemeFavorites();
        themeFavoritesSelect.innerHTML = '<option value="">Velg favoritt...</option>';
        favorites.forEach(fav => {
            const option = document.createElement('option');
            option.value = fav.id;
            option.textContent = fav.name;
            themeFavoritesSelect.appendChild(option);
        });
        enableDisableDeleteButton(); // Update delete button state
    }

    function enableDisableDeleteButton(){
        btnDeleteThemeFavorite.disabled = !themeFavoritesSelect.value; // Disable if no favorite is selected
    }

    function handleLoadFavorite() {
        const selectedId = themeFavoritesSelect.value;
        if (!selectedId) return;
        const favorites = loadThemeFavorites();
        const fav = favorites.find(f => f.id === selectedId);
        if (fav) {
            console.log(`Loading favorite theme: ${fav.name}`);
            // Apply colors from favorite to sliders/inputs
             const [bgR, bgG, bgB] = parseRgbString(fav.bg);
             const bgHSL = rgbToHsl(bgR, bgG, bgB);
             const [textR, textG, textB] = parseRgbString(fav.text);
             const textHSL = rgbToHsl(textR, textG, textB);

             blockSliderUpdates = true;
             // BG
             bgRedSlider.value=bgRedInput.value=bgR; bgGreenSlider.value=bgGreenInput.value=bgG; bgBlueSlider.value=bgBlueInput.value=bgB;
             bgHueSlider.value=bgHueInput.value=bgHSL.h; bgSatSlider.value=bgSatInput.value=bgHSL.s; bgLigSlider.value=bgLigInput.value=bgHSL.l;
            // Text
             textRedSlider.value=textRedInput.value=textR; textGreenSlider.value=textGreenInput.value=textG; textBlueSlider.value=textBlueInput.value=textB;
             textHueSlider.value=textHueInput.value=textHSL.h; textSatSlider.value=textSatInput.value=textHSL.s; textLigSlider.value=textLigInput.value=textHSL.l;
             blockSliderUpdates = false;

             updateColorAndLayoutPreviews(); // Update live preview
            // Do NOT log this to tournament log, it's a UI preference
        }
    }

    function handleSaveFavorite() {
        const name = newThemeFavoriteNameInput.value.trim();
        if (!name) {
             alert("Vennligst skriv inn et navn for den nye favoritten.");
             newThemeFavoriteNameInput.focus();
             return;
        }
        // Get current colors directly from RGB inputs (as they are synced)
        const currentBgColor = `rgb(${bgRedInput.value}, ${bgGreenInput.value}, ${bgBlueInput.value})`;
        const currentTextColor = `rgb(${textRedInput.value}, ${textGreenInput.value}, ${textBlueInput.value})`;

        const savedFav = addThemeFavorite(name, currentBgColor, currentTextColor); // Save to storage
        newThemeFavoriteNameInput.value = ''; // Clear input field
        populateThemeFavorites(); // Refresh dropdown
        themeFavoritesSelect.value = savedFav.id; // Select the newly saved favorite
        enableDisableDeleteButton(); // Ensure delete button is enabled
        alert(`Tema '${savedFav.name}' lagret!`);
         console.log(`Theme favorite saved: ${savedFav.name}`, savedFav);
    }

    function handleDeleteFavorite() {
        const selectedId = themeFavoritesSelect.value;
        if (!selectedId) return; // Should be disabled, but check anyway
        const favorites = loadThemeFavorites();
        const fav = favorites.find(f => f.id === selectedId);
        if (fav && confirm(`Slette favorittema '${fav.name}'?`)) {
            deleteThemeFavorite(selectedId); // Delete from storage
            populateThemeFavorites(); // Refresh dropdown
            console.log(`Theme favorite deleted: ${fav.name} (${selectedId})`);
        }
    }

    // --- Save Handlers ---
    function handleSaveTournamentSettings(){
        console.log("Saving tournament rule edits...");
        let changesMade=false;
        let needsUIUpdate=false;
        const cLI=state.live.currentLevelIndex;
        let overallValid=true;
        const newBlindLevels=[];
        const editBlindRows=editBlindStructureBody.querySelectorAll('tr');
        let errorMessages = []; // Collect specific errors

        if(editBlindRows.length===0){
            alert("Minst ett nivå kreves.");
            return;
        }

        editBlindRows.forEach((row,index)=>{
            const levelNum=index+1;
            let rowValid=true;
            const sbInput=row.querySelector('.sb-input');
            const bbInput=row.querySelector('.bb-input');
            const anteInput=row.querySelector('.ante-input');
            const durationInput=row.querySelector('.duration-input');
            const pauseInput=row.querySelector('.pause-duration-input');

            // For past levels, read existing state values directly
            const isPastLevel = levelNum <= cLI && !state.live.isOnBreak; // Use levelNum (1-based) vs cLI (0-based)

            let sb, bb, ante, duration, pauseMinutes;

            if (isPastLevel) {
                 // Ensure we don't read from a non-existent index
                 if (index < state.config.blindLevels.length) {
                     const pastLevelData = state.config.blindLevels[index]; // Get original data
                     sb = pastLevelData.sb;
                     bb = pastLevelData.bb;
                     ante = pastLevelData.ante;
                     duration = pastLevelData.duration;
                     pauseMinutes = pastLevelData.pauseMinutes;
                 } else {
                      console.error(`Error accessing past level data for index ${index}`);
                      // Handle error case? Skip? Use default? Mark invalid?
                      rowValid = false; // Mark as invalid if original data missing
                 }

            } else {
                 // Read values from future/editable levels
                 sb=parseInt(sbInput.value);
                 bb=parseInt(bbInput.value);
                 ante=parseInt(anteInput.value)||0;
                 duration=parseInt(durationInput.value);
                 pauseMinutes=parseInt(pauseInput.value)||0;

                 [sbInput,bbInput,anteInput,durationInput,pauseInput].forEach(el=>el.classList.remove('invalid'));

                 if(isNaN(duration)||duration<=0){rowValid=false;durationInput.classList.add('invalid');}
                 if(isNaN(sb)||sb<0){rowValid=false;sbInput.classList.add('invalid');}
                 if(isNaN(bb)||bb<=0){rowValid=false;bbInput.classList.add('invalid');}
                 else if (sb > bb) { rowValid = false; sbInput.classList.add('invalid'); bbInput.classList.add('invalid'); errorMessages.push(`Nivå ${levelNum}: SB (${sb}) > BB (${bb})`); }
                 else if (bb > 0 && sb < 0) { rowValid = false; sbInput.classList.add('invalid'); }

                 if(isNaN(ante)||ante<0){rowValid=false;anteInput.classList.add('invalid');}
                 if(isNaN(pauseMinutes)||pauseMinutes<0){rowValid=false;pauseInput.classList.add('invalid');}
            }

            if(!rowValid) overallValid=false;
            // Add level data even if invalid, validation check happens later
            newBlindLevels.push({level:levelNum,sb:sb,bb:bb,ante:ante,duration:duration,pauseMinutes:pauseMinutes});
        });

        if(!overallValid){
             let alertMsg = "Ugyldige verdier i blindstruktur:\n\n- " + [...new Set(errorMessages)].join("\n- "); // Unique errors
             if (errorMessages.length === 0) {
                 alertMsg = "Ugyldige verdier i blindstruktur (sjekk markerte felt).";
             }
            alert(alertMsg);
            return;
        }

        // Compare with original blind levels (only future levels matter for change detection?)
         // Simple comparison: Compare entire structure string representations
        if(JSON.stringify(state.config.blindLevels)!==JSON.stringify(newBlindLevels)){
             // More robust check: only compare future levels? For now, simple check is ok.
            state.config.blindLevels=newBlindLevels;
            changesMade=true;
            needsUIUpdate=true; // Need to update display if current/next level changed
            logActivity(state.live.activityLog,"Blindstruktur endret.");
            console.log("Blinds structure changed and saved.", state.config.blindLevels);
        }

        // --- Prize Validation ---
        const newPaidPlaces=parseInt(editPaidPlacesInput.value);
        const newPrizeDist=editPrizeDistTextarea.value.split(',')
                            .map(p=>parseFloat(p.trim()))
                            .filter(p=>!isNaN(p)&&p>=0); // Allow 0% prizes

        let prizesValid=true;
        let prizeErrorMessages = [];

        if(isNaN(newPaidPlaces)||newPaidPlaces<=0){ prizesValid=false; prizeErrorMessages.push("Ugyldig antall betalte plasser (må være > 0)."); }
        else if(newPrizeDist.length!==newPaidPlaces){ prizesValid=false; prizeErrorMessages.push(`Antall premier (${newPrizeDist.length}) matcher ikke Antall Betalte (${newPaidPlaces}).`); }
        else { const sum=newPrizeDist.reduce((a,b)=>a+b,0); if(Math.abs(sum-100)>0.1){ prizesValid=false; prizeErrorMessages.push(`Premiesum (${sum.toFixed(1)}%) er ikke nøyaktig 100%.`); } }

        if (!prizesValid) { alert("Feil i premier:\n\n- " + prizeErrorMessages.join("\n- ")); return; }

        // Check if prize config actually changed
        if(state.config.paidPlaces!==newPaidPlaces || JSON.stringify(state.config.prizeDistribution)!==JSON.stringify(newPrizeDist)){
            const playersInMoney = state.live.eliminatedPlayers.filter(p => p.place && p.place <= state.config.paidPlaces).length;
             if (playersInMoney === 0 || confirm(`Advarsel: ${playersInMoney} spiller(e) er allerede i pengene basert på gammel struktur. Er du sikker på at du vil endre premiestrukturen?`)) {
                state.config.paidPlaces=newPaidPlaces;
                state.config.prizeDistribution=newPrizeDist;
                changesMade=true;
                needsUIUpdate=true; // Need to update prize display
                logActivity(state.live.activityLog,"Premiestruktur endret.");
                console.log("Prizes changed and saved", state.config.paidPlaces, state.config.prizeDistribution);
            } else {
                 console.log("Prize change cancelled by user.");
                 editPaidPlacesInput.value = state.config.paidPlaces; // Revert UI
                 editPrizeDistTextarea.value = state.config.prizeDistribution.join(', ');
                 return; // Stop save process
            }
        }

        // --- Final Save ---
        if(changesMade){
            if(saveTournamentState(currentTournamentId,state)){
                alert("Regelendringer lagret!");
                if(needsUIUpdate) updateUI();
                closeTournamentModal();
            } else {
                alert("Lagring av regelendringer feilet!");
            }
        } else {
            alert("Ingen regelendringer å lagre.");
            closeTournamentModal();
        }
    }

     function handleSaveUiSettings(){
         console.log("Saving UI settings...");
         let themeChanged = false;
         let layoutChanged = false;

        // --- Get final colors and layouts ---
        const finalBgColor=`rgb(${bgRedInput.value}, ${bgGreenInput.value}, ${bgBlueInput.value})`;
        const finalTextColor=`rgb(${textRedInput.value}, ${textGreenInput.value}, ${textBlueInput.value})`;
        const finalElementLayouts={
            canvas: {height: parseInt(canvasHeightInput.value)},
            timer: { x: parseInt(timerXInput.value), y: parseInt(timerYInput.value), width: parseInt(timerWidthInput.value), fontSize: parseFloat(timerFontSizeInput.value) },
            blinds: { x: parseInt(blindsXInput.value), y: parseInt(blindsYInput.value), width: parseInt(blindsWidthInput.value), fontSize: parseFloat(blindsFontSizeInput.value) },
            logo: { x: parseInt(logoXInput.value), y: parseInt(logoYInput.value), width: parseInt(logoWidthInput.value), height: parseInt(logoHeightInput.value) },
            info: { x: parseInt(infoXInput.value), y: parseInt(infoYInput.value), width: parseInt(infoWidthInput.value), fontSize: parseFloat(infoFontSizeInput.value),
                showNextBlinds: toggleInfoNextBlinds.checked, showNextPause: toggleInfoNextPause.checked, showAvgStack: toggleInfoAvgStack.checked, showPlayers: toggleInfoPlayers.checked, showLateReg: toggleInfoLateReg.checked }
         };

        // --- Check for changes and save ---
        if(finalBgColor !== originalThemeBg || finalTextColor !== originalThemeText){
            saveThemeBgColor(finalBgColor);
            saveThemeTextColor(finalTextColor);
            // Don't log UI pref changes to activity log
            console.log("Theme colors saved.");
            themeChanged = true;
        }
        if(JSON.stringify(finalElementLayouts) !== JSON.stringify(originalElementLayouts)){
             saveElementLayouts(finalElementLayouts);
             console.log("Element layouts saved.");
             layoutChanged = true;
        }

         // --- Finalize ---
         if(themeChanged || layoutChanged){
             applyThemeAndLayout(finalBgColor, finalTextColor, finalElementLayouts); // Ensure final state is applied
             alert("Utseende lagret!");
             closeUiModal(false); // Close without reverting
         } else {
             alert("Ingen utseendeendringer å lagre.");
             closeUiModal(false); // Close without reverting
         }
     }

     function handleResetLayoutTheme() {
         if (confirm("Tilbakestille layout og farger til standard?\nLagrede favoritter påvirkes ikke.")) {
             const defaultLayout = DEFAULT_ELEMENT_LAYOUTS; // From storage.js
             const defaultBg = DEFAULT_THEME_BG;      // From storage.js
             const defaultText = DEFAULT_THEME_TEXT;    // From storage.js

             console.log("Resetting UI to defaults.");

             // Apply defaults immediately for live preview behind modal
             applyThemeAndLayout(defaultBg, defaultText, defaultLayout);

             // --- Update sliders/inputs in the modal to reflect defaults ---
             blockSliderUpdates=true; // Prevent sync loops
             // Colors
             const [bgR, bgG, bgB] = parseRgbString(defaultBg); const bgHSL = rgbToHsl(bgR, bgG, bgB);
             bgRedSlider.value=bgRedInput.value=bgR; bgGreenSlider.value=bgGreenInput.value=bgG; bgBlueSlider.value=bgBlueInput.value=bgB;
             bgHueSlider.value=bgHueInput.value=bgHSL.h; bgSatSlider.value=bgSatInput.value=bgHSL.s; bgLigSlider.value=bgLigInput.value=bgHSL.l;
             const [textR, textG, textB] = parseRgbString(defaultText); const textHSL = rgbToHsl(textR, textG, textB);
             textRedSlider.value=textRedInput.value=textR; textGreenSlider.value=textGreenInput.value=textG; textBlueSlider.value=textBlueInput.value=textB;
             textHueSlider.value=textHueInput.value=textHSL.h; textSatSlider.value=textSatInput.value=textHSL.s; textLigSlider.value=textLigInput.value=textHSL.l;
             // Layout
             canvasHeightInput.value = canvasHeightSlider.value = defaultLayout.canvas.height;
             timerXInput.value = timerXSlider.value = defaultLayout.timer.x; timerYInput.value = timerYSlider.value = defaultLayout.timer.y; timerWidthInput.value = timerWidthSlider.value = defaultLayout.timer.width; timerFontSizeInput.value = timerFontSizeSlider.value = defaultLayout.timer.fontSize;
             blindsXInput.value = blindsXSlider.value = defaultLayout.blinds.x; blindsYInput.value = blindsYSlider.value = defaultLayout.blinds.y; blindsWidthInput.value = blindsWidthSlider.value = defaultLayout.blinds.width; blindsFontSizeInput.value = blindsFontSizeSlider.value = defaultLayout.blinds.fontSize;
             logoXInput.value = logoXSlider.value = defaultLayout.logo.x; logoYInput.value = logoYSlider.value = defaultLayout.logo.y; logoWidthInput.value = logoWidthSlider.value = defaultLayout.logo.width; logoHeightInput.value = logoHeightSlider.value = defaultLayout.logo.height;
             infoXInput.value = infoXSlider.value = defaultLayout.info.x; infoYInput.value = infoYSlider.value = defaultLayout.info.y; infoWidthInput.value = infoWidthSlider.value = defaultLayout.info.width; infoFontSizeInput.value = infoFontSizeSlider.value = defaultLayout.info.fontSize;
            // Info Toggles
             for (const key in infoParagraphs) {
                 const checkboxId = `toggleInfo${key.substring(4)}`;
                 const checkbox = document.getElementById(checkboxId);
                 if(checkbox) checkbox.checked = defaultLayout.info[key] ?? true;
             }
            blockSliderUpdates=false; // Re-enable updates

             // Update modal previews
             updateColorAndLayoutPreviews();
             alert("Layout og farger er tilbakestilt i redigeringsvinduet.\nTrykk 'Lagre Utseende' for å lagre endringen.")
             // Do not log this reset to the tournament activity log
         }
     }
// === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===

    // === 13: TOURNAMENT FINISH LOGIC START ===
    function finishTournament() { /* ... */ if(state.live.status==='finished')return; console.log("Finishing T..."); clearInterval(timerInterval); timerInterval=null; clearInterval(realTimeInterval); realTimeInterval=null; state.live.status='finished'; state.live.isOnBreak=false; if(state.live.players.length===1){const winner=state.live.players[0]; winner.place=1; state.live.eliminatedPlayers.push(winner); state.live.players.splice(0,1); logActivity(state.live.activityLog,`Vinner: ${winner.name}!`);} else if(state.live.players.length===0){logActivity(state.live.activityLog,`Turnering fullført (ingen aktive).`);} else{logActivity(state.live.activityLog,`Turnering fullført (${state.live.players.length} igjen - Chop?).`);} state.live.eliminatedPlayers.sort((a,b)=>(a.place??Infinity)-(b.place??Infinity)); console.log("Tournament finished!"); updateUI(); saveTournamentState(currentTournamentId,state); alert("Turneringen er fullført!"); }
    // === 13: TOURNAMENT FINISH LOGIC END ===

    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    startPauseButton.addEventListener('click', handleStartPause); prevLevelButton.addEventListener('click', ()=>handleAdjustLevel(-1)); nextLevelButton.addEventListener('click', ()=>handleAdjustLevel(1)); adjustTimeMinusButton.addEventListener('click', ()=>handleAdjustTime(-60)); adjustTimePlusButton.addEventListener('click', ()=>handleAdjustTime(60)); lateRegButton.addEventListener('click', handleLateRegClick); endTournamentButton.addEventListener('click', handleEndTournament); btnForceSave.addEventListener('click', handleForceSave); btnBackToMainLive.addEventListener('click', handleBackToMain);
    // Modal Triggers
    btnEditTournamentSettings.addEventListener('click', openTournamentModal);
    btnEditUiSettings.addEventListener('click', openUiModal);
    // Canvas Element Click Triggers
    liveCanvas.addEventListener('click', (e) => {
        const clickedElement = e.target.closest('.clickable-element');
        if(clickedElement) {
            openUiModal();
            // Optionally scroll/focus the relevant controls in the modal later
            console.log("Clicked on element:", clickedElement.id);
        }
    });
    // Tournament Modal Buttons
    closeTournamentModalButton.addEventListener('click', closeTournamentModal);
    btnCancelTournamentEdit.addEventListener('click', closeTournamentModal);
    btnAddEditLevel.addEventListener('click', ()=>addEditBlindLevelRow());
    btnGenerateEditPayout.addEventListener('click', generateEditPayout);
    btnSaveTournamentSettings.addEventListener('click', handleSaveTournamentSettings);
    // UI Modal Buttons
    closeUiModalButton.addEventListener('click', ()=>closeUiModal(true));
    btnCancelUiEdit.addEventListener('click', ()=>closeUiModal(true));
    btnSaveUiSettings.addEventListener('click', handleSaveUiSettings);
    btnResetLayoutTheme?.addEventListener('click', handleResetLayoutTheme); // Add listener for reset button
    // Close on outside click (Applies to whichever modal is open)
    window.addEventListener('click', (e) => { if(isModalOpen && e.target === currentOpenModal) { if(currentOpenModal === uiSettingsModal) closeUiModal(true); else if (currentOpenModal === tournamentSettingsModal) closeTournamentModal(); } });
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===

    // === 15: INITIAL UI RENDER & TIMER START ===
    if(!state.live.activityLog) state.live.activityLog = []; console.log("Rendering initial UI..."); updateUI(); startRealTimeClock(); if(state.live.status === 'running') { timerInterval = setInterval(tick, 1000); } else if (state.live.status === 'finished') { finishTournament(); }
    // === 15: INITIAL UI RENDER & TIMER START ===
});
// === 01: DOMContentLoaded LISTENER END ===
