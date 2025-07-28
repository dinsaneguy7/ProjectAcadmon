document.addEventListener('DOMContentLoaded', function() {
    // Initialize student cards
    const studsCards = document.querySelectorAll('.studs-card');
    
    // Add hover and click interactions
    studsCards.forEach(card => {
        // Click handler for the card
        card.addEventListener('click', function(e) {
            // Don't interfere with button clicks
            if (!e.target.closest('.action-btn')) {
                console.log('Navigating to student details:', 
                    this.querySelector('.studs-name').textContent);
            }
        });
        
        // Keyboard navigation
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
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
    
    // Add hover effects for action buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});