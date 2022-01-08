import { globalShortcut } from "electron";
import LocConfig from "../config";
import * as Manager from "../server/manager";

export default (govhall) => () => {
  const actions = {
    "screenshots-capture": () => {
      Manager.startCaptrue(govhall);
    },
    "call-capture": () => {
      let device = LocConfig.getDeviceConfig();
      const callPage = LocConfig.get("callPage");
      govhall.showOtherWin("callPage", callPage, device["callConfig"]);
    },
  };
  const keymap = govhall.setting.keymap;
  // 注销所有的快捷键
  globalShortcut.unregisterAll();
  Object.keys(actions).forEach((key) => {
    if (keymap[key] && keymap[key].length) {
      globalShortcut.register(keymap[key].join("+"), actions[key]);
    }
  });
};
