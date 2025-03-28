/* 使用示例

  // 初始化
  let tracker = new Tracker({
    pageNumLimit: 5,
    actionNumLimit: 5,
    showHotSpots: IS_DEV,
    baseURL: 'xxx/api/log',
  })
  tracker.init({
    Vue: app,
    router
  })

  // 添加到全局变量
  Vue.prototype.$tracker = tracker; // Vue2
  app.provide('$tracker', tracker); // Vue3

  // 声明式
  v-log

  // 命令式
  this.$tracker.addActionLog({ k: v }) // Vue2
  inject('$tracker').addActionLog(); // Vue3
*/

class Tracker {
  constructor({
    appId = 0,
    pageNumLimit = 5,
    actionNumLimit = 5,
    showHotSpots = false,
    // 请求地址
    baseURL = '/',
  } = {}) {
    this.appId = appId;
    this.version = '1.0';
    this.showHotSpots = showHotSpots;
    this.pageNumLimit = pageNumLimit;
    this.actionNumLimit = actionNumLimit;
    this.baseURL = baseURL;
    /**
     * 当前页面记录
     * from to start end duration
     * actions: [{ time,  extra }]
     */
    this.log = null;
    // 所有未发送记录
    this.logList = [];
    // 暂停时刻
    this.pauseTime = null;
  }

  init({ Vue, router } = {}) {
    const that = this;
    // 页面关闭前
    window.addEventListener(
      'beforeunload',
      () => {
        const log = this.log;
        log.end = Date.now();
        log.duration = log.end - log.start - log.duration;
        this.logList.push(log);
        this.sendBeacon(this.logList);
      },
      false
    );
    // 可见性
    window.addEventListener('visibilitychange', () => {
      const state = document.visibilityState;
      if (state === 'hidden') {
        this.pauseTime = Date.now();
      } else if (state === 'visible') {
        // fix: 页面在后台初始化时，pauseTime = 0，最终发送时duration为负数
        this.log && (this.log.duration += this.pauseTime ? Date.now() - this.pauseTime : 0);
      }
    });
    // router
    router.beforeEach((to, from, next) => {
      this.enterNewPage(from, to);
      next();
    });
    // Vue directive
    Vue.directive('log', {
      mounted: (el, binding) => {
        const handleClick = function () {
          that.addActionLog(binding.value);
        };
        el.addEventListener('click', handleClick);
        el.removeClickEvent = function () {
          this.removeEventListener('click', handleClick);
        };
        if (that.showHotSpots) {
          el.style.boxShadow = 'inset 0px 0px 3px 2px #15d6ba';
        }
      },
      beforeUnmount: (el) => {
        el.removeClickEvent();
      },
    });
    // 性能
    this.getPerformance();
    // 报错收集
    Vue.config.errorHandler = (err, vm, info) => {
      this.addErrLog(err, info);
    };
    window.addEventListener('error', (e) => {
      this.addErrLog(e);
    });
    window.addEventListener('unhandledrejection', (e) => {
      this.addErrLog(e);
    });
  }

  /** 发送日志 beacon 兼容 */
  sendBeacon(log) {
    // TODO：数据过大不使用beacon
    if ('sendBeacon' in window.navigator) {
      window.navigator.sendBeacon(this.baseURL, JSON.stringify(log));
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.baseURL, false);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Content-type', 'application/json');
      try {
        xhr.send(log);
      } catch (err) {
        console.log(err);
      }
    }
  }

  /** 通用信息 */
  getCommonInfo() {
    return {
      appId: this.appId,
      time: Date.now(),
    };
  }

  /** 获取设备信息 */
  getDeviceInfo() {
    const navigator = window.navigator;
    return {
      userAgent: navigator.userAgent,
      pixelRatio: window.devicePixelRatio,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
  }

  /** 获取性能指标 */
  getPerformance() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(entries);
      const pLog = {
        type: 'performance',
        lcp: lastEntry.renderTime || lastEntry.loadTime,
        ...this.getCommonInfo(),
        ...this.getDeviceInfo(),
      };
      this.sendBeacon([pLog]);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }

  /** 切换路由 */
  enterNewPage(from, to) {
    const now = Date.now();
    if (this.log) {
      const log = this.log;
      log.end = now;
      log.duration = now - log.start - log.duration;
      this.logList.push(log);
    }
    this.log = {
      type: 'page',
      appId: this.appId,
      from: from.fullPath,
      to: to.fullPath,
      start: now,
      end: null,
      duration: 0,
      actions: [],
    };
    if (
      this.logList.length >= this.pageNumLimit ||
      this.logList.reduce((acc, item) => acc + item.actions.length, 0) >= this.actionNumLimit
    ) {
      const logList = this.logList;
      this.logList = [];
      this.sendBeacon(logList);
    }
  }

  /** 报错信息 */
  addErrLog(e, extra = '') {
    const errLog = {
      type: 'error',
      errType: 'unknown',
      msg: '',
      stack: '',
      extra: extra,
      ...this.getCommonInfo(),
    };

    if (e instanceof Error) {
      const { message, stack } = e;
      errLog.errType = 'code';
      errLog.msg = message;
      errLog.stack = stack;
    } else if (e instanceof PromiseRejectionEvent) {
      errLog.errType = 'reject';
      const reason = e.reason;
      if (reason instanceof Error) {
        errLog.msg = reason.message;
        errLog.stack = reason.stack;
      } else {
        errLog.msg = reason;
      }
    } else if (e?.message) {
      errLog.msg = e.message;
    } else if (typeof e === 'string') {
      errLog.msg = e;
    }
    this.sendBeacon([errLog]);
  }

  /** 手动增加记录 */
  addActionLog(info) {
    this.log.actions.push({
      ...this.getCommonInfo(),
      info: typeof info === 'object' ? JSON.stringify(info) : info,
    });
  }
}

export default Tracker;
