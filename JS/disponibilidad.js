let currentDateObj = new Date();
let displayMonth = currentDateObj.getMonth();
let displayYear = currentDateObj.getFullYear();

document.addEventListener('DOMContentLoaded', async () => {
    initCalendar();
    setupCalendarNavigation();
    setupDatePickers();
    setupForm();
    
    // Cargar inicial: Esperar a que app.js inicialice MockAPI
    const checkAPI = async () => {
        if (window.MockAPI) {
            await window.MockAPI.init();
            renderAbsencesList();
            if (typeof renderProfessionalAbsences === 'function') renderProfessionalAbsences();
            renderCalendar(); // Refrescar calendario con los datos cargados
            updateVacationDaysRemaining(); // Actualizar contador de vacaciones
        } else {
            setTimeout(checkAPI, 50);
        }
    };
    checkAPI();
});

function setupForm() {
    const btnGuardar = document.querySelector('.btn-guardar-disp');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', async () => {
            const tipoAusenciaSpan = document.querySelector('#tipo-ausencia').parentElement.querySelector('.selected-value');
            const desdeInput = document.getElementById('desde-input');
            const hastaInput = document.getElementById('hasta-input');
            const comentarios = document.querySelector('.disp-textarea');

            // --- VALIDACIÓN DE SOLAPAMIENTO ---
            const parseDateLocal = (dStr) => {
                if (!dStr) return null;
                if (dStr.includes('/')) {
                    const p = dStr.split('/');
                    if (p.length === 3) return new Date(p[2], parseInt(p[1])-1, p[0]);
                }
                const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                const p = dStr.split(' ');
                if (p.length >= 2) {
                    const d = parseInt(p[0]);
                    const mStr = p[1].toLowerCase();
                    let m = months.findIndex(x => mStr.startsWith(x));
                    const y = p.length >= 3 ? parseInt(p[2]) : new Date().getFullYear();
                    if (m !== -1 && !isNaN(d)) return new Date(y, m, d);
                }
                return null;
            };

            const newStart = parseDateLocal(desdeInput ? desdeInput.value : '');
            const newEnd = parseDateLocal(hastaInput ? hastaInput.value : '');

            if (newStart && newEnd && window.MockAPI && window.MockAPI.state && window.MockAPI.state.absences) {
                const hasOverlap = window.MockAPI.state.absences.some(abs => {
                    const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
                    if (abs.status === 'Rechazada' || abs.profName !== currentUserName) return false;
                    const eStart = parseDateLocal(abs.startDate);
                    const eEnd = parseDateLocal(abs.endDate) || eStart;
                    if (!eStart || !eEnd) return false;
                    // Si las fechas se cruzan en cualquier punto
                    return (newStart <= eEnd && newEnd >= eStart);
                });

                if (hasOverlap) {
                    if (window.showToast) window.showToast('Fechas no válidas', 'Ya existe una ausencia registrada que coincide con estos días.', 'error');
                    return; // Abortar guardado
                }
            }
            // ----------------------------------

            // Simular botón cargando
            const originalText = btnGuardar.innerHTML;
            btnGuardar.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite; margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg> Guardando...';
            btnGuardar.disabled = true;

            const nuevaAusencia = {
                profName: window.MockAPI?.state?.currentUser?.name || 'Propietario', // Obtenido del estado
                type: tipoAusenciaSpan ? tipoAusenciaSpan.textContent.trim() : 'Vacaciones',
                startDate: desdeInput ? desdeInput.value : '',
                endDate: hastaInput ? hastaInput.value : '',
                comments: comentarios ? comentarios.value : '',
                status: 'Aprobado'
            };

            // Guardar en la DB simulada (MockAPI)
            if (window.MockAPI) {
                await window.MockAPI.addAbsence(nuevaAusencia);
            }

            // Mostrar toast de éxito
            if (window.showToast) {
                window.showToast('¡Guardado!', 'La ausencia se ha registrado correctamente.', 'success');
            }

            // Actualizar la lista en tiempo real
            renderAbsencesList();
            if (typeof renderProfessionalAbsences === 'function') renderProfessionalAbsences();

            // Restaurar botón
            btnGuardar.innerHTML = originalText;
            btnGuardar.disabled = false;

            // Limpiar textarea opcional
            if (comentarios) comentarios.value = '';
            
            // Recargar el calendario para mostrar los nuevos días marcados
            renderCalendar();
            
            // Actualizar el contador de días de vacaciones
            updateVacationDaysRemaining();
        });
    }
}

function setupDatePickers() {
    const desdeInput = document.getElementById('desde-input');
    const hastaInput = document.getElementById('hasta-input');

    if (desdeInput && hastaInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowD = tomorrow.getDate().toString().padStart(2, '0');
        const tomorrowM = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
        const tomorrowY = tomorrow.getFullYear();
        desdeInput.value = `${tomorrowD}/${tomorrowM}/${tomorrowY}`;

        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        const dayAfterD = dayAfter.getDate().toString().padStart(2, '0');
        const dayAfterM = (dayAfter.getMonth() + 1).toString().padStart(2, '0');
        const dayAfterY = dayAfter.getFullYear();
        hastaInput.value = `${dayAfterD}/${dayAfterM}/${dayAfterY}`;

        const parseDateLocal = (dStr) => {
            if (!dStr) return null;
            if (dStr.includes('/')) {
                const p = dStr.split('/');
                if (p.length === 3) return new Date(p[2], parseInt(p[1])-1, p[0]);
            }
            return null;
        };

        const ensureValidDates = (changed) => {
            const startD = parseDateLocal(desdeInput.value);
            const endD = parseDateLocal(hastaInput.value);
            
            if (startD && endD) {
                if (endD < startD) {
                    if (changed === 'desde') {
                        const nextDay = new Date(startD);
                        nextDay.setDate(nextDay.getDate() + 1);
                        const d = nextDay.getDate().toString().padStart(2, '0');
                        const m = (nextDay.getMonth() + 1).toString().padStart(2, '0');
                        const y = nextDay.getFullYear();
                        hastaInput.value = `${d}/${m}/${y}`;
                    } else if (changed === 'hasta') {
                        const prevDay = new Date(endD);
                        prevDay.setDate(prevDay.getDate() - 1);
                        const d = prevDay.getDate().toString().padStart(2, '0');
                        const m = (prevDay.getMonth() + 1).toString().padStart(2, '0');
                        const y = prevDay.getFullYear();
                        desdeInput.value = `${d}/${m}/${y}`;
                    }
                }
            }
        };

        desdeInput.addEventListener('change', () => ensureValidDates('desde'));
        desdeInput.addEventListener('blur', () => ensureValidDates('desde'));
        hastaInput.addEventListener('change', () => ensureValidDates('hasta'));
        hastaInput.addEventListener('blur', () => ensureValidDates('hasta'));
    }

    const inputs = document.querySelectorAll('.date-picker-input');
    inputs.forEach(input => {
        if (window.attachMiniCalendar) {
            window.attachMiniCalendar(input);
        }
    });
}

function setupCalendarNavigation() {
    const navBtns = document.querySelectorAll('.cal-nav-btn');
    if (navBtns.length >= 2) {
        navBtns[0].addEventListener('click', () => changeMonth(-1)); // Prev
        navBtns[1].addEventListener('click', () => changeMonth(1));  // Next
    }
}

function changeMonth(direction) {
    displayMonth += direction;
    if (displayMonth < 0) {
        displayMonth = 11;
        displayYear--;
    } else if (displayMonth > 11) {
        displayMonth = 0;
        displayYear++;
    }
    renderCalendar();

    // Sincronizar fechas del formulario con el nuevo mes
    const desdeInput = document.getElementById('desde-input');
    const hastaInput = document.getElementById('hasta-input');
    
    if (desdeInput && hastaInput) {
        const today = new Date();
        const isCurrentMonth = displayMonth === today.getMonth() && displayYear === today.getFullYear();
        
        if (isCurrentMonth) {
            // Si volvemos al mes actual, poner mañana y pasado mañana
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const d1 = tomorrow.getDate().toString().padStart(2, '0');
            const m1 = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
            const y1 = tomorrow.getFullYear();
            
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            const d2 = dayAfterTomorrow.getDate().toString().padStart(2, '0');
            const m2 = (dayAfterTomorrow.getMonth() + 1).toString().padStart(2, '0');
            const y2 = dayAfterTomorrow.getFullYear();
            
            desdeInput.value = `${d1}/${m1}/${y1}`;
            hastaInput.value = `${d2}/${m2}/${y2}`;
        } else {
            // Si es un mes distinto, poner el día 01 y 02
            const mStr = (displayMonth + 1).toString().padStart(2, '0');
            const yStr = displayYear;
            
            desdeInput.value = `01/${mStr}/${yStr}`;
            hastaInput.value = `02/${mStr}/${yStr}`;
        }
    }
}

function initCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const calendarGrid = document.querySelector('.cal-grid');
    const subtitleSpan = document.querySelector('.card-subtitle');
    
    if (!calendarGrid || !subtitleSpan) return;

    // Actualizar título del mes
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    subtitleSpan.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        ${monthNames[displayMonth]}, ${displayYear}
    `;

    // Limpiar grid dejando solo los headers
    const headersHTML = `
        <div class="cal-header">LUN</div>
        <div class="cal-header">MAR</div>
        <div class="cal-header">MIÉ</div>
        <div class="cal-header">JUE</div>
        <div class="cal-header">VIE</div>
        <div class="cal-header">SÁB</div>
        <div class="cal-header">DOM</div>
    `;
    calendarGrid.innerHTML = headersHTML;

    // Calcular días
    const firstDay = new Date(displayYear, displayMonth, 1);
    const lastDay = new Date(displayYear, displayMonth + 1, 0);
    const prevMonthLastDay = new Date(displayYear, displayMonth, 0).getDate();
    
    let startingDayOfWeek = firstDay.getDay() - 1; // 0 for Mon, 6 for Sun
    if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Si es domingo

    const totalDays = lastDay.getDate();

    // Días del mes anterior (disabled)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const div = document.createElement('div');
        div.className = 'cal-day disabled';
        div.textContent = prevMonthLastDay - i;
        calendarGrid.appendChild(div);
    }

    // Comprobar si estamos renderizando el mes actual
    const today = new Date();
    const isCurrentMonth = today.getMonth() === displayMonth && today.getFullYear() === displayYear;

    // Pre-calcular fechas de ausencias
    let absenceRanges = [];
    if (window.MockAPI && window.MockAPI.state && window.MockAPI.state.absences) {
        const parseDate = (dStr) => {
            if (!dStr) return null;
            if (dStr.includes('/')) {
                const p = dStr.split('/');
                if (p.length === 3) return new Date(p[2], parseInt(p[1])-1, p[0]);
            }
            const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            const p = dStr.split(' ');
            if (p.length >= 2) {
                const d = parseInt(p[0]);
                const mStr = p[1].toLowerCase();
                let m = months.findIndex(x => mStr.startsWith(x));
                const y = p.length >= 3 ? parseInt(p[2]) : new Date().getFullYear();
                if (m !== -1 && !isNaN(d)) return new Date(y, m, d);
            }
            return null;
        };

        window.MockAPI.state.absences.forEach(abs => {
            const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
            if (abs.status === 'Rechazada' || abs.profName !== currentUserName) return; // Solo propietario y no rechazadas
            const sDate = parseDate(abs.startDate);
            const eDate = parseDate(abs.endDate) || sDate;
            if (sDate && eDate) {
                absenceRanges.push({ start: sDate.getTime(), end: eDate.getTime(), type: abs.type });
            }
        });
    }

    // Días del mes actual
    for (let i = 1; i <= totalDays; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day';
        
        let contentHTML = `${i}`;
        
        const currentDayDate = new Date(displayYear, displayMonth, i);
        const dayOfWeek = currentDayDate.getDay(); // 0 is Sunday
        
        // Analizar qué ausencias caen en este día
        const curTime = currentDayDate.getTime();
        let isBaja = false;
        let isVacas = false;

        for (let r of absenceRanges) {
            if (curTime >= r.start && curTime <= r.end) {
                if (r.type.toLowerCase().includes('baja')) isBaja = true;
                else isVacas = true;
            }
        }

        // Obtener el día de libranza del profesional actual (por defecto 1 = Lunes para Propietario)
        let dayOff = -1;
        if (window.BusinessTeam && window.BusinessTeam.length > 0) {
            // Asumimos el primer elemento del equipo como el usuario actual para la demo
            dayOff = window.BusinessTeam[0].dayOff;
        } else {
            dayOff = 1; // Fallback al Lunes
        }
        
        const isLibranza = dayOfWeek === dayOff;

        // Aplicar estilos según prioridad: Cerrado > Libranza > Baja Médica > Vacaciones
        if (dayOfWeek === 0) { // Domingo = Negocio Cerrado
            div.classList.add('cerrado');
        } else if (isLibranza) { // Día de libranza
            div.classList.add('libranza');
        } else if (isBaja) {
            div.classList.add('baja');
        } else if (isVacas) {
            div.classList.add('vacas');
        }

        // Marcar el día de hoy solo si es el mes actual
        if (isCurrentMonth && i === today.getDate()) {
            div.classList.add('hoy');
            contentHTML += `<span class="hoy-dot"></span>`;
        }

        div.innerHTML = contentHTML;
        calendarGrid.appendChild(div);
    }

    // Rellenar días del próximo mes (disabled)
    let nextMonthDay = 1;
    // Rellenamos hasta completar filas de 7
    while ((calendarGrid.children.length - 7) % 7 !== 0 || calendarGrid.children.length - 7 < 35) {
        const div = document.createElement('div');
        div.className = 'cal-day disabled';
        div.textContent = nextMonthDay++;
        calendarGrid.appendChild(div);
        
        // Evitar que pase de 6 filas (42 días)
        if (calendarGrid.children.length - 7 >= 42) break;
    }
}

function renderAbsencesList() {
    const listContainer = document.querySelector('.solicitud-list');
    if (!listContainer) return;

    // Se eliminó el override de estilo para Últimas Solicitudes para que mantenga el estilo base
    if (!window.MockAPI || !window.MockAPI.state.absences || window.MockAPI.state.absences.length === 0) {
        listContainer.innerHTML = `
            <div style="padding: 32px 20px; text-align: center; color: #94a3b8; font-size: 0.9rem;">
                No hay solicitudes recientes
            </div>
        `;
        return;
    }

    listContainer.innerHTML = '';
    
    // Mostrar las más recientes (últimas añadidas) primero, solo del currentUser
    const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
    const absences = window.MockAPI.state.absences.filter(a => a.profName === currentUserName).slice().reverse();

    const formatNiceDate = (dateStr) => {
        if (!dateStr) return '';
        // Si ya tiene letras (como "15 Ago 2026"), lo dejamos
        if (/[a-zA-Z]/.test(dateStr)) return dateStr;
        
        // Si es formato DD/MM/YYYY
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthIndex = parseInt(parts[1], 10) - 1;
            const monthStr = months[monthIndex] || parts[1];
            return `${parts[0]} ${monthStr} ${parts[2]}`;
        }
        return dateStr;
    };

    absences.forEach(abs => {
        const item = document.createElement('div');
        item.style.cssText = "display: flex; align-items: center; gap: 16px; margin-bottom: 24px;";
        
        let iconHtml = '';
        let iconBgColor = '';
        let iconColor = '';
        let isMedical = abs.type.toLowerCase().includes('baja');

        if (isMedical) {
            iconBgColor = '#fef3c7'; // Fondo naranja claro
            iconColor = '#d97706'; // Icono naranja oscuro
            iconHtml = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>`;
        } else {
            iconBgColor = '#e6f3f0'; // Fondo teal claro
            iconColor = '#006064'; // Icono teal oscuro
            iconHtml = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        }

        let titleText = abs.comments ? abs.comments : abs.type;
        let niceStart = formatNiceDate(abs.startDate);
        let niceEnd = formatNiceDate(abs.endDate);
        
        item.innerHTML = `
            <div style="width: 48px; height: 48px; border-radius: 14px; background-color: ${iconBgColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${iconHtml}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <span style="font-size: 1rem; font-weight: 700; color: #1e293b;">${titleText}</span>
                <span style="font-size: 0.85rem; color: #64748b;">${abs.status || 'Pendiente'} &bull; ${niceStart} - ${niceEnd}</span>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

function renderProfessionalAbsences() {
    const tableBody = document.querySelector('.disp-table tbody');
    if (!tableBody) return;

    if (!window.MockAPI || !window.MockAPI.state.absences) return;

    // Filtrar las que no son del currentUser y están en estado Pendiente
    const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
    const profAbsences = window.MockAPI.state.absences.filter(a => a.profName !== currentUserName && a.status === 'Pendiente');
    
    if (profAbsences.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 48px 0; color: #64748b;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span style="font-size: 1rem; font-weight: 500;">No hay solicitudes de ausencia</span>
                    </div>
                </td>
            </tr>
        `;
        const footer = document.querySelector('.disp-table-footer');
        if (footer) footer.innerHTML = `Mostrando <strong>0</strong> solicitudes`;
        return;
    }

    tableBody.innerHTML = '';

    const formatNiceDate = (dateStr) => {
        if (!dateStr) return '';
        if (/[a-zA-Z]/.test(dateStr)) return dateStr;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthIndex = parseInt(parts[1], 10) - 1;
            const monthStr = months[monthIndex] || parts[1];
            return `${parts[0]} ${monthStr} ${parts[2]}`;
        }
        return dateStr;
    };

    profAbsences.forEach(abs => {
        const isMedical = abs.type.toLowerCase().includes('baja');
        let iconHtml = isMedical 
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006064" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

        let statusPill = '';
        if (abs.status === 'Aprobado') {
            statusPill = `<span style="display:inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; background-color: #dcfce7; color: #166534;">Aprobado</span>`;
        } else if (abs.status === 'Pendiente') {
            statusPill = `<span style="display:inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; background-color: #fef9c3; color: #854d0e;">Pendiente</span>`;
        } else {
            statusPill = `<span style="display:inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; background-color: #fee2e2; color: #991b1b;">${abs.status || 'Rechazada'}</span>`;
        }

        let avatarContent = `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #475569;">
            ${abs.profName.charAt(0)}
        </div>`;

        let profImage = null;
        if (window.BusinessTeam) {
            const prof = window.BusinessTeam.find(p => p.name === abs.profName);
            if (prof && prof.avatarUrl) profImage = prof.avatarUrl;
        }
        if (!profImage && window.MockAPI && window.MockAPI.state && window.MockAPI.state.team) {
            const prof = window.MockAPI.state.team.find(p => p.name === abs.profName);
            if (prof && prof.avatarUrl) profImage = prof.avatarUrl;
        }

        if (profImage) {
            avatarContent = `<img src="${profImage}" alt="${abs.profName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${avatarContent}
                    <span style="font-weight: 500; color: #1e293b;">${abs.profName}</span>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${iconHtml}
                    <span>${abs.type}</span>
                </div>
            </td>
            <td style="color: #64748b;">
                ${formatNiceDate(abs.startDate)} - ${formatNiceDate(abs.endDate)}
            </td>
            <td>
                ${statusPill}
            </td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-icon-disp action-btn-approve" data-id="${abs.id}" data-name="${abs.profName}" data-type="${abs.type}" title="Aprobar" style="background: none; border: none; cursor: pointer; color: #10b981; padding: 4px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
                    <button class="btn-icon-disp action-btn-reject" data-id="${abs.id}" data-name="${abs.profName}" data-type="${abs.type}" title="Rechazar" style="background: none; border: none; cursor: pointer; color: #ef4444; padding: 4px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    const footer = document.querySelector('.disp-table-footer');
    if (footer) footer.innerHTML = `Mostrando <strong>${profAbsences.length}</strong> solicitudes`;

    // Añadir event listeners a los botones de aprobar y rechazar
    document.querySelectorAll('.action-btn-approve').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const name = btn.getAttribute('data-name');
            const type = btn.getAttribute('data-type');
            showConfirmModal(id, 'Aprobado', name, type);
        });
    });

    document.querySelectorAll('.action-btn-reject').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const name = btn.getAttribute('data-name');
            const type = btn.getAttribute('data-type');
            showConfirmModal(id, 'Rechazada', name, type);
        });
    });
}

function showConfirmModal(absId, newStatus, profName, absType) {
    const existingModal = document.getElementById('confirm-action-modal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirm-action-modal';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const actionText = newStatus === 'Aprobado' ? 'aprobar' : 'rechazar';
    const titleText = newStatus === 'Aprobado' ? '¿Aprobar solicitud?' : '¿Rechazar solicitud?';
    const btnText = newStatus === 'Aprobado' ? 'Sí, Aprobar' : 'Sí, Rechazar';
    
    // Iconos limpios (sin fondo circular)
    const iconHtml = newStatus === 'Aprobado' 
        ? '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' 
        : '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#ffffff';
    modal.style.borderRadius = '20px';
    modal.style.padding = '40px 32px';
    modal.style.width = '90%';
    modal.style.maxWidth = '380px';
    modal.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
    modal.style.textAlign = 'center';

    modal.innerHTML = `
        ${iconHtml}
        <h3 style="margin: 0 0 12px 0; font-size: 1.25rem; color: #0f172a; font-weight: 700;">${titleText}</h3>
        <p style="margin: 0 0 32px 0; color: #64748b; font-size: 0.85rem; line-height: 1.5; padding: 0 10px;">
            Estás a punto de ${actionText} la solicitud de ${absType} de ${profName}. ¿Deseas continuar?
        </p>
        <div style="display: flex; gap: 24px; justify-content: center; align-items: center;">
            <button id="btn-cancel-action" style="background: transparent; border: none; color: #0097a7; font-weight: 700; font-size: 0.9rem; cursor: pointer; padding: 10px;">Cancelar</button>
            <button id="btn-confirm-action" style="padding: 12px 32px; border-radius: 9999px; border: none; background: linear-gradient(135deg, #159EBA 0%, #0097a7 100%); color: #ffffff; font-weight: 700; font-size: 0.9rem; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 151, 167, 0.2), 0 2px 4px -1px rgba(0, 151, 167, 0.1); transition: transform 0.2s;">${btnText}</button>
        </div>
    `;

    overlay.appendChild(modal);

    const portalContainer = document.querySelector('.portal-container');
    if (portalContainer) {
        if (window.getComputedStyle(portalContainer).position === 'static') {
            portalContainer.style.position = 'relative';
        }
        overlay.style.position = 'absolute';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.borderRadius = window.getComputedStyle(portalContainer).borderRadius;
        portalContainer.appendChild(overlay);
    } else {
        document.body.appendChild(overlay);
    }

    document.getElementById('btn-cancel-action').addEventListener('click', () => {
        overlay.remove();
    });

    document.getElementById('btn-confirm-action').addEventListener('click', () => {
        if (window.MockAPI && window.MockAPI.state && window.MockAPI.state.absences) {
            const absIndex = window.MockAPI.state.absences.findIndex(a => a.id === absId);
            if (absIndex !== -1) {
                window.MockAPI.state.absences[absIndex].status = newStatus;
            }
        }
        
        overlay.remove();
        
        if (typeof renderProfessionalAbsences === 'function') renderProfessionalAbsences();
        
        // Mostrar notificación toast
        if (window.showToast) {
            const title = newStatus === 'Aprobado' ? 'Solicitud Aprobada' : 'Solicitud Rechazada';
            const msg = `La solicitud de ${absType.toLowerCase()} de ${profName} ha sido ${newStatus === 'Aprobado' ? 'aprobada' : 'rechazada'}.`;
            const type = newStatus === 'Aprobado' ? 'success' : 'error';
            window.showToast(title, msg, type);
        } else {
            // Fallback nativo por si acaso
            const alertBg = newStatus === 'Aprobado' ? '#10b981' : '#ef4444';
            const nativeToast = document.createElement('div');
            nativeToast.style.position = 'fixed';
            nativeToast.style.bottom = '24px';
            nativeToast.style.right = '24px';
            nativeToast.style.backgroundColor = alertBg;
            nativeToast.style.color = '#ffffff';
            nativeToast.style.padding = '16px 24px';
            nativeToast.style.borderRadius = '8px';
            nativeToast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            nativeToast.style.fontWeight = '600';
            nativeToast.style.zIndex = '99999';
            nativeToast.style.transition = 'opacity 0.3s ease';
            nativeToast.textContent = `La solicitud de ${profName} ha sido ${newStatus === 'Aprobado' ? 'aprobada' : 'rechazada'}`;
            
            document.body.appendChild(nativeToast);
            setTimeout(() => {
                nativeToast.style.opacity = '0';
                setTimeout(() => nativeToast.remove(), 300);
            }, 3000);
        }
    });
}
function updateVacationDaysRemaining() {
    const statNumber = document.querySelector('.card-purple-stats .stat-number');
    if (!statNumber) return;

    const parseDate = (dStr) => {
        if (!dStr) return null;
        if (dStr.includes('/')) {
            const p = dStr.split('/');
            if (p.length === 3) return new Date(p[2], parseInt(p[1])-1, p[0]);
        }
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const p = dStr.split(' ');
        if (p.length >= 2) {
            const d = parseInt(p[0]);
            const mStr = p[1].toLowerCase();
            let m = months.findIndex(x => mStr.startsWith(x));
            const y = p.length >= 3 ? parseInt(p[2]) : new Date().getFullYear();
            if (m !== -1 && !isNaN(d)) return new Date(y, m, d);
        }
        return null;
    };

    let totalVacationDaysTaken = 0;
    const currentYear = new Date().getFullYear();

    if (window.MockAPI && window.MockAPI.state && window.MockAPI.state.absences) {
        let dayOff = -1;
        if (window.BusinessTeam && window.BusinessTeam.length > 0) {
            dayOff = window.BusinessTeam[0].dayOff;
        } else {
            dayOff = 1;
        }

        window.MockAPI.state.absences.forEach(abs => {
            const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
            if (abs.type === 'Vacaciones' && abs.status !== 'Rechazada' && abs.profName === currentUserName) {
                const sDate = parseDate(abs.startDate);
                const eDate = parseDate(abs.endDate) || sDate;
                
                if (sDate && eDate) {
                    let currentDate = new Date(sDate);
                    currentDate.setHours(0,0,0,0);
                    let endDate = new Date(eDate);
                    endDate.setHours(0,0,0,0);
                    
                    while (currentDate <= endDate) {
                        const dayOfWeek = currentDate.getDay();
                        
                        // Comprobar si hay baja médica en este día
                        let isBaja = false;
                        const curTime = currentDate.getTime();
                        window.MockAPI.state.absences.forEach(bajaAbs => {
                            const currentUserName = window.MockAPI?.state?.currentUser?.name || 'Propietario';
                            if (bajaAbs.type.toLowerCase().includes('baja') && bajaAbs.status !== 'Rechazada' && bajaAbs.profName === currentUserName) {
                                const bStart = parseDate(bajaAbs.startDate);
                                const bEnd = parseDate(bajaAbs.endDate) || bStart;
                                if (bStart && bEnd) {
                                    const bStartTime = bStart.getTime();
                                    const bEndTime = bEnd.getTime();
                                    if (curTime >= bStartTime && curTime <= bEndTime) {
                                        isBaja = true;
                                    }
                                }
                            }
                        });

                        // Cuenta como día verde (vacaciones) si NO es domingo, NO es libranza y NO es baja médica
                        if (dayOfWeek !== 0 && dayOfWeek !== dayOff && !isBaja) {
                            totalVacationDaysTaken++;
                        }
                        
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            }
        });
    }

    const totalAvailable = 22;
    const remaining = totalAvailable - totalVacationDaysTaken;
    
    statNumber.textContent = remaining >= 0 ? remaining : 0;
}

