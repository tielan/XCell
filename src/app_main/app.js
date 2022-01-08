import { app, Menu, protocol, ipcMain, BrowserWindow, screen } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import path from "path";

import Notify from "./notify";
import mainWin from "./pages/mainWin";
import aboutWin from "./pages/aboutWin";
import settingWin from "./pages/settingWin";

import AppTray from "./tray/AppTray";
import LocConfig from "./config";
import * as IPC from "./manager/ipc";
const log = require("./utils/Logger");

const URLSCHEME = "app"; // 用户自定义 URL SCHEME
export default class GovHallApp {
  constructor() {
    // app对象是否ready
    this._ready = null;
    // 托盘图标
    this.$tray = null;
    // 主窗口
    this.$mainWin = null;
    // 关于窗口
    this.$aboutWin = null;
    // 默认配置
    this.setting = LocConfig.get();
    //本地服务
    this.$locServer = null;
    this.initLog();
    this.initAndBindSchame();
    this.init().then(() => {
      app.setAppUserModelId("com.chiancreator.xapp");
      // 移除窗口菜单
      Menu.setApplicationMenu(null);
      createProtocol(URLSCHEME);
      this.initMainWin();
      this.initTray();
      this.initNotify();
      this.initIPC();
    });
  }
  initLog() {
    log.info("xcellApp","start app");
    console.error = console.log = function() {
      log.info(...arguments);
    };
  }
  initAndBindSchame() {
    //1.0 单进程
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.exit(0);
      return;
    }

    //2.0 允许不安全的https
    app.commandLine.appendSwitch("--ignore-certificate-errors", "true");
    //允许跨域
    app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    app.allowRendererProcessReuse = true;
    //2.0 禁用硬件加速, 防止透明框黑边
    app.disableHardwareAcceleration();
    app.commandLine.appendSwitch("disable-gpu");
    app.commandLine.appendSwitch("disable-software-rasterizer");
    //3.0 注册私有协议
    protocol.registerSchemesAsPrivileged([
      { scheme: "app", privileges: { secure: true, standard: true } },
    ]);
    //3.1 设置调用协议
    app.removeAsDefaultProtocolClient(URLSCHEME);
    if (
      process.env.NODE_ENV === "development" &&
      process.platform === "win32"
    ) {
      app.setAsDefaultProtocolClient(URLSCHEME, process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    } else {
      app.setAsDefaultProtocolClient(URLSCHEME);
    }
  }
  /**
   * 初始化
   * @return {Promise} setting
   */
  async init() {
    // 重复打开应用就显示窗口
    app.on("second-instance", () => this.showMainWin());
    // 所有窗口关闭之后退出应用
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        if (this.$tray && !this.$tray.isDestroyed()) {
          this.$tray.destroy();
          this.$tray = null;
        }
        app.quit();
      }
    });
    return app.whenReady();
  }
  writeSetting() {
    LocConfig.setAll(this.setting);
  }


  /**
   * 初始化主窗口
   */
  initMainWin() {
    this.$mainWin = mainWin(this)();
  }

  /**
   * 初始化托盘图标
   */
  initTray() {
    this.$tray = new AppTray(this);
  }

  /**
   * 初始化消息提示
   */
  initNotify() {
    this.$notify = new Notify();
    ipcMain.on("notify", (e, body) => this.$notify.show(body));
    this.$notify.on("click", () => this.showMainWin());
  }

  initIPC() {
    IPC.register(this);
  }

  /**
   * 退出应用
   */
  quit() {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((item) => item.destroy());
    if (process.platform !== "darwin") {
      if (this.$tray && !this.$tray.isDestroyed()) {
        this.$tray.destroy();
        this.$tray = null;
      }
      app.quit();
    }
  }



  /**
   * 显示主窗口
   */
  showMainWin() {
    if (this.$mainWin) {
      if (this.$mainWin.isMinimized()) this.$mainWin.restore();
      this.$mainWin.show();
      this.$mainWin.focus();
    }
  }
  
  /**
   * 显示设置窗口
   */
  showSettingWin() {
    this.$settingWin = settingWin(this)();
  }
 

  resetTrayMenu() {
    if (this.$tray && !this.$tray.isDestroyed()) {
      this.$tray.setMenu();
    }
  }

  /**
   * 显示关于窗口
   */
  showAboutWin() {
    this.$aboutWin = aboutWin(this)();
  }

}
