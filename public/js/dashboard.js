const WeatherAPI = window.WeatherAPI

class Dashboard {
  constructor() {
    this.currentCity = { name: "London", lat: 51.5074, lon: -0.1278, country: "GB" }
    this.init()
  }

  init() {
    this.updateCurrentDate()
    this.loadCurrentWeather()
    this.setupSearch()
  }

  updateCurrentDate() {
    const currentDate = document.getElementById("current-date")
    const now = new Date()
    const options = { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }
    currentDate.textContent = now.toLocaleDateString("en-GB", options)
  }

  async loadCurrentWeather() {
    const weatherData = await WeatherAPI.getCurrentWeather(this.currentCity.lat, this.currentCity.lon)
    if (weatherData) {
      this.updateWeatherDisplay(weatherData)
    }
    const forecastData = await WeatherAPI.getForecast(this.currentCity.lat, this.currentCity.lon)
    if (forecastData && forecastData.list) {
      this.updateHourlyForecast(forecastData.list)
    }
  }

  updateWeatherDisplay(data) {
    document.getElementById("dashboard-title").textContent = `Dashboard: ${data.name}`
    document.getElementById("current-location").textContent = `${data.name}, ${data.sys.country}`
    document.getElementById("current-temp").textContent = `${Math.round(data.main.temp)}°C`
    document.getElementById("current-description").textContent = `Feels like: ${Math.round(data.main.feels_like)}°C • ${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}`
    document.getElementById("current-humidity").textContent = `${data.main.humidity}%`
    document.getElementById("current-wind").textContent = `${data.wind.speed} m/s`
    document.getElementById("current-pressure").textContent = `${data.main.pressure} hPa`
    const iconClass = this.getWeatherIconClass(data.weather[0].icon)
    document.getElementById("current-icon").className = iconClass
    this.updateHighlights(data)
  }

  updateHighlights(data) {
    const highlightsGrid = document.getElementById("highlights-grid")
    if (!highlightsGrid) return
    highlightsGrid.innerHTML = `
      <div class="highlight-item">
        <label>UV Index</label>
        <div class="value">${data.uvi !== undefined ? data.uvi : "--"}</div>
      </div>
      <div class="highlight-item">
        <label>Visibility</label>
        <div class="value">${data.visibility ? (data.visibility / 1000).toFixed(1) : "--"} km</div>
      </div>
      <div class="highlight-item">
        <label>Sunrise</label>
        <div class="value">${data.sys && data.sys.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--"}</div>
      </div>
      <div class="highlight-item">
        <label>Sunset</label>
        <div class="value">${data.sys && data.sys.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--"}</div>
      </div>
    `
  }

  updateHourlyForecast(forecastList) {
    const hourlyForecast = document.getElementById("hourly-forecast")
    if (!hourlyForecast) return
    const hours = forecastList.slice(0, 6)
    hourlyForecast.innerHTML = hours.map(item => {
      const date = new Date(item.dt * 1000)
      const hour = date.getHours().toString().padStart(2, "0") + ":00"
      const icon = WeatherAPI.getWeatherIcon(item.weather[0].icon)
      return `
        <div class="hour-item">
          <div class="time">${hour}</div>
          <img src="${icon}" class="icon" alt="${item.weather[0].description}">
          <div class="temp">${Math.round(item.main.temp)}°C</div>
        </div>
      `
    }).join("")
  }

  getWeatherIconClass(iconCode) {
    const iconMap = {
      "01d": "fas fa-sun",
      "01n": "fas fa-moon",
      "02d": "fas fa-cloud-sun",
      "02n": "fas fa-cloud-moon",
      "03d": "fas fa-cloud",
      "03n": "fas fa-cloud",
      "04d": "fas fa-clouds",
      "04n": "fas fa-clouds",
      "09d": "fas fa-cloud-rain",
      "09n": "fas fa-cloud-rain",
      "10d": "fas fa-cloud-sun-rain",
      "10n": "fas fa-cloud-moon-rain",
      "11d": "fas fa-bolt",
      "11n": "fas fa-bolt",
      "13d": "fas fa-snowflake",
      "13n": "fas fa-snowflake",
      "50d": "fas fa-smog",
      "50n": "fas fa-smog",
    }
    return iconMap[iconCode] || "fas fa-cloud"
  }

  setupSearch() {
    const searchInput = document.getElementById("search-input")
    if (!searchInput) return
    searchInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        const cityName = searchInput.value.trim()
        if (cityName) {
          const cityDataArr = await WeatherAPI.searchCity(cityName)
          const cityData = Array.isArray(cityDataArr) && cityDataArr.length > 0 ? cityDataArr[0] : null
          if (cityData) {
            this.currentCity = {
              name: cityData.name,
              lat: cityData.lat,
              lon: cityData.lon,
              country: cityData.country || ""
            }
            this.loadCurrentWeather()
          } else {
            alert("City not found. Please try a different search term.")
          }
        }
      }
    })
  }
}

window.dashboard = new Dashboard()