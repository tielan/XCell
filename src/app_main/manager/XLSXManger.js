import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import createReport from "docx-templates";
import os from "os";
import { exec } from "child_process";
const outpath =  path.join(os.homedir(), "Desktop", "xcell_output");
const xlxoutpath = path.join(outpath, "xlsx");
const docoutpath = path.join(outpath, "docx");

export default class XLSXManger {
  static init() {
    if (!fs.existsSync(outpath)) {
      fs.mkdirSync(outpath);
    }
    if (!fs.existsSync(xlxoutpath)) {
      fs.mkdirSync(xlxoutpath);
    }
    if (!fs.existsSync(docoutpath)) {
      fs.mkdirSync(docoutpath);
    }
  }
  /**
   * xlsx 文件处理
   */
  static handlerFile(byteArray) {
    XLSXManger.init();
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
        address:`${item.XZQMC}${item.ZLDWMC}`
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
            TBBH: XLSXManger.plusStr(preItem.TBBH, item.TBBH), //图斑 编号
            tbmj: XLSXManger.plusStr(preItem.tbmj, item.tbmj), //图斑 面积
            wzxx: XLSXManger.plusStr(preItem.wzxx, item.wzxx), //位置信息 经纬度
            st_mj: XLSXManger.plus(preItem.st_mj, item.st_mj), //水田 面积
            hd_mj: XLSXManger.plus(preItem.hd_mj, item.hd_mj), //旱地 面积
            sjd_mj: XLSXManger.plus(preItem.sjd_mj, item.sjd_mj), //水浇地 面积
            qt_mj: XLSXManger.plus(preItem.qt_mj, item.qt_mj), //其他 面积
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
  //字符串相加
  static plusStr(a, b) {
    if (`${a}`.indexOf(b) != -1) {
      return a;
    }
    return `${a},${b}`;
  }
  //面积相加
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
    xlsx.writeFile(wb, path.join(xlxoutpath, "处理结果.xlsx"));
    exec("start " + xlxoutpath);
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
      path.join(docoutpath, `${item.address}_${item.ZJRXM}_入户调查表.docx`),
      buffer
    );
    exec("start " + docoutpath);
  }
}
