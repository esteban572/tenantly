<template>
  <footer class="app-footer">
    <div class="footer-content">
      <!-- Logo & Description -->
      <div class="footer-section footer-brand">
        <div class="footer-logo">
          <ion-icon :icon="homeOutline" class="logo-icon"></ion-icon>
          <span class="logo-text">Tenantly</span>
        </div>
        <p class="footer-description">
          Connecting landlords and tenants for seamless property management and rental experiences.
        </p>
        <!-- Social Media Icons -->
        <div class="social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">
            <ion-icon :icon="logoFacebook"></ion-icon>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
            <ion-icon :icon="logoInstagram"></ion-icon>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Twitter">
            <ion-icon :icon="logoTwitter"></ion-icon>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
            <ion-icon :icon="logoLinkedin"></ion-icon>
          </a>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="footer-section">
        <h3 class="footer-title">Company</h3>
        <ul class="footer-links">
          <li><a href="/about">About Us</a></li>
          <li><a href="/careers">Careers</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>

      <!-- Resources -->
      <div class="footer-section">
        <h3 class="footer-title">Resources</h3>
        <ul class="footer-links">
          <li><a href="/help">Help Center</a></li>
          <li><a href="/guides">Guides</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>

      <!-- Legal -->
      <div class="footer-section">
        <h3 class="footer-title">Legal</h3>
        <ul class="footer-links">
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/cookies">Cookie Policy</a></li>
          <li><a href="/disclaimer">Disclaimer</a></li>
        </ul>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <p class="copyright">
        © {{ currentYear }} Tenantly. All rights reserved.
      </p>
      <div class="footer-bottom-links">
        <a href="/privacy">Privacy</a>
        <span class="separator">•</span>
        <a href="/terms">Terms</a>
        <span class="separator">•</span>
        <a href="/sitemap">Sitemap</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { 
  homeOutline, 
  logoFacebook, 
  logoInstagram, 
  logoTwitter, 
  logoLinkedin 
} from 'ionicons/icons';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
  color: #E5E7EB;
  padding: 3rem 2rem 1.5rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 2.5rem;
}

/* Brand Section */
.footer-brand {
  max-width: 350px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 32px;
  color: #667eea;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.footer-description {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #9CA3AF;
  margin-bottom: 1.5rem;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #E5E7EB;
  font-size: 20px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Footer Sections */
.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links a {
  color: #9CA3AF;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #667eea;
}

/* Bottom Bar */
.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright {
  font-size: 0.875rem;
  color: #9CA3AF;
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.footer-bottom-links a {
  color: #9CA3AF;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-bottom-links a:hover {
  color: #667eea;
}

.separator {
  color: #4B5563;
}

/* Tablet */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .footer-brand {
    grid-column: 1 / -1;
    max-width: 100%;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .app-footer {
    padding: 2rem 1.5rem 1rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-brand {
    grid-column: 1;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .footer-bottom-links {
    justify-content: center;
  }
}
</style>
