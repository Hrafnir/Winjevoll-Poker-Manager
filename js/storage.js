// === 01: CONSTANTS SECTION START ===
const TOURNAMENT_COLLECTION_KEY = 'winjevollTournamentCollection_v1';
const TEMPLATE_COLLECTION_KEY = 'winjevollTemplateCollection_v1';
const ACTIVE_TOURNAMENT_ID_KEY = 'winjevollActiveTournamentId_v1';
const ACTIVE_TEMPLATE_ID_KEY = 'winjevollActiveTemplateId_v1'; // For loading template into setup
// === 01: CONSTANTS SECTION END ===


// === 02: UTILITY FUNCTIONS (Load/Save Collections) START ===
function loadCollection(key) {
    try {
        const collectionJSON = localStorage.getItem(key);
        if (collectionJSON) {
            const collection = JSON.parse(collectionJSON);
            // Basic validation: should be an object
            if (typeof collection === 'object' && collection !== null) {
                 return collection;
            } else {
                 console.warn(`Data retrieved for key "${key}" is not a valid object. Returning empty object.`);
                 localStorage.removeItem(key); // Remove invalid data
                 return {};
            }
        }
        return {}; // Return empty object if no data found
    } catch (e) {
        console.error(`Error loading collection from localStorage (key: ${key}):`, e);
        alert(`Kunne ikke laste data for ${key}. Lagret data kan være korrupt.`);
        localStorage.removeItem(key); // Attempt to remove corrupted data
        return {};
    }
}

function saveCollection(key, collection) {
    try {
        if (typeof collection !== 'object' || collection === null) {
             throw new Error("Attempted to save non-object as collection.");
        }
        localStorage.setItem(key, JSON.stringify(collection));
        // console.log(`Collection saved successfully for key: ${key}`);
    } catch (e) {
        console.error(`Error saving collection to localStorage (key: ${key}):`, e);
        if (e.name === 'QuotaExceededError') {
             alert(`Kunne ikke lagre data (${key})! Nettleserens lagringsplass er full.`);
        } else {
             alert(`En ukjent feil oppstod under lagring av data (${key})!`);
        }
         throw e; // Re-throw error so calling function knows it failed
    }
}
// === 02: UTILITY FUNCTIONS (Load/Save Collections) END ===


// === 03: TOURNAMENT FUNCTIONS START ===
function loadTournamentCollection() {
    return loadCollection(TOURNAMENT_COLLECTION_KEY);
}

function saveTournamentState(tournamentId, state) {
     if (!tournamentId || !state || !state.config || !state.live) {
         console.error("Invalid tournamentId or state provided to saveTournamentState.");
         alert("Intern feil: Forsøkte å lagre ugyldig turneringsdata."); // User feedback
         return false; // Indicate failure
     }
    try {
        const collection = loadTournamentCollection();
        collection[tournamentId] = state;
        saveCollection(TOURNAMENT_COLLECTION_KEY, collection);
        console.log(`Tournament ${tournamentId} state saved.`);
        return true; // Indicate success
    } catch (error) {
        console.error(`Failed to save state for tournament ${tournamentId}`, error);
        // Alert might already be shown by saveCollection
        return false; // Indicate failure
    }
}

function loadTournamentState(tournamentId) {
    if (!tournamentId) {
        console.warn("loadTournamentState called with no tournamentId.");
        return null;
    }
    const collection = loadTournamentCollection();
    // Add validation for the loaded state structure
    if(collection[tournamentId] && collection[tournamentId].config && collection[tournamentId].live) {
         console.log(`Loading state for tournament ${tournamentId}`);
         return collection[tournamentId];
    } else {
         console.warn(`Tournament state for ID ${tournamentId} not found or invalid in collection.`);
         // Optionally remove the invalid entry?
         // delete collection[tournamentId];
         // saveCollection(TOURNAMENT_COLLECTION_KEY, collection);
         return null;
    }
}

function deleteTournamentState(tournamentId) {
    if (!tournamentId) return;
    try {
        const collection = loadTournamentCollection();
        if (collection[tournamentId]) {
            delete collection[tournamentId];
            saveCollection(TOURNAMENT_COLLECTION_KEY, collection);
            console.log(`Tournament ${tournamentId} deleted.`);
            // Also clear active ID if it was the deleted one
            if (getActiveTournamentId() === tournamentId) {
                 clearActiveTournamentId();
            }
        } else {
            console.warn(`Tournament ${tournamentId} not found for deletion.`);
        }
    } catch (error) {
         console.error(`Failed to delete state for tournament ${tournamentId}`, error);
         alert(`Kunne ikke slette turnering ${tournamentId}.`);
    }
}
// === 03: TOURNAMENT FUNCTIONS END ===


// === 04: TEMPLATE FUNCTIONS START ===
function loadTemplateCollection() {
    return loadCollection(TEMPLATE_COLLECTION_KEY);
}

function saveTemplate(templateId, templateData) {
     if (!templateId || !templateData || !templateData.config) {
          console.error("Invalid templateId or templateData provided to saveTemplate.");
          alert("Intern feil: Forsøkte å lagre ugyldig maldata.");
          return false;
     }
    try {
        const collection = loadTemplateCollection();
        collection[templateId] = templateData; // templateData should be { config: {...} }
        saveCollection(TEMPLATE_COLLECTION_KEY, collection);
        console.log(`Template ${templateId} saved.`);
        return true;
    } catch(error) {
         console.error(`Failed to save template ${templateId}`, error);
         return false;
    }
}

function loadTemplate(templateId) {
     if (!templateId) return null;
     const collection = loadTemplateCollection();
     // Add validation for template structure if needed
     if(collection[templateId] && collection[templateId].config) {
          console.log(`Loading template ${templateId}`);
          return collection[templateId];
     } else {
          console.warn(`Template data for ID ${templateId} not found or invalid.`);
          return null;
     }
}

function deleteTemplate(templateId) {
     if (!templateId) return;
     try {
         const collection = loadTemplateCollection();
         if (collection[templateId]) {
             delete collection[templateId];
             saveCollection(TEMPLATE_COLLECTION_KEY, collection);
             console.log(`Template ${templateId} deleted.`);
              if (getActiveTemplateId() === templateId) { // Clear active ID if deleting loaded template
                  clearActiveTemplateId();
             }
         } else {
             console.warn(`Template ${templateId} not found for deletion.`);
         }
     } catch (error) {
          console.error(`Failed to delete template ${templateId}`, error);
          alert(`Kunne ikke slette mal ${templateId}.`);
     }
}
// === 04: TEMPLATE FUNCTIONS END ===


// === 05: ACTIVE ID FUNCTIONS START ===
function setActiveTournamentId(tournamentId) {
    if (tournamentId) {
        localStorage.setItem(ACTIVE_TOURNAMENT_ID_KEY, tournamentId);
        console.log(`Active tournament set to: ${tournamentId}`);
    } else {
        localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY);
        console.log("Active tournament ID cleared.");
    }
}

function getActiveTournamentId() {
    return localStorage.getItem(ACTIVE_TOURNAMENT_ID_KEY);
}

function clearActiveTournamentId() {
    localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY);
    // console.log("Active tournament ID cleared."); // Reduced logging noise
}

function setActiveTemplateId(templateId) { // For passing template to setup
    if (templateId) {
        localStorage.setItem(ACTIVE_TEMPLATE_ID_KEY, templateId);
        console.log(`Active template ID set to: ${templateId}`);
    } else {
        localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY);
    }
}

function getActiveTemplateId() {
    return localStorage.getItem(ACTIVE_TEMPLATE_ID_KEY);
}

function clearActiveTemplateId() {
    localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY);
    // console.log("Active template ID cleared."); // Reduced logging noise
}
// === 05: ACTIVE ID FUNCTIONS END ===


// === 06: CLEAR ALL DATA FUNCTION START ===
function clearAllData() {
     try {
          localStorage.removeItem(TOURNAMENT_COLLECTION_KEY);
          localStorage.removeItem(TEMPLATE_COLLECTION_KEY);
          localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY);
          localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY);
          // Add any other keys used by the app here if they are added later
          console.log("All application data cleared from localStorage.");
     } catch (e) {
          console.error("Error clearing all data from localStorage:", e);
          alert("Kunne ikke slette all lagret data!");
     }
}
// === 06: CLEAR ALL DATA FUNCTION END ===


// === 07: UNIQUE ID GENERATOR SECTION START ===
// Generates a reasonably unique ID using timestamp and random string
function generateUniqueId(prefix = 'id') {
    const timestamp = Date.now().toString(36); // Base 36 timestamp
    const randomPart = Math.random().toString(36).substring(2, 9); // Random string part (7 chars)
    return `${prefix}-${timestamp}-${randomPart}`;
}
// === 07: UNIQUE ID GENERATOR SECTION END ===
