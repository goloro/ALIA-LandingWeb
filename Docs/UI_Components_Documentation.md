# ALIA - UI Kit & Components Documentation

Este documento detalla los componentes visuales interactivos construidos para la aplicación ALIA. Todo el código base (HTML, CSS y JS) ha sido modularizado para fomentar la reutilización de componentes sin la necesidad de un framework externo.

> [!TIP]
> **Metodología**: Busca siempre las clases genéricas de componentes (ej: `.btn-primary`, `.metric-card`, `.modal-overlay`) en lugar de sobreescribir estilos para mantener la consistencia visual y reducir el peso del CSS.

---

## 1. Botones (Buttons)

Los botones son los principales elementos de interacción. Existen varias jerarquías visuales dependiendo de la acción.

![Botón Principal](/./assets/primary_button_1779727081234.png)

### Primary Button
Botón de acción principal (crear cita, guardar cambios). 
**CSS Class**: `.btn-new-cita`, `.btn-primary`

```html
<!-- COMPONENT: Primary Button -->
<button class="btn-new-cita">
    <svg>...</svg>
    Nueva Cita
</button>
```

### Outline / Secondary Action
Botones para acciones secundarias o cancelación.
**CSS Class**: `.btn-outline`

```html
<!-- COMPONENT: Outline Button -->
<button class="btn-outline">VER DETALLES</button>
```

---

## 2. Tarjetas de Métricas (Metric Cards)

Utilizadas en los dashboards para mostrar estadísticas y KPIs en tiempo real de forma clara.

![Tarjeta de Métrica](/./assets/metric_card_1779727101146.png)

**CSS Classes principales**: `.metric-card`, `.metric-title`, `.metric-value`

```html
<!-- COMPONENT: Metric Card -->
<div class="metric-card">
    <div style="display: flex; justify-content: space-between;">
        <div class="metric-title">Nuevos Clientes</div>
        <div class="pill-green">+12%</div>
    </div>
    <div class="metric-value">24</div>
</div>
```

> [!NOTE]
> Las tarjetas están diseñadas con `flexbox` para adaptarse a cualquier grilla de métricas sin romper su estructura interna.

---

## 3. Modales y Paneles (Modals & Panels)

Se utilizan para mostrar información detallada sobre un cliente, cita o ajustes, bloqueando el fondo para enfocar la atención del usuario.

![Modal de Detalles](/./assets/modal_dialog_1779727117733.png)

**Estructura HTML Recomendada**:
Todo modal debe estar envuelto por un contenedor `*-backdrop` que oscurece el fondo.

```html
<!-- COMPONENT: Modal Dialog Overlay -->
<div class="client-details-backdrop active"></div>

<!-- COMPONENT: Modal Dialog Panel -->
<div class="client-details-panel active">
    <div class="cd-header">
        <h2>Detalles del Cliente</h2>
        <button class="btn-close-cd">Cerrar</button>
    </div>
    <div class="cd-body">
        <!-- Contenido del modal -->
    </div>
</div>
```

---

## 4. Estilos y Utilidades JS (Interacciones)

### Clases Utilitarias (Pills y Badges)
Para mostrar estados (Completado, Pendiente, No Show).
- `.badge-green` o `.pill-green` (Exito, completado)
- `.badge-pending` (Pendiente, informativo azul)
- `.badge-noshow` (Alerta, rojo)

### JS JSDoc Estandarizado
Todas las funciones JavaScript que controlan estos componentes visuales en `JS/prototipo/interacciones.js` incluyen ahora JSDoc para facilitar la lectura:

```javascript
/**
 * Abre el panel lateral derecho para un componente específico.
 * @param {string} panelId - El ID del DOM del panel a mostrar.
 * @param {string} backdropId - El ID del fondo oscurecido asociado al panel.
 */
function openPanel(panelId, backdropId) {
    document.getElementById(panelId).classList.add('active');
    document.getElementById(backdropId).classList.add('active');
}
```

> [!IMPORTANT]
> Si vas a crear un componente nuevo que no encaja en estas categorías, por favor añádelo a este archivo (`UI_Components_Documentation.md`) y asegúrate de crear la clase CSS equivalente de forma agnóstica para garantizar su reutilización futura.
