import { fetchMessages } from './fetchMessages.js';
import { simulateConversation } from './simulateConversation.js';

/**
 * Reutiliza la BASE_URL calculada por content-loader.js (expuesta en window).
 * Si por alguna razón no estuviera disponible, la calcula de nuevo como fallback.
 *
 * BASE_URL:
 *   Local:         '' → fetch('Data/messages.json')
 *   GitHub Pages:  '/ALIA-LandingWeb' → fetch('/ALIA-LandingWeb/Data/messages.json')
 */
const BASE_URL = window.ALIA_BASE_URL !== undefined
    ? window.ALIA_BASE_URL
    : (() => {
        const pathParts = window.location.pathname
            .split('/')
            .filter(p => p.length > 0 && !p.includes('.'));
        return pathParts.length === 1 ? '/' + pathParts[0] : '';
    })();

/**
 * Controlador principal de la sección Hero.
 */
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const dataUrl = BASE_URL ? `${BASE_URL}/Data/messages.json` : 'Data/messages.json';

    fetchMessages(dataUrl).then(messages => {
        // Pausa inicial para que la animación empiece orgánicamente
        setTimeout(() => {
            simulateConversation(chatContainer, messages);
        }, 1000);
    });
});
