const { ipcMain, app } = require("electron");
const shutdown = require("electron-shutdown-command");

class SystemAction {
  //重启事件
  static relaunch(govhall) {
    govhall.stopLocServer();
    app.relaunch(); // 重启
    app.exit(0);
  }

  //退出应用
  static appexit(govhall) {
    govhall.stopLocServer();
    app.quit();
  }

  //重启命令
  static reboot(govhall, { timerseconds }) {
    shutdown.reboot({
      force: true,
      timerseconds: timerseconds || 10,
      sudo: true,
      debug: false,
      quitapp: true,
    });
  }
  //关机命令
  static shutdown(govhall, { timerseconds }) {
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
  constructor(govhall) {
    this.$govhall = govhall;
  }
  register() {
    //重启事件
    ipcMain.on("relaunch", () => {
      SystemAction.relaunch(this.$govhall);
    });
    //退出应用
    ipcMain.on("appexit", () => {
      SystemAction.appexit(this.$govhall);
    });
    //关机命令
    ipcMain.on("shutdown", (event, timerseconds) => {
      SystemAction.shutdown(this.$govhall, { timerseconds });
    });
    //重启命令
    ipcMain.on("reboot", (event, timerseconds) => {
      SystemAction.reboot(this.$govhall, { timerseconds });
    });
  }
  action(action, params) {
    SystemAction[action] && SystemAction[action](this.$govhall, params);
  }
}
