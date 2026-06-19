document.addEventListener('DOMContentLoaded', () => {
    
    // Función global para que otras partes de la app (ej. nueva cita) puedan refrescar el dashboard
    window.renderDashboard = async () => {
        try {
            // Saludo personalizado
            if (window.MockAPI && window.MockAPI.state && window.MockAPI.state.currentUser) {
                const userName = window.MockAPI.state.currentUser.name || "Usuario";
                const firstName = userName.split(" ")[0]; // Solo el nombre de pila
                const greetingEl = document.querySelector('.dashboard-greeting');
                if (greetingEl) greetingEl.innerHTML = `Hola, ${firstName} 👋`;
            }

            // Obtener datos de la MockAPI
            const [appointments, clients, team, settings] = await Promise.all([
                window.MockAPI.getAppointments(),
                window.MockAPI.getClients(),
                window.MockAPI.getTeam(),
                window.MockAPI.getSettings()
            ]);

            const now = new Date();
            const currentMonthStr = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(now);
            
            // Actualizar Fecha y Saludo
            const dateStr = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
            document.getElementById('current-date-full').textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            
            // Textos de (mes) en tarjetas
            document.querySelectorAll('.current-month-text').forEach(el => {
                el.textContent = currentMonthStr.charAt(0).toUpperCase() + currentMonthStr.slice(1);
            });

            // 1. Cálculos de Métricas Globales (Con base inventada para el prototipo)
            let currentMonthAppts = 84; // Base inventada
            let lastMonthAppts = 72; // Base inventada
            let autoAppts = 81; // Casi todas (81 de 84) son por la IA
            let ingresosTotales = 2940; // Base inventada (84 citas * 35€ ticket medio)
            let minsOcupadosMes = 84 * 45; // Base inventada (84 citas * 45 mins)

            appointments.forEach(appt => {
                const apptDate = new Date(appt.rawDate);
                if (apptDate.getMonth() === now.getMonth() && apptDate.getFullYear() === now.getFullYear()) {
                    currentMonthAppts++;
                    
                    // Sumar el precio y duración real del servicio
                    let precio = 35; // ticket medio por defecto
                    let duracion = 45; // duración por defecto
                    if (window.currentServices && appt.service) {
                        const srv = window.currentServices.find(s => s.name === appt.service);
                        if (srv) {
                            if (srv.price) precio = parseFloat(srv.price);
                            if (srv.duration) duracion = parseInt(srv.duration);
                        }
                    }
                    if (appt.duration) duracion = parseInt(appt.duration);
                    
                    ingresosTotales += precio;
                    minsOcupadosMes += duracion;
                    // Buscar fuente real del cliente (ALIA vs Manual)
                    let isAuto = true; // Por defecto asumimos ALIA
                    if (appt.clientId) {
                        const client = clients.find(c => c.id === appt.clientId);
                        if (client && client.source === 'Manual') {
                            isAuto = false;
                        }
                    }
                    if (isAuto) autoAppts++;
                } else if (apptDate.getMonth() === now.getMonth() - 1) {
                    lastMonthAppts++;
                }
            });

            // A. Ingresos Previstos (Suma real de precios + base inventada)
            document.getElementById('db-ingresos-value').innerHTML = `${ingresosTotales.toLocaleString('es-ES')} <span>€</span>`;
            document.getElementById('db-ingresos-bar').style.width = currentMonthAppts > 0 ? '70%' : '0px';

            // B. Tasa de Ocupación (Real)
            // Capacidad teórica mensual: profesionales * 20 días laborales * 8 horas * 60 mins
            const numProfs = team.length > 0 ? team.length : 1;
            const totalMinsMes = numProfs * 20 * 8 * 60;
            const ocupacion = totalMinsMes > 0 ? Math.min(100, Math.round((minsOcupadosMes / totalMinsMes) * 100)) : 0;
            document.getElementById('db-ocupacion-value').innerHTML = `${ocupacion} <span>%</span>`;
            
            // B.1. Comparativa mes anterior
            const lastMonthMins = lastMonthAppts * 45; // Usamos 45 mins como media para el mes pasado
            const ocupacionAnterior = totalMinsMes > 0 ? Math.min(100, Math.round((lastMonthMins / totalMinsMes) * 100)) : 0;
            const diffOcupacion = ocupacion - ocupacionAnterior;
            const vsEl = document.getElementById('db-ocupacion-vs');
            if (vsEl) {
                if (diffOcupacion > 0) {
                    vsEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> +${diffOcupacion}% vs mes ant.`;
                    vsEl.style.color = '#10b981';
                } else if (diffOcupacion < 0) {
                    vsEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg> ${diffOcupacion}% vs mes ant.`;
                    vsEl.style.color = '#ef4444';
                } else {
                    vsEl.innerHTML = `~ 0% vs mes ant.`;
                    vsEl.style.color = '#94a3b8';
                }
            }
            
            // C. Nuevos Clientes (Base inventada + reales)
            let nuevosClientes = 24; // Base inventada para el prototipo
            nuevosClientes += clients.filter(c => {
                const regDate = new Date(c.registeredAt);
                return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
            }).length;
            document.getElementById('db-nuevos-value').textContent = nuevosClientes;
            
            // C.1. Porcentaje de crecimiento (Píldora)
            const lastMonthNuevos = 18; // Base mes anterior
            const crecimientoNuevos = Math.round(((nuevosClientes - lastMonthNuevos) / lastMonthNuevos) * 100);
            const nuevosPill = document.getElementById('db-nuevos-pill');
            if (nuevosPill) {
                nuevosPill.textContent = crecimientoNuevos > 0 ? `+${crecimientoNuevos}%` : `${crecimientoNuevos}%`;
                if (crecimientoNuevos > 0) {
                    nuevosPill.style.backgroundColor = '#dcfce7';
                    nuevosPill.style.color = '#16a34a';
                } else if (crecimientoNuevos < 0) {
                    nuevosPill.style.backgroundColor = '#fee2e2';
                    nuevosPill.style.color = '#ef4444';
                } else {
                    nuevosPill.style.backgroundColor = '#f1f5f9';
                    nuevosPill.style.color = '#94a3b8';
                }
            }
            
            // Render mini avatars de clientes nuevos
            const dbNuevosAvatars = document.getElementById('db-nuevos-avatars');
            if (nuevosClientes > 0) {
                let avatarsHtml = '';
                for (let i = 0; i < Math.min(3, nuevosClientes); i++) {
                    avatarsHtml += `<img src="https://i.pravatar.cc/150?u=client${i}" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; margin-left: ${i > 0 ? '-8px' : '0'};">`;
                }
                avatarsHtml += `<span style="margin-left: 8px;">+${nuevosClientes} este mes</span>`;
                dbNuevosAvatars.innerHTML = avatarsHtml;
                dbNuevosAvatars.style.display = 'flex';
                dbNuevosAvatars.style.alignItems = 'center';
            }

            // D. Horas Ahorradas
            const minsAhorrados = autoAppts * 5; // 5 mins por cita
            const horasAhorradas = Math.floor(minsAhorrados / 60);
            document.getElementById('db-ahorros-value').innerHTML = `✨ ${horasAhorradas}h`;
            document.getElementById('db-ahorros-sub').innerHTML = `Gestión automática<br>de reservas`;

            // 2. Gráfico de Citas por Día
            renderChart(appointments, clients);

            // 3. Rendimiento del Equipo
            renderTeam(team, appointments);

            // 4. Próxima Cita
            renderNextAppointment(appointments);

        } catch(e) {
            console.error("Error renderizando dashboard:", e);
        }
    };

    function renderChart(appointments, clients) {
        const chartArea = document.getElementById('db-chart-area');
        if (!chartArea) return;

        // Limpiar area dejando los labels
        Array.from(chartArea.children).forEach(c => {
            if (!c.classList.contains('axis-label')) c.remove();
        });

        // Contar citas por día de la semana con una base inventada fija para el prototipo
        const countsByDay = { 1: 5, 2: 7, 3: 4, 4: 8, 5: 12, 6: 15, 0: 0 };
        const autoCountsByDay = { 1: 5, 2: 6, 3: 4, 4: 8, 5: 11, 6: 14, 0: 0 }; // Casi todo IA, poquísimas manuales

        // Definir la semana actual
        const now = new Date();
        const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Lunes=1, Domingo=7
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay + 1);
        startOfWeek.setHours(0,0,0,0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);

        appointments.forEach(appt => {
            const d = new Date(appt.createdAt || appt.rawDate);
            // Solo contar citas de la semana actual
            if (d >= startOfWeek && d <= endOfWeek) {
                countsByDay[d.getDay()]++;
                
                // Buscar fuente real del cliente
                const client = clients.find(c => c.id == appt.clientId);
                if (client && client.source === 'Alia') {
                    autoCountsByDay[d.getDay()]++;
                }
            }
        });

        const maxCitas = Math.max(...Object.values(countsByDay), 5); // Base 5
        const daysOrder = [1, 2, 3, 4, 5, 6, 0]; // Lunes a Domingo

        daysOrder.forEach((dayIndex, i) => {
            const total = countsByDay[dayIndex];
            const auto = autoCountsByDay[dayIndex];
            const manual = total - auto;

            // Reducimos al 85% la altura máxima para dejar espacio a las etiquetas del eje X (bottom: 30px)
            const heightPercent = (total / maxCitas) * 85; 
            const autoHeight = total > 0 ? (auto / total) * 100 : 0;
            const manualHeight = total > 0 ? (manual / total) * 100 : 0;

            const leftPos = (i * 14.28) + 7.14; // Centrado en su 1/7

            const barHtml = `
                <div style="position: absolute; bottom: 30px; left: calc(${leftPos}% - 6px); width: 12px; height: ${heightPercent}%; display: flex; flex-direction: column-reverse; border-radius: 4px; overflow: hidden; background: #f1f5f9;">
                    <div style="width: 100%; height: ${autoHeight}%; background-color: #10b981; transition: height 0.5s ease;"></div>
                    <div style="width: 100%; height: ${manualHeight}%; background-color: #cbd5e1; transition: height 0.5s ease;"></div>
                </div>
            `;
            chartArea.insertAdjacentHTML('beforeend', barHtml);
        });
    }

    function renderTeam(team, appointments) {
        const teamList = document.getElementById('db-team-list');
        if (!teamList || !team) return;

        if (team.length === 0) {
            teamList.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 0; color: #94a3b8; text-align: center;">
                    <span style="font-size: 0.875rem;">No hay profesionales registrados</span>
                </div>
            `;
            return;
        }

        // Definir la semana actual para filtrar citas
        const now = new Date();
        const currentDay = now.getDay() === 0 ? 7 : now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay + 1);
        startOfWeek.setHours(0,0,0,0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);

        // Minutos de ocupación por profesional
        const occByProf = {};
        team.forEach(p => occByProf[p.name] = 0);
        
        // Base inventada (51 citas semanales en el gráfico * 45 mins) repartidas entre el equipo
        const baseMinsSemanaPorProf = Math.round((51 * 45) / (team.length || 1));
        team.forEach(p => occByProf[p.name] += baseMinsSemanaPorProf);

        if (appointments) {
            appointments.forEach(appt => {
                const d = new Date(appt.createdAt || appt.rawDate);
                if (d >= startOfWeek && d <= endOfWeek) {
                    if (appt.prof && occByProf[appt.prof] !== undefined) {
                        let dur = 45;
                        if (appt.duration) {
                            dur = parseInt(appt.duration);
                        } else if (window.currentServices && appt.service) {
                            const s = window.currentServices.find(x => x.name === appt.service);
                            if (s && s.duration) dur = parseInt(s.duration);
                        }
                        occByProf[appt.prof] += dur;
                    }
                }
            });
        }

        // Max minutos a la semana: 5 días * 8 horas * 60 minutos = 2400 mins
        const maxMinsSemana = 5 * 8 * 60;

        let html = '';
        team.forEach(prof => {
            const occupied = occByProf[prof.name] || 0;
            const occ = Math.min(100, Math.round((occupied / maxMinsSemana) * 100));
            const occColor = occ > 90 ? '#10b981' : (occ > 75 ? '#0891b2' : '#f59e0b');
            
            html += `
            <div style="display: flex; align-items: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
                <img src="${prof.avatarUrl}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; margin-right: 12px;">
                <div style="flex: 1;">
                    <div style="font-size: 0.875rem; font-weight: 600; color: #0f172a;">${prof.name}</div>
                    <div style="font-size: 0.75rem; color: #64748b;">${prof.role}</div>
                </div>
                <div style="width: 60px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 600; color: #475569; margin-bottom: 4px;">
                        <span>Ocup.</span>
                        <span>${occ}%</span>
                    </div>
                    <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                        <div style="width: ${occ}%; height: 100%; background: ${occColor};"></div>
                    </div>
                </div>
            </div>
            `;
        });
        teamList.innerHTML = html;
    }

    function renderNextAppointment(appointments) {
        if (!appointments || appointments.length === 0) return;

        const now = new Date();
        
        // Filtrar citas futuras
        let futureAppts = appointments.filter(a => {
            if (a.status !== 'pending' && a.status !== 'confirmed') return false;
            // Parse rawDate and time (e.g. "2023-10-15" and "10:30")
            const [year, month, day] = a.rawDate.split('-').map(Number);
            const [hours, mins] = (a.time || "00:00").split(':').map(Number);
            const apptDate = new Date(year, month - 1, day, hours, mins);
            return apptDate > now;
        });

        // Si no hay futuras, mostramos la última (para que el prototipo no se vea vacío)
        if (futureAppts.length === 0) {
            futureAppts = [...appointments].reverse(); 
        } else {
            // Sort by closest time
            futureAppts.sort((a, b) => {
                const d1 = new Date(a.rawDate + 'T' + a.time);
                const d2 = new Date(b.rawDate + 'T' + b.time);
                return d1 - d2;
            });
        }

        if (futureAppts.length > 0) {
            const next = futureAppts[0];
            
            document.getElementById('db-next-appt-badge').textContent = next.status === 'confirmed' ? 'CONFIRMADA' : 'PENDIENTE';
            document.getElementById('db-next-appt-badge').style.backgroundColor = next.status === 'confirmed' ? '#d1fae5' : '#fef3c7';
            document.getElementById('db-next-appt-badge').style.color = next.status === 'confirmed' ? '#047857' : '#b45309';
            
            document.getElementById('db-next-appt-time').textContent = `${next.formattedDate} • ${next.time}`;
            
            const [year, month, day] = next.rawDate.split('-').map(Number);
            const apptDate = new Date(year, month - 1, day);
            const isToday = apptDate.toDateString() === now.toDateString();

            if (isToday) {
                document.getElementById('db-next-appt-card').style.borderLeftColor = '#0891b2';
            } else {
                document.getElementById('db-next-appt-card').style.borderLeftColor = '#e2e8f0';
            }

            document.getElementById('db-next-appt-name').textContent = next.clientName || 'Cliente';
            document.getElementById('db-next-appt-service').innerHTML = `
                <div style="font-weight: 600; color: #0f172a; margin-top: 4px;">${next.service}</div>
                <div style="color: #64748b; font-size: 0.8rem; margin-top: 2px;">con ${next.prof}</div>
            `;
        }
    }

    // Inicializar al cargar (un pequeño retraso para asegurar MockAPI)
    setTimeout(() => {
        if (window.MockAPI) {
            window.renderDashboard();
        }
    }, 300);

});
