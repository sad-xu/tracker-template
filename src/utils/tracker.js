/* 使用示例

  // 初始化
  let tracker = new Tracker({
    pageNumLimit: 5,
    actionNumLimit: 5,
    showHotSpots: IS_DEV,
    baseURL: () => `${IS_DEV ? '' : '/'}api/point/batch?token=${localStorage.getItem('token')}`,
  })
  tracker.init({
    Vue,
    router
  })

  // 声明式
  v-log

  // 命令式
  this.$tracker.addActionLog({ k: v })
*/

class Tracker {
  constructor({
    pageNumLimit = 5,
    actionNumLimit = 5,
    showHotSpots = false,
    // 请求地址 String | Function
    baseURL = '/',
  } = {}) {
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
    // sendBeacon 页面关闭前
    this.ployfillSendBeacon();
    window.addEventListener(
      'beforeunload',
      () => {
        const log = this.log;
        log.end = this.getTime();
        log.duration = log.end - log.start - log.duration;
        this.logList.push(log);
        window.navigator.sendBeacon(this.getBaseURL(), this.logToData(this.logList));
      },
      false
    );
    // 可见性
    window.addEventListener('visibilitychange', () => {
      const state = document.visibilityState;
      if (state === 'hidden') {
        this.pauseTime = this.getTime();
      } else if (state === 'visible') {
        // fix: 页面在后台初始化时，pauseTime = 0，最终发送时duration为负数
        this.log && (this.log.duration += this.pauseTime ? this.getTime() - this.pauseTime : 0);
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

  /** 构造待发送数据 */
  logToData(logList) {
    return JSON.stringify(logList);
  }

  /** 获取请求地址 */
  getBaseURL() {
    return this.baseURL instanceof Function ? this.baseURL() : this.baseURL;
  }

  /** 获取当前时间 */
  getTime() {
    return Math.round(Date.now() / 1000);
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
        time: this.getTime(),
        lcp: lastEntry.renderTime || lastEntry.loadTime,
        ...this.getDeviceInfo(),
      };
      this.sendLog(pLog);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }

  /** beacon 兼容 */
  ployfillSendBeacon() {
    const that = this;
    if ('sendBeacon' in window.navigator) return;
    window.navigator.sendBeacon = function (url, log) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, false);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Content-type', 'application/json');
      try {
        xhr.send(that.logToData(log));
      } catch (err) {
        console.log(err);
      }
    };
  }

  /** 手动增加记录 */
  addActionLog(info) {
    this.log.actions.push({
      time: this.getTime(),
      info: typeof info === 'object' ? JSON.stringify(info) : info,
    });
  }

  /** 切换路由 */
  enterNewPage(from, to) {
    const now = this.getTime();
    if (this.log) {
      const log = this.log;
      log.end = now;
      log.duration = now - log.start - log.duration;
      this.logList.push(log);
    }
    this.log = {
      type: 'page',
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
      this.sendLog(logList);
    }
  }

  /** 报错信息 */
  addErrLog(e, extra) {
    const errLog = {
      type: 'error',
      errType: 'unknown',
      time: this.getTime(),
      msg: '',
      stack: '',
      extra: extra,
    };

    if (e instanceof Error) {
      const { message, stack } = e;
      errLog.errType = 'code';
      errLog.msg = message;
      errLog.stack = stack;
    } else if (e instanceof PromiseRejectionEvent) {
      errLog.errType = 'reject';
      errLog.msg = e.reason;
    } else if (e?.message) {
      errLog.msg = e.message;
    } else if (typeof e === 'string') {
      errLog.msg = e;
    }
    this.sendLog([errLog]);
  }

  /** 发送日志 */
  sendLog(logList) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.getBaseURL());
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(this.logToData(logList));
  }
}

export default Tracker;
