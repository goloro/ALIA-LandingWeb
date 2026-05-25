const fs = require('fs');
const path = 'HTML/prototipo.html';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

const replacement = `                                            <div class="agenda-prof-headers-wrapper" style="display: contents;">
                                                <div class="agenda-prof-header">
                                                    <img src="../Images/Logos/LogoPeluqueríaNegro.png" alt="Mi Agenda" class="prof-avatar">
                                                    <span class="prof-name">Mi Agenda</span>
                                                </div>
                                            </div>

                                            <div class="agenda-week-headers-wrapper" style="display: none;">
                                                <div class="agenda-week-header active">
                                                    <span class="day-name">LUNES</span>
                                                    <span class="day-num">20</span>
                                                </div>
                                                <div class="agenda-week-header">
                                                    <span class="day-name">MARTES</span>
                                                    <span class="day-num">21</span>
                                                </div>
                                                <div class="agenda-week-header">
                                                    <span class="day-name">MIÉRCOLES</span>
                                                    <span class="day-num">22</span>
                                                </div>
                                                <div class="agenda-week-header">
                                                    <span class="day-name">JUEVES</span>
                                                    <span class="day-num">23</span>
                                                </div>
                                                <div class="agenda-week-header">
                                                    <span class="day-name">VIERNES</span>
                                                    <span class="day-num">24</span>
                                                </div>
                                                <div class="agenda-week-header">
                                                    <span class="day-name">SÁBADO</span>
                                                    <span class="day-num">25</span>
                                                </div>
                                                <div class="agenda-week-header">
                                                    <span class="day-name">DOMINGO</span>
                                                    <span class="day-num">26</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="agenda-grid-body">`;

// lines 313 to 318 are indices 312 to 317
// Let's replace them
lines.splice(312, 6, replacement);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed headers wrapper!');
