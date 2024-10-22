const events = {};

function emit(et, data) {
  if (!events[et]) return;
  events[et].forEach(callback => callback(data));
}

function on(et, callback) {
  if (!et) return;
  if (!events[et]) {
    events[et] = [];
  }
  events[et].push(callback);
}

function off(et, callback) {
  if (!events[et]) return;
  const index = events[et].indexOf(callback);
  if (index > -1) {
    events[et].splice(index, 1);
  }
}

/** 用户事件枚举 */
const eventType = {
  /** 打开智能体列表 */
  OPEN_AGENT_LIST: 'openAgentList',
  /** 打开设置面板 */
  OPEN_SETTING_PANEL: 'openSettingPanel',
  /** 创建一个新的对话 */
  CREATE_NEW_DIALOG: 'createNewDialog',
  /** 打开一个对话 */
  OPEN_DIALOG: 'openDialog',
  /** 用户点击发送一条消息 */
  SEND_MESSAGE: 'sendMessage',
  /** 设置更新 */
  UPDATE_SETTING: 'updateSetting',
  /** 请求创建一个新的对话 */
  REQUEST_CREATE_NEW_DIALOG: 'requestCreateNewDialog',
};


export default {
  emit, on, eventType
};
