async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        displayStats(data.categoryStats);
    } catch (error) {
        console.error('Kunne ikke indlæse statistik:', error);
    }
}

function displayStats(categoryStats) {
    const statsDiv = document.getElementById('category-stats');
    
    if (Object.keys(categoryStats).length === 0) {
        statsDiv.innerHTML = '<p class="py-8 text-center text-gray-500">Ingen kategori-data endnu. Start en samtale for at se statistik!</p>';
        return;
    }

    const sortedCategories = Object.keys(categoryStats).sort((a, b) => categoryStats[b] - categoryStats[a]);
    const mostPopular = sortedCategories[0];

    statsDiv.innerHTML = `
        ${sortedCategories.map(category => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span class="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">${category}</span>
                <span class="text-sm font-semibold text-gray-700">${categoryStats[category]} beskeder</span>
            </div>
        `).join('')}
        <div class="mt-4">
            <p class="text-sm"><strong>Mest populære kategori:</strong> ${mostPopular}</p>
        </div>
    `;
}

loadStats();