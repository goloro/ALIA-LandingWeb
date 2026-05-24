document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
});

function initCalendar() {
    const calendarGrid = document.querySelector('.cal-grid');
    const subtitleSpan = document.querySelector('.card-subtitle');
    
    if (!calendarGrid || !subtitleSpan) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDate = today.getDate();

    // Actualizar título del mes
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    subtitleSpan.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        ${monthNames[currentMonth]}, ${currentYear}
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
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
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

    // Días del mes actual
    for (let i = 1; i <= totalDays; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day';
        
        let contentHTML = `${i}`;
        
        const currentDayDate = new Date(currentYear, currentMonth, i);
        const dayOfWeek = currentDayDate.getDay(); // 0 is Sunday
        
        // Simular domingos como cerrados
        if (dayOfWeek === 0) {
            div.classList.add('cerrado');
        }
        
        // Mantener algunos días de vacaciones para el prototipo (siempre que existan en el mes)
        if (i === 10 || i === 11 || i === 12) {
            div.classList.add('vacas');
        }

        // Marcar el día de hoy
        if (i === currentDate) {
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
