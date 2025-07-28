document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            const isExpanded = mobileMenu.classList.toggle('hidden');
            const icon = this.querySelector('i');
            
            // Change icon and ARIA attributes
            if (isExpanded) {
                icon.classList.replace('fa-times', 'fa-bars');
                this.setAttribute('aria-expanded', 'false');
            } else {
                icon.classList.replace('fa-bars', 'fa-times');
                this.setAttribute('aria-expanded', 'true');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenu.contains(event.target) && event.target !== mobileMenuButton) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.querySelector('i').classList.replace('fa-times', 'fa-bars');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Responsive table container (add wrapper to tables for horizontal scrolling on mobile)
    document.querySelectorAll('main table').forEach(table => {
        if (!table.closest('.table-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-container overflow-x-auto shadow-md rounded-lg mb-6';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
    
    // Add fade-in animation to elements
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, fadeOptions);
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        fadeObserver.observe(el);
    });
});