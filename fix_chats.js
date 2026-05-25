const fs = require('fs');
const path = 'HTML/prototipo.html';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

// Replace cs-list (lines 631-653 -> indices 630-652)
const csListReplacement = `                                        <div class="cs-list">
                                            <div style="padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 0.9rem;">
                                                No hay conversaciones recientes
                                            </div>
                                        </div>`;
lines.splice(630, 23, csListReplacement);

// Replace chats-main. Wait, since we spliced, the indices shifted!
// Old length of cs-list was 23 lines. New length is 6 lines.
// Shift = 23 - 6 = 17 lines removed.
// Old chats-main started at line 657 (index 656).
// New index = 656 - 17 = 639.
// Old chats-main ended at line 762 (index 761).
// New index end = 761 - 17 = 744.
// Number of lines to remove = 762 - 657 + 1 = 106 lines.

const chatsMainReplacement = `                                    <div class="chats-main" style="display: flex; align-items: center; justify-content: center; background-color: #f8fafc;">
                                        <div style="text-align: center; color: #94a3b8;">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.5;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                            <h3 style="font-size: 1.1rem; color: #64748b;">No hay chat seleccionado</h3>
                                            <p style="font-size: 0.9rem; margin-top: 8px;">Selecciona una conversación de la lista para leer los mensajes.</p>
                                        </div>
                                    </div>`;
lines.splice(639, 106, chatsMainReplacement);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed Chats empty state!');
