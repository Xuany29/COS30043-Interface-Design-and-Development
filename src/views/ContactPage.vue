<script>
import FooterSection from '@/components/FooterSection.vue'
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar,
    FooterSection
  },

  data() {
    return {
      supportEmail: 'support@blushberry.com',
      form: {
        name: '',
        email: '',
        topic: 'Order support',
        message: ''
      },
      submitted: false
    }
  },

  methods: {
    submitContact() {
      const subject = encodeURIComponent(`[${this.form.topic}] Message from ${this.form.name}`)
      const body = encodeURIComponent([
        `Name: ${this.form.name}`,
        `Email: ${this.form.email}`,
        `Topic: ${this.form.topic}`,
        '',
        this.form.message
      ].join('\n'))

      window.location.href = `mailto:${this.supportEmail}?subject=${subject}&body=${body}`
      this.submitted = true
      this.form = {
        name: '',
        email: '',
        topic: 'Order support',
        message: ''
      }
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="contact-page">
      <section class="shop-hero">
        <p class="hero-eyebrow">Support</p>
        <h1 class="hero-title">Contact <em>Us</em></h1>
        <p class="hero-subtitle">Reach the Blush Berry team for order, product, or account help.</p>
      </section>

      <section class="contact-grid">
        <form class="contact-form" @submit.prevent="submitContact">
          <p v-if="submitted" class="success-message">Your email app has been opened with this message ready to send.</p>

          <label>
            <span>Name</span>
            <input v-model.trim="form.name" type="text" required />
          </label>
          <label>
            <span>Email</span>
            <input v-model.trim="form.email" type="email" required />
          </label>
          <label>
            <span>Topic</span>
            <select v-model="form.topic">
              <option>Order support</option>
              <option>Product question</option>
              <option>Account help</option>
              <option>General enquiry</option>
            </select>
          </label>
          <label>
            <span>Message</span>
            <textarea v-model.trim="form.message" rows="6" required></textarea>
          </label>

          <button type="submit">Send Message</button>
        </form>

        <aside class="contact-card">
          <h2>Customer care</h2>
          <div>
            <span>Email</span>
            <strong>{{ supportEmail }}</strong>
          </div>
          <div>
            <span>Hours</span>
            <strong>Monday to Friday, 9:00 AM - 6:00 PM</strong>
          </div>
          <div>
            <span>Location</span>
            <strong>Kuala Lumpur, Malaysia</strong>
          </div>
        </aside>
      </section>
    </main>

    <FooterSection />
  </div>
</template>

<style scoped>
.page {
  background: #fff8fb;
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
}

.contact-page {
  padding-bottom: 4rem;
}

.shop-hero {
  background: linear-gradient(135deg, #fbeef3 0%, #f5dde8 50%, #ecdceb 100%);
  padding: 6rem 1.5rem 3.5rem;
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

h2 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
}

.hero-title {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.9rem;
}

.hero-title em {
  color: var(--pink-500);
}

.hero-subtitle {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 auto;
  max-width: 620px;
}

.contact-grid {
  align-items: start;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  margin: 0 auto;
  max-width: 1120px;
  padding: 2rem 1rem 0;
}

.contact-form,
.contact-card {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  padding: 1.25rem;
}

.contact-form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.35rem;
}

label span,
.contact-card span {
  color: var(--text-muted);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

input,
select,
textarea {
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 8px;
  color: var(--text-primary);
  font: inherit;
  min-height: 44px;
  outline: none;
  padding: 0.7rem 0.85rem;
  width: 100%;
}

textarea {
  resize: vertical;
}

button {
  background: var(--pink-800);
  border: 1px solid var(--pink-800);
  border-radius: 999px;
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  padding: 0.8rem 1.2rem;
  width: fit-content;
}

.success-message {
  background: #f0fdf4;
  border-radius: 8px;
  color: #166534;
  font-weight: 800;
  padding: 0.75rem 0.85rem;
}

.contact-card {
  display: grid;
  gap: 1rem;
}

.contact-card strong {
  color: var(--pink-900);
  display: block;
  margin-top: 0.25rem;
}

@media (max-width: 780px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
