import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  linkActiveClass: 'active-route',
  history: createWebHistory('/tracker'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
    },
    // 性能数据
    {
      path: '/performance',
      name: 'performance',
      component: () => import('@/views/home/performance.vue'),
    },
    // 页面+动作数据
    {
      path: '/page',
      name: 'page',
      component: () => import('@/views/home/page.vue'),
    },
    // 报错数据
    {
      path: '/error',
      name: 'error',
      component: () => import('@/views/home/error.vue'),
    },
    // 模拟
    {
      path: '/mock',
      name: 'mock',
      component: () => import('@/views/mock/index.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
