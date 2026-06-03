<script>
import FooterSection from '@/components/FooterSection.vue'
import NavBar from '@/components/NavBar.vue'
import { apiRequest } from '@/services/api'

export default {
  components: {
    NavBar,
    FooterSection
  },

  data() {
    return {
      orders: [],
      activeStatus: 'all',
      isLoading: true,
      loadError: '',
      statusTabs: [
        { label: 'All', value: 'all' },
        { label: 'Processing', value: 'processing' },
        { label: 'Packed', value: 'packed' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    }
  },

  computed: {
    token() {
      return localStorage.getItem('authToken')
    },

    formattedOrders() {
      return this.orders.map(order => ({
        ...order,
        displayId: `BB-${String(order.id).slice(-6).toUpperCase()}`
      }))
    },

    filteredOrders() {
      if (this.activeStatus === 'all') {
        return this.formattedOrders
      }

      return this.formattedOrders.filter(order => order.status === this.activeStatus)
    }
  },

  mounted() {
    this.loadOrders()
  },

  methods: {
    async loadOrders() {
      if (!this.token) {
        this.loadError = 'Please log in to view your orders.'
        this.isLoading = false
        return
      }

      try {
        const data = await apiRequest('/orders', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.orders = data.orders
      } catch (error) {
        this.loadError = error.message
      } finally {
        this.isLoading = false
      }
    },

    formatDate(value) {
      if (!value) return ''

      return new Intl.DateTimeFormat('en-MY', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(value))
    },

    formatMoney(value) {
      return `RM ${Number(value || 0).toFixed(2)}`
    },

    itemDetail(item) {
      const detail = String(item.variant || '').trim()
      const normalized = detail.toLowerCase().replace(/\s+/g, '')

      return ['makeup', 'skincare'].includes(normalized) ? '' : detail
    },

    statusCount(status) {
      if (status === 'all') return this.formattedOrders.length
      return this.formattedOrders.filter(order => order.status === status).length
    },

    statusStep(status) {
      const steps = ['processing', 'packed', 'shipped', 'completed']
      const index = steps.indexOf(status)
      return index === -1 ? 1 : index + 1
    },

    statusProgress(status) {
      return `${((this.statusStep(status) - 1) / 3) * 100}%`
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="orders-page">
      <section class="shop-hero">
        <p class="hero-eyebrow">Order updates</p>
        <h1 class="hero-title">My <em>Orders</em></h1>
        <p class="hero-subtitle">View every order you have placed and follow the latest status.</p>
      </section>

      <section class="orders-panel">
        <p v-if="isLoading" class="empty-state">Loading your orders...</p>
        <div v-else-if="loadError" class="empty-state error">
          <p>{{ loadError }}</p>
          <router-link class="login-link" to="/login">Log In</router-link>
        </div>
        <div v-else-if="formattedOrders.length === 0" class="empty-state">
          <p>No orders yet. Your completed checkout orders will appear here.</p>
          <router-link class="login-link" to="/shop">Start Shopping</router-link>
        </div>

        <template v-else>
          <div class="status-tabs" aria-label="Filter orders by status">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              class="status-tab"
              :class="{ active: activeStatus === tab.value }"
              type="button"
              @click="activeStatus = tab.value"
            >
              {{ tab.label }}
              <span>{{ statusCount(tab.value) }}</span>
            </button>
          </div>

          <p v-if="filteredOrders.length === 0" class="empty-state">No {{ activeStatus }} orders found.</p>

          <div v-else class="order-list">
          <article v-for="order in filteredOrders" :key="order.id" class="order-card">
            <div class="order-main">
              <div>
                <p class="order-id">{{ order.displayId }}</p>
                <p>{{ order.transactionId }} | {{ formatDate(order.date) }}</p>
              </div>
              <strong>{{ formatMoney(order.total) }}</strong>
            </div>

            <div class="order-items">
              <div v-for="item in order.items" :key="`${order.id}-${item.name}-${item.variant}`" class="order-product">
                <img v-if="item.image" :src="item.image" :alt="item.name" />
                <div v-else class="product-fallback"></div>
                <div class="product-info">
                  <span>{{ item.brand }}</span>
                  <strong>{{ item.name }}</strong>
                  <p v-if="itemDetail(item)">{{ itemDetail(item) }}</p>
                </div>
                <div class="product-qty">x{{ item.qty }}</div>
                <div class="product-price">{{ formatMoney(item.price * item.qty) }}</div>
              </div>
            </div>

            <div class="status-track" :style="{ '--progress': statusProgress(order.status) }">
              <span>Processing</span>
              <span>Packed</span>
              <span>Shipped</span>
              <span>Completed</span>
            </div>

            <div class="order-footer">
              <span class="status-pill" :class="order.status">{{ order.status }}</span>
              <p>{{ order.shippingAddress?.city }}, {{ order.shippingAddress?.state }}</p>
            </div>
          </article>
          </div>
        </template>
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

.orders-page {
  padding-bottom: 4rem;
}

.shop-hero {
  background: linear-gradient(135deg, #fbeef3 0%, #f5dde8 50%, #ecdceb 100%);
  padding: 6rem 1.5rem 3.5rem;
  text-align: center;
}

.hero-eyebrow,
.order-id {
  color: var(--pink-700);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.hero-eyebrow {
  font-weight: 700;
  letter-spacing: 0.3em;
  margin-bottom: 0.75rem;
}

h2 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
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

.orders-panel {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: 1rem;
  margin: 2rem auto 0;
  max-width: 1440px;
  padding: 1.25rem;
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status-tab {
  align-items: center;
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 800;
  gap: 0.4rem;
  padding: 0.55rem 0.85rem;
}

.status-tab.active {
  background: var(--pink-800);
  border-color: var(--pink-800);
  color: white;
}

.status-tab span {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  color: var(--pink-800);
  min-width: 1.5rem;
  padding: 0.1rem 0.4rem;
}

.empty-state {
  color: var(--text-muted);
  padding: 2rem 1rem;
  text-align: center;
}

.empty-state.error {
  background: #fff5f5;
  border-radius: 8px;
  color: #b42318;
  font-weight: 800;
}

.login-link {
  color: var(--pink-800);
  display: inline-block;
  font-weight: 800;
  margin-top: 0.75rem;
}

.order-list {
  display: grid;
  gap: 1rem;
}

.order-card {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.order-main,
.order-footer {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.order-main p,
.order-footer p {
  color: var(--text-muted);
}

.order-main strong {
  color: var(--pink-800);
  font-size: 1.1rem;
}

.order-items {
  border-top: 1px solid rgba(232, 121, 154, 0.16);
  display: grid;
  gap: 0.85rem;
  padding-top: 1rem;
}

.order-product {
  align-items: center;
  display: grid;
  gap: 0.85rem;
  grid-template-columns: 72px minmax(0, 1fr) auto auto;
}

.order-product img,
.product-fallback {
  background: var(--pink-100);
  border-radius: 8px;
  height: 72px;
  object-fit: cover;
  width: 72px;
}

.product-info {
  min-width: 0;
}

.product-info span {
  color: var(--pink-500);
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.product-info strong {
  color: var(--pink-900);
  display: block;
  margin-top: 0.15rem;
}

.product-info p {
  color: var(--text-muted);
  font-size: 0.84rem;
  margin-top: 0.15rem;
}

.product-qty,
.product-price {
  color: var(--pink-800);
  font-weight: 800;
  white-space: nowrap;
}

.status-track {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(4, 1fr);
  position: relative;
}

.status-track::before {
  background: #fff0f6;
  content: '';
  height: 6px;
  left: 0;
  position: absolute;
  right: 0;
  top: 12px;
}

.status-track::after {
  background: var(--pink-600);
  content: '';
  height: 6px;
  left: 0;
  position: absolute;
  top: 12px;
  width: var(--progress);
}

.status-track span {
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  padding-top: 1.6rem;
  position: relative;
  text-align: center;
  z-index: 1;
}

.status-track span::before {
  background: white;
  border: 3px solid var(--pink-300);
  border-radius: 50%;
  content: '';
  height: 22px;
  left: 50%;
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  width: 22px;
}

.status-pill {
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.4rem 0.75rem;
  text-transform: capitalize;
}

.status-pill.processing {
  background: #fff7ed;
  color: #c2410c;
}

.status-pill.packed,
.status-pill.shipped {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-pill.completed {
  background: #f0fdf4;
  color: #166534;
}

.status-pill.cancelled {
  background: #fff5f5;
  color: #b42318;
}

@media (max-width: 680px) {
  .order-main,
  .order-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .status-track span {
    font-size: 0.66rem;
  }

  .order-product {
    align-items: start;
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .order-product img,
  .product-fallback {
    height: 64px;
    width: 64px;
  }

  .product-qty,
  .product-price {
    grid-column: 2;
  }
}
</style>
