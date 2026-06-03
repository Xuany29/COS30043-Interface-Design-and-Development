<template>
  <section class="hero">
    <!-- Decorative blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <div class="row g-0 w-100">
      <div class="col-12">
        <div class="hero-content">
          <div class="hero-text">
            <div class="row g-0">
              <div class="col-12">
                <span class="hero-tag">✦ K-Beauty Essentials ✦</span>
                <h1 class="hero-title">
                  Glow Like a<br/>
                  <em>Korean Dream</em>
                </h1>
                <p class="hero-sub">
                  Discover curated skincare & makeup from the heart of Seoul.
                  Pure ingredients, glass-skin results.
                </p>
              </div>
            </div>
            <div class="row g-0">
              <div class="col-12">
                <div class="hero-actions">
                  <router-link to="/shop" class="btn-primary">Shop Now</router-link>
                  <router-link to="/quiz" class="btn-ghost">Skincare Edit</router-link>
                </div>
              </div>
            </div>
          </div>

          <div class="hero-visual">
            <div class="hero-card main-card">
              <div class="card-img-wrap">
                <img
                  src="https://cdn.shopify.com/s/files/1/0274/2789/7419/products/BANILACOCleanItZeroOriginalCleansingBalm100ml_1000x1000.jpg?v=1593009620"
                  alt="BANILA CO Clean It Zero Cleansing Balm"
                  class="hero-img"
                />
                <div class="card-badge">New Arrival ✨</div>
              </div>
              <div class="card-info">
                <span class="card-brand">BANILA CO</span>
                <span class="card-name">Clean It Zero Cleansing Balm</span>
              </div>
            </div>
            <div class="hero-card mini-card mini-1">
              <img
                src="https://i.pinimg.com/originals/4d/78/66/4d7866c5f8548c19c48c89bcad2ce2cd.jpg"
                alt="Romand Juicy Tint"
              />
              <div class="mini-info">
                <span>ROMAND</span>
                <span>Juicy Tint</span>
              </div>
            </div>
            <div class="hero-card mini-card mini-2">
              <img
                src="https://luviabeauty.co.ke/wp-content/uploads/2021/07/Laneige-Water-sleeping-mask-yonaamio-1.jpg"
                alt="Laneige Water Mask"
              />
              <div class="mini-info">
                <span>LANEIGE</span>
                <span>Water Mask</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="scroll-hint">
      <span>Scroll to explore</span>
      <div class="scroll-dot"></div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ef 40%, #ffd6e8 70%, #ffcce3 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 2rem 4rem;
}

/* Background blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.45;
  pointer-events: none;
}

.blob-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #f9a8c9, #f472b6);
  top: -150px; right: -100px;
  animation: blobFloat 8s ease-in-out infinite alternate;
}

.blob-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, #fecdd3, #fda4af);
  bottom: -80px; left: -80px;
  animation: blobFloat 10s ease-in-out infinite alternate-reverse;
}

.blob-3 {
  width: 250px; height: 250px;
  background: radial-gradient(circle, #fbcfe8, #f9a8d4);
  top: 40%; left: 35%;
  animation: blobFloat 12s ease-in-out infinite alternate;
}

@keyframes blobFloat {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(20px, -20px) scale(1.05); }
}

/* Hero layout */
.hero-content {
  max-width: 1280px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* Text side */
.hero-tag {
  display: inline-block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #e8799a;
  background: rgba(232, 121, 154, 0.1);
  border: 1px solid rgba(232, 121, 154, 0.3);
  padding: 6px 16px;
  border-radius: 50px;
  margin-bottom: 1.5rem;
  animation: fadeUp 0.7s ease both;
}

.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.8rem, 5vw, 4.2rem);
  font-weight: 700;
  color: #6b2d47;
  line-height: 1.15;
  margin: 0 0 1.2rem;
  animation: fadeUp 0.7s 0.1s ease both;
}

.hero-title em {
  font-style: italic;
  color: #e8799a;
  display: block;
}

.hero-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.05rem;
  color: #9b5070;
  line-height: 1.75;
  max-width: 440px;
  margin-bottom: 2.5rem;
  animation: fadeUp 0.7s 0.2s ease both;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
  animation: fadeUp 0.7s 0.3s ease both;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 14px 32px;
  background: linear-gradient(135deg, #e8799a, #d4547a);
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  border-radius: 50px;
  text-decoration: none;
  box-shadow: 0 8px 28px rgba(212, 84, 122, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgba(212, 84, 122, 0.5);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 13px 28px;
  background: transparent;
  color: #b05070;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1.5px solid rgba(176, 80, 112, 0.4);
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: rgba(176, 80, 112, 0.07);
  border-color: #b05070;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  animation: fadeUp 0.7s 0.4s ease both;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #6b2d47;
}

.stat-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  color: #b07a90;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(176, 80, 112, 0.2);
}

/* Visual side */
.hero-visual {
  position: relative;
  height: 520px;
  animation: fadeUp 0.8s 0.2s ease both;
}

.hero-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 200, 220, 0.5);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(200, 100, 140, 0.18);
  position: absolute;
}

.main-card {
  width: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.card-img-wrap {
  position: relative;
  height: 260px;
  overflow: hidden;
}

.card-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.main-card:hover .card-img-wrap img {
  transform: scale(1.06);
}

.card-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(255, 255, 255, 0.9);
  color: #e8799a;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 50px;
  letter-spacing: 0.05em;
}

.card-info {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-brand {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e8799a;
}

.card-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  color: #6b2d47;
}

.card-price {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #d4547a;
}

.mini-card {
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mini-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.mini-info {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-info span:first-child {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #e8799a;
}

.mini-info span:last-child {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.82rem;
  color: #7a3d55;
}

.mini-1 {
  top: 8%;
  right: 0;
  transform: rotate(3deg);
  z-index: 3;
  transition: transform 0.3s;
}

.mini-1:hover { transform: rotate(0deg) scale(1.04); }

.mini-2 {
  bottom: 8%;
  left: 0;
  transform: rotate(-3deg);
  z-index: 3;
  transition: transform 0.3s;
}

.mini-2:hover { transform: rotate(0deg) scale(1.04); }

/* Scroll hint */
.scroll-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #b07a90;
  opacity: 0.7;
}

.scroll-dot {
  width: 6px;
  height: 6px;
  background: #e8799a;
  border-radius: 50%;
  animation: scrollBounce 1.5s ease-in-out infinite;
}

@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 900px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }

  .hero-sub { margin: 0 auto 2.5rem; }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-visual {
    height: 360px;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
  }

  .main-card {
    width: 240px;
  }

  .mini-1 { right: 4%; }
  .mini-2 { left: 4%; }
}

@media (max-width: 480px) {
  .hero {
    padding: 90px 1.2rem 3rem;
  }

  .hero-visual {
    height: 300px;
  }

  .mini-card { display: none; }

  .main-card {
    transform: translate(-50%, -50%);
  }
}
</style>
