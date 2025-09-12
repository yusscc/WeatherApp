const WeatherAPI = window.WeatherAPI
const dashboard = window.dashboard
const locations = window.locations
const forecast = window.forecast

class WeatherApp {
  constructor() {
    this.currentPage = "dashboard"
    this.init()
  }

  init() {
    this.initNavigation()
    this.initSearch()
    this.initCityCards()

    //! default page to open
    this.showPage("dashboard")
  }

  initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link")
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const pageId = link.getAttribute("data-page")
        this.showPage(pageId)
      })
    })
  }

  showPage(pageId) {
    const navLinks = document.querySelectorAll(".nav-link")
    navLinks.forEach((navLink) => {
      if (navLink.getAttribute("data-page") === pageId) {
        navLink.classList.add("active")
      } else {
        navLink.classList.remove("active")
      }
    })

    const pageContents = document.querySelectorAll(".page-content")
    pageContents.forEach((page) => {
      if (page.id === pageId) {
        page.classList.add("active")
      } else {
        page.classList.remove("active")
      }
    })

    // each page have their specific function
    this.initPageContent(pageId)
    this.currentPage = pageId
  }

  initPageContent(pageId) {
    switch (pageId) {
      case "dashboard":
        if (dashboard) {
          dashboard.loadCurrentWeather()
        }
        break
      case "locations":
        if (locations) {
          locations.init()
        }
        break
      case "forecast":
        if (forecast) {
          forecast.initForecastChart()
        }
        break
      case "settings":
        break
    }
  }

  initSearch() {
    const searchInput = document.getElementById("search-input")
    if (searchInput) {
      searchInput.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
          const cityName = searchInput.value.trim()
          if (cityName) {
            await this.searchCity(cityName)
            searchInput.value = ""
          }
        }
      })
    }
  }

  async searchCity(cityName) {
    const cityDataArr = await WeatherAPI.searchCity(cityName)
    const cityData = Array.isArray(cityDataArr) && cityDataArr.length > 0 ? cityDataArr[0] : null

    if (cityData) {
      if (dashboard) {
        dashboard.updateCity(cityData.name, cityData.lat, cityData.lon)
      }
      if (this.currentPage === "forecast" && forecast) {
        forecast.updateCity(cityData.lat, cityData.lon)
      }
      this.showPage("dashboard")
      console.log(`Weather loaded for ${cityData.name}`)
    } else {
      alert("City not found. Please try a different search term.")
    }
  }

  initCityCards() {
    const cityCards = document.querySelectorAll(".city-card")
    cityCards.forEach((card) => {
      card.addEventListener("click", () => {
        const cityName = card.getAttribute("data-city")
        if (locations) {
          locations.handleCityCardClick(cityName)
        }
      })
    })
  }
}

window.WeatherApp = WeatherApp

document.addEventListener("DOMContentLoaded", () => {
  const app = new WeatherApp()
})
