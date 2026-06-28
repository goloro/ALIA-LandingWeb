class MockAPI {
    constructor() {
        if (MockAPI.instance) {
            return MockAPI.instance;
        }
        
        // Estado en memoria
        this.state = {
            clients: [],
            team: [],
            invitations: [],
            appointments: [],
            absences: [],
            currentUser: null,
            settings: {
                closedDays: [0], // 0 = Domingo
                openHours: { start: '10:00', end: '19:00' } // 9 hours open
            },
            chats: {}
        };
        this.initialized = false;
        
        MockAPI.instance = this;
    }

    // Inicializar datos (Simula la primera carga de una DB)
    async init() {
        if (this.initialized) return;
        
        try {
            // Cargar desde JSON estático
            try {
                const clientsRes = await fetch('../Data/clients.json');
                if (clientsRes.ok) this.state.clients = await clientsRes.json();
            } catch(e) { console.log("Error loading clients.json"); }

            try {
                const teamRes = await fetch('../Data/team.json');
                if (teamRes.ok) {
                    const teamData = await teamRes.json();
                    // Normalizar: garantizar que dayOff (número) exista aunque el JSON use diasLibres (array)
                    this.state.team = teamData.map(m => ({
                        ...m,
                        dayOff: m.dayOff !== undefined ? m.dayOff : (Array.isArray(m.diasLibres) ? m.diasLibres[0] : undefined)
                    }));
                }
            } catch(e) { console.log("Error loading team.json"); }
            
            try {
                const apptsRes = await fetch('../Data/appointments.json');
                if (apptsRes.ok) {
                    this.state.appointments = await apptsRes.json();
                    // Recalcular formattedDate en runtime para que "Hoy"/"Mañana" sean siempre correctos
                    this._normalizeAppointmentDates();
                }
            } catch(e) {
                console.log("Error loading appointments.json", e);
            }

            try {
                const cachedUser = localStorage.getItem('currentUserData');
                if (cachedUser) {
                    this.state.currentUser = JSON.parse(cachedUser);
                } else {
                    const userRes = await fetch('../Data/user.json');
                    if (userRes.ok) {
                        this.state.currentUser = await userRes.json();
                    } else {
                        this.state.currentUser = {
                            "id": 0,
                            "name": "Propietario ALIA",
                            "role": "Owner",
                            "avatar": "../Images/Logos/LogoPeluqueríaNegro.png",
                            "diasLibres": [1],
                            "pausaAlmuerzo": { "start": "14:00", "end": "15:00" }
                        };
                    }
                }
            } catch(e) {
                console.log("Error loading user.json", e);
                this.state.currentUser = {
                    "id": 0,
                    "name": "Propietario ALIA",
                    "role": "Owner",
                    "avatar": "../Images/Logos/LogoPeluqueríaNegro.png",
                    "diasLibres": [1],
                    "pausaAlmuerzo": { "start": "14:00", "end": "15:00" }
                };
            }

            try {
                const businessRes = await fetch('../Data/business.json');
                if (businessRes.ok) {
                    this.state.businessInfo = await businessRes.json();
                } else {
                    this.state.businessInfo = { closedDays: [0] };
                }
            } catch(e) {
                console.log("Error loading business.json", e);
                this.state.businessInfo = { closedDays: [0] };
            }

            try {
                const absRes = await fetch('../Data/ausencias.json');
                if (absRes.ok) {
                    this.state.absences = await absRes.json();
                }
            } catch(e) {
                console.log("Error loading ausencias.json", e);
            }

            // Cargar ajustes si existe el archivo
            try {
                const settingsRes = await fetch('../Data/settings.json');
                if (settingsRes.ok) {
                    const loadedSettings = await settingsRes.json();
                    this.state.settings = { ...this.state.settings, ...loadedSettings };
                }
            } catch(e) {
                console.log("Settings no encontradas, usando valores por defecto", e);
            }

            // Cargar invitaciones
            try {
                const invRes = await fetch('../Data/invitations.json');
                if (invRes.ok) {
                    this.state.invitations = await invRes.json();
                }
            } catch(e) {
                console.log("Error loading invitations.json", e);
            }
            
            // Seed mock appointments if empty so prototype looks good
            if (this.state.team.length === 0) {
                this.state.team = [
                    { id: 1, name: "Dra. Laura Gómez", role: "Especialista", attendance: "98%", avatarUrl: "https://i.pravatar.cc/150?u=laura", dayOff: 2, lunchBreak: "13:30" },
                    { id: 2, name: "Dr. Javier Ruiz", role: "Terapista", attendance: "88%", avatarUrl: "https://i.pravatar.cc/150?u=javier", dayOff: 3, lunchBreak: "14:30" }
                ];
            }
            if (!this.state.currentUser) {
                this.state.currentUser = {
                    "id": 0,
                    "name": "Propietario ALIA",
                    "role": "Owner",
                    "avatarUrl": "https://i.pravatar.cc/150?u=owner"
                };
            }
            

            this.initialized = true;
        } catch (error) {
            console.error("MockAPI Init Error:", error);
            // Los fetches individuales ya tienen su propio try-catch.
            // Aquí solo garantizamos valores mínimos para team y currentUser
            // sin sobreescribir citas ya cargadas.
            if (this.state.team.length === 0) {
                this.state.team = [
                    { id: 1, name: "Laura Gómez", role: "Estilista", attendance: "98%", avatarUrl: "https://i.pravatar.cc/150?u=laura", dayOff: 2, lunchBreak: "13:30" },
                    { id: 2, name: "Javier Ruiz",  role: "Barbero",   attendance: "88%", avatarUrl: "https://i.pravatar.cc/150?u=javier", dayOff: 3, lunchBreak: "14:30" }
                ];
            }
            if (!this.state.currentUser) {
                this.state.currentUser = {
                    "id": 0,
                    "name": "Alejandro Mora",
                    "role": "Owner",
                    "avatarUrl": "https://i.pravatar.cc/150?u=owner"
                };
            }
            // Solo sembramos citas si no se cargó NADA (evita sobrescribir datos reales)
            
            this.initialized = true;
        }
    }

    /**
     * Recalcula rawDate y formattedDate.
     * - Si la cita tiene dayOffset (entero), la fecha se calcula desde el lunes
     *   de la semana actual: dayOffset 0 = lunes, 1 = martes, …, 5 = sábado,
     *   7 = lunes próximo, etc. (negativo = semana pasada).
     * - Si la cita sólo tiene rawDate fijo (modo legado), usa esa fecha.
     * - Las citas pendientes con fecha pasada se marcan automáticamente como
     *   "completed".
     */
    _normalizeAppointmentDates() {
        // Helper: fecha local en formato YYYY-MM-DD (evita el bug de toISOString en UTC+X)
        const toLocalYMD = (d) => {
            const y  = d.getFullYear();
            const mo = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${y}-${mo}-${dd}`;
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const todayStr    = toLocalYMD(today);
        const tomorrowStr = toLocalYMD(tomorrow);

        // Lunes de la semana actual (si hoy es domingo → lunes de ESTA semana, no el siguiente)
        const dow = today.getDay(); // 0=Dom, 1=Lun, …, 6=Sáb
        const monday = new Date(today);
        monday.setDate(today.getDate() + (dow === 0 ? -6 : 1 - dow));
        monday.setHours(0, 0, 0, 0);

        this.state.appointments = this.state.appointments.map(appt => {
            let rawDate = appt.rawDate || '';
            let label   = appt.formattedDate || '';
            let status  = appt.status;

            if (appt.dayOffset !== undefined) {
                // Calcular fecha real desde el lunes de esta semana (usando fecha LOCAL)
                const apptDate = new Date(monday);
                apptDate.setDate(monday.getDate() + appt.dayOffset);
                rawDate = toLocalYMD(apptDate);   // ← FIX: fecha local, no UTC

                if (rawDate === todayStr)         label = 'Hoy';
                else if (rawDate === tomorrowStr) label = 'Mañana';
                else {
                    const parts = rawDate.split('-');
                    label = `${parts[2]}/${parts[1]}`;
                }

                // Auto-completar citas pasadas
                if (apptDate < today && status === 'pending') status = 'completed';
            } else {
                // Modo legado: rawDate fijo
                if (rawDate === todayStr)         label = 'Hoy';
                else if (rawDate === tomorrowStr) label = 'Mañana';
                else if (rawDate) {
                    const parts = rawDate.split('-');
                    if (parts.length === 3) label = `${parts[2]}/${parts[1]}`;
                }
            }

            return { ...appt, rawDate, formattedDate: label, status };
        });
    }

    // Helper to simulate network latency
    async _simulateDelay(ms = null) {
        // Random delay between 300ms and 800ms if not specified
        const delay = ms || Math.floor(Math.random() * 500) + 300;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // --- CLIENTS ---
    async getClients() {
        await this.init();
        await this._simulateDelay();
        return [...this.state.clients]; // Return a copy
    }

    async getClientById(id) {
        await this.init();
        await this._simulateDelay(100);
        let client = this.state.clients.find(c => c.id == id);
        if (!client) {
            client = {
                id: id,
                name: "Cliente Desconocido",
                phone: "+34 600 000 000",
                notes: "Cliente nuevo. No hay historial ni notas adicionales disponibles.",
                history: []
            };
        }
        return client;
    }

    async addClient(clientData) {
        await this.init();
        await this._simulateDelay(600); // Simulate saving delay
        
        const newClient = {
            ...clientData,
            id: Date.now(), // Generate a fake ID
            totalAppts: 0,
            registeredAt: new Date().toISOString().split('T')[0], // Fecha de alta
            notes: "",
            history: []
        };
        
        // Add to the beginning of the list
        this.state.clients.unshift(newClient);
        return newClient;
    }

    async deleteClient(id) {
        await this.init();
        await this._simulateDelay();
        this.state.clients = this.state.clients.filter(c => c.id !== id);
        return { success: true };
    }

    async editClient(id, updatedData) {
        await this.init();
        await this._simulateDelay(600); // Simulate saving delay
        
        const index = this.state.clients.findIndex(c => c.id === id);
        if (index !== -1) {
            this.state.clients[index] = { ...this.state.clients[index], ...updatedData };
            return this.state.clients[index];
        }
        return null;
    }

    async updateAppointmentStatus(id, newStatus) {
        await this._simulateDelay(200);
        const apptIndex = this.state.appointments.findIndex(a => a.id === id);
        if (apptIndex === -1) throw new Error("Cita no encontrada");
        
        // Update appointment status
        this.state.appointments[apptIndex].status = newStatus;
        
        // Also try to update it in the client's history
        const clientId = this.state.appointments[apptIndex].clientId;
        const client = this.state.clients.find(c => c.id === clientId);
        if (client && client.history) {
            // Usually the time/date match or we can find by service/prof/time, but since it's a mock let's just find the first pending history item that matches service and prof
            // Or better, we should really give history items an ID. But since we didn't, let's just match by date & service.
            const targetAppt = this.state.appointments[apptIndex];
            const historyItem = client.history.find(h => 
                (h.date === targetAppt.rawDate + ", " + targetAppt.time || h.date === targetAppt.formattedDate) && 
                h.service === targetAppt.service
            );
            if (historyItem) {
                historyItem.status = newStatus;
            } else {
                // fallback: update the first pending one
                const pendingHist = client.history.find(h => h.status === 'pending');
                if (pendingHist) pendingHist.status = newStatus;
            }
        }
        
        if (window.renderDashboard) window.renderDashboard();
        
        return this.state.appointments[apptIndex];
    }

    async addAbsence(absenceData) {
        await this.init();
        await this._simulateDelay(500);
        
        const newAbsence = {
            id: this.state.absences.length + 1,
            ...absenceData
        };
        this.state.absences.push(newAbsence);
        return newAbsence;
    }

    async addAppointment(clientQuery, apptData) {
        await this.init();
        await this._simulateDelay(600);
        
        // Find client by name or phone
        const query = clientQuery.toLowerCase().trim();
        let client = this.state.clients.find(c => c.name.toLowerCase() === query || c.phone === query);
        
        if (!client) {
            // Create a temporary client if not found so the appt is still saved
            const newClient = {
                id: Date.now(),
                name: clientQuery,
                phone: "-",
                email: "",
                totalAppts: 0,
                registeredAt: new Date().toISOString().split('T')[0],
                notes: "",
                history: [],
                source: 'Manual'
            };
            this.state.clients.unshift(newClient);
            client = newClient;
        }

        client.totalAppts = (client.totalAppts || 0) + 1;
        client.lastAppt = apptData.rawDate; // e.g. "2026-05-01" or whatever format
        client.history = client.history || [];
        
        // Extract time from formattedDate or assume it's passed in apptData
        let timeStr = apptData.time || '';
        if (!timeStr && apptData.formattedDate) {
            const parts = apptData.formattedDate.split(', ');
            if (parts.length > 1) timeStr = parts[1];
        }

        const newAppt = {
            id: Date.now(),
            clientId: client.id,
            clientName: client.name,
            date: apptData.formattedDate, 
            rawDate: apptData.rawDate,
            createdAt: new Date().toISOString().split('T')[0],
            time: timeStr,
            service: apptData.service,
            prof: apptData.prof,
            duration: apptData.duration || 30,
            status: 'pending'
        };
        
        client.history.unshift(newAppt);
        this.state.appointments.unshift(newAppt);
        
        if (window.renderDashboard) window.renderDashboard();
        
        return { success: true, client };
    }


    // Helper: fecha local YYYY-MM-DD sin bug UTC
    _toLocalYMD(d) {
        const y  = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${mo}-${dd}`;
    }

    // Expande la plantilla semanal (dayOffset 0-5) a la semana de targetMonday
    // si aún no hay citas para esa semana. Llamado de forma lazy desde getAppointments.
    _expandWeekIfNeeded(targetMondayStr) {
        // ¿Ya hay citas para esta semana?
        const alreadyCovered = this.state.appointments.some(a =>
            a.rawDate && a.rawDate >= targetMondayStr &&
            a.rawDate <= targetMondayStr.replace(/\d+$/, m => String(parseInt(m) + 6).padStart(2,'0'))
        );
        if (alreadyCovered) return;

        // Calcular lunes de targetMondayStr
        const wkMonday = new Date(targetMondayStr + 'T00:00:00');

        // Número de semana relativo a la semana actual (para variación horaria)
        const today = new Date(); today.setHours(0,0,0,0);
        const dow = today.getDay();
        const curMonday = new Date(today);
        curMonday.setDate(today.getDate() + (dow === 0 ? -6 : 1 - dow));
        const wDelta = Math.round((wkMonday - curMonday) / (7 * 86400000));
        const timeShift = [0, 10, 5][Math.abs(wDelta) % 3];

        const lunchMap = {
            'Javier Ruiz':      { s: 870, e: 930 },
            'Alejandro Mora':   { s: 840, e: 900 },
            'Laura G\u00f3mez': { s: 810, e: 870 },
        };

        // Plantillas: citas con dayOffset 0-5 (la semana actual como template)
        const templates = this.state.appointments.filter(a =>
            a.dayOffset !== undefined && a.dayOffset !== null &&
            Number(a.dayOffset) >= 0 && Number(a.dayOffset) <= 5
        );

        const todayStr = this._toLocalYMD(today);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = this._toLocalYMD(tomorrow);

        const virtual = [];
        templates.forEach(appt => {
            const apptDate = new Date(wkMonday);
            apptDate.setDate(wkMonday.getDate() + Number(appt.dayOffset));
            const rawDate = this._toLocalYMD(apptDate);

            const [h, m] = appt.time.split(':').map(Number);
            let startMins = h * 60 + m + timeShift;
            const dur = parseInt(appt.duration) || 45;
            let endMins = startMins + dur;

            if (endMins > 1140) return; // después de 19:00

            const lunch = lunchMap[appt.prof];
            if (lunch && startMins < lunch.e && endMins > lunch.s) {
                startMins = h * 60 + m;
                endMins   = startMins + dur;
                if (endMins > 1140) return;
            }

            const time = `${String(Math.floor(startMins/60)).padStart(2,'0')}:${String(startMins%60).padStart(2,'0')}`;

            let lbl;
            if (rawDate === todayStr)         lbl = 'Hoy';
            else if (rawDate === tomorrowStr) lbl = 'Mañana';
            else { const p = rawDate.split('-'); lbl = `${p[2]}/${p[1]}`; }

            const vstatus = apptDate < today ? 'completed'
                : (appt.status === 'cancelled' ? 'cancelled' : 'pending');

            virtual.push({
                ...appt,
                id:            200000 + (Number(appt.id) * 30) + (Math.abs(wDelta) % 30),
                rawDate,
                formattedDate: lbl,
                time,
                status:        vstatus,
                dayOffset:     null
            });
        });

        if (virtual.length > 0) {
            this.state.appointments = [...this.state.appointments, ...virtual];
        }
    }

    async getAppointments(filters = {}) {
        await this.init();
        await this._simulateDelay(100);

        // Expansión lazy: si se pide una semana sin datos, generar desde template
        const checkDate = filters.startDate || filters.date || null;
        if (checkDate) {
            const d = new Date(checkDate + 'T00:00:00');
            const dd = d.getDay();
            const mon = new Date(d);
            mon.setDate(d.getDate() + (dd === 0 ? -6 : 1 - dd));
            this._expandWeekIfNeeded(this._toLocalYMD(mon));
        }

        return this.state.appointments.filter(appt => {
            if (appt.status === 'cancelled') return false;
            if (filters.prof && appt.prof !== filters.prof) return false;
            if (filters.startDate && appt.rawDate < filters.startDate) return false;
            if (filters.endDate   && appt.rawDate > filters.endDate)   return false;
            if (filters.date      && appt.rawDate !== filters.date)     return false;
            return true;
        });
    }

    async getAppointmentsByProfessional(profName, rawDate) {
        return this.getAppointments({ prof: profName, date: rawDate });
    }

    async getAppointmentsByDate(rawDate) {
        return this.getAppointments({ date: rawDate });
    }

    // --- TEAM ---
    async getTeam() {
        await this.init();
        await this._simulateDelay();
        return [...this.state.team];
    }

    // --- BUSINESS SETTINGS ---
    async getSettings() {
        await this.init();
        await this._simulateDelay(200);
        return { ...this.state.settings };
    }

    async updateSettings(newSettings) {
        await this.init();
        await this._simulateDelay(400);
        this.state.settings = { ...this.state.settings, ...newSettings };
        return this.state.settings;
    }

    // --- CHATS ---
    async getChats() {
        await this.init();
        await this._simulateDelay(200);
        // Returns clients with source 'Alia', mapped with their last message
        const chatClients = this.state.clients.filter(c => c.source === 'Alia');
        
        return chatClients.map(client => {
            const chatData = client.chatData || { unread: 0, messages: [] };
            const lastMessage = chatData.messages && chatData.messages.length > 0 ? chatData.messages[chatData.messages.length - 1] : null;
            return {
                client: client,
                unread: chatData.unread || 0,
                lastMessage: lastMessage
            };
        });
    }

    async getChatMessages(clientId) {
        await this.init();
        await this._simulateDelay(200);
        
        // Mark as read when fetching
        let client = this.state.clients.find(c => c.id == clientId);
        if (client && client.chatData) {
            client.chatData.unread = 0;
        }
        
        const chatData = client && client.chatData ? client.chatData : { unread: 0, messages: [] };
        return chatData.messages || [];
    }

    async addChatMessage(clientId, text, sender = 'alia') {
        await this.init();
        await this._simulateDelay(400); // Network delay

        let client = this.state.clients.find(c => c.id == clientId);
        if (client) {
            if (!client.chatData) client.chatData = { unread: 0, messages: [] };
            if (!client.chatData.messages) client.chatData.messages = [];
            
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            
            const newMsg = { sender: sender, text: text, time: timeStr };
            client.chatData.messages.push(newMsg);
            
            return newMsg;
        }
        return null;
    }
}

// Export a singleton instance
const api = new MockAPI();
window.MockAPI = api; // Make it globally available for our prototype scripts
