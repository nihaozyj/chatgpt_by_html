import { config } from './config.js';

const resizer = document.querySelector('body>.resizer');
const left = document.querySelector('body>.left');

/** 显示/隐藏侧边栏 */
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
  console.log(config.leftState);
}

/** 初始化配置 */
(() => {
  // 初始化侧边栏宽度
  left.style.width = config.leftWidth + 'px';
  toggleLeft(config.leftState);
})();

/** 调整侧边栏宽度 */
(() => {
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
})();

/** 快捷键绑定 */
(() => {
  const resizer = document.querySelector('body>.resizer');
  const left = document.querySelector('body>.left');
  // 按下 Ctrl + B 显示/隐藏侧边栏
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      toggleLeft();
    }
  });
})();

/** 动态调整消息输入框的高度 */
(() => {
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
})();
