document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let state = loadTournamentState();
    let timerInterval = null;

    // --- DOM Element References ---
    const nameDisplay = document.getElementById('tournament-name-display');
    const currentTimeDisplay = document.getElementById('current-time');
    const timerDisplay = document.getElementById('timer-display');
    const currentLevelDisplay = document.getElementById('current-level');
    const nextBlindsDisplay = document.getElementById('next-blinds');
    const currentSbDisplay = document.getElementById('current-sb');
    const currentBbDisplay = document.getElementById('current-bb');
    const currentAnteDisplay = document.getElementById('current-ante');
    const blindsDisplay = document.getElementById('blinds-display');
    const breakInfo = document.getElementById('break-info');
    const playersRemainingDisplay = document.getElementById('players-remaining');
    const playersStartedDisplay = document.getElementById('players-started');
    const totalEntriesDisplay = document.getElementById('total-entries');
    const averageStackDisplay = document.getElementById('average-stack');
    const totalPotDisplay = document.getElementById('total-pot');
    const lateRegStatusDisplay = document.getElementById('late-reg-status');
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
    const endTournamentButton = document.getElementById('btn-end-tournament');


    // --- Initialization ---
    if (!state) {
        alert("Ingen turneringsdata funnet. Sender deg til startsiden.");
        window.location.href = 'index.html';
        return; // Stop script execution
    }

    // --- Helper Functions ---
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function formatBlinds(level) {
        if (!level) return "N/A";
        if (level.isBreak) return `Pause (${level.duration} min)`;
        const anteText = level.ante > 0 ? ` (${level.ante} Ante)` : '';
        return `${level.sb} / ${level.bb}${anteText}`;
    }

     function calculateTotalChips() {
        let total = 0;
        state.live.players.forEach(p => {
             // Start stack + rebuys + addon chips
             total += state.config.startStack;
             total += p.rebuys * (state.config.rebuyChips || 0);
             if (p.addon) total += (state.config.addonChips || 0);
        });
         // Include chips from eliminated players if needed for verification,
         // but usually average stack is based on active players' potential chips
         // Or simpler: total entries * start stack + total rebuys * rebuy chips + total addons * addon chips
         let calculatedTotal = state.live.totalEntries * state.config.startStack
                             + state.live.totalRebuys * (state.config.rebuyChips || 0)
                             + state.live.totalAddons * (state.config.addonChips || 0);

        return calculatedTotal;
    }

    function calculateAverageStack() {
        const activePlayers = state.live.players.length;
        if (activePlayers === 0) return 0;
        const totalChips = calculateTotalChips();
        return Math.round(totalChips / activePlayers);
    }

    function checkTableBalance() {
         if (state.live.players.length <= state.config.playersPerTable) {
             tableBalanceInfo.classList.add('hidden'); // Hide if only one table left or full
             return;
         }

        const tables = {};
        state.live.players.forEach(p => {
            tables[p.table] = (tables[p.table] || 0) + 1;
        });
        const counts = Object.values(tables);
        if (counts.length < 2) {
             tableBalanceInfo.classList.add('hidden');
             return; // Not enough tables to compare
        }
        const minPlayers = Math.min(...counts);
        const maxPlayers = Math.max(...counts);

        if (maxPlayers - minPlayers >= 2) {
            tableBalanceInfo.classList.remove('hidden');
        } else {
            tableBalanceInfo.classList.add('hidden');
        }
    }

     function assignTableSeat(player) {
         // Simple logic: Find the table with the fewest players, add to next available seat
         const tables = {};
         let minTable = -1;
         let minCount = Infinity;

         state.live.players.forEach(p => {
              if (p.id !== player.id) { // Don't count the player itself if already in list (e.g., late reg)
                 tables[p.table] = (tables[p.table] || 0) + 1;
              }
         });

         // Find table with fewest players, considering max capacity
         const sortedTables = Object.entries(tables).sort((a, b) => a[1] - b[1]);

         for (const [tableNumStr, count] of sortedTables) {
             const tableNum = parseInt(tableNumStr);
             if (count < state.config.playersPerTable) {
                 minTable = tableNum;
                 minCount = count;
                 break;
             }
         }

         // If all existing tables are full or no tables exist yet, start a new one
         if (minTable === -1) {
             minTable = Math.max(0, ...Object.keys(tables).map(Number)) + 1; // Next table number
             player.table = minTable;
             player.seat = 1; // First seat at new table
             state.live.nextTable = minTable;
             state.live.nextSeat = 2;
             console.log(`Started new table ${minTable} for ${player.name}`);
         } else {
             // Find the first available seat number at the chosen table
             const occupiedSeats = state.live.players
                 .filter(p => p.table === minTable)
                 .map(p => p.seat);
             let seatNum = 1;
             while (occupiedSeats.includes(seatNum)) {
                 seatNum++;
                 if (seatNum > state.config.playersPerTable) {
                      // Should not happen if minCount < playersPerTable, but as fallback:
                      console.error(`Error finding seat at table ${minTable} for ${player.name}. Assigning fallback.`);
                      seatNum = occupiedSeats.length + 1; // Assign next available numerically
                      break;
                 }
             }
             player.table = minTable;
             player.seat = seatNum;
             console.log(`Assigned ${player.name} to Table ${minTable}, Seat ${seatNum}`);
         }
          checkTableBalance(); // Check balance after adding player
    }

    // --- UI Update Functions ---
    function renderPlayerList() {
        playerListUl.innerHTML = '';
        eliminatedPlayerListUl.innerHTML = '';
        const currentLevelNum = state.live.currentLevelIndex + 1;

        state.live.players.sort((a, b) => { // Sort by table, then seat
            if (a.table !== b.table) return a.table - b.table;
            return a.seat - b.seat;
        }).forEach(player => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${player.name} (Bord ${player.table}, Sete ${player.seat}) ${player.rebuys > 0 ? `[${player.rebuys}R]` : ''} ${player.addon ? '[A]' : ''} ${state.config.type === 'knockout' ? `(KOs: ${player.knockouts})`: ''}</span>
                <div class="player-actions">
                    ${state.config.type === 'rebuy' && currentLevelNum <= state.config.rebuyLevels ? `<button class="btn-rebuy" data-player-id="${player.id}">Rebuy</button>` : ''}
                    ${state.config.type === 'rebuy' && currentLevelNum > state.config.rebuyLevels && !player.addon ? `<button class="btn-addon" data-player-id="${player.id}">Addon</button>` : ''}
                    <button class="btn-eliminate" data-player-id="${player.id}">Eliminer</button>
                </div>
            `;
            playerListUl.appendChild(li);
        });

         // Eliminated players - sorted by place (highest first)
        state.live.eliminatedPlayers.sort((a, b) => a.place - b.place).forEach(player => {
             const li = document.createElement('li');
             li.innerHTML = `
                <span>${player.name} (Plass: ${player.place}) ${player.rebuys > 0 ? `[${player.rebuys}R]` : ''} ${player.addon ? '[A]' : ''} ${state.config.type === 'knockout' ? `(KOs: ${player.knockouts})`: ''} ${player.eliminatedBy ? `(av ${getPlayerNameById(player.eliminatedBy)})` : ''}</span>
                <button class="btn-restore" data-player-id="${player.id}">Gjenopprett</button>
            `;
            eliminatedPlayerListUl.appendChild(li);
        });


        // Update counts
        activePlayerCountSpan.textContent = state.live.players.length;
        eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length;

        // Add event listeners for action buttons (must be done after render)
        playerListUl.querySelectorAll('.btn-rebuy').forEach(btn => btn.addEventListener('click', handleRebuy));
        playerListUl.querySelectorAll('.btn-addon').forEach(btn => btn.addEventListener('click', handleAddon));
        playerListUl.querySelectorAll('.btn-eliminate').forEach(btn => btn.addEventListener('click', handleEliminate));
        eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(btn => btn.addEventListener('click', handleRestore));
    }

     function getPlayerNameById(playerId) {
         const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId);
         return player ? player.name : 'Ukjent';
     }

    function updateUI() {
        nameDisplay.textContent = state.config.name;
        currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO');

        const currentLevel = state.config.blindLevels[state.live.currentLevelIndex];
        const nextLevel = state.config.blindLevels[state.live.currentLevelIndex + 1];

        timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel);
        currentLevelDisplay.textContent = currentLevel ? currentLevel.level : 'N/A';
        nextBlindsDisplay.textContent = formatBlinds(nextLevel);

        if (currentLevel && currentLevel.isBreak) {
            blindsDisplay.classList.add('hidden');
            breakInfo.classList.remove('hidden');
            breakInfo.textContent = `PAUSE (${currentLevel.duration} min)`;
        } else {
            blindsDisplay.classList.remove('hidden');
            breakInfo.classList.add('hidden');
            currentSbDisplay.textContent = currentLevel ? currentLevel.sb : '--';
            currentBbDisplay.textContent = currentLevel ? currentLevel.bb : '--';
            currentAnteDisplay.textContent = currentLevel ? currentLevel.ante : '--';
        }

        const activePlayersCount = state.live.players.length;
        const startCount = state.live.players.length + state.live.eliminatedPlayers.length; // Initial players before re-entries counted in totalEntries
        playersRemainingDisplay.textContent = activePlayersCount;
        playersStartedDisplay.textContent = startCount; // Shows unique players who started
        totalEntriesDisplay.textContent = state.live.totalEntries;
        averageStackDisplay.textContent = calculateAverageStack();
        totalPotDisplay.textContent = state.live.totalPot;

        // Update Late Reg Status & Button
        const currentLevelNum = state.live.currentLevelIndex + 1;
        const lateRegOpen = currentLevelNum <= state.config.lateRegLevel && state.live.status !== 'finished';
        lateRegStatusDisplay.textContent = `Late Reg: ${state.config.lateRegLevel > 0 ? (lateRegOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt') : 'Ikke tilgjengelig'}`;
        lateRegButton.disabled = !lateRegOpen || state.live.status === 'paused'; // Enable only if running and allowed


        // Update Start/Pause button text
        startPauseButton.textContent = state.live.status === 'running' ? 'Pause' : 'Start';

        // Render player lists
        renderPlayerList();

        // Check table balance
        checkTableBalance();

        // Check if tournament finished
        if (activePlayersCount <= 1 && state.live.status !== 'finished') {
            finishTournament();
        }
    }

    // --- Timer Logic ---
    function tick() {
        if (state.live.status !== 'running') return;

        state.live.timeRemainingInLevel--;

        if (state.live.timeRemainingInLevel < 0) {
            // Level up
            state.live.currentLevelIndex++;
            if (state.live.currentLevelIndex >= state.config.blindLevels.length) {
                // Tournament ended (last level finished)
                finishTournament();
                return;
            }
            const newLevel = state.config.blindLevels[state.live.currentLevelIndex];
            state.live.timeRemainingInLevel = newLevel.duration * 60;
            // Optional: Lydsignal her
            console.log(`Nivå ${newLevel.level} startet: ${formatBlinds(newLevel)}`);
             // Re-render player list to update rebuy/addon buttons if needed
             renderPlayerList();
        }

        // Update UI every tick
        updateUI();

        // Auto-save periodically (e.g., every 10 seconds)
        if (state.live.timeRemainingInLevel % 10 === 0) {
            saveTournamentState(state);
        }
    }

    // --- Event Handlers ---
    function handleStartPause() {
        if (state.live.status === 'paused') {
            state.live.status = 'running';
            if (!timerInterval) {
                timerInterval = setInterval(tick, 1000);
            }
            console.log("Timer started");
        } else if (state.live.status === 'running') {
            state.live.status = 'paused';
            // clearInterval(timerInterval); // Ikke clear intervallet, bare stopp tick() fra å gjøre noe
            // timerInterval = null;
            console.log("Timer paused");
        }
        updateUI(); // Oppdater knappetekst etc.
        saveTournamentState(state); // Lagre statusendring
    }

    function handleAdjustTime(deltaSeconds) {
        if (state.live.status === 'finished') return;
        state.live.timeRemainingInLevel += deltaSeconds;
        if (state.live.timeRemainingInLevel < 0) {
            state.live.timeRemainingInLevel = 0; // Ikke gå under null
        }
        const currentLevelDuration = state.config.blindLevels[state.live.currentLevelIndex].duration * 60;
         if (state.live.timeRemainingInLevel > currentLevelDuration) {
             state.live.timeRemainingInLevel = currentLevelDuration; // Ikke gå over nivåets lengde
         }
        console.log(`Time adjusted by ${deltaSeconds / 60} min`);
        updateUI();
        saveTournamentState(state);
    }

    function handleAdjustLevel(deltaIndex) {
        if (state.live.status === 'finished') return;
        const newIndex = state.live.currentLevelIndex + deltaIndex;
        if (newIndex >= 0 && newIndex < state.config.blindLevels.length) {
            state.live.currentLevelIndex = newIndex;
            const newLevel = state.config.blindLevels[newIndex];
            state.live.timeRemainingInLevel = newLevel.duration * 60; // Reset timer for new level
            console.log(`Level manually set to ${newLevel.level}`);
            updateUI();
             // Re-render player list to update rebuy/addon buttons
            renderPlayerList();
            saveTournamentState(state);
        } else {
            console.log("Cannot adjust level beyond limits.");
        }
    }

     function handleRebuy(event) {
         const playerId = parseInt(event.target.dataset.playerId);
         const player = state.live.players.find(p => p.id === playerId);
         const currentLevelNum = state.live.currentLevelIndex + 1;

         if (player && state.config.type === 'rebuy' && currentLevelNum <= state.config.rebuyLevels) {
             if (confirm(`Registrere Re-buy (${state.config.rebuyCost} kr) for ${player.name}?`)) {
                 player.rebuys = (player.rebuys || 0) + 1;
                 // player.stack += state.config.rebuyChips; // Stack oppdateres ikke her, kun registrering
                 state.live.totalPot += state.config.rebuyCost;
                 state.live.totalEntries++; // Rebuy counts as an entry for pot calculation usually
                 state.live.totalRebuys++;
                 console.log(`${player.name} registered a rebuy.`);
                 updateUI();
                 saveTournamentState(state);
             }
         } else {
             alert("Re-buy er ikke tilgjengelig nå.");
         }
     }

     function handleAddon(event) {
         const playerId = parseInt(event.target.dataset.playerId);
         const player = state.live.players.find(p => p.id === playerId);
         const currentLevelNum = state.live.currentLevelIndex + 1;

          if (player && state.config.type === 'rebuy' && currentLevelNum > state.config.rebuyLevels && !player.addon) {
             if (confirm(`Registrere Add-on (${state.config.addonCost} kr) for ${player.name}?`)) {
                 player.addon = true;
                 // player.stack += state.config.addonChips; // Stack oppdateres ikke her
                 state.live.totalPot += state.config.addonCost;
                 state.live.totalAddons++;
                 console.log(`${player.name} registered an add-on.`);
                 updateUI();
                 saveTournamentState(state);
             }
         } else {
              alert("Add-on er ikke tilgjengelig nå, eller spilleren har allerede tatt den.");
         }
     }

    function handleEliminate(event) {
        const playerId = parseInt(event.target.dataset.playerId);
        const playerIndex = state.live.players.findIndex(p => p.id === playerId);

        if (playerIndex !== -1) {
            const player = state.live.players[playerIndex];
            let eliminatedByPlayerId = null;

            if (state.config.type === 'knockout' && state.config.bountyAmount > 0) {
                // Prompt for who eliminated the player
                 const eliminatorName = prompt(`Hvem slo ut ${player.name}? Skriv inn navn på spilleren som får bounty:`);
                 if (eliminatorName !== null && eliminatorName.trim() !== '') {
                     // Find the eliminator among active players
                     const eliminator = state.live.players.find(p => p.name.toLowerCase() === eliminatorName.trim().toLowerCase() && p.id !== player.id);
                     if (eliminator) {
                         eliminatedByPlayerId = eliminator.id;
                         eliminator.knockouts = (eliminator.knockouts || 0) + 1; // Track KOs
                         state.live.knockoutLog.push({ eliminatedPlayerId: player.id, eliminatedByPlayerId: eliminator.id });
                         console.log(`${eliminator.name} gets bounty for eliminating ${player.name}.`);
                     } else {
                         alert(`Fant ikke spilleren "${eliminatorName}" blant aktive spillere. Bounty blir ikke registrert automatisk.`);
                     }
                 } else {
                     console.log(`Ingen eliminator oppgitt for ${player.name}.`);
                 }
            }

            if (confirm(`Eliminere ${player.name}?`)) {
                player.eliminated = true;
                player.eliminatedBy = eliminatedByPlayerId;
                player.place = state.live.players.length + state.live.eliminatedPlayers.length; // Total players initially determines highest place
                // Adjust place based on remaining players
                 player.place = state.live.players.length; // Simpler: Place is number of players left when eliminated

                // Move player to eliminated list
                state.live.eliminatedPlayers.push(player);
                state.live.players.splice(playerIndex, 1);

                console.log(`${player.name} eliminated in ${player.place}. place.`);

                updateUI(); // Oppdater lister, tellere, etc.
                checkTableBalance(); // Sjekk om bord må slås sammen
                saveTournamentState(state);

                 // Check for winner immediately
                if (state.live.players.length === 1) {
                     finishTournament();
                }
            }
        }
    }

     function handleRestore(event) {
         const playerId = parseInt(event.target.dataset.playerId);
         const playerIndex = state.live.eliminatedPlayers.findIndex(p => p.id === playerId);

         if (playerIndex !== -1) {
             const player = state.live.eliminatedPlayers[playerIndex];
             if (confirm(`Gjenopprette ${player.name} til turneringen?`)) {
                 // Remove from eliminated list
                 state.live.eliminatedPlayers.splice(playerIndex, 1);

                 // Reset elimination status
                 player.eliminated = false;
                 const eliminatedBy = player.eliminatedBy; // Store who eliminated them
                 player.eliminatedBy = null;
                 player.place = null;

                 // Put back into active players list
                 state.live.players.push(player);

                 // If KO, revert the knockout count and log
                 if (state.config.type === 'knockout' && eliminatedBy) {
                     const eliminator = state.live.players.find(p => p.id === eliminatedBy);
                     if (eliminator && eliminator.knockouts > 0) {
                         eliminator.knockouts--;
                     }
                      // Remove from log
                      const logIndex = state.live.knockoutLog.findIndex(log => log.eliminatedPlayerId === player.id && log.eliminatedByPlayerId === eliminatedBy);
                     if (logIndex > -1) {
                          state.live.knockoutLog.splice(logIndex, 1);
                     }
                     console.log(`Reverted knockout for ${player.name} by ${getPlayerNameById(eliminatedBy)}.`);
                 }

                 // Re-assign table/seat might be complex, keep original for now or assign simply
                 // For simplicity, let's just keep original table/seat for MVP restore
                 // Or try re-assigning:
                 // assignTableSeat(player); // May place them somewhere new

                 console.log(`${player.name} restored to the tournament.`);
                 updateUI();
                 checkTableBalance();
                 saveTournamentState(state);
             }
         }
     }


     function handleLateReg() {
         const currentLevelNum = state.live.currentLevelIndex + 1;
         if (currentLevelNum > state.config.lateRegLevel || state.live.status !== 'running') {
             alert("Sen registrering er ikke tilgjengelig nå.");
             return;
         }

         const playerName = prompt("Skriv inn navn på spilleren for sen registrering:");
         if (playerName && playerName.trim() !== '') {
             const name = playerName.trim();
              // Check if player name already exists (optional)
             /*
             if (state.live.players.some(p => p.name.toLowerCase() === name.toLowerCase()) ||
                 state.live.eliminatedPlayers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
                 alert(`Spilleren "${name}" er allerede registrert eller eliminert.`);
                 return;
             }
             */

             const player = {
                 id: generateUniqueId(), // Bruk en unik ID generator
                 name: name,
                 stack: state.config.startStack, // Full startstack for late reg
                 table: 0, // Assignes av assignTableSeat
                 seat: 0,  // Assignes av assignTableSeat
                 rebuys: 0,
                 addon: false,
                 eliminated: false,
                 eliminatedBy: null,
                 place: null,
                 knockouts: 0
             };

             state.live.players.push(player); // Add to active players first
             assignTableSeat(player); // Assign table and seat

             state.live.totalPot += state.config.buyIn;
             state.live.totalEntries++; // Late reg counts as a full entry
             console.log(`${player.name} registered late (Table ${player.table}, Seat ${player.seat}).`);

             updateUI();
             saveTournamentState(state);
         }
     }

    function finishTournament() {
         if (state.live.status === 'finished') return; // Already finished

         clearInterval(timerInterval);
         timerInterval = null;
         state.live.status = 'finished';

         console.log("Tournament finished!");
         timerDisplay.textContent = "FERDIG";
         blindsDisplay.classList.add('hidden');
         breakInfo.classList.add('hidden');
         startPauseButton.disabled = true;
         prevLevelButton.disabled = true;
         nextLevelButton.disabled = true;
         adjustTimeMinusButton.disabled = true;
         adjustTimePlusButton.disabled = true;
         lateRegButton.disabled = true;

         // Assign place to the winner(s)
         if (state.live.players.length === 1) {
              const winner = state.live.players[0];
              winner.place = 1;
               // Move winner to eliminated list for final ranking display
               state.live.eliminatedPlayers.push(winner);
               state.live.players.splice(0, 1);
               state.live.eliminatedPlayers.sort((a, b) => a.place - b.place); // Sort final list
               console.log(`Winner: ${winner.name}`);
         } else {
              // Handle case of multiple players left (e.g., chop) - MVP just marks finished
              console.log("Tournament finished with multiple players remaining.");
         }


          // Display final results (simple version)
          renderPlayerList(); // Re-render to show final state
          alert("Turneringen er ferdig!");


          // Optionally display prize payouts here based on state.config.paidPlaces and state.config.prizeDistribution
          displayPrizes();


         // State should still be saved to allow viewing results later,
         // but user needs to manually clear it via index page or button.
         saveTournamentState(state); // Save final state
     }

     function displayPrizes() {
         const resultsArea = document.createElement('div');
         resultsArea.id = 'results-area';
         resultsArea.style.marginTop = '20px';
         resultsArea.style.padding = '15px';
         resultsArea.style.border = '1px solid green';
         resultsArea.innerHTML = '<h2>Resultater</h2>';

         const resultsList = document.createElement('ol');
         const potForPrizes = state.live.totalPot - (state.config.type === 'knockout' ? state.live.totalEntries * state.config.bountyAmount : 0);

         const rankedPlayers = [...state.live.eliminatedPlayers].sort((a, b) => a.place - b.place);

         for (let i = 0; i < state.config.paidPlaces; i++) {
             const player = rankedPlayers[i];
             if (!player) break; // Less players finished than paid places

             const prizePercentage = state.config.prizeDistribution[i] || 0;
             const prizeAmount = Math.round((potForPrizes * prizePercentage) / 100);

             const li = document.createElement('li');
             li.textContent = `${player.place}. Plass: ${player.name} - ${prizeAmount} kr (${prizePercentage}%)`;
             resultsList.appendChild(li);
         }
         resultsArea.appendChild(resultsList);

          // Add Knockout summary if applicable
          if (state.config.type === 'knockout' && state.config.bountyAmount > 0) {
              const koHeader = document.createElement('h3');
              koHeader.textContent = `Knockout Bounties (${state.config.bountyAmount} kr per KO)`;
              resultsArea.appendChild(koHeader);
              const koList = document.createElement('ul');
              const allPlayersRanked = [...rankedPlayers, ...state.live.players].sort((a, b) => (a.place || Infinity) - (b.place || Infinity)); // Include winner if still in players[]

              allPlayersRanked.forEach(p => {
                  if (p.knockouts > 0) {
                      const koLi = document.createElement('li');
                      koLi.textContent = `${p.name}: ${p.knockouts} KOs = ${p.knockouts * state.config.bountyAmount} kr`;
                      koList.appendChild(koLi);
                  }
              });
               resultsArea.appendChild(koList);
          }


         // Add area after player lists
         const managementDiv = document.querySelector('.player-management');
         if (managementDiv) {
              // Remove old results if any
             const oldResults = document.getElementById('results-area');
             if(oldResults) oldResults.remove();
             // Insert below the lists
             managementDiv.parentNode.insertBefore(resultsArea, managementDiv.nextSibling);
         }
     }


    // --- Attach Event Listeners ---
    startPauseButton.addEventListener('click', handleStartPause);
    prevLevelButton.addEventListener('click', () => handleAdjustLevel(-1));
    nextLevelButton.addEventListener('click', () => handleAdjustLevel(1));
    adjustTimeMinusButton.addEventListener('click', () => handleAdjustTime(-60));
    adjustTimePlusButton.addEventListener('click', () => handleAdjustTime(60));
    lateRegButton.addEventListener('click', handleLateReg);
    endTournamentButton.addEventListener('click', () => {
        if (confirm("Er du sikker på at du vil avslutte turneringen?\nAll data for DENNE turneringen vil bli slettet.")) {
             clearTournamentState();
             window.location.href = 'index.html';
        }
    });


    // --- Initial Render ---
    updateUI();
    if (state.live.status === 'running') {
        // If loaded state was running, restart timer immediately
        timerInterval = setInterval(tick, 1000);
    } else if (state.live.status === 'finished') {
         finishTournament(); // Ensure UI is in finished state
         displayPrizes(); // Show prizes if loaded finished state
    }

});
