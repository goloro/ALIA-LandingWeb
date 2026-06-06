document.addEventListener('DOMContentLoaded', () => {
    
    // Globals
    let currentDate = new Date();
    let selectedProfFilter = 'Todos';
    let selectedViewToggle = 'Día';
    let teamData = [];

    const profFiltersContainer = document.querySelector('.agenda-prof-filters');
    const viewTogglesContainer = document.querySelector('.agenda-view-toggles');
    const dateTitle = document.querySelector('.agenda-date-title');
    const agendaGrid = document.querySelector('.agenda-grid');
    const agendaMonthGrid = document.querySelector('.agenda-month-grid');
    const colsWrapper = document.querySelector('.agenda-prof-cols-wrapper');
    const headersWrapper = document.querySelector('.agenda-prof-headers-wrapper');
    const weekHeadersWrapper = document.querySelector('.agenda-week-headers-wrapper');
    const headerRow = document.querySelector('.agenda-grid-header-row');
    const monthGridBody = document.querySelector('.month-grid-body');

    // Utils
    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
    const getMonthName = d => capitalize(d.toLocaleDateString('es-ES', { month: 'long' }));
    const getDayName = d => capitalize(d.toLocaleDateString('es-ES', { weekday: 'long' }));

    function getStartOfWeek(date) {
        const d = new Date(date);
        let day = d.getDay();
        if (day === 0) day = 7;
        d.setDate(d.getDate() - day + 1);
        d.setHours(0,0,0,0);
        return d;
    }

    function formatDateForTitle(date, view) {
        if (view === 'Día') {
            return `${getDayName(date)} ${date.getDate()} ${getMonthName(date)} ${date.getFullYear()}`;
        } else if (view === 'Semana') {
            const start = getStartOfWeek(date);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            if (start.getMonth() === end.getMonth()) {
                return `${getMonthName(start)} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
            } else {
                return `${getMonthName(start)} ${start.getDate()} - ${getMonthName(end)} ${end.getDate()}, ${end.getFullYear()}`;
            }
        } else if (view === 'Mes') {
            return `${getMonthName(date)} ${date.getFullYear()}`;
        }
    }

    function formatYMD(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    async function loadAgendaData() {
        if (!window.MockAPI) return;
        try {
            teamData = await window.MockAPI.getTeam();
            buildFilters();
            attachViewTogglesEvents();
            
            // Set current active from DOM or defaults
            const activeFilter = document.querySelector('.prof-filter-btn.active');
            if (activeFilter) selectedProfFilter = activeFilter.textContent.trim();
            
            const activeToggle = document.querySelector('.view-toggle-btn.active');
            if (activeToggle) selectedViewToggle = activeToggle.textContent.trim();
            
            updateViewTogglesState();
            await renderGrid();
        } catch (e) {
            console.error("Error loading agenda data:", e);
        }
    }

    function buildFilters() {
        if (!profFiltersContainer) return;
        profFiltersContainer.innerHTML = '';
        profFiltersContainer.style.display = 'flex';
        
        const btnTodos = document.createElement('button');
        btnTodos.className = 'prof-filter-btn' + (selectedProfFilter === 'Todos' ? ' active' : '');
        btnTodos.textContent = 'Todos';
        profFiltersContainer.appendChild(btnTodos);
        
        const btnMiAgenda = document.createElement('button');
        btnMiAgenda.className = 'prof-filter-btn' + (selectedProfFilter === 'Propietario' ? ' active' : '');
        btnMiAgenda.textContent = 'Propietario';
        btnMiAgenda.dataset.fullName = 'Propietario';
        profFiltersContainer.appendChild(btnMiAgenda);
        
        teamData.forEach(prof => {
            const shortName = prof.name.split(' ')[1] || prof.name;
            const btn = document.createElement('button');
            btn.className = 'prof-filter-btn' + (selectedProfFilter === shortName ? ' active' : '');
            btn.textContent = shortName;
            btn.dataset.fullName = prof.name;
            profFiltersContainer.appendChild(btn);
        });

        const btns = profFiltersContainer.querySelectorAll('.prof-filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', async () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedProfFilter = btn.textContent.trim();
                
                updateViewTogglesState();
                await renderGrid();
            });
        });
    }

    function updateViewTogglesState() {
        if (!viewTogglesContainer) return;
        const viewBtns = viewTogglesContainer.querySelectorAll('.view-toggle-btn');
        
        if (selectedProfFilter === 'Todos') {
            viewBtns.forEach(btn => {
                if (btn.textContent.trim() !== 'Día') {
                    btn.classList.add('disabled');
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                }
            });
            
            if (selectedViewToggle !== 'Día') {
                viewBtns.forEach(b => b.classList.remove('active'));
                const dayBtn = Array.from(viewBtns).find(b => b.textContent.trim() === 'Día');
                if (dayBtn) dayBtn.classList.add('active');
                selectedViewToggle = 'Día';
            }
        } else {
            viewBtns.forEach(btn => {
                btn.classList.remove('disabled');
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            });
        }
    }

    function attachViewTogglesEvents() {
        if (!viewTogglesContainer) return;
        const btns = viewTogglesContainer.querySelectorAll('.view-toggle-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', async () => {
                if (btn.disabled || btn.classList.contains('disabled')) return;
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedViewToggle = btn.textContent.trim();
                await renderGrid();
            });
        });

        // Navigation arrows
        const arrows = document.querySelectorAll('.agenda-arrows button');
        if (arrows.length >= 2) {
            arrows[0].addEventListener('click', async () => { navigateDate(-1); });
            arrows[1].addEventListener('click', async () => { navigateDate(1); });
        }
    }

    async function navigateDate(dir) {
        if (selectedViewToggle === 'Día') {
            currentDate.setDate(currentDate.getDate() + dir);
        } else if (selectedViewToggle === 'Semana') {
            currentDate.setDate(currentDate.getDate() + (dir * 7));
        } else if (selectedViewToggle === 'Mes') {
            currentDate.setMonth(currentDate.getMonth() + dir);
        }
        await renderGrid();
    }

    async function renderGrid() {
        if (dateTitle) {
            dateTitle.textContent = formatDateForTitle(currentDate, selectedViewToggle);
        }

        if (selectedViewToggle === 'Mes') {
            if (agendaGrid) agendaGrid.style.display = 'none';
            if (agendaMonthGrid) {
                agendaMonthGrid.style.display = 'flex';
                await renderMonthGrid();
            }
            return;
        }

        // Day or Week View
        if (agendaGrid) agendaGrid.style.display = 'flex';
        if (agendaMonthGrid) agendaMonthGrid.style.display = 'none';

        // Clear existing bg-grid to recreate
        const oldBgGrid = colsWrapper.querySelector('.agenda-bg-grid');
        if (oldBgGrid) oldBgGrid.remove();
        colsWrapper.innerHTML = ''; // clear all cols

        agendaGrid.classList.remove('single-prof-view', 'week-view');
        
        let targetFilters = {};
        let numCols = 1;
        let colIds = [];

        if (selectedViewToggle === 'Semana') {
            // WEEK VIEW
            agendaGrid.classList.add('week-view');
            headersWrapper.style.display = 'none';
            weekHeadersWrapper.style.display = 'contents';
            numCols = 7;
            
            const start = getStartOfWeek(currentDate);
            targetFilters.startDate = formatYMD(start);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            targetFilters.endDate = formatYMD(end);
            
            if (selectedProfFilter !== 'Todos') {
                const btn = Array.from(profFiltersContainer.children).find(b => b.textContent.trim() === selectedProfFilter);
                if (btn && btn.dataset.fullName) targetFilters.prof = btn.dataset.fullName;
            }

            // Setup Week Headers
            weekHeadersWrapper.innerHTML = '';
            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const isToday = formatYMD(d) === formatYMD(new Date());
                colIds.push({ id: formatYMD(d), date: formatYMD(d) });
                
                weekHeadersWrapper.innerHTML += `
                    <div class="agenda-week-header ${isToday ? 'active' : ''}">
                        <span class="day-name">${getDayName(d).toUpperCase()}</span>
                        <span class="day-num">${d.getDate()}</span>
                    </div>
                `;
            }

        } else {
            // DAY VIEW
            const dateStr = formatYMD(currentDate);
            targetFilters.date = dateStr;

            if (selectedProfFilter === 'Todos') {
                // All professionals
                headersWrapper.style.display = 'contents';
                weekHeadersWrapper.style.display = 'none';
                headersWrapper.innerHTML = '';
                
                const displayTeam = [{ name: "Propietario", avatarUrl: "../Images/Logos/LogoPeluqueríaNegro.png" }, ...teamData];
                numCols = displayTeam.length;
                
                displayTeam.forEach(prof => {
                    colIds.push({ id: prof.name, prof: prof.name });
                    headersWrapper.innerHTML += `
                        <div class="agenda-prof-header">
                            <img src="${prof.avatarUrl || '../Images/Logos/LogoPeluqueríaNegro.png'}" alt="${prof.name}" class="prof-avatar">
                            <span class="prof-name">${prof.name}</span>
                        </div>
                    `;
                });
            } else {
                // Single professional
                agendaGrid.classList.add('single-prof-view');
                headersWrapper.style.display = 'none';
                weekHeadersWrapper.style.display = 'none';
                
                const btn = Array.from(profFiltersContainer.children).find(b => b.textContent.trim() === selectedProfFilter);
                if (btn && btn.dataset.fullName) targetFilters.prof = btn.dataset.fullName;
                
                numCols = 1;
                colIds.push({ id: 'single', prof: targetFilters.prof });
            }
        }

        // Setup CSS Grid
        const gridColumnsTemplate = `repeat(${numCols}, 1fr)`;
        if (headerRow && !agendaGrid.classList.contains('single-prof-view')) {
            headerRow.style.gridTemplateColumns = `80px ${gridColumnsTemplate}`;
        }
        colsWrapper.style.gridTemplateColumns = gridColumnsTemplate;

        // Create bg grid
        const bgGrid = document.createElement('div');
        bgGrid.className = 'agenda-bg-grid';
        bgGrid.style.gridTemplateColumns = gridColumnsTemplate;
        for (let i = 0; i < numCols; i++) {
            bgGrid.innerHTML += `<div class="bg-col"></div>`;
        }
        colsWrapper.appendChild(bgGrid);

        // Create Columns
        const domCols = [];
        colIds.forEach(c => {
            const col = document.createElement('div');
            col.className = 'agenda-prof-col';
            col.dataset.id = c.id;
            if (c.prof) col.dataset.prof = c.prof;
            if (c.date) col.dataset.date = c.date;
            colsWrapper.appendChild(col);
            domCols.push(col);
        });

        // Fetch & Render Appointments
        if (!window.MockAPI) return;
        const appts = await window.MockAPI.getAppointments(targetFilters);

        appts.forEach(appt => {
            let targetCol = null;
            if (selectedViewToggle === 'Semana') {
                targetCol = domCols.find(c => c.dataset.date === appt.rawDate);
            } else if (selectedProfFilter === 'Todos') {
                targetCol = domCols.find(c => c.dataset.prof === appt.prof);
            } else {
                targetCol = domCols[0];
            }

            if (targetCol) {
                const [h, m] = (appt.time || '10:00').split(':').map(Number);
                const startMins = (h * 60 + m) - (10 * 60); 
                // Add 2px to topPx so the 4px gap is centered (2px top, 2px bottom)
                const topPx = (startMins * (48 / 30)) + 2; 
                const duration = appt.duration || 60;
                // Subtract 4px from height to create a nice visual gap between consecutive appointments
                const heightPx = (duration * (48 / 30)) - 4;
                
                const eventEl = document.createElement('div');
                eventEl.className = 'agenda-event event-blue';
                eventEl.style.top = `${topPx}px`;
                eventEl.style.height = `${heightPx}px`;
                eventEl.dataset.appt = JSON.stringify(appt);
                
                // Truncate text if block is too small
                const serviceLabel = duration <= 30 ? '' : `<div style="font-size:11px; opacity:0.9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${appt.service}</div>`;
                const profLabel = selectedViewToggle === 'Semana' && selectedProfFilter === 'Todos' ? `<span style="font-size:10px; opacity:0.8;"> - ${appt.prof.split(' ')[1] || appt.prof}</span>` : '';

                eventEl.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:2px; height:100%; width:100%; overflow:hidden;">
                        <div style="font-weight:600; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${appt.time} - ${appt.clientName} ${profLabel}
                        </div>
                        ${serviceLabel}
                    </div>
                `;

                targetCol.appendChild(eventEl);
            }
        });

        attachAppointmentEvents();
    }

    async function renderMonthGrid() {
        if (!monthGridBody || !window.MockAPI) return;
        monthGridBody.innerHTML = '';
        
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        let firstDayOfWeek = firstDayOfMonth.getDay();
        if (firstDayOfWeek === 0) firstDayOfWeek = 7;
        
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(firstDayOfMonth.getDate() - firstDayOfWeek + 1);
        
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const totalDaysSpan = firstDayOfWeek - 1 + lastDayOfMonth.getDate();
        const cellsToGenerate = totalDaysSpan > 35 ? 42 : 35;
        
        const targetFilters = {
            startDate: formatYMD(startDate),
            endDate: formatYMD(new Date(startDate.getTime() + (cellsToGenerate * 24*60*60*1000)))
        };
        
        if (selectedProfFilter !== 'Todos') {
            const btn = Array.from(profFiltersContainer.children).find(b => b.textContent.trim() === selectedProfFilter);
            if (btn && btn.dataset.fullName) targetFilters.prof = btn.dataset.fullName;
        }

        const appts = await window.MockAPI.getAppointments(targetFilters);
        // group by date
        const apptsByDate = {};
        appts.forEach(a => {
            if(!apptsByDate[a.rawDate]) apptsByDate[a.rawDate] = 0;
            apptsByDate[a.rawDate]++;
        });

        for (let i = 0; i < cellsToGenerate; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            const dateStr = formatYMD(cellDate);
            
            const cellDiv = document.createElement('div');
            cellDiv.className = 'month-cell';
            
            if (cellDate.getMonth() !== currentDate.getMonth()) {
                cellDiv.classList.add('other-month');
            }
            if (dateStr === formatYMD(new Date())) {
                cellDiv.classList.add('today-cell');
            }
            
            const count = apptsByDate[dateStr] || 0;
            const indicators = count > 0 ? `<div style="margin-top: 8px; font-size:12px; color:#0f766e; font-weight:600;">${count} cita(s)</div>` : '';

            const numStr = String(cellDate.getDate()).padStart(2, '0');
            cellDiv.innerHTML = `<span class="month-day-num">${numStr}</span>${indicators}`;
            monthGridBody.appendChild(cellDiv);
        }
    }

    // --- Panel Lateral ---
    const appointmentPanel = document.getElementById('appointment-details-panel');
    const appointmentBackdrop = document.getElementById('appointment-details-backdrop');
    const btnCloseAppointmentPanel = document.getElementById('btn-close-appointment-panel');
    
    function openAppointmentPanel() {
        if (appointmentPanel && appointmentBackdrop) {
            appointmentPanel.classList.add('active');
            appointmentBackdrop.classList.add('active');
        }
    }

    function closeAppointmentPanel() {
        if (appointmentPanel && appointmentBackdrop) {
            appointmentPanel.classList.remove('active');
            appointmentBackdrop.classList.remove('active');
        }
    }

    if (btnCloseAppointmentPanel) btnCloseAppointmentPanel.addEventListener('click', closeAppointmentPanel);
    if (appointmentBackdrop) appointmentBackdrop.addEventListener('click', closeAppointmentPanel);

    // Expose to window so other scripts (like app.js) can refresh the grid
    window.refreshAgenda = renderGrid;

    async function populateAppointmentPanel(apptStr) {
        try {
            const appt = JSON.parse(apptStr);
            const panelTime = document.querySelector('.panel-time');
            const panelDate = document.querySelector('.panel-date');
            const clientAvatar = document.querySelector('.client-avatar');
            const clientName = document.querySelector('.client-name');
            const clientPhone = document.querySelector('.client-phone');
            const panelTitle = document.querySelector('.panel-title');
            const notesText = document.querySelector('.notes-text');
            const historyTimeline = document.querySelector('.history-timeline');

            if (panelTitle) panelTitle.textContent = appt.service || 'Detalles de la cita';

            if (panelTime) {
                const [h, m] = (appt.time || '10:00').split(':').map(Number);
                const start = new Date(); start.setHours(h, m);
                const end = new Date(start.getTime() + (appt.duration || 60) * 60000);
                const endH = String(end.getHours()).padStart(2, '0');
                const endM = String(end.getMinutes()).padStart(2, '0');
                panelTime.textContent = `${appt.time} - ${endH}:${endM}`;
            }

            if (panelDate) {
                const parts = appt.rawDate.split('-');
                const d = new Date(parts[0], parts[1] - 1, parts[2]);
                panelDate.textContent = `${d.getDate()} ${getMonthName(d)} ${d.getFullYear()}`;
            }

            if (clientName) clientName.textContent = appt.clientName || 'Cliente';
            if (clientAvatar && appt.clientName) clientAvatar.textContent = appt.clientName.charAt(0).toUpperCase();

            // Lógica asíncrona para obtener info del cliente
            if (window.MockAPI) {
                const client = await window.MockAPI.getClientById(appt.clientId);
                if (client) {
                    if (clientPhone) clientPhone.textContent = client.phone || "Sin teléfono";
                    if (notesText) notesText.textContent = client.notes || "No hay notas registradas para este cliente.";
                    
                    // Bind Edit Notes link
                    const editNotesBtn = document.querySelector('.section-header-flex .edit-link');
                    if (editNotesBtn) {
                        editNotesBtn.onclick = () => {
                            if (typeof window.openEditClientModal === 'function') {
                                window.openEditClientModal(client, true);
                            }
                        };
                    }
                    
                    if (historyTimeline) {
                        historyTimeline.innerHTML = '';
                        if (!client.history || client.history.length === 0) {
                            historyTimeline.innerHTML = '<p style="font-size:12px; color:#64748b; margin-left:24px;">No hay historial previo.</p>';
                        } else {
                            client.history.forEach((hist, index) => {
                                const isCompleted = hist.status === 'completed';
                                const isPending = hist.status === 'pending';
                                
                                const statusColor = isCompleted ? 'marker-green' : (isPending ? 'marker-blue' : 'marker-red');
                                const badgeClass = isCompleted ? 'badge-completed' : (isPending ? 'badge-pending' : 'badge-noshow');
                                const statusText = isCompleted ? 'Completado' : (isPending ? 'Pendiente' : 'No Show');
                                
                                let markerContent = `<div class="marker-inner-dot"></div>`;
                                if (isCompleted) {
                                    markerContent = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                                } else if (!isPending) {
                                    markerContent = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                                }
                                    
                                const markerLine = index < client.history.length - 1 ? `<div class="marker-line"></div>` : '';

                                historyTimeline.innerHTML += `
                                    <div class="history-item">
                                        <div class="history-marker ${statusColor}">
                                            <div class="marker-dot">
                                                ${markerContent}
                                            </div>
                                            ${markerLine}
                                        </div>
                                        <div class="history-content">
                                            <div class="history-header">
                                                <span class="history-date">${hist.date}</span>
                                                <span class="history-badge ${badgeClass}">${statusText}</span>
                                            </div>
                                            <div class="history-service">${hist.service}</div>
                                            <div class="history-prof">
                                                <span>Atendido por <strong>${hist.prof}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            });
                        }
                    }
                }
                
                // Action buttons
                const btnNoShow = document.querySelector('.btn-footer-outline');
                const btnComplete = document.querySelector('.btn-footer-solid');
                const panelFooter = document.querySelector('.panel-footer');

                const apptDateStr = `${appt.rawDate}T${appt.time}:00`;
                const apptTime = new Date(apptDateStr);
                const durationMs = (appt.duration || 30) * 60000;
                const apptEndTime = new Date(apptTime.getTime() + durationMs);
                const now = new Date();

                const isPending = appt.status === 'pending';
                const isTimePassed = now >= apptEndTime;

                if (panelFooter) {
                    if (!isPending) {
                        panelFooter.style.display = 'none';
                    } else {
                        panelFooter.style.display = 'flex';
                    }
                }

                if (btnNoShow) {
                    btnNoShow.style.display = 'block';
                    if (!isTimePassed) {
                        btnNoShow.style.opacity = '0.5';
                        btnNoShow.style.cursor = 'not-allowed';
                        btnNoShow.title = 'Aún no ha finalizado la cita';
                    } else {
                        btnNoShow.style.opacity = '1';
                        btnNoShow.style.cursor = 'pointer';
                        btnNoShow.title = '';
                    }
                    
                    btnNoShow.onclick = async () => {
                        if (!isTimePassed) return;
                        if (window.MockAPI && appt.id) {
                            btnNoShow.innerText = 'Cargando...';
                            try {
                                await window.MockAPI.updateAppointmentStatus(appt.id, 'noshow');
                                if (window.showToast) window.showToast('Actualizado', 'La cita se ha marcado como No-Show', 'error');
                                closeAppointmentPanel();
                                renderGrid();
                            } catch(e) {
                                console.error(e);
                            } finally {
                                btnNoShow.innerText = 'MARCAR NO-SHOW';
                            }
                        }
                    };
                }

                if (btnComplete) {
                    btnComplete.style.display = 'block';
                    if (!isTimePassed) {
                        btnComplete.style.opacity = '0.5';
                        btnComplete.style.cursor = 'not-allowed';
                        btnComplete.title = 'Aún no ha finalizado la cita';
                    } else {
                        btnComplete.style.opacity = '1';
                        btnComplete.style.cursor = 'pointer';
                        btnComplete.title = '';
                    }

                    btnComplete.onclick = async () => {
                        if (!isTimePassed) return;
                        if (window.MockAPI && appt.id) {
                            btnComplete.innerText = 'Cargando...';
                            try {
                                await window.MockAPI.updateAppointmentStatus(appt.id, 'completed');
                                if (window.showToast) window.showToast('Completado', 'La cita se ha marcado como finalizada', 'success');
                                closeAppointmentPanel();
                                renderGrid();
                            } catch(e) {
                                console.error(e);
                            } finally {
                                btnComplete.innerText = 'FINALIZAR CITA';
                            }
                        }
                    };
                }
            }
        } catch (e) {
            console.error("Error parsing appointment data", e);
        }
    }

    function attachAppointmentEvents() {
        const events = document.querySelectorAll('.agenda-event:not(.event-lunch)');
        events.forEach(event => {
            const clickHandler = (e) => {
                e.stopPropagation();
                if (event.dataset.appt) {
                    populateAppointmentPanel(event.dataset.appt);
                }
                openAppointmentPanel();
            };
            
            // Usar clonación para evitar listeners duplicados en caso de re-render
            const newEvent = event.cloneNode(true);
            event.parentNode.replaceChild(newEvent, event);
            
            newEvent.addEventListener('click', clickHandler);
        });
    }

    // Inicializar
    loadAgendaData();

});
