import ServerHTTP from "./ServerHTTP";
import ServerSIO from "./ServerSIO";
const express = require("express");
const app = express();
const http = require("http");
//本地服务
export default class LocServer {
  constructor(xapp) {
    this.xapp = xapp;
    this.httpServer = null;
  }
  listen(port) {
    this.httpServer = http.createServer(app);
    new ServerHTTP(app, this.xapp).connect();
    new ServerSIO(this.httpServer, this.xapp).connect();
    this.httpServer.listen(port, () => {
      console.log(`app listening at http://localhost:${port}`);
    });
  }

  stopServer() {
    this.httpServer && this.httpServer.close();
  }
}
