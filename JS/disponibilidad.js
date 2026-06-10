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
                    if (abs.status === 'Rechazada') return false;
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
                profName: "Profesional Actual", // En un entorno real se obtendría del estado
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
            if (abs.status === 'Rechazada') return; // Ignorar rechazadas
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

        // Aplicar estilos según prioridad: Cerrado > Baja Médica > Vacaciones
        if (dayOfWeek === 0) { // Domingo = Negocio Cerrado
            div.classList.add('cerrado');
        } else if (isBaja) {
            div.classList.add('vacas');
            div.style.backgroundColor = '#fef3c7';
            div.style.color = '#d97706';
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

    // Actualizar estilo del título para que coincida con el diseño (ÚLTIMAS SOLICITUDES)
    const cardTitle = listContainer.closest('.disp-card')?.querySelector('.card-title-small');
    if (cardTitle) {
        cardTitle.textContent = 'ÚLTIMAS SOLICITUDES';
        cardTitle.style.textTransform = 'uppercase';
        cardTitle.style.color = '#006064';
        cardTitle.style.letterSpacing = '1px';
        cardTitle.style.fontWeight = '700';
        cardTitle.style.fontSize = '0.9rem';
        cardTitle.style.marginBottom = '24px';
    }

    if (!window.MockAPI || !window.MockAPI.state.absences || window.MockAPI.state.absences.length === 0) {
        listContainer.innerHTML = `
            <div style="padding: 32px 20px; text-align: center; color: #94a3b8; font-size: 0.9rem;">
                No hay solicitudes recientes
            </div>
        `;
        return;
    }

    listContainer.innerHTML = '';
    
    const parseDateLocalList = (dStr) => {
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

    const todayList = new Date();
    todayList.setHours(0,0,0,0);

    const mappedAbsences = window.MockAPI.state.absences.map(abs => {
        const d = parseDateLocalList(abs.startDate) || new Date();
        return { ...abs, parsedDate: d };
    });

    const upcoming = mappedAbsences.filter(a => a.parsedDate >= todayList);
    const past = mappedAbsences.filter(a => a.parsedDate < todayList);

    // Próximas: más pronto primero
    upcoming.sort((a, b) => a.parsedDate - b.parsedDate);
    // Pasadas: más reciente pasado primero
    past.sort((a, b) => b.parsedDate - a.parsedDate);

    const absences = [...upcoming, ...past];

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
        window.MockAPI.state.absences.forEach(abs => {
            if (abs.type === 'Vacaciones' && abs.status !== 'Rechazada') {
                const sDate = parseDate(abs.startDate);
                const eDate = parseDate(abs.endDate) || sDate;
                
                if (sDate && eDate) {
                    // Iterar día por día para no contar los fines de semana
                    let currentDate = new Date(sDate);
                    currentDate.setHours(0,0,0,0);
                    let endDate = new Date(eDate);
                    endDate.setHours(0,0,0,0);
                    
                    while (currentDate <= endDate) {
                        const dayOfWeek = currentDate.getDay();
                        // Si no es sábado (6) ni domingo (0), cuenta como día gastado
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                            totalVacationDaysTaken++;
                        }
                        // Avanzar al siguiente día
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

