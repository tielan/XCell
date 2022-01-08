import { Tray, Menu } from "electron";
import child_process from "child_process";
import * as ContextUtls from "../utils/ContextUtils";

import LocConfig from "../config";
import { getMessageTrayIcon, getNoMessageTrayIcon } from "../logo";

export default class AppTray {
  constructor(xapp) {
    // 图标闪烁定时
    this._flickerTimer = null;
    // 图标文件
    this.messageTrayIcon = getMessageTrayIcon();
    this.noMessageTrayIcon = getNoMessageTrayIcon();

    this._govhall = xapp;
    // 生成托盘图标及其菜单项实例
    this.$tray = new Tray(this.noMessageTrayIcon);
    // 设置鼠标悬浮时的标题
    this.$tray.setToolTip("xapp");
    this.$trayCollect = [];
    this.initEvent();
    this.setMenu();
  }

  /**
   * 初始化事件
   */
  initEvent() {
    this.$tray.on("click", () => this._govhall.showMainWin());
    this.$tray.on("double-click", () => this._govhall.showMainWin());
  }
  /**
   * 设置菜单
   */
  setMenu() {
    const menu = [];
    menu.push({
      label: "系统设置",
      click: () => this._govhall.showSettingWin(),
    });
    menu.push({ type: "separator" });
    menu.push({
      label: "关于",
      click: () => this._govhall.showAboutWin(),
    });
    menu.push({
      label: "退出",
      click: () => this._govhall.quit(),
    });
    this.$tray.setContextMenu(Menu.buildFromTemplate(menu));
  }

  /**
   * 控制图标是否闪烁
   * @param {Boolean} is
   */
  flicker(is) {
    const { enableFlicker } = this._govhall.setting;
    if (is) {
      let icon = this.messageTrayIcon;
      if (enableFlicker) {
        // 防止连续调用多次，导致图标切换时间间隔不是1000ms
        if (this._flickerTimer !== null) return;
        this._flickerTimer = setInterval(() => {
          this.$tray.setImage(icon);
          icon =
            icon === this.messageTrayIcon
              ? this.noMessageTrayIcon
              : this.messageTrayIcon;
        }, 1000);
      } else {
        this.$tray.setImage(icon);
      }
    } else {
      clearInterval(this._flickerTimer);
      this._flickerTimer = null;
      this.$tray.setImage(this.noMessageTrayIcon);
    }
  }

  /**
   * 判断托盘是否销毁
   */
  isDestroyed() {
    return this.$tray.isDestroyed();
  }

  /**
   * 销毁托盘图标
   */
  destroy() {
    return this.$tray.destroy();
  }
}
