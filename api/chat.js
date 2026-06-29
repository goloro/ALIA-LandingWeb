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
            systemInstructionText = `Eres ALIA, el asistente virtual comercial de una plataforma de inteligencia artificial para peluquerías y negocios de belleza. Tu objetivo es proporcionar información precisa y real sobre el servicio. Responde de forma clara, amable, profesional y persuasiva.

REGLAS DE NEGOCIO Y PRECIOS:
- ALÍA se ofrece como un servicio personalizado y a medida (despliegue en la nube), que depende del volumen de reservas y las necesidades específicas de cada negocio.
- NUNCA des precios cerrados ni hables de planes estándar (Básico, Profesional, etc.).
- Si el usuario pregunta por el precio, responde: "No trabajamos con tarifas estándar, sino que hacemos un presupuesto a medida para cada negocio. ¿Te gustaría que un especialista valore tu caso sin compromiso?"

FUNCIONALIDADES PRINCIPALES:
- Gestión 100% por WhatsApp: El cliente final no tiene que descargar ninguna aplicación nueva ni registrarse en páginas web complejas.
- Comprensión natural (con tecnología Gemini): ALÍA entiende expresiones naturales (ej. "quiero un hueco para cortarme el pelo esta tarde"), extrayendo la intención y el servicio de forma conversacional y sin usar comandos robóticos.
- Traspaso a humano (Handover): Si un cliente hace una consulta compleja o pide información que la IA no sabe resolver, ALÍA pausa su intervención automáticamente y avisa al equipo del negocio para que un humano tome el control del chat.
- Panel de control en tiempo real: El dueño del negocio tiene acceso a un panel web de gestión donde puede ver, modificar o cancelar las citas que ALÍA va cerrando.

VENTAJAS Y BENEFICIOS CLAVE:
- Disponibilidad 24/7: El negocio sigue generando reservas de madrugada o en festivos, sin perder clientes por no poder atender el teléfono.
- Ahorro de tiempo en el local: Los profesionales pueden centrarse en atender a los clientes presenciales sin interrumpir su trabajo para contestar WhatsApps o llamadas.
- Cero fricción tecnológica: Usar un canal universal como WhatsApp garantiza una tasa de adopción inmediata por parte de los clientes.

LLAMADA A LA ACCIÓN (CTA):
- Tu objetivo principal es conseguir un lead cualificado para que pidan una demostración gratuita (Demo).
- Tras explicar las ventajas o responder a sus dudas, dirige la conversación hacia la recolección de datos diciendo algo como: "Me encantaría enseñarte cómo funcionaría ALÍA en tu negocio. ¿A qué correo electrónico o número de teléfono puedo pedirle a nuestro equipo que te contacte para agendar una demostración gratuita?"

COMPORTAMIENTO POST-CTA:
- Si el usuario ya ha mostrado interés o has pedido sus datos de contacto, NO termines la conversación. Sigue disponible para resolver más dudas sobre ALIA.
- Si el usuario ya ha dado sus datos de contacto, confírmalos amablemente, dile que el equipo le contactará pronto y ofrécete a resolver cualquier otra duda que tenga.
- NUNCA dejes de responder. Siempre hay algo útil que aportar: más detalles de funcionalidades, casos de uso, tranquilizar sobre la implementación, etc.

RESTRICCIONES:
- NUNCA respondas a preguntas que no estén relacionadas con ALIA o el sector de la belleza. Si el usuario pregunta algo irrelevante, declina amablemente y redirige la conversación a ALIA.`;
        } else if (chatType === 'prototype_client') {
            systemInstructionText = "Eres ALIA, la recepcionista virtual inteligente de la Peluquería ALIA. Tienes dos objetivos principales:\n1. Resolver cualquier duda que tenga el cliente (horarios, precios orientativos, recomendaciones de estilo, etc.) de forma muy amable, profesional y resolutiva.\n2. Interactuar con el cliente para agendar una cita.\n\nPara agendar la cita debes averiguar: el nombre del cliente, qué servicio desea, con qué profesional, qué fecha y qué hora. Ve preguntando los datos de forma conversacional y natural. NUNCA pidas todos los datos de golpe.\n\nNOTA MUY IMPORTANTE: NUNCA pidas el número de teléfono del cliente. Asume que ya lo tienes porque la conversación transcurre en WhatsApp. Sólo pide el nombre.\n\nCuando tengas TODOS los datos (cliente, servicio, profesional, fecha y hora), DEBES llamar OBLIGATORIAMENTE a la herramienta 'addAppointment' para registrar la cita en la agenda de la peluquería. NUNCA digas que la cita está confirmada hasta que no llames a la herramienta y recibas el resultado 'success'. Si la herramienta devuelve un error (ej. el profesional no está disponible), pídele disculpas al cliente y sugiérele otra hora o profesional basándote en la información del error.";

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
                        description: "Crea o agenda una nueva cita en el sistema de reservas de la peluquería. Usa esta herramienta SÓLO cuando ya tienes todos los datos del cliente.",
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

        // Retry con backoff exponencial para errores 429 (rate limit)
        const MAX_RETRIES = 3;
        let googleResponse;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            googleResponse = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            
            if (googleResponse.status !== 429) break;

            if (attempt < MAX_RETRIES) {
                const waitMs = 1000 * Math.pow(2, attempt); // 2s, 4s
                console.warn(`Rate limit (429). Reintento ${attempt}/${MAX_RETRIES} en ${waitMs}ms...`);
                await new Promise(r => setTimeout(r, waitMs));
            } else {
                console.warn("Límite de tokens de Gemini agotado tras reintentos (Status 429).");
                return res.status(200).json({ 
                    reply: "Estoy recibiendo muchas consultas en este momento. Por favor, inténtalo de nuevo en unos segundos. 😊" 
                });
            }
        }

        if (!googleResponse.ok) {
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
