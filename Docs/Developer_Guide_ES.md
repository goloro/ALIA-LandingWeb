# Guía para Desarrolladores (Developer Guide)

Bienvenido a la guía técnica de integración de ALIA. Este documento está diseñado para los desarrolladores (Frontend y Backend) responsables de integrar los datos dinámicos y escalar las vistas de la aplicación, siguiendo las reglas y refactorizaciones recientes del proyecto.

---

## 1. Integración de Datos Dinámicos (Inyección por ID)

El proyecto HTML fue refactorizado para eliminar todos los "datos quemados" (hardcoded mock data). Para garantizar una integración limpia con la API o las fuentes de datos (JSON), sigue esta arquitectura:

### 1.1 Etiquetas `<span>` e `Inputs` Vacíos
Cualquier dato dinámico en las vistas, especialmente en el Portal del Negocio (e.g. `HTML/prototipo.html`), ha sido envuelto o reemplazado por elementos vacíos con atributos `id` únicos.

**Ejemplo de uso en HTML:**
```html
<div class="metric-value" id="db-ingresos-value"><span></span></div>
<h2 class="cd-name" id="cd-client-name"></h2>
```

**Ejemplo de inyección desde JS:**
```javascript
// Evita sobrescribir estructuras internas
document.getElementById('db-ingresos-value').querySelector('span').textContent = '$1,200';
document.getElementById('cd-client-name').textContent = clienteData.nombre;
```

### 1.2 Listas y Tablas
Los contenedores que renderizan listas dinámicas (como historiales de citas, notificaciones o la base de datos de clientes) han sido vaciados intencionalmente en el HTML para prevenir contenido duplicado.

El JS debe apuntar al ID del contenedor padre e inyectar el HTML correspondiente:
```html
<!-- HTML Base -->
<div class="history-timeline" id="cd-history-timeline">
    <!-- El JS inyecta <div class="history-item">...</div> iterando los datos -->
</div>
```

---

## 2. Convenciones de CSS y UI

### 2.1 Prohibición Estricta de CSS Inline
Queda **estrictamente prohibido** el uso del atributo `style="..."` en las etiquetas HTML. Todo el diseño debe resolverse mediante el sistema de clases atómicas/utilitarias. 

**Incorrecto:**
```html
<div style="margin-top: 16px; padding: 10px; text-align: center; color: #94a3b8;">Texto</div>
```

**Correcto:**
```html
<div class="mt-16 text-center text-slate-400 p-10">Texto</div>
```
*(Nota: Hemos extraído múltiples clases utilitarias durante la limpieza. Revisa `prototipo.css` sección `SISTEMA DE CLASES UTILITARIAS (ATOMIC CSS)` antes de crear una clase nueva).*

### 2.2 Sistema de Modales y Vistas
El proyecto utiliza un sistema de SPA virtual, lo que significa que el HTML no recarga.
- **Ruteo de Vistas:** El JS (principalmente `prototipo.js`) alterna la visibilidad de los contenedores `.page-section` añadiendo o quitando la clase `.active`.
- **Navegación:** Cualquier botón del menú debe llevar el atributo `data-target="id-de-la-vista"` para que el router lo registre automáticamente.

---

## 3. Próximos Pasos para Backend
1. **Mapeo de IDs:** Revisa `index.html` y `prototipo.html`. Todos los IDs prefijados con `db-` (Dashboard), `cd-` (Client Details) o `pn-` (Portal Negocio) son tus anclas de inyección de datos.
2. **Endpoints:** Crea un motor JS intermedio (e.g. `api-service.js`) que capture estos IDs y vuelque las respuestas JSON de tu backend en ellos.
3. **Manejo de Estados Vacíos:** Muchos contenedores tienen una clase `.empty-state-container`. El JS debe remover esta clase y rellenar la tabla/lista una vez los datos se hayan traído exitosamente del backend.
