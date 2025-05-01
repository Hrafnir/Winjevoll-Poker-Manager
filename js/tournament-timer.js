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
    if (!tickState || !tickState.live || tickState.live.status !== 'running') {
        console.warn("Tick called but state is not running or missing/invalid.");
        stopMainTimer(); // Stopp intervallet hvis state er feil
        return;
    }

    if (tickState.live.isOnBreak) {
        tickState.live.timeRemainingInBreak--;
        // Kall UI-oppdatering (via callback) for å vise nedtelling
        if (tickCallbacks.updateUI) tickCallbacks.updateUI(tickState);

        if (tickState.live.timeRemainingInBreak < 0) {
            console.log("Break finished.");
            tickState.live.isOnBreak = false;
            tickState.live.currentLevelIndex++;

            if (tickState.live.currentLevelIndex >= tickState.config.blindLevels.length) {
                logActivity(tickState.live.activityLog, "Pause ferdig. Blindstruktur fullført.");
                if (tickCallbacks.playSound) tickCallbacks.playSound('PAUSE_END');
                if (tickCallbacks.finishTournament) tickCallbacks.finishTournament(tickState, tickTournamentId); // Send state/id
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

            if (tickCallbacks.playSound) {
                tickCallbacks.playSound('PAUSE_END');
                setTimeout(() => tickCallbacks.playSound('NEW_LEVEL'), 500); // Forsinket nivålyd
            }
            if (tickCallbacks.updateUI) tickCallbacks.updateUI(tickState);
            saveTournamentState(tickTournamentId, tickState);

        } else if (tickState.live.timeRemainingInBreak > 0 && tickState.live.timeRemainingInBreak % 15 === 0) {
            // Lagre innimellom i pauser også
            saveTournamentState(tickTournamentId, tickState);
        }
    } else { // Ikke i pause
        tickState.live.timeRemainingInLevel--;
        if (tickCallbacks.updateUI) tickCallbacks.updateUI(tickState); // Oppdater timer-visning etc.

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
                console.log(`Starting break of ${pause} minutes.`);
                tickState.live.isOnBreak = true;
                tickState.live.timeRemainingInBreak = pause * 60;
                logActivity(tickState.live.activityLog, `Starter ${pause} min pause.`);
                if (tickCallbacks.playSound) tickCallbacks.playSound('PAUSE_START');
                if (tickCallbacks.updateUI) tickCallbacks.updateUI(tickState);
                saveTournamentState(tickTournamentId, tickState);
            } else {
                tickState.live.currentLevelIndex++;
                if (tickState.live.currentLevelIndex >= tickState.config.blindLevels.length) {
                    logActivity(tickState.live.activityLog, `Blindstruktur fullført etter nivå ${currentLvl.level}.`);
                    if (tickCallbacks.playSound) tickCallbacks.playSound('NEW_LEVEL'); // Lyd for siste nivå ferdig
                    if (tickCallbacks.finishTournament) tickCallbacks.finishTournament(tickState, tickTournamentId);
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
                if (tickCallbacks.playSound) tickCallbacks.playSound('NEW_LEVEL');
                if (tickCallbacks.updateUI) tickCallbacks.updateUI(tickState);
                saveTournamentState(tickTournamentId, tickState);
            }
        } else if (tickState.live.timeRemainingInLevel > 0 && tickState.live.timeRemainingInLevel % 30 === 0) {
            // Lagre innimellom i nivåer
            saveTournamentState(tickTournamentId, tickState);
        }
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
         return;
    }
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
    }
}

export function startRealTimeClock(displayElement) {
    if (realTimeInterval) clearInterval(realTimeInterval);
    if (!displayElement) { console.error("startRealTimeClock: displayElement is missing."); return; }
    console.log("Starting real time clock.");
    // Sett tiden med en gang
     displayElement.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    realTimeInterval = setInterval(() => {
        displayElement.textContent = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }, 1000);
}

export function stopRealTimeClock() {
    if (realTimeInterval) {
        console.log("Stopping real time clock.");
        clearInterval(realTimeInterval);
        realTimeInterval = null;
    }
}
