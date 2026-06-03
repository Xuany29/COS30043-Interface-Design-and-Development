<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="nav-inner">
      <!-- Logo -->
      <router-link :to="isAdmin ? '/admin/products' : '/'" class="logo">
        <img :src="logoImage" alt="BlushBerry Logo" class="logo-icon" />
      </router-link>

      <!-- Desktop Nav Links -->
      <ul class="nav-links" :class="{ open: menuOpen }">
        <template v-if="isAdmin">
          <li><router-link to="/admin/analytics" @click="menuOpen = false">Analytics</router-link></li>
          <li><router-link to="/admin/products" @click="menuOpen = false">Products</router-link></li>
          <li><router-link to="/admin/orders" @click="menuOpen = false">Orders</router-link></li>
        </template>
        <template v-else>
          <li><router-link to="/" @click="menuOpen = false">Home</router-link></li>
          <li><router-link to="/shop" @click="menuOpen = false">Shop</router-link></li>
          <li><router-link to="/quiz" @click="menuOpen = false">Quiz</router-link></li>
          <li><router-link to="/skincare" @click="menuOpen = false">Skincare</router-link></li>
          <li><router-link to="/makeup" @click="menuOpen = false">Makeup</router-link></li>
        </template>
      </ul>

      <!-- Nav Actions -->
      <div class="nav-actions">
        <template v-if="isAdmin">
          <button class="icon-btn" type="button" aria-label="Log out" @click="logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </template>
        <template v-else>
        <form class="search-form" :class="{ open: searchOpen }" @submit.prevent="submitSearch">
          <input
            ref="searchInput"
            v-model="searchTerm"
            class="search-input"
            type="search"
            placeholder="Search products"
            aria-label="Search products"
          />
          <button class="icon-btn" type="submit" aria-label="Search products" @click="handleSearchClick">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button v-if="searchTerm" class="search-clear" type="button" aria-label="Clear search" @click="clearSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </form>
        <router-link to="/profile" class="icon-btn" aria-label="Profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </router-link>
        <router-link to="/cart" class="icon-btn cart-btn" aria-label="Cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </router-link>
        </template>
        <!-- Hamburger -->
        <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Menu">
          <span :class="{ open: menuOpen }"></span>
          <span :class="{ open: menuOpen }"></span>
          <span :class="{ open: menuOpen }"></span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { nextTick, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest } from '@/services/api'
import logoImage from '../assets/Logo.png'

const route = useRoute()
const router = useRouter()
const isScrolled = ref(false)
const isAdmin = ref(false)
const menuOpen = ref(false)
const cartCount = ref(0)
const searchOpen = ref(false)
const searchTerm = ref('')
const searchInput = ref(null)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40
}

const loadCurrentUser = () => {
  const savedUser = JSON.parse(localStorage.getItem('authUser') || '{}')
  isAdmin.value = savedUser.role === 'admin'
}

const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUser')
  isAdmin.value = false
  menuOpen.value = false
  router.push('/login')
}

const loadCartCount = async () => {
  const token = localStorage.getItem('authToken')

  if (!token || isAdmin.value) {
    cartCount.value = 0
    return
  }

  try {
    const data = await apiRequest('/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    cartCount.value = data.items.reduce((sum, item) => sum + item.qty, 0)
  } catch {
    cartCount.value = 0
  }
}

const openSearch = async () => {
  searchOpen.value = true
  await nextTick()
  searchInput.value?.focus()
}

const handleSearchClick = () => {
  if (!searchOpen.value) {
    openSearch()
  }
}

const submitSearch = () => {
  const query = searchTerm.value.trim()

  if (!query) {
    openSearch()
    return
  }

  menuOpen.value = false
  searchOpen.value = true
  router.push({
    path: '/shop',
    query: {
      ...route.query,
      search: query,
    },
  })
}

const clearSearch = () => {
  searchTerm.value = ''

  if (route.path === '/shop' && route.query.search) {
    const query = { ...route.query }
    delete query.search
    router.push({ path: '/shop', query })
  }

  openSearch()
}

watch(
  () => route.query.search,
  search => {
    searchTerm.value = typeof search === 'string' ? search : ''
    searchOpen.value = Boolean(searchTerm.value)
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    loadCurrentUser()
  },
)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('cart-updated', loadCartCount)
  loadCurrentUser()
  loadCartCount()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('cart-updated', loadCartCount)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0 2rem;
  height: 80px;
  transition: background 0.4s ease, box-shadow 0.4s ease;
  background: transparent;
}

.navbar.scrolled {
  background: rgba(255, 240, 245, 0.92);
  backdrop-filter: blur(16px);
  box-shadow: 0 2px 24px rgba(220, 130, 160, 0.12);
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-icon {
  width: 110px;
  height: 110px;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a3d55;
  text-decoration: none;
  position: relative;
  padding-bottom: 3px;
  transition: color 0.2s;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1.5px;
  background: #e8799a;
  transition: width 0.3s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #e8799a;
}

.nav-links a:hover::after,
.nav-links a.router-link-active::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.search-form {
  align-items: center;
  display: flex;
  position: relative;
}

.search-input {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(232, 121, 154, 0.28);
  border-radius: 999px;
  color: #5a2540;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.84rem;
  height: 38px;
  opacity: 0;
  outline: none;
  padding: 0 0;
  pointer-events: none;
  transition: width 0.25s ease, opacity 0.2s ease, padding 0.25s ease, border-color 0.2s;
  width: 0;
}

.search-form.open .search-input,
.search-input:focus {
  opacity: 1;
  padding: 0 2.25rem 0 0.9rem;
  pointer-events: auto;
  width: 230px;
}

.search-input:focus {
  border-color: #e8799a;
  box-shadow: 0 0 0 3px rgba(232, 121, 154, 0.14);
}

.search-clear {
  align-items: center;
  background: none;
  border: none;
  border-radius: 50%;
  color: #b05070;
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  position: absolute;
  right: 38px;
  width: 28px;
}

.search-clear:hover {
  background: rgba(232, 121, 154, 0.12);
  color: #e8799a;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #7a3d55;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
  position: relative;
}

.icon-btn:hover {
  background: rgba(232, 121, 154, 0.12);
  color: #e8799a;
}

.cart-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #e8799a;
  color: white;
  font-size: 0.6rem;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #7a3d55;
  border-radius: 2px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .navbar {
    height: 72px;
    padding: 0 1rem;
  }

  .logo-icon {
    height: 88px;
    width: 88px;
  }

  .nav-actions {
    gap: 0.25rem;
  }

  .search-form.open {
    background: rgba(255, 240, 245, 0.97);
    backdrop-filter: blur(16px);
    border-top: 1px solid rgba(232, 121, 154, 0.16);
    gap: 0.4rem;
    left: 0;
    padding: 0.75rem 1rem;
    position: fixed;
    right: 0;
    top: 72px;
  }

  .search-form.open .search-input,
  .search-input:focus {
    flex: 1;
    width: auto;
  }

  .search-form.open .search-clear {
    right: 58px;
  }

  .nav-links {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    background: rgba(255, 240, 245, 0.97);
    backdrop-filter: blur(16px);
    flex-direction: column;
    align-items: center;
    padding: 2rem 0;
    gap: 1.5rem;
    transform: translateY(-110%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.4s ease, opacity 0.3s ease;
  }

  .nav-links.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
}
</style>
