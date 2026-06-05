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
                } else if (targetId === 'page-soporte') {
                    pageContent.classList.add('no-scroll-soporte');
                    pageContent.classList.remove('no-scroll-chats');
                } else {
                    pageContent.classList.remove('no-scroll-chats');
                    pageContent.classList.remove('no-scroll-soporte');
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
            }

            const selects = modalNuevaCita.querySelectorAll('.custom-select-container');
            if (selects.length >= 3 && window.populateDropdown) {
                if (!window.timeOptionsLoaded) {
                    const times = ['--:-- (Vacío)'];
                    for (let h = 9; h <= 20; h++) {
                        for (let m of ['00', '30']) {
                            if (h === 20 && m === '30') continue;
                            times.push(`${h.toString().padStart(2, '0')}:${m}`);
                        }
                    }
                    window.populateDropdown(selects[0], times, '--:--');
                    window.timeOptionsLoaded = true;
                }

                if (!window.serviceOptionsLoaded) {
                    const services = ['-- Seleccionar --', 'Corte Clásico', 'Corte + Barba', 'Tinte y Mechas', 'Manicura Semipermanente', 'Masaje Relajante', 'Tratamiento Facial'];
                    window.populateDropdown(selects[1], services, '-- Seleccionar --');
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
