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
      user: null,
      isLoading: true,
      loadError: '',
      cartCount: 0,
      orders: [],
      isEditingAccount: false,
      isSavingAccount: false,
      accountMessage: '',
      accountError: '',
      accountForm: {
        firstName: '',
        lastName: '',
        email: ''
      },
      isChangingPassword: false,
      isSavingPassword: false,
      passwordMessage: '',
      passwordError: '',
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      cancellingOrderId: '',
      orderMessage: '',
      orderError: '',

      recentOrders: []
    }
  },

  computed: {
    fullName() {
      return this.user
        ? `${this.user.firstName} ${this.user.lastName}`
        : ''
    },

    initials() {
      return this.user
        ? `${this.user.firstName?.[0] || ''}${this.user.lastName?.[0] || ''}`.toUpperCase()
        : ''
    },

    memberSince() {
      if (!this.user?.createdAt) return 'New member'

      return new Date(this.user.createdAt).toLocaleDateString('en-MY', {
        month: 'short',
        year: 'numeric'
      })
    },

    stats() {
      return [
        { value: String(this.cartCount), label: 'Items in Cart' },
        { value: String(this.orders.length), label: 'Orders' },
        { value: String(this.orders.length * 60), label: 'Berry Points' }
      ]
    },

    formattedOrders() {
      return this.orders.map(order => ({
        ...order,
        displayId: `BB-${String(order.id).slice(-6).toUpperCase()}`,
        displayDate: new Date(order.date).toLocaleDateString('en-MY', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        displayStatus: order.status
          .split('-')
          .map(word => `${word[0].toUpperCase()}${word.slice(1)}`)
          .join(' '),
        canCancel: order.status === 'processing'
      }))
    }
  },

  methods: {
    async loadProfile() {
      const token = localStorage.getItem('authToken')

      if (!token) {
        this.loadError = 'Please log in before viewing your profile.'
        this.isLoading = false
        return
      }

      try {
        const profileData = await apiRequest('/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.user = profileData.user
        localStorage.setItem('authUser', JSON.stringify(profileData.user))

        if (this.user.role === 'admin') {
          this.$router.replace('/admin/products')
          return
        }

        this.resetAccountForm()

        const [cartData, orderData] = await Promise.all([
          apiRequest('/cart', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          apiRequest('/orders', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ])

        this.orders = orderData.orders
        this.cartCount = cartData.items.reduce(
          (sum, item) => sum + item.qty,
          0
        )
      } catch (error) {
        this.loadError = error.message

        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      } finally {
        this.isLoading = false
      }
    },

    async loadCartCount() {
      const token = localStorage.getItem('authToken')

      if (!token || !this.user) return

      try {
        const cartData = await apiRequest('/cart', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.cartCount = cartData.items.reduce(
          (sum, item) => sum + item.qty,
          0
        )
      } catch (error) {
        console.error('Unable to refresh profile cart count:', error)
      }
    },

    resetAccountForm() {
      if (!this.user) return

      this.accountForm = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email
      }
    },

    startEditingAccount() {
      this.accountMessage = ''
      this.accountError = ''
      this.resetAccountForm()
      this.isEditingAccount = true
    },

    cancelEditingAccount() {
      this.accountMessage = ''
      this.accountError = ''
      this.resetAccountForm()
      this.isEditingAccount = false
    },

    async saveAccountDetails() {
      const token = localStorage.getItem('authToken')

      if (!token) {
        this.accountError = 'Please log in again before updating your profile.'
        return
      }

      this.isSavingAccount = true
      this.accountMessage = ''
      this.accountError = ''

      try {
        const data = await apiRequest('/auth/profile', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.accountForm)
        })

        this.user = data.user
        localStorage.setItem('authUser', JSON.stringify(data.user))
        this.accountMessage = data.message
        this.isEditingAccount = false
      } catch (error) {
        this.accountError = error.message
      } finally {
        this.isSavingAccount = false
      }
    },

    resetPasswordForm() {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    },

    startChangingPassword() {
      this.passwordMessage = ''
      this.passwordError = ''
      this.resetPasswordForm()
      this.isChangingPassword = true
    },

    cancelChangingPassword() {
      this.passwordMessage = ''
      this.passwordError = ''
      this.resetPasswordForm()
      this.isChangingPassword = false
    },

    async savePassword() {
      const token = localStorage.getItem('authToken')

      if (!token) {
        this.passwordError = 'Please log in again before changing your password.'
        return
      }

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = 'New password and confirmation must match.'
        return
      }

      this.isSavingPassword = true
      this.passwordMessage = ''
      this.passwordError = ''

      try {
        const data = await apiRequest('/auth/profile/password', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.passwordForm)
        })

        this.passwordMessage = data.message
        this.resetPasswordForm()
        this.isChangingPassword = false
      } catch (error) {
        this.passwordError = error.message
      } finally {
        this.isSavingPassword = false
      }
    },

    async cancelOrder(order) {
      const token = localStorage.getItem('authToken')

      if (!token || !order.canCancel) return

      this.cancellingOrderId = order.id
      this.orderMessage = ''
      this.orderError = ''

      try {
        const data = await apiRequest(`/orders/${order.id}/cancel`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const index = this.orders.findIndex(item => item.id === order.id)

        if (index !== -1) {
          this.orders[index] = data.order
        }

        this.orderMessage = data.message
      } catch (error) {
        this.orderError = error.message
      } finally {
        this.cancellingOrderId = ''
      }
    },

    logout() {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')

      this.user = null

      this.$router.push('/login')
    }
  },

  mounted() {
    this.loadProfile()

    window.addEventListener('cart-updated', this.loadCartCount)
  },

  beforeUnmount() {
    window.removeEventListener('cart-updated', this.loadCartCount)
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="profile-page">
      <section class="profile-hero">
        <p class="hero-eyebrow">My Account</p>
        <h1 class="hero-title">Profile</h1>
        <p class="hero-subtitle">Manage your details, beauty preferences, and recent Blush Berry activity.</p>
      </section>

      <section class="profile-content">
        <div v-if="isLoading" class="empty-state">
          <h2>Loading your profile</h2>
          <p>Getting your latest account details from MongoDB.</p>
        </div>

        <div v-else-if="loadError" class="empty-state">
          <h2>Profile unavailable</h2>
          <p>{{ loadError }}</p>
          <router-link class="login-link" to="/login">Log In Again</router-link>
        </div>

        <div v-else-if="user" class="profile-layout">
          <aside class="profile-card">
            <div class="avatar" aria-hidden="true">{{ initials }}</div>
            <h2>{{ fullName }}</h2>
            <p>{{ user.email }}</p>
            <span class="member-badge">Berry Member</span>
            <button class="logout-btn" type="button" @click="logout">Log Out</button>
          </aside>

          <div class="profile-main">
            <div class="stats-grid">
              <article v-for="stat in stats" :key="stat.label" class="stat-card">
                <strong>{{ stat.value }}</strong>
                <span>{{ stat.label }}</span>
              </article>
            </div>

            <section class="panel">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Personal Details</p>
                  <h2>Account Information</h2>
                </div>
                <button v-if="!isEditingAccount" class="panel-link" type="button" @click="startEditingAccount">Edit Details</button>
              </div>

              <p v-if="accountMessage" class="form-message success">{{ accountMessage }}</p>
              <p v-if="accountError" class="form-message error">{{ accountError }}</p>

              <form v-if="isEditingAccount" class="account-form" @submit.prevent="saveAccountDetails">
                <label>
                  First Name
                  <input v-model="accountForm.firstName" type="text" autocomplete="given-name" required />
                </label>

                <label>
                  Last Name
                  <input v-model="accountForm.lastName" type="text" autocomplete="family-name" required />
                </label>

                <label class="wide">
                  Email
                  <input v-model="accountForm.email" type="email" autocomplete="email" required />
                </label>

                <div class="form-actions">
                  <button class="cancel-btn" type="button" :disabled="isSavingAccount" @click="cancelEditingAccount">Cancel</button>
                  <button class="save-btn" type="submit" :disabled="isSavingAccount">
                    {{ isSavingAccount ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>

              <div v-else class="details-grid">
                <div class="detail-item">
                  <span>First Name</span>
                  <strong>{{ user.firstName }}</strong>
                </div>
                <div class="detail-item">
                  <span>Last Name</span>
                  <strong>{{ user.lastName }}</strong>
                </div>
                <div class="detail-item">
                  <span>Email</span>
                  <strong>{{ user.email }}</strong>
                </div>
                <div class="detail-item">
                  <span>Member Since</span>
                  <strong>{{ memberSince }}</strong>
                </div>
              </div>
            </section>

            <section class="panel">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Security</p>
                  <h2>Password</h2>
                </div>
                <button
                  v-if="!isChangingPassword"
                  class="panel-link"
                  type="button"
                  @click="startChangingPassword"
                >
                  Change Password
                </button>
              </div>

              <p v-if="passwordMessage" class="form-message success">{{ passwordMessage }}</p>
              <p v-if="passwordError" class="form-message error">{{ passwordError }}</p>

              <form v-if="isChangingPassword" class="account-form" @submit.prevent="savePassword">
                <label class="wide">
                  Old Password
                  <input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    autocomplete="current-password"
                    required
                  />
                </label>

                <label>
                  New Password
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    autocomplete="new-password"
                    minlength="6"
                    required
                  />
                </label>

                <label>
                  Confirm New Password
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    autocomplete="new-password"
                    minlength="6"
                    required
                  />
                </label>

                <div class="form-actions">
                  <button class="cancel-btn" type="button" :disabled="isSavingPassword" @click="cancelChangingPassword">Cancel</button>
                  <button class="save-btn" type="submit" :disabled="isSavingPassword">
                    {{ isSavingPassword ? 'Saving...' : 'Save Password' }}
                  </button>
                </div>
              </form>

              <div v-else class="detail-item security-summary">
                <span>Password</span>
                <strong>Last changed securely through your account settings</strong>
              </div>
            </section>

            <section class="panel">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Orders</p>
                  <h2>Recent Activity</h2>
                </div>
              </div>

              <p v-if="orderMessage" class="form-message success">{{ orderMessage }}</p>
              <p v-if="orderError" class="form-message error">{{ orderError }}</p>

              <div class="order-list">
                <article v-for="order in formattedOrders" :key="order.id" class="order-item">
                  <div>
                    <strong>{{ order.displayId }}</strong>
                    <span>{{ order.displayDate }}</span>
                  </div>
                  <p>{{ order.itemSummary }}</p>
                  <div class="order-meta">
                    <span class="order-total">RM {{ Number(order.total).toFixed(2) }}</span>
                    <div class="order-action-row">
                      <button
                        v-if="order.canCancel"
                        class="cancel-order-btn"
                        type="button"
                        :disabled="cancellingOrderId === order.id"
                        @click="cancelOrder(order)"
                      >
                        {{ cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order' }}
                      </button>
                      <span class="order-status">{{ order.displayStatus }}</span>
                    </div>
                  </div>
                </article>

                <div v-if="!orders.length" class="no-orders">
                  <p>No orders yet. Your completed checkout orders will appear here.</p>
                  <router-link class="panel-link" to="/shop">Start Shopping</router-link>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div v-else class="empty-state">
          <h2>You are not logged in</h2>
          <p>Log in to view your profile, saved details, and order activity.</p>
          <router-link class="login-link" to="/login">Log In</router-link>
        </div>
      </section>
    </main>

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

.profile-page {
  flex: 1;
}

.profile-hero {
  background: linear-gradient(135deg, #fbeef3 0%, #f5dde8 50%, #ecdceb 100%);
  padding: 6rem 1.5rem 3.5rem;
  text-align: center;
}

.hero-eyebrow,
.panel-kicker {
  color: var(--pink-700);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.hero-title {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.25rem, 5vw, 3.8rem);
  font-weight: 600;
  line-height: 1.1;
  margin-bottom: 0.8rem;
}

.hero-subtitle {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 auto;
  max-width: 560px;
}

.profile-content {
  padding: 2rem 1.25rem 4rem;
}

.profile-layout {
  align-items: start;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 320px 1fr;
  margin: 0 auto;
  max-width: 1180px;
}

.profile-card,
.panel,
.empty-state,
.stat-card {
  background: white;
  border: 1px solid rgba(240, 200, 220, 0.45);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(200, 100, 140, 0.08);
}

.profile-card {
  padding: 2rem;
  position: sticky;
  text-align: center;
  top: 96px;
}

.avatar {
  align-items: center;
  background: linear-gradient(135deg, var(--pink-400), var(--pink-600));
  border-radius: 50%;
  box-shadow: var(--shadow-md);
  color: white;
  display: inline-flex;
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.1rem;
  font-weight: 700;
  height: 92px;
  justify-content: center;
  margin-bottom: 1rem;
  width: 92px;
}

.profile-card h2,
.panel h2,
.empty-state h2 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.6rem;
  font-weight: 700;
}

.profile-card p {
  color: var(--text-muted);
  font-size: 0.92rem;
  margin-top: 0.35rem;
  overflow-wrap: anywhere;
}

.member-badge {
  background: #fff0f6;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  color: var(--pink-700);
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 1.4rem 0;
  padding: 0.55rem 1rem;
  text-transform: uppercase;
}

.logout-btn,
.login-link,
.panel-link {
  align-items: center;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  font-size: 0.86rem;
  font-weight: 700;
  justify-content: center;
  text-decoration: none;
}

.logout-btn,
.login-link {
  background: var(--pink-500);
  color: white;
  padding: 0.85rem 1.4rem;
  width: 100%;
}

.logout-btn:hover,
.login-link:hover {
  background: var(--pink-600);
}

.profile-main {
  display: grid;
  gap: 1.25rem;
}

.stats-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, 1fr);
}

.stat-card {
  padding: 1.3rem;
}

.stat-card strong {
  color: var(--pink-800);
  display: block;
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  line-height: 1;
}

.stat-card span {
  color: var(--text-muted);
  display: block;
  font-size: 0.82rem;
  margin-top: 0.5rem;
}

.panel {
  padding: 1.5rem;
}

.panel-header {
  align-items: center;
  border-bottom: 1px solid rgba(240, 200, 220, 0.45);
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
}

.panel-kicker {
  margin-bottom: 0.25rem;
}

.panel-link {
  background: #fff0f6;
  color: var(--pink-700);
  padding: 0.65rem 1rem;
  white-space: nowrap;
}

button.panel-link {
  border: none;
}

.form-message {
  border-radius: 14px;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
}

.form-message.success {
  background: #ecfdf3;
  color: #166534;
}

.form-message.error {
  background: #fef2f2;
  color: #991b1b;
}

.account-form {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.account-form label {
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  font-size: 0.76rem;
  font-weight: 800;
  gap: 0.45rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.account-form label.wide {
  grid-column: 1 / -1;
}

.account-form input {
  background: #fff8fb;
  border: 1px solid rgba(232, 121, 154, 0.28);
  border-radius: 14px;
  color: var(--text-primary);
  font-size: 0.95rem;
  letter-spacing: 0;
  min-height: 46px;
  padding: 0.75rem 0.9rem;
  text-transform: none;
}

.account-form input:focus {
  background: white;
  border-color: var(--pink-500);
  outline: none;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  grid-column: 1 / -1;
  justify-content: flex-end;
}

.cancel-btn,
.save-btn {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 800;
  padding: 0.78rem 1.1rem;
}

.cancel-btn {
  background: #fff0f6;
  color: var(--pink-700);
}

.save-btn {
  background: var(--pink-500);
  color: white;
}

.cancel-btn:disabled,
.save-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.details-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, 1fr);
}

.detail-item {
  background: #fff8fb;
  border: 1px solid rgba(240, 200, 220, 0.4);
  border-radius: 16px;
  padding: 1rem;
}

.detail-item span {
  color: var(--text-muted);
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin-bottom: 0.45rem;
  text-transform: uppercase;
}

.detail-item strong {
  color: var(--pink-800);
  overflow-wrap: anywhere;
}

.order-list {
  display: grid;
  gap: 0.85rem;
}

.order-item {
  align-items: center;
  background: #fff8fb;
  border: 1px solid rgba(240, 200, 220, 0.4);
  border-radius: 16px;
  display: grid;
  gap: 1rem;
  grid-template-columns: 120px minmax(0, 1fr) max-content;
  padding: 1rem;
}

.order-item div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.order-item strong {
  color: var(--pink-800);
}

.order-item span,
.order-item p {
  color: var(--text-muted);
  font-size: 0.84rem;
}

.order-status {
  background: white;
  border: 1px solid var(--pink-200);
  border-radius: 999px;
  color: var(--pink-700) !important;
  font-weight: 700;
  padding: 0.5rem 0.8rem;
  white-space: nowrap;
}

.cancel-order-btn {
  background: #fff5f5;
  border: 1px solid #ffc9c9;
  border-radius: 999px;
  color: #b42318;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.55rem 0.85rem;
  white-space: nowrap;
}

.cancel-order-btn:disabled {
  cursor: wait;
  opacity: 0.65;
}

.order-meta {
  align-items: end;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.order-action-row {
  align-items: center;
  display: flex;
  flex-direction: row !important;
  flex-wrap: nowrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.order-total {
  color: var(--pink-800) !important;
  font-size: 0.95rem !important;
  font-weight: 800;
}

.no-orders {
  background: #fff8fb;
  border: 1px dashed rgba(232, 121, 154, 0.35);
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
}

.no-orders p {
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.empty-state {
  margin: 0 auto;
  max-width: 620px;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.empty-state p {
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0.6rem auto 1.5rem;
  max-width: 420px;
}

.login-link {
  width: auto;
}

@media (max-width: 980px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-card {
    position: static;
  }
}

@media (max-width: 720px) {
  .stats-grid,
  .details-grid,
  .account-form {
    grid-template-columns: 1fr;
  }

  .panel-header,
  .order-item {
    align-items: start;
    grid-template-columns: 1fr;
  }

  .order-meta {
    align-items: start;
  }

  .order-action-row {
    justify-content: flex-start;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
