<script>
import FooterSection from '@/components/FooterSection.vue'
import NavBar from '@/components/NavBar.vue'
import { apiRequest } from '@/services/api'

function formatVariantTypeLabel(type) {
  const labels = {
    shade: 'Shade',
    size: 'Size',
    scent: 'Scent',
    color: 'Colour',
    style: 'Style'
  }

  return labels[type] || 'Option'
}

export default {
  components: {
    NavBar,
    FooterSection
  },

  data() {
    return {
      product: null,
      qty: 1,
      isLoading: true,
      loadError: '',
      toastVisible: false,
      toastMessage: '',
      toastTimer: null,
      selectedVariantId: '',
      variantMenuOpen: false
    }
  },

  computed: {
    productId() {
      return this.$route.params.id
    },

    price() {
      return Number(this.product?.price || 0).toFixed(2)
    },

    originalPrice() {
      return Number(this.product?.originalPrice || 0).toFixed(2)
    },

    galleryImages() {
      if (!this.product) return []

      const images = [this.product.image, ...(this.product.images || [])].filter(Boolean)
      return [...new Set(images)]
    },

    variantText() {
      return this.product?.volume || this.product?.shade || this.product?.finish || this.product?.subCategory || ''
    },

    hasVariants() {
      return Boolean(this.product?.has_variants && this.product?.variants?.length)
    },

    isMakeupProduct() {
      return this.product?.category?.toLowerCase().replace(/\s+/g, '') === 'makeup'
    },

    selectedVariant() {
      if (!this.hasVariants || !this.selectedVariantId) return null

      return this.product.variants.find(variant => this.variantId(variant) === this.selectedVariantId) || null
    },

    selectedVariantLabel() {
      if (!this.selectedVariant) return ''

      return this.variantLabel(this.selectedVariant)
    },

    variantTypeLabel() {
      return formatVariantTypeLabel(this.product?.variant_type)
    },

    variantChoiceLabel() {
      return `Choose ${this.variantTypeLabel.toLowerCase()}`
    },

    selectedStock() {
      if (this.hasVariants) {
        return this.selectedVariant ? Number(this.selectedVariant.stock || 0) : null
      }

      return Number(this.product?.stock || 0)
    },

    stockText() {
      if (this.hasVariants && !this.selectedVariant) return this.variantChoiceLabel

      return `${this.selectedStock || 0} available`
    },

    skinText() {
      if (!this.product?.skin?.length) return 'All skin types'

      return this.product.skin.map(this.formatValue).join(', ')
    },

    concernText() {
      if (!this.product?.concerns_addressed?.length) return 'General glow support'

      return this.product.concerns_addressed.map(this.formatValue).join(', ')
    },

    breadcrumbSource() {
      const from = this.$route.query.from

      if (from === 'skincare') {
        return { label: 'Skincare', to: '/skincare' }
      }

      if (from === 'makeup') {
        return { label: 'Makeup', to: '/makeup' }
      }

      if (from === 'shop') {
        return { label: 'Shop', to: '/shop' }
      }

      if (this.product?.category === 'Skincare') {
        return { label: 'Skincare', to: '/skincare' }
      }

      if (this.product?.category === 'Makeup') {
        return { label: 'Makeup', to: '/makeup' }
      }

      return { label: 'Shop', to: '/shop' }
    }
  },

  mounted() {
    this.loadProduct()
  },

  methods: {
    async loadProduct() {
      this.isLoading = true
      this.loadError = ''

      try {
        const data = await apiRequest(`/products/${this.productId}`)
        this.product = data.product
        this.selectedVariantId = ''
        this.variantMenuOpen = false
      } catch (error) {
        this.loadError = error.message
      } finally {
        this.isLoading = false
      }
    },

    increaseQty() {
      if (this.selectedStock !== null && this.qty >= this.selectedStock) {
        this.showToast(this.selectedStock > 0 ? `Only ${this.selectedStock} available for this option` : 'This option is out of stock')
        return
      }

      this.qty += 1
    },

    decreaseQty() {
      if (this.qty > 1) {
        this.qty -= 1
      }
    },

    formatValue(value) {
      return value
        .split('-')
        .map(word => `${word[0].toUpperCase()}${word.slice(1)}`)
        .join(' ')
    },

    variantId(variant) {
      return variant.shade_number || variant.shade_name || variant.name
    },

    variantLabel(variant) {
      return [variant.shade_number, variant.shade_name || variant.name].filter(Boolean).join(' ')
    },

    variantStockText(variant) {
      const stock = Number(variant.stock || 0)
      return stock > 0 ? `${stock} available` : 'Out of stock'
    },

    chooseVariant(variant) {
      const stock = Number(variant.stock || 0)

      if (stock <= 0) return

      this.selectedVariantId = this.variantId(variant)
      this.qty = Math.min(this.qty, stock)
      this.variantMenuOpen = false
    },

    async addToCart() {
      const token = localStorage.getItem('authToken')

      if (!token) {
        this.showToast('Please log in before adding items to cart')
        return
      }

      if (this.hasVariants && !this.selectedVariant) {
        this.showToast(`Please choose a ${this.variantTypeLabel.toLowerCase()} first`)
        return
      }

      if (this.selectedStock !== null && this.qty > this.selectedStock) {
        this.showToast(this.selectedStock > 0 ? `Only ${this.selectedStock} available for this option` : 'This option is out of stock')
        return
      }

      try {
        await apiRequest('/cart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: this.product.id,
            qty: this.qty,
            selectedVariant: this.selectedVariant
              ? {
                  id: this.variantId(this.selectedVariant),
                  label: this.selectedVariantLabel,
                  type: this.product.variant_type || 'option',
                  hex: this.selectedVariant.hex || ''
                }
              : null
          })
        })

        window.dispatchEvent(new Event('cart-updated'))
        this.showToast(`${this.product.name}${this.selectedVariantLabel ? ` - ${this.selectedVariantLabel}` : ''} added to cart`)
      } catch (error) {
        this.showToast(error.message)
      }
    },

    showToast(message) {
      this.toastMessage = message
      this.toastVisible = true

      clearTimeout(this.toastTimer)

      this.toastTimer = setTimeout(() => {
        this.toastVisible = false
      }, 2200)
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="detail-page">
      <section v-if="isLoading" class="empty-state">
        <h1>Loading product</h1>
        <p>Getting product details from MongoDB.</p>
      </section>

      <section v-else-if="loadError" class="empty-state">
        <h1>Product unavailable</h1>
        <p>{{ loadError }}</p>
        <router-link class="shop-link" to="/shop">Back to Shop</router-link>
      </section>

      <section v-else-if="product" class="product-detail">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <router-link to="/">Home</router-link>
          <span>/</span>
          <router-link :to="breadcrumbSource.to">{{ breadcrumbSource.label }}</router-link>
          <span>/</span>
          <strong>{{ product.name }}</strong>
        </nav>

        <div class="gallery-panel">
          <img class="hero-image" :src="galleryImages[0]" :alt="product.name" />
          <div v-if="galleryImages.length > 1" class="thumb-row">
            <img v-for="image in galleryImages.slice(1, 4)" :key="image" :src="image" :alt="product.name" />
          </div>

        </div>

        <div class="detail-panel">
          <div class="shipping-banner">
            <span>Free Shipping</span>
            <strong>Buy above RM 120 and enjoy free delivery</strong>
          </div>

          <p class="product-brand">{{ product.brand }}</p>
          <h1>{{ product.name }}</h1>
          <p v-if="variantText" class="variant">{{ variantText }}</p>

          <div class="price-row">
            <strong>RM {{ price }}</strong>
            <span v-if="product.originalPrice">RM {{ originalPrice }}</span>
          </div>

          <p class="description">
            {{ product.description || 'A curated Blush Berry favorite selected for your daily glow ritual.' }}
          </p>

          <div class="info-grid">
            <div>
              <span>Category</span>
              <strong>{{ product.category }}</strong>
            </div>
            <div>
              <span>Skin Type</span>
              <strong>{{ skinText }}</strong>
            </div>
            <div>
              <span>Stock</span>
              <strong>{{ stockText }}</strong>
            </div>
          </div>

          <div v-if="!isMakeupProduct" class="concerns">
            <span>Concerns Addressed</span>
            <strong>{{ concernText }}</strong>
          </div>

          <div v-if="product.ingredients?.length" class="ingredients">
            <span>Ingredients</span>
            <p>{{ product.ingredients.join(', ') }}</p>
          </div>

          <div v-if="hasVariants" class="variant-picker">
            <label class="picker-label" for="variant-select">
              {{ variantTypeLabel }}
            </label>
            <div class="variant-select-row">
              <span
                v-if="selectedVariant?.hex"
                class="swatch"
                :style="{ backgroundColor: selectedVariant.hex }"
                aria-hidden="true"
              ></span>
              <div class="variant-dropdown">
                <button
                  id="variant-select"
                  class="variant-select"
                  type="button"
                  :aria-expanded="variantMenuOpen"
                  aria-haspopup="listbox"
                  @click="variantMenuOpen = !variantMenuOpen"
                >
                  <span>{{ selectedVariantLabel || variantChoiceLabel }}</span>
                  <span aria-hidden="true">⌄</span>
                </button>

                <div v-if="variantMenuOpen" class="variant-menu" role="listbox" :aria-label="`${product.name} ${variantTypeLabel.toLowerCase()} options`">
                  <button
                    v-for="variant in product.variants"
                    :key="variantId(variant)"
                    class="variant-menu-option"
                    :class="{ selected: selectedVariantId === variantId(variant) }"
                    type="button"
                    role="option"
                    :aria-selected="selectedVariantId === variantId(variant)"
                    :disabled="Number(variant.stock || 0) <= 0"
                    @click="chooseVariant(variant)"
                  >
                    <span
                      v-if="variant.hex"
                      class="swatch"
                      :style="{ backgroundColor: variant.hex }"
                      aria-hidden="true"
                    ></span>
                    <span class="variant-option-copy">
                      <strong>{{ variantLabel(variant) }}</strong>
                      <small>{{ variantStockText(variant) }}</small>
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <p v-if="selectedVariant?.description || selectedVariant?.color_family" class="variant-note">
              {{ selectedVariant.description || selectedVariant.color_family }}
            </p>
          </div>

          <div class="purchase-row">
            <div class="quantity" aria-label="Quantity control">
              <button type="button" @click="decreaseQty" :disabled="qty <= 1">-</button>
              <span>{{ qty }}</span>
              <button type="button" @click="increaseQty" :disabled="selectedStock !== null && qty >= selectedStock">+</button>
            </div>
            <button class="add-btn" type="button" @click="addToCart" :disabled="selectedStock === 0">Add to Cart</button>
          </div>
        </div>
      </section>
    </main>

    <transition name="toast">
      <div v-if="toastVisible" class="cart-toast">{{ toastMessage }}</div>
    </transition>

    <FooterSection />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff8fb;
  font-family: 'DM Sans', sans-serif;
}

.detail-page {
  flex: 1;
  padding: 7rem 1.5rem 4rem;
}

.product-detail {
  align-items: start;
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.9fr);
  margin: 0 auto;
  max-width: 1180px;
}

.breadcrumb {
  align-items: center;
  color: var(--text-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: 0.86rem;
  gap: 0.5rem;
  grid-column: 1 / -1;
}

.breadcrumb a {
  color: var(--pink-700);
  font-weight: 800;
  text-decoration: none;
}

.breadcrumb strong {
  color: var(--pink-800);
  font-weight: 800;
}

.gallery-panel,
.detail-panel,
.empty-state {
  background: white;
  border: 1px solid rgba(240, 200, 220, 0.45);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(200, 100, 140, 0.08);
}

.gallery-panel {
  overflow: hidden;
}

.hero-image {
  aspect-ratio: 1 / 1;
  background: #fff5f8;
  object-fit: cover;
  width: 100%;
}

.thumb-row {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(3, 1fr);
  padding: 0.75rem;
}

.thumb-row img {
  aspect-ratio: 1 / 1;
  background: #fff5f8;
  border-radius: 14px;
  object-fit: cover;
  width: 100%;
}

.detail-panel {
  padding: 1.6rem;
}

.shipping-banner {
  align-items: center;
  background: #fff0f6;
  border: 1px solid rgba(232, 121, 154, 0.28);
  border-radius: 16px;
  color: var(--pink-800);
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-bottom: 1.1rem;
  padding: 0.8rem 0.9rem;
}

.shipping-banner span {
  background: var(--pink-500);
  border-radius: 999px;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 0.35rem 0.7rem;
  text-transform: uppercase;
}

.shipping-banner strong {
  font-size: 0.92rem;
}

.shop-link {
  color: var(--pink-700);
  display: inline-flex;
  font-size: 0.86rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-decoration: none;
}

.product-brand {
  color: var(--pink-500);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin-bottom: 0.45rem;
  text-transform: uppercase;
}

.detail-panel h1,
.empty-state h1 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 700;
  line-height: 1.05;
}

.variant {
  color: var(--text-muted);
  margin-top: 0.65rem;
}

.price-row {
  align-items: center;
  display: flex;
  gap: 0.85rem;
  margin-top: 1.25rem;
}

.price-row strong {
  color: var(--pink-600);
  font-size: 1.6rem;
}

.price-row span {
  color: #c0a0b0;
  text-decoration: line-through;
}

.description {
  color: var(--text-secondary);
  line-height: 1.75;
  margin-top: 1.25rem;
}

.info-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 1.3rem;
}

.info-grid div,
.ingredients,
.concerns {
  background: #fff8fb;
  border: 1px solid rgba(240, 200, 220, 0.45);
  border-radius: 16px;
  padding: 0.95rem;
}

.info-grid span,
.ingredients span,
.concerns span {
  color: var(--text-muted);
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
}

.info-grid strong,
.ingredients p,
.concerns strong {
  color: var(--pink-800);
  line-height: 1.5;
}

.ingredients,
.concerns {
  margin-top: 0.85rem;
}

.variant-picker {
  background: #fff8fb;
  border: 1px solid rgba(240, 200, 220, 0.45);
  border-radius: 16px;
  margin-top: 0.85rem;
  padding: 0.95rem;
}

.picker-label {
  color: var(--text-muted);
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  margin-bottom: 0.55rem;
  text-transform: uppercase;
}

.variant-select-row {
  align-items: center;
  display: flex;
  gap: 0.65rem;
}

.variant-dropdown {
  flex: 1;
  min-width: 0;
  position: relative;
}

.variant-select {
  align-items: center;
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.32);
  border-radius: 12px;
  color: var(--pink-800);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-weight: 700;
  justify-content: space-between;
  min-height: 44px;
  min-width: 0;
  padding: 0.65rem 0.8rem;
  text-align: left;
  width: 100%;
}

.variant-menu {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.32);
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(122, 31, 61, 0.16);
  left: 0;
  margin-top: 0.35rem;
  max-height: 260px;
  overflow-y: auto;
  padding: 0.35rem;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 20;
}

.variant-menu-option {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  gap: 0.65rem;
  padding: 0.55rem;
  text-align: left;
  width: 100%;
}

.variant-menu-option:hover,
.variant-menu-option.selected {
  background: #fff0f6;
}

.variant-menu-option:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.variant-option-copy {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.variant-option-copy strong {
  color: var(--pink-800);
  font-size: 0.86rem;
  line-height: 1.25;
}

.variant-option-copy small {
  color: var(--text-muted);
  font-size: 0.74rem;
  line-height: 1.25;
}

.swatch {
  border: 1px solid rgba(80, 30, 50, 0.18);
  border-radius: 999px;
  flex: 0 0 auto;
  height: 30px;
  width: 30px;
}

.variant-note {
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.4;
  margin-top: 0.55rem;
}

.purchase-row {
  align-items: center;
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.quantity {
  align-items: center;
  border: 1px solid rgba(232, 121, 154, 0.35);
  border-radius: 999px;
  display: inline-flex;
  overflow: hidden;
}

.quantity button {
  background: #ffe6f073;
  border: none;
  color: var(--pink-700);
  cursor: pointer;
  font-weight: 800;
  height: 42px;
  width: 42px;
}

.quantity button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.quantity span {
  color: var(--pink-800);
  font-weight: 800;
  text-align: center;
  width: 42px;
}

.add-btn {
  background: linear-gradient(135deg, var(--pink-500), var(--pink-700));
  border: none;
  border-radius: 999px;
  color: white;
  cursor: pointer;
  flex: 1;
  font-weight: 800;
  min-height: 44px;
  padding: 0.85rem 1.2rem;
}

.add-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.empty-state {
  margin: 0 auto;
  max-width: 720px;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.empty-state p {
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0.7rem auto 1.3rem;
}

.cart-toast {
  background: var(--pink-800);
  border-radius: 12px;
  bottom: 1.25rem;
  box-shadow: 0 6px 20px rgba(122, 31, 61, 0.25);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.65rem 1.2rem;
  position: fixed;
  right: 1.25rem;
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 920px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .detail-page {
    padding: 6rem 1rem 3rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .purchase-row {
    align-items: stretch;
    flex-direction: column;
  }

  .quantity {
    align-self: flex-start;
  }
}
</style>
