<script>
import FooterSection from '@/components/FooterSection.vue'
import NavBar from '@/components/NavBar.vue'
import { apiRequest } from '@/services/api'

function productKey(item) {
  return [item.brand, item.name].filter(Boolean).join('::').toLowerCase()
}

function summarizeItems(orders, predicate) {
  const products = new Map()

  orders
    .filter(order => order.status !== 'cancelled' && predicate(new Date(order.date)))
    .forEach(order => {
      order.items.forEach(item => {
        const key = productKey(item)
        const current = products.get(key) || {
          brand: item.brand || 'Unknown brand',
          name: item.name || 'Unknown product',
          image: item.image || '',
          quantity: 0,
          revenue: 0,
          orders: new Set()
        }

        current.quantity += Number(item.qty || 0)
        current.revenue += Number(item.price || 0) * Number(item.qty || 0)
        current.orders.add(order.id)
        products.set(key, current)
      })
    })

  return Array.from(products.values())
    .map(product => ({
      ...product,
      orders: product.orders.size
    }))
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
}

export default {
  components: {
    NavBar,
    FooterSection
  },

  data() {
    return {
      orders: [],
      activePeriod: 'month',
      isLoading: true,
      loadError: '',
      accessError: ''
    }
  },

  computed: {
    token() {
      return localStorage.getItem('authToken')
    },

    now() {
      return new Date()
    },

    monthLabel() {
      return new Intl.DateTimeFormat('en-MY', {
        month: 'long',
        year: 'numeric'
      }).format(this.now)
    },

    yearLabel() {
      return String(this.now.getFullYear())
    },

    monthlyProducts() {
      const month = this.now.getMonth()
      const year = this.now.getFullYear()

      return summarizeItems(this.orders, date => (
        date.getMonth() === month && date.getFullYear() === year
      ))
    },

    yearlyProducts() {
      const year = this.now.getFullYear()

      return summarizeItems(this.orders, date => date.getFullYear() === year)
    },

    activeProducts() {
      return this.activePeriod === 'month' ? this.monthlyProducts : this.yearlyProducts
    },

    topMonthProduct() {
      return this.monthlyProducts[0] || null
    },

    topYearProduct() {
      return this.yearlyProducts[0] || null
    },

    activeTotalQuantity() {
      return this.activeProducts.reduce((sum, product) => sum + product.quantity, 0)
    },

    activeTotalRevenue() {
      return this.activeProducts.reduce((sum, product) => sum + product.revenue, 0)
    },

    activePeriodLabel() {
      return this.activePeriod === 'month' ? this.monthLabel : this.yearLabel
    }
  },

  async mounted() {
    if (!this.token) {
      this.$router.push({ path: '/login', query: { redirect: '/admin/analytics' } })
      return
    }

    const canViewAnalytics = await this.checkAdminAccess()

    if (canViewAnalytics) {
      this.loadOrders()
    }
  },

  methods: {
    authHeaders() {
      return {
        Authorization: `Bearer ${this.token}`
      }
    },

    async checkAdminAccess() {
      try {
        const data = await apiRequest('/auth/profile', {
          headers: this.authHeaders()
        })

        localStorage.setItem('authUser', JSON.stringify(data.user))

        if (data.user.role !== 'admin') {
          this.accessError = 'Admin access is required to view analytics.'
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

    async loadOrders() {
      this.isLoading = true
      this.loadError = ''

      try {
        const data = await apiRequest('/orders/admin', {
          headers: this.authHeaders()
        })

        this.orders = data.orders
      } catch (error) {
        this.loadError = error.message
      } finally {
        this.isLoading = false
      }
    },

    formatMoney(value) {
      return `RM ${Number(value || 0).toFixed(2)}`
    },

    productShare(product) {
      if (!this.activeTotalQuantity) return 0
      return Math.round((product.quantity / this.activeTotalQuantity) * 100)
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
          <h1>Analytics Dashboard</h1>
        </div>
        <router-link class="shop-link" to="/admin/orders">Orders</router-link>
      </section>

      <p v-if="accessError" class="access-panel">{{ accessError }}</p>

      <template v-else>
        <section class="metric-row" aria-label="Sales analytics summary">
          <article class="metric highlight">
            <span>{{ topMonthProduct ? topMonthProduct.name : 'No sales' }}</span>
            <p>Best seller this month</p>
          </article>
          <article class="metric highlight">
            <span>{{ topYearProduct ? topYearProduct.name : 'No sales' }}</span>
            <p>Best seller this year</p>
          </article>
          <article class="metric">
            <span>{{ formatMoney(activeTotalRevenue) }}</span>
            <p>{{ activePeriodLabel }} product revenue</p>
          </article>
        </section>

        <section class="analytics-panel">
          <div class="toolbar">
            <div>
              <h2>Product sales</h2>
              <p>{{ activePeriodLabel }}</p>
            </div>
            <div class="period-tabs" aria-label="Choose analytics period">
              <button
                class="period-tab"
                :class="{ active: activePeriod === 'month' }"
                type="button"
                @click="activePeriod = 'month'"
              >
                This month
              </button>
              <button
                class="period-tab"
                :class="{ active: activePeriod === 'year' }"
                type="button"
                @click="activePeriod = 'year'"
              >
                This year
              </button>
            </div>
          </div>

          <p v-if="isLoading" class="empty-state">Loading analytics...</p>
          <p v-else-if="loadError" class="empty-state">{{ loadError }}</p>
          <p v-else-if="activeProducts.length === 0" class="empty-state">No product sales found for this period.</p>

          <div v-else class="analytics-grid">
            <article class="top-product">
              <div class="top-image">
                <img v-if="activeProducts[0].image" :src="activeProducts[0].image" :alt="activeProducts[0].name" />
                <div v-else class="image-fallback"></div>
              </div>
              <div>
                <p class="eyebrow">Top product</p>
                <h2>{{ activeProducts[0].name }}</h2>
                <span>{{ activeProducts[0].brand }}</span>
              </div>
              <dl>
                <div>
                  <dt>Units sold</dt>
                  <dd>{{ activeProducts[0].quantity }}</dd>
                </div>
                <div>
                  <dt>Revenue</dt>
                  <dd>{{ formatMoney(activeProducts[0].revenue) }}</dd>
                </div>
              </dl>
            </article>

            <div class="ranking-list">
              <article v-for="(product, index) in activeProducts" :key="`${product.brand}-${product.name}`" class="ranking-item">
                <div class="rank-number">{{ index + 1 }}</div>
                <div class="product-cell">
                  <img v-if="product.image" :src="product.image" :alt="product.name" />
                  <div v-else class="image-fallback"></div>
                  <div>
                    <strong>{{ product.name }}</strong>
                    <span>{{ product.brand }}</span>
                  </div>
                </div>
                <div class="bar-cell">
                  <div class="bar-track" aria-hidden="true">
                    <span :style="{ width: `${productShare(product)}%` }"></span>
                  </div>
                  <p>{{ productShare(product) }}% of units</p>
                </div>
                <div class="sales-cell">
                  <strong>{{ product.quantity }}</strong>
                  <span>{{ formatMoney(product.revenue) }}</span>
                </div>
              </article>
            </div>
          </div>
        </section>
      </template>
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
.toolbar,
.period-tabs,
.ranking-item,
.product-cell {
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
.period-tab {
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
}

.shop-link {
  background: white;
  border: 1px solid var(--pink-200);
  color: var(--pink-800);
  padding: 0.62rem 1rem;
}

.metric-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 1.5rem;
}

.metric,
.analytics-panel,
.top-product,
.ranking-item,
.access-panel {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.metric {
  min-width: 0;
  padding: 1.1rem;
}

.metric span {
  color: var(--pink-800);
  display: block;
  font-size: clamp(1.1rem, 2vw, 1.8rem);
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.metric p,
.toolbar p,
.product-cell span,
.bar-cell p,
.sales-cell span,
.top-product span {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.highlight span {
  color: var(--pink-900);
}

.analytics-panel {
  padding: 1.25rem;
}

.toolbar {
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.period-tabs {
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  gap: 0.25rem;
  padding: 0.25rem;
}

.period-tab {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem 0.85rem;
}

.period-tab.active {
  background: var(--pink-800);
  color: white;
}

.analytics-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(280px, 0.8fr) minmax(0, 1.2fr);
}

.top-product {
  align-content: start;
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.top-image,
.top-image img,
.top-image .image-fallback {
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  width: 100%;
}

.top-image img,
.top-image .image-fallback {
  background: var(--pink-100);
  object-fit: cover;
}

dl {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, 1fr);
  margin: 0;
}

dt {
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

dd {
  color: var(--pink-800);
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0.2rem 0 0;
}

.ranking-list {
  display: grid;
  gap: 0.75rem;
}

.ranking-item {
  gap: 1rem;
  min-width: 0;
  padding: 0.85rem;
}

.rank-number {
  align-items: center;
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 50%;
  color: var(--pink-800);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.82rem;
  font-weight: 900;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.product-cell {
  flex: 1 1 240px;
  gap: 0.75rem;
  min-width: 0;
}

.product-cell img,
.product-cell .image-fallback {
  background: var(--pink-100);
  border-radius: 8px;
  flex: 0 0 auto;
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
  overflow-wrap: anywhere;
}

.bar-cell {
  flex: 1 1 220px;
}

.bar-track {
  background: #fff0f6;
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
}

.bar-track span {
  background: var(--pink-600);
  border-radius: inherit;
  display: block;
  height: 100%;
  min-width: 8px;
}

.bar-cell p {
  margin-top: 0.35rem;
}

.sales-cell {
  min-width: 110px;
  text-align: right;
}

.sales-cell strong {
  color: var(--pink-800);
  display: block;
  font-size: 1.05rem;
}

.access-panel {
  color: var(--text-secondary);
  font-weight: 700;
  padding: 1.25rem;
}

.empty-state {
  color: var(--text-muted);
  padding: 3rem 1rem;
  text-align: center;
}

@media (max-width: 980px) {
  .metric-row,
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .admin-page {
    padding: 6rem 1rem 3rem;
  }

  .admin-header,
  .toolbar,
  .ranking-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .period-tabs {
    width: 100%;
  }

  .period-tab {
    flex: 1;
  }

  .bar-cell,
  .product-cell,
  .sales-cell {
    width: 100%;
  }

  .sales-cell {
    text-align: left;
  }
}
</style>
