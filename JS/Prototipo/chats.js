document.addEventListener('DOMContentLoaded', () => {
    const csList = document.querySelector('.cs-list');
    const chatsMain = document.querySelector('.chats-main');
    const searchInput = document.querySelector('.cs-search input');
    
    let allChats = [];
    let activeChatId = null;

    // Estado vacío inicial
    const emptyStateHTML = `
        <div style="text-align: center; color: #94a3b8; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.5;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <h3 style="font-size: 1.1rem; color: #64748b; margin: 0 0 8px 0;">No hay chat seleccionado</h3>
            <p style="font-size: 0.9rem; margin: 0;">Selecciona una conversación de la lista para leer los mensajes.</p>
        </div>
    `;

    // Renderizar la lista lateral de chats
    function renderChatList(chatsToRender) {
        if (!csList) return;
        csList.innerHTML = '';

        if (chatsToRender.length === 0) {
            csList.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 0.9rem;">
                    No hay conversaciones que coincidan.
                </div>
            `;
            return;
        }

        chatsToRender.forEach(chat => {
            const isActive = chat.client.id === activeChatId;
            const needsHelp = chat.client.id === 902; // Hardcode warning for Ricardo Mendoza (Frame 7 example)

            const chatItem = document.createElement('div');
            // Si isActive, style border-left. Si needsHelp, añadir clase warning.
            chatItem.className = `cs-item ${isActive ? 'active' : ''} ${needsHelp ? 'warning' : ''}`;
            if (isActive) {
                chatItem.style.borderLeft = '4px solid #f59e0b'; // Naranja
            }
            if (chat.unread > 0) chatItem.classList.add('unread');
            
            const initials = chat.client.name.charAt(0).toUpperCase();
            const timeStr = chat.lastMessage ? chat.lastMessage.time || 'Hace 2 minutos' : '';
            const previewText = chat.lastMessage ? chat.lastMessage.text : 'Conversación iniciada...';

            chatItem.innerHTML = `
                ${needsHelp ? '<div class="cs-item-badge">ALIA Necesita Ayuda</div>' : ''}
                <div class="cs-item-body">
                    <div class="cs-item-avatar" style="background: #00677D; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px;">
                        ${needsHelp ? '<img src="../Images/Logos/LogoPeluqueríaNegro.png" alt="Avatar">' : initials}
                    </div>
                    <div class="cs-item-content">
                        <span class="cs-item-name">${chat.client.name}</span>
                        <p class="cs-item-preview">${previewText}</p>
                        <div class="cs-item-meta">
                            ${needsHelp ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' : ''}
                            <span class="cs-item-time">${timeStr}</span>
                        </div>
                    </div>
                </div>
            `;

            chatItem.addEventListener('click', () => {
                openChat(chat.client.id);
            });

            csList.appendChild(chatItem);
        });
    }

    // Abrir un chat específico
    window.openSpecificChat = async function(clientId) {
        const chatsTab = document.querySelector('.nav-item[data-target="page-chats"]');
        window.isProgrammaticChatOpen = true;
        if (chatsTab) chatsTab.click();
        window.isProgrammaticChatOpen = false;
        
        await loadChats(false);
        await openChat(clientId);
    };

    async function openChat(clientId) {
        activeChatId = clientId;
        if (!window.MockAPI) return;

        // Cargar mensajes
        const messages = await window.MockAPI.getChatMessages(clientId);
        const client = allChats.find(c => c.client.id === clientId)?.client;

        // Quitar unread
        const chatItemLocal = allChats.find(c => c.client.id === clientId);
        if (chatItemLocal) chatItemLocal.unread = 0;

        renderChatList(getFilteredChats());

        // Limpiar estilos inline previos y preparar main chat
        chatsMain.style.cssText = '';
        chatsMain.innerHTML = `
            <!-- Header -->
            <div class="cm-header">
                <div class="cm-header-client">
                    <div class="cm-avatar" style="background: #00677D; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                        ${clientId === 902 ? '<img src="../Images/Logos/LogoPeluqueríaNegro.png" alt="Avatar">' : (client ? client.name.charAt(0).toUpperCase() : 'C')}
                    </div>
                    <h3 class="cm-client-name">${client ? client.name : 'Cliente'}</h3>
                </div>
                <div class="cm-header-actions">
                      <div class="cm-toggle-ia">
                          <span class="cm-toggle-label">ALIA ACTIVA</span>
                          <label class="switch-ia">
                              <input type="checkbox" id="ia-toggle" checked>
                              <span class="slider round"></span>
                          </label>
                      </div>
                </div>
            </div>

            <!-- Messages Area -->
            <div class="cm-history">
                <div class="cm-date-divider">
                    <span>Hoy</span>
                </div>
                <!-- Bubbles -->
            </div>

            <!-- Input Box -->
            <div class="cm-input-area">
                <div class="cm-input-wrapper">
                    <button class="btn-attach">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <input type="text" id="chat-input-text" placeholder="Escribe un mensaje...">
                </div>
                <button class="btn-send-msg" id="chat-btn-send">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        `;

        const messagesArea = chatsMain.querySelector('.cm-history');
        const inputField = document.getElementById('chat-input-text');
        const btnSend = document.getElementById('chat-btn-send');
        const btnAttach = chatsMain.querySelector('.btn-attach');
        const toggleIa = document.getElementById('ia-toggle');
        const toggleLabel = chatsMain.querySelector('.cm-toggle-label');

        // Función para habilitar/deshabilitar input y actualizar UI
        const updateInputState = () => {
            const isIaActive = toggleIa.checked;
            inputField.disabled = isIaActive;
            btnSend.disabled = isIaActive;
            if (btnAttach) btnAttach.disabled = isIaActive;
            
            if (toggleLabel) {
                toggleLabel.textContent = isIaActive ? 'ALIA ACTIVA' : 'ALIA DESACTIVADA';
            }

            if (isIaActive) {
                inputField.placeholder = "ALIA está gestionando este chat...";
                inputField.style.opacity = '0.5';
                inputField.style.cursor = 'not-allowed';
                btnSend.style.opacity = '0.5';
                btnSend.style.cursor = 'not-allowed';
            } else {
                inputField.placeholder = "Escribe un mensaje...";
                inputField.style.opacity = '1';
                inputField.style.cursor = 'text';
                btnSend.style.opacity = '1';
                btnSend.style.cursor = 'pointer';
            }
        };

        // Si es Ricardo Mendoza (902), desmarcar el toggle por el estado pausado
        if (clientId === 902) {
            toggleIa.checked = false;
        }

        // Estado inicial
        updateInputState();

        // Listener para inyectar mensaje de sistema al cambiar el estado de la IA
        toggleIa.addEventListener('change', async (e) => {
            const isIaActive = e.target.checked;
            updateInputState();
            
            const text = isIaActive ? 'ASISTENTE ALIA REACTIVADA' : 'ASISTENTE ALIA PAUSADA • INTERVENCIÓN HUMANA REQUERIDA';
            const sysMsg = { sender: 'system', text: text, time: '', sysType: isIaActive ? 'success' : 'error' };
            
            appendMessageBubble(messagesArea, sysMsg, client.name);
            messagesArea.scrollTop = messagesArea.scrollHeight;

            // Guardar en MockAPI
            if (window.MockAPI && typeof window.MockAPI.addChatMessage === 'function') {
                await window.MockAPI.addChatMessage(clientId, text, 'system');
            }
        });

        // Renderizar burbujas
        if (messages.length > 0) {
            messages.forEach(msg => {
                appendMessageBubble(messagesArea, msg, client.name);
            });
            setTimeout(() => messagesArea.scrollTop = messagesArea.scrollHeight, 10);
        }

        const sendMessage = async () => {
            if (btnSend.disabled) return;
            const text = inputField.value.trim();
            if (!text) return;
            inputField.value = '';
            
            // Decidir si mandamos como IA o Profesional basado en el toggle
            const senderType = toggleIa.checked ? 'alia' : 'profesional';
            
            // Render optimista local
            const tempMsg = { sender: senderType, text: text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
            if (senderType === 'profesional') tempMsg.profName = 'TU USUARIO';

            appendMessageBubble(messagesArea, tempMsg, client.name);
            messagesArea.scrollTop = messagesArea.scrollHeight;

            // Guardar en MockAPI
            await window.MockAPI.addChatMessage(clientId, text, senderType);
            loadChats(false);
        };

        btnSend.addEventListener('click', sendMessage);
        inputField.addEventListener('keypress', (e) => {
            if (inputField.disabled) return;
            if (e.key === 'Enter') sendMessage();
        });
    }

    function appendMessageBubble(container, msg, clientName) {
        if (msg.sender === 'system') {
            const sysDiv = document.createElement('div');
            sysDiv.className = 'cm-system-divider';
            
            const isSuccess = (msg.sysType && msg.sysType === 'success') || msg.text.includes('REACTIVADA');
            const pillClass = isSuccess ? 'cm-system-pill success' : 'cm-system-pill';
            const iconSvg = isSuccess 
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

            sysDiv.innerHTML = `
                <div class="${pillClass}" style="display: flex; align-items: center; gap: 8px;">
                    ${iconSvg}
                    ${msg.text}
                </div>
            `;
            container.appendChild(sysDiv);
            return;
        }

        const bubbleWrap = document.createElement('div');
        bubbleWrap.className = 'msg';
        
        if (msg.sender === 'client') {
            bubbleWrap.classList.add('msg-user');
            bubbleWrap.innerHTML = `
                <div class="msg-meta">${clientName.toUpperCase()} • ${msg.time}</div>
                <div class="msg-bubble">${msg.text}</div>
            `;
        } else if (msg.sender === 'alia') {
            bubbleWrap.classList.add('msg-alia');
            bubbleWrap.innerHTML = `
                <div class="msg-meta">ALIA • ${msg.time}</div>
                <div class="msg-bubble">${msg.text}</div>
            `;
        } else if (msg.sender === 'profesional') {
            bubbleWrap.classList.add('msg-pro');
            const pName = msg.profName || 'PROFESIONAL';
            bubbleWrap.innerHTML = `
                <div class="msg-meta">${pName} • ${msg.time}</div>
                <div class="msg-bubble">${msg.text}</div>
            `;
        }

        container.appendChild(bubbleWrap);
    }

    // Filtros y Buscador
    let currentFilter = 'all';

    const filterBtns = document.querySelectorAll('.cs-filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Quitar active de todos
                filterBtns.forEach(b => b.classList.remove('active'));
                // Añadir al clickeado
                e.target.classList.add('active');

                // Determinar filtro
                if (e.target.textContent.trim() === 'Todas') {
                    currentFilter = 'all';
                } else if (e.target.textContent.trim() === 'Requieren Ayuda') {
                    currentFilter = 'help';
                }
                
                renderChatList(getFilteredChats());
            });
        });
    }

    function getFilteredChats() {
        let filtered = allChats;

        // Filtro por texto
        if (searchInput) {
            const q = searchInput.value.toLowerCase().trim();
            if (q) {
                filtered = filtered.filter(c => c.client.name.toLowerCase().includes(q));
            }
        }

        // Filtro por estado (Todas / Requieren Ayuda)
        if (currentFilter === 'help') {
            filtered = filtered.filter(c => c.client.id === 902); // Mock: solo Ricardo Mendoza necesita ayuda
        }

        return filtered;
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderChatList(getFilteredChats());
        });
    }

    // Carga inicial
    async function loadChats(resetView = true) {
        if (!window.MockAPI || typeof window.MockAPI.getChats !== 'function') return;
        try {
            allChats = await window.MockAPI.getChats();
            // Ordenar: Los que tienen mensajes no leídos primero, luego por id descendente
            allChats.sort((a, b) => {
                if (a.unread > 0 && b.unread === 0) return -1;
                if (b.unread > 0 && a.unread === 0) return 1;
                return b.client.id - a.client.id; 
            });

            renderChatList(getFilteredChats());

            if (resetView) {
                activeChatId = null;
                if (chatsMain) {
                    chatsMain.style.cssText = ''; // Limpiar estilos inline
                    chatsMain.innerHTML = emptyStateHTML;
                }
            }
        } catch (e) {
            console.error("Error loading chats:", e);
        }
    }

    // Exponer función de recarga
    window.refreshChats = loadChats;

    // Engancharse al click de la pestaña chats para cargar
    const navChats = document.querySelector('.nav-item[data-target="page-chats"]');
    if (navChats) {
        navChats.addEventListener('click', () => {
            if (window.isProgrammaticChatOpen) return;
            loadChats();
        });
    }
});
