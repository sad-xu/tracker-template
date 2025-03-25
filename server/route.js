const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { exec, spawn } = require('child_process');

const router = express.Router();
const dirName = process.cwd();

const uploadDir = path.join(dirName, '../product_dataset/test');
const uploadImgName = 'upload.jpg';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, uploadImgName);
  },
});

const upload = multer({ storage: storage });

router.get('/test', async (req, res, next) => {
  try {
    return res.json({
      code: 200,
      data: 'test',
    });
  } catch (err) {
    next(err);
  }
});

/** 获取文件夹列表 */
router.get('/getDirList', async (req, res, next) => {
  try {
    const dirPath = path.join(dirName, '../product_dataset/gallery');
    const dirList = fs
      .readdirSync(dirPath)
      .map((fileName) => path.join(dirPath, fileName))
      .filter((filePath) => fs.statSync(filePath).isDirectory());
    return res.json({
      code: 200,
      data: dirList,
    });
  } catch (err) {
    next(err);
  }
});

/** 打开本地文件目录 */
router.post('/openLocalDir', async (req, res, next) => {
  try {
    const dirPath = req.body.dirPath;
    exec(`explorer /root,"${dirPath}"`, (error, stdout, stderr) => {
      if (error) {
        return res.json({
          code: 500,
          data: error.message,
        });
      }
      if (stderr) {
        return res.json({
          code: 500,
          data: stderr,
        });
      }
      return res.json({
        code: 200,
        data: 'ok',
      });
    });
  } catch (err) {
    next(err);
  }
});

/** 生成label.txt */
const generateLabelTxt =  () => {
  const files = [];
  const p = path.join(dirName, '../product_dataset/gallery')
  const dirs = fs.readdirSync(p);
  dirs.forEach(dir => {
    const itemPath = `${p}/${dir}`;
    const dirStat = fs.statSync(itemPath);
    if (dirStat.isDirectory()) {
      let children = fs.readdirSync(itemPath)
      if (children) {
        children.forEach(child => {
          const childStat = fs.statSync(`${itemPath}/${child}`);
          if (childStat.isFile) {
            files.push([dir, child])
          }
        })
      }
    }
  });
  let content = '';
  files.forEach(item => {
    content += `${item[0]}/${item[1]}\t${item[0]}\r\n`
  })
  fs.writeFileSync(path.join(dirName, '../product_dataset/label.txt'), content); 
  return files;
}

/** 生成索引库 */
router.get('/generateFaissLib', async (req, res, next) => {
  try {
    generateLabelTxt();

    const productDatasetDir = path.join(dirName, '../product_dataset');
    const pythonExePath = path.join(dirName, '../python310/python.exe');
    const scriptPath = path.join(productDatasetDir, './generate_gallery.py');
    const process = spawn(pythonExePath, [scriptPath], { cwd: productDatasetDir });

    let log = ''
    process.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      log = `stderr: ${data}`;
    });

    process.on('close', (code) => {
      if (code == 0) {
        return res.json({
          code: 200,
          data: code,
        });
      } else {
        return res.json({
          code: 500,
          data: log,
        });
      }
    });

    process.on('error', (err) => {
      console.error(`Failed to start process: ${err.message}`);
      return res.json({
        code: 500,
        data: err.message,
      });
    });
  } catch (err) {
    next(err);
  }
});

/** 获取上传图片，保存到本地 */
router.post('/uploadImg', upload.single('img'), async (req, res, next) => {
  try {
    let file = req.file;
    return res.json({
      code: 200,
      data: file.path,
    });
  } catch (err) {
    next(err);
  }
});

/** 模型推理 */
router.post('/runModel', async (req, res, next) => {
  try {
    const {
      max_det_results = 50,
      threshold = 0.3
    } = req.body;
    const productDatasetDir = path.join(dirName, '../product_dataset');
    const pythonExePath = path.join(dirName, '../python310/python.exe');
    const scriptPath = path.join(productDatasetDir, './predict_system.py');
    const configPath = path.join(productDatasetDir, './inference_general_test.yaml');

    const process =  spawn(pythonExePath, [
      scriptPath, '-c', configPath, 
      '-o', `Global.max_det_results=${max_det_results}`,
      '-o', `Global.threshold=${threshold}`
    ], { cwd: productDatasetDir });

    let log = ''
    process.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      log = `stderr: ${data}`;
    });

    process.on('close', (code) => {
      if (code == 0) {
        return res.json({
          code: 200,
          data: code,
        });
      } else {
        return res.json({
          code: 500,
          data: log,
        });
      }
    });

    process.on('error', (err) => {
      console.error(`Failed to start process: ${err.message}`);
      return res.json({
        code: 500,
        data: err.message,
      });
    });
  } catch (err) {
    next(err);
  }
});

/** 获取推理结果 */
router.get('/modelOutput', async (req, res, next) => {
  try {
    const data = fs.readFileSync(path.join(dirName, '../product_dataset/output/list.txt'), 'utf8');
    return res.json({
      code: 200,
      data: data,
    });
  } catch (err) {
    next(err);
  }
})

module.exports = router;
