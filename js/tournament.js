// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    // === 02: STATE VARIABLES START ===
    let currentTournamentId = getActiveTournamentId(); // Get ID from storage
    let state = null; // Will be loaded based on ID
    let timerInterval = null;          // Interval ID for the clock
    let realTimeInterval = null;      // Interval ID for the real-time clock
    let isModalOpen = false; // Track modal state
    let editBlindLevelCounter = 0; // Separate counter for modal blinds table
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // Header
    const nameDisplay = document.getElementById('tournament-name-display');
    const currentTimeDisplay = document.getElementById('current-time');
    const btnEditSettings = document.getElementById('btn-edit-settings');
    const btnBackToMainLive = document.getElementById('btn-back-to-main-live');
    // Top Info
    const timerDisplay = document.getElementById('timer-display');
    const currentLevelDisplay = document.getElementById('current-level');
    const nextBlindsDisplay = document.getElementById('next-blinds');
    const blindsDisplay = document.getElementById('blinds-display');
    const breakInfo = document.getElementById('break-info');
    // Secondary Info
    const playersRemainingDisplay = document.getElementById('players-remaining');
    const playersStartedDisplay = document.getElementById('players-started'); // This ID remained from earlier spec, might need clarification
    const totalEntriesDisplay = document.getElementById('total-entries');
    const averageStackDisplay = document.getElementById('average-stack');
    const totalPotDisplay = document.getElementById('total-pot');
    const lateRegStatusDisplay = document.getElementById('late-reg-status');
    // Prize Display
    const prizeDisplayLive = document.getElementById('prize-display-live');
    // Controls
    const startPauseButton = document.getElementById('btn-start-pause');
    const prevLevelButton = document.getElementById('btn-prev-level');
    const nextLevelButton = document.getElementById('btn-next-level');
    const adjustTimeMinusButton = document.getElementById('btn-adjust-time-minus');
    const adjustTimePlusButton = document.getElementById('btn-adjust-time-plus');
    const lateRegButton = document.getElementById('btn-late-reg'); // Still exists from HTML, used for Late Reg add
    // Player Management
    const playerListUl = document.getElementById('player-list');
    const eliminatedPlayerListUl = document.getElementById('eliminated-player-list');
    const activePlayerCountSpan = document.getElementById('active-player-count');
    const eliminatedPlayerCountSpan = document.getElementById('eliminated-player-count');
    const tableBalanceInfo = document.getElementById('table-balance-info');
    const addPlayerNameInput = document.getElementById('add-player-name-live');
    const btnAddPlayerLive = document.getElementById('btn-add-player-live'); // Generic Add Player button
    // Footer
    const btnForceSave = document.getElementById('btn-force-save');
    const endTournamentButton = document.getElementById('btn-end-tournament');
    // Modal Elements
    const modal = document.getElementById('edit-settings-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const editBlindStructureBody = document.getElementById('edit-blind-structure-body');
    const btnAddEditLevel = document.getElementById('btn-add-edit-level');
    const editPaidPlacesInput = document.getElementById('edit-paid-places');
    const editPrizeDistTextarea = document.getElementById('edit-prize-distribution');
    const btnGenerateEditPayout = document.getElementById('btn-generate-edit-payout');
    const btnSaveEditedSettings = document.getElementById('btn-save-edited-settings');
    const btnCancelEditSettings = document.getElementById('btn-cancel-edit-settings');
     // Need reference for standard payouts in modal logic
     const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt. Sender deg til startsiden."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId); // Load the specific tournament
    if (!state) { alert(`Kunne ikke laste turneringsdata for ID: ${currentTournamentId}. Sender deg til startsiden.`); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    console.log(`Loaded tournament: ${state.config.name} (ID: ${currentTournamentId})`);
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 05: HELPER FUNCTIONS - FORMATTING START ===
    function formatTime(seconds) { if (isNaN(seconds) || seconds < 0) return "00:00"; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }
    function formatBlindsHTML(level) { if (!level) return `<span class="value">--</span> / <span class="value">--</span> <span class="label">Ante:</span> <span class="value">--</span>`; if (level.isBreak) return `<span class="break-text">Pause</span>`; let anteHtml = ''; if (level.ante > 0) anteHtml = `<span class="label">Ante:</span> <span class="value">${level.ante}</span>`; return `<span class="value">${level.sb}</span> / <span class="value">${level.bb}</span> ${anteHtml}`; }
    function formatNextBlindsText(level) { if (!level) return "N/A"; if (level.isBreak) return `Pause (${level.duration} min)`; const anteText = level.ante > 0 ? ` (${level.ante} Ante)` : ''; return `${level.sb} / ${level.bb}${anteText}`; }
    function getPlayerNameById(playerId) { const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId); return player ? player.name : 'Ukjent'; }
    // === 05: HELPER FUNCTIONS - FORMATTING END ===


    // === 06: HELPER FUNCTIONS - CALCULATIONS START ===
    function calculateTotalChips() { const baseChips = state.live.totalEntries * state.config.startStack; const rebuyChips = state.live.totalRebuys * (state.config.rebuyChips || 0); const addonChips = state.live.totalAddons * (state.config.addonChips || 0); return baseChips + rebuyChips + addonChips; }
    function calculateAverageStack() { const activePlayers = state.live.players.length; if (activePlayers === 0) return 0; const totalChips = calculateTotalChips(); return Math.round(totalChips / activePlayers); }
    function calculatePrizes() {
        const prizes = []; const potForPrizes = state.live.totalPot - (state.config.type === 'knockout' ? state.live.totalEntries * (state.config.bountyAmount || 0) : 0);
        if (potForPrizes <= 0 || !state.config.prizeDistribution || state.config.prizeDistribution.length === 0 || state.config.prizeDistribution.length !== state.config.paidPlaces) { return prizes; }
        let sumOfPrizesCalculated = 0;
        for (let i = 0; i < state.config.paidPlaces; i++) {
            const percentage = state.config.prizeDistribution[i] || 0; let amount;
            if (i === state.config.paidPlaces - 1) { amount = Math.max(0, potForPrizes - sumOfPrizesCalculated); } else { amount = Math.floor((potForPrizes * percentage) / 100); }
            if (amount > 0 || (prizes.length === 0 && state.config.paidPlaces === 1)) { prizes.push({ place: i + 1, amount: amount, percentage: percentage }); sumOfPrizesCalculated += amount; } else if (prizes.length > 0) { prizes.push({ place: i + 1, amount: 0, percentage: percentage }); } else { break; }
            if(prizes.length >= state.config.paidPlaces) break;
        }
        return prizes;
     }
    // === 06: HELPER FUNCTIONS - CALCULATIONS END ===


    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT START ===
    function assignTableSeat(player) {
         const tables = {}; let minTableNum = -1;
         state.live.players.forEach(p => { if (p.id !== player.id) { tables[p.table] = (tables[p.table] || 0) + 1; } });
         const sortedTables = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).sort((a, b) => a.count - b.count);
         for (const tableInfo of sortedTables) { if (tableInfo.count < state.config.playersPerTable) { minTableNum = tableInfo.tableNum; break; } }
         if (minTableNum === -1) { const existingTableNumbers = Object.keys(tables).map(Number); minTableNum = existingTableNumbers.length > 0 ? Math.max(...existingTableNumbers) + 1 : 1; console.log(`Starting new table ${minTableNum} for ${player.name}`); player.table = minTableNum; player.seat = 1;
         } else { const occupiedSeats = state.live.players.filter(p => p.table === minTableNum).map(p => p.seat); let seatNum = 1; while (occupiedSeats.includes(seatNum)) { seatNum++; } if (seatNum > state.config.playersPerTable) { console.error(`CRITICAL ERROR: No seat found on table ${minTableNum} for ${player.name}, assigning fallback seat ${occupiedSeats.length + 1}.`); seatNum = occupiedSeats.length + 1; } player.table = minTableNum; player.seat = seatNum; console.log(`Assigned ${player.name} to Table ${minTableNum}, Seat ${seatNum}`); }
     }
    function balanceTables() {
         if (state.live.status === 'finished' || state.live.players.length <= state.config.playersPerTable) { tableBalanceInfo.classList.add('hidden'); return; }
         let balancingPerformed = false;
         while (true) {
             const tables = {}; state.live.players.forEach(p => { tables[p.table] = (tables[p.table] || 0) + 1; });
             const tableCounts = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).filter(tc => tc.count > 0); // Filter out empty tables
             if (tableCounts.length < 2) { tableBalanceInfo.classList.add('hidden'); break; } // Can't balance 1 or 0 tables
             tableCounts.sort((a, b) => a.count - b.count); const minTable = tableCounts[0]; const maxTable = tableCounts[tableCounts.length - 1];
             if (maxTable.count - minTable.count < 2) { tableBalanceInfo.classList.add('hidden'); break; } // Balanced
             balancingPerformed = true; tableBalanceInfo.classList.remove('hidden'); console.log(`Balancing: Max ${maxTable.tableNum}(${maxTable.count}), Min ${minTable.tableNum}(${minTable.count})`);
             const playersOnMaxTable = state.live.players.filter(p => p.table === maxTable.tableNum); if (playersOnMaxTable.length === 0) { console.error("Balancing Error!"); break; }
             const playerToMove = playersOnMaxTable[Math.floor(Math.random() * playersOnMaxTable.length)];
             const occupiedSeatsMin = state.live.players.filter(p => p.table === minTable.tableNum).map(p => p.seat); let newSeat = 1; while (occupiedSeatsMin.includes(newSeat)) { newSeat++; }
             if (newSeat > state.config.playersPerTable) { console.error(`Balancing Error: No seat on sparse table ${minTable.tableNum}.`); alert(`Balanseringsfeil bord ${minTable.tableNum}.`); break; }
             const oldTable = playerToMove.table; const oldSeat = playerToMove.seat; playerToMove.table = minTable.tableNum; playerToMove.seat = newSeat;
             const message = `Balansering: ${playerToMove.name} flyttes fra B${oldTable} S${oldSeat} til B${minTable.tableNum} S${newSeat}.`; console.log(message); alert(message);
         }
         if (balancingPerformed) { console.log("Balancing complete."); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); saveTournamentState(currentTournamentId, state); updateUI(); }
     }
    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT END ===


    // === 08: UI UPDATE FUNCTIONS START ===
    function renderPlayerList() {
        playerListUl.innerHTML = ''; eliminatedPlayerListUl.innerHTML = '';
        const currentLevelNum = state.live.currentLevelIndex + 1;
        const isRebuyActive = state.config.type === 'rebuy' && currentLevelNum <= state.config.rebuyLevels;
        const isAddonActive = state.config.type === 'rebuy' && currentLevelNum > state.config.rebuyLevels;
        const canEdit = state.live.status !== 'finished';

        state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table)
        .forEach(player => { /* ... (render active players with Edit button) ... */
            const li = document.createElement('li');
            let playerInfo = `${player.name} <span class="player-details">(B${player.table} S${player.seat})</span>`;
            if (player.rebuys > 0) playerInfo += ` <span class="player-details">[${player.rebuys}R]</span>`;
            if (player.addon) playerInfo += ` <span class="player-details">[A]</span>`;
            if (state.config.type === 'knockout' && player.knockouts > 0) playerInfo += ` <span class="player-details">(KOs: ${player.knockouts})</span>`;
            let actions = '';
            if (canEdit) {
                 actions += `<button class="btn-edit-player small-button" data-player-id="${player.id}" title="Rediger Navn">✏️</button>`;
                if (isRebuyActive) actions += `<button class="btn-rebuy small-button" data-player-id="${player.id}" title="Registrer Rebuy">R</button>`;
                if (isAddonActive && !player.addon) actions += `<button class="btn-addon small-button" data-player-id="${player.id}" title="Registrer Addon">A</button>`;
                actions += `<button class="btn-eliminate small-button danger-button" data-player-id="${player.id}" title="Eliminer Spiller">X</button>`;
            }
            li.innerHTML = `<span class="item-name">${playerInfo}</span><div class="list-actions player-actions">${actions}</div>`;
            playerListUl.appendChild(li);
         });

        state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity)) // Handle null places
        .forEach(player => { /* ... (render eliminated players with Restore button if editable) ... */
            const li = document.createElement('li');
             let elimInfo = `${player.place ?? '?'}. ${player.name}`;
             if (player.rebuys > 0) elimInfo += ` <span class="player-details">[${player.rebuys}R]</span>`;
             if (player.addon) elimInfo += ` <span class="player-details">[A]</span>`;
             if (state.config.type === 'knockout' && player.knockouts > 0) elimInfo += ` <span class="player-details">(KOs: ${player.knockouts})</span>`;
             if (player.eliminatedBy) elimInfo += ` <span class="player-details">(av ${getPlayerNameById(player.eliminatedBy)})</span>`;
             li.innerHTML = `<span class="item-name">${elimInfo}</span><div class="list-actions player-actions">${canEdit ? `<button class="btn-restore small-button warning-button" data-player-id="${player.id}" title="Gjenopprett Spiller">↩️</button>` : ''}</div>`;
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
    function displayPrizes() { /* ... (same as before) ... */
        if (!prizeDisplayLive) return; prizeDisplayLive.innerHTML = '<h3>Premier (Estimat)</h3>'; const prizeData = calculatePrizes();
        if (prizeData.length > 0) { const ol = document.createElement('ol'); prizeData.forEach(p => { const li = document.createElement('li'); li.textContent = `${p.place}. Plass: ${p.amount.toLocaleString('nb-NO')} kr (${p.percentage}%)`; ol.appendChild(li); }); prizeDisplayLive.appendChild(ol); }
        else { const potForPrizes = state.live.totalPot - (state.config.type === 'knockout' ? state.live.totalEntries * (state.config.bountyAmount || 0) : 0); if (potForPrizes > 0 && (!state.config.prizeDistribution || state.config.prizeDistribution.length === 0)) { prizeDisplayLive.innerHTML += '<p>Premiefordeling ikke definert.</p>'; } else if (potForPrizes <= 0) { prizeDisplayLive.innerHTML += '<p>Ingen premiepott å fordele ennå.</p>'; } else { prizeDisplayLive.innerHTML += '<p>Beregner...</p>'; } } }
    function updateUI() {
         // Header & Clocks
         nameDisplay.textContent = state.config.name; currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
         // Timer & Blinds
         const currentLevelIndex = state.live.currentLevelIndex; const currentLevel = state.config.blindLevels[currentLevelIndex]; const nextLevel = state.config.blindLevels[currentLevelIndex + 1];
         timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); currentLevelDisplay.textContent = currentLevel ? currentLevel.level : 'N/A'; nextBlindsDisplay.textContent = formatNextBlindsText(nextLevel);
         if (currentLevel && currentLevel.isBreak) { blindsDisplay.innerHTML = ''; blindsDisplay.classList.add('hidden'); breakInfo.classList.remove('hidden'); breakInfo.textContent = `PAUSE (${formatTime(state.live.timeRemainingInLevel)})`; }
         else { blindsDisplay.classList.remove('hidden'); breakInfo.classList.add('hidden'); blindsDisplay.innerHTML = formatBlindsHTML(currentLevel); }
         // Secondary Info
         const activePlayersCount = state.live.players.length;
         playersRemainingDisplay.textContent = activePlayersCount; totalEntriesDisplay.textContent = state.live.totalEntries;
         averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO'); totalPotDisplay.textContent = state.live.totalPot.toLocaleString('nb-NO');
         // Late Reg Status & Buttons
         const currentLevelNum = currentLevelIndex + 1; const lateRegOpen = currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished';
         if (state.config.lateRegLevel > 0) { lateRegStatusDisplay.textContent = `Late Reg: ${lateRegOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`; } else { lateRegStatusDisplay.textContent = 'Late Reg: Ikke tilgjengelig'; }
         lateRegButton.disabled = !lateRegOpen || state.live.status === 'paused'; // Only enable if running and allowed
         // Enable generic add button if not finished
         const canAddGeneric = state.live.status !== 'finished';
         btnAddPlayerLive.disabled = !canAddGeneric;
         addPlayerNameInput.disabled = !canAddGeneric;
         // Controls state
         startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke';
         startPauseButton.disabled = state.live.status === 'finished'; // Disable start/pause when finished
         prevLevelButton.disabled = currentLevelIndex <= 0 || state.live.status === 'finished'; nextLevelButton.disabled = currentLevelIndex >= state.config.blindLevels.length - 1 || state.live.status === 'finished';
         adjustTimeMinusButton.disabled = state.live.status === 'finished'; adjustTimePlusButton.disabled = state.live.status === 'finished';
         btnEditSettings.disabled = state.live.status === 'finished'; // Disable edit when finished
         endTournamentButton.disabled = state.live.status === 'finished'; // Disable finish button if already finished
         // Render lists and prizes
         renderPlayerList(); displayPrizes();
     }
    // === 08: UI UPDATE FUNCTIONS END ===


    // === 09: TIMER LOGIC START ===
    function tick() { if (state.live.status !== 'running') return; state.live.timeRemainingInLevel--;
        if (state.live.timeRemainingInLevel < 0) { state.live.currentLevelIndex++; if (state.live.currentLevelIndex >= state.config.blindLevels.length) { console.log("Last level finished."); finishTournament(); return; } const newLevel = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = newLevel.duration * 60; console.log(`Nivå ${newLevel.level} startet: ${formatNextBlindsText(newLevel)}`); updateUI(); saveTournamentState(currentTournamentId, state); }
        else { timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); if (state.config.blindLevels[state.live.currentLevelIndex]?.isBreak) { breakInfo.textContent = `PAUSE (${formatTime(state.live.timeRemainingInLevel)})`; } }
        if (state.live.timeRemainingInLevel > 0 && state.live.timeRemainingInLevel % 30 === 0) { saveTournamentState(currentTournamentId, state); } } // Save every 30s if timer running > 0
    function startRealTimeClock() { if (realTimeInterval) clearInterval(realTimeInterval); realTimeInterval = setInterval(() => { currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }, 1000); }
    // === 09: TIMER LOGIC END ===


    // === 10: EVENT HANDLERS - CONTROLS START ===
    function handleStartPause() { if (state.live.status === 'finished') return; if (state.live.status === 'paused') { state.live.status = 'running'; if (!timerInterval) timerInterval = setInterval(tick, 1000); console.log("Timer started"); } else { state.live.status = 'paused'; console.log("Timer paused"); saveTournamentState(currentTournamentId, state); } updateUI(); } // Update UI after changing status
    function handleAdjustTime(deltaSeconds) { if (state.live.status === 'finished') return; state.live.timeRemainingInLevel += deltaSeconds; state.live.timeRemainingInLevel = Math.max(0, state.live.timeRemainingInLevel); const currentLevelDuration = state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60; if (currentLevelDuration) state.live.timeRemainingInLevel = Math.min(currentLevelDuration, state.live.timeRemainingInLevel); console.log(`Time adjusted by ${deltaSeconds / 60} min`); updateUI(); saveTournamentState(currentTournamentId, state); }
    function handleAdjustLevel(deltaIndex) { if (state.live.status === 'finished') return; const newIndex = state.live.currentLevelIndex + deltaIndex; if (newIndex >= 0 && newIndex < state.config.blindLevels.length) { state.live.currentLevelIndex = newIndex; const newLevel = state.config.blindLevels[newIndex]; state.live.timeRemainingInLevel = newLevel.duration * 60; console.log(`Level manually set to ${newLevel.level}`); updateUI(); saveTournamentState(currentTournamentId, state); } else { console.warn("Cannot adjust level beyond structure."); } }
    function handleEndTournament() { if (state.live.status === 'finished') { alert("Turneringen er allerede fullført."); return; } if (confirm("Markere turneringen som fullført?")) finishTournament(); }
    function handleForceSave() { if(state) { if(saveTournamentState(currentTournamentId, state)) { console.log("Tournament state manually saved."); btnForceSave.textContent = "Lagret!"; setTimeout(() => { btnForceSave.textContent = "Lagre Nå"; }, 1500); } else { alert("Lagring feilet!");} } }
    function handleBackToMain() { if (state && state.live.status !== 'finished') saveTournamentState(currentTournamentId, state); window.location.href = 'index.html'; }
    // === 10: EVENT HANDLERS - CONTROLS END ===


    // === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    function handleRebuy(event) { const playerId = parseInt(event.target.dataset.playerId); const player = state.live.players.find(p => p.id === playerId); const currentLevelNum = state.live.currentLevelIndex + 1; if (!player || state.config.type !== 'rebuy' || !(currentLevelNum <= state.config.rebuyLevels)) { alert("Re-buy ikke tilgjengelig."); return; } if (confirm(`Re-buy (${state.config.rebuyCost} kr) for ${player.name}?`)) { player.rebuys = (player.rebuys || 0) + 1; state.live.totalPot += state.config.rebuyCost; state.live.totalEntries++; state.live.totalRebuys++; updateUI(); saveTournamentState(currentTournamentId, state); } }
    function handleAddon(event) { const playerId = parseInt(event.target.dataset.playerId); const player = state.live.players.find(p => p.id === playerId); const currentLevelNum = state.live.currentLevelIndex + 1; const isAddonPeriod = currentLevelNum > state.config.rebuyLevels; if (!player || state.config.type !== 'rebuy' || !isAddonPeriod || player.addon) { alert("Add-on ikke tilgjengelig."); return; } if (confirm(`Add-on (${state.config.addonCost} kr) for ${player.name}?`)) { player.addon = true; state.live.totalPot += state.config.addonCost; state.live.totalAddons++; updateUI(); saveTournamentState(currentTournamentId, state); } }
    function handleEliminate(event) { if (state.live.status === 'finished') return; const playerId = parseInt(event.target.dataset.playerId); const playerIndex = state.live.players.findIndex(p => p.id === playerId); if (playerIndex === -1) return; const player = state.live.players[playerIndex]; let eliminatedByPlayerId = null; if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) { const activePlayerNames = state.live.players.filter(p => p.id !== playerId).map(p => `${p.name} (B${p.table}S${p.seat})`); if (activePlayerNames.length > 0) { const promptMessage = `Hvem slo ut ${player.name}?\n\nAktive:\n - ${activePlayerNames.join("\n - ")}`; const eliminatorInput = prompt(promptMessage); if (eliminatorInput?.trim()) { const eliminatorName = eliminatorInput.trim().toLowerCase(); const eliminator = state.live.players.find(p => p.id !== playerId && p.name.toLowerCase() === eliminatorName); if (eliminator) { eliminatedByPlayerId = eliminator.id; eliminator.knockouts = (eliminator.knockouts || 0) + 1; state.live.knockoutLog.push({ eliminatedPlayerId: player.id, eliminatedByPlayerId: eliminator.id }); } else { alert(`Fant ikke "${eliminatorInput}".`); } } } } if (confirm(`Eliminere ${player.name}?`)) { player.eliminated = true; player.eliminatedBy = eliminatedByPlayerId; player.place = state.live.players.length; state.live.eliminatedPlayers.push(player); state.live.players.splice(playerIndex, 1); balanceTables(); updateUI(); saveTournamentState(currentTournamentId, state); if (state.live.players.length <= 1) finishTournament(); } }
    function handleRestore(event) { if (state.live.status === 'finished') { alert("Kan ikke gjenopprette."); return; } const playerId = parseInt(event.target.dataset.playerId); const playerIndex = state.live.eliminatedPlayers.findIndex(p => p.id === playerId); if (playerIndex === -1) return; const player = state.live.eliminatedPlayers[playerIndex]; if (confirm(`Gjenopprette ${player.name}?`)) { const eliminatedBy = player.eliminatedBy; player.eliminated = false; player.eliminatedBy = null; player.place = null; state.live.eliminatedPlayers.splice(playerIndex, 1); state.live.players.push(player); if (state.config.type === 'knockout' && eliminatedBy) { const eliminator = state.live.players.find(p => p.id === eliminatedBy) || state.live.eliminatedPlayers.find(p => p.id === eliminatedBy); if (eliminator?.knockouts > 0) eliminator.knockouts--; const logIndex = state.live.knockoutLog.findIndex(log => log.eliminatedPlayerId === player.id && log.eliminatedByPlayerId === eliminatedBy); if (logIndex > -1) state.live.knockoutLog.splice(logIndex, 1); } assignTableSeat(player); balanceTables(); updateUI(); saveTournamentState(currentTournamentId, state); } }
    function handleEditPlayer(event) { if (state.live.status === 'finished') return; const playerId = parseInt(event.target.dataset.playerId); const player = state.live.players.find(p => p.id === playerId); if (!player) return; const newName = prompt(`Endre navn for ${player.name}:`, player.name); if (newName?.trim()) { player.name = newName.trim(); renderPlayerList(); saveTournamentState(currentTournamentId, state); } else if (newName === "") alert("Navn kan ikke være tomt."); }
    function handleAddPlayerLive() { // Generic add button handler
        if (state.live.status === 'finished') { alert("Turnering er fullført."); return; }
        const name = addPlayerNameInput.value.trim(); if (name === "") { alert("Skriv inn navn."); return; }
        // Decide if this counts as late reg buy-in
        const isLateRegPeriod = (state.live.currentLevelIndex + 1) <= state.config.lateRegLevel;
        const cost = state.config.buyIn; // Assume standard buy-in always
        if (confirm(`Legge til "${name}" (Buy-in: ${cost} kr)?`)) {
            const player = { id: generateUniqueId('p'), name: name, stack: state.config.startStack, table: 0, seat: 0, rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0 };
            state.live.players.push(player); assignTableSeat(player); state.live.totalPot += cost; state.live.totalEntries++; addPlayerNameInput.value = ''; balanceTables(); updateUI(); saveTournamentState(currentTournamentId, state);
        }
    }
    function handleLateRegClick() { // Button specifically for Late Reg period
        if (state.live.status === 'finished') return;
        const currentLevelNum = state.live.currentLevelIndex + 1;
        const lateRegOpen = currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0;
        if (!lateRegOpen) { alert("Sen registrering er stengt."); return; }
        if (state.live.status === 'paused') { alert("Start klokken for å legge til spillere."); return; } // Require timer running?

        const name = prompt("Navn for sen registrering:");
        if (name?.trim()) {
            const cost = state.config.buyIn;
             const player = { id: generateUniqueId('p'), name: name.trim(), stack: state.config.startStack, table: 0, seat: 0, rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0 };
             state.live.players.push(player); assignTableSeat(player); state.live.totalPot += cost; state.live.totalEntries++; balanceTables(); updateUI(); saveTournamentState(currentTournamentId, state);
        }
    }
    // === 11: EVENT HANDLERS - PLAYER ACTIONS END ===


    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    function openEditModal() { if (state.live.status === 'finished' || isModalOpen) return; console.log("Opening edit modal"); editBlindStructureBody.innerHTML = ''; editBlindLevelCounter = 0; const currentLevelIdx = state.live.currentLevelIndex; state.config.blindLevels.forEach(level => addEditBlindLevelRow(level)); updateEditLevelNumbers(); editPaidPlacesInput.value = state.config.paidPlaces; editPrizeDistTextarea.value = state.config.prizeDistribution.join(', '); modal.classList.remove('hidden'); isModalOpen = true; }
    function closeEditModal() { modal.classList.add('hidden'); isModalOpen = false; }
    function addEditBlindLevelRow(levelData = {}) { editBlindLevelCounter++; const row = editBlindStructureBody.insertRow(); row.dataset.levelNumber = editBlindLevelCounter; const sb = levelData.sb ?? ''; const bb = levelData.bb ?? ''; const ante = levelData.ante ?? 0; const duration = levelData.duration ?? (state.config.blindLevels?.[0]?.duration || 20); const isBreak = levelData.isBreak ?? false; const isPastLevel = levelData.level <= state.live.currentLevelIndex + 1; row.innerHTML = `<td><span class="level-number">${editBlindLevelCounter}</span> ${isPastLevel ? '<small>(Låst)</small>':''}</td><td><input type="number" class="sb-input" value="${sb}" min="0" step="100" ${isBreak || isPastLevel ? 'disabled' : ''}></td><td><input type="number" class="bb-input" value="${bb}" min="0" step="100" ${isBreak || isPastLevel ? 'disabled' : ''}></td><td><input type="number" class="ante-input" value="${ante}" min="0" step="25" ${isBreak || isPastLevel ? 'disabled' : ''}></td><td><input type="number" class="duration-input" value="${duration}" min="1" ${isPastLevel ? 'disabled' : ''}></td><td><input type="checkbox" class="is-break-checkbox" ${isBreak ? 'checked' : ''} ${isPastLevel ? 'disabled' : ''}> Pause</td><td><button type="button" class="btn-remove-level" title="Fjern nivå ${editBlindLevelCounter}" ${isPastLevel ? 'disabled' : ''}>X</button></td>`; const removeBtn = row.querySelector('.btn-remove-level'); const chkBox = row.querySelector('.is-break-checkbox'); if (!isPastLevel) { removeBtn.onclick = () => { row.remove(); updateEditLevelNumbers(); }; chkBox.onchange = (e) => { const isChecked=e.target.checked; row.querySelectorAll('input[type="number"]').forEach((input, index) => { if (index !== 2) { input.disabled = isChecked; if (isChecked && index !== 2) input.value = (index === 2) ? 0 : ''; } }); }; if(isBreak) chkBox.dispatchEvent(new Event('change')); } else { row.querySelectorAll('input').forEach(inp => inp.disabled = true); removeBtn.disabled = true; } }
    function updateEditLevelNumbers() { const rows = editBlindStructureBody.querySelectorAll('tr'); rows.forEach((row, index) => { const levelNum = index + 1; row.dataset.levelNumber = levelNum; row.querySelector('.level-number').textContent = levelNum; row.querySelector('.btn-remove-level').title = `Fjern nivå ${levelNum}`; }); editBlindLevelCounter = rows.length; }
    function generateEditPayout() { const places = parseInt(editPaidPlacesInput.value) || 0; if (places > 0 && standardPayouts[places]) { editPrizeDistTextarea.value = standardPayouts[places].join(', '); } else { editPrizeDistTextarea.value = ''; } }
    function handleSaveEditedSettings() {
         console.log("Saving edited settings..."); let changesMade = false; let needsUIUpdate = false; const currentLevelIndex = state.live.currentLevelIndex; let overallValid = true;
         // --- Save Blinds ---
         const newBlindLevels = []; const editBlindRows = editBlindStructureBody.querySelectorAll('tr');
         if (editBlindRows.length === 0) { alert("Minst ett blindnivå kreves."); return; }
         editBlindRows.forEach((row, index) => { /* ... (Validation inside loop) ... */
              const levelNum = index + 1; let rowValid = true; const isBreak = row.querySelector('.is-break-checkbox').checked; const sb = parseInt(row.querySelector('.sb-input').value); const bb = parseInt(row.querySelector('.bb-input').value); const ante = parseInt(row.querySelector('.ante-input').value) || 0; const duration = parseInt(row.querySelector('.duration-input').value);
              if (isNaN(duration) || duration <= 0) { rowValid = false; alert(`Nivå ${levelNum}: Ugyldig varighet.`); } if (!isBreak) { if (isNaN(sb) || sb < 0) { rowValid = false; alert(`Nivå ${levelNum}: Ugyldig SB.`); } if (isNaN(bb) || bb <= 0) { rowValid = false; alert(`Nivå ${levelNum}: Ugyldig BB.`); } else if (bb < sb) { rowValid = false; alert(`Nivå ${levelNum}: BB >= SB.`); } if (isNaN(ante) || ante < 0) { rowValid = false; alert(`Nivå ${levelNum}: Ugyldig Ante.`); } }
              if (!rowValid) overallValid = false;
              newBlindLevels.push({ level: levelNum, sb: isBreak ? 0 : sb, bb: isBreak ? 0 : bb, ante: isBreak ? 0 : ante, duration: duration, isBreak: isBreak });
         });
         if (overallValid && JSON.stringify(state.config.blindLevels) !== JSON.stringify(newBlindLevels)) { state.config.blindLevels = newBlindLevels; changesMade = true; if (state.config.blindLevels[currentLevelIndex] && state.live.timeRemainingInLevel > state.config.blindLevels[currentLevelIndex].duration * 60) { state.live.timeRemainingInLevel = state.config.blindLevels[currentLevelIndex].duration * 60; needsUIUpdate = true; } }
         // --- Save Prizes ---
         const newPaidPlaces = parseInt(editPaidPlacesInput.value); const newPrizeDist = editPrizeDistTextarea.value.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p) && p >= 0); let prizesValid = true;
         if (isNaN(newPaidPlaces) || newPaidPlaces <= 0) { prizesValid = false; alert("Ugyldig antall betalte."); } else if (newPrizeDist.length !== newPaidPlaces) { prizesValid = false; alert("Antall % != Antall betalte."); } else { const sum = newPrizeDist.reduce((a, b) => a + b, 0); if (Math.abs(sum - 100) > 0.1) { prizesValid = false; alert(`% sum (${sum.toFixed(1)}) != 100.`); } }
         if (prizesValid && (state.config.paidPlaces !== newPaidPlaces || JSON.stringify(state.config.prizeDistribution) !== JSON.stringify(newPrizeDist))) { const playersInMoney = state.live.eliminatedPlayers.filter(p => p.place <= state.config.paidPlaces).length; if (playersInMoney === 0 || confirm(`Advarsel: ${playersInMoney} spiller(e) er allerede i pengene. Sikker på å endre premier?`)) { state.config.paidPlaces = newPaidPlaces; state.config.prizeDistribution = newPrizeDist; changesMade = true; needsUIUpdate = true; } else { console.log("Prize change cancelled."); prizesValid = false;} } // Mark invalid if cancelled
         // --- Finalize ---
         if (!overallValid || !prizesValid) { console.warn("Edits not saved due to validation errors."); return; } // Stop if any part failed
         if (changesMade) { if(saveTournamentState(currentTournamentId, state)) { alert("Endringer lagret!"); if (needsUIUpdate) updateUI(); closeEditModal(); } else { alert("Lagring av endringer feilet!"); } }
         else { alert("Ingen endringer å lagre."); closeEditModal(); }
     }
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===


    // === 13: TOURNAMENT FINISH LOGIC START ===
    function finishTournament() { if (state.live.status === 'finished') return; console.log("Finishing tournament..."); clearInterval(timerInterval); timerInterval = null; state.live.status = 'finished'; if (state.live.players.length === 1) { const winner = state.live.players[0]; winner.place = 1; state.live.eliminatedPlayers.push(winner); state.live.players.splice(0, 1); } else if (state.live.players.length === 0) { console.log("Finished with no active players."); } else { console.log(`Finished with ${state.live.players.length} players remaining (Chop?).`); } state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity)); updateUI(); console.log("Tournament officially finished!"); saveTournamentState(currentTournamentId, state); }
    // === 13: TOURNAMENT FINISH LOGIC END ===


    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    startPauseButton.addEventListener('click', handleStartPause);
    prevLevelButton.addEventListener('click', () => handleAdjustLevel(-1));
    nextLevelButton.addEventListener('click', () => handleAdjustLevel(1));
    adjustTimeMinusButton.addEventListener('click', () => handleAdjustTime(-60));
    adjustTimePlusButton.addEventListener('click', () => handleAdjustTime(60));
    lateRegButton.addEventListener('click', handleLateRegClick); // Specific late reg button
    btnAddPlayerLive.addEventListener('click', handleAddPlayerLive); // Generic add button
    endTournamentButton.addEventListener('click', handleEndTournament);
    btnForceSave.addEventListener('click', handleForceSave);
    btnBackToMainLive.addEventListener('click', handleBackToMain);
    // Modal Listeners
    btnEditSettings.addEventListener('click', openEditModal);
    closeModalButton.addEventListener('click', closeEditModal);
    btnCancelEditSettings.addEventListener('click', closeEditModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeEditModal(); });
    btnAddEditLevel.addEventListener('click', () => addEditBlindLevelRow());
    btnGenerateEditPayout.addEventListener('click', generateEditPayout);
    btnSaveEditedSettings.addEventListener('click', handleSaveEditedSettings);
    // Player action listeners are added in renderPlayerList()
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===


    // === 15: INITIAL UI RENDER & TIMER START ===
    updateUI(); // Initial render
    startRealTimeClock(); // Start wall clock
    if (state.live.status === 'running') { timerInterval = setInterval(tick, 1000); }
    else if (state.live.status === 'finished') { finishTournament(); } // Ensure UI reflects finished state
    // === 15: INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
