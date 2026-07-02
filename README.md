# ALIA - Landing & Prototipo Web / Landing & Web Prototype

*🇪🇸 Español abajo | 🇬🇧 English below*

---

## 🇬🇧 English Version

![ALIA Logo](Images/Logos/LogoHexagonoAlia-SinFondo.png)

ALIA is an innovative platform aimed at intelligent management and virtual reception (AI) for businesses. This repository contains both the public **Landing Page** and a **Functional Prototype** that simulates the desktop environment of the internal management dashboard (Business Portal).

### 🏗 Project Architecture

The project is built following a **Vanilla SPA (Single Page Application)** pattern using exclusively **HTML5, CSS3, and pure JavaScript**, without heavy external frameworks.

**Key Features:**
1. **Clean and Modular Code:** There are no inline styles (`style="..."`). All styling is managed through specific CSS files and a utility-first class system (Atomic CSS) in `prototipo.css`.
2. **Data Decoupling:** The HTML is structurally designed with empty containers and unique identifiers (`id`). All dynamic information (clients, metrics, appointments) is injected via JavaScript interacting with JSON files or a future API.
3. **Fluid Navigation:** The prototype simulates a complete SPA. Using `data-target` attributes in the sidebar navigation, the JavaScript (`prototipo.js`) instantly toggles active views without reloading the page.

### 📁 Directory Structure

```text
ALIA-LandingWeb/
├── HTML/                   # Main views (prototipo.html)
├── CSS/                    # Stylesheets
│   ├── LandingPage/        # Landing page specific styles
│   ├── Prototipo/          # Internal portal styles and atomic utilities
│   └── Responsive/         # Media queries
├── JS/                     # Application logic
│   ├── API/                # Simulated chat and AI connections
│   ├── Hero/               # Hero animation logic
│   └── Prototipo/          # View controllers (dashboard, agenda, clients)
├── Data/                   # Simulated databases (.json)
├── Docs/                   # Technical documentation
├── Images/                 # Graphic assets
└── index.html              # Landing page (Root)
```

### 📚 Technical Documentation

To extend or connect this project to a production environment (Backend/API), please review the official documentation hosted in the `Docs/` folder:

- [**Developer Guide**](Docs/Developer_Guide_EN.md): Mandatory reading before injecting real data or modifying the interface. Explains how to use the injection points (`id`) in the HTML and the strict CSS conventions.
- [**Code Architecture Documentation**](Docs/Code_Architecture_Documentation_EN.md): Details the modular philosophy of the code, separation of concerns, and scalability guidelines.

### 🚀 How to run locally

Since it's a Vanilla architecture, it doesn't require complex build processes:
1. Clone the repository.
2. Open the root folder in your favorite editor (e.g., VS Code).
3. Use the **Live Server** extension (or spin up a basic HTTP server) from `index.html`.
4. The prototype is optimized exclusively for desktop screens (if you try to open it on a mobile device, it will show a preventive block screen).

### 📌 Pending Tasks / Roadmap

- **Real Backend Connection:** Replace the internal `JS/mock-api.js` engine with real HTTP endpoints.
- **Settings & Preferences > Accessibility:** The accessibility options section (text size, high contrast, etc.) has been temporarily removed from the initial prototype due to complexity and is pending development in future versions.

---

## 🇪🇸 Versión en Español

![ALIA Logo](Images/Logos/LogoHexagonoAlia-SinFondo.png)

ALIA es una plataforma innovadora orientada a la gestión inteligente y recepción virtual (IA) para negocios. Este repositorio contiene tanto la **Landing Page** de presentación pública como un **Prototipo Funcional** que simula el entorno de escritorio del panel de gestión interno (Portal del Negocio).

### 🏗 Arquitectura del Proyecto

El proyecto está construido siguiendo un patrón **Vanilla SPA (Single Page Application)** utilizando exclusivamente **HTML5, CSS3 y JavaScript puro**, sin frameworks externos pesados. 

**Características Principales:**
1. **Código Limpio y Modular:** No existen estilos en línea (`style="..."`). Todo el diseño se gestiona a través de archivos CSS específicos y un sistema de clases utilitarias (Atomic CSS) en `prototipo.css`.
2. **Desacoplamiento de Datos:** El HTML está diseñado estructuralmente con contenedores vacíos e identificadores únicos (`id`). Toda la información dinámica (clientes, métricas, citas) es inyectada mediante JavaScript interactuando con archivos JSON o una futura API.
3. **Navegación Fluida:** El prototipo simula una SPA completa. Mediante atributos `data-target` en la navegación lateral, el JavaScript (`prototipo.js`) alterna las vistas activas instantáneamente sin recargar la página.

### 📁 Estructura de Directorios

```text
ALIA-LandingWeb/
├── HTML/                   # Vistas principales (prototipo.html)
├── CSS/                    # Hojas de estilo
│   ├── LandingPage/        # Estilos específicos de la landing
│   ├── Prototipo/          # Estilos del portal interno y utilidades atómicas
│   └── Responsive/         # Media queries
├── JS/                     # Lógica de la aplicación
│   ├── API/                # Conexiones simuladas de chat e IA
│   ├── Hero/               # Lógica de animaciones de la portada
│   └── Prototipo/          # Controladores de las vistas (dashboard, agenda, clientes)
├── Data/                   # Bases de datos simuladas (.json)
├── Docs/                   # Documentación técnica
├── Images/                 # Assets gráficos
└── index.html              # Landing page (Raíz)
```

### 📚 Documentación Técnica

Para extender o conectar este proyecto a un entorno de producción (Backend/API), por favor revisa la documentación oficial alojada en la carpeta `Docs/`:

- [**Guía para Desarrolladores (Developer Guide)**](Docs/Developer_Guide_ES.md): Lectura obligatoria antes de inyectar datos reales o modificar la interfaz. Explica cómo utilizar los puntos de inyección (`id`) en el HTML y las convenciones estrictas de CSS.
- [**Documentación de Arquitectura**](Docs/Code_Architecture_Documentation_ES.md): Detalla la filosofía modular del código, la separación de responsabilidades y las guías de escalabilidad.

### 🚀 Cómo ejecutar en local

Al tratarse de una arquitectura Vanilla, no requiere procesos de build complejos:
1. Clona el repositorio.
2. Abre la carpeta raíz en tu editor favorito (ej. VS Code).
3. Utiliza la extensión **Live Server** (o levanta un servidor HTTP básico) desde `index.html`.
4. El prototipo está optimizado exclusivamente para pantallas de escritorio (al intentar abrirlo en móvil, mostrará una pantalla de bloqueo preventivo).

### 📌 Tareas Pendientes / Roadmap

- **Conexión Backend Real:** Reemplazar el motor interno de `JS/mock-api.js` por endpoints HTTP reales.
- **Ajustes y Preferencias > Accesibilidad:** La sección de opciones de accesibilidad (tamaño de texto, alto contraste, etc.) se ha eliminado temporalmente del prototipo inicial por complejidad y queda pendiente para su desarrollo en versiones futuras.
