import path from "path";
import logo from "../logo";
import { BrowserWindow, ipcMain } from "electron";
export default (xapp) => () => {
  if (xapp.$mainWin) {
    xapp.showMainWin();
    return;
  }
  // 创建浏览器窗口
  const $win = new BrowserWindow({
    title: "XCellApp",
    width: 760,//解决不透明 为黑背景bug
    height: 900,
    show: false,
    icon: logo,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
      webviewTag: true,
      preload: path.join(__static, "./preload/mainWin.js"),
    },
  });

  /**
   * 优雅的显示窗口
   */
  $win.once("ready-to-show", () => {
    $win.show();
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
      ? `http://localhost:8080/index.html`
      : `app://./index.html`;
  $win.loadURL(URL);
  return $win;
};
