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

  props: {
    category: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      products: [],
      isLoading: true,
      loadError: '',
      sortBy: 'featured',
      toastVisible: false,
      toastMessage: '',
      toastTimer: null
    }
  },

  computed: {
    sortedProducts() {
      const list = [...this.products]

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

  watch: {
    category() {
      this.loadProducts()
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
        const data = await apiRequest(`/products?category=${encodeURIComponent(this.category)}`)
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

    <main class="category-page">
      <section class="category-hero">
        <p class="hero-eyebrow">Blush Berry Edit</p>
        <h1>{{ category }}</h1>
        <p>{{ subtitle }}</p>
      </section>

      <section class="category-content">
        <div class="category-toolbar">
          <p>{{ sortedProducts.length }} {{ category.toLowerCase() }} product{{ sortedProducts.length !== 1 ? 's' : '' }}</p>
          <div class="sort-wrap">
            <label for="category-sort">Sort by</label>
            <select id="category-sort" v-model="sortBy">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div class="product-grid">
          <p v-if="isLoading" class="empty-state">Loading {{ category.toLowerCase() }} products from MongoDB...</p>
          <p v-else-if="loadError" class="empty-state">{{ loadError }}</p>

          <ProductCard
            v-else
            v-for="product in sortedProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
          />

          <p v-if="!isLoading && !loadError && sortedProducts.length === 0" class="empty-state">
            No {{ category.toLowerCase() }} products found.
          </p>
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

.category-page {
  flex: 1;
}

.category-hero {
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

.category-hero h1 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.9rem;
}

.category-hero p:last-child {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 auto;
  max-width: 620px;
}

.category-content {
  margin: 0 auto;
  max-width: 1200px;
  padding: 2rem 1.5rem 4rem;
}

.category-toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.category-toolbar p,
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
  .category-content {
    padding: 1.25rem 1rem 3rem;
  }

  .product-grid {
    gap: 0.85rem;
  }
}
</style>
