<script>
  import { onMount } from 'svelte';
  import configProxy from '../js/config';
  import eventMgr from '../js/eventMgr';
  import utils from '../js/utils';
  import FileUnload from './FileUnload.svelte';
  import { sending } from './Message.svelte';
  import { isSpaceBarFocused } from '../js/db';

  let textarea;
  let msgbox;
  let message;
  let files;
  let fileboxIsOpen = false;

  let sendKey;

  function init() {
    message = '';
    files = null;
    sendKey = configProxy.sendMsgKey;
  }

  function handleFileUploadResult(result) {
    fileboxIsOpen = false;
    files = result.detail;
  }

  function adjustHeight() {
    textarea.style.height = '34px';
    // 计算新的高度
    const newHeight = Math.min(textarea.scrollHeight, 10 * 24);
    textarea.style.height = `${newHeight}px`;
    // 调整 msgbox 的高度
    msgbox.style.height = `${newHeight + 20}px`;
  }

  function sendMsg() {
    if ($sending) return;
    if (message.trim() === '') return;
    eventMgr.emit(eventMgr.eventType.SEND_MESSAGE, { message, files });
    message = '';
    setTimeout(() => adjustHeight());
    files = null;
  }

  function btnSendMsg() {
    if ($sending) {
      eventMgr.emit(eventMgr.eventType.REQUEST_INTERRUPT_DIALOG);
    } else {
      sendMsg();
    }
  }

  /** 用户更新设置 */
  eventMgr.on(eventMgr.eventType.UPDATE_SETTING, () => {
    sendKey = configProxy.sendMsgKey;
  });

  /** 插入文件或者图片*/
  function insertFile() {
    fileboxIsOpen = true;
  }
  /** 清除历史记录上下文 */
  function clearHistory() {
    eventMgr.emit(eventMgr.eventType.CLEAR_DIALOG_HISTORY);
  }
  /** 修改当前使用的对话模型 */
  function changeModel() {
    eventMgr.emit(eventMgr.eventType.MODIFY_DIALOG_MODEL);
  }
  /** 查看键盘快捷键 */
  function showShortcuts() {}
  /** 修改当前配置文件 */
  function changeConfig() {
    eventMgr.emit(eventMgr.eventType.MODIFY_DIALOG_CONFIG);
  }

  function handleKeyDown(e) {
    const keys = ['CTRL+ENTER', 'ENTER', 'SHIFT+ENTER'];
    const nk = ((e.ctrlKey ? 'ctrl+' : e.shiftKey ? 'shift+' : '') + e.key).toUpperCase();
    const sk = sendKey.toUpperCase();

    if (sk === nk) {
      e.preventDefault();
      sendMsg();
    } else if (keys.includes(nk)) {
      e.preventDefault();
      const cursorPosition = textarea.selectionStart;
      const value = message;
      // 在光标位置插入换行符
      message = value.slice(0, cursorPosition) + '\n' + value.slice(cursorPosition);
      // 更新 textarea 的值
      textarea.value = message;
      // 设置光标的新位置
      const newCursorPosition = cursorPosition + 1;
      // 确保光标处于可视区域
      const { clientHeight } = textarea;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
      // 计算光标的展现位置
      const cursorTopPosition = newCursorPosition * lineHeight;
      const scrollTop = textarea.scrollTop;
      // 检查光标是否在可视区域外
      if (cursorTopPosition < scrollTop) {
        // 光标在可视区上方
        textarea.scrollTop = cursorTopPosition; // 滚动到光标所在位置
      } else if (cursorTopPosition > scrollTop + clientHeight) {
        // 光标在可视区下方
        textarea.scrollTop = cursorTopPosition - clientHeight + lineHeight; // 滚动到可视区底部
      }
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }

    setTimeout(() => adjustHeight());
  }

  function truncateFileName(fileName, maxLength = 8) {
    if (fileName.length <= maxLength) {
      return fileName;
    }

    const charsToShow = Math.floor(maxLength / 2) - 1;
    const start = fileName.slice(0, charsToShow);
    const end = fileName.slice(-charsToShow);
    return `${start}..${end}`;
  }

  function previewFile(index) {
    if (files[index].type === 'txt') {
      utils.openTextareaDialog(files[index].name, files[index].content);
    } else {
      utils.openImageDialog(files[index].name, files[index].content);
    }
  }

  function removeFile(index) {
    files.splice(index, 1);
    files = files;
  }

  function handlePaste(event) {
    const items = (event.clipboardData || window.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          // 处理文件上传
          handleFileUpload(file);
        }
      }
    }
  }

  async function processFiles(fls) {
    const results = [];
    const supportedTextTypes = ['text/plain', 'text/markdown', 'text/javascript', 'text/html', 'text/css', 'application/json']; // 支持的文本 MIME 类型

    for (let file of fls) {
      const fileType = file.type.split('/')[0]; // 获取文件类型
      const extension = file.name.split('.').pop().toLowerCase();

      if (fileType === 'image') {
        // 检查文件大小，假设限制为 3MB
        if (file.size > 3 * 1024 * 1024) {
          file = await utils.compressImage(file); // 压缩文件
        }
        const base64 = await utils.convertToBase64(file);
        results.push({ type: 'img', content: base64, name: file.name });
      } else if (fileType === 'text' || supportedTextTypes.includes(file.type) || extension === 'md') {
        // 处理支持的文本文件类型
        const textContent = await utils.readTextFile(file);
        results.push({ type: 'txt', content: textContent, name: file.name });
      }
      // 对于其他类型的文件，不做处理
    }
    return results;
  }

  async function handleFileUpload(file) {
    // 这里可以调用文件上传组件的处理逻辑
    const result = await processFiles([file]); // 处理单个文件
    const _fs = [...result, ...(files || [])];
    // 文件去重
    const _fls = _fs.filter((f, i) => _fs.findIndex((f2) => f2.name === f.name) === i);
    files = _fls; // 更新文件列表
  }

  onMount(() => {
    document.addEventListener('keydown', (e) => {
      if (!$isSpaceBarFocused) return;
      // 检查按下的键是否是空格键
      if (e.code === 'Space') {
        // 获取 textarea 的焦点状态
        if (document.activeElement !== textarea) {
          // 如果 textarea 没有焦点，则将焦点设置到 textarea 上
          textarea.focus();
          // 阻止默认的空格键行为（例如，避免页面滚动）
          e.preventDefault();
        }
      }
    });
    textarea.focus();
  });

  /** 点击一条指令 */
  function handleCommand(text) {
    message = text;
    setTimeout(() => adjustHeight());
  }

  init();
</script>

<main>
  <div class="content">
    <div class="btns">
      <button on:click={insertFile} class="iconfont" title="插入图片或文件，需要模型支持">&#xe62b;</button>|
      <button on:click={clearHistory} class="iconfont" title="清除历史记录上下文，下次发生信息将不携带历史记录，适当清理可以节省费用!">&#xe6c7;</button>|
      <button on:click={changeModel} class="iconfont" title="修改当前使用的对话模型">&#xe6aa;</button>|
      <!-- <button on:click={showShortcuts} class="iconfont" title="查看键盘快捷键">&#xe663;</button>| -->
      <button on:click={changeConfig} class="iconfont" title="修改当前配置文件">&#xe86c;</button>|
      {#if files}
        <div class="files">
          {#each files as file, index}
            <div>
              <button on:click={() => previewFile(index)}>{truncateFileName(file.name)}</button>
              <button on:click={() => removeFile(index)} class="iconfont">&#xe61c;</button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <div class="msgbox" bind:this={msgbox}>
      <textarea on:paste={handlePaste} on:input={adjustHeight} on:keydown={handleKeyDown} bind:value={message} bind:this={textarea} placeholder={'输入问题，"ctrl+enter"发送消息,输入"/"触发命令提示'}></textarea>
      <button on:click={btnSendMsg} class="iconfont">
        {#if $sending}
          <span class="iconfont rotate">&#xe7c5;</span> 停止
        {:else}
          <span class="iconfont">&#xe60d</span> 发送
        {/if}
      </button>
    </div>
  </div>
  {#if fileboxIsOpen}
    <FileUnload on:close={() => (fileboxIsOpen = false)} on:file-upload-result={handleFileUploadResult} />
  {/if}
  {#if message === '/'}
    <div class="keys-box">
      {#each configProxy.shhortcuts as item}
        <button class="key-item" on:click={() => handleCommand(item)}>{item}</button>
      {/each}
    </div>
  {/if}
</main>

<style>
  .keys-box {
    position: absolute;
    border: 1px solid var(--color-border);
    padding: 5px 10px;
    border-radius: var(--radius);
    background-color: var(--color-bg);
    bottom: 4em;
    width: calc(100% - 10px);
    max-height: 20em;
    overflow-y: auto;
  }

  .key-item {
    border-bottom: 1px solid var(--color-border);
    padding: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    display: block;
    width: 100%;
    text-align: left;
    font-size: 1em;
    color: var(--color-text);
  }

  .key-item:last-child {
    border-bottom: none;
  }

  main {
    height: 92px;
    padding: 10px 0 100px 0;
    padding: 10px;
    position: relative;
    user-select: none;
  }

  .content {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding-right: 10px;
  }

  .btns {
    color: var(--color-border);
    padding-top: 5px;
    padding-bottom: 10px;
    width: 100%;
    margin-bottom: -2px;
    background-color: var(--color-bg);
    display: flex;
  }

  .btns .files {
    flex-grow: 1;
    overflow-x: auto;
    white-space: nowrap;
    user-select: none;
    margin-left: 20px;
  }

  .files div {
    position: relative;
    background-color: var(--color-btn-bg);
    display: inline-block;
    border-radius: 5px;
    margin-right: 10px;
  }

  .files div button {
    background-color: #fff0;
    font-size: 0.75em;
    line-height: 1.5em;
  }

  .files div button:last-child {
    width: 1em;
    padding: 0;
    margin-left: -15px;
    font-size: 0.625em;
  }

  .btns div::-webkit-scrollbar {
    height: 0px !important;
  }

  .btns button {
    padding: 3px 8px;
    border-radius: var(--btn-radius-small);
    margin-right: 5px;
    font-size: 1em;
  }

  .msgbox {
    width: 100%;
    height: 54px;
    padding: 8px;
    border: 1px solid var(--color-border);
    position: relative;
    border-radius: var(--btn-radius);
    background-color: var(--color-bg);
  }

  .msgbox button {
    display: flex;
    position: absolute;
    justify-content: space-between;
    align-items: center;
    width: 5em;
    right: 20px;
    bottom: calc(26px - 1em);
    font-size: 1em;
    border-radius: var(--btn-radius);
    font-weight: bold;
    border: 1px solid var(--color-border);
  }

  span.rotate {
    display: block;
    font-weight: bold;
  }

  textarea {
    border: none;
    resize: none;
    width: 100%;
    line-height: 24px;
    padding-right: 85px;
    height: 100%;
    font-size: 1em;
  }
</style>
