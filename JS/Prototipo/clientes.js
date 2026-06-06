document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Backend: Carga de Clientes y Paginación ---
    let currentPage = 1;
    const itemsPerPage = 8;
    
    window.resetClientSearch = function() {
        currentPage = 1;
        loadClients();
    };

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

    window.loadClients = loadClients;

    // Evento para el botón "+ Nuevo Cliente" (Abre el modal)
    const btnNuevoCliente = document.querySelector('.btn-nuevo-cliente');
    const modalNuevoCliente = document.getElementById('modal-nuevo-cliente');
    const btnCloseCliente = document.getElementById('btn-close-modal-cliente');
    const btnCancelCliente = document.getElementById('btn-cancel-modal-cliente');
    const btnSaveCliente = document.getElementById('btn-save-cliente');
    
    window.openNuevoClienteModal = function(returnToAppt = false) {
        window.returnToApptModal = returnToAppt;
        if (modalNuevoCliente) modalNuevoCliente.classList.add('active');
    };

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
        
        // Guardar Cliente Real
        if (btnSaveCliente) {
            btnSaveCliente.addEventListener('click', async () => {
                const nameInput = document.getElementById('new-client-name');
                const emailInput = document.getElementById('new-client-email');
                const phoneInput = document.getElementById('new-client-phone');
                
                const nameVal = nameInput ? nameInput.value.trim() : '';
                const emailVal = emailInput ? emailInput.value.trim() : '';
                const phoneVal = phoneInput ? phoneInput.value.trim() : '';
                
                if (!nameVal || nameVal.trim().length < 3) {
                    if (window.showToast) window.showToast('Error de Validación', 'El nombre es obligatorio y debe tener al menos 3 caracteres.', 'error');
                    return;
                }
                
                // Email is optional but must be valid
                if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal)) {
                    if (window.showToast) window.showToast('Error de Validación', 'El formato del correo electrónico no es válido.', 'error');
                    return;
                }
                
                // Phone is mandatory and needs at least 9 digits
                const phoneDigits = phoneVal ? phoneVal.replace(/\D/g, '') : '';
                if (!phoneVal || phoneDigits.length < 9) {
                    if (window.showToast) window.showToast('Error de Validación', 'El número de teléfono es obligatorio y debe contener al menos 9 dígitos.', 'error');
                    return;
                }
                
                // Estado de carga en el botón guardar
                const originalContent = btnSaveCliente.innerHTML;
                btnSaveCliente.innerHTML = '<svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg> Guardando...';
                btnSaveCliente.style.pointerEvents = 'none';

                let finalPhone = phoneVal || '-';
                if (finalPhone !== '-' && !finalPhone.startsWith('+')) {
                    finalPhone = '+34 ' + finalPhone;
                }

                await window.MockAPI.addClient({
                    name: nameVal,
                    email: emailVal,
                    phone: finalPhone,
                    lastAppt: null
                });
                
                if (window.showToast) window.showToast('Éxito', 'Cliente registrado correctamente en el sistema.', 'success');

                // Restaurar y cerrar
                btnSaveCliente.innerHTML = originalContent;
                btnSaveCliente.style.pointerEvents = 'auto';
                closeClienteModal();
                currentPage = 1; // Volver a la primera página para ver el nuevo
                loadClients();
                
                if (window.returnToApptModal) {
                    window.returnToApptModal = false;
                    if (window.openNuevaCitaModal) {
                        window.openNuevaCitaModal(nameVal);
                    }
                }
            });
        }
    }

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
        
        // Asignar botón nueva cita
        const newApptBtn = panel.querySelector('.btn-new-appt');
        if (newApptBtn) {
            newApptBtn.onclick = (e) => {
                e.stopPropagation();
                if (typeof window.openNuevaCitaModal === 'function') {
                    window.openNuevaCitaModal(client.name);
                    closeClientPanel();
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
                if (window.showToast) window.showToast('Cliente Eliminado', 'El cliente ha sido eliminado permanentemente del sistema.', 'error');
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
    
    window.openEditClientModal = function(client, readonlyFields = false) {
        if (!modalEditarCliente) return;
        
        window.clientToEditId = client.id;
        
        const nameInput = document.getElementById('edit-client-name');
        const emailInput = document.getElementById('edit-client-email');
        const phoneInput = document.getElementById('edit-client-phone');
        const notesInput = document.getElementById('edit-client-notes');

        nameInput.value = client.name || '';
        emailInput.value = client.email || '';
        phoneInput.value = client.phone || '';
        notesInput.value = client.notes || '';

        if (readonlyFields) {
            nameInput.setAttribute('readonly', 'true');
            emailInput.setAttribute('readonly', 'true');
            phoneInput.setAttribute('readonly', 'true');
            nameInput.style.opacity = '0.6';
            emailInput.style.opacity = '0.6';
            phoneInput.style.opacity = '0.6';
        } else {
            nameInput.removeAttribute('readonly');
            emailInput.removeAttribute('readonly');
            phoneInput.removeAttribute('readonly');
            nameInput.style.opacity = '1';
            emailInput.style.opacity = '1';
            phoneInput.style.opacity = '1';
        }
        
        window.openedFromAgendaPanel = readonlyFields;
        
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
            
            if (!name || name.trim().length < 3) {
                if (window.showToast) window.showToast('Error de Validación', 'El nombre es obligatorio y debe tener al menos 3 caracteres.', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                if (window.showToast) window.showToast('Error de Validación', 'El formato del correo electrónico no es válido.', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            
            const editPhoneDigits = phone ? phone.replace(/\D/g, '') : '';
            if (!phone || editPhoneDigits.length < 9) {
                if (window.showToast) window.showToast('Error de Validación', 'El número de teléfono es obligatorio y debe contener al menos 9 dígitos.', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            
            const updatedData = { name, email, phone, notes };
            await window.MockAPI.editClient(window.clientToEditId, updatedData);
            
            if (window.showToast) window.showToast('Éxito', 'Datos del cliente actualizados correctamente.', 'success');
            
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

            // Si se abrió desde la agenda, actualizar el texto de notas del panel
            if (window.openedFromAgendaPanel) {
                const notesText = document.querySelector('.notes-text');
                if (notesText) notesText.textContent = notes || "No hay notas registradas para este cliente.";
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
            // Cambiar a la pestaña de clientes automáticamente
            const btnClientes = document.querySelector('.nav-item[data-target="page-clientes"]');
            if (btnClientes && !btnClientes.classList.contains('active')) {
                btnClientes.click();
            }
            
            // Resetear paginación al buscar
            if (typeof currentPage !== 'undefined') currentPage = 1;
            if (typeof loadClients === 'function') loadClients();
        });
    }
});
