// === 01: CONSTANTS SECTION START ===
const TOURNAMENT_COLLECTION_KEY = 'winjevollTournamentCollection_v1';
const TEMPLATE_COLLECTION_KEY = 'winjevollTemplateCollection_v1';
const ACTIVE_TOURNAMENT_ID_KEY = 'winjevollActiveTournamentId_v1';
const ACTIVE_TEMPLATE_ID_KEY = 'winjevollActiveTemplateId_v1';
const THEME_BG_COLOR_KEY = 'winjevollThemeBgColor_v1';
const THEME_TEXT_COLOR_KEY = 'winjevollThemeTextColor_v1';
const LOGO_LAYOUT_KEY = 'winjevollLogoLayout_v1';
const DEFAULT_THEME_BG = 'rgb(56, 56, 56)';
const DEFAULT_THEME_TEXT = 'rgb(240, 240, 240)';
const DEFAULT_LOGO_LAYOUT = { sizePercent: 90, positionPercent: 50 };
// === 01: CONSTANTS SECTION END ===

// === 02: UTILITY FUNCTIONS (Load/Save Collections) START ===
function loadCollection(key) { try { const cJ = localStorage.getItem(key); if (cJ) { const c = JSON.parse(cJ); if (typeof c === 'object' && c !== null) { return c; } else { console.warn(`Data for key "${key}" invalid. Clearing.`); localStorage.removeItem(key); return {}; } } return {}; } catch (e) { console.error(`Error loading ${key}:`, e); localStorage.removeItem(key); return {}; } }
function saveCollection(key, collection) { try { if (typeof collection !== 'object' || collection === null) { throw new Error("Attempted to save non-object as collection."); } localStorage.setItem(key, JSON.stringify(collection)); } catch (e) { console.error(`Error saving ${key}:`, e); if (e.name === 'QuotaExceededError') { alert(`Lagringsplass full (${key})!`); } else { alert(`Ukjent lagringsfeil (${key})!`); } throw e; } }
// === 02: UTILITY FUNCTIONS (Load/Save Collections) END ===

// === 03: TOURNAMENT FUNCTIONS START ===
function loadTournamentCollection() { return loadCollection(TOURNAMENT_COLLECTION_KEY); }
function saveTournamentState(tournamentId, state) { if (!tournamentId || !state?.config || !state.live) { console.error("Invalid data to saveTournamentState."); return false; } try { const collection = loadTournamentCollection(); collection[tournamentId] = state; saveCollection(TOURNAMENT_COLLECTION_KEY, collection); console.log(`Tourn ${tournamentId} saved.`); return true; } catch (error) { console.error(`Failed save T ${tournamentId}`, error); return false; } }
function loadTournamentState(tournamentId) { if (!tournamentId) return null; const collection = loadTournamentCollection(); if(collection[tournamentId]?.config && collection[tournamentId].live) { console.log(`Loading T ${tournamentId}`); return collection[tournamentId]; } else { console.warn(`T state ${tournamentId} not found/invalid.`); return null; } }
function deleteTournamentState(tournamentId) { if (!tournamentId) return; try { const collection = loadTournamentCollection(); if (collection[tournamentId]) { delete collection[tournamentId]; saveCollection(TOURNAMENT_COLLECTION_KEY, collection); console.log(`Tourn ${tournamentId} deleted.`); if (getActiveTournamentId() === tournamentId) { clearActiveTournamentId(); } } else { console.warn(`Tourn ${tournamentId} not found deletion.`); } } catch (error) { console.error(`Failed delete T ${tournamentId}`, error); alert(`Kunne ikke slette turnering ${tournamentId}.`); } }
// === 03: TOURNAMENT FUNCTIONS END ===

// === 04: TEMPLATE FUNCTIONS START ===
function loadTemplateCollection() { return loadCollection(TEMPLATE_COLLECTION_KEY); }
function saveTemplate(templateId, templateData) { if (!templateId || !templateData?.config) { console.error("Invalid data to saveTemplate."); return false; } try { const collection = loadTemplateCollection(); collection[templateId] = templateData; saveCollection(TEMPLATE_COLLECTION_KEY, collection); console.log(`Template ${templateId} saved.`); return true; } catch(error) { console.error(`Failed save template ${templateId}`, error); return false; } }
function loadTemplate(templateId) { if (!templateId) return null; const collection = loadTemplateCollection(); if(collection[templateId]?.config) { console.log(`Loading template ${templateId}`); return collection[templateId]; } else { console.warn(`Template ${templateId} not found/invalid.`); return null; } }
function deleteTemplate(templateId) { if (!templateId) return; try { const collection = loadTemplateCollection(); if (collection[templateId]) { delete collection[templateId]; saveCollection(TEMPLATE_COLLECTION_KEY, collection); console.log(`Template ${templateId} deleted.`); if (getActiveTemplateId() === templateId) { clearActiveTemplateId(); } } else { console.warn(`Template ${templateId} not found deletion.`); } } catch (error) { console.error(`Failed delete template ${templateId}`, error); alert(`Kunne ikke slette mal ${templateId}.`); } }
// === 04: TEMPLATE FUNCTIONS END ===

// === 05: ACTIVE ID FUNCTIONS START ===
function setActiveTournamentId(tournamentId) { if (tournamentId) localStorage.setItem(ACTIVE_TOURNAMENT_ID_KEY, tournamentId); else localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); }
function getActiveTournamentId() { return localStorage.getItem(ACTIVE_TOURNAMENT_ID_KEY); }
function clearActiveTournamentId() { localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); }
function setActiveTemplateId(templateId) { if (templateId) localStorage.setItem(ACTIVE_TEMPLATE_ID_KEY, templateId); else localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); }
function getActiveTemplateId() { return localStorage.getItem(ACTIVE_TEMPLATE_ID_KEY); }
function clearActiveTemplateId() { localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); }
// === 05: ACTIVE ID FUNCTIONS END ===

// === 06: CLEAR ALL DATA FUNCTION START ===
function clearAllData() { try { localStorage.removeItem(TOURNAMENT_COLLECTION_KEY); localStorage.removeItem(TEMPLATE_COLLECTION_KEY); localStorage.removeItem(ACTIVE_TOURNAMENT_ID_KEY); localStorage.removeItem(ACTIVE_TEMPLATE_ID_KEY); localStorage.removeItem(THEME_BG_COLOR_KEY); localStorage.removeItem(THEME_TEXT_COLOR_KEY); localStorage.removeItem(LOGO_LAYOUT_KEY); console.log("All app data cleared."); } catch (e) { console.error("Error clearing all data:", e); alert("Kunne ikke slette all lagret data!"); } }
// === 06: CLEAR ALL DATA FUNCTION END ===

// === 06b: ACTIVITY LOG HELPER START ===
function logActivity(logArray, message) { if (!logArray) logArray = []; const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit'}); logArray.unshift({ timestamp, message }); const MAX_LOG_ENTRIES = 50; if (logArray.length > MAX_LOG_ENTRIES) logArray.pop(); console.log(`[Log]: ${message}`); }
// === 06b: ACTIVITY LOG HELPER END ===

// === 06c: THEME COLOR FUNCTIONS START ===
function saveThemeBgColor(rgbString) { try { localStorage.setItem(THEME_BG_COLOR_KEY, rgbString); } catch(e){ console.error("Failed save theme bg:", e); }}
function loadThemeBgColor() { return localStorage.getItem(THEME_BG_COLOR_KEY) || DEFAULT_THEME_BG; }
function saveThemeTextColor(rgbString) { try { localStorage.setItem(THEME_TEXT_COLOR_KEY, rgbString); } catch(e){ console.error("Failed save theme text:", e); }}
function loadThemeTextColor() { return localStorage.getItem(THEME_TEXT_COLOR_KEY) || DEFAULT_THEME_TEXT; }
function parseRgbString(rgbString) { if (!rgbString || !rgbString.startsWith('rgb')) return [128, 128, 128]; const values = rgbString.substring(4, rgbString.length - 1).split(',').map(v => parseInt(v.trim())); return values.length === 3 ? values : [128, 128, 128]; }
// === 06c: THEME COLOR FUNCTIONS END ===

// === 06d: LOGO LAYOUT FUNCTIONS START ===
function saveLogoLayout(layoutObject) { try { localStorage.setItem(LOGO_LAYOUT_KEY, JSON.stringify(layoutObject)); } catch(e){ console.error("Failed save logo layout:", e); }}
function loadLogoLayout() { try { const layoutJSON = localStorage.getItem(LOGO_LAYOUT_KEY); return layoutJSON ? JSON.parse(layoutJSON) : DEFAULT_LOGO_LAYOUT; } catch(e) { console.error("Failed load logo layout:", e); return DEFAULT_LOGO_LAYOUT; } }
// === 06d: LOGO LAYOUT FUNCTIONS END ===

// === 07: UNIQUE ID GENERATOR SECTION START ===
function generateUniqueId(prefix = 'id') { const timestamp = Date.now().toString(36); const randomPart = Math.random().toString(36).substring(2, 9); return `${prefix}-${timestamp}-${randomPart}`; }
// === 07: UNIQUE ID GENERATOR SECTION END ===

// === FINAL SCRIPT PARSE CHECK START ===
console.log("storage.js parsed successfully."); // Add this line at the very end
// === FINAL SCRIPT PARSE CHECK END ===
