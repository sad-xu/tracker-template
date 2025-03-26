import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/styles/global.scss';
import Tracker from '@/utils/tracker.js';

const app = createApp(App);

app.use(router);

// 埋点
const IS_DEV = process.env.NODE_ENV !== 'production';

const tracker = new Tracker({
  pageNumLimit: 5,
  actionNumLimit: 5,
  showHotSpots: IS_DEV,
  baseURL: '/api/batch', // () => `${IS_DEV ? '' : '/'}api/point/batch?token=${localStorage.getItem('token')}`
  directiveType: 'click',
  logToData: (logList) =>
    JSON.stringify({
      burying_id: 1,
      point_list: logList,
    }),
});
tracker.init({ app, router });
// Vue.prototype.$tracker = tracker;
if (IS_DEV) {
  // @ts-ignore
  window.tracker = tracker;
}

app.mount('#app');
