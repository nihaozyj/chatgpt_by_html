<script context="module">
  /** 当前消息状态，为真说明消息发送中，禁止再次发送消息，为假说明可以发送消息 */
  export const sending = writable(false);
</script>

<script>
  import eventMgr from "../js/eventMgr";
  import MsgContent from "./MsgContent.svelte";
  import { roleType } from "../js/agent";
  import { writable } from "svelte/store";
  import * as Con from "../js/conversation";
  import { marked } from "marked";
  import { afterUpdate } from "svelte";
  import { createChatApi } from "../js/api";
  import configProxy from "../js/config";
  import { now } from "svelte/internal";

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
    console.log("当前对话变更：" + nowConversational.title);
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
      return escapeHtml(md);
    } else {
      return marked(md);
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
  });

  // 处理接口接受到的消息
  function handleMessage(data, err) {
    if (!$sending) return;
    if (err) {
      console.error(err);
      sending.set(false);
      eventMgr.emit(eventMgr.eventType.REDO_MESSAGE, userMsg);
      // 请求失败，取消本次请求
      chatApi.cancel();
      return;
    }
    if (data) {
      msgs.update((msg) => {
        const lastMsg = msg[msg.length - 1];
        lastMsg.message += data;
        return msg;
      });
    } else {
      sending.set(false);
    }
  }

  eventMgr.on(eventMgr.eventType.OPEN_DIALOG, (conversational) => {
    nowConversational = conversational;
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

  afterUpdate(() => {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  });
</script>

<main bind:this={messageContainer}>
  {#each $msgs as item, index}
    <div class="item">
      <div class={`${item.role === roleType.assistant ? "left" : "right"} photo`}>
        <span class="iconfont">
          {@html item.role !== roleType.assistant ? "&#xe761;" : "&#xe6aa;"}
        </span>
      </div>
      <!-- 用户的输入可能和杂乱，需要格式化后展示，AI的回复格式很严谨，此处不考虑格式化，直接渲染 -->
      <MsgContent html={mdToHtml(item.message, item.role)} />
      <div class={`${item.role === roleType.assistant ? "left" : "right"} btns`} data-index={index}>
        <button class="iconfont" title="复制">&#xe60f; 复制</button>
        <button class="iconfont" title="朗读">&#xe6ce; 朗读</button>
        <button class="iconfont" title="修改">&#xe60e; 修改</button>
        <button class="iconfont" title="删除">&#xe657; 删除</button>
        <button class="iconfont" title="重新回答">&#xe6ff; 重新回答</button>
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
    margin-bottom: 40px;
    padding: 0.72em;
    border-radius: var(--radius);
    background-color: var(--color-chat-bubble-bg);
    position: relative;
  }

  .photo {
    position: absolute;
    color: var(--color-assistant-avatar);
  }

  .photo.left {
    left: -40px;
  }

  .photo.right {
    right: -40px;
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
    bottom: -28px;
  }

  .btns button {
    font-size: 12px;
    padding: 2px 5px;
    color: var(--color-highlight-text);
    background-color: var(--color-chat-bubble-bg);
    border-radius: var(--btn-radius-small);
  }

  .btns.left {
    left: 0px;
  }

  .btns.right {
    right: 0;
  }
</style>
