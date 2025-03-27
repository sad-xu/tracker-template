import axios from 'axios';

const url = '/api';

axios.interceptors.response.use(
  (res) => res.data,
  (error) => Promise.reject(error)
);

/** test */
export function test() {
  return axios.get(`${url}/test`);
}

/** 获取日志 */
export function getLogList(type = '') {
  return axios.get(`${url}/getLogList`, {
    params: {
      type,
    },
  });
}

// /** 获取本地文件目录 */
// export function getDirList() {
//   return axios.get(`${url}/getDirList`);
// }

// /** 打开本地文件目录 */
// export function openLocalDir(dirPath) {
//   return axios.post(`${url}/openLocalDir`, {
//     dirPath: dirPath,
//   });
// }

// /** 生成向量库 */
// export function generateFaissLib() {
//   return axios.get(`${url}/generateFaissLib`);
// }

// /** 执行模型推理 */
// export function runModel(data) {
//   return axios.post(`${url}/runModel`, data);
// }

// /** 上传图片 */
// export function uploadImg(file) {
//   const formData = new FormData();
//   formData.append('img', file);
//   return axios.post(`${url}/uploadImg`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// }

// /** 获取识别结果 */
// export function getModelOutput() {
//   return axios.get(`${url}/modelOutput`)
// }
