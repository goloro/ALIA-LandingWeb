document.addEventListener("DOMContentLoaded", () => {
    const sliderCitas = document.getElementById("slider-citas");
    const sliderMinutos = document.getElementById("slider-minutos");
    const valCitas = document.getElementById("val-citas");
    const valMinutos = document.getElementById("val-minutos");
    
    const resMensual = document.getElementById("res-mensual");
    const resAnual = document.getElementById("res-anual");
    const btnRecalcular = document.getElementById("btn-recalcular");

    function updateSliderBackground(slider) {
        const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.background = `linear-gradient(to right, #0F766E 0%, #0F766E ${value}%, #e2e8f0 ${value}%, #e2e8f0 100%)`;
    }

    function calculate() {
        const citas = parseInt(sliderCitas.value);
        const minutos = parseInt(sliderMinutos.value);
        
        valCitas.textContent = citas;
        valMinutos.textContent = minutos;
        
        // 4 semanas por mes aprox
        const horasMensuales = Math.round((citas * minutos * 4) / 60);
        const horasAnuales = horasMensuales * 12;
        
        resMensual.textContent = horasMensuales;
        resAnual.textContent = horasAnuales + " Horas";
    }

    function onSliderInput(e) {
        updateSliderBackground(e.target);
        calculate();
    }

    if(sliderCitas && sliderMinutos) {
        sliderCitas.addEventListener("input", onSliderInput);
        sliderMinutos.addEventListener("input", onSliderInput);
        btnRecalcular.addEventListener("click", calculate);

        // Initial setup
        updateSliderBackground(sliderCitas);
        updateSliderBackground(sliderMinutos);
        calculate();
    }
});
