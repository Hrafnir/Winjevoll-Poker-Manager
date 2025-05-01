// === tournament-tables.js ===
// Funksjoner for bordtildeling, sammenslåing og balansering.

import { logActivity } from './tournament-logic.js';
// Merk: updateUI og saveTournamentState mottas som callbacks i funksjonene som trenger dem

// === Private Hjelpefunksjoner ===
function findTargetTable(state, excludeTableNum = null) {
    const tables = {};
    let validTables = [];
    state.live.players.forEach(p => {
        // Sjekk om spilleren har et gyldig bordnummer og ikke er ekskludert
        if (p.table && typeof p.table === 'number' && p.table > 0 && p.table !== excludeTableNum) {
            tables[p.table] = (tables[p.table] || 0) + 1;
        }
    });

    validTables = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c }));
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

    if (seat > state.config.playersPerTable && occupiedSeats.length >= state.config.playersPerTable) {
        console.warn(`Assigning seat ${seat} to table ${tableNum} which should be full (${state.config.playersPerTable} players max).`);
    }
    return seat;
}
// === Slutt Private Hjelpefunksjoner ===


// === Eksporterte funksjoner ===

export function assignTableSeat(player, state, excludeTableNum = null) {
    if (!player || !state || !state.config || !state.live) {
        console.error("assignTableSeat: Invalid arguments provided.");
        return; // Gå ut tidlig hvis nødvendig data mangler
    }
    const targetTable = findTargetTable(state, excludeTableNum);
    const seat = findSeatAtTable(state, targetTable);
    player.table = targetTable;
    player.seat = seat;
    console.log(`Assigned ${player.name} (ID: ${player.id}) -> T${player.table}S${player.seat}`);
}

export function reassignAllSeats(state, targetTableNum) {
    if (!state || !state.live) { console.error("reassignAllSeats: State missing"); return; }
    logActivity(state.live.activityLog, `Finalebord (B${targetTableNum})! Trekker seter...`);
    const players = state.live.players;
    const numP = players.length;
    if (numP === 0) return;

    const seats = Array.from({ length: numP }, (_, i) => i + 1);
    for (let i = seats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seats[i], seats[j]] = [seats[j], seats[i]];
    }

    players.forEach((p, i) => {
        p.table = targetTableNum;
        p.seat = seats[i];
        logActivity(state.live.activityLog, ` -> ${p.name} S${p.seat}.`);
    });

    state.live.players.sort((a, b) => a.seat - b.seat);
    console.log("Final table seats assigned.");
}


export function balanceTables(state, currentTournamentId, callbacks) {
    if (!state || !state.config || !state.live) { console.error("balanceTables: State missing"); return false; }
    const { updateUI, saveState } = callbacks; // Bruk saveState fra callbacks
    const tableBalanceInfo = document.getElementById('table-balance-info');

    if (state.live.status === 'finished' || state.live.players.length <= state.config.playersPerTable) {
        if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden');
        return false;
    }

    let balanced = false;
    const maxDiff = 1;

    while (true) {
        const tables = {};
        state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; });
        const tableCounts = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).filter(tc => tc.count > 0);

        if (tableCounts.length < 2) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; }

        tableCounts.sort((a, b) => a.count - b.count);
        const minT = tableCounts[0];
        const maxT = tableCounts[tableCounts.length - 1];

        if (maxT.count - minT.count <= maxDiff) { if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden'); break; }

        balanced = true;
        if (tableBalanceInfo) tableBalanceInfo.classList.remove('hidden');
        console.log(`Balancing: MaxT${maxT.tableNum}(${maxT.count}), MinT${minT.tableNum}(${minT.count})`);

        const maxPlayers = state.live.players.filter(p => p.table === maxT.tableNum);
        if (maxPlayers.length === 0) { console.error(`Balance Err: No players on maxT ${maxT.tableNum}`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; }
        const playerToMove = maxPlayers[Math.floor(Math.random() * maxPlayers.length)];

        const newSeat = findSeatAtTable(state, minT.tableNum);
        if (newSeat > state.config.playersPerTable) { console.error(`Balance Err: No seat on minT ${minT.tableNum}.`); alert(`Feil: Fant ikke ledig sete på B${minT.tableNum}.`); if (tableBalanceInfo) tableBalanceInfo.textContent = "FEIL!"; break; }

        const oldT = playerToMove.table; const oldS = playerToMove.seat;
        const msg = `Balansering: ${playerToMove.name} fra B${oldT}S${oldS} til B${minT.tableNum}S${newSeat}.`;

        playerToMove.table = minT.tableNum;
        playerToMove.seat = newSeat;

        logActivity(state.live.activityLog, msg);
        state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);

        if (updateUI) updateUI(state); // Kall UI-oppdatering
        if (saveState) saveState(); // Kall lagring via callback

    } // End while loop

    if (balanced) console.log("Balancing check iteration complete.");
    return balanced;
}


export function checkAndHandleTableBreak(state, currentTournamentId, callbacks) {
    if (!state || !state.config || !state.live) { console.error("checkAndHandleTableBreak: State missing"); return false; }
    const { updateUI, saveState, playSound } = callbacks; // Bruk saveState her
    const tableBalanceInfo = document.getElementById('table-balance-info');

    if (state.live.status === 'finished') return false;

    const pCount = state.live.players.length;
    const maxPPT = state.config.playersPerTable;
    const tablesSet = new Set(state.live.players.map(p => p.table).filter(t => t > 0));
    const tableCount = tablesSet.size;
    const targetTCount = Math.ceil(pCount / maxPPT);
    const finalTSize = maxPPT;

    console.log(`Table check: Players=${pCount}, Tables=${tableCount}, Target=${targetTCount}`);
    let actionTaken = false;

    // 1. Sjekk for finalebord
    if (tableCount > 1 && pCount <= finalTSize) {
        const finalTNum = 1;
        logActivity(state.live.activityLog, `Finalebord (${pCount})! Flytter til B${finalTNum}...`);
        alert(`Finalebord (${pCount})! Flytter til B${finalTNum}.`);
        if (playSound) playSound('FINAL_TABLE');
        state.live.players.forEach(p => p.table = finalTNum);
        reassignAllSeats(state, finalTNum);
        actionTaken = true;
    }
    // 2. Sjekk om et bord må brytes
    else if (tableCount > targetTCount && tableCount > 1) {
        const tables = {};
        state.live.players.forEach(p => { if(p.table > 0) tables[p.table] = (tables[p.table] || 0) + 1; });
        const sortedTs = Object.entries(tables).map(([n, c]) => ({ tableNum: parseInt(n), count: c })).sort((a, b) => a.count - b.count);

        if (sortedTs.length > 0) {
            const breakTNum = sortedTs[0].tableNum;
            const msg = `Slår sammen! Flytter spillere fra B${breakTNum}.`;
            logActivity(state.live.activityLog, msg);
            alert(msg);
            const playersToMove = state.live.players.filter(p => p.table === breakTNum);
            playersToMove.forEach(p => {
                const oldT = p.table; const oldS = p.seat;
                p.table = 0; p.seat = 0;
                assignTableSeat(p, state, breakTNum); // Gi nytt sete, unngå brutt bord
                logActivity(state.live.activityLog, ` -> ${p.name} (B${oldT}S${oS}) til B${p.table}S${p.seat}.`);
            });
            state.live.players.sort((a, b) => a.table === b.table ? a.seat - b.seat : a.table - b.table);
            actionTaken = true;
        }
    }

    // 3. Balanser uansett (kan være nødvendig selv om ingen bord brytes)
    const balancedNow = balanceTables(state, currentTournamentId, callbacks);

    // Oppdater/lagre kun hvis noe skjedde
    if (actionTaken || balancedNow) {
        if (updateUI) updateUI(state);
        if (saveState) saveState();
        return true;
    } else {
        if (tableBalanceInfo) tableBalanceInfo.classList.add('hidden');
        return false;
    }
}
