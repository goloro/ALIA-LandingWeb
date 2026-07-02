# Developer Guide

Welcome to the technical integration guide for ALIA. This document is designed for developers (Frontend and Backend) responsible for integrating dynamic data and scaling the application views, following the project's recent rules and refactors.

---

## 1. Dynamic Data Integration (Injection by ID)

The HTML project was refactored to remove all "hardcoded mock data". To ensure a clean integration with the API or data sources (JSON), follow this architecture:

### 1.1 Empty `<span>` and `Input` Tags
Any dynamic data in the views, especially in the Business Portal (e.g. `HTML/prototipo.html`), has been wrapped or replaced by empty elements with unique `id` attributes.

**Example usage in HTML:**
```html
<div class="metric-value" id="db-ingresos-value"><span></span></div>
<h2 class="cd-name" id="cd-client-name"></h2>
```

**Example injection from JS:**
```javascript
// Avoid overwriting internal structures
document.getElementById('db-ingresos-value').querySelector('span').textContent = '$1,200';
document.getElementById('cd-client-name').textContent = clienteData.nombre;
```

### 1.2 Lists and Tables
Containers that render dynamic lists (like appointment histories, notifications, or the client database) have been intentionally emptied in the HTML to prevent duplicate content.

The JS must target the parent container's ID and inject the corresponding HTML:
```html
<!-- Base HTML -->
<div class="history-timeline" id="cd-history-timeline">
    <!-- JS injects <div class="history-item">...</div> by iterating data -->
</div>
```

---

## 2. CSS and UI Conventions

### 2.1 Strict Prohibition of Inline CSS
The use of the `style="..."` attribute in HTML tags is **strictly prohibited**. All styling must be resolved using the atomic/utility class system. 

**Incorrect:**
```html
<div style="margin-top: 16px; padding: 10px; text-align: center; color: #94a3b8;">Text</div>
```

**Correct:**
```html
<div class="mt-16 text-center text-slate-400 p-10">Text</div>
```
*(Note: We have extracted multiple utility classes during the cleanup. Review the `prototipo.css` section `SISTEMA DE CLASES UTILITARIAS (ATOMIC CSS)` before creating a new class).*

### 2.2 Modals and Views System
The project uses a virtual SPA system, which means the HTML doesn't reload.
- **View Routing:** The JS (mainly `prototipo.js`) toggles the visibility of `.page-section` containers by adding or removing the `.active` class.
- **Navigation:** Any menu button must carry the `data-target="view-id"` attribute so the router registers it automatically.

---

## 3. Next Steps for Backend
1. **ID Mapping:** Review `index.html` and `prototipo.html`. All IDs prefixed with `db-` (Dashboard), `cd-` (Client Details) or `pn-` (Business Portal) are your data injection anchors.
2. **Endpoints:** Create an intermediate JS engine (e.g. `api-service.js`) that captures these IDs and dumps your backend JSON responses into them.
3. **Empty State Handling:** Many containers have an `.empty-state-container` class. The JS must remove this class and populate the table/list once the data is successfully fetched from the backend.
