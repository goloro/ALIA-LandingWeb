document.addEventListener('DOMContentLoaded', () => {
    // Definición de Enumeración de Estados para Profesionales
    const PROFESSIONAL_STATUS = {
        ACTIVE: { id: 'active', label: 'Activo', class: 'pill-activo' },
        INACTIVE: { id: 'inactive', label: 'No activo', class: 'pill-inactivo' },
        DAY_OFF: { id: 'day_off', label: 'Descansa hoy', class: 'pill-descanso' },
        LUNCH_BREAK: { id: 'lunch_break', label: 'En pausa', class: 'pill-pausa' }
    };

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
            if (typeof pageSections !== 'undefined') {
                pageSections.forEach(sec => sec.classList.remove('active'));
            } else {
                // Fallback si pageSections no está definido en este scope
                document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
            }
            // Mostrar página añadir
            pageAddProfesional.classList.add('active');
        }
    }

    function hideAddProfPage() {
        if (pageAddProfesional && pageMiEquipo) {
            if (typeof pageSections !== 'undefined') {
                pageSections.forEach(sec => sec.classList.remove('active'));
            } else {
                document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
            }
            pageMiEquipo.classList.add('active');
        }
    }

    if (btnAddProf) btnAddProf.addEventListener('click', showAddProfPage);
    if (btnBackMiEquipo) btnBackMiEquipo.addEventListener('click', hideAddProfPage);
    const cancelModal = document.getElementById('modal-confirm-cancel-add-prof');
    const btnCancelCancel = document.getElementById('btn-cancel-cancel-add-prof');
    const btnConfirmCancel = document.getElementById('btn-confirm-cancel-add-prof');

    if (btnCancelProf) {
        btnCancelProf.addEventListener('click', () => {
            if (cancelModal) cancelModal.style.display = 'flex';
            else hideAddProfPage();
        });
    }

    if (btnCancelCancel) {
        btnCancelCancel.addEventListener('click', () => {
            if (cancelModal) cancelModal.style.display = 'none';
        });
    }

    if (btnConfirmCancel) {
        btnConfirmCancel.addEventListener('click', () => {
            if (cancelModal) cancelModal.style.display = 'none';
            hideAddProfPage();
        });
    }
    
    const dobInput = document.getElementById('add-prof-dob');
    if (dobInput) {
        dobInput.addEventListener('input', (e) => {
            // Remove anything that is not a digit, slash, or dash
            e.target.value = e.target.value.replace(/[^\d\/\-]/g, '');
        });
    }

    const phoneInputProto = document.getElementById('add-prof-phone');
    if (phoneInputProto) {
        phoneInputProto.addEventListener('input', (e) => {
            // Solo números, +, -, y espacios
            e.target.value = e.target.value.replace(/[^\d\+\-\s]/g, '');
        });
    }

    const ssnInputProto = document.getElementById('add-prof-ssn');
    if (ssnInputProto) {
        ssnInputProto.addEventListener('input', (e) => {
            // Solo números
            e.target.value = e.target.value.replace(/[^\d]/g, '');
        });
    }

    const dniInputProto = document.getElementById('add-prof-dni');
    if (dniInputProto) {
        dniInputProto.addEventListener('input', (e) => {
            // Permitimos números y letras, bloqueando símbolos y espacios
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
        });
    }

    if (btnSaveProf) {
        btnSaveProf.addEventListener('click', () => {
            const nameInput = document.getElementById('add-prof-name');
            const emailInput = document.getElementById('add-prof-email');
            const phoneInput = document.getElementById('add-prof-phone');
            const dobInput = document.getElementById('add-prof-dob');
            const addressInput = document.getElementById('add-prof-address');
            const roleContainer = document.getElementById('add-prof-role');
            const ssnInput = document.getElementById('add-prof-ssn');
            const dniInput = document.getElementById('add-prof-dni');
            const hireDateInput = document.getElementById('add-prof-hire-date');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const dob = dobInput ? dobInput.value.trim() : '';
            const address = addressInput ? addressInput.value.trim() : '';
            const role = roleContainer ? roleContainer.querySelector('.selected-value').textContent : 'Estilista';
            const ssn = ssnInput ? ssnInput.value.trim() : '';
            const dni = dniInput ? dniInput.value.trim() : '';
            const hireDate = hireDateInput ? hireDateInput.value.trim() : '';
            
            // Validate generic empty fields
            if (!name || !address || !ssn || !dni || !hireDate) {
                if (window.showToast) window.showToast('Campos Incompletos', 'Por favor, rellene todos los campos obligatorios', 'error');
                else alert('Por favor, rellene todos los campos obligatorios');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                if (window.showToast) window.showToast('Error de Validación', 'Debe introducir un correo electrónico válido', 'error');
                else alert('Debe introducir un correo electrónico válido');
                return;
            }
            
            // Validar teléfono (obligatorio, al menos 9 caracteres y permitir +, -, espacios)
            const phoneRegex = /^[0-9\+\s\-]{9,}$/;
            if (!phone || !phoneRegex.test(phone)) {
                if (window.showToast) window.showToast('Error de Validación', 'El teléfono es obligatorio y debe contener al menos 9 dígitos', 'error');
                else alert('El teléfono es obligatorio y debe contener al menos 9 dígitos');
                return;
            }
            
            // Validar fecha de nacimiento (obligatorio, formato DD/MM/YYYY o DD-MM-YYYY)
            const dobRegex = /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.](19|20)\d\d$/;
            if (!dob || !dobRegex.test(dob)) {
                if (window.showToast) window.showToast('Error de Validación', 'La fecha de nacimiento es obligatoria (formato DD/MM/YYYY)', 'error');
                else alert('La fecha de nacimiento es obligatoria (formato DD/MM/YYYY)');
                return;
            }
            
            // Comprobar mayoría de edad (18 años)
            const parts = dob.split(/[- \/.]/);
            const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
            const todayDate = new Date();
            let age = todayDate.getFullYear() - birthDate.getFullYear();
            const m = todayDate.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && todayDate.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 18) {
                if (window.showToast) window.showToast('Error de Validación', 'El profesional debe tener al menos 18 años', 'error');
                else alert('El profesional debe tener al menos 18 años');
                return;
            }
            
            // Add invitation
            if (!window.MockAPI.state.invitations) {
                window.MockAPI.state.invitations = [];
            }
            
            const today = new Date();
            const dateStr = today.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
            
            // Generar ID secuencial: uno más que el último ID de la lista
            const maxId = window.MockAPI.state.invitations.reduce((max, inv) => {
                const currentId = typeof inv.id === 'number' ? inv.id : 0;
                return Math.max(max, currentId);
            }, 0);
            const newId = maxId + 1;
            
            window.MockAPI.state.invitations.push({
                id: newId,
                name: name,
                email: email,
                phone: phone,
                dob: dob,
                address: address,
                role: role,
                ssn: ssn,
                dni: dni,
                hireDate: hireDate,
                date: dateStr,
                status: 'Pendiente'
            });
            
            // Clear inputs
            if (nameInput) nameInput.value = '';
            if (emailInput) emailInput.value = '';
            if (phoneInput) phoneInput.value = '';
            if (dobInput) dobInput.value = '';
            if (addressInput) addressInput.value = '';
            if (ssnInput) ssnInput.value = '';
            if (dniInput) dniInput.value = '';
            if (hireDateInput) hireDateInput.value = '';
            
            renderInvitations();
            
            if (window.showToast) window.showToast('Éxito', 'Invitación enviada correctamente', 'success');
            hideAddProfPage();
        });
    }

    function renderInvitations() {
        const container = document.getElementById('invitations-container');
        if (!container) return;
        
        const invitations = window.MockAPI?.state?.invitations || [];
        
        if (invitations.length === 0) {
            container.innerHTML = `
                <div class="invitation-card" style="display: flex; align-items: center; justify-content: center; padding: 24px; color: #94a3b8;">
                    <span style="font-size: 0.95rem;">No hay invitaciones enviadas</span>
                </div>
            `;
            return;
        }
        
        let html = `
        <div class="eq-table-wrapper" style="margin-top: 16px;">
            <table class="eq-table">
                <thead>
                    <tr>
                        <th style="width: 35%;">NOMBRE / EMAIL</th>
                        <th style="width: 20%;">ROL</th>
                        <th style="width: 20%;">FECHA ALTA</th>
                        <th style="width: 15%; text-align: center;">ESTADO</th>
                        <th style="width: 10%; text-align: center;">ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        invitations.forEach((inv, index) => {
            const initial = inv.name.charAt(0).toUpperCase();
            
            // Hack para el caso de María: siempre mostrar Hoy + 4 días si es la invitación de prueba (ID 1)
            let displayHireDate = inv.hireDate || 'No definida';
            if (inv.id === 1) {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 4);
                displayHireDate = futureDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }

            html += `
                <tr>
                    <td>
                        <div class="eq-prof-cell">
                            <div class="eq-avatar avatar-j" style="background-color: #cbd5e1; color: white;">${initial}</div>
                            <div class="eq-prof-info">
                                <span class="eq-prof-name">${inv.name}</span>
                                <span class="eq-prof-email">${inv.email}</span>
                            </div>
                        </div>
                    </td>
                    <td><span class="eq-spec">${inv.role}</span></td>
                    <td><span style="color: var(--portal-text-main); font-weight: 500;">${displayHireDate}</span></td>
                    <td style="text-align: center;">
                        <span class="pill-status" style="background-color: #fef3c7; color: #d97706;">${inv.status}</span>
                    </td>
                    <td style="text-align: center;">
                        <div style="display: inline-flex; justify-content: center; align-items: center; gap: 8px;">
                            <button class="btn-action btn-delete btn-cancel-inv" data-index="${index}" title="Cancelar Invitación" style="background-color: #fee2e2; color: #ef4444;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        </div>
        `;
        
        container.innerHTML = html;
        
        // Add listeners for cancel buttons
        container.querySelectorAll('.btn-cancel-inv').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.dataset.index;
                const modal = document.getElementById('modal-confirm-delete-inv');
                
                if (modal) {
                    modal.style.display = 'flex';
                    
                    const btnCancel = document.getElementById('btn-cancel-delete-inv');
                    const btnConfirm = document.getElementById('btn-confirm-delete-inv');
                    
                    // Clonar botones para limpiar listeners anteriores
                    const newBtnCancel = btnCancel.cloneNode(true);
                    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
                    
                    const newBtnConfirm = btnConfirm.cloneNode(true);
                    btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);
                    
                    newBtnCancel.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                    
                    newBtnConfirm.addEventListener('click', () => {
                        window.MockAPI.state.invitations.splice(idx, 1);
                        renderInvitations();
                        modal.style.display = 'none';
                        if (window.showToast) window.showToast('Cancelada', 'Invitación anulada con éxito', 'success');
                    });
                } else {
                    // Fallback
                    window.MockAPI.state.invitations.splice(idx, 1);
                    renderInvitations();
                    if (window.showToast) window.showToast('Cancelada', 'Invitación cancelada con éxito', 'success');
                }
            });
        });
    }

    // (renderInvitations se llama al final tras cargar datos)

    // --- Lógica de la tabla Mi Equipo ---
    async function renderTeamTable() {
        const tbody = document.getElementById('eq-table-body');
        if (!tbody) return;
        
        let teamData = [];
        let closedDays = [];
        if (window.MockAPI) {
            teamData = await window.MockAPI.getTeam();
            if (window.MockAPI.state.businessInfo && window.MockAPI.state.businessInfo.closedDays) {
                closedDays = window.MockAPI.state.businessInfo.closedDays;
            }
        }
        
        const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
        const currentUserAvatar = window.MockAPI?.state?.currentUser?.avatar || '../Images/Logos/LogoPeluqueríaNegro.png';
        const currentUserEmail = window.MockAPI?.state?.currentUser?.email || 'propietario@alia.com';
        
        const fullTeam = [
            { name: currentUserName, role: 'Propietario', email: currentUserEmail, avatarUrl: currentUserAvatar, status: 'ACTIVO', isMe: true, diasLibres: [1] },
            ...teamData
        ];
        
        const totalStaff = fullTeam.length;
        let activosHoy = 0;
        
        tbody.innerHTML = '';
        
        fullTeam.forEach(prof => {
            const today = new Date().getDay() || 7; // 1-7
            
            // Determinar estado actual
            let currentStatus = PROFESSIONAL_STATUS.ACTIVE;
            
            // 1. Check Días Libres / Cerrado
            if ((prof.diasLibres && prof.diasLibres.includes(today)) || 
                prof.dayOff === today || 
                closedDays.includes(today)) {
                currentStatus = PROFESSIONAL_STATUS.DAY_OFF;
            } else {
                // Check Horarios (Si no es día libre)
                const now = new Date();
                const currentH = now.getHours();
                const currentM = now.getMinutes();
                const currentTimeVal = currentH + currentM / 60;
                
                // Horario de apertura negocio
                let bizStart = 9, bizEnd = 20; // Default 09:00 - 20:00
                if (window.MockAPI?.state?.businessInfo?.businessHours) {
                    const bh = window.MockAPI.state.businessInfo.businessHours;
                    if (bh.start) bizStart = parseInt(bh.start.split(':')[0]) + parseInt(bh.start.split(':')[1])/60;
                    if (bh.end) bizEnd = parseInt(bh.end.split(':')[0]) + parseInt(bh.end.split(':')[1])/60;
                }
                
                // 2. Check Fuera de horario
                if (currentTimeVal < bizStart || currentTimeVal >= bizEnd) {
                    currentStatus = PROFESSIONAL_STATUS.INACTIVE;
                } else {
                    // 3. Check Pausa de Almuerzo
                    let lunchStartVal = null, lunchEndVal = null;
                    if (prof.pausaAlmuerzo && prof.pausaAlmuerzo.start && prof.pausaAlmuerzo.end) {
                        const [sh, sm] = prof.pausaAlmuerzo.start.split(':').map(Number);
                        const [eh, em] = prof.pausaAlmuerzo.end.split(':').map(Number);
                        lunchStartVal = sh + sm/60;
                        lunchEndVal = eh + em/60;
                    } else if (prof.lunchBreak) {
                        const [sh, sm] = prof.lunchBreak.split(':').map(Number);
                        lunchStartVal = sh + sm/60;
                        lunchEndVal = lunchStartVal + 1; // 1 hora por defecto
                    }
                    
                    if (lunchStartVal !== null && currentTimeVal >= lunchStartVal && currentTimeVal < lunchEndVal) {
                        currentStatus = PROFESSIONAL_STATUS.LUNCH_BREAK;
                    }
                }
            }
            
            if (currentStatus.id !== 'day_off') {
                activosHoy++; // Todos los que trabajan hoy, independientemente de la hora actual
            }
            
            prof.statusObj = currentStatus;
            
            const tr = document.createElement('tr');
            
            const initial = prof.name ? prof.name.charAt(0).toUpperCase() : 'U';
            let avatarHtml = `<div class="eq-avatar avatar-j">${initial}</div>`;
            if (prof.avatarUrl && prof.avatarUrl !== '') {
                avatarHtml = `<img src="${prof.avatarUrl}" alt="${prof.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
            }
            
            const profNameDisplay = prof.isMe ? `${prof.name} (Tú)` : prof.name;
            const statusDisplay = prof.statusObj.label;
            const statusClass = prof.statusObj.class;
            const emailDisplay = prof.email || `${prof.name.toLowerCase().replace(/[^a-z]/g, '')}@peluqueriaalia.com`;
            
            let deleteBtnHtml = '';
            if (!prof.isMe) {
                deleteBtnHtml = `
                    <button class="btn-action btn-delete btn-delete-prof" data-prof-name="${prof.name}" title="Eliminar Profesional">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                `;
            }
            
            tr.innerHTML = `
                <td>
                    <div class="eq-prof-cell">
                        ${avatarHtml}
                        <div class="eq-prof-info">
                            <span class="eq-prof-name">${profNameDisplay}</span>
                            <span class="eq-prof-email">${emailDisplay}</span>
                        </div>
                    </div>
                </td>
                <td><span class="eq-spec">${prof.role || 'Estilista'}</span></td>
                <td style="text-align: center;"><span class="pill-status ${statusClass}">${statusDisplay}</span></td>
                <td style="display: flex; justify-content: center; align-items: center; padding-right: 0; gap: 8px;">
                    <button class="btn-action btn-config-prof" data-prof-name="${prof.name}" title="Gestionar Horario/Disponibilidad" style="background-color: #f1f5f9; color: #64748b;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.25V14"/><circle cx="16" cy="16" r="6"/></svg>
                    </button>
                    ${deleteBtnHtml}
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Add listeners for config buttons
        document.querySelectorAll('.btn-config-prof').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const profName = e.currentTarget.dataset.profName;
                if (window.openConfigModal) {
                    window.openConfigModal(profName);
                }
            });
        });
        
        // Add listeners for delete buttons
        document.querySelectorAll('.btn-delete-prof').forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.profToDeleteName = e.currentTarget.dataset.profName;
                const modal = document.getElementById('modal-confirm-delete-prof');
                if (modal) modal.classList.add('active');
            });
        });
        
        // Modal Confirm Delete Prof logic
        const btnConfirmDeleteProf = document.getElementById('btn-confirm-delete-prof');
        const btnCancelDeleteProf = document.getElementById('btn-cancel-delete-prof');
        const modalConfirmDeleteProf = document.getElementById('modal-confirm-delete-prof');

        if (btnConfirmDeleteProf) {
            btnConfirmDeleteProf.addEventListener('click', () => {
                if (window.profToDeleteName) {
                    const profName = window.profToDeleteName;
                    const btn = btnConfirmDeleteProf;
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML = '<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg>';
                    
                    setTimeout(() => {
                        window.MockAPI.state.team = window.MockAPI.state.team.filter(p => p.name !== profName);
                        window.BusinessTeam = window.BusinessTeam.filter(p => p.name !== profName);
                        renderTeamTable();
                        
                        modalConfirmDeleteProf.classList.remove('active');
                        if (window.showToast) window.showToast('Profesional Eliminado', `El profesional ${profName} ha sido eliminado correctamente.`, 'error');
                        
                        btn.innerHTML = originalHtml;
                        window.profToDeleteName = null;
                    }, 400); // Simulate network delay
                }
            });
        }
        
        if (btnCancelDeleteProf) {
            btnCancelDeleteProf.addEventListener('click', () => {
                window.profToDeleteName = null;
                if (modalConfirmDeleteProf) modalConfirmDeleteProf.classList.remove('active');
            });
        }

        // Actualizar tarjetas de estadísticas
        const elTotal = document.getElementById('total-staff-val');
        if (elTotal) elTotal.textContent = totalStaff;
        const elActivos = document.getElementById('activos-hoy-val');
        if (elActivos) elActivos.textContent = activosHoy;
        
        // Actualizar tarjetas de estadísticas avanzadas (Horas y Top Performer)
        if (window.MockAPI && window.MockAPI.state && window.MockAPI.state.appointments) {
            const appointments = window.MockAPI.state.appointments;
            const now = new Date();
            
            // Lógica para semana actual
            const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            // Lógica para mes actual
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            
            let horasSemanaMins = 0;
            const profMonthHours = {};
            
            appointments.forEach(appt => {
                if (appt.status === 'cancelled') return;
                
                // MockAPI guarda rawDate en YYYY-MM-DD
                const apptDate = new Date(appt.rawDate + "T00:00:00");
                const duration = appt.duration || 60; // 60 mins por defecto si no hay
                
                // Semana actual
                if (apptDate >= startOfWeek && apptDate <= endOfWeek) {
                    horasSemanaMins += duration;
                }
                
                // Mes actual
                if (apptDate >= startOfMonth && apptDate <= endOfMonth) {
                    const prof = appt.prof || 'Desconocido';
                    profMonthHours[prof] = (profMonthHours[prof] || 0) + duration;
                }
            });
            
            const horasSemana = Math.round(horasSemanaMins / 60);
            
            let topPerformer = '-';
            let maxMins = 0;
            for (const prof in profMonthHours) {
                if (profMonthHours[prof] > maxMins) {
                    maxMins = profMonthHours[prof];
                    topPerformer = prof;
                }
            }
            
            if (topPerformer !== '-') {
                topPerformer = topPerformer.split(' ').slice(0, 2).join(' '); // Coger solo el nombre o título+nombre
            }
            
            const elHoras = document.getElementById('equipo-horas-semana');
            if (elHoras) elHoras.textContent = `${horasSemana} hrs`;
            
            const elTop = document.getElementById('equipo-top-performer');
            if (elTop) elTop.textContent = topPerformer;
        }
    }

    // Call render once mockAPI is ready
    setTimeout(renderTeamTable, 500); // delay to ensure mock-api is loaded

    // --- Lógica del Modal de Configuración de Equipo ---
    const modalConfigEquipo = document.getElementById('modal-config-equipo');
    const btnCloseConfig = document.getElementById('btn-close-config-equipo');
    const btnCancelConfig = document.getElementById('btn-cancel-config-equipo');
    const btnSaveConfig = document.getElementById('btn-save-config-equipo');
    const configSubtitle = document.getElementById('config-equipo-subtitle');
    const checkboxesDias = document.querySelectorAll('#config-dias-libres input[type="checkbox"]');
    const inputAlmuerzoStart = document.getElementById('config-almuerzo-start');
    const inputAlmuerzoEnd = document.getElementById('config-almuerzo-end');
    
    // Auto-update end time based on start time (1 hour later)
    if (inputAlmuerzoStart && inputAlmuerzoEnd) {
        const optionsDiv = inputAlmuerzoStart.querySelector('.custom-select-options');
        if (optionsDiv) {
            optionsDiv.addEventListener('click', (e) => {
                if (e.target.classList.contains('custom-option')) {
                    const startStr = e.target.textContent;
                    const [h, m] = startStr.split(':').map(Number);
                    const endH = (h + 1).toString().padStart(2, '0');
                    const endM = m.toString().padStart(2, '0');
                    inputAlmuerzoEnd.querySelector('.selected-value').textContent = `${endH}:${endM}`;
                }
            }, true); // true para capture phase, ya que app.js usa stopPropagation
        }
    }
    
    let currentConfigProf = null;

    window.openConfigModal = function(profName) {
        if (!modalConfigEquipo) return;
        currentConfigProf = profName;
        configSubtitle.textContent = `Configurando a ${profName}`;
        
        // Cargar datos actuales
        let profData = null;
        let closedDays = [];
        if (window.MockAPI) {
            const team = window.MockAPI.state.team;
            profData = team.find(t => t.name === profName);
            if (window.MockAPI.state.businessInfo && window.MockAPI.state.businessInfo.closedDays) {
                closedDays = window.MockAPI.state.businessInfo.closedDays;
            }
            
            // Fallback for current user
            const currentUserName = window.MockAPI.state.currentUser?.name || 'Propietario';
            if (profName === currentUserName || profName.includes('(Tú)')) {
                profData = window.MockAPI.state.currentUser;
            }
        }
        
        // Reset checkboxes
        checkboxesDias.forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
            
            // Pre-seleccionar y bloquear los días de cierre del negocio
            if (closedDays.includes(parseInt(cb.value))) {
                cb.checked = true;
                cb.disabled = true;
            }
        });
        
        const setLunchUI = (startStr) => {
            inputAlmuerzoStart.querySelector('.selected-value').textContent = startStr;
            const options = inputAlmuerzoStart.querySelectorAll('.custom-option');
            options.forEach(opt => {
                opt.classList.remove('active');
                if (opt.textContent === startStr) opt.classList.add('active');
            });
            const [h, m] = startStr.split(':').map(Number);
            const endH = (h + 1).toString().padStart(2, '0');
            const endM = m.toString().padStart(2, '0');
            inputAlmuerzoEnd.querySelector('.selected-value').textContent = `${endH}:${endM}`;
        };

        if (profData) {
            if (profData.diasLibres) {
                profData.diasLibres.forEach(day => {
                    const cb = Array.from(checkboxesDias).find(c => c.value == day);
                    if (cb) cb.checked = true;
                });
            } else if (profData.dayOff !== undefined) {
                const cb = Array.from(checkboxesDias).find(c => c.value == profData.dayOff);
                if (cb) cb.checked = true;
            }
            
            if (profData.pausaAlmuerzo && profData.pausaAlmuerzo.start) {
                setLunchUI(profData.pausaAlmuerzo.start);
            } else if (profData.lunchBreak) {
                setLunchUI(profData.lunchBreak);
            } else {
                setLunchUI('14:00');
            }
        } else {
            setLunchUI('14:00');
        }
        
        modalConfigEquipo.classList.add('active');
    };

    function closeConfigModal() {
        if (modalConfigEquipo) {
            modalConfigEquipo.classList.remove('active');
        }
    }

    if (btnCloseConfig) btnCloseConfig.addEventListener('click', closeConfigModal);
    if (btnCancelConfig) btnCancelConfig.addEventListener('click', closeConfigModal);
    
    // Hacer que los días libres funcionen como radio buttons (solo uno seleccionable, salvo los bloqueados por cierre)
    checkboxesDias.forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.checked) {
                checkboxesDias.forEach(otherCb => {
                    if (otherCb !== e.target && !otherCb.disabled) {
                        otherCb.checked = false;
                    }
                });
            }
        });
    });

    if (btnSaveConfig) {
        btnSaveConfig.addEventListener('click', () => {
            if (!currentConfigProf || !window.MockAPI) return;
            
            const selectedDays = Array.from(checkboxesDias)
                                      .filter(cb => cb.checked)
                                      .map(cb => parseInt(cb.value));
                                      
            const lunchStart = inputAlmuerzoStart.querySelector('.selected-value').textContent;
            const lunchEnd = inputAlmuerzoEnd.querySelector('.selected-value').textContent;
            
            const teamIndex = window.MockAPI.state.team.findIndex(t => t.name === currentConfigProf);
            if (teamIndex >= 0) {
                window.MockAPI.state.team[teamIndex].diasLibres = selectedDays;
                window.MockAPI.state.team[teamIndex].pausaAlmuerzo = { start: lunchStart, end: lunchEnd };
            }
            
            const currentUserName = window.MockAPI.state.currentUser?.name || 'Propietario';
            if (currentConfigProf === currentUserName || currentConfigProf.includes('(Tú)')) {
                if (window.MockAPI.updateCurrentUser) {
                    window.MockAPI.updateCurrentUser({
                        diasLibres: selectedDays,
                        pausaAlmuerzo: { start: lunchStart, end: lunchEnd }
                    });
                } else {
                    window.MockAPI.state.currentUser.diasLibres = selectedDays;
                    window.MockAPI.state.currentUser.pausaAlmuerzo = { start: lunchStart, end: lunchEnd };
                }
            }
            
            // Also update global BusinessTeam so it reflects immediately
            if (window.BusinessTeam) {
                const bTeamIndex = window.BusinessTeam.findIndex(t => t.name === currentConfigProf || (t.isMe && currentConfigProf.includes('(Tú)')));
                if (bTeamIndex >= 0) {
                    window.BusinessTeam[bTeamIndex].diasLibres = selectedDays;
                    window.BusinessTeam[bTeamIndex].pausaAlmuerzo = { start: lunchStart, end: lunchEnd };
                }
            }
            
            // Show toast notification
            if (window.showToast) {
                window.showToast('Éxito', `Horario de ${currentConfigProf} actualizado correctamente.`, 'success');
            } else {
                alert(`Horario de ${currentConfigProf} actualizado correctamente.`);
            }
            
            closeConfigModal();
        });
    }

    // Populate Roles from settings.json and render invitations
    setTimeout(async () => {
        if (window.MockAPI) {
            // Asegurarnos de que el MockAPI está inicializado para tener las invitaciones
            if (window.MockAPI.getTeam) await window.MockAPI.getTeam();
            renderInvitations();
            
            if (window.populateDropdown) {
                try {
                    const settings = await window.MockAPI.getSettings();
                    if (settings && settings.roles && settings.roles.length > 0) {
                        const roleSelect = document.getElementById('add-prof-role');
                        if (roleSelect) {
                            window.populateDropdown(roleSelect, settings.roles, settings.roles[0]);
                        }
                    }
                } catch (e) {
                    console.error("Error loading roles:", e);
                }
            }
        }
    }, 500);

});
