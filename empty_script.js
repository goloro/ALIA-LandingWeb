const fs = require('fs');
const path = 'HTML/prototipo.html';
let content = fs.readFileSync(path, 'utf8');

// Helper to replace content between two strings
function replaceBetween(startStr, endStr, newContent) {
    const startIndex = content.indexOf(startStr);
    if (startIndex === -1) return;
    const endIndex = content.indexOf(endStr, startIndex + startStr.length);
    if (endIndex === -1) return;
    content = content.substring(0, startIndex + startStr.length) + '\n' + newContent + '\n' + content.substring(endIndex);
}

// 1. Clientes Table
replaceBetween('<table class="clientes-table">', '</table>', `
                                        <thead>
                                            <tr>
                                                <th>NOMBRE</th>
                                                <th>TELÉFONO</th>
                                                <th>ÚLTIMA CITA</th>
                                                <th>TOTAL DE CITAS</th>
                                                <th class="th-actions">
                                                    <button class="btn-nuevo-cliente">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                                        Nuevo Cliente
                                                    </button>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colspan="5" style="text-align: center; padding: 48px 0; color: #64748b;">
                                                    <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                        <span style="font-size: 1rem; font-weight: 500;">No hay clientes registrados</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                        `);

// 2. Mi Equipo Table
replaceBetween('<table class="equipo-table">', '</table>', `
                                    <thead>
                                        <tr>
                                            <th>MIEMBRO DEL EQUIPO</th>
                                            <th>ESPECIALIDAD</th>
                                            <th>ESTADO</th>
                                            <th style="width: 40px;"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="4" style="text-align: center; padding: 48px 0; color: #64748b;">
                                                <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                    <span style="font-size: 1rem; font-weight: 500;">No hay miembros de equipo registrados</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    `);

// 3. Disponibilidad Table
replaceBetween('<table class="disp-table">', '</table>', `
                                                <thead>
                                                    <tr>
                                                        <th>PROFESIONAL</th>
                                                        <th>TIPO</th>
                                                        <th>FECHAS</th>
                                                        <th>ESTADO</th>
                                                        <th>ACCIONES</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td colspan="5" style="text-align: center; padding: 48px 0; color: #64748b;">
                                                            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                                <span style="font-size: 1rem; font-weight: 500;">No hay solicitudes de ausencia</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                                `);

fs.writeFileSync(path, content, 'utf8');
console.log('Tables emptied.');
