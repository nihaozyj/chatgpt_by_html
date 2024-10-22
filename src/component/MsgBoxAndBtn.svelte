<script>
  import configProxy from "../js/config";
  import eventMgr from "../js/eventMgr";
  import { sending } from "./Message.svelte";

  let textarea;
  let msgbox;
  let message;
  let files;

  let sendKey;

  function init() {
    message = "";
    files = [];
    sendKey = configProxy.sendMsgKey;
  }

  function adjustHeight() {
    textarea.style.height = "34px";
    // 计算新的高度
    const newHeight = Math.min(textarea.scrollHeight, 15 * 24);
    textarea.style.height = `${newHeight}px`;
    // 调整 msgbox 的高度
    msgbox.style.height = `${newHeight + 20}px`; // 20px 是额外的 padding
  }

  function sendMsg() {
    if (message.trim() === "") return;
    eventMgr.emit(eventMgr.eventType.SEND_MESSAGE, { message, files });
  }

  /** 用户更新设置 */
  eventMgr.on(eventMgr.eventType.UPDATE_SETTING, () => {
    sendKey = configProxy.sendMsgKey;
  });

  /** 插入文件或者图片*/
  function insertFile() {}
  /** 清除历史记录上下文 */
  function clearHistory() {}
  /** 修改当前使用的对话模型 */
  function changeModel() {}
  /** 查看键盘快捷键 */
  function showShortcuts() {}
  /** 修改当前配置文件 */
  function changeConfig() {}

  function handleKeyDown(event) {
    // 检查是否按下发送快捷键
    if (sendKey === "ctrl+enter" && event.ctrlKey && event.key === "Enter") {
      event.preventDefault(); // 防止默认行为
      sendMsg(); // 发送消息
    } else if (sendKey === "enter" && event.key === "Enter") {
      event.preventDefault(); // 防止默认行为
      sendMsg(); // 发送消息
    } else if (sendKey === "shift+enter" && event.shiftKey && event.key === "Enter") {
      // 允许换行
      return; // 不做任何处理
    } else {
      // 其他情况下，允许换行
      if (event.key === "Enter") {
        event.preventDefault(); // 防止默认行为
        message += "\n"; // 添加换行
      }
    }
    adjustHeight();
  }

  init();
</script>

<main>
  <div class="content">
    <div class="btns">
      <button on:click={insertFile} class="iconfont" title="插入图片或文件，需要模型支持">&#xe62b;</button>|
      <button on:click={clearHistory} class="iconfont" title="清除历史记录上下文，下次发生信息将不携带历史记录，适当清理可以节省费用!">&#xe6c7;</button>|
      <button on:click={changeModel} class="iconfont" title="修改当前使用的对话模型">&#xe6aa;</button>|
      <button on:click={showShortcuts} class="iconfont" title="查看键盘快捷键">&#xe663;</button>|
      <button on:click={changeConfig} class="iconfont" title="修改当前配置文件">&#xe86c;</button>|
    </div>
    <div class="msgbox" bind:this={msgbox}>
      <textarea on:input={adjustHeight} on:keydown={handleKeyDown} bind:value={message} bind:this={textarea} placeholder={'输入问题，"ctrl+enter"发送消息,输入"/"触发命令提示'}></textarea>
      <button class={`iconfont ${$sending ? "disabled" : ""}`} disabled={$sending}>&#xe60d; 发送</button>
    </div>
  </div>
</main>

<style>
  .disabled {
    cursor: not-allowed;
  }

  main {
    height: 92px;
    padding: 10px 0 100px 0;
    padding: 10px;
    position: relative;
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
  }

  .btns::before {
    content: "";
    display: block;
    position: absolute;
    width: calc(100% + 16px);
    height: 1px;
    top: 0px;
    right: 0;
    background-color: var(--color-border);
  }

  .btns button {
    padding: 3px 8px;
    border-radius: var(--btn-radius-small);
    margin-right: 5px;
  }

  .msgbox {
    width: 100%;
    height: 54px;
    padding: 0.5em;
    border: 1px solid var(--color-border);
    position: relative;
    border-radius: var(--btn-radius);
    background-color: var(--color-bg);
  }

  .msgbox button {
    position: absolute;
    right: 20px;
    bottom: 0.55em;
    border-radius: var(--btn-radius);
    font-weight: bold;
    border: 1px solid var(--color-border);
  }

  textarea {
    border: none;
    resize: none;
    width: 100%;
    line-height: 1.5;
    padding-right: 85px;
    height: 100%;
  }
</style>
