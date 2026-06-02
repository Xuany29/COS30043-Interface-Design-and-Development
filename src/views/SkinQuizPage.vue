<script>
import FooterSection from '@/components/FooterSection.vue'
import NavBar from '@/components/NavBar.vue'
import { apiRequest } from '@/services/api'

const defaultAnswers = () => ({
  skinType: '',
  concerns: [],
  budget: '',
  routineSize: ''
})

export default {
  components: {
    NavBar,
    FooterSection
  },

  data() {
    return {
      currentStep: 1,
      totalSteps: 4,
      answers: defaultAnswers(),
      routine: [],
      results: [],
      isLoading: false,
      errorMessage: '',
      toastVisible: false,
      toastMessage: '',
      toastTimer: null,
      skinOptions: [
        { label: 'Oily', value: 'oily', copy: 'Shiny through the day, visible pores, frequent breakouts.' },
        { label: 'Dry', value: 'dry', copy: 'Feels tight, flaky, or rough after cleansing.' },
        { label: 'Combination', value: 'combination', copy: 'Oily T-zone with drier cheeks.' },
        { label: 'Normal', value: 'normal', copy: 'Generally balanced with occasional changes.' },
        { label: 'Sensitive', value: 'sensitive', copy: 'Easily irritated, red, itchy, or reactive.' }
      ],
      concernOptions: [
        { label: 'Acne', value: 'acne' },
        { label: 'Pigmentation', value: 'pigmentation' },
        { label: 'Wrinkles', value: 'wrinkles' },
        { label: 'Dullness', value: 'dullness' },
        { label: 'Pores', value: 'pores' },
        { label: 'Hydration', value: 'hydration' },
        { label: 'Redness', value: 'redness' }
      ],
      budgetOptions: [
        { label: 'Under RM 50', value: 'low', copy: 'Affordable essentials and starter picks.' },
        { label: 'RM 50-100', value: 'mid', copy: 'Balanced options with more treatment choices.' },
        { label: 'RM 100+', value: 'high', copy: 'Premium formulas and hero products.' }
      ],
      routineOptions: [
        { label: 'Simple routine', value: 'simple', copy: 'A short routine with the most important steps.' },
        { label: 'Complete routine', value: 'complete', copy: 'More products for a fuller morning and night ritual.' }
      ]
    }
  },

  computed: {
    progressPercent() {
      return `${(this.currentStep / this.totalSteps) * 100}%`
    },

    hasResults() {
      return this.results.length > 0
    },

    stepTitle() {
      const titles = {
        1: 'What is your skin type?',
        2: 'What would you like to improve?',
        3: 'What is your budget?',
        4: 'How detailed should your routine be?'
      }

      return titles[this.currentStep]
    }
  },

  mounted() {
    this.restoreQuiz()
  },

  methods: {
    restoreQuiz() {
      const saved = JSON.parse(localStorage.getItem('skinQuiz') || '{}')

      if (saved.answers) {
        this.answers = {
          ...defaultAnswers(),
          ...saved.answers
        }
      }

      if (Array.isArray(saved.results)) {
        this.results = saved.results
      }

      if (Array.isArray(saved.routine)) {
        this.routine = saved.routine
      }
    },

    saveQuiz() {
      localStorage.setItem(
        'skinQuiz',
        JSON.stringify({
          answers: this.answers,
          results: this.results,
          routine: this.routine
        })
      )
    },

    selectSingle(field, value) {
      this.answers[field] = value
      this.errorMessage = ''
      this.saveQuiz()
    },

    toggleConcern(value) {
      if (this.answers.concerns.includes(value)) {
        this.answers.concerns = this.answers.concerns.filter(concern => concern !== value)
      } else {
        this.answers.concerns = [...this.answers.concerns, value]
      }

      this.errorMessage = ''
      this.saveQuiz()
    },

    validateStep() {
      if (this.currentStep === 1 && !this.answers.skinType) {
        this.errorMessage = 'Choose your skin type to continue.'
        return false
      }

      if (this.currentStep === 2 && this.answers.concerns.length === 0) {
        this.errorMessage = 'Choose at least one concern.'
        return false
      }

      if (this.currentStep === 3 && !this.answers.budget) {
        this.errorMessage = 'Choose a budget range.'
        return false
      }

      if (this.currentStep === 4 && !this.answers.routineSize) {
        this.errorMessage = 'Choose a routine style.'
        return false
      }

      this.errorMessage = ''
      return true
    },

    nextStep() {
      if (!this.validateStep()) return

      if (this.currentStep < this.totalSteps) {
        this.currentStep += 1
        return
      }

      this.getRecommendations()
    },

    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep -= 1
        this.errorMessage = ''
      }
    },

    async getRecommendations() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const data = await apiRequest('/quiz/recommend', {
          method: 'POST',
          body: JSON.stringify(this.answers)
        })

        this.results = data.products || []
        this.routine = data.routine || []
        this.saveQuiz()
        this.showToast('Your routine is ready')
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.isLoading = false
      }
    },

    retakeQuiz() {
      this.currentStep = 1
      this.answers = defaultAnswers()
      this.results = []
      this.routine = []
      this.errorMessage = ''
      localStorage.removeItem('skinQuiz')
    },

    async addToCart(product) {
      if (product.has_variants && product.variants?.length) {
        this.$router.push(`/product/${product.id}`)
        return
      }

      const token = localStorage.getItem('authToken')

      if (!token) {
        this.showToast('Please log in before adding items to cart')
        return
      }

      try {
        await apiRequest('/cart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product.id,
            qty: 1
          })
        })

        window.dispatchEvent(new Event('cart-updated'))
        this.showToast(`${product.name} added`)
      } catch (error) {
        this.showToast(error.message)
      }
    },

    showToast(message) {
      this.toastMessage = message
      this.toastVisible = true

      clearTimeout(this.toastTimer)

      this.toastTimer = setTimeout(() => {
        this.toastVisible = false
      }, 2200)
    }
  }
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="quiz-page">
      <section class="quiz-hero">
        <p class="eyebrow">Skin Quiz</p>
        <h1>Build Your Personal Skincare Routine</h1>
        <p>
          Answer a few quick questions and get product picks from the Blush Berry catalog,
          matched to your skin type, concerns, and budget.
        </p>
      </section>

      <section class="quiz-shell" aria-label="Skincare quiz">
        <div class="quiz-panel">
          <template v-if="!hasResults">
            <div class="progress-wrap">
              <div>
                <span>Step {{ currentStep }} of {{ totalSteps }}</span>
                <h2>{{ stepTitle }}</h2>
              </div>
              <div class="progress-track" aria-hidden="true">
                <div class="progress-fill" :style="{ width: progressPercent }"></div>
              </div>
            </div>

            <Transition name="slide-fade" mode="out-in">
              <div :key="currentStep" class="step-body">
                <div v-if="currentStep === 1" class="option-grid">
                  <button
                    v-for="option in skinOptions"
                    :key="option.value"
                    class="option-card"
                    :class="{ selected: answers.skinType === option.value }"
                    type="button"
                    @click="selectSingle('skinType', option.value)"
                  >
                    <strong>{{ option.label }}</strong>
                    <span>{{ option.copy }}</span>
                  </button>
                </div>

                <div v-else-if="currentStep === 2" class="chip-grid" role="group" aria-label="Skin concerns">
                  <button
                    v-for="option in concernOptions"
                    :key="option.value"
                    class="concern-chip"
                    :class="{ selected: answers.concerns.includes(option.value) }"
                    type="button"
                    @click="toggleConcern(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>

                <div v-else-if="currentStep === 3" class="option-grid">
                  <button
                    v-for="option in budgetOptions"
                    :key="option.value"
                    class="option-card"
                    :class="{ selected: answers.budget === option.value }"
                    type="button"
                    @click="selectSingle('budget', option.value)"
                  >
                    <strong>{{ option.label }}</strong>
                    <span>{{ option.copy }}</span>
                  </button>
                </div>

                <div v-else class="option-grid two-cols">
                  <button
                    v-for="option in routineOptions"
                    :key="option.value"
                    class="option-card"
                    :class="{ selected: answers.routineSize === option.value }"
                    type="button"
                    @click="selectSingle('routineSize', option.value)"
                  >
                    <strong>{{ option.label }}</strong>
                    <span>{{ option.copy }}</span>
                  </button>
                </div>
              </div>
            </Transition>

            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

            <div class="quiz-actions">
              <button class="ghost-btn" type="button" :disabled="currentStep === 1 || isLoading" @click="prevStep">
                Back
              </button>
              <button class="primary-btn" type="button" :disabled="isLoading" @click="nextStep">
                {{ isLoading ? 'Building...' : currentStep === totalSteps ? 'Show routine' : 'Next' }}
              </button>
            </div>
          </template>

          <template v-else>
            <div class="results-header">
              <div>
                <p class="eyebrow">Your Routine</p>
                <h2>Recommended for {{ answers.skinType }} skin</h2>
              </div>
              <button class="ghost-btn" type="button" @click="retakeQuiz">Retake quiz</button>
            </div>

            <p class="results-copy">
              These picks are ranked by skin type fit, concern match, budget, and product quality signals.
            </p>

            <div v-if="routine.length" class="routine-list">
              <section v-for="group in routine" :key="group.step" class="routine-group">
                <h3>{{ group.step }}</h3>
                <div class="results-grid">
                  <article v-for="product in group.products" :key="product.id" class="result-card">
                    <router-link class="result-image" :to="`/product/${product.id}`">
                      <img :src="product.image" :alt="product.name" />
                      <span>{{ product.matchScore }}% match</span>
                    </router-link>
                    <div class="result-info">
                      <p class="brand">{{ product.brand }}</p>
                      <h4>{{ product.name }}</h4>
                      <p v-if="product.matchReasons.length" class="reason">
                        {{ product.matchReasons.slice(0, 2).join(' • ') }}
                      </p>
                      <div class="result-footer">
                        <strong>RM {{ Number(product.price).toFixed(2) }}</strong>
                        <button type="button" @click="addToCart(product)">Add</button>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            </div>

            <p v-else class="empty-state">No routine matches yet. Try changing your budget or concerns.</p>
          </template>
        </div>
      </section>
    </main>

    <transition name="toast">
      <div v-if="toastVisible" class="cart-toast">{{ toastMessage }}</div>
    </transition>

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

.quiz-page {
  padding-top: 5rem;
}

.quiz-hero {
  background:
    linear-gradient(rgba(255, 248, 251, 0.78), rgba(255, 248, 251, 0.92)),
    url('https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1600&q=80');
  background-position: center;
  background-size: cover;
  padding: 5rem 1.5rem 4rem;
  text-align: center;
}

.eyebrow {
  color: var(--pink-700);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  margin-bottom: 0.65rem;
  text-transform: uppercase;
}

h1,
h2,
h3,
h4 {
  color: var(--pink-800);
  font-family: 'Cormorant Garamond', serif;
}

h1 {
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.08;
  margin: 0 auto 1rem;
  max-width: 760px;
}

.quiz-hero p:last-child {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 auto;
  max-width: 660px;
}

.quiz-shell {
  padding: 2rem 1.5rem 4rem;
}

.quiz-panel {
  background: white;
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  margin: 0 auto;
  max-width: 1040px;
  padding: 1.5rem;
}

.progress-wrap {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.progress-wrap span {
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.progress-wrap h2,
.results-header h2 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin-top: 0.15rem;
}

.progress-track {
  background: #ffe5ee;
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
}

.progress-fill {
  background: var(--pink-800);
  border-radius: inherit;
  height: 100%;
  transition: width 0.3s ease;
}

.step-body {
  min-height: 240px;
}

.option-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.option-grid.two-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.option-card,
.concern-chip {
  background: #fffafd;
  border: 1px solid var(--pink-200);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.option-card {
  display: grid;
  gap: 0.5rem;
  min-height: 132px;
  padding: 1rem;
}

.option-card strong {
  color: var(--pink-800);
  font-size: 1rem;
}

.option-card span {
  font-size: 0.86rem;
  line-height: 1.55;
}

.option-card:hover,
.concern-chip:hover,
.option-card.selected,
.concern-chip.selected {
  border-color: var(--pink-700);
  box-shadow: 0 10px 28px rgba(122, 31, 61, 0.12);
  transform: translateY(-2px);
}

.option-card.selected,
.concern-chip.selected {
  background: #fff0f5;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.concern-chip {
  border-radius: 999px;
  font-weight: 800;
  padding: 0.75rem 1rem;
  text-align: center;
}

.error-message {
  background: #fff5f5;
  border-radius: 8px;
  color: #b42318;
  font-size: 0.86rem;
  font-weight: 700;
  margin-top: 1rem;
  padding: 0.75rem 0.85rem;
}

.quiz-actions,
.results-header,
.result-footer {
  align-items: center;
  display: flex;
}

.quiz-actions {
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
}

.primary-btn,
.ghost-btn,
.result-footer button {
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
}

.primary-btn {
  background: var(--pink-800);
  border: 1px solid var(--pink-800);
  color: white;
  padding: 0.78rem 1.25rem;
}

.ghost-btn {
  background: white;
  border: 1px solid var(--pink-200);
  color: var(--pink-800);
  padding: 0.78rem 1.1rem;
}

.ghost-btn:disabled,
.primary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.results-header {
  gap: 1rem;
  justify-content: space-between;
}

.results-copy {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0.8rem 0 1.5rem;
}

.routine-list {
  display: grid;
  gap: 1.5rem;
}

.routine-group h3 {
  font-size: 1.45rem;
  margin-bottom: 0.8rem;
}

.results-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.result-card {
  border: 1px solid rgba(232, 121, 154, 0.18);
  border-radius: 8px;
  overflow: hidden;
}

.result-image {
  background: #fff0f5;
  display: block;
  height: 190px;
  position: relative;
  text-decoration: none;
}

.result-image img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.result-image span {
  background: var(--pink-800);
  border-radius: 999px;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  left: 0.7rem;
  padding: 0.35rem 0.65rem;
  position: absolute;
  top: 0.7rem;
}

.result-info {
  display: grid;
  gap: 0.45rem;
  padding: 0.9rem;
}

.brand {
  color: var(--pink-500);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.result-info h4 {
  display: -webkit-box;
  font-size: 1.02rem;
  line-height: 1.3;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.reason {
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.45;
  min-height: 34px;
}

.result-footer {
  gap: 0.75rem;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.result-footer strong {
  color: var(--pink-800);
}

.result-footer button {
  background: var(--pink-800);
  border: 1px solid var(--pink-800);
  color: white;
  padding: 0.45rem 0.8rem;
}

.empty-state {
  color: var(--text-muted);
  padding: 3rem 1rem;
  text-align: center;
}

.cart-toast {
  background: var(--pink-800);
  border-radius: 12px;
  bottom: 1.25rem;
  box-shadow: 0 6px 20px rgba(122, 31, 61, 0.25);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.65rem 1.2rem;
  position: fixed;
  right: 1.25rem;
  z-index: 1000;
}

.slide-fade-enter-active,
.slide-fade-leave-active,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 980px) {
  .option-grid,
  .results-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .quiz-hero {
    padding: 4rem 1rem 3rem;
  }

  .quiz-shell {
    padding: 1rem 1rem 3rem;
  }

  .quiz-panel {
    padding: 1rem;
  }

  .option-grid,
  .option-grid.two-cols,
  .results-grid {
    grid-template-columns: 1fr;
  }

  .results-header,
  .quiz-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .quiz-actions button,
  .results-header button {
    width: 100%;
  }
}
</style>
