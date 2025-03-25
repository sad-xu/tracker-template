import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  linkActiveClass: 'active-route',
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
    },
    {
      path: '/manage',
      name: 'manage',
      component: () => import('@/views/manage/index.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
