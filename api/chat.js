module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { history, chatType, businessContext } = req.body;
        
        let apiKey;
        if (chatType === 'landing_page') {
            apiKey = process.env.GOOGLE_API_KEY_LANDING;
        } else if (chatType === 'prototype_client') {
            apiKey = process.env.GOOGLE_API_KEY_PROTOTYPE;
        } else {
            apiKey = process.env.GOOGLE_API_KEY; 
        }

        if (!apiKey) {
            console.error(`Falta la API Key en las variables de entorno para el tipo: ${chatType}`);
            return res.status(200).json({ 
                reply: `[Simulación Vercel] He recibido tu mensaje. Configura la clave en Vercel.` 
            });
        }

        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // Definir System Prompts según el chat
        let systemInstructionText = "";
        let tools = [];

        if (chatType === 'landing_page') {
            systemInstructionText = "Eres ALIA, el asistente virtual comercial de una plataforma de inteligencia artificial para peluquerías, barberías y salones de belleza. Tu objetivo es proporcionar información precisa sobre los planes (Básico, Profesional, Enterprise), funcionalidades y ventajas. Responde de forma clara, profesional y persuasiva. NUNCA respondas a preguntas que no estén relacionadas con ALIA o el sector de la belleza. Si el usuario pregunta algo irrelevante (ej. recetas, política, chistes genéricos), declina amablemente y redirige la conversación a ALIA.";
        } else if (chatType === 'prototype_client') {
            systemInstructionText = "Eres ALIA, la recepcionista virtual inteligente de un salón de belleza. Tienes dos objetivos principales:\n1. Resolver cualquier duda que tenga el cliente (horarios, precios orientativos, recomendaciones de estilo, etc.) de forma muy amable, profesional y resolutiva.\n2. Interactuar con el cliente para agendar una cita.\n\nPara agendar la cita debes averiguar: el nombre del cliente, qué servicio desea, con qué profesional, qué fecha y qué hora. Ve preguntando los datos de forma conversacional y natural. NUNCA pidas todos los datos de golpe.\n\nNOTA MUY IMPORTANTE: NUNCA pidas el número de teléfono del cliente. Asume que ya lo tienes porque la conversación transcurre en WhatsApp. Sólo pide el nombre.\n\nCuando tengas TODOS los datos (cliente, servicio, profesional, fecha y hora), DEBES llamar OBLIGATORIAMENTE a la herramienta 'addAppointment' para registrar la cita en la agenda. NUNCA digas que la cita está confirmada hasta que no llames a la herramienta y recibas el resultado 'success'. Si la herramienta devuelve un error (ej. el profesional no está disponible), pídele disculpas al cliente y sugiérele otra hora o profesional basándote en la información del error.";

            if (businessContext) {
                let contextStr = `\n\n--- CONTEXTO DEL NEGOCIO ---\n`;
                if (businessContext.settings) {
                    contextStr += `Horario: ${businessContext.settings.openHours?.start || '10:00'} a ${businessContext.settings.openHours?.end || '20:00'}\n`;
                    contextStr += `Días cerrados: ${businessContext.settings.closedDays.join(', ')} (0=Domingo, 1=Lunes...)\n`;
                }
                if (businessContext.services) {
                    contextStr += `Servicios: ${businessContext.services.map(s => `${s.name} (${s.duration}min, ${s.price}€)`).join(', ')}\n`;
                }
                if (businessContext.team) {
                    contextStr += `Profesionales:\n`;
                    businessContext.team.forEach(t => {
                        const dl = t.diasLibres || [];
                        const pa = t.pausaAlmuerzo || {start:'-', end:'-'};
                        contextStr += `- ${t.name} (${t.role}): Días libres ${dl.join(',')}, Almuerzo ${pa.start}-${pa.end}. Especialidades: ${(t.specialties||[]).join(', ')}\n`;
                    });
                }
                systemInstructionText += contextStr;
            }
            
            // Declaración de herramientas de Function Calling
            tools = [{
                function_declarations: [
                    {
                        name: "addAppointment",
                        description: "Crea o agenda una nueva cita en el sistema de reservas del salón. Usa esta herramienta SÓLO cuando ya tienes todos los datos del cliente.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                clientQuery: {
                                    type: "STRING",
                                    description: "El nombre del cliente que hace la reserva."
                                },
                                date: {
                                    type: "STRING",
                                    description: "La fecha de la cita en formato YYYY-MM-DD o lenguaje natural (ej. 'Hoy', 'Mañana')."
                                },
                                time: {
                                    type: "STRING",
                                    description: "La hora de la cita en formato HH:MM."
                                },
                                prof: {
                                    type: "STRING",
                                    description: "El nombre del profesional con el que se agenda la cita (ej. Laura Gómez)."
                                },
                                service: {
                                    type: "STRING",
                                    description: "El servicio que desea el cliente (ej. Corte, Tinte, Manicura)."
                                },
                                notes: {
                                    type: "STRING",
                                    description: "Cualquier nota adicional del cliente."
                                }
                            },
                            required: ["clientQuery", "date", "time", "prof", "service"]
                        }
                    }
                ]
            }];
        }

        // Construir el payload de Gemini
        const requestBody = {
            system_instruction: {
                parts: [{ text: systemInstructionText }]
            },
            contents: history // Usamos el historial completo que nos envía el frontend
        };

        // Añadir tools solo si hay alguna definida
        if (tools.length > 0) {
            requestBody.tools = tools;
        }

        const googleResponse = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!googleResponse.ok) {
            if (googleResponse.status === 429) {
                console.warn("Límite de tokens de Gemini excedido (Status 429).");
                return res.status(200).json({ 
                    reply: "Mis servidores están un poco saturados en este momento. Por favor, inténtalo de nuevo en unos minutos." 
                });
            }
            throw new Error(`Error de la API de Google Gemini: ${googleResponse.status}`);
        }

        const data = await googleResponse.json();
        
        // Comprobar si Gemini quiere llamar a una herramienta (Function Calling)
        const part = data.candidates[0].content.parts[0];
        
        if (part.functionCall) {
            // Devolvemos el control al frontend para que ejecute la acción real
            return res.status(200).json({ 
                type: 'functionCall',
                name: part.functionCall.name,
                args: part.functionCall.args
            });
        }

        // Si es texto normal, lo devolvemos
        const botReply = part.text;
        return res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error("Error procesando la solicitud en el servidor:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
