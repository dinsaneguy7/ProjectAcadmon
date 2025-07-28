// Admin Dashboard JS

document.addEventListener('DOMContentLoaded', function() {
    // Time period filter buttons
    const lastMonthBtn = document.getElementById('lastMonthBtn');
    const lastQuarterBtn = document.getElementById('lastQuarterBtn');
    const allTimeBtn = document.getElementById('allTimeBtn');
    
    // Set active time period
    function setActiveTimePeriod(period) {
        lastMonthBtn.classList.remove('bg-indigo-600', 'text-white');
        lastMonthBtn.classList.add('bg-gray-200', 'text-gray-700');
        lastQuarterBtn.classList.remove('bg-indigo-600', 'text-white');
        lastQuarterBtn.classList.add('bg-gray-200', 'text-gray-700');
        allTimeBtn.classList.remove('bg-indigo-600', 'text-white');
        allTimeBtn.classList.add('bg-gray-200', 'text-gray-700');
        
        if (period === 'month') {
            lastMonthBtn.classList.add('bg-indigo-600', 'text-white');
            lastMonthBtn.classList.remove('bg-gray-200', 'text-gray-700');
        } else if (period === 'quarter') {
            lastQuarterBtn.classList.add('bg-indigo-600', 'text-white');
            lastQuarterBtn.classList.remove('bg-gray-200', 'text-gray-700');
        } else {
            allTimeBtn.classList.add('bg-indigo-600', 'text-white');
            allTimeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        }
        // Here you would fetch data for the selected time period
        // For now we'll just log it
        console.log(`Loading data for: ${period}`);
    }
    // Event listeners for time period buttons
    lastMonthBtn.addEventListener('click', () => setActiveTimePeriod('month'));
    lastQuarterBtn.addEventListener('click', () => setActiveTimePeriod('quarter'));
    allTimeBtn.addEventListener('click', () => setActiveTimePeriod('all'));
    // Initialize with last month selected
    setActiveTimePeriod('month');
    // Create mini charts for each class card
    function createMiniCharts() {
        // Class 1 Chart
        const ctx1 = document.getElementById('class1Chart').getContext('2d');
        new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Subject', 'Management', 'Engagement'],
                datasets: [{
                    data: [4.5, 4.1, 3.8],
                    backgroundColor: [
                        '#3B82F6',
                        '#6366F1',
                        '#8B5CF6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
        // Class 2 Chart
        const ctx2 = document.getElementById('class2Chart').getContext('2d');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Subject', 'Management', 'Engagement'],
                datasets: [{
                    data: [4.7, 4.3, 4.2],
                    backgroundColor: [
                        '#10B981',
                        '#059669',
                        '#047857'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    // Initialize mini charts
    createMiniCharts();
    // Make class cards clickable (will be handled by the href)
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // You can add additional click handling here if needed
            console.log(`Navigating to class details for: ${this.querySelector('h3').textContent}`);
        });
    });
    // In a real implementation, you would:
    // 1. Fetch class data from your API
    // 2. Dynamically generate the cards
    // 3. Update the charts with real data
    // Here's a sample of how that might look:
    /*
    async function fetchClassData(timePeriod) {
        try {
            const response = await fetch(`/api/classes/performance?period=${timePeriod}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching class data:', error);
            return [];
        }
    }
    async function updateDashboard(timePeriod) {
        const classes = await fetchClassData(timePeriod);
        const container = document.querySelector('.grid');
        container.innerHTML = '';
        classes.forEach(cls => {
            const card = document.createElement('div');
            card.className = '...'; // Add your card classes
            card.innerHTML = `
                <!-- Generate card HTML based on class data -->
            `;
            container.appendChild(card);
        });
        // Reinitialize charts for new cards
        createMiniCharts();
    }
    */
});
