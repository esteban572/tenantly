<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Privacy Policy</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="legal-content">
        <div class="legal-header">
          <h1>Privacy Policy</h1>
          <p class="last-updated">Last Updated: {{ lastUpdated }}</p>
        </div>

        <section class="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Tenantly ("we," "our," or "us"). We are committed to protecting your personal information 
            and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
            your information when you use our mobile application and services.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
            please do not access the application.
          </p>
        </section>

        <section class="legal-section">
          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>We collect personal information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Register for an account</li>
            <li>Create a property listing</li>
            <li>Submit a rental application</li>
            <li>Communicate with other users</li>
            <li>Upload documents or images</li>
          </ul>
          <p>This information may include:</p>
          <ul>
            <li>Name and contact information (email, phone number, address)</li>
            <li>Account credentials (username, password)</li>
            <li>Profile information</li>
            <li>Employment and financial information (for rental applications)</li>
            <li>Payment information</li>
            <li>Communications and messages</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>When you use our application, we may automatically collect:</p>
          <ul>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages viewed, features used, time spent)</li>
            <li>Location data (with your permission)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain our services</li>
            <li>Process your transactions and manage your account</li>
            <li>Facilitate communication between landlords and tenants</li>
            <li>Send you updates, notifications, and marketing communications</li>
            <li>Improve and personalize your experience</li>
            <li>Detect, prevent, and address technical issues and fraud</li>
            <li>Comply with legal obligations</li>
            <li>Analyze usage patterns and trends</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>4. Information Sharing and Disclosure</h2>
          <p>We may share your information in the following situations:</p>
          <ul>
            <li><strong>With Other Users:</strong> When you create a listing or submit an application, relevant information is shared with the other party</li>
            <li><strong>Service Providers:</strong> We may share information with third-party vendors who perform services on our behalf</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>With Your Consent:</strong> We may share information for any other purpose with your consent</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section class="legal-section">
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information. 
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive 
            to protect your information, we cannot guarantee its absolute security.
          </p>
          <p>Security measures include:</p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure data storage with Supabase</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>6. Your Privacy Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Opt-Out:</strong> Opt-out of marketing communications</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent where we rely on consent to process your data</li>
          </ul>
          <p>To exercise these rights, please contact us at privacy@tenantly.com</p>
        </section>

        <section class="legal-section">
          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
            Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need 
            your information, we will securely delete or anonymize it.
          </p>
        </section>

        <section class="legal-section">
          <h2>8. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
            information from children. If you believe we have collected information from a child, please contact us 
            immediately.
          </p>
        </section>

        <section class="legal-section">
          <h2>9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. 
            These countries may have different data protection laws. We ensure appropriate safeguards are in place 
            to protect your information.
          </p>
        </section>

        <section class="legal-section">
          <h2>10. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service and store certain 
            information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section class="legal-section">
          <h2>11. Third-Party Links</h2>
          <p>
            Our application may contain links to third-party websites. We are not responsible for the privacy practices 
            of these third parties. We encourage you to read their privacy policies.
          </p>
        </section>

        <section class="legal-section">
          <h2>12. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy 
            Policy periodically for any changes.
          </p>
        </section>

        <section class="legal-section">
          <h2>13. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
          <div class="contact-info">
            <p><strong>Email:</strong> privacy@tenantly.com</p>
            <p><strong>Address:</strong> 123 Main Street, Suite 100, San Francisco, CA 94105</p>
            <p><strong>Phone:</strong> (555) 123-4567</p>
          </div>
        </section>

        <div class="legal-footer">
          <p>
            By using Tenantly, you acknowledge that you have read and understood this Privacy Policy and agree to 
            its terms.
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/vue';

const lastUpdated = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});
</script>

<style scoped>
.legal-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.legal-header {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #E5E7EB;
}

.legal-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
}

.last-updated {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.legal-section {
  margin-bottom: 2.5rem;
}

.legal-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 1rem 0;
}

.legal-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 1.5rem 0 0.75rem 0;
}

.legal-section p {
  font-size: 1rem;
  line-height: 1.7;
  color: #4B5563;
  margin: 0 0 1rem 0;
}

.legal-section ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.legal-section li {
  font-size: 1rem;
  line-height: 1.7;
  color: #4B5563;
  margin-bottom: 0.5rem;
}

.contact-info {
  background: #F9FAFB;
  border-left: 4px solid #667eea;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.contact-info p {
  margin: 0.5rem 0;
}

.legal-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #E5E7EB;
  text-align: center;
}

.legal-footer p {
  font-size: 0.875rem;
  color: #6B7280;
  font-style: italic;
}

/* Mobile */
@media (max-width: 640px) {
  .legal-content {
    padding: 1.5rem 1rem;
  }

  .legal-header h1 {
    font-size: 2rem;
  }

  .legal-section h2 {
    font-size: 1.25rem;
  }

  .legal-section h3 {
    font-size: 1rem;
  }
}
</style>
