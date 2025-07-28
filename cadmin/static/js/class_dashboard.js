document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const classCardsContainer = document.getElementById('classCardsContainer');
    const lastMonthBtn = document.getElementById('lastMonthBtn');
    const lastQuarterBtn = document.getElementById('lastQuarterBtn');
    const allTimeBtn = document.getElementById('allTimeBtn');
    
    // Sample data - Replace with actual API call
    const classData = [
        // ... (same as previous class data)
    ];

    // School performance data - Replace with actual API call
    const schoolPerformanceData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Subject Knowledge',
                data: [4.2, 4.3, 4.5, 4.4, 4.6, 4.7, 4.8],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true
            },
            {
                label: 'Classroom Management',
                data: [3.9, 4.0, 4.1, 4.2, 4.3, 4.2, 4.4],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                fill: true
            },
            {
                label: 'Student Engagement',
                data: [3.7, 3.8, 3.9, 4.0, 4.1, 4.0, 4.2],
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.3,
                fill: true
            }
        ]
    };

    // Initialize School Performance Chart
    function initSchoolPerformanceChart() {
        const ctx = document.getElementById('schoolPerformanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: schoolPerformanceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 3,
                        max: 5,
                        ticks: {
                            stepSize: 0.5
                        },
                        title: {
                            display: true,
                            text: 'Average Rating'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Color mapping
    const colorSchemes = {
        // ... (same as before)
    };

    // Time period filter handling
    function setActiveTimePeriod(period) {
        // ... (same as before)
    }

    // Render class cards
    function renderClassCards(classes) {
        // ... (same as before)
    }

    // Initialize mini doughnut charts
    function initMiniChart(chartId, dataPoints, colors) {
        // ... (same as before)
    }

    // Event listeners
    lastMonthBtn.addEventListener('click', () => setActiveTimePeriod('month'));
    lastQuarterBtn.addEventListener('click', () => setActiveTimePeriod('quarter'));
    allTimeBtn.addEventListener('click', () => setActiveTimePeriod('all'));

    // Initialize dashboard
    setActiveTimePeriod('month');
    initSchoolPerformanceChart();
});