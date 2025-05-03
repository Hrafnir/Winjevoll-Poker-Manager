// === tournament-timer.js ===
// Håndterer spillklokken (nivå/pause) og sanntidsklokken.

// --- IMPORTS ---
import { saveTournamentState } from './storage.js';
import { formatBlindsHTML, formatTime } from './tournament-ui.js'; // Trenger formatBlindsHTML og formatTime
import { logActivity } from './tournament-logic.js';
// -----------------------------------------------------------------------


// === 01: INTERNAL STATE VARIABLES START ===
// -----------------------------------------------------------------------
let timerInterval = null;       // Holder ID for setInterval for spillklokken
let realTimeInterval = null;    // Holder ID for setInterval for sanntidsklokken
let tickState = null;           // Holder referanse til hoved-state-objektet
let tickTournamentId = null;    // Holder referanse til aktiv turnerings-ID
let tickCallbacks = {};         // Holder referanser til nødvendige callback-funksjoner
// -----------------------------------------------------------------------
// === 01: INTERNAL STATE VARIABLES END ===


// === 02: MAIN TIMER LOGIC (TICK FUNCTION) START ===
// -----------------------------------------------------------------------
// Kjøres hvert sekund når timeren er aktiv. Håndterer nedtelling for nivå/pause.
function tick() {
    // Logg start av tick for debugging
    // console.log(`tick() called. Status: ${tickState?.live?.status}, IsOnBreak: ${tickState?.live?.isOnBreak}, TimeLevel: ${tickState?.live?.timeRemainingInLevel}, TimeBreak: ${tickState?.live?.timeRemainingInBreak}`);

    // Sjekk om state er gyldig og timeren skal kjøre
    if (!tickState || !tickState.live || tickState.live.status !== 'running') {
        console.warn("Tick called but state is not running or missing/invalid. Stopping timer.");
        stopMainTimer(); // Stopp intervallet hvis state er feil
        return;
    }

    try { // Try...catch for å fange feil i selve tick-logikken

        // --- Håndter Pause ---
        if (tickState.live.isOnBreak) {
            tickState.live.timeRemainingInBreak--;
            // console.log(` -> In Break: Decremented timeRemainingInBreak to ${tickState.live.timeRemainingInBreak}. Calling updateUI...`);

            // Kall UI-oppdatering (via callback)
            if (tickCallbacks.updateUI) { tickCallbacks.updateUI(tickState); }
            else { console.warn("tick: updateUI callback missing!"); }

            // Sjekk om pausen er ferdig
            if (tickState.live.timeRemainingInBreak < 0) {
                console.log("Break finished.");
                tickState.live.isOnBreak = false;
                tickState.live.currentLevelIndex++; // Gå til neste nivå

                // Sjekk om blindstrukturen er ferdig
                if (tickState.live.currentLevelIndex >= tickState.config.blindLevels.length) {
                    logActivity(tickState.live.activityLog, "Pause ferdig. Blindstruktur fullført.");
                    if (tickCallbacks.playSound) tickCallbacks.playSound('PAUSE_END');
                    if (tickCallbacks.finishTournament) {
                        console.log("tick: Calling finishTournament (end of blinds after break).");
                        tickCallbacks.finishTournament();
                    } else { console.warn("tick: finishTournament callback missing!"); }
                    stopMainTimer(); return;
                }

                // Start neste nivå
                const newLvl = tickState.config.blindLevels[tickState.live.currentLevelIndex];
                if (!newLvl) { console.error("Error: Could not find new level data after break at index", tickState.live.currentLevelIndex); stopMainTimer(); return; }
                tickState.live.timeRemainingInLevel = newLvl.duration * 60;
                logActivity(tickState.live.activityLog, `Pause over. Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`);
                console.log(` -> Break Over. Starting Level ${newLvl.level}. Duration: ${newLvl.duration}m. Calling updateUI...`);

                if (tickCallbacks.playSound) { tickCallbacks.playSound('PAUSE_END'); setTimeout(() => { if(tickCallbacks.playSound) tickCallbacks.playSound('NEW_LEVEL'); }, 500); }
                if (tickCallbacks.updateUI) { tickCallbacks.updateUI(tickState); } else { console.warn("tick: updateUI callback missing!"); }
                saveTournamentState(tickTournamentId, tickState);

            } else if (tickState.live.timeRemainingInBreak > 0 && tickState.live.timeRemainingInBreak % 15 === 0) {
                // Lagre innimellom i pauser
                saveTournamentState(tickTournamentId, tickState);
            }
        }
        // --- Håndter Nivå (Ikke Pause) ---
        else {
            tickState.live.timeRemainingInLevel--;
             // console.log(` -> In Level: Decremented timeRemainingInLevel to ${tickState.live.timeRemainingInLevel}. Calling updateUI...`);
             if (tickCallbacks.updateUI) { tickCallbacks.updateUI(tickState); }
             else { console.warn("tick: updateUI callback missing!"); }

            // Sjekk om nivået er ferdig
            if (tickState.live.timeRemainingInLevel < 0) {
                const currentLvl = tickState.config.blindLevels[tickState.live.currentLevelIndex];
                if (!currentLvl) { console.error("Error: Could not find current level data at index", tickState.live.currentLevelIndex); stopMainTimer(); return; }
                const pause = currentLvl?.pauseMinutes || 0;
                logActivity(tickState.live.activityLog, `Nivå ${currentLvl.level} ferdig.`);

                // Start pause hvis definert
                if (pause > 0) {
                    console.log(` -> Level ${currentLvl.level} Finished. Starting break of ${pause} minutes.`);
                    tickState.live.isOnBreak = true;
                    tickState.live.timeRemainingInBreak = pause * 60;
                    logActivity(tickState.live.activityLog, `Starter ${pause} min pause.`);
                    if (tickCallbacks.playSound) tickCallbacks.playSound('PAUSE_START');
                    // console.log(` -> Starting Break. Calling updateUI...`);
                    if (tickCallbacks.updateUI) { tickCallbacks.updateUI(tickState); } else { console.warn("tick: updateUI callback missing!"); }
                    saveTournamentState(tickTournamentId, tickState);
                }
                // Ellers, gå til neste nivå
                else {
                    tickState.live.currentLevelIndex++;
                    // Sjekk om blindstruktur er ferdig
                    if (tickState.live.currentLevelIndex >= tickState.config.blindLevels.length) {
                        logActivity(tickState.live.activityLog, `Blindstruktur fullført etter nivå ${currentLvl.level}.`);
                        if (tickCallbacks.playSound) tickCallbacks.playSound('NEW_LEVEL');
                        if (tickCallbacks.finishTournament) { console.log("tick: Calling finishTournament (end of blinds after level)."); tickCallbacks.finishTournament(); }
                        else { console.warn("tick: finishTournament callback missing!"); }
                        stopMainTimer(); return;
                    }
                    // Start neste nivå
                    const newLvl = tickState.config.blindLevels[tickState.live.currentLevelIndex];
                     if (!newLvl) { console.error("Error: Could not find new level data at index", tickState.live.currentLevelIndex); stopMainTimer(); return; }
                    tickState.live.timeRemainingInLevel = newLvl.duration * 60;
                    logActivity(tickState.live.activityLog, `Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`);
                     // console.log(` -> Level Finished. Starting Level ${newLvl.level}. Duration: ${newLvl.duration}m. Calling updateUI...`);
                    if (tickCallbacks.playSound) tickCallbacks.playSound('NEW_LEVEL');
                    if (tickCallbacks.updateUI) { tickCallbacks.updateUI(tickState); } else { console.warn("tick: updateUI callback missing!"); }
                    saveTournamentState(tickTournamentId, tickState);
                }
            } else if (tickState.live.timeRemainingInLevel > 0 && tickState.live.timeRemainingInLevel % 30 === 0) {
                // Lagre innimellom i nivåer
                saveTournamentState(tickTournamentId, tickState);
            }
        }
    } catch (error) { // Fang feil i tick
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("Error caught inside tick function:", error);
        console.error("State at time of error:", JSON.parse(JSON.stringify(tickState || {}))); // Log state copy
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        stopMainTimer(); // Stopp timeren ved feil
    }
}
// -----------------------------------------------------------------------
// === 02: MAIN TIMER LOGIC (TICK FUNCTION) END ===


// === 03: TIMER CONTROL FUNCTIONS START ===
// -----------------------------------------------------------------------
// Eksporterte funksjoner for å starte/stoppe spillklokken.
export function startMainTimer(state, tournamentId, callbacks) {
    if (timerInterval) { console.warn("startMainTimer called but timerInterval already exists. Clearing old one."); clearInterval(timerInterval); }
    console.log("Starting main timer interval...");
    tickState = state; tickTournamentId = tournamentId; tickCallbacks = callbacks;

    if (typeof callbacks.updateUI !== 'function' || typeof callbacks.finishTournament !== 'function') {
         console.error("startMainTimer: Missing required callbacks (updateUI or finishTournament). Timer not started.");
         tickState = null; tickTournamentId = null; tickCallbacks = {}; // Nullstill
         return;
    }
     console.log(" -> Timer callbacks verified (updateUI, finishTournament exist).");
    timerInterval = setInterval(tick, 1000);
}

export function stopMainTimer() {
    if (timerInterval) {
        console.log("Stopping main timer interval...");
        clearInterval(timerInterval);
        timerInterval = null;
        tickState = null; tickTournamentId = null; tickCallbacks = {}; // Nullstill referanser
         console.log(" -> Timer references cleared.");
    }
}
// -----------------------------------------------------------------------
// === 03: TIMER CONTROL FUNCTIONS END ===


// === 04: REAL TIME CLOCK FUNCTIONS START ===
// -----------------------------------------------------------------------
// Funksjoner for sanntidsklokken øverst på siden.
export function startRealTimeClock(displayElement) {
    if (realTimeInterval) clearInterval(realTimeInterval);
    if (!displayElement) { console.error("startRealTimeClock: displayElement is missing."); return; }
    console.log("Starting real time clock.");

    const updateTime = () => {
         if (displayElement) {
             displayElement.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
         } else {
             console.warn("Real time clock: displayElement no longer available. Stopping clock.");
             stopRealTimeClock(); // Stopp hvis elementet forsvinner
         }
     };
     updateTime(); // Kall umiddelbart
    realTimeInterval = setInterval(updateTime, 1000);
}

export function stopRealTimeClock() {
    if (realTimeInterval) {
        console.log("Stopping real time clock.");
        clearInterval(realTimeInterval);
        realTimeInterval = null;
    }
}
// -----------------------------------------------------------------------
// === 04: REAL TIME CLOCK FUNCTIONS END ===
