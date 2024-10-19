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
   * @type {string}
   */
  setting = '';

  /**
   * 对话模型
   * @type {keyof typeof modelList}
   */
  model = null;

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

  /**
   * 创建一个智能体实例
   * @param {Agent?} agent 智能体配置,为空则创建一个默认值的智能体
   */
  static createAgent(agent) {
    if (!agent) {
      agent = new Agent();
      agent.name = `agent-${Date.now()}`;
      return agent;
    }

    const newAgent = JSON.parse(JSON.stringify(agent));
    newAgent.id = `${Date.now()}${Math.floor(Math.random() * 100)}`;
    newAgent.name = `agent-${newAgent.id.slice(-5)}`;
  };
}

export {
  Agent,
  modelList,
  roleType,
};
