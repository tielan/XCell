import * as Manager from "./manager";
import * as Api from "../api";

const socket_io = require("socket.io");
const log = require("../utils/Logger");

export default class ServerSIO {
  constructor(httpServer, xapp) {
    const io = socket_io.listen(httpServer, { serveClient: false, cors: true });
    this.io = io;
    this.xapp = xapp;
    this.allClient = {};
  }
  connect() {
    this.io.on("connection", (client) => {
      this.allClient[client.id] = client;
      client.on("message", (msg) => {
        log.info(msg);
        let address = client.handshake.address;
        for (const key in this.allClient) {
          if (this.allClient.hasOwnProperty(key) && this.allClient[key]) {
            const target = this.allClient[key];
            if (address == target.handshake.address && client.id != target.id) {
              //排除自己  同IP 的分发 && client.id != target.id
              if (msg.imgData) {
                msg.imgData = saveImg(msg.imgData);
                log.info(
                  "send message  " + target.id + "--" + JSON.stringify(msg)
                );
              } else {
                log.info(
                  "send message  " + target.id + "--" + JSON.stringify(msg)
                );
              }
              target.emit("message", msg);
            }
          }
        }
      });
      client.on("CMD", (cmdData, callback) => {
        if (
          this.xapp.setting["deviceType"] == 5 ||
          this.xapp.setting["deviceType"] == 6
        ) {
          let result = { status: 500, message: "副屏幕未正常启动" };
          if (this.xapp.$externalWin) {
            result = this.xapp.$externalWin.onCmdAction(cmdData);
          }
          sendAck(result.status, result.message);
          return;
        }
        if (!this.xapp.setting["pjClientNum"]) {
          sendAck(401, "未配置客户端编号");
          return;
        }
        if (cmdData && cmdData.cmdCode == "C10") {
          Manager.startCaptrue(this.xapp)
            .then((resData) => {
              if (callback) {
                callback(resData);
              } else {
                client.emit("CMD_ACK", resData);
              }
            })
            .catch((err = {}) => {
              sendAck(500, err.message || "截图异常");
            });
        } else if (cmdData && cmdData.cmdCode) {
          let parmas = {
            ...cmdData,
            clientNum: this.xapp.setting["pjClientNum"],
          };
          Api.pushMessage(parmas)
            .then((res) => {
              if (callback) {
                callback(res);
              } else {
                client.emit("CMD_ACK", res);
              }
            })
            .catch(() => {
              sendAck(500, "链接服务器异常");
            });
        } else {
          sendAck(400, "参数异常");
        }

        function sendAck(code, message) {
          if (callback) {
            callback({ status: code, message: message });
          } else {
            client.emit("CMD_ACK", { status: code, message: message });
          }
        }
      });

      client.on("disconnect", () => {
        delete this.allClient[client.id];
        log.info("disconnect " + client.id + "--" + client.handshake.address);
      });
    });
  }
}
