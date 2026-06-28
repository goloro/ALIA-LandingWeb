/**
 * Clase para el chat del Prototipo (vista del cliente).
 * Llama al backend seguro y maneja Function Calling para interactuar con la agenda.
 */
class AliaPrototypeChat {
    constructor() {
        this.apiUrl = '/api/chat'; 
        this.history = [];
    }

    async initialize() {
        console.log("AliaPrototypeChat: Conectado con soporte de memoria y acciones.");
    }

    /**
     * Envía un mensaje o resultado de función al backend.
     * @param {string|object} content - Texto del usuario o resultado de ejecución de herramienta.
     * @param {boolean} isFunctionResponse - Indica si estamos enviando el resultado de una herramienta.
     * @returns {Promise<string>} - La respuesta final en texto.
     */
    async sendMessage(content, isFunctionResponse = false) {
        if (!isFunctionResponse) {
            // Es un mensaje normal del usuario
            this.history.push({
                role: "user",
                parts: [{ text: content }]
            });
        } else {
            // Es la respuesta de una función que acabamos de ejecutar
            this.history.push({
                role: "user",
                parts: [{ 
                    functionResponse: { 
                        name: content.name, 
                        response: content.response 
                    } 
                }]
            });
        }

        if (this.history.length > 20) {
            this.history = this.history.slice(this.history.length - 20);
        }

        try {
            const payload = { 
                history: this.history,
                chatType: 'prototype_client'
            };

            if (window.MockAPI && window.MockAPI.state) {
                payload.businessContext = {
                    team: window.MockAPI.state.team || [],
                    settings: window.MockAPI.state.settings || { closedDays: [0], openHours: { start: '10:00', end: '19:00' } },
                    services: window.MockAPI.state.businessInfo?.services || []
                };
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            
            // Caso 1: La IA quiere ejecutar una herramienta (Function Calling)
            if (data.type === 'functionCall') {
                console.log("ALIA quiere ejecutar:", data.name, data.args);
                
                // Guardamos la petición de la IA en el historial
                this.history.push({
                    role: "model",
                    parts: [{ functionCall: { name: data.name, args: data.args } }]
                });

                // Ejecutamos la acción en el frontend (MockAPI)
                let funcResult = { status: "success", message: "Acción completada" };
                try {
                    if (data.name === 'addAppointment' && window.MockAPI) {
                        // Extraemos parámetros (asegúrate de que mockAPI los espera así)
                        const clientQuery = data.args.clientQuery || "Cliente Prototipo";
                        await window.MockAPI.addAppointment(clientQuery, {
                            date: data.args.date,
                            time: data.args.time,
                            prof: data.args.prof,
                            service: data.args.service || 'Cita IA',
                            notes: data.args.notes || ''
                        });
                        if (window.refreshAgenda) window.refreshAgenda();
                    } else {
                        funcResult = { status: "error", message: "Herramienta desconocida o MockAPI no disponible" };
                    }
                } catch (err) {
                    funcResult = { status: "error", message: err.message };
                }

                // Devolvemos el resultado a la IA de forma recursiva (invisible para el usuario)
                return await this.sendMessage({ name: data.name, response: funcResult }, true);
            }

            // Caso 2: La IA devuelve texto normal
            const botReply = data.reply || "No he recibido respuesta de la IA.";
            this.history.push({
                role: "model",
                parts: [{ text: botReply }]
            });

            return botReply;

        } catch (error) {
            console.error("AliaPrototypeChat Error:", error);
            if (!isFunctionResponse) this.history.pop(); // Revertir mensaje de usuario si falla la red
            return "Lo siento, ha habido un problema de conexión con mis servidores en el prototipo.";
        }
    }
}

// Exponer la clase de forma global
window.AliaPrototypeChat = AliaPrototypeChat;
