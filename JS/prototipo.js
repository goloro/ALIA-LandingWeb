document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('prototype-chat-container');
    const inputField = document.getElementById('prototype-chat-input');
    const sendBtn = document.getElementById('prototype-chat-send');

    function sendMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        // Obtener la hora actual
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Crear el elemento del mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-user';
        
        // Evitar inyección de HTML básico
        const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        messageDiv.innerHTML = `
            ${safeText}
            <div class="message-time">${timeString} <span>✓✓</span></div>
        `;
        
        // Añadir el mensaje al chat
        if (chatArea) {
            chatArea.appendChild(messageDiv);
            // Hacer scroll hasta el final
            chatArea.scrollTop = chatArea.scrollHeight;
        }
        
        // Limpiar el campo
        inputField.value = '';
    }

    if (sendBtn && inputField) {
        // Evento para el botón de enviar
        sendBtn.addEventListener('click', sendMessage);

        // Evento para pulsar Enter en el input
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
