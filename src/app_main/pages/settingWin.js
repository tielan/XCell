import fs from "fs";
import path from "path";
import logo from "../logo";
import { app, BrowserWindow, ipcMain } from "electron";

export default (govhall) => () => {
  if (govhall.$settingWin) {
    govhall.$settingWin.show();
    govhall.$settingWin.focus();
    return govhall.$settingWin;
  }
  const $win = new BrowserWindow({
    title: "设置",
    width: 340,
    height: 500,
    useContentSize: true,
    resizable: false,
    menu: false,
    modal: process.platform !== "darwin",
    show: false,
    icon: logo,
    webPreferences: {
      preload: path.join(__static, "./preload/mainWin.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  $win.on("ready-to-show", () => {
    $win.show();
    $win.focus();
  });

  // 窗口关闭后手动让$window为null
  $win.on("closed", () => {
    govhall.$settingWin = null;
  });

  $win.webContents.on("dom-ready", () => {
    setTimeout(() => {
      $win.webContents.send("dom-ready", govhall.setting);
    }, 500);
  });

  ipcMain.on("SETTINGWIN:setting",(e, setting) => {
    govhall.setting = setting;
    govhall.writeSetting();
    govhall.hideSettingWin();
  });

  // 加载URL地址
  const URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/index.html#/setting"
      : `app://./index.html#/setting`;
  $win.loadURL(URL);
  return $win;
};
