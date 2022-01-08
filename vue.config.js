module.exports = {
  devServer: {
    port: 8080,
  },
  pluginOptions: {
    electronBuilder: {
      externals: ["electron-screenshots"],
      builderOptions: {
        extraResources: ["icon"],
      },
      productName: "gov_hall",
      nodeIntegration: true,
      fileAssociations: {
        protocols: ["app"],
      },
      builderOptions: {
        appId: "com.chinacrator.gov_hall_app",
        productName: "gov_hall",

        publish: [
          {
            provider: "generic",
            url: "",
          },
        ],
        asar: false,
        win: {
          icon: "public/icons/icon.ico",
          artifactName: "${productName}_setup_${version}.exe",
          target: [
            {
              target: "nsis", // 打包安装包
              arch: ["ia32"], // windows 32位 和 64位 ["ia32", "x64"]
            },
            // {
            //   target: "portable", // 打包单文件
            //   arch: ["ia32"], // windows 32位 和 64位
            // },
          ],
        },
        linux:{
          icon: "public/icons",
          target:[
            {
              target:"AppImage",
              arch:[
                "x64",
                "arm64",
                "armv7l"
              ]
            }
          ]
        },
        // nsis: {
        //   oneClick: true, // 一键安装
        //   perMachine: true, // 为所有用户安装
        //   allowElevation: true, // 允许权限提升, 设置 false 的话需要重新允许安装程序
        //   allowToChangeInstallationDirectory: false, // 允许更改安装目录
        //   createDesktopShortcut: true, // 创建桌面图标
        //   createStartMenuShortcut: true, // 创建开始菜单
        //   deleteAppDataOnUninstall: true, // 卸载时清除应用数据
        // },
        files: ["**/*", "!src/"],
      },
    },
  },
};
