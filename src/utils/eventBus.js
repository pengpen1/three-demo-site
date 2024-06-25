class EventBus {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // 取消订阅事件
  off(event, callback) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  // 仅执行一次的订阅事件
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  // 发布事件
  emit(event, ...args) {
    if (!this.events[event]) return;

    this.events[event].forEach((callback) => callback(...args));
  }
}
export default new EventBus();

// 使用示例
const bus = new EventBus();

function handleEvent(data) {
  console.log("Event received:", data);
}

// 订阅事件
bus.on("my-event", handleEvent);

// 发布事件
bus.emit("my-event", { some: "data" });

// 取消订阅事件
bus.off("my-event", handleEvent);

// 订阅仅执行一次的事件
bus.once("once-event", (data) => {
  console.log("Once event received:", data);
});

// 发布仅执行一次的事件
bus.emit("once-event", { some: "data" });

