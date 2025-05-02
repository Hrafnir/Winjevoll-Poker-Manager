// === tournament-ui.js ===
// Funksjoner for å oppdatere brukergrensesnittet og formatere data.

// ENDRET: Fjernet loadElementLayouts fra import
import { loadThemeBgColor, loadThemeTextColor, parseRgbString } from './storage.js';
import { calculateAverageStack, calculatePrizes, findNextPauseInfo, getPlayerNameById } from './tournament-logic.js';

// === Hjelpefunksjoner for formatering ===
export function formatTime(seconds) { /* ... (som før) ... */ }
export function formatBlindsHTML(level) { /* ... (som før) ... */ }
export function formatNextBlindsText(level) { /* ... (som før) ... */ }
// === Slutt Hjelpefunksjoner for formatering ===


// === Funksjoner for Tema og Layout ===
let currentLogoObjectUrl = null;
export function revokeObjectUrl(url) { /* ... (som før) ... */ }
export function updateMainLogoImage(logoBlob, targetImgElement = document.getElementById('logo-element')?.querySelector('.logo')) { /* ... (som før) ... */ }

// ENDRET: Mottar nå elementLayouts som argument, henter ikke selv
export function applyThemeAndLayout(bgColor, textColor, elementLayouts, draggableElements) {
    console.log("Applying theme and layout:", bgColor, textColor, elementLayouts);
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--live-page-bg', bgColor); rootStyle.setProperty('--live-page-text', textColor);
    try { const [r, g, b] = parseRgbString(bgColor); const brightness = (r * 299 + g * 587 + b * 114) / 1000; const borderColor = brightness < 128 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'; rootStyle.setProperty('--live-ui-border', borderColor); } catch (e) { rootStyle.setProperty('--live-ui-border', 'rgba(128, 128, 128, 0.15)'); }

    // Bruk defaults direkte her, siden vi mottar ferdig merged layout
    const defaults = { canvas: { height: 65 }, title:  { x: 5,  y: 2,  width: 90, fontSize: 3.5, isVisible: true }, timer:  { x: 5,  y: 20, width: 55, fontSize: 16,  isVisible: true }, blinds: { x: 65, y: 40, width: 30, fontSize: 8,   isVisible: true }, logo:   { x: 65, y: 5,  width: 30, height: 30,  isVisible: true }, info:   { x: 65, y: 75, width: 30, fontSize: 1.2, isVisible: true, showNextBlinds: true, showAvgStack: true, showPlayers: true, showLateReg: true, showNextPause: true } };

    // Sjekk om elementLayouts faktisk ble sendt inn
    if (!elementLayouts) {
        console.error("applyThemeAndLayout: elementLayouts argument is missing!");
        elementLayouts = defaults; // Bruk defaults som fallback
    }

    rootStyle.setProperty('--canvas-height', `${elementLayouts.canvas?.height ?? defaults.canvas.height}vh`);

    // Bruk draggableElements som ble sendt inn fra main
    if (!draggableElements || !Array.isArray(draggableElements)) {
         console.error("applyThemeAndLayout: draggableElements argument is missing or not an array!");
         draggableElements = []; // Tom fallback
    }

    draggableElements.forEach(element => {
        if (!element) return;
        const elementId = element.id.replace('-element', '');
        // Hent layout for dette elementet fra det mottatte objektet
        const layout = elementLayouts[elementId] || defaults[elementId]; // Fallback til default hvis element mangler i mottatt data
        if (!layout) {
             console.warn(`No layout found for element ${elementId}`);
             return;
        }

        const isVisible = layout.isVisible ?? true; // Default til synlig
        element.classList.toggle('element-hidden', !isVisible);

        if (isVisible) {
             element.style.left = `${layout.x ?? 0}%`; // Fallback til 0 hvis x/y mangler
             element.style.top = `${layout.y ?? 0}%`;
             element.style.width = `${layout.width ?? 50}%`; // Fallback bredde
             if (elementId === 'logo') { element.style.height = `${layout.height ?? 30}%`; element.style.fontSize = '1em'; }
             else { element.style.fontSize = `${layout.fontSize ?? 1}em`; element.style.height = 'auto'; }
        }
    });

    // Info toggles
    const infoLayout = elementLayouts.info || defaults.info; // Bruk mottatt eller default
    const infoParagraphs = { showNextBlinds: document.getElementById('info-next-blinds'), showNextPause: document.getElementById('info-next-pause'), showAvgStack: document.getElementById('info-avg-stack'), showPlayers: document.getElementById('info-players'), showLateReg: document.getElementById('info-late-reg') };
    for (const key in infoParagraphs) { if (infoParagraphs[key]) { infoParagraphs[key].classList.toggle('hidden', !(infoLayout[key] ?? true)); } }
    console.log("Theme and layout styles applied from tournament-ui.js.");
}
// === Slutt Funksjoner for Tema og Layout ===


// === UI Oppdateringsfunksjoner ===
export function renderPlayerList(state, handleEditPlayerClick, handleRebuy, handleEliminate, handleRestore) { /* ... (som før) ... */ }
export function displayPrizes(state) { /* ... (som før) ... */ }
export function renderActivityLog(state) { /* ... (som før) ... */ }
export function updateSoundToggleVisuals(soundsEnabled) { /* ... (som før) ... */ }
export function updateUI(state) { /* ... (som før) ... */ }
// === Slutt UI Oppdateringsfunksjoner ===
