import path from "path";
import logo from "../logo";
import { screen, BrowserWindow, ipcMain } from "electron";
import LocConfig from "../config";
export default (govhall) => (_url) => {
  if (govhall.$mainWin) {
    govhall.showMainWin();
    return;
  }
  // 创建浏览器窗口
  const $win = new BrowserWindow({
    title: "GovHall",
    width: screen.getPrimaryDisplay().bounds.width-1,//解决不透明 为黑背景bug
    height: screen.getPrimaryDisplay().bounds.height,
    show: false,
    icon: logo,
    frame:false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
      webviewTag: true,
      preload: path.join(__static, "./preload/mainWin.js"),
    },
    ...LocConfig.getMainConfig(),
  });

  /**
   * 优雅的显示窗口
   */
  $win.once("ready-to-show", () => {
    $win.show();
    const { width, height } = screen.getPrimaryDisplay().bounds;
    $win.setPosition(0, 0);
    $win.setResizable(false);
    $win.setMovable(false)
    $win.setSize(width, height);
    //基层强制置顶 功能
    if(LocConfig.getMainConfig() && LocConfig.getDeviceConfig()["mustMoveTop"]){
      $win.setAlwaysOnTop(true, "screen-saver", Number.MAX_SAFE_INTEGER);
      setInterval(() => {
        try {
          $win.focus();
        } catch (error) {
          console.log(error);
        }
      }, 10000);
      $win.moveTop();
    }
  });

  $win.webContents.on("dom-ready", () => {
    setTimeout(() => {
      govhall.initWatchDir();
    }, 500);
  });

  ipcMain.on("launch-ocx", (event,url) => {
    govhall.launchOCX(url);
  });

  /**
   * 窗体关闭事件处理
   * 默认只会隐藏窗口
   */
  $win.on("close", (e) => {
    e.preventDefault();
    $win.hide();
  });

  ipcMain.on("MAINWIN:window-minimize", () => $win.minimize());

  ipcMain.on("MAINWIN:window-maximization", () => {
    if ($win.isMaximized()) {
      $win.unmaximize();
    } else {
      $win.maximize();
    }
  });

  ipcMain.on("MAINWIN:window-close", () => $win.hide());
  ipcMain.on("MAINWIN:window-show", () => {
    $win.show();
    $win.focus();
  });
  // 加载URL地址
  const URL =
    process.env.NODE_ENV === "development"
      ? `http://localhost:8080/index.html#/splash?link=${encodeURIComponent(_url)}`
      : `app://./index.html#/splash?link=${encodeURIComponent(_url)}`;
  $win.loadURL(URL);
  return $win;
};
