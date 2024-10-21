<script>
  import ResizableModal from "./ResizableModal.svelte";
  import HelperEdit from "../component/HelperEdit.svelte";
  import eMer from "../js/eventMgr.js";
  import * as Cmc from "../js/conversation.js";
  import config from "../js/config.js";
  import * as Ag from "../js/agent";
  import * as db from "../js/db";
  export let isOpen = false;

  let helperIsOpen = false;
  let helperTitle = "修改智能体";
  let agents = [];
  let agent = null;

  let defaultAgent = null;

  /** 监听窗口的显示和隐藏事件，窗口加载时同时加载智能体列表 */
  $: if (isOpen) loadAgents();

  async function loadAgents() {
    defaultAgent = config.defaultAgent;
    if (!defaultAgent) {
      defaultAgent = Ag.Agent.createAgent();
    }
    try {
      agents = await db.getAllData(db.storeNames.agents);
    } catch (error) {
      console.error("数据库查询失败!");
      agents = [];
    }
    /** 更新默认智能体 */
    const na = agents.find((a) => a.id === defaultAgent.id);
    if (na) {
      defaultAgent = na;
      config.defaultAgent = na;
    }
    // 用于数据库中是尾插法，此处反转数组，先创建的在前面
    agents = agents.reverse();
  }

  /** 创建智能体 */
  function handleCreate() {
    // helperIsOpen = true;
    helperTitle = "新建智能体";
    agent = Ag.Agent.createAgent();
    helperIsOpen = true;
  }
  /** 编辑智能体 */
  function handleEdit(_agent) {
    helperTitle = "修改智能体";
    agent = JSON.parse(JSON.stringify(_agent));
    helperIsOpen = true;
  }

  /** 打开对话 */
  async function handleConversation(_agent) {
    // 创建一个新的对话
    const conversation = new Cmc.Conversation(_agent);
    conversation.id = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    conversation.title = _agent.name;
    // 保存对话到数据库
    try {
      db.addData(db.storeNames.conversations, conversation);
      isOpen = false;
      eMer.emit(eMer.eventType.CREATE_NEW_DIALOG, conversation);
    } catch (error) {
      console.error("数据库保存失败!");
    }
  }

  /** 删除智能体 */
  async function handleDelete(_agent) {
    try {
      const ag = agents.find((a) => a.id === _agent.id);
      if (ag) agents.splice(agents.indexOf(ag), 1);
      await db.deleteData(db.storeNames.agents, _agent.id);
      agents = agents;
    } catch (error) {
      console.error("数据库删除失败!");
    }
  }

  /** 设为默认智能体 */
  function handleSetDefault(_agent) {
    config.defaultAgent = _agent;
    defaultAgent = _agent;
  }
</script>

<ResizableModal {isOpen} width="1" height="1">
  <main class="popups-agent">
    <div class="content">
      <div class="header">
        <button class="iconfont" on:click={() => (isOpen = false)}>&#xe6ff; 返回</button>
        <h1>我的智能体</h1>
        <button class="iconfont" on:click={handleCreate}>&#xe63e; 新建</button>
      </div>
      <!-- 设置内容 -->
      <div class="agent-content">
        <!-- 默认智能体 -->
        {#if defaultAgent}
          <div class="item default">
            <div class="agent-info" title="点击智能体名称或者描述开始对话" on:click={() => handleConversation(defaultAgent)}>
              <h2>{defaultAgent.name}</h2>
              <p>{defaultAgent.setting}</p>
            </div>
            <div class="ctrl">
              <button on:click={() => handleConversation(defaultAgent)}>对话</button>
              <button on:click={() => handleSetDefault(defaultAgent)}>设为默认</button>
              <button on:click={() => handleEdit(defaultAgent)}>编辑</button>
              <button on:click={() => handleDelete(defaultAgent)}>删除</button>
            </div>
          </div>
        {/if}
        <!-- 其他智能体 -->
        {#each agents as agent}
          <div class="item">
            <div class="agent-info" title="点击智能体名称或者描述开始对话" on:click={() => handleConversation(agent)}>
              <h2>{agent.name}</h2>
              <p>{agent.setting}</p>
            </div>
            <div class="ctrl">
              <button on:click={() => handleConversation(agent)}>对话</button>
              <button on:click={() => handleSetDefault(agent)}>设为默认</button>
              <button on:click={() => handleEdit(agent)}>编辑</button>
              <button on:click={() => handleDelete(agent)}>删除</button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </main>
</ResizableModal>

<!-- 智能体编辑弹窗 -->
<HelperEdit on:close={loadAgents} bind:isOpen={helperIsOpen} title={helperTitle} bind:agent />

<style>
  .popups-agent {
    position: absolute;
    width: 100vw;
    height: 100vh;
    background-color: var(--color-bg);
    z-index: 999;
    overflow-y: auto;
    min-width: 850px;
    min-height: 500px;
    overflow: hidden;
  }

  .popups-agent * {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 14px;
  }

  .popups-agent > .content {
    max-width: 960px;
    margin: 0 auto;
    padding: 30px;
    padding-bottom: 40px;
    overflow-y: auto;
    user-select: none;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .content > .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    height: 40px;
  }

  .content > .header > button {
    border: 1px solid var(--color-border);
    padding: 5px 15px;
    font-size: 16px;
    color: var(--color-btn-text);
  }

  .agent-content {
    border: 1px solid var(--color-border);
    margin-top: 30px;
    padding: 10px;
    border-radius: 5px;
    overflow-y: auto;
    flex-grow: 1;
  }

  .agent-content > .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 10px;
  }

  .agent-content > .item:last-child {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .agent-content > .item .ctrl {
    padding: 5px;
    background-color: var(--color-bg);
    border-radius: 5px;
    flex-shrink: 0;
  }

  .agent-content > .item .ctrl > button {
    background-color: var(--color-btn-bg);
    color: var(--color-highlight-text);
  }

  .agent-content > .item .ctrl > button:last-child {
    color: var(--color-warn-text);
  }

  .agent-content > .item > .agent-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    margin-right: 15px;
    cursor: pointer;
  }

  .agent-content > .item > .agent-info > p {
    color: var(--color-secondary-text);
    white-space: nowrap;
    font-size: 12px;
  }

  .agent-content > .item > .agent-info > h2 {
    font-size: 16px;
  }

  .default p::before {
    content: "default";
    font-size: 12px;
    margin-right: 5px;
    padding: 0 5px;
    color: var(--color-text);
    border-radius: var(--radius);
    background-color: var(--color-highlight-bg);
  }

  .default .ctrl button:nth-child(2),
  .default .ctrl button:nth-child(4) {
    opacity: 0.5; /* 改变透明度 */
    background-color: var(--color-btn-disabled-bg); /* 禁用时的背景色 */
    cursor: not-allowed;
    pointer-events: none;
  }
</style>
