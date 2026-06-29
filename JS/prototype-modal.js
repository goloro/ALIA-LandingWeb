document.addEventListener('DOMContentLoaded', () => {
    // Show the modal every time the page loads
    // Wait for the preloader to finish (or just a reasonable time if preloader is fast)
    // We can hook into the existing checkAndHidePreloader or just wait a bit.
    // Preloader transition is 600ms. Let's wait 1.2 seconds from load to show the modal smoothly.
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            const modalOverlay = document.getElementById('prototype-modal-overlay');
            if (modalOverlay) {
                modalOverlay.classList.add('active');
            }
        }, 1200); // 1.2s delay to let the preloader disappear first
    });

    // Handle close button
    const closeBtn = document.getElementById('prototype-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modalOverlay = document.getElementById('prototype-modal-overlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                
                // Optional: remove from DOM after transition
                setTimeout(() => {
                    modalOverlay.style.display = 'none';
                    
                    // Start the onboarding tutorial if it hasn't been seen yet
                    if (window.aliaOnboarding && !localStorage.getItem('alia_onboarding_completed')) {
                        window.aliaOnboarding.start();
                    }
                }, 600); // matches the CSS transition duration
            }
        });
    }
});
