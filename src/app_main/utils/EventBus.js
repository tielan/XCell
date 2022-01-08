export default class EventBus {
  constructor() {
    this._events = new Map(); // 存储事件／回调键值对
  }
  // on 监听
  on(type, fn) {
    const handler = this._events.get(type); // 获取对应事件名称的函数清单
    if (!handler) {
      this._events.set(type, fn);
    } else if (handler && typeof handler === "function") {
      // 如果handler是函数，说明当前只有一个监听者
      // 再次添加监听者，需要改用 数组储存
      this._events.set(type, [handler, fn]);
    } else {
      // 已有多个监听者，直接往数组里push函数即可
      handler.push(fn);
    }
  }
  // emit 触发
  emit(type, ...args) {
    let handler = this._events.get(type);
    if (Array.isArray(handler)) {
      // 是数组，说明有多个监听者，需要依次触发里边的函数
      for (let i = 0; i < handler.length; ++i) {
        if (args.length > 0) {
          handler[i].apply(this, args);
        } else {
          handler[i].call(this);
        }
      }
    } else {
      // 单个函数的情况直接触发即可
      if (args.length > 0) {
        handler.apply(this, args);
      } else {
        handler.call(this);
      }
    }
    return true;
  }
  // off 移除监听
  off(type, fn) {
    const handler = this._events.get(type);
    if (handler && typeof handler === "function") {
      // 函数，说明只有一个监听者，直接删除就行
      this._events.delete(type);
    } else {
      handler.splice(
        handler.findIndex((e) => e === fn),
        1
      );
    }
  }
  // 单次执行
  once(type, fn) {
    let _self = this;
    function handler() {
      _self.off(type, handler);
      fn.apply(null, arguments);
    }
    this.on(type, handler);
  }
}
