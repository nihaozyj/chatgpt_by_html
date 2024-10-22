/**
 * 打开一个弹窗，输入一段内容，并返回输入的内容
 * @param {string} title 弹窗标题
 * @param {string} message 文本框提示信息
 * @returns {string | null} 用户输入的内容
 */
async function openInputDialog(title, message) {
  const id = `modal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const template = `<div class="modal" id="${id}"> <div class="modal-content input"> <div class="header"> <button data-tyle="cancel">取消</button> <h2>${title}</h2> <button data-tyle="enter">确认</button> </div> <input type="text" value="${message}" placeholder="请输入内容" /> </div> </div>`;

  document.body.insertAdjacentHTML('beforeend', template);

  return await new Promise(resolve => {
    const modal = document.querySelector(`#${id}`);
    const input = modal.querySelector('input');
    const cancelBtn = modal.querySelector('[data-tyle="cancel"]');
    const enterBtn = modal.querySelector('[data-tyle="enter"]');

    cancelBtn.addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });
    enterBtn.addEventListener('click', () => {
      modal.remove();
      resolve(input.value);
    });
  });
}


/**
 * 打开一个弹窗，下拉框进行选择，并返回选中的内容
 * @param {string} title 弹窗标题
 * @param {Array<{value: string, label: string}>} selects 用户选择列表
 * @returns {string | null} 用户输入的内容
 */
function openSelectDialog(title, selects) {
  const id = `modal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const selectsStr = selects.map(item => `<option value="${item.value}">${item.label}</option>`).join('');
  const template = `<div class="modal" id="${id}"> <div class="modal-content select"> <div class="header"> <button data-tyle="cancel">取消</button> <h2>${title}</h2> <button data-tyle="enter">确认</button> </div> <select>${selectsStr}</select> </div> </div>`;

  return new Promise(resolve => {
    const modal = document.querySelector(`#${id}`);
    const select = modal.querySelector('select');
    const cancelBtn = modal.querySelector('[data-tyle="cancel"]');
    const enterBtn = modal.querySelector('[data-tyle="enter"]');

    document.body.insertAdjacentHTML('beforeend', template);

    cancelBtn.addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });
    enterBtn.addEventListener('click', () => {
      modal.remove();
      resolve(select.value);
    });
  });
}

/**
 * 打开一个弹窗，输入一段内容，并返回输入的内容
 * @param {string} title 弹窗标题
 * @param {string} message 文本框提示信息
 * @returns {string | null} 用户输入的内容
 */
function openTextareaDialog(title, message) {
  const id = `modal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const template = `<div class="modal" id="${id}"> <div class="modal-content textarea"> <div class="header"> <button data-tyle="cancel">取消</button> <h2>${title}</h2> <button data-tyle="enter">确认</button> </div> <textarea type="text" value="${message}" placeholder="请输入内容"></textarea> </div> </div>`;

  document.body.insertAdjacentHTML('beforeend', template);

  return new Promise(resolve => {
    const modal = document.querySelector(`#${id}`);
    const textarea = modal.querySelector('textarea');
    const cancelBtn = modal.querySelector('[data-tyle="cancel"]');
    const enterBtn = modal.querySelector('[data-tyle="enter"]');

    cancelBtn.addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });
    enterBtn.addEventListener('click', () => {
      modal.remove();
      resolve(textarea.value);
    });
  });
}

export default {
  openInputDialog,
  openSelectDialog,
  openTextareaDialog
};
