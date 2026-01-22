PRD: Tenant Finder & Communication App
1. Project Overview
Build a cross-platform mobile app (iOS/Android) using Vue.js, Ionic Framework, and Capacitor.js. The app connects Landlords and Tenants directly for property discovery, real-time communication, and tenancy management.

2. Technical Stack (Strict)
Frontend: Vue.js 3 (Composition API)

UI Library: Ionic Framework (using @ionic/vue components for iOS/Android native look)

Native Bridge: Capacitor.js (for Camera, Push Notifications, and Filesystem)

Backend/Database: Supabase (Auth, PostgreSQL, and Real-time)

Styling: Tailwind CSS + Ionic CSS Utilities

3. User Roles & Features
A. Tenant Features
Property Search: Filter by price, location, and bedrooms.

Direct Inquiry: Send instant messages to landlords.

Maintenance Portal: Submit tickets with photos (using Capacitor Camera).

Rent Payment: View payment history and pay via integrated portal.

B. Landlord Features
Property Management: List properties with image uploads.

Applicant Tracking: View and chat with potential tenants.

Maintenance Dashboard: View and update the status of repair requests.

Document Management: Upload lease agreements (PDF).

4. Key Pages & Flow
Onboarding: Login/Sign-up via Supabase Auth (Role selection: Tenant or Landlord).

Home (Tenant): Swipeable cards of available properties.

Home (Landlord): Dashboard showing active properties and occupancy.

Chat Interface: Real-time messaging between roles.

Profile: User settings and document storage.

5. Native Requirements (Capacitor)
Camera: To take photos of properties (Landlord) or issues (Tenant).
