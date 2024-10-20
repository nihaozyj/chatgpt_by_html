<script>
  let textarea;
  let msgbox;

  function adjustHeight() {
    textarea.style.height = "34px";
    // 计算新的高度
    const newHeight = Math.min(textarea.scrollHeight, 15 * 24);
    textarea.style.height = `${newHeight}px`;
    // 调整 msgbox 的高度
    msgbox.style.height = `${newHeight + 20}px`; // 20px 是额外的 padding
  }
</script>

<main>
  <div class="content">
    <div class="btns">
      <button class="iconfont" title="插入图片或文件，需要模型支持">&#xe62b;</button>|
      <button class="iconfont" title="清除历史记录上下文，下次发生信息将不携带历史记录，适当清理可以节省费用!">&#xe6c7;</button>|
      <button class="iconfont" title="修改当前使用的对话模型">&#xe6aa;</button>|
      <button class="iconfont" title="查看键盘快捷键">&#xe663;</button>|
      <button class="iconfont" title="修改当前配置文件">&#xe86c;</button>|
    </div>
    <div class="msgbox" bind:this={msgbox}>
      <textarea bind:this={textarea} on:input={adjustHeight} placeholder={'输入问题，"ctrl+enter"发送消息,输入"/"触发命令提示'}> </textarea>
      <button class="iconfont">&#xe60d; 发送</button>
    </div>
  </div>
</main>

<style>
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
