class Config {
  constructor() {
    /** 当前边栏的状态，hide表示隐藏，show表示显示 */
    this.leftState = 'show';
    /** 边栏的最小宽度 */
    this.leftMinWidth = 240;
    /** 边栏的最大宽度 */
    this.leftMaxWidth = 500;
    /** 边栏的宽度 */
    this.leftWidth = 200;
  }
}

// 从本地存储加载配置
function loadConfigFromLocalStorage() {
  const storedConfig = localStorage.getItem('config');
  return storedConfig ? JSON.parse(storedConfig) : null;
}

// 创建代理
const config = new Config();
const storedConfig = loadConfigFromLocalStorage();

if (storedConfig) {
  Object.assign(config, storedConfig);
}

const configProxy = new Proxy(config, {
  set(target, property, value) {
    target[property] = value;
    localStorage.setItem('config', JSON.stringify(target));
    return true;
  }
});

export {
  /** 配置信息 */
  configProxy as config
};
