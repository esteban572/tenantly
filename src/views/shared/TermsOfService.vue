<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Terms of Service</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="legal-content">
        <div class="legal-header">
          <h1>Terms of Service</h1>
          <p class="last-updated">Last Updated: {{ lastUpdated }}</p>
        </div>

        <section class="legal-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using Tenantly ("the Service"), you agree to be bound by these Terms of Service 
            ("Terms"). If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        <section class="legal-section">
          <h2>2. Description of Service</h2>
          <p>
            Tenantly is a platform that connects landlords and tenants for property rental purposes. Our services include:
          </p>
          <ul>
            <li>Property listing and discovery</li>
            <li>Rental application processing</li>
            <li>Direct messaging between users</li>
            <li>Document management and e-signatures</li>
            <li>Payment processing (where applicable)</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>3. User Accounts</h2>
          <h3>Account Creation</h3>
          <p>To use certain features of the Service, you must create an account. You agree to:</p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be responsible for all activities under your account</li>
          </ul>

          <h3>Account Types</h3>
          <p>We offer two types of accounts:</p>
          <ul>
            <li><strong>Landlord Accounts:</strong> For property owners and managers</li>
            <li><strong>Tenant Accounts:</strong> For individuals seeking rental properties</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>4. User Responsibilities</h2>
          <p>As a user of Tenantly, you agree to:</p>
          <ul>
            <li>Comply with all applicable laws and regulations</li>
            <li>Provide truthful and accurate information</li>
            <li>Respect the rights and privacy of other users</li>
            <li>Not engage in fraudulent or deceptive practices</li>
            <li>Not use the Service for any illegal purposes</li>
            <li>Not harass, abuse, or harm other users</li>
            <li>Not upload malicious code or viruses</li>
            <li>Not attempt to gain unauthorized access to the Service</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>5. Landlord Obligations</h2>
          <p>If you are a landlord using our Service, you agree to:</p>
          <ul>
            <li>Provide accurate property information and descriptions</li>
            <li>Comply with fair housing laws and regulations</li>
            <li>Not discriminate against potential tenants</li>
            <li>Respond to inquiries and applications in a timely manner</li>
            <li>Maintain properties in accordance with local laws</li>
            <li>Honor lease agreements and commitments</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>6. Tenant Obligations</h2>
          <p>If you are a tenant using our Service, you agree to:</p>
          <ul>
            <li>Provide accurate information in rental applications</li>
            <li>Be truthful about employment, income, and references</li>
            <li>Respect property viewing appointments</li>
            <li>Honor lease agreements if accepted</li>
            <li>Pay rent and other obligations on time</li>
            <li>Maintain the property in good condition</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>7. Content and Intellectual Property</h2>
          <h3>Your Content</h3>
          <p>
            You retain ownership of content you submit to the Service. By posting content, you grant us a 
            worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in 
            connection with the Service.
          </p>

          <h3>Our Content</h3>
          <p>
            The Service and its original content, features, and functionality are owned by Tenantly and are 
            protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section class="legal-section">
          <h2>8. Prohibited Activities</h2>
          <p>You may not:</p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful code or viruses</li>
            <li>Spam or send unsolicited messages</li>
            <li>Impersonate another person or entity</li>
            <li>Collect user information without consent</li>
            <li>Interfere with the Service's operation</li>
            <li>Circumvent security features</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>9. Payments and Fees</h2>
          <p>
            Certain features of the Service may require payment. You agree to pay all applicable fees and charges. 
            We reserve the right to change our pricing at any time with notice.
          </p>
          <p>All payments are non-refundable unless otherwise stated or required by law.</p>
        </section>

        <section class="legal-section">
          <h2>10. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice, 
            for any reason, including breach of these Terms.
          </p>
          <p>
            You may terminate your account at any time by contacting us. Upon termination, your right to use the 
            Service will immediately cease.
          </p>
        </section>

        <section class="legal-section">
          <h2>11. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR 
            IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
          <p>
            We are not responsible for the conduct of users or the accuracy of listings. We do not guarantee that 
            you will find a property or tenant through our Service.
          </p>
        </section>

        <section class="legal-section">
          <h2>12. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TENANTLY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
          </p>
          <p>
            Our total liability shall not exceed the amount you paid to us in the twelve months preceding the claim.
          </p>
        </section>

        <section class="legal-section">
          <h2>13. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Tenantly and its officers, directors, employees, and agents 
            from any claims, damages, losses, liabilities, and expenses arising from your use of the Service or 
            violation of these Terms.
          </p>
        </section>

        <section class="legal-section">
          <h2>14. Dispute Resolution</h2>
          <p>
            Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in 
            accordance with the rules of the American Arbitration Association.
          </p>
          <p>
            You waive your right to participate in class action lawsuits or class-wide arbitration.
          </p>
        </section>

        <section class="legal-section">
          <h2>15. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of California, 
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section class="legal-section">
          <h2>16. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting 
            the new Terms on this page and updating the "Last Updated" date.
          </p>
          <p>
            Your continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section class="legal-section">
          <h2>17. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable, the remaining provisions will continue 
            in full force and effect.
          </p>
        </section>

        <section class="legal-section">
          <h2>18. Contact Information</h2>
          <p>If you have questions about these Terms, please contact us:</p>
          <div class="contact-info">
            <p><strong>Email:</strong> legal@tenantly.com</p>
            <p><strong>Address:</strong> 123 Main Street, Suite 100, San Francisco, CA 94105</p>
            <p><strong>Phone:</strong> (555) 123-4567</p>
          </div>
        </section>

        <div class="legal-footer">
          <p>
            By using Tenantly, you acknowledge that you have read, understood, and agree to be bound by these 
            Terms of Service.
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
