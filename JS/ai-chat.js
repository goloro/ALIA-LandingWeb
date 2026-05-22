document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('ai-chat-toggle');
    const chatWindow = document.getElementById('ai-chat-window');
    const chatClose = document.getElementById('ai-chat-close');

    if (chatToggle && chatWindow && chatClose) {
        // Abrir chat
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.add('active');
            chatToggle.style.transform = 'translateY(-50%) translateX(100%)';
            chatToggle.style.opacity = '0';
            setTimeout(() => {
                chatToggle.style.display = 'none';
            }, 300);
        });

        // Cerrar chat
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('active');
            chatToggle.style.display = 'flex';
            
            // Forzar reflow para la animacion
            void chatToggle.offsetWidth;
            
            chatToggle.style.transform = 'translateY(-50%) translateX(0)';
            chatToggle.style.opacity = '1';
        });

        // Logica del chat
        const chatInput = document.getElementById('ai-chat-input');
        const sendBtn = document.getElementById('ai-chat-send-btn');
        const chatBody = document.querySelector('.ai-chat-body');

        function scrollToBottom() {
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        function appendMessage(text, type) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ai-chat-message ${type}`;

            let innerHTML = '';
            
            if (type === 'received') {
                innerHTML = `
                    <div class="ai-chat-avatar">
                        <img src="Images/Logos/LogoHexagonoAlia-SinFondo.png" alt="ALIA Avatar">
                    </div>
                    <div class="ai-chat-bubble">
                        <p>${text}</p>
                    </div>
                `;
            } else {
                innerHTML = `
                    <div class="ai-chat-bubble">
                        <p>${text}</p>
                    </div>
                `;
            }

            msgDiv.innerHTML = innerHTML;
            chatBody.appendChild(msgDiv);
            scrollToBottom();
        }

        function showTypingIndicator() {
            const indicatorDiv = document.createElement('div');
            indicatorDiv.className = 'ai-typing-indicator';
            indicatorDiv.id = 'ai-typing';
            indicatorDiv.innerHTML = `
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            `;
            chatBody.appendChild(indicatorDiv);
            scrollToBottom();
        }

        function removeTypingIndicator() {
            const indicator = document.getElementById('ai-typing');
            if (indicator) {
                indicator.remove();
            }
        }

        let typingTimeout;
        let responseTimeout;

        function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;

            // Añadir mensaje del usuario
            appendMessage(text, 'sent');
            chatInput.value = '';

            // Limpiar cualquier respuesta anterior que estuviera pendiente
            clearTimeout(typingTimeout);
            clearTimeout(responseTimeout);
            removeTypingIndicator();

            // Mostrar indicador "escribiendo..."
            typingTimeout = setTimeout(() => {
                showTypingIndicator();
                
                // Simular respuesta tras 1.5s
                responseTimeout = setTimeout(() => {
                    removeTypingIndicator();
                    appendMessage('En este momento no estoy conectada a mis servidores. ¡Pronto podré ayudarte con tu negocio!', 'received');
                }, 1500);

            }, 500);
        }

        sendBtn.addEventListener('click', sendMessage);

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
