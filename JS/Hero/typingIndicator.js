import { scrollToBottom } from './scrollChat.js';

/**
 * Módulo encargado de la animación de "escribiendo..."
 */

export const showTypingIndicator = (container) => {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    container.appendChild(typingDiv);
    scrollToBottom(container);
};

export const removeTypingIndicator = () => {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) {
        typingDiv.remove();
    }
};
