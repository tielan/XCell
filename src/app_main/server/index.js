import ServerHTTP from "./ServerHTTP";
import ServerSIO from "./ServerSIO";
const express = require("express");
const app = express();
const http = require("http");
//本地服务
export default class LocServer {
  constructor(govhall) {
    this.govhall = govhall;
    this.httpServer = null;
  }
  listen(port) {
    this.httpServer = http.createServer(app);
    new ServerHTTP(app, this.govhall).connect();
    new ServerSIO(this.httpServer, this.govhall).connect();
    this.httpServer.listen(port, () => {
      console.log(`app listening at http://localhost:${port}`);
    });
  }

  stopServer() {
    this.httpServer && this.httpServer.close();
  }
}
