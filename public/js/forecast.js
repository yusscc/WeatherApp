const WeatherAPI = window.WeatherAPI

class Forecast {
  constructor() {
    this.chart = null
    this.currentCity = { lat: 51.5074, lon: -0.1278 }
  }

  async initForecastChart() {
    const forecastData = await WeatherAPI.getForecast(this.currentCity.lat, this.currentCity.lon)

    if (!forecastData) {
      console.error("Failed to load forecast data")
      return
    }

    this.updateForecastCards(forecastData)
    this.createTemperatureChart(forecastData)
  }

  updateForecastCards(forecastData) {
    const forecastCards = document.querySelectorAll(".forecast-card")
    const dailyForecasts = this.processDailyForecast(forecastData.list)

    forecastCards.forEach((card, index) => {
      if (dailyForecasts[index]) {
        const forecast = dailyForecasts[index]
        const dayElement = card.querySelector(".forecast-day")
        const iconElement = card.querySelector(".forecast-icon i")
        const tempElement = card.querySelector(".forecast-temp")
        const conditionElement = card.querySelector(".forecast-condition")

        if (dayElement) {
          const date = new Date(forecast.dt * 1000)
          dayElement.textContent = date.toLocaleDateString("en-GB", { weekday: "short" })
        }

        if (iconElement) {
          iconElement.className = this.getWeatherIconClass(forecast.weather[0].icon)
        }

        if (tempElement) {
          tempElement.textContent = `${Math.round(forecast.main.temp_max)}°/${Math.round(forecast.main.temp_min)}°`
        }

        if (conditionElement) {
          conditionElement.textContent = forecast.weather[0].main
        }
      }
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

  updateCity(lat, lon) {
    this.currentCity = { lat, lon }
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
            window.forecast.updateCity(cityData.lat, cityData.lon)
          } else {
            alert("City not found. Please try a different search term.")
          }
        }
      }
    })
  }
})