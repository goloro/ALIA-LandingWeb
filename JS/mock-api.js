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
            
            this.initialized = true;
        } catch (error) {
            console.error("MockAPI Init Error:", error);
            // Fallback empty if fetch fails
            this.state.clients = [];
            this.state.team = [];
            this.initialized = true;
        }
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
            status: 'pending'
        };
        
        client.history.unshift(newAppt);
        this.state.appointments.unshift(newAppt);
        
        return { success: true, client };
    }


    async getAppointmentsByProfessional(profName, rawDate) {
        await this.init();
        await this._simulateDelay(100);
        
        return this.state.appointments.filter(appt => 
            appt.prof === profName && 
            appt.rawDate === rawDate && 
            appt.status !== 'cancelled'
        );
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
