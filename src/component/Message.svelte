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

  // 创建一个引用
  let messageContainer;
  // 聊天请求实例
  let chatApi = null;
  // 用户当前发送的消息
  let userMsg = "";

  /**
   * 当前对话
   * @type {Con.Conversational}
   */
  let nowConversational = null;

  /**
   * 消息列表
   * @type {Con.Message[]}
   */
  export const msgs = writable([new Con.Message(roleType.assistant, "你好，我是小助手，很高兴为您服务。", 0), new Con.Message(roleType.system, "你好，请问有什么可以帮助您？", 2)]);

  $: if (nowConversational) {
    msgs.set(nowConversational.messages);
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
    msgs.update((msg) => [...msg, newMsg, resMsg]);
    chatApi = createChatApi();
    const { agent, contextStart } = nowConversational;
    // 消息格式化
    const messages = [
      {
        role: roleType.system,
        content: agent.setting,
      },
      {
        role: newMsg.role,
        content: newMsg.message,
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
    chatApi.chat(`${agent.base_url}/chat/completions`, agent.api_key, body, handleMessage);
    // 滚动到最底部
    setTimeout(() => scrollToBottom());
  });

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
        lastMsg.message += `\`\`\` json\n${err}\`\`\`\n出现错误了，检测到的可能的原因如下：\n`;
        if (nowConversational.agent.model === "") lastMsg.message += "* 模型未设置\n";
        if (nowConversational.agent.api_key === "") lastMsg.message += "* API KEY未设置\n";
        if (nowConversational.agent.base_url === "") lastMsg.message += "* API请求地址未设置\n";
        lastMsg.message += "* 模型名称对大小写敏感，请检查是否正确设置\n";
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
        msg[msg.length - 1].message.trim();
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
      lastMsg.message += data;
      return msg;
    });
  }

  eventMgr.on(eventMgr.eventType.OPEN_DIALOG, (conversational) => {
    nowConversational = conversational;
    setTimeout(() => scrollToBottom());
  });

  /** 复制 */
  function copy() {}

  /** 朗读 */
  function read() {}

  /** 修改 */
  function modify() {}

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
      <div class="content">{@html mdToHtml(item.message, item.role)}</div>
      <div class="left btns" data-index={index}>
        <button class="iconfont" title="复制" on:click={() => copyContent(item.message)}>&#xe60f;</button>
        <button class="iconfont" title="修改">&#xe60e;</button>
        <button class="iconfont" title="删除">&#xe657;</button>
        <button class="iconfont" title="重新回答">&#xe6ff;</button>
      </div>
    </div>
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
    scroll-behavior: smooth;
  }

  * {
    font-size: 14px;
  }

  .item {
    margin-bottom: 60px;
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
</style>
