# Weather Application

This is a weather application that provides real-time weather information based on the user's location. The application fetches weather data from an external API and displays it in a user-friendly interface.

## Project Structure

The project is organized as follows:

```
weather-app
├── WEB
│   ├── CSS
│   │   ├── style.css        # Main styles for desktop view
│   │   └── mobile.css       # Styles for mobile view
│   ├── JS
│   │   └── script.js        # JavaScript code for fetching and displaying weather data
│   └── Background_images
│       ├── Images           # Directory containing background images
│       └── credits.json     # JSON file containing credits for background images
├── package.json              # Configuration file for npm
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Documentation for the project
```

## Features

- Fetches weather data based on the user's IP address.
- Displays current weather conditions, including temperature, humidity, wind speed, and air quality index.
- Provides a 3-day weather forecast.
- Responsive design for both desktop and mobile views.
- Dynamic background images based on current weather conditions.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd weather-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Open the `index.html` file in a web browser.
2. The application will automatically fetch and display the weather information based on your location.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.