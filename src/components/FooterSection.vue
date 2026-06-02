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
            { label: 'FAQ', to: '/faq' },
            { label: 'Shipping Info', to: '/shipping' },
            { label: 'Returns', to: '/returns' },
            { label: 'Track Order', to: '/track' },
            { label: 'Contact Us', to: '/contact' },
            { label: 'Log In', to: '/login' },
          ]
        },
        {
          title: 'About',
          links: [
            { label: 'Our Story', to: '/about' },
            { label: 'Blog', to: '/blog' },
            { label: 'Press', to: '/press' },
            { label: 'Careers', to: '/careers' },
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
        <div class="socials">
          <a href="#" aria-label="Instagram" class="social-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="#" aria-label="TikTok" class="social-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
            </svg>
          </a>
          <a href="#" aria-label="YouTube" class="social-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
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
      <span>© 2025 Blush Berry. Made with 💗 for K-beauty lovers.</span>
      <div class="footer-legal">
        <router-link to="/privacy">Privacy Policy</router-link>
        <router-link to="/terms">Terms of Service</router-link>
      </div>
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
  grid-template-columns: 2fr 1fr 1fr 1fr;
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

.socials {
  display: flex;
  gap: 10px;
}

.social-icon {
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.06);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s;
}

.social-icon:hover {
  background: rgba(232, 121, 154, 0.25);
  color: #e8799a;
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

.footer-legal {
  display: flex;
  gap: 1.5rem;
}

.footer-legal a {
  color: rgba(255,255,255,0.4);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-legal a:hover { color: #e8799a; }

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
