// =================================
// DOM Elements Selection
// =================================

const countriesGrid = document.querySelector('.countries-grid');
const searchInput = document.querySelector('.search-bar input');
const filterContainer = document.querySelector('.filter');
const filterToggle = document.querySelector('.filter__toggle');
const filterSelectedText = document.querySelector('.filter__selected');
const filterOptions = document.querySelectorAll('.filter__option');
const clearButton = document.querySelector('.search-clear');

// =================================
// Single Source of Truth State
// =================================

const state = {
    query: '',
    region: 'all'
};

let allCountries = [];

// =================================
// Fetch Countries & Initialize State from URL
// =================================

async function fetchCountries() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allCountries = await response.json();

        // Read initial state from URL parameters so back/forward navigation and reloads work seamlessly
        const urlParams = new URLSearchParams(window.location.search);
        state.query = urlParams.get('search') || '';
        state.region = urlParams.get('region') || 'all';

        // Sync UI inputs with the initial URL state
        searchInput.value = state.query;
        clearButton.style.display = state.query ? 'block' : 'none';

        if (state.region !== 'all') {
            // Find the matching option text to update the dropdown button label
            const matchingOption = Array.from(filterOptions).find(opt => opt.dataset.region === state.region);
            if (matchingOption) {
                filterSelectedText.textContent = matchingOption.textContent;
            }
        }

        applyFilters();

    } catch (error) {
        console.error('Failed to fetch countries data:', error);
    }
}

fetchCountries();

// =================================
// Unified Filter & Render Function
// =================================

function applyFilters() {
    const query = state.query.toLowerCase().trim();

    // Filter countries based on BOTH region and search query simultaneously
    const visibleCountries = allCountries.filter(country => {
        const countryName = typeof country.name === 'string' ? country.name : country.name.common;
        
        const regionMatch = state.region === 'all' || country.region.toLowerCase() === state.region.toLowerCase();
        
        const nameMatch = countryName.toLowerCase().includes(query);
        const altMatch = country.altSpellings && country.altSpellings.some(alt => alt.toLowerCase().includes(query));

        return regionMatch && (nameMatch || altMatch);
    });

    renderCountries(visibleCountries);
    updateURL();
}

// =================================
// URL Synchronization
// =================================

function updateURL() {
    const params = new URLSearchParams();
    if (state.query) params.set('search', state.query);
    if (state.region !== 'all') params.set('region', state.region);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    // Updates URL silently without clogging the browser history stack
    window.history.replaceState({}, '', newUrl);
}

// Listen for browser back/forward buttons to sync state automatically
window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    state.query = urlParams.get('search') || '';
    state.region = urlParams.get('region') || 'all';

    searchInput.value = state.query;
    
    const matchingOption = Array.from(filterOptions).find(opt => opt.dataset.region === state.region);
    filterSelectedText.textContent = matchingOption ? matchingOption.textContent : 'Filter by Region';

    applyFilters();
});

// =================================
// Render Function
// =================================

function renderCountries(countries) {
    countriesGrid.innerHTML = '';

    countries.forEach(country => {
        const card = document.createElement('a');
        card.classList.add('country-card');

        const countryName = typeof country.name === 'string' ? country.name : country.name.common;
        card.href = `detail.html?name=${encodeURIComponent(countryName)}`;

        card.innerHTML = `
            <img src="${country.flags.svg}" alt="" class="country-card__flag">
            <div class="country-card__content">
                <h2 class="country-card__title">${countryName}</h2>
                <p class="country-card__detail"><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                <p class="country-card__detail"><strong>Region:</strong> ${country.region}</p>
                <p class="country-card__detail"><strong>Capital:</strong> ${country.capital || 'N/A'}</p>
            </div>
        `;

        countriesGrid.appendChild(card);
    });
}

// =================================
// Filter Open/Close Helper
// =================================

function setFilterOpen(isOpen) {
    filterContainer.classList.toggle('is-open', isOpen);
    filterToggle.setAttribute('aria-expanded', isOpen);
}

// =================================
// Event Listeners
// =================================

searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    clearButton.style.display = state.query ? 'block' : 'none';
    applyFilters();
});

clearButton.addEventListener('click', () => {
    state.query = '';
    searchInput.value = '';
    clearButton.style.display = state.query ? 'block' : 'none';
    
    applyFilters();
    searchInput.focus();
});

filterToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    // Uses the helper to toggle based on the opposite of its current open state
    setFilterOpen(!filterContainer.classList.contains('is-open'));
});

document.addEventListener('click', () => {
    // Uses the helper to close the dropdown
    setFilterOpen(false);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Uses the helper to close on Escape
        setFilterOpen(false);
    }
});

filterOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();

        const selectedRegion = e.currentTarget.dataset.region || 'all';
        state.region = selectedRegion;
        filterSelectedText.textContent = e.currentTarget.textContent;

        // Uses the helper to close after selecting an option
        setFilterOpen(false);
        
        applyFilters();
        filterToggle.focus();
    });
});