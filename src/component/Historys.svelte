<script>
  import eventMgr from "../js/eventMgr.js";
  import utils from "../js/utils.js";
  import HelperEdit from "./HelperEdit.svelte";
  import * as db from "../js/db.js";
  import { onMount } from "svelte";
  import { modelList } from "../js/agent.js";
  import { writable } from "svelte/store";
  export let width;

  let conversations = [];
  let nowConvasationId = 0;
  let nowAgent = null;

  const isOpen = writable(false);

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
    } catch (error) {
      if (Date.now() - timerBegin < readTimeout) {
        setTimeout(() => init());
      } else {
        console.error("读取数据库超时");
      }
    }
    if (conversations.length > 0) {
      nowConvasationId = conversations[0].id;
      eventMgr.emit(type.OPEN_DIALOG, conversations[0]);
    } else {
      eventMgr.emit(type.REQUEST_CREATE_NEW_DIALOG);
    }
  }

  function handleActive(conversation) {
    nowConvasationId = conversation.id;
    eventMgr.emit(type.OPEN_DIALOG, conversation);
  }

  eventMgr.on(type.CREATE_NEW_DIALOG, (data) => {
    conversations.unshift(data);
    conversations = conversations;
    nowConvasationId = data.id;
    eventMgr.emit(type.OPEN_DIALOG, data);
  });

  /** 置顶 */
  async function handleTop(conversation) {
    const index = conversations.findIndex((item) => item.id === conversation.id);
    conversations.splice(index, 1);
    try {
      await db.updateData(db.storeNames.conversations, conversation);
    } catch (error) {
      console.error("更新数据库失败, 置顶信息可能丢失");
    }
    conversations = [conversation, ...conversations];
  }

  /** 删除 */
  function handleDelete(conversation) {
    try {
      db.deleteData(db.storeNames.conversations, conversation.id);
    } catch (error) {
      console.error("删除失败，可能id为找到或者系统错误！");
    }
    conversations.splice(conversations.indexOf(conversation), 1);
    conversations = conversations;
    if (conversation.id === nowConvasationId) {
      if (conversations.length > 0) {
        nowConvasationId = conversations[0].id;
        eventMgr.emit(type.OPEN_DIALOG, conversations[0]);
      } else {
        eventMgr.emit(type.REQUEST_CREATE_NEW_DIALOG);
      }
    }
  }

  /** 编辑 */
  function handleEdit(conversation) {
    utils.openInputDialog("编辑对话标题", conversation.title).then((title) => {
      if (!title) return;

      try {
        conversation.title = title;
        const con = conversations.find((item) => item.id === conversation.id);
        con.title = title;
        conversations = conversations;
        db.updateData(db.storeNames.conversations, conversation);
      } catch (error) {
        console.error("更新数据库失败, 编辑信息可能丢失");
      }
    });
  }

  eventMgr.on(type.MODIFY_DIALOG_MODEL, async () => {
    const con = conversations.find((item) => item.id === nowConvasationId);
    const ag = con.agent;
    const models = [...modelList, ...ag.custom_model_list];
    const selects = models.map((item) => ({ value: item, label: item }));
    utils.openSelectDialog("模型选择", selects, ag.model).then(async (model) => {
      if (!model) return;
      try {
        con.agent.model = model;
        await db.updateData(db.storeNames.conversations, con);
        eventMgr.emit(type.DIALOG_UPDATE, con);
      } catch (error) {
        console.error("更新数据库失败");
      }
    });
  });

  eventMgr.on(type.MODIFY_DIALOG_CONFIG, async () => {
    const con = conversations.find((item) => item.id === nowConvasationId);
    if (!con) return console.error("当前对话不存在");
    nowAgent = con.agent;
    isOpen.set(true);
  });

  async function handleClear(event) {
    if (!event.detail) return;
    const con = conversations.find((item) => item.id === nowConvasationId);
    if (!con) return console.error("当前对话不存在");
    con.agent = event.detail;
    try {
      await db.updateData(db.storeNames.conversations, con);
      eventMgr.emit(type.DIALOG_UPDATE, con);
    } catch (error) {
      console.error("更新数据库失败");
    }
  }
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
          <button class="iconfont">&#xe61d;</button>
          <div class="btns" style="display: none;">
            <button class="iconfont" title="编辑" on:click={() => handleEdit(item)}>&#xe60e;</button>
            <button class="iconfont" title="置顶" on:click={() => handleTop(item)}>&#xe60d;</button>
            <button class="iconfont" title="删除" on:click={() => handleDelete(item)}>&#xe657;</button>
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
  <HelperEdit bind:isOpen={$isOpen} title="修改当前对话的智能体配置" on:close={handleClear} bind:agent={nowAgent} isSave={true} />
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
    padding: 5px 0;
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
