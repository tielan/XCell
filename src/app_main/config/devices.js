export default [
  {
    name: "一体机",
    type: "0",
    code: "autoterminal",
    ocx: "1",
    page: "https://${host}:${ports}/autoterminal/index.html?t=${time}#/",
    //page: "http://127.0.0.1:8000",
    extPage: "https://${host}:${ports}/autoterminal/index.html?t=${time}#/se/index",
    trayMenu: [
      {
        label: "显示主窗口",
      },
      {
        label: "显示副屏",
      },
    ],
  },
  {
    name: "排队机",
    type: "1",
    code: "offernumber",
    page: "http://${host}:${port}/offernumber/index.html?t=${time}#/",
    trayMenu: [
      {
        label: "显示主窗口",
      },
    ],
  },
  {
    name: "样表机",
    type: "3",
    code: "simpletable",
    page: "http://${host}:${port}/simpletable/index.html?t=${time}#/",
    trayMenu: [
      {
        label: "显示主窗口",
      },
    ],
  },
  {
    name: "查询机",
    type: "4",
    code: "searchtable",
    page: "http://${host}:${port}/searchtable/index.html?t=${time}#/",
    trayMenu: [
      {
        label: "显示主窗口",
      },
    ],
  },
  {
    name: "查询机竖屏",
    type: "5",
    code: "searchtablever",
    page: "http://${host}:${port}/searchtablever/index.html?t=${time}#/",
    trayMenu: [
      {
        label: "显示主窗口",
      },
    ],
  },
  {
    name: "超级终端",
    type: "6",
    code: "deskEva",
    extPage: "http://${host}:${port}/searchtable/index.html?t=${time}#/pj/home",
    infoPage:"http://${host}:${port}/searchtable/index.html?t=${time}#/pj/infosetting",
    // extPage: "http://localhost:8000/#/pj/home",
    // infoPage:"http://localhost:8000/#/pj/infosetting",
   // callPage:"http://172.18.191.22:8082/views/softCall/hp/outSoftCall_hp_index.jsp",
    callConfig:{
      width: 600,
      height: 375,
    },
    infoConfig:{
      width: 580,
      height: 480,
    },
    trayMenu: [
      {
        label: "水牌设置",
      },
      {
        label: "呼叫器",
      },
      {
        label: "双屏",
      },
    ],
  },
  {
    name: "评价器服务",
    type: "7",
    code: "deskEvaServer",
  },
  {
    name: "基层服务",
    type: "8",
    code: "jicheng",
    page:
      "http://${host}:${port}/searchtable/index.html?t=${time}#/basicsys/home",
    mustMoveTop: true, //强制置顶
    mainConfig: {
      transparent: true,
      type: "toolbar",
      x: 0,
      y: 0,
    },
  },
  {
    name: "办事指南查询",//岳阳楼定制版本
    type: "9",
    code: "deskEvaServer",
    page:"http://localhost:3002/m/index.html?t=${time}#/guideapp/home",
    //page:"http://localhost:8000/#/guideapp/home",
    watchDir:"D:\\things\\",
    trayMenu: [
      {
        label: "显示主窗口",
      }
    ],
  }
];
