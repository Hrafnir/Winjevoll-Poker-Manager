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
    let blindLevelCounter = 0;
    let loadedTemplateConfig = null; // Stores config if loaded from template
    const standardPayouts = { // Keep this updated with desired payouts
        1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10],
        5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4],
        8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3],
       10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2]
       // Add more as needed
    };
    // === 03: STATE VARIABLES END ===


    // === 04: HELPER FUNCTIONS - BLINDS START ===
    function roundToNearestValid(value, step = 100) {
        if (isNaN(value) || value <= 0) return 0;
        if (step <= 0) return Math.max(0, Math.round(value)); // Avoid issues with invalid step
        const rounded = Math.round(value / step) * step;
        return Math.max(step > 0 ? step : 0, rounded); // Ensure minimum is step (e.g., min 100 if step 100)
    }

    function addBlindLevelRow(levelData = {}) {
        blindLevelCounter++;
        const row = blindStructureBody.insertRow();
        row.dataset.levelNumber = blindLevelCounter;

        const defaultDuration = levelDurationInput.value || 20;
        const sb = levelData.sb ?? ''; const bb = levelData.bb ?? '';
        const ante = levelData.ante ?? 0; // Default Ante to 0
        const duration = levelData.duration ?? defaultDuration;
        const isBreak = levelData.isBreak ?? false;

        row.innerHTML = `
            <td><span class="level-number">${blindLevelCounter}</span></td>
            <td><input type="number" class="sb-input" value="${sb}" min="0" step="100" ${isBreak ? 'disabled' : ''}></td>
            <td><input type="number" class="bb-input" value="${bb}" min="0" step="100" ${isBreak ? 'disabled' : ''}></td>
            <td><input type="number" class="ante-input" value="${ante}" min="0" step="25" ${isBreak ? 'disabled' : ''} placeholder="0"></td>
            <td><input type="number" class="duration-input" value="${duration}" min="1"></td>
            <td><input type="checkbox" class="is-break-checkbox" ${isBreak ? 'checked' : ''}> Pause</td>
            <td><button type="button" class="btn-remove-level" title="Fjern nivå ${blindLevelCounter}">X</button></td>
        `;

        row.querySelector('.btn-remove-level').addEventListener('click', () => { row.remove(); updateLevelNumbers(); });

        const breakCheckbox = row.querySelector('.is-break-checkbox');
        const sbInput = row.querySelector('.sb-input');
        const bbInput = row.querySelector('.bb-input');
        const anteInput = row.querySelector('.ante-input');

        const toggleInputs = (disable) => {
             sbInput.disabled = disable;
             bbInput.disabled = disable;
             anteInput.disabled = disable;
             if(disable) {
                 sbInput.value = '';
                 bbInput.value = '';
                 anteInput.value = 0; // Set ante to 0 for break
             }
        };

        breakCheckbox.addEventListener('change', (e) => toggleInputs(e.target.checked));
        if(isBreak) toggleInputs(true); // Initial state
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

        let sb = roundToNearestValid(startStack / 200, 100);
        let bb = roundToNearestValid(startStack / 100, 100);
        bb = Math.max(sb > 0 ? sb : 100, bb); // Ensure BB >= SB and min 100

        const blinds = [];
        for (let i = 0; i < 12; i++) {
            if (i === 4 || i === 9) { blinds.push({ isBreak: true, duration: 10 }); continue; }
            blinds.push({ sb: sb, bb: bb, ante: 0 }); // Ante = 0 default

            let next_sb_raw = sb * 1.5; let next_bb_raw = bb * 1.5;
            if (i > 6) { next_sb_raw = sb * 1.4; next_bb_raw = bb * 1.4; }

            sb = roundToNearestValid(next_sb_raw, 100);
            bb = roundToNearestValid(next_bb_raw, 100);
            bb = Math.max(sb > 0 ? sb : 100, bb);
            if (sb > 0 && bb === sb && bb < 500) bb = roundToNearestValid(bb * 1.5, 100);
            if (sb > 0 && bb === sb && bb >= 500) bb = roundToNearestValid(bb + 100, 100);

            if (sb > startStack * 2 && sb > 10000) break; // Simple cap
        }
        blinds.forEach(b => addBlindLevelRow({ ...b, duration: b.isBreak ? b.duration : duration }));
        updateLevelNumbers();
    }
    // === 04: HELPER FUNCTIONS - BLINDS END ===


    // === 05: HELPER FUNCTIONS - PAYOUTS START ===
     function generateStandardPayout() {
         const places = parseInt(paidPlacesInput.value) || 0;
         if (places > 0 && standardPayouts[places]) {
             prizeDistInput.value = standardPayouts[places].join(', ');
         } else {
             prizeDistInput.value = ''; // Clear if places is 0 or no standard found
         }
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
          // Use duration from first *non-break* level, or default
          const firstLevelDuration = config.blindLevels?.find(l => !l.isBreak)?.duration;
          levelDurationInput.value = firstLevelDuration || 20;
          lateRegLevelInput.value = config.lateRegLevel || 0;

          tournamentTypeSelect.dispatchEvent(new Event('change')); // Trigger show/hide

          if (config.type === 'knockout') bountyAmountInput.value = config.bountyAmount || 0;
          if (config.type === 'rebuy') {
              rebuyCostInput.value = config.rebuyCost || 0;
              rebuyChipsInput.value = config.rebuyChips || config.startStack;
              rebuyLevelsInput.value = config.rebuyLevels || 0;
              addonCostInput.value = config.addonCost || 0;
              addonChipsInput.value = config.addonChips || 0;
          }

          blindStructureBody.innerHTML = ''; blindLevelCounter = 0;
          if (config.blindLevels && config.blindLevels.length > 0) {
              config.blindLevels.forEach(level => addBlindLevelRow(level));
          } else { generateStandardBlinds(); } // Generate if template had no blinds
          updateLevelNumbers();

          playerNamesTextarea.value = ''; // Clear player names when loading template
      }
     // === 06: HELPER FUNCTIONS - FORM POPULATION END ===


    // === 07: EVENT LISTENERS START ===
    tournamentTypeSelect.addEventListener('change', () => {
        const type = tournamentTypeSelect.value;
        rebuySection.classList.toggle('hidden', type !== 'rebuy');
        knockoutSection.classList.toggle('hidden', type !== 'knockout');
    });
    btnAddLevel.addEventListener('click', () => addBlindLevelRow());
    btnGenerateBlinds.addEventListener('click', generateStandardBlinds);
    btnClearBlinds.addEventListener('click', () => {
         if (confirm("Slette hele blindstrukturen?")) { blindStructureBody.innerHTML = ''; blindLevelCounter = 0; }
     });
    btnGeneratePayout.addEventListener('click', generateStandardPayout);
    paidPlacesInput.addEventListener('change', generateStandardPayout); // Auto-generate on change
    btnBackToMain.addEventListener('click', () => { window.location.href = 'index.html'; });
    btnSaveTemplate.addEventListener('click', handleSaveTemplate);
    form.addEventListener('submit', handleStartTournament);
    // === 07: EVENT LISTENERS END ===


    // === 08: INITIALIZATION START ===
    const templateIdToLoad = getActiveTemplateId();
    if (templateIdToLoad) {
         const template = loadTemplate(templateIdToLoad); // From storage.js
         if (template && template.config) {
              loadedTemplateConfig = template.config;
              populateForm(template.config);
              setupTitle.textContent = `Start fra Mal: ${template.config.name}`;
         } else {
              alert(`Kunne ikke laste mal med ID: ${templateIdToLoad}`);
              generateStandardBlinds(); generateStandardPayout(); // Generate defaults if load failed
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
            name: tournamentNameInput.value.trim() || "Ukjent Turnering",
            date: new Date().toISOString().slice(0, 10), type: tournamentTypeSelect.value,
            buyIn: parseInt(buyInInput.value) || 0, bountyAmount: 0,
            startStack: parseInt(startStackInput.value) || 10000,
            playersPerTable: parseInt(playersPerTableInput.value) || 9,
            paidPlaces: parseInt(paidPlacesInput.value) || 1,
            prizeDistribution: prizeDistInput.value.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p) && p >= 0),
            rebuyCost: 0, rebuyChips: 0, rebuyLevels: 0, addonCost: 0, addonChips: 0,
            lateRegLevel: parseInt(lateRegLevelInput.value) || 0,
            blindLevels: [],
         };
         if (config.type === 'rebuy') { config.rebuyCost = parseInt(rebuyCostInput.value) || 0; config.rebuyChips = parseInt(rebuyChipsInput.value) || config.startStack; config.rebuyLevels = parseInt(rebuyLevelsInput.value) || 0; config.addonCost = parseInt(addonCostInput.value) || 0; config.addonChips = parseInt(addonChipsInput.value) || 0; }
         if (config.type === 'knockout') { config.bountyAmount = parseInt(bountyAmountInput.value) || 0; }

         // --- Validation ---
         let isValid = true; let errorMessages = [];
         if (config.startStack <= 0) { isValid = false; errorMessages.push("Start Stack > 0."); }
         if (config.playersPerTable < 2) { isValid = false; errorMessages.push("Maks spillere/bord >= 2."); }
         if (config.paidPlaces <= 0) { isValid = false; errorMessages.push("Betalte plasser >= 1."); }
         if (config.prizeDistribution.length !== config.paidPlaces) { isValid = false; errorMessages.push("Antall premier != Antall Betalte."); }
         else { const sum = config.prizeDistribution.reduce((a, b) => a + b, 0); if (Math.abs(sum - 100) > 0.1) { isValid = false; errorMessages.push(`Premiesum (${sum.toFixed(1)}%) != 100%.`); } }
         if (config.type === 'knockout' && config.bountyAmount > config.buyIn) { isValid = false; errorMessages.push("Bounty > Buy-in."); }
         if (config.type === 'knockout' && config.bountyAmount < 0) { isValid = false; errorMessages.push("Bounty >= 0."); }

         // --- Collect & Validate Blinds ---
         config.blindLevels = []; let foundInvalidBlind = false;
         const blindRows = blindStructureBody.querySelectorAll('tr');
         if (blindRows.length === 0) { isValid = false; errorMessages.push("Minst ett blindnivå kreves."); }
         blindRows.forEach((row, index) => {
             const levelNum = index + 1;
             const isBreak = row.querySelector('.is-break-checkbox').checked;
             const sbInput = row.querySelector('.sb-input'); const bbInput = row.querySelector('.bb-input');
             const anteInput = row.querySelector('.ante-input'); const durationInput = row.querySelector('.duration-input');
             const sb = parseInt(sbInput.value); const bb = parseInt(bbInput.value);
             const ante = parseInt(anteInput.value) || 0; const duration = parseInt(durationInput.value);
             let rowValid = true;
             durationInput.classList.remove('invalid'); sbInput.classList.remove('invalid'); bbInput.classList.remove('invalid'); anteInput.classList.remove('invalid');

             if (isNaN(duration) || duration <= 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig varighet.`); durationInput.classList.add('invalid'); }
             if (!isBreak) {
                  if (isNaN(sb) || sb < 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig SB.`); sbInput.classList.add('invalid');}
                  if (isNaN(bb) || bb <= 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig BB (>0).`); bbInput.classList.add('invalid');}
                  else if (bb < sb) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: BB >= SB.`); bbInput.classList.add('invalid');}
                  if (isNaN(ante) || ante < 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig Ante.`); anteInput.classList.add('invalid');}
             }
             if (!rowValid) foundInvalidBlind = true;
             config.blindLevels.push({ level: levelNum, sb: isBreak ? 0 : sb, bb: isBreak ? 0 : bb, ante: isBreak ? 0 : ante, duration: duration, isBreak: isBreak });
         });
         if (foundInvalidBlind) isValid = false; // Mark overall form invalid if any blind row fails

         return { config, isValid, errorMessages };
    }

    function handleStartTournament(e) {
        e.preventDefault();
        const { config, isValid, errorMessages } = collectConfigFromForm();

        if (!isValid) {
            alert("Vennligst rett følgende feil:\n\n- " + errorMessages.join("\n- "));
            return;
        }

        // --- Initialize Live State & Player Distribution ---
        const live = {
            status: "paused", currentLevelIndex: 0,
            timeRemainingInLevel: config.blindLevels[0].duration * 60,
            players: [], eliminatedPlayers: [],
            totalPot: 0, totalEntries: 0, totalRebuys: 0, totalAddons: 0,
            nextPlayerId: 1, knockoutLog: [],
        };

        const playerNames = playerNamesTextarea.value.split('\n').map(name => name.trim()).filter(name => name.length > 0);
         if (playerNames.length > 0) {
             const numPlayers = playerNames.length; const playersPerTable = config.playersPerTable;
             const numTables = Math.ceil(numPlayers / playersPerTable); let playerIndex = 0;
              for (let t = 1; t <= numTables; t++) {
                   const playersOnThisTable = Math.floor(numPlayers / numTables) + (t <= numPlayers % numTables ? 1 : 0);
                   for (let s = 1; s <= playersOnThisTable; s++) {
                       if (playerIndex >= numPlayers) break; const name = playerNames[playerIndex];
                       const player = { id: live.nextPlayerId++, name: name, stack: config.startStack, table: t, seat: s, rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0 };
                       live.players.push(player); live.totalPot += config.buyIn; live.totalEntries++; playerIndex++;
                   }
              }
             live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
             console.log(`Fordelte ${numPlayers} spillere på ${numTables} bord.`);
         } else { console.log("Ingen spillere lagt inn ved oppsett."); }

        // --- Save State and Navigate ---
        const tournamentState = { config, live };
        const tournamentId = generateUniqueId('t'); // Generate ID

        if (saveTournamentState(tournamentId, tournamentState)) { // Check if save was successful
             setActiveTournamentId(tournamentId); // Mark as active
             window.location.href = 'tournament.html';
        } else {
             alert("En feil oppstod under lagring av turneringen. Start ble avbrutt.");
        }
    }

     function handleSaveTemplate() {
         const { config, isValid, errorMessages } = collectConfigFromForm();
         if (!isValid) { // Validate config before saving template
             alert("Konfigurasjonen inneholder feil og kan ikke lagres som mal:\n\n- " + errorMessages.join("\n- "));
             return;
         }
         const templateId = generateUniqueId('tmpl');
         const templateData = { config }; // Only store config part
         if (saveTemplate(templateId, templateData)) { // Check for success
             alert(`Malen "${config.name}" er lagret!`);
         } else {
              alert(`Kunne ikke lagre malen "${config.name}".`);
         }
     }
    // === 09: FORM SUBMISSION/SAVE HANDLERS END ===

});
// === 01: DOMContentLoaded LISTENER END ===
