<script>
import NavBar from '@/components/NavBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import FeaturedProducts from '@/components/FeaturedProducts.vue'
import FooterSection from '@/components/FooterSection.vue'

export default {
  components: {
    NavBar,
    HeroSection,
    FeaturedProducts,
    FooterSection
  },

  data() {
    return {
      perks: [
        { icon: '🌸', label: 'Clean Ingredients', desc: 'No parabens, sulfates or harmful chemicals' },
        { icon: '🪽', label: 'Cruelty-Free', desc: 'Never tested on animals, always ethical' },
        { icon: '🚚', label: 'Free Delivery', desc: 'Free shipping on orders above RM 120' }
      ],

      email: '',
      submitted: false
    }
  },

  methods: {
    subscribe() {
      if (this.email) {
        this.submitted = true
        this.email = ''
      }
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />
    <main>
      <HeroSection />
      <FeaturedProducts />
      <section class="banner">
        <div class="row g-0">
          <div class="col-12">
            <div class="banner-inner">
              <div class="banner-text">
                <div class="row g-0">
                  <div class="col-12">
                    <span class="banner-tag">Our Philosophy</span>
                    <h2 class="banner-title">K-Beauty Secrets,<br />Delivered to You</h2>
                    <p class="banner-body">
                      At Blush Berry, we believe skincare is self-love. We source only the most
                      beloved Korean formulas 鈥?gentle, effective, and crafted with centuries of beauty wisdom.
                    </p>
                  </div>
                </div>
                <div class="row g-0">
                  <div class="col-12">
                    <div class="banner-perks">
                      <div class="perk" v-for="p in perks" :key="p.label">
                        <span class="perk-icon">{{ p.icon }}</span>
                        <div class="perk-text">
                          <strong>{{ p.label }}</strong>
                          <span>{{ p.desc }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row g-0">
                  <div class="col-12">
                    <router-link to="/about" class="btn-outline">Our Story</router-link>
                  </div>
                </div>
              </div>

              <div class="banner-visual">
                <div class="visual-frame">
                  <img
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"
                    alt="K-Beauty skincare routine"
                  />
                  <div class="visual-pill pill-1">
                    <span>🌸</span>
                    <div>
                      <strong>Glass Skin</strong>
                      <span>Routine Kit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="trust-section">
        <div class="row g-0">
          <div class="col-12">
            <div class="section-inner">

              <div class="row g-0">
                <div class="col-12">
                  <div class="trust-row">
                    <div class="trust-item" v-for="t in trustItems" :key="t.label">
                      <span class="trust-icon">{{ t.icon }}</span>
                      <div>
                        <strong>{{ t.value }}</strong>
                        <span>{{ t.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="newsletter">
        <div class="row g-0 justify-content-center">
          <div class="col-12">
            <div class="nl-inner">
              <div class="nl-deco nl-deco-1">❤️</div>
              <div class="nl-deco nl-deco-2"></div>
              <div class="nl-deco nl-deco-3">🌸</div>

              <div class="row g-0">
                <div class="col-12">
                  <span class="nl-tag">Stay in the Loop</span>
                  <h2 class="nl-title">Get Your K-Beauty Fix</h2>
                  <p class="nl-sub">
                    Subscribe for exclusive deals, new launch alerts, and skincare tips from Seoul 鈥?                    straight to your inbox. Plus, get <strong>10% OFF</strong> your first order!
                  </p>
                </div>
              </div>

              <div class="row g-0 justify-content-center">
                <div class="col-12">
                  <form class="nl-form" @submit.prevent="subscribe">
                    <input
                      v-model="email"
                      type="email"
                      placeholder="your@email.com"
                      class="nl-input"
                      required
                    />
                    <button type="submit" class="nl-btn" :disabled="submitted">
                      <span v-if="!submitted">Subscribe 🌸</span>
                      <span v-else>Thank you! 🌸</span>
                    </button>
                  </form>
                </div>
              </div>

              <div class="row g-0">
                <div class="col-12">
                  <p class="nl-note">No spam. Unsubscribe anytime. We respect your privacy.</p>
                </div>
              </div>
            </div>
          </div>
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
}

main {
  flex: 1;
}

.banner {
  background: linear-gradient(135deg, #fde8f0 0%, #ffe4ef 50%, #fdf0f5 100%);
  padding: 6rem 2rem;
  position: relative;
  overflow: hidden;
}

.banner::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(249, 168, 201, 0.3), transparent 70%);
  border-radius: 50%;
}

.banner-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.banner-tag {
  display: inline-block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #e8799a;
  margin-bottom: 1rem;
}

.banner-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 700;
  color: #6b2d47;
  margin: 0 0 1.2rem;
  line-height: 1.2;
}

.banner-body {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  color: #8a5068;
  line-height: 1.8;
  max-width: 460px;
  margin-bottom: 2rem;
}

.banner-perks {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  margin-bottom: 2.5rem;
}

.perk {
  display: flex;
  align-items: center;
  gap: 14px;
}

.perk-icon {
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(200, 100, 140, 0.12);
}

.perk-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.perk-text strong {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #5a2540;
}

.perk-text span {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: #a07080;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 13px 30px;
  background: transparent;
  color: #d4547a;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  border: 2px solid #d4547a;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #d4547a;
  color: white;
}

.visual-frame {
  position: relative;
  border-radius: 28px;
  overflow: visible;
}

.visual-frame img {
  width: 100%;
  height: 480px;
  object-fit: cover;
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(180, 80, 120, 0.22);
}

.visual-pill {
  position: absolute;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 200, 220, 0.5);
  border-radius: 50px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 28px rgba(200, 100, 140, 0.14);
}

.visual-pill span:first-child {
  font-size: 1.4rem;
}

.visual-pill div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.visual-pill strong {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.88rem;
  color: #5a2540;
}

.visual-pill div span {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.68rem;
  color: #a07080;
}

.pill-1 {
  bottom: -18px;
  left: -20px;
}

.pill-2 {
  top: -18px;
  right: -20px;
}

.trust-section {
  background: #fff0f6;
  padding: 6rem 2rem;
}

.section-inner {
  max-width: 1280px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-tag {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #e8799a;
  margin-bottom: 0.6rem;
}

.section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 700;
  color: #6b2d47;
  margin: 0;
}

.trust-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  background: white;
  border-radius: 24px;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(240, 200, 220, 0.4);
  box-shadow: 0 4px 24px rgba(200, 100, 140, 0.08);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: center;
}

.trust-icon {
  font-size: 1.8rem;
}

.trust-item div {
  display: flex;
  flex-direction: column;
}

.trust-item strong {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.24rem;
  font-weight: 700;
  color: #5a2540;
}

.trust-item span {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  color: #b07a90;
}

.newsletter {
  background: linear-gradient(135deg, #d4547a 0%, #e8799a 50%, #f49db5 100%);
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.newsletter::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
}

.nl-inner {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.nl-deco {
  position: absolute;
  font-size: 2.5rem;
  opacity: 0.25;
  pointer-events: none;
  animation: decoFloat 5s ease-in-out infinite alternate;
}

.nl-deco-1 {
  top: -1rem;
  left: -4rem;
  font-size: 3rem;
}

.nl-deco-2 {
  bottom: 0;
  right: -3rem;
  font-size: 2rem;
  animation-delay: 1s;
}

.nl-deco-3 {
  top: 50%;
  left: -5rem;
  animation-delay: 2s;
}

@keyframes decoFloat {
  from {
    transform: translateY(0) rotate(0);
  }

  to {
    transform: translateY(-12px) rotate(12deg);
  }
}

.nl-tag {
  display: inline-block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 5px 16px;
  border-radius: 50px;
  margin-bottom: 1.4rem;
}

.nl-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: white;
  margin: 0 0 1rem;
}

.nl-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.nl-sub strong {
  color: white;
  font-weight: 800;
}

.nl-form {
  display: flex;
  gap: 0;
  max-width: 460px;
  margin: 0 auto 1rem;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.nl-input {
  flex: 1;
  padding: 15px 24px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: #5a2540;
  outline: none;
  min-width: 0;
}

.nl-input::placeholder {
  color: #c0a0b0;
}

.nl-btn {
  padding: 15px 28px;
  background: #6b2d47;
  color: white;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.nl-btn:hover:not(:disabled) {
  background: #5a2540;
}

.nl-btn:disabled {
  background: #8a4060;
  cursor: default;
}

.nl-note {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.04em;
}

@media (max-width: 900px) {
  .banner-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .trust-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .trust-row {
    grid-template-columns: 1fr 1fr;
    padding: 1.5rem;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .nl-form {
    flex-direction: column;
    border-radius: 16px;
    overflow: visible;
    box-shadow: none;
    gap: 0.8rem;
  }

  .nl-input {
    border-radius: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .nl-btn {
    border-radius: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
}
</style>
