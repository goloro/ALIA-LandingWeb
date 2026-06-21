document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de la página Mi Cuenta ---
    const btnMiCuenta = document.getElementById('btn-mi-cuenta');
    const pageAjustes = document.getElementById('page-ajustes');
    const pageMiCuenta = document.getElementById('page-mi-cuenta');
    const btnBackMiCuenta = document.getElementById('btn-back-mi-cuenta');

    function showMiCuentaPage() {
        if (pageMiCuenta && pageAjustes) {
            pageSections.forEach(sec => sec.classList.remove('active'));
            pageMiCuenta.classList.add('active');
        }
    }

    function hideMiCuentaPage() {
        if (pageMiCuenta && pageAjustes) {
            pageSections.forEach(sec => sec.classList.remove('active'));
            pageAjustes.classList.add('active');
        }
    }

    if (btnMiCuenta) {
        btnMiCuenta.addEventListener('click', (e) => {
            e.preventDefault();
            showMiCuentaPage();
        });
    }
    
    if (btnBackMiCuenta) {
        btnBackMiCuenta.addEventListener('click', hideMiCuentaPage);
    }

    // --- Lógica de la página Portal del Negocio ---
    const btnPortalNegocio = document.getElementById('btn-portal-negocio');
    const pagePortalNegocio = document.getElementById('page-portal-negocio');
    const btnBackPortal = document.getElementById('btn-back-portal');

    function showPortalNegocioPage() {
        if (pagePortalNegocio && pageAjustes) {
            pageSections.forEach(sec => sec.classList.remove('active'));
            pagePortalNegocio.classList.add('active');
        }
    }

    function hidePortalNegocioPage() {
        if (pagePortalNegocio && pageAjustes) {
            pageSections.forEach(sec => sec.classList.remove('active'));
            pageAjustes.classList.add('active');
        }
    }

    if (btnPortalNegocio) {
        btnPortalNegocio.addEventListener('click', (e) => {
            e.preventDefault();
            showPortalNegocioPage();
        });
    }
    
    if (btnBackPortal) {
        btnBackPortal.addEventListener('click', hidePortalNegocioPage);
    }

    // Toggle switch logic for the Portal del Negocio services
    document.addEventListener('click', (e) => {
        if (e.target.closest('.pn-toggle')) {
            const toggle = e.target.closest('.pn-toggle');
            toggle.classList.toggle('off');
            toggle.classList.toggle('active');
        }
    });

    // --- Lógica de la página Ajustes (Slider Tamaño Texto) ---
    const textSizeContainer = document.getElementById('text-size-container');
    if (textSizeContainer) {
        const fill = document.getElementById('text-size-fill');
        const dots = document.querySelectorAll('.custom-slider-dot');
        const labels = document.querySelectorAll('.custom-slider-label');
        const track = document.getElementById('text-size-track');
        
        function updateSlider(value) {
            // Actualizar la barra azul
            if (value === 0) fill.style.width = '0%';
            else if (value === 1) fill.style.width = '50%';
            else fill.style.width = '100%';
            
            // Actualizar los puntos (dots)
            dots.forEach(dot => {
                const dotIndex = parseInt(dot.getAttribute('data-index'), 10);
                if (dotIndex <= value) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // Actualizar los labels
            labels.forEach(label => {
                const labelIndex = parseInt(label.getAttribute('data-index'), 10);
                if (labelIndex === value) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });
        }
        
        // Asignar eventos de click a los puntos y etiquetas
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const value = parseInt(e.target.getAttribute('data-index'), 10);
                updateSlider(value);
            });
        });
        
        labels.forEach(label => {
            label.addEventListener('click', (e) => {
                const value = parseInt(e.target.getAttribute('data-index'), 10);
                updateSlider(value);
            });
        });
        
        // Eventos de arrastre (Drag) para la barra
        let isDragging = false;
        
        function handleDragMove(e) {
            if (!isDragging) return;
            const rect = track.getBoundingClientRect();
            // Soporte para ratón y táctil
            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const x = clientX - rect.left;
            let percentage = x / rect.width;
            
            // Limitar entre 0 y 1
            percentage = Math.max(0, Math.min(1, percentage));
            
            let value = 1;
            if (percentage < 0.25) value = 0;
            else if (percentage > 0.75) value = 2;
            
            updateSlider(value);
        }

        if (track) {
            // Ratón
            track.addEventListener('mousedown', (e) => {
                isDragging = true;
                handleDragMove(e);
            });
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', () => { isDragging = false; });
            
            // Táctil (móviles)
            track.addEventListener('touchstart', (e) => {
                isDragging = true;
                handleDragMove(e);
            }, {passive: true});
            window.addEventListener('touchmove', handleDragMove, {passive: true});
            window.addEventListener('touchend', () => { isDragging = false; });
        }
    }
    
    // --- Lógica del Toggle (Alto Contraste) ---
    const toggleSwitch = document.querySelector('.toggle-switch');
    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', () => {
            toggleSwitch.classList.toggle('active');
        });
    }

    // --- Advertencias de Prototipo en Ajustes ---
    const btnPreferencias = document.getElementById('btn-preferencias');
    const btnLogout = document.getElementById('btn-logout');

    const showPrototipoWarning = (e) => {
        e.preventDefault();
        if (window.showToast) {
            window.showToast('Prototipo visual', 'Esta opción es solo una demostración visual en el prototipo y no es funcional.', 'warning');
        }
    };

    if (btnPreferencias) btnPreferencias.addEventListener('click', showPrototipoWarning);
    if (btnLogout) btnLogout.addEventListener('click', showPrototipoWarning);
});
