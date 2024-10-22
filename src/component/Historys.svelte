<script>
  import eventMgr from "../js/eventMgr.js";
  import * as db from "../js/db.js";
  import { onMount } from "svelte";
  export let width;

  let conversations = [];
  let nowConvasationId = 0;

  // 读取数据库超时时间
  const readTimeout = 1000 * 3;
  let timerBegin = Date.now();
  // 事件类型
  const { eventType: type } = eventMgr;

  function btnsSwitch(e) {
    const btns = e.target.querySelector(".btns");
    if (btns.style.display === "none") {
      btns.style.display = "block";
    } else {
      btns.style.display = "none";
    }
  }

  onMount(() => {
    init();
  });

  async function init() {
    try {
      conversations = await db.getAllData(db.storeNames.conversations);
      if (conversations.length > 0) {
        nowConvasationId = conversations[0].id;
        eventMgr.emit(type.OPEN_DIALOG, conversations[0]);
      }
    } catch (error) {
      conversations = [];
      if (Date.now() - timerBegin < readTimeout) {
        setTimeout(() => init());
      } else {
        console.error("读取数据库超时");
      }
    }
  }

  function handleActive(conversation) {
    nowConvasationId = conversation.id;
    eventMgr.emit(type.OPEN_DIALOG, conversation);
  }

  eventMgr.on(type.CREATE_NEW_DIALOG, (data) => {
    console.log(data);
    conversations.unshift(data);
    conversations = conversations;
    nowConvasationId = data.id;
    eventMgr.emit(type.OPEN_DIALOG, data);
  });
</script>

<main style="width: {width}px;">
  <!-- 头部 Logo 和操作按钮 -->
  <header>
    <h1>Mini Helper</h1>
    <div class="btns">
      <button class="iconfont" on:click={() => eventMgr.emit(type.OPEN_AGENT_LIST)}>&#xe604; 智能体</button>
      <button class="iconfont" on:click={() => eventMgr.emit(type.OPEN_SETTING_PANEL)}>&#xe64b; 设置</button>
    </div>
  </header>
  <!-- 历史记录列表 -->
  <div class="historys">
    {#each conversations as item}
      <div class={`item ${item.id === nowConvasationId ? "active" : ""}`}>
        <h2 on:keydown={(event) => event.key === "Enter" && handleActive(item)} on:click={() => handleActive(item)}>
          <span class="iconfont">&#xe69d;</span>
          {item.title}
        </h2>
        <div class="btn" on:mouseenter={btnsSwitch} on:mouseleave={btnsSwitch}>
          <button class="iconfont">&#xe60e;</button>
          <div class="btns" style="display: none;">
            <button class="iconfont" title="编辑">&#xe60e;</button>
            <button class="iconfont" title="置顶">&#xe60d;</button>
            <button class="iconfont" title="删除">&#xe657;</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <!-- 操作按钮 -->
  <div class="bottom">
    <button class="iconfont">&#xe69b; 新对话</button>
    <button class="iconfont" title="清空所有历史记录">&#xe608;</button>
  </div>
</main>

<style>
  .active {
    background: linear-gradient(to right, var(--color-highlight-bg), var(--color-bg) 85%);
    border-radius: var(--radius);
  }

  main {
    padding: 10px 10px 0 0;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    max-width: 800px;
    user-select: none;
    flex: 0 1 auto;
  }

  header {
    height: 120px;
  }

  header h1 {
    font-size: 22px;
    width: 100%;
    height: 60px;
    line-height: 60px;
    text-align: center;
    background: linear-gradient(45deg, var(--color-logo-text1), var(--color-logo-text2));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    border-bottom: 1px solid var(--color-border);
  }

  header .btns {
    display: flex;
    justify-content: space-between;
    padding-top: 18px;
  }

  header .btns button {
    border: 1px solid var(--color-btn-text);
  }

  .historys {
    flex-grow: 1;
    margin-top: 20px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .historys .item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14px;
    padding-left: 5px;
  }

  .item h2 {
    flex-grow: 1;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .item h2 span {
    color: var(--color-secondary-text);
  }

  .item .btn {
    width: 30px;
    position: relative;
    margin-right: 2px;
  }

  .btn .btns {
    position: absolute;
    bottom: 0;
    width: 98px;
    height: 30px;
    right: 30px;
    background-color: var(--color-bg);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-btn);
  }

  .btn .btns button {
    font-size: 14px;
    padding: 5px;
  }

  .bottom {
    height: 50px;
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  .bottom button {
    border: 1px solid var(--color-btn-text);
  }

  .bottom button:first-child {
    flex-grow: 1;
    margin-right: 10px;
  }

  .bottom button:last-child {
    width: 60px;
  }
</style>
