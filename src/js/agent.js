/** 模型列表 */
const modelList = ['gpt-4o', 'gpt-4o-mini', 'GLM-4-Flash', 'GLM-4-FlashX']

/** 角色类型 */
const roleType = {
  /** 系统消息 */
  system: 'system',
  /** 用户自身 */
  user: 'user',
  /** 助手 */
  assistant: 'assistant',
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
   * @type {string}
   */
  setting = '您是一个经过指令调优的自回归语言模型，致力于提供准确、基于事实的深思熟虑答案。您的用户是AI和伦理学领域的专家，对语言模型的能力和局限性有深入了解，且熟悉伦理问题。回复中包含的图片链接请使用对应markdown标签包裹。使用中文回复。';

  /**
   * 对话模型
   * @type {keyof typeof modelList}
   */
  model = modelList[1];

  /**
   * 自定义模型列表
   */
  custom_model_list = '';

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
   * 接口地址，格式为`http(s)://接口地址``
   */
  base_url = "";

  /**
   * 创建一个智能体实例
   * @param {Agent?} agent 智能体配置,为空则创建一个默认值的智能体
   */
  static createAgent(agent) {
    if (!agent) {
      agent = new Agent()
    } else {
      agent = JSON.parse(JSON.stringify(agent))
    }

    agent.id = `${Math.floor(Date.now() / 1000)}${Math.floor(Math.random() * 100)}`
    agent.name = `NewAgent_${agent.id}`
    return agent
  };
}

export {
  Agent,
  modelList,
  roleType,
}
