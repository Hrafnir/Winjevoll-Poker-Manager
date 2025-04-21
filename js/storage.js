// === 01: CONSTANTS SECTION START ===
const TOURNAMENT_COLLECTION_KEY = 'winjevollTournamentCollection_v1';
const TEMPLATE_COLLECTION_KEY = 'winjevollTemplateCollection_v1';
const ACTIVE_TOURNAMENT_ID_KEY = 'winjevollActiveTournamentId_v1';
const ACTIVE_TEMPLATE_ID_KEY = 'winjevollActiveTemplateId_v1';
const THEME_BG_COLOR_KEY = 'winjevollThemeBgColor_v1';
const THEME_TEXT_COLOR_KEY = 'winjevollThemeTextColor_v1';
const ELEMENT_LAYOUTS_KEY = 'winjevollElementLayouts_v1'; // NEW for element pos/size
const THEME_FAVORITES_KEY = 'winjevollThemeFavorites_v1'; // NEW for favorites

const DEFAULT_THEME_BG = 'rgb(65, 65, 65)';
const DEFAULT_THEME_TEXT = 'rgb(235, 235, 235)';
// *** ADJUSTED DEFAULT LAYOUT VALUES ***
const DEFAULT_ELEMENT_LAYOUTS = {
    timer:  { x: 5,  y: 5,  width: 55, fontSize: 15 }, // Larger font, takes more width
    blinds: { x: 65, y: 40, width: 30, fontSize: 7 },  // Adjusted position/size
    logo:   { x: 65, y: 5,  width: 30, height: 25 },   // Smaller height, adjusted pos
    info:   { x: 65, y: 75, width: 30, fontSize: 1.1 } // Adjusted position
};
// === 01: CONSTANTS SECTION END ===

// === 02: UTILITY FUNCTIONS (Load/Save Collections/Items) START ===
function loadItem(key) { return localStorage.getItem(key); }
function saveItem(key, value) { try { localStorage.setItem(key, value); } catch(e){ console.error(`Error saving item ${key}:`, e); }}
function loadObject(key, defaultValue = {}) { try { const json = localStorage.getItem(key); if (json) { const parsed = JSON.parse(json); return typeof parsed === 'object' && parsed !== null ? parsed : defaultValue; } return defaultValue; } catch (e) { console.error(`Error loading object ${key}:`, e); localStorage.removeItem(key); return defaultValue; } }
function saveObject(key, object) { try { if (typeof object !== 'object' || object === null) throw new Error("Not an object"); localStorage.setItem(key, JSON.stringify(object)); } catch (e) { console.error(`Error saving object ${key}:`, e); if (e.name === 'QuotaExceededError') alert(`Lagringsplass full (${key})!`); else alert(`Ukjent lagringsfeil (${key})!`); throw e; } }
// === 02: UTILITY FUNCTIONS (Load/Save Collections/Items) END ===

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
function clearAllData() { try { localStorage.removeItem(TOURNAMENT_COLLECTION_KEY); localStorage.removeItem(TEMPLATE_COLLECTION_KEY); localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); localStorage.removeItem(THEME_BG_COLOR_KEY); localStorage.removeItem(THEME_TEXT_COLOR_KEY); localStorage.removeItem(ELEMENT_LAYOUTS_KEY); /* Use new key */ localStorage.removeItem(THEME_FAVORITES_KEY); console.log("All app data cleared."); } catch (e) { console.error("Error clearing all data:", e); alert("Kunne ikke slette all lagret data!"); } }
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

// === 06d: ELEMENT LAYOUT FUNCTIONS (NEW) START ===
function saveElementLayouts(layoutSettings) { saveObject(ELEMENT_LAYOUTS_KEY, layoutSettings); }
function loadElementLayouts() {
    const loaded = loadObject(ELEMENT_LAYOUTS_KEY);
    // Merge with defaults to ensure all elements have settings and handle potential missing keys
    const mergedLayouts = {};
    for (const key in DEFAULT_ELEMENT_LAYOUTS) {
        mergedLayouts[key] = { ...DEFAULT_ELEMENT_LAYOUTS[key], ...(loaded[key] || {}) };
    }
    return mergedLayouts;
}
// === 06d: ELEMENT LAYOUT FUNCTIONS (NEW) END ===

// === 06e: THEME FAVORITES FUNCTIONS START ===
function loadThemeFavorites() { return loadObject(THEME_FAVORITES_KEY, []); }
function saveThemeFavorites(favoritesArray) { saveObject(THEME_FAVORITES_KEY, favoritesArray); }
function addThemeFavorite(name, bgRgb, textRgb) { const favorites = loadThemeFavorites(); const newFav = { id: generateUniqueId('fav'), name: name || `Favoritt ${favorites.length + 1}`, bg: bgRgb, text: textRgb }; favorites.push(newFav); saveThemeFavorites(favorites); return newFav; }
function deleteThemeFavorite(favoriteId) { let favorites = loadThemeFavorites(); favorites = favorites.filter(fav => fav.id !== favoriteId); saveThemeFavorites(favorites); }
// === 06e: THEME FAVORITES FUNCTIONS END ===

// === 07: UNIQUE ID GENERATOR SECTION START ===
function generateUniqueId(prefix = 'id') { const timestamp = Date.now().toString(36); const randomPart = Math.random().toString(36).substring(2, 9); return `${prefix}-${timestamp}-${randomPart}`; }
// === 07: UNIQUE ID GENERATOR SECTION END ===

// === FINAL SCRIPT PARSE CHECK START ===
console.log("storage.js parsed successfully.");
// === FINAL SCRIPT PARSE CHECK END ===
