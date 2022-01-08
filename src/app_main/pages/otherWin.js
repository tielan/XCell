import path from "path";
import logo from "../logo";
import {  BrowserWindow } from "electron";
import LocConfig from "../config";

export default (govhall) => (keyName,_url,_config) => {
  if (govhall[keyName]) {
    govhall[keyName].show();
    govhall[keyName].focus();
    return govhall[keyName];
  }
  const $win = new BrowserWindow({
    title: "app",
    width: 340,
    skipTaskbar: true, //不显示再任务栏
    height: 500,
    useContentSize: true,
    resizable: false,
    menu: false,
    modal: process.platform !== "darwin",
    show: false,
    icon: logo,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
      webviewTag: true,
      preload: path.join(__static, "./preload/mainWin.js"),
    },
    ..._config
  });

  $win.on("ready-to-show", () => {
    $win.show();
    $win.focus();
  });

  $win.on("close", (e) => {
    e.preventDefault();
    $win.hide();
  });

  // 加载URL地址
  $win.loadURL(LocConfig.transformUrl(_url));
  return $win;
};
