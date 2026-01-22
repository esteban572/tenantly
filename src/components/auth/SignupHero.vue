<template>
  <div class="signup-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-icon">
          <ion-icon :icon="homeOutline" class="text-6xl"></ion-icon>
        </div>
        <h1 class="logo-text">Tenantly</h1>
      </div>

      <!-- Tagline -->
      <div class="tagline-section">
        <h2 class="tagline">Find Your Perfect Home</h2>
        <p class="subtitle">Connect with landlords and discover your next rental property</p>
      </div>

      <!-- Features -->
      <div class="features-section">
        <div class="feature-item" v-for="feature in features" :key="feature.title">
          <div class="feature-icon">
            <ion-icon :icon="feature.icon"></ion-icon>
          </div>
          <div class="feature-text">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- Social Proof -->
      <div class="social-proof">
        <div class="stat">
          <span class="stat-number">10,000+</span>
          <span class="stat-label">Active Users</span>
        </div>
        <div class="stat">
          <span class="stat-number">5,000+</span>
          <span class="stat-label">Properties Listed</span>
        </div>
        <div class="stat">
          <span class="stat-number">98%</span>
          <span class="stat-label">Satisfaction Rate</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { homeOutline, searchOutline, chatbubbleOutline, documentTextOutline, createOutline } from 'ionicons/icons';

const features = [
  {
    icon: searchOutline,
    title: 'Browse Properties',
    description: 'Discover thousands of rental listings in your area'
  },
  {
    icon: documentTextOutline,
    title: 'Easy Applications',
    description: 'Apply to properties with our streamlined application process'
  },
  {
    icon: chatbubbleOutline,
    title: 'Direct Messaging',
    description: 'Chat directly with landlords and property managers'
  },
  {
    icon: createOutline,
    title: 'E-Signatures',
    description: 'Sign lease agreements securely online'
  }
];
</script>

<style scoped>
.signup-hero {
  position: relative;
  height: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.signup-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80');
  background-size: cover;
  background-position: center;
  opacity: 0.15;
  filter: blur(2px);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
  color: white;
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInUp 0.6s ease-out;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.logo-text {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
}

/* Tagline Section */
.tagline-section {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.tagline {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

/* Features Section */
.features-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out backwards;
}

.feature-item:nth-child(1) { animation-delay: 0.2s; }
.feature-item:nth-child(2) { animation-delay: 0.3s; }
.feature-item:nth-child(3) { animation-delay: 0.4s; }
.feature-item:nth-child(4) { animation-delay: 0.5s; }

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 24px;
}

.feature-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.feature-text p {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

/* Social Proof */
.social-proof {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeInUp 0.6s ease-out 0.6s backwards;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .signup-hero {
    min-height: auto;
    padding: 2rem 1.5rem;
  }

  .logo-text {
    font-size: 2.5rem;
  }

  .tagline {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .features-section {
    gap: 1rem;
  }

  .feature-item {
    padding: 1rem;
  }

  .social-proof {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1.5rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
