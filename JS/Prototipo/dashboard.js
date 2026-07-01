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
            const now = new Date();
            const startD = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
            const endD = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
            
            const [appointments, clients, team, settings] = await Promise.all([
                window.MockAPI.getAppointments({ startDate: startD, endDate: endD }),
                window.MockAPI.getClients(),
                window.MockAPI.getTeam(),
                window.MockAPI.getSettings()
            ]);

            const currentMonthStr = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(now);
            
            // Actualizar Fecha y Saludo
            const dateStr = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
            document.getElementById('current-date-full').textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            
            // Textos de (mes) en tarjetas
            document.querySelectorAll('.current-month-text').forEach(el => {
                el.textContent = currentMonthStr.charAt(0).toUpperCase() + currentMonthStr.slice(1);
            });

            // ==========================================================
            // Helper: minutos laborables de un profesional en el mes
            // ==========================================================
            const toLocalYMD = (d) => {
                const y  = d.getFullYear();
                const mo = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${y}-${mo}-${dd}`;
            };
            const getWorkingMinutes = (year, month, closedDays, diasLibres, dailyMins) => {
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                let total = 0;
                for (let day = 1; day <= daysInMonth; day++) {
                    const dow = new Date(year, month, day).getDay();
                    if (!closedDays.includes(dow) && !diasLibres.includes(dow)) total += dailyMins;
                }
                return total;
            };

            // Horas del negocio (reutilizar settings ya cargado arriba)
            const closedDays  = settings.closedDays  || [0];
            const openStart   = settings.openHours?.start || '10:00';
            const openEnd     = settings.openHours?.end   || '20:00';
            const [oSh, oSm]  = openStart.split(':').map(Number);
            const [oEh, oEm]  = openEnd.split(':').map(Number);
            const dailyMins   = (oEh * 60 + oEm) - (oSh * 60 + oSm); // ej. 600 min (10h)

            // Construir mapa de profesionales (owner + equipo)
            const ownerName = window.MockAPI?.state?.currentUser?.name || 'Alejandro Mora';
            const ownerDL   = window.MockAPI?.state?.currentUser?.diasLibres
                              || (window.MockAPI?.state?.currentUser?.dayOff !== undefined
                                  ? [window.MockAPI.state.currentUser.dayOff] : [1]);

            const profData = {}; // { name: { occupied, capacity } }

            // Propietario
            profData[ownerName] = {
                occupied : 0,
                capacity : getWorkingMinutes(now.getFullYear(), now.getMonth(), closedDays, ownerDL, dailyMins)
            };
            // Equipo
            team.forEach(prof => {
                const dl = prof.diasLibres || (prof.dayOff !== undefined ? [prof.dayOff] : []);
                profData[prof.name] = {
                    occupied : 0,
                    capacity : getWorkingMinutes(now.getFullYear(), now.getMonth(), closedDays, dl, dailyMins)
                };
            });

            // 1. Conteo de citas reales del mes
            let currentMonthAppts = 0;
            let lastMonthAppts    = 0;
            let autoAppts         = 0;
            let ingresosTotales   = 0;

            appointments.forEach(appt => {
                const apptDate = new Date(appt.rawDate + 'T00:00:00'); // evitar bug de hora
                const apptMonth = apptDate.getMonth();
                const apptYear  = apptDate.getFullYear();

                if (apptYear === now.getFullYear() && apptMonth === now.getMonth()) {
                    currentMonthAppts++;

                    // Precio
                    let precio = 35;
                    if (window.currentServices && appt.service) {
                        const srv = window.currentServices.find(s => s.name === appt.service);
                        if (srv && srv.price) precio = parseFloat(srv.price);
                    }
                    ingresosTotales += precio;

                    // Minutos ocupados por profesional
                    const dur = appt.duration ? parseInt(appt.duration) : 45;
                    if (profData[appt.prof] !== undefined) {
                        profData[appt.prof].occupied += dur;
                    }

                    // Fuente ALIA vs Manual
                    let isAuto = (appt.source !== 'Manual');
                    if (appt.clientId && clients) {
                        const cl = clients.find(c => c.id === appt.clientId);
                        if (cl && cl.source === 'Manual') isAuto = false;
                    }
                    if (isAuto) autoAppts++;

                } else if (apptYear === now.getFullYear() && apptMonth === now.getMonth() - 1) {
                    lastMonthAppts++;
                }
            });

            // A. Ingresos Previstos
            document.getElementById('db-ingresos-value').innerHTML = `${ingresosTotales.toLocaleString('es-ES')} <span>€</span>`;
            document.getElementById('db-ingresos-bar').style.width = currentMonthAppts > 0 ? '70%' : '0px';

            // B. Tasa de Ocupación — Real: sum(ocupado) / sum(capacidad)
            const totalOccupiedMins  = Object.values(profData).reduce((s, p) => s + p.occupied,  0);
            const totalCapacityMins  = Object.values(profData).reduce((s, p) => s + p.capacity,  0);
            const ocupacion = totalCapacityMins > 0
                ? Math.min(100, Math.round((totalOccupiedMins / totalCapacityMins) * 100))
                : 0;
            document.getElementById('db-ocupacion-value').innerHTML = `${ocupacion} <span>%</span>`;

            // B.1. Comparativa mes anterior (estimación con 45 min/cita de media)
            const lastMonthMins       = lastMonthAppts * 45;
            const ocupacionAnterior   = totalCapacityMins > 0
                ? Math.min(100, Math.round((lastMonthMins / totalCapacityMins) * 100))
                : 0;
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
                    const avatarId = ((i + 1) % 10) + 1;
                    avatarsHtml += `<img src="../Images/Avatars/client_${avatarId}.svg" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; margin-left: ${i > 0 ? '-8px' : '0'}; object-fit: cover;">`;
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
            // Incorporar al usuario actual (ej. Propietario) al equipo si no está incluido
            if (window.MockAPI && window.MockAPI.state && window.MockAPI.state.currentUser) {
                const cUser = window.MockAPI.state.currentUser;
                if (!team.some(t => t.name === cUser.name)) {
                    team.unshift({
                        id: cUser.id || 'owner',
                        name: cUser.name,
                        role: cUser.role || 'Propietario',
                        avatarUrl: cUser.avatar || '../Images/Avatars/alejandro.png'
                    });
                }
            }
            // ====== OCUPACIÓN SEMANAL — Panel "Rendimiento del Equipo" ======
            // (profData arriba es mensual para la card general; aquí calculamos la semana)
            const wd       = now.getDay() === 0 ? 7 : now.getDay();
            const wkStart  = new Date(now);
            wkStart.setDate(now.getDate() - wd + 1);
            wkStart.setHours(0, 0, 0, 0);
            const wkEnd = new Date(wkStart);
            wkEnd.setDate(wkStart.getDate() + 6);
            wkEnd.setHours(23, 59, 59, 999);
            const wkStartStr = toLocalYMD(wkStart);
            const wkEndStr   = toLocalYMD(wkEnd);

            // Capacidad de un profesional en la semana actual
            const getWeeklyMins = (start, closed, dl, dMins) => {
                let t = 0;
                for (let i = 0; i < 7; i++) {
                    const d = new Date(start);
                    d.setDate(start.getDate() + i);
                    const dow = d.getDay();
                    if (!closed.includes(dow) && !dl.includes(dow)) t += dMins;
                }
                return t;
            };

            // Construir weeklyProfData con el equipo completo (propietario ya incluido)
            const weeklyProfData = {};
            team.forEach(prof => {
                const isOwner = prof.name === ownerName;
                const dl = isOwner
                    ? ownerDL
                    : (prof.diasLibres || (prof.dayOff !== undefined ? [prof.dayOff] : []));
                weeklyProfData[prof.name] = {
                    occupied : 0,
                    capacity : getWeeklyMins(wkStart, closedDays, dl, dailyMins)
                };
            });

            // Sumar minutos de citas de esta semana (matching tolerante por si acento difiere)
            appointments.forEach(appt => {
                if (!appt.rawDate || appt.rawDate < wkStartStr || appt.rawDate > wkEndStr) return;
                const dur = appt.duration ? parseInt(appt.duration) : 45;
                const exactKey = weeklyProfData[appt.prof] !== undefined ? appt.prof : null;
                const key = exactKey
                    ?? Object.keys(weeklyProfData).find(k => k.trim() === appt.prof?.trim());
                if (key != null) weeklyProfData[key].occupied += dur;
            });

            renderTeam(team, weeklyProfData);

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

        // Definir la semana actual
        const now = new Date();
        const currentDayIndex = now.getDay(); // 0 (Dom) a 6 (Sab)
        const currentDay = currentDayIndex === 0 ? 7 : currentDayIndex; // Lunes=1, Domingo=7
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay + 1);
        startOfWeek.setHours(0,0,0,0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);

        // Actualizar el rango de fechas en el título
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const startDay = startOfWeek.getDate();
        const endDay = endOfWeek.getDate();
        const startMonth = monthNames[startOfWeek.getMonth()];
        const endMonth = monthNames[endOfWeek.getMonth()];
        
        let rangeStr = "";
        if (startMonth === endMonth) {
            rangeStr = `${startDay} - ${endDay} ${startMonth}`;
        } else {
            rangeStr = `${startDay} ${startMonth.slice(0, 3)} - ${endDay} ${endMonth}`;
        }
        
        const rangeEl = document.getElementById('db-chart-date-range');
        if (rangeEl) rangeEl.textContent = rangeStr;

        // Bases completas si el día ya pasó
        const baseTotals = { 1: 6, 2: 8, 3: 5, 4: 9, 5: 14, 6: 18, 0: 4 };
        const baseAutos  = { 1: 5, 2: 7, 3: 4, 4: 8, 5: 12, 6: 16, 0: 4 };

        const countsByDay = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
        const autoCountsByDay = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };

        // Añadir la base inventada solo para los días transcurridos hasta hoy
        const daysOrder = [1, 2, 3, 4, 5, 6, 0];
        
        daysOrder.forEach(day => {
            const mappedDay = day === 0 ? 7 : day;
            if (mappedDay <= currentDay) {
                countsByDay[day] = baseTotals[day];
                autoCountsByDay[day] = baseAutos[day];
            }
        });

        // Añadir datos reales por encima
        if (appointments) {
            appointments.forEach(appt => {
                const d = new Date(appt.createdAt || appt.rawDate);
                // Solo contar citas de la semana actual
                if (d >= startOfWeek && d <= endOfWeek) {
                    countsByDay[d.getDay()]++;
                    
                    // Maximizar ALIA: Si no es explícitamente Manual, lo contamos como ALIA
                    const client = clients.find(c => c.id == appt.clientId);
                    let isManual = false;
                    
                    if (appt.source === 'Manual' || appt.source === 'Manuales') isManual = true;
                    else if (client && (client.source === 'Manual' || client.source === 'Manuales')) isManual = true;
                    
                    if (!isManual) {
                        autoCountsByDay[d.getDay()]++;
                    }
                }
            });
        }

        const maxCitas = Math.max(...Object.values(countsByDay), 5); // Base mínima 5 para escalar visualmente

        daysOrder.forEach((dayIndex, i) => {
            let total = countsByDay[dayIndex];
            let auto = autoCountsByDay[dayIndex];
            
            const mappedDay = dayIndex === 0 ? 7 : dayIndex;
            // Si el día es en el futuro (después de hoy), no mostrar nada
            if (mappedDay > currentDay) {
                total = 0;
                auto = 0;
            }

            const manual = total - auto;

            // Reducimos al 85% la altura máxima para dejar espacio a las etiquetas del eje X (bottom: 30px)
            const heightPercent = maxCitas > 0 ? (total / maxCitas) * 85 : 0; 
            const autoHeight = total > 0 ? (auto / total) * 100 : 0;
            const manualHeight = total > 0 ? (manual / total) * 100 : 0;

            const leftPos = (i * 14.28) + 7.14; // Centrado en su 1/7
            const displayStyle = total === 0 ? 'none' : 'flex';

            const barHtml = `
                <div style="position: absolute; bottom: 30px; left: calc(${leftPos}% - 6px); width: 12px; height: ${heightPercent}%; display: ${displayStyle}; flex-direction: column-reverse; border-radius: 4px; overflow: hidden; background: #f1f5f9;">
                    <div style="width: 100%; height: ${autoHeight}%; background-color: #10b981; transition: height 0.5s ease;"></div>
                    <div style="width: 100%; height: ${manualHeight}%; background-color: #cbd5e1; transition: height 0.5s ease;"></div>
                </div>
            `;
            chartArea.insertAdjacentHTML('beforeend', barHtml);
        });
    }

    // profData: { profName: { occupied, capacity } }
    function renderTeam(team, profData) {
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

        let html = '';
        team.forEach(prof => {
            const data     = profData && profData[prof.name];
            const occupied = data ? data.occupied  : 0;
            const capacity = data ? data.capacity  : 1;
            const occ      = capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;
            const occColor = occ > 85 ? '#10b981' : (occ > 65 ? '#0891b2' : '#f59e0b');
            
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
            const nextCard = document.getElementById('db-next-appt-card');
            nextCard.style.borderLeftColor = '#0891b2';
            nextCard.style.cursor = 'pointer';
            nextCard.onclick = () => {
                if (window.openAgendaAppointmentPanel) window.openAgendaAppointmentPanel(JSON.stringify(next));
            };
            
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
            const nextCard = document.getElementById('db-next-appt-card');
            nextCard.style.borderLeftColor = '#e2e8f0';
            nextCard.style.cursor = 'default';
            nextCard.onclick = null;
            
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
        
        const todayDay = now.getDay();
        const mockSettings = window.MockAPI?.state?.settings || {};
        const currentUser = window.MockAPI?.state?.currentUser || {};
        const isClosed = mockSettings.closedDays?.includes(todayDay) || false;
        const isDayOff = currentUser.diasLibres?.includes(todayDay) || false;
        
        let huecosHtml = `${huecos} <span style="font-size:1rem; color:#d97706; margin-left: 4px;">✌️</span>`;
        if (isClosed || isDayOff) {
            huecosHtml = `-`;
        }
        
        if (elCompletadas) elCompletadas.innerHTML = `${completadas} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        if (elCitasHoy) elCitasHoy.textContent = citasHoy;
        if (elHuecos) elHuecos.innerHTML = huecosHtml;
    }

    function renderRestOfDay(appointments) {
        const container = document.getElementById('db-timeline-container');
        if (!container) return;
        
        const now = new Date();
        const todayDay = now.getDay();
        const mockSettings = window.MockAPI?.state?.settings || {};
        const currentUser = window.MockAPI?.state?.currentUser || {};
        const isClosed = mockSettings.closedDays?.includes(todayDay) || false;
        const isDayOff = currentUser.diasLibres?.includes(todayDay) || false;
        
        if (isClosed) {
            container.innerHTML = `
                <div style="padding: 32px 16px; color: #64748b; font-size: 1.05rem; text-align: center; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <div style="font-size: 2rem; margin-bottom: 8px;">🏬</div>
                    <strong>La tienda está cerrada hoy.</strong><br>
                    <span style="font-size: 0.9rem; opacity: 0.8;">Nos vemos el próximo día laborable.</span>
                </div>
            `;
            return;
        }
        
        if (isDayOff) {
            container.innerHTML = `
                <div style="padding: 32px 16px; color: #004EB2; font-size: 1.05rem; text-align: center; background-color: #f0f7ff; border-radius: 12px; border: 1px dashed #bfdbfe;">
                    <div style="font-size: 2rem; margin-bottom: 8px;">🌴</div>
                    <strong>¡Hoy es tu día de descanso!</strong><br>
                    <span style="font-size: 0.9rem; opacity: 0.8;">Aprovecha para desconectar y recargar pilas.</span>
                </div>
            `;
            return;
        }

        if (!appointments || appointments.length === 0) {
            renderEmptyTimeline(container);
            return;
        }

        const userName = window.MockAPI?.state?.currentUser?.name || "Propietario";
        const isOwner = userName.toLowerCase().includes("propietario");
        const profNameToMatch = isOwner ? "Propietario" : userName;

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
        const dayStart = settings.openHours?.start || "10:00";
        const dayEnd = settings.openHours?.end || "19:00";
        
        // Helper para minutos
        const toMins = (t) => { const [h,m] = t.split(':').map(Number); return h*60+m; };
        const formatMins = (m) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
        
        // Empezamos desde "ahora" redondeado a los próximos 30 mins
        let currentMins = now.getHours() * 60 + now.getMinutes();
        currentMins = Math.ceil(currentMins / 30) * 30;
        
        const startMins = toMins(dayStart);
        if (currentMins < startMins) {
            currentMins = startMins; // No mostrar huecos antes de la hora de apertura
        }
        
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
                        <div class="timeline-content" style="align-items: center; padding: 16px 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; box-shadow: none;">
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
                            <div class="timeline-item dashed" style="cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" onclick="if(window.openNuevaCitaModal) window.openNuevaCitaModal('', '${formatMins(currentMins)}')">
                                <div class="timeline-marker">
                                    <div class="marker-circle plus" style="color: #64748b; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center;">+</div>
                                </div>
                                <div class="timeline-content" style="align-items: center; padding: 16px 24px;">
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
                    const apptDataStr = JSON.stringify(nextAppt).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                    
                    html += `
                        <div class="timeline-item" style="cursor: pointer; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'" onclick="if(window.openAgendaAppointmentPanel) window.openAgendaAppointmentPanel(this.dataset.appt)" data-appt="${apptDataStr}">
                            <div class="timeline-marker">
                                <div class="marker-circle" style="border-color: ${dotColor}; display: flex; align-items: center; justify-content: center; background-color: white;">
                                    ${iconSvg}
                                </div>
                            </div>
                            <div class="timeline-content" style="flex-direction: row; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center;">
                                    <div class="time-label" style="display: flex; align-items: center; margin-top: 0; margin-right: 16px;">${nextAppt.time}</div>
                                    <div class="slot-details" style="display: flex; flex-direction: column;">
                                        <div class="slot-title">${nextAppt.clientName}</div>
                                        <div class="slot-subtitle">${nextAppt.service}</div>
                                    </div>
                                </div>
                                ${nextAppt.source === 'Alia' ? `<div class="slot-actions" style="align-self: center;">
                                    <button class="action-btn chat-btn" data-client="${nextAppt.clientName}" style="background-color: #e6f4ea; color: #166534; z-index: 2;" onclick="event.stopPropagation(); if(window.openSpecificChat) window.openSpecificChat(${nextAppt.clientId})">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                                    </button>
                                </div>` : ''}
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
                        <div class="timeline-item dashed" style="cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" onclick="if(window.openNuevaCitaModal) window.openNuevaCitaModal('', '${formatMins(currentMins)}')">
                            <div class="timeline-marker">
                                <div class="marker-circle plus" style="color: #64748b; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center;">+</div>
                            </div>
                            <div class="timeline-content" style="align-items: center; padding: 16px 24px;">
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


