// =================================
// DOM Elements Selection
// =================================

// 1. Countries Grid (where cards will be dynamically rendered)
const countriesGrid = document.querySelector('.countries-grid');

// 2. Search Bar Input
const searchInput = document.querySelector('.search-bar input');

// 3. Filter Components
const filterContainer = document.querySelector('.filter');
const filterToggle = document.querySelector('.filter__toggle');
const filterSelectedText = document.querySelector('.filter__selected');
const filterOptions = document.querySelectorAll('.filter__option');

// =================================
// State & Data Fetching
// =================================

let allCountries = [];

async function fetchCountries() {
    try {
        const response = await fetch('./data.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allCountries = await response.json();

        // Check how the user arrived on the page
        const navEntries = performance.getEntriesByType('navigation');
        const navType = navEntries.length > 0 ? navEntries[0].type : '';

        // ONLY restore session state if they arrived via the Back/Forward buttons
        if (navType === 'back_forward') {
            const savedSearch = sessionStorage.getItem('searchQuery');
            const savedRegion = sessionStorage.getItem('selectedRegion');

            if (savedSearch) {
                searchInput.value = savedSearch;
                const filtered = allCountries.filter(country => {
                    const nameMatch = country.name.toLowerCase().includes(savedSearch);
                    const altMatch = country.altSpellings && country.altSpellings.some(alt => alt.toLowerCase().includes(savedSearch));
                    return nameMatch || altMatch;
                });
                renderCountries(filtered);
                return;
            } else if (savedRegion && savedRegion !== 'all') {
                const filtered = allCountries.filter(country =>
                    country.region.toLowerCase() === savedRegion.toLowerCase()
                );
                renderCountries(filtered);
                return;
            }
        }

        // DEFAULT: For fresh visits, reloads, or logo clicks, clear state and show all countries
        sessionStorage.removeItem('searchQuery');
        sessionStorage.removeItem('selectedRegion');
        renderCountries(allCountries);

    } catch (error) {
        console.error('Failed to fetch countries data:', error);
    }
}

fetchCountries();

// =================================
// Render Function
// =================================

function renderCountries(countries) {
    // Clear the existing grid content
    countriesGrid.innerHTML = '';

    // Loop through each country and create a card element
    countries.forEach(country => {
        const card = document.createElement('a');
        card.classList.add('country-card');

        const countryName = typeof country.name === 'string' ? country.name : country.name.common;
        card.href = `detail.html?name=${encodeURIComponent(countryName)}`;

        card.innerHTML = `
            <img src="${country.flags.svg}" alt="${countryName} flag" class="country-card__flag">
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
// Search Functionality
// =================================

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    // 1. Save search term to sessionStorage
    sessionStorage.setItem('searchQuery', searchTerm);
    // Clear region filter when user searches manually
    sessionStorage.removeItem('selectedRegion');

    const filteredCountries = allCountries.filter(country => {
        const nameMatch = country.name.toLowerCase().includes(searchTerm);
        const altSpellingMatch = country.altSpellings && country.altSpellings.some(alt =>
            alt.toLowerCase().includes(searchTerm)
        );

        return nameMatch || altSpellingMatch;
    });

    renderCountries(filteredCountries);
});

// =================================
// Region Filter Functionality
// =================================

filterToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    filterContainer.classList.toggle('is-open');
});

document.addEventListener('click', () => {
    filterContainer.classList.remove('is-open');
});

filterOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        const selectedRegion = e.target.dataset.region;

        // 1. Save region to sessionStorage and clear search query
        sessionStorage.setItem('selectedRegion', selectedRegion);
        sessionStorage.removeItem('searchQuery');

        if (!selectedRegion || selectedRegion === 'all') {
            renderCountries(allCountries);
            filterContainer.classList.remove('is-open');
            return;
        }

        const filteredCountries = allCountries.filter(country =>
            country.region.toLowerCase() === selectedRegion.toLowerCase()
        );

        renderCountries(filteredCountries);
        filterContainer.classList.remove('is-open');
    });
});