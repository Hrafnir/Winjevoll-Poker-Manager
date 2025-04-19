// === 01: CONSTANTS SECTION START ===
const TOURNAMENT_COLLECTION_KEY = 'winjevollTournamentCollection_v1';
const TEMPLATE_COLLECTION_KEY = 'winjevollTemplateCollection_v1';
const ACTIVE_TOURNAMENT_ID_KEY = 'winjevollActiveTournamentId_v1';
const ACTIVE_TEMPLATE_ID_KEY = 'winjevollActiveTemplateId_v1'; // For loading template into setup
// === 01: CONSTANTS SECTION END ===

// === 02: UTILITY FUNCTIONS (Load/Save Collections) START ===
function loadCollection(key) { try { const collectionJSON = localStorage.getItem(key); if (collectionJSON) { const collection = JSON.parse(collectionJSON); if (typeof collection === 'object' && collection !== null) { return collection; } else { console.warn(`Data for key "${key}" invalid. Clearing.`); localStorage.removeItem(key); return {}; } } return {}; } catch (e) { console.error(`Error loading ${key}:`, e); localStorage.removeItem(key); return {}; } }
function saveCollection(key, collection) { try { if (typeof collection !== 'object' || collection === null) { throw new Error("Attempted to save non-object as collection."); } localStorage.setItem(key, JSON.stringify(collection)); } catch (e) { console.error(`Error saving ${key}:`, e); if (e.name === 'QuotaExceededError') { alert(`Lagringsplass full (${key})!`); } else { alert(`Ukjent lagringsfeil (${key})!`); } throw e; } }
// === 02: UTILITY FUNCTIONS (Load/Save Collections) END ===

// === 03: TOURNAMENT FUNCTIONS START ===
function loadTournamentCollection() { return loadCollection(TOURNAMENT_COLLECTION_KEY); }
function saveTournamentState(tournamentId, state) { if (!tournamentId || !state?.config || !state.live) { console.error("Invalid data to saveTournamentState."); return false; } try { const collection = loadTournamentCollection(); collection[tournamentId] = state; saveCollection(TOURNAMENT_COLLECTION_KEY, collection); console.log(`Tourn ${tournamentId} saved.`); return true; } catch (error) { console.error(`Failed save T ${tournamentId}`, error); return false; } }
function loadTournamentState(tournamentId) { if (!tournamentId) return null; const collection = loadTournamentCollection(); if(collection[tournamentId]?.config && collection[tournamentId].live) { console.log(`Loading T ${tournamentId}`); return collection[tournamentId]; } else { console.warn(`T state ${tournamentId} not found/invalid.`); return null; } }
function deleteTournamentState(tournamentId) { if (!tournamentId) return; try { const collection = loadTournamentCollection(); if (collection[tournamentId]) { delete collection[tournamentId]; saveCollection(TOURNAMENT_COLLECTION_KEY, collection); console.log(`Tourn ${tournamentId} deleted.`); if (getActiveTournamentId() === tournamentId) { clearActiveTournamentId(); } } else { console.warn(`Tourn ${tournamentId} not found for deletion.`); } } catch (error) { console.error(`Failed delete T ${tournamentId}`, error); alert(`Kunne ikke slette turnering ${tournamentId}.`); } }
// === 03: TOURNAMENT FUNCTIONS END ===

// === 04: TEMPLATE FUNCTIONS START ===
function loadTemplateCollection() { return loadCollection(TEMPLATE_COLLECTION_KEY); }
function saveTemplate(templateId, templateData) { if (!templateId || !templateData?.config) { console.error("Invalid data to saveTemplate."); return false; } try { const collection = loadTemplateCollection(); collection[templateId] = templateData; saveCollection(TEMPLATE_COLLECTION_KEY, collection); console.log(`Template ${templateId} saved.`); return true; } catch(error) { console.error(`Failed save template ${templateId}`, error); return false; } }
function loadTemplate(templateId) { if (!templateId) return null; const collection = loadTemplateCollection(); if(collection[templateId]?.config) { console.log(`Loading template ${templateId}`); return collection[templateId]; } else { console.warn(`Template ${templateId} not found/invalid.`); return null; } }
function deleteTemplate(templateId) { if (!templateId) return; try { const collection = loadTemplateCollection(); if (collection[templateId]) { delete collection[templateId]; saveCollection(TEMPLATE_COLLECTION_KEY, collection); console.log(`Template ${templateId} deleted.`); if (getActiveTemplateId() === templateId) { clearActiveTemplateId(); } } else { console.warn(`Template ${templateId} not found deletion.`); } } catch (error) { console.error(`Failed delete template ${templateId}`, error); alert(`Kunne ikke slette mal ${templateId}.`); } }
// === 04: TEMPLATE FUNCTIONS END ===

// === 05: ACTIVE ID FUNCTIONS START ===
function setActiveTournamentId(tournamentId) { if (tournamentId) { localStorage.setItem(ACTIVE_TOURNAMENT_ID_KEY, tournamentId); console.log(`Active T set: ${tournamentId}`); } else { localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); console.log("Active T cleared."); } }
function getActiveTournamentId() { return localStorage.getItem(ACTIVE_TOURNAMENT_ID_KEY); }
function clearActiveTournamentId() { localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); }
function setActiveTemplateId(templateId) { if (templateId) { localStorage.setItem(ACTIVE_TEMPLATE_ID_KEY, templateId); console.log(`Active template set: ${templateId}`); } else { localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); } }
function getActiveTemplateId() { return localStorage.getItem(ACTIVE_TEMPLATE_ID_KEY); }
function clearActiveTemplateId() { localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); }
// === 05: ACTIVE ID FUNCTIONS END ===

// === 06: CLEAR ALL DATA FUNCTION START ===
function clearAllData() { try { localStorage.removeItem(TOURNAMENT_COLLECTION_KEY); localStorage.removeItem(TEMPLATE_COLLECTION_KEY); localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); console.log("All app data cleared."); } catch (e) { console.error("Error clearing all data:", e); alert("Kunne ikke slette all lagret data!"); } }
// === 06: CLEAR ALL DATA FUNCTION END ===

// === 07: UNIQUE ID GENERATOR SECTION START ===
function generateUniqueId(prefix = 'id') { const timestamp = Date.now().toString(36); const randomPart = Math.random().toString(36).substring(2, 9); return `${prefix}-${timestamp}-${randomPart}`; }
// === 07: UNIQUE ID GENERATOR SECTION END ===
```
*Kommentar: `storage.js` har ingen logiske endringer, kun litt opprydding i loggmeldinger.*

---
**Fil: `js/setup.js` (Ny Komplett)**
```javascript
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
    // New Standard Blinds Structure
    const standardBlindLevels = [
        {sb: 100, bb: 200}, {sb: 200, bb: 400}, {sb: 300, bb: 600}, {sb: 400, bb: 800, pauseMinutes: 10}, // Pause after level 4
        {sb: 500, bb: 1000}, {sb: 600, bb: 1200}, {sb: 800, bb: 1600}, {sb: 1000, bb: 2000, pauseMinutes: 10}, // Pause after level 8
        {sb: 1200, bb: 2400}, {sb: 1500, bb: 3000}, {sb: 2000, bb: 4000}, {sb: 2500, bb: 5000, pauseMinutes: 15}, // Pause after level 12
        {sb: 3000, bb: 6000}, {sb: 4000, bb: 8000}, {sb: 5000, bb: 10000}, {sb: 6000, bb: 12000},
        {sb: 8000, bb: 16000}, {sb: 10000, bb: 20000}, {sb: 15000, bb: 30000}, {sb: 20000, bb: 40000}
    ];
    // === 03: STATE VARIABLES END ===

    // === 04: HELPER FUNCTIONS - BLINDS START ===
    function roundToNearestValid(value, step = 100) { if (isNaN(value) || value <= 0) return step; const rounded = Math.round(value / step) * step; return Math.max(step, rounded); }
    function addBlindLevelRow(levelData = {}) {
        blindLevelCounter++; const row = blindStructureBody.insertRow(); row.dataset.levelNumber = blindLevelCounter;
        const defaultDuration = levelDurationInput.value || 20;
        const sb = levelData.sb ?? ''; const bb = levelData.bb ?? ''; const ante = levelData.ante ?? 0; const duration = levelData.duration ?? defaultDuration; const pauseMinutes = levelData.pauseMinutes ?? 0;
        row.innerHTML = `<td><span class="level-number">${blindLevelCounter}</span></td><td><input type="number" class="sb-input" value="${sb}" min="0" step="100" required></td><td><input type="number" class="bb-input" value="${bb}" min="0" step="100" required></td><td><input type="number" class="ante-input" value="${ante}" min="0" step="25" placeholder="0"></td><td><input type="number" class="duration-input" value="${duration}" min="1" required></td><td><input type="number" class="pause-duration-input" value="${pauseMinutes}" min="0" placeholder="0"></td><td><button type="button" class="btn-remove-level" title="Fjern nivå ${blindLevelCounter}">X</button></td>`;
        row.querySelector('.btn-remove-level').onclick = () => { row.remove(); updateLevelNumbers(); };
        const bbInput = row.querySelector('.bb-input'); const sbInput = row.querySelector('.sb-input');
        bbInput.onchange = () => { const bbVal = parseInt(bbInput.value); if (!isNaN(bbVal) && bbVal > 0) sbInput.value = roundToNearestValid(Math.floor(bbVal / 2), 100); };
    }
    function updateLevelNumbers() { const rows = blindStructureBody.querySelectorAll('tr'); rows.forEach((row, index) => { const levelNum = index + 1; row.dataset.levelNumber = levelNum; row.querySelector('.level-number').textContent = levelNum; row.querySelector('.btn-remove-level').title = `Fjern nivå ${levelNum}`; }); blindLevelCounter = rows.length; }
    function generateStandardBlinds() { // Use the new predefined structure
        blindStructureBody.innerHTML = ''; blindLevelCounter = 0;
        const duration = parseInt(levelDurationInput.value) || 20;
        standardBlindLevels.forEach(level => addBlindLevelRow({ ...level, duration: duration, ante: 0 })); // Add default duration, ensure ante 0
        updateLevelNumbers();
        alert("Standard blindstruktur lastet inn (SB=50%BB, ingen Ante, pauser inkludert). Rediger etter behov.");
    }
    // === 04: HELPER FUNCTIONS - BLINDS END ===

    // === 05: HELPER FUNCTIONS - PAYOUTS START ===
     function generateStandardPayout() { const places = parseInt(paidPlacesInput.value) || 0; if (places > 0 && standardPayouts[places]) { prizeDistInput.value = standardPayouts[places].join(', '); } else { prizeDistInput.value = ''; } }
    // === 05: HELPER FUNCTIONS - PAYOUTS END ===

    // === 06: HELPER FUNCTIONS - FORM POPULATION START ===
     function populateForm(config) { /* ... (No logical changes needed here) ... */ if (!config) return; tournamentNameInput.value = config.name || 'Ny Turnering'; tournamentTypeSelect.value = config.type || 'freezeout'; buyInInput.value = config.buyIn || 0; startStackInput.value = config.startStack || 10000; playersPerTableInput.value = config.playersPerTable || 9; paidPlacesInput.value = config.paidPlaces || 1; prizeDistInput.value = (config.prizeDistribution || []).join(', '); const firstLevelDuration = config.blindLevels?.find(l => l.duration > 0)?.duration; levelDurationInput.value = firstLevelDuration || 20; lateRegLevelInput.value = config.lateRegLevel || 0; tournamentTypeSelect.dispatchEvent(new Event('change')); if (config.type === 'knockout') bountyAmountInput.value = config.bountyAmount || 0; if (config.type === 'rebuy') { rebuyCostInput.value = config.rebuyCost || 0; rebuyChipsInput.value = config.rebuyChips || config.startStack; rebuyLevelsInput.value = config.rebuyLevels || 0; addonCostInput.value = config.addonCost || 0; addonChipsInput.value = config.addonChips || 0; } blindStructureBody.innerHTML = ''; blindLevelCounter = 0; if (config.blindLevels && config.blindLevels.length > 0) { config.blindLevels.forEach(level => addBlindLevelRow(level)); } else { generateStandardBlinds(); } updateLevelNumbers(); playerNamesTextarea.value = ''; }
    // === 06: HELPER FUNCTIONS - FORM POPULATION END ===

    // === 07: EVENT LISTENERS START ===
    tournamentTypeSelect.addEventListener('change', () => { const type = tournamentTypeSelect.value; rebuySection.classList.toggle('hidden', type !== 'rebuy'); knockoutSection.classList.toggle('hidden', type !== 'knockout'); });
    btnAddLevel.addEventListener('click', () => addBlindLevelRow()); btnGenerateBlinds.addEventListener('click', generateStandardBlinds); btnClearBlinds.addEventListener('click', () => { if (confirm("Slette hele blindstrukturen?")) { blindStructureBody.innerHTML = ''; blindLevelCounter = 0; } });
    btnGeneratePayout.addEventListener('click', generateStandardPayout); paidPlacesInput.addEventListener('change', generateStandardPayout);
    btnBackToMain.addEventListener('click', () => { window.location.href = 'index.html'; }); btnSaveTemplate.addEventListener('click', handleSaveTemplate); form.addEventListener('submit', handleStartTournament);
    // === 07: EVENT LISTENERS END ===

    // === 08: INITIALIZATION START ===
    const templateIdToLoad = getActiveTemplateId();
    if (templateIdToLoad) { const template = loadTemplate(templateIdToLoad); if (template?.config) { populateForm(template.config); setupTitle.textContent = `Start fra Mal: ${template.config.name}`; console.log("Loaded config from template:", template.config); } else { alert(`Kunne ikke laste mal ID: ${templateIdToLoad}`); generateStandardBlinds(); generateStandardPayout(); } clearActiveTemplateId(); }
    else { setupTitle.textContent = "Konfigurer Ny Turnering"; tournamentTypeSelect.dispatchEvent(new Event('change')); generateStandardBlinds(); generateStandardPayout(); }
    // === 08: INITIALIZATION END ===

    // === 09: FORM SUBMISSION/SAVE HANDLERS START ===
    function collectConfigFromForm() { const config = { name: tournamentNameInput.value.trim() || "Ukjent Turnering", date: new Date().toISOString().slice(0, 10), type: tournamentTypeSelect.value, buyIn: parseInt(buyInInput.value) || 0, bountyAmount: 0, startStack: parseInt(startStackInput.value) || 10000, playersPerTable: parseInt(playersPerTableInput.value) || 9, paidPlaces: parseInt(paidPlacesInput.value) || 1, prizeDistribution: prizeDistInput.value.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p) && p >= 0), rebuyCost: 0, rebuyChips: 0, rebuyLevels: 0, addonCost: 0, addonChips: 0, lateRegLevel: parseInt(lateRegLevelInput.value) || 0, blindLevels: [], }; if (config.type === 'rebuy') { config.rebuyCost = parseInt(rebuyCostInput.value) || 0; config.rebuyChips = parseInt(rebuyChipsInput.value) || config.startStack; config.rebuyLevels = parseInt(rebuyLevelsInput.value) || 0; config.addonCost = parseInt(addonCostInput.value) || 0; config.addonChips = parseInt(addonChipsInput.value) || 0; } if (config.type === 'knockout') { config.bountyAmount = parseInt(bountyAmountInput.value) || 0; } let isValid = true; let errorMessages = []; if (config.startStack <= 0) { isValid = false; errorMessages.push("Start Stack > 0."); } if (config.playersPerTable < 2) { isValid = false; errorMessages.push("Maks spillere/bord >= 2."); } if (config.paidPlaces <= 0) { isValid = false; errorMessages.push("Betalte plasser >= 1."); } if (config.prizeDistribution.length !== config.paidPlaces) { isValid = false; errorMessages.push("Antall premier != Antall Betalte."); } else { const sum = config.prizeDistribution.reduce((a, b) => a + b, 0); if (Math.abs(sum - 100) > 0.1) { isValid = false; errorMessages.push(`Premiesum (${sum.toFixed(1)}%) != 100%.`); } } if (config.type === 'knockout' && config.bountyAmount > config.buyIn) { isValid = false; errorMessages.push("Bounty > Buy-in."); } if (config.type === 'knockout' && config.bountyAmount < 0) { isValid = false; errorMessages.push("Bounty >= 0."); }
        config.blindLevels = []; let foundInvalidBlind = false; const blindRows = blindStructureBody.querySelectorAll('tr'); if (blindRows.length === 0) { isValid = false; errorMessages.push("Minst ett blindnivå kreves."); }
        blindRows.forEach((row, index) => { const levelNum = index + 1; const sbInput = row.querySelector('.sb-input'); const bbInput = row.querySelector('.bb-input'); const anteInput = row.querySelector('.ante-input'); const durationInput = row.querySelector('.duration-input'); const pauseInput = row.querySelector('.pause-duration-input'); const sb = parseInt(sbInput.value); const bb = parseInt(bbInput.value); const ante = parseInt(anteInput.value) || 0; const duration = parseInt(durationInput.value); const pauseMinutes = parseInt(pauseInput.value) || 0; let rowValid = true; [sbInput, bbInput, anteInput, durationInput, pauseInput].forEach(el => el.classList.remove('invalid'));
            if (isNaN(duration) || duration <= 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig varighet.`); durationInput.classList.add('invalid'); } if (isNaN(sb) || sb < 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig SB.`); sbInput.classList.add('invalid');} if (isNaN(bb) || bb <= 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig BB (>0).`); bbInput.classList.add('invalid');} else if (bb > 0 && sb <= 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: SB må være > 0 hvis BB > 0.`); sbInput.classList.add('invalid');} else if (bb > 0 && sb !== roundToNearestValid(Math.floor(bb/2), 100)) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: SB (${sb}) er ikke ~50% av BB (${bb}) og rundet.`); sbInput.classList.add('invalid'); bbInput.classList.add('invalid'); } if (isNaN(ante) || ante < 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig Ante.`); anteInput.classList.add('invalid');} if (isNaN(pauseMinutes) || pauseMinutes < 0) { rowValid = false; errorMessages.push(`Nivå ${levelNum}: Ugyldig pause.`); pauseInput.classList.add('invalid');} if (!rowValid) foundInvalidBlind = true;
            config.blindLevels.push({ level: levelNum, sb: sb, bb: bb, ante: ante, duration: duration, pauseMinutes: pauseMinutes }); });
        if (foundInvalidBlind) isValid = false; return { config, isValid, errorMessages }; }
    function handleStartTournament(e) {
        e.preventDefault(); const { config, isValid, errorMessages } = collectConfigFromForm(); if (!isValid) { alert("Vennligst rett følgende feil:\n\n- " + errorMessages.join("\n- ")); return; }
        const live = { status: "paused", currentLevelIndex: 0, timeRemainingInLevel: config.blindLevels[0].duration * 60, timeRemainingInBreak: 0, isOnBreak: false, players: [], eliminatedPlayers: [], totalPot: 0, totalEntries: 0, totalRebuys: 0, totalAddons: 0, nextPlayerId: 1, knockoutLog: [], activityLog: [] };
        const playerNames = playerNamesTextarea.value.split('\n').map(name => name.trim()).filter(name => name.length > 0);
        if (playerNames.length > 0) {
            const numPlayers = playerNames.length; const playersPerTable = config.playersPerTable; const numTables = Math.ceil(numPlayers / playersPerTable); console.log(`Distributing ${numPlayers} players to ${numTables} tables (max ${playersPerTable}).`);
            const basePlayersPerTable = Math.floor(numPlayers / numTables); let extraPlayers = numPlayers % numTables; let playerIndex = 0;
            for (let t = 1; t <= numTables; t++) { const playersOnThisTable = basePlayersPerTable + (extraPlayers > 0 ? 1 : 0); if (extraPlayers > 0) extraPlayers--; console.log(` - Table ${t}: Allocating ${playersOnThisTable} players.`); for (let s = 1; s <= playersOnThisTable; s++) { if (playerIndex >= numPlayers) break; const name = playerNames[playerIndex]; const player = { id: live.nextPlayerId++, name: name, stack: config.startStack, table: t, seat: s, rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0 }; live.players.push(player); live.totalPot += config.buyIn; live.totalEntries++; playerIndex++; } }
            live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); logActivity(live.activityLog, `Startet turnering med ${numPlayers} spillere fordelt på ${numTables} bord.`);
        } else { logActivity(live.activityLog, `Startet turnering uten forhåndsreg. spillere.`); }
        const tournamentState = { config, live }; const tournamentId = generateUniqueId('t'); if (saveTournamentState(tournamentId, tournamentState)) { setActiveTournamentId(tournamentId); window.location.href = 'tournament.html'; } else { alert("Feil ved lagring av turnering."); } }
    function handleSaveTemplate() { const { config, isValid, errorMessages } = collectConfigFromForm(); if (!isValid) { alert("Konfigurasjonen inneholder feil:\n\n- " + errorMessages.join("\n- ")); return; } const templateId = generateUniqueId('tmpl'); const templateData = { config }; if (saveTemplate(templateId, templateData)) { alert(`Malen "${config.name}" er lagret!`); } else { alert(`Kunne ikke lagre malen.`); } }
    // === 09: FORM SUBMISSION/SAVE HANDLERS END ===

});
// === 01: DOMContentLoaded LISTENER END ===
```
*Kommentar: `setup.js` har fått ny standard blindstruktur, korrigert initial bordfordeling, og lagt til logging ved start.*

---
**Fil: `js/tournament.js` (Ny Komplett)**
```javascript
// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', () => {
    // === 02: STATE VARIABLES START ===
    let currentTournamentId = getActiveTournamentId(); let state = null; let timerInterval = null; let realTimeInterval = null; let isModalOpen = false; let editBlindLevelCounter = 0;
    const standardPayouts = { 1: [100], 2: [65, 35], 3: [50, 30, 20], 4: [45, 27, 18, 10], 5: [40, 25, 16, 11, 8], 6: [38, 24, 15, 10, 8, 5], 7: [36, 23, 14, 10, 8, 5, 4], 8: [35, 22, 13, 9, 7, 6, 4, 4], 9: [34, 21, 13, 9, 7, 6, 4, 3, 3], 10: [33, 20, 12, 9, 7, 6, 5, 3, 3, 2] };
    // === 02: STATE VARIABLES END ===

    // === 03: DOM REFERENCES START ===
    const nameDisplay = document.getElementById('tournament-name-display'); const currentTimeDisplay = document.getElementById('current-time'); const btnEditSettings = document.getElementById('btn-edit-settings'); const btnBackToMainLive = document.getElementById('btn-back-to-main-live');
    const timerDisplay = document.getElementById('timer-display'); const currentLevelDisplay = document.getElementById('current-level'); const nextBlindsDisplay = document.getElementById('next-blinds'); const blindsDisplay = document.getElementById('blinds-display'); const breakInfo = document.getElementById('break-info');
    const playersRemainingDisplay = document.getElementById('players-remaining'); const totalEntriesDisplay = document.getElementById('total-entries'); const averageStackDisplay = document.getElementById('average-stack'); const totalPotDisplay = document.getElementById('total-pot'); const lateRegStatusDisplay = document.getElementById('late-reg-status');
    const prizeDisplayLive = document.getElementById('prize-display-live'); const prizeSummarySpan = document.getElementById('prize-summary'); const startPauseButton = document.getElementById('btn-start-pause'); const prevLevelButton = document.getElementById('btn-prev-level'); const nextLevelButton = document.getElementById('btn-next-level');
    const adjustTimeMinusButton = document.getElementById('btn-adjust-time-minus'); const adjustTimePlusButton = document.getElementById('btn-adjust-time-plus'); const lateRegButton = document.getElementById('btn-late-reg'); const playerListUl = document.getElementById('player-list');
    const eliminatedPlayerListUl = document.getElementById('eliminated-player-list'); const activePlayerCountSpan = document.getElementById('active-player-count'); const eliminatedPlayerCountSpan = document.getElementById('eliminated-player-count'); const tableBalanceInfo = document.getElementById('table-balance-info');
    const btnForceSave = document.getElementById('btn-force-save'); const endTournamentButton = document.getElementById('btn-end-tournament'); const modal = document.getElementById('edit-settings-modal'); const closeModalButton = document.getElementById('close-modal-button');
    const editBlindStructureBody = document.getElementById('edit-blind-structure-body'); const btnAddEditLevel = document.getElementById('btn-add-edit-level'); const editPaidPlacesInput = document.getElementById('edit-paid-places'); const editPrizeDistTextarea = document.getElementById('edit-prize-distribution');
    const btnGenerateEditPayout = document.getElementById('btn-generate-edit-payout'); const btnSaveEditedSettings = document.getElementById('btn-save-edited-settings'); const btnCancelEditSettings = document.getElementById('btn-cancel-edit-settings'); const activityLogUl = document.getElementById('activity-log-list');
    // === 03: DOM REFERENCES END ===

    // === 04: INITIALIZATION & VALIDATION START ===
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state) { alert(`Kunne ikke laste turneringsdata ID: ${currentTournamentId}.`); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    console.log(`Loaded T: ${state.config.name} (ID: ${currentTournamentId})`, state);
    state.live = state.live || {}; state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.knockoutLog = state.live.knockoutLog || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.players = state.live.players || []; state.live.activityLog = state.live.activityLog || []; // Initialize log
    // === 04: INITIALIZATION & VALIDATION END ===

    // === 05: HELPER FUNCTIONS - FORMATTING START ===
    function formatTime(seconds) { if (isNaN(seconds) || seconds < 0) return "00:00"; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }
    function formatBlindsHTML(level) { if (!level) return `<span class="value">--</span>/<span class="value">--</span><span class="label">A:</span><span class="value">--</span>`; let a = ''; if (level.ante > 0) a = `<span class="label">A:</span><span class="value">${level.ante}</span>`; return `<span class="value">${level.sb}</span>/<span class="value">${level.bb}</span>${a}`; } // Shortened Ante label
    function formatNextBlindsText(level, nextIsBreak = false, breakDuration = 0) { if (!level && !nextIsBreak) return "N/A"; if (nextIsBreak) return `Pause (${breakDuration} min)`; const a = level.ante > 0 ? `(${level.ante})` : ''; return `${level.sb}/${level.bb}${a}`; }
    function getPlayerNameById(playerId) { const player = state.live.players.find(p => p.id === playerId) || state.live.eliminatedPlayers.find(p => p.id === playerId); return player ? player.name : 'Ukjent'; }
    function roundToNearestValid(value, step = 100) { if (isNaN(value) || value <= 0) return step; const rounded = Math.round(value / step) * step; return Math.max(step, rounded); } // Also needed in tournament for modal edit
    // === 05: HELPER FUNCTIONS - FORMATTING END ===

    // === 06: HELPER FUNCTIONS - CALCULATIONS START ===
    function calculateTotalChips() { const b = state.live.totalEntries * state.config.startStack; const r = state.live.totalRebuys * (state.config.rebuyChips || 0); const a = state.live.totalAddons * (state.config.addonChips || 0); return b + r + a; }
    function calculateAverageStack() { const ap = state.live.players.length; if (ap === 0) return 0; const tc = calculateTotalChips(); return Math.round(tc / ap); }
    function calculatePrizes() { const p = []; const pfp = state.live.totalPot - (state.config.type === 'knockout' ? state.live.totalEntries * (state.config.bountyAmount || 0) : 0); if (pfp <= 0 || !state.config.prizeDistribution || state.config.prizeDistribution.length !== state.config.paidPlaces) return p; let sum = 0; for (let i = 0; i < state.config.paidPlaces; i++) { const pct = state.config.prizeDistribution[i] || 0; let amt; if (i === state.config.paidPlaces - 1) { amt = Math.max(0, pfp - sum); } else { amt = Math.floor((pfp * pct) / 100); } if (amt > 0 || (p.length === 0 && state.config.paidPlaces === 1)) { p.push({ place: i + 1, amount: amt, percentage: pct }); sum += amt; } else if (p.length > 0) { p.push({ place: i + 1, amount: 0, percentage: pct }); } else break; if(p.length >= state.config.paidPlaces) break; } return p; }
    // === 06: HELPER FUNCTIONS - CALCULATIONS END ===

    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT START ===
    function assignTableSeat(player) { /* ... (No changes needed) ... */ const tables = {}; let minTableNum = -1; state.live.players.forEach(p => { if (p.id !== player.id) { tables[p.table] = (tables[p.table] || 0) + 1; } }); const sortedTables = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).sort((a, b) => a.count - b.count); for (const tableInfo of sortedTables) { if (tableInfo.count < state.config.playersPerTable) { minTableNum = tableInfo.tableNum; break; } } if (minTableNum === -1) { const existingTableNumbers = Object.keys(tables).map(Number); minTableNum = existingTableNumbers.length > 0 ? Math.max(...existingTableNumbers) + 1 : 1; player.table = minTableNum; player.seat = 1; } else { const occupiedSeats = state.live.players.filter(p => p.table === minTableNum).map(p => p.seat); let seatNum = 1; while (occupiedSeats.includes(seatNum)) { seatNum++; } if (seatNum > state.config.playersPerTable) { console.error(`ERROR: No seat on table ${minTableNum}`); seatNum = occupiedSeats.length + 1; } player.table = minTableNum; player.seat = seatNum; } console.log(`Assigned ${player.name} to T${player.table} S${player.seat}`); }
    function reassignAllSeats(tableNum = 1) { // New function for final table redraw
        const playersToReseat = state.live.players.filter(p => p.table === tableNum);
        const numPlayers = playersToReseat.length;
        const seats = Array.from({ length: numPlayers }, (_, i) => i + 1); // Create array [1, 2, ..., numPlayers]
        // Shuffle seats array (Fisher-Yates shuffle)
        for (let i = seats.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [seats[i], seats[j]] = [seats[j], seats[i]];
        }
        // Assign shuffled seats
        playersToReseat.forEach((player, index) => {
            player.seat = seats[index];
            logActivity(state.live.activityLog, `Finalebord: ${player.name} får sete ${player.seat}.`);
        });
        state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); // Re-sort internal list
    }
    function checkAndHandleTableBreak() { // New function to consolidate tables
        const activePlayersCount = state.live.players.length;
        const playersPerTable = state.config.playersPerTable;
        const currentTables = new Set(state.live.players.map(p => p.table)).size;
        const targetTables = Math.ceil(activePlayersCount / playersPerTable);

        if (currentTables > targetTables) {
            // Find table to break (usually one with fewest players)
            const tables = {}; state.live.players.forEach(p => { tables[p.table] = (tables[p.table] || 0) + 1; });
            const sortedTables = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).sort((a, b) => a.count - b.count);
            const tableToBreak = sortedTables[0].tableNum;

            logActivity(state.live.activityLog, `Slår sammen bord! Flytter spillere fra bord ${tableToBreak}.`);
            alert(`Slår sammen bord! Flytter spillere fra bord ${tableToBreak}.`);

            const playersToMove = state.live.players.filter(p => p.table === tableToBreak);
            playersToMove.forEach(player => {
                 player.table = 0; // Temporarily unset table
                 assignTableSeat(player); // Assign to a new table/seat
                 logActivity(state.live.activityLog, `Flyttet ${player.name} til Bord ${player.table} Sete ${player.seat}.`);
            });

            // Check if we reached the final table
            const finalTableSize = playersPerTable; // Or a specific final table size config?
            if (activePlayersCount <= finalTableSize && new Set(state.live.players.map(p => p.table)).size === 1) {
                 const finalTableNum = state.live.players[0].table;
                 logActivity(state.live.activityLog, `Finalebord (Bord ${finalTableNum})! Trekker nye seter...`);
                 alert("Finalebord! Nye seter trekkes.");
                 reassignAllSeats(finalTableNum);
            }
            return true; // Table break happened
        }
        return false; // No table break needed
    }
    function balanceTables() { // Now mainly handles balancing existing tables after checks
         if (state.live.status === 'finished' || state.live.players.length <= state.config.playersPerTable) { tableBalanceInfo.classList.add('hidden'); return false; }
         let balancingPerformed = false;
         while (true) {
             const tables = {}; state.live.players.forEach(p => { tables[p.table] = (tables[p.table] || 0) + 1; });
             const tableCounts = Object.entries(tables).map(([num, count]) => ({ tableNum: parseInt(num), count: count })).filter(tc => tc.count > 0);
             if (tableCounts.length < 2) { tableBalanceInfo.classList.add('hidden'); break; }
             tableCounts.sort((a, b) => a.count - b.count); const minTable = tableCounts[0]; const maxTable = tableCounts[tableCounts.length - 1];
             if (maxTable.count - minTable.count < 2) { tableBalanceInfo.classList.add('hidden'); break; } // Balanced
             balancingPerformed = true; tableBalanceInfo.classList.remove('hidden'); console.log(`Balancing: Max T${maxTable.tableNum}(${maxTable.count}), Min T${minTable.tableNum}(${minTable.count})`);
             const playersOnMaxTable = state.live.players.filter(p => p.table === maxTable.tableNum); if (playersOnMaxTable.length === 0) { console.error("Balancing Error!"); break; }
             const playerToMove = playersOnMaxTable[Math.floor(Math.random() * playersOnMaxTable.length)];
             const occupiedSeatsMin = state.live.players.filter(p => p.table === minTable.tableNum).map(p => p.seat); let newSeat = 1; while (occupiedSeatsMin.includes(newSeat)) { newSeat++; }
             if (newSeat > state.config.playersPerTable) { console.error(`Balancing Error: No seat on sparse table ${minTable.tableNum}.`); alert(`Balanseringsfeil bord ${minTable.tableNum}.`); break; }
             const oldTable = playerToMove.table; const oldSeat = playerToMove.seat; const message = `Balansering: ${playerToMove.name} flyttes fra B${oldTable} S${oldSeat} til B${minTable.tableNum} S${newSeat}.`;
             logActivity(state.live.activityLog, message);
             playerToMove.table = minTable.tableNum; playerToMove.seat = newSeat; // Make move before alert
             updateUI(); // Update UI to show move before alert blocks
             alert(message); // Alert *after* state change and UI update
         }
         if (balancingPerformed) { console.log("Balancing changes applied."); state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); return true; } return false;
     }
    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT END ===

    // === 07b: HELPER FUNCTIONS - LOGGING START ===
    function logActivity(logArray, message) { if (!logArray) logArray = []; const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit'}); logArray.unshift({ timestamp, message }); const MAX_LOG_ENTRIES = 50; if (logArray.length > MAX_LOG_ENTRIES) { logArray.pop(); } renderActivityLog(); }
    function renderActivityLog() { if (!activityLogUl) return; activityLogUl.innerHTML = ''; if (!state?.live?.activityLog || state.live.activityLog.length === 0) { activityLogUl.innerHTML = '<li>Loggen er tom.</li>'; return; } state.live.activityLog.forEach(entry => { const li = document.createElement('li'); li.innerHTML = `<span class="log-time">[${entry.timestamp}]</span> ${entry.message}`; activityLogUl.appendChild(li); }); }
    // === 07b: HELPER FUNCTIONS - LOGGING END ===

    // === 08: UI UPDATE FUNCTIONS START ===
    function renderPlayerList() { /* ... (No change needed) ... */ playerListUl.innerHTML = ''; eliminatedPlayerListUl.innerHTML = ''; const currentLevelNum = state.live.currentLevelIndex + 1; const isRebuyActive = state.config.type === 'rebuy' && currentLevelNum <= state.config.rebuyLevels; const isAddonActive = state.config.type === 'rebuy' && currentLevelNum > state.config.rebuyLevels; const canEdit = state.live.status !== 'finished'; state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table).forEach(player => { const li = document.createElement('li'); let playerInfo = `${player.name} <span class="player-details">(B${player.table} S${player.seat})</span>`; if (player.rebuys > 0) playerInfo += ` <span class="player-details">[${player.rebuys}R]</span>`; if (player.addon) playerInfo += ` <span class="player-details">[A]</span>`; if (state.config.type === 'knockout' && player.knockouts > 0) playerInfo += ` <span class="player-details">(KOs: ${player.knockouts})</span>`; let actions = ''; if (canEdit) { actions += `<button class="btn-edit-player small-button" data-player-id="${player.id}" title="Rediger Navn">✏️</button>`; if (isRebuyActive) actions += `<button class="btn-rebuy small-button" data-player-id="${player.id}" title="Registrer Rebuy">R</button>`; if (isAddonActive && !player.addon) actions += `<button class="btn-addon small-button" data-player-id="${player.id}" title="Registrer Addon">A</button>`; actions += `<button class="btn-eliminate small-button danger-button" data-player-id="${player.id}" title="Eliminer Spiller">X</button>`; } li.innerHTML = `<span class="item-name">${playerInfo}</span><div class="list-actions player-actions">${actions}</div>`; playerListUl.appendChild(li); }); state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity)).forEach(player => { const li = document.createElement('li'); let elimInfo = `${player.place ?? '?'}. ${player.name}`; if (player.rebuys > 0) elimInfo += ` <span class="player-details">[${player.rebuys}R]</span>`; if (player.addon) elimInfo += ` <span class="player-details">[A]</span>`; if (state.config.type === 'knockout' && player.knockouts > 0) elimInfo += ` <span class="player-details">(KOs: ${player.knockouts})</span>`; if (player.eliminatedBy) elimInfo += ` <span class="player-details">(av ${getPlayerNameById(player.eliminatedBy)})</span>`; li.innerHTML = `<span class="item-name">${elimInfo}</span><div class="list-actions player-actions">${canEdit ? `<button class="btn-restore small-button warning-button" data-player-id="${player.id}" title="Gjenopprett Spiller">↩️</button>` : ''}</div>`; eliminatedPlayerListUl.appendChild(li); }); activePlayerCountSpan.textContent = state.live.players.length; eliminatedPlayerCountSpan.textContent = state.live.eliminatedPlayers.length; playerListUl.querySelectorAll('.btn-edit-player').forEach(btn => btn.onclick = handleEditPlayer); playerListUl.querySelectorAll('.btn-rebuy').forEach(btn => btn.onclick = handleRebuy); playerListUl.querySelectorAll('.btn-addon').forEach(btn => btn.onclick = handleAddon); playerListUl.querySelectorAll('.btn-eliminate').forEach(btn => btn.onclick = handleEliminate); eliminatedPlayerListUl.querySelectorAll('.btn-restore').forEach(btn => btn.onclick = handleRestore); }
    function displayPrizes() { /* ... (No change needed) ... */ if (!prizeDisplayLive) return; const prizeData = calculatePrizes(); prizeDisplayLive.innerHTML = '<h3>Premiefordeling</h3>'; let summaryText = "N/A"; if (prizeData.length > 0) { const ol = document.createElement('ol'); prizeData.forEach(p => { const li = document.createElement('li'); li.textContent = `${p.place}. Plass: ${p.amount.toLocaleString('nb-NO')} kr (${p.percentage}%)`; ol.appendChild(li); }); prizeDisplayLive.appendChild(ol); summaryText = `${prizeData.length} plasser betalt`; if (prizeData[0]) summaryText += `, 1.: ${prizeData[0].amount.toLocaleString('nb-NO')} kr`; prizeDisplayLive.classList.remove('hidden'); } else { prizeDisplayLive.classList.add('hidden'); /* Hide if no prizes */ const potForPrizes = state.live.totalPot - (state.config.type === 'knockout' ? state.live.totalEntries * (state.config.bountyAmount || 0) : 0); if (potForPrizes > 0 && (!state.config.prizeDistribution || state.config.prizeDistribution.length === 0)) { summaryText = 'Udefinert'; } else { summaryText = 'Ingen pott'; } } if(prizeSummarySpan) prizeSummarySpan.textContent = summaryText; }
    function updateUI() {
        const elementsToCheck = { nameDisplay, currentTimeDisplay, timerDisplay, currentLevelDisplay, nextBlindsDisplay, blindsDisplay, breakInfo, playersRemainingDisplay, totalEntriesDisplay, averageStackDisplay, totalPotDisplay, lateRegStatusDisplay, lateRegButton, startPauseButton, prevLevelButton, nextLevelButton, adjustTimeMinusButton, adjustTimePlusButton, btnEditSettings, endTournamentButton, prizeDisplayLive, prizeSummarySpan, playerListUl, eliminatedPlayerListUl, activePlayerCountSpan, eliminatedPlayerCountSpan, tableBalanceInfo, activityLogUl }; let missingElement = null; for (const key in elementsToCheck) { if (!elementsToCheck[key]) { missingElement = key; break; } } if (missingElement) { console.error(`CRITICAL ERROR: UI element "${missingElement}" missing.`); if(timerInterval) clearInterval(timerInterval); if(realTimeInterval) clearInterval(realTimeInterval); document.body.innerHTML = `<h1 style="color:red; text-align:center; margin-top: 50px;">UI Feil! Element "${missingElement}" mangler.</h1>`; return; }
        nameDisplay.textContent = state.config.name; currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const currentLevelIndex = state.live.currentLevelIndex; const currentLevel = state.config.blindLevels[currentLevelIndex]; const nextLevel = state.config.blindLevels[currentLevelIndex + 1]; const upcomingPauseMinutes = currentLevel?.pauseMinutes || 0; const nextLevelIsBreak = upcomingPauseMinutes > 0;
        currentLevelDisplay.textContent = `(Nivå ${currentLevel ? currentLevel.level : 'N/A'})`; // Show level number with blinds
        nextBlindsDisplay.textContent = formatNextBlindsText(nextLevel, nextLevelIsBreak, upcomingPauseMinutes);
        if (state.live.isOnBreak) { timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak); blindsDisplay.innerHTML = ''; blindsDisplay.classList.add('hidden'); breakInfo.classList.remove('hidden'); breakInfo.textContent = `PAUSE (${formatTime(state.live.timeRemainingInBreak)})`; }
        else { timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); blindsDisplay.classList.remove('hidden'); breakInfo.classList.add('hidden'); blindsDisplay.innerHTML = formatBlindsHTML(currentLevel); }
        const activePlayersCount = state.live.players.length; playersRemainingDisplay.textContent = activePlayersCount; totalEntriesDisplay.textContent = state.live.totalEntries; averageStackDisplay.textContent = calculateAverageStack().toLocaleString('nb-NO'); totalPotDisplay.textContent = state.live.totalPot.toLocaleString('nb-NO');
        const currentLevelNum = currentLevelIndex + 1; const lateRegOpen = currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0 && state.live.status !== 'finished';
        if (state.config.lateRegLevel > 0) { lateRegStatusDisplay.textContent = `Late Reg: ${lateRegOpen ? `Åpen t.o.m. nivå ${state.config.lateRegLevel}` : 'Stengt'}`; } else { lateRegStatusDisplay.textContent = 'Late Reg: Ikke tilgjengelig'; }
        lateRegButton.disabled = !lateRegOpen || state.live.status !== 'running';
        startPauseButton.textContent = state.live.status === 'running' ? 'Pause Klokke' : 'Start Klokke'; startPauseButton.disabled = state.live.status === 'finished';
        prevLevelButton.disabled = currentLevelIndex <= 0 || state.live.status === 'finished'; nextLevelButton.disabled = currentLevelIndex >= state.config.blindLevels.length - 1 || state.live.status === 'finished';
        adjustTimeMinusButton.disabled = state.live.status === 'finished'; adjustTimePlusButton.disabled = state.live.status === 'finished';
        btnEditSettings.disabled = state.live.status === 'finished'; endTournamentButton.disabled = state.live.status === 'finished';
        renderPlayerList(); displayPrizes(); renderActivityLog();
     }
    // === 08: UI UPDATE FUNCTIONS END ===

    // === 09: TIMER LOGIC START ===
    function tick() { /* ... (No changes needed) ... */ if (state.live.status !== 'running') return; if (state.live.isOnBreak) { state.live.timeRemainingInBreak--; breakInfo.textContent = `PAUSE (${formatTime(state.live.timeRemainingInBreak)})`; if (state.live.timeRemainingInBreak < 0) { state.live.isOnBreak = false; state.live.currentLevelIndex++; if (state.live.currentLevelIndex >= state.config.blindLevels.length) { finishTournament(); return; } const newLevel = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = newLevel.duration * 60; logActivity(state.live.activityLog, `Pause over. Nivå ${newLevel.level} starter.`); updateUI(); saveTournamentState(currentTournamentId, state); } else if (state.live.timeRemainingInBreak % 15 === 0) { saveTournamentState(currentTournamentId, state); } } else { state.live.timeRemainingInLevel--; timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel); if (state.live.timeRemainingInLevel < 0) { const currentLevel = state.config.blindLevels[state.live.currentLevelIndex]; const pauseMinutes = currentLevel?.pauseMinutes || 0; if (pauseMinutes > 0) { state.live.isOnBreak = true; state.live.timeRemainingInBreak = pauseMinutes * 60; logActivity(state.live.activityLog, `Nivå ${currentLevel.level} ferdig. Starter ${pauseMinutes} min pause.`); updateUI(); saveTournamentState(currentTournamentId, state); } else { state.live.currentLevelIndex++; if (state.live.currentLevelIndex >= state.config.blindLevels.length) { finishTournament(); return; } const newLevel = state.config.blindLevels[state.live.currentLevelIndex]; state.live.timeRemainingInLevel = newLevel.duration * 60; logActivity(state.live.activityLog, `Nivå ${newLevel.level} starter.`); updateUI(); saveTournamentState(currentTournamentId, state); } } else if (state.live.timeRemainingInLevel > 0 && state.live.timeRemainingInLevel % 30 === 0) { saveTournamentState(currentTournamentId, state); } } }
    function startRealTimeClock() { /* ... (No change needed) ... */ if (realTimeInterval) clearInterval(realTimeInterval); realTimeInterval = setInterval(() => { if(currentTimeDisplay) currentTimeDisplay.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }, 1000); }
    // === 09: TIMER LOGIC END ===

    // === 10: EVENT HANDLERS - CONTROLS START ===
    function handleStartPause() { /* ... (No change needed) ... */ if (state.live.status === 'finished') return; if (state.live.status === 'paused') { state.live.status = 'running'; if (!timerInterval) timerInterval = setInterval(tick, 1000); logActivity(state.live.activityLog, "Klokke startet."); } else { state.live.status = 'paused'; logActivity(state.live.activityLog, "Klokke pauset."); saveTournamentState(currentTournamentId, state); } updateUI(); }
    function handleAdjustTime(deltaSeconds) { /* ... (Added logging) ... */ if (state.live.status === 'finished') return; let target = state.live.isOnBreak ? 'timeRemainingInBreak' : 'timeRemainingInLevel'; let limit = state.live.isOnBreak ? Infinity : (state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60); state.live[target] += deltaSeconds; state.live[target] = Math.max(0, state.live[target]); if (limit !== undefined) state.live[target] = Math.min(limit, state.live[target]); logActivity(state.live.activityLog, `Tid justert ${deltaSeconds > 0 ? '+' : ''}${deltaSeconds / 60} min.`); updateUI(); saveTournamentState(currentTournamentId, state); }
    function handleAdjustLevel(deltaIndex) { /* ... (Added logging) ... */ if (state.live.status === 'finished') return; const newIndex = state.live.currentLevelIndex + deltaIndex; if (newIndex >= 0 && newIndex < state.config.blindLevels.length) { const oldLevel = state.config.blindLevels[state.live.currentLevelIndex].level; const newLevel = state.config.blindLevels[newIndex]; state.live.currentLevelIndex = newIndex; state.live.timeRemainingInLevel = newLevel.duration * 60; state.live.isOnBreak = false; state.live.timeRemainingInBreak = 0; logActivity(state.live.activityLog, `Nivå manuelt endret fra ${oldLevel} til ${newLevel.level}.`); updateUI(); saveTournamentState(currentTournamentId, state); } else { console.warn("Cannot adjust level."); } }
    function handleEndTournament() { /* ... (No change needed) ... */ if (state.live.status === 'finished') { alert("Turneringen er allerede fullført."); return; } if (confirm("Markere turneringen som fullført?")) finishTournament(); }
    function handleForceSave() { /* ... (No change needed) ... */ if(state) { if(saveTournamentState(currentTournamentId, state)) { btnForceSave.textContent = "Lagret!"; setTimeout(() => { btnForceSave.textContent = "Lagre Nå"; }, 1500); } else { alert("Lagring feilet!");} } }
    function handleBackToMain() { /* ... (No change needed) ... */ if (state && state.live.status !== 'finished') saveTournamentState(currentTournamentId, state); window.location.href = 'index.html'; }
    // === 10: EVENT HANDLERS - CONTROLS END ===

    // === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    function handleRebuy(event) { /* ... (Added logging) ... */ const playerId = parseInt(event.target.dataset.playerId); const player = state.live.players.find(p => p.id === playerId); const currentLevelNum = state.live.currentLevelIndex + 1; if (!player || state.config.type !== 'rebuy' || !(currentLevelNum <= state.config.rebuyLevels)) { alert("Re-buy ikke tilgjengelig."); return; } if (confirm(`Re-buy (${state.config.rebuyCost} kr) for ${player.name}?`)) { player.rebuys = (player.rebuys || 0) + 1; state.live.totalPot += state.config.rebuyCost; state.live.totalEntries++; state.live.totalRebuys++; logActivity(state.live.activityLog, `${player.name} tok Re-buy.`); updateUI(); saveTournamentState(currentTournamentId, state); } }
    function handleAddon(event) { /* ... (Added logging) ... */ const playerId = parseInt(event.target.dataset.playerId); const player = state.live.players.find(p => p.id === playerId); const currentLevelNum = state.live.currentLevelIndex + 1; const isAddonPeriod = currentLevelNum > state.config.rebuyLevels; if (!player || state.config.type !== 'rebuy' || !isAddonPeriod || player.addon) { alert("Add-on ikke tilgjengelig."); return; } if (confirm(`Add-on (${state.config.addonCost} kr) for ${player.name}?`)) { player.addon = true; state.live.totalPot += state.config.addonCost; state.live.totalAddons++; logActivity(state.live.activityLog, `${player.name} tok Add-on.`); updateUI(); saveTournamentState(currentTournamentId, state); } }
    function handleEliminate(event) { // Handles save/update via balanceTables or manually
        if (state.live.status === 'finished') return; const playerId = parseInt(event.target.dataset.playerId); const activePlayers = state.live.players; const playerIndex = activePlayers.findIndex(p => p.id === playerId); if (playerIndex === -1) return;
        if (activePlayers.length <= 1) { alert("Kan ikke eliminere siste spiller."); return; } // Prevent eliminating last player
        const player = activePlayers[playerIndex]; let eliminatedByPlayerId = null; let eliminatorName = null;
        if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0 && activePlayers.length > 1) { const otherPlayers = activePlayers.filter(p => p.id !== playerId).map(p => `${p.name} (B${p.table}S${p.seat})`); const promptMessage = `Hvem slo ut ${player.name}?\n\nAktive:\n - ${otherPlayers.join("\n - ")}`; const eliminatorInput = prompt(promptMessage); if (eliminatorInput?.trim()) { const inputLower = eliminatorInput.trim().toLowerCase(); const eliminator = activePlayers.find(p => p.id !== playerId && p.name.toLowerCase() === inputLower); if (eliminator) { eliminatedByPlayerId = eliminator.id; eliminator.knockouts = (eliminator.knockouts || 0) + 1; eliminatorName = eliminator.name; state.live.knockoutLog.push({ eliminatedPlayerId: player.id, eliminatedByPlayerId: eliminator.id }); } else { alert(`Fant ikke "${eliminatorInput}".`); } } }
        if (confirm(`Eliminere ${player.name}?`)) {
            player.eliminated = true; player.eliminatedBy = eliminatedByPlayerId; player.place = activePlayers.length;
            state.live.eliminatedPlayers.push(player); activePlayers.splice(playerIndex, 1); // Remove FIRST
            const elimText = eliminatorName ? ` av ${eliminatorName}` : ''; logActivity(state.live.activityLog, `${player.name} slått ut på ${player.place}. plass${elimText}.`);
            const brokeTable = checkAndHandleTableBreak(); // Check for table break first
            if (brokeTable) { // If table broke, UI update and save happened there
                 if (state.live.players.length === 1) finishTournament(); // Check finish after potential redraw
            } else { // If no table break, check regular balance
                 const balanced = balanceTables(); // balanceTables now saves/updates UI if it does work
                 if (!balanced) { // If no balancing needed either, update/save manually
                      updateUI(); saveTournamentState(currentTournamentId, state);
                 }
                 if (state.live.players.length === 1) finishTournament(); // Check finish after potential balancing/update
            }
        }
    }
    function handleRestore(event) { // Handles save/update via balanceTables or manually
         if (state.live.status === 'finished') { alert("Kan ikke gjenopprette."); return; } const playerId = parseInt(event.target.dataset.playerId); const playerIndex = state.live.eliminatedPlayers.findIndex(p => p.id === playerId); if (playerIndex === -1) return; const player = state.live.eliminatedPlayers[playerIndex]; if (confirm(`Gjenopprette ${player.name} (var ${player.place}. plass)?`)) { const eliminatedBy = player.eliminatedBy; const oldPlace = player.place; player.eliminated = false; player.eliminatedBy = null; player.place = null; state.live.eliminatedPlayers.splice(playerIndex, 1); state.live.players.push(player); if (state.config.type === 'knockout' && eliminatedBy) { const eliminator = state.live.players.find(p => p.id === eliminatedBy) || state.live.eliminatedPlayers.find(p => p.id === eliminatedBy); if (eliminator?.knockouts > 0) eliminator.knockouts--; const logIndex = state.live.knockoutLog.findIndex(log => log.eliminatedPlayerId === player.id && log.eliminatedByPlayerId === eliminatedBy); if (logIndex > -1) state.live.knockoutLog.splice(logIndex, 1); } assignTableSeat(player); logActivity(state.live.activityLog, `${player.name} gjenopprettet fra ${oldPlace}. plass.`);
             const brokeTable = checkAndHandleTableBreak(); if (!brokeTable) { const balanced = balanceTables(); if (!balanced) { updateUI(); saveTournamentState(currentTournamentId, state); } } } }
    function handleEditPlayer(event) { /* ... (Added logging) ... */ if (state.live.status === 'finished') return; const playerId = parseInt(event.target.dataset.playerId); const player = state.live.players.find(p => p.id === playerId); if (!player) return; const oldName = player.name; const newName = prompt(`Endre navn for ${oldName}:`, oldName); if (newName?.trim() && newName.trim() !== oldName) { player.name = newName.trim(); logActivity(state.live.activityLog, `Navn endret: ${oldName} -> ${player.name}.`); renderPlayerList(); saveTournamentState(currentTournamentId, state); } else if (newName === "") alert("Navn kan ikke være tomt."); }
    function handleLateRegClick() { /* ... (Added logging) ... */ if (state.live.status === 'finished') return; const currentLevelNum = state.live.currentLevelIndex + 1; const lateRegOpen = currentLevelNum <= state.config.lateRegLevel && state.config.lateRegLevel > 0; if (!lateRegOpen) { alert("Sen registrering er stengt."); return; } if (state.live.status !== 'running') { alert("Start klokken for sen registrering."); return; } const name = prompt("Navn for sen registrering:"); if (name?.trim()) { const cost = state.config.buyIn; const player = { id: generateUniqueId('p'), name: name.trim(), stack: state.config.startStack, table: 0, seat: 0, rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0 }; state.live.players.push(player); assignTableSeat(player); state.live.totalPot += cost; state.live.totalEntries++; logActivity(state.live.activityLog, `${player.name} registrert (Late Reg).`); const balanced = balanceTables(); if (!balanced) { updateUI(); saveTournamentState(currentTournamentId, state); } } }
    // === 11: EVENT HANDLERS - PLAYER ACTIONS END ===

    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    function openEditModal() { /* ... (Updated addEditBlindLevelRow call) ... */ if (state.live.status === 'finished' || isModalOpen) return; console.log("Opening edit modal"); editBlindStructureBody.innerHTML = ''; editBlindLevelCounter = 0; state.config.blindLevels.forEach(level => addEditBlindLevelRow(level)); updateEditLevelNumbers(); editPaidPlacesInput.value = state.config.paidPlaces; editPrizeDistTextarea.value = state.config.prizeDistribution.join(', '); modal.classList.remove('hidden'); isModalOpen = true; }
    function closeEditModal() { /* ... (No change needed) ... */ modal.classList.add('hidden'); isModalOpen = false; }
    function addEditBlindLevelRow(levelData = {}) { /* ... (Updated for pauseMinutes) ... */ editBlindLevelCounter++; const row = editBlindStructureBody.insertRow(); row.dataset.levelNumber = editBlindLevelCounter; const sb = levelData.sb ?? ''; const bb = levelData.bb ?? ''; const ante = levelData.ante ?? 0; const duration = levelData.duration ?? (state.config.blindLevels?.[0]?.duration || 20); const pauseMinutes = levelData.pauseMinutes ?? 0; const isPastLevel = levelData.level <= state.live.currentLevelIndex + 1 && !state.live.isOnBreak; row.innerHTML = `<td><span class="level-number">${editBlindLevelCounter}</span> ${isPastLevel ? '<small>(Låst)</small>':''}</td><td><input type="number" class="sb-input" value="${sb}" min="0" step="100" ${isPastLevel ? 'disabled' : ''}></td><td><input type="number" class="bb-input" value="${bb}" min="0" step="100" ${isPastLevel ? 'disabled' : ''}></td><td><input type="number" class="ante-input" value="${ante}" min="0" step="25" ${isPastLevel ? 'disabled' : ''}></td><td><input type="number" class="duration-input" value="${duration}" min="1" ${isPastLevel ? 'disabled' : ''}></td><td><input type="number" class="pause-duration-input" value="${pauseMinutes}" min="0" ${isPastLevel ? 'disabled' : ''}></td><td><button type="button" class="btn-remove-level" title="Fjern nivå ${editBlindLevelCounter}" ${isPastLevel ? 'disabled' : ''}>X</button></td>`; const removeBtn = row.querySelector('.btn-remove-level'); const bbInput = row.querySelector('.bb-input'); const sbInput = row.querySelector('.sb-input'); if (!isPastLevel) { removeBtn.onclick = () => { row.remove(); updateEditLevelNumbers(); }; bbInput.onchange = () => { const bbVal = parseInt(bbInput.value); if (!isNaN(bbVal) && bbVal > 0) sbInput.value = roundToNearestValid(Math.floor(bbVal / 2), 100); }; } else { row.querySelectorAll('input').forEach(inp => inp.disabled = true); removeBtn.disabled = true; } }
    function updateEditLevelNumbers() { /* ... (No change needed) ... */ const rows = editBlindStructureBody.querySelectorAll('tr'); rows.forEach((row, index) => { const levelNum = index + 1; row.dataset.levelNumber = levelNum; row.querySelector('.level-number').textContent = levelNum; row.querySelector('.btn-remove-level').title = `Fjern nivå ${levelNum}`; }); editBlindLevelCounter = rows.length; }
    function generateEditPayout() { /* ... (No change needed) ... */ const places = parseInt(editPaidPlacesInput.value) || 0; if (places > 0 && standardPayouts[places]) { editPrizeDistTextarea.value = standardPayouts[places].join(', '); } else { editPrizeDistTextarea.value = ''; } }
    function handleSaveEditedSettings() { /* ... (Updated blind validation) ... */ console.log("Saving edits..."); let changesMade = false; let needsUIUpdate = false; const currentLevelIndex = state.live.currentLevelIndex; let overallValid = true; const newBlindLevels = []; const editBlindRows = editBlindStructureBody.querySelectorAll('tr'); if (editBlindRows.length === 0) { alert("Minst ett blindnivå kreves."); return; }
        editBlindRows.forEach((row, index) => { const levelNum = index + 1; let rowValid = true; const sbInput=row.querySelector('.sb-input'); const bbInput=row.querySelector('.bb-input'); const anteInput=row.querySelector('.ante-input'); const durationInput=row.querySelector('.duration-input'); const pauseInput=row.querySelector('.pause-duration-input'); const sb = parseInt(sbInput.value); const bb = parseInt(bbInput.value); const ante = parseInt(anteInput.value) || 0; const duration = parseInt(durationInput.value); const pauseMinutes = parseInt(pauseInput.value) || 0; const isPastLevel = levelNum <= currentLevelIndex + 1 && !state.live.isOnBreak; [sbInput, bbInput, anteInput, durationInput, pauseInput].forEach(el => el.classList.remove('invalid'));
             if (!isPastLevel) { if (isNaN(duration) || duration <= 0) { rowValid = false; durationInput.classList.add('invalid'); } if (isNaN(sb) || sb < 0) { rowValid = false; sbInput.classList.add('invalid');} if (isNaN(bb) || bb <= 0) { rowValid = false; bbInput.classList.add('invalid');} else if (bb > 0 && sb <= 0) { rowValid = false; sbInput.classList.add('invalid');} else if (bb > 0 && sb !== roundToNearestValid(Math.floor(bb/2), 100)) { rowValid = false; sbInput.classList.add('invalid'); bbInput.classList.add('invalid'); } if (isNaN(ante) || ante < 0) { rowValid = false; anteInput.classList.add('invalid');} if (isNaN(pauseMinutes) || pauseMinutes < 0) { rowValid = false; pauseInput.classList.add('invalid');} }
             if (!rowValid) overallValid = false; newBlindLevels.push({ level: levelNum, sb: sb, bb: bb, ante: ante, duration: duration, pauseMinutes: pauseMinutes }); });
        if (!overallValid) { alert("Ugyldige verdier i blindstruktur."); return; } if (JSON.stringify(state.config.blindLevels) !== JSON.stringify(newBlindLevels)) { state.config.blindLevels = newBlindLevels; changesMade = true; needsUIUpdate = true; logActivity(state.live.activityLog, "Blindstruktur endret."); }
        const newPaidPlaces = parseInt(editPaidPlacesInput.value); const newPrizeDist = editPrizeDistTextarea.value.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p) && p >= 0); let prizesValid = true; if (isNaN(newPaidPlaces) || newPaidPlaces <= 0) { prizesValid = false; alert("Ugyldig antall betalte."); } else if (newPrizeDist.length !== newPaidPlaces) { prizesValid = false; alert("Antall % != Antall betalte."); } else { const sum = newPrizeDist.reduce((a, b) => a + b, 0); if (Math.abs(sum - 100) > 0.1) { prizesValid = false; alert(`% sum (${sum.toFixed(1)}) != 100.`); } }
        if (prizesValid && (state.config.paidPlaces !== newPaidPlaces || JSON.stringify(state.config.prizeDistribution) !== JSON.stringify(newPrizeDist))) { const playersInMoney = state.live.eliminatedPlayers.filter(p => p.place <= state.config.paidPlaces).length; if (playersInMoney === 0 || confirm(`Advarsel: ${playersInMoney} spiller(e) i pengene. Endre premier?`)) { state.config.paidPlaces = newPaidPlaces; state.config.prizeDistribution = newPrizeDist; changesMade = true; needsUIUpdate = true; logActivity(state.live.activityLog, "Premiestruktur endret."); } else { prizesValid = false;} }
        if (!overallValid || !prizesValid) { console.warn("Edits not saved."); return; } if (changesMade) { if(saveTournamentState(currentTournamentId, state)) { alert("Endringer lagret!"); if (needsUIUpdate) updateUI(); closeEditModal(); } else { alert("Lagring feilet!"); } } else { alert("Ingen endringer."); closeEditModal(); } }
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===

    // === 13: TOURNAMENT FINISH LOGIC START ===
    function finishTournament() { /* ... (No change needed) ... */ if (state.live.status === 'finished') return; console.log("Finishing tournament..."); clearInterval(timerInterval); timerInterval = null; clearInterval(realTimeInterval); realTimeInterval = null; state.live.status = 'finished'; state.live.isOnBreak = false; if (state.live.players.length === 1) { const winner = state.live.players[0]; winner.place = 1; state.live.eliminatedPlayers.push(winner); state.live.players.splice(0, 1); logActivity(state.live.activityLog, `Vinner: ${winner.name}!`);} else if (state.live.players.length === 0) { logActivity(state.live.activityLog, `Turnering fullført (ingen aktive spillere igjen).`); } else { logActivity(state.live.activityLog, `Turnering fullført (${state.live.players.length} spillere igjen - Chop?).`); } state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity)); console.log("Tournament officially finished!"); updateUI(); saveTournamentState(currentTournamentId, state); alert("Turneringen er fullført!"); }
    // === 13: TOURNAMENT FINISH LOGIC END ===

    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    startPauseButton.addEventListener('click', handleStartPause); prevLevelButton.addEventListener('click', () => handleAdjustLevel(-1)); nextLevelButton.addEventListener('click', () => handleAdjustLevel(1)); adjustTimeMinusButton.addEventListener('click', () => handleAdjustTime(-60)); adjustTimePlusButton.addEventListener('click', () => handleAdjustTime(60)); lateRegButton.addEventListener('click', handleLateRegClick); endTournamentButton.addEventListener('click', handleEndTournament); btnForceSave.addEventListener('click', handleForceSave); btnBackToMainLive.addEventListener('click', handleBackToMain); btnEditSettings.addEventListener('click', openEditModal); closeModalButton.addEventListener('click', closeEditModal); btnCancelEditSettings.addEventListener('click', closeEditModal); modal.addEventListener('click', (e) => { if (e.target === modal) closeEditModal(); }); btnAddEditLevel.addEventListener('click', () => addEditBlindLevelRow()); btnGenerateEditPayout.addEventListener('click', generateEditPayout); btnSaveEditedSettings.addEventListener('click', handleSaveEditedSettings);
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===

    // === 15: INITIAL UI RENDER & TIMER START ===
    if(!state.live.activityLog) state.live.activityLog = []; console.log("Rendering initial UI..."); updateUI(); startRealTimeClock(); if (state.live.status === 'running') { timerInterval = setInterval(tick, 1000); } else if (state.live.status === 'finished') { finishTournament(); }
    // === 15: INITIAL UI RENDER & TIMER START ===
});
// === 01: DOMContentLoaded LISTENER END ===
