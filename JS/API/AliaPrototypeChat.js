/**
 * Clase para el chat del Prototipo (vista del cliente).
 * Llama al backend seguro (Vercel Serverless Function) para no exponer las claves API en el frontend.
 */
class AliaPrototypeChat {
    constructor() {
        // La URL de nuestra Vercel Serverless Function
        this.apiUrl = '/api/chat'; 
    }

    async initialize() {
        console.log("AliaPrototypeChat: Conectado. Usará el backend seguro en /api/chat");
    }

    /**
     * Envía un mensaje al backend en Vercel.
     * @param {string} message - El mensaje escrito por el "cliente" en el prototipo.
     * @returns {Promise<string>} - La respuesta del bot.
     */
    async sendMessage(message) {
        console.log(`AliaPrototypeChat: Enviando mensaje al backend -> ${message}`);
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message,
                    chatType: 'prototype_client'
                })
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            
            // Si la IA detecta que se agendó una cita, tu backend en Vercel podría devolver un booleano (ej. data.appointmentCreated = true)
            // if (data.appointmentCreated && window.MockAPI) {
            //     window.MockAPI.addAppointment(...);
            //     if(window.refreshAgenda) window.refreshAgenda();
            // }

            return data.reply || "No he recibido respuesta de la IA.";
        } catch (error) {
            console.error("AliaPrototypeChat Error:", error);
            return "Lo siento, ha habido un problema de conexión con mis servidores en el prototipo.";
        }
    }
}

// Exponer la clase de forma global
window.AliaPrototypeChat = AliaPrototypeChat;
