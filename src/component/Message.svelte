<script context="module">
  import eventMgr from "../js/eventMgr";
  import { roleType } from "../js/agent";
  import { writable } from "svelte/store";
  import * as Con from "../js/conversation";

  /** 当前消息状态，为真说明消息发送中，禁止再次发送消息，为假说明可以发送消息 */
  export const sending = writable(false);

  /**
   * 当前对话
   * @type {Con.Conversational}
   */
  let nowConversational = null;

  /**
   * 消息列表
   * @type {Con.Message[]}
   */
  let msgs = [new Con.Message(roleType.assistant, "你好，我是小助手，很高兴为您服务。", 0)];

  console.log(msgs);

  function mdToHtml(md) {
    return md;
  }

  eventMgr.on(eventMgr.eventType.SEND_MESSAGE, (msg) => {
    sending.set(true);
  });
  eventMgr.on(eventMgr.eventType.CREATE_NEW_DIALOG, (conversational) => {});
  eventMgr.on(eventMgr.eventType.OPEN_DIALOG, (conversational) => {});

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
</script>

<main>
  {#each msgs as item, index}
    <div class="item">
      <div class={`${item.role === roleType.assistant ? "left" : "right"} photo`}>
        <span class="iconfont">
          {@html item.role !== roleType.assistant ? "&#xe761;" : "&#xe6aa;"}
        </span>
      </div>
      <div class="content">{mdToHtml(item.message)}</div>
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
