const fs = require("fs");
const path = require("path");
const Store = require("electron-store");

const defaultsConfig = {
  keymap: {
    "screenshots-capture": ["Control", "Alt", "Q"],
    "call-capture": ["Control", "Q"],
  },
  deviceType: "-1",
  //  host: "172.18.191.22", //服务器地址
  port: 6001, // http 端口
  ports: 6002, // https端口
  localPort: 3002, //本地http端口
  clientNum: "",
  autoStart: true, //是否支持开机自启动
  appDebug: false,
  appVersion: "2.0.0",
  version: 1012, //配置版本号
  ...getLocConfig(),
};
const store = new Store({ defaults: { config: defaultsConfig } });
let config;

function getLocConfig() {
  let config = {};
  try {
    const data = fs.readFileSync(
      path.join(__static, "/static/app_config.json")
    );
    config = JSON.parse(data);
    console.log("app-config", config);
  } catch (error) {
    console.log(error);
  }
  return config;
}
class LocConfig {
  static init() {
    const devices = require("./devices");
    config = store.get("config");
    if (!config["devices"]) {
      config["devices"] = devices.default;
    }
    if (config.version != defaultsConfig.version) {
      config.keymap = defaultsConfig.keymap;
      config.version = defaultsConfig.version;
      config["devices"] = devices.default;
    }
    if (defaultsConfig.forceUpdate) {
      config = { ...config, ...getLocConfig() };
    }
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
  //获取扩展屏链接
  static getExternalPageUrl() {
    const { deviceType, devices } = config;
    let item = devices.find((item) => item.type == deviceType);
    if (item && item["extPage"]) {
      return LocConfig.transformUrl(item["extPage"]);
    } else {
      return "";
    }
  }

  static getDeviceType() {
    return config["deviceType"];
  }

  static getServerHost() {
    const { host, port } = config;
    if (host && port) {
      return "http://" + host + ":" + port;
    } else {
      return null;
    }
  }

  static getSServerHost() {
    const { host, ports } = config;
    if (host && ports) {
      return "https://" + host + ":" + ports;
    } else {
      return null;
    }
  }

  static getWSServerHost() {
    const { host, port } = config;
    if (host && port) {
      return "ws://" + host + ":" + port;
    } else {
      return null;
    }
  }

  static transformUrl(str) {
    let params = config;
    if (str) {
      if (str.indexOf("${time}") != -1) {
        str = str.replace("${time}", new Date().getTime());
      }
      if (params) {
        Object.keys(params).map((key) => {
          if (str.indexOf("${" + key + "}")  != -1) {
            str = str.replace("${" + key + "}", params[key] + "");
          }
        });
      }
    }
    return str;
  }
}

LocConfig.init();
export default LocConfig;
