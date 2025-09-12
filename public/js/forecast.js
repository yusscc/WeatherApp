const WeatherAPI = window.WeatherAPI

class Forecast {
  constructor() {
    this.chart = null
    this.currentCity = { lat: 51.5074, lon: -0.1278, name: "London", country: "GB" }
  }

  async initForecastChart() {
    const forecastData = await WeatherAPI.getForecast(this.currentCity.lat, this.currentCity.lon)

    if (!forecastData) {
      console.error("Failed to load forecast data")
      return
    }

    let cityName = this.currentCity.name
    let country = this.currentCity.country
    if (forecastData.city) {
      cityName = forecastData.city.name || cityName
      country = forecastData.city.country || country
    }

    this.updateCityInfoBar({
      name: cityName,
      country: country,
      lat: this.currentCity.lat,
      lon: this.currentCity.lon,
    }, forecastData)

    this.updateForecastCards(forecastData)
    this.createTemperatureChart(forecastData)
  }

  updateCityInfoBar(cityData, forecastData) {
    document.getElementById("forecast-city-name").textContent = cityData.name || "Unknown"
    document.getElementById("forecast-country").textContent = cityData.country || ""
    document.getElementById("forecast-coords").innerHTML =
      `<i class="fas fa-map-marker-alt"></i> ${Number(cityData.lat).toFixed(2)}, ${Number(cityData.lon).toFixed(2)}`
    if (forecastData && forecastData.list && forecastData.list.length > 0) {
      const date = new Date(forecastData.list[0].dt * 1000)
      document.getElementById("forecast-date").textContent =
        date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    } else {
      document.getElementById("forecast-date").textContent = ""
    }
  }

  updateForecastCards(forecastData) {
    const cardsContainer = document.getElementById("forecast-cards")
    if (!cardsContainer) return
    cardsContainer.innerHTML = ""

    const dailyForecasts = this.processDailyForecast(forecastData.list)

    dailyForecasts.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000)
      const day = date.toLocaleDateString("en-GB", { weekday: "short" })
      const iconClass = this.getWeatherIconClass(forecast.weather[0].icon)
      const tempMax = Math.round(forecast.main.temp_max)
      const tempMin = Math.round(forecast.main.temp_min)
      const condition = forecast.weather[0].main
      const humidity = forecast.main.humidity
      const wind = forecast.wind.speed

      const card = document.createElement("div")
      card.className = "card forecast-card"
      card.innerHTML = `
        <div class="forecast-day">${day}</div>
        <div class="forecast-icon"><i class="${iconClass}"></i></div>
        <div class="forecast-temp">${tempMax}°/${tempMin}°</div>
        <div class="forecast-condition">${condition}</div>
        <div class="forecast-details">
          <span><i class="fas fa-tint"></i> ${humidity}%</span>
          <span><i class="fas fa-wind"></i> ${wind} m/s</span>
        </div>
      `
      cardsContainer.appendChild(card)
    })
  }

  processDailyForecast(forecastList) {
    const dailyData = {}

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString()

      if (!dailyData[date]) {
        dailyData[date] = {
          ...item,
          main: {
            ...item.main,
            temp_min: item.main.temp,
            temp_max: item.main.temp,
          },
        }
      } else {
        dailyData[date].main.temp_min = Math.min(dailyData[date].main.temp_min, item.main.temp)
        dailyData[date].main.temp_max = Math.max(dailyData[date].main.temp_max, item.main.temp)
      }
    })

    return Object.values(dailyData).slice(0, 7)
  }

  createTemperatureChart(forecastData) {
    const ctx = document.getElementById("temperatureChart")
    if (!ctx) return

    if (this.chart) {
      this.chart.destroy()
    }

    const dailyForecasts = this.processDailyForecast(forecastData.list)
    const labels = dailyForecasts.map((forecast) => {
      const date = new Date(forecast.dt * 1000)
      return date.toLocaleDateString("en-GB", { weekday: "short" })
    })

    const maxTemps = dailyForecasts.map((forecast) => Math.round(forecast.main.temp_max))
    const minTemps = dailyForecasts.map((forecast) => Math.round(forecast.main.temp_min))

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, "rgba(76, 201, 240, 0.6)")
    gradient.addColorStop(1, "rgba(76, 201, 240, 0.1)")

    const Chart = window.Chart

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Max Temperature (°C)",
            data: maxTemps,
            backgroundColor: gradient,
            borderColor: "#4cc9f0",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Min Temperature (°C)",
            data: minTemps,
            backgroundColor: "rgba(255, 99, 132, 0.1)",
            borderColor: "#ff6384",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
            },
          },
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
            },
          },
        },
      },
    })
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

  updateCity(lat, lon, name = "Unknown", country = "") {
    this.currentCity = { lat, lon, name, country }
    this.initForecastChart()
  }
}

window.forecast = new Forecast()

document.addEventListener("DOMContentLoaded", () => {
  window.forecast.initForecastChart()

  const searchInput = document.getElementById("search-input")
  if (searchInput) {
    searchInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        const cityName = searchInput.value.trim()
        if (cityName) {
          const cityDataArr = await WeatherAPI.searchCity(cityName)
          const cityData = Array.isArray(cityDataArr) && cityDataArr.length > 0 ? cityDataArr[0] : null
          if (cityData) {
            window.forecast.updateCity(cityData.lat, cityData.lon, cityData.name, cityData.country)
          } else {
            alert("City not found. Please try a different search term.")
          }
        }
      }
    })
  }
})