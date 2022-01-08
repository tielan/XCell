import System from "./system";
import FileIPC from "./file";
import LocConfig from "../../config";
const { ipcMain } = require("electron");
const packageJSON = require("../../../../package.json");

export function register(govhall) {
  new System(govhall).register();
  new FileIPC(govhall).register();

  //获取配置列表
  ipcMain.on("loadConfig", (event, arg) => {
    if (arg) {
      event.returnValue = LocConfig.get(arg);
    } else {
      event.returnValue = LocConfig.get();
    }
  });
  //获取版本
  ipcMain.on("getPackageJson", (event, arg) => {
    event.returnValue = packageJSON;
  });
  //配置同步
  ipcMain.on("localStorage-setItem-sync", (event, arg) => {
    event.sender.send("localStorage-setItem", {
      key: "govhall_setting",
      value: JSON.stringify(govhall.setting),
    });
  });
}
