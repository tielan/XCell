import WebSocket from "ws";
export default class ReconnectWebSocket {
  constructor(options) {
    this.url = options.url;
    this.callback = options.received;
    this.onOpencallback = options.onOpened;

    this.name = options.name || "default";
    this.ws = null;
    this.status = null;
    this.pingInterval = null;
    this.reConnectTimer = null;
    // 心跳检测频率
    this._timeout = 3000;
    this.isHeart = options.isHeart || true;
    this.isReconnection = options.isReconnection || true;
  }
  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = (e) => {
      this.status = "open";
      console.log("连接成功");
      this.onOpencallback && this.onOpencallback();
      if (this.isHeart) {
        // 心跳
        this._heartCheck();
      }
    };
    // 接受服务器返回的信息
    this.ws.onmessage = (e) => {
      if (typeof this.callback === "function") {
        return this.callback(e.data);
      } else {
        console.log("参数的类型必须为函数");
      }
    };
    // 关闭连接
    this.ws.onclose = (e) => {
      this._closeSocket(e);
    };
    // 报错
    this.ws.onerror = (e) => {
      this._closeSocket(e);
    };
  }
  sendMsg(data) {
    return this.ws.send(data);
  }
  _resetHeart() {
    clearInterval(this.pingInterval);
    return this;
  }
  _heartCheck() {
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, this._timeout);
  }
  _closeSocket(e) {
    this._resetHeart();
    if (this.status !== "close") {
      if (this.isReconnection) {
        this.reConnectTimer && clearTimeout(this.reConnectTimer);
        this.reConnectTimer = setTimeout(() => {
          try {
            this.connect();
          } catch (error) {
            console.log(error);
          }
        }, 6 * 1000);
      }
    } else {
      console.log("手动关闭");
    }
  }
  close() {
    this.status = "close";
    this._resetHeart();
    return this.ws.close();
  }
}
