/* 使用示例

  // 初始化
  let tracker = new Tracker({
    pageNumLimit: 5,
    actionNumLimit: 5,
    showHotSpots: IS_DEV,
    baseURL: () => `${IS_DEV ? '' : '/'}api/point/batch?token=${localStorage.getItem('token')}`,
    directiveType: 'click',
    logToData: logList => (JSON.stringify({
      burying_id: 1,
      point_list: logList
    }))
  })
  tracker.init({
    Vue,
    router
  })
  Vue.prototype.$tracker = tracker

  // 报错收集
  Vue.config.errorHandler = (err, vm, info) => {
    tracker.addErrorLog(err, info)
  }
  window.addEventListener('error', e => {})
  window.addEventLisener('unhandledrejection', e => {})

  // 声明式
  v-log

  // 命令式
  this.$tracker.addLog({ k: v })
*/

class Tracker {
  constructor({
    pageNumLimit = 5,
    actionNumLimit = 5,
    showHotSpots = false,
    // 请求地址 String | Function
    baseURL = '/',
    // v-log 触发事件
    directiveType = 'click',
    // 构造待发送数据
    logToData = (logList) => JSON.stringify({ d: logList }),
  } = {}) {
    this.version = '1.0';
    this.showHotSpots = showHotSpots;
    this.pageNumLimit = pageNumLimit;
    this.actionNumLimit = actionNumLimit;
    this.baseURL = baseURL;
    this.directiveType = directiveType;
    this.logToData = logToData;
    /**
     * 当前页面记录
     * from to start end duration
     * actions: [{ time, type, id, extra }]
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
    const directiveType = this.directiveType;
    Vue.directive('log', {
      bind: (el, binding) => {
        const handleClick = function () {
          that.addLog(binding.value, directiveType);
        };
        el.addEventListener(directiveType, handleClick);
        el.removeClickEvent = function () {
          this.removeEventListener(directiveType, handleClick);
        };
        if (that.showHotSpots) {
          el.style.boxShadow = 'inset 0px 0px 3px 2px #15d6ba';
        }
      },
      unbind: (el) => {
        el.removeClickEvent();
      },
    });
  }

  // 获取请求地址
  getBaseURL() {
    return this.baseURL instanceof Function ? this.baseURL() : this.baseURL;
  }

  // 获取当前时间
  getTime() {
    return Math.round(Date.now() / 1000);
  }

  // // 获取设备信息
  // getDeviceInfo() {
  //   let navigator = window.navigator
  //   return {
  //     userAgent: navigator.userAgent,
  //     networkType: navigator.confirmWebWideTrackingException.effectiveType,
  //     pixelRatio: window.devicePixelRatio,
  //     width: document.documentElement.clientWidth,
  //     height: document.documentElement.clientHeight
  //   }
  // }

  // beacon 兼容
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

  // 手动增加记录
  addLog(extra, type = 'manual') {
    this.log.actions.push({
      time: this.getTime(),
      type,
      extra: typeof extra === 'object' ? JSON.stringify(extra) : extra,
    });
  }

  // 切换路由
  enterNewPage(from, to) {
    const now = this.getTime();
    if (this.log) {
      const log = this.log;
      log.end = now;
      log.duration = now - log.start - log.duration;
      this.logList.push(log);
    }
    this.log = {
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

  // 报错信息
  // addErrLog(err, extra) {
  //   let errLog = {
  //     type: 'error',
  //     time: this.getTime(),
  //     msg: err.stack.toString(),
  //     extra: extra
  //   }
  //   ...
  // }

  // 发送日志
  sendLog(logList) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.getBaseURL());
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(this.logToData(logList));
  }
}

export default Tracker;
