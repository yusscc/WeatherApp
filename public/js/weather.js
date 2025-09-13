
class WeatherAPI {
  static async getCurrentWeather(lat, lon) {
    try {
      const response = await fetch(
        `${WEATHER_CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_CONFIG.API_KEY}&units=metric`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching current weather:", error)
      return null
    }
  }

  static async getForecast(lat, lon) {
    try {
      const response = await fetch(
        `${WEATHER_CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_CONFIG.API_KEY}&units=metric`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching forecast:", error)
      return null
    }
  }

  static async searchCity(cityName) {
    try {
      const response = await fetch(
        `${WEATHER_CONFIG.GEO_URL}/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${WEATHER_CONFIG.API_KEY}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error searching city:", error)
      return []
    }
  }

  static async getWeatherForCities(cities) {
    const weatherPromises = cities.map(async (city) => {
      const weather = await this.getCurrentWeather(city.lat, city.lon)
      return {
        ...city,
        weather: weather,
      }
    })

    return Promise.all(weatherPromises)
  }

  static async getWeatherByCity(cityName) {
    try {
      const cities = await this.searchCity(cityName)
      if (cities.length === 0) {
        throw new Error("City not found")
      }

      const city = cities[0]
      const weather = await this.getCurrentWeather(city.lat, city.lon)

      return {
        city: city,
        weather: weather,
      }
    } catch (error) {
      console.error("Error getting weather by city:", error)
      return null
    }
  }

  static getWeatherIcon(iconCode) {
    return `${WEATHER_CONFIG.ICON_URL}/${iconCode}@2x.png`
  }
}

window.WeatherAPI = WeatherAPI
