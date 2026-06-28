/**
 * Clase para el chat de la Landing Page (widget flotante).
 * Llama al backend seguro (Vercel Serverless Function) para no exponer las claves API en el frontend.
 */
class AliaLandingChat {
    constructor() {
        // La URL de nuestra Vercel Serverless Function
        this.apiUrl = '/api/chat'; 
    }

    async initialize() {
        console.log("AliaLandingChat: Conectado. Usará el backend seguro en /api/chat");
    }

    /**
     * Envía un mensaje al backend en Vercel.
     * @param {string} message - El mensaje escrito por el usuario en la landing page.
     * @returns {Promise<string>} - La respuesta del bot.
     */
    async sendMessage(message) {
        console.log(`AliaLandingChat: Enviando mensaje al backend -> ${message}`);
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message,
                    chatType: 'landing_page' 
                })
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            return data.reply || "No he recibido respuesta de la IA.";
        } catch (error) {
            console.error("AliaLandingChat Error:", error);
            return "Lo siento, ha habido un problema de conexión con mis servidores.";
        }
    }
}

// Exponer la clase de forma global
window.AliaLandingChat = AliaLandingChat;
