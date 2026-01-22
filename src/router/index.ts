import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { supabase } from '@/services/supabaseClient';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/views/auth/Login.vue')
  },
  {
    path: '/signup',
    component: () => import('@/views/auth/Signup.vue')
  },
  {
    path: '/tenant/dashboard',
    component: () => import('@/views/tenant/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'tenant' }
  },
  {
    path: '/landlord/dashboard',
    component: () => import('@/views/landlord/Dashboard.vue'),
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
    path: '/landlord/applications',
    component: () => import('@/views/landlord/Applications.vue'),
    meta: { requiresAuth: true, role: 'landlord' }
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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !session) {
    next('/login');
    return;
  }

  if (session && (to.path === '/login' || to.path === '/signup')) {
    // Check role to redirect correctly if already logged in?
    // For simplicity, just let them stay or redirect to home? 
    // Let's redirect to a generic home or just let them be for now to avoid loops or complex checks without state.
    // Actually, let's fetch profile to know where to send them.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role === 'landlord') {
      next('/landlord/dashboard');
      return;
    } else {
      next('/tenant/dashboard');
      return;
    }
  }

  next();
});

export default router
