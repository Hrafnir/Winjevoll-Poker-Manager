// === tournament-ui.js ===
// Funksjoner for å oppdatere brukergrensesnittet og formatere data.

// ENDRET: Fjernet loadElementLayouts fra import
import { loadThemeBgColor, loadThemeTextColor, parseRgbString } from './storage.js';
import { calculateAverageStack, calculatePrizes, findNextPauseInfo, getPlayerNameById } from './tournament-logic.js';

// === Hjelpefunksjoner for formatering ===
export function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) return "--:--";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
export function formatBlindsHTML(level) {
    if (!level) return '--/--';
    const sb = level.sb ?? '--'; const bb = level.bb ?? '--'; const ante = level.ante ?? 0;
    return `<span class="value">${sb}</span>/<span class="value">${bb}</span>${ante > 0 ? `<span class="label">A:</span><span class="value">${ante}</span>` : ''}`;
}
export function formatNextBlindsText(level) {
    if (!level) return "-- / --";
    return `${level.sb ?? '--'}/${level.bb ?? '--'}${level.ante > 0 ? ` (A: ${level.ante})` : ''}`;
}
// === Slutt Hjelpefunksjoner for formatering ===


// === Funksjoner for Tema og Layout ===
let currentLogoObjectUrl = null;
export function revokeObjectUrl(url) { if (url && url.startsWith('blob:')) { URL.revokeObjectURL(url); } }
export function updateMainLogoImage(logoBlob, targetImgElement = document.getElementById('logo-element')?.querySelector('.logo')) {
    if (!targetImgElement) { console.warn("updateMainLogoImage: Target image element not found."); return; }
    revokeObjectUrl(currentLogoObjectUrl); // Frigi gammel URL
    if (logoBlob instanceof Blob && logoBlob.size > 0) { currentLogoObjectUrl = URL.createObjectURL(logoBlob); targetImgElement.src = currentLogoObjectUrl; targetImgElement.style.display = ''; }
    else { currentLogoObjectUrl = null; targetImgElement.src = 'placeholder-logo.png'; targetImgElement.style.display = logoBlob === null ? '' : 'none'; } // Vis placeholder hvis null, skjul helt hvis undefined/tom
}

// ENDRET: Mottar nå elementLayouts som argument, henter ikke selv
export function applyThemeAndLayout(bgColor, textColor, elementLayouts, draggableElements) {
    console.log("Applying theme and layout:", bgColor, textColor, elementLayouts);
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--live-page-bg', bgColor); rootStyle.setProperty('--live-page-text', textColor);
    try { const [r, g, b] = parseRgbString(bgColor); const brightness = (r * 299 + g * 587 + b * 114) / 1000; const borderColor = brightness < 128 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'; rootStyle.setProperty('--live-ui-border', borderColor); } catch (e) { rootStyle.setProperty('--live-ui-border', 'rgba(128, 128, 128, 0.15)'); }

    // Bruk defaults direkte her, siden vi mottar ferdig merged layout
    const defaults = { canvas: { height: 65 }, title:  { x: 5,  y: 2,  width: 90, fontSize: 3.5, isVisible: true }, timer:  { x: 5,  y: 20, width: 55, fontSize: 16,  isVisible: true }, blinds: { x: 65, y: 40, width: 30, fontSize: 8,   isVisible: true }, logo:   { x: 65, y: 5,  width: 30, height: 30,  isVisible: true }, info:   { x: 65, y: 75, width: 30, fontSize: 1.2, isVisible: true, showNextBlinds: true, showAvgStack: true, showPlayers: true, showLateReg: true, showNextPause: true } };

    // Sjekk om elementLayouts faktisk ble sendt inn
    if (!elementLayouts || typeof elementLayouts !== 'object') { // Forsterket sjekk
        console.error("applyThemeAndLayout: elementLayouts argument is missing or not a valid object!", elementLayouts);
        elementLayouts = defaults; // Bruk defaults som fallback
    }

    rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas?.height ?? defaults.canvas.height}vh`);

    // Bruk draggableElements som ble sendt inn fra main
    if (!draggableElements || !Array.isArray(draggableElements)) {
         console.error("applyThemeAndLayout: draggableElements argument is missing or not an array!");
         draggableElements = []; // Tom fallback
    }

    draggableElements.forEach(element => {
        if (!element) return;
        const elementId = element.id.replace('-element', '');
        // Hent layout for dette elementet fra det mottatte objektet
        const layout = elementLayouts[elementId] || defaults[elementId]; // Fallback til default hvis element mangler i mottatt data
        if (!layout) {
             console.warn(`No layout found for element ${elementId}, using defaults.`);
             layout = defaults[elementId] || {}; // Sørg for at layout er et objekt
        }

        const isVisible = layout.isVisible ?? true; // Default til synlig
        element.classList.toggle('element-hidden', !isVisible);

        if (isVisible) {
             // Bruk ?? for å sikre at 0 er en gyldig verdi
             element.style.left = `${layout.x ?? defaults[elementId]?.x ?? 0}%`;
             element.style.top = `${layout.y ?? defaults[elementId]?.y ?? 0}%`;
             element.style.width = `${layout.width ?? defaults[elementId]?.width ?? 50}%`;
             if (elementId === 'logo') {
                 element.style.height = `${layout.height ?? defaults.logo.height ?? 30}%`;
                 element.style.fontSize = '1em'; // Størrelse styres av container, ikke font
             }
             else {
                 element.style.fontSize = `${layout.fontSize ?? defaults[elementId]?.fontSize ?? 1}em`;
                 element.style.height = 'auto';
             }
        }
    });

    // Info toggles
    const infoLayout = elementLayouts.info || defaults.info; // Bruk mottatt eller default
    const infoParagraphs = { showNextBlinds: document.getElementById('info-next-blinds'), showNextPause: document.getElementById('info-next-pause'), showAvgStack: document.getElementById('info-avg-stack'), showPlayers: document.getElementById('info-players'), showLateReg: document.getElementById('info-late-reg') };
    for (const key in infoParagraphs) { if (infoParagraphs[key]) { infoParagraphs[key].classList.toggle('hidden', !(infoLayout[key] ?? true)); } }
    console.log("Theme and layout styles applied from tournament-ui.js.");
}
// === Slutt Funksjoner for Tema og Layout ===


// === UI Oppdateringsfunksjoner ===

// Funksjon for å lage spiller-HTML (brukes i renderPlayerList)
function createPlayerHTML(player, config, state, isEliminated) {
    const li = document.createElement('li');
    li.dataset.playerId = player.id; // Sett ID for handlinger
    let details = '';
    if (!isEliminated) {
         details = ` (B${player.table}S${player.seat || '?'})`;
         if (player.rebuys > 0) details += ` [R:${player.rebuys}]`;
         if (player.addon) details += ` [A]`;
         if (config.type === 'knockout') details += ` (KO:${player.knockouts || 0})`;
    } else {
         details = ` (${player.place || '?'}. pl.)`;
         if (player.eliminatedBy) {
             // Pass state til getPlayerNameById
             details += ` av ${getPlayerNameById(player.eliminatedBy, state)}`;
         }
    }

    li.innerHTML = `
        <span class="player-name">${player.name || 'Ukjent'}</span>
        <span class="player-details">${details}</span>
        <div class="player-actions">
            ${isEliminated ? `
                <button class="btn-restore small-button" data-player-id="${player.id}" title="Gjenopprett ${player.name}">↩️</button>
                <button class="btn-edit-player small-button" data-player-id="${player.id}" title="Rediger ${player.name}">✏️</button>
            ` : `
                ${config.type === 'rebuy' ? `<button class="btn-rebuy small-button" data-player-id="${player.id}" title="Rebuy for ${player.name}" ${state.live.currentLevelIndex + 1 > config.rebuyLevels ? 'disabled' : ''}>R</button>` : ''}
                <button class="btn-eliminate small-button" data-player-id="${player.id}" title="Eliminer ${player.name}">❌</button>
                <button class="btn-edit-player small-button" data-player-id="${player.id}" title="Rediger ${player.name}">✏️</button>
            `}
        </div>
    `;
    return li;
}


export function renderPlayerList(state, /* fjernet ubrukte callbacks her */) {
     if (!state || !state.live || !state.config) {
         console.warn("renderPlayerList: Invalid state provided.");
         return;
     }
    const activeList = document.getElementById('player-list');
    const eliminatedList = document.getElementById('eliminated-player-list');
    const activeCount = document.getElementById('active-player-count');
    const elimCount = document.getElementById('eliminated-player-count');

    if (!activeList || !eliminatedList || !activeCount || !elimCount) {
        console.error("Player list elements not found!");
        return;
    }

    activeList.innerHTML = ''; // Tøm listene
    eliminatedList.innerHTML = '';

    // Sorter aktive spillere etter bord og sete
    state.live.players.sort((a, b) => {
        if (a.table !== b.table) return (a.table || 0) - (b.table || 0);
        return (a.seat || 0) - (b.seat || 0);
    });

    // Sorter eliminerte spillere etter plassering (høyeste tall først -> Laveste plassering først)
    // state.live.eliminatedPlayers.sort((a, b) => (b.place ?? 0) - (a.place ?? 0)); // Sorterer synkende etter plassering
    // ENDRET: Sorter stigende etter plassering (1. plass øverst)
    state.live.eliminatedPlayers.sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity));


    if (state.live.players.length === 0) { activeList.innerHTML = '<li>Ingen aktive spillere.</li>'; }
    else { state.live.players.forEach(p => activeList.appendChild(createPlayerHTML(p, state.config, state, false))); }

    if (state.live.eliminatedPlayers.length === 0) { eliminatedList.innerHTML = '<li>Ingen eliminerte spillere.</li>'; }
    else { state.live.eliminatedPlayers.forEach(p => eliminatedList.appendChild(createPlayerHTML(p, state.config, state, true))); }

    // Oppdater tellere
    activeCount.textContent = state.live.players.length;
    elimCount.textContent = state.live.eliminatedPlayers.length;
}

export function displayPrizes(state) {
     if (!state || !state.config || !state.live) {
          console.warn("displayPrizes: Invalid state provided.");
          return;
     }
    const prizeDisplay = document.getElementById('prize-display-live');
    // --- ENDRET: Hent totalPotSpan *inni* funksjonen etter potensielle innerHTML endringer ---
    // const totalPotSpan = document.getElementById('total-pot'); // Fjernet herfra

    // --- ENDRET: Mer spesifikk sjekk ---
    if (!prizeDisplay) {
        console.error("Prize display ERROR: Container element '#prize-display-live' not found!");
        return; // Avslutt hvis container mangler
    }

    // Hent totalPotSpan *før* vi evt. overskriver den med innerHTML
    let totalPotSpan = prizeDisplay.querySelector('#total-pot');
    let initialTotalPotValue = totalPotSpan ? totalPotSpan.textContent : (state.live.totalPot || 0); // Hent gammel verdi eller state

    if (!totalPotSpan) {
        // Logg feil hvis den ikke fantes i utgangspunktet
        console.warn("Prize display WARNING: Span element '#total-pot' not found inside '#prize-display-live' initially!");
    }

    const prizes = calculatePrizes(state);
    const totalPrizePot = prizes.reduce((sum, p) => sum + p.amount, 0); // Kalkuler faktisk premiepott
    // totalPotSpan.textContent = state.live.totalPot || 0; // Oppdateres nedenfor etter innerHTML

     // --- ENDRET: Bygger HTML mer forsiktig for å beholde #total-pot ---
     // Lag H3-elementet
     const h3 = document.createElement('h3');
     h3.innerHTML = `Premiefordeling (Premiepott: ${totalPrizePot} kr)<br>(Total pott: <span id="total-pot">${initialTotalPotValue}</span> kr)`; // Bruk hentet/state verdi

     // Tøm kun innholdet under H3 hvis H3 finnes, ellers hele div
     if (prizeDisplay.firstChild && prizeDisplay.firstChild.nodeName === 'H3') {
        while (prizeDisplay.firstChild.nextSibling) {
             prizeDisplay.removeChild(prizeDisplay.firstChild.nextSibling);
        }
        prizeDisplay.replaceChild(h3, prizeDisplay.firstChild); // Erstatt gammel H3 med ny
     } else {
        prizeDisplay.innerHTML = ''; // Tøm alt hvis H3 ikke var først
        prizeDisplay.appendChild(h3); // Legg til ny H3
     }
     // Nå skal #total-pot eksistere innenfor H3

    if (prizes.length > 0) {
        const ol = document.createElement('ol');
        prizes.forEach(p => {
             const li = document.createElement('li');
             li.textContent = `${p.place}. plass: ${p.amount} kr (${p.percentage}%)`;
             ol.appendChild(li);
        });
        prizeDisplay.appendChild(ol); // Legg til listen etter H3
        prizeDisplay.classList.remove('hidden');
    } else {
        const p = document.createElement('p');
        p.textContent = 'Ingen premiefordeling definert eller pott er 0.';
        prizeDisplay.appendChild(p); // Legg til meldingen etter H3
        prizeDisplay.classList.remove('hidden'); // Vis uansett med melding
    }

     // Vis knockout-info hvis relevant
     if (state.config.type === 'knockout' && state.config.bountyAmount > 0) {
         const pKO = document.createElement('p'); // Nytt navn for å unngå konflikt
         pKO.innerHTML = `<small>(${state.config.bountyAmount} kr per knockout ikke inkludert i premiepotten ovenfor)</small>`;
         prizeDisplay.appendChild(pKO); // Legg til sist
     }

     // Oppdater #total-pot som nå skal finnes inne i H3
     totalPotSpan = prizeDisplay.querySelector('#total-pot'); // Finn den på nytt
     if (totalPotSpan) {
         totalPotSpan.textContent = state.live.totalPot || 0;
     } else {
          console.error("Prize display ERROR: Could not find #total-pot span after rebuilding HTML!");
     }
     // --- Slutt på endret HTML-bygging ---
}


export function renderActivityLog(state) {
     if (!state || !state.live) {
          console.warn("renderActivityLog: Invalid state provided.");
          return;
     }
    const logUl = document.getElementById('activity-log-list');
    if (!logUl) { console.error("Activity log UL element not found!"); return; }
    logUl.innerHTML = ''; // Tøm listen
    if (!state.live.activityLog || state.live.activityLog.length === 0) {
        logUl.innerHTML = '<li>Loggen er tom.</li>';
        return;
    }
    state.live.activityLog.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="log-time">${entry.timestamp || '--:--:--'}</span> ${entry.message}`;
        logUl.appendChild(li);
    });
}

export function updateSoundToggleVisuals(soundsEnabled) {
    const btn = document.getElementById('btn-toggle-sound');
    if (btn) {
        btn.textContent = soundsEnabled ? '🔊 Lyd På' : '🔇 Lyd Av';
        btn.title = soundsEnabled ? 'Slå av lyd' : 'Slå på lyd';
    }
}

// Hovedfunksjon for å oppdatere hele UI basert på state
export function updateUI(state) {
    // --- NY LOGG ---
    console.log("updateUI() called. Status:", state?.live?.status);

     if (!state || !state.config || !state.live) {
         console.error("updateUI called with invalid state:", state);
         alert("Kritisk feil: Kan ikke oppdatere UI på grunn av manglende data.");
         return;
     }
     try { // --- Legg til try...catch rundt hele UI-oppdateringen ---
         // Tournament Name
         const nameDisplay = document.getElementById('tournament-name-display');
         if (nameDisplay) nameDisplay.textContent = state.config.name || 'Ukjent Turnering';

         // Timer and Break Info
         const timerDisplay = document.getElementById('timer-display');
         const breakInfo = document.getElementById('break-info');
         if (timerDisplay && breakInfo) {
             if (state.live.isOnBreak) {
                 timerDisplay.textContent = formatTime(state.live.timeRemainingInBreak);
                 breakInfo.classList.remove('hidden');
             } else {
                 timerDisplay.textContent = formatTime(state.live.timeRemainingInLevel);
                 breakInfo.classList.add('hidden');
             }
         } else { console.warn("Timer display elements not found."); }

         // Current Level and Blinds
         const currentLevelDisplay = document.getElementById('current-level');
         const blindsDisplayEl = document.getElementById('blinds-display'); // Endret navn for å unngå konflikt
         const currentLevelIndex = state.live.currentLevelIndex;
         const currentLevelData = state.config.blindLevels?.[currentLevelIndex];
         if (currentLevelDisplay && blindsDisplayEl && currentLevelData) {
             currentLevelDisplay.textContent = `Nivå ${currentLevelData.level}`;
             blindsDisplayEl.innerHTML = formatBlindsHTML(currentLevelData);
         } else {
             if (currentLevelDisplay) currentLevelDisplay.textContent = 'Nivå ?';
             if (blindsDisplayEl) blindsDisplayEl.innerHTML = formatBlindsHTML(null);
             if (!currentLevelData) console.warn(`No blind data found for index ${currentLevelIndex}`);
         }

         // Info Box Updates
         const nextBlindsDisplay = document.getElementById('next-blinds');
         const nextLevelData = state.config.blindLevels?.[currentLevelIndex + 1];
         if (nextBlindsDisplay) {
             nextBlindsDisplay.textContent = nextLevelData ? formatNextBlindsText(nextLevelData) : 'Ingen flere';
             nextBlindsDisplay.parentElement.classList.toggle('hidden', !nextLevelData); // Skjul hvis ingen neste nivå
         }

         const infoNextPauseParagraph = document.getElementById('info-next-pause');
         const nextPauseInfo = findNextPauseInfo(state);
         if (infoNextPauseParagraph) {
             const nextPauseTimeSpan = document.getElementById('next-pause-time');
             if (nextPauseInfo && nextPauseTimeSpan) {
                 nextPauseTimeSpan.textContent = `etter Nivå ${nextPauseInfo.level} (${nextPauseInfo.duration} min)`;
                 infoNextPauseParagraph.classList.remove('hidden');
             } else {
                 infoNextPauseParagraph.classList.add('hidden');
             }
         }

         const averageStackDisplay = document.getElementById('average-stack');
         if (averageStackDisplay) {
             averageStackDisplay.textContent = calculateAverageStack(state);
         }

         const playersRemainingDisplay = document.getElementById('players-remaining');
         const totalEntriesDisplay = document.getElementById('total-entries');
         if (playersRemainingDisplay && totalEntriesDisplay) {
             playersRemainingDisplay.textContent = state.live.players.length;
             totalEntriesDisplay.textContent = state.live.totalEntries || 0;
         }

         const lateRegStatusDisplay = document.getElementById('late-reg-status');
         const lateRegButton = document.getElementById('btn-late-reg');
         if (lateRegStatusDisplay && lateRegButton) {
             const currentLevelNum = currentLevelData?.level ?? 0;
             const lateRegAllowed = state.config.lateRegLevel > 0 && currentLevelNum <= state.config.lateRegLevel;
             const lateRegStatusText = state.config.lateRegLevel > 0
                 ? (lateRegAllowed ? `Åpen t.o.m. Nivå ${state.config.lateRegLevel}` : `Stengt (etter Nivå ${state.config.lateRegLevel})`)
                 : 'Ikke tilgjengelig';
             lateRegStatusDisplay.textContent = lateRegStatusText;
             lateRegButton.disabled = !lateRegAllowed || state.live.status === 'finished';
         }

         // Player Lists
         renderPlayerList(state); // Kall den separate funksjonen

         // Prize Display
         displayPrizes(state); // Kall den separate funksjonen

         // Activity Log
         renderActivityLog(state); // Kall den separate funksjonen

         // Button States
         const startPauseButton = document.getElementById('btn-start-pause');
         const endTournamentButton = document.getElementById('btn-end-tournament');
         const levelButtons = document.querySelectorAll('#btn-prev-level, #btn-next-level, #btn-adjust-time-minus, #btn-adjust-time-plus');

         if (startPauseButton) {
             if (state.live.status === 'running') {
                 startPauseButton.textContent = 'Pause Klokke';
                 startPauseButton.classList.remove('success-button');
                 startPauseButton.classList.add('warning-button');
                 startPauseButton.disabled = false;
             } else if (state.live.status === 'paused') {
                 startPauseButton.textContent = 'Start Klokke';
                 startPauseButton.classList.remove('warning-button');
                 startPauseButton.classList.add('success-button');
                 startPauseButton.disabled = false;
             } else { // finished
                 startPauseButton.textContent = 'Turnering Fullført';
                 startPauseButton.disabled = true;
             }
         }
         if (endTournamentButton) {
             endTournamentButton.disabled = state.live.status === 'finished';
         }
         levelButtons.forEach(btn => {
             btn.disabled = state.live.status === 'finished';
         });

         // Addon Button Visibility
         const btnManageAddons = document.getElementById('btn-manage-addons');
         if (btnManageAddons) {
             const showAddonButton = state.config.type === 'rebuy' && state.config.addonCost > 0 && state.config.addonChips > 0 && state.live.status !== 'finished';
             btnManageAddons.classList.toggle('hidden', !showAddonButton);
             // Ytterligere logikk for å disable knappen hvis addon-perioden er over (f.eks. etter rebuy-perioden) kan legges til her.
         }

         // Tab Title
         document.title = `${state.config.name} - Live`;

     } catch (error) { // --- Fang feil i UI-oppdateringen ---
         console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
         console.error("Error caught inside updateUI function:", error);
         console.error("State at time of error:", JSON.parse(JSON.stringify(state))); // Log state copy
         console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
         // Ikke stopp timeren her, men logg feilen tydelig.
         // Vurder å vise en feilmelding til brukeren i UI?
         const errorDiv = document.getElementById('ui-error-message'); // Trenger et div i HTML
         if(errorDiv) {
             errorDiv.textContent = `UI Oppdateringsfeil: ${error.message}. Sjekk konsollen.`;
             errorDiv.classList.remove('hidden');
         }
     }
}
// === Slutt UI Oppdateringsfunksjoner ===
