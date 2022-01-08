import path from "path";
import { screen, BrowserWindow } from "electron";
import * as ContextUtls from "../utils/ContextUtils";

export default (govhall) => (_url) => {
  let externalDisplay = ContextUtls.externalDisplay();
  if (!externalDisplay) {
    return;
  }
  if (govhall.$externalWin) {
    govhall.showExternalWin();
    return;
  }
  // 创建浏览器窗口
  const $win = new BrowserWindow({
    skipTaskbar: true, //不显示再任务栏
    fullscreen: true,
    x: externalDisplay.bounds.x,
    y: externalDisplay.bounds.y,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
      webviewTag: true,
      preload: path.join(__static, "./preload/mainWin.js"),
    },
  });
  $win.setAlwaysOnTop(true);
  /**
   * 窗体关闭事件处理
   * 默认只会隐藏窗口
   */
  $win.on("close", (e) => {
    e.preventDefault();
    $win.hide();
  });
  //当扩展屏 为评价器的时候
  $win.onCmdAction = function(cmdData) {
    if (cmdData && cmdData.cmdCode) {
      console.log(cmdData)
      $win.webContents.send("dom-ready", { url: _url, cmdData });
      return { status: 0 };
    } else {
      return { status: 1, message: "命令格式不正确" };
    }
  };

  $win.reShow = function() {
    let externalDisplay = ContextUtls.externalDisplay();
    $win.setPosition(externalDisplay.bounds.x, externalDisplay.bounds.y);
    $win.show();
  };
  // 加载URL地址
  const URL =
    process.env.NODE_ENV === "development"
      ? `http://localhost:8080/index.html#/splash?link=${encodeURIComponent(_url)}`
      : `app://./index.html#/splash?link=${encodeURIComponent(_url)}`;
  $win.loadURL(URL);
  return $win;
};
