// === DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    // === STATE VARIABLES START ===
    let state = loadTournamentState(); // Load state from storage.js
    let timerInterval = null;          // Interval ID for the clock
    let realTimeInterval = null;      // Interval ID for the real-time clock
    // === STATE VARIABLES END ===


    // === DOM REFERENCES START ===
    // Header
    const nameDisplay = document.getElementById('tournament-name-display');
    const currentTimeDisplay = document.getElementById('current-time');
    // Top Info
    const timerDisplay = document.getElementById('timer-display');
    const currentLevelDisplay = document.getElementById('current-level');
    const nextBlindsDisplay = document.getElementById('next-blinds');
    const blindsDisplay = document.getElementById('blinds-display'); // **** Added based on previous fix ****
    const currentSbDisplay = document.getElementById('current-sb'); // No longer used directly, but keep if needed elsewhere
    const currentBbDisplay = document.getElementById('current-bb'); // No longer used directly
    const currentAnteDisplay = document.getElementById('current-ante'); // No longer used directly
    const breakInfo = document.getElementById('break-info');
    // Secondary Info
    const playersRemainingDisplay = document.getElementById('players-remaining');
    const playersStartedDisplay = document.getElementById('players-started');
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
    const lateRegButton = document.getElementById('btn-late-reg');
    // Player Management
    const playerListUl = document.getElementById('player-list');
    const eliminatedPlayerListUl = document.getElementById('eliminated-player-list');
    const activePlayerCountSpan = document.getElementById('active-player-count');
    const eliminatedPlayerCountSpan = document.getElementById('eliminated-player-count');
    const tableBalanceInfo = document.getElementById('table-balance-info');
    // Footer
    const endTournamentButton = document.getElementById('btn-end-tournament');
    // === DOM REFERENCES END ===


    // === INITIALIZATION & VALIDATION START ===
    if (!state) {
        alert("Ingen turneringsdata funnet eller data er korrupt. Sender deg til startsiden.");
        window.location.href = 'index.html';
        return; // Stop script execution
    }

    // Ensure essential state properties exist
    if (!state.config || !state.live || !state.config.blindLevels || !state.live.players) {
         alert("Turneringsdata mangler viktig informasjon. Sender deg til startsiden.");
         clearTournamentState(); // Clear corrupted state
         window.location.href = 'index.html';
         return;
    }
    // === INITIALIZATION & VALIDATION END ===


    // === HELPER FUNCTIONS - FORMATTING START ===
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function formatBlindsHTML(level) {
        if (!level) return `<span>--</span> / <span>--</span> <span class="label">Ante:</span> <span>--</span>`;
        if (level.isBreak) return `<span class="break-text">Pause</span>`; // Style this class if needed

        let anteHtml = '';
        if (level.ante > 0) {
            anteHtml = `<span class="label">Ante:</span> <span class="value">${level.ante}</span>`;
        }

        return `<span class="value">${level.sb}</span> / <span class="value">${level.bb}</span> ${anteHtml}`;
    }

    function formatNextBlindsText(level) {
         if (!level) return "N/A";
         if (level.isBreak) return `Pause (${level.duration} min)`;
         const anteText = level.ante > 0 ? ` (${level.ante} Ante)` : '';
         return `${level.sb} / ${level.bb}${anteText}`;
    }

    function getPlayerNameById(playerId) {
         const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId);
         return player ? player.name : 'Ukjent';
     }
    // === HELPER FUNCTIONS - FORMATTING END ===


    // === HELPER FUNCTIONS - CALCULATIONS START ===
    function calculateTotalChips() {
         // More reliable calculation based on entries/rebuys/addons
         const baseChips = state.live.totalEntries * state.config.startStack;
         const rebuyChips = state.live.totalRebuys * (state.config.rebuyChips || 0);
         const addonChips = state.live.totalAddons * (state.config.addonChips || 0);
         return baseChips + rebuyChips + addonChips;
    }

    function calculateAverageStack() {
        const activePlayers = state.live.players.length;
        if (activePlayers === 0) return 0;
        const totalChips = calculateTotalChips();
        return Math.round(totalChips / activePlayers);
    }

    function calculatePrizes() {
        const prizes = [];
        const potForPrizes = state.live.totalPot -
                           (state.config.type === 'knockout' ? state.live.totalEntries * (state.config.bountyAmount || 0) : 0);

        if (potForPrizes <= 0 || !state.config.prizeDistribution || state.config.prizeDistribution.length === 0) {
             return prizes;
        }

        let sumOfPrizesCalculated = 0; // Track sum to adjust last prize

        for (let i = 0; i < state.config.paidPlaces; i++) {
             const percentage = state.config.prizeDistribution[i] || 0;
             // Use Math.floor to generally avoid exceeding pot, adjust last prize later
             const amount = Math.floor((potForPrizes * percentage) / 100);

            if (i === state.config.paidPlaces - 1) {
                 // For the last prize, calculate based on remaining pot to ensure total matches
                 const remainingPot = Math.max(0, potForPrizes - sumOfPrizesCalculated);
                 if (remainingPot > 0) {
                      prizes.push({ place: i + 1, amount: remainingPot, percentage: percentage });
                 }
                 // Don't add 0kr prizes unless it's the only prize
                 else if (state.config.paidPlaces === 1 && amount <= 0) {
                     prizes.push({ place: i + 1, amount: 0, percentage: percentage });
                 }

            } else {
                 if (amount > 0) {
                     prizes.push({ place: i + 1, amount: amount, percentage: percentage });
                     sumOfPrizesCalculated += amount;
                 } else if (prizes.length > 0 || state.config.paidPlaces === 1) {
                      // Add 0kr prize if not first place, or if it IS the only place
                       prizes.push({ place: i + 1, amount: 0, percentage: percentage });
                 } else {
                     // If first prize calc is 0, stop adding prizes
                     break;
                 }
            }

            // Ensure we don't add more prizes than intended if earlier ones were 0
            if(prizes.length >= state.config.paidPlaces) break;
        }

        return prizes;
    }
    // === HELPER FUNCTIONS - CALCULATIONS END ===


    // === HELPER FUNCTIONS - TABLE MANAGEMENT START ===
    function assignTableSeat(player) {
         // Logic: Find the table with the fewest players, add to next available seat. Prioritize existing tables.
         const tables = {};
         let minTableNum = -1;
         let minTableCount = Infinity;

         // Count players on each active table
         state.live.players.forEach(p => {
             if (p.id !== player.id) { // Don't count the player being placed
                 tables[p.table] = (tables[p.table] || 0) + 1;
             }
         });
          // Also consider tables where only eliminated players sat, might need reopening
         /* // This part might be complex, skip for now
         state.live.eliminatedPlayers.forEach(p => {
             if (!(p.table in tables)) {
                 tables[p.table] = 0; // Mark table as existing but empty
             }
         });
         */


         // Find existing table with fewest players below max capacity
         const sortedTables = Object.entries(tables)
             .map(([num, count]) => ({ tableNum: parseInt(num), count: count }))
             .sort((a, b) => a.count - b.count); // Sort by player count ascending

         for (const tableInfo of sortedTables) {
             if (tableInfo.count < state.config.playersPerTable) {
                 minTableNum = tableInfo.tableNum;
                 break; // Found the best existing table
             }
         }

         // If no existing table has space, start a new one
         if (minTableNum === -1) {
             const existingTableNumbers = Object.keys(tables).map(Number);
             minTableNum = existingTableNumbers.length > 0 ? Math.max(...existingTableNumbers) + 1 : 1;
             console.log(`Starting new table ${minTableNum} for ${player.name}`);
             player.table = minTableNum;
             player.seat = 1; // First seat at the new table
         } else {
             // Find the first available seat number at the chosen table
             const occupiedSeats = state.live.players
                 .filter(p => p.table === minTableNum)
                 .map(p => p.seat);
             let seatNum = 1;
             while (occupiedSeats.includes(seatNum)) {
                 seatNum++;
             }
             // Safety check (should theoretically not be needed if logic is sound)
             if (seatNum > state.config.playersPerTable) {
                 console.error(`CRITICAL ERROR: No seat found on table ${minTableNum} for ${player.name}, assigning fallback seat ${occupiedSeats.length + 1}. Check balancing logic.`);
                 seatNum = occupiedSeats.length + 1;
             }
             player.table = minTableNum;
             player.seat = seatNum;
             console.log(`Assigned ${player.name} to Table ${minTableNum}, Seat ${seatNum}`);
         }
    }

    function balanceTables() {
        if (state.live.status === 'finished') return;
        if (state.live.players.length <= state.config.playersPerTable) {
             tableBalanceInfo.classList.add('hidden'); // Hide if only one table left or full
             return; // No need to balance one table
         }

        console.log("Checking table balance...");
        let balancingPerformed = false; // Track if any change was made in this call

        while (true) { // Loop until tables are balanced
            const tables = {};
            state.live.players.forEach(p => { tables[p.table] = (tables[p.table] || 0) + 1; });
            const tableCounts = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count }));

            if (tableCounts.length < 2) break; // Cannot balance

            tableCounts.sort((a, b) => a.count - b.count);
            const minTable = tableCounts[0];
            const maxTable = tableCounts[tableCounts.length - 1];

            if (maxTable.count - minTable.count < 2) {
                console.log("Tables are balanced.");
                tableBalanceInfo.classList.add('hidden');
                break; // Balanced!
            }

            // --- Ubalanse funnet ---
            balancingPerformed = true;
            tableBalanceInfo.classList.remove('hidden');
            console.log(`Balancing needed: Max table ${maxTable.tableNum} (${maxTable.count}), Min table ${minTable.tableNum} (${minTable.count}).`);

            // Find player to move: From the max table, ideally one who would be BB or Button next (complex),
            // or just random for simplicity in MVP.
            const playersOnMaxTable = state.live.players.filter(p => p.table === maxTable.tableNum);
            if (playersOnMaxTable.length === 0) { console.error("Balancing Error: Max table has no players!"); break; }

            // --- Simple Random Selection ---
             const playerToMoveIndex = Math.floor(Math.random() * playersOnMaxTable.length);
             const playerToMove = playersOnMaxTable[playerToMoveIndex];
            // --- End Simple Random Selection ---

            // Find new seat on the min table
             const occupiedSeatsMin = state.live.players
                 .filter(p => p.table === minTable.tableNum)
                 .map(p => p.seat);
             let newSeat = 1;
             while (occupiedSeatsMin.includes(newSeat)) { newSeat++; }

             if (newSeat > state.config.playersPerTable) {
                 console.error(`Balancing Error: No seat found on supposedly sparse table ${minTable.tableNum}.`);
                 alert(`Balanseringsfeil: Fant ikke ledig sete på bord ${minTable.tableNum}. Manuell sjekk kreves.`);
                 break; // Stop balancing to avoid further issues
             }

            const oldTable = playerToMove.table;
            const oldSeat = playerToMove.seat;

            // Move the player
            playerToMove.table = minTable.tableNum;
            playerToMove.seat = newSeat;

            const message = `Bordbalansering: ${playerToMove.name} flyttes fra Bord ${oldTable} Sete ${oldSeat} til Bord ${minTable.tableNum} Sete ${newSeat}.`;
            console.log(message);
            alert(message); // Pop-up notification

            // Loop continues to check if further balancing is needed
        } // End while loop

        if (balancingPerformed) {
            console.log("Balancing check complete. Saving state and updating UI.");
            state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
            saveTournamentState(state);
            updateUI(); // Update UI after balancing is fully done
        }
    }
    // === HELPER FUNCTIONS - TABLE MANAGEMENT END ===


    // === UI UPDATE FUNCTIONS START ===
    function renderPlayerList() {
        playerListUl.innerHTML = '';
        eliminatedPlayerListUl.innerHTML = '';
        const currentLevelNum = state.live.currentLevelIndex + 1;
        const isRebuyActive = state.config.type === 'rebuy' && currentLevelNum <= state.config.rebuyLevels;
        const isAddonActive = state.config.type === 'rebuy' && currentLevelNum > state.config.rebuyLevels;

        // Active players - sorted by table, then seat
        state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table)
        .forEach(player => {
            const li = document.createElement('li');

            // Player Info String
            let playerInfo = `${player.name} <span class="player-details">(Bord ${player.table}, Sete ${player.seat})</span>`;
            if (player.rebuys > 0) playerInfo += ` <span class="player-details">[${player.rebuys}R]</span>`;
            if (player.addon) playerInfo += ` <span class="player-details">[A]</span>`;
            if (state.config.type === 'knockout' && player.knockouts > 0) playerInfo += ` <span class="player-details">(KOs: ${player.knockouts})</span>`;

            // Action Buttons String
            let actions = '';
            if (isRebuyActive) {
                actions += `<button class="btn-rebuy" data-player-id="${player.id}" title="Registrer Rebuy">R</button>`;
            }
            if (isAddonActive && !player.addon) {
                 // Only show Addon button if player hasn't taken it yet
                 actions += `<button class="btn-addon" data-player-id="${player.id}" title="Registrer Addon">A</button>`;
            }
            actions += `<button class="btn-eliminate" data-player-id="${player.id}" title="Eliminer Spiller">X</button>`;

            li.innerHTML = `<span>${playerInfo}</span><div class="player-actions">${actions}</div>`;
            playerListUl.appendChild(li);
        });

        // Eliminated players - sorted by place (highest first, e.g., 1st place on top)
        state.live.eliminatedPlayers.sort((a, b) => a.place - b.place).forEach(player => {
             const li = document.createElement('li');
             let elimInfo = `${player.place}. ${player.name}`;
             if (player.rebuys > 0) elimInfo += ` <span class="player-details">[${player.rebuys}R]</span>`;
             if (player.addon) elimInfo += ` <span class="player-details">[A]</span>`;
             if (state.config.type === 'knockout' && player.knockouts > 0) elimInfo += ` <span class="player-details">(KOs: ${player.knockouts})</span>`;
             if (player.eliminatedBy) elimInfo += ` <span class="player-details">(av ${getPlayerNameById(player.eliminatedBy)})</span>`;

             li.innerHTML = `
                <span>${elimInfo}</span>
                <div class="player-actions">
                    <button class="btn-restore" data-player-id="${player.id}" title="Gjenopprett Spiller">G</button>
                </div>
            `;
            eliminatedPlayerListUl.appendChild(li);
        });

        // Update counts
        activePlayerCountSpan.textContent = state.live.players.length;
        eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length;

        // Add event listeners (delegation might be slightly more efficient, but this is clear)
        playerListUl.querySelectorAll('.btn-rebuy').forEach(btn => btn.addEventListener('click', handleRebuy));
        playerListUl.querySelectorAll('.btn-addon').forEach(btn => btn.addEventListener('click', handleAddon));
        playerListUl.querySelectorAll('.btn-eliminate').forEach(btn => btn.addEventListener('click', handleEliminate));
        eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(btn => btn.addEventListener('click', handleRestore));
    }

    function displayPrizes() {
        if (!prizeDisplayLive) return; // Exit if element doesn't exist

        prizeDisplayLive.innerHTML = '<h3>Premier (Estimat)</h3>'; // Reset content
        const prizeData = calculatePrizes();

        if (prizeData.length > 0) {
            const ol = document.createElement('ol');
            prizeData.forEach(p => {
                 const li = document.createElement('li');
                 li.textContent = `${p.place}. Plass: ${p.amount} kr (${p.percentage}%)`;
                 ol.appendChild(li);
            });
            prizeDisplayLive.appendChild(ol);
        } else {
            const potForPrizes = state.live.totalPot - (state.config.type === 'knockout' ? state.live.totalEntries * (state.config.bountyAmount || 0) : 0);
            if (potForPrizes > 0 && (!state.config.prizeDistribution || state.config.prizeDistribution.length === 0)) {
                prizeDisplayLive.innerHTML += '<p>Premiefordeling ikke definert.</p>';
            } else if (potForPrizes <= 0) {
                prizeDisplayLive.innerHTML += '<p>Ingen premiepott å fordele ennå.</p>';
            } else {
                 prizeDisplayLive.innerHTML += '<p>Beregner...</p>'; // Default message
            }
        }
    }

    function updateUI() {
        // --- Update Header & Clocks ---
        nameDisplay.textContent = state.config.name;
        currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // --- Update Timer & Blinds ---
        const currentLevelIndex = state.live.currentLevelIndex;
        const currentLevel = state.config.blindLevels[currentLevelIndex];
        const nextLevel = state.config.blindLevels[currentLevelIndex + 1];

        timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel);
        currentLevelDisplay.textContent = currentLevel ? currentLevel.level : 'N/A';
        nextBlindsDisplay.textContent = formatNextBlindsText(nextLevel);

        if (currentLevel && currentLevel.isBreak) {
            blindsDisplay.innerHTML = ''; // Clear blinds area
            blindsDisplay.classList.add('hidden'); // Hide the blinds display container
            breakInfo.classList.remove('hidden'); // Show break info
            breakInfo.textContent = `PAUSE (${formatTime(state.live.timeRemainingInLevel)})`;
        } else {
            blindsDisplay.classList.remove('hidden'); // Show blinds display
            breakInfo.classList.add('hidden');    // Hide break info
            blindsDisplay.innerHTML = formatBlindsHTML(currentLevel); // Update blinds using HTML formatter
        }

        // --- Update Secondary Info ---
        const activePlayersCount = state.live.players.length;
        // Started players calculation might be complex if players can be restored.
        // Using totalEntries might be misleading. Simple count for now:
        const startedPlayersCount = state.live.players.length + state.live.eliminatedPlayers.length;

        playersRemainingDisplay.textContent = activePlayersCount;
        playersStartedDisplay.textContent = startedPlayersCount; // Shows current unique players (active + eliminated)
        totalEntriesDisplay.textContent = state.live.totalEntries; // Buyins + Rebuys
        averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO');
        totalPotDisplay.textContent = state.live.totalPot.toLocaleString('nb-NO');

        // --- Update Late Reg ---
        const currentLevelNum = currentLevelIndex + 1;
        const lateRegOpen = currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished';
        if (state.config.lateRegLevel > 0) {
             lateRegStatusDisplay.textContent = `Late Reg: ${lateRegOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`;
        } else {
            lateRegStatusDisplay.textContent = 'Late Reg: Ikke tilgjengelig';
        }
        lateRegButton.disabled = !lateRegOpen || state.live.status === 'paused';

        // --- Update Controls ---
        startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke';
        prevLevelButton.disabled = currentLevelIndex <= 0 || state.live.status === 'finished';
        nextLevelButton.disabled = currentLevelIndex >= state.config.blindLevels.length - 1 || state.live.status === 'finished';
        adjustTimeMinusButton.disabled = state.live.status === 'finished';
        adjustTimePlusButton.disabled = state.live.status === 'finished';

        // --- Render Player Lists & Prizes ---
        renderPlayerList();
        displayPrizes();

         // --- Check if finished ---
         // Moved finish check to relevant actions (eliminate)
    }
    // === UI UPDATE FUNCTIONS END ===


    // === TIMER LOGIC START ===
    function tick() {
        if (state.live.status !== 'running') return; // Only run if timer is active

        state.live.timeRemainingInLevel--;

        if (state.live.timeRemainingInLevel < 0) {
            // --- Level Up ---
            state.live.currentLevelIndex++;
            if (state.live.currentLevelIndex >= state.config.blindLevels.length) {
                // Tournament ended by running out of levels
                console.log("Last defined level finished.");
                finishTournament();
                return;
            }
            const newLevel = state.config.blindLevels[state.live.currentLevelIndex];
            state.live.timeRemainingInLevel = newLevel.duration * 60;
            console.log(`Nivå ${newLevel.level} startet: ${formatNextBlindsText(newLevel)}`);
             // Optional: Lydsignal her?
            // Update UI immediately on level change
             updateUI();
             // Save state on level change
             saveTournamentState(state);
        } else {
             // Update UI every tick ONLY for timer and maybe real time clock
             timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel);
             // Optional: Update Blinds/Break text if needed (e.g., showing remaining break time)
             if (state.config.blindLevels[state.live.currentLevelIndex]?.isBreak) {
                 breakInfo.textContent = `PAUSE (${formatTime(state.live.timeRemainingInLevel)})`;
             }
             // Avoid full updateUI() every second for performance
        }

        // Auto-save periodically (e.g., every 30 seconds) - Less frequent than before
        if (state.live.timeRemainingInLevel % 30 === 0) {
            saveTournamentState(state);
        }
    }

     function startRealTimeClock() {
         if (realTimeInterval) clearInterval(realTimeInterval); // Clear existing if any
         realTimeInterval = setInterval(() => {
             currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
         }, 1000);
     }
    // === TIMER LOGIC END ===


    // === EVENT HANDLERS - CONTROLS START ===
    function handleStartPause() {
        if (state.live.status === 'finished') return;

        if (state.live.status === 'paused') {
            state.live.status = 'running';
            if (!timerInterval) {
                // Start the main timer interval ONLY if it's not already running
                timerInterval = setInterval(tick, 1000);
            }
             startPauseButton.textContent = 'Pause Klokke';
             lateRegButton.disabled = !(state.live.currentLevelIndex + 1 <= state.config.lateRegLevel && state.config.lateRegLevel > 0); // Re-enable late reg if applicable
            console.log("Timer started");
        } else { // status === 'running'
            state.live.status = 'paused';
            // Don't clear the interval, just let tick() do nothing
            startPauseButton.textContent = 'Start Klokke';
            lateRegButton.disabled = true; // Disable late reg when paused
            console.log("Timer paused");
            // Save state when pausing
            saveTournamentState(state);
        }
        // Update the button text immediately
        // updateUI(); // Full update might not be needed, just the button?
    }

    function handleAdjustTime(deltaSeconds) {
        if (state.live.status === 'finished') return;
        state.live.timeRemainingInLevel += deltaSeconds;

        // Ensure time doesn't go below 0 or above current level duration
        state.live.timeRemainingInLevel = Math.max(0, state.live.timeRemainingInLevel);
        const currentLevelDuration = state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60;
        if (currentLevelDuration) { // Check if duration exists
            state.live.timeRemainingInLevel = Math.min(currentLevelDuration, state.live.timeRemainingInLevel);
        }

        console.log(`Time adjusted by ${deltaSeconds / 60} min`);
        updateUI(); // Update display immediately
        saveTournamentState(state); // Save the change
    }

    function handleAdjustLevel(deltaIndex) {
        if (state.live.status === 'finished') return;
        const newIndex = state.live.currentLevelIndex + deltaIndex;

        if (newIndex >= 0 && newIndex < state.config.blindLevels.length) {
            state.live.currentLevelIndex = newIndex;
            const newLevel = state.config.blindLevels[newIndex];
            state.live.timeRemainingInLevel = newLevel.duration * 60; // Reset timer
            console.log(`Level manually set to ${newLevel.level}`);
            updateUI(); // Update everything
            saveTournamentState(state);
        } else {
            console.warn("Cannot adjust level beyond defined structure.");
        }
    }

    function handleEndTournament() {
         if (confirm("Er du sikker på at du vil avslutte turneringen?\nAll data for DENNE turneringen vil bli slettet fra nettleseren.")) {
             clearInterval(timerInterval);
             clearInterval(realTimeInterval);
             clearTournamentState(); // Remove from localStorage
             window.location.href = 'index.html'; // Go back to start
        }
    }
    // === EVENT HANDLERS - CONTROLS END ===


    // === EVENT HANDLERS - PLAYER ACTIONS START ===
     function handleRebuy(event) {
         const playerId = parseInt(event.target.dataset.playerId);
         const player = state.live.players.find(p => p.id === playerId);
         const currentLevelNum = state.live.currentLevelIndex + 1;

         if (!player || state.config.type !== 'rebuy' || !(currentLevelNum <= state.config.rebuyLevels)) {
              alert("Re-buy er ikke tilgjengelig for denne spilleren nå.");
              return;
         }

         if (confirm(`Registrere Re-buy (${state.config.rebuyCost} kr) for ${player.name}?`)) {
             player.rebuys = (player.rebuys || 0) + 1;
             state.live.totalPot += state.config.rebuyCost;
             state.live.totalEntries++; // Rebuy often counts as an entry towards prize pool calculation
             state.live.totalRebuys++;
             console.log(`${player.name} registered a rebuy (Total: ${player.rebuys}).`);
             updateUI();
             saveTournamentState(state);
         }
     }

     function handleAddon(event) {
         const playerId = parseInt(event.target.dataset.playerId);
         const player = state.live.players.find(p => p.id === playerId);
         const currentLevelNum = state.live.currentLevelIndex + 1;
         const isAddonPeriod = currentLevelNum > state.config.rebuyLevels; // Simple check: after rebuy period

          if (!player || state.config.type !== 'rebuy' || !isAddonPeriod || player.addon) {
              alert("Add-on er ikke tilgjengelig nå, eller spilleren har allerede tatt den.");
              return;
         }

         if (confirm(`Registrere Add-on (${state.config.addonCost} kr) for ${player.name}?`)) {
             player.addon = true;
             state.live.totalPot += state.config.addonCost;
             state.live.totalAddons++;
             // Addon does NOT typically count as a separate entry like rebuy might
             console.log(`${player.name} registered an add-on.`);
             updateUI();
             saveTournamentState(state);
         }
     }

    function handleEliminate(event) {
        if (state.live.status === 'finished') return;
        const playerId = parseInt(event.target.dataset.playerId);
        const playerIndex = state.live.players.findIndex(p => p.id === playerId);

        if (playerIndex === -1) { console.warn("Player not found for elimination."); return; }

        const player = state.live.players[playerIndex];
        let eliminatedByPlayerId = null;

        // --- Knockout Handling ---
        if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) {
             const activePlayerNames = state.live.players
                .filter(p => p.id !== playerId) // Exclude the player being eliminated
                .map(p => `${p.name} (Bord ${p.table}, Sete ${p.seat})`); // Provide context

             if (activePlayerNames.length > 0) {
                 // Simple prompt for MVP. Could be a dropdown/search later.
                 const promptMessage = `Hvem slo ut ${player.name}? Skriv inn navnet på spilleren som får bounty:\n\nAktive spillere:\n - ${activePlayerNames.join("\n - ")}`;
                 const eliminatorInput = prompt(promptMessage);

                 if (eliminatorInput && eliminatorInput.trim() !== '') {
                     const eliminatorName = eliminatorInput.trim().toLowerCase();
                     // Find the eliminator among active players (case-insensitive search)
                     // Need a robust search if names aren't unique, or use table/seat info from prompt.
                     // Simple search for MVP:
                     const eliminator = state.live.players.find(p => p.id !== playerId && p.name.toLowerCase() === eliminatorName);

                     if (eliminator) {
                         eliminatedByPlayerId = eliminator.id;
                         eliminator.knockouts = (eliminator.knockouts || 0) + 1;
                         state.live.knockoutLog.push({ eliminatedPlayerId: player.id, eliminatedByPlayerId: eliminator.id });
                         console.log(`${eliminator.name} gets bounty for eliminating ${player.name}.`);
                     } else {
                         alert(`Fant ikke spilleren "${eliminatorInput}" blant aktive spillere. Bounty må registreres manuelt.`);
                     }
                 } else {
                     console.log(`Ingen eliminator oppgitt for ${player.name}. Bounty ikke tildelt automatisk.`);
                 }
             } else {
                 console.log("Ingen andre aktive spillere å tildele bounty til.");
             }
        }
         // --- End Knockout Handling ---


        // --- Confirm Elimination ---
        if (confirm(`Er du sikker på at du vil eliminere ${player.name}?`)) {
            player.eliminated = true;
            player.eliminatedBy = eliminatedByPlayerId;
            // Assign place based on remaining players *before* moving them
            player.place = state.live.players.length;

            // Move player to eliminated list
            state.live.eliminatedPlayers.push(player);
            state.live.players.splice(playerIndex, 1); // Remove from active

            console.log(`${player.name} eliminated in ${player.place}. place.`);

            balanceTables(); // Check and perform balancing AFTER player is removed

            updateUI(); // Update lists, counts, prizes etc.
            saveTournamentState(state);

            // Check for winner AFTER updating state and UI
           if (state.live.players.length === 1) {
                finishTournament();
           } else if (state.live.players.length === 0) {
                // Edge case: Simultaneous elimination? Or error.
                console.warn("All players eliminated simultaneously? Finishing tournament.");
                 finishTournament(); // Handle this state
           }
        }
    }

     function handleRestore(event) {
         if (state.live.status === 'finished') { alert("Kan ikke gjenopprette spiller i en ferdig turnering."); return; }
         const playerId = parseInt(event.target.dataset.playerId);
         const playerIndex = state.live.eliminatedPlayers.findIndex(p => p.id === playerId);

         if (playerIndex === -1) { console.warn("Player not found for restoration."); return; }

         const player = state.live.eliminatedPlayers[playerIndex];
         if (confirm(`Gjenopprette ${player.name} til turneringen?`)) {
             const eliminatedBy = player.eliminatedBy; // Store who eliminated them before resetting

             // Reset player status
             player.eliminated = false;
             player.eliminatedBy = null;
             player.place = null;

             // Move back to active list
             state.live.eliminatedPlayers.splice(playerIndex, 1);
             state.live.players.push(player);

             // --- Revert Knockout if applicable ---
             if (state.config.type === 'knockout' && eliminatedBy) {
                 // Find the player who got the bounty (might be active or eliminated now)
                 const eliminator = state.live.players.find(p => p.id === eliminatedBy) || state.live.eliminatedPlayers.find(p => p.id === eliminatedBy);
                 if (eliminator && eliminator.knockouts > 0) {
                     eliminator.knockouts--;
                 }
                 // Remove from log
                 const logIndex = state.live.knockoutLog.findIndex(log => log.eliminatedPlayerId === player.id && log.eliminatedByPlayerId === eliminatedBy);
                 if (logIndex > -1) {
                     state.live.knockoutLog.splice(logIndex, 1);
                 }
                 console.log(`Reverted knockout for ${player.name} by ${eliminator ? eliminator.name : 'Ukjent'}.`);
             }
             // --- End Revert Knockout ---

             // Assign table/seat - simplest is to try putting them back, or assign new
             // Re-assigning might be best to potentially help balance
             assignTableSeat(player); // Assign to potentially new seat/table

             console.log(`${player.name} restored to the tournament at Table ${player.table}, Seat ${player.seat}.`);

             balanceTables(); // Check balance after adding player back

             updateUI();
             saveTournamentState(state);
         }
     }


     function handleLateReg() {
         const currentLevelNum = state.live.currentLevelIndex + 1;
         if (!(currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0) || state.live.status !== 'running') {
             alert("Sen registrering er ikke tilgjengelig nå.");
             return;
         }

         const playerName = prompt("Skriv inn navn på spilleren for sen registrering:");
         if (playerName && playerName.trim() !== '') {
             const name = playerName.trim();
             // Optional: Check if name already exists
             /*
             if (state.live.players.some(p => p.name.toLowerCase() === name.toLowerCase()) ||
                 state.live.eliminatedPlayers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
                 if (!confirm(`Spilleren "${name}" finnes allerede. Registrere likevel?`)) return;
             }
             */

             const player = {
                 id: generateUniqueId(), // Use unique ID from storage.js
                 name: name,
                 stack: state.config.startStack,
                 table: 0, seat: 0, // Will be assigned
                 rebuys: 0, addon: false, eliminated: false,
                 eliminatedBy: null, place: null, knockouts: 0
             };

             state.live.players.push(player); // Add to list
             assignTableSeat(player); // Assign table and seat

             state.live.totalPot += state.config.buyIn;
             state.live.totalEntries++; // Late reg counts as a full entry
             console.log(`${player.name} registered late (Table ${player.table}, Seat ${player.seat}).`);

             balanceTables(); // Check balance after adding player

             updateUI();
             saveTournamentState(state);
         }
     }
    // === EVENT HANDLERS - PLAYER ACTIONS END ===


    // === TOURNAMENT FINISH LOGIC START ===
    function finishTournament() {
         if (state.live.status === 'finished') return; // Already finished

         console.log("Attempting to finish tournament...");
         clearInterval(timerInterval);
         timerInterval = null;
         state.live.status = 'finished';

         // Assign place to the winner (if exactly one player left)
         if (state.live.players.length === 1) {
              const winner = state.live.players[0];
              winner.place = 1;
              // Move winner to eliminated list for final ranking display
              state.live.eliminatedPlayers.push(winner);
              state.live.players.splice(0, 1);
              console.log(`Winner: ${winner.name}`);
         } else if (state.live.players.length === 0 && state.live.eliminatedPlayers.length > 0) {
              console.log("Tournament finished with no active players left.");
              // This implies the last player(s) were just eliminated. Their places are already assigned.
         } else {
              // Handle case of multiple players left (e.g., chop) - MVP just marks finished
              console.log(`Tournament finished with ${state.live.players.length} players remaining (Chop?). Final places need manual assignment if chopped.`);
               // Assign remaining players a shared place? Or leave place as null?
               // state.live.players.forEach(p => { p.place = 1; }); // Example: Mark all as tied for 1st
         }

         // Sort final eliminated list by place
          state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));

         // Update UI to final state
         updateUI();

          // Disable controls definitively
         startPauseButton.disabled = true;
         prevLevelButton.disabled = true;
         nextLevelButton.disabled = true;
         adjustTimeMinusButton.disabled = true;
         adjustTimePlusButton.disabled = true;
         lateRegButton.disabled = true;
         playerListUl.querySelectorAll('button').forEach(b => b.disabled = true); // Disable actions on active list (if any remain)
         eliminatedPlayerListUl.querySelectorAll('button').forEach(b => b.disabled = true); // Disable restore button

         console.log("Tournament officially finished!");
         timerDisplay.textContent = "FERDIG";
         alert("Turneringen er ferdig!");

         // Save final state one last time
         saveTournamentState(state);

         // Display final prize summary (already called in updateUI)
         // displayPrizes(); // Ensure it's called if not part of updateUI
     }
    // === TOURNAMENT FINISH LOGIC END ===


    // === EVENT LISTENER ATTACHMENT START ===
    startPauseButton.addEventListener('click', handleStartPause);
    prevLevelButton.addEventListener('click', () => handleAdjustLevel(-1));
    nextLevelButton.addEventListener('click', () => handleAdjustLevel(1));
    adjustTimeMinusButton.addEventListener('click', () => handleAdjustTime(-60));
    adjustTimePlusButton.addEventListener('click', () => handleAdjustTime(60));
    lateRegButton.addEventListener('click', handleLateReg);
    endTournamentButton.addEventListener('click', handleEndTournament);
    // Player action listeners are added dynamically in renderPlayerList()
    // === EVENT LISTENER ATTACHMENT END ===


    // === INITIAL UI RENDER & TIMER START ===
    updateUI(); // Initial render based on loaded state
    startRealTimeClock(); // Start the wall clock

    if (state.live.status === 'running') {
        // If loaded state was running, restart timer immediately
        timerInterval = setInterval(tick, 1000);
    } else if (state.live.status === 'finished') {
         // Ensure UI reflects finished state if loaded as such
         finishTournament();
    }
    // === INITIAL UI RENDER & TIMER START ===

});
// === DOMContentLoaded LISTENER END ===
