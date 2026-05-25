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

// 1. Remove professionals from filters
replaceBetween('<div class="agenda-prof-filters">', '</div>', `
                                            <button class="prof-filter-btn active">Todos</button>
                                            <button class="prof-filter-btn">Mi Agenda</button>
                                        `);

// 2. Remove professionals from headers (keep only one)
replaceBetween('<div class="agenda-prof-headers-wrapper" style="display: contents;">', '</div>', `
                                                <div class="agenda-prof-header">
                                                    <img src="../Images/Logos/LogoPeluqueríaNegro.png" alt="Mi Agenda" class="prof-avatar">
                                                    <span class="prof-name">Mi Agenda</span>
                                                </div>
                                            `);

// 3. Keep 1 bg-col for daily view, 7 for weekly (weekly are hidden by default)
replaceBetween('<div class="agenda-bg-grid">', '</div>', `
                                                    <div class="bg-col"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                `);

// 4. Remove all events and keep only 1 empty column
// We find where the columns start and end.
const colStart = '<!-- Eventos Jesús -->';
const colEnd = '<!-- Body -->'; // Wait, colEnd is after the columns. Let's see the end of the columns.
// Let's replace the whole agenda-prof-cols-wrapper contents.
replaceBetween('<div class="agenda-prof-cols-wrapper">', '</div>\n                                        </div>\n                                    </div>\n\n                                </div>\n\n                            </div>\n\n                            <!-- Diapositiva 4: Clientes -->', `
                                                <div class="agenda-bg-grid">
                                                    <div class="bg-col"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                    <div class="bg-col week-only" style="display: none;"></div>
                                                </div>
                                                
                                                <div class="agenda-prof-col">
                                                    <!-- Agenda vacía -->
                                                </div>
                                                `);
fs.writeFileSync(path, content, 'utf8');
console.log('Agenda cleared.');
