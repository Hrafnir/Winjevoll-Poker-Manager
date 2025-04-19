// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    // === 02: DOM REFERENCES START ===
    const form = document.getElementById('setup-form');
    const setupTitle = document.getElementById('setup-title');
    // Basic Info
    const tournamentNameInput = document.getElementById('tournament-name');
    const tournamentTypeSelect = document.getElementById('tournament-type');
    const buyInInput = document.getElementById('buy-in');
    // Knockout
    const knockoutSection = document.getElementById('knockout-section');
    const bountyAmountInput = document.getElementById('bounty-amount');
    // Structure
    const startStackInput = document.getElementById('start-stack');
    const playersPerTableInput = document.getElementById('players-per-table');
    // Rebuy/Addon
    const rebuySection = document.getElementById('rebuy-section');
    const rebuyCostInput = document.getElementById('rebuy-cost');
    const rebuyChipsInput = document.getElementById('rebuy-chips');
    const rebuyLevelsInput = document.getElementById('rebuy-levels');
    const addonCostInput = document.getElementById('addon-cost');
    const addonChipsInput = document.getElementById('addon-chips');
    // Prizes
    const paidPlacesInput = document.getElementById('paid-places');
    const prizeDistInput = document.getElementById('prize-distribution');
    // Blinds
    const levelDurationInput = document.getElementById('level-duration');
    const lateRegLevelInput = document.getElementById('late-reg-level');
    const blindStructureBody = document.getElementById('blind-structure-body');
    // Players
    const playerNamesTextarea = document.getElementById('player-names');
    // Buttons
    const btnGeneratePayout = document.getElementById('btn-generate-payout');
    const btnGenerateBlinds = document.getElementById('btn-generate-blinds');
    const btnClearBlinds = document.getElementById('btn-clear-blinds');
    const btnAddLevel = document.getElementById('btn-add-level');
    const btnStartTournament = document.getElementById('btn-start-tournament');
    const btnSaveTemplate = document.getElementById('btn-save-template');
    const btnBackToMain = document.getElementById('btn-back-to-main');
    // === 02: DOM REFERENCES END ===


    // === 03: STATE VARIABLES START ===
    let blindLevelCounter = 0; // Tracks the *visual* level number in the table
    let loadedTemplateConfig = null;
    const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    // === 03: STATE VARIABLES END ===


    // === 04: HELPER FUNCTIONS - BLINDS START ===
    function roundToNearestValid(value, step = 100) {
        if (isNaN(value) || value <= 0) return step; // Return minimum step if invalid
        const rounded = Math.round(value / step) * step;
        return Math.max(step, rounded); // Ensure minimum is step
    }

    function addBlindLevelRow(levelData = {}) {
        blindLevelCounter++;
        const row = blindStructureBody.insertRow();
        row.dataset.levelNumber = blindLevelCounter;

        const defaultDuration = levelDurationInput.value || 20;
        const sb = levelData.sb ?? '';
        const bb = levelData.bb ?? '';
        const ante = levelData.ante ?? 0;
        const duration = levelData.duration ?? defaultDuration;
        const pauseMinutes = levelData.pauseMinutes ?? 0; // New: Pause duration after this level

        row.innerHTML = `
            <td><span class="level-number">${blindLevelCounter}</span></td>
            <td><input type="number" class="sb-input" value="${sb}" min="0" step="100" required></td>
            <td><input type="number" class="bb-input" value="${bb}" min="0" step="100" required></td>
            <td><input type="number" class="ante-input" value="${ante}" min="0" step="25" placeholder="0"></td>
            <td><input type="number" class="duration-input" value="${duration}" min="1" required></td>
            <td><input type="number" class="pause-duration-input" value="${pauseMinutes}" min="0" placeholder="0"></td>
            <td><button type="button" class="btn-remove-level" title="Fjern nivå ${blindLevelCounter}">X</button></td>
        `;

        row.querySelector('.btn-remove-level').addEventListener('click', () => { row.remove(); updateLevelNumbers(); });

        // Auto-calculate SB from BB on BB change (Enforce 50% rule helper)
        const bbInput = row.querySelector('.bb-input');
        const sbInput = row.querySelector('.sb-input');
        bbInput.addEventListener('change', () => {
            const bbVal = parseInt(bbInput.value);
            if (!isNaN(bbVal) && bbVal > 0) {
                // Calculate SB as roughly 50%, rounded to valid step (e.g., 100)
                // Use Math.floor for SB to ensure it's not > 50%
                sbInput.value = roundToNearestValid(Math.floor(bbVal / 2), 100);
            }
        });
         // Optional: Update BB if SB changes significantly? More complex interaction.
         /* sbInput.addEventListener('change', () => {
              const sbVal = parseInt(sbInput.value);
              if (!isNaN(sbVal) && sbVal > 0) {
                 bbInput.value = roundToNearestValid(sbVal * 2, 100);
              }
          }); */
    }

    function updateLevelNumbers() {
        const rows = blindStructureBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const levelNum = index + 1;
            row.dataset.levelNumber = levelNum;
            row.querySelector('.level-number').textContent = levelNum;
            row.querySelector('.btn-remove-level').title = `Fjern nivå ${levelNum}`;
        });
        blindLevelCounter = rows.length;
    }

    function generateStandardBlinds() {
        blindStructureBody.innerHTML = ''; blindLevelCounter = 0;
        const startStack = parseInt(startStackInput.value) || 10000;
        const duration = parseInt(levelDurationInput.value) || 20;

        let bb = roundToNearestValid(startStack / 100, 100); // Start with BB ~1%
        let sb = roundToNearestValid(Math.floor(bb / 2), 100); // SB is 50% of BB

        const blinds = [];
        for (let i = 0; i < 12; i++) {
            let pause = 0;
            if (i === 4 || i === 9) { // Pause after level 4 and 9
                pause = 10;
            }
            blinds.push({ sb: sb, bb: bb, ante: 0, pauseMinutes: pause }); // Add level

            // Calculate next BB (increase factor reduces slightly)
            const increaseFactor = i < 6 ? 1.5 : 1.4;
            let next_bb_raw = bb * increaseFactor;
            bb = roundToNearestValid(next_bb_raw, 100);
            sb = roundToNearestValid(Math.floor(bb / 2), 100); // Recalculate SB

            if (bb > startStack * 4 && bb > 20000) break; // Cap generation
        }
        blinds.forEach(b => addBlindLevelRow({ ...b, duration: duration }));
        updateLevelNumbers();
    }
    // === 04: HELPER FUNCTIONS - BLINDS END ===


    // === 05: HELPER FUNCTIONS - PAYOUTS START ===
     function generateStandardPayout() {
         const places = parseInt(paidPlacesInput.value) || 0;
         if (places > 0 && standardPayouts[places]) { prizeDistInput.value = standardPayouts[places].join(', '); }
         else { prizeDistInput.value = ''; }
     }
     // === 05: HELPER FUNCTIONS - PAYOUTS END ===


     // === 06: HELPER FUNCTIONS - FORM POPULATION START ===
      function populateForm(config) {
          if (!config) return;
          tournamentNameInput.value = config.name || 'Ny Turnering';
          tournamentTypeSelect.value = config.type || 'freezeout';
          buyInInput.value = config.buyIn || 0;
          startStackInput.value = config.startStack || 10000;
          playersPerTableInput.value = config.playersPerTable || 9;
          paidPlacesInput.value = config.paidPlaces || 1;
          prizeDistInput.value = (config.prizeDistribution || []).join(', ');
          const firstLevelDuration = config.blindLevels?.[0]?.duration;
          levelDurationInput.value = firstLevelDuration || 20;
          lateRegLevelInput.value = config.lateRegLevel || 0;
          tournamentTypeSelect.dispatchEvent(new Event('change'));
          if (config.type === 'knockout') bountyAmountInput.value = config.bountyAmount || 0;
          if (config.type === 'rebuy') { rebuyCostInput.value = config.rebuyCost || 0; rebuyChipsInput.value = config.rebuyChips || config.startStack; rebuyLevelsInput.value = config.rebuyLevels || 0; addonCostInput.value = config.addonCost || 0; addonChipsInput.value = config.addonChips || 0; }
          blindStructureBody.innerHTML = ''; blindLevelCounter = 0;
          if (config.blindLevels && config.blindLevels.length > 0) { config.blindLevels.forEach(level => addBlindLevelRow(level)); }
          else { generateStandardBlinds(); }
          updateLevelNumbers();
          playerNamesTextarea.value = '';
      }
     // === 06: HELPER FUNCTIONS - FORM POPULATION END ===


    // === 07: EVENT LISTENERS START ===
    tournamentTypeSelect.addEventListener('change', () => { const type = tournamentTypeSelect.value; rebuySection.classList.toggle('hidden', type !== 'rebuy'); knockoutSection.classList.toggle('hidden', type !== 'knockout'); });
    btnAddLevel.addEventListener('click', () => addBlindLevelRow());
    btnGenerateBlinds.addEventListener('click', generateStandardBlinds);
    btnClearBlinds.addEventListener('click', () => { if (confirm("Slette hele blindstrukturen?")) { blindStructureBody.innerHTML = ''; blindLevelCounter = 0; } });
    btnGeneratePayout.addEventListener('click', generateStandardPayout);
    paidPlacesInput.addEventListener('change', generateStandardPayout);
    btnBackToMain.addEventListener('click', () => { window.location.href = 'index.html'; });
    btnSaveTemplate.addEventListener('click', handleSaveTemplate);
    form.addEventListener('submit', handleStartTournament);
    // === 07: EVENT LISTENERS END ===


    // === 08: INITIALIZATION START ===
    const templateIdToLoad = getActiveTemplateId();
    if (templateIdToLoad) {
         const template = loadTemplate(templateIdToLoad);
         if (template?.config) {
              loadedTemplateConfig = template.config; populateForm(template.config);
              setupTitle.textContent = `Start fra Mal: ${template.config.name}`;
              console.log("Loaded config from template:", loadedTemplateConfig); // Debug log
         } else {
              alert(`Kunne ikke laste mal med ID: ${templateIdToLoad}`);
              generateStandardBlinds(); generateStandardPayout();
         }
         clearActiveTemplateId(); // Clear after loading attempt
    } else {
         setupTitle.textContent = "Konfigurer Ny Turnering";
         tournamentTypeSelect.dispatchEvent(new Event('change'));
         generateStandardBlinds(); generateStandardPayout();
    }
    // === 08: INITIALIZATION END ===


    // === 09: FORM SUBMISSION/SAVE HANDLERS START ===
    function collectConfigFromForm() {
        // --- Data Collection ---
        const config = {
            name: tournamentNameInput.value.trim() || "Ukjent Turnering", date: new Date().toISOString().slice(0, 10), type: tournamentTypeSelect.value,
            buyIn: parseInt(buyInInput.value) || 0, bountyAmount: 0, startStack: parseInt(startStackInput.value) || 10000, playersPerTable: parseInt(playersPerTableInput.value) || 9, paidPlaces: parseInt(paidPlacesInput.value) || 1,
            prizeDistribution: prizeDistInput.value.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p) && p >= 0),
            rebuyCost: 0, rebuyChips: 0, rebuyLevels: 0, addonCost: 0, addonChips: 0, lateRegLevel: parseInt(lateRegLevelInput.value) || 0, blindLevels: [],
        };
        if (config.type === 'rebuy') { config.rebuyCost = parseInt(rebuyCostInput.value) || 0; config.rebuyChips = parseInt(rebuyChipsInput.value) || config.startStack; config.rebuyLevels = parseInt(rebuyLevelsInput.value) || 0; config.addonCost = parseInt(addonCostInput.value) || 0; config.addonChips = parseInt(addonChipsInput.value) || 0; }
        if (config.type === 'knockout') { config.bountyAmount = parseInt(bountyAmountInput.value) || 0; }

        // --- Validation ---
        let isValid = true; let errorMessages = [];
        if (config.startStack <= 0) { isValid = false; errorMessages.push("Start Stack > 0."); } if (config.playersPerTable < 2) { isValid = false; errorMessages.push("Maks spillere/bord >= 2."); } if (config.paidPlaces <= 0) { isValid = false; errorMessages.push("Betalte plasser >= 1."); }
        if (config.prizeDistribution.length !== config.paidPlaces) { isValid = false; errorMessages.push("Antall premier != Antall Betalte."); } else { const sum = config.prizeDistribution.reduce((a, b) => a + b, 0); if (Math.abs(sum - 100) > 0.1) { isValid = false; errorMessages.push(`Premiesum (${sum.toFixed(1)}%) != 100%.`); } }
        if (config.type === 'knockout' && config.bountyAmount > config.buyIn) { isValid = false; errorMessages.push("Bounty > Buy-in."); } if (config.type === 'knockout' && config.bountyAmount < 0) { isValid = false; errorMessages.push("Bounty >= 0."); }

        // --- Collect & Validate Blinds ---
        config.blindLevels = []; let foundInvalidBlind = false;
        const blindRows = blindStructureBody.querySelectorAll('tr');
        if (blindRows.length === 0) { isValid = false; errorMessages.push("Minst ett blindnivå kreves."); }
        blindRows.forEach((row, index) => {
            const levelNum = index + 1;
            const sbInput = row.querySelector('.sb-input'); const bbInput = row.querySelector('.bb-input'); const anteInput = row.querySelector('.ante-input'); const durationInput = row.querySelector('.duration-input'); const pauseInput = row.querySelector('.pause-duration-input');
            const sb = parseInt(sbInput.value); const bb = parseInt(bbInput.value); const ante = parseInt(anteInput.value) || 0; const duration = parseInt(durationInput.value); const pauseMinutes = parseInt(pauseInput.value) || 0;
            let rowValid = true;
            [sbInput, bbInput, anteInput, durationInput, pauseInput].forEach(el => el.classList.remove('invalid'));

            if (isNaN(duration) || duration <= 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig varighet.`); durationInput.classList.add('invalid'); }
            if (isNaN(sb) || sb < 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig SB.`); sbInput.classList.add('invalid');}
            if (isNaN(bb) || bb <= 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig BB (>0).`); bbInput.classList.add('invalid');}
            else if (bb > 0 && sb <= 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: SB må være > 0 hvis BB > 0.`); sbInput.classList.add('invalid');}
            else if (bb > 0 && sb !== roundToNearestValid(Math.floor(bb/2), 100)) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: SB (${sb}) er ikke ~50% av BB (${bb}) og rundet.`); sbInput.classList.add('invalid'); bbInput.classList.add('invalid'); }
            if (isNaN(ante) || ante < 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig Ante.`); anteInput.classList.add('invalid');}
            if (isNaN(pauseMinutes) || pauseMinutes < 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig pause.`); pauseInput.classList.add('invalid');}
            if (!rowValid) foundInvalidBlind = true;
            config.blindLevels.push({ level: levelNum, sb: sb, bb: bb, ante: ante, duration: duration, pauseMinutes: pauseMinutes });
        });
        if (foundInvalidBlind) isValid = false;

        return { config, isValid, errorMessages };
    }

    function handleStartTournament(e) {
        e.preventDefault();
        const { config, isValid, errorMessages } = collectConfigFromForm();
        if (!isValid) { alert("Vennligst rett følgende feil:\n\n- " + errorMessages.join("\n- ")); return; }

        const live = {
            status: "paused", currentLevelIndex: 0, timeRemainingInLevel: config.blindLevels[0].duration * 60,
            timeRemainingInBreak: 0, isOnBreak: false,
            players: [], eliminatedPlayers: [],
            totalPot: 0, totalEntries: 0, totalRebuys: 0, totalAddons: 0,
            nextPlayerId: 1, knockoutLog: [], activityLog: [] // Added activityLog
        };

        // --- KORRIGERT Initial Player Distribution ---
        const playerNames = playerNamesTextarea.value.split('\n').map(name => name.trim()).filter(name => name.length > 0);
         if (playerNames.length > 0) {
             const numPlayers = playerNames.length;
             const playersPerTable = config.playersPerTable;
             const numTables = Math.ceil(numPlayers / playersPerTable);
             console.log(`Initial Distribution: ${numPlayers} players, ${playersPerTable} per table => ${numTables} tables needed.`); // Debug log

             const basePlayersPerTable = Math.floor(numPlayers / numTables);
             let extraPlayers = numPlayers % numTables;
             let playerIndex = 0;

             for (let t = 1; t <= numTables; t++) {
                 const playersOnThisTable = basePlayersPerTable + (extraPlayers > 0 ? 1 : 0);
                 if (extraPlayers > 0) extraPlayers--; // Decrement remaining extra players

                 console.log(` - Table ${t}: Allocating ${playersOnThisTable} players.`); // Debug log
                 for (let s = 1; s <= playersOnThisTable; s++) {
                     if (playerIndex >= numPlayers) { console.error("Distribution Error: More seats allocated than players available!"); break; }
                     const name = playerNames[playerIndex];
                     const player = { id: live.nextPlayerId++, name: name, stack: config.startStack, table: t, seat: s, rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0 };
                     live.players.push(player);
                     live.totalPot += config.buyIn;
                     live.totalEntries++;
                     playerIndex++;
                 }
             }
             live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
             logActivity(live.activityLog, `Startet turnering med ${numPlayers} spillere fordelt på ${numTables} bord.`); // Log initial setup
         } else {
              logActivity(live.activityLog, `Startet turnering uten forhåndsregistrerte spillere.`);
         }

        // --- Save State and Navigate ---
        const tournamentState = { config, live };
        const tournamentId = generateUniqueId('t');
        if (saveTournamentState(tournamentId, tournamentState)) { setActiveTournamentId(tournamentId); window.location.href = 'tournament.html'; }
        else { alert("En feil oppstod under lagring av turneringen."); }
    }

     function handleSaveTemplate() {
         const { config, isValid, errorMessages } = collectConfigFromForm();
         if (!isValid) { alert("Konfigurasjonen inneholder feil:\n\n- " + errorMessages.join("\n- ")); return; }
         const templateId = generateUniqueId('tmpl'); const templateData = { config };
         if (saveTemplate(templateId, templateData)) { alert(`Malen "${config.name}" er lagret!`); }
         else { alert(`Kunne ikke lagre malen "${config.name}".`); }
     }
// === 09: FORM SUBMISSION/SAVE HANDLERS END ===

});
// === 01: DOMContentLoaded LISTENER END ===
