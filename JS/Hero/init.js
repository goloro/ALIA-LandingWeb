import { fetchMessages } from './fetchMessages.js';
import { simulateConversation } from './simulateConversation.js';

/**
 * Controlador principal de la sección Hero.
 */
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const dataUrl = 'Data/messages.json';

    fetchMessages(dataUrl).then(messages => {
        // Pausa inicial para que la animación empiece orgánicamente
        setTimeout(() => {
            simulateConversation(chatContainer, messages);
        }, 1000);
    });
});
