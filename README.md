# Weather Dashboard

A modern, interactive weather dashboard with real-time weather data and 3D globe visualization.

## Features

- **Real-time Weather Data**: Live weather information using OpenWeatherMap API
- **Interactive 3D Globe**: Visualize cities on a rotating 3D Earth with Three.js
- **Multi-page Navigation**: Dashboard, Locations, Forecast, Settings, and About pages
- **City Search**: Search for any city worldwide with autocomplete suggestions
- **Weather Forecasts**: 7-day weather forecasts with interactive charts
- **Theme Support**: Dark and light theme options
- **Temperature Units**: Celsius and Fahrenheit support


### Dashboard
- Current weather conditions for selected city
- Temperature, humidity, wind speed, and weather description
- Weather icon and background based on conditions

### Locations
- Interactive 3D globe powered by Three.js
- Search for cities and see them marked on the globe
- Animated markers with pulsating effects
- Orbit controls for 360° globe interaction
- Attention globe isn't working as i planned but i tried atleast

### Forecast
- 7-day weather forecast
- Interactive charts using Chart.js
- Temperature trends and precipitation data
- Detailed daily weather information

### Settings
- Theme switching (Dark/Light)
- Temperature unit preferences (°C/°F)
- Notification settings
- API configuration

### About
- Information about the weather dashboard

## Setup

1. **API Key Configuration**
   - Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
   - Replace `YOUR_OPENWEATHER_API_KEY` in `js/config.js` with your actual API key

2. **File Structure**
   \`\`\`
   weatherapp/

   ├── js/
   │   ├── app.js             # Main application controller
   │   ├── config.js          # API configuration
   │   ├── weather.js         # Weather API integration
   │   ├── dashboard.js       # Dashboard functionality
   │   ├── locations.js       # 3D globe and locations
   │   ├── forecast.js        # Forecast charts and data
   │   ├── settings.js        # Settings management
   │   └── cities.js          # Default cities data
   ├── css/
   │   ├── about.css          
   │   ├── locations.css    
   │   ├── forecast.css      
   │   ├── settings.css       
   │   └── dashboard.css      
   ├── about.html             # About page
   ├── dashboard.html         # Main dashboard page
   ├── locations.html         # 3D globe locations page
   ├── forecast.html          # Weather forecast page
   ├── settings.html          # Settings and preferences
   ├── package.json           # packages
   ├─ .gitingore              # ignoring files
   └── README.md              # This file
   \`\`\`

3. **Dependencies**
   All dependencies are loaded via CDN:
   - Three.js (3D graphics)
   - Chart.js (Charts and graphs)
   - Font Awesome (Icons)

## Usage

1. Open `dashboard.html` in a web browser
2. Use the sidebar navigation to switch between pages
3. Search for cities using the search bar
4. View weather data on the dashboard
5. Explore cities on the 3D globe in the Locations page
6. Check forecasts in the Forecast page
7. Customize settings in the Settings page

## API Integration

The dashboard uses the OpenWeatherMap API for:
- Current weather data
- 5-day weather forecasts
- City geocoding and search
- Weather icons and conditions

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with custom properties and animations
- **JavaScript ES6+**: Modular architecture with classes and modules
- **Three.js**: 3D globe visualization and WebGL rendering
- **Chart.js**: Interactive weather charts and graphs
- **OpenWeatherMap API**: Real-time weather data

## License
This project is open source and available under the MIT License.