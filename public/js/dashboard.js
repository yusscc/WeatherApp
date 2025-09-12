const WeatherAPI = window.WeatherAPI

// dashboard page functionality
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
  }

  updateWeatherDisplay(data) {
    // Updating main weather info
    document.querySelector(".weather-info h2").textContent = data.name
    document.querySelector(".temperature").textContent = `${Math.round(data.main.temp)}°C`
    document.querySelector(".weather-description").textContent = data.weather[0].description

    // Updating weather icon
    const weatherIcon = document.querySelector(".weather-icon i")
    if (weatherIcon) {
      weatherIcon.className = this.getWeatherIconClass(data.weather[0].icon)
    }

    // Updating weather details
    const details = document.querySelectorAll(".weather-detail span")
    if (details.length >= 4) {
      details[0].textContent = `${data.main.humidity}%`
      details[1].textContent = `${data.wind.speed} m/s`
      details[2].textContent = `${data.main.pressure} hPa`
      details[3].textContent = `${data.visibility / 1000} km`
    }
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

document.addEventListener("DOMContentLoaded", () => {})
