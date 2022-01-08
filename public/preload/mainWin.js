(function(isElectron) {
  window.CNative || (window.CNative = new Object());
  if (!isElectron) return;
  var { ipcRenderer } = require("electron");
  //页面初始化
  function initPage() {
    ipcRenderer.on("localStorage-setItem", function(event, { key, value }) {
      localStorage.setItem(key, value);
    });
    this.timer && clearInterval(this.timer);
    this.timer = setInterval(() => {
      ipcRenderer.send("localStorage-setItem-sync");
    }, 3000);
  }
  function onDomReady(callbck) {
    ipcRenderer.on("dom-ready", function(event, args) {
      console.log("dom-ready", args);
      callbck && callbck(event, args);
    });
  }
  //磁盘文件发生改变
  function onDateUpdate(callbck) {
    ipcRenderer.on("dom-date-update", function(event, args) {
      console.log("dom-date-update", args);
      callbck && callbck(event, args);
    });
  }
  //保存设置
  function saveSetting(data) {
    ipcRenderer.send("SETTINGWIN:setting", data);
  }

  //app 重启
  function appRelaunch() {
    ipcRenderer.send("relaunch");
  }
  //启动OCX
  function launchOCX(url) {
    ipcRenderer.send("launch-ocx", url);
  }
  function loadConfig() {
    return ipcRenderer.sendSync("loadConfig", "sysConfig");
  }
  function getPackageJson() {
    return ipcRenderer.sendSync("getPackageJson");
  }
  /**
   * 打印文件内容
   * @returns
   */
  function printFileData({ fileData, ext, baseCode, fileName }) {
    return new Promise((resolve, reject) => {
      let _fileData = fileData;
      if (baseCode) {
        _fileData = baseCode;
      }

      let _ext = ext;
      if (fileName) {
        if (fileName.indexOf(".") != -1) {
          _ext = "." + fileName.split(".")[1];
        } else {
          _ext = "." + fileName;
        }
      }
      ipcRenderer
        .invoke("print_file_data", { fileData: _fileData, ext: _ext })
        .then((value) => {
          if (value.state == 0) {
            resolve(value.data);
          } else {
            reject(value.data);
          }
        });
    });
  }

  //打印文件
  function printFile({ filePath, ext }) {
    return new Promise((resolve, reject) => {
      ipcRenderer.invoke("print_file", { filePath, ext }).then((value) => {
        if (value.state == 0) {
          resolve(value.data);
        } else {
          reject(value.data);
        }
      });
    });
  }
  //获取打印机状态
  function getPrinters() {
    return new Promise((resolve, reject) => {
      ipcRenderer.invoke("getPrinters").then((list) => {
        resolve(list);
      });
    });
  }
  //获取文件返回base64
  function getFile(params) {
    return new Promise((resolve, reject) => {
      ipcRenderer.invoke("getFile", params).then(({ data }) => {
        resolve("data:application/pdf;base64," + arrayBufferToBase64(data));
      });
    });
  }

  //文件保存
  function saveFileData(fileName, dataBuffer) {
    return ipcRenderer.invoke("save_file_data", { fileName, dataBuffer });
  }

  function arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  //注册函数
  function registerFun() {
    window.CNative = {
      saveFileData,
      initPage,
      base64ToUint8Array,
      arrayBufferToBase64,
      onDateUpdate,
      onDomReady,
      saveSetting,
      appRelaunch,
      launchOCX,
      loadConfig,
      getPackageJson,
      getPrinters,
      printFile,
      printFileData,
      getFile, //获取文件
    };
    window.CNative.initPage();
    window.ipc = window.CNative;
  }
  registerFun();
})(navigator.userAgent.toLowerCase().indexOf("electron/") != -1);
