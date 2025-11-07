/** 获取cookie */
export function getCookie(name) {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

/** 设置cookie */
export function setCookie(name, value, expires) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires.toUTCString()}; path=/`;
}

/** 删除cookie */
export function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/** 灰度标识 */
export const KAYOUCTX_NAMESPACE = 'kayouctx-namespace';

/** 当前环境 */
export const currentEnv = getCookie(KAYOUCTX_NAMESPACE);
