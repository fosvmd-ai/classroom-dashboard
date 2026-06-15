const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow;
let server;
let currentPort = 8080;

// 1. 내장 초경량 정적 HTTP 웹 서버 기동 (동적 포트 바인딩 및 재시도 지원)
function startLocalServer(callback) {
  const portsToTry = [8080, 8088, 8081, 0];
  let portIndex = 0;

  function tryListen() {
    const port = portsToTry[portIndex];
    const tempServer = http.createServer((req, res) => {
      // 안전한 경로 디코드 및 기본 파일 처리
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/') urlPath = '/index.html';
      
      const filePath = path.join(__dirname, urlPath);
      const extname = String(path.extname(filePath)).toLowerCase();
      
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };

      const contentType = mimeTypes[extname] || 'application/octet-stream';

      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('파일을 찾을 수 없습니다.');
          } else {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('서버 오류: ' + error.code);
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    tempServer.on('error', (err) => {
      if ((err.code === 'EADDRINUSE' || err.code === 'EACCES') && portIndex < portsToTry.length - 1) {
        console.log(`Port ${port} is unavailable (${err.code}). Trying next port...`);
        portIndex++;
        tryListen();
      } else {
        console.error('Local server error:', err.message);
      }
    });

    tempServer.listen(port, '127.0.0.1', () => {
      server = tempServer;
      currentPort = server.address().port;
      console.log(`Local web server running on http://127.0.0.1:${currentPort}`);
      callback(currentPort);
    });
  }

  tryListen();
}

// 2. 일렉트론 브라우저 창 생성
function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "학급 신용점수 대시보드",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 메뉴 막대 제거 (깔끔한 데스크톱 화면)
  mainWindow.setMenuBarVisibility(false);

  // 로컬 서버 주소 로드
  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 3. 앱 라이프사이클 핸들링
app.whenReady().then(() => {
  startLocalServer((port) => {
    createWindow(port);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(currentPort);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (server) {
    server.close();
  }
});

// 4. IPC 통신 처리 (Always-on-top 등)
ipcMain.on('set-always-on-top', (event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag);
    console.log(`Always-on-top set to: ${flag}`);
  }
});
