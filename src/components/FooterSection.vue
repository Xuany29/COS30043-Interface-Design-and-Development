<script>
export default {
  name: 'FooterSection',
  data() {
    return {
      linkCols: [
        {
          title: 'Shop',
          links: [
            { label: 'All Products', to: '/shop' },
            { label: 'Skincare', to: '/skincare' },
            { label: 'Makeup', to: '/makeup' },
            { label: 'New Arrivals', to: '/new' },
            { label: 'Sale', to: '/sale' },
          ]
        },
        {
          title: 'Help',
          links: [
            { label: 'Track Order', to: '/orders' },
            { label: 'Log In', to: '/login' },
          ]
        }
      ]
    }
  }
}
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <span>Blush<span class="accent">Berry</span></span>
        </div>
        <p class="footer-tagline">
          Your Korean beauty destination. Pure formulas, radiant skin, and a little sprinkle of Seoul magic.
        </p>
      </div>

      <div class="footer-links" v-for="col in linkCols" :key="col.title">
        <h4>{{ col.title }}</h4>
        <ul>
          <li v-for="link in col.links" :key="link.label">
            <router-link :to="link.to">{{ link.label }}</router-link>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 Blush Berry</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #3a1528;
  padding: 5rem 2rem 0;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  padding-bottom: 4rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #f9d0e0;
  margin-bottom: 1rem;
}

.footer-logo span:first-child { font-size: 1.3rem; }

.accent { color: #e8799a; }

.footer-tagline {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
  line-height: 1.7;
  margin-bottom: 1.5rem;
  max-width: 300px;
}

.footer-links h4 {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: 1.2rem;
}

.footer-links ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links a {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #e8799a;
}

.footer-bottom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
}

@media (max-width: 900px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 480px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
