<script>
import NavBar from '@/components/NavBar.vue';
import FooterSection from '@/components/FooterSection.vue';
import { apiRequest } from '@/services/api';

export default {
    components: {
        NavBar,
        FooterSection
    },
    data() {
        return {
            form: {
                firstName: '',
                lastName: '',
                email: '',
                password: ''
            },
            message: '',
            error: '',
            isSubmitting: false
        }
    },
    methods: {
        async register() {
            this.message = '';
            this.error = '';
            this.isSubmitting = true;

            try {
                const data = await apiRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(this.form)
                });

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('authUser', JSON.stringify(data.user));
                this.message = data.message;
                this.$router.push('/login');
            } catch (error) {
                this.error = error.message;
            } finally {
                this.isSubmitting = false;
            }
        }
    }
}
</script>

<template>
    <div class="page">
        <NavBar />
        <main>
            <section class="register-information">
                <form class="register-form" @submit.prevent="register">
                    <div class="form-header">
                        <p class="hero-eyebrow">Join Us</p>
                        <h1 class="hero-title">Create Your Account</h1>
                        <p class="hero-subtitle">Already have an account? <router-link to="/login">Log in</router-link></p>
                    </div>

                    <p v-if="message" class="form-message success">{{ message }}</p>
                    <p v-if="error" class="form-message error">{{ error }}</p>

                    <p><label for="firstName">First Name</label>
                    <input v-model="form.firstName" type="text" id="firstName" name="firstName" placeholder="Enter your first name" required /></p>
                    <p><label for="lastName">Last Name</label>
                    <input v-model="form.lastName" type="text" id="lastName" name="lastName" placeholder="Enter your last name" required /></p>
                    <p><label for="email">Email</label>
                    <input v-model="form.email" type="email" id="email" name="email" placeholder="Enter your email" required /></p>
                    <p><label for="password">Password</label>
                    <input v-model="form.password" type="password" id="password" name="password" placeholder="Create a password" minlength="6" required /></p>
                    <button type="submit" class="register-btn" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Signing Up...' : 'Sign Up' }}
                    </button>
                </form>
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
    background: #fff8fb;
    font-family: 'DM Sans', sans-serif;
}

.register-information {
    flex: 1;
    margin: 8rem auto 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0 1.5rem;
    min-height: 500px;
}

.register-form {
    background: white;
    border-radius: var(--radius-lg);
    padding: 3rem;
    width: 100%;
    max-width: 500px;
    box-shadow: var(--shadow-md);
}

.register-form p {
    margin-bottom: 1.75rem;
    display: flex;
    flex-direction: column;
}

.register-form label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.register-form input {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
    border: 1.5px solid var(--pink-200);
    border-radius: var(--radius-md);
    background: #fff8fb;
    color: var(--text-primary);
    transition: border-color 0.2s, background 0.2s;
}

.register-form input::placeholder {
    color: var(--text-muted);
}

.register-btn {
    width: 100%;
    padding: 0.875rem 1.5rem;
    margin-top: 1rem;
    background: linear-gradient(135deg, var(--pink-500), var(--pink-600));
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.3s;
}

.register-btn:hover {
    background: linear-gradient(135deg, var(--pink-600), var(--pink-700));
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.register-btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
}

.form-message {
    border-radius: var(--radius-md);
    padding: 0.85rem 1rem;
    margin-bottom: 1.25rem;
    font-size: 0.95rem;
    line-height: 1.5;
}

.form-message.success {
    background: #ecfdf3;
    color: #166534;
}

.form-message.error {
    background: #fef2f2;
    color: #991b1b;
}

.form-header {
    text-align: center;
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--pink-100);
}

.form-header .hero-eyebrow {
    margin-bottom: 0.5rem;
}

.hero-eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--pink-700);
    font-weight: 600;
    margin: 0;
}

.hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 600;
    color: var(--pink-800);
    line-height: 1.2;
    margin: 0.75rem 0 1rem;
}

.hero-subtitle {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.7;
    margin: 0;
}

.hero-subtitle a {
    color: var(--pink-500);
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
}

.hero-subtitle a:hover {
    color: var(--pink-600);
}
</style>
