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
    historyStart = nowConversational.contextStart[0];
    const i = $msgs.length - nowConversational.agent.lst_message_num;
    if (i >= 0) {
      historyStart = i - 1;
    }
  }

  function escapeHtml(html) {
    const text = document.createTextNode(html);
    const div = document.createElement("div");
    div.appendChild(text);
    return div.innerHTML;
  }

  function mdToHtml(md, role) {
    if (role === roleType.user) {
      return escapeHtml(md).trim();
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
    userMsg = msg;
    sending.set(true);

    const newMsg = new Con.Message(roleType.user, msg, Date.now());
    const resMsg = new Con.Message(roleType.assistant, "", Date.now() + 1);
    const index = Math.max(nowConversational.messages.length - nowConversational.agent.lst_message_num, historyStart);
    const history = JSON.parse(JSON.stringify($msgs)).splice(index, nowConversational.agent.lst_message_num, historyStart);
    console.log(history);

    nowConversational.messages = [...nowConversational.messages, newMsg, resMsg];
    chatApi = createChatApi();
    const { agent, contextStart } = nowConversational;
    // 消息格式化
    const messages = [
      {
        role: roleType.system,
        content: agent.setting,
      },
      ...history,
      {
        role: newMsg.role,
        content: newMsg.content,
      },
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
    chatApi.chat(`${agent.base_url}/v1/chat/completions`, agent.api_key, body, handleMessage);
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
          lastMsg.content += `\n<pre><code style="padding: 8px;">${err}</code></pre>\n`;
        } else {
          lastMsg.content += `\n\n\`\`\`\n<pre><code style="padding: 8px;">${err}</code></pre>\n`;
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
    setTimeout(() => scrollToBottom());
  });

  /** 朗读 */
  function read() {}

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
  function deleteMsg() {}

  /** 重新回答 */
  function reAnswer() {}

  /** 滚动到最底部*/
  function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  afterUpdate(() => {
    const distanceFromBottom = messageContainer.scrollHeight - messageContainer.scrollTop - messageContainer.clientHeight;
    if (distanceFromBottom < 150) scrollToBottom();

    const codeBlocks = messageContainer.querySelectorAll("pre code");
    if (codeBlocks.length > 0) {
      const lastCodeBlock = codeBlocks[codeBlocks.length - 1];
      hljs.highlightElement(lastCodeBlock);
    }
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
  });
</script>

<main bind:this={messageContainer}>
  {#each $msgs as item, index}
    <div class="item">
      <div class="left photo">
        <span class="iconfont">
          {@html item.role !== roleType.assistant ? "&#xe761;" : "&#xe6aa;"}
        </span>
      </div>
      <!-- 用户的输入可能和杂乱，需要格式化后展示，AI的回复格式很严谨，此处不考虑格式化，直接渲染 -->
      <div class="content">{@html mdToHtml(item.content, item.role)}</div>
      <div class="left btns" data-index={index}>
        <button class="iconfont" title="复制" on:click={() => copyContent(item.content)}>&#xe60f;</button>
        <button class="iconfont" title="修改" on:click={() => modify(item.content, index)}>&#xe60e;</button>
        <button class="iconfont" title="删除">&#xe657;</button>
        <button class="iconfont" title="重新回答">&#xe6ff;</button>
      </div>
    </div>
    {#if historyStart > 1 && index === historyStart}
      <div class="dividing-line">本次对话，将携带下方所有消息记录</div>
    {/if}
  {/each}
</main>

<style>
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
  }

  * {
    font-size: 14px;
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
    margin-bottom: 20px;
  }

  .content {
    white-space: normal;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .btns {
    position: absolute;
    bottom: -25px;
    display: none;
  }

  .item:hover .btns {
    display: block;
    width: 100%;
  }

  .btns button {
    font-size: 12px;
    padding: 5px 8px;
    margin: 0 !important;
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
    font-size: 12px;
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
