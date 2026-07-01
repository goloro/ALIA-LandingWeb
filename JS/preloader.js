document.body.classList.add('loading');
window.isWindowLoaded = false;
window.isContentLoaded = false;

window.checkAndHidePreloader = function() {
    if (window.isWindowLoaded && window.isContentLoaded) {
        const preloader = document.getElementById('premium-preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                document.body.classList.remove('loading');
                setTimeout(() => preloader.remove(), 600);
            }, 300);
        }
    }
};

window.addEventListener('load', function() {
    window.isWindowLoaded = true;
    window.checkAndHidePreloader();
});
