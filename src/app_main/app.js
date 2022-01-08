import { app, Menu, protocol, ipcMain, BrowserWindow, screen } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import macaddress from "macaddress";
import path from "path";
import LocServer from "./server/index";
import ScreenshotsManager from "./manager/ScreenshotsManager";
import UpdaterManager from "./manager/UpdaterManager";
import DirWatchManger from "./manager/DirWatchManger";

import WSClient from "./server/websocket";
import Notify from "./notify";
import mainWin from "./pages/mainWin";
import externalWin from "./pages/externalWin";
import aboutWin from "./pages/aboutWin";
import settingWin from "./pages/settingWin";
import otherWin from "./pages/otherWin";

import shortcut from "./shortcut";
import AppTray from "./tray/AppTray";
import * as Api from "./api";
import LocConfig from "./config";
import * as IPC from "./manager/ipc";
import * as ContextUtls from "./utils/ContextUtils";
import SystemIPC from "./manager/ipc/system";
import compressing from "compressing";
const exec = require("child_process").exec;
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
    //扩展窗口
    this.$externalWin = null;
    // 设置窗口
    this.$settingWin = null;
    // 关于窗口
    this.$aboutWin = null;
    // 截图对象
    this.$screenshots = null;

    this.$wsClient = null;
    //监听
    this.$dirWatchManager = null;
    // 默认配置
    this.setting = LocConfig.get();
    //本地服务
    this.$locServer = null;
    this.initLog();
    this.initAndBindSchame();
    this.init().then(() => {
      app.setAppUserModelId("com.chiancreator.govhall");
      // 移除窗口菜单
      Menu.setApplicationMenu(null);
      createProtocol(URLSCHEME);
      this.initLocalServer();
      this.initMainWin();
      this.initExternalWin();
      this.initTray();
      this.initScreenshots();
      this.initNotify();
      this.bindShortcut();
      this.initIPC();
      this.registerLoginStart();
      setTimeout(() => {
        this.appUpdate();
      }, 2000);
    });
  }
  initLog() {
    log.info("gov_hall","start app");
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
      // if (process.platform !== "darwin") {
      //   if (this.$tray && !this.$tray.isDestroyed()) {
      //     this.$tray.destroy();
      //     this.$tray = null;
      //   }
      //   app.quit();
      // }
    });
    return app.whenReady();
  }
  writeSetting() {
    LocConfig.setAll(this.setting);
  }
  //启动本地服务
  async initLocalServer() {
    let { clientNum, localPort, deviceType } = this.setting;
    //启动本地服务
    this.$locServer = new LocServer(this).listen(localPort);
    //未配置地址取消初始化
    if (!LocConfig.getWSServerHost() || deviceType == "-1") return;
    if (!clientNum) {
      let machineId = await macaddress.one();
      clientNum = await Api.doLogin2({ machineId });
      this.setting["clientNum"] = clientNum;
      this.writeSetting();
    }
    console.log('clientNum->',clientNum)
    //checkin 同步配置
    this.checkin();
    this.$wsClient = new WSClient(
      `${LocConfig.getWSServerHost()}/websocket/${clientNum}`,
      (msgObj) => {
        if (msgObj && "checkin" === msgObj.cmdCode) {
          this.checkin();
        } else {
          new SystemIPC(this).action(msgObj.cmdCode);
        }
      }
    );
  }
  //checkin 同步配置
  checkin() {
    let { clientNum } = this.setting;
    if (clientNum) {
      Api.checkin(clientNum).then((configRes) => {
        if (configRes.data) {
          this.setting = Object.assign({}, this.setting, configRes.data);
          this.writeSetting();
        }
      });
    }
  }

  /**
   * 初始化主窗口
   */
  initMainWin() {
    //未配置地址取消初始化
    if (!LocConfig.getServerHost() || !LocConfig.getMianPageUrl()) return;
    this.$mainWin = mainWin(this)(LocConfig.getMianPageUrl());
  }

  /**
   * 初始化扩展窗口
   */
  initExternalWin() {
    //未配置地址取消初始化
    if (!LocConfig.getServerHost() || !LocConfig.getExternalPageUrl()) return;
    if (ContextUtls.externalDisplay()) {
      if (this.$externalWin) {
        if (!this.$externalWin.isVisible()) {
          this.$externalWin.reShow();
        }
      } else {
        this.$externalWin = externalWin(this)(LocConfig.getExternalPageUrl());
      }
    } else {
      this.$externalWin && this.$externalWin.hide();
    }
  }

  /**
   * 初始化托盘图标
   */
  initTray() {
    this.$tray = new AppTray(this);
  }

  /**
   * 初始化截图
   */
  initScreenshots() {
    this.$screenshots = new ScreenshotsManager();
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
      exec("taskkill /im ocx.exe /f");
    }
  }

  /**
   * 绑定快捷键
   */
  bindShortcut() {
    shortcut(this)();
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
   * 显示副屏
   */
  showExternalWin() {
    console.log("showExternalWin");
    if (this.$externalWin) {
      if (this.$externalWin.isMinimized()) this.$externalWin.restore();
      this.$externalWin.show();
    }
  }

  /**
   * 截图
   */
  screenshotsCapture() {
    if (this.$screenshots) {
      this.$screenshots.startCapture();
    }
  }

  /**
   * 显示设置窗口
   */
  showSettingWin() {
    this.$settingWin = settingWin(this)();
    //this.$settingWin.webContents.openDevTools()
  }

  showOtherWin(keyName, _url, _config) {
    console.log(keyName + "----" + _url);
    this[keyName] = otherWin(this)(keyName, _url, _config);
  }

  /**
   * 关闭设置窗口
   */
  hideSettingWin() {
    if (this.$settingWin) {
      this.$settingWin.close();
    }
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

  //注册开机自启动
  registerLoginStart(autoStart = this.setting["autoStart"]) {
    console.log("autoStart->" + autoStart);
    this.setting["autoStart"] = autoStart;
    this.writeSetting();
    app.setLoginItemSettings({
      openAtLogin: autoStart,
      openAsHidden: false,
    });
  }

  /**
   * 显示debug模式
   */
  settingToDebug(value) {
    if (this.$mainWin) {
      if (value) {
        this.$mainWin.setResizable(true);
        this.$mainWin.setSize(900, 600);
        this.$mainWin.setMovable(true);
        this.$mainWin.webContents.openDevTools();
      } else {
        const { width, height } = screen.getPrimaryDisplay().bounds;
        this.$mainWin.setPosition(0, 0);
        this.$mainWin.setMovable(false);
        this.$mainWin.setResizable(false);
        this.$mainWin.setSize(width, height);
        this.$mainWin.webContents.closeDevTools();
      }
    }
  }
  initWatchDir() {
    //文件夹监控功能
    if (LocConfig.getMainConfig() && LocConfig.getDeviceConfig()["watchDir"]) {
      compressing.zip.uncompress(
        path.join(__static, "searchtable.zip"),
        path.join(__static, "m")
      );
      this.$dirWatchManager = new DirWatchManger(this);
      this.$dirWatchManager.watch(
        LocConfig.getDeviceConfig()["watchDir"],
        (files) => {
          this.$mainWin.webContents.send("dom-date-update", { data: files });
        }
      );
    }
  }
  /**
   * 更新app
   */
  appUpdate() {
    Api.appUpdate(this.setting["clientNum"]).then((res) => {
      if (res.code == 200 && res.data && res.data.apkfileurl) {
        new UpdaterManager(
          LocConfig.getServerHost() + res.data.apkfileurl
        ).checkForUpdates();
      }
    });
  }

  /**
   * ocx 启动
   */
  launchOCX(ocxUrl) {
    if (ocxUrl && process.platform === "win32") {
      exec("taskkill /im ocx.exe /f");
      setTimeout(function() {
        const cmd = path.join(__static, "/ocx.exe  ") + ocxUrl;
        console.log(cmd);
        exec(cmd);
      }, 1800);
    }
  }

  /**
   * 停止本地服务
   */
  stopLocServer() {
    this.$locServer && this.$locServer.stopServer();
  }
}
