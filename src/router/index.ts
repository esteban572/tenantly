import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/views/auth/Welcome.vue')
  },
  {
    path: '/login',
    redirect: '/'
  },
  {
    path: '/signup',
    redirect: '/'
  },
  {
    path: '/onboarding',
    component: () => import('@/views/auth/OnboardingFlow.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id',
    component: () => import('@/views/shared/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/edit',
    component: () => import('@/views/shared/ProfileEditView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/landlords',
    component: () => import('@/views/tenant/LandlordDirectory.vue'),
    meta: { requiresAuth: true, role: 'tenant' }
  },
  {
    path: '/tenant/dashboard',
    component: () => import('@/views/tenant/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'tenant' }
  },
  {
    path: '/tenant/properties',
    component: () => import('@/views/tenant/PropertyFeed.vue'),
    meta: { requiresAuth: true, role: 'tenant' }
  },
  {
    path: '/tenant/applications',
    component: () => import('@/views/tenant/MyApplications.vue'),
    meta: { requiresAuth: true, role: 'tenant' }
  },
  {
    path: '/explore',
    component: () => import('@/views/tenant/PropertyExplorer.vue'),
    meta: { requiresAuth: true, role: 'tenant' }
  },
  {
    path: '/property/:id',
    component: () => import('@/views/shared/PropertyDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tenant/maintenance',
    component: () => import('@/views/tenant/MaintenanceList.vue'),
    meta: { requiresAuth: true, role: 'tenant' }
  },
  {
    path: '/tenant/maintenance/new',
    component: () => import('@/views/tenant/MaintenanceRequestForm.vue'),
    meta: { requiresAuth: true, role: 'tenant' }
  },
  {
    path: '/landlord',
    component: () => import('@/views/landlord/LandlordTabs.vue'),
    children: [
      {
        path: '',
        redirect: '/landlord/dashboard'
      },
      {
        path: 'dashboard',
        component: () => import('@/views/landlord/Dashboard.vue'),
        meta: { requiresAuth: true, role: 'landlord' }
      },
      {
        path: 'properties',
        component: () => import('@/views/landlord/Properties.vue'),
        meta: { requiresAuth: true, role: 'landlord' }
      },
      {
        path: 'maintenance',
        component: () => import('@/views/landlord/Maintenance.vue'),
        meta: { requiresAuth: true, role: 'landlord' }
      },
      {
        path: 'applications',
        component: () => import('@/views/landlord/Applications.vue'),
        meta: { requiresAuth: true, role: 'landlord' }
      }
    ]
  },
  {
    path: '/landlord/properties',
    component: () => import('@/views/landlord/MyProperties.vue'),
    meta: { requiresAuth: true, role: 'landlord' }
  },
  {
    path: '/landlord/properties/new',
    component: () => import('@/views/landlord/PropertyForm.vue'),
    meta: { requiresAuth: true, role: 'landlord' }
  },
  {
    path: '/landlord/properties/:id',
    component: () => import('@/views/landlord/LandlordPropertyDetail.vue'),
    meta: { requiresAuth: true, role: 'landlord' }
  },
  {
    path: '/landlord/properties/:id/edit',
    component: () => import('@/views/landlord/PropertyForm.vue'),
    meta: { requiresAuth: true, role: 'landlord' }
  },
  {
    path: '/landlord/maintenance',
    component: () => import('@/views/landlord/MaintenanceDashboard.vue'),
    meta: { requiresAuth: true, role: 'landlord' }
  },
  {
    path: '/landlord/maintenance/:id',
    component: () => import('@/views/landlord/MaintenanceTicketDetail.vue'),
    meta: { requiresAuth: true, role: 'landlord' }
  },
  {
    path: '/messages',
    component: () => import('@/views/shared/MessagesList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/messages/:id',
    component: () => import('@/views/shared/ChatDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/property/:id/public',
    component: () => import('@/views/shared/PublicPropertyView.vue')
  },
  {
    path: '/property/:id/apply',
    component: () => import('@/views/tenant/ApplicationForm.vue')
  },

  {
    path: '/landlord/applications/:id',
    component: () => import('@/views/landlord/ApplicationDetail.vue'),
    meta: { requiresAuth: true, role: 'landlord' }
  },
  {
    path: '/privacy',
    component: () => import('@/views/shared/PrivacyPolicy.vue')
  },
  {
    path: '/terms',
    component: () => import('@/views/shared/TermsOfService.vue')
  },
  {
    path: '/health',
    component: () => import('@/views/HealthCheck.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Ensure user is loaded (if not already done or in progress)
  if (authStore.loading) {
    await authStore.loadUser();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const session = authStore.user;
  const profile = authStore.profile;

  // Redirect to login if auth required but no session
  if (requiresAuth && !session) {
    next('/');
    return;
  }

  // If logged in and trying to access auth pages
  if (session && (to.path === '/' || to.path === '/login' || to.path === '/signup')) {
    // Check if onboarding is completed
    if (!profile?.onboarding_completed) {
      next('/onboarding');
      return;
    }

    // Redirect to dashboard based on role
    const role = profile?.role;
    if (role === 'landlord') {
      next('/landlord/dashboard');
      return;
    } else {
      next('/tenant/dashboard');
      return;
    }
  }

  // If logged in but onboarding not completed, redirect to onboarding
  if (session && profile && !profile.onboarding_completed && to.path !== '/onboarding') {
    next('/onboarding');
    return;
  }

  // Role-based access control
  const requiredRole = to.meta.role as string | undefined;
  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to appropriate dashboard if wrong role
    if (profile?.role === 'landlord') {
      next('/landlord/dashboard');
    } else {
      next('/tenant/dashboard');
    }
    return;
  }

  next();
});

export default router
