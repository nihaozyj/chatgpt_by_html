/** 模型列表 */
const modelList = ['gpt4o', 'gpt4o-mini', 'glm-4-flash'];

/** 角色类型 */
const roleType = {
  /** 系统消息 */
  system: 'system',
  /** 用户自身 */
  user: 'user',
  /** 助手 */
  assistant: 'assistant',
};

/** 智能体设定 */
class Setting {
  /**
   * 构造函数
   * @param {keyof roleType} role 智能体角色类型
   * @param {string} message 设定要求
   */
  constructor(role, message) {
    this.role = role;
    this.message = message;
  }
}

/** 智能体类 */
class Agent {
  /**
   * 名称
   * @type {string}
   */
  name = "";

  /**
   * 编号
   * @type {string}
   */
  id = "";

  /**
   * 智能体设定
   * @type {Setting[]}
   */
  setting = [];

  /**
   * 对话模型
   * @type {keyof typeof modelList}
   */
  model = null;

  /**
   * 对话摘要模型
   * @type {keyof typeof modelList}
   */
  summary_model = null;

  /**
   * 自定义模型列表
   */
  custom_model_list = [];

  /**
   * 使用哪个采样温度，取值`0~2`之间。
   */
  temperature = 1;

  /**
   * 一种替代温度采样的方法叫做核心采样，取值`0~1`之间
   */
  top_p = 1;

  /**
   * 频率惩罚，值越大越可能降低重复字词，取值在`-2~2`
   */
  frequency_penalty = 0;

  /**
   * 附带历史消息数，表示携带的上下文轮次，一轮对话包含两条消息
   */
  lst_message_num = 2;

  /**
   * api-key
   */
  api_key = "";

  /**
   * 接口地址，格式为`http(s)://{接口地址}/v1`,默认为`http://api.openai.com/v1`
   */
  base_url = "";
}

export {
  Agent,
  modelList,
  roleType,
  Setting
};
