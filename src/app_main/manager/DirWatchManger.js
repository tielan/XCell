var chokidar = require("chokidar");
var path = require("path");

export default class DirWatchManager {
  constructor() {
    this.watcher = null;
    this.watchDir = null;
    this.fileSet = new Set();
  }
  watch(watchDir, callback) {
    this.watchDir = watchDir;
    console.log("开始监听-->", watchDir);
    this.watcher = chokidar.watch(watchDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      depth: 1,
      persistent: true,
    });
    this.watcher.on("all", (event, path) => {
      if (event == "add") {
        this.fileSet.add(path.replace(watchDir,""));
        callback && callback(Array.from(this.fileSet));
      } else if (event == "unlink") {
        this.fileSet.delete(path.replace(watchDir,""));
        callback && callback(Array.from(this.fileSet));
      }
    });
    return this;
  }
  getRealPath(pathStr){
     return path.resolve(this.watchDir,pathStr)
  }
  close() {
    this.watcher.close();
  }
}
