import * as Manager from "./manager";
import * as Api from "../api";
const express = require("express");

const path = require("path");
var fs = require("fs");

export default class ServerHTTP {
  constructor(app, govhall) {
    this.app = app;
    this.govhall = govhall;
  }
  connect() {
    this.app.use("/m", express.static(path.join(__static, "m")));
    //设置跨域访问
    this.app.all("*", (req, res, next) => {
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
      res.header("X-Powered-By", " 3.2.1");
      res.header("Content-Type", "application/json;charset=utf-8");
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
    });
    this.app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    this.app.get("/app/getFile", (req, res) => {
      const { path } = req.query;
      console.log(path);
      if (!path || !this.govhall.$dirWatchManager) {
        res.end("{}");
        return;
      }
      let filepath = this.govhall.$dirWatchManager.getRealPath(path);
      fs.readFile(filepath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200, {
          "Content-Disposition": "attachment; filename=1.pdf",
          "content-type": "application/pdf",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "X-Requested-With",
          "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
        });
        fs.createReadStream(filepath).pipe(res);
      });
    });

    this.app.get("/app/capture", async (req, res) => {
      try {
        let wsData = await Manager.startCaptrue(this.govhall);
        res.send(wsData);
      } catch (error) {
        res.send({ status: 500, message: error.message || "截图异常" });
      }
    });

    this.app.get("/app/evaluate", async (req, res) => {
      console.log(req.query);
      const { cmdCode, openUrl, callback } = req.query;
      let parmas = {
        cmdCode: cmdCode,
        data: {
          openUrl,
          ...req.query,
        },
        clientNum: this.govhall.setting["pjClientNum"],
      };
      try {
        let result = await Api.pushMessage(parmas);
        if (callback) {
          res.type("text/javascript");
          res.send(callback + "(" + JSON.stringify(result) + ")");
        } else {
          res.send(result);
        }
      } catch (error) {
        console.log(error);
        if (callback) {
          res.type("text/javascript");
          res.send(
            callback +
              "(" +
              JSON.stringify({ status: 500, message: "链接服务器异常" }) +
              ")"
          );
        } else {
          res.send({ status: 500, message: "链接服务器异常" });
        }
      }
    });
  }
}
