import { config, EVENT_TYPE } from './config.js';
import { marked } from './marked.esm.js';
import { Agent, modelList, roleType } from './agent.js';

const resizer = document.querySelector('body>.resizer');
const left = document.querySelector('body>.left');

/** -------------------加载界面工具方法------------------- */

/** 把 dom文本转为 dom 节点, 文本必须保证只有一个根节点 */
function createDom(html) {
  const tempDiv = document.createElement('div');
  // 使用 innerHTML 将 HTML 字符串转换为 DOM 元素
  tempDiv.innerHTML = html;
  // 获取创建的 DOM 元素
  return tempDiv.firstChild;
}

/** 弹出层管理 */
const popupManager = {
  popups: [],
  /**
   * 弹出层入栈
   * @param {{show: function, close: function}} popup - 弹出层 dom 节点
   */
  push(popup) {
    this.popups[0]?.close();
    this.popups.unshift(popup);
    popup.show();
  },
  /**
   * 弹出层出栈
   */
  break() {
    this.popups.shift()?.close();
  },

  /**
   * 弹出层全部关闭
   */
  root() {
    this.popups.forEach(popup => popup.close());
    this.popups = [];
  }
};

/**
 * 初始化表单值的函数
 * @param {HTMLElement} dom - 要初始化的 DOM 结构
 * @param {Agent} agent - 智能体对象实例
 */
function initializeForm(dom, agent) {
  // 获取表单元素
  const nameInput = dom.querySelector('input[placeholder="请输入智能体名称"]');
  const settingTextarea = dom.querySelector('textarea[placeholder="请输入智能体设定"]');
  const modelSelect = dom.querySelector('select');
  const baseUrlInput = dom.querySelector('input[placeholder="默认为:https://api.openai-up.com/v1"]');
  const apiKeyInput = dom.querySelector('input[placeholder="密钥，必填！"]');
  const customModelInput = dom.querySelector('input[placeholder="例: gpt4,o1-mini"]');
  const temperatureInput = dom.querySelector('input[placeholder="取值 [0,2]，默认为1"]');
  const topPInput = dom.querySelector('input[placeholder="取值 [0,1]，默认为1"]');
  const frequencyPenaltyInput = dom.querySelector('input[placeholder="取值 [-2,2]，默认为0"]');
  const lstMessageNumInput = dom.querySelector('input[placeholder="表示携带的上下文轮次，一轮对话包含两条消息"]');

  // 设置表单值
  if (nameInput) nameInput.value = agent.name;
  if (settingTextarea) settingTextarea.value = agent.setting; // 假设设定是数组，转为字符串
  if (baseUrlInput) baseUrlInput.value = agent.base_url;
  if (apiKeyInput) apiKeyInput.value = agent.api_key;
  if (temperatureInput) temperatureInput.value = agent.temperature;
  if (topPInput) topPInput.value = agent.top_p;
  if (frequencyPenaltyInput) frequencyPenaltyInput.value = agent.frequency_penalty;
  if (lstMessageNumInput) lstMessageNumInput.value = agent.lst_message_num;

  // 设置模型选择框
  if (modelSelect) {
    // 清空现有选项
    modelSelect.innerHTML = '<option value="">请选择对话模型</option>';

    // 添加 modelList 中的选项
    modelList.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });

    // 添加 custom_model_list 中的选项
    agent.custom_model_list.forEach(customModel => {
      const option = document.createElement('option');
      option.value = customModel;
      option.textContent = customModel;
      modelSelect.appendChild(option);
    });

    // 设置选择框的值
    if (agent.model) {
      modelSelect.value = agent.model;
    }
  }

  // 设置自定义模型输入框
  if (customModelInput) {
    customModelInput.value = agent.custom_model_list.join(', '); // 转为逗号分隔的字符串
  }
}


/**
 * 创建弹出框的函数
 * @param {HTMLElement} dom - 弹出框的 HTML 字符串
 */
function createPopups(dom) {
  dom.id = `popup-${Date.now()}`;
  return {
    show() {
      if (document.getElementById(dom.id)) {
        dom.classList.add('fadeIn');
      } else {
        document.body.appendChild(dom);
        dom.classList.add('fadeIn');
      }
    },
    close() {
      if (document.getElementById(dom.id)) {
        dom.classList.add('fadeOut');
        dom.addEventListener('animationend', () => {
          dom.remove();
        });
      }
    }
  };
};

/**  ------------------- 显示/隐藏侧边栏 -------------------  */
function toggleLeft(state) {
  if (state) {
    if (state === 'hide' && !left.classList.contains('hide')) {
      left.classList.add('hide');
      resizer.classList.add('hide');
    }
    if (state === 'show' && left.classList.contains('hide')) {
      left.classList.remove('hide');
      resizer.classList.remove('hide');
    }
  } else {
    left.classList.toggle('hide');
    resizer.classList.toggle('hide');
  }

  config.leftState = left.classList.contains('hide') ? 'hide' : 'show';
}

/**  ------------------- 初始化配置 -------------------  */
// 初始化侧边栏宽度
toggleLeft(config.leftState);
left.style.width = config.leftWidth + 'px';

/** 调整侧边栏宽度 */
resizer.addEventListener('mousedown', (event) => {
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
});

function resize(event) {
  document.body.style.userSelect = 'none';
  const newWidth = event.clientX;
  if (newWidth > config.leftMinWidth) {
    left.style.width = newWidth + 'px';
    config.leftWidth = newWidth;
  }
}

function stopResize() {
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.userSelect = 'auto';
}

/**  ------------------- 快捷键绑定 -------------------  */
document.addEventListener('keydown', (event) => {
  // 按下 Ctrl + B 显示/隐藏侧边栏
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault();
    toggleLeft();
  }
});

/**  ------------------- 动态调整消息输入框的高度 -------------------  */
const textarea = document.getElementById('message-box');
const ctrlBox = document.querySelector('.bottom>.buttons');
textarea.addEventListener('input', adjustHeight);

function adjustHeight() {
  this.style.height = '3em';
  // 设置新的高度，最大高度为 6 行
  const maxHeight = parseFloat(getComputedStyle(this).lineHeight) * 15;
  const newHeight = Math.min(this.scrollHeight, maxHeight);
  // 更新文本框高度
  this.style.height = `${newHeight}px`;
  ctrlBox.style.bottom = `${newHeight - 4}px`;
}
adjustHeight.call(textarea);


/**  ------------------- 监听并处理所有按键事件 -------------------  */
const btnEventHandlers = {
  [EVENT_TYPE.agent]: () => {
    fetch('/assets/agents.html').then(response => {
      // 检查响应是否成功
      if (!response.ok) {
        throw new Error('网络响应失败');
      }
      return response.text(); // 将响应转换为文本
    }).then(html => {
      // 处理获取到的 HTML 文本
      const dom = createDom(html);
      // initializeForm(dom, Agent.createAgent());
      // 创建弹出层
      popupManager.push(createPopups(dom));
      const cancelEvent = () => {
        document.removeEventListener(EVENT_TYPE.saveConfig, handerSave);
        document.removeEventListener(EVENT_TYPE.cancelSaveConfig, handerCancel);
      };
      const handerSave = () => {
        popupManager.break();
        cancelEvent();
      };
      const handerCancel = () => {
        popupManager.break();
        cancelEvent();
      };
      document.addEventListener(EVENT_TYPE.saveConfig, handerSave);
      document.addEventListener(EVENT_TYPE.cancelSaveConfig, handerCancel);
    }).catch(error => {
      console.error('获取 HTML 时出错:', error);
    });
  },
  [EVENT_TYPE.globalSettings]: () => {
    fetch('/assets/setting.html').then(response => {
      // 检查响应是否成功
      if (!response.ok) {
        throw new Error('网络响应失败');
      }
      return response.text(); // 将响应转换为文本
    }).then(html => {
      // 处理获取到的 HTML 文本
      const dom = createDom(html);
      initializeForm(dom, Agent.createAgent());
      // 创建弹出层
      popupManager.push(createPopups(dom));
      const cancelEvent = () => {
        document.removeEventListener(EVENT_TYPE.saveConfig, handerSave);
        document.removeEventListener(EVENT_TYPE.cancelSaveConfig, handerCancel);
      };
      const handerSave = () => {
        popupManager.break();
        cancelEvent();
      };
      const handerCancel = () => {
        popupManager.break();
        cancelEvent();
      };
      document.addEventListener(EVENT_TYPE.saveConfig, handerSave);
      document.addEventListener(EVENT_TYPE.cancelSaveConfig, handerCancel);
    }).catch(error => {
      console.error('获取 HTML 时出错:', error);
    });
  },
  [EVENT_TYPE.pinConversation]: () => {

  },
  [EVENT_TYPE.editConversationTitle]: () => {

  },
  [EVENT_TYPE.openConversation]: () => {

  },
  [EVENT_TYPE.deleteConversation]: () => {

  },
  [EVENT_TYPE.createConversation]: () => {

  },
  [EVENT_TYPE.clearAllConversations]: () => {

  },
  [EVENT_TYPE.hideAndShowSidebar]: () => {
    toggleLeft();
  },
  [EVENT_TYPE.switchTheme]: () => {

  },
  [EVENT_TYPE.insertFile]: () => {

  },
  [EVENT_TYPE.clearHistory]: () => {

  },
  [EVENT_TYPE.voiceInput]: () => {

  },
  [EVENT_TYPE.conversationConfig]: () => {
  },

  [EVENT_TYPE.saveConfig]: () => {
    document.dispatchEvent(new CustomEvent(EVENT_TYPE.saveConfig));
  },
  [EVENT_TYPE.cancelSaveConfig]: () => {
    document.dispatchEvent(new CustomEvent(EVENT_TYPE.cancelSaveConfig));
  }
};

document.addEventListener('click', (event) => {
  const btnType = event.target.getAttribute('data-btn-type');
  if (!btnType || !btnEventHandlers.hasOwnProperty(btnType)) return;
  btnEventHandlers[btnType]();
});

const domStr = marked.parse(`\`\`\` python
def hello_world():
    print("Hello, World!")
\`\`\`
`);

document.getElementById('message-item-3').innerHTML = domStr;


/**  ------------------- 删除加载页面 -------------------  */
document.getElementsByClassName('loading')[0].classList.add('fadeOut');
document.getElementsByClassName('loading')[0].addEventListener('animationend', () => {
  document.getElementsByClassName('loading')[0].remove();
});


btnEventHandlers[EVENT_TYPE.agent]();
