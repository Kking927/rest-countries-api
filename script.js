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

// 4. Theme Toggle Button (for the dark mode bonus later)
const themeToggleBtn = document.querySelector('.header__theme-toggle');

// =================================
// State & Data Fetching
// =================================

// Global state variable to store all country data
let allCountries = [];

// Async function to fetch country data from data.json
async function fetchCountries() {
    try {
        const response = await fetch('./data.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allCountries = await response.json();

        // Once data is loaded,  call  render function here
        renderCountries(allCountries);

    } catch (error) {
        console.error('Failed to fetch countries data:', error);
    }
}

// Call the function when the script loads
fetchCountries();

// =================================
// Render Function
// =================================

function renderCountries(countries) {
    // Clear the existing grid content
    countriesGrid.innerHTML = '';

    // Loop through each country and create a card element
    countries.forEach(country => {
        const card = document.createElement('article');
        card.classList.add('country-card');

        card.innerHTML = `
    <img src="${country.flags.svg}" alt="${country.name} flag" class="country-card__flag">
    <div class="country-card__content">
    <h2 class="country-card__title">${country.name}</h2>
    <p class="country-card__detail"><strong>Population:</strong> ${country.population.toLocaleString()}</p>
    <p class="country-card__detail"><strong>Region:</strong> ${country.region}</p>
    <p class="country-card__detail"><strong>Capital:</strong> ${country.capital || 'N/A'}</p>
    </div>
`;

        // Append the card to the grid container
        countriesGrid.appendChild(card);
    });
}

// =================================
// Search Functionality
// =================================

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    const filteredCountries = allCountries.filter(country => {
        // Check if the main name matches
        const nameMatch = country.name.toLowerCase().includes(searchTerm);

        // Check if any alternative spellings match (e.g., "England", "UK", etc.)
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

        // If the user clicks "All Regions" or a missing attribute, render all countries
        if (!selectedRegion || selectedRegion === 'all') {
            renderCountries(allCountries);
            filterContainer.classList.remove('is-open');
            return;
        }

        // Filter using the exact data-region value (e.g., "Americas", "Asia", etc.)
        const filteredCountries = allCountries.filter(country =>
            country.region.toLowerCase() === selectedRegion.toLowerCase()
        );

        renderCountries(filteredCountries);
        filterContainer.classList.remove('is-open');
    });
});