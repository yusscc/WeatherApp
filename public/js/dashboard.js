const WeatherAPI = window.WeatherAPI

class Dashboard {
  constructor() {
    this.currentCity = { name: "London", lat: 51.5074, lon: -0.1278 }
    this.init()
  }

  init() {
    this.updateCurrentDate()
    this.loadCurrentWeather()
    this.loadCityCards()
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

  updateWeatherDisplay(data) {
    document.querySelector(".weather-info h2").textContent = data.name
    document.querySelector(".temperature").textContent = `${Math.round(data.main.temp)}°C`
    document.querySelector(".weather-description").textContent = data.weather[0].description
    const weatherIcon = document.querySelector(".weather-icon i")
    if (weatherIcon) {
      weatherIcon.className = this.getWeatherIconClass(data.weather[0].icon)
    }
    const details = document.querySelectorAll(".weather-detail span")
    if (details.length >= 4) {
      details[0].textContent = `${data.main.humidity}%`
      details[1].textContent = `${data.wind.speed} m/s`
      details[2].textContent = `${data.main.pressure} hPa`
      details[3].textContent = `${data.visibility / 1000} km`
    }
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

  async loadCityCards() {
    const cityCardsContainer = document.querySelector(".city-cards")
    if (!cityCardsContainer) return
    const DEFAULT_CITIES = [
      { name: "New York", coords: [40.7128, -74.006] },
      { name: "Tokyo", coords: [35.6895, 139.6917] },
      { name: "Sydney", coords: [-33.8688, 151.2093] },
    ]
    for (const city of DEFAULT_CITIES) {
      const weatherData = await WeatherAPI.getCurrentWeather(city.coords[0], city.coords[1])
      if (weatherData) {
        this.updateCityCard(city.name, weatherData)
      }
    }
  }

  updateCityCard(cityName, weatherData) {
    const cityCard = document.querySelector(`[data-city="${cityName}"]`)
    if (cityCard) {
      const tempElement = cityCard.querySelector(".temp")
      const conditionElement = cityCard.querySelector(".condition")
      if (tempElement) tempElement.textContent = `${Math.round(weatherData.main.temp)}°C`
      if (conditionElement) conditionElement.textContent = weatherData.weather[0].main
    }
  }

  async updateCity(cityName, lat, lon) {
    this.currentCity = { name: cityName, lat, lon }
    await this.loadCurrentWeather()
  }
}

window.dashboard = new Dashboard()

document.addEventListener("DOMContentLoaded", () => { })