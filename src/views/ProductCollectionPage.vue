<script>
import FooterSection from '@/components/FooterSection.vue'
import NavBar from '@/components/NavBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import { apiRequest } from '@/services/api'
import Paginate from 'vuejs-paginate-next'

export default {
  components: {
    NavBar,
    FooterSection,
    ProductCard,
    paginate: Paginate
  },

  props: {
    collectionType: {
      type: String,
      default: 'category'
    },
    category: {
      type: String,
      default: ''
    },
    eyebrow: {
      type: String,
      default: 'Blush Berry Edit'
    },
    title: {
      type: String,
      required: true
    },
    highlight: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      required: true
    },
    emptyText: {
      type: String,
      default: 'No products found.'
    }
  },

  data() {
    return {
      products: [],
      isLoading: true,
      loadError: '',
      sortBy: 'featured',
      currentPage: 1,
      itemsPerPage: 12,
      toastVisible: false,
      toastMessage: '',
      toastTimer: null
    }
  },

  computed: {
    visibleProducts() {
      let list = [...this.products]

      if (this.collectionType === 'new') {
        list = list.filter(product => product.isNew)
      }

      if (this.collectionType === 'sale') {
        list = list.filter(product => Number(product.discount || 0) > 0 || Number(product.originalPrice || 0) > Number(product.price || 0))
      }

      if (this.sortBy === 'low') {
        list.sort((a, b) => a.price - b.price)
      }

      if (this.sortBy === 'high') {
        list.sort((a, b) => b.price - a.price)
      }

      if (this.sortBy === 'newest' || this.collectionType === 'new') {
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      }

      if (this.collectionType === 'sale' && this.sortBy === 'featured') {
        list.sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0))
      }

      return list
    },

    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.visibleProducts.slice(start, start + this.itemsPerPage)
    },

    pageCount() {
      return Math.max(1, Math.ceil(this.visibleProducts.length / this.itemsPerPage))
    },

    productLabel() {
      return this.collectionType === 'category' ? this.title.toLowerCase() : 'collection'
    },

    heroTitleParts() {
      if (!this.highlight) {
        return { before: this.title, highlight: '', after: '' }
      }

      const index = this.title.toLowerCase().indexOf(this.highlight.toLowerCase())

      if (index === -1) {
        return { before: this.title, highlight: this.highlight, after: '' }
      }

      return {
        before: this.title.slice(0, index),
        highlight: this.title.slice(index, index + this.highlight.length),
        after: this.title.slice(index + this.highlight.length)
      }
    }
  },

  watch: {
    collectionType() {
      this.currentPage = 1
      this.loadProducts()
    },

    category() {
      this.currentPage = 1
      this.loadProducts()
    },

    sortBy() {
      this.currentPage = 1
    }
  },

  mounted() {
    this.loadProducts()
  },

  methods: {
    async loadProducts() {
      this.isLoading = true
      this.loadError = ''

      try {
        const path = this.collectionType === 'category' && this.category
          ? `/products?category=${encodeURIComponent(this.category)}`
          : '/products'
        const data = await apiRequest(path)
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
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="collection-page">
      <section class="collection-hero">
        <p class="hero-eyebrow">{{ eyebrow }}</p>
        <h1>
          {{ heroTitleParts.before }}<em v-if="heroTitleParts.highlight">{{ heroTitleParts.highlight }}</em>{{ heroTitleParts.after }}
        </h1>
        <p>{{ subtitle }}</p>
      </section>

      <section class="collection-content">
        <div class="collection-toolbar">
          <p>{{ visibleProducts.length }} {{ productLabel }} product{{ visibleProducts.length !== 1 ? 's' : '' }}</p>
          <div class="sort-wrap">
            <label for="collection-sort">Sort by</label>
            <select id="collection-sort" v-model="sortBy">
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
            v-for="product in paginatedProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
          />

          <p v-if="!isLoading && !loadError && visibleProducts.length === 0" class="empty-state">
            {{ emptyText }}
          </p>
        </div>

        <paginate
          v-if="visibleProducts.length > itemsPerPage"
          v-model="currentPage"
          :click-handler="page => (currentPage = page)"
          :container-class="'catalog-pagination'"
          :page-count="pageCount"
          :page-range="3"
          :margin-pages="1"
          :next-text="'Next'"
          :prev-text="'Prev'"
        />
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
  background: #fff8fb;
  display: flex;
  flex-direction: column;
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
}

.collection-page {
  flex: 1;
}

.collection-hero {
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

.collection-hero h1 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.9rem;
}

.collection-hero em {
  color: var(--pink-500);
}

.collection-hero p:last-child {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 auto;
  max-width: 620px;
}

.collection-content {
  margin: 0 auto;
  max-width: 1200px;
  padding: 2rem 1.5rem 4rem;
}

.collection-toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.collection-toolbar p,
.sort-wrap label {
  color: var(--text-muted);
  font-size: 0.84rem;
}

.sort-wrap {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.sort-wrap select {
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

.catalog-pagination {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  list-style: none;
  margin: 1.5rem 0 0;
  padding: 0;
}

.catalog-pagination :deep(li) {
  list-style: none;
}

.catalog-pagination :deep(a) {
  align-items: center;
  background: white;
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

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .collection-content {
    padding: 1.25rem 1rem 3rem;
  }

  .product-grid {
    gap: 0.85rem;
  }
}
</style>
