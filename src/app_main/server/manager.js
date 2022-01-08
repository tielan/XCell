export function startCaptrue(govhall) {
  return new Promise(async (resovle, reject) => {
    try {
      //开始截屏 并返回信息
      let base64 = await govhall.$screenshots.startCaptrueSend();
      //上传截图
      let resData = await govhall.$screenshots.postImg(base64);
      //消息推送 并等待响应
      let params = {
        type: "p2p",
        sendTo: govhall.setting["pjClientNum"],
        fromNum: govhall.setting["clientNum"],
        cmdCode: "C10",
        data: {
          openUrl: resData.data.filePath,
        },
        messageId: resData.data.fileId,
      };
      let timer = setTimeout(() => {
        reject({ message: "确认超时" });
      }, 20 * 1000);
      govhall.$wsClient
        .pushAndCB(params)
        .then((data) => {
          timer && clearTimeout(timer);
          resovle(data);
        })
        .catch((err) => {
          timer && clearTimeout(timer);
          reject({ message: "推送异常" });
        });
    } catch (error) {
      console.log(error)
      reject({ message: error.message || "异常" });
    }
  });
}
