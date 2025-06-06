import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Tracker from '@/utils/tracker.js';
import '@/styles/global.scss';

const app = createApp(App);

// 埋点
const IS_DEV = process.env.NODE_ENV !== 'production';

const tracker = new Tracker({
  appId: 'Kayou.ywzs.app',
  pageNumLimit: 2,
  actionNumLimit: 5,
  showHotSpots: true, // IS_DEV,
  baseURL: '/api/log', // () => `${IS_DEV ? '' : '/'}api/point/batch`
  // baseURL: 'https://logcenter.kayou110.cn/api/applogs',
});
tracker.init({ Vue: app, router });
app.provide('$tracker', tracker);

if (IS_DEV) {
  // @ts-ignore
  window.tracker = tracker;
}

app.use(router);
app.mount('#app');
