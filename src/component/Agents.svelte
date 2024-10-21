<script>
  import ResizableModal from "./ResizableModal.svelte";
  import HelperEdit from "../component/HelperEdit.svelte";
  export let isOpen = false;

  let helperIsOpen = false;
  let helperTitle = "修改智能体";

  function handleSave() {}
</script>

<ResizableModal {isOpen} width="1" height="1">
  <main class="popups-agent">
    <div class="content">
      <div class="header">
        <button class="iconfont" on:click={() => (isOpen = false)}>&#xe6ff; 返回</button>
        <h1>我的智能体</h1>
        <button class="iconfont" on:click={handleSave}>&#xe63e; 新建</button>
      </div>
      <!-- 设置内容 -->
      <div class="agent-content">
        <div class="item default">
          <div class="agent-info" title="点击智能体名称或者描述开始对话">
            <h2>智能体名称</h2>
            <p>很棒的智能体，啊哈哈很棒的智能体，啊哈哈很棒的智能体，啊哈哈很棒的智能体，啊棒的智能体，啊哈哈很棒的智能体，啊哈哈很棒的智能体，啊哈哈很棒的智 dasd</p>
          </div>
          <div class="ctrl">
            <button>对话</button>
            <button>设为默认</button>
            <button>编辑</button>
            <button>删除</button>
          </div>
        </div>
        {#each new Array(10) as a, i}
          <div class="item">
            <div class="agent-info">
              <h2>智能体名称</h2>
              <p>很棒的智能体，啊哈哈很棒的智能体，啊哈哈很棒的智能体，啊哈哈很棒的智能体，啊棒的智能体，啊哈哈很棒的智能体，啊哈哈很棒的智能体，啊哈哈很棒的智 dasd</p>
            </div>
            <div class="ctrl">
              <button>对话</button>
              <button>设为默认</button>
              <button>编辑</button>
              <button>删除</button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </main>
</ResizableModal>

<!-- 智能体编辑弹窗 -->
<HelperEdit isOpen={helperIsOpen} title={helperTitle} />

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

  .popups-agent select,
  .popups-agent textarea,
  .popups-agent input[type="text"] {
    width: 70%;
    line-height: 1.5em;
    caret-color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: 0.5em 1em;
    min-width: 100px;
  }

  .popups-agent select {
    outline: none;
    border-radius: 5px;
  }

  .popups-agent textarea {
    resize: none;
    height: calc(1.5em * 5);
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
