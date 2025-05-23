// === tournament-player-actions.js ===
// Håndterer spillerhandlinger som rebuy, eliminate, restore, late reg.

import { saveTournamentState } from './storage.js';
import { updateUI } from './tournament-ui.js';
// ENDRET: Importer getPlayerNameById og logActivity fra logic
import { logActivity, getPlayerNameById } from './tournament-logic.js';
import { checkAndHandleTableBreak, assignTableSeat } from './tournament-tables.js';
// import { playSound } from './tournament-sound.js'; // TODO
// import { finishTournament } from './tournament-main.js'; // TODO

export function handleRebuy(event, state, currentTournamentId, callbacks = {}) {
    console.log("handleRebuy raw dataset ID:", event?.target?.dataset?.playerId);
    const playerId = Number(event?.target?.dataset?.playerId);
    console.log("handleRebuy called for player ID:", playerId);
    if (!playerId || isNaN(playerId)) { console.error("Rebuy: Invalid player ID from button."); return; }
    const p=state.live.players.find(pl=>pl.id===playerId);
    const lvl=state.live.currentLevelIndex+1;
    if(!p){ console.warn(`Rebuy: Player ${playerId} not found in active list.`); return; }
    if(state.config.type!=='rebuy'||!(lvl<=state.config.rebuyLevels)){alert("Re-buy er ikke tilgjengelig nå.");return;}
    if(state.live.status==='finished'){alert("Turnering er fullført.");return;}
    if(confirm(`Re-buy (${state.config.rebuyCost}kr/${state.config.rebuyChips}c) for ${p.name}?`)){ p.rebuys=(p.rebuys||0)+1; state.live.totalPot+=state.config.rebuyCost; state.live.totalEntries++; state.live.totalRebuys++; logActivity(state.live.activityLog,`${p.name} tok Re-buy.`); updateUI(state); saveTournamentState(currentTournamentId,state);}
}

export function handleEliminate(event, state, currentTournamentId, callbacks = {}) {
    const { playSound, finishTournament } = callbacks; // Hent ut callbacks
    console.log("handleEliminate raw dataset ID:", event?.target?.dataset?.playerId);
    const playerId = Number(event?.target?.dataset?.playerId);
    console.log("handleEliminate called for player ID:", playerId);
    if (!playerId || isNaN(playerId)) { console.error("Eliminate: Invalid player ID from button."); return; }
    if(state.live.status === 'finished') return;

    const ap = state.live.players;
    const pI = ap.findIndex(p=>p.id===playerId);
    if(pI === -1) { console.warn(`Eliminate: Player ${playerId} not found in active list.`); const alreadyEliminated = state.live.eliminatedPlayers.find(p => p.id === playerId); if (alreadyEliminated) { console.warn(`Player ${playerId} is already eliminated.`); alert(`${alreadyEliminated.name} er allerede slått ut.`); } else { alert(`Fant ikke spiller med ID ${playerId} i listen over aktive spillere.`); } return; }
    if (ap.length <= 1 && state.live.status !== 'finished') { alert("Kan ikke eliminere siste spiller før turneringen er fullført."); return; }

    const p = ap[pI];
    let koId = null;

    if (state.config.type === 'knockout' && (state.config.bountyAmount || 0) > 0) {
        const assigners = ap.filter(pl => pl.id !== playerId);
        if (assigners.length === 0) { console.log("Only one other player left."); koId = null; proceed(); return; }
        const overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:200;'; const box = document.createElement('div'); box.style.cssText = 'background:#fff;color:#333;padding:25px;border-radius:5px;text-align:center;max-width:400px;box-shadow:0 5px 15px rgba(0,0,0,0.3);'; box.innerHTML = `<h3 style="margin-top:0;margin-bottom:15px;color:#333;">Hvem slo ut ${p.name}?</h3><select id="ko-sel" style="padding:8px;margin:10px 0 20px 0;min-width:250px;max-width:100%;border:1px solid #ccc;border-radius:4px;font-size:1em;"><option value="">-- Velg --</option><option value="none">Ingen KO / Delt pott</option>${assigners.map(pl => `<option value="${pl.id}">${pl.name} (B${pl.table}S${pl.seat})</option>`).join('')}</select><div><button id="ko-ok" class="success-button" style="margin-right:10px;padding:8px 15px;font-size:0.95em;">Bekreft</button><button id="ko-cancel" style="padding:8px 15px;font-size:0.95em;">Avbryt</button></div>`; overlay.appendChild(box); document.body.appendChild(overlay); const closeKo = () => { if (document.body.contains(overlay)) document.body.removeChild(overlay); }; document.getElementById('ko-ok').onclick = () => { const selVal = document.getElementById('ko-sel').value; if (!selVal) { alert("Velg spiller eller 'Ingen KO'."); return; } koId = (selVal === "none") ? null : Number(selVal); closeKo(); proceed(); }; document.getElementById('ko-cancel').onclick = () => { closeKo(); console.log("KO selection cancelled."); };
    } else { koId = null; proceed(); }

    function proceed() {
        let koName = null; let koObj = null;
        if (koId !== null && !isNaN(koId)) { koObj = ap.find(pl => pl.id === koId); if (koObj) { koName = koObj.name; } else { console.warn("Selected KO player not found:", koId); koId = null; } }
        const confirmMsg = `Eliminere ${p.name}?` + (koName ? ` (KO til ${koName})` : '');
        if (confirm(confirmMsg)) {
            if(playSound) playSound('KNOCKOUT');
            p.eliminated = true; p.eliminatedBy = koId; const playersRemainingBefore = ap.length; p.place = playersRemainingBefore;
            if (koObj) { koObj.knockouts = (koObj.knockouts || 0) + 1; state.live.knockoutLog.push({ eliminatedPlayerId: p.id, eliminatedByPlayerId: koObj.id, level: state.live.currentLevelIndex + 1, timestamp: new Date().toISOString() }); console.log(`KO: ${koObj.name} took out ${p.name}`); }
            state.live.eliminatedPlayers.push(p); ap.splice(pI, 1);
            // ENDRET: Kall getPlayerNameById med state
            const logTxt = koName ? ` av ${getPlayerNameById(koId, state)}` : ''; // Bruk importert funksjon
            logActivity(state.live.activityLog, `${p.name} slått ut (${p.place}. plass${logTxt}).`); console.log(`Player ${p.name} eliminated. ${ap.length} remaining.`);
            if (state.config.paidPlaces > 0 && ap.length === state.config.paidPlaces) { logActivity(state.live.activityLog, `Boblen sprakk! ${ap.length} spillere igjen (i pengene).`); if(playSound) playSound('BUBBLE'); }
            const structChanged = checkAndHandleTableBreak(state, currentTournamentId, callbacks);
            if (!structChanged) { updateUI(state); saveTournamentState(currentTournamentId, state); }
            if (state.live.players.length <= 1 && state.live.status !== 'finished') {
                if (finishTournament) finishTournament(state, currentTournamentId);
            }
        } else { console.log("Elimination cancelled."); }
    }
}

export function handleRestore(event, state, currentTournamentId, callbacks = {}) {
    console.log("handleRestore raw dataset ID:", event?.target?.dataset?.playerId);
    const playerId = Number(event?.target?.dataset?.playerId);
    console.log("handleRestore called for player ID:", playerId);
    if (!playerId || isNaN(playerId)) { console.error("Restore: Invalid player ID from button."); return; }
    if (state.live.status === 'finished') { alert("Turnering fullført."); return; }

    const pI = state.live.eliminatedPlayers.findIndex(p => p.id === playerId);
    if (pI === -1) { console.warn(`Restore: Player ${playerId} not found in eliminated list.`); return; }
    const p = state.live.eliminatedPlayers[pI];
    const oldP = p.place;

    if (confirm(`Gjenopprette ${p.name} (var ${oldP}. plass)?`)) {
        const koById = p.eliminatedBy;
        p.eliminated = false; p.eliminatedBy = null; p.place = null;
        state.live.eliminatedPlayers.splice(pI, 1);
        state.live.players.push(p);

        if (state.config.type === 'knockout' && koById) {
            let koGetter = state.live.players.find(pl => pl.id === koById) || state.live.eliminatedPlayers.find(pl => pl.id === koById);
            if (koGetter?.knockouts > 0) { koGetter.knockouts--; console.log(`KO reversed for ${koGetter.name}.`); const logI = state.live.knockoutLog.findIndex(l => l.eliminatedPlayerId === p.id && l.eliminatedByPlayerId === koById); if(logI > -1) { state.live.knockoutLog.splice(logI, 1); } }
            else if (koGetter) { console.warn(`Restore: KO getter ${koGetter.name} found, but had ${koGetter.knockouts} KOs.`); }
        }

        assignTableSeat(p, state, null); // Send state
        logActivity(state.live.activityLog, `${p.name} gjenopprettet fra ${oldP}.plass (nå B${p.table}S${p.seat}).`);
        const structChanged = checkAndHandleTableBreak(state, currentTournamentId, callbacks); // Send state/id/callbacks
        if (!structChanged) {
            updateUI(state);
            saveTournamentState(currentTournamentId, state);
        }
    }
}

export function handleLateRegClick(state, currentTournamentId, callbacks = {}) {
    console.log("handleLateRegClick called.");
    if (state.live.status === 'finished') return;
    const lvl = state.live.currentLevelIndex + 1;
    const isOpen = lvl <= state.config.lateRegLevel && state.config.lateRegLevel > 0;
    if (!isOpen) { const reason = state.config.lateRegLevel > 0 ? `stengte etter nivå ${state.config.lateRegLevel}` : "ikke aktivert"; alert(`Sen registrering ${reason}.`); return; }

    const name = prompt("Navn (Late Reg):");
    if (name?.trim()) {
        const newPlayerId = state.live.nextPlayerId++;
        const p = { id: newPlayerId, name: name.trim(), stack: state.config.startStack, table: 0, seat: 0, rebuys: 0, addon: false, eliminated: false, eliminatedBy: null, place: null, knockouts: 0 };
        assignTableSeat(p, state, null); // Send state
        state.live.players.push(p);
        state.live.totalPot += state.config.buyIn;
        state.live.totalEntries++;
        logActivity(state.live.activityLog, `${p.name} (ID: ${p.id}) registrert (Late Reg, B${p.table}S${p.seat}).`);
        state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
        const structChanged = checkAndHandleTableBreak(state, currentTournamentId, callbacks); // Send state/id/callbacks
        if (!structChanged) { updateUI(state); saveTournamentState(currentTournamentId, state); }
    } else if (name !== null) { alert("Navn kan ikke være tomt."); }
}
