/**
 * Módulo encargado de generar el elemento DOM para cada burbuja del chat.
 */
export const createMessageElement = (msg) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    if (msg.sender === 'user') {
        messageDiv.classList.add('message-user');
        messageDiv.innerHTML = `
            <div class="message-text">${msg.text}</div>
            <div class="message-time">
                ${msg.time} <span>✓✓</span>
            </div>
        `;
    } else {
        messageDiv.classList.add('message-bot');
        messageDiv.innerHTML = `
            <div class="message-text">${msg.text}</div>
            <div class="message-time">
                ${msg.time}
            </div>
        `;
    }
    
    return messageDiv;
};
