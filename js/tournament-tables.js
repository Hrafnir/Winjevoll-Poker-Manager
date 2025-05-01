// === tournament-tables.js ===
// Funksjoner for bordtildeling, sammenslåing og balansering.

import { logActivity } from './tournament-logic.js';
// Importer funksjoner som trengs av denne modulen
// import { updateUI } from './tournament-ui.js'; // Trengs av balanceTables
// import { saveTournamentState } from './storage.js'; // Trengs av balanceTables

// Hjelpefunksjoner (kan holdes private her hvis de kun brukes internt)
function findTargetTable(state, excludeTableNum = null) {
    const tables = {};
    let validTables = [];
    state.live.players.forEach(p => {
        if (p.id !== player.id && p.table && p.table !== excludeTableNum) { // Antar 'player' er definert i scope som kaller? Nei, trenger ikke player her.
             if (p.table && p.table !== excludeTableNum) { // Korrigert sjekk
                tables[p.table] = (tables[p.table] || 0) + 1;
            }
        }
    });

    validTables = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).filter(t => t.tableNum !== excludeTableNum);
    validTables.sort((a, b) => a.count - b.count); // Sorter etter færrest spillere

    let targetTable = -1;
    for (const t of validTables) {
        if (t.count < state.config.playersPerTable) {
            targetTable = t.tableNum;
            break; // Fant et bord med ledig plass
        }
    }

    // Hvis ingen eksisterende bord har plass, lag et nytt
    if (targetTable === -1) {
        const existingTables = [...new Set(state.live.players.map(p => p.table).filter(t => t > 0))];
        let nextTableNum = existingTables.length > 0 ? Math.max(0, ...existingTables) + 1 : 1;
        if (nextTableNum === excludeTableNum) { // Hopp over bordet som skal brytes
            nextTableNum++;
        }
        targetTable = nextTableNum;
         console.log("Creating new table:", targetTable);
    }
    return targetTable;
}

function findSeatAtTable(state, tableNum) {
    const occupiedSeats = state.live.players
        .filter(p => p.table === tableNum)
        .map(p => p.seat);

    let seat = 1;
    while (occupiedSeats.includes(seat)) {
        seat++;
    }

    // Sjekk om bordet er "fullt" i henhold til config (dette er mer en advarsel)
    if (seat > state.config.playersPerTable && occupiedSeats.length >= state.config.playersPerTable) {
        console.warn(`Attempting to assign seat ${seat} to table ${tableNum} which should be full (${state.config.playersPerTable} players max).`);
    }
    return seat;
}

// === Eksporterte funksjoner ===

export function assignTableSeat(player, state, excludeTableNum = null) {
    const targetTable = findTargetTable(state, excludeTableNum);
    const seat = findSeatAtTable(state, targetTable);
    player.table = targetTable;
    player.seat = seat;
    console.log(`Assigned ${player.name} -> T${player.table}S${player.seat}`);
}

export function reassignAllSeats(state, targetTableNum) {
    logActivity(state.live.activityLog, `Finalebord (B${targetTableNum})! Trekker seter...`);
    const players = state.live.players;
    const numP = players.length;
    if (numP === 0) return;

    // Lag en tilfeldig rekkefølge av seter
    const seats = Array.from({ length: numP }, (_, i) => i + 1);
    for (let i = seats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seats[i], seats[j]] = [seats[j], seats[i]]; // Bytt plass
    }

    // Tildel seter
    players.forEach((p, i) => {
        p.table = targetTableNum;
        p.seat = seats[i];
        logActivity(state.live.activityLog, ` -> ${p.name} S${p.seat}.`);
    });

    // Sorter spillerlisten etter sete for konsistens
    state.live.players.sort((a, b) => a.seat - b.seat);
    console.log("Final table seats assigned.");
}


// Funksjon for å balansere bord (krever callbacks for UI/Save)
export function balanceTables(state, currentTournamentId, callbacks) {
    const { updateUI, saveTournamentState } = callbacks;
    const tableBalanceInfo = document.getElementById('table-balance-info'); // Trenger denne referansen

    if (state.live.status === 'finished' || state.live.players.length <= state.config.playersPerTable) {
        if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden');
        return false; // Ingen balansering nødvendig
    }

    let balanced = false;
    const maxDiff = 1;

    while (true) { // Loop til bordene er balansert
        const tables = {};
        state.live.players.forEach(p => {
            if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1;
        });
        const tableCounts = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).filter(tc => tc.count > 0);

        if (tableCounts.length < 2) {
            if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden');
            break; // Kan ikke balansere ett eller færre bord
        }

        tableCounts.sort((a, b) => a.count - b.count); // Sorter etter antall spillere (lavest først)
        const minT = tableCounts[0];
        const maxT = tableCounts[tableCounts.length - 1];

        if (maxT.count - minT.count <= maxDiff) {
            if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden');
            break; // Bordene er balansert
        }

        // Ubalanse funnet
        balanced = true;
        if (tableBalanceInfo) tableBalanceInfo.classList.remove('hidden');
        console.log(`Balancing: MaxT${maxT.tableNum}(${maxT.count}), MinT${minT.tableNum}(${minT.count})`);

        // Finn en tilfeldig spiller fra bordet med flest spillere
        const maxPlayers = state.live.players.filter(p => p.table === maxT.tableNum);
        if (maxPlayers.length === 0) { console.error(`Balance Err: No players on maxT ${maxT.tableNum}`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; }
        const playerToMove = maxPlayers[Math.floor(Math.random() * maxPlayers.length)];

        // Finn et ledig sete ved bordet med færrest spillere
        const newSeat = findSeatAtTable(state, minT.tableNum);
        if (newSeat > state.config.playersPerTable) { console.error(`Balance Err: No seat on minT ${minT.tableNum}.`); alert(`Feil: Fant ikke ledig sete på B${minT.tableNum}.`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; }

        const oldT = playerToMove.table;
        const oldS = playerToMove.seat;
        const msg = `Balansering: ${playerToMove.name} fra B${oldT}S${oldS} til B${minT.tableNum}S${newSeat}.`;

        // Flytt spilleren
        playerToMove.table = minT.tableNum;
        playerToMove.seat = newSeat;

        logActivity(state.live.activityLog, msg);
        state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table); // Sorter listen på nytt

        // Kall callbacks for å oppdatere UI og lagre state
        if (updateUI) updateUI(state);
        if (saveTournamentState) saveTournamentState(currentTournamentId, state);

        // Fortsett loopen for å sjekke om ytterligere balansering trengs
    } // End while loop

    if (balanced) console.log("Balancing done for this iteration.");
    return balanced; // Returner om en balanseringshandling ble utført
}


// Hovedfunksjon for å sjekke og håndtere bordstruktur (krever callbacks)
export function checkAndHandleTableBreak(state, currentTournamentId, callbacks) {
    const { updateUI, saveTournamentState, playSound } = callbacks; // Trenger playSound også
    const tableBalanceInfo = document.getElementById('table-balance-info');

    if (state.live.status === 'finished') return false;

    const pCount = state.live.players.length;
    const maxPPT = state.config.playersPerTable;
    const tablesSet = new Set(state.live.players.map(p => p.table).filter(t => t > 0));
    const tableCount = tablesSet.size;
    const targetTCount = Math.ceil(pCount / maxPPT);
    const finalTSize = maxPPT; // Størrelse for finalebord

    console.log(`Table check: Players=${pCount}, Tables=${tableCount}, Target=${targetTCount}`);
    let actionTaken = false;

    // 1. Sjekk for finalebord
    if (tableCount > 1 && pCount <= finalTSize) {
        const finalTNum = 1; // Finalebord er alltid bord 1
        logActivity(state.live.activityLog, `Finalebord (${pCount})! Flytter til B${finalTNum}...`);
        alert(`Finalebord (${pCount})! Flytter til B${finalTNum}.`);
        if (playSound) playSound('FINAL_TABLE');

        // Flytt alle spillere til bord 1 (reassignAllSeats setter riktig sete)
        state.live.players.forEach(p => p.table = finalTNum);
        reassignAllSeats(state, finalTNum); // Trekker nye seter for finalebordet
        actionTaken = true;
    }
    // 2. Sjekk om et bord må brytes (for mange bord)
    else if (tableCount > targetTCount && tableCount > 1) {
        const tables = {};
        state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; });
        const sortedTs = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).sort((a, b) => a.count - b.count);

        if (sortedTs.length > 0) {
            const breakTNum = sortedTs[0].tableNum; // Bryt bordet med færrest spillere
            const msg = `Slår sammen! Flytter spillere fra B${breakTNum}.`;
            logActivity(state.live.activityLog, msg);
            alert(msg);

            const playersToMove = state.live.players.filter(p => p.table === breakTNum);
            playersToMove.forEach(p => {
                const oldT = p.table; const oldS = p.seat;
                p.table = 0; p.seat = 0; // Nullstill midlertidig
                assignTableSeat(p, state, breakTNum); // Tildel nytt sete, unngå bordet som brytes
                logActivity(state.live.activityLog, ` -> ${p.name} (B${oldT}S${oS}) til B${p.table}S${p.seat}.`);
            });
            state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
            actionTaken = true;
        }
    }

    // 3. Balanser bord (selv om ingen bord ble brutt)
    const balancedNow = balanceTables(state, currentTournamentId, callbacks);

    // Oppdater UI og lagre hvis en handling ble utført (sammenslåing eller balansering)
    if (actionTaken || balancedNow) {
        if (updateUI) updateUI(state);
        if (saveTournamentState) saveTournamentState(currentTournamentId, state);
        return true; // Indikerer at struktur endret seg
    } else {
        // Ingen sammenslåing eller balansering skjedde
        if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); // Skjul balanseringsinfo hvis alt er ok
        return false; // Ingen endring i struktur
    }
}
