const fs = require('fs');
const path = 'HTML/prototipo.html';
let content = fs.readFileSync(path, 'utf8');

function replaceBetween(startStr, endStr, newContent) {
    const startIndex = content.indexOf(startStr);
    if (startIndex === -1) return;
    const endIndex = content.indexOf(endStr, startIndex + startStr.length);
    if (endIndex === -1) return;
    content = content.substring(0, startIndex + startStr.length) + '\n' + newContent + '\n' + content.substring(endIndex);
}

// 4. Chat list
replaceBetween('<div class="cs-list">', '</div>\n                            </div>\n\n                            <!-- Main Chat Area -->', `
                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #94a3b8; text-align: center; padding: 20px;">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.5;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                    <span style="font-size: 0.9rem;">No hay conversaciones activas</span>
                                </div>
`);

// 5. Chat messages
replaceBetween('<div class="chat-messages">', '<div class="chat-input-container">', `
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #94a3b8;">
                                        Selecciona una conversación para empezar a chatear
                                    </div>
                                `);

// 6. Soporte Tickets
replaceBetween('<div class="ticket-list">', '</div>\n\n                                <button class="btn-outline" style="width: 100%; margin-top: 16px;">Ver Todos los Tickets</button>', `
                                    <div style="text-align: center; padding: 40px 0; color: #64748b; font-size: 0.9rem;">
                                        No tienes tickets de soporte recientes.
                                    </div>
`);

// 7. Inputs
content = content.replace(/value="ALIA Beauty Studio"/g, 'value=""');
content = content.replace(/value="Calle Falsa 123, 28080 Madrid"/g, 'value=""');
content = content.replace(/value="https:\/\/alia-beauty\.com"/g, 'value=""');
content = content.replace(/value="hola@alia-beauty\.com"/g, 'value=""');
content = content.replace(/value="ALIA BEAUTY SL"/g, 'value=""');
content = content.replace(/value="ES12345678"/g, 'value=""');
content = content.replace(/value="Jesús Pérez"/g, 'value=""');
content = content.replace(/value="jesus.perez@aliabeauty\.com"/g, 'value=""');
content = content.replace(/value="\+34 600 123 456"/g, 'value=""');
content = content.replace(/value="Jesús"/g, 'value=""');

// 8. Recordatorios
const recStart = '<div class="pn-subheader" style="margin-top: 40px;">Configuraci';
const recEnd = '<button class="pn-btn-add-outline" style="margin-top: 16px;">';
replaceBetween(recStart, recEnd, `ón de Recordatorios</div>
                                        <div style="text-align: center; padding: 32px; border: 1px dashed #e2e8f0; border-radius: 12px; margin-top: 16px; color: #94a3b8; margin-bottom: 24px;">
                                            No hay recordatorios configurados. Añade uno para que tus clientes no olviden su cita.
                                        </div>
                                        `);

// 9. Agenda Panel Derecho
replaceBetween('<div class="next-appt-panel">', '<div class="next-appt-history">', `
                                    <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        <div style="font-size: 1rem; font-weight: 500; color: #64748b;">No hay citas seleccionadas</div>
                                        <div style="font-size: 0.875rem; margin-top: 8px;">Selecciona una cita en el calendario para ver los detalles del cliente y los servicios.</div>
                                    </div>
                                </div>
                                <div style="display: none;">
                                `);
// This effectively hides the rest of the next-appt-panel until its end, wait, no that's dangerous. Let's just do a simpler replace.

fs.writeFileSync(path, content, 'utf8');
console.log('Rest of empty states done.');
