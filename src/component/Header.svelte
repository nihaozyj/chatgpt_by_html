<script>
  import config from "../js/config.js";
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
</script>

<main>
  <div class="left">
    <button class="iconfont">&#xe605;</button>
  </div>
  <div class="center">title</div>
  <div class="right">
    <button class="iconfont">&#xe69b; 新对话</button>
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
