// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');

    // Menu items database
    const menuItems = [
        { name: 'Okinawa Milktea', category: 'milktea', price: '₱29-₱39', url: '#milktea' },
        { name: 'Matcha Milktea', category: 'milktea', price: '₱29-₱39', url: '#milktea' },
        { name: 'Wintermelon Milktea', category: 'milktea', price: '₱29-₱39', url: '#milktea' },
        { name: 'Cookies & Cream Milktea', category: 'milktea', price: '₱29-₱39', url: '#milktea' },
        { name: 'Coffee Jelly Praf', category: 'praf', price: '₱49-₱59', url: '#frappe' },
        { name: 'Matcha Praf', category: 'praf', price: '₱49-₱59', url: '#frappe' },
        { name: 'Mocha Praf', category: 'praf', price: '₱49-₱59', url: '#frappe' },
        { name: 'Mango Fruit Tea', category: 'fruit-tea', price: '₱29-₱39', url: '#fruit-tea' },
        { name: 'Kiwi Fruit Tea', category: 'fruit-tea', price: '₱29-₱39', url: '#fruit-tea' },
        { name: 'Blueberry Fruit Tea', category: 'fruit-tea', price: '₱29-₱39', url: '#fruit-tea' }
    ];

    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'searchResults';
    resultsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        max-height: 300px;
        overflow-y: auto;
        display: none;
        z-index: 1000;
    `;
    searchForm.appendChild(resultsContainer);

    // Search function
    function performSearch(query) {
        const results = menuItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );
        
        displayResults(results);
    }

    // Display results
    function displayResults(results) {
        if (results.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        resultsContainer.innerHTML = results.map(item => `
            <a href="${item.url}" style="display:block; padding:12px 16px; text-decoration:none; color:#7c4a00; border-bottom:1px solid #eee;">
                <div style="font-weight:600;">${item.name}</div>
                <div style="font-size:0.9em; color:#a97c3a;">${item.category} • ${item.price}</div>
            </a>
        `).join('');

        resultsContainer.style.display = 'block';
    }

    // Event listeners
    // Toggle overlay on icon click (for compact header)
    if (searchToggle) {
        searchToggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchOverlay) {
                const visible = searchOverlay.style.display === 'inline-flex' || searchOverlay.style.display === 'inline-block';
                searchOverlay.style.display = visible ? 'none' : 'inline-flex';
                if (!visible) setTimeout(() => searchInput.focus(), 50);
            }
        });
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            performSearch(query);
        } else {
            resultsContainer.style.display = 'none';
        }
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        // find best match (first result)
        const match = menuItems.find(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );

        if (match) {
            // redirect to menu.html with the anchor (relative URL)
            window.location.href = 'menu.html' + match.url;
        } else {
            // fallback: redirect to menu.html and pass query as parameter
            window.location.href = 'menu.html?q=' + encodeURIComponent(query);
        }
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
});