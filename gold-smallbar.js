/**
 * Constants and Configurations
 */
const CONFIG = {
  BAHT_TO_GRAM: 15.244,
  UPDATE_INTERVAL: 30000,
  API_BASE_URL: "http://192.168.46.240/api/v1/products",
  PRODUCTS_LIMIT: 12,
}

// ค่าเริ่มต้นสำหรับแต่ละประเภท
const defaultTypes = {
  "03gram": {
    weight: 0.3,
    apiPath: "gold-03g",
    title: "ราคาทองคำ 0.3 กรัม",
    priceNote: "เอาทอง 0.3 กรัมไปขายคืนร้านทอง",
  },
  "06gram": {
    weight: 0.6,
    apiPath: "gold-06g",
    title: "ราคาทอง 0.6 กรัม",
    priceNote: "เอาทอง 0.6 กรัมไปขายคืนร้านทอง",
  },
  "1gram": {
    weight: 1.0,
    apiPath: "gold-1g",
    title: "ราคาทอง 1 กรัม",
    priceNote: "เอาทอง 1 กรัมไปขายคืนร้านทอง",
  },
  "0125baht": {
    weight: 1.9,
    apiPath: "gold-0125baht",
    title: "ราคาทองครึ่งสลึง",
    priceNote: "เอาทองครึ่งสลึงไปขายคืนร้านทอง",
  },
  "025baht": {
    weight: 3.8,
    apiPath: "gold-025baht",
    title: "ราคาทอง 1 สลึง",
    priceNote: "เอาทอง 1 สลึงไปขายคืนร้านทอง",
  },
  "05baht": {
    weight: 7.6,
    apiPath: "gold-05baht",
    title: "ราคาทอง 2 สลึง",
    priceNote: "เอาทอง 2 สลึงไปขายคืนร้านทอง",
  },
  "1baht": {
    weight: 15.2,
    apiPath: "gold-1baht",
    title: "ราคาทอง 1 บาท",
    priceNote: "เอาทอง 1 บาทไปขายคืนร้านทอง",
  },
  "2baht": {
    weight: 30.4,
    apiPath: "gold-2baht",
    title: "ราคาทอง 2 บาท",
    priceNote: "เอาทอง 2 บาทไปขายคืนร้านทอง",
  },
  gold9999: {
    weight: 1.0,
    apiPath: "gold-9999",
    title: "ราคาทองคำ 99.99%",
    priceNote: "ทองคำแท่ง 99.99%",
    is9999: true,
  },
}

/**
 * Utility Functions
 */
const utils = {
  roundPrice(price) {
    return Math.floor(price + (price % 1 > 0.5 ? 1 : 0))
  },

  formatThaiDate(dateStr) {
    const [day, month, year] = dateStr.split("/")
    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ]
    const buddhistYear = parseInt(year) + (parseInt(year) > 2500 ? 0 : 543)
    return `${parseInt(day)} ${thaiMonths[parseInt(month) - 1]} ${buddhistYear}`
  },

  formatPrice(price) {
    return Math.round(Number(price)).toLocaleString("th-TH")
  },

  getGoldTypeFromElement(element) {
    // ดึงประเภททองจาก data-type
    const type = element.dataset.type || "03gram"

    // ดึงค่าเริ่มต้นของประเภทที่เลือก
    const defaultValues = defaultTypes[type] || defaultTypes["03gram"]

    // คืนค่าโดยใช้ค่าที่กำหนดใน data attributes ถ้ามี หรือใช้ค่าเริ่มต้นถ้าไม่ได้กำหนด
    return {
      weight: parseFloat(element.dataset.weight || defaultValues.weight),
      apiPath: element.dataset.apiPath || defaultValues.apiPath,
      title: element.dataset.title || defaultValues.title,
      priceNote: element.dataset.priceNote || defaultValues.priceNote,
      is9999: type === "gold9999",
    }
  },
}

/**
 * Modal Handler
 */
const modalHandler = {
  init(containerElement) {
    this.modal = containerElement.querySelector("#xd9b-modal")
    this.modalImage = containerElement.querySelector("#xd9b-modal-image")
    this.modalClose = containerElement.querySelector(".xd9b-modal-close")
    this.setupEventListeners()
  },

  setupEventListeners() {
    this.modalClose?.addEventListener("click", () => this.close())
    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close()
    })
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close()
    })
  },

  open(imageUrl) {
    this.modalImage.src = imageUrl
    this.modal.classList.add("active")
  },

  close() {
    this.modal.classList.remove("active")
    this.modalImage.src = ""
  },
}

/**
 * Products Handler
 */
const productsHandler = {
  async loadProducts(containerElement, goldType) {
    const loadingElement = containerElement.querySelector("#xd9b-loading")
    const errorElement = containerElement.querySelector("#xd9b-error")
    const productContainer = containerElement.querySelector(
      "#xd9b-productContainer"
    )

    if (!productContainer) return

    try {
      loadingElement.style.display = "block"
      errorElement.style.display = "none"

      const response = await fetch(
        `${CONFIG.API_BASE_URL}/${goldType.apiPath}?limit=${CONFIG.PRODUCTS_LIMIT}`
      )
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)

      const products = await response.json()
      this.renderProducts(products, productContainer, containerElement)
    } catch (error) {
      console.error("Error loading products:", error)
      errorElement.style.display = "block"
    } finally {
      loadingElement.style.display = "none"
    }
  },

  renderProducts(products, container, parentContainer) {
    container.innerHTML = ""

    products.forEach((product) => {
      const productElement = document.createElement("div")
      productElement.className = "xd9b-productItem"
      productElement.innerHTML = `
                <img src="${product.image_url}" alt="${
        product.name
      }" class="xd9b-productImage">
                <div class="xd9b-productDetails">
                    <h3 class="xd9b-productName">${product.name}</h3>
                    <div class="xd9b-productPrice">${utils.formatPrice(
                      product.price
                    )} บาท</div>
                    <div class="xd9b-buttonContainer">
                        <a href="${product.product_url}" 
                           class="xd9b-buyButton" 
                           target="_blank" 
                           rel="noopener noreferrer">ซื้อเลย</a>
                    </div>
                </div>
            `

      const productImage = productElement.querySelector(".xd9b-productImage")
      const modalInstance = Object.create(modalHandler)
      modalInstance.init(parentContainer)
      productImage.addEventListener("click", () =>
        modalInstance.open(product.image_url)
      )
      container.appendChild(productElement)
    })
  },
}

/**
 * Gold Prices Handler
 */
const goldPricesHandler = {
  async fetchPrices(containerElement) {
    try {
      const response = await fetch("http://27.254.3.14:7005/api/gold")
      const data = await response.json()
      const goldType = utils.getGoldTypeFromElement(containerElement)

      // Update page title
      const titleElement = containerElement.querySelector(".xd9b-header h1")
      if (titleElement) titleElement.textContent = goldType.title

      this.updatePrices(data, goldType, containerElement)
      this.updateDateTime(data, containerElement)
      this.updatePriceNotes(goldType, containerElement)
    } catch (error) {
      console.error("Error fetching gold prices:", error)
      this.showError(containerElement)
    }
  },

  updatePrices(data, goldType, containerElement) {
    if (goldType.is9999) {
      const sellPrice = utils.roundPrice(
        (data.G9999B.offer / CONFIG.BAHT_TO_GRAM) * goldType.weight
      )
      const buyPrice = utils.roundPrice(
        (data.G9999B.bid / CONFIG.BAHT_TO_GRAM) * goldType.weight
      )

      this.updatePriceElements(
        {
          sell: sellPrice,
          bar: buyPrice,
          ornament: buyPrice,
        },
        containerElement
      )
    } else {
      const sellPrice = utils.roundPrice(
        (data.G965BNewAsso.offer965 / CONFIG.BAHT_TO_GRAM) * goldType.weight
      )
      const barPrice = utils.roundPrice(
        (data.G965BNewAsso.bid965 / CONFIG.BAHT_TO_GRAM) * goldType.weight
      )
      const ornamentPrice = utils.roundPrice(barPrice * 0.95)

      this.updatePriceElements(
        {
          sell: sellPrice,
          bar: barPrice,
          ornament: ornamentPrice,
        },
        containerElement
      )
    }
  },

  updatePriceElements(prices, containerElement) {
    const elements = {
      sell: containerElement.querySelector("#sellPrice"),
      bar: containerElement.querySelector("#barPrice"),
      ornament: containerElement.querySelector("#ornamentPrice"),
    }

    if (elements.sell)
      elements.sell.textContent = `${utils.formatPrice(prices.sell)} บาท`
    if (elements.bar)
      elements.bar.textContent = `${utils.formatPrice(prices.bar)} บาท`
    if (elements.ornament)
      elements.ornament.textContent = `${utils.formatPrice(
        prices.ornament
      )} บาท`
  },

  updateDateTime(data, containerElement) {
    const dateElement = containerElement.querySelector("#updateDate")
    const timeElement = containerElement.querySelector("#updateTime")

    const thaiDate = utils.formatThaiDate(data.G965BNewAsso.date)
    if (dateElement) dateElement.textContent = `ประจำวันที่ ${thaiDate}`
    if (timeElement)
      timeElement.textContent = `เวลา: ${data.G965BNewAsso.time} น.`
  },

  updatePriceNotes(goldType, containerElement) {
    containerElement.querySelectorAll(".xd9b-priceNote").forEach((element) => {
      element.textContent = `(${goldType.priceNote})`
    })
  },

  showError(containerElement) {
    const errorMessage = "ไม่สามารถโหลดข้อมูลได้"
    ;["sellPrice", "barPrice", "ornamentPrice"].forEach((id) => {
      const element = containerElement.querySelector(`#${id}`)
      if (element) element.textContent = errorMessage
    })

    const dateElement = containerElement.querySelector("#updateDate")
    const timeElement = containerElement.querySelector("#updateTime")
    if (dateElement) dateElement.textContent = errorMessage
    if (timeElement) timeElement.textContent = errorMessage
  },
}

/**
 * Initialize Gold Price Component
 */
function initGoldPriceComponent(containerElement) {
  const goldType = utils.getGoldTypeFromElement(containerElement)

  // Initialize handlers
  const modalInstance = Object.create(modalHandler)
  modalInstance.init(containerElement)

  // Load initial data
  goldPricesHandler.fetchPrices(containerElement)
  productsHandler.loadProducts(containerElement, goldType)

  // Set up auto-refresh
  setInterval(
    () => goldPricesHandler.fetchPrices(containerElement),
    CONFIG.UPDATE_INTERVAL
  )
}

// Initialize all gold price components on the page
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".xd9b-mainWrapper").forEach((container) => {
    initGoldPriceComponent(container)
  })
})
