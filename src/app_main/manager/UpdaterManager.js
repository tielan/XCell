const { autoUpdater } = require("electron-updater");

export default class UpdaterManager {
  /**
   * 构造函数
   * @param {String} checkUrl 更新地址
   */
  constructor(checkUrl) {
    this.url = checkUrl;
    console.log(checkUrl);
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    autoUpdater.setFeedURL(this.url);
    autoUpdater.autoDownload = true;
    autoUpdater.on("error", (error) => {
      console.log("error", error);
    });
    autoUpdater.on("update-downloaded", (info) => {
      console.log(`isUpdateNow`);
      autoUpdater.quitAndInstall();
    });
  }
  /**
   * 开始检测更新
   */
  checkForUpdates() {
    autoUpdater.checkForUpdates();
  }
}
