import { config, EVENT_TYPE } from './config.js';
import { marked } from './marked.esm.js';

const resizer = document.querySelector('body>.resizer');
const left = document.querySelector('body>.left');

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
left.style.width = config.leftWidth + 'px';
// 初始化侧边栏宽度
toggleLeft(config.leftState);

/** 调整侧边栏宽度 */
resizer.addEventListener('mousedown', (event) => {
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
});

function resize(event) {
  const newWidth = event.clientX;
  if (newWidth > config.leftMinWidth && newWidth < config.leftMaxWidth) {
    left.style.width = newWidth + 'px';
    config.leftWidth = newWidth;
  }
}

function stopResize() {
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
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
  ctrlBox.style.bottom = `calc(${newHeight}px + 1em)`;
}
adjustHeight.call(textarea);


/**  ------------------- 监听并处理所有按键事件 -------------------  */
document.addEventListener('click', (event) => {
  const btnType = event.target.getAttribute('data-btn-type');
  if (!btnType) return;
  console.log(btnType);
  switch (btnType) {
    case EVENT_TYPE.agent:
      break;
    case EVENT_TYPE.globalSettings:
      break;
    case EVENT_TYPE.pinConversation:
      break;
    case EVENT_TYPE.editConversationTitle:
      break;
    case EVENT_TYPE.openConversation:
      break;
    case EVENT_TYPE.deleteConversation:
      break;
    case EVENT_TYPE.createConversation:
      break;
    case EVENT_TYPE.clearAllConversations:
      break;
    case EVENT_TYPE.hideAndShowSidebar:
      toggleLeft();
      break;
    case EVENT_TYPE.switchTheme:
      break;
    case EVENT_TYPE.insertFile:
      break;
    case EVENT_TYPE.clearHistory:
      break;
    case EVENT_TYPE.voiceInput:
      break;
    case EVENT_TYPE.conversationConfig:
      break;
  }
});


const domStr = marked.parse(`# 欢迎来到Markdown测试

这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。这是一个**加粗**的文本示例。

列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表列表

## 列表

- 项目一
- 项目二
- 项目三

### 链接

[点击这里访问OpenAI](https://www.openai.com)

### 图片



### 代码块

\`\`\` python
def hello_world():
    print("Hello, World!")
\`\`\`
`);

document.getElementById('message-item-3').innerHTML = domStr;


// chat('https://api.openai-up.com/v1/chat/completions', 'sk-CyuBJtBtC7xDA8B67b680fA033424f878f11D1Cf5cE98fB5', (status, msg, err) => {
//   console.log(status, msg, err);
// });
