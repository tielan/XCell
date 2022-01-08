import path from "path";
import { screen } from "electron";
export default path.join(__static, "icons/icon.png");

/**
 * 没有消息时的托盘图标
 */
export function getNoMessageTrayIcon() {
  if (process.platform === "darwin") {
    return path.join(__static, "icons/16x16.png");
  } else if (process.platform === "win32") {
    return path.join(__static, "icons/64x64.png");
  } else if (screen.getPrimaryDisplay().scaleFactor > 1) {
    return path.join(__static, "icons/64x64.png");
  } else {
    return path.join(__static, "icons/24x24.png");
  }
}

/**
 * 有消息时的托盘图标
 */
export function getMessageTrayIcon() {
  if (process.platform === "darwin") {
    return path.join(__static, "icons/16x16.png");
  } else if (process.platform === "win32") {
    return path.join(__static, "icons/64x64.png");
  } else if (screen.getPrimaryDisplay().scaleFactor > 1) {
    return path.join(__static, "icons/64x64.png");
  } else {
    return path.join(__static, "icons/24x24.png");
  }
}
