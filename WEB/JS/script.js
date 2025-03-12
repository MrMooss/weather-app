document.addEventListener("DOMContentLoaded", () => {
    const apiKey = 'cfa2f6024166493185081638252502';
    const weatherContainer = document.querySelector('.weather-container');
    const weatherBackground = document.querySelector('.weather-background');

    function convertTo24Hour(time) {
        let [timePart, modifier] = time.split(' '); // Split time and AM/PM
        let [hours, minutes] = timePart.split(':'); // Split hours and minutes

        if (modifier === 'PM' && hours !== '12') {
            hours = parseInt(hours, 10) + 12; // Convert PM hours, except 12 PM
        } else if (modifier === 'AM' && hours === '12') {
            hours = '00'; // Convert 12 AM to 00
        }

        return `${hours}:${minutes}`;
    }

    async function getIp() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip; // Correctly return the IP address
        } catch (error) {
            console.error('Error fetching IP address:', error);
        }
    }
    
    // Function to fetch the city based on the IP address
    async function getCity() {
        try {
            const ip = await getIp(); // Wait for getIp() to complete
            if (!ip) {
                throw new Error('Failed to get IP address');
            }
            const location = `https://api.weatherapi.com/v1/search.json?q=${ip}&key=${apiKey}`;
    
            const response = await fetch(location);
            if (!response.ok) {
                throw new Error("Failed to fetch location data");
            }
            const data = await response.json();
            const city = data[0].name;
            return city; // Correctly return the city
        } catch (error) {
            console.error('Error fetching location data:', error);
        }
    }
    
    // Function to fetch weather data from the Weather API
    async function getWeatherData() {
        try {
            const city = await getCity(); // Wait for getCity() to complete
            if (!city) {
                throw new Error('Failed to get city');
            }
            const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&aqi=yes&days=3`;
    
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }
            const data = await response.json();
                const today = new Date().toISOString().split('T')[0];  // Get today's date in YYYY-MM-DD format
                const currentHour = new Date().getHours(); // Get current hour
                
                const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const forecastTomorrow = data.forecast.forecastday.find(day => day.date === tomorrow);

                const dATomorrow = new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];
                const forecastDATomorrow = data.forecast.forecastday.find(day => day.date === dATomorrow);

                const forecastToday = data.forecast.forecastday.find(day => day.date === today);
                const hourlyForecast = forecastToday.hour.filter(hour => hour.time.split(' ')[1].split(':')[0] >= currentHour);

                // Format the weather info for prompt
                const relevantWeatherInfo = hourlyForecast.map(hour => {
                    return `At ${hour.time.split(' ')[1]}: Temp: ${hour.temp_c}°C but will feel like: ${hour.feelslike_c}°C, Condition: ${hour.condition.text}, Wind: ${hour.wind_kph} km/h, Gust ${hour.gust_kph}, Wind direction: ${hour.wind_dir}, Humidity: ${hour.humidity}%, Chance of rain: ${hour.chance_of_rain}%`;
                }).join('\n');

                // Display weather info on the page
                const temperature = data.current.temp_c;
                const weatherDescription = data.current.condition.text;
                const weatherIcon = data.current.condition.icon;
                const cityName = data.location.name;
                const moon_phase = data.forecast.forecastday[0].astro.moon_phase;
                const sunset = data.forecast.forecastday[0].astro.sunset;
                let dayPhase = "day";
                // Define the current weather condition
                if (currentHour >= convertTo24Hour(sunset).split(':')[0]) {
                    dayPhase = "night";
                }
                const currentWeather = `${weatherDescription.toLowerCase()}_${dayPhase}`;

                // Fetch the JSON file
                fetch('http://127.0.0.1:5500/WEB/Background_images/credits.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok ' + response.statusText);
                        }
                        return response.json();  // Parse the JSON
                    })
                    .then(weatherCredits => {
                        // Find the matching weather condition
                        const weatherInfo = weatherCredits.find(item => item.weather === currentWeather.replace(/ /g, '_'));

                        if (weatherInfo) {
                            weatherBackground.style.backgroundImage = `url('http://127.0.0.1:5500/WEB/Background_images/Images/${weatherInfo.weather}.jpg')`;
                            weatherBackground.style.backgroundSize = 'cover';
                            weatherBackground.style.backgroundPosition = 'center';
                            weatherBackground.style.backgroundAttachment = 'fixed'; 

                            // // Set the credit text with HTML
                            // creditContainer.innerHTML = weatherInfo.credit;
                        } else {
                            console.error('No matching weather found for', currentWeather);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching JSON data:', error);
                    });

                weatherContainer.innerHTML = `
                    <div class="weather-info div1">
                        <canvas id="myCanvas" width="400" height="400"></canvas>
                    </div>
                    <div class="wind div2"><p>Wind: ${data.current.wind_kph} km/h</p></div>
                    <div class="humidity div3"><p>Humidity: ${data.current.humidity}%</p></div>
                    <div class="forecast div4">
                        <div class="tomorrow"><div class="city-name"><h2>${tomorrow.replace(/-/g, '.')}</h2></div>
                                                <p>Temperature: ${forecastTomorrow.day.avgtemp_c}°C</p>
                                                <p>Condition: ${forecastTomorrow.day.condition.text}</p></div>
                        <div class="da-tomorrow"><div class="city-name"><h2>${dATomorrow.replace(/-/g, '.')}</h2></div>
                                                <p>Temperature: ${forecastDATomorrow.day.avgtemp_c}°C</p>
                                                <p>Condition: ${forecastDATomorrow.day.condition.text}</p></div>
                    </div>
                    <div class="feels-like div5"><p>Feels like: ${data.current.feelslike_c}°C</p></div>
                    <div class="air-quality AQI-${data.current.air_quality["us-epa-index"]} div6"><p>AQI: ${data.current.air_quality["pm2_5"]}</p></div>
                `;
                const canvas = document.getElementById("myCanvas");
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    let angle = 0;
                    
                    const img = new Image();
                    img.src = weatherIcon;
                    img.onload = () => {
                        draw();
                    };

                    function timeToAngle(hours, minutes) {
                        const totalMinutesInDay = 24 * 60; // 1440 minutes in a day
                        const minutesPassed = hours * 60 + minutes;
                        
                        // Calculate the angle within the range π to 2π
                        let angle = (minutesPassed / totalMinutesInDay) * Math.PI + Math.PI;
                        
                        return angle;
                    }
                    
                    function draw() {
                        const isMobile = window.innerWidth <= 768;

                        // Adjust canvas size for mobile or desktop
                        if (isMobile) {
                            canvas.width = 300;  // Set smaller width for mobile
                            canvas.height = 300; // Set smaller height for mobile
                        } else {
                            canvas.width = 500;  // Larger width for desktop
                            canvas.height = 300; // Larger height for desktop
    }

                        const centerX = canvas.width / 2;
                        const centerY = canvas.height / 2;
                        const radius = isMobile ? 60 : 100;
                        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(0, 0, canvas.width, centerY); // Define a clipping rectangle for the upper half
                        ctx.clip();

                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); // Draw the arc
                        ctx.lineWidth = isMobile ? 5 : 8;
                        ctx.strokeStyle = "rgba(187, 184, 184, 0.51)";
                        ctx.stroke();

                        // Calculate the icon's position on the 
                        //0:00 = 3.14,  23:59 = 6.28
                        const x = centerX + radius * Math.cos(angle);
                        const y = centerY + radius * Math.sin(angle);

                        const hour = new Date().getHours();
                        const minute = new Date().getMinutes();
                        // Draw the icon at the calculated position
                        const imgWidth = 70; // Set the desired width
                        const imgHeight = 70; // Set the desired height
                        ctx.drawImage(img, x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);
                        ctx.font = isMobile ? "8px Arial" : "11px Arial";
                        ctx.fillStyle = "rgba(32, 32, 32, 0.68)";
                        ctx.fillText(`${hour}:${minute.toString().padStart(2, '0')}`, x + 15, y - 15);

                        ctx.restore(); // Restore the context to remove the clipping
                        
                        // Draw sun-up and sun-down times
                        ctx.font = isMobile ? "10px Arial" : "16px Arial";
                        ctx.fillStyle = "rgba(83, 82, 82, 0.68)";
                        ctx.fillText("0:00", centerX - radius - 11, centerY + 15); // Sun-up at the beginning of the arc
                        ctx.fillText("23:59", centerX + radius-20, centerY + 15); // Sun-down at the end of the arc
                        
                        ctx.font = isMobile ? "12px Arial" : "20px Arial";
                        ctx.fillStyle = "rgba(83, 82, 82, 0.68)";
                        const textWidth = ctx.measureText(cityName).width;
                        if (isMobile) {
                            ctx.fillText(cityName, centerX - textWidth / 2, centerY - 20);
                        }
                        else {
                            ctx.fillText(cityName, centerX - textWidth / 2, centerY - 30);
                        }
                        ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
                        const celsiuswidth = ctx.measureText(`${temperature}°C`).width;
                        if (isMobile) {
                            ctx.fillText(`${temperature}°C`, centerX - celsiuswidth / 2, centerY+10)
                        }
                        else {
                            ctx.fillText(`${temperature}°C`, centerX - celsiuswidth / 2, centerY+10)
                        }
                       

                        ctx.font = isMobile ? "10px Arial" : "14px Arial";
                        ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
                        if (isMobile) {
                            ctx.fillText(`Moon phase: ${moon_phase}`, centerX - 130, centerY + 50);
                        }
                        else {
                            ctx.fillText(`Moon phase: ${moon_phase}`, centerX - 175, centerY + 100);
                        }
                        
                        
                        const currAngle = timeToAngle(hour, minute);

                        angle = currAngle;
                        const now = new Date();
                        const seconds = now.getSeconds();
                        const milliseconds = now.getMilliseconds();
                        const timeUntilNextMinute = (60 - seconds) * 1000 - milliseconds
                        setTimeout(draw, timeUntilNextMinute);
                    }

                    draw(); // Initial call to start the drawing loop
                } else {
                    console.error('Canvas element not found');
                }
                // Call the OpenRouter API after getting relevant weather info
                getOpenRouterData(relevantWeatherInfo, cityName, weatherContainer);
        } catch (error) {
                weatherContainer.innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
        }
    }

    function translate() {
        const openRouterApiUrl = "https://openrouter.ai/api/v1/chat/completions";
        const openRouterApiKey = "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";
        const text = "Strukturen Grundgestell auswählen und SerNr. in SAP erfassen";
        fetch(openRouterApiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-pro-exp-02-05:free",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                            "type": "text", 
                            "text": `Fordítsd le magyarra és add vissza csak a fordítást: ${text}`
                            }
                        ]
                    }
                ]
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch OpenRouter data");
            }
            return response.json();
        })
        .then(openRouterData => {
            // Extract the response content
            const openRouterMessage = openRouterData.choices[0].message.content;
            console.log(openRouterMessage);
        })

    }
    getWeatherData();
    translate();
});

function getOpenRouterData(relevantWeatherInfo, cityName, weatherContainer) {
    const openRouterApiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const openRouterApiKey = "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";
    let lang = "HU"

    fetch(openRouterApiUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "google/gemini-2.0-pro-exp-02-05:free",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                        "type": "text", 
                        "text": `Itt van a ${cityName}-i elrejelzés a következ órákra:\n${relevantWeatherInfo}\n\nMond el nekem 4-5 mondatban hogy mit kénefelvegyek ha kimegyek. Nagyon fázós vagyok. TÉrj ki arra is hogy ha egéz napra vagy csak pár órára. Válaszolj a következő nyelven: ${lang}`
                        }
                    ]
                }
            ]
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch OpenRouter data");
        }
        return response.json();
    })
    .then(openRouterData => {
        // Extract the response content
        const openRouterMessage = openRouterData.choices[0].message.content;
        // Append the OpenRouter data to the existing weatherContainer
        const openRouterHTML = `
            <div class="openrouter-info div7">
                <p>${openRouterMessage}</p>
            </div>
        `;
        weatherContainer.insertAdjacentHTML('beforeend', openRouterHTML); // Append OpenRouter data at the end
    })

}