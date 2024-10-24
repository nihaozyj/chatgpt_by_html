<script>
  import { writable } from "svelte/store";
  import ResizableModal from "./ResizableModal.svelte";
  import config from "../js/config";
  export let isOpen = false;
  export let title = "基础设置";

  let listIsOpen = writable(false);

  let configCopy = JSON.parse(JSON.stringify(config));

  function convertAndCheckRange(inputString) {
    // 将字符串转换为数字
    const number = Number(inputString);

    // 检查转换后的值是否为有效数字且在12到28之间
    if (!isNaN(number) && number >= 12 && number <= 28) {
      return number;
    } else {
      return false;
    }
  }

  function save() {
    configCopy.fontSize = convertAndCheckRange(configCopy.fontSize);
    if (!configCopy.fontSize) configCopy.fontSize = config.fontSize;
    for (let key in configCopy) {
      if (configCopy[key] !== config[key]) {
        config[key] = configCopy[key];
      }
    }
    isOpen = false;
  }

  let listDom;

  let keyList = [];

  $: if (isOpen) init();

  function init() {
    keyList = config.shhortcuts;
    configCopy = JSON.parse(JSON.stringify(config));
  }

  /** 被点击触发 */
  function mouseDown(e) {
    const ipt = e.target.parentElement.querySelector("input");
    ipt.classList.remove("hide");
    e.target.classList.add("hide");
    setTimeout(() => {
      e.target.parentElement.querySelector("input").focus();
    });
  }

  /** 失去焦点*/
  function mouseLeave(e, index) {
    const p = e.target.parentElement.querySelector(".text button");
    keyList[index] = p.textContent = e.target.value;
    configCopy.shhortcuts = keyList = keyList.filter((str) => str && str.trim() !== "");
    p.classList.remove("hide");
    e.target.classList.add("hide");
  }

  /** 删除元素*/
  function deleteItem(index) {
    keyList.splice(index, 1);
    configCopy.shhortcuts = keyList = keyList;
  }

  /** 创建一个新的指令 */
  function createItem() {
    keyList.unshift("");
    keyList = keyList;
    setTimeout(() => {
      const p = listDom.querySelector(".instruct:first-child .text button");
      const input = listDom.querySelector(".instruct:first-child input");
      p.classList.add("hide");
      input.classList.remove("hide");
      input.focus();
    });
  }
</script>

<ResizableModal {isOpen} width={1} height={1}>
  <div class="popups-setting">
    <div class="content">
      <form id="setting-form" action="javascript:void(0);">
        <div class="header">
          <button on:click={() => (isOpen = false)} class="iconfont">&#xe6ff; 返回</button>
          <h1>{title}</h1>
          <button class="iconfont" on:click={save}>&#xe62b; 保存</button>
        </div>
        <!-- 设置内容 -->
        <div class="setting-content">
          <div class="item">
            <span>字体大小</span>
            <input type="text" placeholder="字体大小默认为16px" bind:value={configCopy.fontSize} />
          </div>
          <div class="item">
            <span>主题</span>
            <select name="" bind:value={configCopy.theme}>
              <option value="dark">暗色模式</option>
              <option value="light">亮色模式</option>
            </select>
          </div>
          <div class="item">
            <span>发送键(发送键之外的按键换行)</span>
            <select bind:value={configCopy.sendMsgKey}>
              <option value="enter">enter</option>
              <option value="ctrl+enter">ctrl+enter</option>
              <option value="shift+enter">shift+enter</option>
              <option value="alt+enter">alt+enter</option>
              <option value="meta+enter">meta+enter</option>
            </select>
          </div>
          <div class="item">
            <span>语言</span>
            <select bind:value={configCopy.language}>
              <option value="zh-CN" selected>简体中文</option>
            </select>
          </div>
          <div class="item">
            <label for="auto-title">根据对话生成合适的标题</label>
            <input type="checkbox" id="auto-title" bind:checked={configCopy.isFiniteTitle} />
          </div>
          <div class="item">
            <label for="auto-title1">聊天气泡</label>
            <input type="checkbox" id="auto-title1" bind:checked={configCopy.isBubble} />
          </div>
          <div class="item">
            <label for="auto-title2">启用快捷命令</label>
            <input type="checkbox" id="auto-title2" bind:checked={configCopy.isShortcut} />
          </div>
          <div class="item">
            <label for="auto-title2">管理快捷指令</label>
            <button on:click={() => listIsOpen.set(true)}>编辑/查看快捷命令</button>
          </div>
          <div class="item">
            <label for="auto-title2">重置所有设置</label>
            <button style="color: var(--color-warn-text);">立即重置</button>
          </div>
          <div class="item">
            <label for="auto-title2">清除所有聊天记录、快捷指令、智能体等，不可撤销，点击立即执行</label>
            <button style="color: var(--color-warn-text);">立即清除[危险操作]</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</ResizableModal>

<!-- 指令列表编辑 -->
<ResizableModal bind:isOpen={$listIsOpen} width={660} height={520}>
  <div class="content">
    <div class="header">
      <button class="iconfont" on:click={() => listIsOpen.set(false)}>&#xe6ff; 返回</button>
      <h1>编辑/查看快捷命令</h1>
      <button class="iconfont" on:click={createItem}>&#xe69b; 新建</button>
    </div>
    <div class="list" bind:this={listDom}>
      {#each keyList as key, index}
        <div class="instruct">
          <div class="text">
            <button on:click={mouseDown}>{key}</button>
            <input on:blur={() => mouseLeave(event, index)} class="hide" type="text" value={key} placeholder="请输入指令内容" />
          </div>
          <button on:click={() => deleteItem(index)} class="iconfont">&#xe657;</button>
        </div>
      {/each}
      {#if keyList.length === 0}
        <span>暂无快捷指令, 请点击新建按钮添加</span>
      {/if}
    </div>
  </div>
</ResizableModal>

<style>
  .content {
    width: 100%;
    height: 100%;
    border-radius: var(--radius);
    background-color: var(--color-bg);
  }

  .content .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding: 0 10px;
    border-bottom: 1px solid var(--color-border);
  }

  .list {
    width: 100%;
    height: 440px;
    overflow-y: auto;
    overflow-x: hidden;
    align-items: center;
    margin-top: 10px;
  }

  .list > span {
    display: block;
    width: 100%;
    text-align: center;
    margin-top: 160px;
    color: var(--color-secondary-text);
  }

  .instruct {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
  }

  .instruct .text {
    width: 0;
    flex-grow: 1;
    position: relative;
  }

  .instruct button {
    color: var(--color-warn-text);
    margin-right: 10px;
    margin-left: 10px;
  }

  .text * {
    left: 10px;
    position: absolute;
    width: 100%;
    font-size: 14px;
    line-height: 1.5em;
    padding: 5px;
  }

  .text input {
    border: 1px solid var(--color-border);
  }

  .text button {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    color: var(--color-text);
  }

  .popups-setting {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--color-bg);
    min-width: 850px;
    min-height: 500px;
    overflow: auto;
  }

  .popups-setting * {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 14px;
  }

  .popups-setting select,
  .popups-setting input[type="text"] {
    width: auto;
    line-height: 1.5em;
    caret-color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: 0.5em 1em;
    min-width: 100px;
  }

  .popups-setting select {
    outline: none;
    border-radius: 5px;
  }

  .popups-setting > .content {
    max-width: 960px;
    margin: 0 auto;
    padding: 30px;
    padding-bottom: 0;
    overflow-y: auto;
    user-select: none;
  }

  #setting-form > .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }

  #setting-form > .header > button {
    border: 1px solid var(--color-border);
    padding: 5px 15px;
    font-size: 16px;
    color: var(--color-btn-text);
  }

  .setting-content {
    border: 1px solid var(--color-border);
    margin-top: 30px;
    padding: 10px;
    border-radius: 5px;
    overflow: auto;
    max-height: calc(100vh - 130px);
  }

  .setting-content > .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px;
    border-bottom: 1px solid var(--color-border);
    padding: 10px 0;
    position: relative;
  }

  .setting-content > .item:last-child {
    border-bottom: none;
  }

  .setting-content > .item > span,
  .setting-content > .item > label {
    color: var(--color-secondary-text);
  }

  .setting-content > .item > label::after,
  .setting-content > .item > span::after {
    content: ":";
  }

  input[type="checkbox"]::after {
    content: " ";
    color: red;
    font-size: 16px;
    display: block;
    position: absolute;
    right: 0;
    top: 8px;
    height: 25px;
    text-align: center;
    background-color: var(--color-bg);
    width: 25px;
    line-height: 25px;
    z-index: 999;
    border: 2px solid var(--color-border);
    border-radius: var(--radius);
  }
  input[type="checkbox"]:checked:after {
    content: "✔";
    color: var(--color-text);
    display: block;
    z-index: 999;
  }
</style>
