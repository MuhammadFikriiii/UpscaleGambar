class AIImageUpscaler {
  constructor() {
    this.originalImage = null
    this.selectedScale = 2
    this.isProcessing = false
    this.originalFileName = ""
    this.selectedOperation = "upscale"
    this.selectedFormat = "png"

    this.initializeElements()
    this.bindEvents()
    this.setupDragAndDrop()

    console.log("🚀 AI Image Upscaler initialized")
  }

  initializeElements() {
    // Get all DOM elements
    this.imageInput = document.getElementById("imageInput")
    this.dropZone = document.getElementById("dropZone")
    this.imagePreview = document.getElementById("imagePreview")
    this.originalImageEl = document.getElementById("originalImage")
    this.imageInfo = document.getElementById("imageInfo")
    this.processBtn = document.getElementById("processBtn")
    this.processingSection = document.getElementById("processingSection")
    this.progressBar = document.getElementById("progressBar")
    this.progressText = document.getElementById("progressText")
    this.resultsSection = document.getElementById("resultsSection")
    this.resultCanvas = document.getElementById("resultCanvas")
    this.downloadBtn = document.getElementById("downloadBtn")
    this.newImageBtn = document.getElementById("newImageBtn")
    this.originalCompare = document.getElementById("originalCompare")
    this.originalSize = document.getElementById("originalSize")
    this.upscaledSize = document.getElementById("upscaledSize")
    this.formatSelection = document.getElementById("formatSelection")
    this.scaleSelection = document.getElementById("scaleSelection")
    this.processBtnText = document.getElementById("processBtnText")
    this.resultTitle = document.getElementById("resultTitle")
  }

  bindEvents() {
    // File input change
    this.imageInput.addEventListener("change", (e) => this.handleImageUpload(e))

    // Scale selection
    document.querySelectorAll('input[name="scale"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.selectedScale = Number.parseInt(e.target.value)
        console.log(`📏 Scale selected: ${this.selectedScale}x`)
      })
    })

    // Operation type selection
    document.querySelectorAll('input[name="operation"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.selectedOperation = e.target.value
        this.toggleOperationUI()
        console.log(`⚙️ Operation selected: ${this.selectedOperation}`)
      })
    })

    // Format selection
    document.querySelectorAll('input[name="format"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.selectedFormat = e.target.value
        console.log(`📁 Format selected: ${this.selectedFormat}`)
      })
    })

    // Process button
    this.processBtn.addEventListener("click", () => this.processImage())

    // Download button
    this.downloadBtn.addEventListener("click", () => this.downloadResult())

    // New image button
    this.newImageBtn.addEventListener("click", () => this.resetApp())
  }

  toggleOperationUI() {
    if (this.selectedOperation === "convert") {
      this.formatSelection.classList.remove("hidden")
      this.scaleSelection.classList.add("hidden")
      this.processBtnText.textContent = "Start Format Conversion"

      // Set default format
      setTimeout(() => {
        const defaultFormat = document.querySelector('input[name="format"][value="png"]')
        if (defaultFormat) {
          defaultFormat.checked = true
          this.selectedFormat = "png"
        }
      }, 100)
    } else {
      this.formatSelection.classList.add("hidden")
      this.scaleSelection.classList.remove("hidden")
      this.processBtnText.textContent = "Start AI Upscaling"
    }
  }

  setupDragAndDrop() {
    if (this.dropZone) {
      this.dropZone.addEventListener("dragenter", this.handleDragEnter.bind(this), false)
      this.dropZone.addEventListener("dragover", this.handleDragOver.bind(this), false)
      this.dropZone.addEventListener("dragleave", this.handleDragLeave.bind(this), false)
      this.dropZone.addEventListener("drop", this.handleDrop.bind(this), false)
    }
  }

  handleDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()
    this.highlight()
  }

  handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    this.highlight()
  }

  handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    this.unhighlight()
  }

  handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    this.unhighlight()

    const dt = e.dataTransfer
    const files = dt.files

    if (files.length > 0) {
      this.handleFile(files[0])
    }
  }

  highlight() {
    if (this.dropZone) {
      this.dropZone.classList.add("border-cyan-400", "bg-cyan-400/10")
    }
  }

  unhighlight() {
    if (this.dropZone) {
      this.dropZone.classList.remove("border-cyan-400", "bg-cyan-400/10")
    }
  }

  handleImageUpload(event) {
    const file = event.target.files[0]
    if (file) {
      this.handleFile(file)
    }
  }

  handleFile(file) {
    console.log("📁 File selected:", file.name)
    this.originalFileName = file.name

    if (!this.validateFile(file)) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      this.loadImage(e.target.result, file)
    }
    reader.readAsDataURL(file)
  }

  validateFile(file) {
    if (!file.type.startsWith("image/")) {
      this.showError("❌ File harus berupa gambar (JPG, PNG, WebP)")
      return false
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      this.showError("❌ Ukuran file terlalu besar. Maksimal 10MB")
      return false
    }

    return true
  }

  loadImage(src, file) {
    this.originalImage = new Image()
    this.originalImage.onload = () => {
      console.log(`🖼️ Image loaded: ${this.originalImage.width}x${this.originalImage.height}`)
      this.displayImagePreview(src, file)
    }
    this.originalImage.onerror = () => {
      this.showError("❌ Gagal memuat gambar. Coba file lain.")
    }
    this.originalImage.src = src
  }

  displayImagePreview(src, file) {
    // Force show image preview section first
    this.imagePreview.classList.remove("hidden")
    this.imagePreview.style.display = "block"

    // Force clear dan set gambar dengan multiple attempts
    this.originalImageEl.style.display = "none"
    this.originalCompare.style.display = "none"

    this.originalImageEl.src = ""
    this.originalCompare.src = ""

    // Set gambar baru dengan delay bertingkat
    setTimeout(() => {
      this.originalImageEl.src = src
      this.originalImageEl.style.display = ""
      this.originalImageEl.onload = () => {
        console.log("✅ Original image displayed")
      }
    }, 100)

    setTimeout(() => {
      this.originalCompare.src = src
      this.originalCompare.style.display = ""
      this.originalCompare.onload = () => {
        console.log("✅ Compare image displayed")
      }
    }, 150)

    const fileSizeKB = (file.size / 1024).toFixed(1)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    const sizeText = file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`

    this.imageInfo.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
      <span class="bg-cyan-500/20 px-3 py-1 rounded-lg text-xs">
        📐 ${this.originalImage.width} × ${this.originalImage.height}
      </span>
      <span class="bg-purple-500/20 px-3 py-1 rounded-lg text-xs">
        💾 ${sizeText}
      </span>
      <span class="bg-green-500/20 px-3 py-1 rounded-lg text-xs">
        📁 ${file.name}
      </span>
    </div>
  `

    this.originalSize.textContent = `${this.originalImage.width} × ${this.originalImage.height}`

    // Reset dan set default scale
    document.querySelectorAll('input[name="scale"]').forEach((radio) => {
      radio.checked = false
    })

    setTimeout(() => {
      document.querySelector('input[name="scale"][value="2"]').checked = true
      this.selectedScale = 2
    }, 200)

    console.log("✅ Image preview setup completed")
  }

  async processImage() {
    if (!this.originalImage || this.isProcessing) {
      console.log("⚠️ No image or already processing")
      return
    }

    this.isProcessing = true

    if (this.selectedOperation === "convert") {
      console.log(`🔄 Starting format conversion to ${this.selectedFormat.toUpperCase()}`)
      await this.processConversion()
    } else {
      console.log(`🚀 Starting ${this.selectedScale}x upscale process`)
      await this.processUpscaling()
    }
  }

  async processUpscaling() {
    this.imagePreview.style.display = "none"
    this.processingSection.classList.remove("hidden")
    this.resultsSection.classList.add("hidden")

    try {
      this.updateProgress(0, "Preparing image...")
      await this.delay(500)

      this.updateProgress(20, "Creating canvas...")
      const sourceCanvas = this.createCanvasFromImage(this.originalImage)
      await this.delay(300)

      this.updateProgress(40, "Starting AI upscaling...")
      const upscaledCanvas = await this.performUpscaling(sourceCanvas, this.selectedScale)

      this.updateProgress(100, "Complete! 🎉")
      await this.delay(800)

      this.displayResults(upscaledCanvas, "upscale")
    } catch (error) {
      console.error("❌ Error during processing:", error)
      this.showError("❌ Terjadi kesalahan saat memproses gambar. Silakan coba lagi.")
      this.resetProcessing()
    }
  }

  async processConversion() {
    this.imagePreview.style.display = "none"
    this.processingSection.classList.remove("hidden")
    this.resultsSection.classList.add("hidden")

    try {
      this.updateProgress(0, "Preparing conversion...")
      await this.delay(500)

      this.updateProgress(30, "Creating canvas...")
      const sourceCanvas = this.createCanvasFromImage(this.originalImage)
      await this.delay(300)

      this.updateProgress(60, `Converting to ${this.selectedFormat.toUpperCase()}...`)
      await this.delay(800)

      this.updateProgress(100, "Conversion complete! 🎉")
      await this.delay(500)

      this.displayResults(sourceCanvas, "convert")
    } catch (error) {
      console.error("❌ Error during conversion:", error)
      this.showError("❌ Terjadi kesalahan saat mengkonversi gambar. Silakan coba lagi.")
      this.resetProcessing()
    }
  }

  createCanvasFromImage(img) {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = img.width
    canvas.height = img.height

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(img, 0, 0)
    return canvas
  }

  async performUpscaling(sourceCanvas, scale) {
    const originalWidth = sourceCanvas.width
    const originalHeight = sourceCanvas.height
    const newWidth = originalWidth * scale
    const newHeight = originalHeight * scale

    console.log(`📏 Upscaling from ${originalWidth}x${originalHeight} to ${newWidth}x${newHeight}`)

    const resultCanvas = document.createElement("canvas")
    const resultCtx = resultCanvas.getContext("2d")

    resultCanvas.width = newWidth
    resultCanvas.height = newHeight

    const sourceCtx = sourceCanvas.getContext("2d")
    const sourceImageData = sourceCtx.getImageData(0, 0, originalWidth, originalHeight)
    const sourceData = sourceImageData.data

    const resultImageData = resultCtx.createImageData(newWidth, newHeight)
    const resultData = resultImageData.data

    await this.bicubicUpscale(sourceData, originalWidth, originalHeight, resultData, newWidth, newHeight, scale)

    resultCtx.putImageData(resultImageData, 0, 0)
    return resultCanvas
  }

  async bicubicUpscale(sourceData, srcWidth, srcHeight, resultData, dstWidth, dstHeight, scale) {
    const totalPixels = dstWidth * dstHeight
    let processedPixels = 0
    const batchSize = scale >= 8 ? 5000 : 10000

    for (let y = 0; y < dstHeight; y++) {
      for (let x = 0; x < dstWidth; x++) {
        const srcX = x / scale
        const srcY = y / scale

        const color = this.bicubicInterpolate(sourceData, srcWidth, srcHeight, srcX, srcY, scale)

        const dstIndex = (y * dstWidth + x) * 4
        resultData[dstIndex] = color.r
        resultData[dstIndex + 1] = color.g
        resultData[dstIndex + 2] = color.b
        resultData[dstIndex + 3] = color.a

        processedPixels++

        if (processedPixels % batchSize === 0) {
          const progress = 40 + (processedPixels / totalPixels) * 50
          this.updateProgress(progress, `Processing pixels... ${Math.round((processedPixels / totalPixels) * 100)}%`)
          await this.delay(1)
        }
      }
    }
  }

  bicubicInterpolate(data, width, height, x, y, scale = 2) {
    const x1 = Math.floor(x)
    const y1 = Math.floor(y)
    const dx = x - x1
    const dy = y - y1

    const pixels = []
    for (let j = -1; j <= 2; j++) {
      for (let i = -1; i <= 2; i++) {
        const px = Math.max(0, Math.min(width - 1, x1 + i))
        const py = Math.max(0, Math.min(height - 1, y1 + j))
        const index = (py * width + px) * 4
        pixels.push({
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
          a: data[index + 3],
        })
      }
    }

    const result = { r: 0, g: 0, b: 0, a: 0 }
    const compressionFactor = scale >= 8 ? 0.95 : 1.0

    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) {
        const weight = this.cubicWeight(i - 1 - dx) * this.cubicWeight(j - 1 - dy)
        const pixel = pixels[j * 4 + i]

        result.r += pixel.r * weight
        result.g += pixel.g * weight
        result.b += pixel.b * weight
        result.a += pixel.a * weight
      }
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(result.r * compressionFactor))),
      g: Math.max(0, Math.min(255, Math.round(result.g * compressionFactor))),
      b: Math.max(0, Math.min(255, Math.round(result.b * compressionFactor))),
      a: Math.max(0, Math.min(255, Math.round(result.a))),
    }
  }

  cubicWeight(t) {
    const absT = Math.abs(t)
    if (absT <= 1) {
      return 1.5 * absT * absT * absT - 2.5 * absT * absT + 1
    } else if (absT <= 2) {
      return -0.5 * absT * absT * absT + 2.5 * absT * absT - 4 * absT + 2
    }
    return 0
  }

  displayResults(resultCanvas, operationType) {
    this.resultCanvas.width = resultCanvas.width
    this.resultCanvas.height = resultCanvas.height

    const ctx = this.resultCanvas.getContext("2d")
    ctx.drawImage(resultCanvas, 0, 0)

    if (operationType === "convert") {
      this.upscaledSize.textContent = `${resultCanvas.width} × ${resultCanvas.height} (${this.selectedFormat.toUpperCase()})`
      this.resultTitle.textContent = "Format Converted"
    } else {
      this.upscaledSize.textContent = `${resultCanvas.width} × ${resultCanvas.height}`
      this.resultTitle.textContent = "AI Upscaled"
    }

    this.resultImageData = resultCanvas
    this.operationType = operationType

    this.processingSection.classList.add("hidden")
    this.resultsSection.classList.remove("hidden")

    this.isProcessing = false

    if (operationType === "convert") {
      console.log(`✅ Format conversion to ${this.selectedFormat.toUpperCase()} completed successfully!`)
    } else {
      console.log("✅ Upscaling completed successfully!")
    }
  }

  updateProgress(percent, text) {
    this.progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`
    this.progressText.textContent = text
  }

  downloadResult() {
    if (!this.resultImageData) {
      this.showError("❌ Tidak ada hasil untuk diunduh")
      return
    }

    console.log("💾 Starting download...")

    const originalName = this.originalFileName.replace(/\.[^/.]+$/, "")
    let filename,
      mimeType,
      quality = 0.9

    if (this.operationType === "convert") {
      // For conversion, use selected format
      switch (this.selectedFormat) {
        case "png":
          mimeType = "image/png"
          filename = `${originalName}_converted.png`
          quality = 1.0
          break
        case "webp":
          mimeType = "image/webp"
          filename = `${originalName}_converted.webp`
          quality = 0.9
          break
        case "jpeg":
          mimeType = "image/jpeg"
          filename = `${originalName}_converted.jpg`
          quality = 0.9
          break
      }
    } else {
      // For upscaling, use original format
      const originalExtension = this.originalFileName.split(".").pop().toLowerCase()

      switch (originalExtension) {
        case "png":
          mimeType = "image/png"
          filename = `${originalName}_upscaled_${this.selectedScale}x.png`
          quality = 1.0
          break
        case "webp":
          mimeType = "image/webp"
          filename = `${originalName}_upscaled_${this.selectedScale}x.webp`
          break
        default:
          mimeType = "image/jpeg"
          filename = `${originalName}_upscaled_${this.selectedScale}x.jpg`
      }
    }

    this.resultImageData.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(1)

          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          console.log(`✅ Download completed - ${fileSizeMB}MB`)
          this.showSuccess(`📁 Downloaded: ${filename} (${fileSizeMB}MB)`)
        } else {
          this.showError("❌ Gagal membuat file download")
        }
      },
      mimeType,
      quality,
    )
  }

  resetApp() {
    console.log("🔄 Resetting application...")

    // Reset form dan UI dengan force
    this.imageInput.value = ""
    this.imagePreview.classList.add("hidden")
    this.processingSection.classList.add("hidden")
    this.resultsSection.classList.add("hidden")

    // Reset semua state
    this.originalImage = null
    this.resultImageData = null
    this.selectedScale = 2
    this.selectedOperation = "upscale"
    this.selectedFormat = "png"
    this.operationType = null
    this.isProcessing = false
    this.originalFileName = ""

    // Force clear gambar dengan multiple methods
    if (this.originalImageEl) {
      this.originalImageEl.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      this.originalImageEl.removeAttribute("src")
      this.originalImageEl.style.display = "none"
      setTimeout(() => {
        this.originalImageEl.style.display = ""
      }, 100)
    }

    if (this.originalCompare) {
      this.originalCompare.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      this.originalCompare.removeAttribute("src")
      this.originalCompare.style.display = "none"
      setTimeout(() => {
        this.originalCompare.style.display = ""
      }, 100)
    }

    // Reset info text
    if (this.imageInfo) {
      this.imageInfo.innerHTML = ""
    }
    if (this.originalSize) {
      this.originalSize.textContent = ""
    }
    if (this.upscaledSize) {
      this.upscaledSize.textContent = ""
    }

    // Reset canvas
    if (this.resultCanvas)
      if (this.resultCanvas) {
        // Reset canvas
        const ctx = this.resultCanvas.getContext("2d")
        ctx.clearRect(0, 0, this.resultCanvas.width, this.resultCanvas.height)
        this.resultCanvas.width = 0
        this.resultCanvas.height = 0
      }

    // Reset radio buttons
    const radioButtons = document.querySelectorAll('input[name="scale"]')
    radioButtons.forEach((radio) => {
      radio.checked = false
    })

    // Reset operation and format radio buttons
    const operationButtons = document.querySelectorAll('input[name="operation"]')
    operationButtons.forEach((radio) => {
      radio.checked = false
    })

    const formatButtons = document.querySelectorAll('input[name="format"]')
    formatButtons.forEach((radio) => {
      radio.checked = false
    })

    // Hide format selection and show scale selection
    if (this.formatSelection) {
      this.formatSelection.classList.add("hidden")
    }
    if (this.scaleSelection) {
      this.scaleSelection.classList.remove("hidden")
    }

    // Reset progress
    if (this.progressBar) {
      this.progressBar.style.width = "0%"
    }
    if (this.progressText) {
      this.progressText.textContent = "Initializing AI model..."
    }

    // Force refresh file input dengan cara yang lebih agresif
    const parent = this.imageInput.parentNode
    const newInput = document.createElement("input")
    newInput.type = "file"
    newInput.id = "imageInput"
    newInput.accept = "image/*"
    newInput.className = "hidden"

    parent.removeChild(this.imageInput)
    parent.appendChild(newInput)
    this.imageInput = newInput

    // Re-bind event untuk input yang baru
    this.imageInput.addEventListener("change", (e) => this.handleImageUpload(e))

    // Set default scale setelah delay
    setTimeout(() => {
      const defaultRadio = document.querySelector('input[name="scale"][value="2"]')
      if (defaultRadio) {
        defaultRadio.checked = true
        this.selectedScale = 2
      }

      // Set default operation
      const defaultOperation = document.querySelector('input[name="operation"][value="upscale"]')
      if (defaultOperation) {
        defaultOperation.checked = true
        this.selectedOperation = "upscale"
      }

      // Update button text
      if (this.processBtnText) {
        this.processBtnText.textContent = "Start AI Upscaling"
      }

      // Reset result title
      if (this.resultTitle) {
        this.resultTitle.textContent = "AI Upscaled"
      }
    }, 200)

    window.scrollTo({ top: 0, behavior: "smooth" })

    console.log("✅ Application reset completed")
    this.showSuccess("🔄 Ready for new image!")
  }

  resetProcessing() {
    this.processingSection.classList.add("hidden")
    this.imagePreview.style.display = "block"
    this.isProcessing = false
  }

  showError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className =
      "fixed top-4 left-4 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 transform -translate-x-full transition-transform duration-300"
    errorDiv.textContent = message

    document.body.appendChild(errorDiv)

    setTimeout(() => {
      errorDiv.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      errorDiv.style.transform = "-translateX(full)"
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv)
        }
      }, 300)
    }, 5000)

    console.error(message)
  }

  showSuccess(message) {
    const successDiv = document.createElement("div")
    successDiv.className =
      "fixed top-4 left-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 transform -translate-x-full transition-transform duration-300"

    successDiv.textContent = message

    document.body.appendChild(successDiv)

    setTimeout(() => {
      successDiv.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      successDiv.style.transform = "-translateX(full)"
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv)
        }
      }, 300)
    }, 3000)
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎯 Initializing AI Image Upscaler...")
  new AIImageUpscaler()
})

console.log("%c🚀 AI Image Upscaler Loaded!", "color: #00ff88; font-size: 20px; font-weight: bold;")
console.log("%cPowered by Advanced Bicubic Interpolation", "color: #00aaff; font-size: 14px;")
console.log("%c© 2025 Muhammad Fikri", "color: #ffaa00; font-size: 12px;")
