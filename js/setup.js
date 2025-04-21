// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    // === 02: DOM REFERENCES START ===
    const form = document.getElementById('setup-form'); const setupTitle = document.getElementById('setup-title'); const tournamentNameInput = document.getElementById('tournament-name'); const tournamentTypeSelect = document.getElementById('tournament-type'); const buyInInput = document.getElementById('buy-in'); const knockoutSection = document.getElementById('knockout-section'); const bountyAmountInput = document.getElementById('bounty-amount'); const startStackInput = document.getElementById('start-stack'); const playersPerTableInput = document.getElementById('players-per-table'); const rebuySection = document.getElementById('rebuy-section'); const rebuyCostInput = document.getElementById('rebuy-cost'); const rebuyChipsInput = document.getElementById('rebuy-chips'); const rebuyLevelsInput = document.getElementById('rebuy-levels'); const addonCostInput = document.getElementById('addon-cost'); const addonChipsInput = document.getElementById('addon-chips'); const paidPlacesInput = document.getElementById('paid-places'); const prizeDistInput = document.getElementById('prize-distribution'); const levelDurationInput = document.getElementById('level-duration'); const lateRegLevelInput = document.getElementById('late-reg-level'); const blindStructureBody = document.getElementById('blind-structure-body'); const playerNamesTextarea = document.getElementById('player-names'); const btnGeneratePayout = document.getElementById('btn-generate-payout'); const btnGenerateBlinds = document.getElementById('btn-generate-blinds'); const btnClearBlinds = document.getElementById('btn-clear-blinds'); const btnAddLevel = document.getElementById('btn-add-level'); const btnStartTournament = document.getElementById('btn-start-tournament'); const btnSaveTemplate = document.getElementById('btn-save-template'); const btnBackToMain = document.getElementById('btn-back-to-main');
    // === 02: DOM REFERENCES END ===

    // === 03: STATE VARIABLES START ===
    let blindLevelCounter = 0; const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    const standardBlindLevels = [ {sb: 100, bb: 200}, {sb: 200, bb: 400}, {sb: 300, bb: 600}, {sb: 400, bb: 800, pauseMinutes: 10}, {sb: 500, bb: 1000}, {sb: 600, bb: 1200}, {sb: 800, bb: 1600}, {sb: 1000, bb: 2000, pauseMinutes: 10}, {sb: 1200, bb: 2400}, {sb: 1500, bb: 3000}, {sb: 2000, bb: 4000}, {sb: 2500, bb: 5000, pauseMinutes: 15}, {sb: 3000, bb: 6000}, {sb: 4000, bb: 8000}, {sb: 5000, bb: 10000}, {sb: 6000, bb: 12000}, {sb: 8000, bb: 16000}, {sb: 10000, bb: 20000}, {sb: 15000, bb: 30000}, {sb: 20000, bb: 40000} ];
    // === 03: STATE VARIABLES END ===

// === 04: HELPER FUNCTIONS - BLINDS START ===
    function roundToNearestValid(value, step = 100) { // Denne brukes KUN til standard blinds nå
        if (isNaN(value) || value <= 0) return step;
        const rounded = Math.round(value / step) * step;
        return Math.max(step, rounded);
    }
    function addBlindLevelRow(levelData = {}) {
        blindLevelCounter++; const row = blindStructureBody.insertRow(); row.dataset.levelNumber = blindLevelCounter;
        const defaultDuration = levelDurationInput.value || 20;
        const sb = levelData.sb ?? '';
        const bb = levelData.bb ?? '';
        const ante = levelData.ante ?? 0;
        const duration = levelData.duration ?? defaultDuration;
        const pauseMinutes = levelData.pauseMinutes ?? 0;
        // ENDRET: step="1" for sb, bb, ante. Fjernet onchange for bbInput.
        row.innerHTML = `<td><span class="level-number">${blindLevelCounter}</span></td><td><input type="number" class="sb-input" value="${sb}" min="0" step="1" required></td><td><input type="number" class="bb-input" value="${bb}" min="0" step="1" required></td><td><input type="number" class="ante-input" value="${ante}" min="0" step="1" placeholder="0"></td><td><input type="number" class="duration-input" value="${duration}" min="1" required></td><td><input type="number" class="pause-duration-input" value="${pauseMinutes}" min="0" placeholder="0"></td><td><button type="button" class="btn-remove-level" title="Fjern nivå ${blindLevelCounter}">X</button></td>`;
        row.querySelector('.btn-remove-level').onclick = () => { row.remove(); updateLevelNumbers(); };
        // const bbInput = row.querySelector('.bb-input'); // Ikke nødvendig lenger
        // const sbInput = row.querySelector('.sb-input'); // Ikke nødvendig lenger
        // bbInput.onchange = () => { ... }; // Fjernet automatisk SB-setting
    }
    function updateLevelNumbers() { const rows = blindStructureBody.querySelectorAll('tr'); rows.forEach((row, index) => { const levelNum = index + 1; row.dataset.levelNumber = levelNum; row.querySelector('.level-number').textContent = levelNum; row.querySelector('.btn-remove-level').title = `Fjern nivå ${levelNum}`; }); blindLevelCounter = rows.length; }
    function generateStandardBlinds() { blindStructureBody.innerHTML = ''; blindLevelCounter = 0; const duration = parseInt(levelDurationInput.value) || 20; standardBlindLevels.forEach(level => addBlindLevelRow({ ...level, duration: duration, ante: level.bb > 1000 ? level.bb : 0 })); updateLevelNumbers(); /* La til standard ante=bb for >1000 */ } // La til standard ante
// === 04: HELPER FUNCTIONS - BLINDS END ===

    // === 05: HELPER FUNCTIONS - PAYOUTS START ===
     function generateStandardPayout() { const places = parseInt(paidPlacesInput.value) || 0; if (places > 0 && standardPayouts[places]) { prizeDistInput.value = standardPayouts[places].join(', '); } else { prizeDistInput.value = ''; } }
    // === 05: HELPER FUNCTIONS - PAYOUTS END ===

    // === 06: HELPER FUNCTIONS - FORM POPULATION START ===
     function populateForm(config) { if (!config) return; tournamentNameInput.value = config.name || 'Ny Turnering'; tournamentTypeSelect.value = config.type || 'freezeout'; buyInInput.value = config.buyIn || 0; startStackInput.value = config.startStack || 10000; playersPerTableInput.value = config.playersPerTable || 9; paidPlacesInput.value = config.paidPlaces || 1; prizeDistInput.value = (config.prizeDistribution || []).join(', '); const firstLevelDuration = config.blindLevels?.find(l => l.duration > 0)?.duration; levelDurationInput.value = firstLevelDuration || 20; lateRegLevelInput.value = config.lateRegLevel || 0; tournamentTypeSelect.dispatchEvent(new Event('change')); if (config.type === 'knockout') bountyAmountInput.value = config.bountyAmount || 0; if (config.type === 'rebuy') { rebuyCostInput.value = config.rebuyCost || 0; rebuyChipsInput.value = config.rebuyChips || config.startStack; rebuyLevelsInput.value = config.rebuyLevels || 0; addonCostInput.value = config.addonCost || 0; addonChipsInput.value = config.addonChips || 0; } blindStructureBody.innerHTML = ''; blindLevelCounter = 0; if (config.blindLevels && config.blindLevels.length > 0) { config.blindLevels.forEach(level => addBlindLevelRow(level)); } else { generateStandardBlinds(); } updateLevelNumbers(); playerNamesTextarea.value = ''; }
    // === 06: HELPER FUNCTIONS - FORM POPULATION END ===

    // === 07: EVENT LISTENERS START ===
    tournamentTypeSelect.addEventListener('change', () => { const type = tournamentTypeSelect.value; rebuySection.classList.toggle('hidden', type !== 'rebuy'); knockoutSection.classList.toggle('hidden', type !== 'knockout'); });
    btnAddLevel.addEventListener('click', () => addBlindLevelRow()); btnGenerateBlinds.addEventListener('click', generateStandardBlinds); btnClearBlinds.addEventListener('click', () => { if (confirm("Slette hele blindstrukturen?")) { blindStructureBody.innerHTML = ''; blindLevelCounter = 0; } });
    btnGeneratePayout.addEventListener('click', generateStandardPayout); paidPlacesInput.addEventListener('change', generateStandardPayout);
    btnBackToMain.addEventListener('click', () => { window.location.href = 'index.html'; }); btnSaveTemplate.addEventListener('click', handleSaveTemplate); form.addEventListener('submit', handleStartTournament);
    // === 07: EVENT LISTENERS END ===

    // === 08: INITIALIZATION START ===
    const templateIdToLoad = getActiveTemplateId(); if (templateIdToLoad) { const template = loadTemplate(templateIdToLoad); if (template?.config) { populateForm(template.config); setupTitle.textContent = `Start fra Mal: ${template.config.name}`; console.log("Loaded template:", templateIdToLoad); } else { alert(`Kunne ikke laste mal ID: ${templateIdToLoad}`); generateStandardBlinds(); generateStandardPayout(); } clearActiveTemplateId(); } else { setupTitle.textContent = "Konfigurer Ny Turnering"; tournamentTypeSelect.dispatchEvent(new Event('change')); generateStandardBlinds(); generateStandardPayout(); }
    // === 08: INITIALIZATION END ===

// === 09: FORM SUBMISSION/SAVE HANDLERS START ===
    function collectConfigFromForm() {
        const config = {
            name: tournamentNameInput.value.trim() || "Ukjent Turnering",
            date: new Date().toISOString().slice(0, 10),
            type: tournamentTypeSelect.value,
            buyIn: parseInt(buyInInput.value) || 0,
            bountyAmount: 0,
            startStack: parseInt(startStackInput.value) || 10000,
            playersPerTable: parseInt(playersPerTableInput.value) || 9,
            paidPlaces: parseInt(paidPlacesInput.value) || 1,
            prizeDistribution: prizeDistInput.value.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p) && p >= 0),
            rebuyCost: 0, rebuyChips: 0, rebuyLevels: 0, addonCost: 0, addonChips: 0,
            lateRegLevel: parseInt(lateRegLevelInput.value) || 0,
            blindLevels: [],
        };
        if (config.type === 'rebuy') {
            config.rebuyCost = parseInt(rebuyCostInput.value) || 0;
            config.rebuyChips = parseInt(rebuyChipsInput.value) || config.startStack;
            config.rebuyLevels = parseInt(rebuyLevelsInput.value) || 0;
            config.addonCost = parseInt(addonCostInput.value) || 0;
            config.addonChips = parseInt(addonChipsInput.value) || 0;
        }
        if (config.type === 'knockout') {
            config.bountyAmount = parseInt(bountyAmountInput.value) || 0;
        }

        let isValid = true;
        let errorMessages = [];

        // --- Basic Validations ---
        if (config.startStack <= 0) { isValid = false; errorMessages.push("Start Stack må være større enn 0."); }
        if (config.playersPerTable < 2) { isValid = false; errorMessages.push("Maks spillere per bord må være minst 2."); }
        if (config.paidPlaces <= 0) { isValid = false; errorMessages.push("Antall betalte plasser må være minst 1."); }
        if (config.lateRegLevel < 0) { isValid = false; errorMessages.push("Late Reg nivå kan ikke være negativt."); }

        // --- Prize Distribution Validation ---
        if (config.prizeDistribution.length !== config.paidPlaces) {
            isValid = false; errorMessages.push(`Antall premier (${config.prizeDistribution.length}) matcher ikke Antall Betalte (${config.paidPlaces}).`);
        } else {
            const sum = config.prizeDistribution.reduce((a, b) => a + b, 0);
            if (Math.abs(sum - 100) > 0.1) { // Use tolerance
                isValid = false; errorMessages.push(`Premiesum (${sum.toFixed(1)}%) er ikke nøyaktig 100%.`);
            }
             if (config.prizeDistribution.some(p => p < 0)) {
                 isValid = false; errorMessages.push(`Premier kan ikke ha negativ prosent.`);
             }
        }

        // --- Type Specific Validations ---
        if (config.type === 'knockout') {
            if (config.bountyAmount < 0) { isValid = false; errorMessages.push("Bounty kan ikke være negativ."); }
            if (config.bountyAmount > config.buyIn) { isValid = false; errorMessages.push("Bounty kan ikke være større enn Buy-in."); }
        }
        if (config.type === 'rebuy') {
            if (config.rebuyCost < 0) { isValid = false; errorMessages.push("Re-buy kostnad kan ikke være negativ."); }
            if (config.rebuyChips <= 0) { isValid = false; errorMessages.push("Re-buy sjetonger må være større enn 0."); }
            if (config.rebuyLevels < 0) { isValid = false; errorMessages.push("Re-buy nivå kan ikke være negativt."); }
            if (config.addonCost < 0) { isValid = false; errorMessages.push("Add-on kostnad kan ikke være negativ."); }
            if (config.addonChips <= 0) { isValid = false; errorMessages.push("Add-on sjetonger må være større enn 0."); }
        }


        // --- Blind Level Validation ---
        config.blindLevels = [];
        let foundInvalidBlind = false;
        const blindRows = blindStructureBody.querySelectorAll('tr');
        if (blindRows.length === 0) {
            isValid = false; errorMessages.push("Minst ett blindnivå kreves.");
        } else {
            blindRows.forEach((row, index) => {
                const levelNum = index + 1;
                const sbInput = row.querySelector('.sb-input');
                const bbInput = row.querySelector('.bb-input');
                const anteInput = row.querySelector('.ante-input');
                const durationInput = row.querySelector('.duration-input');
                const pauseInput = row.querySelector('.pause-duration-input');
                const sb = parseInt(sbInput.value);
                const bb = parseInt(bbInput.value);
                const ante = parseInt(anteInput.value) || 0; // Default ante to 0 if empty or invalid
                const duration = parseInt(durationInput.value);
                const pauseMinutes = parseInt(pauseInput.value) || 0; // Default pause to 0
                let rowValid = true;
                [sbInput, bbInput, anteInput, durationInput, pauseInput].forEach(el => el.classList.remove('invalid'));

                if (isNaN(duration) || duration <= 0) { rowValid = false; durationInput.classList.add('invalid'); }
                if (isNaN(sb) || sb < 0) { rowValid = false; sbInput.classList.add('invalid');} // SB must be >= 0
                if (isNaN(bb) || bb <= 0) { rowValid = false; bbInput.classList.add('invalid');} // BB must be > 0
                // ENDRET: Fjernet roundToNearestValid check. Lagt til SB <= BB check.
                else if (sb > bb) { rowValid = false; sbInput.classList.add('invalid'); bbInput.classList.add('invalid'); /* Specific error added below */ }
                else if (bb > 0 && sb < 0) { rowValid = false; sbInput.classList.add('invalid'); } // Should be caught by sb<0 check, but defensive

                if (isNaN(ante) || ante < 0) { rowValid = false; anteInput.classList.add('invalid');}
                if (isNaN(pauseMinutes) || pauseMinutes < 0) { rowValid = false; pauseInput.classList.add('invalid');}

                if (!rowValid) {
                     foundInvalidBlind = true;
                } else if (sb > bb) { // Add specific error message after checking validity
                     errorMessages.push(`Nivå ${levelNum}: SB (${sb}) kan ikke være større enn BB (${bb}).`);
                     foundInvalidBlind = true; // Also mark as invalid overall
                }

                config.blindLevels.push({ level: levelNum, sb, bb, ante, duration, pauseMinutes });
            });
            if (foundInvalidBlind && !errorMessages.some(msg => msg.includes("blindstruktur"))) {
                 // Add a generic error if specific blind errors weren't already added
                 errorMessages.push("Ugyldige verdier i blindstruktur (sjekk markerte felt).");
            }
        }
         // Combine unique error messages
         const uniqueErrorMessages = [...new Set(errorMessages)];
        return { config, isValid: isValid && !foundInvalidBlind, errorMessages: uniqueErrorMessages };
    }

    function handleStartTournament(e) {
        e.preventDefault();
        console.log("Attempting to start tournament...");
        const { config, isValid, errorMessages } = collectConfigFromForm();

        if (!isValid) {
            alert("Vennligst rett følgende feil:\n\n- " + errorMessages.join("\n- "));
            console.log("Validation failed:", errorMessages);
            return;
        }

        // Double check blind levels exist after validation
        if (!config.blindLevels || config.blindLevels.length === 0) {
            alert("Kritisk feil: Ingen gyldige blindnivåer definert etter validering.");
            console.log("Validation failed: No valid blind levels after validation.");
            return;
        }
        console.log("Validation successful. Config:", config);

        // --- Initialize Live State ---
        const live = {
            status: "paused", // Start paused
            currentLevelIndex: 0,
            timeRemainingInLevel: config.blindLevels[0].duration * 60,
            timeRemainingInBreak: 0,
            isOnBreak: false,
            players: [],
            eliminatedPlayers: [],
            totalPot: 0,
            totalEntries: 0,
            totalRebuys: 0,
            totalAddons: 0,
            nextPlayerId: 1, // Start player ID counter
            knockoutLog: [],
            activityLog: [] // Initialize empty log
        };
        console.log("Live state initialized.");
        logActivity(live.activityLog, `Turnering "${config.name}" opprettet.`);

        // --- Handle Pre-registered Players ---
        const playerNames = playerNamesTextarea.value.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (playerNames.length > 0) {
            const numPlayers = playerNames.length;
            const playersPerTable = config.playersPerTable; // Max players per table
            const numTables = Math.ceil(numPlayers / playersPerTable);
            console.log(`Distributing ${numPlayers} players to ${numTables} tables (Max ${playersPerTable} per table)...`);

            let playerIndex = 0;
            const tables = Array.from({ length: numTables }, () => []); // Array to hold players for each table index

            // Assign players round-robin style
            while (playerIndex < numPlayers) {
                for (let t = 0; t < numTables && playerIndex < numPlayers; t++) {
                    if (tables[t].length < playersPerTable) {
                         const name = playerNames[playerIndex];
                         const player = {
                             id: live.nextPlayerId++,
                             name: name,
                             stack: config.startStack,
                             table: t + 1, // Table number (1-based)
                             seat: tables[t].length + 1, // Seat number (1-based)
                             rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0
                         };
                         tables[t].push(player);
                         live.totalPot += config.buyIn;
                         live.totalEntries++;
                         playerIndex++;
                    }
                }
            }
            live.players = tables.flat();
            live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
            logActivity(live.activityLog, `Startet med ${numPlayers} spillere fordelt på ${numTables} bord.`);
            console.log("Initial player distribution complete.");
        } else {
            logActivity(live.activityLog, `Startet uten forhåndsregistrerte spillere.`);
            console.log("No players pre-registered.");
        }

        // --- Save and Redirect ---
        const tournamentState = { config, live };
        const tournamentId = generateUniqueId('t');
        console.log(`Generated new tournament ID: ${tournamentId}`);
        console.log("Attempting to save tournament state...");

        if (saveTournamentState(tournamentId, tournamentState)) {
            console.log(`Save successful for ${tournamentId}. Setting active ID...`);
            setActiveTournamentId(tournamentId);
            clearActiveTemplateId(); // Ensure no template ID is active
            console.log(`Active tournament ID set to ${getActiveTournamentId()}. Redirecting...`);
            window.location.href = 'tournament.html';
        } else {
            console.error("Saving tournament state failed!");
            alert("Feil ved lagring av turnering.");
        }
    }

    function handleSaveTemplate() {
        console.log("Attempting to save template...");
        const { config, isValid, errorMessages } = collectConfigFromForm();

        if (!isValid) {
            alert("Malen kan ikke lagres pga. feil i konfigurasjonen:\n\n- " + errorMessages.join("\n- "));
            console.log("Template validation failed:", errorMessages);
            return;
        }

        const templateId = generateUniqueId('tmpl');
        const templateData = { config }; // Template only stores the config part

        console.log(`Generated template ID: ${templateId}`);
        if (saveTemplate(templateId, templateData)) {
            alert(`Malen "${config.name}" er lagret!`);
            console.log(`Template ${templateId} ("${config.name}") saved.`);
        } else {
            alert(`Kunne ikke lagre malen.`);
            console.error(`Failed to save template ${templateId}`);
        }
    }
// === 09: FORM SUBMISSION/SAVE HANDLERS END ===
});
// === 01: DOMContentLoaded LISTENER END ===
