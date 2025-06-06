const express = require('express');
const path = require('path');
const fs = require('fs');
const pkg = require('body-parser');
const coBody = require('co-body');

const app = express();
const { json, urlencoded } = pkg;

app.use(express.text());
app.use(json({ limit: '100mb' }));
app.use(
  urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 50000,
  })
);

app.all('*', function (res, req, next) {
  req.header('Access-Control-Allow-Origin', '*');
  req.header('Access-Control-Allow-Headers', 'Content-Type');
  req.header('Access-Control-Allow-Methods', '*');
  req.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

// 获取js.map源码文件
app.get('/api/getSourceMap', (req, res) => {
  const { fileName, env } = req.query;
  console.log('fileName', fileName);
  console.log('env', env);
  if (env === 'development') {
    const mapFile = path.join(__filename, '../sourcemap', fileName);
    console.log('mapFile-', mapFile);
    fs.readFile(mapFile, (err, data) => {
      if (err) {
        console.log(err);
        res.send('');
      } else {
        res.send(data);
      }
    });
  } else {
    // req.query 获取接口参数
    // const mapFile = path.join(__filename, '..', 'dist/assets');
    // // 拿到dist目录下对应map文件的路径
    // const mapPath = path.join(mapFile, `${fileName}.map`);
    // fs.readFile(mapPath, (err, data) => {
    //   if (err) {
    //     console.error('server-getmap', err);
    //     return;
    //   }
    //   res.send(data);
    // });
  }
});

/** 所有日志 */
let allLogList = [];

/** 获取日志列表 */
app.get('/api/getLogList', (req, res) => {
  const type = req.query.type;
  if (type) {
    res.send({
      code: 200,
      data: allLogList.filter((item) => item.type === type),
    });
  } else {
    res.send({
      code: 200,
      data: allLogList,
    });
  }
});

/** 接收日志 */
app.post('/api/log', async (req, res) => {
  try {
    console.log(req.body);
    let length = Object.keys(req.body).length;
    if (length) {
      // 数据量大时不会用 sendbeacon，用xhr的形式
      allLogList.unshift(...req.body);
    } else {
      // 兼容 sendbeacon 的传输数据格式
      const data = await coBody.json(req);
      if (!data) return;
      allLogList.unshift(...data);
    }
    res.send({
      code: 200,
      meaage: '上报成功！',
    });
  } catch (err) {
    res.send({
      code: 500,
      meaage: '上报失败！',
      err,
    });
  }
});

// 图片上传的方式
// app.get('/trackweb', async (req, res) => {
//   try {
//     let data = req.query.v;
//     if (!data) return;
//     data = JSON.parse(data);
//     allLogList.push(...data.eventInfo);
//     baseInfo = data.baseInfo;
//     res.send({
//       code: 200,
//       data: '上报成功',
//     });
//   } catch (err) {
//     res.send({
//       code: 203,
//       meaage: '上报失败！',
//       err,
//     });
//   }
// });

const port = 3000;
app.listen(port, () => {
  console.log(`🤡 http://localhost:${port}🤡`);
});
