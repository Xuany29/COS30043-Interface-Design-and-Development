<script>
export default {
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  emits: ['add-to-cart', 'toggle-wishlist'],
  computed: {
    price() {
      return Number(this.product.price || 0).toFixed(2)
    },
    originalPrice() {
      return Number(this.product.originalPrice || 0).toFixed(2)
    },
    sourcePage() {
      const path = this.$route.path

      if (path === '/skincare') return 'skincare'
      if (path === '/makeup') return 'makeup'
      if (path === '/shop') return 'shop'

      return ''
    },
  },
  methods: {
    openProduct() {
      this.$router.push({
        path: `/product/${this.product.id}`,
        query: this.sourcePage ? { from: this.sourcePage } : {}
      })
    },
  },
}
</script>

<template>
  <article class="product-card" role="link" tabindex="0" @click="openProduct" @keydown.enter="openProduct">
    <div class="product-img-wrap">
      <img :src="product.image" :alt="product.name" />
      <div class="product-badges">
        <span v-if="product.isNew" class="badge badge-new">New</span>
        <span v-if="product.isBestseller" class="badge badge-best">Best</span>
        <span v-if="product.discount" class="badge badge-sale">-{{ product.discount }}%</span>
      </div>
      <div class="product-actions">
        <button class="action-btn" aria-label="Add to Wishlist" @click.stop="$emit('toggle-wishlist', product)">Wish</button>
        <button type="button" class="action-btn add-cart" aria-label="Add to Cart" @click.stop="$emit('add-to-cart', product)">
          + Cart
        </button>
      </div>
    </div>

    <div class="product-info">
      <span class="product-brand">{{ product.brand }}</span>
      <h3 class="product-name">{{ product.name }}</h3>
      <p v-if="product.subCategory" class="product-subcategory">{{ product.subCategory }}</p>
      <div class="product-price">
        <span class="price-current">RM {{ price }}</span>
        <span v-if="product.originalPrice" class="price-original">RM {{ originalPrice }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  background: white;
  border: 1px solid rgba(240, 200, 220, 0.4);
  border-radius: 20px;
  box-shadow: 0 2px 16px rgba(200, 100, 140, 0.07);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 14px 36px rgba(200, 100, 140, 0.16);
  transform: translateY(-5px);
}

.product-card:focus-visible {
  outline: 3px solid rgba(232, 121, 154, 0.35);
  outline-offset: 3px;
}

.product-img-wrap {
  background: #fff5f8;
  height: 220px;
  overflow: hidden;
  position: relative;
}

.product-img-wrap img {
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  width: 100%;
}

.product-card:hover .product-img-wrap img {
  transform: scale(1.07);
}

.product-badges {
  display: flex;
  flex-direction: column;
  gap: 5px;
  left: 12px;
  position: absolute;
  top: 12px;
}

.badge {
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 3px 10px;
}

.badge-new {
  background: #6b2d47;
  color: white;
}

.badge-best {
  background: #e8799a;
  color: white;
}

.badge-sale {
  background: #f97316;
  color: white;
}

.product-actions {
  bottom: -50px;
  display: flex;
  gap: 8px;
  justify-content: center;
  left: 0;
  padding: 0 12px 12px;
  position: absolute;
  right: 0;
  transition: bottom 0.3s ease;
}

.product-card:hover .product-actions,
.product-card:focus-within .product-actions {
  bottom: 0;
}

.action-btn {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(232, 121, 154, 0.3);
  border-radius: 999px;
  color: #b05070;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 7px 12px;
}

.add-cart {
  background: linear-gradient(135deg, #e8799a, #d4547a);
  border-color: transparent;
  color: white;
  flex: 1;
}

.product-info {
  padding: 14px 16px 18px;
}

.product-brand {
  color: #e8799a;
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.product-name {
  color: #5a2540;
  display: -webkit-box;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0 0 4px;
  overflow: hidden;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-subcategory {
  color: #b07a90;
  font-size: 0.76rem;
  margin-bottom: 6px;
}

.product-price {
  align-items: center;
  display: flex;
  gap: 8px;
}

.price-current {
  color: #d4547a;
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  font-weight: 800;
}

.price-original {
  color: #c0a0b0;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  text-decoration: line-through;
}

@media (max-width: 480px) {
  .product-img-wrap {
    height: 160px;
  }
}
</style>
