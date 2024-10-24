<script>
  import config from "../js/config.js";
  import eventMgr from "../js/eventMgr.js";
  /** 主题切换 */
  function toggleTheme() {
    const body = document.querySelector("body");
    if (body.classList.contains("dark")) {
      body.classList.remove("dark");
      body.classList.add("light");
    } else {
      body.classList.remove("light");
      body.classList.add("dark");
    }
    config.theme = body.classList.contains("dark") ? "dark" : "light";
  }

  let title = "未命名对话";

  eventMgr.on(eventMgr.eventType.OPEN_DIALOG, (conversation) => {
    title = conversation.title;
  });

  /** 创建一个新的对话 */
  function createNewDialog() {
    eventMgr.emit(eventMgr.eventType.REQUEST_CREATE_NEW_DIALOG);
  }
</script>

<main>
  <div class="left">
    <button class="iconfont" on:click={() => eventMgr.emit(eventMgr.eventType.TOGGLE_SIDEBAR)}>&#xe605;</button>
  </div>
  <div class="center">{title}</div>
  <div class="right">
    <button class="iconfont" on:click={createNewDialog}>&#xe69b; 新对话</button>
    <button class="iconfont" on:click={toggleTheme}>&#xe614; 主题切换</button>
  </div>
</main>

<style>
  main {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
  }

  button {
    font-weight: bold;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    font-size: 14px;
    padding: 8px 15px;
  }
</style>
