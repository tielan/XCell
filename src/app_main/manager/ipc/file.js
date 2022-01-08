const request = require("request");
const fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");
const os = require("os");
const { print, getPrinters } = require("../../printer/file");
export default class FileIPC {
  constructor(govhall) {
    this.$govhall = govhall;
  }
  register() {
    //文件保存
    ipcMain.handle("save_file_data", (event, { fileName, dataBuffer }) => {
      return new Promise((resolve, reject) => {
        if(fs.existsSync(fileName)){
          fs.unlinkSync(fileName)
        }
        fs.writeFile(fileName, dataBuffer, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(fileName);
          }
        });
      });
    });

    //打印 pdf 跟 图片
    ipcMain.handle("print_pdf", (event, fileUrl, ext) => {
      return new Promise((resolve, reject) => {
        this.printFile({ resolve, reject }, { fileUrl }, ext);
      });
    });

    ipcMain.on("print_pdf", (event, fileUrl, ext) => {
      new Promise((resolve, reject) => {
        this.printFile({ resolve, reject }, { fileUrl }, ext);
      })
        .then((value) => {
          let result = { success: "打印成功" };
          if (value.state != 0) {
            result = { errorType: "打印失败" };
          }
          event.sender.send("print-reply", result);
        })
        .catch(() => {
          event.sender.send("print-reply", { errorType: "打印失败" });
        });
    });

    //打印 pdf 跟 图片
    ipcMain.handle("print_pdf_data", (event, fileData, ext) => {
      return new Promise((resolve, reject) => {
        this.printFile({ resolve, reject }, { fileData }, ext);
      });
    });

    //打印 pdf 跟 图片
    ipcMain.handle("print_file", (event, { fileUrl, ext }) => {
      return new Promise((resolve, reject) => {
        this.printFile({ resolve, reject }, { fileUrl }, ext);
      });
    });
    //打印 pdf 跟 图片
    ipcMain.handle("print_file_data", (event, { fileData, ext }) => {
      return new Promise((resolve, reject) => {
        this.printFile({ resolve, reject }, { fileData }, ext);
      });
    });

    ipcMain.handle("getPrinters", (event) => {
      return new Promise((resolve, reject) => {
        resolve(getPrinters());
      });
    });

    ipcMain.handle("getFile", (event, params) => {
      return new Promise((resolve, reject) => {
        if (this.$govhall.$dirWatchManager) {
          let filepath = this.$govhall.$dirWatchManager.getRealPath(
            params.path
          );
          fs.readFile(filepath, (err, data) => {
            console.log(err);
            resolve({ data });
          });
        } else {
          resolve({});
        }
      });
    });
  }

  async printFile(executor, { fileUrl, fileData }, ext) {
    let fileName = "file_" + new Date().getTime() + (ext || ".pdf");
    let filePath = path.join(os.tmpdir(), fileName);
    let getFile = null;
    if (fileUrl) {
      if (fileUrl.startsWith("http")) {
        getFile = this.getFileFromUrl(filePath, fileUrl);
      } else {
        getFile = this.getFileFromPath(filePath, fileUrl);
      }
    } else if (fileData) {
      getFile = this.getFileFromData(filePath, fileData);
    }
    if (getFile) {
      getFile
        .then(() => {
          console.log("打印文件->" + filePath);
          print(filePath)
            .then(() => {
              console.log("打印成功");
              executor.resolve({
                state: 0,
                data: {
                  msg: "打印成功",
                },
              });
              fs.unlink(filePath, () => {
                console.log("删除成功");
              });
            })
            .catch((err) => {
              console.log("打印失败", err);
              executor.reject({
                state: 1,
                data: {
                  msg: "打印失败",
                },
              });
              // fs.unlink(filePath, () => {
              //   console.log("删除成功");
              // });
            });
        })
        .catch((err) => {
          console.log(err);
          executor.reject({
            state: 1,
            data: {
              msg: "文件不存在",
            },
          });
        });
    }
  }
  /**
   *
   * @param {文件存储路径} filePath
   * @param {文件下载路径} param1
   * @param {文件后缀} ext
   * @returns
   */
  getFileFromUrl(filePath, url) {
    return new Promise((resolve, reject) => {
      if (url && url.startsWith("http")) {
        console.log("url->", url);
        let stream = fs.createWriteStream(filePath);
        request(encodeReqUrl(url))
          .pipe(stream)
          .on("close", function(err) {
            console.log("文件[" + filePath + "]下载完毕");
            resolve({ filePath });
          });
      } else {
        reject({ message: "链接非法" });
      }
    });
  }

  getFileFromPath(filePath) {
    return new Promise((resolve, reject) => {
      resolve(filePath);
    });
  }

  getFileFromData(filePath, fileData) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, fileData, (err) => {
        if (err) {
          reject({
            message: "文件读取失败",
          });
        } else {
          resolve(filePath);
        }
      });
    });
  }
}

function encodeReqUrl(reqUrl) {
  let url = "";
  if (reqUrl && reqUrl.split("?").length > 1) {
    const queryArr = reqUrl.split("?")[1].split("&");
    url = reqUrl.split("?")[0] + "?";
    queryArr.map((item) => {
      const itemArr = item.split("=");
      url +=
        itemArr[0] +
        "=" +
        encodeURIComponent(itemArr.length > 1 ? itemArr[1] : "") +
        "&";
    });
  }
  console.log("url", url);
  return url;
}
