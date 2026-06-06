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
            settings: {
                closedDays: [0] // 0 = Domingo, 1 = Lunes, etc.
            }
        };
        this.initialized = false;
        
        MockAPI.instance = this;
    }

    // Inicializar datos (Simula la primera carga de una DB)
    async init() {
        if (this.initialized) return;
        
        try {
            // Cargar desde JSON estático
            const clientsRes = await fetch('../data/clients.json');
            const teamRes = await fetch('../data/team.json');
            
            if (!clientsRes.ok || !teamRes.ok) throw new Error("Error loading JSON data");
            
            this.state.clients = await clientsRes.json();
            this.state.team = await teamRes.json();
            
            try {
                const apptsRes = await fetch('../data/appointments.json');
                if (apptsRes.ok) {
                    this.state.appointments = await apptsRes.json();
                }
            } catch(e) {
                console.log("Error loading appointments.json", e);
            }

            // Cargar ajustes si existe el archivo
            try {
                const settingsRes = await fetch('../data/settings.json');
                if (settingsRes.ok) {
                    this.state.settings = await settingsRes.json();
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
                { id: 1, name: "Dra. Laura Gómez", role: "Especialista" },
                { id: 2, name: "Dr. Javier Ruiz", role: "Terapista" }
            ];
            this._seedMockAppointments();
            this.initialized = true;
        }
    }

    _seedMockAppointments() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tm_mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const tm_dd = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowStr = `${yyyy}-${tm_mm}-${tm_dd}`;

        const prof1 = this.state.team[0]?.name || "Dra. Laura Gómez";
        const prof2 = this.state.team[1]?.name || "Dr. Javier Ruiz";
        const myAgenda = "Propietario";

        const seedAppts = [
            { id: 101, clientId: 101, clientName: "Carlos Pérez", rawDate: todayStr, formattedDate: "Hoy", time: "10:30", duration: 60, service: "Corte y Lavado", prof: prof1, status: "completed" },
            { id: 102, clientId: 102, clientName: "Ana López", rawDate: todayStr, formattedDate: "Hoy", time: "12:00", duration: 90, service: "Coloración", prof: prof1, status: "pending" },
            { id: 103, clientId: 103, clientName: "Miguel Sanz", rawDate: todayStr, formattedDate: "Hoy", time: "16:00", duration: 30, service: "Arreglo Barba", prof: prof2, status: "pending" },
            { id: 104, clientId: 104, clientName: "Lucía M.", rawDate: tomorrowStr, formattedDate: "Mañana", time: "11:00", duration: 60, service: "Peinado", prof: prof1, status: "pending" },
            { id: 105, clientId: 105, clientName: "David R.", rawDate: tomorrowStr, formattedDate: "Mañana", time: "13:30", duration: 30, service: "Corte Express", prof: prof2, status: "pending" },
            
            // Mi Agenda appointments
            { id: 106, clientId: 106, clientName: "Roberto F.", rawDate: todayStr, formattedDate: "Hoy", time: "11:30", duration: 45, service: "Revisión Equipo", prof: myAgenda, status: "pending" },
            { id: 107, clientId: 107, clientName: "Elena V.", rawDate: todayStr, formattedDate: "Hoy", time: "17:00", duration: 60, service: "Entrevista Staff", prof: myAgenda, status: "pending" },
            { id: 108, clientId: 108, clientName: "Admin", rawDate: tomorrowStr, formattedDate: "Mañana", time: "10:00", duration: 120, service: "Gestión Proveedores", prof: myAgenda, status: "completed" }
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
                    ]
                });
            }
        });

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
                history: []
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
}

// Export a singleton instance
const api = new MockAPI();
window.MockAPI = api; // Make it globally available for our prototype scripts
