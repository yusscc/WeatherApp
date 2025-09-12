class Settings {
  constructor() {
    this.init()
  }

  init() {
    this.initThemeToggle()
    this.initThemeOptions()
    this.initUnitButtons()
    this.loadSavedPreferences()
  }

  initThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle")
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.toggleTheme()
      })
    }
  }

  initThemeOptions() {
    const themeOptions = document.querySelectorAll(".theme-option")
    themeOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const selectedTheme = option.getAttribute("data-theme")
        this.setTheme(selectedTheme)
      })
    })
  }

  initUnitButtons() {
    const unitButtons = document.querySelectorAll(".unit-btn")
    unitButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const unit = button.getAttribute("data-unit")
        this.setTemperatureUnit(unit)
      })
    })
  }

  toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme") || "light"
    const newTheme = currentTheme === "light" ? "dark" : "light"
    this.setTheme(newTheme)
  }

  setTheme(theme) {
    document.body.setAttribute("data-theme", theme)

    const themeToggle = document.getElementById("theme-toggle")
    if (themeToggle) {
      themeToggle.innerHTML = theme === "light" ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'
    }

    const themeOptions = document.querySelectorAll(".theme-option")
    themeOptions.forEach((option) => {
      if (option.getAttribute("data-theme") === theme) {
        option.classList.add("active")
      } else {
        option.classList.remove("active")
      }
    })

    localStorage.setItem("theme", theme)
  }

  setTemperatureUnit(unit) {
    const unitButtons = document.querySelectorAll(".unit-btn")
    unitButtons.forEach((btn) => {
      if (btn.getAttribute("data-unit") === unit) {
        btn.classList.add("active")
      } else {
        btn.classList.remove("active")
      }
    })

    this.convertTemperatures(unit)

    localStorage.setItem("unit", unit)
  }

  convertTemperatures(unit) {
    const temperatures = document.querySelectorAll(".temperature, .temp, .forecast-temp, .popup-temp")
    temperatures.forEach((tempEl) => {
      const tempText = tempEl.textContent
      const tempMatch = tempText.match(/(-?\d+)/g)

      if (tempMatch) {
        tempMatch.forEach((temp) => {
          const currentTemp = Number.parseInt(temp)
          let convertedTemp

          if (unit === "fahrenheit") {
            convertedTemp = Math.round((currentTemp * 9) / 5 + 32)
            tempEl.textContent = tempEl.textContent.replace(`${temp}°C`, `${convertedTemp}°F`)
          } else {
            convertedTemp = Math.round(((currentTemp - 32) * 5) / 9)
            tempEl.textContent = tempEl.textContent.replace(`${temp}°F`, `${convertedTemp}°C`)
          }
        })
      }
    })
  }

  loadSavedPreferences() {
    const savedTheme = localStorage.getItem("theme") || "light"
    const savedUnit = localStorage.getItem("unit") || "celsius"

    this.setTheme(savedTheme)
    this.setTemperatureUnit(savedUnit)
  }

  toggleNotifications(enabled) {
    localStorage.setItem("notifications", enabled)
    console.log(`Notifications ${enabled ? "enabled" : "disabled"}`)
  }

  toggleLocationAccess(enabled) {
    if (enabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log(`Location access granted: ${latitude}, ${longitude}`)

          const dashboard = window.dashboard
          if (dashboard) {
            dashboard.updateCity("Current Location", latitude, longitude)
          }
        },
        (error) => {
          console.error("Location access denied:", error)
        },
      )
    }
    localStorage.setItem("locationAccess", enabled)
  }
}

window.settings = new Settings()
