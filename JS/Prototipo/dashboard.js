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

            // 5. Mini Stats (Completadas, Citas Hoy, Huecos Libres)
            renderMiniStats(appointments);

            // 6. Resto de la jornada
            renderRestOfDay(appointments);

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

        const userName = window.MockAPI?.state?.currentUser?.name || "Propietario";
        const isOwner = userName.toLowerCase().includes("propietario");
        const profNameToMatch = isOwner ? "Propietario" : userName;

        const now = new Date();
        const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        
        // Filtrar citas futuras del DÍA ACTUAL y del USUARIO ACTUAL
        let futureAppts = appointments.filter(a => {
            if (a.status !== 'pending' && a.status !== 'confirmed') return false;
            if (a.prof !== profNameToMatch && !isOwner) return false;
            if (isOwner && a.prof !== "Propietario") return false;

            if (a.rawDate !== todayStr) return false; // Solo el día actual
            
            const [hours, mins] = (a.time || "00:00").split(':').map(Number);
            const apptDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
            return apptDate > now;
        });

        if (futureAppts.length > 0) {
            // Sort by closest time
            futureAppts.sort((a, b) => {
                const d1 = new Date(a.rawDate + 'T' + a.time);
                const d2 = new Date(b.rawDate + 'T' + b.time);
                return d1 - d2;
            });

            const next = futureAppts[0];
            
            document.getElementById('db-next-appt-badge').textContent = next.status === 'confirmed' ? 'CONFIRMADA' : 'PENDIENTE';
            document.getElementById('db-next-appt-badge').style.backgroundColor = next.status === 'confirmed' ? '#dcfce7' : '#fef3c7';
            document.getElementById('db-next-appt-badge').style.color = next.status === 'confirmed' ? '#16a34a' : '#b45309';
            
            document.getElementById('db-next-appt-time').textContent = `Hoy • ${next.time}`;
            document.getElementById('db-next-appt-card').style.borderLeftColor = '#0891b2';
            document.getElementById('db-next-appt-name').style.color = '#0f172a';
            document.getElementById('db-next-appt-name').textContent = next.clientName || 'Cliente';
            
            const nextIconSvg = window.getServiceIconSVG ? window.getServiceIconSVG(next.icon || next.service, "currentColor", "14") : '';
            document.getElementById('db-next-appt-service').innerHTML = `
                <div style="font-weight: 600; color: #0f172a; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                    <span style="color: #64748b; display: flex; align-items: center;">${nextIconSvg}</span>
                    <span>${next.service}</span>
                </div>
                <div style="color: #64748b; font-size: 0.8rem; margin-top: 2px; margin-left: 18px;">con ${next.prof}</div>
            `;
        } else {
            // No hay citas futuras hoy
            document.getElementById('db-next-appt-badge').textContent = 'LIBRE';
            document.getElementById('db-next-appt-badge').style.backgroundColor = '#f1f5f9';
            document.getElementById('db-next-appt-badge').style.color = '#94a3b8';
            document.getElementById('db-next-appt-time').textContent = '--:--';
            document.getElementById('db-next-appt-card').style.borderLeftColor = '#e2e8f0';
            document.getElementById('db-next-appt-name').style.color = '#94a3b8';
            document.getElementById('db-next-appt-name').textContent = 'No hay más citas próximas hoy';
            document.getElementById('db-next-appt-service').innerHTML = '¡Tiempo libre o para tareas administrativas!';
        }
    }

    function renderMiniStats(appointments) {
        if (!appointments) return;
        
        const userName = window.MockAPI?.state?.currentUser?.name || "Propietario";
        const isOwner = userName.toLowerCase().includes("propietario");
        const profNameToMatch = isOwner ? "Propietario" : userName;

        const now = new Date();
        const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        
        // Filtrar citas del DÍA ACTUAL y del USUARIO ACTUAL
        const todaysAppts = appointments.filter(a => {
            if (a.status !== 'pending' && a.status !== 'confirmed' && a.status !== 'completed') return false;
            if (a.prof !== profNameToMatch && !isOwner) return false;
            if (isOwner && a.prof !== "Propietario") return false;
            return a.rawDate === todayStr;
        });

        const citasHoy = todaysAppts.length;
        const completadas = todaysAppts.filter(a => a.status === 'completed').length;
        
        // Calcular huecos libres. Asumimos jornada de 8 horas (480 mins).
        let occupiedMins = 0;
        todaysAppts.forEach(a => {
            occupiedMins += a.duration || 45;
        });
        const freeMins = Math.max(0, 480 - occupiedMins);
        const huecos = Math.floor(freeMins / 60); // Huecos libres de 1 hora aprox.
        
        const elCompletadas = document.getElementById('db-mini-completadas-value');
        const elCitasHoy = document.getElementById('db-mini-citas-hoy-value');
        const elHuecos = document.getElementById('db-mini-huecos-value');
        
        if (elCompletadas) elCompletadas.innerHTML = `${completadas} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        if (elCitasHoy) elCitasHoy.textContent = citasHoy;
        if (elHuecos) elHuecos.innerHTML = `${huecos} <span style="font-size:1rem; color:#d97706; margin-left: 4px;">🕒</span>`;
    }

    function renderRestOfDay(appointments) {
        const container = document.getElementById('db-timeline-container');
        if (!container) return;

        if (!appointments || appointments.length === 0) {
            renderEmptyTimeline(container);
            return;
        }

        const userName = window.MockAPI?.state?.currentUser?.name || "Propietario";
        const isOwner = userName.toLowerCase().includes("propietario");
        const profNameToMatch = isOwner ? "Propietario" : userName;

        const now = new Date();
        const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        
        let futureAppts = appointments.filter(a => {
            if (a.status !== 'pending' && a.status !== 'confirmed') return false;
            if (a.prof !== profNameToMatch && !isOwner) return false;
            if (isOwner && a.prof !== "Propietario") return false;
            if (a.rawDate !== todayStr) return false;
            
            const [hours, mins] = (a.time || "00:00").split(':').map(Number);
            const apptDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
            return apptDate > now;
        });

        // Ordenamos por hora
        futureAppts.sort((a, b) => {
            const d1 = new Date(a.rawDate + 'T' + a.time);
            const d2 = new Date(b.rawDate + 'T' + b.time);
            return d1 - d2;
        });

        // Mostrar todas las citas futuras en el timeline para contexto (incluida la prxima)
        const restAppts = futureAppts;

        // Lógica de inyección dinámica de huecos
        let html = '';
        
        // Obtener configuración
        const settings = window.BusinessSettings || {};
        const teamObj = window.BusinessTeam?.find(t => t.name === profNameToMatch) || {};
        const lunchStart = teamObj.pausaAlmuerzo?.start || "14:00";
        const lunchEnd = teamObj.pausaAlmuerzo?.end || "15:00";
        const dayEnd = settings.openHours?.end || "19:00";
        
        // Helper para minutos
        const toMins = (t) => { const [h,m] = t.split(':').map(Number); return h*60+m; };
        const formatMins = (m) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
        
        // Empezamos desde "ahora" redondeado a los próximos 30 mins
        let currentMins = now.getHours() * 60 + now.getMinutes();
        // Redondear a la siguiente media hora para empezar limpio, o dejar así si queremos ser exactos
        // Pero para el prototipo asume que empezamos en hora en punto (ej 12:00)
        currentMins = Math.ceil(currentMins / 30) * 30;
        
        const endMins = toMins(dayEnd);
        const lunchStartMins = toMins(lunchStart);
        const lunchEndMins = toMins(lunchEnd);
        
        let nextApptIdx = 0;
        
        // Generador
        while (currentMins < endMins) {
            // Check si toca almuerzo
            if (currentMins >= lunchStartMins && currentMins < lunchEndMins) {
                html += `
                    <div class="timeline-item">
                        <div class="timeline-marker">
                            <div class="marker-circle" style="border-color: #cbd5e1; background-color: #f1f5f9; display: flex; align-items: center; justify-content: center;">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                            </div>
                        </div>
                        <div class="timeline-content" style="align-items: stretch; background-color: #f8fafc; border: 1px solid #e2e8f0; box-shadow: none;">
                            <div class="time-label" style="display: flex; align-items: center; margin-top: 0; color: #64748b;">${lunchStart}</div>
                            <div class="slot-details">
                                <div class="slot-title" style="color: #64748b;">Pausa del almuerzo</div>
                            </div>
                        </div>
                    </div>
                `;
                currentMins = lunchEndMins;
                continue;
            }
            
            let nextAppt = restAppts[nextApptIdx];
            if (nextAppt) {
                let apptStartMins = toMins(nextAppt.time);
                if (currentMins < apptStartMins) {
                    // Hay un hueco
                    let gapEnd = Math.min(apptStartMins, endMins);
                    if (currentMins < lunchStartMins && gapEnd > lunchStartMins) gapEnd = lunchStartMins;
                    
                    if (gapEnd > currentMins) {
                        html += `
                            <div class="timeline-item dashed">
                                <div class="timeline-marker">
                                    <div class="marker-circle plus" style="color: #64748b; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center;">+</div>
                                </div>
                                <div class="timeline-content" style="align-items: stretch;">
                                    <div class="time-label" style="display: flex; align-items: center; margin-top: 0;">${formatMins(currentMins)}</div>
                                    <div class="slot-details">
                                        <div class="slot-title">Hueco Disponible</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    currentMins = gapEnd;
                    continue;
                } else if (currentMins === apptStartMins) {
                    // Toca cita
                    const dotColor = '#00677D';
                    const iconSvg = window.getServiceIconSVG ? window.getServiceIconSVG(nextAppt.icon || nextAppt.service, dotColor, "10") : '';
                    html += `
                        <div class="timeline-item">
                            <div class="timeline-marker">
                                <div class="marker-circle" style="border-color: ${dotColor}; display: flex; align-items: center; justify-content: center;">
                                    ${iconSvg}
                                </div>
                            </div>
                            <div class="timeline-content" style="align-items: stretch;">
                                <div class="time-label" style="display: flex; align-items: center; margin-top: 0;">${nextAppt.time}</div>
                                <div class="slot-details">
                                    <div class="slot-title">${nextAppt.clientName}</div>
                                    <div class="slot-subtitle">${nextAppt.service}</div>
                                </div>
                                <div class="slot-actions" style="align-self: center;">
                                    <button class="action-btn chat-btn" data-client="${nextAppt.clientName}" style="background-color: #e6f4ea; color: #166534;" onclick="document.querySelector('.nav-item[data-target=\\'page-chat\\']').click()">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    currentMins += (nextAppt.duration || 30);
                    nextApptIdx++;
                    continue;
                } else {
                    nextApptIdx++;
                    continue;
                }
            } else {
                // Hueco hasta el final del dia
                let gapEnd = endMins;
                if (currentMins < lunchStartMins) gapEnd = lunchStartMins;
                
                if (gapEnd > currentMins) {
                    html += `
                        <div class="timeline-item dashed">
                            <div class="timeline-marker">
                                <div class="marker-circle plus" style="color: #64748b; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center;">+</div>
                            </div>
                            <div class="timeline-content" style="align-items: stretch;">
                                <div class="time-label" style="display: flex; align-items: center; margin-top: 0;">${formatMins(currentMins)}</div>
                                <div class="slot-details">
                                    <div class="slot-title">Hueco Disponible</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                currentMins = gapEnd;
            }
        }
        
        if (html === '') {
            renderEmptyTimeline(container);
        } else {
            container.innerHTML = html;
        }
    }

    function renderEmptyTimeline(container) {
        container.innerHTML = `
            <div style="padding: 24px 16px; color: #64748b; font-size: 0.95rem; text-align: center; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                No hay más citas por hoy.
            </div>
        `;
    }

    // Inicializar al cargar (un pequeño retraso para asegurar MockAPI)
    setTimeout(() => {
        if (window.MockAPI) {
            window.renderDashboard();
        }
    }, 300);

});
