const fs = require('fs');
const path = 'HTML/prototipo.html';
let content = fs.readFileSync(path, 'utf8');

function replaceBetween(startStr, endStr, newContent) {
    const startIndex = content.indexOf(startStr);
    if (startIndex === -1) {
        console.log("Start not found:", startStr.substring(0, 30));
        return;
    }
    const endIndex = content.indexOf(endStr, startIndex + startStr.length);
    if (endIndex === -1) {
        console.log("End not found:", endStr.substring(0, 30));
        return;
    }
    content = content.substring(0, startIndex + startStr.length) + '\n' + newContent + '\n' + content.substring(endIndex);
}

// 1. Filters
replaceBetween('<div class="agenda-prof-filters">', '</div>', `
                                            <button class="prof-filter-btn active">Todos</button>
                                            <button class="prof-filter-btn">Mi Agenda</button>
                                        `);

// 2. Headers
replaceBetween('<div class="agenda-prof-headers-wrapper" style="display: contents;">', '</div>', `
                                                <div class="agenda-prof-header">
                                                    <img src="../Images/Logos/LogoPeluqueríaNegro.png" alt="Mi Agenda" class="prof-avatar">
                                                    <span class="prof-name">Mi Agenda</span>
                                                </div>
                                            `);

// 3. Cols wrapper
replaceBetween('<div class="agenda-prof-cols-wrapper">', '</div>\n                                        </div>\n                                    </div>\n<!-- Month View Grid -->', `
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
