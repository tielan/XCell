import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import createReport from "docx-templates";
import os from "os";
import { exec } from "child_process";
const outpath = path.join(os.homedir(),"Desktop", "xcell_output");
export default class XLSXManger {
  static init() {
    if (!fs.existsSync(outpath)) {
      fs.mkdirSync(outpath);
    }
  }
  /**
   * xlsx 文件处理
   */
  static handlerFile(byteArray) {
    XLSXManger.init()
    let workbook = xlsx.read(byteArray);
    let sheetNames = workbook.SheetNames; //获取表明
    let sheet = workbook.Sheets[sheetNames[0]]; //通过表明得到表对象
    let data = xlsx.utils.sheet_to_json(sheet);
    return data;
  }

  static parseData(json) {
    let listData = [];
    json.map((item) => {
      let dkbmSub = item.DKBM + ""; //位置信息
      dkbmSub = dkbmSub.substring(dkbmSub.length - 6);
      //耕地类型
      let gdlx = {};
      if (item.DLMC == "水田") {
        gdlx["st_mj"] = item.DKJSMJ;
      } else if (item.DLMC == "旱地") {
        gdlx["hd_mj"] = item.DKJSMJ;
      } else if (item.DLMC == "水浇地") {
        gdlx["sjd_mj"] = item.DKJSMJ;
      } else {
        gdlx["qt_mj"] = item.DKJSMJ;
      }
      let cellMap = {
        ...item,
        ...gdlx,
        tbmj: `${item.TBBH}（${item.JMMJ}亩）`,
        wzxx: `${dkbmSub}(${item.X},${item.Y})`,
      };
      listData.push(cellMap);
    });
    let resultList = [];
    let preItem = null;
    //数据合并
    listData.map((item, index) => {
      if (preItem) {
        if (preItem.ZJRXM == item.ZJRXM) {
          //同一个人
          preItem = {
            ...preItem,
            tbmj: `${preItem.tbmj},${item.tbmj}`,
            wzxx: `${preItem.wzxx},${item.wzxx}`,
            st_mj: XLSXManger.plus(preItem.st_mj, item.st_mj),
            hd_mj: XLSXManger.plus(preItem.hd_mj, item.hd_mj),
            sjd_mj: XLSXManger.plus(preItem.sjd_mj, item.sjd_mj),
            qt_mj: XLSXManger.plus(preItem.qt_mj, item.qt_mj),
          };
        } else {
          resultList.push(preItem);
          preItem = item;
        }
      } else {
        preItem = item;
      }
    });
    resultList.push(preItem);
    return resultList;
  }
  static plus(a, b) {
    if (a) {
      if (b) {
        return parseFloat(a + "") + parseFloat(b + "");
      } else {
        return a;
      }
    }
    return b;
  }
  static downloadXlsx(json) {
    let list = XLSXManger.parseData(json);
    XLSXManger.writeToXLSX(
      list.map((item) => [
        null,
        item.ZJRXM,
        null,
        item.XZQMC,
        item.TBBH,
        item.tbmj,
        item.wzxx,
        item.st_mj,
        null,
        item.hd_mj,
        null,
        item.sjd_mj,
        null,
        item.qt_mj,
        null,
      ])
    );
  }

  static writeToXLSX(listData) {
    const wb = xlsx.utils.book_new();
    let workSheet = xlsx.utils.aoa_to_sheet(listData);
    xlsx.utils.book_append_sheet(wb, workSheet, "Sheet1");
    xlsx.writeFile(
      wb,
      path.join(outpath, "处理结果.xlsx")
    );
    exec("start "+outpath)
  }

  static downloadDoc(json) {
    let list = XLSXManger.parseData(json);
    return writeDoc(list);
  }
}

async function writeDoc(list = []) {
  for (let index = 0; index < list.length; index++) {
    let item = list[index];
    item["st_mj"] = item.st_mj || "0";
    item["hd_mj"] = item.hd_mj || "0";
    item["sjd_mj"] = item.sjd_mj || "0";
    item["qt_mj"] = item.qt_mj || "0";
    const buffer = await createReport({
      template: fs.readFileSync(path.join(__static, "file", "temp.docx")),
      data: item,
      cmdDelimiter: ["{", "}"],
    });
    fs.writeFileSync(
      path.join(outpath, item.ZJRXM + ".docx"),
      buffer
    );
    exec("start "+outpath)
  }
}
