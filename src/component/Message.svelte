<script context="module">
  /** 当前消息状态，为真说明消息发送中，禁止再次发送消息，为假说明可以发送消息 */
  export const sending = writable(false);
</script>

<script>
  import eventMgr from "../js/eventMgr";
  import { roleType } from "../js/agent";
  import { writable } from "svelte/store";
  import * as Con from "../js/conversation";
  import { marked } from "marked";
  import { afterUpdate, onMount } from "svelte";
  import { createChatApi } from "../js/api";
  import "highlight.js/styles/atom-one-dark.min.css";
  import hljs from "highlight.js";
  import * as db from "../js/db";
  import utils from "../js/utils";

  // 创建一个引用
  let messageContainer;
  // 聊天请求实例
  let chatApi = null;
  // 用户当前发送的消息
  let userMsg = "";

  /** 当前历史记录起始位置 */
  let historyStart = 0;

  let isUserScrolling = false; // 标记用户是否在手动滚动
  let lastScrollTop = 0; // 记录上次的滚动位置

  /**
   * 当前对话
   * @type {Con.Conversational}
   */
  let nowConversational = null;

  /**
   * 消息列表
   * @type {Con.Message[]}
   */
  export const msgs = writable([]);

  $: if (nowConversational) {
    msgs.set(nowConversational.messages);

    const nowIndex = Math.max(nowConversational.messages.length - nowConversational.agent.lst_message_num, 0);
    const tagIndex = nowConversational.contextStart[0];
    historyStart = Math.max(tagIndex, nowIndex);
  }

  function escapeHtml(html) {
    const text = document.createTextNode(html);
    const div = document.createElement("div");
    div.appendChild(text);
    return div.innerHTML;
  }

  function splitText(text) {
    const delimiter = "[<><>cross-line<><>]";
    const index = text.indexOf(delimiter);

    if (index !== -1) {
      const part1 = text.substring(0, index);
      const part2 = text.substring(index + delimiter.length);
      return [part1, part2];
    } else {
      return [text, null];
    }
  }

  function mdToHtml(md, role) {
    if (role === roleType.user) {
      const text = splitText(md);
      if (text[1]) {
        return text[0] + escapeHtml(text[1].trim());
      } else {
        return escapeHtml(text[0].trim()).trim();
      }
    } else {
      // 使用 marked 解析 Markdown
      const html = marked(md).trim();
      // 使用 DOMParser 解析 HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // 查找所有的代码块
      const codeBlocks = doc.querySelectorAll("pre code");
      codeBlocks.forEach((codeBlock) => {
        // 创建复制按钮
        const copyButton = document.createElement("button");
        copyButton.innerHTML = "&#xe60f; 复制代码";
        copyButton.className = "copy-btn iconfont";
        // 将按钮插入到代码块上方
        codeBlock.parentNode.insertBefore(copyButton, codeBlock.parentNode.firstChild);
      });

      return doc.body.innerHTML;
    }
  }

  eventMgr.on(eventMgr.eventType.SEND_MESSAGE, function (msg) {
    isUserScrolling = false;
    userMsg = msg;
    sending.set(true);
    const { files } = msg;
    let rmsg = (msg = msg.message.trim());

    // 如果msg中包含文件，则需要加工一下内容，文件只显示文件名，内容不显示，图片则使用base64直接内嵌到消息中，可能会特别影响性能，后期可以优化使用图床
    if (files) {
      console.log("files", files);
      // 文件名列表
      let textFileNames = "";
      // 图片列表
      let imageFileMdTages = "";
      files.forEach((file) => {
        const { type, content, name } = file;
        if (type === "txt") {
          textFileNames += `<span class="file-name">${name}</span> `;
        } else if (type === "img") {
          imageFileMdTages += `<img src="${content}" alt="${name}" /> `;
        }
      });
      // 组装消息, 由于用户的消息不会解析为hhtml，因此此处使用[-cross-line-]作为分隔符
      if (textFileNames.trim() !== "" || imageFileMdTages.trim() !== "") {
        msg = `<div class="file-container">${textFileNames} ${imageFileMdTages}</div>[<><>cross-line<><>]` + msg;
      }
    }
    const newMsg = new Con.Message(roleType.user, msg, Date.now());
    const resMsg = new Con.Message(roleType.assistant, "", Date.now() + 1);

    const maxHL = Math.max(nowConversational.messages.length - nowConversational.agent.lst_message_num, nowConversational.contextStart[0]);
    const history = JSON.parse(JSON.stringify(nowConversational.messages)).splice(maxHL);

    // 用户的历史记录中携带着图片的base64内容，需要将其删除，图片识别只在当前回合的对话中有效
    for (let i = 0; i < history.length; i++) {
      if (history[i].role === roleType.user) {
        // 判断是否有打上标记的图片和文本信息，有的话删除掉
        const spCont = splitText(history[i].content);
        if (spCont[1]) {
          history[i].content = spCont[1];
        }
      }
    }
    nowConversational.messages = [...nowConversational.messages, newMsg, resMsg];
    chatApi = createChatApi();
    const { agent } = nowConversational;
    // 消息格式化
    const messages = [
      { role: roleType.system, content: agent.setting },
      ...history,
      (() => {
        // 用户消息中不存在文件时
        if (!files) return { role: newMsg.role, content: newMsg.content };
        // 用户消息中存在文件时，将文件内容添加到消息中,此处文本直接拼接
        const item = { role: roleType.user, content: [{ type: "text", text: "" }] };
        let textFileString = "";
        files.forEach((file) => {
          const { type, content, name } = file;
          if (type === "img") {
            item.content.push({ type: "image_url", image_url: { url: content } });
          } else {
            textFileString += `${name}的内容: """${content}""""`;
          }
        });
        if (textFileString !== "") {
          item.content[0].text = `用户上传的文件如下<fileContent>\n${textFileString}\n</fileContent>\n`;
        }
        item.content[0].text += rmsg;
        return item;
      })(),
    ];
    // 组建请求体
    const body = {
      model: agent.model,
      stream: true,
      temperature: agent.temperature,
      top_p: agent.top_p,
      presence_penalty: agent.frequency_penalty,
      messages,
    };
    chatApi.chat(`${agent.base_url}/chat/completions`, agent.api_key, body, handleMessage);
    // 滚动到最底部
    setTimeout(() => scrollToBottom());
  });

  function isEvenCodeBlockCount(markdownText) {
    // 使用正则表达式匹配代码块标记
    const codeBlockRegex = /```/g;
    const matches = markdownText.match(codeBlockRegex);
    // 计算匹配的数量
    const count = matches ? matches.length : 0;
    // 返回数量是否为偶数
    return count % 2 === 0;
  }

  // 处理接口接受到的消息
  async function handleMessage(data, err) {
    if (!$sending) return;

    if (err) {
      sending.set(false);
      // 请求失败，取消本次请求
      chatApi.cancel();
      // 输出错误信息
      msgs.update((msg) => {
        const lastMsg = msg[msg.length - 1];
        let errMsg = "";

        if (isEvenCodeBlockCount(lastMsg.content)) {
          lastMsg.content += `\n<pre><code style="padding: 8px;color:red;">${err}</code></pre>\n`;
        } else {
          lastMsg.content += `\n\n\`\`\`\n<pre><code style="padding: 8px;color:red;">${err}</code></pre>\n`;
        }

        if (nowConversational.agent.model === "") errMsg += "`[模型未设置]`";
        if (nowConversational.agent.api_key === "") errMsg += "`[API KEY未设置]`";
        if (nowConversational.agent.base_url === "") errMsg += "`[API请求地址未设置]`";
        if (errMsg) lastMsg.content += `出现错误了,可能的原因有：${errMsg}\n`;
        return msg;
      });

      nowConversational.messages = $msgs;
      try {
        await db.updateData(db.storeNames.conversations, nowConversational);
      } catch (e) {
        console.error("更新失败!", e);
      }
      return;
    }

    if (data == null && err == null) {
      msgs.update((msg) => {
        msg[msg.length - 1].content.trim();
        return msg;
      });
      // 对话结束，写入数据库
      nowConversational.messages = $msgs;
      setTimeout(() => hljs.highlightAll());
      try {
        await db.updateData(db.storeNames.conversations, nowConversational);
      } catch (e) {
        console.error("更新失败!", e);
      }

      return sending.set(false);
    }

    msgs.update((msg) => {
      const lastMsg = msg[msg.length - 1];
      lastMsg.content += data;
      return msg;
    });
  }

  eventMgr.on(eventMgr.eventType.REQUEST_INTERRUPT_DIALOG, () => chatApi && chatApi.cancel());

  eventMgr.on(eventMgr.eventType.OPEN_DIALOG, (conversational) => {
    nowConversational = conversational;
    setTimeout(() => hljs.highlightAll());
    setTimeout(() => scrollToBottom(), 100);
  });

  eventMgr.on(eventMgr.eventType.CLEAR_DIALOG_HISTORY, () => {
    const lastIndex = nowConversational.contextStart[0];
    if (lastIndex === nowConversational.messages.length) {
      const index = nowConversational.contextStart.shift();
      historyStart = index;
    } else {
      historyStart = nowConversational.messages.length;
      nowConversational.contextStart.unshift(historyStart);
      nowConversational.contextStart.splice(2);
    }
  });

  /** 修改 */
  async function modify(text, index) {
    const newtext = await utils.openTextareaDialog("修改消息", text);
    if (!newtext) return;
    nowConversational.messages[index].content = newtext;
    nowConversational = nowConversational;
    try {
      await db.updateData(db.storeNames.conversations, nowConversational);
    } catch (e) {
      console.error("更新失败!", e);
    }
  }

  /** 删除 */
  async function deleteMsg(index) {
    nowConversational.messages.splice(index, 1);
    if (nowConversational.messages.length < historyStart) historyStart -= 1;
    if (historyStart < 0) historyStart = 0;
    try {
      await db.updateData(db.storeNames.conversations, nowConversational);
    } catch (e) {
      console.error("更新失败!", e);
    }
    nowConversational = nowConversational;
  }

  /** 重新回答 */
  function reAnswer(index) {
    console.log("reAnswer", index);
    if (nowConversational.messages[index].role === roleType.assistant) index -= 1;
    if (index < 0) return;
    if (nowConversational.messages[index].role === roleType.assistant) return;

    const _msgCont = nowConversational.messages[index].content;
    nowConversational.messages.splice(index, 2);
    eventMgr.emit(eventMgr.eventType.SEND_MESSAGE, { message: _msgCont });
  }

  /** 滚动到最底部*/
  function scrollToBottom() {
    if (!isUserScrolling) {
      // 只有当用户没有手动滚动时才滚动到底部
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }

  afterUpdate(() => {
    setTimeout(() => scrollToBottom());
  });

  function copyContent(content) {
    // 创建一个临时文本区域
    const textarea = document.createElement("textarea");
    textarea.value = content; // 设置要复制的内容
    document.body.appendChild(textarea); // 将文本区域添加到文档中
    textarea.select(); // 选中内容
    document.execCommand("copy"); // 执行复制命令
    document.body.removeChild(textarea); // 移除临时文本区域
  }

  // 监听点击事件，实现代码块的复制
  onMount(() => {
    messageContainer.addEventListener("click", (event) => {
      const target = event.target;
      if (target.classList.contains("copy-btn")) {
        const codeBlock = target.parentNode.querySelector("code");
        copyContent(codeBlock.textContent);
      }
    });
    // 监听滚动事件
    messageContainer.addEventListener("scroll", () => {
      const scrollTop = messageContainer.scrollTop;
      isUserScrolling = scrollTop < lastScrollTop; // 如果当前滚动位置小于上次位置，表示用户正在向上滚动
      lastScrollTop = scrollTop; // 更新上次滚动位置
    });

    document.addEventListener("keydown", (event) => {
      if (!event.ctrlKey) return;
      if (event.key === "ArrowUp") {
        handleKeyDown();
      } else if (event.key === "ArrowDown") {
        handleKeyUp();
      }
    });
  });

  function findVisibleItems() {
    // 获取容器的边界
    const containerRect = messageContainer.getBoundingClientRect();
    // 获取所有子元素
    const items = Array.from(messageContainer.children);
    // 存储在可视区域内的子元素
    const visibleItems = items.filter((item) => {
      const itemRect = item.getBoundingClientRect();
      // 检查子元素的底部是否在容器的顶部之下，顶部是否在容器的底部之上
      return itemRect.bottom > containerRect.top && itemRect.top < containerRect.bottom;
    });

    return visibleItems; // 返回所有在可视区域内的子元素
  }

  function handleKeyDown() {
    const visibleItems = findVisibleItems();
    if (visibleItems.length === 0) return;

    const targetRect = visibleItems[0].getBoundingClientRect();
    const containerRect = messageContainer.getBoundingClientRect();

    console.log(visibleItems);

    if (targetRect.top >= containerRect.top) {
      const previousElement = visibleItems[0].previousElementSibling;
      if (!previousElement) return;
      const previousRect = previousElement.getBoundingClientRect();
      const scrollAmount = previousRect.top - containerRect.top + messageContainer.scrollTop;
      messageContainer.scrollTop = scrollAmount;
    } else {
      const scrollAmount = targetRect.top - containerRect.top + messageContainer.scrollTop;
      messageContainer.scrollTop = scrollAmount;
    }
  }

  function handleKeyUp() {
    // 滚动到最底部
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
</script>

<main bind:this={messageContainer}>
  {#if !$msgs || $msgs.length === 0}
    <div class="item">
      <div class="content">你好，我是 Mini AI Helper, 很高兴为您解答问题 !</div>
    </div>
  {/if}
  {#each $msgs as item, index}
    {#if historyStart != 0 && index === historyStart}
      <div class="dividing-line">本次对话，将携带下方所有消息记录</div>
    {/if}
    <div class="item">
      <div class="left photo">
        <span class="iconfont">
          {@html item.role !== roleType.assistant ? "&#xe761;" : "&#xe6aa;"}
        </span>
      </div>
      <!-- 用户的输入可能和杂乱，需要格式化后展示，AI的回复格式很严谨，此处不考虑格式化，直接渲染 -->
      <div class="content">
        {@html mdToHtml(item.content, item.role)}{#if $sending && item.content === ""}<span class="loading-cursor">|</span>{/if}
      </div>
      <div class="left btns" data-index={index}>
        <button class="iconfont" title="======复制======" on:click={() => copyContent(item.content)}>&#xe60f;</button>
        <button class="iconfont" title="======修改======" on:click={() => modify(item.content, index)}>&#xe60e;</button>
        <button class="iconfont" title="======删除======" on:click={() => deleteMsg(index)}>&#xe657;</button>
        {#if $msgs.length <= index + 2}
          <button class="iconfont" title="重新回答" on:click={() => reAnswer(index)}>&#xe6ff;</button>
        {/if}
      </div>
    </div>
  {/each}
</main>

<div class="ctrl-button">
  <button class="iconfont" on:click={handleKeyDown}>&#xe671;</button>
  <button class="iconfont" on:click={handleKeyUp}>&#xe679;</button>
</div>

<style>
  .ctrl-button {
    position: absolute;
    right: 25px;
    bottom: 200px;
    display: flex;
    flex-direction: column;
  }

  .ctrl-button button {
    border: 1px solid var(--color-border);
    margin: 10px 0;
    padding: 8px;
    font-size: 18px;
  }

  .loading-cursor {
    display: inline;
    font-weight: bold;
    color: var(--color-text);
    animation: blink 1s step-start infinite;
  }

  /* 定义闪烁动画 */
  @keyframes blink {
    0%,
    100% {
      opacity: 1; /* 完全可见 */
    }
    50% {
      opacity: 0; /* 半透明 */
    }
  }

  main {
    flex-grow: 1;
    height: 0;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    padding: 0 50px 0 60px;
    overflow: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;
    position: relative;
  }

  * {
    font-size: 0.875em;
  }

  .item {
    margin-bottom: 40px;
    padding: 1em;
    border-radius: var(--radius);
    background-color: var(--color-chat-bubble-bg);
    position: relative;
  }

  .item .content {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    min-height: 19.59px;
  }

  .photo {
    position: absolute;
    color: var(--color-assistant-avatar);
  }

  .photo.left {
    left: -40px;
  }
  .photo span {
    font-size: 2em;
  }

  .item:last-child {
    margin-bottom: 60px;
  }

  .content {
    white-space: normal;
    overflow-wrap: break-word;
    word-break: break-word;
    font-size: 1.2em;
  }

  .content > * {
    padding: 0;
    margin-bottom: 5px;
  }

  .content > * * {
    padding: 0;
  }

  .btns {
    position: absolute;
    bottom: -25px;
    width: 100%;
    bottom: -30px;
    padding-top: 5px;
    display: none;
  }

  .item:hover .btns {
    display: block;
    width: 100%;
  }

  .btns button {
    font-size: 0.75em;
    padding: 5px 8px;
    margin: 0 !important;
    border: 1px solid var(--color-border);
  }

  .btns.left {
    left: 0px;
  }

  .dividing-line {
    margin: auto;
    margin-bottom: 20px;
    margin-top: -20px;
    text-align: center;
    position: relative;
    padding: 0 15px;
    background-color: var(--color-bg);
    color: var(--color-secondary-text);
    font-size: 0.75em;
    user-select: none;
  }

  .dividing-line::before {
    content: "";
    position: absolute;
    height: 1px;
    left: -1000px;
    top: 50%;
    width: calc(100% + 2000px);
    background-color: var(--color-border);
    z-index: -999;
  }
</style>
