<template>
  <section class="featured">
    <div class="section-inner">
      <div class="section-header">
        <div class="header-left">
          <span class="section-tag">Trending Now</span>
          <h2 class="section-title">Bestsellers</h2>
        </div>
        <router-link to="/shop" class="view-all">View All Products</router-link>
      </div>

      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ active: activeTab === tab.id }"
          type="button"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
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
          No featured products found.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { apiRequest } from '@/services/api'

const router = useRouter()
const activeTab = ref('all')
const products = ref([])
const isLoading = ref(true)
const loadError = ref('')

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'Skincare', label: 'Skincare' },
  { id: 'Makeup', label: 'Makeup' },
  { id: 'new', label: 'New Arrivals' },
]

const filteredProducts = computed(() => {
  if (activeTab.value === 'all') return products.value
  if (activeTab.value === 'new') return products.value.filter(product => product.isNew)
  return products.value.filter(product => product.category === activeTab.value)
})

const loadProducts = async () => {
  try {
    const data = await apiRequest('/products?bestseller=true')
    products.value = data.products
  } catch (error) {
    loadError.value = error.message
  } finally {
    isLoading.value = false
  }
}

const addToCart = async (product) => {
  if (product.has_variants && product.variants?.length) {
    router.push(`/product/${product.id}`)
    return
  }

  const token = localStorage.getItem('authToken')

  if (!token) {
    console.log('Please log in before adding items to cart.')
    return
  }

  await apiRequest('/cart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId: product.id, qty: 1 }),
  })
  window.dispatchEvent(new Event('cart-updated'))
}

onMounted(loadProducts)
</script>

<style scoped>
.featured {
  background: linear-gradient(180deg, #fff8fb 0%, #fff3f7 100%);
  padding: 5rem 2rem;
}

.section-inner {
  margin: 0 auto;
  max-width: 1280px;
}

.section-header {
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.section-tag {
  color: #e8799a;
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
}

.section-title {
  color: #6b2d47;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 700;
  margin: 0;
}

.view-all {
  border-bottom: 1.5px solid rgba(232, 121, 154, 0.4);
  color: #e8799a;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  padding-bottom: 3px;
  text-decoration: none;
  white-space: nowrap;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
}

.tab {
  background: rgba(240, 200, 220, 0.2);
  border: 1.5px solid transparent;
  border-radius: 999px;
  color: #b07a90;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 22px;
}

.tab.active {
  background: linear-gradient(135deg, #e8799a, #d4547a);
  box-shadow: 0 4px 16px rgba(212, 84, 122, 0.3);
  color: white;
}

.product-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(4, 1fr);
}

.empty-state {
  color: var(--text-muted);
  grid-column: 1 / -1;
  padding: 2rem 1rem;
  text-align: center;
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
  .featured {
    padding: 4rem 1rem;
  }

  .product-grid {
    gap: 1rem;
  }
}
</style>
