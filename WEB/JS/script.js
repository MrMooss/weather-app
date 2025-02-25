document.addEventListener("DOMContentLoaded", () => {
    const apiKey = 'cfa2f6024166493185081638252502'; // Replace with your actual API key
    const city = 'London'; // Replace with the city you want to query
    const weatherContainer = document.querySelector('.weather-container');

    // Function to fetch weather data from the API
    function getWeatherData() {
        const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=cfa2f6024166493185081638252502&q=Budapest&aqi=yes&days=3`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch weather data");
                }
                return response.json();
            })
            .then(data => {
                // Extract data and update the DOM
                const temperature = data.current.temp_c;
                const weatherDescription = data.current.condition.text;
                const cityName = data.location.name;

                // Create and insert HTML
                weatherContainer.innerHTML = `
                    <div class="weather-info div1"><div class="city-name"><h2>${cityName}</h2></div>
                    <p>Temperature: ${temperature}°C</p>
                    <p>Condition: ${weatherDescription}</p></div>
                    <div class="wind div2"><p>Wind: ${data.current.wind_kph} km/h</p></div>
                    <div class="humidity div3"><p>Humidity: ${data.current.humidity}%</p></div>
                `;
            })
            .catch(error => {
                weatherContainer.innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
            });
    }

    // Call the function to fetch and display weather data
    getWeatherData();
});
