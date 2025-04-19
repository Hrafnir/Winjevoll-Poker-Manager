// === CONSTANTS SECTION START ===
const TOURNAMENT_STORAGE_KEY = 'winjevollActiveTournament_v1'; // Versjonsnummer i nøkkel for å unngå konflikt med gamle data
// === CONSTANTS SECTION END ===


// === SAVE FUNCTION SECTION START ===
function saveTournamentState(state) {
    try {
        // Basic validation before saving
        if (!state || typeof state !== 'object' || !state.config || !state.live) {
             console.error("Attempted to save invalid state:", state);
             throw new Error("Invalid state object provided for saving.");
        }
        localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(state));
        console.log("Tournament state saved successfully."); // Mer informativ logg
    } catch (e) {
        console.error("Error saving state to localStorage:", e);
        // Prøv å gi en mer spesifikk feilmelding hvis mulig
        if (e.name === 'QuotaExceededError') {
             alert("Kunne ikke lagre turneringsstatus! Nettleserens lagringsplass er full. Prøv å slette gamle data eller øke kvoten.");
        } else {
             alert("En ukjent feil oppstod under lagring av turneringsstatus!");
        }
    }
}
// === SAVE FUNCTION SECTION END ===


// === LOAD FUNCTION SECTION START ===
function loadTournamentState() {
    try {
        const stateJSON = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
        if (stateJSON) {
            const state = JSON.parse(stateJSON);
            // Basic validation of loaded state
             if (!state || typeof state !== 'object' || !state.config || !state.live) {
                 console.error("Loaded state from localStorage is invalid:", state);
                 throw new Error("Invalid state format loaded.");
             }
            console.log("Tournament state loaded successfully."); // Mer informativ logg
            return state;
        }
        return null; // Ingen lagret state
    } catch (e) {
        console.error("Error loading state from localStorage:", e);
        alert("Kunne ikke laste turneringsstatus! Lagret data kan være korrupt eller i feil format. Prøver å fjerne den.");
        clearTournamentState(); // Prøv å fjerne korrupt data
        return null;
    }
}
// === LOAD FUNCTION SECTION END ===


// === CLEAR FUNCTION SECTION START ===
function clearTournamentState() {
    try {
        localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
        console.log("Active tournament state cleared from localStorage.");
    } catch (e) {
        console.error("Error clearing tournament state from localStorage:", e);
        alert("Kunne ikke slette lagret turneringsstatus!");
    }
}
// === CLEAR FUNCTION SECTION END ===


// === UNIQUE ID GENERATOR SECTION START ===
// Enkel teller-basert ID, tilstrekkelig for lokal bruk i én økt.
// Persisterer ikke mellom sideinnlastinger, men det gjør ikke noe
// siden spillere får permanente IDer når turneringen lagres.
let nextIdCounter = Date.now(); // Start med noe (relativt) unikt for økten

function generateUniqueId() {
    // Bruker en teller for å sikre unikhet innenfor denne sideinnlastingen.
    return nextIdCounter++;
}
// === UNIQUE ID GENERATOR SECTION END ===
