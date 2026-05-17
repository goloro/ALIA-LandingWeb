import { createMessageElement } from './createMessageElement.js';
import { showTypingIndicator, removeTypingIndicator } from './typingIndicator.js';
import { scrollToBottom } from './scrollChat.js';

/**
 * Módulo principal que gestiona el bucle de mensajes e introduce pausas temporales.
 */
export const simulateConversation = async (container, messages) => {
    const delayBetweenMessages = 2500;
    const typingDuration = 1500;

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        if (msg.sender === 'bot') {
            showTypingIndicator(container);
            await new Promise(resolve => setTimeout(resolve, typingDuration));
            removeTypingIndicator();
        }

        const msgElement = createMessageElement(msg);
        container.appendChild(msgElement);
        scrollToBottom(container);

        if (i < messages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
        }
    }
};
