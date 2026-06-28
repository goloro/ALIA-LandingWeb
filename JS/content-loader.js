/**
 * content-loader.js
 * ==================
 * Módulo principal de inyección de contenido dinámico para la Landing de ALIA.
 *
 * Responsabilidades:
 *  1. Detectar la BASE_URL dinámicamente (funciona local y en GitHub Pages).
 *  2. Cargar Data/content.json con manejo robusto de errores.
 *  3. Inyectar el contenido en cada sección del DOM.
 */

// ---------------------------------------------------------------------------
// BASE URL — Detecta el subdirectorio del repositorio automáticamente.
//
// Casos cubiertos:
//   Local (Live Server):  http://127.0.0.1:5500/index.html            → ''
//   Local (file://):      file:///C:/...ALIA-LandingWeb/index.html    → ''
//   GitHub Pages:         https://user.github.io/ALIA-LandingWeb/     → '/ALIA-LandingWeb'
//
// La URL final de fetch siempre se construye con una ruta relativa al origen,
// evitando que empiece con '/' doble o sea vacía seguida de '/Data/...'.
// ---------------------------------------------------------------------------
const BASE_URL = (() => {
    const pathParts = window.location.pathname
        .split('/')
        .filter(p => p.length > 0 && !p.includes('.'));   // ignora 'index.html'
    // En GitHub Pages habrá exactamente 1 segmento: 'ALIA-LandingWeb'
    return pathParts.length === 1 ? '/' + pathParts[0] : '';
})();

/** Construye una URL segura relativa al origen. Nunca empieza con '//' */
const url = (path) => BASE_URL ? `${BASE_URL}/${path}` : path;

// Exportamos BASE_URL para que init.js pueda importarla si se refactoriza a módulo.
// Por ahora la exponemos en window para compatibilidad con el script clásico.
window.ALIA_BASE_URL = BASE_URL;

// ---------------------------------------------------------------------------
// Utilidades DOM
// ---------------------------------------------------------------------------

/** Establece innerHTML de forma segura; no hace nada si el elemento no existe. */
const setHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el && html != null) el.innerHTML = html;
};

/** Establece textContent de forma segura; no hace nada si el elemento no existe. */
const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el && text != null) el.textContent = text;
};

// ---------------------------------------------------------------------------
// INYECTORES DE SECCIÓN
// ---------------------------------------------------------------------------

function renderHero(hero) {
    // Construimos el título usando los campos del JSON (no hardcoded en JS)
    setHTML('hero-title', `
        ${hero.titleLine1} <br>
        <span class="highlight">${hero.titleHighlight}</span> ${hero.titleLine2} <br>
        ${hero.titleLine3}
    `);
    setText('hero-description', hero.description);

    const btnsContainer = document.getElementById('hero-buttons');
    if (btnsContainer && Array.isArray(hero.buttons)) {
        btnsContainer.innerHTML = hero.buttons
            .map(btn => `<a href="${btn.url}" class="btn btn-${btn.style}">${btn.text}</a>`)
            .join('');
    }

    setText('chat-business-name', hero.chat.businessName);
    setText('chat-business-status', hero.chat.businessStatus);

    const chatInput = document.querySelector('.chat-input-wrapper input');
    if (chatInput) chatInput.placeholder = hero.chat.inputPlaceholder;
}

function renderAiChat(aiChat) {
    // Mensaje de bienvenida en el panel del chat flotante
    const bubble = document.querySelector('#ai-chat-window .ai-chat-bubble p');
    if (bubble) bubble.textContent = aiChat.welcomeMessage;

    const input = document.getElementById('ai-chat-input');
    if (input) input.placeholder = aiChat.inputPlaceholder;

    // Exponer el mensaje offline al módulo ai-chat.js mediante un data attribute
    const chatWindow = document.getElementById('ai-chat-window');
    if (chatWindow) chatWindow.dataset.offlineMessage = aiChat.offlineMessage;
}

function renderComparison(comparison) {
    setText('comparison-heading', comparison.heading);
    // El subheading puede contener <br>, se inyecta como HTML
    setHTML('comparison-subheading', comparison.subheading);

    setText('traditional-title', comparison.traditional.title);
    const tradList = document.getElementById('traditional-list');
    if (tradList && Array.isArray(comparison.traditional.items)) {
        tradList.innerHTML = comparison.traditional.items
            .map(item => `<li>${item}</li>`)
            .join('');
    }

    setText('alia-title', comparison.alia.title);
    const aliaList = document.getElementById('alia-list');
    if (aliaList && Array.isArray(comparison.alia.items)) {
        aliaList.innerHTML = comparison.alia.items
            .map(item => `<li>${item}</li>`)
            .join('');
    }
}

function renderTechnology(technology) {
    setText('technology-heading', technology.heading);

    // SVGs en línea, indexados por el campo "id" de cada tarjeta
    const svgMap = {
        nlp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>`,
        cloud: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>`,
        omnichannel: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>`,
        bi: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /><path d="M19 9h-4" /><path d="M19 9v4" /></svg>`
    };

    const grid = document.getElementById('tech-grid');
    if (grid && Array.isArray(technology.cards)) {
        grid.innerHTML = technology.cards.map(card => `
            <div class="tech-card">
                <div class="tech-icon ${card.iconClass}">${svgMap[card.id] || ''}</div>
                <h3>${card.title}</h3>
                <p>${card.description}</p>
            </div>
        `).join('');
    }
}

function renderFeatures(features) {
    setText('features-heading', features.heading);

    const svgMap = {
        receptionist: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-3 9h-2V9h2v2zm-4 0h-2V9h2v2zm-4 0H7V9h2v2z" /></svg>`,
        agenda: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
        finance: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4v11H4zM16 4h4v16h-4zM10 14h4v6h-4z" /></svg>`
    };

    const grid = document.getElementById('features-grid');
    if (grid && Array.isArray(features.cards)) {
        grid.innerHTML = features.cards.map(card => `
            <div class="feature-card">
                <div class="feature-blob ${card.blobClass}"></div>
                <div class="feature-icon ${card.iconBgClass}">${svgMap[card.id] || ''}</div>
                <h3>${card.title}</h3>
                <p>${card.description}</p>
            </div>
        `).join('');
    }
}

function renderPortal(portal) {
    // heading contiene <br>, se inyecta como HTML
    setHTML('portal-heading', portal.heading);
    setText('portal-description', portal.description);
    setText('portal-badge', portal.floatingBadge);

    const svgs = [
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
    ];

    const list = document.getElementById('portal-features-list');
    if (list && Array.isArray(portal.features)) {
        list.innerHTML = portal.features.map((feat, i) => `
            <li>
                <div class="portal-icon icon-green">${svgs[i] || ''}</div>
                <span>${feat}</span>
            </li>
        `).join('');
    }
}

function renderHybrid(hybrid) {
    setText('hybrid-tag', hybrid.tag);
    setText('hybrid-heading', hybrid.heading);
    setText('hybrid-description', hybrid.description);

    const svgs = [
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-7.82l5.67-5.67"></path></svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
    ];

    const list = document.getElementById('hybrid-features-list');
    if (list && Array.isArray(hybrid.features)) {
        list.innerHTML = hybrid.features.map((feat, i) => `
            <li>
                <div class="hybrid-icon">${svgs[i] || ''}</div>
                <span>${feat}</span>
            </li>
        `).join('');
    }
}

function renderHardware(hardware) {
    setText('hardware-tag', hardware.tag);
    // heading contiene <br>, se inyecta como HTML
    setHTML('hardware-heading', hardware.heading);
    setText('hardware-description', hardware.description);

    const svgs = [
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`
    ];

    const list = document.getElementById('hardware-features-list');
    if (list && Array.isArray(hardware.features)) {
        list.innerHTML = hardware.features.map((feat, i) => `
            <li>
                <div class="hardware-icon">${svgs[i] || ''}</div>
                <span>${feat}</span>
            </li>
        `).join('');
    }

    const cta = document.getElementById('hardware-cta');
    if (cta) {
        cta.textContent = hardware.ctaText;
        cta.href = hardware.ctaUrl;
    }
}

function renderCalculator(calculator) {
    // heading contiene <br>, se inyecta como HTML
    setHTML('calculator-heading', calculator.heading);
    setText('calculator-subheading', calculator.subheading);

    if (Array.isArray(calculator.sliders)) {
        calculator.sliders.forEach(slider => {
            setText(`calc-question-${slider.id}`, slider.question);

            const labelMin = document.getElementById(`calc-label-min-${slider.id}`);
            const labelMax = document.getElementById(`calc-label-max-${slider.id}`);
            if (labelMin) labelMin.textContent = slider.labelMin;
            if (labelMax) labelMax.textContent = slider.labelMax;

            // Actualizar atributos del slider para que calculator.js lea los valores correctos
            const sliderEl = document.getElementById(`slider-${slider.id}`);
            if (sliderEl) {
                sliderEl.min   = slider.min;
                sliderEl.max   = slider.max;
                sliderEl.value = slider.defaultValue;
                sliderEl.step  = slider.step;
                // Disparar 'input' para que calculator.js recalcule y actualice el fondo
                sliderEl.dispatchEvent(new Event('input'));
            }

            // Actualizar el display del valor actual
            const valEl = document.getElementById(`val-${slider.id}`);
            if (valEl) valEl.textContent = slider.defaultValue;
        });
    }

    const r = calculator.results;
    if (r) {
        setText('calc-savings-label',   r.savingsLabel);
        setText('calc-savings-unit',    r.savingsUnit);
        setText('calc-info-text',       r.infoText);
        setText('calc-annual-label',    r.annualLabel);
        setText('calc-efficiency-label',r.efficiencyLabel);
        setText('calc-efficiency-value',r.efficiencyValue);
    }
}

function renderRoadmap(roadmap) {
    setText('roadmap-tag',     roadmap.tag);
    setText('roadmap-heading', roadmap.heading);
    // subheading contiene <br>, se inyecta como HTML
    setHTML('roadmap-subheading', roadmap.subheading);

    const grid = document.getElementById('roadmap-grid');
    if (grid && Array.isArray(roadmap.steps)) {
        const stepsHTML = roadmap.steps.map(step => `
            <div class="roadmap-card">
                <div class="step-number ${step.colorClass}">${step.number}</div>
                <h3>${step.title}</h3>
                <p>${step.description}</p>
                <div class="card-badges">
                    ${Array.isArray(step.badges) ? step.badges.map(b => `<span class="badge badge-blue">${b}</span>`).join('') : ''}
                </div>
            </div>
        `).join('');

        const rocketHTML = `
            <div class="roadmap-rocket">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                </svg>
            </div>
        `;

        grid.innerHTML = stepsHTML + rocketHTML;
    }
}

function renderCta(cta) {
    setText('cta-heading', cta.heading);
    // description contiene <br>, se inyecta como HTML
    setHTML('cta-description', cta.description);

    const btn = document.getElementById('cta-button');
    if (btn) {
        btn.textContent = cta.buttonText;
        btn.href = cta.buttonUrl;
    }
}

function renderFooter(footer) {
    setText('footer-copyright', footer.copyright);
}

// ---------------------------------------------------------------------------
// CARGADOR PRINCIPAL
// ---------------------------------------------------------------------------

async function loadContent() {
    const contentUrl = url('Data/content.json');

    try {
        const response = await fetch(contentUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} al cargar ${contentUrl}`);
        }
        const content = await response.json();

        // Mapa de secciones → funciones renderizadoras
        // Cada una se ejecuta en su propio try/catch para que un fallo parcial
        // no impida que el resto de la página se renderice.
        const renderers = [
            ['hero',       () => renderHero(content.hero)],
            ['aiChat',     () => renderAiChat(content.aiChat)],
            ['comparison', () => renderComparison(content.comparison)],
            ['technology', () => renderTechnology(content.technology)],
            ['features',   () => renderFeatures(content.features)],
            ['portal',     () => renderPortal(content.portal)],
            ['hybrid',     () => renderHybrid(content.hybrid)],
            ['hardware',   () => renderHardware(content.hardware)],
            ['calculator', () => renderCalculator(content.calculator)],
            ['roadmap',    () => renderRoadmap(content.roadmap)],
            ['cta',        () => renderCta(content.cta)],
            ['footer',     () => renderFooter(content.footer)],
        ];

        renderers.forEach(([section, fn]) => {
            try {
                if (content[section] !== undefined) fn();
            } catch (err) {
                console.warn(`[content-loader] Error al renderizar sección "${section}":`, err);
            }
        });

    } catch (error) {
        console.error('[content-loader] Error crítico al cargar content.json:', error);
        // La interfaz permanece visible; las secciones quedan sin texto
        // en lugar de lanzar una pantalla en blanco.
    } finally {
        if (typeof window.checkAndHidePreloader === 'function') {
            window.isContentLoaded = true;
            window.checkAndHidePreloader();
        }
    }
}

// ---------------------------------------------------------------------------
// INICIALIZACIÓN — Se ejecuta cuando el DOM está listo
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', loadContent);
