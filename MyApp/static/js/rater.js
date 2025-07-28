document.addEventListener('DOMContentLoaded', function() {
    // Initialize all sliders
    const sliders = document.querySelectorAll('.rating-slider');
    
    sliders.forEach(slider => {
        const titleId = slider.id.replace('slider-', '');
        const valueDisplay = document.getElementById(`value-${titleId}`);
        
        // Update display on input
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
        });
        
        // Initialize display
        valueDisplay.textContent = slider.value;
    });
    
    // Form submission handling
    const form = document.querySelector('.rating-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            // Validate all numerical ratings are set
            const unsetSliders = Array.from(sliders).filter(slider => {
                return parseInt(slider.value) === parseInt(slider.min);
            });
            
            if (unsetSliders.length > 0) {
                e.preventDefault();
                alert('Please set all rating values before submitting.');
                unsetSliders[0].focus();
            }
        });
    }
});