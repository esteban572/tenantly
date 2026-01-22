# 🏠 Tenantly - Property Management & Tenant Finder App

A modern, cross-platform mobile application built with Vue.js, Ionic Framework, and Supabase that connects landlords and tenants for seamless property management, communication, and tenancy workflows.

![Vue.js](https://img.shields.io/badge/Vue.js-3.3-4FC08D?logo=vue.js&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic-8.0-3880FF?logo=ionic&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.91-3ECF8E?logo=supabase&logoColor=white)

## ✨ Features

### For Landlords
- 📊 **Dashboard** - Personalized welcome banner with property statistics
- 🏘️ **Property Management** - Add, edit, and delete property listings
- 📸 **Drag & Drop Image Upload** - Upload multiple property images with ease
- 🔗 **Property Sharing** - Generate shareable public links for properties
- 📋 **Application Management** - Review and manage tenant applications
- ✅ **Application Status Tracking** - Approve, review, or reject applications
- 💬 **Direct Messaging** - Chat with potential and current tenants
- 📄 **Document Management** - Securely share and manage documents
- ✍️ **E-Signatures** - Sign lease agreements electronically

### For Tenants
- 🏡 **Property Discovery** - Swipeable cards to browse available properties
- 📝 **Apply to Properties** - Comprehensive application form with document upload
- 💼 **Employment & Reference Info** - Provide detailed application information
- 💬 **Inquire Directly** - Message landlords about properties
- 📱 **Public Property View** - View shared property links without login
- 📄 **Document Upload** - Submit required documents securely
- ✍️ **E-Signature** - Sign documents electronically

## 🚀 Tech Stack

- **Frontend**: Vue.js 3 (Composition API)
- **UI Framework**: Ionic Framework 8
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Native Bridge**: Capacitor.js
- **Language**: TypeScript
- **Build Tool**: Vite

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/esteban572/tenantly.git
   cd tenantly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**
   
   Run the SQL scripts in your Supabase SQL Editor:
   ```bash
   # First, run the initial schema
   supabase_schema.sql
   
   # Then, run the updates for new features
   supabase_schema_updates.sql
   ```

5. **Create Supabase Storage Buckets**
   
   In your Supabase Dashboard → Storage, create:
   - `property-images` (Public bucket)
   - `documents` (Private bucket)
   
   Then run the storage policies from `supabase_schema_updates.sql`

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Mobile Development

### iOS
```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync
npx cap open ios
```

### Android
```bash
npm install @capacitor/android
npx cap add android
npx cap sync
npx cap open android
```

## 🗂️ Project Structure

```
tenantly/
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   ├── WelcomeBanner.vue
│   │   │   ├── ImageUploader.vue
│   │   │   ├── DocumentUploader.vue
│   │   │   ├── SignatureCanvas.vue
│   │   │   └── DocumentSigningModal.vue
│   │   └── tenant/
│   │       └── PropertyCard.vue
│   ├── views/
│   │   ├── auth/
│   │   │   ├── Login.vue
│   │   │   └── Signup.vue
│   │   ├── landlord/
│   │   │   ├── Dashboard.vue
│   │   │   ├── PropertyModal.vue
│   │   │   ├── Applications.vue
│   │   │   └── ApplicationDetail.vue
│   │   ├── tenant/
│   │   │   ├── Dashboard.vue
│   │   │   └── ApplicationForm.vue
│   │   └── shared/
│   │       ├── MessagesList.vue
│   │       ├── ChatDetail.vue
│   │       └── PublicPropertyView.vue
│   ├── router/
│   │   └── index.ts
│   ├── services/
│   │   └── supabaseClient.ts
│   └── theme/
│       ├── tailwind.css
│       └── variables.css
├── supabase_schema.sql
├── supabase_schema_updates.sql
└── package.json
```

## 🔐 Security Features

- **Row Level Security (RLS)** - All database tables protected with RLS policies
- **Authentication** - Supabase Auth with email/password
- **Role-Based Access** - Separate landlord and tenant permissions
- **Secure Storage** - Private document storage with access control
- **E-Signature Verification** - IP address and timestamp tracking

## 🎨 Key Components

### WelcomeBanner
Personalized greeting with dynamic statistics and time-based messages.

### ImageUploader
Drag-and-drop interface for uploading multiple property images with preview.

### DocumentUploader
Secure document upload with categorization (ID, Financial, Reference, Lease, Other).

### SignatureCanvas
Canvas-based signature capture with undo/clear functionality and verification.

### ApplicationForm
Comprehensive tenant application form with personal, employment, and reference information.

## 🛣️ Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/login` | User login | No |
| `/signup` | User registration | No |
| `/tenant/dashboard` | Tenant home | Yes (Tenant) |
| `/landlord/dashboard` | Landlord home | Yes (Landlord) |
| `/property/:id/public` | Public property view | No |
| `/property/:id/apply` | Application form | No |
| `/landlord/applications` | Applications list | Yes (Landlord) |
| `/landlord/applications/:id` | Application details | Yes (Landlord) |
| `/messages` | Messages list | Yes |
| `/messages/:id` | Chat detail | Yes |

## 📊 Database Schema

### Tables
- **profiles** - User profiles with role (landlord/tenant)
- **properties** - Property listings with images
- **applications** - Tenant applications with status tracking
- **documents** - Secure document storage metadata
- **signatures** - E-signature records with verification
- **messages** - Direct messaging between users
- **tenancies** - Active tenancy records
- **maintenance_requests** - Maintenance ticket system

## 🧪 Testing

```bash
# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint
```

## 🚀 Deployment

### Vercel
```bash
npm run build
# Deploy dist folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist folder to Netlify
```

### Mobile App Stores
Build native apps using Capacitor and deploy to App Store / Play Store.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Esteban Ibarra**
- GitHub: [@esteban572](https://github.com/esteban572)

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/)
- [Ionic Framework](https://ionicframework.com/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Capacitor](https://capacitorjs.com/)

## 📧 Support

For support, email esteban572@example.com or open an issue in the repository.

---

Made with ❤️ using Vue.js, Ionic, and Supabase
