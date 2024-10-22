import { Agent, roleType } from './agent';

class Content {
  /**
   * 消息类型
   * @type {'text' | 'file_url' | 'image_url'}
   */
  type = '';
  /**
   * 消息类型为纯文本时
   */
  messgae = '';
  /**
   * 当消息类型为非文本时，对象有该属性，如 {text: 'hello world', type: 'text'}
   */
  text = '';
  /**
   * 当类型为非文本时，对象有该属性，如 {url: 'https://example.com/image.jpg', type: 'image_url', name: 'image.jpg}
   */
  name = '';
  /**
   * 当类型为非文本时，对象有该属性，如 {url: 'https://example.com/image.txt', type: 'file_url', name: 'image.jpg}
   */
  url = '';
}

/** 消息类，代表一次对话的消息 */
class Message {
  /**
   * 构造函数
   * @param {keyof roleType} role 消息的角色，"user"表示用户，"agent"表示智能体
   * @param {string | Content[]} content 消息内容
   * @param {number} timestamp 消息发送时间
   */
  constructor(role, content, timestamp) {
    this.role = role;
    this.content = content;
    this.timestamp = timestamp;
  }
}

/** 会话类，代表一次对话 */
class Conversation {

  /** 会话唯一编号 */
  id = '';

  /** 会话标题 */
  title = '';

  /** 会话的智能体对象 */
  agent = null;

  /**
   * 会话内容
   * @type {Message[]}
   */
  messages = [];

  /**
   * 上下文起始索引, 用户每次清除上下文时会更新此索引，取消清除会pop出上一次的索引
   * @type {number[]}
   */
  contextStart = [0, 0];

  /**
   * 构造函数
   * @param {Agent} agent 对话使用的智能体对象
   */
  constructor(agent) {
    this.agent = agent;
  }

  /**
   * 清除或者回复上下文
   * @returns {string} 返回操作结果
   */
  clearContext() {
    const lastMessageIndex = this.messages.length - 1;
    let message = '当前还没有对话记录！';
    // 先判断是否有上下文
    if (this.messages.length === 0) return message;
    // 当前上下文索引和历史记录最后一条消息索引不一致，说明是清除上下文
    if (this.contextStart[0] != his.messages.length - 1) {
      this.contextStart.unshift(lastMessageIndex);
      message = '已清除上下文！';
    } else {
      this.contextStart.shift();
      message = '已撤销！';
    }
    // 只保留有效的两次上下文起始索引，为了撤销上一次的回复
    this.contextStart = this.contextStart.slice(0, 2);
    return message;
  }
}

export {
  Conversation,
  Message,
  Content
};
