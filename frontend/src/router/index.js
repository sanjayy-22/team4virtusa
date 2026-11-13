import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

const routes = [
  {
    path: '/',
    redirect: () => {
      const auth = useAuthStore();
      if (!auth.isAuthenticated.value) return '/login';
      return '/admin/users';
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin/users',
    name: 'UsersManagement',
    component: () => import('../views/UsersManagementView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'users:read',
      title: 'User Management'
    }
  },
  {
    path: '/admin/roles',
    name: 'RolesPermissions',
    component: () => import('../views/RolesPermissionsView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'roles:read',
      title: 'Roles & Permissions'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // If token exists but user not loaded, wait for init
  if (auth.token.value && !auth.user.value) {
    await auth.initAuth();
  }

  // Set document title
  document.title = to.meta.title ? `${to.meta.title} | RBAC Portal` : 'Secure RBAC Portal';

  // 1. Guest-only pages (e.g. login)
  if (to.meta.guestOnly && auth.isAuthenticated.value) {
    return next('/admin/users');
  }

  // 2. Protected routes requiring authentication
  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated.value) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }

    // 3. Role verification
    if (to.meta.roles && !to.meta.roles.includes(auth.user.value.role)) {
      return next('/login');
    }

    // 4. Permission verification
    if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
      return next('/login');
    }
  }

  next();
});

export default router;
