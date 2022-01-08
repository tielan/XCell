const { ipcMain, app } = require("electron");
const shutdown = require("electron-shutdown-command");

class SystemAction {
  //重启事件
  static relaunch(xapp) {
    xapp.stopLocServer();
    app.relaunch(); // 重启
    app.exit(0);
  }

  //退出应用
  static appexit(xapp) {
    xapp.stopLocServer();
    app.quit();
  }

  //重启命令
  static reboot(xapp, { timerseconds }) {
    shutdown.reboot({
      force: true,
      timerseconds: timerseconds || 10,
      sudo: true,
      debug: false,
      quitapp: true,
    });
  }
  //关机命令
  static shutdown(xapp, { timerseconds }) {
    shutdown.shutdown({
      force: true,
      timerseconds: timerseconds || 10,
      sudo: true,
      debug: false,
      quitapp: true,
    });
  }
}
export default class SystemIPC {
  constructor(xapp) {
    this.$xapp = xapp;
  }
  register() {
    //重启事件
    ipcMain.on("relaunch", () => {
      SystemAction.relaunch(this.$xapp);
    });
    //退出应用
    ipcMain.on("appexit", () => {
      SystemAction.appexit(this.$xapp);
    });
    //关机命令
    ipcMain.on("shutdown", (event, timerseconds) => {
      SystemAction.shutdown(this.$xapp, { timerseconds });
    });
    //重启命令
    ipcMain.on("reboot", (event, timerseconds) => {
      SystemAction.reboot(this.$xapp, { timerseconds });
    });
  }
  action(action, params) {
    SystemAction[action] && SystemAction[action](this.$xapp, params);
  }
}
