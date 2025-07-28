document.addEventListener('DOMContentLoaded', function() {
    // Sample data - replace with actual data from your backend
    const performanceData = {
        labels: ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12'],
        datasets: [
            {
                label: 'Understanding',
                data: [3.8, 4.1, 4.3, 4.0, 4.2, 4.5, 4.4],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.3,
                borderWidth: 2
            },
            {
                label: 'Participation',
                data: [3.5, 3.7, 3.9, 3.8, 4.0, 4.2, 4.1],
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                tension: 0.3,
                borderWidth: 2
            },
            {
                label: 'Homework',
                data: [4.0, 4.2, 4.1, 4.3, 4.4, 4.3, 4.5],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                borderWidth: 2
            }
        ]
    };

    const subjectData = {
        labels: ['Math', 'Science', 'History', 'English', 'Art'],
        datasets: [
            {
                label: 'Class A',
                data: [4.2, 3.9, 4.1, 4.3, 4.0],
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderColor: '#6366f1',
                borderWidth: 1
            },
            {
                label: 'Class B',
                data: [3.8, 4.0, 3.7, 4.1, 3.9],
                backgroundColor: 'rgba(236, 72, 153, 0.7)',
                borderColor: '#ec4899',
                borderWidth: 1
            },
            {
                label: 'Class C',
                data: [4.1, 4.3, 4.0, 4.2, 4.1],
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10b981',
                borderWidth: 1
            }
        ]
    };

    // Initialize Performance Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    const performanceChart = new Chart(performanceCtx, {
        type: 'line',
        data: performanceData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 3,
                    max: 5,
                    ticks: {
                        stepSize: 0.5
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });

    // Initialize Subject Chart
    const subjectCtx = document.getElementById('subjectChart').getContext('2d');
    const subjectChart = new Chart(subjectCtx, {
        type: 'bar',
        data: subjectData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 3,
                    max: 5,
                    ticks: {
                        stepSize: 0.5
                    }
                },
                x: {
                    stacked: false,
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });

    // Time Range Selector
    document.getElementById('timeRange').addEventListener('change', function() {
        // In a real app, you would fetch new data based on the selected range
        console.log('Time range changed to:', this.value);
        // Simulate loading new data
        performanceChart.data.labels = getUpdatedLabels(this.value);
        performanceChart.update();
    });

    // Refresh Button
    document.getElementById('refreshChart').addEventListener('click', function() {
        // In a real app, you would refresh the data
        console.log('Refreshing chart data...');
        // Simulate refresh with slight data change
        performanceChart.data.datasets.forEach(dataset => {
            dataset.data = dataset.data.map(value => {
                const change = (Math.random() * 0.4) - 0.2; // Random change between -0.2 and +0.2
                return Math.min(5, Math.max(3, value + change));
            });
        });
        performanceChart.update();
    });

    // Class Filter
    document.getElementById('classFilter').addEventListener('change', function() {
        // In a real app, you would filter the data based on the selected class
        console.log('Class filter changed to:', this.value);
    });

    // Helper function to generate updated labels based on time range
    function getUpdatedLabels(days) {
        const labels = [];
        const today = new Date();
        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return labels;
    }

    // Add animation to cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.summary-card').forEach(card => {
        observer.observe(card);
    });
});