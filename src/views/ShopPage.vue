<script>
import FooterSection from '@/components/FooterSection.vue'
import NavBar from '@/components/NavBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import { apiRequest } from '@/services/api'

export default {
  components: {
    NavBar,
    FooterSection,
    ProductCard
  },

  data() {
    return {
      filtersOpen: false,
      activeCat: 'all',
      activePrice: 'all',
      activeSkin: 'all',
      sortBy: 'featured',
      products: [],
      isLoading: true,
      loadError: '',

      toastVisible: false,
      toastMessage: '',
      toastTimer: null,

      categoryOptions: [
        { label: 'All', value: 'all' },
        { label: 'Skincare', value: 'Skincare' },
        { label: 'Makeup', value: 'Makeup' },
        { label: 'Tools', value: 'Tools' }
      ],

      priceOptions: [
        { label: 'All', value: 'all' },
        { label: 'Under RM 50', value: 'under50' },
        { label: 'RM 50-100', value: '50to100' },
        { label: 'RM 100+', value: 'over100' }
      ],

      skinOptions: [
        { label: 'All', value: 'all' },
        { label: 'Oily', value: 'oily' },
        { label: 'Dry', value: 'dry' },
        { label: 'Combination', value: 'combination' },
        { label: 'Normal', value: 'normal' },
        { label: 'Sensitive', value: 'sensitive' }
      ]
    }
  },

  computed: {
    searchQuery() {
      const search = this.$route.query.search
      return typeof search === 'string' ? search.trim() : ''
    },

    filteredProducts() {
      let list = [...this.products]
      const search = this.searchQuery.toLowerCase()

      if (search) {
        list = list.filter(product => {
          const searchableText = [
            product.name,
            product.brand,
            product.category,
            product.subCategory,
            product.description,
            product.shade,
            product.finish,
            product.volume,
            ...(product.skin || []),
            ...(product.ingredients || []),
            ...(product.concerns_addressed || [])
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return searchableText.includes(search)
        })
      }

      if (this.activeCat !== 'all') {
        list = list.filter(product => product.category === this.activeCat)
      }

      if (this.activeSkin !== 'all') {
        list = list.filter(product => product.skin?.includes(this.activeSkin))
      }

      if (this.activePrice === 'under50') {
        list = list.filter(product => product.price < 50)
      }

      if (this.activePrice === '50to100') {
        list = list.filter(product => product.price >= 50 && product.price <= 100)
      }

      if (this.activePrice === 'over100') {
        list = list.filter(product => product.price > 100)
      }

      if (this.sortBy === 'low') {
        list.sort((a, b) => a.price - b.price)
      }

      if (this.sortBy === 'high') {
        list.sort((a, b) => b.price - a.price)
      }

      if (this.sortBy === 'newest') {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }

      return list
    }
  },

  mounted() {
    this.loadProducts()
  },

  methods: {
    async loadProducts() {
      try {
        const data = await apiRequest('/products')
        this.products = data.products
      } catch (error) {
        this.loadError = error.message
      } finally {
        this.isLoading = false
      }
    },

    async addToCart(product) {
      if (product.has_variants && product.variants?.length) {
        this.$router.push(`/product/${product.id}`)
        return
      }

      const token = localStorage.getItem('authToken')

      if (!token) {
        this.showToast('Please log in before adding items to cart')
        return
      }

      try {
        await apiRequest('/cart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product.id,
            qty: 1
          })
        })

        window.dispatchEvent(new Event('cart-updated'))
        this.showToast(`${product.name} added`)
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
    },

    clearSearch() {
      const query = { ...this.$route.query }
      delete query.search
      this.$router.push({ path: '/shop', query })
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="shop-page">
      <section class="shop-hero">
        <p class="hero-eyebrow">{{ searchQuery ? 'Search Results' : 'Curated K-Beauty' }}</p>
        <h1 class="hero-title">
          <template v-if="searchQuery">Results for <em>{{ searchQuery }}</em></template>
          <template v-else>Build Your <em>Glow</em> Ritual</template>
        </h1>
        <p class="hero-subtitle">
          <template v-if="searchQuery">
            Browse matching skincare and makeup picks from your product collection.
          </template>
          <template v-else>
            Skincare and makeup essentials loaded directly from your MongoDB product collection.
          </template>
        </p>
      </section>

      <section class="shop-catalog">
        <div class="catalog-inner">
          <button class="filter-toggle" type="button" @click="filtersOpen = !filtersOpen">
            <span>{{ filtersOpen ? 'Hide Filters' : 'Show Filters' }}</span>
          </button>

          <aside class="filters-sidebar" :class="{ 'filters-open': filtersOpen }">
            <div class="filter-group">
              <p class="group-label">Category</p>
              <div class="chip-wrap">
                <button
                  v-for="opt in categoryOptions"
                  :key="opt.value"
                  class="chip"
                  :class="{ active: activeCat === opt.value }"
                  type="button"
                  @click="activeCat = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <p class="group-label">Price</p>
              <div class="chip-wrap">
                <button
                  v-for="opt in priceOptions"
                  :key="opt.value"
                  class="chip"
                  :class="{ active: activePrice === opt.value }"
                  type="button"
                  @click="activePrice = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <p class="group-label">Skin Type</p>
              <div class="chip-wrap">
                <button
                  v-for="opt in skinOptions"
                  :key="opt.value"
                  class="chip"
                  :class="{ active: activeSkin === opt.value }"
                  type="button"
                  @click="activeSkin = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </aside>

          <div class="product-area">
            <div class="toolbar">
              <div class="results-summary">
                <p class="results-copy">{{ filteredProducts.length }} product{{ filteredProducts.length !== 1 ? 's' : '' }}</p>
                <button v-if="searchQuery" class="clear-search-btn" type="button" @click="clearSearch">
                  Clear "{{ searchQuery }}"
                </button>
              </div>
              <div class="sort-wrap">
                <label for="sort" class="sort-label">Sort by</label>
                <select id="sort" v-model="sortBy" class="sort-select">
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div class="product-grid">
              <p v-if="isLoading" class="empty-state">Loading products from MongoDB...</p>
              <p v-else-if="loadError" class="empty-state">{{ loadError }}</p>

              <ProductCard
                v-else
                v-for="product in filteredProducts"
                :key="product.id"
                :product="product"
                @add-to-cart="addToCart"
              />

              <p v-if="!isLoading && !loadError && filteredProducts.length === 0" class="empty-state">
                No products match your search or filters.
              </p>
            </div>
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

.shop-page {
  flex: 1;
}

.shop-hero {
  background: linear-gradient(135deg, #fbeef3 0%, #f5dde8 50%, #ecdceb 100%);
  padding: 6rem 1.5rem 3.5rem;
  text-align: center;
}

.hero-eyebrow {
  color: var(--pink-700);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.hero-title {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.9rem;
}

.hero-title em {
  color: var(--pink-500);
}

.hero-subtitle {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 auto;
  max-width: 620px;
}

.shop-catalog {
  padding: 2rem 1.5rem 4rem;
}

.catalog-inner {
  align-items: flex-start;
  display: flex;
  gap: 2rem;
  margin: 0 auto;
  max-width: 1200px;
}

.filter-toggle {
  display: none;
}

.filters-sidebar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 1.5rem;
  position: sticky;
  top: 88px;
  width: 210px;
}

.filter-group {
  border-bottom: 1px solid rgba(122, 31, 61, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-bottom: 1rem;
}

.filter-group:last-child {
  border-bottom: none;
}

.group-label {
  color: var(--pink-800);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  background: white;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.8rem;
}

.chip.active {
  background: var(--pink-800);
  color: white;
}

.product-area {
  flex: 1;
  min-width: 0;
}

.toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.results-copy,
.sort-label {
  color: var(--text-muted);
  font-size: 0.84rem;
}

.results-summary {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.clear-search-btn {
  background: white;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  color: var(--pink-800);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
}

.clear-search-btn:hover {
  background: var(--pink-800);
  border-color: var(--pink-800);
  color: white;
}

.sort-wrap {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.sort-select {
  background: white;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  color: var(--pink-800);
  font: inherit;
  padding: 0.4rem 0.85rem;
}

.product-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(4, 1fr);
}

.empty-state {
  color: var(--text-muted);
  grid-column: 1 / -1;
  padding: 3rem 1rem;
  text-align: center;
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

@media (max-width: 1100px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 860px) {
  .catalog-inner {
    flex-direction: column;
  }

  .filter-toggle {
    align-items: center;
    background: white;
    border: 1px solid var(--pink-200);
    border-radius: 12px;
    color: var(--pink-800);
    cursor: pointer;
    display: flex;
    font-weight: 700;
    justify-content: space-between;
    padding: 0.8rem 1rem;
    width: 100%;
  }

  .filters-sidebar {
    display: none;
    position: static;
    width: 100%;
  }

  .filters-sidebar.filters-open {
    display: flex;
  }

  .product-area {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .shop-catalog {
    padding: 1.25rem 1rem 3rem;
  }

  .product-grid {
    gap: 0.85rem;
  }
}
</style>
