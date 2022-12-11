const fs = require('fs');
const cors = require('cors');
const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();

app.use(cors());
app.use(router);
app.use(express.static(path.resolve(process.cwd(), './static')));

const port = 10086;
const LATEST_VERSION = '1.0.1';

router.get('/check-update', (req, res) => {
  const { version, name } = req.query;
  const appVersion = getVersionNumber(version);
  const latestVersion = getVersionNumber(LATEST_VERSION);
  const data = {
    latestVersion: LATEST_VERSION,
    name,
    haveUpdate: false,
  }
  if (appVersion < latestVersion) {
    data.haveUpdate = true;
    data.wgtUrl = `http://${getIPAdress()}:${port}/wgt/${name}_${LATEST_VERSION}.wgt`
  }
  res.json(data);
});

router.get('/wgt/:wgtName', (req, res) => {
  const { wgtName } = req.params;
  const wgtFilePath = path.resolve(process.cwd(), `./static/wgts/${wgtName}`);
  res.set({
    'Content-Disposition': wgtName
  });
  const fileBuffer = fs.readFileSync(wgtFilePath);
  res.send(fileBuffer);
});

// 获取版本编号
function getVersionNumber(version = '') {
  return parseInt(version.replace(/\./g, ''));
}

// 获取 IP
function getIPAdress() {
  const interfaces = require('os').networkInterfaces()
  for (const devName in interfaces) {
    const iface = interfaces[devName]
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i]
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address
      }
    }
  }
}

app.listen(port, () => {
  console.log(`%cServer start http://${getIPAdress()}:${port}`, 'color:blue');
});
