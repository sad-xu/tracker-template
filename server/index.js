const express = require('express');
const route = require('./route');
const path = require('path');
const process = require('process');
const { exec } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dirName = process.cwd();

app.use('/img', express.static(path.resolve(dirName, '../product_dataset')))

app.use('/api', route);

app.use('/', express.static(path.resolve(dirName, 'dist')))

const port = 3000;
app.listen(port, () => {
  console.log(`🤡 http://localhost:${port}🤡`);
  exec(`start http://localhost:${port}`)
});
