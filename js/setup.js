// === DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    // === DOM REFERENCES START ===
    const form = document.getElementById('setup-form');
    const tournamentTypeSelect = document.getElementById('tournament-type');
    const rebuySection = document.getElementById('rebuy-section');
    const knockoutSection = document.getElementById('knockout-section');
    const blindStructureBody = document.getElementById('blind-structure-body');
    const levelDurationInput = document.getElementById('level-duration');
    const paidPlacesInput = document.getElementById('paid-places');
    const prizeDistInput = document.getElementById('prize-distribution');
    const startStackInput = document.getElementById('start-stack');
    // === DOM REFERENCES END ===


    // === STATE VARIABLES START ===
    let blindLevelCounter = 0; // Holder styr på antall nivåer for nummerering
    // Standard payout structures (example, can be expanded)
    const standardPayouts = {
        1: [100],
        2: [65, 35],
        3: [50, 30, 20],
        4: [45, 27, 18, 10],
        5: [40, 25, 16, 11, 8],
        6: [38, 24, 15, 10, 8, 5],
        7: [36, 23, 14, 10, 8, 5, 4],
        8: [35, 22, 13, 9, 7, 6, 4, 4],
        9: [34, 21, 13, 9, 7, 6, 4, 3, 3],
       10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2]
        // Add more structures as needed
    };
    // === STATE VARIABLES END ===


    // === HELPER FUNCTIONS - BLINDS START ===
    function addBlindLevelRow(levelData = {}, isGenerated = false) {
        blindLevelCounter++;
        const row = blindStructureBody.insertRow();
        row.dataset.levelNumber = blindLevelCounter; // Bruk data-attributt

        const defaultDuration = levelDurationInput.value || 20;

        row.innerHTML = `
            <td><span class="level-number">${blindLevelCounter}</span></td>
            <td><input type="number" class="sb-input" value="${levelData.sb ?? ''}" min="0" ${levelData.isBreak ? 'disabled' : ''}></td>
            <td><input type="number" class="bb-input" value="${levelData.bb ?? ''}" min="0" ${levelData.isBreak ? 'disabled' : ''}></td>
            <td><input type="number" class="ante-input" value="${levelData.ante ?? 0}" min="0" ${levelData.isBreak ? 'disabled' : ''}></td>
            <td><input type="number" class="duration-input" value="${levelData.duration ?? defaultDuration}" min="1"></td>
            <td><input type="checkbox" class="is-break-checkbox" ${levelData.isBreak ? 'checked' : ''}> Pause</td>
            <td><button type="button" class="btn-remove-level" title="Fjern nivå ${blindLevelCounter}">X</button></td>
        `;

        // Add event listeners for the new row
        row.querySelector('.btn-remove-level').addEventListener('click', () => {
            row.remove();
            updateLevelNumbers();
        });

        const breakCheckbox = row.querySelector('.is-break-checkbox');
        breakCheckbox.addEventListener('change', (e) => {
            const isBreak = e.target.checked;
            const sbInput = row.querySelector('.sb-input');
            const bbInput = row.querySelector('.bb-input');
            const anteInput = row.querySelector('.ante-input');
            sbInput.disabled = isBreak;
            bbInput.disabled = isBreak;
            anteInput.disabled = isBreak;
            if (isBreak) {
                // Clear blind values if it becomes a break
                sbInput.value = '';
                bbInput.value = '';
                anteInput.value = 0;
            }
        });
         // Initial disable state if it starts as a break
         if(levelData.isBreak) {
             breakCheckbox.dispatchEvent(new Event('change'));
         }
    }

    function updateLevelNumbers() {
        const rows = blindStructureBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const levelNum = index + 1;
            row.dataset.levelNumber = levelNum;
            row.querySelector('.level-number').textContent = levelNum;
             row.querySelector('.btn-remove-level').title = `Fjern nivå ${levelNum}`;
        });
        blindLevelCounter = rows.length; // Update the counter
    }

    function generateStandardBlinds() {
        blindStructureBody.innerHTML = ''; // Clear existing
        blindLevelCounter = 0;
        const startStack = parseInt(startStackInput.value) || 10000;
        const duration = parseInt(levelDurationInput.value) || 20;
        // Improved simple structure (adjust as needed)
        const blinds = [
            { sb: Math.round(startStack / 200), bb: Math.round(startStack / 100) }, // ~1%
            { sb: Math.round(startStack / 133), bb: Math.round(startStack / 67) },  // ~1.5%
            { sb: Math.round(startStack / 100), bb: Math.round(startStack / 50), ante: Math.round(startStack / 500) || 0 }, // ~2% + ante
            { sb: Math.round(startStack / 67), bb: Math.round(startStack / 33), ante: Math.round(startStack / 330) || 0 },  // ~3% + ante
            { isBreak: true, duration: 10 },
            { sb: Math.round(startStack / 50), bb: Math.round(startStack / 25), ante: Math.round(startStack / 250) || 0 },  // ~4% + ante
            { sb: Math.round(startStack / 33), bb: Math.round(startStack / 17), ante: Math.round(startStack / 170) || 0 },  // ~6% + ante
            { sb: Math.round(startStack / 25), bb: Math.round(startStack / 12.5), ante: Math.round(startStack / 125) || 0 }, // ~8% + ante
            { sb: Math.round(startStack / 17), bb: Math.round(startStack / 8.5), ante: Math.round(startStack / 85) || 0 },  // ~12% + ante
            { isBreak: true, duration: 10 },
            { sb: Math.round(startStack / 12.5), bb: Math.round(startStack / 6.25), ante: Math.round(startStack / 60) || 0 }, // ~16% + ante
            { sb: Math.round(startStack / 8.5), bb: Math.round(startStack / 4.25), ante: Math.round(startStack / 40) || 0 }, // ~24% + ante
            { sb: Math.round(startStack / 6), bb: Math.round(startStack / 3), ante: Math.round(startStack / 30) || 0 },     // ~33% + ante
        ].map(level => ({ ...level, bb: Math.max(level.sb || 0, level.bb || 0) })); // Ensure BB >= SB

        blinds.forEach(b => addBlindLevelRow({ ...b, duration: b.isBreak ? b.duration : duration }, true));
    }
     // === HELPER FUNCTIONS - BLINDS END ===


     // === HELPER FUNCTIONS - PAYOUTS START ===
     function generateStandardPayout() {
         const places = parseInt(paidPlacesInput.value) || 0;
         if (places > 0 && standardPayouts[places]) {
             prizeDistInput.value = standardPayouts[places].join(', ');
             console.log(`Generated standard payout for ${places} places.`);
         } else if (places > 0) {
             alert(`Ingen standard fordeling funnet for ${places} plasser. Legg inn manuelt.`);
             prizeDistInput.value = ''; // Clear if no standard found
         } else {
             prizeDistInput.value = ''; // Clear if places is 0 or invalid
         }
     }
     // === HELPER FUNCTIONS - PAYOUTS END ===


    // === EVENT LISTENERS START ===
    tournamentTypeSelect.addEventListener('change', () => {
        const type = tournamentTypeSelect.value;
        rebuySection.classList.toggle('hidden', type !== 'rebuy');
        knockoutSection.classList.toggle('hidden', type !== 'knockout');
    });

    document.getElementById('btn-add-level').addEventListener('click', () => addBlindLevelRow());
    document.getElementById('btn-generate-blinds').addEventListener('click', generateStandardBlinds);
     document.getElementById('btn-clear-blinds').addEventListener('click', () => {
         if (confirm("Er du sikker på at du vil slette hele blindstrukturen?")) {
             blindStructureBody.innerHTML = '';
             blindLevelCounter = 0;
         }
     });
     document.getElementById('btn-generate-payout').addEventListener('click', generateStandardPayout);

     document.getElementById('btn-back-to-main').addEventListener('click', () => {
        if (confirm("Er du sikker på at du vil gå tilbake? Endringer i dette skjemaet vil ikke bli lagret.")) {
            window.location.href = 'index.html';
        }
    });
    // === EVENT LISTENERS END ===


    // === INITIALIZATION START ===
    tournamentTypeSelect.dispatchEvent(new Event('change')); // Trigger initial show/hide
    generateStandardBlinds(); // Generate default blinds on load
     generateStandardPayout(); // Attempt to generate payout based on default paid places
    // === INITIALIZATION END ===


    // === FORM SUBMISSION HANDLER START ===
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        // --- 1. Data Collection START ---
        const config = {
            name: document.getElementById('tournament-name').value.trim() || "Ukjent Turnering",
            date: new Date().toISOString().slice(0, 10),
            type: tournamentTypeSelect.value,
            buyIn: parseInt(document.getElementById('buy-in').value) || 0,
            bountyAmount: 0,
            startStack: parseInt(startStackInput.value) || 10000,
            playersPerTable: parseInt(document.getElementById('players-per-table').value) || 9,
            paidPlaces: parseInt(paidPlacesInput.value) || 1,
            prizeDistribution: prizeDistInput.value.split(',')
                                   .map(p => parseFloat(p.trim()))
                                   .filter(p => !isNaN(p) && p >= 0), // Tillat 0%
            rebuyCost: 0,
            rebuyChips: 0,
            rebuyLevels: 0,
            addonCost: 0,
            addonChips: 0,
            lateRegLevel: parseInt(document.getElementById('late-reg-level').value) || 0,
            blindLevels: [],
        };

        if (config.type === 'rebuy') {
            config.rebuyCost = parseInt(document.getElementById('rebuy-cost').value) || 0;
            config.rebuyChips = parseInt(document.getElementById('rebuy-chips').value) || config.startStack;
            config.rebuyLevels = parseInt(document.getElementById('rebuy-levels').value) || 0;
            config.addonCost = parseInt(document.getElementById('addon-cost').value) || 0;
            config.addonChips = parseInt(document.getElementById('addon-chips').value) || 0;
        }
        if (config.type === 'knockout') {
            config.bountyAmount = parseInt(document.getElementById('bounty-amount').value) || 0;
        }
        // --- 1. Data Collection END ---


        // --- 2. Validation START ---
        let isValid = true;
        let errorMessages = [];

        if (config.startStack <= 0) {
             isValid = false;
             errorMessages.push("Start Stack må være større enn 0.");
        }
        if (config.playersPerTable < 2) {
             isValid = false;
             errorMessages.push("Maks spillere per bord må være minst 2.");
        }
        if (config.paidPlaces <= 0) {
             isValid = false;
             errorMessages.push("Antall betalte plasseringer må være minst 1.");
        }

        // Validate Prize Distribution
        if (config.prizeDistribution.length !== config.paidPlaces) {
            isValid = false;
            errorMessages.push(`Antall premier (${config.prizeDistribution.length}) stemmer ikke med Antall Betalte Plasseringer (${config.paidPlaces}).`);
        } else {
            const prizeSum = config.prizeDistribution.reduce((sum, p) => sum + p, 0);
            // Allow for tiny floating point inaccuracies
            if (Math.abs(prizeSum - 100) > 0.1) {
                isValid = false;
                errorMessages.push(`Summen av premiefordelingen (${prizeSum.toFixed(1)}%) er ikke 100%.`);
            }
        }

        // Validate Bounty Amount
         if (config.type === 'knockout' && config.bountyAmount > config.buyIn) {
             isValid = false;
             errorMessages.push("Bounty kan ikke være større enn Buy-in.");
         }
         if (config.type === 'knockout' && config.bountyAmount < 0) {
             isValid = false;
             errorMessages.push("Bounty kan ikke være negativ.");
         }


        // Collect and Validate Blind Structure
        const blindRows = blindStructureBody.querySelectorAll('tr');
        if (blindRows.length === 0) {
            isValid = false;
            errorMessages.push("Du må definere minst ett blindnivå.");
        }
        blindRows.forEach((row, index) => {
            const levelNum = index + 1;
            const isBreak = row.querySelector('.is-break-checkbox').checked;
            const sbInput = row.querySelector('.sb-input');
            const bbInput = row.querySelector('.bb-input');
            const anteInput = row.querySelector('.ante-input');
            const durationInput = row.querySelector('.duration-input');

            const level = {
                level: levelNum,
                sb: isBreak ? 0 : parseInt(sbInput.value),
                bb: isBreak ? 0 : parseInt(bbInput.value),
                ante: isBreak ? 0 : parseInt(anteInput.value) || 0, // Default ante to 0 if empty/NaN
                duration: parseInt(durationInput.value) || 20, // Use default if empty/invalid
                isBreak: isBreak,
            };

             // Validation within the loop
            if (level.duration <= 0) {
                isValid = false;
                errorMessages.push(`Nivå ${levelNum}: Varighet må være større enn 0.`);
                durationInput.style.borderColor = 'red'; // Highlight error
            } else {
                 durationInput.style.borderColor = '';
            }

            if (!isBreak) {
                 if (isNaN(level.sb) || level.sb < 0) {
                      isValid = false;
                      errorMessages.push(`Nivå ${levelNum}: Small Blind er ugyldig.`);
                      sbInput.style.borderColor = 'red';
                 } else {
                      sbInput.style.borderColor = '';
                 }
                 if (isNaN(level.bb) || level.bb <= 0) {
                      isValid = false;
                      errorMessages.push(`Nivå ${levelNum}: Big Blind må være større enn 0.`);
                      bbInput.style.borderColor = 'red';
                 } else if (level.bb < level.sb) {
                      isValid = false;
                      errorMessages.push(`Nivå ${levelNum}: Big Blind må være lik eller større enn Small Blind.`);
                      bbInput.style.borderColor = 'red';
                 } else {
                      bbInput.style.borderColor = '';
                 }
                 if (isNaN(level.ante) || level.ante < 0) {
                      isValid = false;
                      errorMessages.push(`Nivå ${levelNum}: Ante er ugyldig.`);
                      anteInput.style.borderColor = 'red';
                 } else {
                      anteInput.style.borderColor = '';
                 }
            } else {
                  // Clear borders for breaks
                  sbInput.style.borderColor = '';
                  bbInput.style.borderColor = '';
                  anteInput.style.borderColor = '';
            }


            config.blindLevels.push(level);
        });

        // Validate Player Names
        const playerNamesRaw = document.getElementById('player-names').value;
        const playerNames = playerNamesRaw.split('\n')
            .map(name => name.trim()).filter(name => name.length > 0);

        if (playerNames.length < 2) {
            isValid = false;
            errorMessages.push("Du må registrere minst to spillere.");
        }

        // --- 2. Validation END ---


        // --- 3. Handle Validation Result START ---
        if (!isValid) {
            alert("Vennligst rett følgende feil:\n\n- " + errorMessages.join("\n- "));
            return; // Stop submission
        }
        // --- 3. Handle Validation Result END ---


        // --- 4. Initialize Live State & Player Distribution START ---
         const live = {
            status: "paused", // 'paused', 'running', 'finished'
            currentLevelIndex: 0,
            timeRemainingInLevel: config.blindLevels[0].duration * 60,
            players: [],
            eliminatedPlayers: [],
            totalPot: 0,
            totalEntries: 0,
            totalRebuys: 0,
            totalAddons: 0,
            nextPlayerId: 1, // Start player IDs from 1
            knockoutLog: [], // { eliminatedPlayerId, eliminatedByPlayerId }
            // nextTable/Seat are less critical now with better initial distribution
        };

        // --- Improved Initial Player Distribution ---
         const numPlayers = playerNames.length;
         const playersPerTable = config.playersPerTable;
         const numTables = Math.ceil(numPlayers / playersPerTable);

         let playerIndex = 0;
         for (let t = 1; t <= numTables; t++) {
             const playersOnThisTable = Math.floor(numPlayers / numTables) + (t <= numPlayers % numTables ? 1 : 0);
             for (let s = 1; s <= playersOnThisTable; s++) {
                 if (playerIndex >= numPlayers) break;

                 const name = playerNames[playerIndex];
                 const player = {
                     id: live.nextPlayerId++, // Assign unique ID
                     name: name,
                     stack: config.startStack,
                     table: t,
                     seat: s,
                     rebuys: 0,
                     addon: false,
                     eliminated: false,
                     eliminatedBy: null,
                     place: null,
                     knockouts: 0
                 };
                 live.players.push(player);
                 live.totalPot += config.buyIn;
                 live.totalEntries++;
                 playerIndex++;
             }
         }
         live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); // Sort for consistency
         console.log(`Fordelte ${numPlayers} spillere på ${numTables} bord.`);
         // --- 4. Initialize Live State & Player Distribution END ---


        // --- 5. Save State and Navigate START ---
        const tournamentState = { config, live };
        try {
             saveTournamentState(tournamentState); // From storage.js
             window.location.href = 'tournament.html';
        } catch (error) {
             console.error("Klarte ikke lagre eller navigere:", error);
             alert("En feil oppstod under lagring av turneringsoppsettet.");
        }
        // --- 5. Save State and Navigate END ---
    });
    // === FORM SUBMISSION HANDLER END ===

});
// === DOMContentLoaded LISTENER END ===
