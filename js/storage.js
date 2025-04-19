const TOURNAMENT_STORAGE_KEY = 'winjevollActiveTournament_v1'; // Versjonsnummer i nøkkel

function saveTournamentState(state) {
    try {
        localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(state));
        // console.log("State saved:", state); // For debugging
    } catch (e) {
        console.error("Error saving state to localStorage:", e);
        alert("Kunne ikke lagre turneringsstatus! Sjekk om localStorage er aktivert og har plass.");
    }
}

function loadTournamentState() {
    try {
        const stateJSON = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
        if (stateJSON) {
            const state = JSON.parse(stateJSON);
            // console.log("State loaded:", state); // For debugging
            return state;
        }
        return null; // Ingen lagret state
    } catch (e) {
        console.error("Error loading state from localStorage:", e);
        alert("Kunne ikke laste turneringsstatus! Lagret data kan være korrupt.");
        localStorage.removeItem(TOURNAMENT_STORAGE_KEY); // Prøv å fjerne korrupt data
        return null;
    }
}

function clearTournamentState() {
    localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
    console.log("Active tournament state cleared.");
}

// Hjelpefunksjon for unik ID (enkel versjon)
let nextIdCounter = Date.now(); // Start med noe unikt
function generateUniqueId() {
    // Bruker en kombinasjon av tid og en teller for å øke unikheten
    // Enkel nok for lokal bruk hvor samtidige kall er usannsynlig.
    const timestamp = Date.now();
    if (timestamp <= nextIdCounter) {
         // Hvis tiden ikke har gått videre (eller gikk bakover?), inkrementer bare telleren
         nextIdCounter++;
    } else {
         // Hvis tiden har gått videre, bruk den nye tiden
         nextIdCounter = timestamp;
    }
    // Kombinerer tid og en liten teller/tilfeldighet for ekstra sikkerhet
    // return `player-${nextIdCounter}-${Math.random().toString(36).substring(2, 7)}`;
    // Enklere versjon:
     return nextIdCounter++; // Bare inkrementer for enkel unikhet i denne økten
}
