import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import tracker from '@/utils/tracker.js';
import '@/styles/global.scss';

const app = createApp(App);

// 埋点
const IS_DEV = process.env.NODE_ENV !== 'production';

app.provide(
  '$tracker',
  tracker.init({
    Vue: app,
    router,
  })
);

if (IS_DEV) {
  // @ts-ignore
  window.tracker = tracker;
}

app.use(router);
app.mount('#app');
