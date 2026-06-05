document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Backend: Carga de Clientes y Paginación ---
    let currentPage = 1;
    const itemsPerPage = 8;
    
    async function loadClients() {
        const tbody = document.querySelector('.clientes-table tbody');
        if (!tbody) return;
        
        // 1. Mostrar estado de carga (Skeleton)
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 48px 0;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; color: #64748b;">
                        <svg class="spinner" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg>
                        <span style="font-size: 1rem; font-weight: 500;">Cargando clientes...</span>
                    </div>
                </td>
            </tr>
        `;
        
        // Animación spinner (estilos en línea rápidos)
        if (!document.getElementById('spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        try {
            // 2. Obtener datos de la API simulada
            const allClients = await window.MockAPI.getClients();
            let clients = [...allClients];
            
            // Filtro de búsqueda de la barra superior
            const searchInput = document.getElementById('topbar-client-search');
            if (searchInput) {
                const query = searchInput.value.toLowerCase().trim();
                if (query) {
                    clients = clients.filter(c => 
                        (c.name && c.name.toLowerCase().includes(query)) || 
                        (c.phone && c.phone.toLowerCase().includes(query)) ||
                        (c.email && c.email.toLowerCase().includes(query))
                    );
                }
            }
            
            // 3. Paginación
            const totalItems = clients.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
            
            // Asegurar que la página actual es válida tras borrar un cliente
            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;
            
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedClients = clients.slice(startIndex, startIndex + itemsPerPage);
            
            // 4. Renderizar tabla
            tbody.innerHTML = ''; // Limpiar
            
            if (paginatedClients.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 48px 0; color: #64748b;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                <span style="font-size: 1rem; font-weight: 500;">No hay clientes registrados</span>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                paginatedClients.forEach(c => {
                    const tr = document.createElement('tr');
                    tr.style.cursor = 'pointer';
                    
                    let formattedLastAppt = c.lastAppt;
                    if (formattedLastAppt && formattedLastAppt.includes('-')) {
                        const parts = formattedLastAppt.split('-');
                        if (parts.length === 3) formattedLastAppt = `${parts[2]}/${parts[1]}/${parts[0]}`;
                    }

                    tr.innerHTML = `
                        <td style="font-weight: 500; color: var(--portal-text-main);">${c.name}</td>
                        <td style="color: #64748b;">${c.email || '<span style="opacity:0.5">-</span>'}</td>
                        <td style="color: #64748b;">${c.phone}</td>
                        <td style="color: #64748b;">${formattedLastAppt || '-'}</td>
                        <td style="font-weight: 600; text-align: center;">${c.totalAppts}</td>
                        <td class="table-actions">
                            <button class="btn-action btn-edit" title="Editar" data-id="${c.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                            <button class="btn-action btn-delete" title="Eliminar" data-id="${c.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                        </td>
                    `;
                    
                    tr.addEventListener('click', () => {
                        openClientDetails(c);
                    });
                    
                    tbody.appendChild(tr);
                });

                // Attach edit/delete events with stopPropagation
                const editBtns = tbody.querySelectorAll('.btn-edit');
                editBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation(); // Evitar abrir el panel
                        const clientId = parseInt(btn.getAttribute('data-id'));
                        const client = clients.find(cl => cl.id === clientId);
                        if (client && typeof window.openEditClientModal === 'function') {
                            window.openEditClientModal(client);
                        }
                    });
                });
                
                const deleteBtns = tbody.querySelectorAll('.btn-delete');
                deleteBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.clientToDeleteId = parseInt(btn.getAttribute('data-id'));
                        window.clientToDeleteBtn = btn;
                        document.getElementById('modal-confirm-delete').classList.add('active');
                    });
                });
                
                // Re-attach panel events if fn exists
                if (typeof attachClientEvents === 'function') attachClientEvents();
            }

            // Update Pagination info
            const paginationInfo = document.querySelector('.pagination-info');
            if (paginationInfo) {
                const endItem = Math.min(startIndex + itemsPerPage, totalItems);
                const startDisplay = totalItems === 0 ? 0 : startIndex + 1;
                paginationInfo.innerHTML = `Mostrando <strong>${startDisplay} a ${endItem}</strong> de ${totalItems} clientes`;
            }
            
            // Update Pagination controls
            const paginationControls = document.querySelector('.pagination-controls');
            if (paginationControls) {
                let html = '';
                // Prev arrow
                html += `<button class="page-btn page-arrow btn-prev-page" ${currentPage === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>`;
                
                // Page numbers (simple loop for now)
                for (let i = 1; i <= totalPages; i++) {
                    html += `<button class="page-btn page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
                }
                
                // Next arrow
                html += `<button class="page-btn page-arrow btn-next-page" ${currentPage === totalPages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>`;
                
                paginationControls.innerHTML = html;
                
                // Attach pagination events
                const prevBtn = paginationControls.querySelector('.btn-prev-page');
                if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; loadClients(); } });
                
                const nextBtn = paginationControls.querySelector('.btn-next-page');
                if (nextBtn) nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; loadClients(); } });
                
                const numBtns = paginationControls.querySelectorAll('.page-num');
                numBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        currentPage = parseInt(btn.getAttribute('data-page'));
                        loadClients();
                    });
                });
            }
            
            // Calculate dynamic stats
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            let nuevosClientes = 0;
            let retainedClients = 0;
            let totalPastAppts = 0;
            let attendedAppts = 0;
            
            // Map for monthly attendance
            const monthlyAppts = {};
            const monthNames = { 'ENE': '01', 'FEB': '02', 'MAR': '03', 'ABR': '04', 'MAY': '05', 'JUN': '06', 'JUL': '07', 'AGO': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DIC': '12' };

            allClients.forEach(c => {
                // Nuevos Clientes
                if (c.registeredAt && c.registeredAt.startsWith(currentMonthStr)) {
                    nuevosClientes++;
                }
                
                // Retención (> 1 cita)
                if (c.totalAppts > 1) {
                    retainedClients++;
                }
                
                // Asistencia
                if (c.history && c.history.length > 0) {
                    c.history.forEach(appt => {
                        if (appt.status === 'completed' || appt.status === 'noshow') {
                            totalPastAppts++;
                            if (appt.status === 'completed') {
                                attendedAppts++;
                            }
                            
                            // Parse date "15 OCT 2023, 10:00"
                            const parts = appt.date.split(' ');
                            if (parts.length >= 3) {
                                const monthText = parts[1].toUpperCase();
                                const year = parts[2].replace(',', '');
                                const monthNum = monthNames[monthText];
                                if (monthNum) {
                                    const ym = `${year}-${monthNum}`;
                                    if (!monthlyAppts[ym]) {
                                        monthlyAppts[ym] = { total: 0, completed: 0 };
                                    }
                                    monthlyAppts[ym].total++;
                                    if (appt.status === 'completed') {
                                        monthlyAppts[ym].completed++;
                                    }
                                }
                            }
                        }
                    });
                }
            });
            
            const globalTotalItems = allClients.length;
            const retentionRate = globalTotalItems > 0 ? Math.round((retainedClients / globalTotalItems) * 100) : 0;
            const attendanceRate = totalPastAppts > 0 ? Math.round((attendedAppts / totalPastAppts) * 100) : 0;
            
            // Update Dashboard stats
            const statValues = document.querySelectorAll('.clientes-stats-grid .c-stat-value');
            if (statValues.length >= 3) {
                statValues[0].textContent = nuevosClientes;
                statValues[1].textContent = `${retentionRate}%`;
                statValues[2].textContent = `${attendanceRate}%`;
            }
            
            const progressFill = document.querySelector('.c-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${retentionRate}%`;
            }
            
            // Update Attendance SVG Curve
            const sortedMonths = Object.keys(monthlyAppts).sort();
            const last6Months = sortedMonths.slice(-6); // Take up to 6 last months
            
            if (last6Months.length > 1) {
                const svgCurve = document.querySelector('.c-chart-curve');
                if (svgCurve) {
                    const paths = svgCurve.querySelectorAll('path');
                    if (paths.length >= 2) {
                        const width = 300;
                        const step = width / (last6Months.length - 1);
                        
                        let strokePathD = '';
                        let fillPathD = '';
                        
                        last6Months.forEach((ym, index) => {
                            const data = monthlyAppts[ym];
                            const rate = data.total > 0 ? (data.completed / data.total) : 0;
                            const x = index * step;
                            // y varies between 10 (100%) and 78 (0%)
                            const y = 78 - (rate * 68);
                            
                            if (index === 0) {
                                strokePathD += `M ${x} ${y} `;
                                fillPathD += `M ${x} ${y} `;
                            } else {
                                strokePathD += `L ${x} ${y} `;
                                fillPathD += `L ${x} ${y} `;
                            }
                        });
                        
                        fillPathD += `L ${width} 80 L 0 80 Z`;
                        
                        // Update paths
                        paths[0].setAttribute('d', fillPathD);
                        paths[1].setAttribute('d', strokePathD);
                    }
                }
            }

        } catch (error) {
            console.error(error);
        }
    }

    // Call initially
    if (window.MockAPI) loadClients();

    // Evento para el botón "+ Nuevo Cliente" (Abre el modal)
    const btnNuevoCliente = document.querySelector('.btn-nuevo-cliente');
    const modalNuevoCliente = document.getElementById('modal-nuevo-cliente');
    const btnCloseCliente = document.getElementById('btn-close-modal-cliente');
    const btnCancelCliente = document.getElementById('btn-cancel-modal-cliente');
    const btnSaveCliente = document.getElementById('btn-save-cliente');
    
    function closeClienteModal() {
        if (modalNuevoCliente) modalNuevoCliente.classList.remove('active');
        // Reset form
        const nameInput = document.getElementById('new-client-name');
        const emailInput = document.getElementById('new-client-email');
        const phoneInput = document.getElementById('new-client-phone');
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (phoneInput) phoneInput.value = '';
    }

    if (btnNuevoCliente && modalNuevoCliente) {
        btnNuevoCliente.addEventListener('click', (e) => {
            e.preventDefault();
            modalNuevoCliente.classList.add('active');
        });
        
        if (btnCloseCliente) btnCloseCliente.addEventListener('click', closeClienteModal);
        if (btnCancelCliente) btnCancelCliente.addEventListener('click', closeClienteModal);
        
        // Cerrar al hacer click fuera
        modalNuevoCliente.addEventListener('click', (e) => {
            if (e.target === modalNuevoCliente) closeClienteModal();
        });
        
        // Guardar Cliente Real
        if (btnSaveCliente) {
            btnSaveCliente.addEventListener('click', async () => {
                const nameInput = document.getElementById('new-client-name');
                const emailInput = document.getElementById('new-client-email');
                const phoneInput = document.getElementById('new-client-phone');
                
                const nameVal = nameInput ? nameInput.value.trim() : '';
                const emailVal = emailInput ? emailInput.value.trim() : '';
                const phoneVal = phoneInput ? phoneInput.value.trim() : '';
                
                if (!nameVal) {
                    alert('El nombre es obligatorio');
                    return;
                }
                
                // Basic validation for email if provided
                if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                    alert('Por favor, introduce un correo electrónico válido');
                    return;
                }
                
                // Basic validation for phone if provided (allows +, spaces, dashes, digits)
                if (phoneVal && !/^[\d\+\s\-]+$/.test(phoneVal)) {
                    alert('Por favor, introduce un número de teléfono válido');
                    return;
                }
                
                // Estado de carga en el botón guardar
                const originalContent = btnSaveCliente.innerHTML;
                btnSaveCliente.innerHTML = '<svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg> Guardando...';
                btnSaveCliente.style.pointerEvents = 'none';

                await window.MockAPI.addClient({
                    name: nameVal,
                    email: emailVal,
                    phone: phoneVal || '-',
                    lastAppt: null
                });

                // Restaurar y cerrar
                btnSaveCliente.innerHTML = originalContent;
                btnSaveCliente.style.pointerEvents = 'auto';
                closeClienteModal();
                currentPage = 1; // Volver a la primera página para ver el nuevo
                loadClients();
            });
        }
    }

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

    /**
     * Handles sending a new message in the chat prototype.
     * Reads from the input field, sanitizes the text, and appends it to the chat container.
     */
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

    // --- Lógica de Fecha Dinámica ---
    const currentDate = new Date();
    
    // Formatear fecha completa (ej. Lunes, 20 de abril de 2026)
    const opcionesFechaCompleta = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let fechaCompletaStr = currentDate.toLocaleDateString('es-ES', opcionesFechaCompleta);
    // Capitalizar primera letra
    fechaCompletaStr = fechaCompletaStr.charAt(0).toUpperCase() + fechaCompletaStr.slice(1);
    
    // Formatear solo mes (ej. Abril)
    const opcionesMes = { month: 'long' };
    let mesStr = currentDate.toLocaleDateString('es-ES', opcionesMes);
    mesStr = mesStr.charAt(0).toUpperCase() + mesStr.slice(1);
    
    // Asignar al DOM
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

    /**
     * Opens the global "Nueva Cita" modal dialog.
     */
    function openModal() {
        if (modalNuevaCita) modalNuevaCita.classList.add('active');
    }

    /**
     * Closes the global "Nueva Cita" modal dialog.
     */
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

    // Cerrar si se hace click fuera del modal de nueva cita
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
            // Asegurar que otros modales están cerrados
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
            e.stopPropagation(); // Evitar que el click cierre inmediatamente
            if (modalNotificaciones.classList.contains('active')) {
                closeNotificaciones();
            } else {
                openNotificaciones();
            }
        });
    }

    // Cerrar si se hace click fuera del popover de notificaciones
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

        // Abrir/cerrar al hacer click en el trigger
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el click en el body lo cierre inmediatamente
            
            // Cerrar todos los demás primero
            customSelects.forEach(otherContainer => {
                if (otherContainer !== container) {
                    otherContainer.classList.remove('open');
                }
            });
            
            container.classList.toggle('open');
        });

        // Seleccionar una opción
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedValue.textContent = option.textContent;
                
                // Mantenemos el color gris si es un estado vacío (contiene '--')
                if (option.textContent.includes('--')) {
                    selectedValue.style.color = '#94a3b8';
                } else {
                    selectedValue.style.color = 'var(--portal-text-main)';
                }

                container.classList.remove('open');
            });
        });
    });

    // Cerrar los desplegables al hacer click fuera
    document.addEventListener('click', () => {
        customSelects.forEach(container => {
            container.classList.remove('open');
        });
    });

    // --- Lógica de Filtros y Vistas de la Agenda ---
    const profFilters = document.querySelectorAll('.prof-filter-btn');
    const viewToggles = document.querySelectorAll('.view-toggle-btn');
    
    function updateViewTogglesState() {
        const activeFilter = document.querySelector('.prof-filter-btn.active');
        const filterName = activeFilter ? activeFilter.textContent.trim() : 'Todos';
        const isTodos = filterName === 'Todos';
        
        viewToggles.forEach(toggle => {
            const isDay = toggle.textContent.trim() === 'Day';
            if (isTodos && !isDay) {
                // Bloquear Week y Month
                toggle.classList.add('disabled');
                toggle.disabled = true;
                // Si estaba activo, cambiar a Day
                if (toggle.classList.contains('active')) {
                    toggle.classList.remove('active');
                    const dayToggle = Array.from(viewToggles).find(t => t.textContent.trim() === 'Day');
                    if (dayToggle) dayToggle.classList.add('active');
                }
            } else {
                // Desbloquear
                toggle.classList.remove('disabled');
                toggle.disabled = false;
            }
        });

        // Actualizar el layout de la agenda
        const agendaGrid = document.querySelector('.agenda-grid');
        const agendaMonthGrid = document.querySelector('.agenda-month-grid');
        const profCols = document.querySelectorAll('.agenda-prof-col');
        const activeToggle = document.querySelector('.view-toggle-btn.active');
        const activeToggleText = activeToggle ? activeToggle.textContent.trim() : 'Day';
        const isWeekView = activeToggleText === 'Week';
        const isMonthView = activeToggleText === 'Month';
        
        const profHeaders = document.querySelector('.agenda-prof-headers-wrapper');
        const weekHeaders = document.querySelector('.agenda-week-headers-wrapper');
        const timeZoneLabel = document.querySelector('.time-zone-label');
        const weekOnlyBgCols = document.querySelectorAll('.bg-col.week-only');
        
        if (agendaMonthGrid) {
            if (isMonthView) {
                if (agendaGrid) agendaGrid.style.display = 'none';
                agendaMonthGrid.style.display = 'flex';
            } else {
                if (agendaGrid) agendaGrid.style.display = 'flex';
                agendaMonthGrid.style.display = 'none';
            }
        }
        
        // Call dynamic dates update
        if (typeof updateAgendaDynamicDates === 'function') {
            updateAgendaDynamicDates();
        }
        
        if (agendaGrid && profCols.length >= 4 && !isMonthView) {
            // Reiniciar estados
            agendaGrid.classList.remove('single-prof-view', 'week-view');
            if(profHeaders) profHeaders.style.display = 'none';
            if(weekHeaders) weekHeaders.style.display = 'none';
            if(timeZoneLabel) timeZoneLabel.style.display = 'none';
            weekOnlyBgCols.forEach(c => c.style.display = 'none');
            
            if (isWeekView) {
                // Configurar Vista Semanal
                agendaGrid.classList.add('week-view');
                if(weekHeaders) weekHeaders.style.display = 'contents';
                if(timeZoneLabel) timeZoneLabel.style.display = 'block';
                weekOnlyBgCols.forEach(c => c.style.display = 'block');
                
                // Mostramos las 7 columnas
                profCols.forEach(col => col.style.display = 'block');
                
            } else {
                // Configurar Vista Diaria
                if (isTodos) {
                    // Vista Todos (4 columnas de profesionales)
                    if(profHeaders) profHeaders.style.display = 'contents';
                    
                    profCols.forEach(col => {
                        if (col.classList.contains('week-only')) {
                            col.style.display = 'none';
                        } else {
                            col.style.display = 'block';
                        }
                    });
                } else {
                    // Vista 1 profesional (1 columna)
                    agendaGrid.classList.add('single-prof-view');
                    profCols.forEach(col => col.style.display = 'none');
                    
                    let targetIndex = 0;
                    if (filterName === 'Marcos') targetIndex = 1;
                    else if (filterName === 'Sofía') targetIndex = 2;
                    else if (filterName === 'Elena') targetIndex = 3;
                    
                    if (profCols[targetIndex]) {
                        profCols[targetIndex].style.display = 'block';
                    }
                }
            }
        }
    }

    if (profFilters.length > 0 && viewToggles.length > 0) {
        profFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                profFilters.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
                updateViewTogglesState();
            });
        });

        viewToggles.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                viewToggles.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                updateViewTogglesState();
            });
        });

        // Inicializar estado
        updateViewTogglesState();
    }

    // --- Lógica de Agenda Dinámica ---
    function updateAgendaDynamicDates() {
        const dateTitle = document.querySelector('.agenda-date-title');
        if (!dateTitle) return;

        const now = new Date();
        const activeToggle = document.querySelector('.view-toggle-btn.active');
        const viewMode = activeToggle ? activeToggle.textContent.trim() : 'Day';

        // Helpers
        const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
        const getMonthName = d => capitalize(d.toLocaleDateString('es-ES', { month: 'long' }));
        const getDayName = d => capitalize(d.toLocaleDateString('es-ES', { weekday: 'long' }));

        // Día de la semana (Lunes = 1, Domingo = 7)
        let dayOfWeek = now.getDay();
        if (dayOfWeek === 0) dayOfWeek = 7; 
        
        // Calcular inicio de semana (Lunes)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek + 1);

        if (viewMode === 'Day' || !activeToggle) {
            // ej: "20 de Abril de 2026"
            dateTitle.textContent = `${now.getDate()} de ${getMonthName(now)} de ${now.getFullYear()}`;
        } else if (viewMode === 'Week') {
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                dateTitle.textContent = `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${getMonthName(startOfWeek)} de ${endOfWeek.getFullYear()}`;
            } else {
                dateTitle.textContent = `${startOfWeek.getDate()} de ${getMonthName(startOfWeek)} - ${endOfWeek.getDate()} de ${getMonthName(endOfWeek)} de ${endOfWeek.getFullYear()}`;
            }
        } else if (viewMode === 'Month') {
            dateTitle.textContent = `${getMonthName(now)} de ${now.getFullYear()}`;
        }

        // Actualizar Cabeceras de Semana
        const weekHeaders = document.querySelectorAll('.agenda-week-header');
        if (weekHeaders.length === 7) {
            for (let i = 0; i < 7; i++) {
                const headerDate = new Date(startOfWeek);
                headerDate.setDate(startOfWeek.getDate() + i);
                const dayNumEl = weekHeaders[i].querySelector('.day-num');
                if (dayNumEl) {
                    dayNumEl.textContent = headerDate.getDate();
                }
                // Resaltar día actual
                if (headerDate.toDateString() === now.toDateString()) {
                    weekHeaders[i].classList.add('active');
                } else {
                    weekHeaders[i].classList.remove('active');
                }
            }
        }

        // Generar Cuadrícula del Mes
        const monthGridBody = document.querySelector('.month-grid-body');
        if (monthGridBody) {
            monthGridBody.innerHTML = '';
            
            // Primer día del mes
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            let firstDayOfWeek = firstDayOfMonth.getDay();
            if (firstDayOfWeek === 0) firstDayOfWeek = 7;
            
            // Fecha inicio (puede ser del mes anterior)
            const startDate = new Date(firstDayOfMonth);
            startDate.setDate(firstDayOfMonth.getDate() - firstDayOfWeek + 1);
            
            // Calcular cuantas semanas necesitamos para mostrar todo el mes
            // Generalmente 5 semanas (35 dias) o 6 (42 dias) dependiendo del dia 1
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const totalDaysSpan = firstDayOfWeek - 1 + lastDayOfMonth.getDate();
            const cellsToGenerate = totalDaysSpan > 35 ? 42 : 35;
            
            for (let i = 0; i < cellsToGenerate; i++) {
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + i);
                
                const cellDiv = document.createElement('div');
                cellDiv.className = 'month-cell';
                
                if (cellDate.getMonth() !== now.getMonth()) {
                    cellDiv.classList.add('other-month');
                }
                if (cellDate.toDateString() === now.toDateString()) {
                    cellDiv.classList.add('today-cell');
                }
                
                const numStr = String(cellDate.getDate()).padStart(2, '0');
                cellDiv.innerHTML = `<span class="month-day-num">${numStr}</span>`;
                monthGridBody.appendChild(cellDiv);
            }
        }
    }

    // Initialize date dynamically on start
    updateAgendaDynamicDates();

    // --- Lógica del Panel Lateral de Detalles de Cita ---
    const appointmentPanel = document.getElementById('appointment-details-panel');
    const appointmentBackdrop = document.getElementById('appointment-details-backdrop');
    const btnCloseAppointmentPanel = document.getElementById('btn-close-appointment-panel');
    
    // Función para abrir el panel
    function openAppointmentPanel() {
        if (appointmentPanel && appointmentBackdrop) {
            appointmentPanel.classList.add('active');
            appointmentBackdrop.classList.add('active');
            // Opcional: Podríamos rellenar dinámicamente los datos aquí
        }
    }

    // Función para cerrar el panel
    function closeAppointmentPanel() {
        if (appointmentPanel && appointmentBackdrop) {
            appointmentPanel.classList.remove('active');
            appointmentBackdrop.classList.remove('active');
        }
    }

    // Eventos para cerrar
    if (btnCloseAppointmentPanel) {
        btnCloseAppointmentPanel.addEventListener('click', closeAppointmentPanel);
    }
    
    if (appointmentBackdrop) {
        appointmentBackdrop.addEventListener('click', closeAppointmentPanel);
    }

    // Evento para abrir al hacer clic en cualquier cita de la agenda
    function attachAppointmentEvents() {
        // Excluimos explícitamente los bloques de almuerzo (.event-lunch)
        const events = document.querySelectorAll('.agenda-event:not(.event-lunch)');
        events.forEach(event => {
            // Eliminar listener previo por si se re-renderiza
            event.removeEventListener('click', openAppointmentPanel);
            event.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita conflictos con otros clics
                openAppointmentPanel();
            });
        });
    }

    // Adjuntar los eventos inicialmente
    attachAppointmentEvents();

    // Si la agenda se reconstruye dinámicamente, habría que llamar a attachAppointmentEvents() de nuevo

    // --- Lógica del Panel Lateral de Detalles de Cliente ---
    const clientPanel = document.getElementById('client-details-panel');
    const clientBackdrop = document.getElementById('client-details-backdrop');
    const btnCloseClientPanel = document.getElementById('btn-close-client-panel');
    
    // Función para abrir el panel
    function openClientPanel() {
        if (clientPanel && clientBackdrop) {
            clientPanel.classList.add('active');
            clientBackdrop.classList.add('active');
        }
    }

    // Función para cerrar el panel
    function closeClientPanel() {
        if (clientPanel && clientBackdrop) {
            clientPanel.classList.remove('active');
            clientBackdrop.classList.remove('active');
        }
    }

    // Eventos para cerrar
    if (btnCloseClientPanel) {
        btnCloseClientPanel.addEventListener('click', closeClientPanel);
    }
    
    if (clientBackdrop) {
        clientBackdrop.addEventListener('click', closeClientPanel);
    }

    // Evento para abrir al hacer clic en cualquier fila de la tabla de clientes
    function attachClientEvents() {
        const clientRows = document.querySelectorAll('.clientes-table tbody tr');
        clientRows.forEach(row => {
            row.style.cursor = 'pointer';
            row.removeEventListener('click', openClientPanel);
            row.addEventListener('click', (e) => {
                // Prevenir abrir el panel si se hace clic en un botón de acción (editar/borrar)
                if(e.target.closest('.btn-action')) return;
                
                e.stopPropagation();
                openClientPanel();
            });
        });
    }

    // Adjuntar los eventos inicialmente
    // --- Lógica de la página Añadir Profesional ---
    const btnAddProf = document.querySelector('.btn-add-prof');
    const pageMiEquipo = document.getElementById('page-mi-equipo');
    const pageAddProfesional = document.getElementById('page-add-profesional');
    const btnBackMiEquipo = document.getElementById('btn-back-mi-equipo');
    const btnCancelProf = document.getElementById('btn-cancel-prof');
    const btnSaveProf = document.querySelector('.btn-save-prof');

    function showAddProfPage() {
        if (pageAddProfesional && pageMiEquipo) {
            // Ocultar todas las secciones primero
            pageSections.forEach(sec => sec.classList.remove('active'));
            // Mostrar página añadir
            pageAddProfesional.classList.add('active');
        }
    }

    function hideAddProfPage() {
        if (pageAddProfesional && pageMiEquipo) {
            pageSections.forEach(sec => sec.classList.remove('active'));
            pageMiEquipo.classList.add('active');
        }
    }

    if (btnAddProf) btnAddProf.addEventListener('click', showAddProfPage);
    if (btnBackMiEquipo) btnBackMiEquipo.addEventListener('click', hideAddProfPage);
    if (btnCancelProf) btnCancelProf.addEventListener('click', hideAddProfPage);
    if (btnSaveProf) {
        btnSaveProf.addEventListener('click', () => {
            // Aquí iría la lógica de guardado
            hideAddProfPage();
        });
    }

    // --- Lógica de la página Mi Cuenta ---
    const btnMiCuenta = document.getElementById('btn-mi-cuenta');
    const pageAjustes = document.getElementById('page-ajustes');
    const pageMiCuenta = document.getElementById('page-mi-cuenta');
    const btnBackMiCuenta = document.getElementById('btn-back-mi-cuenta');

    function showMiCuentaPage() {
        if (pageMiCuenta && pageAjustes) {
            pageSections.forEach(sec => sec.classList.remove('active'));
            pageMiCuenta.classList.add('active');
        }
    }

    function hideMiCuentaPage() {
        if (pageMiCuenta && pageAjustes) {
            pageSections.forEach(sec => sec.classList.remove('active'));
            pageAjustes.classList.add('active');
        }
    }

    if (btnMiCuenta) {
        btnMiCuenta.addEventListener('click', (e) => {
            e.preventDefault();
            showMiCuentaPage();
        });
    }
    
    if (btnBackMiCuenta) {
        btnBackMiCuenta.addEventListener('click', hideMiCuentaPage);
    }

    // --- Lógica de la página Portal del Negocio ---
    const btnPortalNegocio = document.getElementById('btn-portal-negocio');
    const pagePortalNegocio = document.getElementById('page-portal-negocio');
    const btnBackPortal = document.getElementById('btn-back-portal');

    function showPortalNegocioPage() {
        if (pagePortalNegocio && pageAjustes) {
            pageSections.forEach(sec => sec.classList.remove('active'));
            pagePortalNegocio.classList.add('active');
        }
    }

    function hidePortalNegocioPage() {
        if (pagePortalNegocio && pageAjustes) {
            pageSections.forEach(sec => sec.classList.remove('active'));
            pageAjustes.classList.add('active');
        }
    }

    if (btnPortalNegocio) {
        btnPortalNegocio.addEventListener('click', (e) => {
            e.preventDefault();
            showPortalNegocioPage();
        });
    }
    
    if (btnBackPortal) {
        btnBackPortal.addEventListener('click', hidePortalNegocioPage);
    }

    // Toggle switch logic for the Portal del Negocio services
    document.addEventListener('click', (e) => {
        if (e.target.closest('.pn-toggle')) {
            const toggle = e.target.closest('.pn-toggle');
            toggle.classList.toggle('off');
            toggle.classList.toggle('active');
        }
    });

    // --- Lógica de la página Ajustes (Slider Tamaño Texto) ---
    const textSizeContainer = document.getElementById('text-size-container');
    if (textSizeContainer) {
        const fill = document.getElementById('text-size-fill');
        const dots = document.querySelectorAll('.custom-slider-dot');
        const labels = document.querySelectorAll('.custom-slider-label');
        const track = document.getElementById('text-size-track');
        
        function updateSlider(value) {
            // Actualizar la barra azul
            if (value === 0) fill.style.width = '0%';
            else if (value === 1) fill.style.width = '50%';
            else fill.style.width = '100%';
            
            // Actualizar los puntos (dots)
            dots.forEach(dot => {
                const dotIndex = parseInt(dot.getAttribute('data-index'), 10);
                if (dotIndex <= value) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // Actualizar los labels
            labels.forEach(label => {
                const labelIndex = parseInt(label.getAttribute('data-index'), 10);
                if (labelIndex === value) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });
        }
        
        // Asignar eventos de click a los puntos y etiquetas
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const value = parseInt(e.target.getAttribute('data-index'), 10);
                updateSlider(value);
            });
        });
        
        labels.forEach(label => {
            label.addEventListener('click', (e) => {
                const value = parseInt(e.target.getAttribute('data-index'), 10);
                updateSlider(value);
            });
        });
        
        // Eventos de arrastre (Drag) para la barra
        let isDragging = false;
        
        function handleDragMove(e) {
            if (!isDragging) return;
            const rect = track.getBoundingClientRect();
            // Soporte para ratón y táctil
            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const x = clientX - rect.left;
            let percentage = x / rect.width;
            
            // Limitar entre 0 y 1
            percentage = Math.max(0, Math.min(1, percentage));
            
            let value = 1;
            if (percentage < 0.25) value = 0;
            else if (percentage > 0.75) value = 2;
            
            updateSlider(value);
        }

        if (track) {
            // Ratón
            track.addEventListener('mousedown', (e) => {
                isDragging = true;
                handleDragMove(e);
            });
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', () => { isDragging = false; });
            
            // Táctil (móviles)
            track.addEventListener('touchstart', (e) => {
                isDragging = true;
                handleDragMove(e);
            }, {passive: true});
            window.addEventListener('touchmove', handleDragMove, {passive: true});
            window.addEventListener('touchend', () => { isDragging = false; });
        }
    }
    
    // --- Lógica del Toggle (Alto Contraste) ---
    const toggleSwitch = document.querySelector('.toggle-switch');
    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', () => {
            toggleSwitch.classList.toggle('active');
        });
    }
    // --- Client Details Panel Logic ---
    function openClientDetails(client) {
        const panel = document.getElementById('client-details-panel');
        const backdrop = document.querySelector('.client-details-backdrop');
        
        if (!panel || !backdrop) return;
        
        // Rellenar datos
        const nameEl = panel.querySelector('.cd-name');
        if (nameEl) nameEl.textContent = client.name;
        
        const avatarEl = panel.querySelector('.cd-avatar');
        if (avatarEl) avatarEl.textContent = client.name.charAt(0).toUpperCase();
        
        const contactItems = panel.querySelectorAll('.cd-contact-item');
        if (contactItems.length >= 2) {
            contactItems[0].innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> ${client.email || 'Sin correo'}`;
            contactItems[1].innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${client.phone}`;
        }
        
        const statVals = panel.querySelectorAll('.cd-stat-val');
        if (statVals.length >= 3) {
            let formattedLastAppt = client.lastAppt;
            if (formattedLastAppt && formattedLastAppt.includes('-')) {
                const parts = formattedLastAppt.split('-');
                if (parts.length === 3) formattedLastAppt = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            statVals[0].textContent = formattedLastAppt || '-';
            statVals[1].textContent = client.totalAppts || '0';
            
            // Calcular tasa de asistencia real basada en el historial
            let completed = 0;
            let totalEvaluated = 0;
            if (client.history && client.history.length > 0) {
                client.history.forEach(item => {
                    if (item.status === 'completed') {
                        completed++;
                        totalEvaluated++;
                    } else if (item.status === 'noshow') {
                        totalEvaluated++;
                    }
                });
            }
            let attendanceRate = '0%';
            if (totalEvaluated > 0) {
                attendanceRate = Math.round((completed / totalEvaluated) * 100) + '%';
            }
            statVals[2].textContent = attendanceRate; 
        }
        
        const regDateEl = panel.querySelector('.cd-reg-date');
        if (regDateEl) {
            let dateStr = client.registeredAt;
            if (dateStr && dateStr.includes('-')) {
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }
            regDateEl.textContent = dateStr || '-';
        }
        
        // Renderizar Historial
        const timelineContainer = panel.querySelector('.history-timeline');
        if (timelineContainer && client.history) {
            timelineContainer.innerHTML = ''; // Limpiar previo
            if (client.history.length === 0) {
                timelineContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: #64748b;">No hay historial registrado.</div>';
            } else {
                client.history.forEach(item => {
                    let markerColor = 'marker-blue';
                    let markerIcon = '<line x1="5" y1="12" x2="19" y2="12"></line>';
                    let badgeClass = 'badge-pending';
                    let badgeText = 'Pendiente';
                    
                    if (item.status === 'completed') {
                        markerColor = 'marker-green';
                        markerIcon = '<polyline points="20 6 9 17 4 12"></polyline>';
                        badgeClass = 'badge-completed';
                        badgeText = 'Completado';
                    } else if (item.status === 'noshow') {
                        markerColor = 'marker-red';
                        markerIcon = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
                        badgeClass = 'badge-noshow';
                        badgeText = 'No Show';
                    }
                    
                    const itemHTML = `
                        <div class="history-item">
                            <div class="history-marker ${markerColor}">
                                <div class="marker-dot">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${markerIcon}</svg>
                                </div>
                                <div class="marker-line"></div>
                            </div>
                            <div class="history-content">
                                <div class="history-header">
                                    <span class="history-date">${item.date}</span>
                                    <span class="history-badge ${badgeClass}">${badgeText}</span>
                                </div>
                                <div class="history-service">${item.service}</div>
                                <div class="history-prof">
                                    <span>Atendido por <strong>${item.prof}</strong></span>
                                </div>
                            </div>
                        </div>
                    `;
                    timelineContainer.insertAdjacentHTML('beforeend', itemHTML);
                });
            }
        }
        
        // Renderizar Notas
        const notesEl = panel.querySelector('.notes-text');
        if (notesEl) {
            notesEl.textContent = client.notes || 'No hay notas internas registradas para este cliente.';
        }
        
        // Resetear a la pestaña Historial por defecto
        const tabs = panel.querySelectorAll('.cd-tab');
        const historyContent = panel.querySelector('.cd-history-content');
        const notesContent = panel.querySelector('.cd-notes-content');
        if (tabs.length >= 2 && historyContent && notesContent) {
            tabs.forEach(t => t.classList.remove('active'));
            tabs[0].classList.add('active'); // Seleccionar historial
            historyContent.style.display = 'block';
            notesContent.style.display = 'none';
        }
        
        // Asignar botón eliminar
        const deleteClientBtn = panel.querySelector('.btn-delete-client');
        if (deleteClientBtn) {
            deleteClientBtn.onclick = () => {
                window.clientToDeleteId = client.id;
                window.clientToDeleteBtn = deleteClientBtn;
                const modalConfirmDelete = document.getElementById('modal-confirm-delete');
                if (modalConfirmDelete) modalConfirmDelete.classList.add('active');
            };
        }
        
        // Asignar botón editar
        const editClientBtn = panel.querySelector('.btn-edit-cd');
        if (editClientBtn) {
            editClientBtn.onclick = (e) => {
                e.stopPropagation();
                if (typeof window.openEditClientModal === 'function') {
                    window.openEditClientModal(client);
                }
            };
        }
        
        // Abrir panel
        panel.classList.add('active');
        backdrop.classList.add('active');
        
        // Asignar botn cerrar
        const closeBtn = document.getElementById('btn-close-client-panel');
        if (closeBtn) {
            closeBtn.onclick = () => {
                panel.classList.remove('active');
                backdrop.classList.remove('active');
            };
        }
        
        // Cerrar haciendo click en el fondo
        backdrop.onclick = () => {
            panel.classList.remove('active');
            backdrop.classList.remove('active');
        };
    }
    
    // Configurar lógica de pestañas (Tabs)
    const tabs = document.querySelectorAll('.cd-tab');
    const historyContent = document.querySelector('.cd-history-content');
    const notesContent = document.querySelector('.cd-notes-content');
    
    if (tabs.length >= 2 && historyContent && notesContent) {
        tabs[0].addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabs[0].classList.add('active');
            historyContent.style.display = 'block';
            notesContent.style.display = 'none';
        });
        
        tabs[1].addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabs[1].classList.add('active');
            historyContent.style.display = 'none';
            notesContent.style.display = 'block';
        });
    }
    
    // --- Confirm Delete Modal Logic ---
    const modalConfirmDelete = document.getElementById('modal-confirm-delete');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    
    if (modalConfirmDelete && btnCancelDelete && btnConfirmDelete) {
        btnCancelDelete.addEventListener('click', () => {
            modalConfirmDelete.classList.remove('active');
            window.clientToDeleteId = null;
            window.clientToDeleteBtn = null;
        });
        
        btnConfirmDelete.addEventListener('click', async () => {
            if (window.clientToDeleteId && window.clientToDeleteBtn) {
                const btn = window.clientToDeleteBtn;
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg>';
                
                modalConfirmDelete.classList.remove('active');
                await window.MockAPI.deleteClient(window.clientToDeleteId);
                loadClients(); // Reload
                
                // Si estamos borrando desde el panel, cerrarlo
                const clientPanel = document.getElementById('client-details-panel');
                const clientBackdrop = document.getElementById('client-details-backdrop');
                if (clientPanel && clientPanel.classList.contains('active')) {
                    clientPanel.classList.remove('active');
                    if(clientBackdrop) clientBackdrop.classList.remove('active');
                    // Restaurar HTML del botón del panel por si se vuelve a abrir
                    btn.innerHTML = originalHtml;
                }
                
                window.clientToDeleteId = null;
                window.clientToDeleteBtn = null;
            }
        });
    }
    
    // --- Lógica del Modal Editar Cliente ---
    const modalEditarCliente = document.getElementById('modal-editar-cliente');
    const btnCloseModalEditCliente = document.getElementById('btn-close-modal-edit-cliente');
    const btnCancelModalEditCliente = document.getElementById('btn-cancel-modal-edit-cliente');
    const btnSaveEditCliente = document.getElementById('btn-save-edit-cliente');
    
    window.openEditClientModal = function(client) {
        if (!modalEditarCliente) return;
        
        window.clientToEditId = client.id;
        
        document.getElementById('edit-client-name').value = client.name || '';
        document.getElementById('edit-client-email').value = client.email || '';
        document.getElementById('edit-client-phone').value = client.phone || '';
        document.getElementById('edit-client-notes').value = client.notes || '';
        
        modalEditarCliente.classList.add('active');
    };
    
    function closeEditClientModal() {
        if (modalEditarCliente) {
            modalEditarCliente.classList.remove('active');
            window.clientToEditId = null;
        }
    }
    
    if (btnCloseModalEditCliente) btnCloseModalEditCliente.addEventListener('click', closeEditClientModal);
    if (btnCancelModalEditCliente) btnCancelModalEditCliente.addEventListener('click', closeEditClientModal);
    
    if (btnSaveEditCliente) {
        btnSaveEditCliente.addEventListener('click', async () => {
            const btn = btnSaveEditCliente;
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Guardando...';
            btn.disabled = true;
            
            const name = document.getElementById('edit-client-name').value.trim();
            const email = document.getElementById('edit-client-email').value.trim();
            const phone = document.getElementById('edit-client-phone').value.trim();
            const notes = document.getElementById('edit-client-notes').value.trim();
            
            if (!name) {
                alert('El nombre es obligatorio');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            
            const updatedData = { name, email, phone, notes };
            await window.MockAPI.editClient(window.clientToEditId, updatedData);
            
            loadClients(); // Recargar tabla
            
            // Si el panel de cliente está abierto, actualizarlo
            const clientPanel = document.getElementById('client-details-panel');
            if (clientPanel && clientPanel.classList.contains('active')) {
                const clientsList = await window.MockAPI.getClients();
                const updatedClient = clientsList.find(c => c.id === window.clientToEditId);
                if (updatedClient) {
                    openClientDetails(updatedClient);
                }
            }
            
            closeEditClientModal();
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    }
    
    // Búsqueda de clientes en la barra superior
    const topbarClientSearch = document.getElementById('topbar-client-search');
    if (topbarClientSearch) {
        topbarClientSearch.addEventListener('input', () => {
            // Resetear paginación al buscar
            if (typeof currentPage !== 'undefined') currentPage = 1;
            if (typeof loadClients === 'function') loadClients();
        });
    }
});
