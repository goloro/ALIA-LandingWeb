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
                    pageContent.classList.remove('no-scroll-soporte');
                    pageContent.classList.remove('no-scroll-agenda');
                } else if (targetId === 'page-soporte') {
                    pageContent.classList.add('no-scroll-soporte');
                    pageContent.classList.remove('no-scroll-chats');
                    pageContent.classList.remove('no-scroll-agenda');
                } else if (targetId === 'page-agenda-semanal') {
                    pageContent.classList.add('no-scroll-agenda');
                    pageContent.classList.remove('no-scroll-chats');
                    pageContent.classList.remove('no-scroll-soporte');
                    
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

    // --- Lógica del Chat ---
    const chatArea = document.getElementById('prototype-chat-container');
    const inputField = document.getElementById('prototype-chat-input');
    const sendBtn = document.getElementById('prototype-chat-send');

    function sendMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-user';
        
        const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        messageDiv.innerHTML = `
            ${safeText}
            <div class="message-time">${timeString} <span>✓✓</span></div>
        `;
        
        if (chatArea) {
            chatArea.appendChild(messageDiv);
            chatArea.scrollTop = chatArea.scrollHeight;
        }
        
        inputField.value = '';
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
        let settings = { closedDays: [0], openHours: { start: '10:00', end: '19:00' } };
        let fullTeam = [{ name: 'Propietario', dayOff: 1, lunchBreak: '14:00' }];
        
        if (window.MockAPI) {
            try { settings = await window.MockAPI.getSettings(); } catch(e) {}
            const team = await window.MockAPI.getTeam();
            fullTeam = [...team, { name: 'Propietario', dayOff: 1, lunchBreak: '14:00' }];
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
        if (profObj && profObj.dayOff === dayOfWeek) {
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

        const startHour = parseInt(settings.openHours.start.split(':')[0]);
        const endHour = parseInt(settings.openHours.end.split(':')[0]);
        const endMin = parseInt(settings.openHours.end.split(':')[1] || 0);

        for (let h = startHour; h <= endHour; h++) {
            for (let m of [0, 30]) {
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
                if (profObj && profObj.lunchBreak) {
                    const [lh, lm] = profObj.lunchBreak.split(':').map(Number);
                    const lunchStartMins = lh * 60 + lm;
                    const lunchEndMins = lunchStartMins + 60; // 1 hour lunch
                    
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
            });
        });
    };

    window.openNuevaCitaModal = async function(prefilledClientName = '') {
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

            
            const inputsTextCalendar = modalNuevaCita.querySelectorAll('input[type="text"]');
            if (inputsTextCalendar.length > 1) {
                const dateInput = inputsTextCalendar[1];
                
                // Pre-fill with today's date if empty or invalid
                if (!dateInput.value || !dateInput.value.includes('/')) {
                    const now = new Date();
                    
                    // Check if there are hours available today.
                    // The last slot is 20:00. If we are past 20:00, move to tomorrow.
                    if (now.getHours() > 20 || (now.getHours() === 20 && now.getMinutes() > 0)) {
                        now.setDate(now.getDate() + 1);
                    }
                    
                    dateInput.value = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;
                }
                
                if (window.attachMiniCalendar) {
                    window.attachMiniCalendar(dateInput);
                }
            }
            
            const selects = modalNuevaCita.querySelectorAll('.custom-select-container');
            if (selects.length >= 3 && window.populateDropdown) {
                // Bind listeners to Service and Prof to trigger Smart Calendar
                if (!selects[1].hasAttribute('data-smart-bound')) {
                    selects[1].addEventListener('dropdownChange', window.updateSmartCalendar);
                    selects[1].setAttribute('data-smart-bound', 'true');
                }
                if (!selects[2].hasAttribute('data-smart-bound')) {
                    selects[2].addEventListener('dropdownChange', window.updateSmartCalendar);
                    selects[2].setAttribute('data-smart-bound', 'true');
                }
                
                // Initial refresh based on current date
                const dateStr = inputsTextCalendar.length > 1 ? inputsTextCalendar[1].value : null;
                window.refreshTimeDropdown(dateStr, selects[0]);


                if (!window.serviceOptionsLoaded) {
                    const servicesList = (window.BusinessSettings && window.BusinessSettings.services) 
                        ? window.BusinessSettings.services.map(s => s.name) 
                        : [];
                    window.populateDropdown(selects[1], servicesList, 'Elige un servicio...');
                    window.serviceOptionsLoaded = true;
                }

                if (!window.teamOptionsLoaded && window.MockAPI) {
                    try {
                        const team = await window.MockAPI.getTeam();
                        const teamNames = ['Cualquier Disponible', ...team.map(t => t.name)];
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
                for (let t of [...team, {name: 'Propietario'}]) {
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

    function renderCalendar() {
        calendarPopover.innerHTML = '';

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Header
        const header = document.createElement('div');
        header.className = 'mc-header';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'mc-btn';
        prevBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        prevBtn.onclick = (e) => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
        
        const monthYear = document.createElement('div');
        monthYear.className = 'mc-month-year';
        monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'mc-btn';
        nextBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        nextBtn.onclick = (e) => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
        
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

        const today = new Date();

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
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const isPast = thisDayDate < todayStart;
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
                        if (profObj && profObj.dayOff === thisDayDate.getDay()) {
                            isDayOff = true;
                        }
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
                        
                        // Refresh time dropdown to block past times if today is selected
                        if (window.refreshTimeDropdown) {
                            const modal = currentTargetInput.closest('.modal-container');
                            if (modal) {
                                const timeSelect = modal.querySelectorAll('.custom-select-container')[0];
                                window.refreshTimeDropdown(currentTargetInput.value, timeSelect);
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
                currentDate = new Date();
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
            window.BusinessTeam = [{name: 'Propietario', dayOff: 1, lunchBreak: '14:00'}, ...team];
        } catch(e) {
            console.error("Error fetching settings or team", e);
        }
    }
});
