/**
 * Módulo para obtener los mensajes del servidor / json
 */
export const fetchMessages = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [
            { sender: "bot", text: "Hola! Soy ALIA. (Error de carga local).", time: "00:00" }
        ];
    }
};
