<script>
import NavBar from '@/components/NavBar.vue'
import FooterSection from '@/components/FooterSection.vue'
import { apiRequest } from '@/services/api'
import Paginate from 'vuejs-paginate-next'

function detectColorFamily(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return ''

  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1))
  let hue = 0

  if (max !== min) {
    if (max === r) hue = ((g - b) / (max - min)) % 6
    else if (max === g) hue = (b - r) / (max - min) + 2
    else hue = (r - g) / (max - min) + 4

    hue = Math.round(hue * 60)
    if (hue < 0) hue += 360
  }

  if (saturation < 0.25) return lightness < 0.4 ? 'brown' : 'nude'
  if (hue < 15) return 'red'
  if (hue < 30) return 'coral'
  if (hue < 50) return 'nude'
  if (hue < 160) return 'brown'
  if (hue < 200) return 'berry'
  if (hue < 270) return 'plum'
  if (hue < 310) return 'mauve'
  if (hue < 330) return 'pink'
  if (hue < 345) return 'rose'
  return 'red'
}

const variantEditorPresets = {
  shade: {
    label: 'Shade',
    labelHeader: 'Shade name',
    labelPlaceholder: 'Rose In Mind',
    addLabel: 'Add shade',
    emptyText: 'No shades yet. Select Add shade to create the first option.',
    showColor: true,
    showNumber: true,
    defaultVariant: () => ({
      shade_number: '',
      shade_name: '',
      name: '',
      description: '',
      hex: '#e8799a',
      color_family: 'pink',
      stock: 0
    })
  },
  color: {
    label: 'Colour',
    labelHeader: 'Colour name',
    labelPlaceholder: 'Dusty Rose',
    addLabel: 'Add colour',
    emptyText: 'No colours yet. Select Add colour to create the first option.',
    showColor: true,
    showNumber: false,
    defaultVariant: () => ({
      shade_number: '',
      shade_name: '',
      name: '',
      description: '',
      hex: '#e8799a',
      color_family: 'pink',
      stock: 0
    })
  },
  size: {
    label: 'Size',
    labelHeader: 'Size',
    labelPlaceholder: '30ml',
    addLabel: 'Add size',
    emptyText: 'No sizes yet. Select Add size to create the first option.',
    showColor: false,
    showNumber: false,
    defaultVariant: () => ({
      shade_number: '',
      shade_name: '',
      name: '',
      description: '',
      hex: '',
      color_family: '',
      stock: 0
    })
  },
  scent: {
    label: 'Scent',
    labelHeader: 'Scent name',
    labelPlaceholder: 'Vanilla',
    addLabel: 'Add scent',
    emptyText: 'No scents yet. Select Add scent to create the first option.',
    showColor: false,
    showNumber: false,
    defaultVariant: () => ({
      shade_number: '',
      shade_name: '',
      name: '',
      description: '',
      hex: '',
      color_family: '',
      stock: 0
    })
  },
  style: {
    label: 'Style',
    labelHeader: 'Style name',
    labelPlaceholder: 'Matte',
    addLabel: 'Add style',
    emptyText: 'No styles yet. Select Add style to create the first option.',
    showColor: false,
    showNumber: false,
    defaultVariant: () => ({
      shade_number: '',
      shade_name: '',
      name: '',
      description: '',
      hex: '',
      color_family: '',
      stock: 0
    })
  }
}

function getVariantEditorPreset(type) {
  return variantEditorPresets[type] || variantEditorPresets.shade
}

const emptyForm = () => ({
  id: '',
  brand: '',
  name: '',
  category: 'Skincare',
  subCategory: '',
  price: '',
  originalPrice: '',
  discount: '',
  stock: '',
  image: '',
  description: '',
  ingredients: '',
  skin: [],
  concerns_addressed: [],
  volume: '',
  shade: '',
  finish: '',
  suitable_skin_tones: [],
  price_range_tag: '',
  has_variants: false,
  variant_type: '',
  variants: [],
  isNew: false,
  isBestseller: false,
  isFeatured: false
})

export default {
  components: {
    NavBar,
    FooterSection,
    paginate: Paginate
  },

  data() {
    return {
      products: [],
      form: emptyForm(),
      searchTerm: '',
      activeCatalogCategory: 'all',
      activeCatalogFilter: 'all',
      isLoading: true,
      isSaving: false,
      loadError: '',
      accessError: '',
      notice: '',
      noticeType: 'success',
      deleteId: '',
      currentPage: 1,
      itemsPerPage: 8,
      categoryOptions: ['Skincare', 'Makeup', 'Tools'],
      skinOptions: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
      concernOptions: ['acne', 'pigmentation', 'wrinkles', 'dullness', 'pores', 'hydration', 'redness'],
      skinToneOptions: ['fair', 'medium', 'tan', 'deep'],
      priceRangeOptions: [
        { label: 'None', value: '' },
        { label: 'Low', value: 'low' },
        { label: 'Mid', value: 'mid' },
        { label: 'High', value: 'high' }
      ],
      variantTypeOptions: [
        { label: 'None', value: '' },
        { label: 'Shade', value: 'shade' },
        { label: 'Size', value: 'size' },
        { label: 'Scent', value: 'scent' },
        { label: 'Color', value: 'color' },
        { label: 'Style', value: 'style' }
      ],
      imageInputText: '',
      imageUploadName: ''
    }
  },

  computed: {
    token() {
      return localStorage.getItem('authToken')
    },

    isEditing() {
      return Boolean(this.form.id)
    },

    filteredProducts() {
      const search = this.searchTerm.trim().toLowerCase()

      return this.products.filter(product => {
        const categoryMatch = this.activeCatalogCategory === 'all' || product.category === this.activeCatalogCategory
        const summaryFilterMatch = this.activeCatalogFilter === 'all'
          || (this.activeCatalogFilter === 'low-stock' && this.productTotalStock(product) <= 5)
          || (this.activeCatalogFilter === 'featured' && (product.isFeatured || product.isBestseller))

        return [product.brand, product.name, product.category, product.subCategory]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search) && categoryMatch && summaryFilterMatch
      })
    },

    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredProducts.slice(start, start + this.itemsPerPage)
    },

    catalogPageCount() {
      return Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage))
    },

    totalProducts() {
      return this.products.length
    },

    lowStockProducts() {
      return this.products.filter(product => this.productTotalStock(product) <= 5).length
    },

    featuredProducts() {
      return this.products.filter(product => product.isFeatured || product.isBestseller).length
    },

    isToolsCategory() {
      return this.form.category === 'Tools'
    },

    variantEditorConfig() {
      return getVariantEditorPreset(this.form.variant_type || 'shade')
    },

    totalVariantStock() {
      return this.form.variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0)
    }
  },

  async mounted() {
    if (!this.token) {
      this.$router.push({ path: '/login', query: { redirect: '/admin/products' } })
      return
    }

    const canManageProducts = await this.checkAdminAccess()

    if (!canManageProducts) {
      return
    }

    this.loadProducts()
  },

  watch: {
    'form.category'(category) {
      if (category === 'Tools') {
        this.form.skin = []
        this.form.concerns_addressed = []
        this.form.suitable_skin_tones = []
      }
    },

    searchTerm() {
      this.currentPage = 1
    },

    activeCatalogCategory() {
      this.currentPage = 1
    },

    activeCatalogFilter() {
      this.currentPage = 1
    }
  },

  methods: {
    async checkAdminAccess() {
      try {
        const data = await apiRequest('/auth/profile', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        localStorage.setItem('authUser', JSON.stringify(data.user))

        if (data.user.role !== 'admin') {
          this.accessError = 'Admin access is required to manage products.'
          this.isLoading = false
          return false
        }

        return true
      } catch (error) {
        this.accessError = error.message
        this.isLoading = false
        return false
      }
    },

    async loadProducts() {
      this.isLoading = true
      this.loadError = ''

      try {
        const data = await apiRequest('/products')
        this.products = data.products
        this.currentPage = 1
      } catch (error) {
        this.loadError = error.message
      } finally {
        this.isLoading = false
      }
    },

    createVariantDraft() {
      return { ...this.variantEditorConfig.defaultVariant() }
    },

    productTotalStock(product) {
      if (product?.has_variants && Array.isArray(product.variants) && product.variants.length) {
        return product.variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0)
      }

      return Number(product?.stock || 0)
    },

    normalizeVariantForType(variant, type) {
      const preset = getVariantEditorPreset(type)
      const label = [variant.shade_name, variant.name, variant.shade_number]
        .map(value => String(value || '').trim())
        .find(Boolean) || ''
      const description = variant.description?.trim?.() || ''
      const stock = variant.stock === '' || variant.stock == null ? 0 : Number(variant.stock)

      if (preset.showColor) {
        const hex = variant.hex || '#e8799a'

        return {
          shade_number: preset.showNumber ? (variant.shade_number?.trim?.() || '') : '',
          shade_name: preset.showNumber ? (variant.shade_name?.trim?.() || label) : label,
          name: label,
          description,
          hex,
          color_family: variant.color_family || detectColorFamily(hex),
          stock
        }
      }

      return {
        shade_number: '',
        shade_name: label,
        name: label,
        description,
        hex: '',
        color_family: '',
        stock
      }
    },

    handleVariantTypeChange() {
      const type = this.form.variant_type || 'shade'
      this.form.variants = this.form.variants.map(variant => this.normalizeVariantForType(variant, type))
    },

    productBody() {
      const type = this.form.variant_type || 'shade'
      const isToolsCategory = this.form.category === 'Tools'
      const variants = this.form.has_variants
        ? this.form.variants
            .map(variant => this.normalizeVariantForType(variant, type))
            .filter(variant => variant.shade_number || variant.shade_name || variant.name)
        : []
      const totalStock = variants.length ? variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0) : Number(this.form.stock || 0)

      return {
        ...this.form,
        price: this.form.price,
        originalPrice: this.form.originalPrice,
        discount: this.form.discount,
        stock: totalStock,
        images: this.form.image ? [this.form.image] : [],
        ingredients: this.form.ingredients,
        skin: isToolsCategory ? [] : this.form.skin,
        concerns_addressed: isToolsCategory ? [] : this.form.concerns_addressed,
        suitable_skin_tones: isToolsCategory ? [] : this.form.suitable_skin_tones,
        has_variants: this.form.has_variants && variants.length > 0,
        variant_type: variants.length ? type : '',
        variants
      }
    },

    async saveProduct() {
      this.isSaving = true
      this.notice = ''

      try {
        const path = this.isEditing ? `/products/${this.form.id}` : '/products'
        const method = this.isEditing ? 'PATCH' : 'POST'

        await apiRequest(path, {
          method,
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(this.productBody())
        })

        this.showNotice(this.isEditing ? 'Product updated.' : 'Product added.')
        this.currentPage = 1
        this.resetForm()
        await this.loadProducts()
      } catch (error) {
        this.showNotice(error.message, 'error')
      } finally {
        this.isSaving = false
      }
    },

    handleImageTextInput(event) {
      this.imageInputText = event.target.value
      this.imageUploadName = ''
      this.form.image = event.target.value.trim()
    },

    triggerImageFilePicker() {
      this.$refs.imageFileInput?.click()
    },

    handleImageUpload(event) {
      const [file] = event.target.files || []

      if (!file) {
        return
      }

      if (!file.type.startsWith('image/')) {
        this.showNotice('Please choose a valid image file.', 'error')
        event.target.value = ''
        return
      }

      if (file.size > 4 * 1024 * 1024) {
        this.showNotice('Image must be smaller than 4MB.', 'error')
        event.target.value = ''
        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        this.form.image = reader.result
        this.imageInputText = file.name
        this.imageUploadName = file.name
        this.showNotice('Image uploaded. It will be saved with the product.')
      }

      reader.onerror = () => {
        this.showNotice('Unable to read this image file.', 'error')
        event.target.value = ''
      }

      reader.readAsDataURL(file)
    },

    editProduct(product) {
      const type = product.variant_type || 'shade'

      this.form = {
        id: product.id,
        brand: product.brand || '',
        name: product.name || '',
        category: product.category || 'Skincare',
        subCategory: product.subCategory || '',
        price: product.price ?? '',
        originalPrice: product.originalPrice ?? '',
        discount: product.discount ?? '',
        stock: product.stock ?? '',
        image: product.image || product.imageUrl || '',
        description: product.description || '',
        ingredients: (product.ingredients || []).join(', '),
        skin: product.skin || [],
        concerns_addressed: product.concerns_addressed || [],
        volume: product.volume || '',
        shade: product.shade || '',
        finish: product.finish || '',
        suitable_skin_tones: product.suitable_skin_tones || [],
        price_range_tag: product.price_range_tag || '',
        has_variants: Boolean(product.has_variants),
        variant_type: type,
        stock: product.has_variants && product.variants?.length ? this.productTotalStock(product) : (product.stock ?? ''),
        skin: product.category === 'Tools' ? [] : product.skin || [],
        concerns_addressed: product.category === 'Tools' ? [] : product.concerns_addressed || [],
        suitable_skin_tones: product.category === 'Tools' ? [] : product.suitable_skin_tones || [],
        variants: product.variants?.length
          ? product.variants.map(variant => this.normalizeVariantForType(variant, type))
          : [],
        isNew: Boolean(product.isNew),
        isBestseller: Boolean(product.isBestseller),
        isFeatured: Boolean(product.isFeatured)
      }
      this.imageInputText = product.image || product.imageUrl || ''
      this.imageUploadName = ''

      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    async deleteProduct(product) {
      if (this.deleteId !== product.id) {
        this.deleteId = product.id
        this.showNotice(`Select delete again to remove ${product.name}.`)
        return
      }

      try {
        await apiRequest(`/products/${product.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.showNotice('Product deleted.')
        this.deleteId = ''
        this.currentPage = 1
        await this.loadProducts()
      } catch (error) {
        this.showNotice(error.message, 'error')
      }
    },

    resetForm() {
      this.form = emptyForm()
      this.imageInputText = ''
      this.imageUploadName = ''
      this.deleteId = ''
    },

    addVariant() {
      this.form.has_variants = true

      if (!this.form.variant_type) {
        this.form.variant_type = 'shade'
      }

      this.form.variants.push(this.createVariantDraft())
    },

    removeVariant(index) {
      this.form.variants.splice(index, 1)
    },

    updateVariantColor(variant) {
      if (variant.hex) {
        variant.color_family = detectColorFamily(variant.hex)
      }
    },

    handleVariantToggle() {
      if (this.form.has_variants) {
        this.form.variant_type = this.form.variant_type || 'shade'
        return
      }

      this.form.variant_type = ''
      this.form.variants = []
    },

    setCatalogFilter(filter) {
      this.activeCatalogFilter = this.activeCatalogFilter === filter ? 'all' : filter
      this.currentPage = 1
    },

    clearCatalogFilter() {
      this.activeCatalogFilter = 'all'
      this.currentPage = 1
    },

    showNotice(message, type = 'success') {
      this.notice = message
      this.noticeType = type
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="admin-page">
      <section class="admin-header">
        <div>
          <p class="eyebrow">Admin</p>
          <h1>Product Management</h1>
        </div>
        <router-link class="shop-link" to="/shop">View shop</router-link>
      </section>

      <p v-if="accessError" class="access-panel">{{ accessError }}</p>

      <section v-else class="metric-row" aria-label="Product summary">
        <button
          class="metric metric-button"
          :class="{ active: activeCatalogFilter === 'all' }"
          type="button"
          @click="setCatalogFilter('all')"
        >
          <span>{{ totalProducts }}</span>
          <p>Total products</p>
        </button>
        <button
          class="metric metric-button"
          :class="{ active: activeCatalogFilter === 'low-stock' }"
          type="button"
          @click="setCatalogFilter('low-stock')"
        >
          <span>{{ lowStockProducts }}</span>
          <p>Low stock</p>
        </button>
        <button
          class="metric metric-button"
          :class="{ active: activeCatalogFilter === 'featured' }"
          type="button"
          @click="setCatalogFilter('featured')"
        >
          <span>{{ featuredProducts }}</span>
          <p>Featured picks</p>
        </button>
      </section>

      <section v-if="!accessError" class="admin-grid">
        <form class="product-form" @submit.prevent="saveProduct">
          <div class="form-heading">
            <h2>{{ isEditing ? 'Edit product' : 'Add product' }}</h2>
            <button v-if="isEditing" class="ghost-btn" type="button" @click="resetForm">Cancel</button>
          </div>

          <p v-if="notice" class="notice" :class="noticeType">{{ notice }}</p>

          <div class="field-grid">
            <label>
              <span>Brand</span>
              <input v-model.trim="form.brand" required type="text" />
            </label>
            <label>
              <span>Name</span>
              <input v-model.trim="form.name" required type="text" />
            </label>
            <label>
              <span>Category</span>
              <select v-model="form.category" required>
                <option v-for="category in categoryOptions" :key="category" :value="category">{{ category }}</option>
              </select>
            </label>
            <label>
              <span>Subcategory</span>
              <input v-model.trim="form.subCategory" type="text" />
            </label>
            <label>
              <span>Price</span>
              <input v-model="form.price" min="0" required step="0.01" type="number" />
            </label>
            <label>
              <span>Original price</span>
              <input v-model="form.originalPrice" min="0" step="0.01" type="number" />
            </label>
            <label>
              <span>Discount</span>
              <input v-model="form.discount" min="0" step="1" type="number" />
            </label>
            <label>
              <span>Stock</span>
              <input v-model="form.stock" min="0" required step="1" type="number" />
            </label>
            <label>
              <span>Volume</span>
              <input v-model.trim="form.volume" type="text" />
            </label>
            <label>
              <span>Finish</span>
              <input v-model.trim="form.finish" type="text" />
            </label>
          </div>

          <label class="product-image-field">
            <span>Product Image</span>
            <div class="image-input-row">
              <input
                :value="imageInputText"
                placeholder="Enter image URL or choose file"
                type="text"
                @input="handleImageTextInput"
              />
              <button class="choose-file-btn" type="button" @click="triggerImageFilePicker">Choose file</button>
              <input
                ref="imageFileInput"
                accept="image/*"
                class="hidden-file-input"
                type="file"
                @change="handleImageUpload"
              />
            </div>
          </label>
          <p v-if="imageUploadName" class="upload-note">Selected image: {{ imageUploadName }}</p>
          <img v-if="form.image" class="image-preview" :src="form.image" alt="Product image preview" />

          <label>
            <span>Description</span>
            <textarea v-model.trim="form.description" rows="4"></textarea>
          </label>

          <label>
            <span>Ingredients</span>
            <input v-model.trim="form.ingredients" placeholder="Comma separated" type="text" />
          </label>

          <div v-if="!isToolsCategory" class="check-group">
            <p>Skin type</p>
            <label v-for="skin in skinOptions" :key="skin" class="check-label">
              <input v-model="form.skin" :value="skin" type="checkbox" />
              <span>{{ skin }}</span>
            </label>
          </div>

          <div v-if="!isToolsCategory" class="check-group">
            <p>Concerns</p>
            <label v-for="concern in concernOptions" :key="concern" class="check-label">
              <input v-model="form.concerns_addressed" :value="concern" type="checkbox" />
              <span>{{ concern }}</span>
            </label>
          </div>

          <div v-if="!isToolsCategory" class="check-group">
            <p>Suitable skin tones</p>
            <label v-for="tone in skinToneOptions" :key="tone" class="check-label">
              <input v-model="form.suitable_skin_tones" :value="tone" type="checkbox" />
              <span>{{ tone }}</span>
            </label>
          </div>

          <div class="field-grid">
            <label class="wide-field">
              <span>Price range tag</span>
              <select v-model="form.price_range_tag">
                <option v-for="option in priceRangeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <label class="check-label inline-toggle">
            <input v-model="form.has_variants" type="checkbox" @change="handleVariantToggle" />
            <span>This product has customer options</span>
          </label>

          <section v-if="form.has_variants" class="variant-editor">
            <div class="variant-editor-header">
              <div>
                <span>Product Options</span>
              </div>
              <button class="ghost-btn" type="button" @click="addVariant">{{ variantEditorConfig.addLabel }}</button>
            </div>

            <label>
              <span>Option type</span>
              <select v-model="form.variant_type" @change="handleVariantTypeChange">
                <option v-for="option in variantTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <div v-if="form.variants.length" class="variant-table">
              <div class="variant-head" :class="[`variant-head--${form.variant_type || 'shade'}`]" aria-hidden="true">
                <span v-if="variantEditorConfig.showColor">Colour</span>
                <span v-if="variantEditorConfig.showNumber">No.</span>
                <span>{{ variantEditorConfig.labelHeader }}</span>
                <span>Description</span>
                <span>Stock</span>
                <span></span>
              </div>

              <div v-for="(variant, index) in form.variants" :key="index" class="variant-row" :class="[`variant-row--${form.variant_type || 'shade'}`]">
                <template v-if="variantEditorConfig.showColor">
                  <input
                    v-model="variant.hex"
                    aria-label="Option colour"
                    class="color-input"
                    type="color"
                    @input="updateVariantColor(variant)"
                  />
                </template>

                <input
                  v-if="variantEditorConfig.showNumber"
                  v-model.trim="variant.shade_number"
                  aria-label="Shade number"
                  placeholder="01"
                  type="text"
                />
                <input
                  v-model.trim="variant.name"
                  :aria-label="variantEditorConfig.labelHeader"
                  :placeholder="variantEditorConfig.labelPlaceholder"
                  type="text"
                />
                <input v-model.trim="variant.description" aria-label="Description" placeholder="Optional" type="text" />
                <input v-model="variant.stock" aria-label="Stock" min="0" step="1" type="number" />
                <button class="variant-remove" type="button" aria-label="Delete option" @click="removeVariant(index)">x</button>
              </div>
            </div>

            <p v-else class="variant-empty">{{ variantEditorConfig.emptyText }}</p>
          </section>

          <div class="toggle-row">
            <label class="check-label">
              <input v-model="form.isNew" type="checkbox" />
              <span>New</span>
            </label>
            <label class="check-label">
              <input v-model="form.isBestseller" type="checkbox" />
              <span>Bestseller</span>
            </label>
            <label class="check-label">
              <input v-model="form.isFeatured" type="checkbox" />
              <span>Featured</span>
            </label>
          </div>

          <button class="primary-btn" :disabled="isSaving" type="submit">
            {{ isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Add product' }}
          </button>
        </form>

        <section class="product-list">
          <div class="list-toolbar">
            <h2>Catalog</h2>
            <div class="catalog-controls">
              <button
                v-if="activeCatalogFilter !== 'all'"
                class="filter-chip"
                type="button"
                @click="clearCatalogFilter"
              >
                {{ activeCatalogFilter === 'low-stock' ? 'Low stock' : 'Featured picks' }} x
              </button>
              <select v-model="activeCatalogCategory" aria-label="Filter catalog by category">
                <option value="all">All categories</option>
                <option v-for="category in categoryOptions" :key="category" :value="category">{{ category }}</option>
              </select>
              <input v-model.trim="searchTerm" aria-label="Search catalog" placeholder="Search catalog" type="search" />
            </div>
          </div>

          <p v-if="isLoading" class="empty-state">Loading products...</p>
          <p v-else-if="loadError" class="empty-state">{{ loadError }}</p>
          <p v-else-if="filteredProducts.length === 0" class="empty-state">No products found.</p>

          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in paginatedProducts" :key="product.id">
                  <td>
                    <div class="product-cell">
                      <img v-if="product.image" :src="product.image" :alt="product.name" />
                      <div v-else class="image-fallback"></div>
                      <div>
                        <strong>{{ product.name }}</strong>
                        <span>{{ product.brand }}</span>
                      </div>
                    </div>
                  </td>
                  <td>RM {{ Number(product.price).toFixed(2) }}</td>
                  <td>
                    <span class="stock-pill" :class="{ low: productTotalStock(product) <= 5 }">
                      {{ productTotalStock(product) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-row">
                      <button class="ghost-btn" type="button" @click="editProduct(product)">Edit</button>
                      <button class="danger-btn" type="button" @click="deleteProduct(product)">
                        {{ deleteId === product.id ? 'Confirm' : 'Delete' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <paginate
            v-if="filteredProducts.length > itemsPerPage"
            v-model="currentPage"
            :click-handler="page => (currentPage = page)"
            :container-class="'catalog-pagination'"
            :page-count="catalogPageCount"
            :page-range="3"
            :margin-pages="1"
            :next-text="'Next'"
            :prev-text="'Prev'"
          />
        </section>
      </section>
    </main>

    <FooterSection />
  </div>
</template>

<style scoped>
.page {
  background: #fff8fb;
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
}

.admin-page {
  margin: 0 auto;
  max-width: 1440px;
  padding: 7rem 0.75rem 4rem;
}

.admin-header,
.form-heading,
.list-toolbar,
.action-row,
.toggle-row {
  align-items: center;
  display: flex;
}

.admin-header {
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.eyebrow {
  color: var(--pink-700);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

h1,
h2 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
}

h1 {
  font-size: clamp(2.1rem, 5vw, 3.4rem);
  font-weight: 700;
}

h2 {
  font-size: 1.55rem;
  font-weight: 700;
}

.shop-link,
.primary-btn,
.ghost-btn,
.danger-btn {
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
}

.shop-link,
.ghost-btn {
  background: white;
  border: 1px solid var(--pink-200);
  color: var(--pink-800);
  padding: 0.62rem 1rem;
}

.primary-btn {
  background: var(--pink-800);
  border: 1px solid var(--pink-800);
  color: white;
  padding: 0.78rem 1.2rem;
}

.primary-btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.danger-btn {
  background: #fff5f5;
  border: 1px solid #ffc9c9;
  color: #b42318;
  padding: 0.55rem 0.85rem;
}

.metric-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 1.5rem;
}

.metric,
.product-form,
.product-list {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.metric {
  text-align: left;
  padding: 1.1rem;
}

.metric-button {
  cursor: pointer;
  font: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.metric-button:hover,
.metric-button.active {
  border-color: rgba(232, 121, 154, 0.42);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.metric-button.active {
  background: #fffafd;
}

.metric span {
  color: var(--pink-800);
  font-size: 1.8rem;
  font-weight: 800;
}

.metric p {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.admin-grid {
  align-items: start;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.product-form,
.product-list {
  padding: 1rem;
}

.product-form {
  display: grid;
  gap: 0.85rem;
}

.form-heading,
.list-toolbar {
  gap: 1rem;
  justify-content: space-between;
}

.field-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label {
  display: grid;
  gap: 0.35rem;
}

.wide-field {
  grid-column: 1 / -1;
}

label span,
.check-group p {
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 800;
}

input,
select,
textarea {
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 8px;
  color: var(--text-primary);
  font: inherit;
  min-height: 42px;
  outline: none;
  padding: 0.65rem 0.75rem;
  width: 100%;
}

textarea {
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--pink-500);
  box-shadow: 0 0 0 3px rgba(232, 121, 154, 0.14);
}

.check-group,
.toggle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.check-group p {
  flex-basis: 100%;
}

.check-label {
  align-items: center;
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  display: inline-flex;
  gap: 0.45rem;
  padding: 0.45rem 0.7rem;
}

.inline-toggle {
  justify-content: start;
}

.check-label input {
  min-height: auto;
  width: auto;
}

.variant-editor {
  background: #fff8fb;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  display: grid;
  gap: 0.65rem;
  margin-left: -0.35rem;
  margin-right: -0.35rem;
  padding: 0.75rem;
}

.variant-editor-header {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.variant-editor-header span {
  color: var(--pink-800);
  display: block;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.variant-editor-header p,
.variant-empty,
.variant-row small {
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.45;
  margin: 0.2rem 0 0;
}

.variant-table {
  display: grid;
  gap: 0.55rem;
}

.variant-head,
.variant-row {
  align-items: center;
  display: grid;
  min-width: 0;
}

.variant-head--shade,
.variant-row--shade {
  grid-template-columns: 52px minmax(56px, 0.55fr) minmax(0, 1fr) minmax(0, 1fr) minmax(64px, 0.6fr);
}

.variant-head--color,
.variant-row--color {
  grid-template-columns: 52px minmax(0, 1fr) minmax(0, 1fr) minmax(64px, 0.6fr);
}

.variant-head--size,
.variant-row--size,
.variant-head--scent,
.variant-row--scent,
.variant-head--style,
.variant-row--style {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(64px, 0.6fr);
}

.variant-head {
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  gap: 0 0.5rem;
  margin-left: 0.45rem;
}

.variant-row {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.16);
  border-radius: 8px;
  padding: 1.55rem 0.45rem 0.45rem;
  position: relative;
  gap: 0.5rem;
}

.variant-row input {
  min-width: 0;
  width: 100%;
}

.variant-row small {
  grid-column: 1 / -1;
  margin-top: 0;
  text-transform: capitalize;
}

.variant-remove {
  align-items: center;
  background: transparent;
  border: none;
  color: #383838;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 900;
  height: 26px;
  justify-content: center;
  padding: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 26px;
}

.color-input {
  cursor: pointer;
  min-height: 42px;
  padding: 0.2rem;
}

.notice {
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.75rem 0.85rem;
}

.access-panel {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  color: var(--text-secondary);
  font-weight: 700;
  padding: 1.25rem;
}

.notice.success {
  background: #f0fdf4;
  color: #166534;
}

.notice.error {
  background: #fff5f5;
  color: #b42318;
}

.image-input-row {
  align-items: center;
  display: grid;
  gap: 0.65rem;
  grid-template-columns: minmax(0, 1fr) auto;
}

.choose-file-btn {
  background: white;
  border: 1px solid var(--pink-200);
  border-radius: 8px;
  color: var(--pink-800);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  min-height: 42px;
  padding: 0.65rem 1rem;
  white-space: nowrap;
}

.hidden-file-input {
  display: none;
}

.upload-note {
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 700;
  margin: -0.35rem 0 0;
}

.image-preview {
  border: 1px solid var(--pink-200);
  border-radius: 8px;
  height: 120px;
  object-fit: cover;
  width: 120px;
}

.product-list {
  min-width: 0;
}

.list-toolbar {
  margin-bottom: 1rem;
}

.catalog-controls {
  align-items: center;
  display: flex;
  gap: 0.65rem;
}

.filter-chip {
  background: var(--pink-800);
  border: 1px solid var(--pink-800);
  border-radius: 999px;
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  min-height: 42px;
  padding: 0.55rem 0.8rem;
  white-space: nowrap;
}

.catalog-controls select {
  min-width: 150px;
}

.catalog-controls input {
  max-width: 260px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  min-width: 620px;
  width: 100%;
}

th,
td {
  border-bottom: 1px solid rgba(232, 121, 154, 0.16);
  padding: 0.85rem 0.5rem;
  text-align: left;
  vertical-align: middle;
}

th {
  color: var(--text-muted);
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.product-cell {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  min-width: 260px;
}

.product-cell img,
.image-fallback {
  background: var(--pink-100);
  border-radius: 8px;
  height: 56px;
  object-fit: cover;
  width: 56px;
}

.product-cell strong,
.product-cell span {
  display: block;
}

.product-cell strong {
  color: var(--pink-900);
  font-size: 0.92rem;
}

.product-cell span {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-top: 0.15rem;
}

.stock-pill {
  background: #f0fdf4;
  border-radius: 999px;
  color: #166534;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 800;
  min-width: 42px;
  padding: 0.35rem 0.55rem;
}

.stock-pill.low {
  background: #fff7ed;
  color: #c2410c;
}

.action-row {
  gap: 0.45rem;
  justify-content: flex-end;
}

.empty-state {
  color: var(--text-muted);
  padding: 3rem 1rem;
  text-align: center;
}

.catalog-pagination {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
}

.catalog-pagination :deep(li) {
  list-style: none;
}

.catalog-pagination :deep(a) {
  align-items: center;
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  color: var(--pink-800);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 800;
  justify-content: center;
  min-width: 2.2rem;
  padding: 0.5rem 0.8rem;
  text-decoration: none;
}

.catalog-pagination :deep(li.active a) {
  background: var(--pink-800);
  border-color: var(--pink-800);
  color: white;
}

.catalog-pagination :deep(li.disabled a) {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 980px) {
  .admin-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .admin-page {
    padding: 6rem 1rem 3rem;
  }

  .admin-header,
  .list-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .metric-row,
  .field-grid,
  .image-input-row {
    grid-template-columns: 1fr;
  }

  .variant-editor-header,
  .variant-row {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .variant-head--shade,
  .variant-row--shade,
  .variant-head--color,
  .variant-row--color,
  .variant-head--size,
  .variant-row--size,
  .variant-head--scent,
  .variant-row--scent,
  .variant-head--style,
  .variant-row--style {
    grid-template-columns: 1fr;
  }

  .variant-editor-header {
    flex-direction: column;
  }

  .variant-head {
    display: none;
  }

  .catalog-controls {
    align-items: stretch;
    flex-direction: column;
    width: 100%;
  }

  .catalog-controls input,
  .catalog-controls select {
    max-width: none;
  }
}
</style>
