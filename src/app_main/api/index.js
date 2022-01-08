import { postJson, getJson } from "./request";
import LocConfig from "../config";
const Type = {
  unkown: "-1", //未知
  AutoTermial: "0", //一体机
  OfferNumber: "1", //排队机
  EvaPad: "2", //评价器
  SimpleTable: "3", //样表机
  SearchTable: "4", //查询机
  VSearchTable: "5", //查询机竖屏
};

const Platform = {
  unkown: "-1", //未知
  Desktop: "0", //桌面
  Android: "1", //安卓
  iOS: "2", //苹果
  Web: "3", //web
};

/**
 * 设备登录 确认
 * @param {*} params
 * @param {*} callback
 */
function login({ machineId }) {
  return postJson(LocConfig.getServerHost() + "/api/device/login", {
    deviceType: LocConfig.getDeviceType() || Type.AutoTermial,
    deviceId: machineId,
    devicePlatform: Platform.Desktop,
  }).then(res=>res.data);
}
/**
 * 设备登录 确认
 * @param {*} params
 * @param {*} callback
 */
export function doLogin2({ machineId }) {
  return new Promise((resolve) => {
    doLogin({ machineId }, resolve);
  });
}
/**
 * 设备登录 确认
 * @param {*} params
 * @param {*} callback
 */
export function doLogin(params, callback) {
  login(params)
    .then((res) => {
      if (res && res.data  && res.data.id) {
        callback && callback(res.data.id + "");
      } else {
        setTimeout(() => {
          doLogin(params, callback);
        }, 10 * 1000);
      }
    })
    .catch((e) => {
      console.log("连接异常 --重试");
      setTimeout(() => {
        doLogin(params, callback);
      }, 5 * 1000);
    });
}

export function checkin(clientNum) {
  return getJson(LocConfig.getServerHost() + "/api/device/checkin?clientNum=" + clientNum).then(res=>res.data);
}
/**
 * 上传base64图片
 * @param {*} params
 * @param {*} callback
 */
export function uploadFileByBase64({ base64 }) {
  return postJson(
    LocConfig.getServerHost() + "/api/device/uploadFileByBase64",
    {
      base64,
    }
  ).then(res=>res.data);
}

/**
 * 检查更新
 * @param {*} params
 * @param {*} callback
 */
export function appUpdate(clientNum) {
  return getJson(
    LocConfig.getServerHost() + "/api/device/update?clientNum=" + clientNum
  ).then(res=>res.data);
}

/**
 * 消息推送
 */

export function pushMessage(params) {
  return postJson(LocConfig.getServerHost() + "/api/device/push", params).then(res=>res.data);
}
