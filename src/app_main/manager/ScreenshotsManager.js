import Screenshots from "electron-screenshots";
import * as Api from "../api";
export default class ScreenshotsManager {
  constructor() {
    this.$screenshots = new Screenshots();
  }
  //启动截图
  startCapture() {
    this.$screenshots.startCapture();
  }
  //启动截图并返回数据
  startCaptrueSend() {
    return new Promise((resolve, reject) => {
      function onOk(e, data) {
        if (data.dataURL) {
          let base64 = data.dataURL.split(",")[1];
          resolve(base64);
        }
      }
      this.$screenshots.once("ok", onOk);
      function onCancel() {
        reject({ message: "取消截屏" });
      }
      this.$screenshots.once("cancel", onCancel);
      function onSave() {
        reject({ message: "本地保存" });
      }
      this.$screenshots.once("save", onSave);
      this.startCapture();
    });
  }
  postImg(base64) {
    return new Promise((resolve, reject) => {
      Api.uploadFileByBase64({ base64 })
        .then((result) => {
          resolve(result);
        })
        .catch((e) => {
          console.log(e);
          reject({ msg: "上传异常" });
        });
    });
  }
}
