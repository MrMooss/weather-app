document.addEventListener("DOMContentLoaded", () => {
    const apiKey = '';
    const city = 'Budapest';
    const weatherContainer = document.querySelector('.weather-container');
    const weatherBackground = document.querySelector('.weather-background');
    
    // Function to fetch weather data from the Weather API
    function getWeatherData() {
        const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&aqi=yes&days=3`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch weather data");
                }
                return response.json();
            })
            .then(data => {
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

                // Define the current weather condition
                const currentWeather = `${weatherDescription.toLowerCase()}_day`;

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
                    <div class="air-quality AQI-${data.current.air_quality["us-epa-index"]} div6"><p>AQI: ${data.current.air_quality["us-epa-index"]}</p></div>
                `;
                const canvas = document.getElementById("myCanvas");
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const radius = 100;
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
                        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(0, 0, canvas.width, centerY); // Define a clipping rectangle for the upper half
                        ctx.clip();

                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); // Draw the arc
                        ctx.lineWidth = 8;
                        ctx.strokeStyle = "rgba(187, 184, 184, 0.51)";
                        ctx.stroke();

                        // Calculate the icon's position on the 
                        //0:00 = 3.14,  23:59 = 6.28
                        const x = centerX + radius * Math.cos(angle);
                        const y = centerY + radius * Math.sin(angle);

                        // Draw the icon at the calculated position
                        const imgWidth = 70; // Set the desired width
                        const imgHeight = 70; // Set the desired height
                        ctx.drawImage(img, x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);

                        ctx.restore(); // Restore the context to remove the clipping
                        
                        // Draw sun-up and sun-down times
                        ctx.font = "16px Arial";
                        ctx.fillStyle = "rgba(83, 82, 82, 0.68)";;
                        ctx.fillText("0:00", centerX - radius - 11, centerY + 15); // Sun-up at the beginning of the arc
                        ctx.fillText("23:59", centerX + radius-20, centerY + 15); // Sun-down at the end of the arc
                        ctx.font = "20px Arial";
                        ctx.fillStyle = "rgba(83, 82, 82, 0.68)";;
                        ctx.fillText(cityName, centerX-38, centerY-30)

                        const hour = new Date().getHours();
                        const minute = new Date().getMinutes();
                        const currAngle = timeToAngle(hour, minute);

                        angle = currAngle;
                        requestAnimationFrame(draw);
                    }
                } else {
                    console.error('Canvas element not found');
                }
                console.log(relevantWeatherInfo)
                // Call the OpenRouter API after getting relevant weather info
                getOpenRouterData(relevantWeatherInfo);
            })
            .catch(error => {
                weatherContainer.innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
            });
    }

    // Function to fetch data from OpenRouter API with the relevant weather info
    function getOpenRouterData(relevantWeatherInfo) {
        const openRouterApiUrl = "https://openrouter.ai/api/v1/chat/completions";
        const openRouterApiKey = "";

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
                            "text": `Here is the weather forecast for Budapest from the current time onward:\n${relevantWeatherInfo}\n\nCan you tell me, in 3 or 4 sentences, what should i wear for going outside?`
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

    getWeatherData();
});