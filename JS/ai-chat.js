document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('ai-chat-toggle');
    const chatWindow = document.getElementById('ai-chat-window');
    const chatClose = document.getElementById('ai-chat-close');

    if (chatToggle && chatWindow && chatClose) {
        const openChatWindow = () => {
            chatWindow.classList.add('active');
            chatToggle.style.transform = 'scale(0)';
            chatToggle.style.opacity = '0';
            setTimeout(() => {
                chatToggle.style.display = 'none';
            }, 300);
        };

        // Abrir chat
        chatToggle.addEventListener('click', openChatWindow);

        // Cerrar chat
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('active');
            chatToggle.style.display = 'flex';
            
            // Forzar reflow para la animacion
            void chatToggle.offsetWidth;
            
            chatToggle.style.transform = 'scale(1)';
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

            const formatChatMsg = (txt) => {
                let safe = txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                safe = safe.replace(/\n/g, '<br>');
                return safe;
            };

            let innerHTML = '';
            
            if (type === 'received') {
                innerHTML = `
                    <div class="ai-chat-avatar">
                        <img src="Images/Logos/LogoHexagonoAlia-SinFondo.png" alt="ALIA Avatar">
                    </div>
                    <div class="ai-chat-bubble">
                        <p>${formatChatMsg(text)}</p>
                    </div>
                `;
            } else {
                innerHTML = `
                    <div class="ai-chat-bubble">
                        <p>${formatChatMsg(text)}</p>
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

        // Instanciar la clase preparada para la API
        const landingChatAPI = new window.AliaLandingChat();
        landingChatAPI.initialize();

        async function sendMessage() {
            let text = chatInput.value.trim();
            if (!text) return;

            // Auto-capitalizar la primera letra y después de punto, interrogación o exclamación
            text = text.replace(/(^\s*|[.!?]\s+|[¿¡]\s*)([a-zñáéíóúü])/g, (m, sep, letter) => sep + letter.toUpperCase());

            // Añadir mensaje del usuario
            appendMessage(text, 'sent');
            chatInput.value = '';

            // Limpiar cualquier estado anterior
            clearTimeout(typingTimeout);
            removeTypingIndicator();

            // Mostrar indicador "escribiendo..."
            showTypingIndicator();

            try {
                // Llamar a la clase que gestiona la API
                const response = await landingChatAPI.sendMessage(text);
                removeTypingIndicator();
                appendMessage(response, 'received');
            } catch (error) {
                removeTypingIndicator();
                console.error("Error en la conexión con la API:", error);
                const offlineMsg = chatWindow.dataset.offlineMessage ||
                    'En este momento no estoy conectada a mis servidores. ¡Pronto podré ayudarte con tu negocio!';
                appendMessage(offlineMsg, 'received');
            }
        }

        sendBtn.addEventListener('click', sendMessage);

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Evento para abrir el chat desde botones de "Solicitar presupuesto"
        document.body.addEventListener('click', (e) => {
            const target = e.target.closest('a[href="#open-chat-budget"]');
            if (target) {
                e.preventDefault();
                openChatWindow();
                
                setTimeout(() => {
                    chatInput.value = "Me gustaría solicitar un presupuesto estimado.";
                    sendMessage();
                }, 400);
            }
        });
    }
});
