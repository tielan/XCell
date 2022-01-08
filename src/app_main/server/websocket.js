import ReconnectWebSocket from "../utils/ReconnectWebSocket";
import EventBus from "../utils/EventBus";
export default class WSClient {
  constructor(url, callback) {
    this.eventBus = new EventBus();
    this.ws = new ReconnectWebSocket({
      url: url,
      received: (message) => {
        if (message && typeof message == "string") {
          let msgObj = JSON.parse(message);
          if (msgObj && msgObj.messageId) {
            this.eventBus.emit(msgObj.messageId, message);
          } else {
            callback && callback(msgObj);
          }
        }
      },
      onOpened: () => {
        
      },
    });
    this.ws.connect();
  }
  pushAndCB(message) {
    return new Promise((resolve, reject) => {
      this.eventBus.once(message.messageId, (result) => {
        resolve(result);
      });
      if (this.ws && this.ws.readyState === this.ws.OPEN) {
        this.ws.sendMsg(JSON.stringify(message));
      }
    });
  }
}
