class Config {
  /** 当前主题  */
  theme = 'light';
  /** 当前侧栏宽度 */
  sidebarWidth = 300;
  /** 侧栏是否隐藏 */
  sidebarHidden = false;

  /** 字体大小 */
  fontSize = 16;
  /** 发送消息按键 */
  sendMsgKey = 'ctrl+enter';
  /** 语言 */
  language = 'zh-CN';
  /** 是否根据对话生成标题 */
  isFiniteTitle = true;
  /** 是否启用快捷指令 */
  isShortcut = true;
  /** 是否启用聊天气泡 */
  isBubble = true;
  /** 快捷指令列表 */
  shhortcuts = [];
  /** 默认智能体 */
  defaultAgent = null;
}

// 从本地存储加载配置
function loadConfigFromLocalStorage() {
  try {
    const storedConfig = localStorage.getItem('config');
    return JSON.parse(storedConfig);
  } catch (e) {
    console.error(e);
    return null;
  }
}

// 创建代理
const config = new Config();
const storedConfig = loadConfigFromLocalStorage();

if (storedConfig) {
  Object.assign(config, storedConfig);
}

/** 配置的代理对象，全局单例，写入数据时自动持久化 */
const configProxy = new Proxy(config, {
  set(target, property, value) {
    target[property] = value;
    localStorage.setItem('config', JSON.stringify(target));

    document.body.className = config.theme;
    document.body.style.fontSize = `${config.fontSize}px`;

    return true;
  }
});

export default configProxy;
