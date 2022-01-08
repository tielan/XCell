const Store = require("electron-store");
const defaultsConfig = {  appVersion: "2.0.0" };
const store = new Store({ defaults: { config: defaultsConfig } });
let config;

class LocConfig {
  static init() {
    config = store.get("config");
    LocConfig.saveLoc();
  }
  static get(key) {
    if (key) {
      return config[key];
    } else {
      return config;
    }
  }

  static set(key, value) {
    config[key] = value;
    LocConfig.saveLoc();
  }

  static setAll(obj) {
    config = Object.assign({}, config, obj);
    LocConfig.saveLoc();
  }

  static saveLoc() {
    store.set("config", config);
  }

  //获取主屏链接
  static getMianPageUrl() {
    const { deviceType, devices } = config;
    let item = devices.find((item) => item.type == deviceType);
    if (item && item["page"]) {
      return LocConfig.transformUrl(item["page"]);
    } else {
      return "";
    }
  }
  static getDeviceConfig() {
    const { deviceType, devices } = config;
    let item = devices.find((item) => item.type == deviceType);
    if (item) {
      return item;
    } else {
      return {};
    }
  }

  static getMainConfig() {
    const { deviceType, devices } = config;
    let item = devices.find((item) => item.type == deviceType);
    if (item && item["mainConfig"]) {
      return item["mainConfig"];
    } else {
      return {};
    }
  }
}

LocConfig.init();
export default LocConfig;
