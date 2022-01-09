import System from "./system";
import XLSXManger from "../XlsxManger";
const { ipcMain } = require("electron");

export function register(xapp) {
  new System(xapp).register();
  //文件保存
  ipcMain.handle("uploadFile", (event, { byteArray }) => {
    return new Promise((resolve, reject) => {
      let data = XLSXManger.handlerFile(byteArray);
      resolve(data);
    });
  });

  ipcMain.handle("downloadXlsx", (event, { json }) => {
    return new Promise((resolve, reject) => {
      let data = XLSXManger.downloadXlsx(json);
      resolve(data);
    });
  });

  ipcMain.handle("downloadDoc", (event, { json }) => {
    return new Promise((resolve, reject) => {
      let data = XLSXManger.downloadDoc(json);
      resolve(data);
    });
  });
}
