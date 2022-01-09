(function () {
  var { ipcRenderer } = require("electron");
  //注册函数
  function registerFun() {
    window.CNative = {
      uploadFile: ({ byteArray }) => {
        return new Promise((resolve, reject) => {
          ipcRenderer.invoke("uploadFile", { byteArray }).then((data) => {
            resolve(data);
          });
        });
      },
      downloadXlsx: (json) => {
        return  ipcRenderer.invoke("downloadXlsx", { json });
      },
      downloadDoc: (json) => {
        return ipcRenderer.invoke("downloadDoc", { json });
      },
    };
  }
  registerFun();
})();
