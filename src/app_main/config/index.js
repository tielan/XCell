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
}

LocConfig.init();
export default LocConfig;
