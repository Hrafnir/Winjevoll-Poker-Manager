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
const DB_NAME = 'winjevollDB_v1';
const DB_VERSION = 1;
const LOGO_STORE_NAME = 'customLogoStore';
const LOGO_KEY = 'userLogo';
const DEFAULT_THEME_BG = 'rgb(65, 65, 65)';
const DEFAULT_THEME_TEXT = 'rgb(235, 235, 235)';
const DEFAULT_SOUND_VOLUME = 0.7;
const DEFAULT_ELEMENT_LAYOUTS = { canvas: { height: 65 }, title:  { x: 5,  y: 2,  width: 90, fontSize: 3.5, isVisible: true }, timer:  { x: 5,  y: 20, width: 55, fontSize: 16,  isVisible: true }, blinds: { x: 65, y: 40, width: 30, fontSize: 8,   isVisible: true }, logo:   { x: 65, y: 5,  width: 30, height: 30,  isVisible: true }, info:   { x: 65, y: 75, width: 30, fontSize: 1.2, isVisible: true, showNextBlinds: true, showAvgStack: true, showPlayers: true, showLateReg: true, showNextPause: true } };
// === 01: CONSTANTS SECTION END ===

// === 02: UTILITY FUNCTIONS (Load/Save localStorage) START ===
// Disse kan eksporteres for generell bruk eller feilsøking
export function loadItem(key) { return localStorage.getItem(key); }
export function saveItem(key, value) { try { localStorage.setItem(key, value); } catch(e){ console.error(`Error saving item ${key}:`, e); if (e.name === 'QuotaExceededError') alert(`Lagringsplass full (${key})! Kunne ikke lagre.`); throw e; } }

// ENDRET: Ekstra robust loadObject med mer logging
export function loadObject(key, defaultValue = {}) {
    console.log(`loadObject: Attempting to load key: "${key}"`);
    let returnValue = defaultValue; // Start med default
    try {
        const json = localStorage.getItem(key);
        console.log(` -> localStorage.getItem("${key}") returned: type=${typeof json}, value=${json}`);

        if (json !== null && json !== undefined && json !== '') {
            console.log(` -> Attempting JSON.parse...`);
            let parsed = null; // Definer utenfor try for å unngå scope-problemer
            try {
                 parsed = JSON.parse(json);
                 console.log(` -> JSON.parse successful. Result type=${typeof parsed}, value=`, parsed);
            } catch (parseError) {
                 console.error(` -> JSON.parse failed for key "${key}":`, parseError);
                 console.warn(` -> Removing potentially corrupt item for key: "${key}"`);
                 localStorage.removeItem(key); // Fjern korrupt data
                 console.log(` -> Returning default value due to parse error.`);
                 return defaultValue; // Returner default umiddelbart ved parse-feil
            }

            // Sjekk om resultatet er et objekt (og ikke null)
            if (typeof parsed === 'object' && parsed !== null) {
                console.log(` -> Parsed value is a valid object. Returning it.`);
                returnValue = parsed;
            } else {
                console.warn(` -> Parsed value for key "${key}" is not a valid object (type: ${typeof parsed}). Returning default value.`);
                // Vurder å fjerne ugyldig, men parse-bar data? Kan være farlig hvis f.eks. en streng var lagret med vilje.
                // localStorage.removeItem(key);
                returnValue = defaultValue;
            }
        } else {
            console.log(` -> JSON string from localStorage is null, undefined, or empty. Returning default value.`);
            returnValue = defaultValue;
        }
    } catch (e) { // Fanger opp feil i localStorage.getItem eller andre uventede feil
        console.error(`Unexpected error in loadObject for key "${key}":`, e);
        returnValue = defaultValue;
    }
    // Sikre at vi *alltid* returnerer et objekt hvis defaultValue er et objekt
    if (typeof defaultValue === 'object' && defaultValue !== null) {
        if (typeof returnValue !== 'object' || returnValue === null) {
            console.warn(`loadObject for key "${key}" resulted in non-object (${typeof returnValue}). Forcing return of default object.`);
            return defaultValue; // Returner ALLTID default hvis vi forventet et objekt men ikke fikk det
        }
    }
    console.log(`loadObject for key "${key}" final return value:`, returnValue);
    return returnValue;
}

export function saveObject(key, object) { try { if (typeof object !== 'object' || object === null) throw new Error("Not an object"); localStorage.setItem(key, JSON.stringify(object)); } catch (e) { console.error(`Error saving object ${key}:`, e); if (e.name === 'QuotaExceededError') alert(`Lagringsplass full (${key})! Kunne ikke lagre objektet.`); else alert(`Ukjent lagringsfeil (${key})!`); throw e; } }
// === 02: UTILITY FUNCTIONS (Load/Save localStorage) END ===

// === 02b: IndexedDB HELPER FUNCTIONS START ===
let dbPromise = null;
function openWinjevollDB() { if (dbPromise) { return dbPromise; } dbPromise = new Promise((resolve, reject) => { if (!window.indexedDB) { console.error("IndexedDB not supported"); return reject(new Error("IndexedDB not supported")); } const request = indexedDB.open(DB_NAME, DB_VERSION); request.onupgradeneeded = (event) => { const db = event.target.result; if (!db.objectStoreNames.contains(LOGO_STORE_NAME)) { db.createObjectStore(LOGO_STORE_NAME); } }; request.onsuccess = (event) => { const db = event.target.result; db.onclose = () => { dbPromise = null; }; db.onerror = (e) => { console.error("IDB DB error:", e.target.error); dbPromise = null; }; resolve(db); }; request.onerror = (event) => { console.error("IDB opening error:", event.target.error); dbPromise = null; reject(event.target.error); }; request.onblocked = () => { console.warn("IDB blocked."); reject(new Error("IndexedDB blocked")); }; }); return dbPromise; }
async function performIDBOperation(storeName, mode, operation) { const db = await openWinjevollDB(); return new Promise((resolve, reject) => { if (!db.objectStoreNames.contains(storeName)) { return reject(new Error(`Object store "${storeName}" not found.`)); } let transaction; try { transaction = db.transaction(storeName, mode); } catch (e) { return reject(e); } const store = transaction.objectStore(storeName); const request = operation(store); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); transaction.onerror = () => reject(transaction.error); }); }
export async function saveLogoBlob(blob) { if (!(blob instanceof Blob)) return Promise.reject(new TypeError("Expected Blob.")); try { await performIDBOperation(LOGO_STORE_NAME, 'readwrite', (store) => store.put(blob, LOGO_KEY)); return true; } catch (error) { console.error("Failed save Logo Blob:", error); if (error.name === 'QuotaExceededError') alert("Lagringsplass full!"); else alert("Feil ved lagring av logo."); return false; } }
export async function loadLogoBlob() { try { const blob = await performIDBOperation(LOGO_STORE_NAME, 'readonly', (store) => store.get(LOGO_KEY)); return blob instanceof Blob ? blob : null; } catch (error) { console.error("Failed load Logo Blob:", error); return null; } }
export async function clearLogoBlob() { try { await performIDBOperation(LOGO_STORE_NAME, 'readwrite', (store) => store.delete(LOGO_KEY)); return true; } catch (error) { console.error("Failed clear Logo Blob:", error); alert("Feil ved fjerning av logo."); return false; } }
// === 02b: IndexedDB HELPER FUNCTIONS END ===

// === 03: TOURNAMENT FUNCTIONS START ===
export function loadTournamentCollection() { return loadObject(TOURNAMENT_COLLECTION_KEY); }
export function saveTournamentState(tournamentId, state) { if (!tournamentId || !state?.config || !state.live) { console.error("Invalid data to saveTournamentState."); return false; } try { const collection = loadTournamentCollection(); collection[tournamentId] = state; saveObject(TOURNAMENT_COLLECTION_KEY, collection); /* console.log(`Tourn ${tournamentId} saved.`); */ return true; } catch (error) { console.error(`Failed save T ${tournamentId}`, error); return false; } }
export function loadTournamentState(tournamentId) { if (!tournamentId) return null; const collection = loadTournamentCollection(); if(collection[tournamentId]?.config && collection[tournamentId].live) { return collection[tournamentId]; } else { console.warn(`T state ${tournamentId} not found/invalid.`); return null; } }
export function deleteTournamentState(tournamentId) { if (!tournamentId) return; try { const collection = loadTournamentCollection(); if (collection[tournamentId]) { delete collection[tournamentId]; saveObject(TOURNAMENT_COLLECTION_KEY, collection); console.log(`Tourn ${tournamentId} deleted.`); if (getActiveTournamentId() === tournamentId) { clearActiveTournamentId(); } } } catch (error) { console.error(`Failed delete T ${tournamentId}`, error); alert(`Kunne ikke slette turnering ${tournamentId}.`); } }
// === 03: TOURNAMENT FUNCTIONS END ===

// === 04: TEMPLATE FUNCTIONS START ===
export function loadTemplateCollection() { return loadObject(TEMPLATE_COLLECTION_KEY); } // Bruker loadObject
export function saveTemplate(templateId, templateData) { if (!templateId || !templateData?.config) { console.error("Invalid data to saveTemplate."); return false; } try { const collection = loadTemplateCollection(); collection[templateId] = templateData; saveObject(TEMPLATE_COLLECTION_KEY, collection); console.log(`Template ${templateId} saved.`); return true; } catch(error) { console.error(`Failed save template ${templateId}`, error); return false; } }
export function loadTemplate(templateId) { if (!templateId) return null; const collection = loadTemplateCollection(); if(collection[templateId]?.config) { return collection[templateId]; } else { console.warn(`Template ${templateId} not found/invalid.`); return null; } }
export function deleteTemplate(templateId) { if (!templateId) return; try { const collection = loadTemplateCollection(); if (collection[templateId]) { delete collection[templateId]; saveObject(TEMPLATE_COLLECTION_KEY, collection); console.log(`Template ${templateId} deleted.`); if (getActiveTemplateId() === templateId) { clearActiveTemplateId(); } } } catch (error) { console.error(`Failed delete template ${templateId}`, error); alert(`Kunne ikke slette mal ${templateId}.`); } }
// === 04: TEMPLATE FUNCTIONS END ===

// === 05: ACTIVE ID FUNCTIONS START ===
export function setActiveTournamentId(tournamentId) { if (tournamentId) saveItem(ACTIVE_TOURNAMENT_ID_KEY, tournamentId); else localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); }
export function getActiveTournamentId() { return loadItem(ACTIVE_TOURNAMENT_ID_KEY); }
export function clearActiveTournamentId() { localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); }
export function setActiveTemplateId(templateId) { if (templateId) saveItem(ACTIVE_TEMPLATE_ID_KEY, templateId); else localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); }
export function getActiveTemplateId() { return loadItem(ACTIVE_TEMPLATE_ID_KEY); }
export function clearActiveTemplateId() { localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); }
// === 05: ACTIVE ID FUNCTIONS END ===

// === 06: CLEAR ALL DATA FUNCTION START ===
export async function clearAllData() { try { localStorage.removeItem(TOURNAMENT_COLLECTION_KEY); localStorage.removeItem(TEMPLATE_COLLECTION_KEY); localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); localStorage.removeItem(THEME_BG_COLOR_KEY); localStorage.removeItem(THEME_TEXT_COLOR_KEY); localStorage.removeItem(ELEMENT_LAYOUTS_KEY); localStorage.removeItem(THEME_FAVORITES_KEY); localStorage.removeItem(SOUND_ENABLED_KEY); localStorage.removeItem(SOUND_VOLUME_KEY); console.log("localStorage data cleared."); await clearLogoBlob(); console.log("All app data cleared."); return true; } catch (e) { console.error("Error clearing all data:", e); alert("Kunne ikke slette all lagret data!"); return false; } }
// === 06: CLEAR ALL DATA FUNCTION END ===

// === 06c: THEME COLOR FUNCTIONS START ===
export function saveThemeBgColor(rgbString) { saveItem(THEME_BG_COLOR_KEY, rgbString); }
export function loadThemeBgColor() { return loadItem(THEME_BG_COLOR_KEY) || DEFAULT_THEME_BG; }
export function saveThemeTextColor(rgbString) { saveItem(THEME_TEXT_COLOR_KEY, rgbString); }
export function loadThemeTextColor() { return loadItem(THEME_TEXT_COLOR_KEY) || DEFAULT_THEME_TEXT; }
export function parseRgbString(rgbString) { if (!rgbString || !rgbString.startsWith('rgb')) return [128, 128, 128]; const values = rgbString.substring(4, rgbString.length - 1).split(',').map(v => parseInt(v.trim())); return values.length === 3 ? values : [128, 128, 128]; }
export function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h=0, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; default: h=0; } h /= 6; } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; }
export function hslToRgb(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c/2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else if (300 <= h && h < 360) { r = c; g = 0; b = x; } r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255); return `rgb(${r}, ${g}, ${b})`; }
// === 06c: THEME COLOR FUNCTIONS END ===

// === 06d: ELEMENT LAYOUT FUNCTIONS START ===
export function saveElementLayouts(layoutSettings) { saveObject(ELEMENT_LAYOUTS_KEY, layoutSettings); }
export function loadElementLayouts() { return loadObject(ELEMENT_LAYOUTS_KEY, DEFAULT_ELEMENT_LAYOUTS); } // Bruker loadObject, sender med default
// === 06d: ELEMENT LAYOUT FUNCTIONS END ===

// === 06e: THEME FAVORITES FUNCTIONS START ===
export function loadThemeFavorites() { return loadObject(THEME_FAVORITES_KEY, []); } // Bruker loadObject
export function saveThemeFavorites(favoritesArray) { saveObject(THEME_FAVORITES_KEY, favoritesArray); }
export function addThemeFavorite(name, bgRgb, textRgb) { const favorites = loadThemeFavorites(); const newFav = { id: generateUniqueId('fav'), name: name || `Favoritt ${favorites.length + 1}`, bg: bgRgb, text: textRgb }; favorites.push(newFav); saveThemeFavorites(favorites); return newFav; }
export function deleteThemeFavorite(favoriteId) { let favorites = loadThemeFavorites(); favorites = favorites.filter(fav => fav.id !== favoriteId); saveThemeFavorites(favorites); }
// === 06e: THEME FAVORITES FUNCTIONS END ===

// === 06f: SOUND PREFERENCE FUNCTIONS START ===
export function saveSoundPreference(isEnabled) { saveItem(SOUND_ENABLED_KEY, isEnabled ? 'true' : 'false'); console.log(`Sound preference saved: ${isEnabled}`); }
export function loadSoundPreference() { const storedValue = loadItem(SOUND_ENABLED_KEY); return storedValue !== 'false'; }
// === 06f: SOUND PREFERENCE FUNCTIONS END ===

// === 06g: SOUND VOLUME FUNCTIONS START ===
export function saveSoundVolume(volume) { const clampedVolume = Math.max(0, Math.min(1, parseFloat(volume) || DEFAULT_SOUND_VOLUME)); saveItem(SOUND_VOLUME_KEY, clampedVolume.toString()); console.log(`Sound volume saved: ${clampedVolume}`); }
export function loadSoundVolume() { const storedValue = loadItem(SOUND_VOLUME_KEY); const volume = parseFloat(storedValue); return !isNaN(volume) && volume >= 0 && volume <= 1 ? volume : DEFAULT_SOUND_VOLUME; }
// === 06g: SOUND VOLUME FUNCTIONS END ===

// === 07: UNIQUE ID GENERATOR SECTION START ===
export function generateUniqueId(prefix = 'id') { const timestamp = Date.now(); const randomPart = Math.random().toString().substring(2, 15); const newId = `${prefix}-${timestamp}-${randomPart}`; console.log("Generated ID:", newId); return newId; }
// === 07: UNIQUE ID GENERATOR SECTION END ===

// === FINAL SCRIPT PARSE CHECK START ===
console.log("storage.js parsed successfully (with IndexedDB support and explicit exports).");
// === FINAL SCRIPT PARSE CHECK END ===
