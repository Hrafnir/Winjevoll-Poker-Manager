// === tournament-timer.js ===
// Håndterer spillklokken (nivå/pause) og sanntidsklokken.

import { saveTournamentState } from './storage.js';
// Importer funksjoner den trenger å kalle
import { formatBlindsHTML, formatTime } from './tournament-ui.js'; // Trenger formatBlindsHTML og formatTime
import { logActivity } from './tournament-logic.js';

let timerInterval = null;
let realTimeInterval = null;
let tickState = null; // Holder referanse til state-objektet
let tickTournamentId = null; // Holder referanse til ID
let tickCallbacks = {}; // Holder referanser til nødvendige callback-funksjoner (updateUI, playSound, finishTournament)

// Hoved-tick funksjon for nivå/pause
function tick() {
    // --- NY LOGG ---
    console.log(`tick() called. Status: ${tickState?.live?.status}, IsOnBreak: ${tickState?.live?.isOnBreak}, TimeLevel: ${tickState?.live?.timeRemainingInLevel}, TimeBreak: ${tickState?.live?.timeRemainingInBreak}`);

    if (!tickState || !tickState.live || tickState.live.status !== 'running') {
        console.warn("Tick called but state is not running or missing/invalid. Stopping timer.");
        stopMainTimer(); // Stopp intervallet hvis state er feil
        return;
    }

    try { // --- Legg til try...catch for å fange feil i tick-logikken ---
        if (tickState.live.isOnBreak) {
            tickState.live.timeRemainingInBreak--;
            // --- NY LOGG ---
            console.log(` -> In Break: Decremented timeRemainingInBreak to ${tickState.live.timeRemainingInBreak}. Calling updateUI...`);
            // Kall UI-oppdatering (via callback) for å vise nedtelling
            if (tickCallbacks.updateUI) {
                tickCallbacks.updateUI(tickState);
            } else { console.warn("tick: updateUI callback missing!"); }


            if (tickState.live.timeRemainingInBreak < 0) {
                console.log("Break finished.");
                tickState.live.isOnBreak = false;
                tickState.live.currentLevelIndex++;

                if (tickState.live.currentLevelIndex >= tickState.config.blindLevels.length) {
                    logActivity(tickState.live.activityLog, "Pause ferdig. Blindstruktur fullført.");
                    if (tickCallbacks.playSound) tickCallbacks.playSound('PAUSE_END');
                    if (tickCallbacks.finishTournament) {
                        console.log("tick: Calling finishTournament (end of blinds after break).");
                        tickCallbacks.finishTournament(); // Kalte før med state/id, men finishTournament henter globalt nå
                    } else { console.warn("tick: finishTournament callback missing!"); }
                    stopMainTimer(); // Stopp timeren etter å ha kalt finish
                    return; // Stopp videre kjøring
                }

                const newLvl = tickState.config.blindLevels[tickState.live.currentLevelIndex];
                if (!newLvl) {
                     console.error("Error: Could not find new level data after break at index", tickState.live.currentLevelIndex);
                     stopMainTimer();
                     return;
                }
                tickState.live.timeRemainingInLevel = newLvl.duration * 60;
                logActivity(tickState.live.activityLog, `Pause over. Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`);
                console.log(` -> Break Over. Starting Level ${newLvl.level}. Duration: ${newLvl.duration}m. Calling updateUI...`);


                if (tickCallbacks.playSound) {
                    tickCallbacks.playSound('PAUSE_END');
                    setTimeout(() => { if(tickCallbacks.playSound) tickCallbacks.playSound('NEW_LEVEL'); }, 500); // Forsinket nivålyd
                }
                if (tickCallbacks.updateUI) {
                    tickCallbacks.updateUI(tickState);
                } else { console.warn("tick: updateUI callback missing!"); }
                saveTournamentState(tickTournamentId, tickState);

            } else if (tickState.live.timeRemainingInBreak > 0 && tickState.live.timeRemainingInBreak % 15 === 0) {
                // Lagre innimellom i pauser også
                saveTournamentState(tickTournamentId, tickState);
            }
        } else { // Ikke i pause
            tickState.live.timeRemainingInLevel--;
             // --- NY LOGG ---
             console.log(` -> In Level: Decremented timeRemainingInLevel to ${tickState.live.timeRemainingInLevel}. Calling updateUI...`);
             if (tickCallbacks.updateUI) {
                tickCallbacks.updateUI(tickState); // Oppdater timer-visning etc.
             } else { console.warn("tick: updateUI callback missing!"); }


            if (tickState.live.timeRemainingInLevel < 0) {
                const currentLvl = tickState.config.blindLevels[tickState.live.currentLevelIndex];
                if (!currentLvl) {
                     console.error("Error: Could not find current level data at index", tickState.live.currentLevelIndex);
                     stopMainTimer();
                     return;
                }
                const pause = currentLvl?.pauseMinutes || 0;
                logActivity(tickState.live.activityLog, `Nivå ${currentLvl.level} ferdig.`);

                if (pause > 0) {
                    console.log(` -> Level ${currentLvl.level} Finished. Starting break of ${pause} minutes.`);
                    tickState.live.isOnBreak = true;
                    tickState.live.timeRemainingInBreak = pause * 60;
                    logActivity(tickState.live.activityLog, `Starter ${pause} min pause.`);
                    if (tickCallbacks.playSound) tickCallbacks.playSound('PAUSE_START');
                     // --- NY LOGG ---
                    console.log(` -> Starting Break. Calling updateUI...`);
                    if (tickCallbacks.updateUI) {
                        tickCallbacks.updateUI(tickState);
                    } else { console.warn("tick: updateUI callback missing!"); }
                    saveTournamentState(tickTournamentId, tickState);
                } else {
                    tickState.live.currentLevelIndex++;
                    if (tickState.live.currentLevelIndex >= tickState.config.blindLevels.length) {
                        logActivity(tickState.live.activityLog, `Blindstruktur fullført etter nivå ${currentLvl.level}.`);
                        if (tickCallbacks.playSound) tickCallbacks.playSound('NEW_LEVEL'); // Lyd for siste nivå ferdig
                        if (tickCallbacks.finishTournament) {
                             console.log("tick: Calling finishTournament (end of blinds after level).");
                             tickCallbacks.finishTournament(); // Kalte før med state/id, men finishTournament henter globalt nå
                        } else { console.warn("tick: finishTournament callback missing!"); }
                        stopMainTimer();
                        return; // Stopp
                    }
                    const newLvl = tickState.config.blindLevels[tickState.live.currentLevelIndex];
                     if (!newLvl) {
                         console.error("Error: Could not find new level data at index", tickState.live.currentLevelIndex);
                         stopMainTimer();
                         return;
                     }
                    tickState.live.timeRemainingInLevel = newLvl.duration * 60;
                    logActivity(tickState.live.activityLog, `Nivå ${newLvl.level} (${formatBlindsHTML(newLvl)}) starter.`);
                     // --- NY LOGG ---
                     console.log(` -> Level Finished. Starting Level ${newLvl.level}. Duration: ${newLvl.duration}m. Calling updateUI...`);
                    if (tickCallbacks.playSound) tickCallbacks.playSound('NEW_LEVEL');
                    if (tickCallbacks.updateUI) {
                        tickCallbacks.updateUI(tickState);
                    } else { console.warn("tick: updateUI callback missing!"); }
                    saveTournamentState(tickTournamentId, tickState);
                }
            } else if (tickState.live.timeRemainingInLevel > 0 && tickState.live.timeRemainingInLevel % 30 === 0) {
                // Lagre innimellom i nivåer
                saveTournamentState(tickTournamentId, tickState);
            }
        }
    } catch (error) { // --- Fang feil i tick ---
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("Error caught inside tick function:", error);
        console.error("State at time of error:", JSON.parse(JSON.stringify(tickState))); // Log state copy
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        stopMainTimer(); // Stopp timeren ved feil for å unngå flom av feilmeldinger
    }
}

// Eksporterte funksjoner
export function startMainTimer(state, tournamentId, callbacks) {
    if (timerInterval) { console.warn("startMainTimer called but timerInterval already exists. Clearing old one."); clearInterval(timerInterval); }
    console.log("Starting main timer interval...");
    tickState = state; tickTournamentId = tournamentId; tickCallbacks = callbacks;
    // Sjekk at nødvendige callbacks finnes
    if (typeof callbacks.updateUI !== 'function' || typeof callbacks.finishTournament !== 'function') {
         console.error("startMainTimer: Missing required callbacks (updateUI or finishTournament). Timer not started.");
         // Nullstill slik at vi ikke prøver å bruke ugyldig state/callbacks
         tickState = null; tickTournamentId = null; tickCallbacks = {};
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
        // Nullstill referanser for å unngå minnelekkasjer
        tickState = null;
        tickTournamentId = null;
        tickCallbacks = {};
         console.log(" -> Timer references cleared.");
    }
}

export function startRealTimeClock(displayElement) {
    if (realTimeInterval) clearInterval(realTimeInterval);
    if (!displayElement) { console.error("startRealTimeClock: displayElement is missing."); return; }
    console.log("Starting real time clock.");
    // Sett tiden med en gang
     const updateTime = () => {
         if (displayElement) { // Sjekk om elementet fortsatt finnes
             displayElement.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
         } else {
             console.warn("Real time clock: displayElement no longer available. Stopping clock.");
             stopRealTimeClock();
         }
     };
     updateTime(); // Kall en gang umiddelbart
    realTimeInterval = setInterval(updateTime, 1000);
}

export function stopRealTimeClock() {
    if (realTimeInterval) {
        console.log("Stopping real time clock.");
        clearInterval(realTimeInterval);
        realTimeInterval = null;
    }
}
