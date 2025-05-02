// === 01: CONSTANTS SECTION START ===
const TOURNAMENT_COLLECTION_KEY = 'winjevollTournamentCollection_v1'; const TEMPLATE_COLLECTION_KEY = 'winjevollTemplateCollection_v1'; const ACTIVE_TOURNAMENT_ID_KEY = 'winjevollActiveTournamentId_v1'; const ACTIVE_TEMPLATE_ID_KEY = 'winjevollActiveTemplateId_v1'; const THEME_BG_COLOR_KEY = 'winjevollThemeBgColor_v1'; const THEME_TEXT_COLOR_KEY = 'winjevollThemeTextColor_v1'; const ELEMENT_LAYOUTS_KEY = 'winjevollElementLayouts_v1'; const THEME_FAVORITES_KEY = 'winjevollThemeFavorites_v1'; const SOUND_ENABLED_KEY = 'winjevollSoundEnabled_v1'; const SOUND_VOLUME_KEY = 'winjevollSoundVolume_v1';
const DB_NAME = 'winjevollDB_v1'; const DB_VERSION = 1; const LOGO_STORE_NAME = 'customLogoStore'; const LOGO_KEY = 'userLogo';
const DEFAULT_THEME_BG = 'rgb(65, 65, 65)'; const DEFAULT_THEME_TEXT = 'rgb(235, 235, 235)'; const DEFAULT_SOUND_VOLUME = 0.7;
const DEFAULT_ELEMENT_LAYOUTS = { canvas: { height: 65 }, title:  { x: 5,  y: 2,  width: 90, fontSize: 3.5, isVisible: true }, timer:  { x: 5,  y: 20, width: 55, fontSize: 16,  isVisible: true }, blinds: { x: 65, y: 40, width: 30, fontSize: 8,   isVisible: true }, logo:   { x: 65, y: 5,  width: 30, height: 30,  isVisible: true }, info:   { x: 65, y: 75, width: 30, fontSize: 1.2, isVisible: true, showNextBlinds: true, showAvgStack: true, showPlayers: true, showLateReg: true, showNextPause: true } };
// === 01: CONSTANTS SECTION END ===

// === 02: UTILITY FUNCTIONS (Load/Save localStorage) START ===
export function loadItem(key) { return localStorage.getItem(key); }
export function saveItem(key, value) { try { localStorage.setItem(key, value); } catch(e){ console.error(`Error saving item ${key}:`, e); if (e.name === 'QuotaExceededError') alert(`Lagringsplass full (${key})! Kunne ikke lagre.`); throw e; } }
export function loadObject(key, defaultValue = {}) { try { const json = localStorage.getItem(key); if (json) { const parsed = JSON.parse(json); return typeof parsed === 'object' && parsed !== null ? parsed : defaultValue; } return defaultValue; } catch (e) { console.error(`Error loading object ${key}:`, e); localStorage.removeItem(key); return defaultValue; } }
export function saveObject(key, object) { try { if (typeof object !== 'object' || object === null) throw new Error("Not an object"); localStorage.setItem(key, JSON.stringify(object)); } catch (e) { console.error(`Error saving object ${key}:`, e); if (e.name === 'QuotaExceededError') alert(`Lagringsplass full (${key})! Kunne ikke lagre objektet.`); else alert(`Ukjent lagringsfeil (${key})!`); throw e; } }
// === 02: UTILITY FUNCTIONS (Load/Save localStorage) END ===

// === 02b: IndexedDB HELPER FUNCTIONS START ===
let dbPromise = null;
function openWinjevollDB() {
    if (dbPromise) { console.log("openWinjevollDB: Returning existing promise."); return dbPromise; }
    console.log("openWinjevollDB: Creating new promise.");
    dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) { console.error("IndexedDB not supported"); return reject(new Error("IndexedDB not supported")); }
        console.log(`openWinjevollDB: Opening DB ${DB_NAME} version ${DB_VERSION}`);
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => { console.log(`openWinjevollDB: onupgradeneeded from ${event.oldVersion} to ${event.newVersion}`); const db = event.target.result; if (!db.objectStoreNames.contains(LOGO_STORE_NAME)) { db.createObjectStore(LOGO_STORE_NAME); console.log(`Object store "${LOGO_STORE_NAME}" created.`); } };
        request.onsuccess = (event) => { console.log("openWinjevollDB: onsuccess - DB opened."); const db = event.target.result; db.onclose = () => { console.warn("IndexedDB connection closed."); dbPromise = null; }; db.onerror = (closeEvent) => { console.error("IndexedDB DB error:", closeEvent.target.error); dbPromise = null; }; resolve(db); };
        request.onerror = (event) => { console.error("openWinjevollDB: onerror - Failed to open DB:", event.target.error); dbPromise = null; reject(event.target.error); };
        request.onblocked = () => { console.warn("openWinjevollDB: onblocked."); alert("Kan ikke oppdatere databasen. Lukk andre faner."); reject(new Error("IndexedDB blocked")); };
    });
    return dbPromise;
}
async function performIDBOperation(storeName, mode, operation) {
    console.log(`performIDBOperation: Getting DB for ${storeName} (${mode})...`);
    let db;
    try {
        db = await openWinjevollDB();
        console.log(`performIDBOperation: DB obtained. Starting transaction...`);
    } catch (dbError) {
         console.error(`performIDBOperation: Failed to open DB:`, dbError);
         throw dbError; // Kast feilen videre
    }

    return new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains(storeName)) { console.error(`Object store "${storeName}" not found.`); return reject(new Error(`Object store "${storeName}" not found.`)); }
        let transaction;
        try {
             transaction = db.transaction(storeName, mode);
             console.log(`performIDBOperation: Transaction started for ${storeName} (${mode}).`);
        } catch (transError) {
            console.error(`performIDBOperation: Failed to start transaction:`, transError);
            return reject(transError);
        }
        const store = transaction.objectStore(storeName);
        console.log(`performIDBOperation: Got object store ${storeName}. Performing operation...`);
        const request = operation(store);

        request.onsuccess = () => { console.log(`performIDBOperation: request.onsuccess for ${storeName} (${mode}). Result:`, request.result); resolve(request.result); };
        request.onerror = () => { console.error(`performIDBOperation: request.onerror in ${storeName} (${mode}):`, request.error); reject(request.error); };
        transaction.oncomplete = () => { /* console.log(`performIDBOperation: transaction.oncomplete for ${storeName} (${mode})`); */ };
        transaction.onerror = () => { console.error(`performIDBOperation: transaction.onerror in ${storeName} (${mode}):`, transaction.error); reject(transaction.error); };
    });
}
export async function saveLogoBlob(blob) { console.log("saveLogoBlob: Attempting to save blob:", blob); if (!(blob instanceof Blob)) { console.error("Invalid data: Expected Blob."); return Promise.reject(new TypeError("Expected Blob.")); } try { await performIDBOperation(LOGO_STORE_NAME, 'readwrite', (store) => store.put(blob, LOGO_KEY)); console.log("Logo Blob saved successfully."); return true; } catch (error) { console.error("Failed save Logo Blob:", error); if (error.name === 'QuotaExceededError') { alert("Lagringsplass full!"); } else { alert("Feil ved lagring av logo."); } return false; } }
export async function loadLogoBlob() { console.log("loadLogoBlob: Attempting to load logo..."); try { const blob = await performIDBOperation(LOGO_STORE_NAME, 'readonly', (store) => store.get(LOGO_KEY)); console.log("loadLogoBlob: Operation complete. Result:", blob); return blob instanceof Blob ? blob : null; } catch (error) { console.error("Failed load Logo Blob:", error); return null; } }
export async function clearLogoBlob() { console.log("clearLogoBlob: Attempting to clear logo..."); try { await performIDBOperation(LOGO_STORE_NAME, 'readwrite', (store) => store.delete(LOGO_KEY)); console.log("Logo Blob cleared successfully."); return true; } catch (error) { console.error("Failed clear Logo Blob:", error); alert("Feil ved fjerning av logo."); return false; } }
// === 02b: IndexedDB HELPER FUNCTIONS END ===

// === 03: TOURNAMENT FUNCTIONS START ===
export function loadTournamentCollection() { return loadObject(TOURNAMENT_COLLECTION_KEY); }
export function saveTournamentState(tournamentId, state) { /* ... (som før) ... */ }
export function loadTournamentState(tournamentId) { /* ... (som før) ... */ }
export function deleteTournamentState(tournamentId) { /* ... (som før) ... */ }
// === 03: TOURNAMENT FUNCTIONS END ===

// === 04: TEMPLATE FUNCTIONS START ===
export function loadTemplateCollection() { /* ... (som før) ... */ }
export function saveTemplate(templateId, templateData) { /* ... (som før) ... */ }
export function loadTemplate(templateId) { /* ... (som før) ... */ }
export function deleteTemplate(templateId) { /* ... (som før) ... */ }
// === 04: TEMPLATE FUNCTIONS END ===

// === 05: ACTIVE ID FUNCTIONS START ===
export function setActiveTournamentId(tournamentId) { /* ... (som før) ... */ }
export function getActiveTournamentId() { /* ... (som før) ... */ }
export function clearActiveTournamentId() { /* ... (som før) ... */ }
export function setActiveTemplateId(templateId) { /* ... (som før) ... */ }
export function getActiveTemplateId() { /* ... (som før) ... */ }
export function clearActiveTemplateId() { /* ... (som før) ... */ }
// === 05: ACTIVE ID FUNCTIONS END ===

// === 06: CLEAR ALL DATA FUNCTION START ===
export async function clearAllData() { /* ... (som før) ... */ }
// === 06: CLEAR ALL DATA FUNCTION END ===

// === 06c: THEME COLOR FUNCTIONS START ===
export function saveThemeBgColor(rgbString) { /* ... */ } export function loadThemeBgColor() { /* ... */ } export function saveThemeTextColor(rgbString) { /* ... */ } export function loadThemeTextColor() { /* ... */ } export function parseRgbString(rgbString) { /* ... */ } export function rgbToHsl(r, g, b) { /* ... */ } export function hslToRgb(h, s, l) { /* ... */ }
// === 06c: THEME COLOR FUNCTIONS END ===

// === 06d: ELEMENT LAYOUT FUNCTIONS START ===
export function saveElementLayouts(layoutSettings) { /* ... */ } export function loadElementLayouts() { /* ... */ }
// === 06d: ELEMENT LAYOUT FUNCTIONS END ===

// === 06e: THEME FAVORITES FUNCTIONS START ===
export function loadThemeFavorites() { /* ... */ } export function saveThemeFavorites(favoritesArray) { /* ... */ } export function addThemeFavorite(name, bgRgb, textRgb) { /* ... */ } export function deleteThemeFavorite(favoriteId) { /* ... */ }
// === 06e: THEME FAVORITES FUNCTIONS END ===

// === 06f: SOUND PREFERENCE FUNCTIONS START ===
export function saveSoundPreference(isEnabled) { /* ... */ } export function loadSoundPreference() { /* ... */ }
// === 06f: SOUND PREFERENCE FUNCTIONS END ===

// === 06g: SOUND VOLUME FUNCTIONS START ===
export function saveSoundVolume(volume) { /* ... */ } export function loadSoundVolume() { /* ... */ }
// === 06g: SOUND VOLUME FUNCTIONS END ===

// === 07: UNIQUE ID GENERATOR SECTION START ===
export function generateUniqueId(prefix = 'id') { /* ... */ }
// === 07: UNIQUE ID GENERATOR SECTION END ===

// === FINAL SCRIPT PARSE CHECK START ===
console.log("storage.js parsed successfully (with IndexedDB support and explicit exports).");
// === FINAL SCRIPT PARSE CHECK END ===
