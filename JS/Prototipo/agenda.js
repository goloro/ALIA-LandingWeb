document.addEventListener('DOMContentLoaded', () => {
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

});
