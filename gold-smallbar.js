/**
 * Constants and Configurations
 */
const CONFIG = {
  BAHT_TO_GRAM: 15.244,
  UPDATE_INTERVAL: 30000,
  API_BASE_URL: "http://27.254.3.14:8082/api/v1/products",
  PRODUCTS_LIMIT: 12,
}

// ค่าเริ่มต้นสำหรับแต่ละประเภท
const defaultTypes = {
  "03gram": {
    weight: 0.3,
    apiPath: "gold-03g",
    title: "ราคาทองคำ 0.3 กรัม",
  },
  "06gram": {
    weight: 0.6,
    apiPath: "gold-06g",
    title: "ราคาทอง 0.6 กรัม",
  },
  "1gram": {
    weight: 1.0,
    apiPath: "gold-1g",
    title: "ราคาทอง 1 กรัม",
  },
  "0125baht": {
    weight: 1.9,
    apiPath: "gold-0125baht",
    title: "ราคาทองครึ่งสลึง",
  },
  "025baht": {
    weight: 3.8,
    apiPath: "gold-025baht",
    title: "ราคาทอง 1 สลึง",
  },
  "05baht": {
    weight: 7.6,
    apiPath: "gold-05baht",
    title: "ราคาทอง 2 สลึง",
  },
  "1baht": {
    weight: 15.2,
    apiPath: "gold-1baht",
    title: "ราคาทอง 1 บาท",
  },
  "2baht": {
    weight: 30.4,
    apiPath: "gold-2baht",
    title: "ราคาทอง 2 บาท",
  },
  gold9999: {
    weight: 1.0,
    apiPath: "gold-9999",
    title: "ราคาทองคำ 99.99%",
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
    // Check date format and convert if needed
    let day, month, year
    if (dateStr.includes("-")) {
      // Format: YYYY-MM-DD
      ;[year, month, day] = dateStr.split("-")
    } else {
      // Format: DD/MM/YYYY
      ;[day, month, year] = dateStr.split("/")
    }

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
      productElement.innerHTML = `<img src="${product.image_url}" alt="${
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
    const goldType = utils.getGoldTypeFromElement(containerElement)

    // Update page title
    const titleElement = containerElement.querySelector(".xd9b-header h1")
    if (titleElement) titleElement.textContent = goldType.title

    // Update price notes
    this.updatePriceNotes(goldType, containerElement)

    try {
      const response = await fetch("http://27.254.3.14:7005/api/gold")
      const data = await response.json()
      console.log("API Response:", data) // Debug log

      this.updatePrices(data, goldType, containerElement)
      this.updateDateTime(data, containerElement)
    } catch (error) {
      console.error("Error fetching gold prices:", error)
      this.showError(containerElement)
    }
  },

  updatePrices(data, goldType, containerElement) {
    if (goldType.is9999) {
      // For 99.99% gold, price is already per gram
      const sellPrice = utils.roundPrice(data.G9999B.offer * goldType.weight)
      const buyPrice = utils.roundPrice(data.G9999B.bid * goldType.weight)
      const ornamentPrice = utils.roundPrice(buyPrice * 0.95)

      this.updatePriceElements(
        {
          sell: sellPrice,
          bar: buyPrice,
          ornament: ornamentPrice,
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

    // เลือกใช้ข้อมูลวันที่และเวลาตามประเภททอง
    const goldType = utils.getGoldTypeFromElement(containerElement)
    const priceData = goldType.is9999 ? data.G9999B : data.G965BNewAsso

    if (priceData) {
      const thaiDate = utils.formatThaiDate(priceData.date)
      if (dateElement) dateElement.textContent = `ประจำวันที่ ${thaiDate}`
      if (timeElement) timeElement.textContent = `เวลา: ${priceData.time} น.`
    } else {
      if (dateElement) dateElement.textContent = "ไม่สามารถโหลดข้อมูลได้"
      if (timeElement) timeElement.textContent = "ไม่สามารถโหลดข้อมูลได้"
    }
  },

  // Only keep this version of updatePriceNotes
  updatePriceNotes(goldType, containerElement) {
    const priceNotes = containerElement.querySelectorAll(".xd9b-priceNote")
    const [sellNote, barNote, ornamentNote] = priceNotes

    // Weight text formatting function with all possible weights
    const getWeightText = (weight, is9999 = false) => {
      // กรณีทองคำ 99.99%
      if (is9999) {
        // ตรวจสอบน้ำหนักและแปลงเป็นหน่วยบาท
        switch (weight) {
          case 15.244:
            return "1 บาท"
          case 7.622:
            return "ครึ่งบาท"
          case 3.811:
            return "1 สลึง"
          case 1.9055:
            return "ครึ่งสลึง"
          case 1:
            return "1 บาท" // กรณีน้ำหนัก 1 กรัม ให้แสดงเป็น 1 บาท
          case 0.5:
            return "ครึ่งบาท" // กรณี 0.5 กรัม
          case 0.25:
            return "1 สลึง" // กรณี 0.25 กรัม
          default:
            return `${weight} บาท` // กรณีอื่นๆ ให้แสดงเป็นบาท
        }
      }

      // กรณีทองคำปกติ
      if (weight === 0.3) return "0.3 กรัม"
      if (weight === 0.6) return "0.6 กรัม"
      if (weight === 1.0) return "1 กรัม"
      if (weight === 1.9) return "ครึ่งสลึง"
      if (weight === 3.8) return "1 สลึง"
      if (weight === 7.6) return "2 สลึง"
      if (weight === 15.2) return "1 บาท"
      if (weight === 30.4) return "2 บาท"
      return `${weight} กรัม`
    }

    // Get weight text based on gold type
    const weightText = getWeightText(goldType.weight, goldType.is9999)

    // Update each price note with fixed formats
    if (sellNote) {
      sellNote.textContent = "(ยังไม่รวมค่าบล้อคหรือค่ากำเหน็จ)"
    }

    if (barNote) {
      if (goldType.is9999) {
        barNote.textContent = `(เอาทองคำแท่ง 99.99% ${weightText} ไปขายคืนร้านทอง)`
      } else {
        barNote.textContent = `(เอาทองแท่ง ${weightText} ไปขายคืนร้านทอง)`
      }
    }

    if (ornamentNote) {
      if (goldType.is9999) {
        ornamentNote.textContent = `(เอาทองคำแท่ง 99.99% ${weightText} ไปขายคืนร้านทอง)`
      } else {
        ornamentNote.textContent = `(เอาแหวนทอง ${weightText} ไปขายคืนร้านทอง)`
      }
    }
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
  setInterval(() => {
    goldPricesHandler.fetchPrices(containerElement)
    productsHandler.loadProducts(containerElement, goldType)
  }, CONFIG.UPDATE_INTERVAL)
}

// Initialize all gold price components on the page
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".xd9b-mainWrapper").forEach((container) => {
    initGoldPriceComponent(container)
  })
})
