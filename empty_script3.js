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

const start = '<div class="team-list">';
const end = '</div>\n                                        \n                                        <button class="btn-outline">VER DETALLE DE EQUIPO</button>';

replaceBetween(start, end, `
                                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 0; color: #94a3b8; text-align: center;">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px; opacity: 0.5;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                <span style="font-size: 0.875rem;">No hay profesionales registrados</span>
                                            </div>
                                        `);

fs.writeFileSync(path, content, 'utf8');
console.log('Team list emptied.');
