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
      ]
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
      <section class="collection-links" aria-label="Shop collections">
        <div class="collection-link-inner">
          <router-link class="collection-tile new-tile" to="/new">
            <span>Fresh Drops</span>
            <strong>New Arrivals</strong>
            <small>Explore the latest products added to Blush Berry.</small>
          </router-link>
          <router-link class="collection-tile sale-tile" to="/sale">
            <span>Limited Offers</span>
            <strong>Sale Picks</strong>
            <small>Shop discounted beauty essentials before they are gone.</small>
          </router-link>
        </div>
      </section>
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
                      beloved Korean formulas gentle, effective, and crafted with centuries of beauty wisdom.
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
                    <router-link to="/shop" class="btn-outline">Shop Skincare Products</router-link>
                  </div>
                </div>
              </div>

              <div class="banner-visual">
                <div class="visual-frame">
                  <img
                    src="https://i.pinimg.com/originals/23/78/9b/23789be4b3104b043da8337680a60b44.jpg"
                    alt="Glass Skin"
                  />
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

.collection-links {
  background: #fff8fb;
  padding: 2rem 5rem;
}

.collection-link-inner {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0 auto;
  max-width: 1280px;
}

.collection-tile {
  border: 1px solid rgba(232, 121, 154, 0.2);
  border-radius: 18px;
  color: #5a2540;
  display: grid;
  gap: 0.55rem;
  min-height: 190px;
  overflow: hidden;
  padding: 2rem;
  position: relative;
  text-decoration: none;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.collection-tile::before {
  content: '';
  inset: 0;
  opacity: 0.35;
  position: absolute;
}

.collection-tile:hover {
  box-shadow: 0 16px 40px rgba(200, 100, 140, 0.16);
  transform: translateY(-3px);
}

.collection-tile span,
.collection-tile strong,
.collection-tile small {
  position: relative;
  z-index: 1;
}

.collection-tile span {
  color: #b05070;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.collection-tile strong {
  color: #6b2d47;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.8rem, 3vw, 2.7rem);
  line-height: 1;
}

.collection-tile small {
  color: #8a5068;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 360px;
}

.new-tile {
  background: linear-gradient(135deg, #fff3f8 0%, #f8ddea 100%);
}

.new-tile::before {
  background: radial-gradient(circle at 85% 18%, #ffffff 0 12%, transparent 13% 100%);
}

.sale-tile {
  background: linear-gradient(135deg, #fff0f4 0%, #f6c9d9 100%);
}

.sale-tile::before {
  background: radial-gradient(circle at 82% 25%, #ffffff 0 11%, transparent 12% 100%);
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

@media (max-width: 900px) {
  .collection-link-inner {
    grid-template-columns: 1fr;
  }

  .banner-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}
</style>
