/** 是否是触摸设备 手机|平板 */
export const isTouchDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  window.navigator.userAgent
);

/** 是否是iOS */
export const isIOS = window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

/** 日期格式化 */
export const dateFormat = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleString();
};

export default null;
