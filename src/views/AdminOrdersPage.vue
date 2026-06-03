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
      searchTerm: '',
      isLoading: true,
      isUpdating: '',
      loadError: '',
      accessError: '',
      notice: '',
      noticeType: 'success',
      statusOptions: [
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

    statusTabs() {
      return [
        { label: 'All', value: 'all' },
        ...this.statusOptions
      ]
    },

    filteredOrders() {
      const search = this.searchTerm.trim().toLowerCase()

      return this.orders.filter(order => {
        const statusMatch = this.activeStatus === 'all' || order.status === this.activeStatus
        const searchable = [
          order.transactionId,
          order.customer?.name,
          order.customer?.email,
          order.customer?.phone,
          order.itemSummary,
          order.shippingAddress?.city,
          order.shippingAddress?.state
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return statusMatch && (!search || searchable.includes(search))
      })
    },

    totalOrders() {
      return this.orders.length
    },

    openOrders() {
      return this.orders.filter(order => ['processing', 'packed', 'shipped'].includes(order.status)).length
    },

    todaysOrders() {
      const now = new Date()
      const day = now.getDate()
      const month = now.getMonth()
      const year = now.getFullYear()

      return this.orders
        .filter(order => {
          const orderDate = new Date(order.date)

          return orderDate.getDate() === day
            && orderDate.getMonth() === month
            && orderDate.getFullYear() === year
        }).length
    }
  },

  async mounted() {
    if (!this.token) {
      this.$router.push({ path: '/login', query: { redirect: '/admin/orders' } })
      return
    }

    const canManageOrders = await this.checkAdminAccess()

    if (canManageOrders) {
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
          this.accessError = 'Admin access is required to manage orders.'
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

    async updateStatus(order, status) {
      if (order.status === status) return

      this.isUpdating = order.id
      this.notice = ''

      try {
        const data = await apiRequest(`/orders/admin/${order.id}/status`, {
          method: 'PATCH',
          headers: this.authHeaders(),
          body: JSON.stringify({ status })
        })

        const index = this.orders.findIndex(item => item.id === order.id)

        if (index !== -1) {
          this.orders[index] = data.order
        }

        this.showNotice('Order status updated.')
      } catch (error) {
        this.showNotice(error.message, 'error')
      } finally {
        this.isUpdating = ''
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
          <h1>Order Management</h1>
        </div>
        <router-link class="shop-link" to="/admin/products">Products</router-link>
      </section>

      <p v-if="accessError" class="access-panel">{{ accessError }}</p>

      <template v-else>
        <section class="metric-row" aria-label="Order summary">
          <div class="metric">
            <span>{{ totalOrders }}</span>
            <p>Total orders</p>
          </div>
          <div class="metric">
            <span>{{ openOrders }}</span>
            <p>Active orders</p>
          </div>
          <div class="metric">
            <span>{{ todaysOrders }}</span>
            <p>Orders today</p>
          </div>
        </section>

        <section class="orders-panel">
          <div class="toolbar">
            <div class="status-tabs">
              <button
                v-for="tab in statusTabs"
                :key="tab.value"
                class="status-tab"
                :class="{ active: activeStatus === tab.value }"
                type="button"
                @click="activeStatus = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
            <input v-model.trim="searchTerm" aria-label="Search orders" placeholder="Search orders" type="search" />
          </div>

          <p v-if="notice" class="notice" :class="noticeType">{{ notice }}</p>
          <p v-if="isLoading" class="empty-state">Loading orders...</p>
          <p v-else-if="loadError" class="empty-state">{{ loadError }}</p>
          <p v-else-if="filteredOrders.length === 0" class="empty-state">No orders found.</p>

          <div v-else class="order-list">
            <article v-for="order in filteredOrders" :key="order.id" class="order-card">
              <div class="order-main">
                <div>
                  <p class="order-id">{{ order.transactionId }}</p>
                  <h2>{{ order.customer?.name }}</h2>
                  <p class="order-meta">{{ formatDate(order.date) }}</p>
                </div>
                <div class="order-total">
                  <span>Total</span>
                  <strong>{{ formatMoney(order.total) }}</strong>
                </div>
              </div>

              <div class="order-grid">
                <div class="info-box">
                  <span>Contact</span>
                  <strong>{{ order.customer?.phone }}</strong>
                  <p>{{ order.customer?.email }}</p>
                </div>
                <div class="info-box">
                  <span>Shipping</span>
                  <strong>{{ order.shippingAddress?.city }}, {{ order.shippingAddress?.state }}</strong>
                  <p>{{ order.shippingAddress?.address }} {{ order.shippingAddress?.postcode }}</p>
                </div>
                <div class="info-box">
                  <span>Payment</span>
                  <strong>{{ order.paymentStatus }}</strong>
                  <p>{{ order.paymentMethod }}</p>
                </div>
              </div>

              <div class="items-list">
                <div v-for="item in order.items" :key="`${order.id}-${item.name}-${item.variant}`" class="order-item">
                  <div>
                    <span class="item-brand">{{ item.brand }}</span>
                    <strong>{{ item.name }}</strong>
                    <span v-if="itemDetail(item)">{{ itemDetail(item) }}</span>
                  </div>
                  <p>x{{ item.qty }}</p>
                  <p>{{ formatMoney(item.price * item.qty) }}</p>
                </div>
              </div>

              <div class="status-row">
                <label>
                  <span>Status</span>
                  <select
                    :value="order.status"
                    :disabled="isUpdating === order.id"
                    @change="updateStatus(order, $event.target.value)"
                  >
                    <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>
                <span class="status-pill" :class="order.status">{{ order.status }}</span>
              </div>
            </article>
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
.order-main,
.status-row {
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
  font-size: 1.45rem;
  font-weight: 700;
}

.shop-link {
  background: white;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  color: var(--pink-800);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 0.62rem 1rem;
  text-decoration: none;
}

.metric-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 1.5rem;
}

.metric,
.orders-panel,
.order-card,
.access-panel {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.metric {
  padding: 1.1rem;
}

.metric span {
  color: var(--pink-800);
  font-size: 1.8rem;
  font-weight: 800;
}

.metric p,
.order-meta,
.info-box p,
.order-item span:not(.item-brand) {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.orders-panel {
  padding: 1.25rem;
}

.toolbar {
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.status-tab {
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  color: var(--text-secondary);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.45rem 0.8rem;
}

.status-tab.active {
  background: var(--pink-800);
  color: white;
}

input,
select {
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 8px;
  color: var(--text-primary);
  font: inherit;
  min-height: 42px;
  outline: none;
  padding: 0.65rem 0.75rem;
}

input {
  width: min(280px, 100%);
}

.notice,
.access-panel {
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.75rem 0.85rem;
}

.notice {
  margin-bottom: 1rem;
}

.notice.success {
  background: #f0fdf4;
  color: #166534;
}

.notice.error {
  background: #fff5f5;
  color: #b42318;
}

.order-list {
  display: grid;
  gap: 1rem;
}

.order-card {
  padding: 1rem;
}

.order-main {
  gap: 1rem;
  justify-content: space-between;
}

.order-id {
  color: var(--pink-600);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.order-total {
  text-align: right;
}

.order-total span,
.info-box span,
.status-row label span {
  color: var(--text-muted);
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.order-total strong {
  color: var(--pink-800);
  font-size: 1.2rem;
}

.order-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 1rem;
}

.info-box {
  background: #fff8fb;
  border: 1px solid rgba(240, 200, 220, 0.45);
  border-radius: 8px;
  padding: 0.85rem;
}

.info-box strong {
  color: var(--pink-800);
}

.items-list {
  border-top: 1px solid rgba(232, 121, 154, 0.16);
  display: grid;
  gap: 0.7rem;
  margin-top: 1rem;
  padding-top: 1rem;
}

.order-item {
  align-items: center;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1fr) auto auto;
}

.order-item strong {
  color: var(--pink-900);
  display: block;
}

.item-brand {
  color: var(--pink-500);
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  margin-bottom: 0.15rem;
  text-transform: uppercase;
}

.order-item p {
  color: var(--pink-800);
  font-weight: 800;
  margin: 0;
}

.status-row {
  border-top: 1px solid rgba(232, 121, 154, 0.16);
  gap: 1rem;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
}

.status-row label {
  display: grid;
  gap: 0.35rem;
  max-width: 240px;
  width: 100%;
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

.status-pill.packed {
  background: #eef2ff;
  color: #4338ca;
}

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

.empty-state {
  color: var(--text-muted);
  padding: 3rem 1rem;
  text-align: center;
}

@media (max-width: 820px) {
  .metric-row,
  .order-grid {
    grid-template-columns: 1fr;
  }

  .order-main,
  .status-row,
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .order-total {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .admin-page {
    padding: 6rem 1rem 3rem;
  }

  .admin-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
  }

  .order-item {
    align-items: flex-start;
    grid-template-columns: 1fr;
  }
}
</style>
