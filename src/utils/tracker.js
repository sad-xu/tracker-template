/* eslint-disable func-names, class-methods-use-this */

/* 使用示例

  // 初始化
  new Tracker({
    appId: 'Kayou.ywzs.admin',
    version: '1.0.0',
    env: 'DEV',
    limitNum: 5,
    showHotSpots: IS_DEV,
    baseURL: 'xxx/api/log',
  })

  tracker.init({
    Vue: app,
    router
  })

  // 设置userId

  // 声明式
  v-log

  // 命令式
  tracker.addActionLog({ k: v })
*/

class Tracker {
  constructor({
    appId = 'Kayou.test',
    version = '1.0.0',
    env = 'DEV',
    limitNum = 10,
    showHotSpots = false,
    baseURL = '/',
  } = {}) {
    /** 应用标识 */
    this.appId = appId;
    /** 版本号 */
    this.version = version;
    /** 环境标识 */
    this.env = env;
    /** 是否显示高亮 */
    this.showHotSpots = showHotSpots;
    /** 日志数量阈值，超过立即上报 */
    this.limitNum = limitNum;
    /** 日志接口地址 */
    this.baseURL = baseURL;
    /** 待发送日志 */
    this.logList = [];
    /** 会话id */
    this.sessionId = `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
    /** 用户信息 */
    this.userId = 0;
    this.userName = '';
  }

  /** 初始化 */
  init({ Vue, router } = {}) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      // 页面关闭前
      window.addEventListener('beforeunload', () => this.sendLogs(), false);
      // 页面切到后台
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.sendLogs();
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
          function handleClick() {
            that.addActionLog(binding.value);
          }
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
        this.addErrLog(err, '', info);
      };
      window.addEventListener('error', (err) => {
        if (err.message?.includes('Unexpected token')) {
          // 资源加载异常
          window.location.reload();
          return;
        }
        this.addErrLog(err);
      });
      window.addEventListener('unhandledrejection', (err) => {
        this.addErrLog(err);
      });
      return this;
    } catch (e) {
      console.log(e);
      return this;
    }
  }

  /** 通用信息 */
  getCommonInfo() {
    return {
      app: this.appId,
      version: this.version,
      env: this.env,
      createdOn: +Date.now(),
      userId: this.userId,
      userName: this.userName,
      sessionId: this.sessionId,
    };
  }

  /** 获取性能指标+设备信息 */
  getPerformance() {
    try {
      if (PerformanceObserver.supportedEntryTypes?.some((v) => v === 'largest-contentful-paint')) {
        let flag = false;
        new PerformanceObserver((entryList) => {
          if (flag) return;
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.pushLog({
            ...this.getCommonInfo(),
            message: 'performance',
            type: 'performance',
            level: 'Info',
            lcp: lastEntry.renderTime || lastEntry.loadTime,
            userAgent: navigator.userAgent,
            pixelRatio: window.devicePixelRatio,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
          });
          flag = true;
        }).observe({
          entryTypes: ['largest-contentful-paint'],
        });
      } else {
        this.pushLog({
          ...this.getCommonInfo(),
          message: 'performance',
          type: 'performance',
          level: 'Info',
          userAgent: navigator.userAgent,
          pixelRatio: window.devicePixelRatio,
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        });
      }
    } catch (e) {
      console.log(e);
      // 保底收集设备信息
      this.pushLog({
        ...this.getCommonInfo(),
        message: 'performance',
        type: 'performance',
        level: 'Info',
        lcpErr: `${e}`?.slice(0, 500),
        userAgent: navigator.userAgent,
        pixelRatio: window.devicePixelRatio,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    }
  }

  /** 切换路由 */
  enterNewPage(from, to) {
    try {
      // 离开
      this.pushLog({
        ...this.getCommonInfo(),
        logCategory: 'Page',
        type: 'leave',
        level: 'Info',
        message: from.fullPath,
      });
      // 进入
      this.pushLog({
        ...this.getCommonInfo(),
        logCategory: 'Page',
        type: 'enter',
        level: 'Info',
        message: to.fullPath,
      });
    } catch (e) {
      console.log(e);
    }
  }

  /** 生成traceId */
  generateTraceId() {
    const randomStr = [...Array(16)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
    return `${randomStr}:${randomStr}:0000000000000000:1`;
  }

  /** 请求记录 */
  addApiLog(response) {
    try {
      const request = response.config;
      const kayouTraceId = request.headers['kayou-trace-id'];
      const traceMap = {};

      if (kayouTraceId) {
        const list = kayouTraceId.split(':');
        traceMap.traceId = list[0];
        traceMap.spanId = list[1];
        traceMap.parentSpanId = list[2];
      }
      const content =
        typeof request.data === 'string' ? request.data : JSON.stringify(request.data);
      const duration = +new Date() - request.startTime;
      const statusCode = response.status;
      this.pushLog({
        ...this.getCommonInfo(),
        ...traceMap,
        logCategory: 'HttpClient',
        type: 'api',
        level: 'Info',
        message: `${request.method}-${request.url}-${statusCode}-${duration}ms`,
        content: content?.slice(0, 500),
        requestSize: content?.length || 0,
        responseSize: response?.request?.responseText?.length || 0,
        duration,
        statusCode,
        httpMethod: request.method,
        httpPath: request.url,
        logSession: response.headers['kayou-log-session'],
      });
    } catch (e) {
      console.log(e);
    }
  }

  /** 报错信息 */
  addErrLog(e, prefix = '', extra = '') {
    try {
      console.log(e);
      const errLog = {
        ...this.getCommonInfo(),
        type: 'error',
        errType: 'unknown',
        message: '',
        stack: '',
        level: 'Error',
      };
      if (e instanceof Error) {
        const { message, stack } = e;
        errLog.errType = 'code';
        errLog.message = message;
        errLog.stack = stack;
      } else if (e instanceof PromiseRejectionEvent) {
        errLog.errType = 'reject';
        const reason = e.reason;
        if (reason instanceof Error) {
          errLog.message = reason.message;
          errLog.stack = reason.stack;
          // 异常url
          if (reason?.request?.responseURL) {
            errLog.message += `-${reason?.request?.responseURL}`;
          }
        } else {
          errLog.message = reason;
        }
      } else if (e?.message) {
        errLog.message = e.message;
      } else if (typeof e === 'string') {
        errLog.message = e;
      }
      if (extra) {
        errLog.message += `-${extra}`;
      }
      // 特定错误处理
      if (errLog.message.includes('ResizeObserver')) {
        return;
      }
      if (errLog.message === '无权限') {
        errLog.level = 'Warn';
      }
      if (errLog.message instanceof Object) {
        errLog.message = JSON.stringify(errLog.message);
      }
      errLog.message = (prefix + errLog.message).slice(0, 500);
      errLog.stack = errLog.stack.slice(0, 500);
      this.pushLog(errLog);
    } catch (err) {
      console.log(err);
    }
  }

  /** 发送日志 beacon 兼容 */
  sendLogs() {
    try {
      if (!this.logList.length) return;
      const logData = this.logList.map((log) => JSON.stringify(log)).join('\n');
      if ('sendBeacon' in window.navigator) {
        window.navigator.sendBeacon(`${this.baseURL}?kayou_logs_token=Da4Yg8moJGlQ4Blq`, logData);
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.baseURL, false);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.setRequestHeader('kayou-logs-token', 'Da4Yg8moJGlQ4Blq');
        xhr.send(logData);
      }
      this.logList = [];
    } catch (e) {
      console.log(e);
    }
  }

  /** 手动增加记录 */
  addActionLog(info) {
    try {
      this.pushLog({
        ...this.getCommonInfo(),
        type: 'action',
        level: 'Info',
        message: typeof info === 'object' ? JSON.stringify(info) : info,
      });
    } catch (e) {
      console.log(e);
    }
  }

  /** 推入日志，统一发送 */
  pushLog(log) {
    try {
      this.logList.push(log);
      if (this.logList.length >= this.limitNum) {
        this.sendLogs();
      }
    } catch (e) {
      console.log(e);
    }
  }
}

export default new Tracker({
  appId: 'Kayou.ywzs.admin',
  // eslint-disable-next-line no-undef
  version: '1.0.1',
  env: 'DEV',
  limitNum: 10,
  showHotSpots: process.env.NODE_ENV !== 'production',
  baseURL: 'https://abcxxx.com/api/applogs',
});
