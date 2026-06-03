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

  data() {
    return {
      products: [],
      isLoading: true,
      loadError: '',
      currentPage: 1,
      itemsPerPage: 12,
      toastVisible: false,
      toastMessage: '',
      toastTimer: null
    }
  },

  computed: {
    saleProducts() {
      return [...this.products]
        .filter(product => Number(product.discount || 0) > 0 || Number(product.originalPrice || 0) > Number(product.price || 0))
        .sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0))
    },

    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.saleProducts.slice(start, start + this.itemsPerPage)
    },

    pageCount() {
      return Math.max(1, Math.ceil(this.saleProducts.length / this.itemsPerPage))
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
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="collection-page">
      <section class="shop-hero">
        <p class="hero-eyebrow">Limited offers</p>
        <h1 class="hero-title">Sale <em>Picks</em></h1>
        <p class="hero-subtitle">Discounted beauty picks from your current catalog.</p>
      </section>

      <section class="collection-shell">
        <p v-if="isLoading" class="empty-state">Loading sale products...</p>
        <p v-else-if="loadError" class="empty-state">{{ loadError }}</p>
        <p v-else-if="saleProducts.length === 0" class="empty-state">No sale products right now.</p>

        <div v-else class="product-grid">
          <ProductCard
            v-for="product in paginatedProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
          />
        </div>

        <paginate
          v-if="saleProducts.length > itemsPerPage"
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

    <div v-if="toastVisible" class="toast">{{ toastMessage }}</div>
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

.collection-page {
  padding-bottom: 4rem;
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

.empty-state {
  color: var(--text-muted);
}

.collection-shell {
  margin: 0 auto;
  max-width: 1280px;
  min-height: 360px;
  padding: 2rem 1rem 0;
}

.product-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.empty-state {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
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

.toast {
  background: var(--pink-800);
  border-radius: 999px;
  bottom: 1.5rem;
  color: white;
  font-weight: 800;
  left: 50%;
  padding: 0.75rem 1.15rem;
  position: fixed;
  transform: translateX(-50%);
  z-index: 1200;
}

@media (max-width: 980px) {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
