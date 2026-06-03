import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap-grid.min.css'
import './assets/main.css'

// Import views (create stubs for non-home pages)
import HomePage from './views/HomePage.vue'

// Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    // Add more routes as you build them:
    { path: '/shop', component: () => import('./views/ShopPage.vue') },
    {
      path: '/new',
      component: () => import('./views/ProductCollectionPage.vue'),
      props: {
        collectionType: 'new',
        eyebrow: 'Fresh drops',
        title: 'New Arrivals',
        highlight: 'Arrivals',
        subtitle: 'Explore the latest Blush Berry products added to the shop.',
        emptyText: 'No new arrivals yet.'
      }
    },
    {
      path: '/sale',
      component: () => import('./views/ProductCollectionPage.vue'),
      props: {
        collectionType: 'sale',
        eyebrow: 'Limited offers',
        title: 'Sale Picks',
        highlight: 'Picks',
        subtitle: 'Discounted beauty picks from your current catalog.',
        emptyText: 'No sale products right now.'
      }
    },
    { path: '/quiz', component: () => import('./views/SkinQuizPage.vue') },
    {
      path: '/skincare',
      component: () => import('./views/ProductCollectionPage.vue'),
      props: {
        collectionType: 'category',
        category: 'Skincare',
        title: 'Skincare',
        subtitle: 'Cleansers, serums, moisturizers, and treatment essentials for a healthy glow.'
      }
    },
    {
      path: '/makeup',
      component: () => import('./views/ProductCollectionPage.vue'),
      props: {
        collectionType: 'category',
        category: 'Makeup',
        title: 'Makeup',
        subtitle: 'Lip tints, cushions, complexion, and color picks for soft everyday looks.'
      }
    },
    { path: '/product/:id', component: () => import('./views/ProductDetailPage.vue') },
    { path: '/cart', component: () => import('./views/CartPage.vue') },
    { path: '/orders', component: () => import('./views/MyOrdersPage.vue') },
    { path: '/track', redirect: '/orders' },
    { path: '/login', component: () => import('./views/LoginPage.vue') },
    { path: '/register', component: () => import('./views/RegisterPage.vue') },
    { path: '/profile', component: () => import('./views/ProfilePage.vue') },
    { path: '/admin/analytics', component: () => import('./views/AdminAnalyticsPage.vue') },
    { path: '/admin/products', component: () => import('./views/AdminProductsPage.vue') },
    { path: '/admin/orders', component: () => import('./views/AdminOrdersPage.vue') },
    { path: '/account', redirect: '/profile' },
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

createApp(App)
  .use(router)
  .mount('#app')
