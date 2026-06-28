/**
 * Clase para el chat de la Landing Page (widget flotante).
 * Llama al backend seguro (Vercel Serverless Function) enviando el historial de la conversación.
 */
class AliaLandingChat {
    constructor() {
        this.apiUrl = '/api/chat'; 
        // Historial de la conversación en formato Gemini
        this.history = [];
    }

    async initialize() {
        console.log("AliaLandingChat: Conectado con soporte de memoria.");
        // Opcional: Podrías cargar historial guardado en localStorage aquí
    }

    /**
     * Envía un mensaje al backend en Vercel.
     * @param {string} message - El mensaje del usuario.
     * @returns {Promise<string>} - La respuesta del bot.
     */
    async sendMessage(message) {
        // Añadir el mensaje del usuario al historial
        this.history.push({
            role: "user",
            parts: [{ text: message }]
        });

        // Limitar historial para no gastar demasiados tokens (ej. últimos 10 turnos = 20 mensajes)
        if (this.history.length > 20) {
            this.history = this.history.slice(this.history.length - 20);
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    history: this.history, // Enviamos TODO el historial, no solo el último mensaje
                    chatType: 'landing_page' 
                })
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            const botReply = data.reply || "No he recibido respuesta de la IA.";

            // Añadir la respuesta del bot al historial
            this.history.push({
                role: "model",
                parts: [{ text: botReply }]
            });

            return botReply;
        } catch (error) {
            console.error("AliaLandingChat Error:", error);
            // Si hay error, quitamos el último mensaje del usuario del historial para no descuadrar
            this.history.pop();
            return "Lo siento, ha habido un problema de conexión con mis servidores.";
        }
    }
}

// Exponer la clase de forma global
window.AliaLandingChat = AliaLandingChat;
