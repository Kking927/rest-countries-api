const urlParams = new URLSearchParams(window.location.search);
const countryName = urlParams.get('name');

const flagImg = document.querySelector('.country-detail__flag');
const nameHeading = document.querySelector('.country-detail__name');
const nativeNameSpan = document.querySelector('.js-native');
const populationSpan = document.querySelector('.js-population');
const regionSpan = document.querySelector('.js-region');
const subRegionSpan = document.querySelector('.js-subregion');
const capitalSpan = document.querySelector('.js-capital');
const tldSpan = document.querySelector('.js-tld');
const currenciesSpan = document.querySelector('.js-currencies');
const languagesSpan = document.querySelector('.js-languages');
const borderContainer = document.querySelector('.border-countries__list');

// --- Back Button State Saver ---
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back(); // Restores the previous page, scroll, and filter state
    });
}

// =================================
// Fetch and Render Country Details
// =================================
async function fetchCountryDetails() {
    if (!countryName) {
        nameHeading.textContent = 'Country not found';
        return;
    }

    try {
        const response = await fetch('./data.json');
        const countries = await response.json();

        // Find the country handling both string and object name formats
        const country = countries.find(c => {
            const nameStr = typeof c.name === 'string' ? c.name : c.name.common;
            return nameStr.toLowerCase() === countryName.toLowerCase();
        });

        if (!country) {
            nameHeading.textContent = 'Country not found';
            return;
        }

        // Safe name and flag extraction
        const realName = typeof country.name === 'string' ? country.name : country.name.common;
        const flagSrc = country.flags ? (country.flags.svg || country.flags.png) : country.flag;

        // Populate basic info
        flagImg.src = flagSrc || '';
        flagImg.alt = `${realName} flag`;
        nameHeading.textContent = realName;

        nativeNameSpan.textContent = country.nativeName || 'N/A';
        populationSpan.textContent = country.population ? country.population.toLocaleString() : 'N/A';
        regionSpan.textContent = country.region || 'N/A';
        subRegionSpan.textContent = country.subregion || 'N/A';
        capitalSpan.textContent = country.capital || 'N/A';
        tldSpan.textContent = country.topLevelDomain ? country.topLevelDomain.join(', ') : 'N/A';

        currenciesSpan.textContent = country.currencies
            ? country.currencies.map(c => c.name).join(', ')
            : 'N/A';

        languagesSpan.textContent = country.languages
            ? country.languages.map(l => l.name).join(', ')
            : 'N/A';

        // Border Countries Logic
        if (country.borders && country.borders.length > 0) {
            borderContainer.innerHTML = '';

            const borderCountries = countries.filter(c => country.borders.includes(c.alpha3Code));

            borderCountries.forEach(border => {
                const borderName = typeof border.name === 'string' ? border.name : border.name.common;
                const borderBtn = document.createElement('a');
                borderBtn.href = `detail.html?name=${encodeURIComponent(borderName)}`;
                borderBtn.className = 'border-btn';
                borderBtn.textContent = borderName;
                borderContainer.appendChild(borderBtn);
            });
        } else {
            borderContainer.innerHTML = '<span>None</span>';
        }

    } catch (error) {
        console.error('Error loading country detail from JSON:', error);
        nameHeading.textContent = 'Failed to load country data.';
    }
}

fetchCountryDetails();