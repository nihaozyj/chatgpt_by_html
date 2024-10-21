<script>
  import ResizableModal from "./ResizableModal.svelte";
  export let isOpen = false;
  export let title = "基础设置";
</script>

<ResizableModal {isOpen} width={1} height={1}>
  <div class="popups-setting">
    <div class="content">
      <form id="setting-form" action="javascript:void(0);">
        <div class="header">
          <button on:click={() => (isOpen = false)} class="iconfont">&#xe6ff; 返回</button>
          <h1>{title}</h1>
          <button class="iconfont">&#xe62b; 保存</button>
        </div>
        <!-- 设置内容 -->
        <div class="setting-content">
          <div class="item">
            <span>字体大小</span>
            <input type="text" placeholder="字体大小默认为16px" />
          </div>
          <div class="item">
            <span>主题</span>
            <select name="" id="">
              <option value="dark">暗色模式</option>
              <option value="light">亮色模式</option>
            </select>
          </div>
          <div class="item">
            <span>发送键(发送键之外的按键换行)</span>
            <select name="" id="">
              <option value="enter">enter</option>
              <option value="ctrl+enter">ctrl+enter</option>
              <option value="shift+enter">shift+enter</option>
              <option value="alt+enter">alt+enter</option>
              <option value="meta+enter">meta+enter</option>
            </select>
          </div>
          <div class="item">
            <span>语言</span>
            <select name="" id="">
              <option value="zh-CN">简体中文</option>
            </select>
          </div>
          <div class="item">
            <label for="auto-title">根据对话生成合适的标题</label>
            <input type="checkbox" id="auto-title" />
          </div>
          <div class="item">
            <label for="auto-title1">聊天气泡</label>
            <input type="checkbox" id="auto-title1" />
          </div>
          <div class="item">
            <label for="auto-title2">启用快捷命令</label>
            <input type="checkbox" id="auto-title2" />
          </div>
          <div class="item">
            <label for="auto-title2">管理快捷指令</label>
            <button>编辑/查看快捷命令</button>
          </div>
          <div class="item">
            <label for="auto-title2">重置所有设置</label>
            <button style="color: var(--color-warn-text);">立即重置</button>
          </div>
          <div class="item">
            <label for="auto-title2">清除所有聊天记录、快捷指令、智能体等，不可撤销，点击立即执行</label>
            <button style="color: var(--color-warn-text);">立即清除[危险操作]</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</ResizableModal>

<style>
  .popups-setting {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--color-bg);
    min-width: 850px;
    min-height: 500px;
    overflow: auto;
  }

  .popups-setting * {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 14px;
  }

  .popups-setting input[type="checkbox"] {
    padding: 5px !important;
    font-size: 2em !important;
    width: 20px !important;
    display: block !important;
    border: 1px solid red !important;
    background-color: red !important;
  }

  .popups-setting select,
  .popups-setting input[type="text"] {
    width: auto;
    line-height: 1.5em;
    caret-color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: 0.5em 1em;
    min-width: 100px;
  }

  .popups-setting select {
    outline: none;
    border-radius: 5px;
  }

  .popups-setting > .content {
    max-width: 960px;
    margin: 0 auto;
    padding: 30px;
    padding-bottom: 0;
    overflow-y: auto;
    user-select: none;
  }

  #setting-form > .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }

  #setting-form > .header > button {
    border: 1px solid var(--color-border);
    padding: 5px 15px;
    font-size: 16px;
    color: var(--color-btn-text);
  }

  .setting-content {
    border: 1px solid var(--color-border);
    margin-top: 30px;
    padding: 10px;
    border-radius: 5px;
    overflow: auto;
    max-height: calc(100vh - 130px);
  }

  .setting-content > .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px;
    border-bottom: 1px solid var(--color-border);
    padding: 10px 0;
    position: relative;
  }

  .setting-content > .item:last-child {
    border-bottom: none;
  }

  .setting-content > .item > span,
  .setting-content > .item > label {
    color: var(--color-secondary-text);
  }

  .setting-content > .item > label::after,
  .setting-content > .item > span::after {
    content: ":";
  }

  input[type="checkbox"]::after {
    content: " ";
    color: red;
    font-size: 16px;
    display: block;
    position: absolute;
    right: 0;
    top: 8px;
    height: 25px;
    text-align: center;
    background-color: var(--color-bg);
    width: 25px;
    line-height: 25px;
    z-index: 999;
    border: 2px solid var(--color-border);
    border-radius: var(--radius);
  }
  input[type="checkbox"]:checked:after {
    content: "✔";
    color: var(--color-text);
    display: block;
    z-index: 999;
  }
</style>
