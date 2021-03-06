import path from "path";
import fs from "fs";
import logo from "../logo";
import contextMenu from "../utils/contextMenu";
import { app, BrowserWindow, ipcMain } from "electron";

export default (xapp) => () => {
  if (xapp.$aboutWin) {
    xapp.$aboutWin.show();
    xapp.$aboutWin.focus();
    return xapp.$aboutWin;
  }
  const $win = new BrowserWindow({
    title: "关于",
    width: 720,
    height: 370,
    useContentSize: true,
    menu: false,
    modal: process.platform !== "darwin",
    show: false,
    //kiosk:true,//全屏模式
    icon: logo,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__static, "./preload/mainWin.js"),
    },
  });

  $win.on("ready-to-show", () => {
    $win.show();
    $win.focus();
  });

  // 窗口关闭后手动让$window为null
  $win.on("closed", () => {
    xapp.$aboutWin = null;
  });

  // 右键上下文菜单
  $win.webContents.on("context-menu", (e, params) => {
    e.preventDefault();
    contextMenu($win, params);
  });

  // 加载URL地址
  const URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/index.html#/about"
      : `app://./index.html#/about`;
  $win.loadURL(URL);
  return $win;
};
