// === 01: CONSTANTS SECTION START ===
const TOURNAMENT_COLLECTION_KEY = 'winjevollTournamentCollection_v1';
const TEMPLATE_COLLECTION_KEY = 'winjevollTemplateCollection_v1';
const ACTIVE_TOURNAMENT_ID_KEY = 'winjevollActiveTournamentId_v1';
const ACTIVE_TEMPLATE_ID_KEY = 'winjevollActiveTemplateId_v1';
const THEME_BG_COLOR_KEY = 'winjevollThemeBgColor_v1';
const THEME_TEXT_COLOR_KEY = 'winjevollThemeTextColor_v1';
const ELEMENT_LAYOUTS_KEY = 'winjevollElementLayouts_v1';
const THEME_FAVORITES_KEY = 'winjevollThemeFavorites_v1';
const SOUND_ENABLED_KEY = 'winjevollSoundEnabled_v1';
const SOUND_VOLUME_KEY = 'winjevollSoundVolume_v1';
// Fjernet: const CUSTOM_LOGO_KEY = 'winjevollCustomLogo_v1';

const DEFAULT_THEME_BG = 'rgb(65, 65, 65)';
const DEFAULT_THEME_TEXT = 'rgb(235, 235, 235)';
const DEFAULT_SOUND_VOLUME = 0.7;

// --- NYTT: IndexedDB Konstanter ---
const DB_NAME = 'winjevollDB_v1';
const DB_VERSION = 1; // Øk denne hvis strukturen endres i fremtiden
const LOGO_STORE_NAME = 'customLogoStore';
const LOGO_KEY = 'userLogo'; // Fast nøkkel for den ene logoen vi lagrer

// Default layout values including visibility
const DEFAULT_ELEMENT_LAYOUTS = {
    canvas: { height: 65 },
    title:  { x: 5,  y: 2,  width: 90, fontSize: 3.5, isVisible: true },
    timer:  { x: 5,  y: 20, width: 55, fontSize: 18,  isVisible: true },
    blinds: { x: 65, y: 40, width: 30, fontSize: 9,   isVisible: true },
    logo:   { x: 65, y: 5,  width: 30, height: 30,  isVisible: true },
    info:   { x: 65, y: 75, width: 30, fontSize: 1.2, isVisible: true,
              showNextBlinds: true, showAvgStack: true, showPlayers: true,
              showLateReg: true, showNextPause: true }
};
// === 01: CONSTANTS SECTION END ===

// === 02: UTILITY FUNCTIONS (Load/Save localStorage) START ===
function loadItem(key) { return localStorage.getItem(key); }
function saveItem(key, value) { try { localStorage.setItem(key, value); } catch(e){ console.error(`Error saving item ${key}:`, e); if (e.name === 'QuotaExceededError') alert(`Lagringsplass full (${key})! Kunne ikke lagre.`); throw e; } }
function loadObject(key, defaultValue = {}) { try { const json = localStorage.getItem(key); if (json) { const parsed = JSON.parse(json); return typeof parsed === 'object' && parsed !== null ? parsed : defaultValue; } return defaultValue; } catch (e) { console.error(`Error loading object ${key}:`, e); localStorage.removeItem(key); return defaultValue; } }
function saveObject(key, object) { try { if (typeof object !== 'object' || object === null) throw new Error("Not an object"); localStorage.setItem(key, JSON.stringify(object)); } catch (e) { console.error(`Error saving object ${key}:`, e); if (e.name === 'QuotaExceededError') alert(`Lagringsplass full (${key})! Kunne ikke lagre objektet.`); else alert(`Ukjent lagringsfeil (${key})!`); throw e; } }
// === 02: UTILITY FUNCTIONS (Load/Save localStorage) END ===

// === 02b: IndexedDB HELPER FUNCTIONS START === // NY SEKSJON
let dbPromise = null; // Holder på promise for DB-tilkobling

function openWinjevollDB() {
    if (dbPromise) {
        return dbPromise; // Returner eksisterende promise hvis det finnes
    }

    dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            console.error("IndexedDB not supported by this browser.");
            reject(new Error("IndexedDB not supported"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            console.log(`Upgrading IndexedDB from version ${event.oldVersion} to ${event.newVersion}`);
            const db = event.target.result;
            if (!db.objectStoreNames.contains(LOGO_STORE_NAME)) {
                db.createObjectStore(LOGO_STORE_NAME);
                console.log(`Object store "${LOGO_STORE_NAME}" created.`);
            }
            // Add other upgrades here if DB_VERSION increases later
        };

        request.onsuccess = (event) => {
            console.log("IndexedDB opened successfully.");
            const db = event.target.result;
            // Viktig: Håndter plutselig lukking (f.eks. i private browsing)
            db.onclose = () => {
                console.warn("IndexedDB connection closed unexpectedly.");
                dbPromise = null; // Reset promise so it reopens on next call
            };
            db.onerror = (closeEvent) => {
                 console.error("IndexedDB database error:", closeEvent.target.error);
                 dbPromise = null; // Reset on error too
            };
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("IndexedDB opening error:", event.target.error);
            dbPromise = null; // Reset promise on error
            reject(event.target.error);
        };

         request.onblocked = () => {
            console.warn("IndexedDB open request blocked, potentially due to an open connection in another tab during upgrade.");
             alert("Kan ikke oppdatere databasen. Lukk andre faner med denne appen og prøv igjen.");
             reject(new Error("IndexedDB blocked"));
         };
    });
    return dbPromise;
}

// Hjelpefunksjon for transaksjoner
async function performIDBOperation(storeName, mode, operation) {
    const db = await openWinjevollDB(); // Få databasetilkobling
    return new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains(storeName)) {
            console.error(`Object store "${storeName}" not found.`);
            return reject(new Error(`Object store "${storeName}" not found.`));
        }
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store); // Utfør den spesifikke operasjonen (get, put, delete)

        request.onsuccess = () => {
            resolve(request.result); // Returner resultatet (f.eks. hentet data)
        };

        request.onerror = () => {
            console.error(`IndexedDB request error in ${storeName} (${mode}):`, request.error);
            reject(request.error);
        };

        transaction.oncomplete = () => {
             // Transaksjon fullført (men request.onsuccess kjører først)
            // console.log(`IndexedDB transaction complete for ${storeName} (${mode})`);
        };

        transaction.onerror = () => {
            console.error(`IndexedDB transaction error in ${storeName} (${mode}):`, transaction.error);
            reject(transaction.error); // Avvis hovedpromiset hvis transaksjonen feiler
        };
    });
}

// NYE LOGO FUNKSJONER (IndexedDB)
async function saveLogoBlob(blob) {
    if (!(blob instanceof Blob)) {
        console.error("Invalid data provided to saveLogoBlob. Expected a Blob.");
        return Promise.reject(new TypeError("Invalid data: Expected a Blob."));
    }
    try {
        await performIDBOperation(LOGO_STORE_NAME, 'readwrite', (store) => store.put(blob, LOGO_KEY));
        console.log("Logo Blob saved to IndexedDB.");
        return true; // Indikerer suksess
    } catch (error) {
        console.error("Failed to save Logo Blob:", error);
        // Sjekk spesifikt for QuotaExceededError hvis mulig (kan være i error.name)
        if (error.name === 'QuotaExceededError') {
             alert("Lagringsplass full! Kunne ikke lagre logoen i databasen.");
        } else {
            alert("En feil oppstod ved lagring av logo i databasen.");
        }
        return false; // Indikerer feil
    }
}

async function loadLogoBlob() {
    try {
        // Henter blob. Resultatet er bloben eller 'undefined' hvis nøkkelen ikke finnes.
        const blob = await performIDBOperation(LOGO_STORE_NAME, 'readonly', (store) => store.get(LOGO_KEY));
        console.log("Logo Blob loaded from IndexedDB:", blob);
        return blob instanceof Blob ? blob : null; // Returner blob eller null
    } catch (error) {
        console.error("Failed to load Logo Blob:", error);
        return null; // Returner null ved feil
    }
}

async function clearLogoBlob() {
    try {
        await performIDBOperation(LOGO_STORE_NAME, 'readwrite', (store) => store.delete(LOGO_KEY));
        console.log("Logo Blob cleared from IndexedDB.");
        return true;
    } catch (error) {
        console.error("Failed to clear Logo Blob:", error);
        alert("En feil oppstod ved fjerning av logo fra databasen.");
        return false;
    }
}
// === 02b: IndexedDB HELPER FUNCTIONS END ===

// === 03: TOURNAMENT FUNCTIONS START ===
function loadTournamentCollection() { return loadObject(TOURNAMENT_COLLECTION_KEY); }
function saveTournamentState(tournamentId, state) { if (!tournamentId || !state?.config || !state.live) { console.error("Invalid data to saveTournamentState."); return false; } try { const collection = loadTournamentCollection(); collection[tournamentId] = state; saveObject(TOURNAMENT_COLLECTION_KEY, collection); console.log(`Tourn ${tournamentId} saved.`); return true; } catch (error) { console.error(`Failed save T ${tournamentId}`, error); return false; } }
function loadTournamentState(tournamentId) { if (!tournamentId) return null; const collection = loadTournamentCollection(); if(collection[tournamentId]?.config && collection[tournamentId].live) { return collection[tournamentId]; } else { console.warn(`T state ${tournamentId} not found/invalid.`); return null; } }
function deleteTournamentState(tournamentId) { if (!tournamentId) return; try { const collection = loadTournamentCollection(); if (collection[tournamentId]) { delete collection[tournamentId]; saveObject(TOURNAMENT_COLLECTION_KEY, collection); console.log(`Tourn ${tournamentId} deleted.`); if (getActiveTournamentId() === tournamentId) { clearActiveTournamentId(); } } } catch (error) { console.error(`Failed delete T ${tournamentId}`, error); alert(`Kunne ikke slette turnering ${tournamentId}.`); } }
// === 03: TOURNAMENT FUNCTIONS END ===

// === 04: TEMPLATE FUNCTIONS START ===
function loadTemplateCollection() { return loadObject(TEMPLATE_COLLECTION_KEY); }
function saveTemplate(templateId, templateData) { if (!templateId || !templateData?.config) { console.error("Invalid data to saveTemplate."); return false; } try { const collection = loadTemplateCollection(); collection[templateId] = templateData; saveObject(TEMPLATE_COLLECTION_KEY, collection); console.log(`Template ${templateId} saved.`); return true; } catch(error) { console.error(`Failed save template ${templateId}`, error); return false; } }
function loadTemplate(templateId) { if (!templateId) return null; const collection = loadTemplateCollection(); if(collection[templateId]?.config) { return collection[templateId]; } else { console.warn(`Template ${templateId} not found/invalid.`); return null; } }
function deleteTemplate(templateId) { if (!templateId) return; try { const collection = loadTemplateCollection(); if (collection[templateId]) { delete collection[templateId]; saveObject(TEMPLATE_COLLECTION_KEY, collection); console.log(`Template ${templateId} deleted.`); if (getActiveTemplateId() === templateId) { clearActiveTemplateId(); } } } catch (error) { console.error(`Failed delete template ${templateId}`, error); alert(`Kunne ikke slette mal ${templateId}.`); } }
// === 04: TEMPLATE FUNCTIONS END ===

// === 05: ACTIVE ID FUNCTIONS START ===
function setActiveTournamentId(tournamentId) { if (tournamentId) saveItem(ACTIVE_TOURNAMENT_ID_KEY, tournamentId); else localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); }
function getActiveTournamentId() { return loadItem(ACTIVE_TOURNAMENT_ID_KEY); }
function clearActiveTournamentId() { localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); }
function setActiveTemplateId(templateId) { if (templateId) saveItem(ACTIVE_TEMPLATE_ID_KEY, templateId); else localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); }
function getActiveTemplateId() { return loadItem(ACTIVE_TEMPLATE_ID_KEY); }
function clearActiveTemplateId() { localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); }
// === 05: ACTIVE ID FUNCTIONS END ===

// === 06: CLEAR ALL DATA FUNCTION START ===
async function clearAllData() { // ENDRET: Gjort async pga. IndexedDB
    try {
        // Clear localStorage items
        localStorage.removeItem(TOURNAMENT_COLLECTION_KEY);
        localStorage.removeItem(TEMPLATE_COLLECTION_KEY);
        localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY);
        localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY);
        localStorage.removeItem(THEME_BG_COLOR_KEY);
        localStorage.removeItem(THEME_TEXT_COLOR_KEY);
        localStorage.removeItem(ELEMENT_LAYOUTS_KEY);
        localStorage.removeItem(THEME_FAVORITES_KEY);
        localStorage.removeItem(SOUND_ENABLED_KEY);
        localStorage.removeItem(SOUND_VOLUME_KEY);
        console.log("localStorage data cleared.");

        // Clear IndexedDB logo store (NYTT)
        await clearLogoBlob(); // Kall den nye funksjonen

        console.log("All app data cleared (localStorage + IndexedDB logo).");
        return true; // Indiker suksess
    } catch (e) {
        console.error("Error clearing all data:", e);
        alert("Kunne ikke slette all lagret data!");
        return false; // Indiker feil
    }
}
// === 06: CLEAR ALL DATA FUNCTION END ===

// === 06b: ACTIVITY LOG HELPER START ===
function logActivity(logArray, message) { if (!logArray) logArray = []; const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit'}); logArray.unshift({ timestamp, message }); const MAX_LOG_ENTRIES = 50; if (logArray.length > MAX_LOG_ENTRIES) logArray.pop(); console.log(`[Log]: ${message}`); }
// === 06b: ACTIVITY LOG HELPER END ===

// === 06c: THEME COLOR FUNCTIONS START ===
function saveThemeBgColor(rgbString) { saveItem(THEME_BG_COLOR_KEY, rgbString); }
function loadThemeBgColor() { return loadItem(THEME_BG_COLOR_KEY) || DEFAULT_THEME_BG; }
function saveThemeTextColor(rgbString) { saveItem(THEME_TEXT_COLOR_KEY, rgbString); }
function loadThemeTextColor() { return loadItem(THEME_TEXT_COLOR_KEY) || DEFAULT_THEME_TEXT; }
function parseRgbString(rgbString) { if (!rgbString || !rgbString.startsWith('rgb')) return [128, 128, 128]; const values = rgbString.substring(4, rgbString.length - 1).split(',').map(v => parseInt(v.trim())); return values.length === 3 ? values : [128, 128, 128]; }
function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h=0, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; default: h=0; } h /= 6; } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; }
function hslToRgb(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c/2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else if (300 <= h && h < 360) { r = c; g = 0; b = x; } r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255); return `rgb(${r}, ${g}, ${b})`; }
// === 06c: THEME COLOR FUNCTIONS END ===

// === 06d: ELEMENT LAYOUT FUNCTIONS START ===
function saveElementLayouts(layoutSettings) { saveObject(ELEMENT_LAYOUTS_KEY, layoutSettings); }
function loadElementLayouts() {
    const loaded = loadObject(ELEMENT_LAYOUTS_KEY);
    const mergedLayouts = {};
    for (const key in DEFAULT_ELEMENT_LAYOUTS) {
        mergedLayouts[key] = { ...DEFAULT_ELEMENT_LAYOUTS[key] };
        if (loaded && loaded[key]) { mergedLayouts[key] = { ...mergedLayouts[key], ...loaded[key] }; }
        mergedLayouts[key].isVisible = mergedLayouts[key].isVisible ?? true;
        if (key === 'info') {
             const defaultInfo = DEFAULT_ELEMENT_LAYOUTS.info;
             mergedLayouts.info.showNextBlinds = mergedLayouts.info.showNextBlinds ?? defaultInfo.showNextBlinds;
             mergedLayouts.info.showAvgStack = mergedLayouts.info.showAvgStack ?? defaultInfo.showAvgStack;
             mergedLayouts.info.showPlayers = mergedLayouts.info.showPlayers ?? defaultInfo.showPlayers;
             mergedLayouts.info.showLateReg = mergedLayouts.info.showLateReg ?? defaultInfo.showLateReg;
             mergedLayouts.info.showNextPause = mergedLayouts.info.showNextPause ?? defaultInfo.showNextPause;
        }
    }
    for (const key in loaded) { if (!mergedLayouts[key]) { mergedLayouts[key] = loaded[key]; mergedLayouts[key].isVisible = mergedLayouts[key].isVisible ?? true; } }
    return mergedLayouts;
}
// === 06d: ELEMENT LAYOUT FUNCTIONS END ===

// === 06e: THEME FAVORITES FUNCTIONS START ===
function loadThemeFavorites() { return loadObject(THEME_FAVORITES_KEY, []); }
function saveThemeFavorites(favoritesArray) { saveObject(THEME_FAVORITES_KEY, favoritesArray); }
function addThemeFavorite(name, bgRgb, textRgb) { const favorites = loadThemeFavorites(); const newFav = { id: generateUniqueId('fav'), name: name || `Favoritt ${favorites.length + 1}`, bg: bgRgb, text: textRgb }; favorites.push(newFav); saveThemeFavorites(favorites); return newFav; }
function deleteThemeFavorite(favoriteId) { let favorites = loadThemeFavorites(); favorites = favorites.filter(fav => fav.id !== favoriteId); saveThemeFavorites(favorites); }
// === 06e: THEME FAVORITES FUNCTIONS END ===

// === 06f: SOUND PREFERENCE FUNCTIONS START ===
function saveSoundPreference(isEnabled) { saveItem(SOUND_ENABLED_KEY, isEnabled ? 'true' : 'false'); console.log(`Sound preference saved: ${isEnabled}`); }
function loadSoundPreference() { const storedValue = loadItem(SOUND_ENABLED_KEY); return storedValue !== 'false'; }
// === 06f: SOUND PREFERENCE FUNCTIONS END ===

// === 06g: SOUND VOLUME FUNCTIONS START ===
function saveSoundVolume(volume) { const clampedVolume = Math.max(0, Math.min(1, parseFloat(volume) || DEFAULT_SOUND_VOLUME)); saveItem(SOUND_VOLUME_KEY, clampedVolume.toString()); console.log(`Sound volume saved: ${clampedVolume}`); }
function loadSoundVolume() { const storedValue = loadItem(SOUND_VOLUME_KEY); const volume = parseFloat(storedValue); return !isNaN(volume) && volume >= 0 && volume <= 1 ? volume : DEFAULT_SOUND_VOLUME; }
// === 06g: SOUND VOLUME FUNCTIONS END ===

// === 06h: CUSTOM LOGO FUNCTIONS (IndexedDB) - ERSTATTET ===
// Fjernet: saveCustomLogoDataUrl, loadCustomLogoDataUrl, clearCustomLogo
// De nye er i seksjon 02b: saveLogoBlob, loadLogoBlob, clearLogoBlob
// === 06h: CUSTOM LOGO FUNCTIONS (IndexedDB) - ERSTATTET ===

// === 07: UNIQUE ID GENERATOR SECTION START ===
function generateUniqueId(prefix = 'id') { const timestamp = Date.now().toString(36); const randomPart = Math.random().toString(36).substring(2, 9); return `${prefix}-${timestamp}-${randomPart}`; }
// === 07: UNIQUE ID GENERATOR SECTION END ===

// === FINAL SCRIPT PARSE CHECK START ===
console.log("storage.js parsed successfully (with IndexedDB support).");
// === FINAL SCRIPT PARSE CHECK END ===
