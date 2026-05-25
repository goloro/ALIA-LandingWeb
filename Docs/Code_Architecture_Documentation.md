# Documentación de Arquitectura del Código (Frontend)

Este documento expone la estructura, los archivos y la arquitectura modular del código de ALIA. El proyecto está diseñado como un **Vanilla Web App**, lo que significa que utiliza HTML5, CSS3 y JS moderno sin depender de frameworks pesados, garantizando máxima velocidad y personalización.

---

## 1. Estructura de Directorios

La estructura de carpetas sigue un patrón de separación de preocupaciones (Separation of Concerns):

- `/HTML/`: Contiene los archivos base de renderizado estructural.
- `/CSS/`: Todo el sistema de diseño visual (UI/UX).
- `/JS/`: La capa de interacción, lógica de negocio y manipulación del DOM.
- `/Images/`: Assets estáticos y logos.
- `/Data/`: Archivos JSON o configuraciones que actúan como mocks de base de datos en el prototipo.

---

## 2. Componentes HTML (Capa de Estructura)

En lugar de tener todo en un archivo gigante y caótico, el HTML principal (`prototipo.html`) está diseñado en contenedores inyectables o "Módulos de Vista":

### 2.1 Módulos de Navegación Global
- **Sidebar (`.portal-sidebar`)**: Controla el menú lateral persistente. Funciona por inyección de estado de `data-target` a través del JS.
- **Topbar (`.portal-topbar`)**: Barra superior. Contiene el buscador global, notificaciones y el botón universal de "Nueva Cita".

### 2.2 Secciones Dinámicas (SPA - Single Page App)
El contenedor `<div class="portal-page-content">` funciona como el router del frontend. Sus "vistas" son componentes modulares (`<div class="page-section">`):
- `page-dashboard`: Tarjetas de métricas iniciales y visión global.
- `page-agenda-semanal`: El calendario de bloque interactivo.
- `page-clientes`: La tabla de base de datos de usuarios (optimizada para responsive).
- `page-chats`: Módulo de inbox y chat de la IA.
- `page-disponibilidad`: Configuración de horarios y panel visual de asusencias.
- `page-ajustes`: (Módulos anidados como Mi Cuenta y Portal de Negocio).

---

## 3. Componentes CSS (Capa de Presentación)

El CSS está fuertemente fraccionado (Metodología orientada a objetos / OOCSS), lo que permite que varios archivos hereden reglas globales sin sobreescribirse:

### 3.1 CSS Globales
- `LandingPage/global.css`: Define las **Variables de Sistema** (Colors, Typographies, Roots) y los componentes atómicos (`.btn`, `.btn-primary`).
- `Prototipo/layout.css`: Define el esqueleto del portal (CSS Grid y Flexbox de alto nivel).
- `Responsive/prototipo-responsive.css`: Los *Media Queries* que adaptan todos los componentes a tablets y móviles.

### 3.2 Módulos CSS Independientes
Cada "Vista" tiene su propio archivo CSS para que la edición de código esté aislada:
- `dashboard.css`: Estilos de las `.metric-card` y `.chart-card`.
- `agenda.css`: Lógica del calendario, columnas de días y tarjetas de cita.
- `clientes.css`: Tabla dinámica de base de datos y paginación.
- `chats.css`, `disponibilidad.css`, `mi-equipo.css`, etc.

---

## 4. Componentes JS (Capa Lógica)

El JavaScript principal reside en `/JS/prototipo.js` (y modulos satélite como `disponibilidad.js`). Actúa como el controlador de los componentes de la interfaz.

### 4.1 Enrutador Virtual (Virtual Router)
El JS escucha los `nav-item` en el Sidebar. Al hacer click:
1. Lee el atributo `data-target`.
2. Oculta todos los `.page-section` iterando sobre ellos y removiendo la clase `.active`.
3. Muestra exclusivamente el contenedor asociado al `data-target`.
> Esto simula una aplicación web de página única (SPA) ultra rápida sin recargas.

### 4.2 Lógica de Modales (Modals Engine)
Todas las vistas superpuestas (Detalles de Cliente, Nueva Cita, Nueva Ausencia) están controladas por un patrón unificado:
- **`openModal()` / `closeModal()`**: Modifican dinámicamente la clase `.active` del `.modal-backdrop` y del panel, permitiendo una transición CSS suave.

### 4.3 Generación Dinámica y Simuladores
Para el prototipo se han creado motores de simulación (mocks):
- **Motor de Chats (`sendMessage`)**: Lee el DOM, sanitiza las entradas del usuario (protección XSS básica) y genera nodos HTML en tiempo real.
- **Fechas Dinámicas**: Se captura el objeto `new Date()` nativo del navegador para rellenar los calendarios y el Dashboard con la fecha actual del usuario.

---

## 5. Reutilización Práctica (Cómo usar)

Gracias a esta arquitectura, crear un nuevo componente en la plataforma es tan sencillo como:
1. Crear el HTML envolviéndolo en una de las clases atómicas globales (ej: `<div class="disp-card">...</div>`).
2. Aislar cualquier estilo súper específico en un nuevo archivo CSS (ej: `mis-reportes.css`).
3. Registrar la pestaña en el `sidebar` dándole un `data-target="page-mis-reportes"`. ¡El sistema de navegación JS lo acogerá automáticamente sin escribir lógica adicional!
