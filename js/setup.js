document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('setup-form');
    const tournamentTypeSelect = document.getElementById('tournament-type');
    const rebuySection = document.getElementById('rebuy-section');
    const knockoutSection = document.getElementById('knockout-section');
    const blindStructureBody = document.getElementById('blind-structure-body');
    const paidPlacesInput = document.getElementById('paid-places');
    const prizeDistInput = document.getElementById('prize-distribution');

    // Vis/skjul seksjoner basert på type
    function toggleSections() {
        const type = tournamentTypeSelect.value;
        rebuySection.classList.toggle('hidden', type !== 'rebuy');
        knockoutSection.classList.toggle('hidden', type !== 'knockout');
    }
    tournamentTypeSelect.addEventListener('change', toggleSections);
    toggleSections(); // Kjør ved lasting

    // --- Blindstruktur ---
    let blindLevelCounter = 0;

    function addBlindLevelRow(levelData = {}) {
        blindLevelCounter++;
        const row = blindStructureBody.insertRow();
        row.innerHTML = `
            <td><span class="level-number">${blindLevelCounter}</span></td>
            <td><input type="number" class="sb-input" value="${levelData.sb || ''}" min="0"></td>
            <td><input type="number" class="bb-input" value="${levelData.bb || ''}" min="0"></td>
            <td><input type="number" class="ante-input" value="${levelData.ante || 0}" min="0"></td>
            <td><input type="number" class="duration-input" value="${levelData.duration || document.getElementById('level-duration').value}" min="1"></td>
            <td><input type="checkbox" class="is-break-checkbox" ${levelData.isBreak ? 'checked' : ''}></td>
            <td><button type="button" class="btn-remove-level">Fjern</button></td>
        `;
        row.querySelector('.btn-remove-level').addEventListener('click', () => {
            row.remove();
            updateLevelNumbers();
        });
        row.querySelector('.is-break-checkbox').addEventListener('change', (e) => {
            const isBreak = e.target.checked;
            row.querySelector('.sb-input').disabled = isBreak;
            row.querySelector('.bb-input').disabled = isBreak;
            row.querySelector('.ante-input').disabled = isBreak;
            if(isBreak) {
                 row.querySelector('.sb-input').value = '';
                 row.querySelector('.bb-input').value = '';
                 row.querySelector('.ante-input').value = 0;
            }
        });
         // Trigger change event initially if it's a break
        if(levelData.isBreak) {
             row.querySelector('.is-break-checkbox').dispatchEvent(new Event('change'));
        }
    }

    function updateLevelNumbers() {
        const rows = blindStructureBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.querySelector('.level-number').textContent = index + 1;
        });
        blindLevelCounter = rows.length;
    }

    document.getElementById('btn-add-level').addEventListener('click', () => addBlindLevelRow());

    document.getElementById('btn-generate-blinds').addEventListener('click', () => {
        blindStructureBody.innerHTML = ''; // Clear existing
        blindLevelCounter = 0;
        const startStack = parseInt(document.getElementById('start-stack').value) || 10000;
        const duration = parseInt(document.getElementById('level-duration').value) || 20;
        // Enkel generering (kan gjøres mer avansert)
        const blinds = [
            { sb: Math.round(startStack / 200), bb: Math.round(startStack / 100), ante: 0 },
            { sb: Math.round(startStack / 150), bb: Math.round(startStack / 75), ante: 0 },
            { sb: Math.round(startStack / 100), bb: Math.round(startStack / 50), ante: Math.round(startStack / 500) || 0 },
            { sb: Math.round(startStack / 75), bb: Math.round(startStack / 37), ante: Math.round(startStack / 400) || 0 },
            { isBreak: true, duration: 10 }, // Pause
            { sb: Math.round(startStack / 50), bb: Math.round(startStack / 25), ante: Math.round(startStack / 250) || 0 },
            { sb: Math.round(startStack / 30), bb: Math.round(startStack / 15), ante: Math.round(startStack / 150) || 0 },
            { sb: Math.round(startStack / 20), bb: Math.round(startStack / 10), ante: Math.round(startStack / 100) || 0 },
            { sb: Math.round(startStack / 15), bb: Math.round(startStack / 7.5), ante: Math.round(startStack / 75) || 0 },
             { isBreak: true, duration: 10 }, // Pause
            { sb: Math.round(startStack / 10), bb: Math.round(startStack / 5), ante: Math.round(startStack / 50) || 0 },
            { sb: Math.round(startStack / 7), bb: Math.round(startStack / 3.5), ante: Math.round(startStack / 35) || 0 },
            { sb: Math.round(startStack / 5), bb: Math.round(startStack / 2.5), ante: Math.round(startStack / 25) || 0 },
        ];
        blinds.forEach(b => addBlindLevelRow({ ...b, duration: b.isBreak ? b.duration : duration }));
    });

    // Generer noen start-nivåer
    document.getElementById('btn-generate-blinds').click();


    // --- Skjemainnsending ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Samle inn all data
        const config = {
            name: document.getElementById('tournament-name').value.trim(),
            date: new Date().toISOString().slice(0, 10), // Dagens dato
            type: tournamentTypeSelect.value,
            buyIn: parseInt(document.getElementById('buy-in').value) || 0,
            bountyAmount: 0,
            startStack: parseInt(document.getElementById('start-stack').value) || 10000,
            playersPerTable: parseInt(document.getElementById('players-per-table').value) || 9,
            paidPlaces: parseInt(paidPlacesInput.value) || 1,
            prizeDistribution: prizeDistInput.value.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p)),
            rebuyCost: 0,
            rebuyChips: 0,
            rebuyLevels: 0,
            addonCost: 0,
            addonChips: 0,
            lateRegLevel: parseInt(document.getElementById('late-reg-level').value) || 0,
            blindLevels: [],
        };

        if (config.type === 'rebuy') {
            config.rebuyCost = parseInt(document.getElementById('rebuy-cost').value) || 0;
            config.rebuyChips = parseInt(document.getElementById('rebuy-chips').value) || config.startStack;
            config.rebuyLevels = parseInt(document.getElementById('rebuy-levels').value) || 0;
            config.addonCost = parseInt(document.getElementById('addon-cost').value) || 0;
            config.addonChips = parseInt(document.getElementById('addon-chips').value) || 0;
        }
        if (config.type === 'knockout') {
            config.bountyAmount = parseInt(document.getElementById('bounty-amount').value) || 0;
            if (config.bountyAmount > config.buyIn) {
                 alert("Bounty kan ikke være større enn Buy-in.");
                 return;
            }
        }

        // Valider premiefordeling
        const prizeSum = config.prizeDistribution.reduce((sum, p) => sum + p, 0);
        if (config.prizeDistribution.length !== config.paidPlaces || Math.abs(prizeSum - 100) > 0.1) {
             alert(`Antall premier (${config.prizeDistribution.length}) stemmer ikke med Antall Betalte (${config.paidPlaces}), eller summen (${prizeSum}%) er ikke 100%.`);
             return;
        }


        // Samle blindstruktur
        const blindRows = blindStructureBody.querySelectorAll('tr');
        if (blindRows.length === 0) {
            alert("Du må definere minst ett blindnivå.");
            return;
        }
        blindRows.forEach((row, index) => {
            const isBreak = row.querySelector('.is-break-checkbox').checked;
            const level = {
                level: index + 1,
                sb: isBreak ? 0 : parseInt(row.querySelector('.sb-input').value) || 0,
                bb: isBreak ? 0 : parseInt(row.querySelector('.bb-input').value) || 0,
                ante: isBreak ? 0 : parseInt(row.querySelector('.ante-input').value) || 0,
                duration: parseInt(row.querySelector('.duration-input').value) || 20,
                isBreak: isBreak,
            };
             // Validering: BB må være minst SB, begge må være > 0 hvis ikke pause
             if (!isBreak && (level.bb <= 0 || level.bb < level.sb)) {
                  alert(`Ugyldig blindnivå ${level.level}: Big Blind må være større enn 0 og minst like stor som Small Blind.`);
                  throw new Error("Invalid blind level"); // Stopp prosessen
             }
            config.blindLevels.push(level);
        });

        // 2. Initialiser live state
        const live = {
            status: "paused", // Starter pauset
            currentLevelIndex: 0,
            timeRemainingInLevel: config.blindLevels[0].duration * 60,
            players: [],
            eliminatedPlayers: [],
            totalPot: 0, // Start pott
            totalEntries: 0, // Buyins + Rebuys
            totalRebuys: 0,
            totalAddons: 0,
            nextPlayerId: 1,
            nextTable: 1,
            nextSeat: 1,
             knockoutLog: [], // For KO tracking
        };

        // 3. Registrer spillere og sett startpott/entries
        const playerNames = document.getElementById('player-names').value.split('\n')
            .map(name => name.trim()).filter(name => name.length > 0);

        if (playerNames.length < 2) {
            alert("Du må registrere minst to spillere.");
            return;
        }

        const playersPerTable = config.playersPerTable;
        let currentTable = 1;
        let currentSeat = 1;

        playerNames.forEach(name => {
            const player = {
                id: live.nextPlayerId++,
                name: name,
                stack: config.startStack, // Første stack
                table: currentTable,
                seat: currentSeat,
                rebuys: 0,
                addon: false,
                eliminated: false,
                eliminatedBy: null,
                place: null,
                knockouts: 0 // For KO
            };
            live.players.push(player);
            live.totalPot += config.buyIn;
            live.totalEntries++; // Hver startende spiller er en entry

            // Enkel bordplassering
            currentSeat++;
            if (currentSeat > playersPerTable) {
                currentSeat = 1;
                currentTable++;
            }
        });
         live.nextTable = currentTable;
         live.nextSeat = currentSeat;


        // 4. Lagre state og naviger
        const tournamentState = { config, live };
        try {
             saveTournamentState(tournamentState);
             window.location.href = 'tournament.html';
        } catch (error) {
             console.error("Klarte ikke lagre eller navigere:", error);
             // Ikke naviger hvis lagring feilet
        }
    });
});
