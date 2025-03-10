// Select necessary DOM elements
const countryInput = document.getElementById("country-input");
const submitBtn = document.getElementById("submit-btn");
const countryInfoSection = document.getElementById("country-info");
const borderingCountriesSection = document.getElementById("bordering-countries");

// Event listener for the submit button
submitBtn.addEventListener("click", async function () {
    const countryName = countryInput.value.trim();  // Get the country name from the input field

    // Input validation: Check if the input is empty or contains only spaces
    if (!countryName) {
        alert("Please enter a country name!");
        return;
    }

    // Check if the input is a number
    if (!isNaN(countryName)) {
        alert("Please enter a valid country name, not a number.");
        return;
    }

    // Clear previous results
    countryInfoSection.innerHTML = "";
    borderingCountriesSection.innerHTML = "";

    try {
        // Fetch and display country data using async/await
        const country = await fetchCountryData(countryName);
        displayCountryInfo(country);
        const borderingCountries = await fetchBorderingCountries(country.borders);
        displayBorderingCountries(borderingCountries);
    } catch (error) {
        // Graceful error handling: show user-friendly error message
        countryInfoSection.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        borderingCountriesSection.innerHTML = "";  // Clear bordering countries section on error
    }
});

// Function to fetch country data from the API
async function fetchCountryData(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Country not found: ${countryName}`);
        }

        const data = await response.json();
        return data[0];  // Return the first country in the response
    } catch (error) {
        throw new Error(`Error fetching country data: ${error.message}`);
    }
}

// Function to display country information
function displayCountryInfo(country) {
    const { name, capital, population, region, flags } = country;

    // Create and insert the HTML for country info into the DOM
    countryInfoSection.innerHTML = `
        <h2>${name.common}</h2>
        <img src="${flags.svg}" alt="Flag of ${name.common}" style="width: 100px; height: auto; margin-bottom: 20px;">
        <p><strong>Capital:</strong> ${capital ? capital[0] : "N/A"}</p>
        <p><strong>Population:</strong> ${population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${region}</p>
    `;
}

// Function to fetch bordering countries' data
async function fetchBorderingCountries(borders) {
    if (!borders || borders.length === 0) {
        return [];  // No bordering countries
    }

    const borderingCountries = [];

    for (const borderCode of borders) {
        const borderCountry = await fetchBorderCountryData(borderCode);
        borderingCountries.push(borderCountry);
    }

    return borderingCountries;
}

// Function to fetch data for each bordering country
async function fetchBorderCountryData(borderCode) {
    const borderApiUrl = `https://restcountries.com/v3.1/alpha/${borderCode}`;

    try {
        const response = await fetch(borderApiUrl);

        if (!response.ok) {
            throw new Error(`Error fetching border country data for ${borderCode}`);
        }

        const data = await response.json();
        return data[0];  // Return the first country from the response
    } catch (error) {
        console.error(`Error fetching border country data: ${error.message}`);
        return null;  // Return null if error occurs for a particular border
    }
}

// Function to display the neighboring countries
function displayBorderingCountries(borderingCountries) {
    if (borderingCountries.length === 0) {
        borderingCountriesSection.innerHTML = "<p>No bordering countries.</p>";
        return;
    }

    // Clear previous bordering country data
    borderingCountriesSection.innerHTML = "<h3>Bordering Countries:</h3>";

    // Loop through each bordering country and append to the DOM
    borderingCountries.forEach(country => {
        if (country) {
            const borderElement = document.createElement("div");
            const { name, flags } = country;

            borderElement.innerHTML = `
                <p>${name.common}</p>
                <img src="${flags.svg}" alt="Flag of ${name.common}" style="width: 70px; height: auto;">
            `;
            borderingCountriesSection.appendChild(borderElement);
        }
    });
}

