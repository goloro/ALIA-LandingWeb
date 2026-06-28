/**
 * Vercel Serverless Function
 * Este archivo actúa como tu backend seguro. Se ejecuta en los servidores de Vercel,
 * por lo que el código fuente y tus claves secretas NUNCA son visibles en el navegador del usuario.
 * 
 * URL de este endpoint: POST /api/chat
 */

export default async function handler(req, res) {
    // Solo permitimos peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extraemos los datos que nos envía nuestro frontend
        const { message, chatType } = req.body;
        
        // Leemos la clave secreta desde las Variables de Entorno de Vercel
        // Asegúrate de añadir GOOGLE_API_KEY en el panel de Vercel (Settings > Environment Variables)
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.error("Falta la API Key en las variables de entorno.");
            // Respuesta temporal si no hay key (para pruebas locales sin entorno)
            return res.status(200).json({ 
                reply: `[Simulación Vercel] He recibido: "${message}". Configura GOOGLE_API_KEY en Vercel para respuestas reales.` 
            });
        }

        /**
         * TODO: Aquí debes implementar la llamada real a la API de Google AI Studio (Gemini).
         * 
         * Ejemplo de cómo sería la llamada:
         * 
         * const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
         *     method: 'POST',
         *     headers: { 'Content-Type': 'application/json' },
         *     body: JSON.stringify({
         *         contents: [{
         *             parts: [{ text: message }]
         *         }]
         *     })
         * });
         * 
         * const data = await googleResponse.json();
         * const botReply = data.candidates[0].content.parts[0].text;
         * 
         * return res.status(200).json({ reply: botReply });
         */

        // Mientras no configures lo de arriba, devolvemos un mensaje de prueba:
        return res.status(200).json({ 
            reply: `¡Conexión segura establecida! El backend ha recibido el mensaje desde el chat de tipo: ${chatType}.`
        });

    } catch (error) {
        console.error("Error procesando la solicitud en el servidor:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
