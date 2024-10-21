<script>
</script>

<main>
  {#each new Array(10) as a, i}
    <div class="item">
      <div class={`${i % 2 == 0 ? "right" : "left"} photo`}>
        <span class="iconfont">
          {@html i % 2 == 0 ? "&#xe761;" : "&#xe6aa;"}
        </span>
      </div>
      <div class="content">
        <p>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>
      </div>
      <div class={`${i % 2 == 0 ? "right" : "left"} btns`}>
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
    left: 0;
  }

  .btns.right {
    right: 0;
  }
</style>
