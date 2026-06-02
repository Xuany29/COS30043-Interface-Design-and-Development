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
      cartItems: [],
      isLoading: true,
      loadError: '',
      showCheckout: false,
      isPaying: false,
      checkoutError: '',
      orderSuccess: '',
      checkoutForm: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postcode: '',
        state: '',
        paymentMethod: 'card',
        cardLast4: ''
      }
    }
  },

  computed: {
    totalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.qty, 0)
    },

    subtotal() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    },

    shipping() {
      return this.subtotal >= 120 || this.subtotal === 0 ? 0 : 12
    },

    total() {
      return this.subtotal + this.shipping
    }
  },

  mounted() {
    this.loadCart()
  },

  methods: {
    authHeaders() {
      const token = localStorage.getItem('authToken')
      return token ? { Authorization: `Bearer ${token}` } : {}
    },

    async loadCart() {
      const token = localStorage.getItem('authToken')

      if (!token) {
        this.loadError = 'Please log in to view your cart.'
        this.isLoading = false
        return
      }

      try {
        const data = await apiRequest('/cart', {
          headers: this.authHeaders()
        })

        this.cartItems = data.items
      } catch (error) {
        this.loadError = error.message
      } finally {
        this.isLoading = false
      }
    },

    async updateQty(item, qty) {
      if (qty > Number(item.stock || 0)) {
        this.checkoutError = Number(item.stock || 0) > 0 ? `Only ${item.stock} available for ${item.variant}.` : `${item.variant} is out of stock.`
        return
      }

      const data = await apiRequest(`/cart/${item.cartItemId}`, {
        method: 'PATCH',
        headers: this.authHeaders(),
        body: JSON.stringify({ qty })
      })

      const index = this.cartItems.findIndex(cartItem => cartItem.cartItemId === item.cartItemId)

      if (index !== -1) {
        this.cartItems[index] = data.item
      }

      window.dispatchEvent(new Event('cart-updated'))
    },

    increaseQty(item) {
      this.updateQty(item, item.qty + 1)
    },

    decreaseQty(item) {
      if (item.qty > 1) {
        this.updateQty(item, item.qty - 1)
      }
    },

    async removeItem(item) {
      await apiRequest(`/cart/${item.cartItemId}`, {
        method: 'DELETE',
        headers: this.authHeaders()
      })

      this.cartItems = this.cartItems.filter(cartItem => cartItem.cartItemId !== item.cartItemId)
      window.dispatchEvent(new Event('cart-updated'))
    },

    async clearCart() {
      await apiRequest('/cart', {
        method: 'DELETE',
        headers: this.authHeaders()
      })

      this.cartItems = []
      window.dispatchEvent(new Event('cart-updated'))
    },

    openCheckout() {
      const savedUser = JSON.parse(localStorage.getItem('authUser') || '{}')

      this.checkoutForm.name = this.checkoutForm.name || `${savedUser.firstName || ''} ${savedUser.lastName || ''}`.trim()
      this.checkoutForm.email = this.checkoutForm.email || savedUser.email || ''
      this.checkoutError = ''
      this.orderSuccess = ''
      this.showCheckout = true
    },

    closeCheckout() {
      if (!this.isPaying) {
        this.showCheckout = false
      }
    },

    async placeOrder() {
      this.checkoutError = ''
      this.orderSuccess = ''
      this.isPaying = true

      try {
        const data = await apiRequest('/orders', {
          method: 'POST',
          headers: this.authHeaders(),
          body: JSON.stringify({
            customer: {
              name: this.checkoutForm.name,
              email: this.checkoutForm.email,
              phone: this.checkoutForm.phone
            },
            shippingAddress: {
              address: this.checkoutForm.address,
              city: this.checkoutForm.city,
              postcode: this.checkoutForm.postcode,
              state: this.checkoutForm.state
            },
            payment: {
              method: this.checkoutForm.paymentMethod,
              cardLast4: this.checkoutForm.cardLast4
            }
          })
        })

        this.orderSuccess = `${data.message} Transaction ID: ${data.order.transactionId}`
        this.cartItems = []
        this.showCheckout = false
        window.dispatchEvent(new Event('cart-updated'))
      } catch (error) {
        this.checkoutError = error.message
      } finally {
        this.isPaying = false
      }
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="cart-page">
      <section class="cart-hero">
        <p class="hero-eyebrow">Checkout</p>
        <h1 class="hero-title">Your Shopping Cart</h1>
        <p class="hero-subtitle">
          {{ totalItems }} item{{ totalItems !== 1 ? 's' : '' }} waiting to become your next glow ritual.
        </p>
      </section>

      <section class="cart-content">
        <div v-if="isLoading" class="empty-state">
          <h2>Loading your cart</h2>
          <p>Getting your saved cart items from MongoDB.</p>
        </div>

        <div v-else-if="loadError" class="empty-state">
          <h2>Cart unavailable</h2>
          <p>{{ loadError }}</p>
          <router-link to="/login" class="shop-btn">Log In</router-link>
        </div>

        <div v-else-if="cartItems.length" class="cart-layout">
          <div class="cart-items-panel">
            <div class="panel-header">
              <h2>Items</h2>
              <button class="clear-btn" type="button" @click="clearCart">Clear Cart</button>
            </div>

            <article v-for="item in cartItems" :key="item.cartItemId" class="cart-item">
              <img class="item-image" :src="item.image" :alt="item.name" />

              <div class="item-body">
                <div class="item-main">
                  <p class="item-brand">{{ item.brand }}</p>
                  <h3 class="item-name">{{ item.name }}</h3>
                  <p class="item-variant">{{ item.variant }}</p>
                </div>

                <div class="item-actions">
                  <div class="quantity" aria-label="Quantity control">
                    <button class="qty-btn" type="button" @click="decreaseQty(item)" :disabled="item.qty <= 1">-</button>
                    <span class="qty-value">{{ item.qty }}</span>
                    <button class="qty-btn" type="button" @click="increaseQty(item)" :disabled="item.qty >= Number(item.stock || 0)">+</button>
                  </div>

                  <button class="remove-btn" type="button" @click="removeItem(item)">Remove</button>
                </div>
              </div>

              <div class="item-price-cal">
                <span class="item-price">RM {{ Number(item.price).toFixed(2) }}</span>
                <span class="item-subtotal">RM {{ (item.price * item.qty).toFixed(2) }}</span>
              </div>
            </article>
          </div>

          <aside class="summary-panel">
            <h2>Order Summary</h2>

            <div class="summary-line">
              <span>Subtotal</span>
              <span>RM {{ subtotal.toFixed(2) }}</span>
            </div>

            <div class="summary-line">
              <span>Shipping</span>
              <span>{{ shipping === 0 ? 'Free' : `RM ${shipping.toFixed(2)}` }}</span>
            </div>

            <p class="shipping-note">
              {{ shipping === 0 ? 'Free shipping applied.' : `Add RM ${(120 - subtotal).toFixed(2)} more for free shipping.` }}
            </p>

            <div class="summary-line total">
              <span>Total</span>
              <span>RM {{ total.toFixed(2) }}</span>
            </div>

            <button class="checkout-btn" type="button" @click="openCheckout">Proceed to Checkout</button>
            <router-link to="/shop" class="continue-link">Continue Shopping</router-link>
          </aside>
        </div>

        <div v-else-if="orderSuccess" class="empty-state success-state">
          <h2>Order placed</h2>
          <p>{{ orderSuccess }}</p>
          <router-link to="/shop" class="shop-btn">Continue Shopping</router-link>
        </div>

        <div v-else class="empty-state">
          <h2>Your cart is empty</h2>
          <p>Time to pick your next K-beauty favorites!</p>
          <router-link to="/shop" class="shop-btn">Explore Products</router-link>
        </div>
      </section>
    </main>

    <div v-if="showCheckout" class="checkout-overlay" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <form class="payment-gateway" @submit.prevent="placeOrder">
        <div class="gateway-header">
          <div>
            <p class="gateway-eyebrow">BlushPay Demo Gateway</p>
            <h2 id="checkout-title">Secure Checkout</h2>
          </div>
          <button class="close-btn" type="button" aria-label="Close checkout" @click="closeCheckout">x</button>
        </div>

        <p v-if="checkoutError" class="gateway-message error">{{ checkoutError }}</p>

        <div class="gateway-grid">
          <label>
            Full name
            <input v-model="checkoutForm.name" type="text" autocomplete="name" required />
          </label>

          <label>
            Email
            <input v-model="checkoutForm.email" type="email" autocomplete="email" required />
          </label>

          <label>
            Phone
            <input v-model="checkoutForm.phone" type="tel" autocomplete="tel" required />
          </label>

          <label>
            Payment method
            <select v-model="checkoutForm.paymentMethod" required>
              <option value="card">Credit / Debit Card</option>
              <option value="online-banking">Online Banking</option>
              <option value="ewallet">E-Wallet</option>
            </select>
          </label>

          <label class="wide">
            Delivery address
            <input v-model="checkoutForm.address" type="text" autocomplete="street-address" required />
          </label>

          <label>
            City
            <input v-model="checkoutForm.city" type="text" autocomplete="address-level2" required />
          </label>

          <label>
            Postcode
            <input v-model="checkoutForm.postcode" type="text" autocomplete="postal-code" required />
          </label>

          <label>
            State
            <input v-model="checkoutForm.state" type="text" autocomplete="address-level1" required />
          </label>

          <label v-if="checkoutForm.paymentMethod === 'card'">
            Card last 4 digits
            <input
              v-model="checkoutForm.cardLast4"
              inputmode="numeric"
              maxlength="4"
              minlength="4"
              pattern="[0-9]{4}"
              placeholder="1234"
              required
            />
          </label>
        </div>

        <div class="gateway-total">
          <span>Total to pay</span>
          <strong>RM {{ total.toFixed(2) }}</strong>
        </div>

        <button class="pay-btn" type="submit" :disabled="isPaying">
          {{ isPaying ? 'Processing Payment...' : `Pay RM ${total.toFixed(2)}` }}
        </button>
      </form>
    </div>

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

.cart-page {
  flex: 1;
}

.cart-hero {
  background: linear-gradient(135deg, #fbeef3 0%, #f5dde8 50%, #ecdceb 100%);
  padding: 5rem 1.5rem 3.5rem;
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

.hero-subtitle {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 auto;
  max-width: 520px;
}

.cart-content {
  padding: 2rem 1.25rem 4rem;
}

.cart-layout {
  align-items: start;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1.65fr 1fr;
  margin: 0 auto;
  max-width: 1200px;
}

.cart-items-panel,
.summary-panel,
.empty-state {
  background: white;
  border: 1px solid rgba(240, 200, 220, 0.4);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(200, 100, 140, 0.08);
}

.cart-items-panel {
  padding: 1.5rem;
}

.panel-header {
  align-items: center;
  border-bottom: 1px solid rgba(240, 200, 220, 0.4);
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

.panel-header h2,
.summary-panel h2,
.empty-state h2 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
}

.cart-item {
  align-items: center;
  border-bottom: 1px solid rgba(240, 200, 220, 0.4);
  display: grid;
  gap: 0.9rem;
  grid-template-columns: 90px 1fr auto;
  padding: 0.95rem 0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  background: #fff5f8;
  border-radius: 15px;
  height: 90px;
  object-fit: cover;
  width: 90px;
}

.item-brand {
  color: var(--pink-500);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  margin-bottom: 0.15rem;
  text-transform: uppercase;
}

.item-name {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  line-height: 1.25;
}

.item-variant {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.item-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 0.7rem;
}

.quantity {
  align-items: center;
  border: 1px solid rgba(232, 121, 154, 0.35);
  border-radius: 999px;
  display: inline-flex;
  overflow: hidden;
}

.qty-btn {
  background: #ffe6f073;
  border: none;
  color: var(--pink-700);
  cursor: pointer;
  font-weight: 700;
  height: 30px;
  width: 30px;
}

.qty-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.qty-value {
  color: var(--pink-800);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  width: 30px;
}

.item-price-cal {
  text-align: right;
}

.item-price {
  color: var(--text-muted);
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}

.item-subtotal {
  color: var(--pink-800);
  display: block;
  font-size: 1rem;
  font-weight: 800;
}

.summary-panel {
  padding: 1.2rem;
  position: sticky;
  top: 85px;
}

.summary-line {
  align-items: center;
  color: var(--text-secondary);
  display: flex;
  font-size: 0.95rem;
  justify-content: space-between;
  margin-top: 0.7rem;
}

.summary-line.total {
  color: var(--pink-800);
  font-size: 1.05rem;
  font-weight: 800;
}

.shipping-note {
  background: #fff0f6;
  border: 1px solid rgba(232, 121, 154, 0.22);
  border-radius: 14px;
  color: var(--pink-700);
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.45;
  margin-top: 0.9rem;
  padding: 0.8rem;
}

.checkout-btn,
.shop-btn {
  align-items: center;
  background: var(--pink-300);
  border: none;
  border-radius: 999px;
  color: white;
  cursor: pointer;
  display: inline-flex;
  font-size: 0.9rem;
  font-weight: 700;
  justify-content: center;
  margin-top: 1.2rem;
  padding: 0.8rem 1.2rem;
  text-decoration: none;
  width: 100%;
}

.continue-link {
  color: var(--pink-700);
  display: block;
  font-size: 0.8rem;
  margin-top: 1rem;
  text-align: center;
  text-decoration: none;
}

.clear-btn,
.remove-btn {
  background: transparent;
  border: none;
  color: var(--pink-600);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}

.empty-state {
  margin: 0 auto;
  max-width: 750px;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.empty-state p {
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0.6rem auto 0;
  max-width: 450px;
}

.success-state {
  border-color: rgba(22, 101, 52, 0.18);
}

.checkout-overlay {
  align-items: center;
  background: rgba(58, 21, 40, 0.5);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 1.25rem;
  position: fixed;
  z-index: 1000;
}

.payment-gateway {
  background: white;
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(58, 21, 40, 0.28);
  max-height: 92vh;
  max-width: 760px;
  overflow-y: auto;
  padding: 1.5rem;
  width: 100%;
}

.gateway-header {
  align-items: start;
  border-bottom: 1px solid rgba(240, 200, 220, 0.5);
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

.gateway-eyebrow {
  color: var(--pink-600);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.gateway-header h2 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
}

.close-btn {
  align-items: center;
  background: #fff0f6;
  border: 1px solid rgba(232, 121, 154, 0.25);
  border-radius: 999px;
  color: var(--pink-800);
  cursor: pointer;
  display: inline-flex;
  font-size: 1rem;
  font-weight: 800;
  height: 36px;
  justify-content: center;
  width: 36px;
}

.gateway-message {
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  padding: 0.8rem 1rem;
}

.gateway-message.error {
  background: #fef2f2;
  color: #991b1b;
}

.gateway-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gateway-grid label {
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  font-size: 0.78rem;
  font-weight: 800;
  gap: 0.45rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gateway-grid label.wide {
  grid-column: 1 / -1;
}

.gateway-grid input,
.gateway-grid select {
  background: #fff8fb;
  border: 1px solid rgba(232, 121, 154, 0.28);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  letter-spacing: 0;
  min-height: 44px;
  padding: 0.75rem 0.9rem;
  text-transform: none;
}

.gateway-grid input:focus,
.gateway-grid select:focus {
  background: white;
  border-color: var(--pink-500);
  outline: none;
}

.gateway-total {
  align-items: center;
  background: #fff8fb;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 16px;
  color: var(--text-secondary);
  display: flex;
  justify-content: space-between;
  margin-top: 1.25rem;
  padding: 1rem;
}

.gateway-total strong {
  color: var(--pink-800);
  font-size: 1.25rem;
}

.pay-btn {
  background: linear-gradient(135deg, var(--pink-500), var(--pink-700));
  border: none;
  border-radius: 999px;
  color: white;
  cursor: pointer;
  font-weight: 800;
  margin-top: 1rem;
  padding: 0.9rem 1.2rem;
  width: 100%;
}

.pay-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 980px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .summary-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .cart-item {
    grid-template-columns: 84px 1fr;
  }

  .item-price-cal {
    grid-column: 1 / -1;
    text-align: left;
  }

  .gateway-grid {
    grid-template-columns: 1fr;
  }
}
</style>
