class Config {
  constructor() {
    /** 当前边栏的状态，hide表示隐藏，show表示显示 */
    this.leftState = 'show';
    /** 边栏的最小宽度 */
    this.leftMinWidth = 230;
    /** 边栏的宽度 */
    this.leftWidth = 300;
  }
}

const EVENT_TYPE = {
  /** 打开智能体列表 */
  agent: 'agent',
  /** 打开设置面板 */
  globalSettings: 'global-settings',
  /** 置顶对话 */
  pinConversation: 'pin-conversation',
  /** 编辑对话标题 */
  editConversationTitle: 'edit-conversation-title',
  /** 打开指定对话 */
  openConversation: 'open-conversation',
  /** 删除指定对话 */
  deleteConversation: 'delete-conversation',
  /** 创建新对话 */
  createConversation: 'create-conversation',
  /** 清除所有对话记录 */
  clearAllConversations: 'clear-all-conversations',
  /** 收起/隐藏侧边栏 */
  hideAndShowSidebar: 'hide-and-show-sidebar',
  /** 切换主题 */
  switchTheme: 'switch-theme',
  /** 插入文件 */
  insertFile: 'insert-file',
  /** 清除历史记录 */
  clearHistory: 'clear-history',
  /** 语音输入 */
  voiceInput: 'voice-input',
  /** 当前对话配置 */
  conversationConfig: 'conversation-config',
  /** 保存当前配置 */
  saveConfig: 'save-config',
  /** 取消保存设置 */
  cancelSaveConfig: 'cancel-save-config',
};

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
  configProxy as config,
  /** 事件类型 */
  EVENT_TYPE
};
