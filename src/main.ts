import { createApp } from 'vue';
// import ArcoVue from '@arco-design/web-vue';
import App from './App.vue';
import router from './router';
import Tracker from '@/utils/tracker.js';
// import '@arco-design/web-vue/dist/arco.css';
import '@/styles/global.scss';

const app = createApp(App);

// 埋点
const IS_DEV = process.env.NODE_ENV !== 'production';

const tracker = new Tracker({
  pageNumLimit: 2,
  actionNumLimit: 5,
  showHotSpots: IS_DEV,
  baseURL: 'http://localhost:3000/api/batch', // () => `${IS_DEV ? '' : '/'}api/point/batch?token=${localStorage.getItem('token')}`
});
tracker.init({ Vue: app, router });
// Vue.prototype.$tracker = tracker;

if (IS_DEV) {
  // @ts-ignore
  window.tracker = tracker;
}

app.use(router);
// app.use(ArcoVue);
app.mount('#app');
