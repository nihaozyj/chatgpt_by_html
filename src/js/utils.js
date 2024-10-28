import { isSpaceBarFocused } from "./db";

/**
 * 打开一个弹窗，输入一段内容，并返回输入的内容
 * @param {string} title 弹窗标题
 * @param {string} message 文本框提示信息
 * @returns {Promise<string>} 用户输入的内容
 */
async function openInputDialog(title, message) {
  const id = `modal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const template = `<div class="modal fadeIn" id="${id}"> <div class="modal-content input"> <div class="header"> <button data-tyle="cancel">取消</button> <h2>${title}</h2> <button data-tyle="enter">确认</button> </div> <input type="text" value="${message}" placeholder="请输入内容" /> </div> </div>`;

  document.body.insertAdjacentHTML('beforeend', template);

  isSpaceBarFocused.set(false);

  return await new Promise(resolve => {
    const modal = document.querySelector(`#${id}`);
    const input = modal.querySelector('input');
    const cancelBtn = modal.querySelector('[data-tyle="cancel"]');
    const enterBtn = modal.querySelector('[data-tyle="enter"]');

    const close = (data) => {
      isSpaceBarFocused.set(true);
      modal.classList.remove('fadeIn');
      modal.classList.add('fadeOut');
      setTimeout(() => {
        modal.remove();
        data ? resolve(data) : resolve(null);
      }, 300);
    };

    cancelBtn.addEventListener('click', () => close());
    enterBtn.addEventListener('click', () => close(input.value));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        close(input.value);
      }
    });
  });
}

/**
 * 打开一个弹窗，下拉框进行选择，并返回选中的内容
 * @param {string} title 弹窗标题
 * @param {Array<{value: string, label: string}>} selects 用户选择列表
 * @param {string} value 默认值
 * @returns {Promise<string>} 用户输入的内容
 */
async function openSelectDialog(title, selects, value) {
  const id = `modal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const selectsStr = selects.map(item => `<option value="${item.value}" ${item.value === value ? 'selected' : ''}>${item.label}</option>`).join('');
  const template = `<div class="modal fadeIn" id="${id}"> <div class="modal-content select"> <div class="header"> <button data-tyle="cancel">取消</button> <h2>${title}</h2> <button data-tyle="enter">确认</button> </div> <select value="${value}">${selectsStr}</select> </div> </div>`;

  document.body.insertAdjacentHTML('beforeend', template);

  isSpaceBarFocused.set(false);

  return new Promise(resolve => {
    const modal = document.querySelector(`#${id}`);
    const select = modal.querySelector('select');
    const cancelBtn = modal.querySelector('[data-tyle="cancel"]');
    const enterBtn = modal.querySelector('[data-tyle="enter"]');

    const close = (data) => {
      isSpaceBarFocused.set(true);
      modal.classList.remove('fadeIn');
      modal.classList.add('fadeOut');
      setTimeout(() => {
        modal.remove();
        resolve(data);
      }, 300);
    };

    cancelBtn.addEventListener('click', () => close(null));
    enterBtn.addEventListener('click', () => close(select.value));
  });
}

/**
 * 打开一个弹窗，输入一段内容，并返回输入的内容
 * @param {string} title 弹窗标题
 * @param {string} message 文本框提示信息
 * @returns {Promise<string>} 用户输入的内容
 */
async function openTextareaDialog(title, message) {
  const id = `modal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const template = `<div class="modal fadeIn" id="${id}"> <div class="modal-content textarea"> <div class="header"> <button data-tyle="cancel">取消</button> <h2>${title}</h2> <button data-tyle="enter">确认</button> </div> <textarea type="text" placeholder="请输入内容">${message}</textarea> </div> </div>`;

  document.body.insertAdjacentHTML('beforeend', template);

  isSpaceBarFocused.set(false);

  return new Promise(resolve => {
    const modal = document.querySelector(`#${id}`);
    const textarea = modal.querySelector('textarea');
    const cancelBtn = modal.querySelector('[data-tyle="cancel"]');
    const enterBtn = modal.querySelector('[data-tyle="enter"]');

    const close = (data) => {
      isSpaceBarFocused.set(true);
      modal.classList.remove('fadeIn');
      modal.classList.add('fadeOut');
      setTimeout(() => {
        modal.remove();
        data ? resolve(data) : resolve(null);
      }, 300);
    };

    cancelBtn.addEventListener('click', () => close());
    enterBtn.addEventListener('click', () => close(textarea.value));
  });
}

/**
 * 将文件转换为 Base64 编码的 Data URL。
 * @param {File} file - 要转换的文件对象。
 * @returns {Promise<string>} - 返回一个 Promise，解析为 Base64 编码的 Data URL。
 */
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file); // 将文件读取为 Data URL
  });
}

/**
 * 读取文本文件并返回其内容。
 * @param {File} file - 要读取的文本文件对象。
 * @returns {Promise<string>} - 返回一个 Promise，解析为文件的文本内容。
 */
function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file); // 将文件读取为文本
  });
}

/**
 * 压缩图像文件到指定的最大宽度和高度。
 * @param {File} file - 要压缩的图像文件对象。
 * @param {number} [maxWidth=1280] - 压缩后的最大宽度，默认为 1280 像素。
 * @param {number} [maxHeight=720] - 压缩后的最大高度，默认为 720 像素。
 * @returns {Promise<File>} - 返回一个 Promise，解析为压缩后的图像文件。
 */
async function compressImage(file, maxWidth = 1280, maxHeight = 720) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      // 计算压缩后的宽高
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      // 绘制图像到 canvas
      ctx.drawImage(img, 0, 0, width, height);
      // 将 canvas 转换为 Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type })); // 返回压缩后的文件
          } else {
            reject(new Error("压缩失败"));
          }
        },
        file.type,
        0.7,
      ); // 0.7 是压缩质量，范围 0-1
    };

    img.onerror = (error) => {
      reject(error);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file); // 读取文件为 Data URL
  });
}

/**
 * 打开一个弹窗，查看图片。
 * @param {string} title - 弹窗标题（文件名）。
 * @param {string} base64Image - Base64 编码的图片。
 * @returns {Promise<void>} - 返回一个 Promise，表示弹窗的关闭。
 */
async function openImageDialog(title, base64Image) {
  const id = `modal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const template = `
    <div class="modal fadeIn" id="${id}">
      <div class="modal-content image-viewer">
        <div class="header">
          <button data-tyle="close">关闭</button>
          <h2>${title}</h2>
        </div>
        <img src="${base64Image}" alt="${title}" style="max-width: 100%; max-height: 80vh;" />
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', template);

  return new Promise(resolve => {
    const modal = document.querySelector(`#${id}`);
    const closeBtn = modal.querySelector('[data-tyle="close"]');

    const close = () => {
      modal.classList.remove('fadeIn');
      modal.classList.add('fadeOut');
      setTimeout(() => {
        modal.remove();
        resolve();
      }, 300);
    };

    closeBtn.addEventListener('click', close);
  });
}


export default {
  openInputDialog,
  openSelectDialog,
  openTextareaDialog,
  convertToBase64,
  readTextFile,
  compressImage,
  openImageDialog
};
