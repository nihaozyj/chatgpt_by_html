import { writable } from 'svelte/store';

const eventBus = writable({});

const emit = (event, data) => {
  eventBus.update(events => {
    events[event] = data;
    return events;
  });
};

const on = (event, callback) => {
  return eventBus.subscribe(events => {
    if (events[event]) {
      callback(events[event]);
    }
  });
};

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
};

export default {
  emit, on, eventType
};
