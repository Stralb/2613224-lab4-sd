const countryInput = document.getElementById("country-input");
const submitBtn = document.getElementById("submit-btn");
const countryInfoSection = document.getElementById("country-info");
const borderingCountriesSection = document.getElementById("bordering-countries");

submitBtn.addEventListener("click", async function() {
    const countryName = countryInput.value.trim();

    if (!countryName) {
        alert("Please enter a country name!");
        return;
    }

    countryInfoSection.innerHTML = "";
    borderingCountriesSection.innerHTML = "";

    try {
        const country = await fetchCountryData(countryName);
        displayCountryInfo(country);
        const borderingCountries = await fetchBorderingCountries(country.borders);
        displayBorderingCountries(borderingCountries);
    } catch (error) {
        if (error.message.includes("Country not found")) {
            countryInfoSection.innerHTML = `<p class="error-message">Error: Country not found. Please enter a valid country name.</p>`;
        } else if (error.message.includes("Invalid input")) {
            countryInfoSection.innerHTML = `<p class="error-message">Error: Please enter a valid country name, not a number!</p>`;
        } else {
            countryInfoSection.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
        borderingCountriesSection.innerHTML = "";
    }
});

async function fetchCountryData(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Country not found: ${countryName}`);
        }

        const data = await response.json();
        return data[0];
    } catch (error) {
        throw new Error(`Error fetching country data: ${error.message}`);
    }
}

function displayCountryInfo(country) {
    const { name, capital, population, region, flags } = country;

    countryInfoSection.innerHTML = `
        <h2>Country Information</h2>
        <p><strong>Capital:</strong> ${capital ? capital[0] : "N/A"}</p>
        <p><strong>Population:</strong> ${population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${region}</p>
        <p><strong>Flag:</strong> <img src="${flags.svg}" alt="Flag of ${name.common}" style="width: 100px; height: auto; margin-top: 10px;"></p>
    `;
}

async function fetchBorderingCountries(borders) {
    if (!borders || borders.length === 0) {
        return [];
    }

    const borderingCountries = [];

    for (const borderCode of borders) {
        const borderCountry = await fetchBorderCountryData(borderCode);
        borderingCountries.push(borderCountry);
    }

    return borderingCountries;
}

async function fetchBorderCountryData(borderCode) {
    const borderApiUrl = `https://restcountries.com/v3.1/alpha/${borderCode}`;

    try {
        const response = await fetch(borderApiUrl);

        if (!response.ok) {
            throw new Error(`Error fetching border country data for ${borderCode}`);
        }

        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error(`Error fetching border country data: ${error.message}`);
        return null;
    }
}

function displayBorderingCountries(borderingCountries) {
    if (borderingCountries.length === 0) {
        borderingCountriesSection.innerHTML = "<h3>Bordering Countries</h3><p>No bordering countries.</p>";
        return;
    }

    borderingCountriesSection.innerHTML = "<h3>Bordering Countries</h3>";

    borderingCountries.forEach(country => {
        if (country) {
            const borderElement = document.createElement("div");
            const { name, flags } = country;

            borderElement.innerHTML = `
                <div class="border-country">
                    <p class="border-name">${name.common}</p>
                    <img src="${flags.svg}" alt="Flag of ${name.common}" class="border-flag">
                </div>
            `;
            borderingCountriesSection.appendChild(borderElement);
        }
    });
}
