document.addEventListener('DOMContentLoaded', () => {
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
    if (btnCancelProf) btnCancelProf.addEventListener('click', hideAddProfPage);
    if (btnSaveProf) {
        btnSaveProf.addEventListener('click', () => {
            // Aquí iría la lógica de guardado
            hideAddProfPage();
        });
    }

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
        const currentDayOfWeek = new Date().getDay();
        
        tbody.innerHTML = '';
        
        fullTeam.forEach(prof => {
            let isActive = true;
            if (closedDays.includes(currentDayOfWeek)) {
                isActive = false;
            } else if (prof.diasLibres && prof.diasLibres.includes(currentDayOfWeek)) {
                isActive = false;
            } else if (prof.dayOff === currentDayOfWeek) {
                isActive = false;
            }
            
            if (isActive) activosHoy++;
            prof.status = isActive ? 'Activo' : 'No activo';
            const tr = document.createElement('tr');
            
            const initial = prof.name ? prof.name.charAt(0).toUpperCase() : 'U';
            let avatarHtml = `<div class="eq-avatar avatar-j">${initial}</div>`;
            if (prof.avatarUrl && prof.avatarUrl !== '') {
                avatarHtml = `<img src="${prof.avatarUrl}" alt="${prof.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
            }
            
            const profNameDisplay = prof.isMe ? `${prof.name} (Tú)` : prof.name;
            const statusDisplay = prof.status || 'Activo';
            const statusClass = isActive ? 'pill-activo' : 'pill-inactivo';
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
                <td><span class="pill-status ${statusClass}">${statusDisplay}</span></td>
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
            
            if (profData.pausaAlmuerzo) {
                const startStr = profData.pausaAlmuerzo.start || '14:00';
                inputAlmuerzoStart.querySelector('.selected-value').textContent = startStr;
                const [h, m] = startStr.split(':').map(Number);
                const endH = (h + 1).toString().padStart(2, '0');
                const endM = m.toString().padStart(2, '0');
                inputAlmuerzoEnd.querySelector('.selected-value').textContent = `${endH}:${endM}`;
            } else if (profData.lunchBreak) {
                inputAlmuerzoStart.querySelector('.selected-value').textContent = profData.lunchBreak;
                // calculate 1 hour end
                const [lh, lm] = profData.lunchBreak.split(':').map(Number);
                const endH = (lh + 1).toString().padStart(2, '0');
                const endM = lm.toString().padStart(2, '0');
                inputAlmuerzoEnd.querySelector('.selected-value').textContent = `${endH}:${endM}`;
            } else {
                inputAlmuerzoStart.querySelector('.selected-value').textContent = '14:00';
                inputAlmuerzoEnd.querySelector('.selected-value').textContent = '15:00';
            }
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

});
