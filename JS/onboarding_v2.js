class AliaOnboarding {
    constructor() {
        this.steps = [
            {
                targetSelector: '.phone-container',
                title: 'El Chat Interactivo',
                text: '¡Pon a prueba a ALIA! Escribe por el chat simulando ser un cliente. Pide una cita, pregunta por disponibilidad o intenta cambiar un horario.',
                placement: 'left'
            },
            {
                targetSelector: '[data-target="page-dashboard"]',
                title: 'Dashboard',
                text: 'En el Panel de Control tendrás una visión en tiempo real del impacto de ALIA: aumento de ingresos, tasa de ocupación y tiempo ahorrado.',
                placement: 'right'
            },
            {
                targetSelector: '[data-target="page-agenda-semanal"]',
                title: 'Agenda Dinámica',
                text: 'Toda cita que ALIA confirme por el chat aparecerá mágicamente reflejada aquí en tu calendario.',
                placement: 'right'
            },
            {
                targetSelector: '[data-target="page-clientes"]',
                title: 'Directorio de Clientes',
                text: 'Gestiona la base de datos de tus clientes, visualiza su información de contacto y su historial de citas.',
                placement: 'right'
            },
            {
                targetSelector: '[data-target="page-chats"]',
                title: 'Chats de ALIA',
                text: 'Supervisa todas las conversaciones que el asistente tiene de forma autónoma con los clientes por WhatsApp.',
                placement: 'right'
            },
            {
                targetSelector: '[data-target="page-disponibilidad"]',
                title: 'Disponibilidad',
                text: 'Configura tus horarios de apertura y excepciones. ALIA leerá esta información en tiempo real para ofrecer huecos.',
                placement: 'right'
            },
            {
                targetSelector: '[data-target="page-mi-equipo"]',
                title: 'Mi Equipo',
                text: 'Administra a tus profesionales. Asigna los servicios que realizan y sus horarios de trabajo individuales.',
                placement: 'right'
            },
            {
                targetSelector: '[data-target="page-soporte"]',
                title: 'Soporte Técnico',
                text: '¿Necesitas ayuda? Aquí podrás abrir un ticket o leer documentación para resolver cualquier incidencia.',
                placement: 'right'
            },
            {
                targetSelector: '[data-target="page-ajustes"]',
                title: 'Ajustes y Preferencias',
                text: 'Configuración general de tu negocio, información pública y ajustes avanzados del portal.',
                placement: 'right'
            },
            {
                targetSelector: '.btn-new-cita',
                title: 'Nueva Cita Manual',
                text: '¿Un cliente te llama por teléfono? Añade la cita manualmente aquí y ALIA la tendrá en cuenta.',
                placement: 'bottom'
            }
        ];
        this.currentStepIndex = 0;
        this.isActive = false;

        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        if (!document.getElementById('onboarding-container')) {
            const container = document.createElement('div');
            container.id = 'onboarding-container';
            container.innerHTML = `
                <div class="onboarding-overlay" id="onboarding-overlay"></div>
                <div class="onboarding-highlight" id="onboarding-highlight"></div>
                <div class="onboarding-tooltip" id="onboarding-tooltip">
                    <div class="onboarding-tooltip-header">
                        <span class="onboarding-step-counter" id="onboarding-counter">Paso 1 de 4</span>
                        <button class="onboarding-close-btn" id="onboarding-close" title="Cerrar tutorial">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <h3 class="onboarding-tooltip-title" id="onboarding-title">Título</h3>
                    <p class="onboarding-tooltip-text" id="onboarding-text">Texto explicativo</p>
                    <div class="onboarding-tooltip-footer">
                        <button class="onboarding-btn onboarding-btn-prev" id="onboarding-prev">Anterior</button>
                        <button class="onboarding-btn onboarding-btn-next" id="onboarding-next">Siguiente</button>
                    </div>
                </div>
            `;
            document.body.appendChild(container);
        }

        this.overlay = document.getElementById('onboarding-overlay');
        this.highlight = document.getElementById('onboarding-highlight');
        this.tooltip = document.getElementById('onboarding-tooltip');
        this.titleEl = document.getElementById('onboarding-title');
        this.textEl = document.getElementById('onboarding-text');
        this.counterEl = document.getElementById('onboarding-counter');
        this.prevBtn = document.getElementById('onboarding-prev');
        this.nextBtn = document.getElementById('onboarding-next');
        this.closeBtn = document.getElementById('onboarding-close');
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prevStep());
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.closeBtn.addEventListener('click', () => this.stop());
        
        window.addEventListener('resize', () => {
            if (this.isActive) {
                this.positionElements();
            }
        });
    }

    start() {
        this.currentStepIndex = 0;
        this.isActive = true;
        
        this.overlay.style.display = 'block';
        this.highlight.style.display = 'block';
        this.tooltip.style.display = 'block';
        
        void this.overlay.offsetWidth;
        
        this.overlay.classList.add('active');
        this.highlight.style.opacity = '1';
        this.renderStep();
        
        document.body.style.overflow = 'hidden';
    }

    stop() {
        this.isActive = false;
        this.overlay.classList.remove('active');
        this.highlight.style.opacity = '0';
        this.highlight.style.width = '0px';
        this.highlight.style.height = '0px';
        this.tooltip.classList.remove('active');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (!this.isActive) {
                this.overlay.style.display = 'none';
                this.highlight.style.display = 'none';
                this.tooltip.style.display = 'none';
            }
        }, 350);
        
        localStorage.setItem('alia_onboarding_completed', 'true');
    }

    nextStep() {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this.renderStep();
        } else {
            this.stop();
        }
    }

    isElementVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            return false;
        }
        if (rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight) {
            return false;
        }
        return true;
    }

    prevStep() {
        let prevIndex = this.currentStepIndex - 1;
        while (prevIndex >= 0) {
            const step = this.steps[prevIndex];
            const targetEl = document.querySelector(step.targetSelector);
            if (this.isElementVisible(targetEl)) {
                this.currentStepIndex = prevIndex;
                this.renderStep();
                return;
            }
            prevIndex--;
        }
    }

    renderStep() {
        // Skip invisible steps
        while(this.currentStepIndex < this.steps.length) {
            const step = this.steps[this.currentStepIndex];
            const targetEl = document.querySelector(step.targetSelector);
            if (this.isElementVisible(targetEl)) {
                break; // found a visible target
            }
            this.currentStepIndex++;
        }

        if (this.currentStepIndex >= this.steps.length) {
            this.stop();
            return;
        }

        const step = this.steps[this.currentStepIndex];
        
        this.titleEl.textContent = step.title;
        this.textEl.textContent = step.text;
        this.counterEl.textContent = 'Paso ' + (this.currentStepIndex + 1) + ' de ' + this.steps.length;
        
        this.prevBtn.disabled = this.currentStepIndex === 0;
        this.nextBtn.textContent = this.currentStepIndex === this.steps.length - 1 ? 'Finalizar' : 'Siguiente';
        
        this.positionElements();
        this.tooltip.classList.add('active');
    }

    positionElements() {
        const step = this.steps[this.currentStepIndex];
        const targetEl = document.querySelector(step.targetSelector);
        
        if (!targetEl) return;

        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const rect = targetEl.getBoundingClientRect();
        let padding = 10;
        if (targetEl.classList.contains('phone-container')) {
            padding = 24; // Give the mobile phone more breathing room so it's not cut off by the border
        }
        
        this.highlight.style.top = (rect.top - padding + window.scrollY) + 'px';
        this.highlight.style.left = (rect.left - padding + window.scrollX) + 'px';
        this.highlight.style.width = (rect.width + padding * 2) + 'px';
        this.highlight.style.height = (rect.height + padding * 2) + 'px';

        this.tooltip.className = 'onboarding-tooltip active';
        this.tooltip.classList.add('placement-' + step.placement);
        
        this.tooltip.style.top = '0px';
        this.tooltip.style.left = '0px';
        
        setTimeout(() => {
            const tooltipRect = this.tooltip.getBoundingClientRect();
            const gap = 20;
            
            let top = 0;
            let left = 0;
            
            switch (step.placement) {
                case 'right':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2) + window.scrollY;
                    left = rect.right + padding + gap + window.scrollX;
                    break;
                case 'left':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2) + window.scrollY;
                    left = rect.left - padding - gap - tooltipRect.width + window.scrollX;
                    break;
                case 'bottom':
                    top = rect.bottom + padding + gap + window.scrollY;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2) + window.scrollX;
                    break;
                case 'top':
                    top = rect.top - padding - gap - tooltipRect.height + window.scrollY;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2) + window.scrollX;
                    break;
            }
            
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
            
            if (top < window.scrollY + 10) top = window.scrollY + 10;
            if (top + tooltipRect.height > window.scrollY + window.innerHeight - 10) {
                top = window.scrollY + window.innerHeight - tooltipRect.height - 10;
            }

            this.tooltip.style.top = top + 'px';
            this.tooltip.style.left = left + 'px';
        }, 10);
    }
}

window.aliaOnboarding = new AliaOnboarding();
