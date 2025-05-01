// === 01: DOMContentLoaded LISTENER START ===
document.addEventListener('DOMContentLoaded', async () => { // ENDRET: Gjort async for å await init
    console.log("Tournament page DOM loaded.");
    // === 02: STATE VARIABLES START ===
    let currentTournamentId = getActiveTournamentId();
    let state = null;
    let timerInterval = null;
    let realTimeInterval = null;
    let isModalOpen = false;
    let currentOpenModal = null;

    // UI Modal State
    let originalThemeBg = '';
    let originalThemeText = '';
    let originalElementLayouts = {};
    let originalSoundVolume = 0.7;
    // NYTT: Logo state - holder Blob-objektet eller null
    let currentLogoBlob = null; // Logo som vises nå
    let logoBlobInModal = null; // Logo-tilstand inne i modalen før lagring
    // NYTT: For å håndtere Object URLs
    let currentLogoObjectUrl = null;
    let previewLogoObjectUrl = null;
    let blockSliderUpdates = false;

    // Drag and Drop State
    let isDragging = false;
    let draggedElement = null;
    let offsetX = 0;
    let offsetY = 0;

    // Sound State & URLs
    let soundsEnabled = loadSoundPreference();
    let currentVolume = loadSoundVolume();
    const SOUND_URLS = { /* ... (som før) ... */
        NEW_LEVEL: 'sounds/new_level.wav', PAUSE_START: 'sounds/pause_start.wav', PAUSE_END: 'sounds/pause_end.wav',
        BUBBLE: 'sounds/bubble_start.wav', KNOCKOUT: 'sounds/knockout.wav', FINAL_TABLE: 'sounds/final_table.wav',
        TOURNAMENT_END: 'sounds/tournament_end.wav', TEST: 'sounds/new_level.wav'
    };

    // Predefined Themes
    const PREDEFINED_THEMES = [ /* ... (som før) ... */
        { name: "Elegant & Moderne",  bg: "rgb(28, 28, 30)",    text: "rgb(245, 245, 245)" },
        { name: "Lys & Frisk",        bg: "rgb(232, 245, 252)", text: "rgb(33, 53, 71)"    },
        { name: "Retro & Kreativ",    bg: "rgb(255, 235, 148)", text: "rgb(43, 43, 43)"    },
        { name: "Dramatisk & Stilren", bg: "rgb(34, 0, 51)",     text: "rgb(255, 255, 255)" },
        { name: "Naturell & Harmonisk",bg: "rgb(223, 228, 212)", text: "rgb(61, 64, 54)"    },
    ];

    // Tournament Modal State
    let editBlindLevelCounter = 0;
    const standardPayouts = { /* ... (som før) ... */ };
    // === 02: STATE VARIABLES END ===


    // === 03: DOM REFERENCES START ===
    // Main page elements... (som før)
    const currentTimeDisplay = document.getElementById('current-time');
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    const btnEditTournamentSettings = document.getElementById('btn-edit-tournament-settings');
    const btnEditUiSettings = document.getElementById('btn-edit-ui-settings');
    const btnBackToMainLive = document.getElementById('btn-back-to-main-live');
    const prizeDisplayLive = document.getElementById('prize-display-live');
    const totalPotPrizeSpan = document.getElementById('total-pot');
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
    const btnForceSave = document.getElementById('btn-force-save');
    const endTournamentButton = document.getElementById('btn-end-tournament');
    const activityLogUl = document.getElementById('activity-log-list');
    const headerRightControls = document.querySelector('.header-right-controls');
    // Canvas & Elements... (som før)
    const liveCanvas = document.getElementById('live-canvas');
    const titleElement = document.getElementById('title-element');
    const timerElement = document.getElementById('timer-element');
    const blindsElement = document.getElementById('blinds-element');
    const logoElement = document.getElementById('logo-element');
    const infoElement = document.getElementById('info-element');
    const draggableElements = [titleElement, timerElement, blindsElement, logoElement, infoElement];
    // Specific Display Elements... (som før)
    const nameDisplay = document.getElementById('tournament-name-display');
    const timerDisplay = document.getElementById('timer-display');
    const breakInfo = document.getElementById('break-info');
    const currentLevelDisplay = document.getElementById('current-level');
    const blindsDisplay = document.getElementById('blinds-display');
    const logoImg = logoElement?.querySelector('.logo'); // Hovedlogo
    const nextBlindsDisplay = document.getElementById('next-blinds');
    const infoNextPauseParagraph = document.getElementById('info-next-pause');
    const averageStackDisplay = document.getElementById('average-stack');
    const playersRemainingDisplay = document.getElementById('players-remaining');
    const totalEntriesDisplay = document.getElementById('total-entries');
    const lateRegStatusDisplay = document.getElementById('late-reg-status');
    // Tournament Settings Modal Refs... (som før)
    const tournamentSettingsModal = document.getElementById('tournament-settings-modal');
    const closeTournamentModalButton = document.getElementById('close-tournament-modal-button');
    const editBlindStructureBody = document.getElementById('edit-blind-structure-body');
    const btnAddEditLevel = document.getElementById('btn-add-edit-level');
    const editPaidPlacesInput = document.getElementById('edit-paid-places');
    const editPrizeDistTextarea = document.getElementById('edit-prize-distribution');
    const btnGenerateEditPayout = document.getElementById('btn-generate-edit-payout');
    const btnSaveTournamentSettings = document.getElementById('btn-save-tournament-settings');
    const btnCancelTournamentEdit = document.getElementById('btn-cancel-tournament-edit');
    // UI Settings Modal Refs... (layout, visibility, size, info toggles, theme controls, theme selectors, sound - som før)
    const uiSettingsModal = document.getElementById('ui-settings-modal');
    const closeUiModalButton = document.getElementById('close-ui-modal-button');
    const canvasHeightSlider = document.getElementById('canvasHeightSlider'); const canvasHeightInput = document.getElementById('canvasHeightInput');
    const toggleTitleElement = document.getElementById('toggleTitleElement'); const toggleTimerElement = document.getElementById('toggleTimerElement'); const toggleBlindsElement = document.getElementById('toggleBlindsElement'); const toggleLogoElement = document.getElementById('toggleLogoElement'); const toggleInfoElement = document.getElementById('toggleInfoElement'); const visibilityToggles = [toggleTitleElement, toggleTimerElement, toggleBlindsElement, toggleLogoElement, toggleInfoElement];
    const titleWidthSlider = document.getElementById('titleWidthSlider'); const titleWidthInput = document.getElementById('titleWidthInput'); const titleFontSizeSlider = document.getElementById('titleFontSizeSlider'); const titleFontSizeInput = document.getElementById('titleFontSizeInput'); const timerWidthSlider = document.getElementById('timerWidthSlider'); const timerWidthInput = document.getElementById('timerWidthInput'); const timerFontSizeSlider = document.getElementById('timerFontSizeSlider'); const timerFontSizeInput = document.getElementById('timerFontSizeInput'); const blindsWidthSlider = document.getElementById('blindsWidthSlider'); const blindsWidthInput = document.getElementById('blindsWidthInput'); const blindsFontSizeSlider = document.getElementById('blindsFontSizeSlider'); const blindsFontSizeInput = document.getElementById('blindsFontSizeInput'); const logoWidthSlider = document.getElementById('logoWidthSlider'); const logoWidthInput = document.getElementById('logoWidthInput'); const logoHeightSlider = document.getElementById('logoHeightSlider'); const logoHeightInput = document.getElementById('logoHeightInput'); const infoWidthSlider = document.getElementById('infoWidthSlider'); const infoWidthInput = document.getElementById('infoWidthInput'); const infoFontSizeSlider = document.getElementById('infoFontSizeSlider'); const infoFontSizeInput = document.getElementById('infoFontSizeInput');
    const toggleInfoNextBlinds = document.getElementById('toggleInfoNextBlinds'); const toggleInfoNextPause = document.getElementById('toggleInfoNextPause'); const toggleInfoAvgStack = document.getElementById('toggleInfoAvgStack'); const toggleInfoPlayers = document.getElementById('toggleInfoPlayers'); const toggleInfoLateReg = document.getElementById('toggleInfoLateReg'); const infoParagraphs = { showNextBlinds: document.getElementById('info-next-blinds'), showNextPause: infoNextPauseParagraph, showAvgStack: document.getElementById('info-avg-stack'), showPlayers: document.getElementById('info-players'), showLateReg: document.getElementById('info-late-reg') };
    const customLogoInput = document.getElementById('customLogoInput');
    const logoPreview = document.getElementById('logoPreview'); // Logo preview i modal
    const btnRemoveCustomLogo = document.getElementById('btnRemoveCustomLogo');
    const bgRedSlider = document.getElementById('bgRedSlider'); const bgGreenSlider = document.getElementById('bgGreenSlider'); const bgBlueSlider = document.getElementById('bgBlueSlider'); const bgRedInput = document.getElementById('bgRedInput'); const bgGreenInput = document.getElementById('bgGreenInput'); const bgBlueInput = document.getElementById('bgBlueInput'); const bgColorPreview = document.getElementById('bg-color-preview'); const textRedSlider = document.getElementById('textRedSlider'); const textGreenSlider = document.getElementById('textGreenSlider'); const textBlueSlider = document.getElementById('textBlueSlider'); const textRedInput = document.getElementById('textRedInput'); const textGreenInput = document.getElementById('textGreenInput'); const textBlueInput = document.getElementById('textBlueInput'); const textColorPreview = document.getElementById('text-color-preview'); const bgHueSlider = document.getElementById('bgHueSlider'); const bgHueInput = document.getElementById('bgHueInput'); const bgSatSlider = document.getElementById('bgSatSlider'); const bgSatInput = document.getElementById('bgSatInput'); const bgLigSlider = document.getElementById('bgLigSlider'); const bgLigInput = document.getElementById('bgLigInput'); const textHueSlider = document.getElementById('textHueSlider'); const textHueInput = document.getElementById('textHueInput'); const textSatSlider = document.getElementById('textSatSlider'); const textSatInput = document.getElementById('textSatInput'); const textLigSlider = document.getElementById('textLigSlider'); const textLigInput = document.getElementById('textLigInput');
    const predefinedThemeSelect = document.getElementById('predefinedThemeSelect');
    const btnLoadPredefinedTheme = document.getElementById('btnLoadPredefinedTheme');
    const themeFavoritesSelect = document.getElementById('themeFavoritesSelect'); const btnLoadThemeFavorite = document.getElementById('btnLoadThemeFavorite'); const newThemeFavoriteNameInput = document.getElementById('newThemeFavoriteName'); const btnSaveThemeFavorite = document.getElementById('btnSaveThemeFavorite'); const btnDeleteThemeFavorite = document.getElementById('btnDeleteThemeFavorite');
    const volumeSlider = document.getElementById('volumeSlider'); const volumeInput = document.getElementById('volumeInput'); const btnTestSound = document.getElementById('btn-test-sound');
    const btnSaveUiSettings = document.getElementById('btn-save-ui-settings'); const btnCancelUiEdit = document.getElementById('btn-cancel-ui-edit'); const btnResetLayoutTheme = document.getElementById('btnResetLayoutTheme');
    // Lists of controls ... (som før)
    const sizeSliders = [canvasHeightSlider, titleWidthSlider, titleFontSizeSlider, timerWidthSlider, timerFontSizeSlider, blindsWidthSlider, blindsFontSizeSlider, logoWidthSlider, logoHeightSlider, infoWidthSlider, infoFontSizeSlider];
    const sizeInputs = [canvasHeightInput, titleWidthInput, titleFontSizeInput, timerWidthInput, timerFontSizeInput, blindsWidthInput, blindsFontSizeInput, logoWidthInput, logoHeightInput, infoWidthInput, infoFontSizeInput];
    const colorSliders = [bgHueSlider, bgSatSlider, bgLigSlider, bgRedSlider, bgGreenSlider, bgBlueSlider, textHueSlider, textSatSlider, textLigSlider, textRedSlider, textGreenSlider, textBlueSlider];
    const colorInputs = [bgHueInput, bgSatInput, bgLigInput, bgRedInput, bgGreenInput, bgBlueInput, textHueInput, textSatInput, textLigInput, textRedInput, textGreenInput, textBlueInput];
    const internalInfoToggles = [toggleInfoNextBlinds, toggleInfoNextPause, toggleInfoAvgStack, toggleInfoPlayers, toggleInfoLateReg];
    // === 03: DOM REFERENCES END ===


    // === 04: INITIALIZATION & VALIDATION START ===
    // Validering av state (som før)
    if (!currentTournamentId) { alert("Ingen aktiv turnering valgt."); window.location.href = 'index.html'; return; }
    state = loadTournamentState(currentTournamentId);
    if (!state || !state.config || !state.live || !state.config.blindLevels || state.config.blindLevels.length === 0) { alert(`Kunne ikke laste gyldig turneringsdata (ID: ${currentTournamentId}).`); console.error("Invalid tournament state loaded:", state); clearActiveTournamentId(); window.location.href = 'index.html'; return; }
    // Default live state values (som før)
    state.live = state.live || {}; state.live.status = state.live.status || 'paused'; state.live.currentLevelIndex = state.live.currentLevelIndex ?? 0; state.live.timeRemainingInLevel = state.live.timeRemainingInLevel ?? (state.config.blindLevels[state.live.currentLevelIndex]?.duration * 60 || 1200); state.live.isOnBreak = state.live.isOnBreak ?? false; state.live.timeRemainingInBreak = state.live.timeRemainingInBreak ?? 0; state.live.players = state.live.players || []; state.live.eliminatedPlayers = state.live.eliminatedPlayers || []; state.live.knockoutLog = state.live.knockoutLog || []; state.live.activityLog = state.live.activityLog || []; state.live.totalPot = state.live.totalPot ?? 0; state.live.totalEntries = state.live.totalEntries ?? 0; state.live.totalRebuys = state.live.totalRebuys ?? 0; state.live.totalAddons = state.live.totalAddons ?? 0;
    console.log(`Loaded Tournament: ${state.config.name} (ID: ${currentTournamentId})`, state);
    // === 04: INITIALIZATION & VALIDATION END ===


    // === 04b: THEME & LAYOUT APPLICATION START ===
    // ENDRET: Bruker nå Blob/Object URL for logo
    function revokeObjectUrl(url) { // NY Hjelpefunksjon
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
            // console.log("Revoked Object URL:", url);
        }
    }

    function applyLogo(logoBlob) { // ENDRET: Tar imot Blob
        if (!logoImg) return;

        // Revoke forrige object URL før vi setter en ny (eller fjerner den)
        revokeObjectUrl(currentLogoObjectUrl);
        currentLogoObjectUrl = null; // Nullstill

        if (logoBlob instanceof Blob) {
            currentLogoObjectUrl = URL.createObjectURL(logoBlob); // Lag ny URL
            logoImg.src = currentLogoObjectUrl;
            logoImg.alt = "Egendefinert Logo";
            // console.log("Applying custom logo Blob:", currentLogoObjectUrl);
        } else {
            logoImg.src = 'placeholder-logo.png';
            logoImg.alt = "Winjevoll Pokerklubb Logo";
            // console.log("Applying default logo.");
        }
        // Oppdater global state for logo-blob
        currentLogoBlob = logoBlob;
    }

    // ENDRET: applyThemeLayoutAndLogo er nå async pga loadLogoBlob
    async function applyThemeLayoutAndLogo() {
        const bgColor = loadThemeBgColor();
        const textColor = loadThemeTextColor();
        const elementLayouts = loadElementLayouts();
        const logoDataBlob = await loadLogoBlob(); // NYTT: Henter Blob async

        applyThemeAndLayout(bgColor, textColor, elementLayouts); // Denne er fortsatt synkron
        applyLogo(logoDataBlob); // Denne setter logo basert på blob
    }

    // Funksjonen for å kun sette theme/layout (synkron)
    function applyThemeAndLayout(bgColor, textColor, elementLayouts) {
        // Apply Theme... (som før)
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--live-page-bg', bgColor);
        rootStyle.setProperty('--live-page-text', textColor);
        try { /* ... (border calc som før) ... */ } catch (e) { /* ... */ }

        // Apply Layout... (som før)
        const defaults = DEFAULT_ELEMENT_LAYOUTS;
        rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas?.height ?? defaults.canvas.height}vh`);
        draggableElements.forEach(element => { /* ... (som før) ... */ });
        const infoLayout = { ...defaults.info, ...(elementLayouts.info || {}) };
        for (const key in infoParagraphs) { /* ... (som før) ... */ }
    }

    await applyThemeLayoutAndLogo(); // ENDRET: Må await init-kallet
    // === 04b: THEME & LAYOUT APPLICATION END ===


    // === 04c: DRAG AND DROP LOGIC START ===
    // Ingen endringer her
    function startDrag(event, element) { /* ... (som før) ... */ }
    function doDrag(event) { /* ... (som før) ... */ }
    function endDrag(event) { /* ... (som før) ... */ }
    // === 04c: DRAG AND DROP LOGIC END ===


    // === 05: HELPER FUNCTIONS - FORMATTING START ===
    // Ingen endringer her
    function formatTime(seconds) { /* ... */ }
    function formatBlindsHTML(level) { /* ... */ }
    function formatNextBlindsText(level) { /* ... */ }
    function getPlayerNameById(playerId) { /* ... */ }
    function roundToNearestValid(value, step = 100) { /* ... */ }
    // === 05: HELPER FUNCTIONS - FORMATTING END ===


    // === 06: HELPER FUNCTIONS - CALCULATIONS START ===
    // Ingen endringer her
    function calculateTotalChips() { /* ... */ }
    function calculateAverageStack() { /* ... */ }
    function calculatePrizes() { /* ... */ }
    function findNextPauseInfo() { /* ... */ }
    // === 06: HELPER FUNCTIONS - CALCULATIONS END ===


    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT START ===
    // Ingen endringer her
    function assignTableSeat(player, excludeTableNum = null) { /* ... */ }
    function reassignAllSeats(targetTableNum) { /* ... */ }
    function checkAndHandleTableBreak() { /* ... */ }
    function balanceTables() { /* ... */ }
    // === 07: HELPER FUNCTIONS - TABLE MANAGEMENT END ===


    // === 07b: HELPER FUNCTIONS - LOGGING START ===
    // Ingen endringer her
    function logActivity(logArray, message) { /* ... */ }
    function renderActivityLog() { /* ... */ }
    // === 07b: HELPER FUNCTIONS - LOGGING END ===


    // === 07c: HELPER FUNCTIONS - SOUND START ===
    // Ingen endringer her
    function playSound(soundKey) { /* ... */ }
    function updateSoundToggleVisuals() { /* ... */ }
    // === 07c: HELPER FUNCTIONS - SOUND END ===


    // === 08: UI UPDATE FUNCTIONS START ===
    // Ingen endringer her
    function renderPlayerList() { /* ... */ }
    function displayPrizes() { /* ... */ }
    function updateUI() { /* ... (inkluderer kall til renderPlayerList, displayPrizes, renderActivityLog etc) ... */ }
    // === 08: UI UPDATE FUNCTIONS END ===


    // === 09: TIMER LOGIC START ===
    // Ingen endringer her
    function tick() { /* ... */ }
    function startRealTimeClock() { /* ... */ }
    // === 09: TIMER LOGIC END ===


    // === 10: EVENT HANDLERS - CONTROLS START ===
    // Ingen endringer her
    function handleStartPause() { /* ... */ }
    function handleAdjustTime(deltaSeconds) { /* ... */ }
    function handleAdjustLevel(deltaIndex) { /* ... */ }
    function handleEndTournament() { /* ... */ }
    function handleForceSave() { /* ... */ }
    function handleBackToMain() { /* ... */ }
    // === 10: EVENT HANDLERS - CONTROLS END ===


    // === 11: EVENT HANDLERS - PLAYER ACTIONS START ===
    // Ingen endringer her
    function handleRebuy(event){ /* ... */ }
    function handleAddon(event){ /* ... */ }
    function handleEliminate(event){ /* ... */ }
    function handleRestore(event){ /* ... */ }
    function handleEditPlayer(event){ /* ... */ }
    function handleLateRegClick() { /* ... */ }
    // === 11: EVENT HANDLERS - PLAYER ACTIONS END ===


    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS START ===
    function openTournamentModal() { /* ... (som før) ... */ }
    function closeTournamentModal() { /* ... (som før) ... */ }

    // ENDRET: Gjort async for å laste logo
    async function openUiModal() {
        if (isModalOpen) return;
        console.log("Opening UI modal");
        // Store original values
        originalThemeBg = loadThemeBgColor();
        originalThemeText = loadThemeTextColor();
        originalElementLayouts = loadElementLayouts();
        originalSoundVolume = loadSoundVolume();
        currentLogoBlob = await loadLogoBlob(); // Last inn aktiv logo-blob
        logoBlobInModal = currentLogoBlob;      // Sett modal-state lik aktiv state

        blockSliderUpdates=true;
        // Populate Colors, Layout, Toggles, Sound (som før)
        /* ... */
        // Populate Logo Preview (ENDRET: Bruker Object URL)
        revokeObjectUrl(previewLogoObjectUrl); // Fjern gammel preview URL
        previewLogoObjectUrl = logoBlobInModal ? URL.createObjectURL(logoBlobInModal) : null;
        logoPreview.src = previewLogoObjectUrl || 'placeholder-logo.png';
        customLogoInput.value = '';
        /* ... */
        blockSliderUpdates=false;

        // Populate Dropdowns
        populatePredefinedThemes();
        populateThemeFavorites();

        updateColorAndLayoutPreviews();
        addThemeAndLayoutListeners();

        uiSettingsModal.classList.remove('hidden'); isModalOpen = true; currentOpenModal = uiSettingsModal;
    }

    // ENDRET: Gjort async for revert
    async function closeUiModal(revert = false) {
        // Revoke preview URL uansett
        revokeObjectUrl(previewLogoObjectUrl);
        previewLogoObjectUrl = null;

        if (revert) {
            console.log("Reverting UI changes...");
            // Revert Theme, Layout, Volume (synkront)
            applyThemeAndLayout(originalThemeBg, originalThemeText, originalElementLayouts);
            currentVolume = originalSoundVolume;
            // saveSoundVolume(currentVolume); // Volum lagres kun ved Save

            // Revert Logo (asynkront - hent den opprinnelige blobben på nytt)
            const originalBlob = await loadLogoBlob();
            applyLogo(originalBlob); // Sett hovedlogo tilbake
            console.log("UI changes cancelled, reverted.");
        } else {
            // Hvis vi *ikke* reverterer, er logoen allerede satt riktig
            // via handleSaveUiSettings eller handleResetLayoutTheme.
            // Vi trenger ikke gjøre noe med logo her.
        }
        removeThemeAndLayoutListeners();
        uiSettingsModal.classList.add('hidden');
        isModalOpen = false;
        currentOpenModal = null;
    }
    function addEditBlindLevelRow(levelData={}){ /* ... (som før) ... */ }
    function updateEditLevelNumbers(){ /* ... (som før) ... */ }
    function generateEditPayout(){ /* ... (som før) ... */ }
    function syncRgbFromHsl(prefix){ /* ... (som før) ... */ }
    function syncHslFromRgb(prefix){ /* ... (som før) ... */ }

    // ENDRET: Oppdaterer nå logo live basert på logoBlobInModal
    function updateColorAndLayoutPreviews() {
        if (!isModalOpen || currentOpenModal !== uiSettingsModal) return;
        const bg = syncHslFromRgb('bg');
        const txt = syncHslFromRgb('text');
        // Hent layout-innstillinger fra modal... (som før)
        const layouts = { /* ... fylles fra sliders/inputs ... */ };
        const currentFullLayouts = loadElementLayouts(); // For å få X/Y etc.
        visibilityToggles.forEach(toggle => { /* ... merge layout ... (som før) ... */ });
        // Preview farger (som før)
        if(bgColorPreview) bgColorPreview.style.backgroundColor = bg;
        if(textColorPreview) { /* ... */ }

        // Apply changes live (Theme, Layout)
        applyThemeAndLayout(bg, txt, layouts); // Pass the fully merged layout

        // Apply logo preview (NYTT: Bruker logoBlobInModal)
        // Trenger ikke lage ny object URL her, den settes i handleLogoUpload/handleRemoveLogo
        applyLogo(logoBlobInModal); // Vis logoen som er valgt *i modalen*
    }

    // Funksjon for å håndtere endringer i modalen (FLYTTET OPP)
    function handleThemeLayoutControlChange(e) { /* ... (som før, men uten logo-logikk) ... */ }

    function addThemeAndLayoutListeners(){ /* ... (som før, med logo listeners) ... */ }
    function removeThemeAndLayoutListeners(){ /* ... (som før, med logo listeners) ... */ }
    function populatePredefinedThemes() { /* ... (som før) ... */ }
    function handleLoadPredefinedTheme() { /* ... (som før) ... */ }
    function populateThemeFavorites() { /* ... (som før) ... */ }
    function enableDisableDeleteButton(){ /* ... (som før) ... */ }
    function handleLoadFavorite() { /* ... (som før) ... */ }
    function handleSaveFavorite() { /* ... (som før) ... */ }
    function handleDeleteFavorite() { /* ... (som før) ... */ }
    function handleSaveTournamentSettings(){ /* ... (som før) ... */ }

    // ENDRET: Gjort async pga saveLogoBlob/clearLogoBlob
    async function handleSaveUiSettings(){
        console.log("Saving UI...");
        let themeCh=false; let layoutCh=false; let volumeCh = false; let logoCh = false;
        let success = true; // Flagg for å sjekke om lagring var vellykket

        // Theme (som før)...
        const bg=`rgb(${bgRedInput.value}, ${bgGreenInput.value}, ${bgBlueInput.value})`;
        const txt=`rgb(${textRedInput.value}, ${textGreenInput.value}, ${textBlueInput.value})`;
        if(bg!==originalThemeBg||txt!==originalThemeText){ saveThemeBgColor(bg); saveThemeTextColor(txt); console.log("Theme saved."); themeCh=true; }

        // Layout (som før)...
        const finalLayouts={ canvas:{height:parseInt(canvasHeightInput.value)} };
        const currentFullLayouts = loadElementLayouts();
        draggableElements.forEach(element => { /* ... merge layout ... (som før) */ });
        if(JSON.stringify(finalLayouts)!==JSON.stringify(originalElementLayouts)){ saveElementLayouts(finalLayouts); console.log("Layout saved."); layoutCh=true; originalElementLayouts = finalLayouts; }

        // Sound Volume (som før)...
        const finalVolume = parseFloat(volumeInput.value);
        if (finalVolume !== originalSoundVolume) { saveSoundVolume(finalVolume); currentVolume = finalVolume; console.log("Volume saved."); volumeCh = true; originalSoundVolume = finalVolume; }

        // Logo (ENDRET: Bruker async save/clear)
        if (logoBlobInModal !== currentLogoBlob) { // Sammenlign blob-referanser
            if (logoBlobInModal === null) { // Logo removed in modal
                if (!await clearLogoBlob()) { success = false; } // Prøv å slette
                else { console.log("Custom logo cleared from storage."); }
            } else { // New logo added/changed in modal
                if (!await saveLogoBlob(logoBlobInModal)) { success = false; } // Prøv å lagre
                else { console.log("Custom logo saved to storage."); }
            }
            if (success) {
                logoCh = true;
                currentLogoBlob = logoBlobInModal; // Oppdater global state ved suksess
            } else {
                // Lagring/sletting feilet (feilmelding vist fra storage.js)
                // Ikke sett logoCh = true
                // Ikke oppdater currentLogoBlob
                // (Modalen forblir åpen)
                return; // Stopp lagringsprosessen
            }
        }

        // Apply final state and close modal if changes were made and saved successfully
        if (success && (themeCh || layoutCh || volumeCh || logoCh)) {
            // applyThemeLayoutAndLogo() er ikke nødvendig her, da endringene
            // er brukt live via updateColorAndLayoutPreviews og applyLogo.
            // Vi trenger bare å sikre at den endelige logoen (currentLogoBlob) vises.
            applyLogo(currentLogoBlob);
            alert("Utseende & Lyd lagret!");
            closeUiModal(false);
        } else if (success) { // Ingen endringer
            alert("Ingen endringer å lagre.");
            closeUiModal(false);
        }
        // Hvis !success, har feilmelding blitt vist, og modalen er fortsatt åpen.
    }

    // ENDRET: Gjort async pga clearLogoBlob
    async function handleResetLayoutTheme() {
        if (confirm("Tilbakestille layout, farger, logo og lyd til standard?")) {
            const dLayout = DEFAULT_ELEMENT_LAYOUTS; const dBg = DEFAULT_THEME_BG; const dTxt = DEFAULT_THEME_TEXT; const dVol = DEFAULT_SOUND_VOLUME;
            console.log("Resetting UI...");
            // Reset layout in memory... (som før)
            const resetLayouts = { /* ... lag resetLayouts ... */ };
            // Apply visual reset for theme, layout, sound
            applyThemeAndLayout(dBg, dTxt, resetLayouts);
            currentVolume = dVol;
            volumeInput.value = volumeSlider.value = dVol; // Oppdater slider/input

            // Reset logo state in modal
            logoBlobInModal = null; // Tøm logoen som vurderes i modalen
            revokeObjectUrl(previewLogoObjectUrl); // Fjern gammel preview URL
            previewLogoObjectUrl = null;
            logoPreview.src = 'placeholder-logo.png';
            customLogoInput.value = '';
            applyLogo(null); // Vis standardlogo live også

            // Update modal controls... (som før)
            blockSliderUpdates=true;
            /* ... oppdater farge/size/visibility controls ... */
            blockSliderUpdates=false;

            alert("Layout/farger/lyd/logo tilbakestilt i modalen. Trykk Lagre for å bruke endringene (inkludert fjerning av lagret logo).")
            // Selve slettingen av logo fra DB skjer først når bruker trykker Lagre
        }
    }

    // ENDRET: Bruker nå saveLogoBlob og URL.createObjectURL
    function handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (!validTypes.includes(file.type)) { alert('Ugyldig filtype.'); customLogoInput.value = ''; return; }
        const maxSizeMB = 4; // Økt grense, men IndexedDB håndterer det
        if (file.size > maxSizeMB * 1024 * 1024) { alert(`Filen er stor (over ${maxSizeMB}MB), men vi prøver å lagre.`); }

        // Oppdater modal state umiddelbart
        logoBlobInModal = file; // Lagre filen (som er en Blob)

        // Oppdater preview umiddelbart
        revokeObjectUrl(previewLogoObjectUrl); // Fjern gammel URL
        previewLogoObjectUrl = URL.createObjectURL(logoBlobInModal);
        logoPreview.src = previewLogoObjectUrl;

        // Oppdater hovedvisning live
        applyLogo(logoBlobInModal);

        console.log(`Logo selected: ${file.name}, size: ${file.size} bytes. Ready to be saved.`);
        // Selve lagringen til DB skjer først når bruker trykker "Lagre Utseende"
    }

    // ENDRET: Setter bare modal-state til null
    function handleRemoveLogo() {
        if (confirm("Fjerne egendefinert logo og gå tilbake til standard (krever Lagre)?")) {
            logoBlobInModal = null; // Fjern midlertidig
            revokeObjectUrl(previewLogoObjectUrl); // Fjern gammel URL
            previewLogoObjectUrl = null;
            logoPreview.src = 'placeholder-logo.png'; // Oppdater preview
            customLogoInput.value = ''; // Reset file input
            applyLogo(null); // Oppdater hovedlogoen til standard live
            console.log("Custom logo removed in modal (pending save).");
            // Selve slettingen fra DB skjer først når bruker trykker "Lagre Utseende"
        }
    }
    // === 12: EVENT HANDLERS - MODAL & EDIT SETTINGS END ===


    // === 13: TOURNAMENT FINISH LOGIC START ===
    // Ingen endringer her
    async function finishTournament() { /* ... (som før, men teknisk sett async pga logActivity) ... */ }
    // === 13: TOURNAMENT FINISH LOGIC END ===


    // === 14: EVENT LISTENER ATTACHMENT (General) START ===
    // Ingen endringer her - bruker de samme funksjonsnavnene
    if(startPauseButton) startPauseButton.addEventListener('click', handleStartPause);
    /* ... alle andre listeners som før ... */
    if(btnEditUiSettings) btnEditUiSettings.addEventListener('click', openUiModal); // openUiModal er nå async
    if(closeUiModalButton) closeUiModalButton.addEventListener('click', () => closeUiModal(true)); // closeUiModal er nå async
    if(btnCancelUiEdit) btnCancelUiEdit.addEventListener('click', () => closeUiModal(true)); // closeUiModal er nå async
    if(btnSaveUiSettings) btnSaveUiSettings.addEventListener('click', handleSaveUiSettings); // handleSaveUiSettings er nå async
    if(btnResetLayoutTheme) btnResetLayoutTheme.addEventListener('click', handleResetLayoutTheme); // handleResetLayoutTheme er nå async
    /* ... resten som før ... */
    // === 14: EVENT LISTENER ATTACHMENT (General) END ===


    // === 15: INITIAL UI RENDER & TIMER START ===
    console.log("Performing initial UI render (async)...");
    // applyThemeLayoutAndLogo() ble kalt (og awaited) tidligere i scriptet nå
    updateUI(); // Render resten av UI basert på state (synkront)
    startRealTimeClock();
    if (state.live.status === 'running') { console.log("State is 'running', starting timer."); timerInterval = setInterval(tick, 1000); }
    else if (state.live.status === 'finished') console.log("State is 'finished'.");
    else console.log(`State is '${state.live.status}'. Timer not started.`);
    console.log("Tournament page fully initialized.");
    // === 15: INITIAL UI RENDER & TIMER START ===

});
// === 01: DOMContentLoaded LISTENER END ===
