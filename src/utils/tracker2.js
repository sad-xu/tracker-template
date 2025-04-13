/* 使用示例

  // 初始化
  let tracker = new Tracker({
    pageNumLimit: 5,
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
    showHotSpots = false,
    // 请求地址
    baseURL = '/',
  } = {}) {
    this.appId = appId;
    this.version = '1.0';
    this.showHotSpots = showHotSpots;
    this.pageNumLimit = pageNumLimit;
    this.baseURL = baseURL;
    // 所有未发送记录
    this.logList = [];
  }

  init({ Vue, router } = {}) {
    const that = this;
    // 页面关闭前 离开页面
    window.addEventListener(
      'beforeunload',
      () => {
        this.logList.push({});
        this.sendBeacon(this.logList);
      },
      false
    );
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
    window.addEventListener('error', (err) => {
      this.addErrLog(err);
    });
    window.addEventListener('unhandledrejection', (err) => {
      this.addErrLog(err);
    });
    // 已捕获的异步错误
    const originalCatch = Promise.prototype.catch;
    Promise.prototype.catch = function (onRejected) {
      return originalCatch.call(this, function (err) {
        that.addErrLog(err);
        if (typeof onRejected === 'function') {
          return onRejected(err);
        }
        throw err;
      });
    };
  }

  /** 发送日志 beacon 兼容 */
  sendBeacon(log) {
    console.log('发送数据：', log);
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
    let flag = false;
    new PerformanceObserver((entryList) => {
      if (flag) return;
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
      flag = true;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }

  /** 切换路由 */
  enterNewPage(from, to) {
    // 离开
    this.logList.push({
      ...this.getCommonInfo(),
      type: 'leave',
      page: from.fullPath,
    });
    // 进入
    this.logList.push({
      ...this.getCommonInfo(),
      type: 'enter',
      page: to.fullPath,
    });
    if (this.logList.length >= this.pageNumLimit) {
      const logList = this.logList;
      this.logList = [];
      this.sendBeacon(logList);
    }
  }

  /** 报错信息 */
  addErrLog(e, extra = '') {
    console.log('tracker:', e);
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
    this.logList.push({
      ...this.getCommonInfo(),
      type: 'action',
      info: typeof info === 'object' ? JSON.stringify(info) : info,
    });
    if (this.logList.length >= this.pageNumLimit) {
      const logList = this.logList;
      this.logList = [];
      this.sendBeacon(logList);
    }
  }
}

export default Tracker;
