import { Tray, Menu } from "electron";
import child_process from "child_process";
import * as ContextUtls from "../utils/ContextUtils";

import LocConfig from "../config";
import { getMessageTrayIcon, getNoMessageTrayIcon } from "../logo";

export default class AppTray {
  constructor(govhall) {
    // 图标闪烁定时
    this._flickerTimer = null;
    // 图标文件
    this.messageTrayIcon = getMessageTrayIcon();
    this.noMessageTrayIcon = getNoMessageTrayIcon();

    this._govhall = govhall;
    // 生成托盘图标及其菜单项实例
    this.$tray = new Tray(this.noMessageTrayIcon);
    // 设置鼠标悬浮时的标题
    this.$tray.setToolTip("GovHall");
    this.$trayCollect = [];
    this.initEvent();
    this.initMenuMap();
    this.setMenu();
  }

  /**
   * 初始化事件
   */
  initEvent() {
    this.$tray.on("click", () => this._govhall.showMainWin());
    this.$tray.on("double-click", () => this._govhall.showMainWin());
  }
  initMenuMap() {
    let device = LocConfig.getDeviceConfig();
    const callPage = LocConfig.get("callPage");
    this.$trayCollect = [
      {
        label: "显示主窗口",
        click: () => this._govhall.showMainWin(),
      },
      {
        label: "显示副屏",
        click: () => this._govhall.showExternalWin(),
      },
      {
        label: "水牌设置",
        click: () => {
          this._govhall.showOtherWin(
            "infoPage",
            device["infoPage"],
            device["infoConfig"]
          );
        },
      },
      {
        label: "呼叫器",
        click: () => {
          this._govhall.showOtherWin(
            "callPage",
            callPage,
            device["callConfig"]
          );
        },
      },
      {
        label: "双屏",
        submenu: [
          {
            label: "扩展",
            type: "radio",
            checked: !!ContextUtls.externalDisplay(),
            click: () => {
              child_process.exec("displayswitch /extend");
              this.timer && clearTimeout(this.timer);
              this.timer = setTimeout(() => {
                this._govhall.initExternalWin();
              }, 5000);
            },
          },
          {
            label: "复制",
            type: "radio",
            checked: !ContextUtls.externalDisplay(),
            click: () => {
              this.timer && clearTimeout(this.timer);
              this._govhall.$externalWin && this._govhall.$externalWin.hide();
              child_process.exec("displayswitch /clone");
            },
          },
        ],
      },
    ];
  }
  /**
   * 设置菜单
   */
  setMenu() {
    let trayMenu = [];
    if (
      LocConfig.getDeviceConfig() &&
      LocConfig.getDeviceConfig()["trayMenu"]
    ) {
      trayMenu = LocConfig.getDeviceConfig()["trayMenu"];
    }
    let menuArr = [];
    trayMenu.map((_item) => {
      let m = this.$trayCollect.find((item) => _item.label == item.label);
      if (m) {
        menuArr.push(m);
      }
    });
    const menu = [...menuArr];
    menu.push({ type: "separator" });
    menu.push({
      label: "系统设置",
      click: () => this._govhall.showSettingWin(),
    });
    if (process.platform === "win32") {
      menu.push({
        label: "开机自启动",
        type: "checkbox",
        checked: this._govhall.setting["autoStart"],
        click: (event, value) => {
          this._govhall.registerLoginStart(event.checked);
        },
      });
    }
    menu.push({ type: "separator" });
    menu.push({
      label: "帮助",
      submenu: [
        {
          label: "开发模式",
          type: "checkbox",
          checked: false,
          click: (event, value) => {
            this._govhall.settingToDebug(event.checked);
          },
        },
        {
          label: "关于",
          click: () => this._govhall.showAboutWin(),
        },
      ],
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
