// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    // === 02: DOM REFERENCES START ===
    const form = document.getElementById('setup-form'); const setupTitle = document.getElementById('setup-title');
    const tournamentNameInput = document.getElementById('tournament-name'); const tournamentTypeSelect = document.getElementById('tournament-type'); const buyInInput = document.getElementById('buy-in');
    const knockoutSection = document.getElementById('knockout-section'); const bountyAmountInput = document.getElementById('bounty-amount');
    const startStackInput = document.getElementById('start-stack'); const playersPerTableInput = document.getElementById('players-per-table');
    const rebuySection = document.getElementById('rebuy-section'); const rebuyCostInput = document.getElementById('rebuy-cost'); const rebuyChipsInput = document.getElementById('rebuy-chips'); const rebuyLevelsInput = document.getElementById('rebuy-levels'); const addonCostInput = document.getElementById('addon-cost'); const addonChipsInput = document.getElementById('addon-chips');
    const paidPlacesInput = document.getElementById('paid-places'); const prizeDistInput = document.getElementById('prize-distribution');
    const levelDurationInput = document.getElementById('level-duration'); const lateRegLevelInput = document.getElementById('late-reg-level'); const blindStructureBody = document.getElementById('blind-structure-body');
    const playerNamesTextarea = document.getElementById('player-names');
    const btnGeneratePayout = document.getElementById('btn-generate-payout'); const btnGenerateBlinds = document.getElementById('btn-generate-blinds'); const btnClearBlinds = document.getElementById('btn-clear-blinds'); const btnAddLevel = document.getElementById('btn-add-level');
    const btnStartTournament = document.getElementById('btn-start-tournament'); const btnSaveTemplate = document.getElementById('btn-save-template'); const btnBackToMain = document.getElementById('btn-back-to-main');
    // === 02: DOM REFERENCES END ===

    // === 03: STATE VARIABLES START ===
    let blindLevelCounter = 0; const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    const standardBlindLevels = [ {sb: 100, bb: 200}, {sb: 200, bb: 400}, {sb: 300, bb: 600}, {sb: 400, bb: 800, pauseMinutes: 10}, {sb: 500, bb: 1000}, {sb: 600, bb: 1200}, {sb: 800, bb: 1600}, {sb: 1000, bb: 2000, pauseMinutes: 10}, {sb: 1200, bb: 2400}, {sb: 1500, bb: 3000}, {sb: 2000, bb: 4000}, {sb: 2500, bb: 5000, pauseMinutes: 15}, {sb: 3000, bb: 6000}, {sb: 4000, bb: 8000}, {sb: 5000, bb: 10000}, {sb: 6000, bb: 12000}, {sb: 8000, bb: 16000}, {sb: 10000, bb: 20000}, {sb: 15000, bb: 30000}, {sb: 20000, bb: 40000} ];
    // === 03: STATE VARIABLES END ===

    // === 04: HELPER FUNCTIONS - BLINDS START ===
    function roundToNearestValid(value, step = 100) { if (isNaN(value) || value <= 0) return step; const rounded = Math.round(value / step) * step; return Math.max(step, rounded); }
    function addBlindLevelRow(levelData = {}) {
        blindLevelCounter++; const row = blindStructureBody.insertRow(); row.dataset.levelNumber = blindLevelCounter;
        const defaultDuration = levelDurationInput.value || 20; const sb = levelData.sb ?? ''; const bb = levelData.bb ?? ''; const ante = levelData.ante ?? 0; const duration = levelData.duration ?? defaultDuration; const pauseMinutes = levelData.pauseMinutes ?? 0;
        row.innerHTML = `<td><span class="level-number">${blindLevelCounter}</span></td><td><input type="number" class="sb-input" value="${sb}" min="0" step="100" required></td><td><input type="number" class="bb-input" value="${bb}" min="0" step="100" required></td><td><input type="number" class="ante-input" value="${ante}" min="0" step="25" placeholder="0"></td><td><input type="number" class="duration-input" value="${duration}" min="1" required></td><td><input type="number" class="pause-duration-input" value="${pauseMinutes}" min="0" placeholder="0"></td><td><button type="button" class="btn-remove-level" title="Fjern nivå ${blindLevelCounter}">X</button></td>`;
        row.querySelector('.btn-remove-level').onclick = () => { row.remove(); updateLevelNumbers(); };
        const bbInput = row.querySelector('.bb-input'); const sbInput = row.querySelector('.sb-input'); bbInput.onchange = () => { const bbVal = parseInt(bbInput.value); if (!isNaN(bbVal) && bbVal > 0) sbInput.value = roundToNearestValid(Math.floor(bbVal / 2), 100); };
    }
    function updateLevelNumbers() { const rows = blindStructureBody.querySelectorAll('tr'); rows.forEach((row, index) => { const levelNum = index + 1; row.dataset.levelNumber = levelNum; row.querySelector('.level-number').textContent = levelNum; row.querySelector('.btn-remove-level').title = `Fjern nivå ${levelNum}`; }); blindLevelCounter = rows.length; }
    function generateStandardBlinds() { blindStructureBody.innerHTML = ''; blindLevelCounter = 0; const duration = parseInt(levelDurationInput.value) || 20; standardBlindLevels.forEach(level => addBlindLevelRow({ ...level, duration: duration, ante: 0 })); updateLevelNumbers(); alert("Standard blindstruktur lastet inn. Rediger etter behov."); }
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
        const config = { name: tournamentNameInput.value.trim() || "Ukjent Turnering", date: new Date().toISOString().slice(0, 10), type: tournamentTypeSelect.value, buyIn: parseInt(buyInInput.value) || 0, bountyAmount: 0, startStack: parseInt(startStackInput.value) || 10000, playersPerTable: parseInt(playersPerTableInput.value) || 9, paidPlaces: parseInt(paidPlacesInput.value) || 1, prizeDistribution: prizeDistInput.value.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p) && p >= 0), rebuyCost: 0, rebuyChips: 0, rebuyLevels: 0, addonCost: 0, addonChips: 0, lateRegLevel: parseInt(lateRegLevelInput.value) || 0, blindLevels: [], };
        if (config.type === 'rebuy') { config.rebuyCost = parseInt(rebuyCostInput.value) || 0; config.rebuyChips = parseInt(rebuyChipsInput.value) || config.startStack; config.rebuyLevels = parseInt(rebuyLevelsInput.value) || 0; config.addonCost = parseInt(addonCostInput.value) || 0; config.addonChips = parseInt(addonChipsInput.value) || 0; }
        if (config.type === 'knockout') { config.bountyAmount = parseInt(bountyAmountInput.value) || 0; }
        let isValid = true; let errorMessages = [];
        if (config.startStack <= 0) { isValid = false; errorMessages.push("Start Stack > 0."); } if (config.playersPerTable < 2) { isValid = false; errorMessages.push("Maks spillere/bord >= 2."); } if (config.paidPlaces <= 0) { isValid = false; errorMessages.push("Betalte plasser >= 1."); }
        if (config.prizeDistribution.length !== config.paidPlaces) { isValid = false; errorMessages.push("Antall premier != Antall Betalte."); } else { const sum = config.prizeDistribution.reduce((a, b) => a + b, 0); if (Math.abs(sum - 100) > 0.1) { isValid = false; errorMessages.push(`Premiesum (${sum.toFixed(1)}%) != 100%.`); } }
        if (config.type === 'knockout' && config.bountyAmount > config.buyIn) { isValid = false; errorMessages.push("Bounty > Buy-in."); } if (config.type === 'knockout' && config.bountyAmount < 0) { isValid = false; errorMessages.push("Bounty >= 0."); }
        config.blindLevels = []; let foundInvalidBlind = false; const blindRows = blindStructureBody.querySelectorAll('tr');
        if (blindRows.length === 0) { isValid = false; errorMessages.push("Minst ett blindnivå kreves."); }
        else {
            blindRows.forEach((row, index) => {
                const levelNum = index + 1; const sbInput = row.querySelector('.sb-input'); const bbInput = row.querySelector('.bb-input'); const anteInput = row.querySelector('.ante-input'); const durationInput = row.querySelector('.duration-input'); const pauseInput = row.querySelector('.pause-duration-input');
                const sb = parseInt(sbInput.value); const bb = parseInt(bbInput.value); const ante = parseInt(anteInput.value) || 0; const duration = parseInt(durationInput.value); const pauseMinutes = parseInt(pauseInput.value) || 0; let rowValid = true;
                [sbInput, bbInput, anteInput, durationInput, pauseInput].forEach(el => el.classList.remove('invalid'));
                if (isNaN(duration) || duration <= 0) { rowValid = false; durationInput.classList.add('invalid'); }
                if (isNaN(sb) || sb < 0) { rowValid = false; sbInput.classList.add('invalid');}
                if (isNaN(bb) || bb <= 0) { rowValid = false; bbInput.classList.add('invalid');}
                else if (bb > 0 && sb <= 0) { rowValid = false; sbInput.classList.add('invalid');}
                else if (bb > 0 && sb !== roundToNearestValid(Math.floor(bb/2), 100)) { rowValid = false; sbInput.classList.add('invalid'); bbInput.classList.add('invalid'); }
                if (isNaN(ante) || ante < 0) { rowValid = false; anteInput.classList.add('invalid');}
                if (isNaN(pauseMinutes) || pauseMinutes < 0) { rowValid = false; pauseInput.classList.add('invalid');}
                if (!rowValid) { foundInvalidBlind = true; errorMessages.push(`Nivå ${levelNum} har ugyldige verdier.`); }
                else { config.blindLevels.push({ level: levelNum, sb, bb, ante, duration, pauseMinutes }); }
            });
            if (foundInvalidBlind) isValid = false;
            if (isValid && config.blindLevels.length === 0) { isValid = false; errorMessages.push("Ingen gyldige blindnivåer funnet."); }
        }
        return { config, isValid, errorMessages };
    }

    function handleStartTournament(e) {
        e.preventDefault();
        console.log("Attempting to start tournament..."); // Log start

        const { config, isValid, errorMessages } = collectConfigFromForm();
        if (!isValid) {
            alert("Vennligst rett følgende feil:\n\n- " + errorMessages.join("\n- "));
            console.log("Validation failed:", errorMessages); // Log validation errors
            return;
        }

        // **** FIX: Ensure blindLevels[0] exists before accessing it ****
        if (!config.blindLevels || config.blindLevels.length === 0) {
            alert("Kritisk feil: Ingen gyldige blindnivåer definert.");
            console.log("Validation failed: No blind levels.");
            return;
        }
        console.log("Validation successful.");

        // Initialize Live State
        const live = { status: "paused", currentLevelIndex: 0, timeRemainingInLevel: config.blindLevels[0].duration * 60, timeRemainingInBreak: 0, isOnBreak: false, players: [], eliminatedPlayers: [], totalPot: 0, totalEntries: 0, totalRebuys: 0, totalAddons: 0, nextPlayerId: 1, knockoutLog: [], activityLog: [] };
        console.log("Live state initialized.");

        // Distribute players
        const playerNames = playerNamesTextarea.value.split('\n').map(name => name.trim()).filter(name => name.length > 0);
        if (playerNames.length > 0) {
            const numPlayers = playerNames.length; const playersPerTable = config.playersPerTable; const numTables = Math.ceil(numPlayers / playersPerTable); console.log(`Distributing ${numPlayers} players to ${numTables} tables...`);
            const basePlayersPerTable = Math.floor(numPlayers / numTables); let extraPlayers = numPlayers % numTables; let playerIndex = 0;
            for (let t = 1; t <= numTables; t++) { const playersOnThisTable = basePlayersPerTable + (extraPlayers > 0 ? 1 : 0); if (extraPlayers > 0) extraPlayers--; for (let s = 1; s <= playersOnThisTable; s++) { if (playerIndex >= numPlayers) break; const name = playerNames[playerIndex]; const player = { id: live.nextPlayerId++, name: name, stack: config.startStack, table: t, seat: s, rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0 }; live.players.push(player); live.totalPot += config.buyIn; live.totalEntries++; playerIndex++; } }
            live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
            logActivity(live.activityLog, `Startet turnering med ${numPlayers} spillere fordelt på ${numTables} bord.`);
        } else {
            logActivity(live.activityLog, `Startet turnering uten forhåndsreg. spillere.`);
        }
        console.log("Player distribution done (if any).");

        // Prepare final state object
        const tournamentState = { config, live };
        const tournamentId = generateUniqueId('t'); // Generate ID
        console.log(`Generated new tournament ID: ${tournamentId}`);

        // Attempt to save
        console.log("Attempting to save tournament state...");
        if (saveTournamentState(tournamentId, tournamentState)) { // Check if save was successful
            console.log(`Save successful for ${tournamentId}. Setting active ID...`);
            setActiveTournamentId(tournamentId); // Mark as active *after* successful save
            console.log(`Active ID set to ${getActiveTournamentId()}. Redirecting...`); // Verify it's set before redirect
            window.location.href = 'tournament.html'; // Redirect *after* setting active ID
        } else {
            console.error("Saving tournament state failed!"); // Log failure
            alert("Feil ved lagring av turnering. Start ble avbrutt."); // Don't redirect if save fails
        }
    }

     function handleSaveTemplate() { const { config, isValid, errorMessages } = collectConfigFromForm(); if (!isValid) { alert("Konfigurasjonen inneholder feil:\n\n- " + errorMessages.join("\n- ")); return; } const templateId = generateUniqueId('tmpl'); const templateData = { config }; if (saveTemplate(templateId, templateData)) { alert(`Malen "${config.name}" er lagret!`); } else { alert(`Kunne ikke lagre malen.`); } }
    // === 09: FORM SUBMISSION/SAVE HANDLERS END ===

});
// === 01: DOMContentLoaded LISTENER END ===
