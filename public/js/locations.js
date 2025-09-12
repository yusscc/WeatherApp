const THREE = window.THREE
const WeatherAPI = window.WeatherAPI
const DEFAULT_CITIES = window.DEFAULT_CITIES

class Locations {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.globe = null
    this.controls = null
    this.markers = []
    this.searchedCities = []
    this.isRotating = true
    this.animationId = null
    this._markerAnimationId = null
  }

  init() {
    try {
      this.initGlobe()
      this.initSearch()
      this.loadDefaultCities()
      this.setupEventListeners()
    } catch (err) {
      console.error("Locations.init error:", err)
    }
  }

  initGlobe() {
    const container = document.getElementById("globe")
    if (!container) {
      console.error("Globe container (#globe) not found in DOM.")
      return
    }
    if (!THREE) {
      console.error("Three.js is not loaded. Make sure <script src='three.min.js'> is included before locations.js")
      return
    }
    const cw = container.clientWidth || container.offsetWidth || 400
    const ch = container.clientHeight || container.offsetHeight || 300
    if (cw === 0 || ch === 0) {
      container.style.minHeight = "300px"
    }
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight || (cw / ch), 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)
    this.renderer.setSize(container.clientWidth || cw, container.clientHeight || ch)
    this.renderer.setClearColor(0x000000, 0)
    container.appendChild(this.renderer.domElement)
    const geometry = new THREE.SphereGeometry(5, 64, 64)
    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 512
    const context = canvas.getContext("2d")
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "#87CEEB")
    gradient.addColorStop(0.3, "#228B22")
    gradient.addColorStop(0.7, "#8B4513")
    gradient.addColorStop(1, "#4169E1")
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#228B22"
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 50 + 20
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95,
    })
    this.globe = new THREE.Mesh(geometry, material)
    this.scene.add(this.globe)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    this.scene.add(directionalLight)
    this.camera.position.z = 15
    this.camera.lookAt(0, 0, 0)
    try {
      const OrbitControls = (THREE && THREE.OrbitControls) || window.OrbitControls || (window.THREE && window.THREE.OrbitControls)
      if (typeof OrbitControls === "function") {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        if (this.controls) {
          this.controls.enableDamping = true
          this.controls.dampingFactor = 0.05
          this.controls.minDistance = 8
          this.controls.maxDistance = 25
        }
      } else {
        console.warn("OrbitControls not found. Manual camera control will be disabled.")
      }
    } catch (err) {
      console.warn("Error creating OrbitControls:", err)
    }
    this.animate()
    this._startMarkerAnimation()
    window.addEventListener("resize", () => this.handleResize())
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate())
    try {
      if (this.isRotating && this.globe) {
        this.globe.rotation.y += 0.005
      }
      if (this.controls) {
        this.controls.update()
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    } catch (err) {
      console.error("Error in animate loop:", err)
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    }
  }

  handleResize() {
    const container = document.getElementById("globe")
    if (!container || !this.camera || !this.renderer) return
    const w = container.clientWidth || 400
    const h = container.clientHeight || 300
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  latLonToVector3(lat, lon, radius = 5.1) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)
    return new THREE.Vector3(x, y, z)
  }

  addCityMarker(city, weather) {
    if (!this.scene) return
    const position = this.latLonToVector3(city.lat, city.lon)
    const markerGeometry = new THREE.SphereGeometry(0.12, 8, 8)
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: weather && weather.weather ? 0xff6b6b : 0x4ecdc4,
      transparent: true,
      opacity: 0.9,
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.copy(position)
    marker.userData = {
      city: city,
      weather: weather,
      originalScale: 1,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }
    this.scene.add(marker)
    this.markers.push(marker)
    this.addCityToGrid(city, weather)
  }

  async initSearch() {
    const searchInput = document.getElementById("search-input")
    const searchSuggestions = document.getElementById("search-suggestions")
    if (!searchInput || !searchSuggestions) return
    let searchTimeout
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout)
      const query = e.target.value.trim()
      if (query.length < 2) {
        searchSuggestions.style.display = "none"
        return
      }
      searchTimeout = setTimeout(async () => {
        try {
          const cities = await WeatherAPI.searchCity(query)
          this.showSearchSuggestions(Array.isArray(cities) ? cities : [], searchSuggestions)
        } catch (err) {
          console.error("Search city error:", err)
          this.showSearchSuggestions([], searchSuggestions)
        }
      }, 300)
    })
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box")) {
        searchSuggestions.style.display = "none"
      }
    })
  }

  showSearchSuggestions(cities, container) {
    container.innerHTML = ""
    if (!Array.isArray(cities) || cities.length === 0) {
      container.innerHTML = '<div class="search-suggestion">No cities found</div>'
      container.style.display = "block"
      return
    }
    cities.forEach((city) => {
      const suggestion = document.createElement("div")
      suggestion.className = "search-suggestion"
      suggestion.innerHTML = `
        <strong>${city.name}</strong>
        <small>${city.country || ""}${city.state ? `, ${city.state}` : ""}</small>
      `
      suggestion.addEventListener("click", () => {
        this.selectSearchedCity(city)
        container.style.display = "none"
        const inp = document.getElementById("search-input")
        if (inp) inp.value = city.name
      })
      container.appendChild(suggestion)
    })
    container.style.display = "block"
  }

  async selectSearchedCity(city) {
    if (!city) return
    try {
      const weatherData = await WeatherAPI.getCurrentWeather(city.lat, city.lon)
      const existingCity = this.searchedCities.find(
        (c) => Math.abs(c.lat - city.lat) < 0.1 && Math.abs(c.lon - city.lon) < 0.1,
      )
      if (!existingCity) {
        this.searchedCities.push(city)
        this.addCityMarker(city, weatherData)
      }
      this.focusOnCity(city.lat, city.lon)
    } catch (error) {
      console.error("Error selecting city:", error)
    }
  }

  focusOnCity(lat, lon) {
    if (!this.camera) return
    const position = this.latLonToVector3(lat, lon, 15)
    const startPosition = this.camera.position.clone()
    const endPosition = position.clone()
    const duration = 1000
    const startTime = Date.now()
    const animateCamera = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      this.camera.position.lerpVectors(startPosition, endPosition, easeProgress)
      this.camera.lookAt(0, 0, 0)
      if (progress < 1) {
        requestAnimationFrame(animateCamera)
      }
    }
    animateCamera()
  }

  async loadDefaultCities() {
    const citiesGrid = document.getElementById("cities-grid")
    if (citiesGrid) citiesGrid.innerHTML = '<div class="loading">Loading weather data...</div>'
    try {
      const weatherPromises = DEFAULT_CITIES.map(async (city) => {
        const weather = await WeatherAPI.getCurrentWeather(city.coords[0], city.coords[1])
        return {
          name: city.name,
          country: city.country,
          lat: city.coords[0],
          lon: city.coords[1],
          weather: weather,
        }
      })
      const citiesWithWeather = await Promise.all(weatherPromises)
      citiesWithWeather.forEach((city) => {
        if (city && city.weather) {
          this.addCityMarker(city, city.weather)
        } else if (city) {
          this.addCityMarker(city, null)
        }
      })
      if (citiesGrid) citiesGrid.innerHTML = ""
    } catch (error) {
      console.error("Error loading cities:", error)
      if (citiesGrid) citiesGrid.innerHTML = '<div class="error">Error loading weather data</div>'
    }
  }

  addCityToGrid(city, weather) {
    const citiesGrid = document.getElementById("cities-grid")
    if (!citiesGrid || !city) return
    const loading = citiesGrid.querySelector(".loading")
    if (loading) loading.remove()
    const cityCard = document.createElement("div")
    cityCard.className = "city-card"
    cityCard.setAttribute("data-city", city.name)
    cityCard.innerHTML = `
      <h3>
        ${city.name}
        <span class="country">${city.country || ""}</span>
      </h3>
      <p>Lat: ${Number(city.lat).toFixed(2)}, Lon: ${Number(city.lon).toFixed(2)}</p>
      <div class="weather-info">
        ${
          weather && weather.main
            ? `
          <div class="temp">${Math.round(weather.main.temp)}°C</div>
          <img src="${WeatherAPI.getWeatherIcon(weather.weather[0].icon)}" 
               alt="${weather.weather[0].description}" class="weather-icon">
        `
            : '<div class="temp">--°C</div>'
        }
      </div>
    `
    cityCard.addEventListener("click", () => {
      this.focusOnCity(city.lat, city.lon)
    })
    citiesGrid.appendChild(cityCard)
  }

  setupEventListeners() {
    const resetBtn = document.getElementById("reset-view")
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (this.camera) {
          this.camera.position.set(0, 0, 15)
          this.camera.lookAt(0, 0, 0)
        }
      })
    }
    const rotationBtn = document.getElementById("toggle-rotation")
    if (rotationBtn) {
      rotationBtn.addEventListener("click", () => {
        this.isRotating = !this.isRotating
        rotationBtn.textContent = this.isRotating ? "Pause Rotation" : "Resume Rotation"
      })
    }
    this._startMarkerAnimation()
  }

  _startMarkerAnimation() {
    const animateMarkers = () => {
      this.markers.forEach((marker) => {
        if (marker.userData) {
          const time = Date.now() * marker.userData.pulseSpeed
          const scale = 1 + Math.sin(time) * 0.3
          marker.scale.setScalar(scale)
        }
      })
      this._markerAnimationId = requestAnimationFrame(animateMarkers)
    }
    if (!this._markerAnimationId) animateMarkers()
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    if (this._markerAnimationId) {
      cancelAnimationFrame(this._markerAnimationId)
      this._markerAnimationId = null
    }
    if (this.renderer) {
      try {
        this.renderer.forceContextLoss()
        this.renderer.domElement = null
        this.renderer.dispose()
      } catch (err) {}
    }
    if (this.scene) {
      this.markers.forEach((marker) => {
        this.scene.remove(marker)
      })
    }
    this.markers = []
  }
}

window.locations = new Locations()

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => window.locations.init())
} else {
  window.locations.init()
}