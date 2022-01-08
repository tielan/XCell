import path from "path";
import logo from "../logo";
import { screen, BrowserWindow, ipcMain } from "electron";

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
  });

  $win.webContents.on("dom-ready", () => {
    console.log('dom-ready')
    setTimeout(() => {
      $win.webContents.send("dom-ready", { url: _url });
    }, 500);
  });
  /**
   * 窗体关闭事件处理
   * 默认只会隐藏窗口
   */
  $win.on("close", (e) => {
    e.preventDefault();
    $win.hide();
  });
  $win.loadURL("http://127.0.0.1/1.pdf");
  return $win;
};
