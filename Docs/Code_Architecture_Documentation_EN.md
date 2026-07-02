# Code Architecture Documentation (Frontend)

This document outlines the structure, files, and modular architecture of the ALIA code. The project is designed as a **Vanilla Web App**, which means it uses modern HTML5, CSS3, and JS without relying on heavy frameworks, ensuring maximum speed and customization.

---

## 1. Directory Structure

The folder structure follows a Separation of Concerns pattern:

- `/HTML/`: Contains the base files for structural rendering.
- `/CSS/`: The entire visual design system (UI/UX).
- `/JS/`: The interaction layer, business logic, and DOM manipulation.
- `/Images/`: Static assets and logos.
- `/Data/`: JSON files or configurations acting as database mocks in the prototype.

---

## 2. HTML Components (Structure Layer)

Instead of having everything in a giant, chaotic file, the main HTML (`prototipo.html`) is designed in injectable containers or "View Modules":

### 2.1 Global Navigation Modules
- **Sidebar (`.portal-sidebar`)**: Controls the persistent side menu. It works by injecting state via `data-target` through JS.
- **Topbar (`.portal-topbar`)**: Top bar. Contains the global search, notifications, and the universal "New Appointment" button.

### 2.2 Dynamic Sections (SPA - Single Page App)
The `<div class="portal-page-content">` container works as the frontend router. Its "views" are modular components (`<div class="page-section">`):
- `page-dashboard`: Initial metric cards and global overview.
- `page-agenda-semanal`: The interactive block calendar.
- `page-clientes`: User database table (optimized for responsiveness).
- `page-chats`: AI inbox and chat module.
- `page-disponibilidad`: Schedule configuration and visual absence panel.
- `page-ajustes`: (Nested modules like My Account and Business Portal).

---

## 3. CSS Components (Presentation Layer)

The CSS is heavily fractionated (Object-Oriented CSS methodology / OOCSS), allowing multiple files to inherit global rules without overwriting each other:

### 3.1 Global CSS
- `LandingPage/global.css`: Defines the **System Variables** (Colors, Typographies, Roots) and atomic components (`.btn`, `.btn-primary`).
- `Prototipo/layout.css`: Defines the portal's skeleton (High-level CSS Grid and Flexbox).
- `Responsive/prototipo-responsive.css`: *Media Queries* adapting all components to tablets and mobiles.
- `Prototipo/prototipo.css`: Contains the entire **Utility Class System (Atomic CSS)** used to suppress inline styles, as well as modal routing.

### 3.2 Independent CSS Modules
Each "View" has its own CSS file so code editing is isolated:
- `dashboard.css`: Styles for `.metric-card` and `.chart-card`.
- `agenda.css`: Calendar logic, day columns, and appointment cards.
- `clientes.css`: Dynamic database table and pagination.
- `chats.css`, `disponibilidad.css`, `mi-equipo.css`, etc.

---

## 4. JS Components (Logic Layer)

The main JavaScript resides in `/JS/prototipo.js` (and satellite modules like `disponibilidad.js`). It acts as the controller for the UI components.

### 4.1 Virtual Router
The JS listens to `nav-item` clicks on the Sidebar. Upon click:
1. It reads the `data-target` attribute.
2. Hides all `.page-section` elements by iterating over them and removing the `.active` class.
3. Shows exclusively the container associated with the `data-target`.
> This simulates an ultra-fast Single Page Application (SPA) without reloading.

### 4.2 Modals Engine
All overlay views (Client Details, New Appointment, New Absence) are controlled by a unified pattern:
- **`openModal()` / `closeModal()`**: Dynamically modify the `.active` class of the `.modal-backdrop` and panel, allowing a smooth CSS transition.

### 4.3 Dynamic Generation and Simulators (Mocks)
Simulation engines have been created for the prototype:
- **Chat Engine (`sendMessage`)**: Reads the DOM, sanitizes user inputs (basic XSS protection), and generates HTML nodes in real-time.
- **Dynamic Dates**: The native browser `new Date()` object is captured to populate calendars and the Dashboard with the user's current date.

---

## 5. Practical Reuse (How to use)

Thanks to this architecture, creating a new component in the platform is as simple as:
1. Creating the HTML wrapping it in one of the global atomic classes (e.g., `<div class="disp-card">...</div>`).
2. Isolating any highly specific styles in a new CSS file (e.g., `my-reports.css`). **Note**: Inline styles (`style="..."`) are strictly forbidden. Use the utility classes from `prototipo.css`.
3. Registering the tab in the `sidebar` giving it a `data-target="page-mis-reportes"`. The JS navigation system will automatically embrace it without writing additional logic!
4. To integrate Backend data, map the empty elements (ID injection). Check the [Developer Guide](Developer_Guide_EN.md) for more technical integration details.
