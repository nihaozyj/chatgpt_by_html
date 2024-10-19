import { config, EVENT_TYPE } from './config.js';
import { marked } from './marked.esm.js';

const resizer = document.querySelector('body>.resizer');
const left = document.querySelector('body>.left');

/** -------------------加载界面工具方法------------------- */

/** 把 dom文本转为 dom 节点, 文本必须保证只有一个根节点 */
function dom(html) {
  const tempDiv = document.createElement('div');
  // 使用 innerHTML 将 HTML 字符串转换为 DOM 元素
  tempDiv.innerHTML = html;
  // 获取创建的 DOM 元素
  return tempDiv.firstChild;
}

const loading = (function () {
  /** 包含淡入淡出的 loading 效果的 div 元素 */
  const loading = dom(`<div class="loading" id="loading-popup"> <style> .loading { position: absolute; width: 100vw; height: 100vh; background-color: #252627; z-index: 999; opacity: 0; animation: loading-fadeIn .3s forwards; } @keyframes loading-fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes loading-fadeOut { from { opacity: 1; } to { opacity: 0; } } .fadeOut { animation: loading-fadeOut .3s forwards; } </style> </div>`);
  return {
    show() {
      if (!document.getElementById('loading-popup')) {
        document.body.appendChild(loading);
      } else {
        loading.classList.remove('fadeOut');
        loading.style.opacity = 1;
      }
    },
    close() {
      if (document.getElementById('loading-popup')) {
        loading.addEventListener('animationend', () => {
          loading.remove();
        });
      }
    }
  };
})();

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
  ctrlBox.style.bottom = `${newHeight - 4}px`;
}
adjustHeight.call(textarea);


/**  ------------------- 监听并处理所有按键事件 -------------------  */
const btnEventHandlers = {
  [EVENT_TYPE.agent]: () => {

  },
  [EVENT_TYPE.globalSettings]: () => {
    loading.show();
    fetch('/assets/setting.html').then(response => {
      // 检查响应是否成功
      if (!response.ok) {
        throw new Error('网络响应失败');
      }
      return response.text(); // 将响应转换为文本
    }).then(html => {
      // 处理获取到的 HTML 文本
      console.log(html); // 打印 HTML 文本
      loading.close();
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
  }
};

document.addEventListener('click', (event) => {
  const btnType = event.target.getAttribute('data-btn-type');
  if (!btnType || !btnEventHandlers.hasOwnProperty(btnType)) return;
  btnEventHandlers[btnType]();
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


/**  ------------------- 删除加载页面 -------------------  */
document.getElementsByClassName('loading')[0].remove();
