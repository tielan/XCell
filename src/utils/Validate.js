export const isValidIp = (rule, value, callback) => {
  // 校验IP是否符合规则
  var regEx = /,/g;
  var ipList = value
    .toString()
    .replace(regEx, ",")
    .split(",");
  var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
  for (var i in ipList) {
    if (!reg.test(ipList[i])) {
      return callback(new Error("请输入节点ip地址，多节点用,分隔"));
    } else {
      callback();
    }
  }
  return true;
};
