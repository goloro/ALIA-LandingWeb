class MockAPI {
    constructor() {
        if (MockAPI.instance) {
            return MockAPI.instance;
        }
        
        // Estado en memoria
        this.state = {
            clients: [],
            team: [],
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
                const clientsRes = await fetch('../data/clients.json');
                if (clientsRes.ok) this.state.clients = await clientsRes.json();
            } catch(e) { console.log("Error loading clients.json"); }

            try {
                const teamRes = await fetch('../data/team.json');
                if (teamRes.ok) this.state.team = await teamRes.json();
            } catch(e) { console.log("Error loading team.json"); }
            
            try {
                const apptsRes = await fetch('../data/appointments.json');
                if (apptsRes.ok) {
                    this.state.appointments = await apptsRes.json();
                }
            } catch(e) {
                console.log("Error loading appointments.json", e);
            }

            try {
                const cachedUser = localStorage.getItem('currentUserData');
                if (cachedUser) {
                    this.state.currentUser = JSON.parse(cachedUser);
                } else {
                    const userRes = await fetch('../data/user.json');
                    if (userRes.ok) {
                        this.state.currentUser = await userRes.json();
                    } else {
                        this.state.currentUser = {
                            "id": 0,
                            "name": "Propietario",
                            "role": "Owner",
                            "avatar": "../Images/Logos/LogoPeluqueríaNegro.png"
                        };
                    }
                }
            } catch(e) {
                console.log("Error loading user.json", e);
                this.state.currentUser = {
                    "id": 0,
                    "name": "Propietario",
                    "role": "Owner",
                    "avatar": "../Images/Logos/LogoPeluqueríaNegro.png"
                };
            }

            try {
                const businessRes = await fetch('../data/business.json');
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
                const absRes = await fetch('../data/ausencias.json');
                if (absRes.ok) {
                    this.state.absences = await absRes.json();
                }
            } catch(e) {
                console.log("Error loading ausencias.json", e);
            }

            // Cargar ajustes si existe el archivo
            try {
                const settingsRes = await fetch('../data/settings.json');
                if (settingsRes.ok) {
                    const loadedSettings = await settingsRes.json();
                    this.state.settings = { ...this.state.settings, ...loadedSettings };
                }
            } catch(e) {
                console.log("Settings no encontradas, usando valores por defecto", e);
            }
            
            // Seed mock appointments if empty so prototype looks good
            if (this.state.appointments.length === 0 && this.state.team.length > 0) {
                this._seedMockAppointments();
            }

            this.initialized = true;
        } catch (error) {
            console.error("MockAPI Init Error:", error);
            // Fallback empty if fetch fails
            this.state.clients = [];
            this.state.team = [
                { id: 1, name: "Dra. Laura Gómez", role: "Especialista", dayOff: 2, lunchBreak: "13:30" },
                { id: 2, name: "Dr. Javier Ruiz", role: "Terapista", dayOff: 3, lunchBreak: "14:30" }
            ];
            this._seedMockAppointments();
            this.initialized = true;
        }
    }

    _seedMockAppointments() {
        const now = new Date();
        
        const getNextValidDate = (startDate, profObj) => {
            let d = new Date(startDate);
            const closedDays = this.state.settings?.closedDays || [0];
            while (true) {
                if (!closedDays.includes(d.getDay())) {
                    if (!profObj || profObj.dayOff !== d.getDay()) {
                        return d;
                    }
                }
                d.setDate(d.getDate() + 1);
            }
        };

        const prof1Obj = this.state.team[0] || { name: "Dra. Laura Gómez", dayOff: 2 };
        const prof2Obj = this.state.team[1] || { name: "Dr. Javier Ruiz", dayOff: 3 };
        const myAgendaObj = { name: "Propietario", dayOff: 1 };

        const p1_date1 = getNextValidDate(now, prof1Obj);
        const p1_date2 = getNextValidDate(new Date(p1_date1.getTime() + 86400000), prof1Obj);
        
        const p2_date1 = getNextValidDate(now, prof2Obj);
        const p2_date2 = getNextValidDate(new Date(p2_date1.getTime() + 86400000), prof2Obj);
        
        const my_date1 = getNextValidDate(now, myAgendaObj);
        const my_date2 = getNextValidDate(new Date(my_date1.getTime() + 86400000), myAgendaObj);

        const formatD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const formatLabel = (d) => {
            const today = new Date();
            const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
            if (d.toDateString() === today.toDateString()) return "Hoy";
            if (d.toDateString() === tomorrow.toDateString()) return "Mañana";
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        };

        const prof1 = prof1Obj.name;
        const prof2 = prof2Obj.name;
        const myAgenda = myAgendaObj.name;

        const seedAppts = [
            { id: 101, clientId: 101, clientName: "Carlos Pérez", rawDate: formatD(p1_date1), formattedDate: formatLabel(p1_date1), time: "10:30", duration: 60, service: "Corte y Lavado", prof: prof1, status: "completed" },
            { id: 102, clientId: 102, clientName: "Ana López", rawDate: formatD(p1_date1), formattedDate: formatLabel(p1_date1), time: "12:00", duration: 90, service: "Coloración", prof: prof1, status: "pending" },
            { id: 103, clientId: 103, clientName: "Miguel Sanz", rawDate: formatD(p2_date1), formattedDate: formatLabel(p2_date1), time: "16:00", duration: 30, service: "Arreglo Barba", prof: prof2, status: "pending" },
            { id: 104, clientId: 104, clientName: "Lucía M.", rawDate: formatD(p1_date2), formattedDate: formatLabel(p1_date2), time: "11:00", duration: 60, service: "Peinado", prof: prof1, status: "pending" },
            { id: 105, clientId: 105, clientName: "David R.", rawDate: formatD(p2_date2), formattedDate: formatLabel(p2_date2), time: "13:30", duration: 30, service: "Corte Express", prof: prof2, status: "pending" },
            
            // Mi Agenda appointments
            { id: 106, clientId: 106, clientName: "Roberto F.", rawDate: formatD(my_date1), formattedDate: formatLabel(my_date1), time: "11:30", duration: 45, service: "Revisión Equipo", prof: myAgenda, status: "pending" },
            { id: 107, clientId: 107, clientName: "Elena V.", rawDate: formatD(my_date1), formattedDate: formatLabel(my_date1), time: "17:00", duration: 60, service: "Entrevista Staff", prof: myAgenda, status: "pending" },
            { id: 108, clientId: 108, clientName: "Admin", rawDate: formatD(my_date2), formattedDate: formatLabel(my_date2), time: "10:00", duration: 120, service: "Gestión Proveedores", prof: myAgenda, status: "completed" }
        ];

        // Añadir estos clientes a la base de datos simulada para que salgan en la pestaña de clientes
        seedAppts.forEach(appt => {
            const existingClient = this.state.clients.find(c => c.id === appt.clientId);
            if (!existingClient) {
                this.state.clients.push({
                    id: appt.clientId,
                    name: appt.clientName,
                    email: appt.clientName.replace(' ', '.').toLowerCase() + "@ejemplo.com",
                    phone: "+34 600 000 " + (appt.clientId - 100).toString().padStart(2, '0'),
                    lastAppt: appt.rawDate,
                    totalAppts: 1,
                    registeredAt: appt.rawDate,
                    notes: "Cliente autogenerado por el prototipo para la cita de hoy/mañana.",
                    history: [
                        { date: appt.rawDate + ", " + appt.time, status: appt.status, service: appt.service, prof: appt.prof }
                    ],
                    source: 'Alia'
                });
            }
        });

        // Add potential clients (leads who spoke to Alia but haven't booked)
        this.state.clients.push({
            id: 901,
            name: "Marta Sánchez",
            email: "marta.s@ejemplo.com",
            phone: "+34 600 000 90",
            lastAppt: null,
            totalAppts: 0,
            registeredAt: new Date().toISOString().split('T')[0],
            notes: "Lead generado ayer. Interesada en tratamiento facial.",
            history: [],
            source: 'Alia'
        });

        this.state.clients.push({
            id: 902,
            name: "Ricardo Mendoza",
            email: "ricardo.m@ejemplo.com",
            phone: "+34 600 000 91",
            lastAppt: null,
            totalAppts: 0,
            registeredAt: new Date().toISOString().split('T')[0],
            notes: "Interesado en decoloración gris plata.",
            history: [],
            source: 'Alia'
        });

        // Initialize Chat Data
        // Ricardo Mendoza (id: 902) gets the specific Frame 7 mock messages
        this.state.chats = {
            902: {
                unread: 1,
                messages: [
                    { sender: 'client', text: 'Hola, quería pedir cita. Quiero teñirme el pelo de gris plata o blanco.', time: '10:15 AM' },
                    { sender: 'alia', text: '¡Hola Ricardo! 👋 Soy ALIA, el asistente virtual de la peluquería ALIA. Estaré encantada de ayudarte. Para un cambio a gris plata, ¿tienes preferencia por algún barbero o estilista de nuestro equipo, o te busco el primer hueco disponible?', time: '10:15 AM' },
                    { sender: 'client', text: 'Me da igual quién me lo haga. Pero antes de ir necesito saber exactamente cuánto me va a costar y cuánto vais a tardar. Tengo el pelo castaño muy oscuro, casi negro, y bastante fino.', time: '10:17 AM' },
                    { sender: 'alia', text: 'Entiendo. Para llegar a un gris plata o blanco desde una base tan oscura, se necesita un proceso de decoloración intenso. El precio base de la decoloración más el matiz es de 55€, pero el tiempo y el precio final varían según las sesiones que necesite tu cabello para aclarar. Lo ideal sería agendar una cita de valoración gratuita de 15 minutos. ¿Te busco hueco para que un especialista lo vea?', time: '10:17 AM' },
                    { sender: 'client', text: 'Es que trabajo hasta tarde y no tengo tiempo para ir dos veces. Necesito que me deis un precio cerrado por aquí y saber si se me va a quemar o caer el pelo por decolorarlo tanto. Si la broma sube de 90€ decídmelo ya y busco otro sitio.', time: '10:20 AM' },
                    { sender: 'alia', text: 'Entiendo perfectamente tu situación, Ricardo. Como se trata de un proceso químico muy fuerte sobre cabello fino y oscuro, prefiero que un especialista valore tus dudas directamente para no darte un presupuesto incorrecto ni arriesgar la salud de tu pelo o tu cuero cabelludo.\\n⏸️ Pauso mi asistencia automática. En unos minutos uno de nuestros estilistas leerá esto y te responderá por aquí mismo. ¡Dame un momento!', time: '10:20 AM' },
                    { sender: 'system', text: 'ASISTENTE ALIA PAUSADA • INTERVENCIÓN HUMANA REQUERIDA', time: '' },
                    { sender: 'profesional', text: 'Hola Ricardo, soy Marcos, especialista colorista de la peluquería. Haces muy bien en preguntar. Pasar de oscuro a gris plata en pelo fino casi siempre requiere dos decoloraciones suaves para no romper la fibra capilar, además del matiz. Darte un precio cerrado por WhatsApp sin hacer una prueba de mechón es arriesgado, pero calcula que rondará los 85–100€ y tardaremos unas 3 horas. Si te encaja, te busco un hueco largo esta semana.', time: '10:25 AM', profName: 'PROFESIONAL MARCOS GÓMEZ' }
                ]
            },
            901: {
                unread: 1,
                messages: [
                    { sender: 'client', text: 'Hola, quería informarme sobre los precios del tratamiento facial.', time: '09:00' },
                    { sender: 'alia', text: '¡Hola Marta! El tratamiento facial cuesta 60€ y dura unos 90 minutos. Incluye limpieza profunda e hidratación. ¿Te gustaría agendar una cita?', time: '09:01' },
                    { sender: 'client', text: 'Me lo pienso y te digo, gracias.', time: '09:30' }
                ]
            }
        };

        this.state.appointments = seedAppts;
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
            time: timeStr,
            service: apptData.service,
            prof: apptData.prof,
            duration: apptData.duration || 30,
            status: 'pending'
        };
        
        client.history.unshift(newAppt);
        this.state.appointments.unshift(newAppt);
        
        return { success: true, client };
    }


    async getAppointments(filters = {}) {
        await this.init();
        await this._simulateDelay(100);
        
        return this.state.appointments.filter(appt => {
            if (appt.status === 'cancelled') return false;
            if (filters.prof && appt.prof !== filters.prof) return false;
            
            if (filters.startDate && appt.rawDate < filters.startDate) return false;
            if (filters.endDate && appt.rawDate > filters.endDate) return false;
            if (filters.date && appt.rawDate !== filters.date) return false;
            
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
            const chatData = this.state.chats[client.id] || { unread: 0, messages: [] };
            const lastMessage = chatData.messages.length > 0 ? chatData.messages[chatData.messages.length - 1] : null;
            return {
                client: client,
                unread: chatData.unread,
                lastMessage: lastMessage
            };
        });
    }

    async getChatMessages(clientId) {
        await this.init();
        await this._simulateDelay(200);
        
        // Mark as read when fetching
        if (this.state.chats[clientId]) {
            this.state.chats[clientId].unread = 0;
        }
        
        const chatData = this.state.chats[clientId] || { unread: 0, messages: [] };
        return chatData.messages;
    }

    async addChatMessage(clientId, text, sender = 'alia') {
        await this.init();
        await this._simulateDelay(400); // Network delay

        if (!this.state.chats[clientId]) {
            this.state.chats[clientId] = { unread: 0, messages: [] };
        }
        
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        const newMsg = { sender: sender, text: text, time: timeStr };
        this.state.chats[clientId].messages.push(newMsg);
        
        return newMsg;
    }
}

// Export a singleton instance
const api = new MockAPI();
window.MockAPI = api; // Make it globally available for our prototype scripts
