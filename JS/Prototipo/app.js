// --- Service SVG Icons System ---
window.getServiceIconSVG = function(serviceName, color = "currentColor", size = "10") {
    const name = (serviceName || '').toLowerCase();
    
    // Tijeras (Corte)
    if (name === 'tijeras' || name.includes('corte') || name.includes('peinado') || name.includes('lavado')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>`;
    }
    // Gota / Paleta (Color)
    if (name === 'gota' || name.includes('color') || name.includes('tinte') || name.includes('mechas')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`;
    }
    // Barba / Bigote / Cuchilla
    if (name === 'cuchilla' || name.includes('barba') || name.includes('afeitado')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h6a2 2 0 0 0 2-2v-8z"></path><polyline points="18 10 22 10 22 6 18 6"></polyline></svg>`;
    }
    // Maletín / Configuración (Gestión, Entrevista, Revisión)
    if (name === 'maletin' || name === 'maletín' || name.includes('gestión') || name.includes('revisión') || name.includes('entrevista') || name.includes('admin') || name.includes('gesti')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
    }
    
    // Por defecto: Calendario
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Toast Notifications System ---
    window.showToast = function(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconSvg = '';
        if (type === 'success') {
            iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        } else if (type === 'error') {
            iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
        } else if (type === 'warning') {
            iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        } else {
            iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }

        toast.innerHTML = `
            <div class="toast-icon">${iconSvg}</div>
            <div class="toast-content">
                <h4 class="toast-title">${title}</h4>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;

        container.appendChild(toast);

        const autoRemoveTimeout = setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 5000); // 5 seconds

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemoveTimeout);
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        });
    };

    // --- Lógica de Navegación del Portal ---
    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');

    /**
     * Initializes the portal navigation logic.
     * Listens for clicks on sidebar items and toggles the active page section.
     */
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Limpiar buscador si el usuario navega manualmente
            if (e.isTrusted) {
                const searchInput = document.getElementById('topbar-client-search');
                if (searchInput && searchInput.value !== '') {
                    searchInput.value = '';
                    if (window.resetClientSearch) window.resetClientSearch();
                }
            }
            
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;

            // Cerrar el panel de detalles de cita si estuviera abierto
            const appointmentPanel = document.getElementById('appointment-details-panel');
            const appointmentBackdrop = document.getElementById('appointment-details-backdrop');
            if (appointmentPanel) appointmentPanel.classList.remove('active');
            if (appointmentBackdrop) appointmentBackdrop.classList.remove('active');

            // Quitar active de todos los nav items
            navItems.forEach(n => n.classList.remove('active'));
            // Poner active al clickeado
            item.classList.add('active');

            // Ocultar todas las secciones
            pageSections.forEach(sec => sec.classList.remove('active'));
            // Mostrar la sección target
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
            
            // Refrescar clientes si se entra a su sección
            if (targetId === 'page-clientes' && typeof window.loadClients === 'function') {
                window.loadClients();
            }
            
            // Refrescar dashboard si se entra a su sección
            if (targetId === 'page-dashboard' && typeof window.renderDashboard === 'function') {
                window.renderDashboard();
            }

            // Cambiar el título de la barra superior
            const topbarTitle = document.querySelector('.topbar-title');
            const newTitle = item.getAttribute('title');
            if (topbarTitle && newTitle) {
                topbarTitle.textContent = newTitle;
            }

            // Gestionar scroll del contenedor para la vista de chats y soporte
            const pageContent = document.querySelector('.portal-page-content');
            if (pageContent) {
                if (targetId === 'page-chats') {
                    pageContent.classList.add('no-scroll-chats');
                    pageContent.classList.remove('no-scroll-agenda');
                } else if (targetId === 'page-soporte') {
                    pageContent.classList.remove('no-scroll-chats');
                    pageContent.classList.remove('no-scroll-agenda');
                } else if (targetId === 'page-agenda-semanal') {
                    pageContent.classList.add('no-scroll-agenda');
                    pageContent.classList.remove('no-scroll-chats');
                    
                    // Hacer autoscroll a la línea de tiempo actual al entrar a la pestaña
                    setTimeout(() => {
                        const timeLine = document.querySelector('.current-time-line');
                        if (timeLine) timeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                } else {
                    pageContent.classList.remove('no-scroll-chats');
                    pageContent.classList.remove('no-scroll-soporte');
                    pageContent.classList.remove('no-scroll-agenda');
                }
            }
        });
    });

    // --- Lógica del Chat (Multi-chat) ---
    const chatArea = document.getElementById('prototype-chat-container');
    const inputField = document.getElementById('prototype-chat-input');
    const sendBtn = document.getElementById('prototype-chat-send');
    
    const listView = document.getElementById('prototype-chat-list-view');
    const detailView = document.getElementById('prototype-chat-detail-view');
    const listItems = document.getElementById('prototype-chat-list-items');
    const newChatBtn = document.getElementById('prototype-new-chat-btn');
    const backBtn = document.querySelector('.chat-header-left .icon-back');
    const chatNameEl = document.querySelector('.chat-name');
    const emptyStateHTML = chatArea ? chatArea.innerHTML : '';

    let prototypeChats = [
        { 
            id: 1, 
            name: "Cliente 1", 
            api: window.AliaPrototypeChat ? new window.AliaPrototypeChat() : null,
            messagesHTML: emptyStateHTML,
            lastMessage: "Hola, soy ALIA 👋",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ];
    let currentChatId = null;

    if (prototypeChats[0].api) prototypeChats[0].api.initialize();

    function renderChatList() {
        if (!listItems) return;
        listItems.innerHTML = '';
        prototypeChats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-list-item';
            item.innerHTML = `
                <div class="chat-list-item-avatar-wrapper" style="position: relative; margin-right: 15px;">
                    <div class="chat-list-item-avatar" style="margin-right: 0;">
                        <img src="../Images/Logos/LogoPeluqueríaNegro.png" alt="ALIA">
                    </div>
                    <div class="online-dot"></div>
                </div>
                <div class="chat-list-item-info">
                    <div class="cl-item-top">
                        <h4 class="chat-list-item-name">${chat.name}</h4>
                        <span class="cl-item-time">${chat.time}</span>
                    </div>
                    <div class="cl-item-bottom">
                        <p class="chat-list-item-preview">${chat.lastMessage}</p>
                    </div>
                </div>
            `;
            item.addEventListener('click', () => openChat(chat.id));
            listItems.appendChild(item);
        });
    }

    function openChat(id) {
        currentChatId = id;
        const chat = prototypeChats.find(c => c.id === id);
        if (!chat) return;

        if (chatNameEl) chatNameEl.textContent = chat.name;
        if (chatArea) {
            chatArea.innerHTML = chat.messagesHTML;
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        if (listView) listView.style.display = 'none';
        if (detailView) detailView.style.display = 'flex';
    }

    function saveCurrentChatState() {
        if (!currentChatId || !chatArea) return;
        const chat = prototypeChats.find(c => c.id === currentChatId);
        if (chat) {
            chat.messagesHTML = chatArea.innerHTML;
        }
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            saveCurrentChatState();
            renderChatList();
            if (detailView) detailView.style.display = 'none';
            if (listView) listView.style.display = 'flex';
            currentChatId = null;
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            const newId = prototypeChats.length + 1;
            const newChat = {
                id: newId,
                name: `Cliente ${newId}`,
                api: window.AliaPrototypeChat ? new window.AliaPrototypeChat() : null,
                messagesHTML: emptyStateHTML,
                lastMessage: "Hola, soy ALIA 👋",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            if (newChat.api) newChat.api.initialize();
            prototypeChats.push(newChat);
            renderChatList();
            openChat(newId);
        });
    }

    // Inicializar lista
    renderChatList();
    // Por defecto, mostrar la lista
    if (detailView) detailView.style.display = 'none';
    if (listView) listView.style.display = 'flex';

    async function sendMessage() {
        if (!currentChatId) return;
        const chat = prototypeChats.find(c => c.id === currentChatId);
        if (!chat) return;

        let text = inputField.value.trim();
        if (!text) return;

        text = text.replace(/(^\s*|[.!?]\s+|[¿¡]\s*)([a-zñáéíóúü])/g, (m, sep, letter) => sep + letter.toUpperCase());

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-user';
        const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        messageDiv.innerHTML = `${safeText}<div class="message-time">${timeString} <span>✓✓</span></div>`;
        
        if (chatArea) {
            const emptyState = chatArea.querySelector('.chat-empty-state');
            if (emptyState) emptyState.remove();
            chatArea.appendChild(messageDiv);
            chatArea.scrollTop = chatArea.scrollHeight;
        }
        
        chat.lastMessage = "Tú: " + text;
        saveCurrentChatState();
        inputField.value = '';

        if (!chat.api) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message message-bot typing-indicator-msg';
        typingDiv.innerHTML = `Escribiendo...`;
        if (chatArea) {
            chatArea.appendChild(typingDiv);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        try {
            const responseText = await chat.api.sendMessage(text);
            if (typingDiv.parentNode) typingDiv.parentNode.removeChild(typingDiv);
            
            const botMsgDiv = document.createElement('div');
            botMsgDiv.className = 'message message-bot';
            const formatChatMsg = (txt) => {
                let safe = txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                safe = safe.replace(/\n/g, '<br>');
                return safe;
            };
            botMsgDiv.innerHTML = `${formatChatMsg(responseText)}<div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;
            
            if (chatArea) {
                chatArea.appendChild(botMsgDiv);
                chatArea.scrollTop = chatArea.scrollHeight;
            }
            chat.lastMessage = "ALIA: " + responseText;
            saveCurrentChatState();
        } catch (error) {
            if (typingDiv.parentNode) typingDiv.parentNode.removeChild(typingDiv);
            console.error("Error API Prototipo:", error);
        }
    }

    if (sendBtn && inputField) {
        sendBtn.addEventListener('click', sendMessage);
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // --- Lógica de Fecha Dinámica ---
    const currentDate = new Date();
    
    const opcionesFechaCompleta = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let fechaCompletaStr = currentDate.toLocaleDateString('es-ES', opcionesFechaCompleta);
    fechaCompletaStr = fechaCompletaStr.charAt(0).toUpperCase() + fechaCompletaStr.slice(1);
    
    const opcionesMes = { month: 'long' };
    let mesStr = currentDate.toLocaleDateString('es-ES', opcionesMes);
    mesStr = mesStr.charAt(0).toUpperCase() + mesStr.slice(1);
    
    const dateElement = document.getElementById('current-date-full');
    if (dateElement) {
        dateElement.textContent = fechaCompletaStr;
    }
    
    const monthElements = document.querySelectorAll('.current-month-text');
    monthElements.forEach(el => {
        el.textContent = mesStr;
    });

    // --- Lógica del Modal Global ---
    const btnNewCita = document.querySelector('.btn-new-cita');
    const modalNuevaCita = document.getElementById('modal-nueva-cita');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');

    window.calculateAvailableTimes = async function(dateStr, durationMinutes, profName) {
        if (!dateStr || typeof dateStr !== 'string' || !dateStr.includes('/')) return [];
        let settings = { closedDays: [0], openHours: { start: '10:00', end: '19:00' } };
        const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
        let fullTeam = [{ name: currentUserName, diasLibres: [1], pausaAlmuerzo: { start: '14:00', end: '15:00' } }];
        
        if (window.MockAPI) {
            try { settings = await window.MockAPI.getSettings(); } catch(e) {}
            const team = await window.MockAPI.getTeam();
            const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
            fullTeam = [...team, { name: currentUserName, diasLibres: [1], pausaAlmuerzo: { start: '14:00', end: '15:00' } }];
        }

        if (profName === 'Cualquier Disponible') {
            let allAvailableTimes = new Set();
            for (let t of fullTeam) {
                const times = await window.calculateAvailableTimes(dateStr, durationMinutes, t.name);
                times.forEach(time => allAvailableTimes.add(time));
            }
            return Array.from(allAvailableTimes).sort();
        }

        const parts = dateStr.split('/');
        const selectedDate = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
        
        // 1. Check if business is closed
        const dayOfWeek = selectedDate.getDay();
        if (settings.closedDays && settings.closedDays.includes(dayOfWeek)) {
            return []; // Business is closed
        }

        // 2. Check professional's day off
        const profObj = fullTeam.find(t => t.name === profName);
        if (profObj && profObj.diasLibres && profObj.diasLibres.includes(dayOfWeek)) {
            return []; // Professional's day off
        }

        const times = [];
        
        let isToday = false;
        const now = new Date();
        if (selectedDate.getFullYear() === now.getFullYear() && 
            selectedDate.getMonth() === now.getMonth() && 
            selectedDate.getDate() === now.getDate()) {
            isToday = true;
        }

        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Get appointments for this prof on this date
        let appts = [];
        if (window.MockAPI && window.MockAPI.getAppointmentsByProfessional && profName) {
            const apiDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            appts = await window.MockAPI.getAppointmentsByProfessional(profName, apiDateStr);
        }

        const openStart = (settings.openHours && settings.openHours.start) ? settings.openHours.start : '10:00';
        const openEnd = (settings.openHours && settings.openHours.end) ? settings.openHours.end : '19:00';
        
        const startHour = parseInt(openStart.split(':')[0]);
        const endHour = parseInt(openEnd.split(':')[0]);
        const endMin = parseInt(openEnd.split(':')[1] || 0);

        for (let h = startHour; h <= endHour; h++) {
            for (let m of [0, 30]) {
                // If it's exactly the closing hour and minute, we shouldn't offer it as a start time
                if (h === endHour && m >= endMin) continue;
                if (isToday) {
                    if (h < currentHour || (h === currentHour && m <= currentMinute)) {
                        continue; // Block past times
                    }
                }
                
                // Calculate end time
                let endH = h;
                let endM = m + durationMinutes;
                while (endM >= 60) {
                    endH += 1;
                    endM -= 60;
                }
                
                // If service ends after business hours, it cannot start at this slot
                if (endH > endHour || (endH === endHour && endM > endMin)) continue;
                
                const slotStartMins = h * 60 + m;
                const slotEndMins = endH * 60 + endM;

                // Check lunch break
                let isLunch = false;
                if (profObj && profObj.pausaAlmuerzo && profObj.pausaAlmuerzo.start && profObj.pausaAlmuerzo.end) {
                    const [lh, lm] = profObj.pausaAlmuerzo.start.split(':').map(Number);
                    const lunchStartMins = lh * 60 + lm;
                    const [leh, lem] = profObj.pausaAlmuerzo.end.split(':').map(Number);
                    const lunchEndMins = leh * 60 + lem;
                    
                    if (slotStartMins < lunchEndMins && slotEndMins > lunchStartMins) {
                        isLunch = true;
                    }
                }
                if (isLunch) continue;

                // Check overlaps
                let overlap = false;
                for (let appt of appts) {
                    if (!appt.time) continue;
                    const aParts = appt.time.split(':');
                    const aH = parseInt(aParts[0]);
                    const aM = parseInt(aParts[1]);
                    
                    let aDuration = appt.duration || 30;
                    if (!appt.duration && window.BusinessSettings && window.BusinessSettings.services) {
                        const srv = window.BusinessSettings.services.find(s => s.name === appt.service);
                        if (srv && srv.duration) aDuration = srv.duration;
                    }
                    
                    let aEndH = aH;
                    let aEndM = aM + aDuration;
                    while (aEndM >= 60) {
                        aEndH += 1;
                        aEndM -= 60;
                    }
                    
                    const apptStartMins = aH * 60 + aM;
                    const apptEndMins = aEndH * 60 + aEndM;
                    
                    if (slotStartMins < apptEndMins && slotEndMins > apptStartMins) {
                        overlap = true;
                        break;
                    }
                }
                
                if (!overlap) {
                    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    times.push(timeStr);
                }
            }
        }
        
        return times;
    };

    window.updateSmartCalendar = async function() {
        const modal = document.getElementById('modal-nueva-cita');
        if (!modal) return;
        const selects = modal.querySelectorAll('.selected-value');
        if (selects.length < 3) return;
        
        const timeSelectContainer = modal.querySelectorAll('.custom-select-container')[0];
        const serviceName = selects[1].textContent.trim();
        const profName = selects[2].textContent.trim();
        
        if (serviceName.includes('Elige un') || !profName) return;

        let duration = 30; // default
        if (window.BusinessSettings && window.BusinessSettings.services) {
            const srv = window.BusinessSettings.services.find(s => s.name === serviceName);
            if (srv && srv.duration) duration = srv.duration;
        }
        
        const inputsTextCalendar = modal.querySelectorAll('input[type="text"]');
        const dateInput = inputsTextCalendar.length > 1 ? inputsTextCalendar[1] : null;
        if (!dateInput) return;
        
        let currentDate = new Date();
        if (dateInput.value && dateInput.value.includes('/')) {
            const parts = dateInput.value.split('/');
            currentDate = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
        }
        
        let foundDate = false;
        let finalTimes = [];
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(currentDate.getDate() + i);
            
            if (window.BusinessSettings && window.BusinessSettings.closedDays.includes(checkDate.getDay())) {
                continue;
            }
            
            const today = new Date();
            today.setHours(0,0,0,0);
            if (checkDate < today) continue;
            
            const dateStr = `${checkDate.getDate().toString().padStart(2, '0')}/${(checkDate.getMonth()+1).toString().padStart(2, '0')}/${checkDate.getFullYear()}`;
            
            const availableTimes = await window.calculateAvailableTimes(dateStr, duration, profName);
            if (availableTimes.length > 0) {
                if (dateInput.value !== dateStr) {
                    dateInput.value = dateStr;
                }
                foundDate = true;
                finalTimes = availableTimes;
                break;
            }
        }
        
        // Update Time Dropdown
        if (finalTimes.length === 0) finalTimes = ['--:-- (Vacío)'];
        window.populateDropdown(timeSelectContainer, finalTimes, finalTimes[0]);
    };

    window.refreshTimeDropdown = async function(dateStr, timeSelectContainer) {
        if (!timeSelectContainer) return;
        const modal = document.getElementById('modal-nueva-cita');
        const selects = modal ? modal.querySelectorAll('.selected-value') : [];
        const serviceName = selects.length > 1 ? selects[1].textContent.trim() : '';
        const profName = selects.length > 2 ? selects[2].textContent.trim() : '';
        
        let duration = 30;
        if (window.BusinessSettings && window.BusinessSettings.services) {
            const srv = window.BusinessSettings.services.find(s => s.name === serviceName);
            if (srv && srv.duration) duration = srv.duration;
        }
        
        const times = await window.calculateAvailableTimes(dateStr, duration, profName);
        if (times.length === 0) times.push('--:-- (Vacío)');
        window.populateDropdown(timeSelectContainer, times, times[0]);
    };

    window.populateDropdown = function(selectContainer, optionsArray, defaultValue) {
        if (!selectContainer) return;
        const optionsDiv = selectContainer.querySelector('.custom-select-options');
        const selectedValueSpan = selectContainer.querySelector('.selected-value');
        if (!optionsDiv || !selectedValueSpan) return;

        let html = '';
        optionsArray.forEach(opt => {
            html += `<div class="custom-option">${opt}</div>`;
        });
        optionsDiv.innerHTML = html;

        if (defaultValue !== undefined) {
            selectedValueSpan.textContent = defaultValue;
            selectedValueSpan.style.color = defaultValue.includes('--') ? '#94a3b8' : 'var(--portal-text-main)';
        }

        const newOptions = optionsDiv.querySelectorAll('.custom-option');
        newOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedValueSpan.textContent = option.textContent;
                if (option.textContent.includes('--')) {
                    selectedValueSpan.style.color = '#94a3b8';
                } else {
                    selectedValueSpan.style.color = 'var(--portal-text-main)';
                }
                selectContainer.classList.remove('open');
                selectContainer.dispatchEvent(new Event('dropdownChange'));
            });
        });
    };

    window.openNuevaCitaModal = async function(prefilledClientName = '', prefilledTime = '') {
        if (modalNuevaCita) {
            modalNuevaCita.classList.add('active');
            const inputCliente = modalNuevaCita.querySelector('input[placeholder*="Buscar por nombre"]');
            if (inputCliente) {
                inputCliente.value = prefilledClientName || '';
                if (window.attachClientAutocomplete && !inputCliente.hasAttribute('data-ac-bound')) {
                    window.attachClientAutocomplete(inputCliente);
                    inputCliente.setAttribute('data-ac-bound', 'true');
                }
            }

            const selects = modalNuevaCita.querySelectorAll('.custom-select-container');
            if (selects.length > 0 && prefilledTime) {
                const timeValue = selects[0].querySelector('.selected-value');
                if (timeValue) timeValue.textContent = prefilledTime;
            }
            
            const inputsTextCalendar = modalNuevaCita.querySelectorAll('input[type="text"]');
            if (inputsTextCalendar.length > 1) {
                const dateInput = inputsTextCalendar[1];
                
                // Pre-fill with today's date if empty or invalid
                if (!dateInput.value || !dateInput.value.includes('/')) {
                    let now = new Date();
                    
                    // Check if there are hours available today.
                    const openEnd = window.BusinessSettings && window.BusinessSettings.openHours ? parseInt(window.BusinessSettings.openHours.end.split(':')[0]) : 19;
                    if (now.getHours() >= openEnd) {
                        now.setDate(now.getDate() + 1);
                    }
                    
                    // Skip closed days
                    const closedDays = window.BusinessSettings ? window.BusinessSettings.closedDays : [0];
                    while (closedDays.includes(now.getDay())) {
                        now.setDate(now.getDate() + 1);
                    }
                    
                    dateInput.value = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;
                }
                
                if (window.attachMiniCalendar) {
                    window.attachMiniCalendar(dateInput);
                }
            }
            
            if (selects.length >= 3 && window.populateDropdown) {
                // Bind listeners to Service and Prof to trigger Smart Calendar
                if (!selects[1].hasAttribute('data-smart-bound')) {
                    selects[1].addEventListener('dropdownChange', () => {
                        window.updateSmartCalendar();
                        if (window.refreshMiniCalendar) window.refreshMiniCalendar();
                    });
                    selects[1].setAttribute('data-smart-bound', 'true');
                }
                if (!selects[2].hasAttribute('data-smart-bound')) {
                    selects[2].addEventListener('dropdownChange', () => {
                        window.updateSmartCalendar();
                        if (window.refreshMiniCalendar) window.refreshMiniCalendar();
                    });
                    selects[2].setAttribute('data-smart-bound', 'true');
                }
                
                // Initial refresh based on current date
                const dateStr = inputsTextCalendar.length > 1 ? inputsTextCalendar[1].value : null;
                window.refreshTimeDropdown(dateStr, selects[0]);


                if (!window.serviceOptionsLoaded) {
                    let servicesList = (window.BusinessSettings && window.BusinessSettings.services) 
                        ? window.BusinessSettings.services.map(s => s.name) 
                        : [];
                    if (servicesList.length === 0) {
                        servicesList = ["Corte Clásico", "Corte + Barba", "Tinte y Mechas", "Manicura Semipermanente", "Masaje Relajante", "Tratamiento Facial"];
                    }
                    window.populateDropdown(selects[1], servicesList, 'Elige un servicio...');
                    window.serviceOptionsLoaded = true;
                }

                if (!window.teamOptionsLoaded && window.MockAPI) {
                    try {
                        const team = await window.MockAPI.getTeam();
                        const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
                        const teamNames = ['Cualquier Disponible', ...team.map(t => t.name), currentUserName];
                        window.populateDropdown(selects[2], teamNames, 'Cualquier Disponible');
                        window.teamOptionsLoaded = true;
                    } catch (e) {
                        console.error('Error loading team for dropdown', e);
                    }
                }
            }
        }
    };

    function openModal(e) {
        if (e && e.preventDefault) e.preventDefault();
        window.openNuevaCitaModal();
    }

    function closeModal() {
        if (modalNuevaCita) modalNuevaCita.classList.remove('active');
    }

    if (btnNewCita) {
        btnNewCita.addEventListener('click', openModal);
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
    }

    if (btnCancelModal) {
        btnCancelModal.addEventListener('click', closeModal);
    }

    
    const btnAddClientFromModal = document.querySelector('.btn-add-client-modal');
    if (btnAddClientFromModal) {
        btnAddClientFromModal.addEventListener('click', () => {
            closeModal();
            if (window.openNuevoClienteModal) {
                window.openNuevoClienteModal(true);
            }
        });
    }


    const btnSaveNewAppt = modalNuevaCita.querySelector('.btn-save');
    if (btnSaveNewAppt && !btnSaveNewAppt.hasAttribute('data-bound')) {
        btnSaveNewAppt.setAttribute('data-bound', 'true');
        btnSaveNewAppt.addEventListener('click', async () => {
            const inputCliente = modalNuevaCita.querySelector('input[placeholder*="Buscar por nombre"]');
            const inputsText = modalNuevaCita.querySelectorAll('input[type="text"]');
            const selects = modalNuevaCita.querySelectorAll('.selected-value');

            const clientName = inputCliente ? inputCliente.value.trim() : '';
            const rawDate = inputsText.length > 1 ? inputsText[1].value.trim() : '';
            const timeStr = selects.length > 0 ? selects[0].textContent.trim() : '';
            const service = selects.length > 1 ? selects[1].textContent.trim() : '';
            const prof = selects.length > 2 ? selects[2].textContent.trim() : '';

            if (!clientName) {
                if (window.showToast) window.showToast('Error de Validación', 'Debes especificar un cliente.', 'error');
                return;
            }

            if (!rawDate || timeStr.includes('--') || timeStr.includes('Vacío')) {
                if (window.showToast) window.showToast('Error de Validación', 'Debes especificar la fecha y hora de la cita.', 'error');
                return;
            }

            if (!service || service.includes('Elige un servicio') || service.includes('--')) {
                if (window.showToast) window.showToast('Error de Validación', 'Debes seleccionar un servicio.', 'error');
                return;
            }

            const originalText = btnSaveNewAppt.innerHTML;
            btnSaveNewAppt.innerHTML = '<svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite; margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg> Guardando...';
            btnSaveNewAppt.disabled = true;

            const monthNames = { '01': 'ENE', '02': 'FEB', '03': 'MAR', '04': 'ABR', '05': 'MAY', '06': 'JUN', '07': 'JUL', '08': 'AGO', '09': 'SEP', '10': 'OCT', '11': 'NOV', '12': 'DIC' };
            let formattedDate = rawDate + ', ' + timeStr;
            let apiRawDate = rawDate;
            if (rawDate.includes('/')) {
                const parts = rawDate.split('/');
                if (parts.length === 3) {
                    const m = monthNames[parts[1]] || parts[1];
                    formattedDate = `${parts[0]} ${m} ${parts[2]}, ${timeStr}`;
                    apiRawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }

            let duration = 30;
            if (window.BusinessSettings && window.BusinessSettings.services) {
                const srv = window.BusinessSettings.services.find(s => s.name === service);
                if (srv && srv.duration) duration = srv.duration;
            }

            let finalProf = prof;
            if (finalProf === 'Cualquier Disponible' && window.MockAPI) {
                const team = await window.MockAPI.getTeam();
                let foundProf = null;
                const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
                for (let t of [...team, {name: currentUserName}]) {
                    const times = await window.calculateAvailableTimes(rawDate, duration, t.name);
                    if (times.includes(timeStr)) {
                        foundProf = t.name;
                        break;
                    }
                }
                if (foundProf) {
                    finalProf = foundProf;
                } else {
                    if (window.showToast) window.showToast('Error', 'No hay ningún profesional disponible en ese horario.', 'error');
                    btnSaveNewAppt.innerHTML = originalText;
                    btnSaveNewAppt.disabled = false;
                    return;
                }
            }

            try {
                if (window.MockAPI && window.MockAPI.addAppointment) {
                    await window.MockAPI.addAppointment(clientName, {
                        date: apiRawDate,
                        time: timeStr,
                        rawDate: apiRawDate,
                        formattedDate: formattedDate,
                        service: service,
                        prof: finalProf,
                        duration: duration
                    });
                }

                if (window.showToast) window.showToast('Éxito', 'La cita se ha programado correctamente.', 'success');
                if (typeof closeModal === 'function') closeModal();

                // Clear fields
                if (inputCliente) inputCliente.value = '';
                
                // Refresh current view (Clientes)
                if (typeof window.resetClientSearch === 'function') window.resetClientSearch();
                // Refresh Agenda
                if (typeof window.refreshAgenda === 'function') window.refreshAgenda();
                // Refresh Dashboard
                if (typeof window.renderDashboard === 'function') window.renderDashboard();
            } catch(e) {
                if (window.showToast) window.showToast('Error', 'Hubo un problema al guardar la cita.', 'error');
            } finally {
                btnSaveNewAppt.innerHTML = originalText;
                btnSaveNewAppt.disabled = false;
            }
        });
    }

    if (modalNuevaCita) {
        modalNuevaCita.addEventListener('click', (e) => {
            if (e.target === modalNuevaCita) {
                closeModal();
            }
        });
    }

    // --- Popover de Notificaciones ---
    const modalNotificaciones = document.getElementById('modal-notificaciones');
    const btnOpenNotificaciones = document.getElementById('btn-open-notificaciones');

    function openNotificaciones() {
        if (modalNotificaciones && btnOpenNotificaciones) {
            closeModal();
            modalNotificaciones.classList.add('active');
            btnOpenNotificaciones.classList.add('active');
        }
    }

    function closeNotificaciones() {
        if (modalNotificaciones && btnOpenNotificaciones) {
            modalNotificaciones.classList.remove('active');
            btnOpenNotificaciones.classList.remove('active');
        }
    }

    if (btnOpenNotificaciones) {
        btnOpenNotificaciones.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (modalNotificaciones.classList.contains('active')) {
                closeNotificaciones();
            } else {
                openNotificaciones();
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (modalNotificaciones && modalNotificaciones.classList.contains('active')) {
            if (!modalNotificaciones.contains(e.target) && e.target !== btnOpenNotificaciones) {
                closeNotificaciones();
            }
        }
    });

    // --- Lógica de los Custom Selects (Desplegables Bonitos) ---
    const customSelects = document.querySelectorAll('.custom-select-container');

    customSelects.forEach(container => {
        const trigger = container.querySelector('.custom-select-trigger');
        const options = container.querySelectorAll('.custom-option');
        const selectedValue = container.querySelector('.selected-value');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            customSelects.forEach(otherContainer => {
                if (otherContainer !== container) {
                    otherContainer.classList.remove('open');
                }
            });
            
            container.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedValue.textContent = option.textContent;
                
                if (option.textContent.includes('--')) {
                    selectedValue.style.color = '#94a3b8';
                } else {
                    selectedValue.style.color = 'var(--portal-text-main)';
                }

                container.classList.remove('open');
                container.dispatchEvent(new Event('dropdownChange'));
            });
        });
    });

    document.addEventListener('click', () => {
        customSelects.forEach(container => {
            container.classList.remove('open');
        });
    });

});

// --- Lógica del Mini Calendario ---
document.addEventListener('DOMContentLoaded', () => {
    // Crear el contenedor del popover
    const calendarPopover = document.createElement('div');
    calendarPopover.className = 'mini-calendar-popover';
    document.body.appendChild(calendarPopover);

    let currentTargetInput = null;
    let currentDate = new Date(); // Mes y año visualizados
    let selectedDate = new Date(); // Fecha real seleccionada

    window.refreshMiniCalendar = function() {
        if (calendarPopover.classList.contains('active')) {
            renderCalendar();
        }
    };

    function renderCalendar() {
        calendarPopover.innerHTML = '';

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Header
        const header = document.createElement('div');
        header.className = 'mc-header';
        
        const today = new Date();

        const prevBtn = document.createElement('button');
        prevBtn.className = 'mc-btn';
        prevBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        
        // Bloquear ir a meses en el pasado si estamos en el actual y no se permite el pasado
        const allowPast = currentTargetInput && currentTargetInput.hasAttribute('data-allow-past');
        
        if (!allowPast && currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth()) {
            prevBtn.style.opacity = '0.3';
            prevBtn.style.cursor = 'default';
        } else {
            prevBtn.onclick = (e) => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
        }
        
        const monthYear = document.createElement('div');
        monthYear.className = 'mc-month-year';
        monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'mc-btn';
        nextBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        
        let maxAllowedDate = null;
        if (currentTargetInput && currentTargetInput.getAttribute('data-max-date') === '18-years-ago') {
            maxAllowedDate = new Date();
            maxAllowedDate.setFullYear(today.getFullYear() - 18);
        }

        if (maxAllowedDate && currentDate.getFullYear() === maxAllowedDate.getFullYear() && currentDate.getMonth() === maxAllowedDate.getMonth()) {
            nextBtn.style.opacity = '0.3';
            nextBtn.style.cursor = 'default';
        } else {
            nextBtn.onclick = (e) => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
        }
        
        header.appendChild(prevBtn);
        header.appendChild(monthYear);
        header.appendChild(nextBtn);
        calendarPopover.appendChild(header);

        // Weekdays
        const weekdays = document.createElement('div');
        weekdays.className = 'mc-weekdays';
        ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].forEach(day => {
            const d = document.createElement('div');
            d.textContent = day;
            weekdays.appendChild(d);
        });
        calendarPopover.appendChild(weekdays);

        // Days Grid
        const daysGrid = document.createElement('div');
        daysGrid.className = 'mc-days';

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Adjust for Monday start (0 becomes 6, 1 becomes 0)
        let startOffset = firstDay === 0 ? 6 : firstDay - 1;

        // Empty slots
        for (let i = 0; i < startOffset; i++) {
            const empty = document.createElement('div');
            empty.className = 'mc-day empty';
            daysGrid.appendChild(empty);
        }

        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'mc-day';
            dayDiv.textContent = i;
            
            // Check if it's today
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                dayDiv.classList.add('today');
            }

            // Check if selected
            if (year === selectedDate.getFullYear() && month === selectedDate.getMonth() && i === selectedDate.getDate()) {
                dayDiv.classList.add('selected');
            }

            // Disable past days AND closed days
            const thisDayDate = new Date(year, month, i);
            let todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            // Si hay un input de referencia para la fecha mínima
            if (currentTargetInput) {
                if (currentTargetInput.hasAttribute('data-disable-today')) {
                    // Mover la fecha de inicio a mañana para bloquear hoy
                    todayStart.setDate(todayStart.getDate() + 1);
                }

                const minDateSelector = currentTargetInput.getAttribute('data-min-date-input');
                if (minDateSelector) {
                    const minInput = document.querySelector(minDateSelector);
                    if (minInput && minInput.value && minInput.value.includes('/')) {
                        const parts = minInput.value.split('/');
                        if (parts.length === 3) {
                            const minDateVal = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
                            if (minDateVal > todayStart) todayStart = minDateVal;
                        }
                    }
                }
            }

            let isPast = thisDayDate < todayStart;
            let isClosed = window.BusinessSettings && window.BusinessSettings.closedDays.includes(thisDayDate.getDay());
            let isDayOff = false;

            // Check professional day off
            if (!isClosed && window.BusinessTeam && currentTargetInput) {
                const modal = currentTargetInput.closest('.modal-container');
                if (modal) {
                    const selects = modal.querySelectorAll('.selected-value');
                    const profName = selects.length > 2 ? selects[2].textContent.trim() : '';
                    if (profName && profName !== 'Cualquier Disponible' && !profName.includes('Elige')) {
                        const profObj = window.BusinessTeam.find(t => t.name === profName);
                        if (profObj && profObj.diasLibres && profObj.diasLibres.includes(thisDayDate.getDay())) {
                            isDayOff = true;
                        }
                    }
                }
            }
            
            // Override locks if input allows them
            if (currentTargetInput) {
                if (currentTargetInput.hasAttribute('data-allow-past')) {
                    isPast = false;
                }
                if (currentTargetInput.hasAttribute('data-allow-all-days')) {
                    isClosed = false;
                    isDayOff = false;
                }
                if (currentTargetInput.getAttribute('data-max-date') === '18-years-ago') {
                    let maxAllowedDate = new Date();
                    maxAllowedDate.setFullYear(new Date().getFullYear() - 18);
                    if (thisDayDate > maxAllowedDate) {
                        isPast = true; // Use the same empty class logic
                    }
                }
            }

            if (isPast || isClosed || isDayOff) {
                dayDiv.classList.add('empty');
                if ((isClosed || isDayOff) && !isPast) {
                    dayDiv.classList.add('closed-day');
                } else {
                    dayDiv.style.opacity = '0.3';
                }
                if (isClosed) dayDiv.title = 'Día cerrado';
                if (isDayOff) dayDiv.title = 'Día de descanso del profesional';
            } else {
                dayDiv.onclick = (e) => {
                    e.stopPropagation();
                    selectedDate = new Date(year, month, i);
                    
                    // Update input
                    if (currentTargetInput) {
                        const dStr = i.toString().padStart(2, '0');
                        const mStr = (month + 1).toString().padStart(2, '0');
                        currentTargetInput.value = `${dStr}/${mStr}/${year}`;
                        currentTargetInput.dispatchEvent(new Event('change'));
                        
                        // Refresh time dropdown to block past times if today is selected
                        if (window.refreshTimeDropdown) {
                            const modal = currentTargetInput.closest('.modal-container');
                            if (modal) {
                                const timeSelect = modal.querySelectorAll('.custom-select-container')[0];
                                if (timeSelect) {
                                    window.refreshTimeDropdown(currentTargetInput.value, timeSelect);
                                }
                            }
                        }
                    }
                    
                    calendarPopover.classList.remove('active');
                };
            }
            daysGrid.appendChild(dayDiv);
        }

        calendarPopover.appendChild(daysGrid);
    }

    // Attach to inputs
    window.attachMiniCalendar = function(inputElement) {
        if (!inputElement) return;
        
        // Prevent default text editing if desired, or let them type. We'll make it readonly to ensure perfect formatting.
        inputElement.setAttribute('readonly', 'true');
        inputElement.style.cursor = 'pointer';

        inputElement.addEventListener('click', (e) => {
            e.stopPropagation();
            currentTargetInput = inputElement;
            
            // Parse current value if exists
            if (inputElement.value && inputElement.value.includes('/')) {
                const parts = inputElement.value.split('/');
                if (parts.length === 3) {
                    selectedDate = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
                    currentDate = new Date(selectedDate);
                }
            } else {
                selectedDate = new Date();
                if (inputElement.hasAttribute('data-disable-today')) {
                    selectedDate.setDate(selectedDate.getDate() + 1);
                }
                currentDate = new Date(selectedDate);
            }

            renderCalendar();

            // Position Popover
            const rect = inputElement.getBoundingClientRect();
            calendarPopover.style.left = rect.left + 'px';
            calendarPopover.style.top = (rect.bottom + window.scrollY + 8) + 'px';
            calendarPopover.classList.add('active');
        });
    };

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!calendarPopover.contains(e.target) && e.target !== currentTargetInput) {
            calendarPopover.classList.remove('active');
        }
    });
});


// --- Lógica del Buscador de Cliente (Autocomplete) ---
document.addEventListener('DOMContentLoaded', () => {
    const autocompletePopover = document.createElement('div');
    autocompletePopover.className = 'autocomplete-popover';
    document.body.appendChild(autocompletePopover);

    let currentInput = null;
    let debounceTimer;

    window.attachClientAutocomplete = function(inputElement) {
        if (!inputElement) return;

        inputElement.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            currentInput = inputElement;

            if (query.length < 2) {
                autocompletePopover.classList.remove('active');
                return;
            }

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                if (!window.MockAPI) return;
                try {
                    const clients = await window.MockAPI.getClients();
                    
                    const filtered = clients.filter(c => 
                        c.name.toLowerCase().includes(query) || 
                        (c.phone && c.phone.includes(query))
                    );

                    if (filtered.length === 0) {
                        autocompletePopover.innerHTML = '<div class="autocomplete-item" style="cursor:default;"><span class="ac-phone">No se encontraron clientes</span></div>';
                    } else {
                        autocompletePopover.innerHTML = '';
                        filtered.forEach(client => {
                            const div = document.createElement('div');
                            div.className = 'autocomplete-item';
                            div.innerHTML = `<span class="ac-name">${client.name}</span><span class="ac-phone">${client.phone}</span>`;
                            div.onclick = (ev) => {
                                ev.stopPropagation();
                                inputElement.value = client.name;
                                autocompletePopover.classList.remove('active');
                            };
                            autocompletePopover.appendChild(div);
                        });
                    }

                    const rect = inputElement.getBoundingClientRect();
                    autocompletePopover.style.width = rect.width + 'px';
                    autocompletePopover.style.left = rect.left + 'px';
                    autocompletePopover.style.top = (rect.bottom + window.scrollY + 4) + 'px';
                    autocompletePopover.classList.add('active');
                } catch(e) {
                    console.error('Error fetching clients for autocomplete', e);
                }
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (e.target !== currentInput && !autocompletePopover.contains(e.target)) {
                autocompletePopover.classList.remove('active');
            }
        });
    };
});


document.addEventListener('DOMContentLoaded', async () => {
    window.BusinessSettings = { closedDays: [0] }; // Default: Closed on Sunday
    window.BusinessTeam = [];
    if (window.MockAPI) {
        try {
            window.BusinessSettings = await window.MockAPI.getSettings();
            const team = await window.MockAPI.getTeam();
            const currentUser = window.MockAPI?.state?.currentUser;
            const currentUserName = currentUser?.name || 'Propietario';
            const currentUserAvatar = currentUser?.avatar || '../Images/Avatars/alejandro.png';
            
            window.BusinessTeam = [{name: currentUserName, diasLibres: [1], pausaAlmuerzo: { start: '14:00', end: '15:00' }}, ...team];

            // Update UI elements representing the current user
            
            // Update Avatar images
            const cardAvatar = document.querySelector('#btn-mi-cuenta img');
            if (cardAvatar) cardAvatar.src = currentUserAvatar;
            
            const miCuentaAvatar = document.querySelector('.avatar-image');
            if (miCuentaAvatar) miCuentaAvatar.src = currentUserAvatar;

            // Update Mi Cuenta Inputs
            const loadUserData = (user) => {
                const inputNombre = document.getElementById('mi-cuenta-nombre');
                if (inputNombre) inputNombre.value = user.name || '';
                
                const inputEmail = document.getElementById('mi-cuenta-email');
                if (inputEmail) inputEmail.value = user.email || '';
                
                const inputTelefono = document.getElementById('mi-cuenta-telefono');
                if (inputTelefono) inputTelefono.value = user.phone || '';
                
                const inputFechaNacimiento = document.getElementById('mi-cuenta-fecha-nacimiento');
                if (inputFechaNacimiento) inputFechaNacimiento.value = user.birthDate || '';
                
                const inputCorreoPersonal = document.getElementById('mi-cuenta-correo-personal');
                if (inputCorreoPersonal) inputCorreoPersonal.value = user.personalEmail || '';
                
                const inputDireccion = document.getElementById('mi-cuenta-direccion');
                if (inputDireccion) inputDireccion.value = user.address || '';
                
                const inputPassword = document.getElementById('mi-cuenta-password');
                // Dejar la contraseña vacía por defecto
                if (inputPassword) inputPassword.value = '';
            };

            localStorage.removeItem('currentUserData');
            fetch('../Data/user.json')
                .then(res => res.json())
                .then(user => {
                    localStorage.setItem('currentUserData', JSON.stringify(user));
                    loadUserData(user);
                })
                .catch(e => {
                    console.error('Error loading user.json', e);
                    // Fallback local
                    const defaultUser = { "id": 0, "name": "Propietario ALIA", "role": "Owner", "avatarUrl": "../Images/Avatars/alejandro.png" };
                    loadUserData(defaultUser);
                });

            // Gestión de Servicios (Portal del Negocio)
            window.currentServices = [];
            window.currentReminders = [{ time: 24, unit: 'horas' }];
            window.currentAutoConfirm = true;
            
            window.saveServicesToStorage = () => {
                const cachedBusiness = localStorage.getItem('currentBusinessData');
                if (cachedBusiness) {
                    const config = JSON.parse(cachedBusiness);
                    config.services = window.currentServices;
                    localStorage.setItem('currentBusinessData', JSON.stringify(config));
                    
                    const modalNuevaCita = document.getElementById('modal-nueva-cita');
                    if (modalNuevaCita) {
                        const selects = modalNuevaCita.querySelectorAll('.custom-select-container');
                        if (selects.length >= 3 && window.populateDropdown) {
                            const serviceNames = window.currentServices.map(s => s.name);
                            window.populateDropdown(selects[1], serviceNames, '-- Seleccionar --');
                        }
                    }
                }
            };
            
            window.renderServicesList = () => {
                const listContainer = document.querySelector('.pn-service-list');
                if (!listContainer) return;
                
                if (!window.currentServices || window.currentServices.length === 0) {
                    listContainer.innerHTML = `<div style="padding: 32px 20px; text-align: center; color: #94a3b8; font-size: 0.95rem;">No hay servicios configurados</div>`;
                } else {
                    let html = '';
                    window.currentServices.forEach((srv, index) => {
                        const priceStr = srv.price ? ` - ${srv.price}€` : '';
                        const srvIcon = window.getServiceIconSVG(srv.icon || srv.name, "#64748b", "16");
                        html += `
                        <div class="pn-service-item" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                    ${srvIcon}
                                </div>
                                <div>
                                    <strong style="color: #0f172a; font-size: 0.95rem;">${srv.name}</strong><br>
                                    <small style="color: #64748b; font-size: 0.85rem;">${srv.duration} min${priceStr}</small>
                                </div>
                            </div>
                            <button class="pn-btn-delete-service" data-index="${index}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                        `;
                    });
                    listContainer.innerHTML = html;
                    
                    // Bind delete buttons
                    const deleteBtns = listContainer.querySelectorAll('.pn-btn-delete-service');
                    deleteBtns.forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                            const removedName = window.currentServices[idx].name;
                            window.currentServices.splice(idx, 1);
                            window.renderServicesList();
                            window.saveServicesToStorage();
                            window.showToast("Servicio Eliminado", `El servicio "${removedName}" se ha quitado del catálogo.`, "error");
                        });
                    });
                }
            };
            
            window.renderRemindersList = () => {
                const listContainer = document.getElementById('pn-reminder-list');
                if (!listContainer) return;
                
                if (!window.currentReminders || window.currentReminders.length === 0) {
                    listContainer.innerHTML = `<div style="text-align: center; padding: 32px; border: 1px dashed #e2e8f0; border-radius: 12px; margin-top: 16px; color: #94a3b8; margin-bottom: 24px;">No hay recordatorios configurados. Añade uno para que tus clientes no olviden su cita.</div>`;
                } else {
                    let html = '';
                    window.currentReminders.forEach((rem, index) => {
                        const labelNum = index + 1;
                        html += `
                        <div style="margin-top: 16px;">
                            <label style="display:block; color:#94a3b8; font-size:0.75rem; font-weight:700; margin-bottom:4px; letter-spacing:0.5px;">RECORDATORIO ${labelNum}</label>
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                                <div style="flex:1; background:#f8fafc; border-radius:12px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
                                    <span style="color:#0f172a; font-weight:500;">${rem.time} ${rem.unit} antes</span>
                                </div>
                                <button class="pn-btn-delete-reminder" data-index="${index}" style="background:none; border:none; color:#0891b2; cursor:pointer; padding:8px; border-radius:8px; transition: background 0.2s;" onmouseover="this.style.background='#ecfeff'" onmouseout="this.style.background='transparent'">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                        `;
                    });
                    listContainer.innerHTML = html;
                    
                    const deleteBtns = listContainer.querySelectorAll('.pn-btn-delete-reminder');
                    deleteBtns.forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                            window.currentReminders.splice(idx, 1);
                            window.renderRemindersList();
                            if (window.saveIAConfigToStorage) window.saveIAConfigToStorage(true);
                        });
                    });
                }
            };

            // Cargar Portal del Negocio
            const loadBusinessData = (config) => {
                const pnNombre = document.getElementById('pn-nombre');
                if (pnNombre) pnNombre.value = config.name || '';
                
                const pnTelefono = document.getElementById('pn-telefono');
                if (pnTelefono) pnTelefono.value = config.phone || '';
                
                const pnDireccion = document.getElementById('pn-direccion');
                if (pnDireccion) pnDireccion.value = config.address || '';
                
                const pnHoraApertura = document.getElementById('pn-hora-apertura');
                if (pnHoraApertura && config.businessHours) pnHoraApertura.value = config.businessHours.start || '';
                
                const pnHoraCierre = document.getElementById('pn-hora-cierre');
                if (pnHoraCierre && config.businessHours) pnHoraCierre.value = config.businessHours.end || '';
                
                const pnTonoIa = document.getElementById('pn-tono-ia');
                if (pnTonoIa && config.aiSettings) pnTonoIa.textContent = config.aiSettings.tone || 'Informal';
                
                const pnPromptIa = document.getElementById('pn-prompt-ia');
                if (pnPromptIa && config.aiSettings) pnPromptIa.value = config.aiSettings.prompt || '';
                
                if (config.services) {
                    window.currentServices = [...config.services];
                    window.renderServicesList();
                    
                    // Actualizar desplegable "Nueva Cita"
                    const modalNuevaCita = document.getElementById('modal-nueva-cita');
                    if (modalNuevaCita) {
                        const selects = modalNuevaCita.querySelectorAll('.custom-select-container');
                        if (selects.length >= 3 && window.populateDropdown) {
                            const serviceNames = window.currentServices.map(s => s.name);
                            window.populateDropdown(selects[1], serviceNames, '-- Seleccionar --');
                        }
                    }
                }
                
                if (config.aiSettings) {
                    if (config.aiSettings.reminders) {
                        window.currentReminders = [...config.aiSettings.reminders];
                    }
                    window.renderRemindersList();
                    
                    if (config.aiSettings.autoConfirm !== undefined) {
                        window.currentAutoConfirm = config.aiSettings.autoConfirm;
                        const toggleThumb = document.querySelector('#auto-confirm-toggle div');
                        const toggleBg = document.getElementById('auto-confirm-toggle');
                        if (toggleThumb && toggleBg) {
                            if (window.currentAutoConfirm) {
                                toggleBg.style.backgroundColor = '#0891b2';
                                toggleThumb.style.left = '22px';
                            } else {
                                toggleBg.style.backgroundColor = '#cbd5e1';
                                toggleThumb.style.left = '2px';
                            }
                        }
                    }
                }
            };

            localStorage.removeItem('currentBusinessData');
            fetch('../Data/business-config.json')
                .then(res => res.json())
                .then(config => {
                    localStorage.setItem('currentBusinessData', JSON.stringify(config));
                    loadBusinessData(config);
                })
                .catch(e => {
                    console.error('Error loading business-config.json', e);
                    // Fallback local básico
                    const defaultConfig = {
                        "name": "ALIA Beauty",
                        "services": [
                            {"id": "s1", "name": "Corte de Pelo", "duration": 30, "price": 15},
                            {"id": "s2", "name": "Tinte", "duration": 60, "price": 40}
                        ],
                        "reminders": [{ "time": 24, "unit": "horas" }],
                        "aiPersona": "Profesional y cercana",
                        "instructions": "Eres ALIA, la recepcionista virtual."
                    };
                    loadBusinessData(defaultConfig);
                })
                .finally(() => {
                    // Quitar el overlay de carga si existe, una vez el UI está poblado
                    const loader = document.getElementById('data-loading-overlay');
                    if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(() => loader.remove(), 400);
                    }
                });

            // Update "Mi Equipo" self user
            const eqProfName = document.querySelector('.eq-prof-name');
            if (eqProfName && eqProfName.textContent.includes('(Tú)')) {
                eqProfName.textContent = currentUserName + ' (Tú)';
            }
            const eqProfEmail = document.querySelector('.eq-prof-email');
            if (eqProfEmail && eqProfEmail.textContent.includes('usuario@')) {
                eqProfEmail.textContent = currentUser?.email || 'propietario@alia.com';
            }
            
            // Note: Agenda headers are generated dynamically in agenda.js using BusinessTeam and displayTeam.
        } catch(e) {
            console.error("Error fetching settings or team", e);
        }
    }
    
    // Bloquear interacciones en Soporte (Prototipo) con acciones específicas
    const soportePage = document.getElementById('page-soporte');
    if (soportePage) {
        const showWarning = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.showToast) {
                window.showToast('Prototipo visual', 'Esta sección de soporte es solo una demostración visual y no es funcional.', 'warning');
            }
        };

        // 1. Clics específicos
        soportePage.addEventListener('click', (e) => {
            const specificClickable = e.target.closest(
                '.custom-select-trigger, ' +      // Desplegable de categoría
                '.file-drop-zone, ' +             // Captura de pantalla
                '.btn-support-action, ' +         // Chat y Llamada
                '.kb-list a, ' +                  // Artículos
                '.kb-footer a, ' +                // Ver todos
                '.btn-purple-action'              // Enviar ticket (por si acaso)
            );
            
            if (specificClickable) {
                showWarning(e);
            }
        }, true);

        // 2. Tecla Enter en cajas de texto
        soportePage.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const isTextBox = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
                if (isTextBox) {
                    showWarning(e);
                }
            }
        }, true);
    }

    // ==========================================
    // THEME (DARK MODE) LOGIC
    // ==========================================
    const themeControl = document.getElementById('theme-segmented-control');
    const portalContainer = document.querySelector('.portal-container');
    
    if (themeControl && portalContainer) {
        const segments = themeControl.querySelectorAll('.segment');
        
        const applyTheme = (themeName) => {
            let isDark = false;
            if (themeName === 'oscuro') {
                isDark = true;
            } else if (themeName === 'sistema') {
                isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            }

            if (isDark) {
                portalContainer.classList.add('dark-theme');
            } else {
                portalContainer.classList.remove('dark-theme');
            }
            
            // Update UI
            segments.forEach(seg => {
                if (seg.dataset.theme === themeName) {
                    seg.classList.add('active');
                } else {
                    seg.classList.remove('active');
                }
            });
            
            localStorage.setItem('alia_theme', themeName);
        };

        // Escuchar clics en los segmentos
        segments.forEach(segment => {
            segment.addEventListener('click', () => {
                applyTheme(segment.dataset.theme);
            });
        });

        // Cargar preferencia guardada o sistema por defecto
        const savedTheme = localStorage.getItem('alia_theme') || 'claro';
        applyTheme(savedTheme);

        // Escuchar cambios a nivel sistema operativo
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (localStorage.getItem('alia_theme') === 'sistema') {
                applyTheme('sistema');
            }
        });
    }

    // --- Lógica de Navegación Interna (Ajustes) ---
    const btnMiCuenta = document.getElementById('btn-mi-cuenta');
    const btnPortalNegocio = document.getElementById('btn-portal-negocio');
    const btnBackPortal = document.getElementById('btn-back-portal');
    const btnBackMiCuenta = document.getElementById('btn-back-mi-cuenta');

    const navigateToInternalPage = (pageId, title) => {
        document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
        const page = document.getElementById(pageId);
        if (page) page.classList.add('active');
        
        const topbarTitle = document.querySelector('.topbar-title');
        if (topbarTitle) topbarTitle.textContent = title;
    };

    if (btnMiCuenta) {
        btnMiCuenta.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToInternalPage('page-mi-cuenta', 'Información de Usuario');
        });
    }

    if (btnPortalNegocio) {
        btnPortalNegocio.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToInternalPage('page-portal-negocio', 'Portal del Negocio');
        });
    }

    const goBackToAjustes = (e) => {
        e.preventDefault();
        navigateToInternalPage('page-ajustes', 'Ajustes y Preferencias');
    };

    if (btnBackPortal) btnBackPortal.addEventListener('click', goBackToAjustes);
    if (btnBackMiCuenta) btnBackMiCuenta.addEventListener('click', goBackToAjustes);

    // --- Lógica de Mostrar/Ocultar Contraseñas ---
    const passwordEyes = document.querySelectorAll('.password-eye');
    passwordEyes.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = btn.previousElementSibling;
            if (input && input.tagName === 'INPUT') {
                if (input.type === 'password') {
                    input.type = 'text';
                    // Cambiar a icono de ojo tachado (eye-off)
                    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
                } else {
                    input.type = 'password';
                    // Cambiar a icono de ojo normal (eye)
                    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
                }
            }
        });
    });

    // --- Lógica de Botones de Prototipo (Mi Cuenta) ---
    const btnUploadPhoto = document.querySelector('.btn-upload-photo');
    const btnRemovePhoto = document.querySelector('.btn-remove-photo');
    const btnsUpdate = document.querySelectorAll('.btn-update');
    
    const showPrototypeWarning = (e) => {
        e.preventDefault();
        window.showToast("Función de Prototipo", "Esta funcionalidad no está conectada en la versión de prueba.", "warning");
    };

    if (btnUploadPhoto) btnUploadPhoto.addEventListener('click', showPrototypeWarning);
    if (btnRemovePhoto) btnRemovePhoto.addEventListener('click', showPrototypeWarning);
    
    btnsUpdate.forEach(btn => {
        if (btn.id === 'btn-actualizar-datos') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('mi-cuenta-correo-personal');
                const phoneInput = document.getElementById('mi-cuenta-telefono');
                const addressInput = document.getElementById('mi-cuenta-direccion');
                
                // Validación de email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailInput && emailInput.value.trim() !== '' && !emailRegex.test(emailInput.value)) {
                    window.showToast("Error de Validación", "Por favor, introduce un correo electrónico válido.", "error");
                    return;
                }
                
                // Validación de teléfono (al menos 9 dígitos)
                if (phoneInput && phoneInput.value.trim() !== '') {
                    const digits = phoneInput.value.replace(/\D/g, '');
                    if (digits.length < 9) {
                        window.showToast("Error de Validación", "El teléfono debe contener al menos 9 dígitos.", "error");
                        return;
                    }
                }
                
                // Validación de dirección
                if (addressInput && addressInput.value.trim() === '') {
                    window.showToast("Error de Validación", "La dirección completa no puede estar vacía.", "error");
                    return;
                }
                
                // Guardar en localStorage
                const cachedUser = localStorage.getItem('currentUserData');
                if (cachedUser) {
                    const user = JSON.parse(cachedUser);
                    if (emailInput) user.personalEmail = emailInput.value.trim();
                    if (phoneInput) user.phone = phoneInput.value.trim();
                    if (addressInput) user.address = addressInput.value.trim();
                    localStorage.setItem('currentUserData', JSON.stringify(user));
                }
                
                // Si todo está correcto
                window.showToast("Datos Actualizados", "Tus datos personales se han guardado correctamente.", "success");
            });
        } else if (btn.id === 'btn-actualizar-password') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const currentPasswordInput = document.getElementById('mi-cuenta-password');
                const newPasswordInput = document.getElementById('mi-cuenta-new-password');
                const confirmPasswordInput = document.getElementById('mi-cuenta-confirm-password');
                
                // Validar que ningún campo esté vacío
                if (!currentPasswordInput || currentPasswordInput.value.trim() === '' || 
                    !newPasswordInput || newPasswordInput.value.trim() === '' ||
                    !confirmPasswordInput || confirmPasswordInput.value.trim() === '') {
                    window.showToast("Error de Validación", "Hace falta llenar todos los campos.", "error");
                    return;
                }
                
                const cachedUser = localStorage.getItem('currentUserData');
                if (cachedUser) {
                    const user = JSON.parse(cachedUser);
                    
                    // 1. Validar contraseña actual
                    if (currentPasswordInput.value !== user.password) {
                        window.showToast("Error de Validación", "La contraseña actual es incorrecta.", "error");
                        return;
                    }
                    
                    // 2. Validar que la nueva no esté vacía
                    if (!newPasswordInput || newPasswordInput.value.trim() === '') {
                        window.showToast("Error de Validación", "La nueva contraseña no puede estar vacía.", "error");
                        return;
                    }
                    
                    // 3. Validar que coincidan
                    if (newPasswordInput.value !== confirmPasswordInput.value) {
                        window.showToast("Error de Validación", "Las contraseñas nuevas no coinciden.", "error");
                        return;
                    }
                    
                    // Actualizar contraseña en localStorage
                    user.password = newPasswordInput.value;
                    localStorage.setItem('currentUserData', JSON.stringify(user));
                    
                    // Éxito
                    window.showToast("Contraseña Actualizada", "Tu contraseña se ha cambiado correctamente.", "success");
                    
                    // Limpiar campos
                    currentPasswordInput.value = '';
                    newPasswordInput.value = '';
                    confirmPasswordInput.value = '';
                } else {
                    window.showToast("Error", "No se encontraron los datos del usuario. Recarga la página.", "error");
                }
            });
        } else if (btn.id === 'btn-actualizar-datos-negocio') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const pnNombre = document.getElementById('pn-nombre');
                const pnTelefono = document.getElementById('pn-telefono');
                const pnDireccion = document.getElementById('pn-direccion');
                const pnHoraApertura = document.getElementById('pn-hora-apertura');
                const pnHoraCierre = document.getElementById('pn-hora-cierre');
                
                // Validar campos vacíos
                if (!pnNombre || !pnNombre.value.trim() || 
                    !pnTelefono || !pnTelefono.value.trim() || 
                    !pnDireccion || !pnDireccion.value.trim() || 
                    !pnHoraApertura || !pnHoraApertura.value.trim() || 
                    !pnHoraCierre || !pnHoraCierre.value.trim()) {
                    window.showToast("Error de Validación", "Por favor, completa todos los datos generales.", "error");
                    return;
                }
                
                // Validar mínimo 8 horas
                const parseTime = (timeStr) => {
                    let t = timeStr.trim().toUpperCase();
                    let isPM = t.includes('PM');
                    let isAM = t.includes('AM');
                    t = t.replace('PM','').replace('AM','').trim();
                    let parts = t.split(':');
                    let h = parseInt(parts[0], 10) || 0;
                    let m = parseInt(parts[1], 10) || 0;
                    if (isPM && h !== 12) h += 12;
                    if (isAM && h === 12) h = 0;
                    return h + (m / 60);
                };
                
                const openHours = parseTime(pnHoraApertura.value);
                let closeHours = parseTime(pnHoraCierre.value);
                if (closeHours < openHours) closeHours += 24;
                
                const duration = closeHours - openHours;
                if (duration < 8) {
                    window.showToast("Error de Horario", "El negocio debe estar abierto un mínimo de 8 horas.", "error");
                    return;
                }
                
                // Guardar
                const cachedBusiness = localStorage.getItem('currentBusinessData');
                if (cachedBusiness) {
                    const config = JSON.parse(cachedBusiness);
                    config.name = pnNombre.value.trim();
                    config.phone = pnTelefono.value.trim();
                    config.address = pnDireccion.value.trim();
                    config.businessHours = {
                        start: pnHoraApertura.value.trim(),
                        end: pnHoraCierre.value.trim()
                    };
                    localStorage.setItem('currentBusinessData', JSON.stringify(config));
                }
                
                window.showToast("Configuración Actualizada", "Los datos generales se han guardado correctamente.", "success");
            });
        } else {
            btn.addEventListener('click', showPrototypeWarning);
        }
    });

    // Añadir Servicio Inline Form
    const btnAddService = document.getElementById('btn-add-service');
    if (btnAddService) {
        btnAddService.addEventListener('click', (e) => {
            e.preventDefault();
            
            const listContainer = document.querySelector('.pn-service-list');
            if (!listContainer) return;
            
            if (document.getElementById('inline-add-service-form')) return;
            
            const emptyMsg = listContainer.querySelector('div[style*="No hay servicios"]');
            if (emptyMsg) emptyMsg.remove();
            
            const formHtml = `
                <div id="inline-add-service-form" style="display: flex; gap: 8px; align-items: center; padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <input type="text" id="new-srv-name" placeholder="Nombre del servicio" style="flex: 2; margin: 0; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; color: #0f172a; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#0891b2'" onblur="this.style.borderColor='#cbd5e1'" />
                    <input type="number" class="no-spinners" id="new-srv-duration" min="0" oninput="if(this.value < 0) this.value = Math.abs(this.value)" placeholder="Min" style="flex: 1; margin: 0; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; color: #0f172a; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#0891b2'" onblur="this.style.borderColor='#cbd5e1'" />
                    <input type="number" class="no-spinners" id="new-srv-price" min="0" oninput="if(this.value < 0) this.value = Math.abs(this.value)" placeholder="€" style="flex: 1; margin: 0; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; color: #0f172a; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#0891b2'" onblur="this.style.borderColor='#cbd5e1'" />
                    <button id="btn-save-new-srv" style="background: #0891b2; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: background 0.2s;" onmouseover="this.style.background='#0369a1'" onmouseout="this.style.background='#0891b2'">Añadir</button>
                    <button id="btn-cancel-new-srv" style="background: transparent; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">Cancelar</button>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', formHtml);
            
            const nameInput = document.getElementById('new-srv-name');
            nameInput.focus();
            
            document.getElementById('btn-cancel-new-srv').addEventListener('click', () => {
                window.renderServicesList();
            });
            
            document.getElementById('btn-save-new-srv').addEventListener('click', () => {
                const nName = nameInput.value.trim();
                const nDur = parseInt(document.getElementById('new-srv-duration').value.trim());
                const nPrice = parseFloat(document.getElementById('new-srv-price').value.trim());
                
                if (!nName || !nDur || isNaN(nDur) || nDur <= 0 || isNaN(nPrice) || nPrice < 0) {
                    window.showToast("Datos Incompletos", "Por favor, introduce un nombre válido, duración y coste.", "error");
                    return;
                }
                
                window.currentServices.push({ name: nName, duration: nDur, price: nPrice });
                window.renderServicesList();
                window.saveServicesToStorage();
                window.showToast("Servicio Añadido", `El servicio "${nName}" se ha guardado en el catálogo.`, "success");
            });
        });
    }

    // Toggle Auto Confirm
    const autoConfirmToggle = document.getElementById('auto-confirm-toggle');
    if (autoConfirmToggle) {
        autoConfirmToggle.addEventListener('click', () => {
            window.currentAutoConfirm = !window.currentAutoConfirm;
            const toggleThumb = autoConfirmToggle.querySelector('div');
            if (window.currentAutoConfirm) {
                autoConfirmToggle.style.backgroundColor = '#0891b2';
                toggleThumb.style.left = '22px';
                if (window.saveIAConfigToStorage) window.saveIAConfigToStorage(false);
                window.showToast("Confirmación Activada", "La IA solicitará confirmación automáticamente.", "success");
            } else {
                autoConfirmToggle.style.backgroundColor = '#cbd5e1';
                toggleThumb.style.left = '2px';
                if (window.saveIAConfigToStorage) window.saveIAConfigToStorage(false);
                window.showToast("Confirmación Desactivada", "La IA ya no solicitará confirmación.", "error");
            }
        });
    }
    
    // Añadir Recordatorio Inline Form
    const btnAddReminder = document.getElementById('btn-add-reminder');
    if (btnAddReminder) {
        btnAddReminder.addEventListener('click', (e) => {
            e.preventDefault();
            const listContainer = document.getElementById('pn-reminder-list');
            if (!listContainer) return;
            
            if (document.getElementById('inline-add-reminder-form')) return;
            
            const emptyMsg = listContainer.querySelector('div[style*="No hay recordatorios"]');
            if (emptyMsg) emptyMsg.remove();
            
            const formHtml = `
                <div id="inline-add-reminder-form" style="display: flex; gap: 8px; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 12px; margin-top: 16px;">
                    <input type="number" class="no-spinners" id="new-rem-time" min="0" oninput="if(this.value < 0) this.value = Math.abs(this.value)" placeholder="Ej: 24" style="flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; color: #0f172a; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#0891b2'" onblur="this.style.borderColor='#cbd5e1'" />
                    <div class="custom-select-container" id="new-rem-unit-container" style="flex: 1; position: relative;">
                        <div class="custom-select-trigger" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; color: #0f172a; background-color: white; cursor: pointer;">
                            <span class="selected-value" id="new-rem-unit">horas</span>
                            <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div class="custom-select-options" style="top: 100%; left: 0; right: 0; z-index: 10;">
                            <div class="custom-option">horas</div>
                            <div class="custom-option">días</div>
                            <div class="custom-option">minutos</div>
                        </div>
                    </div>
                    <button id="btn-save-new-rem" style="background: #0891b2; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: background 0.2s;" onmouseover="this.style.background='#0369a1'" onmouseout="this.style.background='#0891b2'">Añadir</button>
                    <button id="btn-cancel-new-rem" style="background: transparent; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">Cancelar</button>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', formHtml);
            
            document.getElementById('new-rem-time').focus();
            
            // Inicializar custom select
            const container = document.getElementById('new-rem-unit-container');
            const trigger = container.querySelector('.custom-select-trigger');
            const options = container.querySelectorAll('.custom-option');
            const selectedValue = container.querySelector('.selected-value');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.custom-select-container').forEach(c => {
                    if (c !== container) c.classList.remove('open');
                });
                container.classList.toggle('open');
            });

            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedValue.textContent = option.textContent;
                    container.classList.remove('open');
                });
            });

            document.getElementById('btn-cancel-new-rem').addEventListener('click', () => {
                window.renderRemindersList();
            });
            
            document.getElementById('btn-save-new-rem').addEventListener('click', () => {
                const nTime = parseInt(document.getElementById('new-rem-time').value.trim());
                const nUnit = document.getElementById('new-rem-unit').textContent;
                
                if (!nTime || isNaN(nTime) || nTime <= 0) {
                    window.showToast("Datos Incompletos", "Por favor, introduce un tiempo válido mayor a 0.", "error");
                    return;
                }
                
                const exists = window.currentReminders.some(r => r.time === nTime && r.unit === nUnit);
                if (exists) {
                    window.showToast("Recordatorio Duplicado", "Ya existe un recordatorio configurado con ese tiempo exacto.", "error");
                    return;
                }
                
                window.currentReminders.push({ time: nTime, unit: nUnit });
                window.renderRemindersList();
                if (window.saveIAConfigToStorage) window.saveIAConfigToStorage(true);
            });
        });
    }

    // Guardar Configuración IA
    window.saveIAConfigToStorage = function(showNotif = true) {
        const cachedBusiness = localStorage.getItem('currentBusinessData');
        if (cachedBusiness) {
            const config = JSON.parse(cachedBusiness);
            if (!config.aiSettings) config.aiSettings = {};
            
            const pnTonoIa = document.getElementById('pn-tono-ia');
            const pnPromptIa = document.getElementById('pn-prompt-ia');
            
            config.aiSettings.tone = pnTonoIa ? pnTonoIa.textContent : 'Informal';
            config.aiSettings.prompt = pnPromptIa ? pnPromptIa.value : '';
            config.aiSettings.reminders = window.currentReminders || [];
            config.aiSettings.autoConfirm = !!window.currentAutoConfirm;
            
            localStorage.setItem('currentBusinessData', JSON.stringify(config));
            if (showNotif) {
                window.showToast("IA Actualizada", "La configuración del Asistente Virtual se ha guardado correctamente.", "success");
            }
        }
    };

    // Auto-guardado para Tono IA (al cambiar en el dropdown)
    const pnTonoIaContainer = document.getElementById('pn-tono-ia')?.closest('.custom-select-container');
    if (pnTonoIaContainer) {
        pnTonoIaContainer.addEventListener('dropdownChange', () => {
            if (window.saveIAConfigToStorage) window.saveIAConfigToStorage(true);
        });
    }

    // Auto-guardado para el Prompt IA (al perder el foco)
    const pnPromptIa = document.getElementById('pn-prompt-ia');
    if (pnPromptIa) {
        pnPromptIa.addEventListener('blur', () => {
            if (window.saveIAConfigToStorage) window.saveIAConfigToStorage(true);
        });
    }

});
// Mobile Menu Logic
document.addEventListener('DOMContentLoaded', () => {
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const portalSidebar = document.getElementById('portal-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (btnMobileMenu && portalSidebar && sidebarOverlay) {
        btnMobileMenu.addEventListener('click', () => {
            portalSidebar.classList.add('open');
            sidebarOverlay.classList.add('active');
        });
        
        sidebarOverlay.addEventListener('click', () => {
            portalSidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Close menu when clicking a nav item on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                portalSidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
            }
        });
    });

    // FAB ALIA Logic now handled purely via inline HTML onclicks and .alia-overlay
});



// Global function to trigger notification when ALIA creates an appointment
window.triggerAliaNotification = function(client, time, service, prof) {
    // Check if the assigned professional is the owner
    const currentUser = window.MockAPI?.state?.currentUser?.name || 'Propietario';
    const isOwner = prof.toLowerCase().includes('propietario') || prof.toLowerCase().includes('alejandro') || prof === currentUser;
    
    if (!isOwner) return;

    const notifList = document.querySelector('.notif-list');
    if (!notifList) return;

    // Remove empty state if present
    const emptyState = notifList.querySelector('div[style*="text-align: center"]');
    if (emptyState) {
        emptyState.remove();
    }

    // Create notification item
    const notifItem = document.createElement('div');
    notifItem.className = 'notif-item unread';
    notifItem.style.display = 'flex';
    notifItem.style.padding = '16px';
    notifItem.style.borderBottom = '1px solid #f1f5f9';
    notifItem.style.cursor = 'pointer';
    notifItem.style.transition = 'background-color 0.2s';
    notifItem.onmouseover = () => notifItem.style.backgroundColor = '#f8fafc';
    notifItem.onmouseout = () => notifItem.style.backgroundColor = 'transparent';
    notifItem.onclick = () => {
        if (window.openAgendaAppointmentPanel) {
            const mockAppt = { clientName: client, time: time, service: service, prof: prof, status: 'pending', duration: 30 };
            window.openAgendaAppointmentPanel(JSON.stringify(mockAppt));
        }
        
        // Borrar la notificación al hacer click
        notifItem.remove();
        
        // Actualizar el estado del badge
        const list = document.querySelector('.notif-list');
        if (list && list.querySelectorAll('.notif-item.unread').length === 0) {
            const btnNotif = document.getElementById('btn-open-notificaciones');
            if (btnNotif) {
                const badge = btnNotif.querySelector('.notif-badge');
                if (badge) badge.remove();
            }
        }
        // Si no quedan notificaciones, mostrar mensaje vacío
        if (list && list.children.length === 0) {
            list.innerHTML = `
                <div style="padding: 30px 20px; text-align: center; color: #94a3b8;">
                    <div style="width: 48px; height: 48px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                    <p style="margin: 0; font-size: 0.9rem; font-weight: 500;">No tienes nuevas notificaciones</p>
                </div>
            `;
        }

        const modal = document.getElementById('modal-notificaciones');
        if (modal) modal.classList.remove('active');
        const btn = document.getElementById('btn-open-notificaciones');
        if (btn) btn.classList.remove('active');
    };

    notifItem.innerHTML = `
        <div class="notif-icon" style="width: 40px; height: 40px; border-radius: 50%; background: #e0f2fe; color: #159EBA; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="notif-content" style="flex: 1;">
            <p class="notif-text" style="margin: 0; font-size: 0.9rem; color: #334155; line-height: 1.4;">
                <strong>ALIA</strong> te ha agendado una cita con <strong>${client}</strong> a las <strong>${time}</strong> (${service}).
            </p>
            <span class="notif-time" style="font-size: 0.75rem; color: #94a3b8; display: block; margin-top: 4px;">Justo ahora</span>
        </div>
        <div class="notif-unread-dot" style="width: 8px; height: 8px; background-color: #159EBA; border-radius: 50%; margin-top: 6px;"></div>
    `;

    // Insert at the top
    notifList.insertBefore(notifItem, notifList.firstChild);

    // Add badge to topbar icon
    const btnNotif = document.getElementById('btn-open-notificaciones');
    if (btnNotif) {
        btnNotif.style.position = 'relative';
        let badge = btnNotif.querySelector('.notif-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notif-badge';
            badge.style.position = 'absolute';
            badge.style.top = '0px';
            badge.style.right = '0px';
            badge.style.width = '12px';
            badge.style.height = '12px';
            badge.style.backgroundColor = '#ef4444';
            badge.style.borderRadius = '50%';
            badge.style.border = '2px solid white';
            badge.style.boxSizing = 'border-box';
            badge.style.padding = '0';
            btnNotif.appendChild(badge);
        }
    }
};
