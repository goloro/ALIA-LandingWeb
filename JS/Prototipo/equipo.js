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
                document.querySelectorAll('.dashboard-page').forEach(sec => sec.classList.remove('active'));
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
                document.querySelectorAll('.dashboard-page').forEach(sec => sec.classList.remove('active'));
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
        if (window.MockAPI) {
            teamData = await window.MockAPI.getTeam();
        }
        
        const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
        const currentUserAvatar = window.MockAPI?.state?.currentUser?.avatar || '../Images/Logos/LogoPeluqueríaNegro.png';
        const currentUserEmail = window.MockAPI?.state?.currentUser?.email || 'propietario@alia.com';
        
        const fullTeam = [
            { name: currentUserName, role: 'Propietario', email: currentUserEmail, avatarUrl: currentUserAvatar, status: 'ACTIVO', isMe: true },
            ...teamData
        ];
        
        tbody.innerHTML = '';
        
        fullTeam.forEach(prof => {
            const tr = document.createElement('tr');
            
            const initial = prof.name ? prof.name.charAt(0).toUpperCase() : 'U';
            let avatarHtml = `<div class="eq-avatar avatar-j">${initial}</div>`;
            if (prof.avatarUrl && prof.avatarUrl !== '') {
                avatarHtml = `<img src="${prof.avatarUrl}" alt="${prof.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
            }
            
            const profNameDisplay = prof.isMe ? `${prof.name} (Tú)` : prof.name;
            const statusDisplay = prof.status || 'ACTIVO';
            const emailDisplay = prof.email || `${prof.name.toLowerCase().replace(/[^a-z]/g, '')}@peluqueriaalia.com`;
            
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
                <td><span class="pill-status pill-${statusDisplay.toLowerCase()}">${statusDisplay}</span></td>
                <td>
                    <button class="btn-icon btn-config-prof" data-prof-name="${prof.name}" title="Gestionar Horario/Disponibilidad" style="background: none; border: none; cursor: pointer; color: #64748b; padding: 4px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </button>
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
    
    let currentConfigProf = null;

    window.openConfigModal = function(profName) {
        if (!modalConfigEquipo) return;
        currentConfigProf = profName;
        configSubtitle.textContent = `Configurando a ${profName}`;
        
        // Cargar datos actuales
        let profData = null;
        if (window.MockAPI) {
            const team = window.MockAPI.state.team;
            profData = team.find(t => t.name === profName);
            
            // Fallback for current user
            const currentUserName = window.MockAPI.state.currentUser?.name || 'Propietario';
            if (profName === currentUserName || profName.includes('(Tú)')) {
                profData = { name: currentUserName, diasLibres: [1], pausaAlmuerzo: { start: '14:00', end: '15:00' } };
                // Actually, current user config is hardcoded in BusinessTeam right now, but let's assume it could be here.
            }
        }
        
        // Reset checkboxes
        checkboxesDias.forEach(cb => cb.checked = false);
        
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
                inputAlmuerzoStart.value = profData.pausaAlmuerzo.start || '14:00';
                inputAlmuerzoEnd.value = profData.pausaAlmuerzo.end || '15:00';
            } else if (profData.lunchBreak) {
                inputAlmuerzoStart.value = profData.lunchBreak;
                // calculate 1 hour end
                const [lh, lm] = profData.lunchBreak.split(':').map(Number);
                const endH = (lh + 1).toString().padStart(2, '0');
                const endM = lm.toString().padStart(2, '0');
                inputAlmuerzoEnd.value = `${endH}:${endM}`;
            } else {
                inputAlmuerzoStart.value = '14:00';
                inputAlmuerzoEnd.value = '15:00';
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
    if (btnSaveConfig) {
        btnSaveConfig.addEventListener('click', () => {
            if (!currentConfigProf || !window.MockAPI) return;
            
            const selectedDays = Array.from(checkboxesDias)
                                      .filter(cb => cb.checked)
                                      .map(cb => parseInt(cb.value));
                                      
            const lunchStart = inputAlmuerzoStart.value;
            const lunchEnd = inputAlmuerzoEnd.value;
            
            const teamIndex = window.MockAPI.state.team.findIndex(t => t.name === currentConfigProf);
            if (teamIndex >= 0) {
                window.MockAPI.state.team[teamIndex].diasLibres = selectedDays;
                window.MockAPI.state.team[teamIndex].pausaAlmuerzo = { start: lunchStart, end: lunchEnd };
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
                window.showToast(`Horario de ${currentConfigProf} actualizado correctamente.`, 'success');
            } else {
                alert(`Horario de ${currentConfigProf} actualizado correctamente.`);
            }
            
            closeConfigModal();
        });
    }

});
