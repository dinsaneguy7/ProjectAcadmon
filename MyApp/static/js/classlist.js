document.addEventListener('DOMContentLoaded', function() {
    // Initialize class cards
    const classCards = document.querySelectorAll('.class-card');
    
    // Add click and keyboard interaction
    classCards.forEach(card => {
        // Click handler
        card.addEventListener('click', function(e) {
            // Only prevent default if href is '#', otherwise allow navigation
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                // Add your actual navigation logic here later
                console.log('Navigating to class details:', 
                    this.querySelector('.class-name').textContent);
            }
        });
        
        // Keyboard navigation
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Set tabindex for keyboard accessibility
        card.setAttribute('tabindex', '0');
    });
    
    // Animate progress circles when they come into view
    const progressCircles = document.querySelectorAll('.progress-circle');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const svg = entry.target.querySelector('svg');
                const circles = svg.querySelectorAll('.progress-segment');
                
                circles.forEach(circle => {
                    const dashArray = circle.getAttribute('stroke-dasharray');
                    circle.style.strokeDasharray = dashArray;
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    progressCircles.forEach(circle => {
        // Initialize with no stroke
        const svg = circle.querySelector('svg');
        const circles = svg.querySelectorAll('.progress-segment');
        circles.forEach(circle => {
            circle.style.strokeDasharray = '0, 100';
        });
        
        // Observe for animation
        observer.observe(circle);
    });
    
    // Add resize observer for responsive adjustments
    const resizeObserver = new ResizeObserver(entries => {
        // You can add responsive JS logic here if needed
    });
    
    resizeObserver.observe(document.body);
});