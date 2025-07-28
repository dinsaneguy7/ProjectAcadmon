document.addEventListener('DOMContentLoaded', function() {
    // Initialize date pickers
    flatpickr(".date-picker", {
        dateFormat: "Y-m-d",
        allowInput: true
    });

    // Show/hide custom date range based on selection
    const timeRangeSelect = document.getElementById('time-range');
    const customRangeGroup = document.querySelector('.custom-range-group');
    
    timeRangeSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customRangeGroup.style.display = 'flex';
        } else {
            customRangeGroup.style.display = 'none';
        }
    });

    // Parse chart data from JSON script tags
    const ratingDates = JSON.parse(document.getElementById('rating-dates').textContent);
    const ratingTitles = JSON.parse(document.getElementById('rating-titles').textContent);
    const ratingValues = JSON.parse(document.getElementById('rating-values').textContent);

    // Build datasets array
    const ratingData = {
        labels: ratingDates || [],
        datasets: ratingTitles.map(function(title, idx) {
            return {
                label: title.rating_title,
                data: ratingValues[title.id] || [],
                borderColor: getColorForIndex(idx),
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: false
            };
        })
    };

    // Initialize chart
    const ctx = document.getElementById('ratings-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: ratingData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1
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

    // Filter application
    document.getElementById('apply-filters').addEventListener('click', function() {
        // In a real app, this would fetch new data from the server
        // For now, we'll just update the chart with filtered data
        
        const timeRange = timeRangeSelect.value;
        const groupBy = document.getElementById('group-by').value;
        
        let filteredData = filterData(ratingData, timeRange, groupBy);
        updateChart(chart, filteredData);
    });

    // Helper function to get distinct colors for lines
    function getColorForIndex(index) {
        const colors = [
            '#4f46e5', // Indigo
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#8b5cf6', // Violet
            '#ec4899', // Pink
            '#14b8a6', // Teal
            '#f97316'  // Orange
        ];
        return colors[index % colors.length];
    }

    // Mock filter function (in real app, this would be server-side)
    function filterData(data, timeRange, groupBy) {
        // This is a simplified version - real implementation would:
        // 1. Send request to server with filter parameters
        // 2. Receive filtered data
        // 3. Update chart with new data
        
        console.log(`Filtering by ${timeRange}, grouped by ${groupBy}`);
        return data; // Return original data for demo
    }

    // Update chart with new data
    function updateChart(chart, newData) {
        chart.data = newData;
        chart.update();
    }
});